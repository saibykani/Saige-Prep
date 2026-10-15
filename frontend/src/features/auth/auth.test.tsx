import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, navigationState, renderWithProviders, router } from "@/tests/test-utils";
import { safeNextPath } from "./hooks";
import { LoginForm } from "./login-form";

describe("safeNextPath", () => {
  it.each([
    [null, "/dashboard"],
    ["/learn", "/learn"],
    ["https://evil.example", "/dashboard"],
    ["//evil.example", "/dashboard"],
    ["/\\evil.example", "/dashboard"],
    ["/login?next=/x", "/dashboard"],
  ])("%s -> %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe("LoginForm", () => {
  beforeEach(() => {
    router.replace.mockReset();
    navigationState.search = new URLSearchParams();
  });

  it("validates input before calling the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    renderWithProviders(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Email"), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the server error on bad credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ detail: "Invalid email or password" }, 401));
    renderWithProviders(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "owner@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("explains rate limiting", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ detail: "Too many" }, 429));
    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText("Email"), "owner@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/too many attempts/i);
  });

  it("redirects to a safe ?next destination after login", async () => {
    navigationState.search = new URLSearchParams("next=/learn/manual-testing");
    const user = { id: "1", email: "owner@example.com", display_name: "Owner", role: "admin", created_at: "" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ user, expires_at: "" }));
    renderWithProviders(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "owner@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "Correct-Horse-42");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/learn/manual-testing"));
  });
});
