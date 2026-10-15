import { vi } from "vitest";

/** Shared state behind the `next/navigation` mock registered in setup.ts. */
export const router = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), prefetch: vi.fn() };
export const navigationState = { pathname: "/dashboard", search: new URLSearchParams() };
