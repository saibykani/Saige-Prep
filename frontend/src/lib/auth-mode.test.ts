import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";
import { authRequired, GUEST_USER, isGuest } from "./auth-mode";

describe("auth mode", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is open unless NEXT_PUBLIC_AUTH_REQUIRED is exactly 'true'", () => {
    vi.stubEnv("NEXT_PUBLIC_AUTH_REQUIRED", "");
    expect(authRequired()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_AUTH_REQUIRED", "yes");
    expect(authRequired()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_AUTH_REQUIRED", "true");
    expect(authRequired()).toBe(true);
  });

  it("guest is a learner, never an admin", () => {
    expect(GUEST_USER.role).toBe("learner");
    expect(isGuest(GUEST_USER)).toBe(true);
    expect(isGuest(undefined)).toBe(false);
  });

  it("proxy lets visitors through in open mode and redirects when sign-in is required", () => {
    const request = () => new NextRequest("http://localhost:3002/dashboard");

    vi.stubEnv("NEXT_PUBLIC_AUTH_REQUIRED", "");
    expect(proxy(request()).headers.get("location")).toBeNull();

    vi.stubEnv("NEXT_PUBLIC_AUTH_REQUIRED", "true");
    expect(proxy(request()).headers.get("location")).toBe("http://localhost:3002/login?next=%2Fdashboard");
  });
});
