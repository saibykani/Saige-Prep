import { expect, test } from "@playwright/test";
import { OWNER, signIn } from "./fixtures";

test.describe("authentication", () => {
  test("private pages redirect signed-out visitors to login and back after sign-in", async ({ page }) => {
    await page.goto("/learn/manual-testing");
    await expect(page).toHaveURL(/\/login\?next=%2Flearn%2Fmanual-testing/);

    await page.getByLabel("Email", { exact: true }).fill(OWNER.email);
    await page.getByLabel("Password", { exact: true }).fill(OWNER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/learn\/manual-testing$/);
    await expect(page.getByRole("heading", { level: 1, name: "Manual Testing" })).toBeVisible();
  });

  test("wrong password shows an error and stays on login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(OWNER.email);
    await page.getByLabel("Password", { exact: true }).fill("Not-The-Password-1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toContainText("Invalid email or password");
    await expect(page).toHaveURL(/\/login/);
  });

  test("client-side validation blocks an empty form", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("sign out revokes the session", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    const me = await page.request.get("/api/auth/me");
    expect(me.status()).toBe(401);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("a stale session cookie is handled by bouncing to login", async ({ page, context }) => {
    await context.addCookies([{ name: "saige_session", value: "stale", url: "http://127.0.0.1:3100" }]);
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login\?next=%2Fsettings/);
  });
});
