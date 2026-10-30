---
slug: test-scenarios-and-test-cases
title: Test Scenarios and Test Cases
summary: A test scenario says what to test; a test case says exactly how, with preconditions, steps, data and expected results. Learn to derive both from a requirement and write cases anyone can execute.
level: beginner
duration: 35
tags: [test-documentation, test-design, istqb]
objectives:
  - Distinguish test conditions, test scenarios and test cases
  - Derive scenarios from a user story and its acceptance criteria
  - Write test cases with ID, preconditions, steps, test data and expected results
  - Choose an appropriate level of detail for the context
prerequisites:
  - Equivalence partitioning and boundary value analysis
  - Reading requirements or user stories
related: [boundary-value-analysis, equivalence-partitioning, test-suites-and-test-data, traceability-matrix-and-coverage, positive-and-negative-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (sections 1.4 and 4)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISO/IEC/IEEE 29119-3 Software testing — Test documentation
    url: https://www.iso.org/standard/79429.html
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
interview:
  - q: What is the difference between a test scenario and a test case?
    a: A test scenario is a high-level statement of something to verify, such as "user resets a forgotten password". It says what, not how. A test case is a concrete, executable specification of one check — preconditions, input data, steps, expected result and postconditions. One scenario usually expands into several test cases covering positive, negative and boundary variations.
  - q: What makes a test case good?
    a: It has one clear objective, it is traceable to a requirement, its preconditions and data are explicit, the steps are reproducible by someone who did not write them, and the expected result is specific and observable — an exact message, value or state, not "works correctly". It is also independent of other cases where possible and maintainable, so it does not need rewriting for every cosmetic UI change.
  - q: How detailed should test cases be?
    a: It depends on context. Regulated domains, outsourced execution or candidates for automation need detailed, low-level cases. An experienced team testing a fast-changing product often works better with high-level cases or checklists plus exploratory sessions. I choose detail based on risk, who executes, audit needs and how often the feature changes.
practice:
  - "For the story 'As a user I can change my email address after confirming my password', write four scenarios and two fully detailed test cases."
  - "Rewrite this expected result so it is verifiable: 'The system should work properly when the user enters a wrong OTP.'"
  - "Take a test case with 25 steps and split it into smaller, independent cases. Explain your choice of boundaries."
takeaways:
  - Condition (what could be tested) → scenario (a flow to verify) → case (exact, executable check).
  - Every case needs an ID, a traceable objective, preconditions, data, steps and a specific expected result.
  - One objective per case keeps failures easy to diagnose.
  - Expected results must be observable and precise.
  - Match the level of detail to risk, audience and how often the feature changes.
quiz:
  - id: scen-case-q1
    type: single
    topic: test-scenarios-and-test-cases
    difficulty: beginner
    prompt: Which is a test scenario rather than a test case?
    options:
      - "Verify a registered user can log in with valid credentials"
      - "TC-07, enter 'asha@example.test' and 'Valid#Pass12', click Sign in, expect the dashboard with 'Welcome, Asha'"
      - "Enter an 11-character password and expect the error 'Password must be at least 12 characters'"
      - "Set the cart total to 99.99 and expect no free-shipping banner"
    answer: [0]
    explanation: "The first option states what to verify without data, steps or an exact expected result, so it is a scenario. The others are concrete, executable test cases."
  - id: scen-case-q2
    type: debugging
    topic: test-scenarios-and-test-cases
    difficulty: intermediate
    prompt: What is the main problem with this test case?
    code: |
      ID: TC-31
      Steps: 1. Open app  2. Add items  3. Pay  4. Check order
      Expected: Everything works fine
    codeLanguage: text
    options:
      - "It has too few steps"
      - "The expected result is not verifiable, and preconditions and data are missing"
      - "It should be automated instead"
      - "The ID format is wrong"
    answer: [1]
    explanation: "'Everything works fine' cannot be judged pass or fail objectively, and without preconditions or test data two testers would run different tests. Step count and automation are secondary concerns."
  - id: scen-case-q3
    type: truefalse
    topic: test-scenarios-and-test-cases
    difficulty: beginner
    prompt: A single scenario usually produces several test cases, for example positive, negative and boundary variations.
    options: ["True", "False"]
    answer: [0]
    explanation: "Scenarios are high level. Applying techniques like EP and BVA to a scenario's inputs yields multiple concrete cases."
  - id: scen-case-q4
    type: multiple
    topic: test-scenarios-and-test-cases
    difficulty: intermediate
    prompt: Which fields are essential in a well-formed manual test case? Select all that apply.
    options:
      - "Unique ID"
      - "Preconditions"
      - "Expected result"
      - "Name of the developer who wrote the feature"
      - "Test data"
    answer: [0, 1, 2, 4]
    explanation: "ID, preconditions, data and expected result make a case identifiable and reproducible. The developer's name is not part of the test specification and adds no value to executing the test."
---

## Beginner-friendly explanation

Imagine writing instructions for a friend house-sitting your home. "Make sure the plants survive" is a **scenario**: it says what matters. "Every Monday, fill the blue jug to the line, pour half into the fern by the window and half into the cactus; the soil should be damp, not standing in water" is a **test case**: precise enough that anyone could follow it and know whether they did it right.

Scenarios help you think about **what** to cover. Test cases make sure the check is done the **same way** every time, by anyone.

## Technical explanation

ISTQB distinguishes several related work products:

| Term | Meaning | Example |
|---|---|---|
| Test condition | A testable aspect of a component or system | "Password length rule" |
| Test scenario | A high-level flow or situation to verify (common industry term) | "User resets a forgotten password" |
| Test case | A set of preconditions, inputs, actions, expected results and postconditions, developed from test conditions | TC-RST-03 below |
| Test procedure | An ordered sequence of test cases with setup and teardown | "Password reset regression run" |

A test case should be:

- **Traceable** to a requirement or acceptance criterion
- **Atomic**: one objective, so a failure points at one cause
- **Reproducible**: explicit preconditions and data
- **Verifiable**: an observable expected result
- **Independent**: does not rely on another case having run, where possible

### Low-level versus high-level cases

**Low-level (concrete)** cases specify exact data and steps. **High-level (logical)** cases describe the intent and leave details to the tester. Low-level suits regulated work, new team members and automation candidates; high-level suits experienced testers on fast-changing features.

## Real-world example

A banking web app has this story:

> As a customer, I can reset my password using a one-time code sent to my registered mobile number.
> Acceptance criteria: the code is 6 digits; it expires after 10 minutes; 3 wrong attempts lock the reset for 30 minutes; the new password must be 12–64 characters.

**Scenarios derived:**

| ID | Scenario | Type |
|---|---|---|
| SC-RST-01 | Reset password with a valid code | Positive |
| SC-RST-02 | Reset attempt with a wrong code | Negative |
| SC-RST-03 | Reset attempt with an expired code | Negative, boundary on time |
| SC-RST-04 | Lockout after repeated wrong codes | Negative, state |
| SC-RST-05 | New password violates length rule | Negative, boundary |

**Test cases for some of those scenarios:**

| ID | Scenario | Preconditions | Steps | Test data | Expected result |
|---|---|---|---|---|---|
| TC-RST-01 | SC-RST-01 | Account `cust_reset01` active; mobile verified; user logged out | 1. Open login page. 2. Click "Forgot password". 3. Enter customer ID. 4. Enter code received by SMS. 5. Enter and confirm new password. 6. Submit. | Customer ID `cust_reset01`; new password `Riverbank#2048` | Message "Your password has been changed". User can log in with the new password; old password is rejected. |
| TC-RST-03 | SC-RST-03 | As TC-RST-01; code requested at time T | 1–3 as TC-RST-01. 4. Wait until T + 10 min + 5 s. 5. Enter the code. | Code from SMS | Error "This code has expired. Request a new code." Password unchanged. |
| TC-RST-04 | SC-RST-04 | As TC-RST-01 | 1–3 as TC-RST-01. 4. Enter wrong code 3 times. 5. Enter correct code. | Wrong code `000000` | After 3rd attempt: "Too many attempts. Try again in 30 minutes." Step 5 is also rejected. Audit log records the lockout. |
| TC-RST-05 | SC-RST-05 | Valid code entered | 1. Enter 11-character password. 2. Submit. | `Riverbank#2` (11 chars) | Error "Password must be at least 12 characters". Password unchanged. |

Notice that TC-RST-03 tests just past the 10-minute expiry. A full set would also test just before it (for example T + 9 min 55 s), applying [boundary value analysis](/learn/manual-testing/boundary-value-analysis) to time.

## Step-by-step walkthrough

1. **Read the requirement** and list the test conditions (rules, inputs, states, outputs).
2. **Write scenarios** that cover the main flow, alternative flows and error flows.
3. **Apply techniques** (EP, BVA, decision tables, state transitions) to each scenario's inputs.
4. **Write each case** with ID, link to requirement, preconditions, steps, data and expected result.
5. **Peer review** the cases: can someone else run them without asking you questions?
6. **Organise cases into suites** (see [test suites and test data](/learn/manual-testing/test-suites-and-test-data)) and record traceability.

## Common mistakes

- **Vague expected results** such as "should work" or "proper error shown". Write the exact message, value or state.
- **Missing preconditions**, so a case passes for one tester and fails for another because the account was in a different state.
- **Mega-cases with 30 steps and 10 checks.** When step 22 fails, the remaining checks are blocked and diagnosis is slow.
- **Hidden dependencies** ("run after TC-12"), which break when the order changes.
- **Copy-pasting UI labels into every step**, so a button rename forces editing hundreds of cases.
- **Only positive cases.** Most defects hide in negative and boundary paths.

## Troubleshooting

- **Requirement is ambiguous** (does "10 minutes" mean from sending or from requesting?). Ask, and record the assumption in the case until answered.
- **The case cannot be run because the data does not exist.** Add the data creation to the preconditions or to a shared data set.
- **Cases keep breaking on cosmetic changes.** Move UI detail out of steps and describe intent ("submit the form") unless the label itself is under test.

## Key takeaways summary

Scenarios decide coverage; test cases make each check precise and repeatable. Write cases with one objective, explicit preconditions and data, and an expected result anyone could judge, at the level of detail your context needs.
