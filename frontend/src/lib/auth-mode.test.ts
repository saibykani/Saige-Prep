import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";
import { authRequired, GUEST_USER, isGuest } from "./auth-mode";

describe("auth mode (login disabled)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("never requires sign-in, even if the old env flag is still set on the host", () => {
    vi.stubEnv("NEXT_PUBLIC_AUTH_REQUIRED", "true");
    expect(authRequired()).toBe(false);
  });

  it("guest is a learner, never an admin", () => {
    expect(GUEST_USER.role).toBe("learner");
    expect(isGuest(GUEST_USER)).toBe(true);
    expect(isGuest(undefined)).toBe(false);
  });

  it("proxy lets every visitor straight through", () => {
    const response = proxy(new NextRequest("http://localhost:3002/dashboard"));
    expect(response.headers.get("location")).toBeNull();
  });
});
