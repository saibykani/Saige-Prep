import { expect, test } from "@playwright/test";
import { signIn } from "./fixtures";

test.describe("lesson practice", () => {
  test("marked practice test scores, saves the best result and shows explanations", async ({ page }) => {
    await signIn(page, "/careers/ai-engineering/ai-engineering/python-for-ai");
    const section = page.locator("section", { has: page.getByRole("heading", { name: "Practice test", exact: true }) });
    await expect(section).toContainText("15 marks");
    // Answer only the first (beginner, 1 mark) question correctly: "tuple".
    await section.getByRole("radio", { name: "tuple" }).check();
    await section.getByRole("button", { name: "Submit for marking" }).click();
    await expect(section.getByRole("status")).toContainText("1 / 15 marks");
    await expect(section.getByRole("status")).toContainText("Keep practising");
    await expect(section).toContainText("A tuple is immutable");
    await expect(section).toContainText("Best so far: 7%");
  });

  test("Python exercise runs in the browser and awards marks per passing check", async ({ page }) => {
    test.setTimeout(180_000);
    await signIn(page, "/careers/ai-engineering/ai-engineering/python-for-ai");
    const card = page.locator("article article", { has: page.getByRole("heading", { name: "Average score, ignoring missing values" }) });
    await card.scrollIntoViewIfNeeded();

    // The untouched starter returns None, so every check fails.
    await card.getByRole("button", { name: "Run and check" }).click();
    await expect(card.getByRole("status")).toContainText("0 / 5 marks", { timeout: 120_000 });

    // Replace the code with the model solution and run again.
    const editor = card.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");
    await page.keyboard.insertText(
      "def mean_score(scores):\n    values = [s for s in scores if s is not None]\n    if not values:\n        return None\n    return sum(values) / len(values)\n",
    );
    await card.getByRole("button", { name: "Run and check" }).click();
    await expect(card.getByRole("status")).toContainText("5 / 5 marks · All checks passed", { timeout: 60_000 });
    await expect(card).toContainText("Best: 100%");
  });
});
