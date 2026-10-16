import { expect, type Page } from "@playwright/test";

export const OWNER = { email: "e2e-owner@example.com", password: "E2e-Owner-Pass-2026", name: "E2E Owner" };

export async function signIn(page: Page, next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.getByLabel("Email", { exact: true }).fill(OWNER.email);
  await page.getByLabel("Password", { exact: true }).fill(OWNER.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("main")).toBeVisible();
}

export function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 1024;
}
