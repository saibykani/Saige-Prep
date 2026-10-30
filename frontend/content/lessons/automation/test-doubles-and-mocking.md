---
slug: test-doubles-and-mocking
title: Test doubles and mocking
summary: Replace real dependencies with stand-ins so tests are fast and deterministic. Learn dummies, stubs, spies, mocks and fakes, use Mockito in Java, stub HTTP with WireMock, and avoid over-mocking.
level: intermediate
duration: 40
tags: [mocking, mockito, wiremock, test-doubles, automation]
objectives:
  - Name the five kinds of test double and when each is used
  - Write a unit test with Mockito stubbing and verification
  - Stub an HTTP dependency with WireMock
  - Recognise over-mocking and its risks
prerequisites:
  - Java OOP for test automation
  - JUnit 5 essentials
related: [junit-5-essentials, unit-and-component-testing, contract-testing, microservices-testing, flaky-test-reduction]
references:
  - title: Mockito documentation
    url: https://site.mockito.org/
  - title: WireMock documentation
    url: https://wiremock.org/docs/
  - title: Martin Fowler — Mocks Aren't Stubs
    url: https://martinfowler.com/articles/mocksArentStubs.html
  - title: Playwright documentation — Mock APIs
    url: https://playwright.dev/docs/mock
interview:
  - q: What is the difference between a stub and a mock?
    a: "A stub supplies canned answers so the code under test can run, and the test checks the resulting state. A mock is set up with expectations about how it should be called, and the test verifies those interactions, for example that the email service was called once with this address. Stubs support state verification; mocks support behaviour verification."
  - q: When should you not mock?
    a: "Do not mock the class under test, simple value objects or things you can use cheaply for real. Avoid mocking types you do not own in a way that encodes guesses about their behaviour. Too many mocks make tests mirror the implementation, so refactoring breaks them and real integration bugs slip through; contract and integration tests cover those gaps."
  - q: Why stub a third-party payment API in end-to-end tests?
    a: "The real sandbox may be slow, rate-limited or unavailable, and it is hard to force outcomes such as declined cards or timeouts. A stub with WireMock or a similar tool returns any response on demand, so tests are fast, deterministic and can cover error paths. A smaller set of tests still checks the real integration."
practice:
  - "Write a Mockito test for a service that sends a welcome email, verifying the email client is called exactly once."
  - "Use WireMock to return a 503 from a dependency and assert that your client retries or reports a friendly error."
  - "In Playwright, use page.route to return an empty product list and check the empty-state message."
takeaways:
  - Test double is the umbrella term; mock is one kind.
  - Stubs feed inputs; mocks verify interactions; fakes are lightweight working implementations.
  - Mock at boundaries you control, such as interfaces to external systems.
  - HTTP stubbing makes error paths testable and runs deterministic.
  - Balance mocked tests with integration or contract tests.
quiz:
  - id: tdbl-q1
    type: single
    topic: test-doubles-and-mocking
    difficulty: beginner
    prompt: An in-memory repository that really stores and returns objects, used instead of a database in tests, is which kind of test double?
    options: ["Dummy", "Stub", "Fake", "Spy"]
    answer: [2]
    explanation: "A fake has a working but simplified implementation. A stub only returns pre-programmed answers and does not really store anything."
  - id: tdbl-q2
    type: code-output
    topic: test-doubles-and-mocking
    difficulty: intermediate
    prompt: What does this print?
    code: |
      PriceClient client = mock(PriceClient.class);
      when(client.priceOf("A1")).thenReturn(250);
      System.out.println(client.priceOf("A1") + " " + client.priceOf("B2"));
    codeLanguage: java
    options: ["250 250", "250 0", "250 null", "It throws an exception"]
    answer: [1]
    explanation: "Unstubbed methods on a Mockito mock return default values: 0 for int, false for boolean, null for most objects, and empty collections for collection types. Only A1 was stubbed."
  - id: tdbl-q3
    type: scenario
    topic: test-doubles-and-mocking
    difficulty: intermediate
    prompt: You need to test that checkout shows 'Payment service unavailable' when the payment provider returns HTTP 503. The real sandbox never returns 503 on demand. What should you do?
    options: ["Wait until the sandbox fails naturally", "Stub the payment endpoint with WireMock or route interception to return 503", "Skip the scenario", "Unplug the network cable during the test"]
    answer: [1]
    explanation: "HTTP stubbing lets you trigger the exact error deterministically. Waiting for real failures or cutting the network is unreliable and not repeatable."
  - id: tdbl-q4
    type: truefalse
    topic: test-doubles-and-mocking
    difficulty: beginner
    prompt: A suite where every dependency is mocked proves that the system works when integrated.
    options: ["True", "False"]
    answer: [1]
    explanation: "Mocks encode assumptions about collaborators. If the real API changes, mocked tests still pass. Integration and contract tests are needed to check those assumptions."
---

## Beginner-friendly explanation

When filming a dangerous scene, movies use a **stunt double**: someone who looks enough like the actor for that shot. The double is cheaper, safer and always available, but you would not use them for the close-up.

A **test double** is a stand-in for a real part of the system, such as a payment provider, an email service or a database, used during a test. It lets you test your code quickly and reliably, and lets you create situations that are hard to produce for real, like "the bank is down". The phrase "mocking" is often used loosely for all of this, but there are several kinds of double, each with its own job.

## Technical explanation

The terms come from Gerard Meszaros's *xUnit Test Patterns*, popularised by Martin Fowler's article "Mocks Aren't Stubs".

| Double | What it does | Example |
|---|---|---|
| Dummy | Passed in but never used | `null`-safe placeholder logger |
| Stub | Returns canned answers | Price client always returns 250 |
| Spy | Records calls for later checking, may wrap a real object | Counts emails sent |
| Mock | Pre-programmed with expectations that are verified | Verify `send("a@b.test")` called once |
| Fake | Working but simplified implementation | In-memory repository |

**State verification** checks results after the action (works with stubs and fakes). **Behaviour verification** checks the interactions (mocks and spies).

### Where doubles live

- **Unit level**: Mockito replaces Java collaborators behind interfaces.
- **Service level**: WireMock runs an HTTP server that returns configured responses.
- **UI level**: Playwright `page.route` and Cypress `cy.intercept` intercept browser network calls.

```mermaid
flowchart LR
  T[Test] --> S[OrderService - real]
  S --> P["PaymentClient - stub or mock"]
  S --> R["OrderRepository - fake in-memory"]
  S --> E["EmailClient - mock, verify call"]
```

## Real-world example

A food delivery team's checkout tests called a real payment sandbox and an SMS provider. Runs were slow and failed whenever the sandbox was down, and nobody could test "card declined" reliably. They moved most checkout UI tests to a WireMock stub of the payment API, with scenarios for success, decline and timeout, and verified the SMS client with Mockito in service tests. A small nightly suite still exercised the real sandbox, and contract tests guarded the stubbed responses against API changes.

## Step-by-step walkthrough

1. Identify the boundary: which dependency makes the test slow, flaky or unable to reach an edge case?
2. Make sure your code depends on an interface or a configurable URL, so a double can be swapped in.
3. Pick the double: stub for inputs, mock for verifying calls, fake for richer behaviour.
4. Write the test: arrange the double, act on the real code, assert state or verify interactions.
5. Keep at least one integration or contract test against the real dependency.

## Code examples

Mockito with JUnit 5:

```java
@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock EmailClient email;
    @Mock UserRepository users;
    @InjectMocks RegistrationService service;

    @Test
    void sendsWelcomeEmailOnce() {
        when(users.existsByEmail("asha@example.test")).thenReturn(false);

        service.register("asha@example.test");

        verify(email, times(1)).sendWelcome("asha@example.test");
        verify(users).save(any(User.class));
    }

    @Test
    void rejectsDuplicateEmail() {
        when(users.existsByEmail("asha@example.test")).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> service.register("asha@example.test"));
        verifyNoInteractions(email);
    }
}
```

WireMock stub returning 503 (Java DSL, WireMock 3):

```java
WireMockServer wm = new WireMockServer(8089);
wm.start();
wm.stubFor(post(urlEqualTo("/payments"))
    .willReturn(aResponse().withStatus(503).withBody("{\"error\":\"unavailable\"}")));
// point the application under test at http://localhost:8089, run the test, then wm.stop()
```

Playwright route interception in TypeScript:

```typescript
await page.route('**/api/products', route =>
  route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
);
await page.goto('/shop');
await expect(page.getByText('No products found')).toBeVisible();
```

## Expected output

```text
RegistrationServiceTest > sendsWelcomeEmailOnce() PASSED
RegistrationServiceTest > rejectsDuplicateEmail() PASSED
```

If `sendWelcome` is never called, Mockito fails with a "Wanted but not invoked" message listing the actual interactions.

## Common mistakes

- **Mocking everything**, so tests only prove the code calls what it calls.
- **Mocking the class under test** itself.
- **Verifying every call**, coupling tests to implementation details.
- **Stubs drifting from reality** with no contract tests to catch API changes.
- **Calling every double a mock**, which causes confusion in reviews and interviews.
- **Unnecessary stubbing**: Mockito's strict stubs (default with `MockitoExtension`) report stubs a test never uses.

## Troubleshooting

- **`UnnecessaryStubbingException`**: remove the unused `when(...)` or move it to the test that needs it.
- **Mock returns null or 0**: the arguments did not match the stubbed ones; check `equals` or use matchers like `eq()` and `any()` consistently.
- **Cannot mock a final class or static method**: Mockito 5 uses the inline mock maker by default and supports this, but prefer refactoring to an interface where you can.
- **App still calls the real service**: the base URL is not configurable, or the stub server port differs.

## Key takeaways summary

Test doubles make tests fast, deterministic and able to reach awkward edge cases. Know the difference between stubs, mocks, spies and fakes, mock at boundaries, and keep a few real integration or contract tests so your doubles stay honest.
