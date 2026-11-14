import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { navigationState, renderWithProviders, router } from "@/tests/test-utils";
import { CommandPalette } from "./navigation/command-palette";
import { SidebarNav } from "./navigation/sidebar-nav";
import { CodeBlock } from "./ui/code-block";
import { ConfirmDialog } from "./ui/confirm-dialog";

describe("SidebarNav", () => {
  it("shows the four areas and marks the section holding the current page", () => {
    navigationState.pathname = "/careers/testing/manual-testing";
    renderWithProviders(<SidebarNav isAdmin={false} />);
    for (const name of ["Careers (IT)", "Government Exams", "Aptitude", "India Careers (Non-IT)"]) {
      expect(screen.getAllByRole("link").some((l) => l.textContent?.startsWith(name))).toBe(true);
    }
    // Courses are not sidebar items; the domain is, and it is the current section (not the current page).
    expect(screen.queryByRole("link", { name: "Manual Testing" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Testing & QA" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Careers (IT)" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Learning Center" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();
  });

  it("uses aria-current=page on the exact page and labels planned areas", () => {
    navigationState.pathname = "/exams";
    renderWithProviders(<SidebarNav isAdmin={false} />);
    const exams = screen.getByRole("link", { name: /Government Exams/ });
    expect(exams).toHaveAttribute("aria-current", "page");
    expect(exams).toHaveTextContent("Planned");
  });

  it("shows admin link for the owner", () => {
    renderWithProviders(<SidebarNav isAdmin />);
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
  });

  it("collapses and expands a group", async () => {
    renderWithProviders(<SidebarNav isAdmin={false} />);
    const toggle = screen.getByRole("button", { name: "Practice & Assess" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Mock Tests" })).not.toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.getByRole("link", { name: "Mock Tests" })).toBeInTheDocument();
  });

  it("expands and collapses an area's domains with a keyboard-operable toggle", async () => {
    navigationState.pathname = "/dashboard";
    renderWithProviders(<SidebarNav isAdmin={false} />);
    const toggle = screen.getByRole("button", { name: "Show Careers (IT) sections" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Testing & QA" })).not.toBeInTheDocument();
    toggle.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Hide Careers (IT) sections" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Testing & QA" })).toBeInTheDocument();
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
    expect(router.push).toHaveBeenCalledWith("/careers/testing/api-testing");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("searches the loaded index and shows an empty state for no matches", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: "lesson:bva", kind: "lesson", title: "Boundary Value Analysis", text: "edges", href: "/careers/testing/manual-testing/boundary-value-analysis", tags: [] },
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
