import { expect, test } from "@playwright/test";

// Login is disabled by the owner's choice: the portal must open directly.
test.describe("open access (no login)", () => {
  test("home and login pages go straight to the dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("private sections open without any sign-in", async ({ page }) => {
    await page.goto("/learn/manual-testing");
    await expect(page).toHaveURL(/\/learn\/manual-testing$/);
    await expect(page.getByRole("heading", { level: 1, name: "Manual Testing" })).toBeVisible();
  });

  test("visitors are guests, not admins", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Open access").first()).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Admin" })).toHaveCount(0);
  });
});
