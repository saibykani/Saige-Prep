---
slug: test-architecture-and-system-design
title: Test Architecture and System Design
summary: Design a test platform rather than a pile of scripts - layered frameworks, test data services, ephemeral environments, parallel execution, results storage, reporting and flaky-test management - and answer system-design interview questions confidently.
level: advanced
duration: 45
tags: [test-architecture, system-design, frameworks, sdet]
objectives:
  - Describe the layers of a maintainable test framework and what belongs in each
  - Design test data, environment and execution services for many teams
  - Explain how sharding, isolation and results storage enable fast, trustworthy feedback
  - Structure an answer to a test-platform system-design interview question
prerequisites:
  - Experience building automated tests in at least one framework
  - CI/CD concepts and Docker basics
related: [test-pyramid-and-strategy, automation-design-patterns, page-object-model, parallel-execution, flaky-test-reduction, reporting-and-logging, docker-for-testers]
references:
  - title: Ham Vocke, The Practical Test Pyramid (martinfowler.com)
    url: https://martinfowler.com/articles/practical-test-pyramid.html
  - title: Selenium Grid documentation
    url: https://www.selenium.dev/documentation/grid/
  - title: Testcontainers
    url: https://testcontainers.com/
  - title: GitHub Actions documentation
    url: https://docs.github.com/en/actions
interview:
  - q: "System design: design a test automation platform for 20 product teams sharing a microservice system."
    a: I would start with requirements - how fast feedback must be, which test types run where, how many runs per day, and who owns what. Then I would describe layers. Teams write tests in their own repos using a shared core library that provides API clients, UI page objects, configuration and reporting hooks. A test data service creates and cleans data through APIs rather than shared fixtures. Ephemeral environments per pull request run the changed service with its dependencies in containers and stubs for the rest. A CI orchestration layer shards suites across runners and a browser grid. Every run publishes structured results to a central store, which feeds dashboards, flaky-test detection and quarantine with owners. I would close with trade-offs such as cost of ephemeral environments versus contention on shared ones.
  - q: What layers would you put in a UI automation framework and why?
    a: Tests at the top read like business scenarios. Below them, a domain or task layer expresses user actions such as placing an order. Then page objects or screen components that know locators and interactions. Then a driver layer that wraps WebDriver or Playwright with waits, logging and screenshots. Cross-cutting services handle configuration, test data and reporting. Each layer depends only on the one below, so a locator change touches one page object, and a switch of driver library touches only the driver layer.
  - q: How would you manage flaky tests at scale?
    a: Detect them with data - a test that both passes and fails on the same commit is flaky by definition. Store every result centrally so flake rate per test is visible. Quarantine flaky tests out of the blocking gate but keep them running, assign an owner and a deadline, and track the quarantine size as a health metric. Retries can be used to collect evidence, but a retried pass should still be recorded as a flake rather than a clean pass. Fix root causes such as missing waits, shared data, ordering dependencies and environment instability.
practice:
  - "Draw the architecture of your current test setup as boxes and arrows. Mark single points of failure and places where tests share state."
  - "Design a test data service API with at least three endpoints (create user, create order, clean up). Describe how each test gets isolated data."
  - "Write a 10-minute answer outline for designing a test platform for a mobile banking app, including trade-offs."
takeaways:
  - Treat test infrastructure as a product with layers, interfaces and owners.
  - Isolate tests through data created per test and ephemeral or containerised environments.
  - Shard suites across runners and a browser grid, and size by measured duration.
  - Store results centrally; reporting, trends and flake detection all depend on it.
  - In system-design answers, clarify requirements first, then layers, then trade-offs.
quiz:
  - id: sdet-arch-q1
    type: single
    topic: test-architecture-and-system-design
    difficulty: intermediate
    prompt: In a layered UI framework, a button's locator changes. Where should the change be made in a well-designed framework?
    options:
      - "In every test that clicks the button"
      - "In the page object or component that owns that element"
      - "In the driver wrapper"
      - "In the CI pipeline configuration"
    answer: [1]
    explanation: Locators belong to the page or component layer, so one change fixes every test. Tests that hold locators directly are the maintenance problem layering is meant to solve; the driver layer should not know about specific pages.
  - id: sdet-arch-q2
    type: scenario
    topic: test-architecture-and-system-design
    difficulty: advanced
    prompt: Parallel runs fail randomly because tests share the same seeded user account. What is the best architectural fix?
    options:
      - "Run tests serially"
      - "Add retries to every test"
      - "Have each test create its own data through a test data API or builder, and clean it up afterwards"
      - "Reseed the database before each pipeline"
    answer: [2]
    explanation: Per-test data removes the shared state that makes parallel tests interfere. Serial runs and retries hide the problem at the cost of speed; reseeding per pipeline still leaves tests within one run colliding.
  - id: sdet-arch-q3
    type: truefalse
    topic: test-architecture-and-system-design
    difficulty: intermediate
    prompt: A test that passes and fails on the same commit with no code change is flaky, even if it passes on retry.
    options: ["True", "False"]
    answer: [0]
    explanation: Non-deterministic outcome on identical code is the definition of flakiness. A pass on retry does not make the test reliable; it should be recorded as a flake.
  - id: sdet-arch-q4
    type: multiple
    topic: test-architecture-and-system-design
    difficulty: advanced
    prompt: Which components are typically needed for central flaky-test management? Select all that apply.
    options:
      - "A store of individual test results per run and commit"
      - "A quarantine mechanism that removes a test from the blocking gate while it keeps running"
      - "Unlimited automatic retries that report only the final status"
      - "Ownership and deadlines for quarantined tests"
    answer: [0, 1, 3]
    explanation: Detection needs history, quarantine protects the gate without losing signal, and ownership drives fixes. Unlimited retries that report only the final status erase the evidence needed to detect flakiness.
---

## Beginner-friendly explanation

Writing one test is like cooking one meal at home. Running thousands of tests for many teams, many times a day, is like running a restaurant chain. You now need standard recipes, a supply chain for ingredients, kitchens that can be cleaned and reused, enough stoves to cook in parallel, and a way to find out which dish keeps getting sent back.

**Test architecture** is designing that restaurant chain for tests. It is the step from "I can automate a test" to "I can build the system that lets everyone test well".

## Technical explanation

A test platform has several concerns. Naming them is half of a good system-design answer.

| Concern | Responsibility | Typical building blocks |
|---|---|---|
| **Test code layers** | Readable tests, reusable actions, stable interactions | Tests, domain/task layer, page objects or API clients, driver wrapper |
| **Test data** | Isolated, realistic data on demand | Builders, factories, a test data API, synthetic data, cleanup jobs |
| **Environments** | Somewhere consistent to run | Containers, ephemeral per-PR environments, stubs and service virtualisation |
| **Execution** | Run fast and in parallel | CI orchestration, sharding, runner pools, browser or device grid |
| **Results** | Durable record of every result | JUnit XML or similar ingested into a results store |
| **Reporting** | Turn results into decisions | Per-run reports, trends, dashboards, notifications |
| **Reliability** | Keep the signal trustworthy | Flake detection, quarantine, ownership, retry policy |

```mermaid
flowchart TB
  subgraph Code["Test code"]
    T["Tests (scenarios)"] --> D["Domain / task layer"]
    D --> P["Page objects and API clients"]
    P --> W["Driver wrapper: waits, logs, screenshots"]
  end
  CI["CI orchestrator: sharding and scheduling"] --> T
  D --> TD["Test data service"]
  W --> G["Browser grid / device farm"]
  W --> ENV["Ephemeral environment: service under test plus containers and stubs"]
  TD --> ENV
  G --> ENV
  T --> R["Results store"]
  R --> REP["Reports and dashboards"]
  R --> FL["Flake detection and quarantine"]
  FL --> CI
```

### Key design decisions

- **Isolation over sharing.** Every test creates the data it needs (through APIs, not the UI) and does not depend on order. This is what makes parallelism safe.
- **Ephemeral versus shared environments.** Ephemeral environments remove contention and drift but cost more compute and setup time; shared environments are cheaper but need locking, data partitioning and strict ownership.
- **Stubs at the edges.** Third-party systems (payment providers, email) are replaced with stubs in most runs; a small, separate suite checks the real integration.
- **Sharding by duration.** Splitting by historical test duration balances shards far better than splitting by file count.
- **Structured results.** Results stored with test id, commit, environment, duration, outcome and attempt number make flake detection and trend reporting possible.
- **Retry policy.** Retries may gather evidence, but a pass after a failure is recorded as a flake, not a clean pass.

## Real-world example

A company's checkout area had grown to several teams, each with its own copy of a UI framework. Fixing a wait helper meant changing five repositories, and every team used the same shared staging accounts, so parallel runs collided. An SDET group extracted a shared core library (driver wrapper, configuration, reporting), introduced a small test data service with endpoints to create customers and orders with unique identifiers, and moved results from per-job HTML reports into a central store. With that history they could list tests whose outcome changed without a code change, quarantine them visibly, and give each one an owning team. The work was mostly infrastructure; very few tests were rewritten.

This is a generic scenario illustrating a common pattern, not a specific organisation.

## Step-by-step walkthrough

How to answer "Design a test platform for..." in an interview:

1. **Clarify requirements.** Number of teams and tests, feedback-time target, test types, platforms (web, mobile, API), constraints (budget, compliance).
2. **State quality goals** for the platform itself: fast, isolated, reliable, observable, easy to adopt.
3. **Draw the layers** of test code and the shared services around them.
4. **Explain data and environment strategy**, including isolation.
5. **Explain execution**: where tests run, how they are sharded, how the grid scales.
6. **Explain results, reporting and flake management.**
7. **Discuss trade-offs and evolution**: what you would build first, what you would buy versus build, and what you would measure.

## Code examples

A minimal test data builder that calls an API so each test gets unique, isolated data (TypeScript with Playwright's request fixture):

```typescript
import { test, expect, APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";

async function createCustomer(api: APIRequestContext, tier = "GOLD") {
  const email = `qa+${randomUUID()}@example.test`;
  const res = await api.post("/api/test-data/customers", { data: { email, tier } });
  expect(res.ok()).toBeTruthy();
  return (await res.json()) as { id: string; email: string };
}

test("gold customer gets free delivery", async ({ request }) => {
  const customer = await createCustomer(request);
  const quote = await request.get(`/api/delivery-quote?customerId=${customer.id}`);
  expect((await quote.json()).price).toBe(0);
});
```

The `/api/test-data` endpoints are an example of a test-only API exposed in non-production environments; your system will need its own equivalent.

## Expected output

Run with several workers, each test gets a different customer, so there are no collisions:

```text
Running 1 test using 1 worker
  ✓  gold customer gets free delivery (412ms)
  1 passed
```

Timing will vary. If the data endpoint is unavailable, the `expect(res.ok())` assertion fails in the setup helper, which points directly to the data service rather than to the feature under test.

## Common mistakes

- **Designing tools before requirements.** Start from feedback time, scale and risks.
- **Shared mutable test data**, the most common root cause of flaky parallel runs.
- **One giant framework that every test must inherit from**, making change risky. Prefer small composable libraries.
- **Reports with no history.** Without stored results you cannot see trends or flakes.
- **Hiding flakiness with silent retries.**
- **Ignoring cost.** Ephemeral environments and large grids are not free; state the trade-off.

## Troubleshooting

- **Shards finish at very different times.** Balance by recorded duration and isolate slow outliers.
- **Grid sessions queue.** Measure concurrency needs, add nodes or reduce UI test count by pushing coverage down.
- **Teams bypass the shared library.** Make it easier to use than to avoid: good docs, templates and fast support.

## Key takeaways summary

Test architecture is systems thinking applied to quality. Layer the code, isolate the data, make environments reproducible, scale execution horizontally, and store every result so reports and flake management are based on evidence. In interviews, clarify requirements, sketch the layers, and finish with trade-offs.
