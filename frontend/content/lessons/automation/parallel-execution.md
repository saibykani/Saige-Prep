---
slug: parallel-execution
title: Parallel execution
summary: Run automated tests at the same time to cut feedback time. Learn TestNG and JUnit 5 parallel settings, thread-safe drivers with ThreadLocal, Selenium Grid, and how to keep tests independent.
level: intermediate
duration: 40
tags: [parallel, testng, junit5, selenium-grid, automation]
objectives:
  - Explain how parallel execution reduces suite duration and what it requires
  - Configure parallel runs in TestNG and JUnit 5
  - Make WebDriver usage thread-safe with ThreadLocal
  - Diagnose failures caused by shared state between parallel tests
prerequisites:
  - TestNG essentials
  - Page Object Model
related: [testng-essentials, junit-5-essentials, page-object-model, flaky-test-reduction, selenium-architecture]
references:
  - title: TestNG documentation — Parallelism and time-outs
    url: https://testng.org/
  - title: JUnit User Guide — Parallel execution
    url: https://docs.junit.org/current/writing-tests/parallel-execution.html
  - title: Selenium documentation — Grid
    url: https://www.selenium.dev/documentation/grid/
interview:
  - q: What must be true about tests before you can run them in parallel?
    a: "They must be independent: no test relies on another's side effects or execution order, each gets its own browser session and its own test data, and nothing mutable is shared without synchronisation. Static WebDriver fields, shared user accounts and tests that delete global data are the usual blockers."
  - q: Why do frameworks use ThreadLocal for WebDriver?
    a: "TestNG and JUnit run parallel tests on different threads. A ThreadLocal<WebDriver> gives each thread its own driver while keeping a single convenient access point. You must call remove() after quitting so pooled threads do not keep stale drivers and leak memory."
  - q: How does Selenium Grid help parallel runs?
    a: "Grid routes each new session request to a node with a matching browser, so many sessions run across machines or containers at once. The test code uses RemoteWebDriver with the Grid URL. The concurrency limit then comes from available node slots, not the CI agent's CPU."
practice:
  - "Configure testng.xml with parallel=methods and thread-count=3 and log Thread.currentThread().getId() in each test to see the threads."
  - "Refactor a BaseTest that uses a static WebDriver into a ThreadLocal-based DriverManager."
  - "Find a test that depends on another test's data and rewrite it to create its own data."
takeaways:
  - Parallelism multiplies speed only when tests are independent.
  - One WebDriver per thread; never a static shared driver.
  - Give every test its own data, such as unique usernames.
  - Start with a modest thread count and increase while watching stability.
  - Grid or cloud providers scale browsers beyond one machine.
quiz:
  - id: parx-q1
    type: debugging
    topic: parallel-execution
    difficulty: intermediate
    prompt: After enabling parallel=methods, tests randomly fail with 'invalid session id' and clicks land in the wrong browser. Which code is the culprit?
    code: |
      public class BaseTest {
          protected static WebDriver driver;
          @BeforeMethod public void setUp() { driver = new ChromeDriver(); }
          @AfterMethod public void tearDown() { driver.quit(); }
      }
    codeLanguage: java
    options: ["ChromeDriver does not support parallel runs", "The static driver is shared by all threads, so one test's tearDown quits another test's browser", "@BeforeMethod should be @BeforeClass", "thread-count is too low"]
    answer: [1]
    explanation: "Each thread overwrites the single static field. Store drivers in a ThreadLocal or an instance field per test instance. Chrome itself handles many concurrent sessions fine."
  - id: parx-q2
    type: single
    topic: parallel-execution
    difficulty: beginner
    prompt: A suite of 200 independent tests takes 60 minutes serially. Roughly what is the best case with 4 parallel threads and no other bottleneck?
    options: ["60 minutes", "About 15 minutes", "About 4 minutes", "240 minutes"]
    answer: [1]
    explanation: "Ideal speed-up is proportional to the number of workers, so about 60 / 4. Real runs are a little slower because of uneven test lengths, setup overhead and shared resources."
  - id: parx-q3
    type: truefalse
    topic: parallel-execution
    difficulty: beginner
    prompt: In JUnit 5, parallel execution is enabled by default.
    options: ["True", "False"]
    answer: [1]
    explanation: "JUnit Jupiter runs tests sequentially unless junit.jupiter.execution.parallel.enabled=true is set, for example in junit-platform.properties."
  - id: parx-q4
    type: scenario
    topic: parallel-execution
    difficulty: intermediate
    prompt: Two parallel tests both log in as qa_user and one changes the password. The other fails intermittently. What is the best fix?
    options: ["Run those two tests serially forever", "Give each test its own user created during setup", "Add Thread.sleep before login", "Retry failed tests three times"]
    answer: [1]
    explanation: "Shared mutable data is the root cause. Isolated test data removes the conflict. Serialising hides it and costs speed, sleeps do nothing for data conflicts, and retries mask the defect."
---

## Beginner-friendly explanation

A supermarket with one checkout lane and 100 customers has a long queue. Open four lanes and the queue moves about four times faster, as long as each cashier has their own till. If two cashiers shared one till drawer, they would keep miscounting each other's money.

**Parallel execution** opens more lanes for your tests. Instead of running 200 tests one after another, you run several at the same time. The "own till" rule is the important part: each test needs its own browser and its own data, or tests interfere with each other.

## Technical explanation

Test runners create a pool of **worker threads** (or separate processes) and hand tests to free workers.

### TestNG

Set `parallel` and `thread-count` on the `<suite>` in `testng.xml`. Values for `parallel` are `methods`, `classes`, `tests` and `instances`. Data providers can run in parallel with `@DataProvider(parallel = true)`, sized by `data-provider-thread-count`.

### JUnit 5

Parallelism is opt-in through configuration parameters, typically in `src/test/resources/junit-platform.properties`. `@Execution(ExecutionMode.SAME_THREAD)` and `@ResourceLock` let you exclude or guard specific tests.

### Thread-safe drivers

Each thread needs its own `WebDriver`. A `ThreadLocal<WebDriver>` stores one value per thread.

```mermaid
flowchart LR
  R[Test runner] --> T1[Thread 1]
  R --> T2[Thread 2]
  R --> T3[Thread 3]
  T1 --> D1["ThreadLocal driver #1"] --> G[Selenium Grid]
  T2 --> D2["ThreadLocal driver #2"] --> G
  T3 --> D3["ThreadLocal driver #3"] --> G
  G --> N1[Chrome node]
  G --> N2[Firefox node]
```

### Scaling with Grid

Locally, each browser consumes CPU and memory, so a laptop may manage only a few. **Selenium Grid** distributes sessions across nodes (often Docker containers); cloud device farms do the same at larger scale.

### Sharding

CI systems can also split the suite across several machines (sharding), each running its own parallel threads.

## Real-world example

A banking web team's regression suite grew to 90 minutes, so it ran only nightly. They introduced a `DriverManager` with `ThreadLocal`, made every test create its own customer through an API, and ran classes in parallel against a Docker-based Grid with six Chrome nodes. The suite ran in about 20 minutes, short enough to run on each merge to main. Around a dozen tests failed at first; every one revealed hidden shared data or order dependencies, which were fixed before the change was adopted.

## Step-by-step walkthrough

1. Remove ordering dependencies (`dependsOnMethods` chains, shared state between tests).
2. Replace static drivers with a `ThreadLocal` driver manager.
3. Make test data unique per test, for example with a timestamp or UUID suffix.
4. Enable parallelism with a small thread count (2 to 4).
5. Run the suite several times and fix any new intermittent failures.
6. Increase threads or add Grid nodes while watching duration and stability.

## Code examples

```java
public final class DriverManager {
    private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

    public static void start() { DRIVER.set(new ChromeDriver()); }
    public static WebDriver get() { return DRIVER.get(); }

    public static void stop() {
        WebDriver d = DRIVER.get();
        if (d != null) { d.quit(); }
        DRIVER.remove();               // avoid leaks on pooled threads
    }
}

public class BaseTest {
    @BeforeMethod public void setUp()    { DriverManager.start(); }
    @AfterMethod(alwaysRun = true) public void tearDown() { DriverManager.stop(); }
}
```

```xml
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="Regression" parallel="classes" thread-count="4">
  <test name="Web">
    <packages><package name="com.example.tests"/></packages>
  </test>
</suite>
```

```properties
# src/test/resources/junit-platform.properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
junit.jupiter.execution.parallel.config.strategy = fixed
junit.jupiter.execution.parallel.config.fixed.parallelism = 4
```

Remote driver for Grid:

```java
WebDriver driver = new RemoteWebDriver(new URL("http://localhost:4444"), new ChromeOptions());
```

## Expected output

Logging the thread id shows tests interleaving:

```text
[TestNG-PoolService-0] LoginTests.validUser started
[TestNG-PoolService-1] CartTests.addItem started
[TestNG-PoolService-2] SearchTests.byName started
Total tests run: 3, Passes: 3, Failures: 0, Skips: 0
```

Thread names vary by TestNG version.

## Common mistakes

- **Static `WebDriver`** or static page objects shared between threads.
- **Shared accounts and records** that tests modify.
- **Order dependencies** such as "test B uses the order created by test A".
- **Forgetting `ThreadLocal.remove()`**, leaving drivers attached to reused threads.
- **Too many threads** for the machine, causing timeouts that look like product bugs.
- **Non-thread-safe utilities**, such as a shared `SimpleDateFormat` or a static counter without synchronisation.

## Troubleshooting

- **Failures only in parallel**: run the failing test alone; if it passes, look for shared state.
- **Timeouts grow with thread count**: the machine or Grid is saturated; lower threads or add nodes.
- **Reports mix logs from tests**: include thread or test name in log lines and use per-test log context.
- **Grid queues sessions**: the number of node slots limits concurrency, not the thread count.

## Key takeaways summary

Parallel execution is the cheapest way to make a large suite fast, but it amplifies any design weakness. Independent tests, one driver per thread and unique data are the price of entry; pay it, and adding threads or Grid nodes turns hours into minutes.
