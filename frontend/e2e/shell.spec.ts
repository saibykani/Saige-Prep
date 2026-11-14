import { expect, test } from "@playwright/test";
import { isMobile, signIn } from "./fixtures";

async function open_nav(page: import("@playwright/test").Page) {
  if (isMobile(page)) await page.getByRole("button", { name: "Open navigation" }).click();
}

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
    const nav = page.getByRole("navigation", { name: "Main" });
    const open = async () => {
      if (isMobile(page)) await page.getByRole("button", { name: "Open navigation" }).click();
      // Careers collapses until the current page is inside it; Role Roadmaps lives under it.
      const careers = nav.getByRole("button", { name: /Careers \(IT\) sections/ });
      if ((await careers.getAttribute("aria-expanded")) === "false") await careers.click();
    };
    const sections = [
      ["Role Roadmaps", "/roadmaps"],
      ["Government Exams", "/exams"],
      ["Aptitude", "/aptitude"],
      ["India Careers (Non-IT)", "/careers/non-it"],
      ["Mock Tests", "/mock-tests"],
      ["QA Toolkit", "/toolkit"],
      ["Settings", "/settings"],
    ] as const;
    for (const [label, href] of sections) {
      await open();
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("sidebar shows areas and domains, not courses, and expands the current area", async ({ page }) => {
    await open_nav(page);
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const name of ["Careers (IT)", "Government Exams", "Aptitude", "India Careers (Non-IT)"]) {
      await expect(nav.getByRole("link", { name })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Manual Testing" })).toHaveCount(0);
    await nav.getByRole("button", { name: "Show Careers (IT) sections" }).click();
    await nav.getByRole("link", { name: "Testing & QA" }).click();
    await expect(page).toHaveURL(/\/careers\/testing$/);
    if (isMobile(page)) await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(nav.getByRole("link", { name: "Testing & QA" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Careers (IT)" })).toHaveAttribute("aria-current", "true");
  });

  test("breadcrumb parents link straight to a page (no redirect hop)", async ({ page, request }) => {
    test.skip(isMobile(page), "breadcrumbs are hidden on narrow screens");
    await page.goto("/careers/testing/roles/sdet");
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByRole("link", { name: "Testing & QA" })).toBeVisible();
    const hrefs = await crumbs.getByRole("link").evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
    expect(hrefs).toContain("/roadmaps");
    for (const href of hrefs) {
      const res = await request.get(href, { maxRedirects: 0 });
      expect(res.status(), href).toBe(200);
    }
  });

  test("mobile drawer: focus moves in, Escape closes and returns focus to the menu button", async ({ page }) => {
    test.skip(!isMobile(page), "drawer is the narrow-screen navigation");
    const opener = page.getByRole("button", { name: "Open navigation" });
    await opener.click();
    const drawer = page.getByRole("dialog", { name: "Navigation" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("button", { name: "Close navigation" })).toBeFocused();
    // Focus stays inside the drawer while tabbing.
    for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(opener).toBeFocused();
    // Choosing a link closes it too.
    await opener.click();
    await drawer.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(drawer).toBeHidden();
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
    await expect(page).toHaveURL(/\/careers\/testing\/jmeter\/jmeter-fundamentals$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("JMeter Fundamentals");
  });

  test("no horizontal overflow on the dashboard", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
