import { expect, type Page } from "@playwright/test";

/** Login is disabled, so "signing in" is just opening the app. */
export async function signIn(page: Page, path = "/dashboard") {
  await page.goto(path);
  await expect(page.getByRole("main")).toBeVisible();
}

export function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 1024;
}
