import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { navigationState, renderWithProviders, router } from "@/tests/test-utils";
import { CommandPalette } from "./navigation/command-palette";
import { SidebarNav } from "./navigation/sidebar-nav";
import { CodeBlock } from "./ui/code-block";
import { ConfirmDialog } from "./ui/confirm-dialog";

describe("SidebarNav", () => {
  it("marks the active section and hides admin links from learners", () => {
    navigationState.pathname = "/learn/manual-testing";
    renderWithProviders(<SidebarNav isAdmin={false} />);
    expect(screen.getByRole("link", { name: "Manual Testing" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Learning Center" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });

  it("shows admin link for the owner", () => {
    renderWithProviders(<SidebarNav isAdmin />);
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
  });

  it("collapses and expands a group", async () => {
    renderWithProviders(<SidebarNav isAdmin={false} />);
    const toggle = screen.getByRole("button", { name: "Learn" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "API Testing" })).not.toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.getByRole("link", { name: "API Testing" })).toBeInTheDocument();
  });
});

describe("CommandPalette", () => {
  it("falls back to sections while the index loads, and navigates with the keyboard", async () => {
    router.push.mockReset();
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
    const onOpenChange = vi.fn();
    renderWithProviders(<CommandPalette open onOpenChange={onOpenChange} isAdmin={false} />);

    const input = screen.getByRole("combobox");
    await userEvent.type(input, "postman");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("API Testing");

    await userEvent.keyboard("{Enter}");
    expect(router.push).toHaveBeenCalledWith("/learn/api-testing");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("searches the loaded index and shows an empty state for no matches", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: "lesson:bva", kind: "lesson", title: "Boundary Value Analysis", text: "edges", href: "/learn/manual-testing/boundary-value-analysis", tags: [] },
        ]),
        { headers: { "Content-Type": "application/json" } },
      ),
    );
    renderWithProviders(<CommandPalette open onOpenChange={() => {}} isAdmin={false} />);
    await userEvent.type(screen.getByRole("combobox"), "boundary");
    expect(await screen.findByRole("option", { name: /Boundary Value Analysis/ })).toBeInTheDocument();
    await userEvent.clear(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("combobox"), "zzzz");
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
  });
});

describe("CodeBlock", () => {
  it("copies code to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderWithProviders(<CodeBlock code="SELECT 1;" language="sql" />);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenCalledWith("SELECT 1;");
    await waitFor(() => expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument());
  });
});

describe("ConfirmDialog", () => {
  it("calls confirm and cancel handlers", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithProviders(
      <ConfirmDialog open title="Delete note?" description="This cannot be undone." onConfirm={onConfirm} onCancel={onCancel} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
