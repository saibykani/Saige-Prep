---
slug: flaky-test-reduction
title: Flaky test reduction
summary: A flaky test passes and fails on the same code. Learn the main root causes, how to detect and quarantine flaky tests, and how to fix them properly instead of hiding them with sleeps and blind retries.
level: intermediate
duration: 35
tags: [flaky-tests, stability, automation, ci]
objectives:
  - Define a flaky test and explain why it damages trust in automation
  - Identify the common root causes of flakiness
  - Detect flaky tests with reruns and history
  - Apply fixes and a quarantine policy that do not hide real bugs
prerequisites:
  - Waits and synchronization
  - Parallel execution
related: [waits-and-synchronization, parallel-execution, debugging-failing-tests, test-doubles-and-mocking, locator-strategies]
references:
  - title: Selenium documentation — Waiting strategies
    url: https://www.selenium.dev/documentation/webdriver/waits/
  - title: Playwright documentation — Auto-waiting
    url: https://playwright.dev/docs/actionability
  - title: Playwright documentation — Retries
    url: https://playwright.dev/docs/test-retries
interview:
  - q: How do you handle a flaky test in your suite?
    a: "First confirm it is flaky by rerunning it on the same build and checking history. Then quarantine it so it stops blocking the pipeline, but keep it running and visible with an owner and a ticket. Then find the root cause, usually timing, shared data, order dependency, environment or test-unfriendly product behaviour, and fix that. Retries are at most a temporary signal, never the fix."
  - q: Why is Thread.sleep a poor fix for flakiness?
    a: "A fixed sleep is either too short on a slow run, so the test still fails, or too long on a fast run, wasting time across every execution. It does not express the real condition you are waiting for. An explicit wait on a specific condition is both faster and more reliable."
  - q: Can a flaky test indicate a real product bug?
    a: "Yes. Race conditions, caching bugs, timeouts under load and non-deterministic ordering in the product all appear as intermittent failures. That is why you investigate rather than delete or blindly retry."
practice:
  - "Run one suspicious test 50 times in a loop and record the pass rate."
  - "Find every Thread.sleep in your framework and replace each with an explicit wait on a real condition."
  - "Write a short quarantine policy: who owns a quarantined test, how long it may stay, and how it leaves."
takeaways:
  - A flaky test gives different results on the same code and environment.
  - Common causes are timing, shared state, order, environment and randomness.
  - Quarantine to unblock, but keep ownership and a deadline.
  - Retries hide symptoms; root-cause fixes restore trust.
  - Some flakiness is a real product race condition.
quiz:
  - id: flky-q1
    type: single
    topic: flaky-test-reduction
    difficulty: beginner
    prompt: Which statement best defines a flaky test?
    options: ["A test that always fails", "A test that passes and fails on the same code without any change", "A test that is slow", "A test with no assertions"]
    answer: [1]
    explanation: "Flakiness is non-determinism: the outcome changes without a code change. A test that always fails is consistently broken, which is easier to diagnose."
  - id: flky-q2
    type: debugging
    topic: flaky-test-reduction
    difficulty: intermediate
    prompt: This test fails about 1 in 10 runs in CI with NoSuchElementException. What is the best fix?
    code: |
      driver.findElement(By.id("search")).sendKeys("lamp");
      driver.findElement(By.id("go")).click();
      String first = driver.findElement(By.cssSelector(".result:first-child")).getText();
    codeLanguage: java
    options: ["Add Thread.sleep(5000) before the last line", "Wait explicitly for the first result to be visible before reading it", "Increase the implicit wait to 60 seconds", "Retry the test three times"]
    answer: [1]
    explanation: "Results load asynchronously, so the test must wait for that specific condition. A sleep only guesses the time, a huge implicit wait slows every failing lookup, and retries hide the race."
  - id: flky-q3
    type: multiple
    topic: flaky-test-reduction
    difficulty: intermediate
    prompt: Which are common root causes of flaky UI tests?
    options: ["Asynchronous loading not waited for", "Tests sharing and modifying the same data", "Dependence on test execution order", "Using a clearly named test method"]
    answer: [0, 1, 2]
    explanation: "Timing, shared state and ordering are the classic causes. Naming affects readability, not determinism."
  - id: flky-q4
    type: truefalse
    topic: flaky-test-reduction
    difficulty: beginner
    prompt: Configuring automatic retries is a complete fix for flaky tests.
    options: ["True", "False"]
    answer: [1]
    explanation: "Retries can reduce noise while you investigate, and tools like Playwright report tests that passed only on retry as flaky. But the underlying cause, which may be a product bug, remains."
---

## Beginner-friendly explanation

Imagine a smoke alarm that sometimes beeps when there is no fire. After a few false alarms, people start ignoring it. Then one day there is a real fire, and nobody reacts.

A **flaky test** is that alarm. It passes, then fails, then passes again, with no change to the code. The real damage is not one red build; it is that the team learns to shrug at failures and click "rerun". Once that habit forms, real bugs slip through. Reducing flakiness is about restoring trust, so red means "something is actually wrong".

## Technical explanation

A test is **flaky** when it produces different outcomes for the same code and configuration. It is non-deterministic.

### Root causes

| Category | Example | Typical fix |
|---|---|---|
| Timing / async | Clicking before a button is enabled | Explicit waits on conditions; auto-waiting tools |
| Shared state | Two tests edit the same account | Unique data per test |
| Order dependency | Test B needs data from test A | Each test sets up its own preconditions |
| Environment | Slow shared staging, third-party outage | Stable environments, stubs for external services |
| Randomness / time | Dates near midnight, random data hitting edge cases | Fixed clocks, seeded randomness, logged seeds |
| Brittle locators | Index-based XPath on dynamic lists | Stable attributes such as `data-testid` |
| Resource limits | Too many parallel browsers | Fewer threads or more capacity |
| Product race condition | Double-submit creates two orders | File a bug; this is a real defect |

### Detecting

- **Rerun on the same commit**: if results differ, it is flaky.
- **History**: CI dashboards and Allure history show tests flipping state.
- **Stress runs**: execute one test many times in a loop.
- **Retry reporting**: Playwright Test marks tests that fail then pass on retry as "flaky".

### Quarantine

Move confirmed flaky tests out of the blocking gate into a separate, still-running job, with an owner, a ticket and a time limit.

```mermaid
stateDiagram-v2
  [*] --> Healthy
  Healthy --> Suspected: intermittent failure
  Suspected --> Healthy: real regression found and fixed
  Suspected --> Quarantined: confirmed flaky
  Quarantined --> Healthy: root cause fixed, stable over many runs
  Quarantined --> Deleted: no longer valuable
```

## Real-world example

A logistics team's pipeline was rerun on most merges "because the UI tests are flaky". They tagged every failure with a signature for two weeks. Most came from three causes: a spinner overlay not waited for, a shared "admin" account whose settings tests changed, and a test that assumed today's date was a weekday. Fixing those three removed most of the noise. One remaining intermittent failure turned out to be a real double-submit bug in the order form.

## Step-by-step walkthrough

1. **Collect evidence**: screenshot, logs, timings, environment, for every failure.
2. **Confirm flakiness**: rerun on the same build several times.
3. **Classify the cause** using the table above.
4. **Quarantine** if it blocks others, with an owner and deadline.
5. **Reproduce** locally with a loop, throttled network or CPU, or parallel load.
6. **Fix the root cause**, not the symptom.
7. **Verify** with many consecutive passes before returning it to the gate.

## Code examples

Replacing a sleep with a condition:

```java
// Before: flaky and slow
Thread.sleep(3000);
driver.findElement(By.id("confirm")).click();

// After: waits only as long as needed, for the real condition
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector(".spinner")));
wait.until(ExpectedConditions.elementToBeClickable(By.id("confirm"))).click();
```

Unique data per test:

```java
String email = "user+" + UUID.randomUUID() + "@example.test";
api.createUser(email, "Passw0rd!");
```

Stress-running one Playwright test to measure flakiness:

```bash
npx playwright test tests/checkout.spec.ts --repeat-each=50 --workers=4
```

TestNG can repeat a method with `@Test(invocationCount = 50)` while you investigate.

## Expected output

Playwright summarises outcomes such as:

```text
  48 passed
  2 failed
```

A pass rate below 100 percent on unchanged code confirms flakiness. With retries enabled, tests that fail then pass appear under a separate "flaky" count.

## Common mistakes

- **Adding `Thread.sleep`** to make the failure "go away".
- **Blind global retries** with no reporting of which tests needed them.
- **Deleting the test** without understanding the cause.
- **Quarantine forever**: quarantined tests with no owner never return.
- **Blaming the environment** without evidence.
- **Ignoring product races** that are real bugs.

## Troubleshooting

- **Only fails in CI**: CI machines are often slower; run locally with CPU or network throttling and headless mode.
- **Only fails in parallel**: look for shared data or static state.
- **Only fails at certain times**: check time zones, date boundaries and scheduled jobs.
- **Fails after a specific other test**: run the pair in that order to confirm an order dependency.

## Key takeaways summary

Flaky tests erode trust faster than they waste time. Treat each one as a bug in the test or the product: gather evidence, classify the cause, quarantine with ownership if needed, and fix the root cause. Sleeps and blind retries only postpone the problem.
