---
slug: unit-and-component-testing
title: Unit and Component Testing
summary: Component testing checks the smallest testable parts of a system in isolation. Learn what a component is, who tests it, how stubs and drivers isolate it, and why this level catches defects most cheaply.
level: beginner
duration: 30
tags: [test-levels, component-testing, istqb, white-box]
objectives:
  - Define component (unit) testing and its test basis, test objects and typical defects
  - Explain how stubs, drivers and mocks isolate a component from its dependencies
  - Describe who usually performs component testing and how testers contribute to it
  - Recognise what component testing cannot find and why higher test levels are still needed
prerequisites:
  - What is software testing
  - Basic reading knowledge of a programming language
related: [integration-testing, system-and-end-to-end-testing, test-doubles-and-mocking, test-pyramid-and-strategy, black-white-gray-box-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 2.2.1, Test levels)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: JUnit 5 User Guide
    url: https://junit.org/junit5/docs/current/user-guide/
  - title: ISTQB official site and glossary
    url: https://www.istqb.org/
interview:
  - q: What is component testing and how is it different from unit testing?
    a: In ISTQB terminology they are the same test level. Component testing, also called unit testing, focuses on components that can be tested separately, such as a function, class or module. It is usually done by developers in their own environment, often needs test harnesses or unit test frameworks, and checks both functional behaviour and some structural aspects such as statement or branch coverage. Some teams use "unit" for a single class and "component" for a small group of classes, so I clarify the team's convention first.
  - q: Why do we use stubs and drivers in component testing?
    a: A component rarely runs alone. A stub replaces a component that the one under test calls, such as a payment gateway or repository, and returns controlled answers. A driver replaces the caller, invoking the component with chosen inputs. Together they isolate the component so a failure points to that component and the test is fast and repeatable. Today unit test frameworks act as drivers and mocking libraries provide stubs and mocks.
  - q: As a manual tester, how can you add value at the component level?
    a: I can review unit tests against requirements to spot missing boundary and negative cases, apply techniques like boundary value analysis and decision tables to suggest test data, read coverage reports to find untested branches in risky code, and take part in test-first practices such as TDD or BDD by helping define examples before code is written. I do not need to write every unit test to improve their quality.
practice:
  - "A function calculateShipping(weightKg, zone) returns a fee. List the dependencies you would stub, and design six component tests covering boundaries and an invalid zone."
  - "Open any open-source project's unit tests and find one test that checks only the happy path. Write two additional test ideas that would make it stronger."
  - "Explain to a non-technical colleague, in three sentences, why a passing unit test suite does not prove the login page works."
takeaways:
  - Component testing and unit testing are the same ISTQB test level, focused on separately testable parts.
  - Stubs replace called components; drivers replace callers; mocks also verify interactions.
  - Defects found at the component level are the cheapest to diagnose and fix.
  - High code coverage shows what was executed, not that behaviour is correct.
  - Component tests cannot reveal interface, configuration or end-to-end workflow defects; other levels are still needed.
quiz:
  - id: unitcomp-q1
    type: single
    topic: unit-and-component-testing
    difficulty: beginner
    prompt: According to ISTQB CTFL v4.0, which statement best describes component testing?
    options: ["Testing the complete integrated system against requirements", "Testing components that can be tested separately, often by developers using a unit test framework", "Testing performed by end users at their own site", "Testing the interfaces between two separately developed systems"]
    answer: [1]
    explanation: Component (unit) testing focuses on separately testable components and is commonly done by developers with test harnesses. The first option is system testing, the third is beta testing, and the fourth is system integration testing.
  - id: unitcomp-q2
    type: single
    topic: unit-and-component-testing
    difficulty: intermediate
    prompt: A component calls an external tax service that is not yet built. What do you use in its place during component testing?
    options: ["A driver", "A stub", "A beta tester", "A smoke test"]
    answer: [1]
    explanation: A stub stands in for a component that is called by the component under test and returns controlled responses. A driver is the opposite, it calls the component under test.
  - id: unitcomp-q3
    type: truefalse
    topic: unit-and-component-testing
    difficulty: beginner
    prompt: If unit tests achieve 100% statement coverage, the component is free of defects.
    options: ["True", "False"]
    answer: [1]
    explanation: Coverage measures which statements were executed, not whether the results were checked correctly or whether requirements were implemented. Missing logic and weak assertions are invisible to coverage.
  - id: unitcomp-q4
    type: code-output
    topic: unit-and-component-testing
    difficulty: intermediate
    prompt: "The rule is: orders of 1000 or more get 10% off. Which single test value exposes the defect?"
    code: |
      double discount(double total) {
          if (total > 1000) return total * 0.10;
          return 0;
      }
    codeLanguage: java
    options: ["999", "1000", "1500", "0"]
    answer: [1]
    explanation: The code uses `> 1000` instead of `>= 1000`, so exactly 1000 wrongly gets no discount. 999 and 0 correctly get none and 1500 correctly gets 10%, so only the boundary reveals the defect.
---

## Beginner-friendly explanation

Think about building a bicycle. Before you bolt everything together, you would spin each wheel to check it runs true, squeeze each brake lever and look at the pads, and check that the gears click. If the finished bike wobbles, you want to have already ruled out the wheel.

**Component testing** (also called **unit testing**) is that first check. Software is made of small building blocks: a function that calculates tax, a class that validates an email address, a module that formats dates. Each block is tested on its own, before it is combined with others. When a test fails here, you know almost exactly where the problem is, and fixing it takes minutes rather than days.

## Technical explanation

ISTQB CTFL v4.0 lists five test levels: **component testing**, **component integration testing**, **system testing**, **system integration testing** and **acceptance testing**. Component testing (unit testing) is the first and focuses on components that can be tested separately.

| Aspect | Component testing |
|---|---|
| Test objects | Functions, methods, classes, modules, database procedures |
| Test basis | Detailed design, component specification, code, user story acceptance criteria |
| Typical defects | Incorrect logic, off-by-one errors, wrong calculations, unhandled nulls and exceptions, incorrect data flow inside the component |
| Who usually tests | Developers, often with tester input |
| Environment | Developer machine or CI, using a unit test framework |

### Isolation: stubs, drivers and mocks

A component usually depends on others. To test it alone you replace those dependencies with **test doubles**:

- **Stub**: replaces a component that is *called by* the component under test and returns predefined answers.
- **Driver**: replaces a component that *calls* the component under test, feeding it inputs. A unit test framework such as JUnit is effectively a driver.
- **Mock**: a stub that also records and verifies how it was called (for example "the email service was called once").

```mermaid
flowchart LR
  D["Driver (test framework)"] --> C["Component under test"]
  C --> S1["Stub: repository"]
  C --> S2["Mock: email service"]
```

Component tests can be black-box (derived from the specification) or white-box (derived from the code structure, measured by statement and branch coverage). In practice they are both: you design cases from behaviour, then use coverage to see which branches nobody exercised.

### Test-first approaches

In **test-driven development (TDD)**, the developer writes a failing component test, writes just enough code to pass it, then refactors. TDD produces a large, fast regression suite as a side effect, but it does not replace testing at higher levels.

## Real-world example

A team building an insurance quote engine had a `PremiumCalculator` class with rules for age bands, no-claims discounts and regional loading. Testers reviewed the developer's unit tests against the pricing specification and noticed every test used a driver aged 30 to 50. Using boundary value analysis they suggested tests at the age-band edges (24, 25, 64, 65) and a zero-claims-history case.

Two of the new tests failed: the band for drivers aged exactly 25 used the younger driver's loading. Because the failure was in an isolated component test with stubbed rate tables, the developer found and fixed the comparison in a few minutes. Had the same defect surfaced in system testing, someone would first have had to work out whether the UI, the rate data or the calculation was wrong.

## Step-by-step walkthrough

1. **Identify the component and its responsibility.** One clear sentence: "Calculates the discount for an order total."
2. **List inputs, outputs and dependencies.** Which other components does it call? Those become stubs or mocks.
3. **Design test cases with black-box techniques.** Equivalence partitions, boundaries, decision tables for rule combinations, and invalid inputs.
4. **Write each test in Arrange, Act, Assert form.** Set up data and doubles, call the component once, check the result.
5. **Run and read coverage.** Look for untested branches, especially error-handling paths.
6. **Add tests for any uncovered risky branch**, then keep the suite in CI so it runs on every change.

## Code examples

A JUnit 5 component test for the discount rule from the quiz, with boundaries chosen deliberately:

```java
class DiscountCalculatorTest {

    private final DiscountCalculator calc = new DiscountCalculator();

    @ParameterizedTest
    @CsvSource({
        "999.99, 0.00",    // just below the threshold
        "1000.00, 100.00", // exactly on the threshold
        "1500.00, 150.00"  // typical value in the discount partition
    })
    void appliesTenPercentFromOneThousand(double total, double expected) {
        assertEquals(expected, calc.discount(total), 0.001);
    }
}
```

## Expected output

Against the buggy `total > 1000` implementation, the runner reports one failing case and two passes:

```text
appliesTenPercentFromOneThousand(double, double)
  [1] 999.99, 0.00     PASSED
  [2] 1000.00, 100.00  FAILED  expected: <100.0> but was: <0.0>
  [3] 1500.00, 150.00  PASSED
```

## Common mistakes

- **Only testing the happy path.** Error handling, nulls and boundaries are where component defects hide.
- **Treating coverage as a quality score.** A test with no assertions still increases coverage.
- **Testing through real dependencies.** Calling a real database or network makes tests slow and flaky, and failures stop pointing at the component.
- **Over-mocking.** Mocking every internal call ties tests to implementation details, so harmless refactoring breaks them.
- **Assuming unit tests make higher levels unnecessary.** Components that each work can still fail together; see [integration testing](/learn/manual-testing/integration-testing).

## Troubleshooting

- **A test passes alone but fails in the full suite.** Tests share state (static variables, a shared clock, files). Reset state in setup and avoid ordering dependencies.
- **A component is hard to test in isolation.** It probably creates its dependencies internally. Suggest dependency injection so doubles can be passed in.
- **Tests break after every refactor.** They are checking *how* the code works rather than *what* it returns. Assert on outputs and observable behaviour.

## Key takeaways summary

Component testing is the first and cheapest test level. Isolate the component with stubs, drivers and mocks, design cases with proper techniques rather than only happy paths, and read coverage as a pointer to gaps, not as proof of quality. Then rely on higher levels for what isolated tests cannot see.
