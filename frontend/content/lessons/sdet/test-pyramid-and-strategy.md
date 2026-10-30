---
slug: test-pyramid-and-strategy
title: The Test Pyramid and Test Strategy
summary: Learn what the test pyramid and the testing trophy actually recommend, the trade-offs between test levels, and how to turn those models into a concrete automation strategy for a real system.
level: intermediate
duration: 35
tags: [test-strategy, test-pyramid, automation, architecture]
objectives:
  - Describe the test pyramid, the testing trophy and the ice-cream cone anti-pattern
  - Compare test levels on speed, cost, isolation and confidence
  - Decide the lowest level at which a given risk can be tested
  - Write a short automation strategy for a service-based application
prerequisites:
  - Unit, integration and end-to-end testing concepts
  - Basic automation experience
related: [unit-and-component-testing, integration-testing, system-and-end-to-end-testing, contract-testing, test-strategy-vs-test-plan, test-architecture-and-system-design]
references:
  - title: Ham Vocke, The Practical Test Pyramid (martinfowler.com)
    url: https://martinfowler.com/articles/practical-test-pyramid.html
  - title: Martin Fowler, TestPyramid
    url: https://martinfowler.com/bliki/TestPyramid.html
  - title: ISTQB Certified Tester Foundation Level (test levels and the test pyramid)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
interview:
  - q: Explain the test pyramid and its main message.
    a: The pyramid, popularised by Mike Cohn, shows many fast, isolated tests at the bottom such as unit tests, fewer integration or service tests in the middle, and very few end-to-end UI tests at the top. The message is not exact ratios but two rules - write tests at different granularities, and the higher and broader a test is, the fewer of them you should have, because they are slower, more brittle and harder to diagnose. Each risk should be tested at the lowest level that can genuinely catch it.
  - q: How does the testing trophy differ from the pyramid?
    a: The testing trophy, proposed by Kent C. Dodds for front-end JavaScript, puts static analysis at the base and gives the largest share to integration tests, with fewer unit and end-to-end tests. Its argument is that tests resembling how the software is used give more confidence per test, and modern tooling has made integration tests fast. Both models agree that end-to-end tests should be few; they differ on how much weight to give isolated unit tests versus integrated ones.
  - q: "System design: draft a test strategy for a web shop with a React front end and five backend services."
    a: Static checks such as types and linting run on every commit. Each service has unit tests for business rules and component tests that exercise the service through its API with its database in a container and other services stubbed. Consumer-driven contract tests protect the API boundaries between services and with the front end. The front end has component tests with mocked network calls. A small set of end-to-end journeys - browse, add to cart, checkout, payment failure - runs against a deployed environment, plus post-deploy smoke tests. Performance, security and accessibility checks are risk-driven and scheduled. I would review the mix using escaped defects and flaky-test data rather than a fixed ratio.
practice:
  - "Count your project's tests by level. Draw the actual shape and compare it with the pyramid. Which tests are in the wrong place?"
  - "Pick five end-to-end tests and, for each, decide whether its main risk could be covered by a unit, component or contract test instead."
  - "Write a one-page automation strategy for an application you know, stating what is tested at each level and why."
takeaways:
  - The pyramid's message is many small fast tests, fewer integrated tests, very few end-to-end tests.
  - The trophy weights integration tests more heavily and adds static analysis as the base.
  - Test each risk at the lowest level that can genuinely catch it.
  - An ice-cream cone of mostly manual and UI tests gives slow, brittle feedback.
  - Models are guides, not quotas; adjust the mix based on your architecture and defect data.
quiz:
  - id: sdet-pyramid-q1
    type: single
    topic: test-pyramid-and-strategy
    difficulty: beginner
    prompt: According to the test pyramid, which tests should you have the fewest of?
    options: ["Unit tests", "Service or API tests", "End-to-end UI tests", "Static analysis checks"]
    answer: [2]
    explanation: End-to-end UI tests sit at the narrow top because they are the slowest, most brittle and hardest to diagnose. They are valuable but should be kept to critical journeys.
  - id: sdet-pyramid-q2
    type: scenario
    topic: test-pyramid-and-strategy
    difficulty: intermediate
    prompt: A discount calculation has 40 combinations of customer tier, coupon and basket value. Where should most of these combinations be tested?
    options:
      - "As 40 end-to-end UI tests"
      - "As data-driven unit or component tests of the pricing logic, with one or two end-to-end checks that the discount appears in checkout"
      - "Only manually before each release"
      - "Only in production monitoring"
    answer: [1]
    explanation: The combinations are business logic, which is cheapest and most precisely tested at unit or component level. One or two end-to-end checks confirm the wiring. Forty UI tests would be slow and fragile and add little extra confidence.
  - id: sdet-pyramid-q3
    type: truefalse
    topic: test-pyramid-and-strategy
    difficulty: beginner
    prompt: The test pyramid prescribes an exact ratio such as 70 percent unit, 20 percent integration and 10 percent UI tests.
    options: ["True", "False"]
    answer: [1]
    explanation: Ratios like 70/20/10 circulate widely but are rules of thumb, not part of the model. The pyramid describes a shape and a principle; the right mix depends on the system.
  - id: sdet-pyramid-q4
    type: multiple
    topic: test-pyramid-and-strategy
    difficulty: intermediate
    prompt: Which are signs of the ice-cream cone anti-pattern? Select all that apply.
    options:
      - "Most regression coverage comes from UI automation and manual testing"
      - "The pipeline takes hours and failures are hard to diagnose"
      - "Business rules are covered by fast unit tests"
      - "Few or no unit tests exist"
    answer: [0, 1, 3]
    explanation: The inverted shape - heavy UI and manual testing on top of few unit tests - produces slow, brittle feedback. Fast unit coverage of business rules is the opposite of the anti-pattern.
---

## Beginner-friendly explanation

Imagine checking a new car. You could test every bolt, wire and sensor on a workbench before assembly: quick, cheap, and if something is wrong you know exactly which part. You could also take the finished car for a test drive: realistic and convincing, but slow, and if the car shudders you do not immediately know why.

Good car makers do both, but they do a **lot** of part checks and **a few** test drives. The **test pyramid** is that idea for software: many small, fast checks at the bottom, a few realistic, expensive ones at the top.

## Technical explanation

The **test pyramid**, popularised by Mike Cohn and discussed in depth in Ham Vocke's "The Practical Test Pyramid" on martinfowler.com, has two core rules: write tests at different granularities, and the more high-level and integrated a test is, the fewer of them you should have.

| Level | Scope | Speed | Diagnosis | Confidence about the whole system |
|---|---|---|---|---|
| Unit | One function or class, dependencies replaced | Milliseconds | Precise | Low |
| Component / service | One service through its API, real database in a container, other services stubbed | Seconds | Good | Medium |
| Contract | Agreement between consumer and provider | Seconds | Precise at boundaries | Medium for integration risk |
| Integration | Several real components together | Seconds to minutes | Moderate | Medium to high |
| End-to-end | Whole deployed system through the UI or public API | Minutes | Poor | High |

The **testing trophy**, proposed by Kent C. Dodds for front-end JavaScript, adds **static analysis** (types, linters) as the base and gives integration tests the largest share. Both models agree on a small number of end-to-end tests; they disagree on how much isolation is worth.

The **ice-cream cone** is the anti-pattern: a wide top of manual and UI tests over a thin base of unit tests. Feedback is slow, flaky and expensive to maintain.

```mermaid
flowchart TB
  E["End-to-end: few critical journeys"] --> I["Integration, component and contract tests"]
  I --> U["Unit tests: many, fast, isolated"]
  U --> S["Static analysis: types, lint"]
```

### Strategy is about risk, not shape

A **test strategy** decides which risks are covered, at which level, by whom and when. The guiding principle is: **test each risk at the lowest level that can genuinely catch it.**

- Calculation and validation rules: unit tests.
- Database queries, serialisation, configuration: component or integration tests with real dependencies.
- Service-to-service compatibility: contract tests.
- "Can a user actually buy something?": a few end-to-end journeys.
- Usability, new-feature learning, odd interactions: exploratory testing.

Higher levels catch defects that lower levels cannot, such as misconfiguration, wiring errors and browser issues. A pyramid with no top is as risky as an ice-cream cone.

## Real-world example

A travel-booking team had about 600 Selenium tests and few unit tests. The suite took most of a night to run and failed for a different reason every morning. A test engineer analysed what each UI test was really checking. Most verified fare rules and validation messages, which they rewrote as data-driven unit and API tests. Integration between the booking service and the payment service moved to contract tests. Around forty journeys stayed in the browser. Feedback moved from overnight to within the pull request, and when an end-to-end test failed, it usually meant a real wiring problem.

The numbers here describe a hypothetical team; the pattern, not the count, is the point.

## Step-by-step walkthrough

1. **List the risks** for the product: business rules, integrations, data, UI, non-functional.
2. **Map the architecture**: services, UI, data stores, third parties.
3. **For each risk, choose the lowest effective level** and note why.
4. **Choose the few end-to-end journeys** that represent the highest business value.
5. **Decide where each level runs** in the pipeline (see [CI/CD for test engineers](/learn/sdet/ci-cd-for-test-engineers)).
6. **Define ownership**: developers usually own unit tests; testers and developers share the rest.
7. **Review the mix regularly** using escaped defects, flaky rate and pipeline duration.

## Code examples

The same rule, tested at two levels. The unit test checks many combinations in milliseconds; the end-to-end test checks only that the result reaches the user.

```java
// Unit level: many combinations, fast and precise
@ParameterizedTest
@CsvSource({ "GOLD, 100.00, 90.00", "SILVER, 100.00, 95.00", "NONE, 100.00, 100.00" })
void appliesTierDiscount(Tier tier, BigDecimal basket, BigDecimal expected) {
    assertEquals(expected, Pricing.total(tier, basket));
}
```

```typescript
// End-to-end level (Playwright): one journey proves the wiring
test("gold customer sees discounted total at checkout", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByTestId("order-total")).toHaveText("90.00");
});
```

## Expected output

The unit test reports three separate passing cases in well under a second; the Playwright test reports one passing journey after several seconds of browser work. If a developer breaks the GOLD rate, the unit test names the exact tier and values, while the end-to-end test only shows a wrong total on a page.

```text
appliesTierDiscount(Tier, BigDecimal, BigDecimal)
  [1] GOLD, 100.00, 90.00      FAILED  expected: <90.00> but was: <95.00>
  [2] SILVER, 100.00, 95.00    PASSED
  [3] NONE, 100.00, 100.00     PASSED
```

## Common mistakes

- **Treating ratios as targets.** "70/20/10" is folklore, not a requirement.
- **Duplicating the same check at every level**, which multiplies maintenance without adding confidence.
- **Testing business rules through the UI** because "that is how users see it".
- **Dropping end-to-end tests entirely** and missing configuration and wiring defects.
- **Mocking everything in unit tests** so they pass while the integrated system fails.
- **A strategy that only lists tools** instead of risks, levels, owners and exit criteria.

## Troubleshooting

- **Developers do not write unit tests.** Pair on the first few, make them part of the definition of done, and show how fast they run.
- **Contract tests feel heavy.** Start with one high-traffic consumer-provider pair.
- **Leaders want the end-to-end count to grow as a sign of progress.** Report risk coverage and escaped defects instead of test counts.

## Key takeaways summary

The pyramid and trophy are thinking tools. Use them to ask, for every risk, "what is the cheapest test that would catch this?" Keep a solid base, a meaningful middle and a small, valuable top, and revisit the mix with real defect and pipeline data.
