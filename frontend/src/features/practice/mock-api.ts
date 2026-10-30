/**
 * A small, deterministic REST API that runs in the browser for the API lab.
 * It implements real HTTP semantics (auth, 401 vs 403, 404, 409, 422, 429 + Retry-After,
 * pagination, Location headers, idempotency keys) without any network access.
 */

export interface MockRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string;
}

export interface MockResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
}

const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  415: "Unsupported Media Type",
  422: "Unprocessable Content",
  429: "Too Many Requests",
};

const USERS = {
  tester: { password: "Test@123", role: "user" as const, id: 1 },
  admin: { password: "Admin@123", role: "admin" as const, id: 2 },
};

const SEED_PRODUCTS: Product[] = [
  { id: 1, sku: "KB-100", name: "Mechanical Keyboard", category: "accessories", price: 79 },
  { id: 2, sku: "MS-200", name: "Wireless Mouse", category: "accessories", price: 25.5 },
  { id: 3, sku: "MN-270", name: "27-inch Monitor", category: "displays", price: 249.99 },
  { id: 4, sku: "HD-500", name: "USB-C Hub", category: "accessories", price: 39 },
  { id: 5, sku: "LP-900", name: "Laptop Stand", category: "furniture", price: 45 },
];

const ORDERS = [
  { id: 5001, userId: 1, status: "PAID", total: 104.5 },
  { id: 5002, userId: 2, status: "SHIPPED", total: 249.99 },
];

export const RATE_LIMIT = 10;
export const RATE_WINDOW_MS = 10_000;

export function createMockApi(now: () => number = () => Date.now()) {
  let products = SEED_PRODUCTS.map((p) => ({ ...p }));
  let nextId = 6;
  const tokens = new Map<string, keyof typeof USERS>();
  const payments = new Map<string, { id: string; orderId: number; amount: number }>();
  let paymentSeq = 1;
  let tokenSeq = 1;
  let hits: number[] = [];

  const json = (status: number, body: unknown, headers: Record<string, string> = {}): MockResponse => ({
    status,
    statusText: STATUS_TEXT[status] ?? "",
    headers: status === 204 ? headers : { "content-type": "application/json", ...headers },
    body: status === 204 ? null : body,
  });
  const problem = (status: number, detail: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) =>
    json(status, { status, title: STATUS_TEXT[status], detail, ...extra }, headers);

  function header(req: MockRequest, name: string) {
    const key = Object.keys(req.headers).find((k) => k.toLowerCase() === name.toLowerCase());
    return key ? req.headers[key].trim() : undefined;
  }

  function parseBody(req: MockRequest): { ok: true; value: Record<string, unknown> } | { ok: false; res: MockResponse } {
    const type = header(req, "content-type") ?? "";
    if (!type.toLowerCase().includes("application/json")) {
      return { ok: false, res: problem(415, "Send the body as JSON with the header Content-Type: application/json.") };
    }
    try {
      const value = JSON.parse(req.body ?? "");
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
      return { ok: true, value };
    } catch {
      return { ok: false, res: problem(400, "Request body is not a valid JSON object.") };
    }
  }

  function currentUser(req: MockRequest) {
    const auth = header(req, "authorization");
    const match = auth?.match(/^Bearer\s+(\S+)$/i);
    const username = match ? tokens.get(match[1]) : undefined;
    return username ? { username, ...USERS[username] } : null;
  }

  function validateProduct(body: Record<string, unknown>, partial = false) {
    const errors: { field: string; message: string }[] = [];
    if (!partial || "sku" in body) {
      if (typeof body.sku !== "string" || !/^[A-Z]{2}-\d{3}$/.test(body.sku)) errors.push({ field: "sku", message: "must match AA-000, e.g. KB-101" });
    }
    if (!partial || "name" in body) {
      if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 60) errors.push({ field: "name", message: "is required, 2–60 characters" });
    }
    if (!partial || "category" in body) {
      if (!["accessories", "displays", "furniture"].includes(String(body.category))) errors.push({ field: "category", message: "must be accessories, displays or furniture" });
    }
    if (!partial || "price" in body) {
      if (typeof body.price !== "number" || !(body.price > 0) || body.price > 10000) errors.push({ field: "price", message: "must be a number greater than 0 and at most 10000" });
    }
    return errors;
  }

  function handle(req: MockRequest): MockResponse {
    const method = req.method.toUpperCase();
    const url = new URL(req.path.startsWith("/") ? req.path : `/${req.path}`, "https://mock.local");
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const segments = path.split("/").filter(Boolean);

    if (path === "/health") {
      return method === "GET" ? json(200, { status: "UP" }) : problem(405, "Use GET.", {}, { allow: "GET" });
    }

    if (path === "/auth/token") {
      if (method !== "POST") return problem(405, "Use POST.", {}, { allow: "POST" });
      const parsed = parseBody(req);
      if (!parsed.ok) return parsed.res;
      const { username, password } = parsed.value as { username?: unknown; password?: unknown };
      if (typeof username !== "string" || typeof password !== "string") {
        return problem(400, "username and password are required.");
      }
      const user = USERS[username as keyof typeof USERS];
      // Same message for unknown user and wrong password, so usernames can't be enumerated.
      if (!user || user.password !== password) return problem(401, "Invalid username or password.");
      const token = `tok_${username}_${tokenSeq++}_${Math.random().toString(36).slice(2, 10)}`;
      tokens.set(token, username as keyof typeof USERS);
      return json(200, { access_token: token, token_type: "Bearer", expires_in: 3600 });
    }

    if (segments[0] === "products") {
      // Rate limiting applies to the products collection.
      const t = now();
      hits = hits.filter((h) => h > t - RATE_WINDOW_MS);
      if (hits.length >= RATE_LIMIT) {
        const retry = Math.ceil((hits[0] + RATE_WINDOW_MS - t) / 1000);
        return problem(429, `Rate limit of ${RATE_LIMIT} requests per ${RATE_WINDOW_MS / 1000}s exceeded.`, {}, { "retry-after": String(Math.max(retry, 1)) });
      }
      hits.push(t);

      if (segments.length === 1) {
        if (method === "GET") {
          const page = Number(url.searchParams.get("page") ?? "1");
          const limit = Number(url.searchParams.get("limit") ?? "10");
          if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
            return problem(400, "page must be an integer ≥ 1 and limit an integer between 1 and 50.");
          }
          let list = [...products];
          const category = url.searchParams.get("category");
          if (category) list = list.filter((p) => p.category === category);
          const sort = url.searchParams.get("sort");
          if (sort) {
            const field = sort.replace(/^-/, "") as keyof Product;
            if (!["price", "name", "id"].includes(field)) return problem(400, "sort must be one of id, name, price (prefix - for descending).");
            const dir = sort.startsWith("-") ? -1 : 1;
            list.sort((a, b) => (a[field] > b[field] ? dir : a[field] < b[field] ? -dir : 0));
          }
          const total = list.length;
          return json(200, { data: list.slice((page - 1) * limit, page * limit), page, limit, total, totalPages: Math.ceil(total / limit) });
        }
        if (method === "POST") {
          const user = currentUser(req);
          if (!user) return problem(401, "Missing or invalid bearer token.", {}, { "www-authenticate": 'Bearer realm="mock"' });
          if (user.role !== "admin") return problem(403, "Only admins can create products.");
          const parsed = parseBody(req);
          if (!parsed.ok) return parsed.res;
          const errors = validateProduct(parsed.value);
          if (errors.length) return problem(422, "Validation failed.", { errors });
          if (products.some((p) => p.sku === parsed.value.sku)) return problem(409, `A product with sku ${parsed.value.sku} already exists.`);
          const created: Product = {
            id: nextId++,
            sku: parsed.value.sku as string,
            name: (parsed.value.name as string).trim(),
            category: parsed.value.category as string,
            price: parsed.value.price as number,
          };
          products.push(created);
          return json(201, created, { location: `/products/${created.id}` });
        }
        return problem(405, "Use GET or POST.", {}, { allow: "GET, POST" });
      }

      if (segments.length === 2) {
        if (!/^\d+$/.test(segments[1])) return problem(400, "Product id must be a positive integer.");
        const id = Number(segments[1]);
        const index = products.findIndex((p) => p.id === id);
        if (method === "GET") return index === -1 ? problem(404, `Product ${id} not found.`) : json(200, products[index]);
        if (method === "PUT" || method === "DELETE") {
          const user = currentUser(req);
          if (!user) return problem(401, "Missing or invalid bearer token.", {}, { "www-authenticate": 'Bearer realm="mock"' });
          if (user.role !== "admin") return problem(403, `Only admins can ${method === "PUT" ? "update" : "delete"} products.`);
          if (index === -1) return problem(404, `Product ${id} not found.`);
          if (method === "DELETE") {
            products = products.filter((p) => p.id !== id);
            return json(204, null);
          }
          const parsed = parseBody(req);
          if (!parsed.ok) return parsed.res;
          const errors = validateProduct(parsed.value);
          if (errors.length) return problem(422, "Validation failed.", { errors });
          if (products.some((p) => p.sku === parsed.value.sku && p.id !== id)) return problem(409, `sku ${parsed.value.sku} is used by another product.`);
          products[index] = { ...products[index], ...(parsed.value as Partial<Product>), id };
          return json(200, products[index]);
        }
        return problem(405, "Use GET, PUT or DELETE.", {}, { allow: "GET, PUT, DELETE" });
      }
    }

    if (segments[0] === "orders" && segments.length === 2) {
      if (method !== "GET") return problem(405, "Use GET.", {}, { allow: "GET" });
      const user = currentUser(req);
      if (!user) return problem(401, "Missing or invalid bearer token.", {}, { "www-authenticate": 'Bearer realm="mock"' });
      const order = ORDERS.find((o) => String(o.id) === segments[1]);
      if (!order) return problem(404, `Order ${segments[1]} not found.`);
      // Object-level authorization: users see only their own orders; admins see all.
      if (user.role !== "admin" && order.userId !== user.id) return problem(403, "You can only view your own orders.");
      return json(200, order);
    }

    if (path === "/payments") {
      if (method !== "POST") return problem(405, "Use POST.", {}, { allow: "POST" });
      const user = currentUser(req);
      if (!user) return problem(401, "Missing or invalid bearer token.", {}, { "www-authenticate": 'Bearer realm="mock"' });
      const key = header(req, "idempotency-key");
      if (!key) return problem(400, "Idempotency-Key header is required for payments.");
      const parsed = parseBody(req);
      if (!parsed.ok) return parsed.res;
      const { orderId, amount } = parsed.value as { orderId?: unknown; amount?: unknown };
      if (typeof orderId !== "number" || typeof amount !== "number" || amount <= 0) {
        return problem(422, "Validation failed.", { errors: [{ field: "orderId/amount", message: "orderId must be a number and amount > 0" }] });
      }
      const existing = payments.get(key);
      if (existing) {
        if (existing.orderId !== orderId || existing.amount !== amount) {
          return problem(422, "This Idempotency-Key was already used with a different request body.");
        }
        return json(200, { ...existing, replayed: true }, { "idempotent-replayed": "true" });
      }
      const payment = { id: `pay_${String(paymentSeq++).padStart(4, "0")}`, orderId, amount };
      payments.set(key, payment);
      return json(201, { ...payment, status: "CAPTURED" }, { location: `/payments/${payment.id}` });
    }

    return problem(404, `No route for ${method} ${path}.`);
  }

  function reset() {
    products = SEED_PRODUCTS.map((p) => ({ ...p }));
    nextId = 6;
    tokens.clear();
    payments.clear();
    paymentSeq = 1;
    hits = [];
  }

  return { handle, reset };
}

/* --------------------------------- challenges --------------------------------- */

export interface ExchangeLog {
  request: MockRequest;
  response: MockResponse;
}

const isPath = (log: ExchangeLog, method: string, re: RegExp) => log.request.method.toUpperCase() === method && re.test(log.request.path.split("?")[0]);
const bodyOf = (log: ExchangeLog) => (log.response.body ?? {}) as Record<string, unknown>;

export interface ApiChallenge {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  task: string;
  hint: string;
  check: (history: ExchangeLog[]) => boolean;
}

export const API_CHALLENGES: ApiChallenge[] = [
  { id: "api-01", title: "Health check", level: "beginner", task: "Confirm the service is up: GET /health should return 200 with status UP.", hint: "Method GET, path /health.", check: (h) => h.some((l) => isPath(l, "GET", /^\/health$/) && l.response.status === 200) },
  { id: "api-02", title: "Read a product", level: "beginner", task: "Fetch product 3 and check its name is 27-inch Monitor.", hint: "GET /products/3", check: (h) => h.some((l) => isPath(l, "GET", /^\/products\/3$/) && l.response.status === 200) },
  { id: "api-03", title: "Not found", level: "beginner", task: "Request a product that does not exist and get a 404.", hint: "Try a large id such as /products/9999.", check: (h) => h.some((l) => isPath(l, "GET", /^\/products\/\d+$/) && l.response.status === 404) },
  { id: "api-04", title: "Pagination", level: "beginner", task: "Fetch page 2 of products with 2 items per page. Check page, limit and totalPages in the response.", hint: "Query parameters: ?page=2&limit=2", check: (h) => h.some((l) => isPath(l, "GET", /^\/products$/) && l.response.status === 200 && bodyOf(l).page === 2 && bodyOf(l).limit === 2) },
  { id: "api-05", title: "Sorting", level: "intermediate", task: "List products sorted by price, most expensive first.", hint: "sort=-price (the minus means descending).", check: (h) => h.some((l) => isPath(l, "GET", /^\/products$/) && l.response.status === 200 && /[?&]sort=-price\b/.test(l.request.path)) },
  { id: "api-06", title: "Negative test: wrong password", level: "beginner", task: "Request a token with a wrong password and confirm you get 401 — and that the message doesn't reveal whether the username exists.", hint: "POST /auth/token with JSON {\"username\":\"tester\",\"password\":\"wrong\"} and Content-Type: application/json.", check: (h) => h.some((l) => isPath(l, "POST", /^\/auth\/token$/) && l.response.status === 401) },
  { id: "api-07", title: "Get a token", level: "beginner", task: "Log in as tester (password Test@123) and receive an access token.", hint: "POST /auth/token with a JSON body. Don't forget the Content-Type header.", check: (h) => h.some((l) => isPath(l, "POST", /^\/auth\/token$/) && l.response.status === 200) },
  { id: "api-08", title: "401: no token", level: "beginner", task: "Try to create a product without any Authorization header and get 401.", hint: "POST /products with no Authorization header.", check: (h) => h.some((l) => isPath(l, "POST", /^\/products$/) && l.response.status === 401) },
  { id: "api-09", title: "403: wrong role", level: "intermediate", task: "Create a product while authenticated as tester (not admin). Expect 403, not 401 — understand why they differ.", hint: "Use the tester token: Authorization: Bearer <token>.", check: (h) => h.some((l) => isPath(l, "POST", /^\/products$/) && l.response.status === 403) },
  { id: "api-10", title: "Create as admin", level: "intermediate", task: "Log in as admin (Admin@123) and create a product. Expect 201 and a Location header.", hint: "Body example: {\"sku\":\"KB-101\",\"name\":\"Compact Keyboard\",\"category\":\"accessories\",\"price\":59}", check: (h) => h.some((l) => isPath(l, "POST", /^\/products$/) && l.response.status === 201) },
  { id: "api-11", title: "Validation error", level: "intermediate", task: "As admin, send an invalid product (e.g. negative price) and get a 422 that names the failing field.", hint: "Same request as before but \"price\": -5.", check: (h) => h.some((l) => isPath(l, "POST", /^\/products$/) && l.response.status === 422) },
  { id: "api-12", title: "Conflict", level: "intermediate", task: "Create a product whose sku already exists and get 409 Conflict.", hint: "KB-100 already exists in the seed data.", check: (h) => h.some((l) => isPath(l, "POST", /^\/products$/) && l.response.status === 409) },
  {
    id: "api-13",
    title: "Request chaining",
    level: "intermediate",
    task: "Create a product, then fetch it using the id from the create response (or its Location header).",
    hint: "Note the id in the 201 response, then GET /products/{id}.",
    check: (h) => {
      const created = h.filter((l) => isPath(l, "POST", /^\/products$/) && l.response.status === 201).map((l) => bodyOf(l).id);
      return h.some((l) => l.response.status === 200 && isPath(l, "GET", /^\/products\/\d+$/) && created.includes(Number(l.request.path.split("/")[2])));
    },
  },
  {
    id: "api-14",
    title: "Delete and verify",
    level: "intermediate",
    task: "As admin, delete a product (204), then confirm a GET for it now returns 404.",
    hint: "DELETE /products/{id} with the admin token, then GET the same path.",
    check: (h) => {
      const deleted = h.filter((l) => isPath(l, "DELETE", /^\/products\/\d+$/) && l.response.status === 204).map((l) => l.request.path.split("?")[0]);
      return h.some((l) => isPath(l, "GET", /^\/products\/\d+$/) && l.response.status === 404 && deleted.includes(l.request.path.split("?")[0]));
    },
  },
  { id: "api-15", title: "Broken object-level authorization", level: "advanced", task: "As tester, request order 5002 (it belongs to admin). A secure API must answer 403, not leak the order.", hint: "GET /orders/5002 with the tester token. Then try /orders/5001 (tester's own order).", check: (h) => h.some((l) => isPath(l, "GET", /^\/orders\/5002$/) && l.response.status === 403) },
  {
    id: "api-16",
    title: "Idempotent payment",
    level: "advanced",
    task: "Send the same payment twice with the same Idempotency-Key. The second call must return the same payment id instead of charging twice.",
    hint: "POST /payments, header Idempotency-Key: any-unique-value, body {\"orderId\":5001,\"amount\":104.5}. Send it twice.",
    check: (h) => {
      const pays = h.filter((l) => isPath(l, "POST", /^\/payments$/) && (l.response.status === 201 || l.response.status === 200));
      return pays.some((l) => l.response.status === 200 && pays.some((o) => o.response.status === 201 && bodyOf(o).id === bodyOf(l).id));
    },
  },
  { id: "api-17", title: "Rate limiting", level: "advanced", task: `Send more than ${RATE_LIMIT} requests to /products within ${RATE_WINDOW_MS / 1000} seconds and observe 429 with a Retry-After header.`, hint: "Click Send repeatedly on GET /products.", check: (h) => h.some((l) => l.response.status === 429 && "retry-after" in l.response.headers) },
];
