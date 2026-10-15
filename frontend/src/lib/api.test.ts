import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/tests/test-utils";
import { ApiError, apiFetch, readCookie } from "./api";

describe("readCookie", () => {
  it("finds a cookie among several and decodes it", () => {
    expect(readCookie("saige_csrf", "a=1; saige_csrf=abc%3D%3D; b=2")).toBe("abc==");
    expect(readCookie("missing", "a=1")).toBeUndefined();
  });
});

describe("apiFetch", () => {
  afterEach(() => {
    document.cookie = "saige_csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });

  it("sends the CSRF header on unsafe methods only", async () => {
    document.cookie = "saige_csrf=token-123";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () => jsonResponse({ ok: true }));

    await apiFetch("/api/thing", { method: "POST", json: { a: 1 } });
    await apiFetch("/api/thing");

    const [, postInit] = fetchMock.mock.calls[0];
    const [, getInit] = fetchMock.mock.calls[1];
    expect(new Headers(postInit?.headers).get("X-CSRF-Token")).toBe("token-123");
    expect(new Headers(postInit?.headers).get("Content-Type")).toBe("application/json");
    expect(postInit?.body).toBe(JSON.stringify({ a: 1 }));
    expect(new Headers(getInit?.headers).has("X-CSRF-Token")).toBe(false);
  });

  it("throws ApiError with the server detail message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ detail: "Invalid email or password" }, 401));
    await expect(apiFetch("/api/auth/login", { json: {} })).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password",
    });
  });

  it("reports a network failure as status 0", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const error = await apiFetch("/api/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });

  it("returns undefined for 204 responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiFetch("/api/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });
});
