---
slug: cypress-fundamentals
title: Cypress fundamentals
summary: Learn how Cypress runs tests inside the browser, how its command queue and retry-ability work, how to select elements and intercept network calls, and the architectural trade-offs to know before choosing it.
level: intermediate
duration: 40
tags: [cypress, javascript, web-automation, e2e]
objectives:
  - Install Cypress and run tests in open and run modes
  - Explain the asynchronous command queue and retry-ability
  - Write tests with stable selectors, assertions and cy.intercept
  - Describe Cypress's architectural trade-offs
prerequisites:
  - Basic JavaScript
  - Locator strategies
related: [playwright-with-typescript, webdriverio-fundamentals, locator-strategies, test-doubles-and-mocking, flaky-test-reduction]
references:
  - title: Cypress documentation
    url: https://docs.cypress.io/
  - title: Cypress documentation — Best practices
    url: https://docs.cypress.io/app/core-concepts/best-practices
  - title: Cypress documentation — Retry-ability
    url: https://docs.cypress.io/app/core-concepts/retry-ability
interview:
  - q: Why can't you write const text = cy.get('h1').text() in Cypress?
    a: "Cypress commands do not execute immediately and do not return values. They are enqueued and run later in order, returning chainables. To use a value you chain .then(), .invoke('text') with .should(), or use aliases. Assertions chained with .should() also benefit from retry-ability."
  - q: What is retry-ability in Cypress?
    a: "Queries such as cy.get, cy.find and cy.contains are retried together with the assertions chained after them until the assertions pass or the default timeout of four seconds expires. Actions such as click are not retried as a whole, although Cypress waits for the element to be actionable first."
  - q: What are Cypress's main limitations compared with WebDriver-based tools?
    a: "Tests are written in JavaScript or TypeScript only. A test runs inside one browser tab, so multi-tab flows need workarounds, and visiting different origins in one test requires cy.origin. Browser support covers Chrome-family browsers, Firefox and experimental WebKit, but not Safari itself. In exchange you get fast feedback, time-travel debugging and built-in network stubbing."
practice:
  - "Install Cypress in a project, scaffold an end-to-end spec and run it with npx cypress open."
  - "Add data-cy attributes to a login form and write a test that uses only them."
  - "Use cy.intercept to stub a product list with a fixture and assert the UI renders it."
takeaways:
  - Cypress commands are queued and run asynchronously; they do not return values.
  - Queries and their assertions retry automatically until timeout.
  - Use dedicated data-cy or data-testid attributes for selectors.
  - cy.intercept spies on and stubs network requests.
  - Know the single-tab, JavaScript-only trade-offs before choosing it.
quiz:
  - id: cyfu-q1
    type: code-output
    topic: cypress-fundamentals
    difficulty: intermediate
    prompt: In what order are the messages logged to the browser console?
    code: |
      it('order', () => {
        cy.log('A');
        console.log('B');
        cy.then(() => console.log('C'));
      });
    codeLanguage: javascript
    options: ["B, then C (A appears in the Command Log)", "C, then B", "B only", "C only"]
    answer: [0]
    explanation: "console.log('B') runs synchronously while the test function enqueues commands. The cy commands run afterwards in order, so C prints later. cy.log writes to the Cypress Command Log, not the browser console."
  - id: cyfu-q2
    type: single
    topic: cypress-fundamentals
    difficulty: beginner
    prompt: Which selector does the Cypress best-practices guide recommend?
    options: ["cy.get('.btn.btn-large')", "cy.get('[data-cy=submit]')", "cy.get('button').eq(3)", "cy.get('#main > div > button')"]
    answer: [1]
    explanation: "Dedicated data-* attributes are isolated from styling and structure changes. Classes, positions and deep CSS paths break when the design changes."
  - id: cyfu-q3
    type: truefalse
    topic: cypress-fundamentals
    difficulty: beginner
    prompt: cy.get('.toast').should('contain', 'Saved') keeps retrying the query until the toast contains Saved or the timeout expires.
    options: ["True", "False"]
    answer: [0]
    explanation: "The query and its chained assertion are retried together, by default for up to four seconds."
  - id: cyfu-q4
    type: scenario
    topic: cypress-fundamentals
    difficulty: intermediate
    prompt: A test needs the orders API to return an empty list so it can check the 'No orders yet' message. What should you use?
    options: ["cy.wait(5000)", "cy.intercept('GET', '/api/orders', { body: [] })", "Delete all orders in production", "cy.request to the real API"]
    answer: [1]
    explanation: "cy.intercept can stub a response deterministically. Waiting does not change data, and deleting real data is unsafe. cy.request calls the API but does not alter what the page receives."
---

## Beginner-friendly explanation

Most automation tools are like a remote control: they sit outside the TV and send button presses through a cable. **Cypress** is more like someone sitting inside the TV, right next to the picture. Because it runs inside the browser alongside your web app, it can see everything immediately, record each step, and let you "rewind" to see what the page looked like at any moment.

There is one surprising rule for beginners: when you write a Cypress command, it does not happen straight away. Cypress writes it on a to-do list, then works through the list in order. Once you understand that, the rest of Cypress feels natural.

## Technical explanation

### Architecture

The Cypress app launches a browser and runs your spec code in the same run loop as the application under test, with a Node.js process behind it for tasks such as file access and network proxying. Supported browsers are Chrome-family (Chrome, Chromium, Edge, Electron), Firefox, and experimental WebKit.

### The command queue

`cy.*` calls enqueue commands and return a **chainable**, not a value. Commands run serially after the test function returns. Use `.then()` to work with yielded values, and aliases (`.as('name')`) to reuse them.

### Retry-ability

**Queries** (`get`, `find`, `contains`, `its`, ...) re-run with their chained `.should()` assertions until they pass or `defaultCommandTimeout` (4 seconds) expires. **Actions** (`click`, `type`) wait for actionability but are not themselves retried. **Non-query commands** like `cy.request` are not retried.

### Network control

`cy.intercept()` spies on or stubs HTTP requests made by the app. Combined with `cy.wait('@alias')`, it waits for a specific request rather than for an arbitrary time.

```mermaid
flowchart LR
  S[Spec function runs] --> Q[Commands added to queue]
  Q --> R[Runner executes commands in order]
  R --> G["Query + assertion: retry until pass or timeout"]
  R --> A["Action: wait until actionable, then act"]
  R --> N["cy.intercept: proxy stubs or records traffic"]
```

## Real-world example

A front-end team building a single-page booking app wanted developers to write UI tests themselves. Cypress fitted because the team already worked in JavaScript, the interactive runner showed each step with snapshots, and `cy.intercept` let them test error states like "no rooms available" without seeding a database. They kept a small suite of separate API tests for back-end behaviour and used Cypress for UI flows only.

## Step-by-step walkthrough

1. In a Node.js project run `npm install cypress --save-dev`.
2. Run `npx cypress open`, choose E2E Testing, and let Cypress scaffold `cypress.config.js` and a support folder.
3. Set `baseUrl` in the config.
4. Add `data-cy` attributes to the elements your tests use.
5. Write a spec in `cypress/e2e/`.
6. Run headlessly in CI with `npx cypress run`.

## Code examples

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
});
```

```javascript
// cypress/e2e/login.cy.js
describe('login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('valid user reaches the dashboard', () => {
    cy.get('[data-cy=email]').type('demo@example.test');
    cy.get('[data-cy=password]').type(Cypress.env('DEMO_PASSWORD'), { log: false });
    cy.get('[data-cy=submit]').click();

    cy.location('pathname').should('eq', '/dashboard');
    cy.contains('h1', 'Welcome').should('be.visible');
  });

  it('shows an empty state when there are no orders', () => {
    cy.intercept('GET', '/api/orders', { statusCode: 200, body: [] }).as('orders');
    cy.visit('/orders');
    cy.wait('@orders');
    cy.get('[data-cy=empty-orders]').should('have.text', 'No orders yet');
  });
});
```

Working with a value through `.then()`:

```javascript
cy.get('[data-cy=total]').invoke('text').then((text) => {
  const amount = Number(text.replace(/[^0-9.]/g, ''));
  expect(amount).to.be.greaterThan(0);
});
```

A reusable custom command in `cypress/support/commands.js`:

```javascript
Cypress.Commands.add('login', (email, password) => {
  cy.session([email], () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type(email);
    cy.get('[data-cy=password]').type(password, { log: false });
    cy.get('[data-cy=submit]').click();
    cy.location('pathname').should('eq', '/dashboard');
  });
});
```

`cy.session` caches and restores the login between tests, which speeds suites up.

## Expected output

`npx cypress run` prints a table per spec:

```text
  login
    ✓ valid user reaches the dashboard
    ✓ shows an empty state when there are no orders

  2 passing
```

## Common mistakes

- **Treating commands as synchronous**, for example assigning `cy.get()` results to variables.
- **Using `cy.wait(3000)`** instead of waiting on an aliased request or an assertion.
- **Brittle selectors** based on classes or DOM position.
- **Logging in through the UI in every test** instead of `cy.session` or an API login.
- **Mixing `async/await` with cy commands**; Cypress chains are not promises.
- **Expecting multi-tab support**; remove `target="_blank"` or assert the link instead.

## Troubleshooting

- **"Timed out retrying after 4000ms"**: the element never matched; check the selector in the runner's selector playground or increase the timeout for that query only.
- **Cross-origin error**: use `cy.origin()` for steps on another domain.
- **Element detached from DOM**: the app re-rendered; re-query rather than storing elements.
- **Environment variables undefined**: pass with `--env` or `CYPRESS_` prefixed variables and read with `Cypress.env()`.

## Key takeaways summary

Cypress runs inside the browser with a queued, retrying command model. Learn the queue, rely on retry-ability and `cy.intercept` instead of waits, use dedicated `data-cy` selectors, and weigh its single-tab, JavaScript-only design against your project's needs.
