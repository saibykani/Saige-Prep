import { expect, test } from "@playwright/test";
import { isMobile, OWNER, signIn } from "./fixtures";

test.describe("application shell", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("dashboard shows the user, real system status and an honest empty state", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(OWNER.name);
    const checks = page.getByRole("list", { name: "System checks" });
    await expect(checks).toContainText("Connected");
    await expect(checks).toContainText("Off — curated mode");
    await expect(page.getByText("No learning activity yet")).toBeVisible();
  });

  test("navigation reaches every section", async ({ page }) => {
    const sections = [
      ["Role Roadmaps", "/roadmaps"],
      ["API Testing", "/learn/api-testing"],
      ["Mock Tests", "/mock-tests"],
      ["QA Toolkit", "/toolkit"],
      ["Settings", "/settings"],
      ["Admin", "/admin"],
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
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/learn\/performance$/);
  });

  test("planned sections say so instead of faking content", async ({ page }) => {
    await page.goto("/mock-tests");
    await expect(page.getByText("Planned · Phase 4")).toBeVisible();
    await expect(page.getByText("Mock Tests is not built yet")).toBeVisible();
  });

  test("no horizontal overflow on the dashboard", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
