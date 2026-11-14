#!/usr/bin/env node
/**
 * Captures the screenshots used by the Help & User Guide (/help) by driving the real app.
 *
 *   npm run help:screenshots
 *
 * Every image shows state produced by real clicks in a fresh browser profile: nothing is injected
 * into localStorage except the light-theme preference. Re-run it whenever the UI changes.
 *
 * By default the script starts its own isolated stack and stops it afterwards:
 *   backend  -> http://127.0.0.1:8300, database saige_prep_help_e2e (MongoDB from MONGODB_URI, default port 27018)
 *   frontend -> http://127.0.0.1:3300 (next dev), rewriting /api to that backend
 * Set HELP_BASE_URL to reuse an app that is already running instead (nothing is started then).
 *
 * Output: public/help/<name>.webp (1280x800, light theme). Falls back to PNG if sharp is unavailable.
 * Set PLAYWRIGHT_BROWSERS_PATH if your Chromium lives outside the default location.
 */
import { spawn } from "node:child_process";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(here, "..");
const backendDir = path.resolve(frontendDir, "../backend");
const outDir = path.join(frontendDir, "public", "help");

const FRONTEND_PORT = Number(process.env.HELP_FRONTEND_PORT ?? 3300);
const BACKEND_PORT = Number(process.env.HELP_BACKEND_PORT ?? 8300);
const BASE_URL = (process.env.HELP_BASE_URL ?? `http://127.0.0.1:${FRONTEND_PORT}`).replace(/\/$/, "");
const VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const HEADER_OFFSET = 72; // sticky app header (56px) plus breathing room

/* ------------------------------------------------------------------ servers */

const children = [];

async function reachable(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function waitFor(url, label, timeoutMs) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    if (await reachable(url)) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`${label} did not become ready at ${url} within ${timeoutMs / 1000}s`);
}

function start(command, args, options, label) {
  const child = spawn(command, args, { ...options, shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] });
  let tail = "";
  const keep = (chunk) => {
    tail = (tail + chunk.toString()).slice(-4000);
  };
  child.stdout.on("data", keep);
  child.stderr.on("data", keep);
  child.on("exit", (code) => {
    if (code && !child.killedByUs) console.error(`\n${label} exited with code ${code}. Last output:\n${tail}`);
  });
  children.push(child);
  return child;
}

function stopAll() {
  for (const child of children) {
    child.killedByUs = true;
    if (process.platform === "win32") spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGTERM");
  }
}

async function startStack() {
  if (process.env.HELP_BASE_URL) {
    await waitFor(`${BASE_URL}/dashboard`, "App", 10_000);
    return;
  }
  if (await reachable(`http://127.0.0.1:${FRONTEND_PORT}/dashboard`)) {
    throw new Error(`Port ${FRONTEND_PORT} is already in use. Stop that server or set HELP_BASE_URL to reuse it.`);
  }
  const python = process.platform === "win32" ? ".venv\\Scripts\\python.exe" : ".venv/bin/python";
  console.log(`Starting backend on :${BACKEND_PORT} (database saige_prep_help_e2e)…`);
  start(python, ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", String(BACKEND_PORT)], {
    cwd: backendDir,
    env: {
      ...process.env,
      APP_ENV: "test",
      MONGODB_URI: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27018",
      MONGODB_DATABASE: "saige_prep_help_e2e",
      FRONTEND_ORIGIN: BASE_URL,
      SESSION_SECRET: "help-screenshots-only-secret-0123456789abcdef",
    },
  }, "Backend");
  await waitFor(`http://127.0.0.1:${BACKEND_PORT}/ready`, "Backend", 60_000);
  console.log(`Starting Next.js dev server on :${FRONTEND_PORT}…`);
  start("npx", ["next", "dev", "--port", String(FRONTEND_PORT), "--hostname", "127.0.0.1"], {
    cwd: frontendDir,
    env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${BACKEND_PORT}` },
  }, "Next.js");
  await waitFor(`${BASE_URL}/dashboard`, "Next.js", 240_000);
}

/* ------------------------------------------------------------------ capture helpers */

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("sharp is not available; saving PNG instead of WebP.");
}

const saved = [];

/** Hides dev-only overlays and freezes animations so captures are stable. */
const STABLE_CSS = `
  nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display: none !important; }
  *, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; caret-color: transparent !important; }
`;

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.addStyleTag({ content: STABLE_CSS }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(350);
}

/** Scrolls so the element sits just below the sticky header. */
async function scrollTo(page, locator) {
  await locator.first().waitFor({ state: "visible", timeout: 30_000 });
  await locator.first().evaluate((el, offset) => {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset);
  }, HEADER_OFFSET);
}

async function shot(page, name, { focus, top = false } = {}) {
  await settle(page);
  if (top) await page.evaluate(() => window.scrollTo(0, 0));
  if (focus) await scrollTo(page, focus);
  await page.waitForTimeout(250);
  const png = await page.screenshot({ type: "png" });
  const ext = sharp ? "webp" : "png";
  const file = path.join(outDir, `${name}.${ext}`);
  const data = sharp ? await sharp(png).webp({ quality: 78, effort: 6 }).toBuffer() : png;
  await writeFile(file, data);
  saved.push({ name: `${name}.${ext}`, bytes: data.length });
  console.log(`  ✓ ${name}.${ext} (${Math.round(data.length / 1024)} KB)`);
}

async function go(page, url) {
  await page.goto(`${BASE_URL}${url}`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.locator("main").first().waitFor({ timeout: 120_000 });
  await page.getByRole("heading", { level: 1 }).first().waitFor({ timeout: 120_000 });
}

/** Waits for any toast to disappear so it does not cover the next capture. */
async function clearToasts(page) {
  await page.waitForTimeout(4500);
}

/* ------------------------------------------------------------------ flows */

async function gettingStarted(page) {
  await go(page, "/dashboard");
  await shot(page, "start-dashboard", { top: true });
  await go(page, "/learn");
  await shot(page, "start-learning-center", { top: true });
}

async function roadmaps(page) {
  await go(page, "/roadmaps");
  await shot(page, "roadmaps-catalogue", { top: true });
  await page.getByRole("searchbox", { name: "Search roles" }).or(page.getByRole("textbox", { name: "Search roles" })).fill("manual");
  await shot(page, "roadmaps-search", { top: true });
  await go(page, "/careers/testing/roles/manual-qa-engineer");
  await shot(page, "roadmaps-detail", { top: true });
  await page.getByRole("button", { name: "Set as my target role" }).click();
  await page.getByRole("button", { name: "✓ Your target role" }).waitFor();
  await shot(page, "roadmaps-target-set", { top: true });
  await shot(page, "roadmaps-stages", { focus: page.locator("#roadmap-heading") });
  await clearToasts(page);
}

async function planner(page) {
  await go(page, "/planner");
  const role = page.getByRole("combobox", { name: "Target role" });
  const options = await role.locator("option").allTextContents();
  const target = options.find((o) => /^Manual QA Engineer/i.test(o)) ?? options.find((o) => /Manual/i.test(o)) ?? options[0];
  await role.selectOption({ label: target });
  await page.getByRole("spinbutton", { name: "Weeks" }).fill("6");
  await page.getByRole("spinbutton", { name: "Hours / week" }).fill("5");
  await shot(page, "planner-form", { top: true });
  await page.getByRole("button", { name: "Generate plan" }).click();
  await page.getByRole("status").filter({ hasText: "lessons planned for" }).waitFor();
  await page.getByRole("heading", { name: "Week 1" }).waitFor();
  await shot(page, "planner-plan", { top: true });
  await page.getByRole("checkbox", { name: /^Mark .* done$/ }).first().check();
  await page.getByText(/ · 1\/\d+ done/).first().waitFor();
  await shot(page, "planner-ticked", { focus: page.getByRole("heading", { name: "Week 1" }) });
}

async function lesson(page) {
  const main = page.locator("main").first();
  await go(page, "/careers/testing/manual-testing");
  await shot(page, "lesson-track", { top: true });
  await go(page, "/careers/testing/manual-testing/what-is-software-testing");
  await shot(page, "lesson-header", { top: true });
  await shot(page, "lesson-body", { focus: main.getByRole("heading", { name: "Beginner-friendly explanation" }) });
  await shot(page, "lesson-example", { focus: main.getByRole("heading", { name: "Real-world example" }) });

  // Quiz: pick an answer for every question, then check.
  const quiz = page.locator("#quiz");
  const fieldsets = quiz.locator("fieldset");
  const count = await fieldsets.count();
  for (let i = 0; i < count; i++) {
    await fieldsets.nth(i).locator('input[type="radio"], input[type="checkbox"]').first().check();
  }
  await shot(page, "lesson-quiz-answering", { focus: quiz });
  await quiz.getByRole("button", { name: "Check answers" }).click();
  await quiz.getByRole("status").waitFor();
  await scrollTo(page, quiz.getByRole("status"));
  await page.evaluate(() => window.scrollBy(0, -420));
  await shot(page, "lesson-quiz-feedback");

  const interview = main.locator("section", { has: page.locator("#interview-heading") });
  await interview.locator("summary").first().click();
  await shot(page, "lesson-interview", { focus: page.locator("#interview-heading") });

  await main.getByRole("textbox", { name: /^Notes for / }).fill(
    "Testing = finding information about quality, not proving there are no bugs.\nRemember: verification (built right) vs validation (right thing).",
  );
  await main.getByRole("button", { name: "Save note" }).click();
  await shot(page, "lesson-notes", { focus: main.getByRole("textbox", { name: /^Notes for / }) });
  await clearToasts(page);

  await page.evaluate(() => window.scrollTo(0, 0));
  await main.getByRole("button", { name: "Mark as complete" }).click();
  await main.getByRole("button", { name: "Bookmark", exact: true }).click();
  await main.getByRole("button", { name: "Completed" }).waitFor();
  await shot(page, "lesson-complete", { top: true });
  await clearToasts(page);

  await go(page, "/bookmarks");
  await shot(page, "lesson-bookmarks", { top: true });
  await go(page, "/notes");
  await shot(page, "lesson-notes-page", { top: true });
}

async function jmeter(page) {
  await go(page, "/careers/testing/performance");
  await shot(page, "jmeter-performance-track", { top: true });
  await go(page, "/careers/testing/jmeter");
  await shot(page, "jmeter-track", { top: true });
  await go(page, "/careers/testing/jmeter/what-is-jmeter");
  await shot(page, "jmeter-first-lesson", { top: true });
}

async function practice(page) {
  const main = page.locator("main").first();
  await go(page, "/practice");
  await shot(page, "practice-hub", { top: true });

  // SQL: open the worked solution, type it in, check it.
  await go(page, "/practice/sql");
  await main.getByRole("button", { name: "Run", exact: true }).waitFor({ timeout: 60_000 });
  await shot(page, "practice-sql-start", { top: true });
  await main.getByRole("button", { name: "Show a solution" }).click();
  const solution = (await main.locator("pre").first().innerText()).trim();
  await main.getByRole("button", { name: "Hide solution" }).click();
  await page.locator("#sql-editor").fill(solution);
  await main.getByRole("button", { name: "Check answer" }).click();
  await main.getByRole("table").first().waitFor();
  await shot(page, "practice-sql-checked", { focus: page.locator("#sql-editor") });
  await clearToasts(page);

  // API: send the health check request.
  await go(page, "/practice/api");
  await main.getByRole("button", { name: "Load starter request" }).click();
  await main.getByRole("button", { name: "Send" }).click();
  await main.getByText("Challenge complete").waitFor();
  await shot(page, "practice-api", { top: true });
  await page.evaluate(() => window.scrollBy(0, 420));
  await shot(page, "practice-api-response");
  await clearToasts(page);

  // Test design: two-value boundaries for 18..65.
  await go(page, "/practice/test-design");
  await main.getByRole("textbox", { name: "Boundary values" }).fill("17, 18, 65, 66");
  await main.getByRole("button", { name: "Check my answer" }).click();
  await shot(page, "practice-test-design", { top: true });
  await clearToasts(page);

  // Code: predict the output of == vs equals.
  await go(page, "/practice/code");
  await main.getByText("false then true", { exact: true }).click();
  await main.getByRole("button", { name: "Check my answer" }).click();
  await shot(page, "practice-code", { focus: main.getByRole("button", { name: "Try again" }) });
  await clearToasts(page);

  // Performance: mean of the 20-sample run.
  await go(page, "/practice/performance");
  await main.getByRole("textbox", { name: "Your answer" }).fill("318");
  await main.getByRole("button", { name: "Check my answer" }).click();
  await shot(page, "practice-performance", { top: true });
  await clearToasts(page);

  // Requirements review: write concerns, then compare with the expert review.
  await go(page, "/practice/requirements");
  await main.locator("textarea").first().fill(
    "- How long is the reset link valid?\n- What happens if the email is not registered?\n- Is there a limit on reset requests?",
  );
  await main.getByRole("button", { name: "Compare with an expert review" }).click();
  await main.locator("button[aria-pressed]").filter({ hasText: "Missed" }).first().click();
  await shot(page, "practice-requirements", { focus: main.getByText("Tick every point you raised") });

  await go(page, "/practice/defect-report");
  await shot(page, "practice-defect-report", { top: true });
}

async function toolkit(page) {
  const main = page.locator("main").first();
  await go(page, "/toolkit");
  await shot(page, "toolkit-hub", { top: true });
  await go(page, "/toolkit/bva");
  await main.getByLabel("Minimum (inclusive)").fill("1");
  await main.getByLabel("Maximum (inclusive)").fill("100");
  await shot(page, "toolkit-bva", { top: true });
  await go(page, "/toolkit/json");
  await shot(page, "toolkit-json", { top: true });
}

async function mockTest(page) {
  const main = page.locator("main").first();
  await go(page, "/mock-tests");
  await shot(page, "mock-hub", { top: true });
  await main.locator('a[href="/careers/testing/mock-tests/manual-testing"]').first().click();
  await page.getByRole("heading", { level: 1, name: "Manual Testing mock test" }).waitFor({ timeout: 120_000 });
  await page.getByRole("radiogroup", { name: "Questions" }).getByRole("radio", { name: "10", exact: true }).click();
  await page.getByRole("radiogroup", { name: "Time limit" }).getByRole("radio", { name: "No timer" }).click();
  await shot(page, "mock-setup", { top: true });
  await page.getByRole("button", { name: "Start test" }).click();

  for (let i = 1; i <= 10; i++) {
    await page.getByText(`Question ${i} of 10`).waitFor();
    // Answer every question except the last on the first pass, so the navigator shows a gap.
    if (i < 10) await main.locator('fieldset input[type="radio"], fieldset input[type="checkbox"]').first().check();
    if (i === 3) {
      await main.getByRole("button", { name: "Flag for review" }).click();
      await shot(page, "mock-question", { top: true });
    }
    if (i < 10) await main.getByRole("button", { name: "Next", exact: true }).click();
  }
  await shot(page, "mock-navigator", { top: true });
  await main.locator('fieldset input[type="radio"], fieldset input[type="checkbox"]').first().check();
  await page.getByText("10/10 answered").waitFor();
  await main.getByRole("button", { name: "Finish" }).click();
  await page.getByRole("dialog", { name: "Submit your test?" }).waitFor();
  await shot(page, "mock-submit");
  await page.getByRole("dialog", { name: "Submit your test?" }).getByRole("button", { name: "Submit" }).click();
  await main.getByRole("heading", { name: "Score by topic (weakest first)" }).waitFor();
  await shot(page, "mock-results", { top: true });
  await shot(page, "mock-review", { focus: main.getByRole("heading", { name: "Review every question" }) });
}

async function interview(page) {
  const main = page.locator("main").first();
  await go(page, "/interviews");
  await shot(page, "interview-hub", { top: true });
  await go(page, "/careers/testing/interviews/manual-qa");
  await shot(page, "interview-lengths", { top: true });
  await page.getByRole("button", { name: "15-minute interview" }).click();

  const answer =
    "First I would clarify the requirement and the risks with the team. Then I would design tests with boundary values and equivalence partitions, run them, and report defects with clear steps and evidence.";
  for (let n = 0; n < 20; n++) {
    await main.getByRole("textbox", { name: "Your answer" }).fill(answer);
    if (n === 0) await shot(page, "interview-answer", { top: true });
    await main.getByRole("button", { name: "Reveal model answer" }).click();
    await main.getByRole("heading", { name: "Model answer" }).waitFor();
    const points = main.locator("label", { has: page.locator('input[type="checkbox"]') });
    const pointCount = await points.count();
    for (let k = 0; k < Math.min(2, pointCount); k++) await points.nth(k).locator("input").check();
    if (n === 0) await shot(page, "interview-reveal", { focus: main.getByRole("heading", { name: "Model answer" }) });
    for (const dim of ["Correctness", "Depth", "Problem solving", "Communication"]) {
      await main.getByRole("button", { name: `${dim} 3`, exact: true }).click();
    }
    if (n === 0) {
      await shot(page, "interview-rubric", { focus: main.getByRole("heading", { name: /Rate yourself/ }) });
    }
    const advance = main.getByRole("button", { name: /^(Next question|Finish interview)$/ });
    const finishing = (await advance.textContent())?.trim() === "Finish interview";
    await advance.click();
    if (finishing) break;
  }
  await main.getByRole("heading", { name: /Interview complete/ }).waitFor();
  await shot(page, "interview-summary", { top: true });
  await main.getByRole("button", { name: /^Back to / }).click();
  await main.getByRole("heading", { name: "Past sessions" }).waitFor();
  await shot(page, "interview-history", { top: true });
}

async function projects(page) {
  const main = page.locator("main").first();
  await go(page, "/projects");
  await shot(page, "projects-list", { top: true });
  await go(page, "/projects/selenium-testng-framework");
  await shot(page, "projects-detail", { top: true });
  await main.getByRole("button", { name: "Mark as done" }).click();
  await main.getByRole("button", { name: "Done (undo)" }).waitFor();
  await go(page, "/projects");
  await shot(page, "projects-done", { top: true });
}

async function progress(page) {
  const main = page.locator("main").first();
  await go(page, "/dashboard");
  await shot(page, "progress-dashboard", { top: true });
  await go(page, "/progress");
  await shot(page, "progress-overview", { top: true });
  await shot(page, "progress-charts", { focus: main.getByText("Mock test accuracy over time", { exact: true }) });
  await shot(page, "progress-labs", { focus: main.getByText("Interview self-ratings", { exact: true }) });
}

async function data(page) {
  const main = page.locator("main").first();
  await go(page, "/settings");
  await shot(page, "data-settings", { top: true });
  const downloadPromise = page.waitForEvent("download");
  await main.getByRole("button", { name: "Export backup" }).click();
  const download = await downloadPromise;
  await page.getByText("Backup downloaded.").waitFor();
  await shot(page, "data-export", { top: true });
  await clearToasts(page);
  const backupPath = path.join(outDir, ".backup-tmp.json");
  await download.saveAs(backupPath);
  await main.getByLabel("Backup file").setInputFiles(backupPath);
  await page.getByText("Backup restored.").waitFor();
  await shot(page, "data-import", { top: true });
  await rm(backupPath, { force: true });
  await clearToasts(page);
  await main.getByRole("button", { name: "Delete all my data" }).click();
  await page.getByRole("dialog", { name: "Delete all your data?" }).or(page.getByRole("alertdialog", { name: "Delete all your data?" })).waitFor();
  await shot(page, "data-delete");
  await page.keyboard.press("Escape");
}

async function searchAndTheme(page) {
  await go(page, "/dashboard");
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox");
  await search.fill("jmeter");
  await page.getByRole("option").first().filter({ hasText: "Lesson" }).waitFor();
  await shot(page, "search-palette");
  await page.keyboard.press("Escape");
  await go(page, "/settings");
  await shot(page, "search-theme", { focus: page.getByText("Appearance", { exact: true }) });
}

async function mobile(browser) {
  const context = await browser.newContext({ viewport: MOBILE_VIEWPORT, deviceScaleFactor: 1, isMobile: true, hasTouch: true, colorScheme: "light", reducedMotion: "reduce" });
  await context.addInitScript(() => window.localStorage.setItem("saige-theme", "light"));
  const page = await context.newPage();
  await go(page, "/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("dialog", { name: "Navigation" }).waitFor();
  await shot(page, "search-mobile-menu");
  await context.close();
}

/* ------------------------------------------------------------------ main */

const FLOWS = [
  ["getting started", gettingStarted],
  ["roadmaps", roadmaps],
  ["planner", planner],
  ["lesson", lesson],
  ["jmeter", jmeter],
  ["practice", practice],
  ["toolkit", toolkit],
  ["mock test", mockTest],
  ["interview", interview],
  ["projects", projects],
  ["progress", progress],
  ["data", data],
  ["search and theme", searchAndTheme],
];

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const f of await readdir(outDir)) {
    if (/\.(png|webp)$/.test(f)) await rm(path.join(outDir, f));
  }
  await startStack();

  const browser = await chromium.launch();
  const failures = [];
  try {
    // One profile for the whole run, so later screenshots (dashboard, progress) show what earlier flows did.
    const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce", acceptDownloads: true });
    await context.addInitScript(() => window.localStorage.setItem("saige-theme", "light"));
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    for (const [label, flow] of FLOWS) {
      console.log(`\n${label}`);
      try {
        await flow(page);
      } catch (e) {
        failures.push(`${label}: ${e instanceof Error ? e.message.split("\n")[0] : e}`);
        console.error(`  ✗ ${label} failed: ${e instanceof Error ? e.message : e}`);
      }
    }
    await context.close();
    console.log("\nmobile");
    try {
      await mobile(browser);
    } catch (e) {
      failures.push(`mobile: ${e instanceof Error ? e.message.split("\n")[0] : e}`);
    }
  } finally {
    await browser.close();
  }

  let total = 0;
  for (const s of saved) total += (await stat(path.join(outDir, s.name))).size;
  console.log(`\n${saved.length} screenshots, ${(total / 1024 / 1024).toFixed(2)} MB in ${path.relative(frontendDir, outDir)}`);
  if (failures.length) {
    console.error(`\n${failures.length} flow(s) failed:\n- ${failures.join("\n- ")}`);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(stopAll);
