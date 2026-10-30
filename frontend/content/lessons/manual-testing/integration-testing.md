---
slug: integration-testing
title: Integration Testing
summary: Integration testing checks the interfaces and interactions between components or systems. Learn component versus system integration testing, big-bang and incremental strategies, and the interface defects this level is built to catch.
level: beginner
duration: 35
tags: [test-levels, integration-testing, istqb, interfaces]
objectives:
  - Distinguish component integration testing from system integration testing
  - Compare big-bang, top-down, bottom-up and sandwich integration strategies
  - Identify typical interface defects such as mismatched data formats and wrong assumptions about units
  - Plan integration tests that focus on the interactions rather than re-testing each component
prerequisites:
  - Unit and component testing
  - Basic understanding of APIs or how modules call each other
related: [unit-and-component-testing, system-and-end-to-end-testing, contract-testing, microservices-testing, test-doubles-and-mocking]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 2.2.1, Test levels)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Pact documentation (consumer-driven contract testing)
    url: https://docs.pact.io/
  - title: MDN Web Docs, HTTP
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
interview:
  - q: What is the difference between component integration testing and system integration testing?
    a: Component integration testing focuses on the interactions and interfaces between components inside one system, such as a service layer calling a repository, and is often done by developers. System integration testing focuses on interfaces between whole systems, packages or external services, such as our shop calling a third-party payment provider. System integration testing often happens after system testing and depends on external environments we do not control, which makes it slower and riskier to schedule.
  - q: Why is big-bang integration risky?
    a: In big-bang integration all components are combined at once and tested together. When something fails, the defect could be in any of many interfaces, so isolating it is slow. It also delays integration testing until every component is ready, which pushes defect discovery late. Incremental strategies add components a few at a time so each failure is localised to the newly added interface.
  - q: What kinds of defects do you expect to find in integration testing?
    a: Interface defects. Examples are incorrect or missing data, mismatched field names or formats, wrong units such as cents versus whole currency, different assumptions about time zones or encodings, incorrect sequencing or timing of calls, unhandled error responses and timeouts, and failures in communication between components. These are things each component's own tests can miss because each side is correct by its own reading of the interface.
practice:
  - "An order service calls an inventory service and a payment service. Draw the interfaces and write one positive and two negative integration tests for each."
  - "Choose top-down or bottom-up integration for a mobile app whose UI is ready but whose backend is not. Justify the choice and name the stubs or drivers you need."
  - "List five assumptions two teams could disagree on when exchanging a 'date of birth' field, and how you would test each."
takeaways:
  - Integration testing targets interfaces and interactions, not the internal logic of each component.
  - Component integration is inside one system; system integration is between systems and external services.
  - Incremental integration localises failures; big-bang integration makes them hard to isolate.
  - Stubs support top-down integration; drivers support bottom-up integration.
  - Test error paths across interfaces, such as timeouts, malformed responses and retries, not only the happy path.
quiz:
  - id: integ-q1
    type: single
    topic: integration-testing
    difficulty: beginner
    prompt: Your web shop sends orders to a third-party courier's API. Testing that exchange is an example of which test level?
    options: ["Component testing", "Component integration testing", "System integration testing", "Acceptance testing"]
    answer: [2]
    explanation: The interface is between your system and an external system, which is system integration testing. Component integration testing would be about interfaces between components inside your own system.
  - id: integ-q2
    type: single
    topic: integration-testing
    difficulty: intermediate
    prompt: In top-down incremental integration, lower-level components that are not yet available are replaced by what?
    options: ["Drivers", "Stubs", "Production data", "Beta users"]
    answer: [1]
    explanation: Top-down integration starts from the top-level components, which call lower ones, so the missing called components are replaced by stubs. Bottom-up integration needs drivers to call the low-level components.
  - id: integ-q3
    type: scenario
    topic: integration-testing
    difficulty: intermediate
    prompt: The checkout service sends an amount of 1999 to the payment service, which charges 1999.00 dollars instead of 19.99. Both components pass their own unit tests. What is the most likely cause?
    options: ["A defect in the payment service's rounding logic", "An interface defect: the two sides assume different units for the amount", "A performance defect under load", "An environment configuration defect in the browser"]
    answer: [1]
    explanation: Each side is internally correct by its own assumption (cents versus whole currency), which is the classic interface defect integration testing exists to find. Rounding logic would not explain a factor of 100.
  - id: integ-q4
    type: multiple
    topic: integration-testing
    difficulty: beginner
    prompt: Which are typical integration-level defects? Select all that apply.
    options: ["Mismatched date formats between two services", "An off-by-one error inside a single function", "An unhandled timeout from a downstream API", "Fields sent in a different order than the receiver expects in a fixed-format file"]
    answer: [0, 2, 3]
    explanation: Format mismatches, unhandled downstream errors and sequencing or layout disagreements are interface defects. An off-by-one error inside one function is a component-level defect.
---

## Beginner-friendly explanation

Imagine two builders working on a bridge from opposite riverbanks. Each builder's half is solid, measured and inspected. But when they meet in the middle, one side is ten centimetres higher than the other. Nothing was wrong with either half; the problem is where they **join**.

**Integration testing** checks the joins. Software components are often built by different people, teams or companies. Each piece can pass its own tests and still fail when connected, because the two sides understood the connection differently. Integration testing deliberately exercises those connections to find such disagreements early.

## Technical explanation

ISTQB CTFL v4.0 defines two integration test levels:

| | Component integration testing | System integration testing |
|---|---|---|
| Focus | Interfaces and interactions between components of one system | Interfaces between systems, packages and external services |
| Example | Order service calling an internal inventory module | Shop calling a third-party payment gateway |
| Typical tester | Developers, sometimes testers | Testers, often with partner teams |
| Timing | After or alongside component testing | Often after system testing, or in parallel with it |
| Main challenge | Many internal interfaces | External environments outside your control |

The **test basis** includes interface specifications, sequence diagrams, API definitions, data-exchange formats and workflows that cross component boundaries.

### Integration strategies

```mermaid
flowchart TB
  UI["UI layer"] --> SVC["Service layer"]
  SVC --> REPO["Repository"]
  SVC --> PAY["Payment adapter"]
  REPO --> DB["Database"]
```

- **Big-bang**: integrate everything at once. Simple to arrange, but failures are hard to localise and testing starts late.
- **Top-down**: start at the UI or top service and add lower layers progressively, using **stubs** for missing lower components. Gives an early skeleton of the workflow.
- **Bottom-up**: start with the lowest components (repository, adapters) and work upwards, using **drivers** to call them. Solid foundations, but the full workflow appears late.
- **Sandwich (hybrid)**: top-down and bottom-up in parallel, meeting in the middle.

Integration should normally be **incremental**, and its order should be planned with the architecture, so that each newly added interface is tested on its own. ISTQB stresses that integration tests should concentrate on the integration itself, not repeat each component's functional tests.

### What to test at an interface

- Data: field names, types, formats, units, encodings, optional versus mandatory fields
- Behaviour: the order of calls, retries, idempotency, transactions spanning components
- Errors: timeouts, error status codes, malformed responses, partner unavailable
- Contracts: does each side still match the agreed interface after a change? [Contract testing](/learn/api-testing/contract-testing) automates this check.

## Real-world example

A retail team integrated a new loyalty-points service with its checkout. Both teams had thorough unit tests. During component integration testing, a tester posted an order with a points redemption and a voucher together. Checkout sent the discounted total; the loyalty service expected the pre-discount total to calculate points. Customers would have earned fewer points than promised.

Nothing in either codebase was "wrong" by its own specification; the interface document simply did not say which total to send. The fix was a clarified contract plus an integration test for every combination of discount type, which now runs on every build.

## Step-by-step walkthrough

1. **Map the interfaces.** List every component or system pair that exchanges data, and the direction of each call.
2. **Collect the interface specification.** API schema, file layout, message format, error codes and agreed units.
3. **Choose an integration order** that matches delivery: top-down if the UI is ready first, bottom-up if the data layer is.
4. **Prepare test doubles** for anything not yet available, and plan when each will be replaced by the real component.
5. **Design tests per interface:** valid data, boundary data, missing and extra fields, error responses, timeouts.
6. **Verify on both sides.** Check what was sent and what was received and stored, not just the screen.
7. **Log interface defects with evidence**: the request, the response, timestamps and correlation ids.

## Code examples

An HTTP-level integration check using `curl`, verifying that the inventory service handles a reservation for an unknown product correctly:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST http://localhost:8081/reservations \
  -H "Content-Type: application/json" \
  -d '{"productId": "DOES-NOT-EXIST", "quantity": 1}'
```

## Expected output

The interface specification says unknown products return `404`. Anything else, especially `500`, is an integration defect because the caller cannot react sensibly:

```text
404
```

## Common mistakes

- **Re-running component tests and calling it integration.** Focus on the data and calls crossing the boundary.
- **Testing only the happy path.** Partners fail, time out and return unexpected payloads; those paths must be tested.
- **Leaving stubs in place too long.** A stub only reflects your assumption about the partner; replace it with the real component as early as possible.
- **Checking only the UI.** Verify the data at the receiving end, for example in the partner's log or database.
- **Ignoring versioning.** An interface that worked last sprint can break when one side upgrades.

## Troubleshooting

- **A failure appears only in the shared test environment.** Compare configuration: endpoint URLs, credentials, feature flags and data seeded on each side.
- **You cannot tell which side is wrong.** Capture the raw request and response, then check both against the written contract. If the contract is silent, that is the defect to raise.
- **A third-party sandbox is unreliable.** Use a stub or service virtualisation for most runs and schedule a smaller set of tests against the real sandbox.

## Key takeaways summary

Integration testing looks at the joins. Separate component integration from system integration, integrate incrementally so each failure points to one interface, and test data formats, sequencing and error handling across every boundary, not just the sunny-day flow.
