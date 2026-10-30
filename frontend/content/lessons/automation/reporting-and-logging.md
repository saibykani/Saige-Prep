---
slug: reporting-and-logging
title: Reporting and logging
summary: Turn test runs into evidence people can act on. Learn the difference between reports and logs, use SLF4J with Logback, capture screenshots on failure, and publish JUnit XML and Allure reports from CI.
level: intermediate
duration: 35
tags: [reporting, logging, allure, automation, ci]
objectives:
  - Distinguish test reports from logs and explain what each is for
  - Add structured logging with SLF4J and log levels
  - Capture screenshots and page source automatically on failure
  - Publish machine-readable results that CI tools understand
prerequisites:
  - TestNG or JUnit 5 essentials
  - Maven for test projects
related: [testng-essentials, maven-for-test-projects, debugging-failing-tests, ci-cd-for-test-engineers, qa-metrics-and-reporting]
references:
  - title: SLF4J manual
    url: https://www.slf4j.org/manual.html
  - title: Logback documentation
    url: https://logback.qos.ch/documentation.html
  - title: Allure Report documentation
    url: https://allurereport.org/docs/
  - title: Maven Surefire Plugin
    url: https://maven.apache.org/surefire/maven-surefire-plugin/
interview:
  - q: What is the difference between a test report and a log?
    a: "A report summarises outcomes for people who decide: which tests passed, failed or were skipped, durations, trends and attached evidence. A log is a detailed chronological record of what the code did, used by engineers to diagnose a specific failure. Good frameworks link them, so a failed test in the report carries its log, screenshot and environment details."
  - q: What evidence do you capture when a UI test fails?
    a: "A screenshot, the page URL and source, browser console logs where available, the test data used, the environment and build version, and the full stack trace. Many teams also record video or a Playwright trace. The goal is that someone can diagnose the failure without rerunning it."
  - q: Why log through SLF4J instead of System.out.println?
    a: "SLF4J gives levels, so you can show INFO in CI and DEBUG locally, timestamps and thread names, which matter in parallel runs, and configurable outputs such as files. System.out has none of that and cannot be filtered or routed."
practice:
  - "Add SLF4J and Logback to a test project, log each step at INFO and locator details at DEBUG, and switch levels in logback-test.xml."
  - "Write a TestNG listener that saves a screenshot named after the failing test method."
  - "Generate an Allure report locally and attach a screenshot to a failing test."
takeaways:
  - Reports answer what happened; logs answer why.
  - Use a logging facade with levels, not println.
  - Capture evidence automatically on failure through listeners or extensions.
  - JUnit XML is the common format CI tools read.
  - Never log passwords, tokens or personal data.
quiz:
  - id: repl-q1
    type: single
    topic: reporting-and-logging
    difficulty: beginner
    prompt: Which log level is most appropriate for 'Clicked element [data-testid=submit] after 120 ms wait'?
    options: ["ERROR", "WARN", "DEBUG", "FATAL"]
    answer: [2]
    explanation: "Fine-grained mechanics belong at DEBUG so they can be switched on when diagnosing. ERROR and WARN signal problems; using them for routine steps drowns real issues."
  - id: repl-q2
    type: multiple
    topic: reporting-and-logging
    difficulty: intermediate
    prompt: Which items are useful evidence to attach automatically when a UI test fails?
    options: ["Screenshot", "Current URL and page source", "The tester's password", "Stack trace and test data used"]
    answer: [0, 1, 3]
    explanation: "Screenshots, URL, DOM and stack trace help diagnosis. Secrets must never be written to logs or reports, because reports are widely shared and stored."
  - id: repl-q3
    type: truefalse
    topic: reporting-and-logging
    difficulty: beginner
    prompt: Surefire writes JUnit-style XML result files that CI servers such as Jenkins and GitHub Actions integrations can parse.
    options: ["True", "False"]
    answer: [0]
    explanation: "Surefire writes TEST-*.xml files to target/surefire-reports. JUnit XML is the de facto interchange format for test results in CI."
  - id: repl-q4
    type: scenario
    topic: reporting-and-logging
    difficulty: intermediate
    prompt: In a parallel run, the log file mixes lines from different tests, making it impossible to follow one failure. What is the best improvement?
    options: ["Turn off parallel execution", "Include thread name and test name in each log line, for example through MDC", "Log everything at ERROR", "Remove logging"]
    answer: [1]
    explanation: "A per-test context (SLF4J MDC) plus thread name lets you filter lines for one test. Turning off parallelism throws away speed, and changing levels does not separate interleaved lines."
---

## Beginner-friendly explanation

After a football match there are two kinds of record. The **scoreboard** says who won, 2-1. The **match commentary** says what happened minute by minute: who passed to whom, who missed. Managers glance at the scoreboard; coaches study the commentary to improve.

A **test report** is the scoreboard: 480 passed, 3 failed, 2 skipped. **Logs** are the commentary: "opened login page, typed username, clicked submit, waited 10 seconds, error banner never appeared". When a test fails you need both, plus a photo of the moment (a screenshot).

## Technical explanation

### Reports

Runners produce raw results; reporters turn them into views.

- **JUnit XML**: Surefire and Failsafe write `TEST-*.xml` under `target/surefire-reports` or `target/failsafe-reports`. CI tools parse this for pass/fail counts and trends.
- **Framework HTML reports**: TestNG writes its own HTML output.
- **Allure Report**: collects results through framework adapters (`allure-testng`, `allure-junit5`) into `allure-results`, then generates an interactive HTML site with steps, attachments, history and categories.

### Logs

**SLF4J** is a logging API; **Logback** (or Log4j 2) is the implementation. Levels from most to least severe: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`. **MDC** (Mapped Diagnostic Context) attaches values such as the test name to every line on the current thread.

### Evidence capture

Hooks run code on failure: TestNG `ITestListener.onTestFailure`, JUnit 5 `TestWatcher` or `AfterTestExecutionCallback`. Selenium's `TakesScreenshot` grabs the viewport.

```mermaid
sequenceDiagram
  participant T as Test
  participant L as Listener
  participant D as WebDriver
  participant R as Report
  T->>T: step fails (exception)
  T->>L: onTestFailure(result)
  L->>D: getScreenshotAs(BYTES), getPageSource()
  L->>R: attach screenshot, DOM, logs
  R-->>R: test marked failed with evidence
```

## Real-world example

A retail QA team's nightly run showed "17 failed" in Jenkins with only stack traces. Each morning someone reran failures locally to see what happened, which took an hour. They added a listener that attaches a screenshot, URL and page source, put the test name in every log line via MDC, and published Allure. Most failures could then be triaged from the report alone, and repeated failure signatures were grouped as categories such as "environment down".

## Step-by-step walkthrough

1. Add `slf4j-api` and `logback-classic` as test dependencies.
2. Create `src/test/resources/logback-test.xml` with a pattern including time, level, thread and MDC test name.
3. Replace `System.out.println` with a `Logger`.
4. Add a failure listener that captures a screenshot and page source.
5. Add the Allure adapter and generate the report with the Allure command line.
6. In CI, publish the JUnit XML and archive the Allure output.

## Code examples

```java
public class LoginTests extends BaseTest {
    private static final Logger log = LoggerFactory.getLogger(LoginTests.class);

    @Test
    public void validUserSeesDashboard() {
        log.info("Opening login page");
        LoginPage page = new LoginPage(DriverManager.get()).open(Config.BASE_URL);
        log.info("Logging in as demo user");      // never log the password
        DashboardPage dash = page.loginAs("demo", Secrets.demoPassword());
        Assert.assertEquals(dash.userName(), "Demo User");
    }
}
```

```java
public class FailureEvidenceListener implements ITestListener {
    @Override
    public void onTestFailure(ITestResult result) {
        WebDriver driver = DriverManager.get();
        if (driver == null) return;
        String name = result.getMethod().getMethodName();
        try {
            byte[] png = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            Path dir = Paths.get("target", "evidence");
            Files.createDirectories(dir);
            Files.write(dir.resolve(name + ".png"), png);
            Files.writeString(dir.resolve(name + ".html"), driver.getPageSource());
        } catch (IOException e) {
            LoggerFactory.getLogger(getClass()).warn("Could not save evidence for {}", name, e);
        }
    }
}
```

Register it with `@Listeners(FailureEvidenceListener.class)` or in `testng.xml`.

```xml
<!-- src/test/resources/logback-test.xml -->
<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss.SSS} %-5level [%thread] [%X{test}] %logger{20} - %msg%n</pattern>
    </encoder>
  </appender>
  <root level="INFO"><appender-ref ref="CONSOLE"/></root>
</configuration>
```

Set the MDC in a `@BeforeMethod` with `MDC.put("test", method.getName())` and clear it afterwards with `MDC.clear()`.

## Expected output

```text
10:42:01.113 INFO  [TestNG-PoolService-1] [validUserSeesDashboard] LoginTests - Opening login page
10:42:02.540 INFO  [TestNG-PoolService-1] [validUserSeesDashboard] LoginTests - Logging in as demo user
```

On failure, `target/evidence/validUserSeesDashboard.png` and `.html` appear.

## Common mistakes

- **Logging secrets** such as passwords, tokens or full card numbers.
- **Everything at INFO or ERROR**, so real problems are buried.
- **Screenshots without names or timestamps**, impossible to match to tests.
- **Evidence capture that throws**, hiding the original failure.
- **Reports that nobody reads** because they are not published where the team looks.
- **Generating reports only locally**, so CI failures lack evidence.

## Troubleshooting

- **SLF4J "no providers" warning**: no binding such as `logback-classic` is on the classpath.
- **Black or blank screenshots in headless mode**: set an explicit window size.
- **Allure report empty**: check that `allure-results` is produced by the adapter and that you point the generator at the right folder.
- **Driver already quit in listener**: make sure teardown runs after the listener or capture evidence in teardown before quitting.

## Key takeaways summary

Reports tell the team what happened; logs and evidence tell an engineer why. Use a logging facade with levels and per-test context, capture screenshots and DOM automatically on failure, keep secrets out, and publish standard results where people already look.
