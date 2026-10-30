---
slug: cross-browser-testing
title: Cross-Browser Testing
summary: Learn why the same web page can behave differently in Chrome, Safari, Firefox and Edge, how to choose a browser and device matrix from real usage data, and how to run checks manually and with Playwright across rendering engines.
level: beginner
duration: 35
tags: [cross-browser, compatibility, web, playwright, responsive]
objectives:
  - Explain rendering engines and why browsers differ
  - Build a browser and device matrix based on users and risk
  - Recognise typical cross-browser defects in layout, JavaScript, forms and media
  - Run the same automated test in Chromium, Firefox and WebKit
prerequisites:
  - Basic HTML and CSS awareness
  - Compatibility and installation testing
related: [compatibility-and-installation-testing, testing-multi-browser-and-network-issues, playwright-with-typescript, device-and-os-coverage-strategy, accessibility-testing-fundamentals]
references:
  - title: MDN Web Docs — Cross browser testing
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing
  - title: Playwright — Browsers
    url: https://playwright.dev/docs/browsers
  - title: Selenium documentation
    url: https://www.selenium.dev/documentation/
  - title: W3C WebDriver specification
    url: https://www.w3.org/TR/webdriver2/
  - title: web.dev — Baseline
    url: https://web.dev/baseline
interview:
  - q: How do you decide which browsers to test?
    a: I start with data, the product's own analytics showing which browsers, versions, operating systems and screen sizes real users have, plus any contractual support policy. I cover the engines, Chromium, Gecko and WebKit, because engine differences cause most bugs. The most-used combinations get full regression, less common ones get smoke tests, and anything below an agreed threshold is documented as unsupported. Mobile Safari matters a lot because every iOS browser has historically used WebKit.
  - q: Why is testing in Chrome and Edge alone not enough?
    a: Both are built on Chromium, so they share the Blink rendering engine and V8 JavaScript engine. They catch few differences between each other. Firefox uses Gecko and Safari uses WebKit, which implement CSS, form controls, dates and media differently. Covering one browser per engine finds far more defects than several Chromium browsers.
  - q: What kinds of defects do you typically find in cross-browser testing?
    a: Layout differences from CSS support or default styles, JavaScript features or APIs missing in one engine, date and number input controls that look and behave differently, font rendering and text overflow, video and audio codec support, cookie and storage restrictions, especially Safari's tracking prevention, and touch versus mouse event differences on mobile.
practice:
  - "Open a page from a demo app you run locally in Chrome, Firefox and Safari or WebKit. Note three visible differences."
  - "Write a browser matrix for a fictional shop whose analytics show 60% Chrome, 25% Safari on iOS, 10% Edge and 5% Firefox. Decide what gets full regression versus a smoke test."
  - "Configure a Playwright project for chromium, firefox and webkit and run one login test in all three."
takeaways:
  - Browsers differ mainly by engine, so cover Chromium, Gecko and WebKit.
  - Choose the matrix from real user data and risk, and document what is unsupported.
  - Mobile Safari is a common source of unique defects.
  - Automate repeatable checks across engines; use manual testing for visual and touch behaviour.
  - Check web feature support on MDN or Baseline before blaming the browser.
quiz:
  - id: xbr-q1
    type: single
    topic: cross-browser-testing
    difficulty: beginner
    prompt: Which pair of browsers shares the same rendering engine?
    options: ["Chrome and Firefox", "Chrome and Edge", "Safari and Firefox", "Edge and Safari"]
    answer: [1]
    explanation: Current Edge and Chrome are both built on Chromium with the Blink engine. Firefox uses Gecko and Safari uses WebKit, so those pairs differ.
  - id: xbr-q2
    type: scenario
    topic: cross-browser-testing
    difficulty: intermediate
    prompt: You have time to test in only three browsers. Users are mostly on Chrome, Edge and iPhone Safari, with a few on Firefox. Which set finds the most engine-specific defects?
    options: ["Chrome, Edge, Opera", "Chrome, iPhone Safari, Firefox", "Chrome, Edge, Brave", "Edge, Opera, Chrome on Android"]
    answer: [1]
    explanation: Chrome, Safari and Firefox cover Blink, WebKit and Gecko. The other options are all or mostly Chromium-based, so they would miss WebKit and Gecko issues.
  - id: xbr-q3
    type: truefalse
    topic: cross-browser-testing
    difficulty: beginner
    prompt: Resizing a desktop browser window is a complete substitute for testing on real mobile devices.
    options: ["True", "False"]
    answer: [1]
    explanation: Resizing checks responsive layout but not touch input, the on-screen keyboard, mobile Safari's engine behaviour or device performance. Use emulation early and real devices for important journeys.
  - id: xbr-q4
    type: code-output
    topic: cross-browser-testing
    difficulty: intermediate
    prompt: With this Playwright config and two test files of three tests each, how many test runs does `npx playwright test` perform?
    code: |
      projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
      ]
    codeLanguage: typescript
    options: ["3", "6", "9", "18"]
    answer: [3]
    explanation: Each of the 6 tests runs once per project, so 6 x 3 = 18. 6 would be a single project, and 9 confuses files with tests.
---

## Beginner-friendly explanation

Imagine three printers that all receive the same document. One prints the margins slightly wider, another substitutes a font, and the third cannot print a particular colour. The document is the same; the printers interpret it differently.

Browsers are like those printers. They read the same HTML, CSS and JavaScript but can show and run them a little differently. Cross-browser testing checks that your users get a working, good-looking page whichever browser they use.

## Technical explanation

### Rendering engines

| Browser | Rendering engine | JavaScript engine |
|---|---|---|
| Chrome, Edge, Opera, Brave | Blink (Chromium) | V8 |
| Firefox | Gecko | SpiderMonkey |
| Safari | WebKit | JavaScriptCore |

On iOS, Apple has historically required all browsers to use WebKit, so Chrome on iPhone behaves much like Safari. Rules have begun to change in some regions, so check the current situation for your market.

### Where differences come from

- **CSS support and defaults:** newer layout features, default margins on form controls, scrollbar styles.
- **JavaScript and Web APIs:** a feature available in one engine but not yet in another.
- **Form controls:** date pickers, number inputs and autofill look and behave differently.
- **Media:** supported video and audio formats.
- **Privacy features:** limits on third-party cookies and storage, especially in Safari and Firefox.
- **Input:** touch, hover and on-screen keyboards on mobile.

### The browser matrix

A matrix lists the browser, version, operating system and viewport combinations you support and how deeply you test each.

| Combination | Share (from analytics) | Test depth |
|---|---|---|
| Chrome latest, Windows | High | Full regression, automated |
| Safari, iOS latest | High | Full regression, real device for key flows |
| Edge latest, Windows | Medium | Smoke test |
| Firefox latest | Low | Automated smoke on Gecko |

Check whether a feature is safe to use with MDN's compatibility tables or web.dev Baseline.

```mermaid
flowchart TD
  A[Analytics and support policy] --> B[Pick one browser per engine]
  B --> C[Add top mobile combos]
  C --> D[Assign test depth]
  D --> E[Automate across engines]
  E --> F[Manual visual and touch checks]
```

## Code examples

A Playwright configuration that runs every test in all three engines:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

Note that Playwright's WebKit build is close to Safari but is not the Safari app, so confirm important flows on real Apple devices.

## Expected output

```text
Running 8 tests using 4 workers
  ✓ [chromium] › login.spec.ts:3:5 › user can log in
  ✓ [firefox] › login.spec.ts:3:5 › user can log in
  ✘ [webkit] › login.spec.ts:3:5 › user can log in
  ✓ [mobile-safari] › login.spec.ts:3:5 › user can log in
```

A failure in only one engine is a strong hint of a cross-browser defect rather than a broken test.

## Real-world example

A travel booking team built a date field using the native date input. In Chrome it showed a calendar picker, and their automated tests filled it with a typed value. On an older Safari version in their supported matrix, the field behaved as plain text, users typed dates in different formats and searches failed. Analytics had shown a large share of iPhone users, but the team had only tested in Chromium. Adding a WebKit project and a real-device check caught the issue, and the team replaced the input with a consistent date picker.

## Common mistakes

- **Testing several Chromium browsers** and calling it cross-browser coverage.
- **Ignoring mobile Safari**, often the second-largest audience.
- **Choosing browsers by personal preference** instead of analytics.
- **Expecting pixel-identical rendering.** Small font differences are normal; broken layout or function is not.
- **Never revisiting the matrix** as usage changes.

## Troubleshooting

- **Test fails only in one engine.** Reproduce manually there, check the console and MDN compatibility data.
- **Locators behave differently.** Prefer role-based locators over brittle CSS tied to layout.

## Key takeaways summary

Cover each rendering engine, pick combinations from real data, automate across engines and keep real devices for what emulation cannot show. See also [testing multi-browser and network issues](/learn/real-world-scenarios/testing-multi-browser-and-network-issues).
