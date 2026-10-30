---
slug: data-driven-testing
title: Data-driven testing
summary: Run the same test logic against many data sets using TestNG DataProviders, JUnit 5 parameterized tests and external files — while keeping data meaningful and failures easy to diagnose.
level: intermediate
duration: 35
tags: [data-driven, testng, junit, framework-design, automation]
objectives:
  - Explain when data-driven testing adds value and when it adds noise
  - Implement TestNG DataProviders, including reading from CSV files
  - Implement JUnit 5 parameterized tests with CsvSource and MethodSource
  - Design test data that is independent, readable and traceable to test design techniques
prerequisites:
  - TestNG essentials
  - Collections and exceptions
  - Boundary value analysis and equivalence partitioning
related: [testng-essentials, junit-5-essentials, cucumber-bdd, parallel-execution]
references:
  - title: TestNG documentation (Parameters and DataProviders)
    url: https://testng.org/
  - title: JUnit 5 User Guide — Parameterized tests
    url: https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests
  - title: Cucumber documentation — Scenario outlines and data tables
    url: https://cucumber.io/docs/gherkin/reference/
interview:
  - q: What is data-driven testing and when would you use it?
    a: "It separates test logic from test data, so one test method runs once per data row. I use it when the same behaviour must be checked against many inputs, such as boundary values from BVA, validation rules, currencies or user roles. I avoid it when the rows need different steps or different assertions; then separate tests are clearer."
  - q: How does a TestNG DataProvider work?
    a: "A method annotated with @DataProvider(name = ...) returns Object[][] or Iterator<Object[]>; each inner array is one set of arguments. A @Test with dataProvider = name receives those arguments as parameters and runs once per row, with each invocation reported separately. Setting parallel = true on the DataProvider runs rows concurrently, using the data-provider-thread-count from the suite."
  - q: Where should test data live, in code or in external files?
    a: "Small, stable sets that document a rule, such as boundary values, are clearest in code next to the test. Large sets or data maintained by non-programmers fit CSV or JSON files under src/test/resources. Environment-specific or sensitive data comes from configuration or secrets, and data that tests create should be generated uniquely so runs do not collide."
practice:
  - "Write a DataProvider for a password rule (12 to 64 characters) using three-value boundary values, and a test that checks acceptance or rejection for each."
  - "Move the rows into a CSV file under src/test/resources and read it in the DataProvider with a header row skipped."
  - "Convert the same test to JUnit 5 with @ParameterizedTest and @CsvFileSource."
takeaways:
  - Data-driven tests run one logic many times; each row is reported separately.
  - Choose rows with test design techniques, not at random.
  - Include a description column so failures name the scenario.
  - Keep rows independent and data creation unique per run.
  - Split into separate tests when rows need different steps.
quiz:
  - id: ddt-q1
    type: single
    topic: data-driven-testing
    difficulty: beginner
    prompt: What must a TestNG @DataProvider method return?
    options: ["A List of Strings", "Object[][] or an Iterator of Object[]", "A Map of String to Object", "void"]
    answer: [1]
    explanation: "Each Object[] is one set of arguments for the test method. TestNG also accepts Iterator<Object[]> for lazily produced rows. Lists of strings and maps are not supported return types for a DataProvider."
  - id: ddt-q2
    type: code-output
    topic: data-driven-testing
    difficulty: intermediate
    prompt: How many test results does TestNG report for this class?
    code: |
      @DataProvider(name = "coupons")
      public Object[][] coupons() {
          return new Object[][] {
              {"SAVE10", true}, {"EXPIRED5", false}, {"", false}
          };
      }
      @Test(dataProvider = "coupons")
      public void couponValidation(String code, boolean valid) { /* ... */ }
      @Test
      public void couponFieldIsVisible() { /* ... */ }
    codeLanguage: java
    options: ["2", "3", "4", "6"]
    answer: [2]
    explanation: "The data-driven method runs once per row (3) and the plain test runs once (1), giving 4 results. The two values in each row are arguments, not separate invocations."
  - id: ddt-q3
    type: debugging
    topic: data-driven-testing
    difficulty: intermediate
    prompt: TestNG fails before running the test with 'data provider mismatch'. What is wrong?
    code: |
      @DataProvider(name = "users")
      public Object[][] users() {
          return new Object[][] { {"admin", "s3cret", "Admin"} };
      }
      @Test(dataProvider = "users")
      public void loginShowsRole(String user, String role) { /* ... */ }
    codeLanguage: java
    options: ["DataProvider names must be capitalised", "Each row has three values but the method accepts two parameters", "Strings cannot be passed through a DataProvider", "The test needs @Parameters"]
    answer: [1]
    explanation: "The number and types of values in each row must match the test method's parameters. Add a password parameter or remove the column. @Parameters is for testng.xml values, not DataProviders."
  - id: ddt-q4
    type: truefalse
    topic: data-driven-testing
    difficulty: beginner
    prompt: Data-driven testing is a good fit when each data row needs a different sequence of steps.
    options: ["True", "False"]
    answer: [1]
    explanation: "Data-driven testing shines when the steps are identical and only data varies. Different steps mean different tests; forcing them into one method with conditionals makes failures hard to understand."
---

## Beginner-friendly explanation

Think of a cake mould. You pour in chocolate batter, then vanilla, then lemon: same mould, different cakes. You do not build a new mould for each flavour.

**Data-driven testing** is a test mould. You write the steps once — "enter the coupon, click Apply, check the result" — then pour in different data: a valid coupon, an expired one, an empty one. Each run is reported as its own test, so you can see exactly which flavour failed.

## Technical explanation

Data-driven testing separates **test logic** from **test data**. The framework runs the logic once per data row and reports each invocation individually.

### Choosing the data

Rows should come from test design techniques, not guesswork:

| Source technique | Example rows for "age 18 to 60" |
|---|---|
| [Boundary value analysis](/learn/manual-testing/boundary-value-analysis) | 17, 18, 60, 61 |
| [Equivalence partitioning](/learn/manual-testing/equivalence-partitioning) | 10 (invalid low), 35 (valid), 75 (invalid high) |
| Decision tables | Combinations of member/non-member and coupon/no coupon |

### TestNG

- `@DataProvider(name = "x")` returns `Object[][]` or `Iterator<Object[]>`.
- `@Test(dataProvider = "x")` receives one row per invocation; parameter count and types must match.
- `dataProviderClass` lets you keep providers in a separate class.
- `@DataProvider(parallel = true)` runs rows concurrently; the suite attribute `data-provider-thread-count` controls the pool (default 10).
- `@Parameters` is different: it reads single values from testng.xml, typically environment settings such as browser.

### JUnit 5

`@ParameterizedTest` with `@ValueSource`, `@CsvSource`, `@CsvFileSource` or `@MethodSource`. The `name` attribute customises how each invocation is displayed.

### BDD

Cucumber expresses the same idea with **Scenario Outline** and **Examples** tables (see [Cucumber and BDD](/learn/automation/cucumber-bdd)).

```mermaid
flowchart LR
  D["Data source: code, CSV, JSON"] --> P["DataProvider or ArgumentsSource"]
  P -->|"row 1"| T["Same test logic"]
  P -->|"row 2"| T
  P -->|"row n"| T
  T --> R["One result per row in the report"]
```

## Real-world example

A tax-filing product had to validate dozens of identifier formats across regions. The team first wrote one test per format, copying the same steps each time; a change to the form's submit button meant editing every copy. They replaced them with a single data-driven test fed from a CSV maintained jointly with the business analyst, with columns for region, input, expected result and a human-readable description. Adding a new rule became a one-line data change that the analyst could review, and failures named the exact rule that broke.

## Step-by-step walkthrough

1. **Confirm the steps are identical** for every case; only data and expected result vary.
2. **Derive rows** from BVA, EP or decision tables.
3. **Add a description column** so reports name the case.
4. **Choose the source**: inline for small, rule-documenting sets; files for larger or business-owned sets.
5. **Implement the provider** and match parameter types exactly.
6. **Keep rows independent**; generate unique data (such as emails) when tests create records.
7. **Run and read** the per-row results.

## Code examples

A TestNG DataProvider reading a CSV with a header row:

```java
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class CouponTests extends BaseTest {

    // src/test/resources/coupons.csv
    // description,code,expectedMessage
    // valid ten percent,SAVE10,Coupon applied
    // expired coupon,EXPIRED5,This coupon has expired
    // empty input,,Enter a coupon code

    @DataProvider(name = "coupons")
    public Object[][] coupons() {
        try {
            List<String> lines = Files.readAllLines(Path.of("src/test/resources/coupons.csv"));
            return lines.stream()
                    .skip(1)                                   // header
                    .map(line -> (Object[]) line.split(",", -1)) // -1 keeps the empty code
                    .toArray(Object[][]::new);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot read coupons.csv", e);
        }
    }

    @Test(dataProvider = "coupons")
    public void couponShowsExpectedMessage(String description, String code, String expectedMessage) {
        String message = new CartPage(driver).open(Config.BASE_URL).applyCoupon(code);
        Assert.assertEquals(message, expectedMessage, description);
    }
}
```

The JUnit 5 equivalent uses `@ParameterizedTest(name = "{0}")` and `@CsvFileSource(resources = "/coupons.csv", numLinesToSkip = 1)` on a method with the same three parameters.

## Expected output

Illustrative TestNG output when the expired-coupon row fails; the description column makes the failure self-explanatory:

```text
PASSED: couponShowsExpectedMessage("valid ten percent", "SAVE10", "Coupon applied")
PASSED: couponShowsExpectedMessage("empty input", "", "Enter a coupon code")
FAILED: couponShowsExpectedMessage("expired coupon", "EXPIRED5", "This coupon has expired")
java.lang.AssertionError: expired coupon expected [This coupon has expired] but found [Coupon applied]
```

## Common mistakes

- **Random or arbitrary data** that does not target any boundary or partition.
- **Conditionals in the test** (`if (row == 3) ...`) to handle special rows; they need their own test.
- **Rows that depend on each other**, such as row 2 using the account row 1 created.
- **Hardcoded unique values** like a fixed email that only works on the first run.
- **No description**, so failures read as a list of anonymous values.
- **Naive CSV parsing** with `split(",")` when values may contain commas; use a CSV library for real data.

## Troubleshooting

- **"data provider mismatch"**: row length or types do not match the method signature.
- **File not found in CI**: resolve paths from the classpath (`getResourceAsStream`) or the project root consistently.
- **Rows interfere in parallel**: they share an account or record; give each row its own data.
- **Reports show only one result**: the method is not linked to the provider name, or the provider returned a single row.

## Key takeaways summary

Data-driven testing removes duplication when only the data changes. Pick rows with test design techniques, label every row, keep rows independent, and choose inline or external data based on who maintains it. When steps start to differ between rows, split the test instead.
