---
slug: traceability-matrix-and-coverage
title: Traceability Matrix and Requirements Coverage
summary: A requirements traceability matrix links requirements to tests and results. Learn forward, backward and bidirectional traceability, how to build an RTM, and how to calculate and honestly interpret coverage.
level: beginner
duration: 30
tags: [test-documentation, traceability, coverage, istqb]
objectives:
  - Explain forward, backward and bidirectional traceability
  - Build a requirements traceability matrix linking requirements, tests, results and defects
  - Calculate requirements coverage and execution status from an RTM
  - Explain why 100 percent requirements coverage does not mean the product is defect-free
prerequisites:
  - Test scenarios and test cases
related: [test-scenarios-and-test-cases, test-strategy-vs-test-plan, test-execution-and-closure-reports, release-sign-off, risk-based-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 1.4.4, Traceability)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: Jira guides
    url: https://www.atlassian.com/software/jira/guides
interview:
  - q: What is a requirements traceability matrix and why is it useful?
    a: It is a table, or tool-generated view, that links each requirement to the test cases that cover it, their latest results and any linked defects. It shows which requirements have no tests, which tests no longer map to a requirement, the impact of a requirement change, and the test status of each requirement for reporting and sign-off. In regulated domains it is often an audit requirement.
  - q: What is the difference between forward and backward traceability?
    a: Forward traceability goes from requirements to tests — it answers "is every requirement tested?". Backward traceability goes from tests (or defects) back to requirements — it answers "why does this test exist?" and finds orphan tests or gold-plated features. Bidirectional traceability maintains both, which is what you need for impact analysis.
  - q: If every requirement is covered by at least one test, is the product fully tested?
    a: No. Coverage of 100 percent means each requirement has at least one linked test, not that the tests are thorough. A requirement could be covered by a single happy-path test with no negative or boundary cases. It also says nothing about implicit requirements, non-functional qualities or missing requirements. I report coverage alongside depth, risk and results.
practice:
  - "Build an RTM for a login feature with five requirements (valid login, invalid password, lockout, remember me, logout). Include at least one requirement with no test and one test with no requirement, then explain what each gap means."
  - "Given an RTM where 18 of 20 requirements have tests and 15 of those passed, calculate requirements coverage and the percentage of requirements passed."
  - "A requirement changes mid-sprint. Describe how you would use the RTM to find every affected test."
takeaways:
  - Traceability links requirements, test conditions, cases, results and defects.
  - Forward traceability finds untested requirements; backward finds orphan tests.
  - Requirements coverage = requirements with at least one linked test ÷ total requirements × 100.
  - Coverage measures breadth, not depth; pair it with risk and results.
  - Keep traceability in a tool where possible so it stays current.
quiz:
  - id: rtm-cov-q1
    type: single
    topic: traceability-matrix-and-coverage
    difficulty: beginner
    prompt: Which question does backward traceability answer?
    options:
      - "Is every requirement covered by a test?"
      - "Which requirement does this test case or defect relate to?"
      - "How long will testing take?"
      - "Which tester executed the test?"
    answer: [1]
    explanation: "Backward traceability goes from tests or defects back to requirements, revealing orphan tests. Checking that every requirement has a test is forward traceability."
  - id: rtm-cov-q2
    type: code-output
    topic: traceability-matrix-and-coverage
    difficulty: intermediate
    prompt: Using the RTM extract below, what is the requirements coverage?
    code: |
      REQ-01  TC-01, TC-02
      REQ-02  TC-03
      REQ-03  (none)
      REQ-04  TC-04, TC-05, TC-06
      REQ-05  (none)
    codeLanguage: text
    options: ["40%", "60%", "75%", "100%"]
    answer: [1]
    explanation: "Three of five requirements have at least one linked test: 3 ÷ 5 × 100 = 60%. The number of tests per requirement does not change requirements coverage."
  - id: rtm-cov-q3
    type: truefalse
    topic: traceability-matrix-and-coverage
    difficulty: beginner
    prompt: 100 percent requirements coverage guarantees that all defects related to those requirements have been found.
    options: ["True", "False"]
    answer: [1]
    explanation: "Coverage only proves each requirement has at least one test. Those tests may be shallow, and testing can show the presence of defects but not their absence."
  - id: rtm-cov-q4
    type: scenario
    topic: traceability-matrix-and-coverage
    difficulty: intermediate
    prompt: "The RTM shows test TC-44 is not linked to any requirement. What is the most appropriate action?"
    options:
      - "Delete it immediately"
      - "Investigate: link it to the right requirement, flag a missing requirement, or retire it if obsolete"
      - "Ignore it; orphan tests are harmless"
      - "Mark it as passed so coverage looks complete"
    answer: [1]
    explanation: "An orphan may test a real but undocumented requirement, a removed feature, or be a linking mistake. Investigation decides; deleting it blindly may lose valuable coverage, and falsifying status is never acceptable."
---

## Beginner-friendly explanation

Imagine a wedding planner with a checklist from the couple: flowers, music, cake, photographer. Next to each item the planner writes who is handling it and whether it is confirmed. One glance shows that the cake has no supplier yet. And if a bill arrives for fireworks, the planner can see it matches nothing on the list and ask why.

A **traceability matrix** is that checklist for testing. Each requirement sits in a row, with the tests that check it, their results and any defects. Gaps jump out in both directions.

## Technical explanation

ISTQB describes **traceability** as the ability to establish relationships between work products, such as between test basis items (requirements, user stories), test conditions, test cases, test results and defects.

- **Forward traceability**: requirement → tests. Finds requirements with no tests.
- **Backward traceability**: test or defect → requirement. Finds orphan tests and undocumented behaviour.
- **Bidirectional traceability**: both. Needed for **impact analysis** when a requirement changes.

A **requirements traceability matrix (RTM)** is the table (or tool report) that holds these links. Typical columns: requirement ID, description, priority or risk, test case IDs, latest execution status, defect IDs.

### Coverage calculations

Common definitions (organisations may define them differently, so always state the formula you use):

```text
Requirements coverage (%) = requirements with ≥1 linked test ÷ total requirements × 100
Requirements passed (%)   = requirements whose linked tests all passed ÷ total requirements × 100
Test execution (%)        = tests executed ÷ tests planned × 100
```

### Traceability in agile teams

Agile teams rarely maintain a separate spreadsheet. Instead, the user story is the requirement, and test cases, exploratory session notes, automated test results and defects are **linked to the story** in the issue tracker or test management tool. The "matrix" is then a generated report or dashboard filtered by release or epic. The principle is unchanged: every story should show which tests verified it and with what result, and every defect should point back to the behaviour it violates. Lightweight does not mean absent.

## Real-world example

A healthcare scheduling app is releasing an appointment-booking module. The RTM, exported from the test management tool, looks like this on the day before sign-off:

| Req ID | Requirement | Risk | Test cases | Status | Defects |
|---|---|---|---|---|---|
| REQ-101 | Patient books an available slot | High | TC-201, TC-202, TC-203 | Passed | none |
| REQ-102 | Double booking of a slot is prevented | High | TC-204, TC-205 | Failed | DEF-311 (High, open) |
| REQ-103 | Confirmation email sent within 5 minutes | Medium | TC-206 | Passed | none |
| REQ-104 | Patient cancels up to 24 hours before | Medium | TC-207, TC-208 | Blocked | DEF-315 (env) |
| REQ-105 | Clinic admin can block holidays | Medium | none | Not covered | none |
| REQ-106 | Slots shown in patient's time zone | High | TC-209 | Not run | none |
| none | (orphan) | n/a | TC-230 "Export to calendar" | Passed | none |

Reading it:

- **Coverage** = 5 of 6 requirements have tests = **83.3%**. REQ-105 has no tests: a gap to fix or to accept explicitly as a risk.
- **Requirements passed** = REQ-101 and REQ-103 = 2 of 6 = **33.3%**.
- REQ-102 is a **High-risk failure**; it should block sign-off unless the product owner accepts the risk.
- TC-230 is an **orphan**. Investigation showed "export to calendar" was built but never written down; the product owner added REQ-107.

That last point is why backward traceability matters: it found an undocumented feature that nobody would otherwise have included in the release notes or the regression suite.

```mermaid
flowchart LR
  R[Requirement REQ-102] --> C[Test condition: no double booking]
  C --> T1[TC-204]
  C --> T2[TC-205]
  T2 --> X[Result: Failed]
  X --> D[DEF-311]
  D -. backward .-> R
```

## Step-by-step walkthrough

1. **Give every requirement a stable ID** (story key or requirement number).
2. **Link each test case** to the requirement(s) it verifies when you write it, not at the end.
3. **Add risk or priority** to each requirement so gaps can be prioritised.
4. **Link defects** to the failing test and requirement.
5. **Review forward gaps** (requirements without tests) and **backward gaps** (tests without requirements) before execution starts.
6. **Refresh status** during execution and use the RTM in progress and closure reports.
7. **On a requirement change**, filter the RTM by that ID to find every test and defect affected.

## Common mistakes

- **Building the RTM at the end** for an audit. It is then copied from memory and is unreliable.
- **Reporting coverage as quality.** "100% covered" with one happy-path test per requirement is shallow.
- **Counting tests instead of requirements.** Ten tests on one requirement do not cover the other nine.
- **Ignoring non-functional and implicit requirements** (performance, accessibility, security) because they are not in the story list.
- **Manual spreadsheets nobody updates.** Use the links in your test management or issue-tracking tool where possible.
- **Hiding "not covered" rows.** Gaps must be visible so someone can accept or fix them.

## Troubleshooting

- **Requirements have no IDs.** Agree a numbering scheme with the business analyst or use story keys.
- **One test covers many requirements.** That is fine; link it to all of them, but check each requirement also has focused tests.
- **The RTM is too big to read.** Summarise by feature and risk level, and show detail only for gaps and failures.

## Key takeaways summary

The RTM links requirements to tests, results and defects in both directions. Use it to find gaps early, analyse the impact of changes and report status per requirement, and always state that coverage measures breadth, not thoroughness.
