import { describe, expect, it } from "vitest";
import { API_CHALLENGES, createMockApi, RATE_LIMIT, type ExchangeLog, type MockRequest } from "./mock-api";

const JSON_HEADERS = { "Content-Type": "application/json" };

function client(clock = { t: 0 }) {
  const api = createMockApi(() => clock.t);
  const history: ExchangeLog[] = [];
  const send = (req: Partial<MockRequest> & { path: string }) => {
    const request = { method: "GET", headers: {}, ...req };
    const response = api.handle(request);
    history.push({ request, response });
    return response;
  };
  const login = (username: string, password: string) =>
    (send({ method: "POST", path: "/auth/token", headers: JSON_HEADERS, body: JSON.stringify({ username, password }) }).body as { access_token: string }).access_token;
  return { send, login, history, api };
}

const auth = (token: string) => ({ ...JSON_HEADERS, Authorization: `Bearer ${token}` });
const product = { sku: "KB-101", name: "Compact Keyboard", category: "accessories", price: 59 };

describe("mock API semantics", () => {
  it("authenticates and distinguishes 401 from 403", () => {
    const c = client();
    expect(c.send({ method: "POST", path: "/products", headers: JSON_HEADERS, body: JSON.stringify(product) }).status).toBe(401);
    const tester = c.login("tester", "Test@123");
    expect(c.send({ method: "POST", path: "/products", headers: auth(tester), body: JSON.stringify(product) }).status).toBe(403);
    const admin = c.login("admin", "Admin@123");
    const created = c.send({ method: "POST", path: "/products", headers: auth(admin), body: JSON.stringify(product) });
    expect(created.status).toBe(201);
    expect(created.headers.location).toBe("/products/6");
  });

  it("returns identical 401 messages for unknown users and wrong passwords", () => {
    const c = client();
    const a = c.send({ method: "POST", path: "/auth/token", headers: JSON_HEADERS, body: JSON.stringify({ username: "tester", password: "x" }) });
    const b = c.send({ method: "POST", path: "/auth/token", headers: JSON_HEADERS, body: JSON.stringify({ username: "nobody", password: "x" }) });
    expect(a.status).toBe(401);
    expect(a.body).toEqual(b.body);
  });

  it("validates, detects conflicts and requires JSON", () => {
    const c = client();
    const admin = c.login("admin", "Admin@123");
    const bad = c.send({ method: "POST", path: "/products", headers: auth(admin), body: JSON.stringify({ ...product, price: -1 }) });
    expect(bad.status).toBe(422);
    expect((bad.body as { errors: { field: string }[] }).errors.map((e) => e.field)).toEqual(["price"]);
    expect(c.send({ method: "POST", path: "/products", headers: auth(admin), body: JSON.stringify({ ...product, sku: "KB-100" }) }).status).toBe(409);
    expect(c.send({ method: "POST", path: "/products", headers: { Authorization: `Bearer ${admin}` }, body: "{}" }).status).toBe(415);
  });

  it("paginates and sorts", () => {
    const c = client();
    const res = c.send({ path: "/products?page=2&limit=2&sort=-price" }).body as { data: { price: number }[]; totalPages: number };
    expect(res.totalPages).toBe(3);
    expect(res.data.map((p) => p.price)).toEqual([45, 39]);
    expect(c.send({ path: "/products?limit=0" }).status).toBe(400);
  });

  it("enforces object-level authorization on orders", () => {
    const c = client();
    const tester = c.login("tester", "Test@123");
    expect(c.send({ path: "/orders/5001", headers: auth(tester) }).status).toBe(200);
    expect(c.send({ path: "/orders/5002", headers: auth(tester) }).status).toBe(403);
  });

  it("makes payments idempotent per key", () => {
    const c = client();
    const tester = c.login("tester", "Test@123");
    const req = { method: "POST", path: "/payments", headers: { ...auth(tester), "Idempotency-Key": "k1" }, body: JSON.stringify({ orderId: 5001, amount: 104.5 }) };
    const first = c.send(req);
    const second = c.send(req);
    expect([first.status, second.status]).toEqual([201, 200]);
    expect((second.body as { id: string }).id).toBe((first.body as { id: string }).id);
    expect(c.send({ ...req, body: JSON.stringify({ orderId: 5001, amount: 1 }) }).status).toBe(422);
  });

  it("rate limits the products collection with Retry-After, and recovers after the window", () => {
    const clock = { t: 0 };
    const c = client(clock);
    for (let i = 0; i < RATE_LIMIT; i++) expect(c.send({ path: "/products" }).status).toBe(200);
    const limited = c.send({ path: "/products" });
    expect(limited.status).toBe(429);
    expect(Number(limited.headers["retry-after"])).toBeGreaterThanOrEqual(1);
    clock.t += 10_001;
    expect(c.send({ path: "/products" }).status).toBe(200);
  });

  it("deletes with 204 and the resource is then gone", () => {
    const c = client();
    const admin = c.login("admin", "Admin@123");
    expect(c.send({ method: "DELETE", path: "/products/2", headers: auth(admin) }).status).toBe(204);
    expect(c.send({ path: "/products/2" }).status).toBe(404);
  });
});

describe("API challenges", () => {
  it("are all completable by a correct sequence of requests", () => {
    const clock = { t: 0 };
    const c = client(clock);
    c.send({ path: "/health" });
    c.send({ path: "/products/3" });
    c.send({ path: "/products/9999" });
    c.send({ path: "/products?page=2&limit=2" });
    c.send({ path: "/products?sort=-price" });
    c.send({ method: "POST", path: "/auth/token", headers: JSON_HEADERS, body: JSON.stringify({ username: "tester", password: "no" }) });
    const tester = c.login("tester", "Test@123");
    c.send({ method: "POST", path: "/products", headers: JSON_HEADERS, body: JSON.stringify(product) });
    c.send({ method: "POST", path: "/products", headers: auth(tester), body: JSON.stringify(product) });
    clock.t += 20_000;
    const admin = c.login("admin", "Admin@123");
    const created = c.send({ method: "POST", path: "/products", headers: auth(admin), body: JSON.stringify(product) }).body as { id: number };
    c.send({ method: "POST", path: "/products", headers: auth(admin), body: JSON.stringify({ ...product, sku: "KB-102", price: -5 }) });
    c.send({ method: "POST", path: "/products", headers: auth(admin), body: JSON.stringify({ ...product, sku: "KB-100" }) });
    c.send({ path: `/products/${created.id}` });
    c.send({ method: "DELETE", path: `/products/${created.id}`, headers: auth(admin) });
    c.send({ path: `/products/${created.id}` });
    c.send({ path: "/orders/5002", headers: auth(tester) });
    const pay = { method: "POST", path: "/payments", headers: { ...auth(tester), "Idempotency-Key": "abc" }, body: JSON.stringify({ orderId: 5001, amount: 104.5 }) };
    c.send(pay);
    c.send(pay);
    for (let i = 0; i < RATE_LIMIT + 1; i++) c.send({ path: "/products" });

    const incomplete = API_CHALLENGES.filter((ch) => !ch.check(c.history)).map((ch) => ch.id);
    expect(incomplete).toEqual([]);
  });
});
