import { expect, test, type Page } from "@playwright/test";
import { signIn } from "./fixtures";

/** Collects console errors and uncaught page errors so each test can assert there were none. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Runs a short, untimed 10-question mock test on the given bank and submits it. */
async function takeShortMockTest(page: Page, bankTitle: string) {
  await page.goto("/mock-tests");
  await page.getByRole("main").locator('a[href^="/mock-tests/"]', { hasText: bankTitle }).first().click();
  await expect(page).toHaveURL(/\/mock-tests\/[a-z-]+$/, { timeout: 60_000 });
  await expect(page.getByRole("heading", { level: 1, name: `${bankTitle} mock test` })).toBeVisible();
  await page.getByRole("radiogroup", { name: "Questions" }).getByRole("radio", { name: "10", exact: true }).click();
  await page.getByRole("radiogroup", { name: "Time limit" }).getByRole("radio", { name: "No timer" }).click();
  await page.getByRole("button", { name: "Start test" }).click();

  for (let i = 1; i <= 10; i++) {
    await expect(page.getByText(`Question ${i} of 10`)).toBeVisible();
    const options = page.getByRole("main").locator('fieldset input[type="radio"], fieldset input[type="checkbox"]');
    await options.first().check();
    if (i < 10) await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await expect(page.getByText("10/10 answered")).toBeVisible();
  await page.getByRole("button", { name: "Finish" }).click();
  const dialog = page.getByRole("dialog", { name: "Submit your test?" });
  await expect(dialog).toContainText("10 of 10 answered");
  await dialog.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByRole("heading", { name: "Score by topic (weakest first)" })).toBeVisible();
  await expect(page.getByText(/\d+ \/ 10 points · \d+ correct · \d+ wrong · 0 unanswered/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review every question" })).toBeVisible();
}

test.describe("learner pages", () => {
  let errors: string[];

  test.beforeEach(async ({ page }) => {
    errors = trackErrors(page);
  });

  test.afterEach(() => {
    expect(errors, "no console errors").toEqual([]);
  });

  test("dashboard renders stats, next steps and quick links", async ({ page }) => {
    await signIn(page, "/dashboard");
    const main = page.getByRole("main");
    for (const label of ["Lessons completed", "Practice exercises", "Mock tests taken", "Interviews done"]) {
      await expect(main.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(main.getByText("0 of 5 done. Each step ticks itself off as you complete it.")).toBeVisible();
    await expect(main.getByRole("link", { name: /Pick a target role/ })).toHaveAttribute("href", "/roadmaps");
    await expect(main.getByRole("link", { name: /Take a baseline mock test/ })).toHaveAttribute("href", "/mock-tests");
    await expect(main.getByText("Jump back in")).toBeVisible();
    for (const [label, href] of [
      ["Learning Center", "/learn"],
      ["Practice Lab", "/practice"],
      ["Mock Tests", "/mock-tests"],
      ["Interview Prep", "/interviews"],
    ]) {
      await expect(main.getByRole("link", { name: new RegExp(`^${label}`) })).toHaveAttribute("href", href);
    }
    await main.getByRole("link", { name: /^Interview Prep/ }).click();
    await expect(page).toHaveURL(/\/interviews$/, { timeout: 60_000 });
  });

  test("mock test: hub, take a short test, results, attempt listed", async ({ page }) => {
    await signIn(page, "/mock-tests");
    const main = page.getByRole("main");
    const titles = [
      "API Testing",
      "Automation Testing",
      "Apache JMeter",
      "Manual Testing",
      "Mobile Testing",
      "Performance Testing",
      "SDET Engineering",
      "Specialist Testing",
    ];
    const cards = main.locator('a[href^="/mock-tests/"]');
    await expect(cards).toHaveCount(8);
    for (const t of titles) await expect(main.getByText(t, { exact: true })).toBeVisible();
    await expect(main.getByText("No attempts yet. Results are saved in this browser only.")).toBeVisible();

    await takeShortMockTest(page, "API Testing");

    await page.goto("/mock-tests");
    const attempts = page.getByRole("main").locator("section", { has: page.getByRole("heading", { name: "Your attempts" }) });
    await expect(attempts.getByRole("listitem")).toHaveCount(1);
    await expect(attempts.getByRole("listitem")).toContainText(/API Testing\s*\d+\/10/);
    await expect(page.getByRole("main").locator('a[href="/mock-tests/api-testing"]')).toContainText(/1 attempt · best \d+%/);
  });

  test("interview: 15-minute session through to completion", async ({ page }) => {
    await signIn(page, "/interviews");
    const main = page.getByRole("main");
    await expect(main.locator('a[href^="/interviews/"]')).toHaveCount(8);
    await main.getByRole("link", { name: /Manual QA/ }).click();
    await expect(page).toHaveURL(/\/interviews\/manual-qa$/, { timeout: 60_000 });
    await expect(page.getByRole("heading", { level: 1, name: "Manual QA interview" })).toBeVisible();
    await page.getByRole("button", { name: "15-minute interview" }).click();

    for (let guard = 0; guard < 20; guard++) {
      await page.getByRole("textbox", { name: "Your answer" }).fill("I would clarify requirements, then design tests.");
      await page.getByRole("button", { name: "Reveal model answer" }).click();
      await expect(page.getByRole("heading", { name: "Model answer" })).toBeVisible();
      const advance = page.getByRole("button", { name: /^(Next question|Finish interview)$/ });
      await expect(advance).toBeDisabled();
      for (const dim of ["Correctness", "Depth", "Problem solving", "Communication"]) {
        await page.getByRole("button", { name: `${dim} 3`, exact: true }).click();
        await expect(page.getByRole("button", { name: `${dim} 3`, exact: true })).toHaveAttribute("aria-pressed", "true");
      }
      await expect(advance).toBeEnabled();
      const finishing = (await advance.textContent())?.trim() === "Finish interview";
      await advance.click();
      if (finishing) break;
    }
    await expect(page.getByRole("heading", { name: /Interview complete/ })).toBeVisible();
    await expect(page.getByText(/questions · self-rated average 3\.0 \/ 4/)).toBeVisible();

    await page.getByRole("button", { name: "Back to Manual QA" }).click();
    await expect(page.getByRole("heading", { name: "Past sessions" })).toBeVisible();
    await expect(page.getByText(/15 min · \d+ questions · avg 3\.0\/4/)).toBeVisible();
  });

  test("projects: list renders and a project can be marked done", async ({ page }) => {
    await signIn(page, "/projects");
    const main = page.getByRole("main");
    const cards = main.locator('a[href^="/projects/"]');
    await expect(cards).toHaveCount(9);
    await main.getByRole("link", { name: /Selenium \+ TestNG UI automation framework/ }).click();
    await expect(page).toHaveURL(/\/projects\/selenium-testng-framework$/, { timeout: 60_000 });
    await expect(page.getByRole("heading", { level: 1, name: "Selenium + TestNG UI automation framework" })).toBeVisible();

    await page.getByRole("button", { name: "Mark as done" }).click();
    await expect(page.getByRole("button", { name: "Done (undo)" })).toBeVisible();
    await page.getByRole("link", { name: "← All projects" }).click();
    await expect(page).toHaveURL(/\/projects$/, { timeout: 60_000 });
    await expect(main.locator('a[href="/projects/selenium-testng-framework"]')).toContainText("Done");

    await page.goto("/projects/selenium-testng-framework");
    await page.getByRole("button", { name: "Done (undo)" }).click();
    await expect(page.getByRole("button", { name: "Mark as done" })).toBeVisible();
  });

  test("planner: pick a role, generate a plan, tick a task", async ({ page }) => {
    await signIn(page, "/planner");
    await expect(page.getByText("No plan yet. Choose a role and generate one above.")).toBeVisible();
    const role = page.getByRole("combobox", { name: "Target role" });
    const options = await role.locator("option").allTextContents();
    const target = options.find((o) => /Manual/i.test(o)) ?? options[0];
    await role.selectOption({ label: target });
    await page.getByRole("button", { name: "Generate plan" }).click();
    await expect(page.getByRole("status")).toContainText(`lessons planned for ${target}.`);
    await expect(page.getByRole("heading", { name: "Week 1" })).toBeVisible();

    const first = page.getByRole("checkbox", { name: /^Mark .* done$/ }).first();
    await expect(page.getByText(new RegExp(`${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} · 0/\\d+ done`))).toBeVisible();
    await first.check();
    await expect(first).toBeChecked();
    await expect(page.getByText(/ · 1\/\d+ done/)).toBeVisible();

    await page.reload();
    await expect(page.getByRole("checkbox", { name: /^Mark .* done$/ }).first()).toBeChecked();
  });

  test("progress: honest empty states, then data after a mock test", async ({ page }) => {
    await signIn(page, "/progress");
    const main = page.getByRole("main");
    await expect(main.getByText("No activity yet. Open a lesson, take a quiz or finish a lab and it will show up here.")).toBeVisible();
    await expect(main.getByText(/No mock tests yet\./)).toBeVisible();
    await expect(main.getByText("Topic accuracy appears after your first mock test.")).toBeVisible();
    await expect(main.getByText(/No rated interview answers yet\./)).toBeVisible();
    await expect(main.getByText(/No labs completed yet\./)).toBeVisible();

    await takeShortMockTest(page, "Manual Testing");

    await page.goto("/progress");
    await expect(main.getByText(/No mock tests yet\./)).toHaveCount(0);
    await expect(main.getByText("Topic accuracy appears after your first mock test.")).toHaveCount(0);
    await expect(main.getByRole("img", { name: /Accuracy over 1 attempts, latest \d+%/ })).toBeVisible();
    await expect(main.getByText(/1 attempt · latest \d+% \(Manual Testing\)/)).toBeVisible();
    const statTile = main.getByText("Mock tests taken", { exact: true }).locator("..");
    await expect(statTile).toContainText("1");
    await expect(main.getByRole("img", { name: /Activity heatmap, 1 active days/ })).toBeVisible();
  });

  test("settings: theme toggle switches data-theme and export downloads a backup", async ({ page }) => {
    await signIn(page, "/settings");
    const html = page.locator("html");
    const theme = page.getByRole("radiogroup", { name: "Colour theme" }).last();

    await theme.getByRole("radio", { name: "Light" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await theme.getByRole("radio", { name: "Dark" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await theme.getByRole("radio", { name: "Light" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "light");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export backup" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^saige-prep-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const path = await download.path();
    const fs = await import("node:fs/promises");
    const parsed = JSON.parse(await fs.readFile(path, "utf8")) as Record<string, unknown>;
    expect(parsed).toHaveProperty("assessments");
  });

  test("light theme: dashboard smoke screenshot and no console errors on any page", async ({ page }, testInfo) => {
    await page.addInitScript(() => window.localStorage.setItem("saige-theme", "light"));
    for (const path of ["/dashboard", "/mock-tests", "/interviews", "/projects", "/planner", "/progress", "/settings"]) {
      await signIn(page, path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    await page.goto("/dashboard");
    await expect(page.getByText("Jump back in")).toBeVisible();
    // Text must not be the same colour as its background in light theme.
    const sameColour = await page.evaluate(() => {
      const bad: string[] = [];
      for (const el of Array.from(document.querySelectorAll("main h1, main p, main a, main span"))) {
        const s = getComputedStyle(el);
        if (!el.textContent?.trim() || s.visibility === "hidden") continue;
        let bg = "rgba(0, 0, 0, 0)";
        for (let n: Element | null = el; n; n = n.parentElement) {
          const c = getComputedStyle(n).backgroundColor;
          if (c !== "rgba(0, 0, 0, 0)" && c !== "transparent") {
            bg = c;
            break;
          }
        }
        if (s.color === bg) bad.push(el.textContent.trim().slice(0, 40));
      }
      return bad;
    });
    expect(sameColour).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("dashboard-light.png"), fullPage: true });
  });
});
