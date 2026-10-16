/**
 * Browser-side API client. Requests go to same-origin `/api/*` (and `/health`,
 * `/ready` via `/backend/*`), which Next.js rewrites to the FastAPI backend, so the
 * HttpOnly session cookie stays first-party.
 */

export const CSRF_COOKIE = "saige_csrf";
export const CSRF_HEADER = "X-CSRF-Token";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function readCookie(name: string, cookieString: string = typeof document === "undefined" ? "" : document.cookie) {
  for (const part of cookieString.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) return "Please check the highlighted fields.";
  }
  return fallback;
}

export async function apiFetch<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const method = (rest.method ?? (json === undefined ? "GET" : "POST")).toUpperCase();
  const finalHeaders = new Headers(headers);
  if (json !== undefined) finalHeaders.set("Content-Type", "application/json");
  if (UNSAFE_METHODS.has(method)) {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) finalHeaders.set(CSRF_HEADER, csrf);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...rest,
      method,
      headers: finalHeaders,
      credentials: "same-origin",
      body: json === undefined ? rest.body : JSON.stringify(json),
    });
  } catch {
    throw new ApiError(0, "Cannot reach the Saige-Prep server. Is the backend running?");
  }

  if (response.status === 204) return undefined as T;
  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const body: unknown = isJson ? await response.json().catch(() => undefined) : undefined;
  if (!response.ok && !isJson && [404, 500, 502, 503, 504].includes(response.status)) {
    // A non-JSON error means the request never reached the Saige-Prep API (wrong BACKEND_URL or backend down).
    throw new ApiError(response.status, "Cannot reach the Saige-Prep API. Check that the backend is running and BACKEND_URL points to it.");
  }
  if (!response.ok) {
    throw new ApiError(response.status, messageFrom(body, `Request failed (${response.status})`), body);
  }
  return body as T;
}
