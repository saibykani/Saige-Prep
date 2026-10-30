---
slug: junit-5-essentials
title: JUnit 5 essentials
summary: Write and organise tests with JUnit 5 (Jupiter) — lifecycle annotations, assertions, parameterized tests, tags, extensions and parallel execution — and know how it differs from TestNG.
level: beginner
duration: 35
tags: [junit, java, test-framework, automation]
objectives:
  - Explain the JUnit 5 architecture (Platform, Jupiter, Vintage)
  - Use Jupiter lifecycle annotations and assertions, including assertAll and assertThrows
  - Write parameterized tests with ValueSource, CsvSource and MethodSource
  - Filter with tags and enable parallel execution
prerequisites:
  - Java basics and OOP for test automation
related: [testng-essentials, data-driven-testing, maven-for-test-projects, test-doubles-and-mocking]
references:
  - title: JUnit 5 User Guide
    url: https://junit.org/junit5/docs/current/user-guide/
  - title: Maven Surefire Plugin — Using JUnit 5 Platform
    url: https://maven.apache.org/surefire/maven-surefire-plugin/examples/junit-platform.html
  - title: Selenium documentation
    url: https://www.selenium.dev/documentation/
interview:
  - q: What are the main components of JUnit 5?
    a: "JUnit 5 is JUnit Platform plus JUnit Jupiter plus JUnit Vintage. The Platform launches test engines and integrates with build tools and IDEs. Jupiter is the new programming model with annotations like @Test, @BeforeEach and @ParameterizedTest, plus the extension model. Vintage is an engine that runs older JUnit 3 and 4 tests on the Platform."
  - q: How would you compare JUnit 5 and TestNG for UI automation?
    a: "Both are capable. TestNG has long been common in Selenium projects because of testng.xml suites, groups, dependencies and built-in parallel configuration. JUnit 5 offers a cleaner extension model, excellent parameterized tests, nested tests, tags and configurable parallel execution, and is the default in many Java application teams. I would usually align with what the development team already uses, so tests live in one ecosystem."
  - q: Why is assertAll useful?
    a: "assertAll runs every grouped assertion and reports all failures together, instead of stopping at the first. It is useful when checking several independent properties of one result, such as all fields of a profile, so one run shows the full picture. Unlike TestNG's SoftAssert it cannot be forgotten, because the grouping is explicit in one call."
practice:
  - "Convert a TestNG test class with @BeforeMethod, @AfterMethod and a @DataProvider into JUnit 5 with @BeforeEach, @AfterEach and @ParameterizedTest."
  - "Write a @ParameterizedTest with @CsvSource covering the age boundaries 17, 18, 60 and 61 for an eligibility rule."
  - "Tag two tests as smoke and run only those with mvn test -Dgroups=smoke."
takeaways:
  - JUnit 5 is Platform + Jupiter + Vintage; you write tests with the Jupiter API.
  - "@BeforeEach and @AfterEach wrap every test; @BeforeAll and @AfterAll are static by default."
  - JUnit assertions take (expected, actual, message), the opposite of TestNG.
  - "@ParameterizedTest with CsvSource or MethodSource is the JUnit way to data-drive tests."
  - Tags and junit-platform.properties control filtering and parallelism.
quiz:
  - id: ju5-q1
    type: single
    topic: junit-5-essentials
    difficulty: beginner
    prompt: Which JUnit 5 annotation runs before each test method?
    options: ["@Before", "@BeforeEach", "@BeforeMethod", "@BeforeAll"]
    answer: [1]
    explanation: "@BeforeEach is Jupiter's per-test hook. @Before is JUnit 4, @BeforeMethod is TestNG, and @BeforeAll runs once per class."
  - id: ju5-q2
    type: code-output
    topic: junit-5-essentials
    difficulty: intermediate
    prompt: How many test invocations does JUnit report for this method?
    code: |
      @ParameterizedTest
      @CsvSource({"17, false", "18, true", "60, true", "61, false"})
      void eligibility(int age, boolean expected) {
          assertEquals(expected, Eligibility.isEligible(age));
      }
    codeLanguage: java
    options: ["1", "2", "4", "8"]
    answer: [2]
    explanation: "Each CSV row becomes one invocation with its own result, so four are reported. Each row has two values that map to the two parameters; that does not double the count."
  - id: ju5-q3
    type: debugging
    topic: junit-5-essentials
    difficulty: intermediate
    prompt: This class fails to start with a JUnit configuration error. Why?
    code: |
      class ReportTests {
          @BeforeAll
          void startServer() { /* ... */ }

          @Test
          void reportLoads() { /* ... */ }
      }
    codeLanguage: java
    options: ["@Test methods must be public", "@BeforeAll methods must be static unless the class uses @TestInstance(Lifecycle.PER_CLASS)", "@BeforeAll is not a JUnit 5 annotation", "The class must extend TestCase"]
    answer: [1]
    explanation: "With the default per-method lifecycle, @BeforeAll must be static. Making it static or annotating the class with @TestInstance(TestInstance.Lifecycle.PER_CLASS) fixes it. Jupiter test methods do not need to be public, and extending TestCase is JUnit 3."
  - id: ju5-q4
    type: truefalse
    topic: junit-5-essentials
    difficulty: beginner
    prompt: In JUnit 5, assertEquals takes the expected value first and the actual value second.
    options: ["True", "False"]
    answer: [0]
    explanation: "Jupiter's Assertions.assertEquals(expected, actual) puts expected first, unlike TestNG's assertEquals(actual, expected). Swapping them still compares correctly but produces a misleading failure message."
---

## Beginner-friendly explanation

If TestNG is one stage manager, JUnit 5 is another with a slightly different style. Both make sure each test gets a clean stage, both check results, and both report what happened. JUnit is the most widely used testing framework in the Java world, so even if your UI suite uses TestNG, you will meet JUnit in developers' unit tests, in API test projects and in many job descriptions.

The good news: once you understand one, the other is mostly a change of vocabulary.

## Technical explanation

### Architecture

- **JUnit Platform** launches test engines and integrates with Maven, Gradle and IDEs.
- **JUnit Jupiter** is the programming and extension model you write tests with (`org.junit.jupiter.api`).
- **JUnit Vintage** runs JUnit 3/4 tests on the Platform during migrations.

### Lifecycle

| JUnit 5 | TestNG equivalent | Runs |
|---|---|---|
| `@BeforeAll` / `@AfterAll` | `@BeforeClass` / `@AfterClass` | Once per class (static by default) |
| `@BeforeEach` / `@AfterEach` | `@BeforeMethod` / `@AfterMethod` | Around every test |
| `@Test` | `@Test` | The test |
| `@Disabled` | `enabled = false` | Skip |
| `@Tag("smoke")` | `groups = "smoke"` | Filtering |

By default Jupiter creates a **new instance of the test class for every test method**, which keeps fields isolated. `@TestInstance(Lifecycle.PER_CLASS)` changes that.

### Assertions

`Assertions.assertEquals(expected, actual, message)`, `assertTrue`, `assertThrows`, `assertTimeout`, and `assertAll(...)` to group checks and report all failures. Messages can be lazy `Supplier<String>` values.

### Parameterized tests

Add the `junit-jupiter-params` artifact (included in the `junit-jupiter` aggregate) and use `@ParameterizedTest` with a source:

- `@ValueSource(strings = {...})` for one argument
- `@CsvSource({"17, false", "18, true"})` for several
- `@CsvFileSource(resources = "/ages.csv", numLinesToSkip = 1)` for external files
- `@MethodSource("factoryMethod")` returning `Stream<Arguments>` for objects
- `@EnumSource` for enums

### Extensions and parallelism

`@ExtendWith` registers extensions (for example `MockitoExtension`, or your own `TestWatcher` that takes a screenshot on failure). Parallel execution is enabled in `src/test/resources/junit-platform.properties`:

```properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
```

## Real-world example

A team building a lending product had developers' unit tests in JUnit 5 and a separate UI suite in TestNG, with two sets of conventions and two CI reports. For a new API-level test suite, they chose JUnit 5 so developers and testers could review each other's tests easily, reusing the same `@ParameterizedTest` style the developers already used for interest calculations. The UI suite stayed on TestNG; the decision was about fitting the team, not about one framework being "better".

## Step-by-step walkthrough

1. **Add `org.junit.jupiter:junit-jupiter`** (test scope) and a current Maven Surefire plugin (3.x discovers JUnit Platform automatically).
2. **Write a class** with package-private `@Test` methods; no need for `public`.
3. **Set up and tear down** the browser in `@BeforeEach` and `@AfterEach`.
4. **Group related checks** with `assertAll`.
5. **Data-drive boundaries** with `@ParameterizedTest` and `@CsvSource`.
6. **Tag** tests and filter with `-Dgroups=smoke` or `-DexcludedGroups=slow`.

## Code examples

```java
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

class LoginTest {
    WebDriver driver;

    @BeforeEach
    void openBrowser() {
        driver = new ChromeDriver();
        driver.get("https://example.test/login");
    }

    @Test
    @Tag("smoke")
    @DisplayName("Valid login shows the user's name and plan")
    void validLogin() {
        DashboardPage dash = new LoginPage(driver).loginAs("demo", "s3cret");
        assertAll("dashboard header",
            () -> assertEquals("Demo User", dash.userName()),
            () -> assertEquals("Premium", dash.planName()));
    }

    @ParameterizedTest(name = "password ''{0}'' is rejected")
    @CsvSource({"short", "'        '", "nouppercase1"})
    void weakPasswordsAreRejected(String password) {
        String error = new LoginPage(driver).loginExpectingError("demo", password);
        assertFalse(error.isBlank(), "an error message should be shown");
    }

    @AfterEach
    void closeBrowser() {
        if (driver != null) driver.quit();
    }
}
```

## Expected output

Illustrative Maven Surefire output when one `assertAll` check fails; note that both failing assertions are reported:

```text
[INFO] Running LoginTest
[ERROR] Tests run: 4, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 14.2 s <<< FAILURE! -- in LoginTest
[ERROR] LoginTest.validLogin -- Time elapsed: 4.0 s <<< FAILURE!
org.opentest4j.MultipleFailuresError: dashboard header (2 failures)
	org.opentest4j.AssertionFailedError: expected: <Demo User> but was: <demo>
	org.opentest4j.AssertionFailedError: expected: <Premium> but was: <Free>
```

## Common mistakes

- **Importing JUnit 4 (`org.junit.Test`) by accident**, so tests are silently ignored without Vintage.
- **Non-static `@BeforeAll`** without `PER_CLASS` lifecycle.
- **Swapping expected and actual** when moving between TestNG and JUnit.
- **An old Surefire version** that does not discover JUnit Platform tests, so "Tests run: 0".
- **Enabling parallel execution** while sharing a static `WebDriver`.
- **Using `assertTrue(a.equals(b))`**, which gives a useless failure message; use `assertEquals`.

## Troubleshooting

- **"Tests run: 0"**: check imports (`org.junit.jupiter.api.Test`), Surefire version, and class naming (`*Test`, `*Tests`, `Test*`, `*TestCase` by default).
- **`ParameterResolutionException`**: a test or constructor parameter has no resolver; check the source annotation and parameter types.
- **Tests interfere in parallel**: use `@ResourceLock` or keep state in instance fields, not statics.

## Key takeaways summary

JUnit 5 is the standard Java testing framework, with a modern extension model and excellent parameterized tests. Learn the vocabulary differences from TestNG — `@BeforeEach`, `@Tag`, expected-first assertions — and you can work comfortably in either. Choose based on your team's ecosystem, not on fashion.
