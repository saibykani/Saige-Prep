---
slug: selenium-architecture
title: Selenium architecture and WebDriver
summary: How a line of Selenium Java code becomes an action in a real browser — client bindings, the W3C WebDriver protocol, browser drivers, Selenium Manager and Grid.
level: beginner
duration: 35
tags: [selenium, webdriver, architecture, automation]
objectives:
  - Describe the components of Selenium WebDriver and how they communicate
  - Explain the W3C WebDriver protocol and why Selenium 4 adopted it fully
  - Start a local browser session with Selenium Manager and a remote session on Grid
  - Diagnose common session-creation errors from their messages
prerequisites:
  - Java basics for testers
  - Basic understanding of HTTP requests and responses
related: [locator-strategies, waits-and-synchronization, parallel-execution, java-oop-for-test-automation]
references:
  - title: Selenium documentation — WebDriver
    url: https://www.selenium.dev/documentation/webdriver/
  - title: Selenium documentation — Selenium Manager
    url: https://www.selenium.dev/documentation/selenium_manager/
  - title: Selenium documentation — Grid
    url: https://www.selenium.dev/documentation/grid/
interview:
  - q: Explain Selenium WebDriver's architecture.
    a: "The test calls a language binding such as the Java client. The binding translates each call into a W3C WebDriver HTTP request with a JSON body and sends it to a driver: chromedriver, geckodriver, msedgedriver or safaridriver, or to a Selenium Grid that forwards it to one. The driver controls the browser through the browser's own automation interface and returns a JSON response, which the binding turns into a return value or an exception."
  - q: What changed in Selenium 4 compared with Selenium 3?
    a: "Selenium 4 uses the W3C WebDriver protocol natively rather than the older JSON Wire Protocol, which removed translation layers and made cross-browser behaviour more consistent. It also added relative locators, a rebuilt Grid with standalone, hub-node and distributed modes, newWindow for tabs and windows, Duration-based timeouts, access to Chrome DevTools features, and from 4.6 Selenium Manager to resolve drivers automatically."
  - q: What is Selenium Manager and how has it changed project setup?
    a: "Selenium Manager is a tool bundled with Selenium 4.6 and later. When you create a driver and no suitable driver binary is configured, it detects the installed browser version, downloads the matching driver, caches it and can even fetch a browser. That removes the need for manual driver downloads, System.setProperty driver paths or third-party driver-manager libraries in most projects."
practice:
  - "Create a Maven project with the selenium-java dependency, open a page with new ChromeDriver(), print the title and quit. Then switch to FirefoxDriver by changing one line."
  - "Start Selenium Grid in standalone mode on your machine and run the same test with RemoteWebDriver. Open the Grid UI on port 4444 while the test runs."
  - "Deliberately call driver.get after driver.quit() and record the exception message. Explain what it means in terms of sessions."
takeaways:
  - Selenium WebDriver is a client library that speaks the W3C WebDriver protocol over HTTP.
  - Each browser vendor ships a driver that translates protocol commands into browser actions.
  - Selenium Manager (4.6+) locates or downloads drivers automatically.
  - RemoteWebDriver plus Selenium Grid runs the same commands on remote machines.
  - Always call quit() to end the session and close the browser and driver process.
quiz:
  - id: sel-arch-q1
    type: single
    topic: selenium-architecture
    difficulty: beginner
    prompt: In Selenium 4, how does the Java client communicate with chromedriver?
    options: ["By injecting JavaScript into the page", "Through W3C WebDriver commands sent as HTTP requests with JSON payloads", "Through the JSON Wire Protocol only", "By simulating OS-level mouse movements"]
    answer: [1]
    explanation: "Selenium 4 bindings send W3C WebDriver commands over HTTP with JSON bodies. The JSON Wire Protocol was Selenium 3's legacy protocol, and Selenium does not drive the OS mouse or rely on injected JavaScript for normal commands."
  - id: sel-arch-q2
    type: debugging
    topic: selenium-architecture
    difficulty: intermediate
    prompt: A test fails with 'NoSuchSessionException' on the second line of a test. What is the most likely cause?
    code: |
      driver.quit();
      driver.get("https://example.test/orders");
    codeLanguage: java
    options: ["The URL is invalid", "The session was ended by quit(), so later commands have no session", "chromedriver is the wrong version", "An implicit wait is missing"]
    answer: [1]
    explanation: "quit() deletes the WebDriver session and stops the browser. Any later command refers to a session that no longer exists. A wrong driver version fails at session creation instead, typically with SessionNotCreatedException."
  - id: sel-arch-q3
    type: truefalse
    topic: selenium-architecture
    difficulty: beginner
    prompt: With Selenium 4.6 or later, a typical local test does not need System.setProperty to point at a driver executable.
    options: ["True", "False"]
    answer: [0]
    explanation: "Selenium Manager resolves a compatible driver automatically when none is configured, so the manual property is usually unnecessary. You can still set it, for example in locked-down networks."
  - id: sel-arch-q4
    type: multiple
    topic: selenium-architecture
    difficulty: intermediate
    prompt: Which are part of a Selenium WebDriver test run against a local Chrome browser? Select all that apply.
    options: ["Java language bindings", "chromedriver", "Selenium Grid hub (always required)", "The Chrome browser"]
    answer: [0, 1, 3]
    explanation: "A local run needs the bindings, the driver and the browser. Grid is only needed for remote or distributed execution, so it is not always required."
---

## Beginner-friendly explanation

Imagine ordering food at a restaurant where you do not speak the chef's language. You tell the **waiter** your order in English; the waiter writes it on a standard order slip; the **chef** reads the slip and cooks. You never step into the kitchen.

Selenium works the same way. Your **test code** is the customer. The **Selenium library** is the waiter, writing every request ("open this page", "click that button") on a standard slip called the **WebDriver protocol**. A **browser driver** such as chromedriver is the chef who knows how to make Chrome do it. Because the slip format is a standard, the same order works in Chrome, Firefox, Edge or Safari kitchens.

## Technical explanation

Selenium WebDriver has four layers:

1. **Language bindings** (Java, Python, C#, JavaScript, Ruby). `WebDriver`, `WebElement`, `By` and friends live here.
2. **The W3C WebDriver protocol**, a W3C Recommendation describing REST-style HTTP endpoints such as `POST /session`, `POST /session/{id}/url` and `POST /session/{id}/element`. Selenium 4 uses it natively.
3. **Browser drivers**, maintained by browser vendors: chromedriver, geckodriver (Firefox), msedgedriver, safaridriver. Each is a small HTTP server that receives protocol commands.
4. **The browser**, controlled by the driver through its internal automation interface.

```mermaid
sequenceDiagram
  participant T as Test (Java bindings)
  participant D as chromedriver
  participant B as Chrome
  T->>D: POST /session (capabilities)
  D->>B: Launch browser with automation enabled
  D-->>T: 200 with sessionId and capabilities
  T->>D: POST /session/{id}/url with target URL
  D->>B: Navigate and wait for page load strategy
  D-->>T: 200 value null
  T->>D: POST /session/{id}/element using css selector
  D->>B: Query the DOM
  D-->>T: 200 with element reference
  T->>D: DELETE /session/{id}
  D->>B: Close browser
```

### Sessions

`new ChromeDriver()` creates a **session**. Every later command carries the session ID. `driver.close()` closes the current window; `driver.quit()` ends the whole session. Commands after `quit()` raise `NoSuchSessionException`.

### Selenium Manager

From Selenium 4.6, if no driver is configured, **Selenium Manager** detects the browser version, downloads a matching driver into a local cache and uses it. Manual `System.setProperty("webdriver.chrome.driver", ...)` calls are now rarely needed.

### Options and capabilities

Browser options classes (`ChromeOptions`, `FirefoxOptions`, `EdgeOptions`) describe what kind of session you want: headless mode, window size, page load strategy, browser version.

### Remote execution and Grid

`RemoteWebDriver` sends the same protocol commands to a **Selenium Grid** URL instead of a local driver. Grid routes each new session to a node with a matching browser. Grid 4 runs in standalone, hub-and-node or fully distributed mode.

## Real-world example

A team's suite started failing every morning with `SessionNotCreatedException: This version of ChromeDriver only supports Chrome version N`. The CI machines auto-updated Chrome overnight, but the driver binary was committed to the repository. Upgrading to a current Selenium 4 release and deleting the hardcoded driver path let Selenium Manager pick a matching driver on each machine, and the morning failures stopped. They kept a pinned browser version in the CI image for reproducibility.

## Step-by-step walkthrough

1. **Add the dependency** `org.seleniumhq.selenium:selenium-java` (a current 4.x version) to your Maven project.
2. **Create options** for the browser and set what you need (for example `--headless=new` in CI).
3. **Create the driver**: `new ChromeDriver(options)`. Selenium Manager handles the driver binary.
4. **Issue commands**: `get`, `findElement`, `click`, `getText`.
5. **Quit in teardown** so the browser and driver process do not leak.
6. **Go remote** when you need scale: start Grid and create a `RemoteWebDriver` with the same options.

## Code examples

```java
import java.net.URI;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;

public class FirstSession {
    public static void main(String[] args) throws Exception {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--window-size=1366,768");

        boolean remote = Boolean.parseBoolean(System.getProperty("remote", "false"));
        WebDriver driver = remote
                ? new RemoteWebDriver(URI.create("http://localhost:4444").toURL(), options)
                : new ChromeDriver(options);   // Selenium Manager resolves chromedriver

        try {
            driver.get("https://www.selenium.dev/");
            System.out.println("Title: " + driver.getTitle());
            System.out.println("Session: " + ((RemoteWebDriver) driver).getSessionId());
        } finally {
            driver.quit();   // ends the session even if a step fails
        }
    }
}
```

`ChromeDriver` extends `RemoteWebDriver` in Selenium 4 (via `ChromiumDriver`), which is why the cast to read the session ID works for both branches.

To try Grid locally, download the Selenium Server jar from selenium.dev and run `java -jar selenium-server-<version>.jar standalone`, then run with `-Dremote=true`.

## Expected output

Illustrative console output (the session ID is random and the title depends on the live site):

```text
Title: Selenium
Session: 3f1c2a9e8b7d4c6e9a1b2c3d4e5f6a7b
```

## Common mistakes

- **Never calling `quit()`**, leaving orphaned browsers and driver processes that slow CI agents.
- **Committing driver binaries** or hardcoded driver paths that drift from the installed browser.
- **Mixing old and new APIs**, such as Selenium 3 era `DesiredCapabilities` tutorials, with Selenium 4.
- **Confusing `close()` with `quit()`**: `close()` leaves the session alive if other windows remain.
- **Assuming Selenium is a test framework.** It drives browsers; TestNG or JUnit provides tests, assertions and reports.

## Troubleshooting

- **`SessionNotCreatedException`** with a version message: browser and driver do not match. Remove manual driver paths and let Selenium Manager resolve it, or pin both versions.
- **Selenium Manager cannot download** behind a corporate proxy: configure the proxy, or pre-install the driver and set its path explicitly.
- **`NoSuchSessionException`**: the session was quit or the browser crashed; check teardown order and memory on the agent.
- **Remote session never starts**: check that the Grid URL is reachable and a node offers the requested browser in the Grid UI.

## Key takeaways summary

Selenium is a client that speaks the W3C WebDriver protocol to vendor-supplied browser drivers. Understanding that chain — bindings, protocol, driver, browser, optionally Grid — explains most setup errors and makes remote and parallel execution straightforward. Next, learn how to point at the right element with [locator strategies](/learn/automation/locator-strategies).
