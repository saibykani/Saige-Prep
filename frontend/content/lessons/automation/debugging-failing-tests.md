---
slug: debugging-failing-tests
title: Debugging failing tests
summary: A systematic method for finding out why an automated test failed. Read stack traces, decide whether the bug is in the product, the test or the environment, reproduce locally, use breakpoints and traces, and confirm the fix.
level: intermediate
duration: 35
tags: [debugging, troubleshooting, automation, triage]
objectives:
  - Read a stack trace and locate the failing line in your own code
  - Classify a failure as product bug, test bug or environment issue
  - Use breakpoints, logs, screenshots and traces to find the cause
  - Confirm a fix and prevent the same failure returning
prerequisites:
  - Java basics for testers
  - Waits and synchronization
related: [flaky-test-reduction, reporting-and-logging, waits-and-synchronization, root-cause-analysis, writing-a-great-defect-report]
references:
  - title: Selenium documentation — Troubleshooting
    url: https://www.selenium.dev/documentation/webdriver/troubleshooting/
  - title: Playwright documentation — Trace viewer
    url: https://playwright.dev/docs/trace-viewer
  - title: IntelliJ IDEA — Debugging code
    url: https://www.jetbrains.com/help/idea/debugging-code.html
interview:
  - q: A test failed in last night's run. Walk me through what you do.
    a: "I read the failure message and stack trace to find the failing line in our code, then look at the evidence: screenshot, logs, trace, environment and build. I check whether it fails consistently and whether other tests failed the same way, which points to environment. I reproduce locally on the same build, narrow down with breakpoints or extra logging, decide whether it is a product bug, test bug or environment issue, and then fix the test or raise a defect with evidence."
  - q: How do you tell a product bug from a test bug?
    a: "I perform the same steps manually or through the API. If the product misbehaves, it is a product bug and I file it with reproduction steps. If the product behaves correctly, the test is wrong: an outdated locator, a missing wait, a wrong expectation or bad data. Recent commits to the product or the test code also give strong clues."
  - q: What is the difference between a failure and an error in test results?
    a: "In JUnit-style reports, a failure usually means an assertion did not hold, so the product produced an unexpected result. An error means an unexpected exception, such as NoSuchElementException or a NullPointerException, which more often points to the test, its data or the environment. Both need investigating."
practice:
  - "Take a failing test, read its stack trace and write down the first line that belongs to your code."
  - "Set a breakpoint before a failing click, run the test in debug mode and inspect the page in the paused browser."
  - "Record a Playwright trace for a failing test and use the trace viewer to find the step that went wrong."
takeaways:
  - Start from evidence, not guesses.
  - The first stack frame in your own code is usually the place to look.
  - Classify the failure before fixing anything.
  - Reproduce on the same build and environment.
  - After fixing, ask why the failure was hard to diagnose and improve evidence.
quiz:
  - id: dbgf-q1
    type: single
    topic: debugging-failing-tests
    difficulty: beginner
    prompt: A stack trace has thirty lines. Where should you usually start reading?
    options: ["The last line", "The exception message and the first frame that belongs to your own code", "Any line mentioning java.lang", "Only the line count"]
    answer: [1]
    explanation: "The message says what went wrong and the first frame from your package shows where your code triggered it. Deep library frames are rarely where the mistake is."
  - id: dbgf-q2
    type: scenario
    topic: debugging-failing-tests
    difficulty: intermediate
    prompt: Overnight, 140 unrelated UI tests failed with connection timeouts within the same five minutes. What is the most likely classification?
    options: ["140 separate product bugs", "An environment or infrastructure issue", "All locators changed", "The test framework is corrupted"]
    answer: [1]
    explanation: "Many unrelated tests failing the same way at the same time points to a shared dependency such as the environment, network or Grid. Check that first before investigating individual tests."
  - id: dbgf-q3
    type: debugging
    topic: debugging-failing-tests
    difficulty: intermediate
    prompt: "The test fails with: expected [Order placed] but found [Order placed ]. What is the likely cause and fix?"
    options: ["A product crash; file a critical bug", "Trailing whitespace in the UI text; compare trimmed text or fix the label if it is a real defect", "The locator is wrong", "The browser version is too old"]
    answer: [1]
    explanation: "The values differ only by a trailing space. Decide whether that matters to users; usually you normalise with trim(). The locator clearly found the element, so it is not a locator problem."
  - id: dbgf-q4
    type: truefalse
    topic: debugging-failing-tests
    difficulty: beginner
    prompt: If a test passes when rerun, there is nothing to investigate.
    options: ["True", "False"]
    answer: [1]
    explanation: "A pass on rerun means the test is flaky or the product has an intermittent problem. Both deserve investigation."
---

## Beginner-friendly explanation

When a car will not start, a good mechanic does not replace parts at random. They ask questions in order: is the battery dead? Is there fuel? Does the starter click? Each answer narrows the search.

**Debugging a failing test** is the same disciplined questioning. The red result only says "something is wrong". Your job is to find out *what* and *where*: is the product broken, is the test wrong, or was the environment having a bad day? Following the same steps every time makes you fast and keeps you from "fixing" a test that was correctly catching a real bug.

## Technical explanation

### Three possible culprits

| Culprit | Typical signals |
|---|---|
| Product bug | Assertion failure; reproducible manually; recent product change |
| Test bug | `NoSuchElementException`, stale element, wrong expected value, bad data; product works manually |
| Environment | Many unrelated failures at once; timeouts; 502/503 responses; Grid or database down |

### Reading a stack trace

The top line is the exception type and message. Below are frames, most recent call first. Skip framework frames (`org.openqa.selenium`, `org.testng`) and find the first frame in **your** package.

### Tools

- **Evidence**: screenshots, page source, logs, videos, Playwright traces.
- **Breakpoints**: run the test in debug mode in your IDE, pause before the failing line and inspect variables and the live browser.
- **Browser DevTools**: check the element, console errors and network calls in the paused browser.
- **Bisecting**: compare a passing and failing build, or comment out steps until the failure disappears.

```mermaid
flowchart TD
  A[Test failed] --> B[Read message and stack trace]
  B --> C{Many unrelated tests failed together?}
  C -- Yes --> ENV[Check environment, Grid, network]
  C -- No --> D[Inspect evidence: screenshot, logs, trace]
  D --> E{Reproducible on same build?}
  E -- No --> FL[Treat as flaky: see flaky test reduction]
  E -- Yes --> F{Product wrong when done manually?}
  F -- Yes --> BUG[File defect with evidence]
  F -- No --> TB[Fix the test: locator, wait, data, expectation]
```

## Real-world example

A test for applying a discount code started failing with `expected [90.00] but found [100.00]`. The screenshot showed the code accepted but the total unchanged. Doing it manually gave the same result, and the API response showed the discount missing from the cart total. The tester filed a defect with the screenshot, API response and build number; developers traced it to a rounding refactor merged the day before. The test was correct, and "fixing" it by changing the expected value would have shipped the bug.

## Step-by-step walkthrough

1. **Read the failure**: exception type, message, failing line in your code.
2. **Look at the scope**: one test, one class, or many unrelated tests?
3. **Check the evidence**: screenshot, page source, logs, trace, environment, build version.
4. **Reproduce** on the same build locally or against the same environment.
5. **Narrow down** with breakpoints, extra logging or running steps manually.
6. **Classify**: product, test or environment.
7. **Act**: file a defect, fix the test, or escalate the environment.
8. **Prevent**: improve evidence, add a wait, tighten a locator, or add a unit test.

## Code examples

A typical stack trace (trimmed):

```text
org.openqa.selenium.NoSuchElementException: no such element: Unable to locate element:
  {"method":"css selector","selector":"[data-testid='apply-coupon']"}
    at org.openqa.selenium.remote.RemoteWebDriver.findElement(RemoteWebDriver.java:...)
    at com.example.pages.CartPage.applyCoupon(CartPage.java:42)
    at com.example.tests.CouponTests.tenPercentCoupon(CouponTests.java:27)
```

The first frame in our code is `CartPage.java:42`: the coupon button was not found. Next questions: did the locator change, or had the cart not loaded yet?

Adding diagnostic logging temporarily:

```java
log.debug("URL before apply: {}", driver.getCurrentUrl());
log.debug("Buttons on page: {}", driver.findElements(By.tagName("button")).size());
```

Recording and opening a Playwright trace:

```bash
npx playwright test tests/cart.spec.ts --trace on
npx playwright show-trace test-results/<test-folder>/trace.zip
```

The trace viewer shows each action, DOM snapshots before and after, console and network.

## Expected output

After classifying, you should be able to write one sentence such as: "Test bug: the cart loads asynchronously and `applyCoupon` clicked before the button rendered; fixed by waiting for the button to be clickable." If you cannot write that sentence, you have not finished debugging.

## Common mistakes

- **Changing the expected value** to match the actual result without checking the product.
- **Rerunning until green** and moving on.
- **Reading only the last line** of the stack trace.
- **Debugging on a different build** from the one that failed.
- **Leaving debug code** such as sleeps or extra prints in the final fix.
- **Not sharing findings**, so the next person repeats the investigation.

## Troubleshooting

- **Cannot reproduce locally**: match browser version, screen size, headless mode, test data and environment URL with CI.
- **Breakpoint never hit**: you are running in Run, not Debug mode, or a different test is executing.
- **Element exists in DevTools but not found**: check for iframes, shadow DOM or a new window.
- **Passes in debug mode only**: pausing gives the page time to load, a strong sign of a missing wait.

## Key takeaways summary

Debugging is a method, not a talent. Read the evidence, check the scope, reproduce, narrow down, classify and then act. Protect the product by never adjusting a test just to make it green, and leave the framework better at explaining the next failure.
