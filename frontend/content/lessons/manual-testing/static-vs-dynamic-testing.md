---
slug: static-vs-dynamic-testing
title: Static and dynamic testing
summary: Static testing examines work products without running them; dynamic testing executes the software. Learn what each finds, the ISTQB review types and process, and why the two complement each other.
level: beginner
duration: 30
tags: [fundamentals, istqb, static-testing, reviews]
objectives:
  - Distinguish static testing from dynamic testing using ISTQB terminology
  - List work products that can be examined by static testing
  - Describe the four ISTQB review types and the review process
  - Explain which kinds of defects each approach finds best
prerequisites:
  - What is software testing?
  - Error, defect, bug, failure and root cause
related: [what-is-software-testing, error-defect-bug-failure, verification-vs-validation, seven-testing-principles, acceptance-criteria-dor-dod, shift-left-and-continuous-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (chapter 3, Static Testing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary of testing terms (static testing, review, inspection)
    url: https://glossary.istqb.org/
  - title: Ruff documentation (an example static analysis tool for Python)
    url: https://docs.astral.sh/ruff/
interview:
  - q: What is the difference between static and dynamic testing?
    a: Static testing examines work products such as requirements, designs and code without executing them, through manual reviews or tool-based static analysis. It finds defects directly. Dynamic testing executes the software and observes its behaviour, so it finds failures, which are then analysed to locate the defects. They complement each other because each finds kinds of problems the other misses.
  - q: What defects are easier to find with static testing than with dynamic testing?
    a: Ambiguous, contradictory or missing requirements, design defects, deviations from coding standards, unreachable code, unused variables, security weaknesses visible in source code, incorrect interface specifications and gaps in traceability or coverage. Many of these never cause an observable failure in a test, or exist before any code can be run.
  - q: Name the review types in the ISTQB syllabus.
    a: Informal review, walkthrough, technical review and inspection. They range from informal with no defined process, to inspection, which is the most formal, follows a defined process with roles and entry and exit criteria, and collects metrics to improve the process.
  - q: Can static testing find failures?
    a: No. Static testing does not execute the software, so it cannot observe failures. It finds defects directly in the work product. Dynamic testing is what triggers failures, and then debugging traces them to defects.
practice:
  - "Review this user story and list every question it raises: 'As a user I want to reset my password so that I can log in again.'"
  - "Take a short function you have written and list three things a reviewer could find statically and two things only a dynamic test would reveal."
  - "Plan a 30-minute technical review of an API specification: who attends, what they prepare, and what the output is."
takeaways:
  - Static testing examines work products without executing them; dynamic testing executes the software.
  - Static testing finds defects directly; dynamic testing finds failures, which point to defects.
  - Almost any readable work product can be statically tested, including requirements, designs, code and test cases.
  - ISTQB review types are informal review, walkthrough, technical review and inspection.
  - Static and dynamic testing complement each other; neither replaces the other.
quiz:
  - id: sdt-q1
    type: single
    topic: static-vs-dynamic-testing
    difficulty: beginner
    prompt: Which activity is static testing?
    options: ["Running an automated regression suite against a nightly build", "Reviewing acceptance criteria with the product owner to find contradictions", "Performing a load test on the login API", "Executing exploratory tests on a mobile app"]
    answer: [1]
    explanation: A review examines a work product without executing anything, so it is static testing. The other options all execute the software, which makes them dynamic testing.
  - id: sdt-q2
    type: truefalse
    topic: static-vs-dynamic-testing
    difficulty: beginner
    prompt: Static testing finds failures in the software.
    options: ["True", "False"]
    answer: [1]
    explanation: Failures only occur when software is executed. Static testing finds defects directly in the work product; dynamic testing triggers failures that are then traced to defects.
  - id: sdt-q3
    type: single
    topic: static-vs-dynamic-testing
    difficulty: intermediate
    prompt: Which review type is the most formal, follows a defined process with roles and exit criteria, and collects metrics to improve the process?
    options: ["Informal review", "Walkthrough", "Technical review", "Inspection"]
    answer: [3]
    explanation: Inspection is the most formal ISTQB review type and collects metrics for process improvement. A technical review is also structured but aims mainly at technical consensus and decisions; walkthroughs are led by the author; informal reviews have no defined process.
  - id: sdt-q4
    type: debugging
    topic: static-vs-dynamic-testing
    difficulty: intermediate
    prompt: A static analysis tool flags this function. Which problem can it detect without running the code?
    code: |
      def shipping_cost(weight_kg):
          rate = 4.5
          if weight_kg <= 0:
              raise ValueError("weight must be positive")
              return 0
          return round(weight_kg * 2.0, 2)
    codeLanguage: python
    options: ["The function returns the wrong cost for 10 kg", "The variable rate is assigned but never used, and return 0 is unreachable", "The function is too slow", "The function crashes for negative weights"]
    answer: [1]
    explanation: Unused variables and unreachable code are classic static analysis findings, visible from the source alone. Whether 10 kg gives the wrong cost needs a test oracle and execution. Raising ValueError for negative weight is intended behaviour, not a crash defect.
---

## Beginner-friendly explanation

Suppose you are preparing a speech for a wedding.

- You **read through your notes** and spot that you have got the couple's anniversary date wrong and that one joke might offend a grandparent. You have not given the speech; you just read it carefully. That is **static testing**.
- Then you **practise it out loud** in front of a friend. You discover it runs ten minutes too long and you stumble over one sentence. You only found those by performing it. That is **dynamic testing**.

Both are valuable, and they catch different problems. Reading catches wrong facts before you ever stand up. Performing catches problems that only show up when the speech actually "runs".

## Technical explanation

| | Static testing | Dynamic testing |
|---|---|---|
| Executes the software? | No | Yes |
| How | Manual reviews, tool-based static analysis | Running test cases, exploratory sessions, automated checks |
| What it finds | Defects, directly | Failures, which are analysed to find defects |
| When it can start | As soon as a work product exists, even a draft | When there is something executable |
| Typical targets | Requirements, user stories, designs, code, test cases, contracts, plans, models | Components, integrated systems, the full system |

### What static testing finds best

The ISTQB syllabus (chapter 3) notes that static testing can find defects that are hard or impossible to find dynamically, and finds them earlier. Typical examples:

- requirement defects: ambiguity, contradictions, omissions, inaccuracies, duplication,
- design defects: inefficient structures, poor modularisation,
- coding defects: unused or undefined variables, unreachable or duplicated code, excessive complexity,
- deviations from standards such as coding or naming conventions,
- incorrect interface specifications, for example mismatched units or parameter order,
- security vulnerabilities visible in code, such as buffer overflow patterns,
- gaps or inaccuracies in test basis coverage or traceability.

Some work products cannot be executed at all, so only static testing can evaluate them. Static analysis is also commonly run automatically in CI pipelines.

### What dynamic testing finds best

Dynamic testing reveals behaviour that only exists at run time: wrong outputs, performance under load, timing and concurrency problems, integration and configuration issues, and how the system behaves with real data and environments.

### Review types

ISTQB describes four commonly used review types, from least to most formal:

| Type | Key characteristics |
|---|---|
| Informal review | No defined process, no formal documented output; main objective is detecting anomalies |
| Walkthrough | Led by the author; can serve to educate, build consensus, generate ideas and detect anomalies |
| Technical review | Performed by technically qualified reviewers and led by a moderator; aims at consensus and decisions on technical problems, plus detecting anomalies |
| Inspection | Most formal; follows the complete generic process; main objective is finding the maximum number of anomalies; metrics are collected to improve the SDLC and the inspection process; the author cannot be the review leader or scribe |

### The review process

```mermaid
flowchart LR
  PL["Planning: scope, objectives, roles, criteria"] --> RI["Review initiation: everyone has access and is ready"]
  RI --> IR["Individual review: each reviewer examines the work product"]
  IR --> CA["Communication and analysis: discuss anomalies, decide status"]
  CA --> FR["Fixing and reporting: defect reports, fixes, exit criteria checked"]
```

Roles include the manager, author, moderator (facilitator), scribe (recorder), reviewers and review leader.

## Real-world example

A generic scenario: a team is adding a "split the bill" feature to a restaurant payments app.

**Static testing, before code:** in a technical review of the user story, a tester asks how the remainder is handled when a total of 100.00 is split three ways. The story is silent. The team agrees one person pays 33.34. A developer also notices the API specification gives amounts as floating-point numbers; they change it to integer minor units to avoid rounding errors. Two defects were removed before any code existed.

**Static analysis, during coding:** the CI pipeline's linter flags an unused parameter and an unreachable branch in the split function. The developer removes them.

**Dynamic testing, after coding:** the tester runs boundary tests and an exploratory session on a real device. They find that when one diner's card is declined, the other diners are still charged and the bill is left partly paid. That behaviour only appeared when the system ran with a real payment-provider sandbox. A failure was observed, and debugging found the defect.

Each kind of testing found something the other would have missed.

## Common mistakes

- **Thinking static testing is only code review.** Requirements, designs, test cases and plans all benefit from review.
- **Skipping reviews because "testing will catch it".** Some defects, such as missing requirements, never cause a failure a test can see, and late fixes cost more.
- **Using reviews to judge people.** Reviews must focus on the work product; blame destroys participation.
- **Reviewing without preparation or clear objectives.** Individual review before the meeting is what finds most anomalies.
- **Ignoring static analysis warnings.** Teams that let warnings pile up stop noticing the important ones.

## Key takeaways summary

Static testing examines work products without running them and finds defects directly, often early and cheaply. Dynamic testing executes the software and reveals failures that only exist at run time. Reviews, from informal to inspection, and static analysis tools are the main static techniques. Use both together: they catch different defects at different times.
