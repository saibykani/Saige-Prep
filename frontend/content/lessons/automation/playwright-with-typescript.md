---
slug: playwright-with-typescript
title: Playwright with TypeScript
summary: Get started with Playwright Test in TypeScript. Install it, write tests with role-based locators and web-first assertions, rely on auto-waiting, run across browsers in parallel, and debug with UI mode and the trace viewer.
level: intermediate
duration: 45
tags: [playwright, typescript, web-automation, e2e]
objectives:
  - Install Playwright Test and understand the generated project
  - Write tests using recommended locators and web-first assertions
  - Explain auto-waiting and why it reduces flakiness
  - Run tests across browsers and debug failures with traces
prerequisites:
  - Basic JavaScript or TypeScript syntax
  - Locator strategies
related: [locator-strategies, waits-and-synchronization, page-object-model, flaky-test-reduction, cypress-fundamentals]
references:
  - title: Playwright documentation — Installation
    url: https://playwright.dev/docs/intro
  - title: Playwright documentation — Locators
    url: https://playwright.dev/docs/locators
  - title: Playwright documentation — Assertions
    url: https://playwright.dev/docs/test-assertions
  - title: Playwright documentation — Trace viewer
    url: https://playwright.dev/docs/trace-viewer
interview:
  - q: How does Playwright handle waiting?
    a: "Actions such as click and fill perform actionability checks before acting: the element must be attached, visible, stable, enabled and able to receive events, depending on the action. Web-first assertions like toBeVisible and toHaveText retry until the condition holds or the timeout expires. So you rarely write explicit waits, and you should never need fixed sleeps."
  - q: What locators does Playwright recommend?
    a: "User-facing locators first: getByRole with an accessible name, getByLabel, getByPlaceholder and getByText, and getByTestId for elements without a good accessible handle. CSS and XPath are supported but discouraged because they tie tests to DOM structure."
  - q: How is Playwright different from Selenium?
    a: "Selenium implements the W3C WebDriver standard with bindings in many languages and broad browser support including real vendor browsers through drivers. Playwright controls Chromium, Firefox and WebKit through its own protocol connections, ships its own test runner with auto-waiting, isolation through browser contexts, tracing and network interception built in. Both are valid choices; team language and existing infrastructure often decide."
practice:
  - "Run npm init playwright@latest in an empty folder and execute the example test in all three browsers."
  - "Write a test for a login form using only getByLabel and getByRole locators."
  - "Make a test fail on purpose, run it with --trace on and inspect the failing step in the trace viewer."
takeaways:
  - Playwright Test is a runner plus browser automation in one package.
  - Prefer role, label and test id locators over CSS and XPath.
  - Auto-waiting and web-first assertions remove most manual waits.
  - Each test gets a fresh browser context, so tests are isolated by default.
  - Use UI mode, the inspector and traces to debug.
quiz:
  - id: pwts-q1
    type: single
    topic: playwright-with-typescript
    difficulty: beginner
    prompt: Which locator does Playwright recommend for a button labelled 'Sign in'?
    options: ["page.locator('#btn-17')", "page.getByRole('button', { name: 'Sign in' })", "page.locator('//div[3]/button')", "page.$('button')"]
    answer: [1]
    explanation: "Role-based locators reflect how users and assistive technologies perceive the page and survive markup changes. Generated ids and positional XPath break easily."
  - id: pwts-q2
    type: debugging
    topic: playwright-with-typescript
    difficulty: intermediate
    prompt: This assertion sometimes fails because the text arrives after an API call. What is wrong?
    code: |
      const text = await page.locator('.status').textContent();
      expect(text).toBe('Paid');
    codeLanguage: typescript
    options: ["textContent is deprecated", "It reads the text once and asserts immediately; use await expect(page.locator('.status')).toHaveText('Paid') which retries", "toBe should be toEqual", "The locator needs XPath"]
    answer: [1]
    explanation: "A plain expect on a value is not retried. Web-first assertions on a locator keep re-checking until the timeout, which handles asynchronous updates."
  - id: pwts-q3
    type: truefalse
    topic: playwright-with-typescript
    difficulty: beginner
    prompt: By default, Playwright Test runs test files in parallel using worker processes.
    options: ["True", "False"]
    answer: [0]
    explanation: "Test files are distributed across workers by default. Tests within one file run in order unless you enable fullyParallel or describe.configure({ mode: 'parallel' })."
  - id: pwts-q4
    type: multiple
    topic: playwright-with-typescript
    difficulty: intermediate
    prompt: Which browser engines can Playwright run out of the box after npx playwright install?
    options: ["Chromium", "Firefox", "WebKit", "Internet Explorer 11"]
    answer: [0, 1, 2]
    explanation: "Playwright supports Chromium, Firefox and WebKit, and can also drive branded Chrome and Edge through channels. Internet Explorer is not supported."
---

## Beginner-friendly explanation

Think of a very patient robot assistant who uses a website for you. You tell it "click the Sign in button" and it does not panic if the button is still loading; it waits until the button is really there and clickable, then clicks. When you ask "does the page say Paid?", it keeps looking for a few seconds before giving up.

**Playwright** is that robot. It drives real browsers, Chrome-like (Chromium), Firefox and Safari's engine (WebKit), and comes with its own test runner. **TypeScript** is JavaScript with types, which helps your editor catch mistakes before you run anything.

## Technical explanation

Playwright Test (`@playwright/test`) bundles the runner, assertions, fixtures and browser automation.

- **Browser, context, page**: one browser process; each test gets a new **browser context** (like a fresh incognito profile), and a **page** is a tab. This isolates cookies and storage between tests.
- **Fixtures**: tests receive objects such as `page`, `context` and `request` as arguments; the runner creates and cleans them up.
- **Locators**: lazy descriptions of how to find elements, resolved at action time. Recommended: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, `getByTestId`.
- **Actionability**: before `click`, Playwright checks the element is visible, stable, enabled and receives events.
- **Web-first assertions**: `await expect(locator).toBeVisible()` retries until it passes or times out (5 seconds by default).
- **Projects**: run the same tests in several browsers or device emulations.

```mermaid
sequenceDiagram
  participant T as Test
  participant L as Locator
  participant B as Browser
  T->>L: click()
  loop until actionable or timeout
    L->>B: find element, check visible, stable, enabled
  end
  L->>B: perform click
  T->>B: expect(locator).toHaveText('Paid')
  loop retry until match or timeout
    B-->>T: current text
  end
```

## Real-world example

A SaaS team building a React dashboard had a Selenium suite with many explicit waits and frequent timing failures. They piloted Playwright on the login and billing flows, using role-based locators and web-first assertions. The pilot tests needed no custom wait code, ran in Chromium, Firefox and WebKit through projects, and failures in CI came with a trace file that showed DOM snapshots and network calls for every step. Based on the pilot, they wrote all new UI tests in Playwright while keeping the stable Selenium tests.

## Step-by-step walkthrough

1. Install Node.js (an active LTS release).
2. In an empty folder run `npm init playwright@latest` and accept TypeScript.
3. Look at `playwright.config.ts`, `tests/example.spec.ts` and the installed browsers.
4. Write a test using `getByRole` and `getByLabel` locators.
5. Run `npx playwright test`, then open the HTML report with `npx playwright show-report`.
6. Debug with `npx playwright test --ui` or `--debug`.
7. Record new steps with `npx playwright codegen <url>` and then clean up the generated code.

## Code examples

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
```

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('valid user reaches the dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill('demo@example.test');
    await page.getByLabel('Password').fill(process.env.DEMO_PASSWORD ?? '');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('wrong password shows an error', async ({ page }) => {
    await page.getByLabel('Email').fill('demo@example.test');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toHaveText('Invalid email or password');
  });
});
```

Useful commands:

```bash
npx playwright test                       # all tests, all projects
npx playwright test --project=chromium    # one browser
npx playwright test login.spec.ts --headed
npx playwright test --ui                  # interactive UI mode
npx playwright show-report
```

## Expected output

```text
Running 6 tests using 3 workers
  6 passed (8.4s)

To open last HTML report run:
  npx playwright show-report
```

Two tests times three projects gives six runs. Timings vary.

## Common mistakes

- **Forgetting `await`**, so actions and assertions run out of order or never run.
- **Asserting on extracted values** (`textContent()` then `toBe`) instead of web-first assertions.
- **Using `page.waitForTimeout`** as a sleep; it is meant for debugging only.
- **CSS and XPath tied to layout** when a role or label locator exists.
- **Sharing state between tests** through module-level variables.
- **Committing secrets** in tests instead of reading environment variables.

## Troubleshooting

- **"Executable doesn't exist"**: run `npx playwright install` to download browsers (and `--with-deps` on Linux CI).
- **Strict mode violation**: the locator matched several elements; make it more specific or use `.first()` deliberately.
- **Timeout waiting for locator**: check the trace to see what the page looked like; the name or role may differ from what you expected.
- **Works headed, fails headless**: check viewport size and any features that differ in headless mode.

## Key takeaways summary

Playwright with TypeScript gives you fast, isolated, cross-browser tests with little waiting code. Use user-facing locators, web-first assertions and fresh contexts, and lean on UI mode and traces when something fails.
