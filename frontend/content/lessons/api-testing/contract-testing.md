---
slug: contract-testing
title: Contract Testing
summary: Contract testing checks that an API provider and its consumers agree on requests and responses, without running a full end-to-end environment. Learn consumer-driven contracts with Pact, provider verification and where schema checks fit.
level: advanced
duration: 40
tags: [api, contract-testing, pact, microservices]
objectives:
  - Explain what a contract is and the problem contract testing solves
  - Describe the consumer-driven contract flow - consumer test, pact file, provider verification
  - Distinguish contract tests from functional, schema and end-to-end tests
  - Use a broker and can-i-deploy to gate releases
prerequisites:
  - REST principles
  - JSON schema validation
  - Integration testing
related: [json-schema-validation, integration-testing, api-testing-in-ci, rest-principles, test-doubles-and-mocking]
references:
  - title: Pact documentation
    url: https://docs.pact.io/
  - title: OpenAPI Specification
    url: https://spec.openapis.org/oas/latest.html
  - title: JSON Schema
    url: https://json-schema.org/
interview:
  - q: What is consumer-driven contract testing?
    a: The consumer writes tests against a mock provider that describe the requests it makes and the parts of the responses it relies on. Running those tests produces a contract file, a pact. The pact is shared, often through a Pact Broker, and the real provider replays each interaction against itself in its own build to verify it still satisfies every consumer. It catches breaking changes before deployment without a shared end-to-end environment.
  - q: How is contract testing different from end-to-end testing?
    a: End-to-end tests deploy everything together and drive real flows, which is slow, flaky and finds integration issues late. Contract tests check each side of an integration in isolation against an agreed contract, so they are fast and pinpoint which side broke the agreement. They don't test business logic or the full flow, so you still need a small number of end-to-end tests.
  - q: Does a contract test check the provider's business logic?
    a: No. It checks the shape and semantics the consumer depends on - status codes, required fields, types - for given provider states. Whether the provider calculates the right discount is a functional test on the provider side. Over-specifying contracts with exact values beyond what the consumer needs makes them brittle.
  - q: What is can-i-deploy?
    a: A Pact Broker command that checks whether a given version of an application has successful verification results with the versions of its integration partners already in the target environment. Put in the pipeline before deploy, it blocks a release that would break a consumer or rely on a provider feature not yet deployed.
practice:
  - "List the fields your web app actually uses from one API response. That list is the start of a consumer contract."
  - "Work through the Pact documentation's getting-started guide for your language and generate a pact file."
  - "Describe what happens in each pipeline when a provider renames a field that a consumer uses."
takeaways:
  - A contract is the agreed set of requests and the response parts consumers rely on.
  - Consumer-driven - the consumer's tests generate the pact; the provider verifies it.
  - Provider states set up data so each interaction can be verified.
  - Contract tests are fast and isolate the breaking side, but do not replace functional tests.
  - Use a broker and can-i-deploy to stop breaking releases.
quiz:
  - id: apicontract-q1
    type: single
    topic: contract-testing
    difficulty: intermediate
    prompt: In consumer-driven contract testing with Pact, who generates the contract file?
    options: ["The provider's unit tests", "The consumer's tests running against a Pact mock provider", "A manual tester using Postman", "The API gateway"]
    answer: [1]
    explanation: The consumer's tests define expected interactions against a mock, and Pact writes them to a pact file. The provider then verifies that file.
  - id: apicontract-q2
    type: scenario
    topic: contract-testing
    difficulty: advanced
    prompt: The provider team renames "customerName" to "fullName". The web consumer still reads "customerName". Where is this caught first in a well-set-up contract testing pipeline?
    options: ["In production monitoring", "In the provider's build, when pact verification fails for the web consumer's interaction", "In the consumer's unit tests", "It cannot be caught"]
    answer: [1]
    explanation: Provider verification replays the consumer's pact against the changed provider. The response lacks customerName, so verification fails before the change is deployed.
  - id: apicontract-q3
    type: truefalse
    topic: contract-testing
    difficulty: intermediate
    prompt: A passing contract test proves the provider returns the correct business values, such as the right order total.
    options: ["True", "False"]
    answer: [1]
    explanation: Contract tests check structure and agreed semantics. Correct calculations need functional tests on the provider. Contracts usually use matchers (type, regex) rather than exact values.
  - id: apicontract-q4
    type: multiple
    topic: contract-testing
    difficulty: advanced
    prompt: Which statements about schema validation versus consumer-driven contracts are true? Select all that apply.
    options: ["A schema describes everything a provider may return", "A consumer contract describes only what a specific consumer uses", "A schema check alone tells you which consumers break when a field is removed", "Both can run without a full end-to-end environment"]
    answer: [0, 1, 3]
    explanation: Schemas describe the provider's whole interface; consumer contracts capture actual usage, which is what tells you whether removing a field breaks anyone. Both are lightweight checks.
---

## Beginner-friendly explanation

Imagine a restaurant kitchen (the **provider**) and a delivery app (the **consumer**). The app shows customers each dish's name, price and photo. One day the kitchen decides to rename "price" to "cost" on its menu feed. The kitchen's own tests pass — the data is all there. The app breaks instantly, showing no prices.

A **contract** is a written agreement: "When the app asks for the menu, the kitchen will reply with name, price and photo for each dish." **Contract testing** checks both sides keep that agreement, separately and quickly, so neither side can break the other by surprise.

## Technical explanation

In a system of many services, each **integration** has a consumer (the caller) and a provider (the API). Traditional ways to test integrations:

| Approach | Strength | Weakness |
|---|---|---|
| End-to-end tests | Realistic | Slow, flaky, need everything deployed, fail late |
| Mocks in consumer tests | Fast | The mock can drift from the real provider |
| Schema validation | Checks response shape | Doesn't know what each consumer actually uses |
| Contract tests | Fast, isolated, both sides checked against the same file | Doesn't test business logic |

**Consumer-driven contract testing** (the approach of [Pact](https://docs.pact.io/)) works like this:

1. The consumer's test describes an **interaction**: given a **provider state** ("order 42 exists"), when the consumer sends `GET /orders/42`, the response has status 200 and a body with `id` (number) and `status` (string).
2. Pact runs a **mock provider** that responds as described; the consumer's real client code calls it. If the consumer's code works, Pact writes the interactions to a **pact file** (JSON).
3. The pact is published to a **Pact Broker** (or PactFlow) with the consumer's version.
4. The provider's build fetches pacts for all its consumers and **verifies** them: it sets up each provider state, replays each request against the real provider, and compares responses with the expectations.
5. Results go back to the broker. **`can-i-deploy`** asks: are this version and the versions already in the target environment verified as compatible?

```mermaid
sequenceDiagram
  participant C as Consumer CI
  participant B as Pact Broker
  participant P as Provider CI
  C->>C: Run consumer tests against Pact mock
  C->>B: Publish pact (consumer v1.4)
  B-->>P: Webhook - pact changed
  P->>B: Fetch pacts for provider
  P->>P: Set provider states, replay requests, compare
  P->>B: Publish verification results
  C->>B: can-i-deploy consumer v1.4 to prod?
  B-->>C: Yes / No
```

**Matchers** keep contracts flexible: "any integer", "a string matching this date regex", "an array with at least one element like this". Specifying exact values the consumer doesn't care about makes contracts brittle.

**Provider-driven** or schema-based approaches start from the provider's OpenAPI spec instead. They are useful, especially for public APIs with unknown consumers, but can't tell you which real consumer depends on a field.

## Real-world example

An e-commerce company had a mobile app, a web app and a partner portal calling an Orders service. The Orders team removed a `legacyStatus` field that "nobody used". The schema was updated, all Orders tests passed, and it shipped. The partner portal broke for two days.

After adopting consumer-driven contracts, each consumer published what it used. Removing a field now ran provider verification against all three pacts. The partner portal's pact failed in the Orders build, the team saw exactly which consumer and interaction would break, and coordinated the change.

## Step-by-step walkthrough

1. **Pick one integration** with frequent breakage as the pilot.
2. **Consumer side:** write a Pact test for each request the consumer makes, using matchers, and run it to produce the pact file.
3. **Set up a broker** and publish the pact from consumer CI with the git commit as the version.
4. **Provider side:** add a verification test that loads pacts from the broker and implements each provider state (seed data).
5. **Publish verification results** from provider CI.
6. **Add `can-i-deploy`** before each deployment step, and record deployments to the broker.
7. **Grow coverage** integration by integration.

## Code examples

A consumer-side interaction with Pact JS (the API shape varies slightly between Pact versions; check the docs for yours):

```javascript
const { PactV3, MatchersV3 } = require("@pact-foundation/pact");
const { like, integer } = MatchersV3;

const provider = new PactV3({ consumer: "web-app", provider: "orders-service" });

it("gets an order", () => {
  provider
    .given("order 42 exists")
    .uponReceiving("a request for order 42")
    .withRequest({ method: "GET", path: "/orders/42" })
    .willRespondWith({
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { id: integer(42), status: like("PAID") },
    });

  return provider.executeTest(async (mockServer) => {
    const order = await getOrder(mockServer.url, 42); // real client code
    expect(order.status).toBe("PAID");
  });
});
```

## Common mistakes

- **Treating contract tests as functional tests** and asserting exact business values.
- **Contracts that list every field** instead of what the consumer uses.
- **Skipping provider states**, so verification depends on whatever data happens to exist.
- **Publishing pacts but never gating deployment** with can-i-deploy.
- **Dropping all end-to-end tests.** Keep a thin set for critical journeys.

## Key takeaways summary

Contract testing turns an integration agreement into an executable file both sides test against. Consumers generate pacts from real client code, providers verify them on every build, and a broker gates deployment, so breaking changes are caught in minutes rather than in production.
