---
slug: what-is-software-testing
title: What is software testing?
summary: Testing is far more than running the software and clicking around. Learn the ISTQB definition of testing, its static and dynamic forms, the test activities, and how testing differs from debugging.
level: beginner
duration: 25
tags: [fundamentals, istqb, test-process]
objectives:
  - Define software testing using ISTQB terminology
  - Explain why testing includes both static and dynamic activities
  - Name the main test activities from planning to completion
  - Distinguish testing from debugging
prerequisites:
  - None. This is the first lesson in the Manual Testing track
related: [why-testing-is-required, qa-qc-and-testing, static-vs-dynamic-testing, sdlc-and-stlc, error-defect-bug-failure]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (chapter 1, Fundamentals of Testing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary of testing terms
    url: https://glossary.istqb.org/
interview:
  - q: How would you define software testing?
    a: Testing is a set of activities to discover defects and evaluate the quality of software work products. It is not only executing the software. It includes planning, analysing requirements, designing tests, reviewing documents, executing tests and reporting results, so that stakeholders get reliable information to make decisions about the product.
  - q: What is the difference between testing and debugging?
    a: Testing shows that a failure exists, or finds a defect directly through a review. Debugging is the developer activity that reproduces the failure, diagnoses its cause and fixes the defect. After the fix, testing comes back in as confirmation testing to check the fix and regression testing to check nothing else broke.
  - q: Is testing only about finding bugs?
    a: No. Finding defects is one objective, but testing also builds confidence, verifies requirements are met, checks compliance with contractual or regulatory needs, reduces the risk of poor quality in production and gives stakeholders information. A test run that finds no defects still produces valuable evidence.
  - q: Can you test something that is not code?
    a: Yes. Requirements, user stories, designs and test cases themselves can be tested with static techniques such as reviews. Finding an ambiguous requirement before anyone writes code is one of the cheapest ways to prevent defects.
practice:
  - "Pick an app you use daily, such as a messaging app. Write five questions you would want testing to answer before a new release goes live."
  - "List three work products in a software project that are not executable code, and describe one defect that a review of each could find."
  - "Take a recent bug you have seen in any software. Describe which part of the work was testing and which part was debugging."
takeaways:
  - Testing is a set of activities to find defects and evaluate quality, not only running the software.
  - Static testing examines work products without executing them; dynamic testing executes the software.
  - The test process runs from planning to completion, with monitoring and control throughout.
  - Testing finds failures and defects; debugging finds and fixes their causes.
  - Testing gives stakeholders information to make decisions, even when it finds nothing wrong.
quiz:
  - id: wist-q1
    type: single
    topic: what-is-software-testing
    difficulty: beginner
    prompt: Which statement best matches the ISTQB view of software testing?
    options: ["Testing means executing the software to see whether it crashes", "Testing is a set of activities to discover defects and evaluate the quality of software work products", "Testing is the developer activity of fixing defects", "Testing proves that software has no defects"]
    answer: [1]
    explanation: ISTQB describes testing as a set of activities that discover defects and evaluate the quality of work products, including non-executable ones. Executing software is only part of it, fixing defects is debugging, and testing can never prove the absence of defects.
  - id: wist-q2
    type: truefalse
    topic: what-is-software-testing
    difficulty: beginner
    prompt: Reviewing a requirements document for ambiguities counts as testing.
    options: ["True", "False"]
    answer: [0]
    explanation: Reviews are a form of static testing. They evaluate a work product without executing anything and can find defects such as ambiguous or contradictory requirements.
  - id: wist-q3
    type: scenario
    topic: what-is-software-testing
    difficulty: intermediate
    prompt: A tester reports that checkout fails when the cart has exactly 100 items. A developer reproduces it, finds a loop limit set to 99 and corrects it. The tester then re-runs the failed test. Which activity was debugging?
    options: ["Reporting that checkout fails with 100 items", "Reproducing the failure, finding the loop limit and correcting it", "Re-running the failed test after the fix", "Writing the original test case"]
    answer: [1]
    explanation: Debugging is reproducing, diagnosing and fixing the cause. Reporting the failure and writing the test are testing activities, and re-running the test after the fix is confirmation testing, which is also testing.
  - id: wist-q4
    type: multiple
    topic: what-is-software-testing
    difficulty: beginner
    prompt: Which of these are test activities in the ISTQB test process? Select all that apply.
    options: ["Test planning", "Test analysis", "Code refactoring", "Test execution", "Test completion"]
    answer: [0, 1, 3, 4]
    explanation: The ISTQB test process includes planning, monitoring and control, analysis, design, implementation, execution and completion. Refactoring code is a development activity, not a test activity.
---

## Beginner-friendly explanation

Think about a new restaurant getting ready for opening night. The chef does not just cook a dish and serve it to the first customer. Someone reads the menu to check the descriptions make sense and the prices are right. Someone tastes each dish. Someone checks that the kitchen can handle twenty orders at once. Someone asks, "If a guest says they are allergic to nuts, do the waiters know which dishes are safe?"

All of that checking is the restaurant's version of **testing**. Some of it involves cooking and tasting (running the thing). Some of it is just reading and thinking (checking the menu before anything is cooked). The goal is not only to find problems but to be confident that opening night will go well, and to tell the owner honestly if it will not.

Software testing works the same way. It is everything we do to find problems in software and to understand how good it really is, so that people can make sensible decisions about releasing it.

## Technical explanation

The ISTQB Foundation Level syllabus (v4.0) describes **software testing** as a set of activities to discover defects and evaluate the quality of software artefacts. Those artefacts, called **test objects** when they are being tested, include not only running code but also requirements, user stories, designs and other work products.

Three ideas in that definition matter:

1. **Testing is a set of activities, not one action.** Running tests is only one part.
2. **Testing evaluates quality, not only defects.** It produces information about how well the product meets its requirements and stakeholder needs.
3. **Testing covers non-executable work products.** You can test a requirement before a single line of code exists.

### Static and dynamic testing

- **Static testing** examines work products without executing them, through reviews and static analysis. See [static and dynamic testing](/learn/manual-testing/static-vs-dynamic-testing).
- **Dynamic testing** executes the software and compares actual results with expected results.

### Verification and validation

Testing involves **verification** (checking that the system meets specified requirements) and **validation** (checking that it meets users' and other stakeholders' needs in its operational environment). The difference is covered in [verification versus validation](/learn/manual-testing/verification-vs-validation).

### The test process

ISTQB groups test work into a set of activities. They are often performed iteratively or in parallel rather than strictly in order:

```mermaid
flowchart LR
  P["Test planning"] --> A["Test analysis"] --> D["Test design"] --> I["Test implementation"] --> E["Test execution"] --> C["Test completion"]
  M["Test monitoring and control"] -.-> P
  M -.-> A
  M -.-> D
  M -.-> I
  M -.-> E
  M -.-> C
```

| Activity | Key question it answers |
|---|---|
| Test planning | What are the objectives, scope and approach? |
| Test monitoring and control | Are we on track, and what do we adjust if not? |
| Test analysis | What should we test? (test conditions) |
| Test design | How will we test it? (test cases, test data needs) |
| Test implementation | Is everything ready to run? (test procedures, data, environment) |
| Test execution | What actually happened? (run tests, compare, log anomalies) |
| Test completion | What did we learn, and what do we hand over? |

### Testing versus debugging

These are different activities, often done by different people:

- **Testing** triggers failures caused by defects (dynamic testing) or finds defects directly (static testing).
- **Debugging** is concerned with finding the causes of failures (defects), analysing them and eliminating them. It typically involves reproducing the failure, diagnosing it and fixing the cause.

After a fix, testers run **confirmation testing** to check the fix worked and **regression testing** to check that the change has not broken anything else.

## Real-world example

A team at an online grocery service is adding a "deliver to a different address" option. Here is what testing looks like across the work, not just at the end:

- **During refinement**, a tester reviews the user story and asks: "Can the second address be in a region we do not deliver to?" The story did not say. That question is static testing, and it finds a gap before any code is written.
- **During design**, the tester identifies test conditions: valid address, unsupported region, missing postcode, address changed after the order is placed.
- **During execution**, the tester runs the cases and finds that changing the address after ordering leaves the old delivery slot attached. They log a defect with steps, expected and actual results.
- **The developer debugs** it, finds that the slot is cached by the original postcode, and fixes it.
- **The tester confirms** the fix and re-runs the existing delivery regression set.
- **At completion**, the tester reports what was covered, what was found and what risks remain, so the product owner can decide whether to release.

Notice how much of that work happened without running the software at all.

## Step-by-step walkthrough

When you first meet a new feature to test, walk through these questions:

1. **What is the test object?** A screen, an API, a user story, a document?
2. **What are the objectives?** Find defects, confirm requirements, build confidence, check compliance?
3. **What is the test basis?** The requirements, designs or other sources that tell you what "correct" means.
4. **What can be checked statically?** Review the story or specification before testing anything dynamically.
5. **What test conditions exist?** List what needs testing before deciding how.
6. **What will you report, and to whom?** Testing is only useful if the right people get clear information.

## Common mistakes

- **Treating testing as "the phase at the end".** Testing activities start as soon as there is something to examine, such as a draft requirement.
- **Equating testing with execution.** Planning, analysis, design and reviews are all testing.
- **Thinking a passing test run proves the software is correct.** Testing reduces uncertainty; it never proves the absence of defects.
- **Confusing testing with debugging.** Testers find and report failures; developers usually diagnose and fix the defects behind them.
- **Reporting only bugs.** Stakeholders also need to know what was covered, what was not, and what risks remain.

## Key takeaways summary

Software testing is a broad set of activities that discover defects and evaluate quality. It includes static testing of documents and code as well as dynamic testing of running software, and it follows a process from planning to completion. Testing tells people about quality so they can make decisions; debugging is the separate activity of finding and fixing what testing reveals.
