import { expect, test } from "@playwright/test";

// Expansion plan step 4: legacy URLs redirect permanently to the /careers tree; progress survives.
test.describe("legacy URL redirects", () => {
  test("an old lesson URL lands on the new one and keeps localStorage progress", async ({ page }) => {
    await page.goto("/learn/manual-testing/what-is-software-testing");
    await expect(page).toHaveURL(/\/careers\/testing\/manual-testing\/what-is-software-testing$/);
    await expect(page.getByRole("heading", { level: 1, name: "What is Software Testing?" })).toBeVisible();
    await page.getByRole("button", { name: "Mark as complete" }).click();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();

    // Progress is keyed by lesson slug, so it shows through both the old and the new route.
    await page.goto("/learn/manual-testing/what-is-software-testing");
    await expect(page).toHaveURL(/\/careers\/testing\/manual-testing\/what-is-software-testing$/);
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
  });

  test("old track, role, mock-test and interview URLs redirect; index pages stay put", async ({ page }) => {
    const cases: [string, RegExp][] = [
      ["/learn/jmeter", /\/careers\/testing\/jmeter$/],
      ["/learn/ai-engineering", /\/careers\/ai-engineering\/ai-engineering$/],
      ["/roadmaps/manual-qa-engineer", /\/careers\/testing\/roles\/manual-qa-engineer$/],
      ["/mock-tests/manual-testing", /\/careers\/testing\/mock-tests\/manual-testing$/],
      ["/interviews/ai-engineering-interview", /\/careers\/ai-engineering\/interviews\/ai-engineering-interview$/],
    ];
    for (const [from, to] of cases) {
      await page.goto(from);
      await expect(page).toHaveURL(to);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    for (const index of ["/learn", "/roadmaps", "/mock-tests", "/interviews"]) {
      await page.goto(index);
      await expect(page).toHaveURL(new RegExp(`${index}$`));
    }
  });

  test("new area landing pages are honest about being unbuilt", async ({ page }) => {
    for (const path of ["/exams", "/aptitude", "/careers/non-it"]) {
      await page.goto(path);
      await expect(page.getByText("is not built yet").first()).toBeVisible();
    }
  });
});
