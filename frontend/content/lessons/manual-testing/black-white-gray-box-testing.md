---
slug: black-white-gray-box-testing
title: Black-box, white-box and gray-box testing
summary: Black-box tests are derived from the specified behaviour, white-box tests from the internal structure, and gray-box testing blends the two. Learn how each works, which techniques belong to each, and when to use them.
level: beginner
duration: 30
tags: [fundamentals, istqb, test-design, black-box, white-box]
objectives:
  - Define black-box and white-box test techniques using ISTQB terminology
  - Name the main techniques in each category, including experience-based techniques
  - Explain gray-box testing and why it is an industry term rather than an ISTQB category
  - Calculate statement and branch coverage for a small piece of code
prerequisites:
  - What is software testing?
  - Static and dynamic testing
related: [equivalence-partitioning, boundary-value-analysis, decision-table-testing, state-transition-testing, error-guessing, unit-and-component-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (chapter 4, Test Analysis and Design)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISO/IEC/IEEE 29119-4 Software testing — Test techniques
    url: https://www.iso.org/standard/60245.html
  - title: ISTQB Glossary of testing terms
    url: https://glossary.istqb.org/
interview:
  - q: What is the difference between black-box and white-box testing?
    a: Black-box testing, also called specification-based testing, derives tests from the specified behaviour of the test object without reference to its internal structure. White-box testing, also called structure-based testing, derives tests from the internal structure, such as code, architecture or workflows. Black-box tests remain valid when the implementation changes as long as the behaviour does not; white-box tests let you measure how much of the structure has been exercised.
  - q: What is gray-box testing?
    a: It is an industry term for testing from the outside while using some knowledge of the internals, for example designing API tests with knowledge of the database schema, or checking database records after a UI action. ISTQB CTFL does not define it as a separate category; its three categories are black-box, white-box and experience-based techniques.
  - q: What is the difference between statement coverage and branch coverage?
    a: Statement coverage measures the percentage of executable statements exercised by the tests. Branch coverage measures the percentage of branches, both unconditional and conditional outcomes such as the true and false outcome of an if, that have been exercised. Full branch coverage implies full statement coverage, but not the other way round, because an if with no else can be fully statement-covered by a single true case while its false branch is never taken.
  - q: Does a manual tester need white-box skills?
    a: Not always for day-to-day manual testing, which is mostly black-box and experience-based. But basic white-box understanding helps in reading coverage reports, discussing unit tests with developers, doing gray-box checks such as verifying database state, and it is essential for automation and developer-in-test roles.
practice:
  - "For a login form, write two black-box tests from the requirements and describe one gray-box check you could add if you had read access to the database."
  - "Write a function with two independent if statements. Design the minimum test set for 100% statement coverage, then for 100% branch coverage."
  - "Classify these techniques as black-box, white-box or experience-based: decision table testing, branch testing, exploratory testing, state transition testing, checklist-based testing."
takeaways:
  - Black-box (specification-based) techniques derive tests from specified behaviour, not code.
  - White-box (structure-based) techniques derive tests from internal structure and measure structural coverage.
  - ISTQB's third category is experience-based techniques; gray-box is an industry term, not an ISTQB category.
  - 100% branch coverage implies 100% statement coverage, but not the reverse.
  - Full structural coverage does not prove the code meets its requirements; combine both views.
quiz:
  - id: bwg-q1
    type: multiple
    topic: black-white-gray-box-testing
    difficulty: beginner
    prompt: Which of these are black-box test techniques in the ISTQB CTFL v4.0 syllabus? Select all that apply.
    options: ["Equivalence partitioning", "Branch testing", "Boundary value analysis", "State transition testing", "Statement testing"]
    answer: [0, 2, 3]
    explanation: Equivalence partitioning, boundary value analysis and state transition testing (along with decision table testing) are black-box techniques. Statement and branch testing are white-box techniques because they are derived from the code structure.
  - id: bwg-q2
    type: code-output
    topic: black-white-gray-box-testing
    difficulty: intermediate
    prompt: What is the minimum number of test cases needed to achieve 100% branch coverage of this function?
    code: |
      def label(score):
          result = "standard"
          if score >= 90:
              result = "gold"
          return result
    codeLanguage: python
    options: ["1", "2", "3", "4"]
    answer: [1]
    explanation: One test with score 95 executes every statement, giving 100% statement coverage, but only the true branch of the if. A second test such as score 50 is needed for the false branch, so branch coverage needs 2 tests.
  - id: bwg-q3
    type: truefalse
    topic: black-white-gray-box-testing
    difficulty: beginner
    prompt: Gray-box testing is one of the three categories of test techniques defined in the ISTQB CTFL v4.0 syllabus.
    options: ["True", "False"]
    answer: [1]
    explanation: The three ISTQB categories are black-box, white-box and experience-based techniques. Gray-box is a widely used industry term for blending outside-in testing with partial knowledge of internals.
  - id: bwg-q4
    type: scenario
    topic: black-white-gray-box-testing
    difficulty: intermediate
    prompt: A tester submits an order through the web UI, then queries the test database to confirm the order row has the correct status and that no duplicate row was created. How is this approach usually described?
    options: ["Pure black-box testing", "White-box statement testing", "Gray-box testing", "Static testing"]
    answer: [2]
    explanation: The test is driven from the user interface like a black-box test, but uses knowledge of the internal data model to verify results, which is the usual meaning of gray-box testing. It is not statement testing because no code coverage is measured, and it is dynamic because the software is executed.
---

## Beginner-friendly explanation

Imagine testing a vending machine.

- **Black-box:** you stand in front of it like any customer. You do not know what is inside. You put in coins, press buttons and check that the right snack and the right change come out. You test it against what it is *supposed* to do.
- **White-box:** an engineer opens the front panel. They can see every coil, sensor and wire. They design checks to make sure every coil turns, every sensor triggers, and every path the coins can take is used at least once. They test against *how it is built*.
- **Gray-box:** you test from the front like a customer, but you have seen the wiring diagram. So after buying a snack, you also open the coin box to check the coins landed in the right tube. You use some inside knowledge to make outside tests sharper.

Each viewpoint finds different problems. A customer will never notice an unused coil; an engineer might never think to buy two snacks in a row with exact change.

## Technical explanation

The ISTQB CTFL v4.0 syllabus (chapter 4) groups test techniques into three categories:

| Category | Also called | Test basis | Techniques in CTFL v4.0 |
|---|---|---|---|
| Black-box | Specification-based | Specified behaviour: requirements, user stories, use cases, specifications | Equivalence partitioning, boundary value analysis, decision table testing, state transition testing |
| White-box | Structure-based | Internal structure: code, architecture, detailed design, data flows | Statement testing, branch testing |
| Experience-based | (none) | Knowledge and experience of testers, developers, users | Error guessing, exploratory testing, checklist-based testing |

Key points:

- **Black-box tests are independent of the implementation.** If the code is rewritten but the behaviour is unchanged, the tests still apply. They can be designed before code exists.
- **White-box tests can only be fully designed once the structure exists**, and they let you **measure coverage** of that structure. They can find defects even when the specification is vague or incomplete.
- **Neither is sufficient alone.** Black-box tests cannot reveal untested code paths; white-box tests cannot detect a missing requirement, because code that was never written has no structure to cover.

### Gray-box testing

**Gray-box testing** is a widely used industry term, not one of the ISTQB CTFL categories. It describes testing through external interfaces while using partial knowledge of internals, for example:

- verifying database records after a UI or API action,
- designing API tests using knowledge of service boundaries and the data model,
- reading logs to confirm which internal path a request took,
- targeting known integration points with boundary or error-handling tests.

### Statement and branch coverage

```mermaid
flowchart TD
  S["Start: price, is_member"] --> C1{"is_member?"}
  C1 -- "true" --> D["price = price * 0.9"]
  C1 -- "false" --> R
  D --> R["return round(price, 2)"]
```

- **Statement coverage** = statements executed ÷ total executable statements × 100%.
- **Branch coverage** = branches exercised ÷ total branches × 100%. A branch is a transfer of control between two nodes, so each decision outcome counts, and so do unconditional transfers.

Achieving 100% branch coverage guarantees 100% statement coverage, but not the reverse.

## Code examples

```python
def member_price(price: float, is_member: bool) -> float:
    if is_member:
        price = price * 0.9
    return round(price, 2)
```

| Test set | Statement coverage | Branch coverage |
|---|---|---|
| `member_price(100.0, True)` only | 100% (all three statements) | 50%: the false outcome of `if is_member` is never taken |
| `member_price(100.0, True)` and `member_price(100.0, False)` | 100% | 100% |

## Expected output

```text
member_price(100.0, True)  -> 90.0
member_price(100.0, False) -> 100.0
```

Both results match the specification "members get 10% off". The black-box view checks that; the white-box view confirms both paths through the code have been exercised.

## Real-world example

A generic scenario: a team builds a loan-eligibility API.

- **Black-box:** the tester uses the business rules to build a decision table of income bands, employment status and existing debt, and boundary tests on the income thresholds. Several cases fail because the debt-to-income threshold was implemented as `>` instead of `>=`.
- **White-box:** developers run unit tests with branch coverage. The report shows an error-handling branch for a missing credit-score response that no test reaches. They add a test with a stubbed timeout and find the API returns "eligible" by default on timeout, a serious defect no business rule would have prompted.
- **Gray-box:** the tester checks the audit table after each API call and finds that declined applications are not being logged, breaching an audit requirement that the API response alone could never reveal.

## Common mistakes

- **Thinking black-box means "no thinking".** Black-box techniques are systematic and precise; they are not random clicking.
- **Treating 100% coverage as "fully tested".** Code can be fully covered and still be wrong, or missing a requirement entirely.
- **Confusing statement and branch coverage.** An `if` without an `else` is the classic case where they differ.
- **Calling gray-box an ISTQB category in an exam.** Use black-box, white-box and experience-based.
- **Assuming manual testers never need white-box knowledge.** It helps when reading coverage reports and in gray-box checks, even if it is not essential for every manual role.

## Key takeaways summary

Black-box techniques test what the system should do, white-box techniques test how it is built, and experience-based techniques use testers' knowledge. Gray-box testing is a practical blend of outside-in tests with inside knowledge. Strong test approaches combine them, because each view finds defects the others cannot.
