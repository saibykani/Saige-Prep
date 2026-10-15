import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { navigationState, router } from "./navigation-mock";

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => navigationState.pathname,
  useSearchParams: () => navigationState.search,
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// jsdom does not implement <dialog> modal APIs.
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
}
