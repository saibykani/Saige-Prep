---
slug: webdriverio-fundamentals
title: WebdriverIO fundamentals
summary: Learn WebdriverIO, the Node.js automation framework for web and mobile. Set up a project with the starter wizard, write async tests with selectors and expect-webdriverio matchers, configure wdio.conf, and run against browsers and Appium.
level: intermediate
duration: 40
tags: [webdriverio, javascript, typescript, web-automation, mobile]
objectives:
  - Create a WebdriverIO project with the configuration wizard
  - Explain the role of the testrunner, wdio.conf and services
  - Write tests with $ and $$ selectors and built-in auto-waiting assertions
  - Describe how WebdriverIO reuses the WebDriver protocol for web and mobile
prerequisites:
  - Basic JavaScript or TypeScript
  - Selenium architecture
related: [selenium-architecture, playwright-with-typescript, cypress-fundamentals, appium-architecture-and-setup, page-object-model]
references:
  - title: WebdriverIO — Getting started
    url: https://webdriver.io/docs/gettingstarted
  - title: WebdriverIO — Selectors
    url: https://webdriver.io/docs/selectors
  - title: WebdriverIO — Expect API
    url: https://webdriver.io/docs/api/expect-webdriverio
  - title: WebdriverIO — Configuration file
    url: https://webdriver.io/docs/configurationfile
interview:
  - q: What is WebdriverIO and how does it relate to Selenium?
    a: "WebdriverIO is a Node.js automation framework and test runner. Like Selenium, it speaks the W3C WebDriver protocol, so it can drive any WebDriver-compliant browser driver, Selenium Grid or Appium for mobile. It also supports WebDriver BiDi. It adds its own runner, configuration, reporters, services, auto-waiting matchers and a convenient selector API."
  - q: How does WebdriverIO handle waiting?
    a: "Element commands wait for the element to exist up to waitforTimeout before failing, and expect-webdriverio matchers such as toBeDisplayed and toHaveText retry until they pass or time out. For other conditions you use waitForDisplayed, waitForClickable or browser.waitUntil."
  - q: What is a service in WebdriverIO?
    a: "A plugin that hooks into the test lifecycle to handle infrastructure, for example the Appium service starting an Appium server, or cloud-provider services that connect to remote browser farms. Reporters, such as spec, allure or junit, are separate plugins for output."
practice:
  - "Run npm init wdio@latest . in an empty folder, choose a local web project with Mocha and TypeScript, and run the generated example."
  - "Write a login test using $ with aria and data-testid selectors and expect-webdriverio matchers."
  - "Add the junit reporter to wdio.conf and check the XML output."
takeaways:
  - WebdriverIO is a JavaScript/TypeScript framework built on WebDriver and WebDriver BiDi.
  - wdio.conf controls specs, capabilities, framework, services and reporters.
  - $ finds one element, $$ finds many; commands are async and need await.
  - Built-in matchers retry, so explicit sleeps are unnecessary.
  - The same API drives browsers and mobile apps through Appium.
quiz:
  - id: wdio-q1
    type: single
    topic: webdriverio-fundamentals
    difficulty: beginner
    prompt: Which command creates a new WebdriverIO project using the configuration wizard?
    options: ["npm init wdio@latest .", "npx cypress open", "npm init playwright@latest", "mvn archetype:generate"]
    answer: [0]
    explanation: "The create-wdio starter is run through npm init wdio. The other commands scaffold Cypress, Playwright or Maven projects."
  - id: wdio-q2
    type: debugging
    topic: webdriverio-fundamentals
    difficulty: intermediate
    prompt: This test fails randomly because the assertion runs before the message appears. What is the fix?
    code: |
      await $('[data-testid=save]').click();
      const text = await $('.toast').getText();
      expect(text).toBe('Saved');
    codeLanguage: javascript
    options: ["Add browser.pause(5000)", "Use await expect($('.toast')).toHaveText('Saved'), which retries", "Use $$ instead of $", "Remove await from click"]
    answer: [1]
    explanation: "Reading text once then comparing does not retry. The expect-webdriverio matcher on the element waits until the text matches or times out. browser.pause is a fixed sleep."
  - id: wdio-q3
    type: truefalse
    topic: webdriverio-fundamentals
    difficulty: beginner
    prompt: WebdriverIO can automate native mobile apps when used with Appium.
    options: ["True", "False"]
    answer: [0]
    explanation: "Because Appium speaks the WebDriver protocol, WebdriverIO can drive it, and the Appium service can start the server automatically."
  - id: wdio-q4
    type: multiple
    topic: webdriverio-fundamentals
    difficulty: intermediate
    prompt: Which test frameworks can WebdriverIO's runner use?
    options: ["Mocha", "Jasmine", "Cucumber", "TestNG"]
    answer: [0, 1, 2]
    explanation: "WebdriverIO supports Mocha, Jasmine and Cucumber through framework adapters. TestNG is a Java framework."
---

## Beginner-friendly explanation

Imagine a universal remote control that works with any TV that follows a common standard, and also with your set-top box and your phone. You learn one set of buttons and can control all of them.

**WebdriverIO** (often "WDIO") is that universal remote for JavaScript and TypeScript testers. It talks the same standard language as Selenium, called **WebDriver**, so it can control Chrome, Firefox, Edge and Safari, and through **Appium** it can also control Android and iOS apps. It comes with a ready-made test runner, so after a short setup wizard you can write tests straight away.

## Technical explanation

### Building blocks

- **Testrunner (`@wdio/cli`)**: reads `wdio.conf.ts`, starts sessions, runs spec files in parallel workers, and collects results.
- **Protocols**: W3C WebDriver, plus WebDriver BiDi for features like network and console events. Recent versions manage browser drivers automatically for local runs.
- **Frameworks**: Mocha, Jasmine or Cucumber.
- **Services**: lifecycle plugins (Appium service, cloud vendor services, visual testing).
- **Reporters**: spec, dot, junit, allure and others.

### Selectors

`$` returns one element, `$$` returns an array. Supported strategies include CSS, XPath, link text (`=Sign in`), partial link text (`*=Sign`), accessibility name (`aria/Sign in`) and, for mobile, Appium strategies such as accessibility id (`~login`).

### Waiting

Element commands wait implicitly for the element to exist up to `waitforTimeout`. Matchers from `expect-webdriverio` (`toBeDisplayed`, `toHaveText`, `toHaveUrl`) retry. Explicit helpers include `waitForDisplayed`, `waitForClickable` and `browser.waitUntil`.

```mermaid
flowchart LR
  C[wdio.conf.ts] --> R[WDIO testrunner]
  R --> W1[Worker 1: spec A]
  R --> W2[Worker 2: spec B]
  W1 --> D1[Browser driver / Grid]
  W2 --> AP[Appium server]
  D1 --> BR[Chrome / Firefox / Safari]
  AP --> M[Android / iOS app]
  R --> REP[Reporters: spec, junit, allure]
```

## Real-world example

A travel company had separate Selenium Java tests for web and an unmaintained set of mobile scripts. Their front-end developers worked in TypeScript, so the QA team adopted WebdriverIO for both. The same page-object style and matchers covered the responsive website and, through the Appium service, the Android app. Shared helpers for login and search were reused across platforms, and CI published junit XML from both.

## Step-by-step walkthrough

1. Install an LTS version of Node.js.
2. In an empty folder run `npm init wdio@latest .` and answer the wizard: E2E testing of a web app, local run, Mocha, TypeScript, spec reporter.
3. Inspect `wdio.conf.ts`: `specs`, `capabilities`, `framework`, `reporters`, `baseUrl`, `waitforTimeout`.
4. Write a spec in `test/specs/`.
5. Run with `npx wdio run ./wdio.conf.ts`.
6. Add the junit reporter for CI.

## Code examples

```typescript
// wdio.conf.ts (trimmed)
export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: ['./test/specs/**/*.ts'],
  maxInstances: 4,
  capabilities: [
    { browserName: 'chrome' },
    { browserName: 'firefox' },
  ],
  baseUrl: 'http://localhost:3000',
  waitforTimeout: 10000,
  framework: 'mocha',
  reporters: ['spec', ['junit', { outputDir: './reports/junit' }]],
  mochaOpts: { ui: 'bdd', timeout: 60000 },
};
```

```typescript
// test/specs/login.e2e.ts
describe('login', () => {
  beforeEach(async () => {
    await browser.url('/login');
  });

  it('valid user reaches the dashboard', async () => {
    await $('[data-testid=email]').setValue('demo@example.test');
    await $('[data-testid=password]').setValue(process.env.DEMO_PASSWORD ?? '');
    await $('aria/Sign in').click();

    await expect(browser).toHaveUrl(expect.stringContaining('/dashboard'));
    await expect($('h1')).toHaveText('Welcome');
  });

  it('lists three featured products', async () => {
    await browser.url('/');
    const cards = await $$('[data-testid=product-card]');
    await expect(cards).toBeElementsArrayOfSize(3);
  });
});
```

A page object in WDIO style:

```typescript
class LoginPage {
  get email()    { return $('[data-testid=email]'); }
  get password() { return $('[data-testid=password]'); }
  get submit()   { return $('aria/Sign in'); }

  async open() { await browser.url('/login'); }
  async loginAs(user: string, pass: string) {
    await this.email.setValue(user);
    await this.password.setValue(pass);
    await this.submit.click();
  }
}
export default new LoginPage();
```

## Expected output

The spec reporter prints something like:

```text
[chrome #0-0] login
[chrome #0-0]    ✓ valid user reaches the dashboard
[chrome #0-0]    ✓ lists three featured products
[chrome #0-0] 2 passing
Spec Files: 2 passed, 2 total (100% completed)
```

Exact formatting depends on the WebdriverIO version.

## Common mistakes

- **Missing `await`**, causing commands to run out of order or assertions to compare promises.
- **`browser.pause()` as a wait**; use matchers or `waitFor*` instead.
- **Storing elements across page reloads**, leading to stale element errors; use getters that re-query.
- **Too many `maxInstances`** for the machine, making tests time out.
- **Copying old sync-mode examples**; WebdriverIO v8 and later are async-only.

## Troubleshooting

- **Session not created / driver mismatch**: update WebdriverIO so it can fetch a matching driver, or check the Grid capabilities.
- **Element not interactable**: wait with `waitForClickable`, or check for overlays.
- **Appium service fails to start**: confirm Appium 2 and the needed driver (for example UiAutomator2) are installed.
- **TypeScript cannot find `browser` or `$` types**: make sure `@wdio/globals/types` is listed in `tsconfig.json` types.

## Key takeaways summary

WebdriverIO brings the WebDriver standard to JavaScript and TypeScript with a full-featured runner. Configure it in `wdio.conf`, use `$`/`$$` with stable selectors, rely on retrying matchers instead of pauses, and reuse the same skills for mobile with Appium.
