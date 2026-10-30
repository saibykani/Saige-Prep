---
slug: accessibility-automation
title: Accessibility automation
summary: Add automated accessibility checks to your test suites with axe-core. Learn what tools can and cannot detect, integrate axe with Playwright, Cypress and Selenium, triage violations by WCAG rule, and combine automation with manual testing.
level: intermediate
duration: 40
tags: [accessibility, a11y, axe-core, wcag, automation]
objectives:
  - Explain what automated accessibility testing can and cannot catch
  - Run axe-core scans in Playwright, Cypress and Selenium
  - Read a violation report and map it to WCAG success criteria
  - Integrate accessibility checks into CI without blocking on noise
prerequisites:
  - Accessibility testing fundamentals
  - Playwright with TypeScript or Selenium basics
related: [accessibility-testing-fundamentals, screen-reader-and-keyboard-testing, playwright-with-typescript, cypress-fundamentals, ci-cd-for-test-engineers]
references:
  - title: W3C — WCAG overview
    url: https://www.w3.org/WAI/standards-guidelines/wcag/
  - title: Deque — axe accessibility tools
    url: https://www.deque.com/axe/
  - title: axe-core on GitHub
    url: https://github.com/dequelabs/axe-core
  - title: Playwright documentation — Accessibility testing
    url: https://playwright.dev/docs/accessibility-testing
interview:
  - q: Can automated tools make a site fully accessible?
    a: "No. Automated rules reliably catch issues such as missing alternative text, insufficient colour contrast, missing form labels, invalid ARIA and duplicate ids, but many WCAG criteria need human judgement: whether alt text is meaningful, whether focus order is logical, whether content makes sense with a screen reader. Automation is a fast safety net; manual keyboard and screen reader testing remain essential."
  - q: How would you add accessibility checks to an existing Playwright suite?
    a: "Install @axe-core/playwright, and in key page tests run new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze() after the page reaches a meaningful state, then assert the violations array is empty. Start with critical pages, record known issues with tickets, and exclude only specific, documented cases rather than disabling rules globally."
  - q: What does a typical axe violation contain?
    a: "A rule id such as color-contrast, an impact level (minor, moderate, serious, critical), a description and help URL, tags mapping it to WCAG criteria, and the list of affected nodes with selectors, HTML snippets and a failure summary explaining how to fix each one."
practice:
  - "Add an axe scan to a Playwright test of your login page and fix or ticket each violation."
  - "Scan a page after opening a modal dialog, and compare the results with a scan of the page without it."
  - "For one violation, find the matching WCAG success criterion and explain it in your own words."
takeaways:
  - axe-core is the most widely used open-source accessibility rules engine.
  - Automation catches a subset of WCAG issues; manual testing is still required.
  - Scan pages in meaningful states, including after dynamic content appears.
  - Use WCAG tags to scope rules to your target conformance level.
  - Track exceptions explicitly instead of disabling rules wholesale.
quiz:
  - id: a11ya-q1
    type: truefalse
    topic: accessibility-automation
    difficulty: beginner
    prompt: A page with zero axe-core violations fully conforms to WCAG 2.2 AA.
    options: ["True", "False"]
    answer: [1]
    explanation: "Automated rules cover only part of WCAG. Criteria such as meaningful alternative text, logical focus order and understandable content need human evaluation."
  - id: a11ya-q2
    type: multiple
    topic: accessibility-automation
    difficulty: intermediate
    prompt: Which issues can axe-core typically detect automatically?
    options: ["Insufficient text colour contrast", "Form input without an accessible label", "Whether an image's alt text accurately describes it", "Duplicate id attributes used by ARIA references"]
    answer: [0, 1, 3]
    explanation: "Contrast, missing labels and duplicate ids referenced by ARIA are computable from the DOM. Judging whether alt text is accurate requires a human to look at the image."
  - id: a11ya-q3
    type: debugging
    topic: accessibility-automation
    difficulty: intermediate
    prompt: An axe scan passes, but the menu that appears after clicking 'Account' has unlabeled buttons. Why did the scan miss them?
    code: |
      await page.goto('/home');
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
      await page.getByRole('button', { name: 'Account' }).click();
    codeLanguage: typescript
    options: ["axe cannot detect unlabeled buttons", "The scan ran before the menu was opened, so the menu was not in the DOM", "AxeBuilder needs XPath", "Playwright blocks axe in menus"]
    answer: [1]
    explanation: "axe analyses the DOM at the moment it runs. Scan again after the interaction that reveals dynamic content. Missing button names are a standard axe rule."
  - id: a11ya-q4
    type: single
    topic: accessibility-automation
    difficulty: beginner
    prompt: Which tags restrict an axe scan to WCAG 2.0 and 2.1 level A and AA rules?
    options: ["['best-practice']", "['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']", "['experimental']", "['section508'] only"]
    answer: [1]
    explanation: "axe tags rules by standard and level. best-practice and experimental rules are not WCAG requirements, and section508 refers to a different regulation."
---

## Beginner-friendly explanation

A building inspector carries tools: a tape measure for door widths, a level for ramp slopes. These tools quickly prove some rules are broken. But no tape measure can tell whether the signs make sense to a visitor or whether a wheelchair user can actually find the lift. The inspector still has to walk through the building.

**Accessibility automation** gives your tests a tape measure for websites. A tool like **axe-core** scans the page and flags problems such as text that is too faint, buttons with no name for screen readers, or form fields with no label. It is fast and runs on every build. But it cannot judge everything, so people still test with a keyboard and a screen reader.

## Technical explanation

### Standards

The **Web Content Accessibility Guidelines (WCAG)**, published by the W3C, define testable success criteria at levels A, AA and AAA. WCAG 2.2 is the current W3C Recommendation; many laws and policies reference level AA.

### axe-core

**axe-core** is an open-source JavaScript rules engine by Deque. It runs inside the page, inspects the DOM and computed styles, and returns:

- `violations`: rules that failed, each with `id`, `impact`, `help`, `helpUrl`, `tags` and `nodes` (target selectors and HTML).
- `passes`, `incomplete` (needs human review) and `inapplicable`.

Rules are tagged, for example `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` and `best-practice`, so you can scope scans.

### Integrations

| Tool | Package |
|---|---|
| Playwright | `@axe-core/playwright` (`AxeBuilder`) |
| Selenium (Java) | `com.deque.html.axe-core:selenium` (`AxeBuilder`) |
| WebdriverIO | `@axe-core/webdriverio` |
| Cypress | community plugin `cypress-axe` (`cy.injectAxe`, `cy.checkA11y`) |
| Command line / CI | `@axe-core/cli`, Lighthouse accessibility audit |

```mermaid
flowchart LR
  T[UI test reaches state] --> I[Inject axe-core into page]
  I --> A["Run rules on DOM (scoped by tags)"]
  A --> R{Violations?}
  R -- No --> P[Test passes]
  R -- Yes --> F["Fail with rule id, impact, selectors, help URL"]
  F --> M[Fix or ticket; manual review for incomplete items]
```

## Real-world example

A public-sector services portal had to meet WCAG AA. The team added axe scans to Playwright tests for its ten most-used pages, scoped to WCAG A and AA tags. The first run reported mostly contrast problems in the design system's grey text and unlabeled icon buttons. Fixing those in shared components cleared the violations on every page at once. Monthly manual audits with keyboard and screen readers continued, and found issues like a confusing focus order in a multi-step form that no automated rule could flag.

## Step-by-step walkthrough

1. Choose critical pages and states: home, login, forms, checkout, open dialogs.
2. Install the axe integration for your framework.
3. Scan after the page reaches the state you care about.
4. Scope to the WCAG level your organisation targets.
5. Print violations in a readable format and fail the test if any exist.
6. For known issues, exclude a specific selector or rule with a ticket reference, never globally.
7. Review `incomplete` results manually and schedule keyboard and screen reader testing.

## Code examples

Playwright with TypeScript:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('login page has no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

test('account menu is accessible when open', async ({ page }) => {
  await page.goto('/home');
  await page.getByRole('button', { name: 'Account' }).click();

  const results = await new AxeBuilder({ page })
    .include('#account-menu')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

Cypress with `cypress-axe`:

```javascript
// cypress/support/e2e.js
import 'cypress-axe';

// cypress/e2e/a11y.cy.js
it('home page has no detectable a11y violations', () => {
  cy.visit('/');
  cy.injectAxe();
  cy.checkA11y(null, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
});
```

Selenium Java with `axe-core/selenium`:

```java
Results results = new AxeBuilder()
    .withTags(List.of("wcag2a", "wcag2aa"))
    .analyze(driver);
Assert.assertTrue(results.violationFree(), results.getViolations().toString());
```

## Expected output

A failing Playwright assertion shows each violation, for example (shortened):

```text
- Expected  - 0
+ Received  + 12

+   Object {
+     "id": "color-contrast",
+     "impact": "serious",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "nodes": Array [ { "target": Array [ ".hint-text" ] } ],
+   },
```

## Common mistakes

- **Treating zero violations as "accessible"**.
- **Scanning only on page load**, missing modals, menus and error messages.
- **Disabling rules globally** to make the build green.
- **Including `best-practice` rules** in a hard gate without agreeing on them.
- **Ignoring `incomplete` results**, which need a human decision.
- **Fixing symptoms page by page** instead of in shared components.

## Troubleshooting

- **Too many violations to fix at once**: gate on new violations or on `critical` and `serious` impact first, and track the backlog.
- **Contrast false positives on gradients or images**: axe reports these as incomplete when it cannot compute; check manually.
- **Scan results differ between runs**: the page was still loading; wait for a stable state before scanning.
- **Iframes not scanned**: confirm your integration supports frames and that they are same-origin or allowed.

## Key takeaways summary

Automated accessibility checks are cheap, fast and catch a valuable share of WCAG issues on every build. Scan meaningful states with axe-core, scope to your WCAG level, fix problems in shared components, and keep manual keyboard and screen reader testing as part of the definition of done.
