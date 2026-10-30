---
slug: testng-essentials
title: TestNG essentials
summary: Structure Selenium suites with TestNG 7 — annotations and their order, assertions, groups, dependencies, data providers and testng.xml — the backbone of the Java core path.
level: beginner
duration: 40
tags: [testng, java, test-framework, automation]
objectives:
  - Use TestNG annotations and explain their execution order
  - Write hard and soft assertions with useful messages
  - Organise tests with groups, priorities and dependencies, and know when to avoid them
  - Configure suites, parameters and parallelism in testng.xml
prerequisites:
  - Java basics and OOP for test automation
  - Selenium architecture and WebDriver
related: [junit-5-essentials, data-driven-testing, parallel-execution, maven-for-test-projects]
references:
  - title: TestNG documentation
    url: https://testng.org/
  - title: Maven Surefire Plugin — Using TestNG
    url: https://maven.apache.org/surefire/maven-surefire-plugin/examples/testng.html
  - title: Selenium documentation
    url: https://www.selenium.dev/documentation/
interview:
  - q: What is the execution order of TestNG configuration annotations?
    a: "@BeforeSuite, @BeforeTest, @BeforeClass, @BeforeMethod, then the @Test method, then @AfterMethod, @AfterClass, @AfterTest and @AfterSuite. @BeforeMethod and @AfterMethod run around every test method; @BeforeTest refers to a test tag in testng.xml, not to a single test method, which is a common source of confusion."
  - q: What is the difference between Assert and SoftAssert?
    a: "org.testng.Assert stops the test at the first failure by throwing an AssertionError. SoftAssert records failures and continues, then reports them all when you call assertAll(). Soft assertions suit checking many independent fields on one page; but if you forget assertAll() the test passes regardless, so I use them deliberately and sparingly."
  - q: Should tests depend on each other using dependsOnMethods?
    a: "Generally no for UI tests. Dependencies create ordering and shared state, so one failure skips a chain of tests and they cannot run in parallel or in isolation. I prefer each test to set up its own state, ideally through an API or test data, and use dependencies only for things like skipping tests when a smoke check of the environment fails."
practice:
  - "Write a test class with all eight configuration annotations that print their names, run it, and draw the order you observe."
  - "Tag three tests as smoke and five as regression with groups, then run only smoke from testng.xml and from Maven with -Dgroups=smoke."
  - "Convert a test that checks five fields on a profile page with hard asserts into SoftAssert, and confirm all five failures are reported when the data is wrong."
takeaways:
  - TestNG supplies the test lifecycle, assertions, grouping, data providers and suite configuration.
  - "@BeforeMethod and @AfterMethod are the usual places to create and quit the browser."
  - Prefer independent tests over priorities and dependencies.
  - Always call assertAll() on SoftAssert.
  - testng.xml defines which classes, groups and parameters run, and how parallel.
quiz:
  - id: tng-q1
    type: single
    topic: testng-essentials
    difficulty: beginner
    prompt: Which annotation runs before every @Test method in the class?
    options: ["@BeforeClass", "@BeforeTest", "@BeforeMethod", "@BeforeSuite"]
    answer: [2]
    explanation: "@BeforeMethod runs before each test method. @BeforeClass runs once per class, @BeforeTest once per test tag in testng.xml, and @BeforeSuite once per suite. @BeforeTest is the tempting wrong answer because of its name."
  - id: tng-q2
    type: debugging
    topic: testng-essentials
    difficulty: intermediate
    prompt: The profile page shows the wrong email and phone, yet this test passes. Why?
    code: |
      @Test
      public void profileShowsSavedDetails() {
          SoftAssert soft = new SoftAssert();
          soft.assertEquals(profile.email(), "asha@example.test");
          soft.assertEquals(profile.phone(), "+91 90000 00000");
      }
    codeLanguage: java
    options: ["SoftAssert only works with strings", "assertAll() is never called, so collected failures are never reported", "The test needs dependsOnMethods", "assertEquals has the arguments reversed"]
    answer: [1]
    explanation: "SoftAssert records failures silently until assertAll() throws them together. Without it, the test always passes. Argument order affects only the message wording, not whether the test fails."
  - id: tng-q3
    type: code-output
    topic: testng-essentials
    difficulty: intermediate
    prompt: A class has one @BeforeClass, one @BeforeMethod and two @Test methods. How many times is each configuration method called?
    code: |
      @BeforeClass  public void openBrowser() { System.out.println("class"); }
      @BeforeMethod public void login()       { System.out.println("method"); }
      @Test public void a() {}
      @Test public void b() {}
    codeLanguage: java
    options: ["class x1, method x1", "class x1, method x2", "class x2, method x2", "class x2, method x1"]
    answer: [1]
    explanation: "@BeforeClass runs once before the first test in the class; @BeforeMethod runs before each of the two tests."
  - id: tng-q4
    type: truefalse
    topic: testng-essentials
    difficulty: beginner
    prompt: In TestNG's Assert.assertEquals(actual, expected), the actual value comes first.
    options: ["True", "False"]
    answer: [0]
    explanation: "TestNG's order is (actual, expected[, message]). JUnit 5 uses (expected, actual), which is why mixing the two produces confusing failure messages."
---

## Beginner-friendly explanation

Selenium can drive a browser, but it does not know what a "test" is. It cannot say which steps run first, whether a check passed, or produce a report. **TestNG** is the organiser. Think of it as a theatre stage manager: it sets the stage before each scene (open the browser), signals the actors (run the test), checks that each scene went as planned (assertions), clears the stage afterwards (quit the browser), and writes a review of the whole show (the report).

In the Saige-Prep automation track, **Java + Selenium + TestNG** is the core path; most Java automation roles expect you to be fluent in it.

## Technical explanation

### Annotations and lifecycle

| Annotation | Runs |
|---|---|
| `@BeforeSuite` / `@AfterSuite` | Once per suite |
| `@BeforeTest` / `@AfterTest` | Once per `<test>` tag in testng.xml |
| `@BeforeClass` / `@AfterClass` | Once per test class |
| `@BeforeMethod` / `@AfterMethod` | Around every `@Test` method |
| `@Test` | The test itself |
| `@DataProvider` | Supplies rows of parameters |

```mermaid
flowchart LR
  BS["@BeforeSuite"] --> BT["@BeforeTest"] --> BC["@BeforeClass"] --> BM["@BeforeMethod"] --> T["@Test"] --> AM["@AfterMethod"]
  AM -->|"next test method"| BM
  AM --> AC["@AfterClass"] --> AT["@AfterTest"] --> AS["@AfterSuite"]
```

Useful `@Test` attributes: `groups`, `priority`, `enabled`, `dependsOnMethods`, `expectedExceptions`, `timeOut`, `dataProvider`, `invocationCount`, `retryAnalyzer`. Use `@AfterMethod(alwaysRun = true)` for teardown so the browser quits even when configuration fails or groups are filtered.

### Assertions

`org.testng.Assert` (hard) stops at the first failure. `org.testng.asserts.SoftAssert` collects failures until `assertAll()`. Signature order is `assertEquals(actual, expected, message)`.

### testng.xml

The suite file selects classes, packages, groups and parameters, and configures parallelism:

```xml
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="Regression" parallel="methods" thread-count="4">
  <parameter name="browser" value="chrome"/>
  <test name="Smoke on Chrome">
    <groups><run><include name="smoke"/></run></groups>
    <classes>
      <class name="com.shop.tests.LoginTests"/>
      <class name="com.shop.tests.CheckoutTests"/>
    </classes>
  </test>
</suite>
```

`@Parameters("browser")` on a method reads the value. Parallel modes are `methods`, `classes`, `tests` and `instances`.

### Listeners

Implement `ITestListener` (for example `onTestFailure`) to take screenshots or log results; register with `@Listeners` or a `<listeners>` block. See [reporting and logging](/learn/automation/reporting-and-logging).

## Real-world example

A subscription business's suite used `priority` and `dependsOnMethods` to chain "create account", "add plan", "pay", "cancel" into one long flow. When the payment sandbox was down, every downstream test was skipped, and nobody could run "cancel" alone to reproduce a bug. The team rewrote each test to create its own preconditions through API helpers in `@BeforeMethod`. Tests became independent, could run in parallel, and a single environment issue no longer hid the state of the whole suite.

## Step-by-step walkthrough

1. **Add the TestNG dependency** (`org.testng:testng`, a current 7.x) to the pom.
2. **Create a `BaseTest`** with `@BeforeMethod` creating the driver and `@AfterMethod(alwaysRun = true)` quitting it.
3. **Write test classes** extending `BaseTest`, one behaviour per `@Test`.
4. **Assert outcomes** with clear messages.
5. **Group tests** (`smoke`, `regression`) to build different suites.
6. **Create testng.xml** and point Maven Surefire at it.
7. **Read the report** in `target/surefire-reports` after `mvn test`.

## Code examples

```java
import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.*;

public class LoginTests {
    private WebDriver driver;

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
        driver.get("https://example.test/login");
    }

    @Test(groups = {"smoke"}, description = "Valid user lands on the dashboard")
    public void validLoginShowsDashboard() {
        new LoginPage(driver).loginAs("demo", "s3cret");
        Assert.assertTrue(driver.getCurrentUrl().endsWith("/dashboard"),
                "Expected dashboard URL but was " + driver.getCurrentUrl());
    }

    @Test(groups = {"regression"})
    public void wrongPasswordShowsError() {
        new LoginPage(driver).loginAs("demo", "wrong");
        Assert.assertEquals(driver.findElement(By.id("error")).getText(),
                "Invalid username or password", "error banner text");
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) driver.quit();
    }
}
```

## Expected output

Illustrative console output from `mvn test` when one test fails:

```text
[INFO] Running TestSuite
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 9.84 s <<< FAILURE! -- in TestSuite
[ERROR] LoginTests.wrongPasswordShowsError -- Time elapsed: 3.112 s <<< FAILURE!
java.lang.AssertionError: error banner text expected [Invalid username or password] but found [Incorrect password]
[INFO]
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```

## Common mistakes

- **Using `@BeforeTest` thinking it runs before each test method.** That is `@BeforeMethod`.
- **Forgetting `alwaysRun = true` on teardown**, leaking browsers when setup fails.
- **Chaining tests with `priority` and `dependsOnMethods`**, creating fragile, order-dependent suites.
- **Forgetting `SoftAssert.assertAll()`**.
- **Static `WebDriver` fields** combined with `parallel="methods"`, so threads share one browser.
- **Mixing JUnit and TestNG assertion imports**, which swaps the argument order.

## Troubleshooting

- **No tests run with Maven**: check that Surefire points at the right testng.xml and that class names follow the configured pattern or are listed in the suite.
- **Tests skipped unexpectedly**: a configuration method failed; read the first configuration failure in the log.
- **Groups filter excludes setup methods**: configuration methods also need groups or `alwaysRun = true`.

## Key takeaways summary

TestNG turns Selenium scripts into a structured suite: lifecycle hooks for setup and teardown, assertions that report clearly, groups for different suites, data providers for variations and testng.xml for configuration. Keep tests independent and teardown robust, and the rest of the framework builds cleanly on top.
