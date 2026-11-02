import { expect, test } from "@playwright/test";
import { isMobile, signIn } from "./fixtures";

test.describe("application shell", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("dashboard shows an honest empty state and settings shows real system status", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("No learning activity yet")).toBeVisible();
    // System status lives on the Settings page (moved off the dashboard).
    await page.goto("/settings");
    const checks = page.getByRole("list", { name: "System checks" });
    await expect(checks).toContainText("Connected");
    await expect(checks).toContainText("Off — curated mode");
  });

  test("navigation reaches every section", async ({ page }) => {
    const sections = [
      ["Role Roadmaps", "/roadmaps"],
      ["API Testing", "/learn/api-testing"],
      ["Mock Tests", "/mock-tests"],
      ["QA Toolkit", "/toolkit"],
      ["Settings", "/settings"],
    ] as const;
    for (const [label, href] of sections) {
      if (isMobile(page)) await page.getByRole("button", { name: "Open navigation" }).click();
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("global search opens with Ctrl+K and navigates", async ({ page }) => {
    test.skip(isMobile(page), "keyboard shortcut is a desktop affordance");
    await page.keyboard.press("Control+k");
    const search = page.getByRole("combobox");
    await expect(search).toBeFocused();
    await search.fill("jmeter");
    // Wait until the full search index has replaced the navigation-only fallback, so Enter is deterministic.
    const first = page.getByRole("option").first();
    await expect(first).toContainText("Lesson");
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(first).toContainText("JMeter Fundamentals");
    await page.keyboard.press("Enter");
    // Generous timeout: the dev server compiles the lesson route on first visit.
    await expect(page).toHaveURL(/\/learn\/jmeter\/jmeter-fundamentals$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("JMeter Fundamentals");
  });

  test("no horizontal overflow on the dashboard", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
