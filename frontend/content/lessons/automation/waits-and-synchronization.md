---
slug: waits-and-synchronization
title: Waits and synchronization
summary: Make Selenium tests wait for the right condition instead of a fixed time. Implicit, explicit and fluent waits, ExpectedConditions, and why Thread.sleep and mixed waits cause flakiness.
level: intermediate
duration: 40
tags: [selenium, waits, synchronization, flakiness, automation]
objectives:
  - Explain why web pages need synchronization in automated tests
  - Compare implicit, explicit and fluent waits and choose the right one
  - Use WebDriverWait with ExpectedConditions and custom conditions in Selenium 4
  - Avoid Thread.sleep and mixed implicit/explicit waits
prerequisites:
  - Selenium architecture and WebDriver
  - Locator strategies
related: [locator-strategies, flaky-test-reduction, debugging-failing-tests, page-object-model]
references:
  - title: Selenium documentation — Waiting strategies
    url: https://www.selenium.dev/documentation/webdriver/waits/
  - title: Selenium documentation — WebDriver
    url: https://www.selenium.dev/documentation/webdriver/
  - title: Playwright documentation — Auto-waiting (for comparison)
    url: https://playwright.dev/docs/actionability
interview:
  - q: Explain the difference between implicit and explicit waits.
    a: "An implicit wait is a session-wide setting: every findElement call polls the DOM for up to that time before throwing NoSuchElementException. It only covers element presence. An explicit wait, WebDriverWait, waits for a specific condition, such as visible, clickable, text present or URL changed, at one specific point, and throws TimeoutException if it does not happen in time. Explicit waits are more precise and are the recommended default."
  - q: Why does the Selenium documentation warn against mixing implicit and explicit waits?
    a: "Because they interact unpredictably. Inside an explicit wait, each findElement call can itself block for the full implicit timeout, so the effective wait can become much longer than either setting, and timeouts become hard to reason about. The usual practice is to leave the implicit wait at zero and use explicit waits."
  - q: Why is Thread.sleep a bad synchronization strategy?
    a: "It waits a fixed time regardless of reality. If the app is faster, the time is wasted on every run; if the app is slower, for example on a loaded CI agent, the test still fails. Across a large suite it makes runs both slow and flaky. A condition-based wait returns as soon as the condition is true and only fails when it really never becomes true."
practice:
  - "Write a WebDriverWait that waits for a loading spinner with id 'spinner' to disappear and then clicks the Save button."
  - "Write a custom wait using a lambda that waits until a table has at least 10 rows."
  - "Find a test in a codebase you know that uses Thread.sleep and replace it with an explicit wait. Measure the run time before and after."
takeaways:
  - Wait for conditions, not for time.
  - Use WebDriverWait with Duration and ExpectedConditions as the default.
  - Keep implicit wait at zero when you use explicit waits; never mix them.
  - FluentWait lets you tune polling interval and ignored exceptions.
  - Wrap waits inside page-object methods so tests stay clean.
quiz:
  - id: sel-wait-q1
    type: single
    topic: waits-and-synchronization
    difficulty: beginner
    prompt: Which is the correct Selenium 4 way to create an explicit wait of 10 seconds?
    options: ["new WebDriverWait(driver, 10)", "new WebDriverWait(driver, Duration.ofSeconds(10))", "driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS)", "Thread.sleep(10000)"]
    answer: [1]
    explanation: "Selenium 4 takes a java.time.Duration. The long-seconds constructor is deprecated, implicitlyWait with TimeUnit is the deprecated implicit-wait API, and Thread.sleep is not a condition-based wait at all."
  - id: sel-wait-q2
    type: debugging
    topic: waits-and-synchronization
    difficulty: intermediate
    prompt: This click intermittently fails with ElementClickInterceptedException because a loading overlay covers the button. What is the best fix?
    code: |
      WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
      wait.until(ExpectedConditions.presenceOfElementLocated(By.id("save"))).click();
    codeLanguage: java
    options: ["Add Thread.sleep(3000) before the click", "Wait for the overlay to become invisible, then wait for the button to be clickable", "Increase the wait to 60 seconds", "Set an implicit wait of 10 seconds as well"]
    answer: [1]
    explanation: "Presence only means the element is in the DOM; it can still be covered. Waiting for invisibilityOfElementLocated on the overlay and then elementToBeClickable targets the real condition. Longer timeouts, sleeps or mixed implicit waits do not address what is blocking the click."
  - id: sel-wait-q3
    type: truefalse
    topic: waits-and-synchronization
    difficulty: beginner
    prompt: WebDriverWait returns as soon as the condition is satisfied, even if the timeout has not elapsed.
    options: ["True", "False"]
    answer: [0]
    explanation: "WebDriverWait polls (every 500 ms by default) and returns the moment the condition yields a non-null, non-false value. The timeout is the maximum, not a fixed delay."
  - id: sel-wait-q4
    type: code-output
    topic: waits-and-synchronization
    difficulty: intermediate
    prompt: The status label shows 'Processing' and never changes. What happens after about 5 seconds?
    code: |
      new WebDriverWait(driver, Duration.ofSeconds(5))
          .until(ExpectedConditions.textToBe(By.id("status"), "Complete"));
      System.out.println("done");
    codeLanguage: java
    options: ["'done' is printed", "NoSuchElementException is thrown", "TimeoutException is thrown and 'done' is not printed", "The wait blocks forever"]
    answer: [2]
    explanation: "The element exists, so there is no NoSuchElementException; the condition simply never becomes true, so WebDriverWait throws TimeoutException after 5 seconds with a message describing the expected text."
---

## Beginner-friendly explanation

Imagine waiting for a bus. One approach is to stand at the stop for exactly ten minutes, then leave whether or not the bus came. That is `Thread.sleep`: wasteful if the bus arrives in one minute, useless if it arrives in eleven. The sensible approach is to watch the road and get on as soon as the bus arrives, giving up only after a reasonable maximum.

Web pages load in pieces. Buttons appear after data arrives, spinners come and go, and animations move things around. Your test is much faster than any human, so it often tries to click something that is not ready yet. **Synchronization** means making the test wait for the right *condition*, just like watching for the bus.

## Technical explanation

### Why synchronization is needed

`driver.get()` waits for the document's load state (controlled by the page load strategy), but it does not know about later JavaScript activity: API calls, client-side rendering, animations. Selenium cannot guess what "ready" means for your page, so you tell it.

### The three kinds of wait

| Wait | Scope | Waits for | Failure |
|---|---|---|---|
| Implicit | Whole session | Element presence in `findElement(s)` | `NoSuchElementException` |
| Explicit (`WebDriverWait`) | One call site | Any condition you specify | `TimeoutException` |
| Fluent (`FluentWait`) | One call site | Any condition, with custom polling and ignored exceptions | `TimeoutException` |

Implicit wait is set with `driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(n))` (Selenium 4; the `TimeUnit` overload is deprecated). The Selenium documentation advises **not mixing** implicit and explicit waits because the interaction makes timeouts unpredictable.

### WebDriverWait and ExpectedConditions

`new WebDriverWait(driver, Duration.ofSeconds(10))` polls a condition every 500 ms by default and ignores `NoSuchElementException` while polling. Useful conditions:

- `visibilityOfElementLocated(By)` and `invisibilityOfElementLocated(By)`
- `elementToBeClickable(By)` (visible and enabled; it does not detect overlays)
- `textToBePresentInElementLocated(By, String)` and `textToBe(By, String)`
- `urlContains(String)`, `titleIs(String)`
- `numberOfElementsToBeMoreThan(By, int)`
- `frameToBeAvailableAndSwitchToIt(By)`, `alertIsPresent()`

`until()` returns the condition's value, so `WebElement el = wait.until(visibilityOfElementLocated(...))` gives you the element directly.

### Custom conditions

A condition is a function from `WebDriver` to a value; return `null` or `false` to keep polling:

```java
wait.until(d -> d.findElements(By.cssSelector("#orders tbody tr")).size() >= 10);
```

```mermaid
flowchart TD
  S["until(condition)"] --> E{"Condition returns non-null and not false?"}
  E -- yes --> R["Return value immediately"]
  E -- no --> T{"Timeout elapsed?"}
  T -- no --> P["Sleep polling interval (500 ms default)"] --> E
  T -- yes --> X["Throw TimeoutException"]
```

## Real-world example

A banking team's suite took over an hour, and about one run in five failed somewhere. A review found hundreds of `Thread.sleep(3000)` calls added "to be safe". Replacing them with explicit waits on real conditions — spinner invisible, table row count, URL change — inside page-object methods cut the run time substantially and removed most of the intermittent failures. The remaining flaky tests turned out to be genuine race conditions in the application, which were then reported as defects.

## Step-by-step walkthrough

1. **Set implicit wait to zero** (the default) and decide to use explicit waits only.
2. **Identify the real readiness signal** for each action: a spinner disappears, a button is enabled, a row appears.
3. **Create one `WebDriverWait`** per page object, typically in `BasePage`.
4. **Wait, then act**, using the element returned by `until()`.
5. **After actions that trigger navigation or saving**, wait for the outcome (URL, toast, updated text) before asserting.
6. **Use `FluentWait`** when you need a different polling interval or to ignore extra exceptions such as `StaleElementReferenceException`.

## Code examples

```java
import java.time.Duration;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;

public class SettingsPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By spinner = By.id("spinner");
    private final By save = By.cssSelector("[data-testid='save']");
    private final By toast = By.cssSelector("[role='status']");

    public SettingsPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public String saveAndReadToast() {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(spinner));
        wait.until(ExpectedConditions.elementToBeClickable(save)).click();
        return wait.until(ExpectedConditions.visibilityOfElementLocated(toast)).getText();
    }

    public WebElement waitForStableRow(By row) {
        Wait<WebDriver> fluent = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(15))
                .pollingEvery(Duration.ofMillis(250))
                .ignoring(StaleElementReferenceException.class);
        return fluent.until(d -> {
            WebElement el = d.findElement(row);
            return el.isDisplayed() ? el : null;
        });
    }
}
```

## Expected output

When the toast never appears, a TestNG run reports a clear, condition-specific failure (illustrative):

```text
FAILED: savingSettingsShowsConfirmation
org.openqa.selenium.TimeoutException: Expected condition failed: waiting for visibility of element located by By.cssSelector: [role='status'] (tried for 10 second(s) with 500 milliseconds interval)
```

Compare that with a `Thread.sleep` approach, which typically fails later with a vaguer `NoSuchElementException`.

## Common mistakes

- **`Thread.sleep` as synchronization**: slow when the app is fast, flaky when it is slow.
- **Mixing implicit and explicit waits**, producing unexpectedly long or inconsistent timeouts.
- **Waiting for presence when you need visibility or clickability.**
- **Huge global timeouts** (60+ seconds) that hide performance regressions and make failures slow.
- **Waiting after acting instead of before**, or not waiting for the result of an action before asserting.
- **Using deprecated APIs** like `new WebDriverWait(driver, 10)` from old tutorials.

## Troubleshooting

- **`TimeoutException` but the element is clearly there**: check the condition (visible vs present), frames, and whether the locator matches a hidden duplicate.
- **`StaleElementReferenceException` after a wait**: the DOM re-rendered between finding and using; re-find inside the wait or use `FluentWait` ignoring stale elements.
- **`ElementClickInterceptedException`**: an overlay or sticky header covers the element; wait for the overlay to disappear or scroll the element into view.
- **Waits are fine locally, fail in CI**: CI is slower and often headless with a different window size; check the viewport and resource limits before raising timeouts.

## Key takeaways summary

Robust automation waits for meaningful conditions. Default to `WebDriverWait` with `Duration` and `ExpectedConditions`, keep implicit waits off, avoid `Thread.sleep`, and hide waits inside page-object methods. Good synchronization is the single biggest lever in [reducing flaky tests](/learn/automation/flaky-test-reduction).
