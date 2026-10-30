---
slug: sdlc-and-stlc
title: SDLC and STLC
summary: Testing always happens inside a software development lifecycle. Learn the main SDLC models, the test process often called the STLC, and the good practices that apply whichever model your team uses.
level: beginner
duration: 30
tags: [fundamentals, istqb, test-process, sdlc]
objectives:
  - Describe sequential, iterative, incremental and agile SDLC models
  - List the ISTQB test activities that make up the test process (STLC)
  - Explain how the choice of SDLC changes when and how testing happens
  - Apply the ISTQB good practices for testing in any lifecycle
prerequisites:
  - What is software testing?
related: [what-is-software-testing, verification-vs-validation, entry-and-exit-criteria, test-strategy-vs-test-plan, shift-left-and-continuous-testing, agile-principles-for-testers]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (sections 1.4 and 2.1, Test Activities and Testing in the SDLC)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: The Scrum Guide
    url: https://www.scrumguides.org/
  - title: Manifesto for Agile Software Development
    url: https://agilemanifesto.org/
interview:
  - q: What is the difference between the SDLC and the STLC?
    a: The SDLC is the overall lifecycle for building software, from requirements through design, implementation, testing, release and maintenance. The STLC, which ISTQB calls the test process, is the set of test activities within it, namely test planning, monitoring and control, analysis, design, implementation, execution and completion. The STLC runs inside and alongside the SDLC, not after it.
  - q: How does testing differ in a sequential model compared with an agile model?
    a: In a sequential model such as waterfall or the V-model, testers review documents early but dynamic testing tends to happen in later phases, and documentation is usually formal. In agile, testing happens in every iteration, testers work with developers and the product owner on acceptance criteria, there is heavy use of test automation for regression, and lighter documentation. The same test activities exist, but they are compressed into short cycles.
  - q: Which testing good practices apply regardless of the SDLC?
    a: For every development activity there is a corresponding test activity. Each test level has its own specific objectives. Test analysis and design for a level begin during the corresponding development phase. And testers get involved in reviewing work products as soon as drafts are available, which supports early testing.
  - q: Is the STLC a strictly sequential set of phases?
    a: No. ISTQB presents the test activities as a logical set that is often performed iteratively or in parallel. In an agile team, analysis, design and execution for different stories may all happen in the same week, while monitoring and control runs continuously.
practice:
  - "For a two-week Scrum sprint, write which test activities happen in refinement, during the sprint, at the sprint review and at the retrospective."
  - "Draw the V-model for a small payroll project and name one test basis document for each test level."
  - "Pick the test completion activity. List four outputs you would expect from it on a real project."
takeaways:
  - The SDLC is how software is built; the STLC (ISTQB test process) is how testing is done within it.
  - Test activities are planning, monitoring and control, analysis, design, implementation, execution and completion.
  - Sequential models separate phases; iterative and agile models repeat short cycles with continuous testing.
  - Whatever the model, each development activity has a matching test activity and testers start early.
  - STLC is an industry term; in ISTQB exams, refer to the test process and test activities.
quiz:
  - id: sdlc-q1
    type: single
    topic: sdlc-and-stlc
    difficulty: beginner
    prompt: In which test activity are test conditions identified and prioritised?
    options: ["Test planning", "Test analysis", "Test implementation", "Test completion"]
    answer: [1]
    explanation: Test analysis answers "what to test" by analysing the test basis and identifying test conditions. Planning sets objectives and approach, implementation prepares testware such as procedures and data, and completion closes the work.
  - id: sdlc-q2
    type: truefalse
    topic: sdlc-and-stlc
    difficulty: beginner
    prompt: In ISTQB terms, test activities must always be performed strictly one after another.
    options: ["True", "False"]
    answer: [1]
    explanation: ISTQB says the test activities are often implemented iteratively or in parallel. Their logical order helps understanding, but real projects overlap them, especially in agile teams.
  - id: sdlc-q3
    type: multiple
    topic: sdlc-and-stlc
    difficulty: intermediate
    prompt: Which are ISTQB good practices for testing that apply to any SDLC model? Select all that apply.
    options: ["For every development activity, there is a corresponding test activity", "Testing starts only after coding is finished", "Test analysis and design for a test level begin during the corresponding development phase", "Testers review work products as soon as drafts are available", "Each test level has specific test objectives"]
    answer: [0, 2, 3, 4]
    explanation: These four are the good practices listed in the syllabus. Waiting until coding is finished contradicts the early-testing principle in every model.
  - id: sdlc-q4
    type: scenario
    topic: sdlc-and-stlc
    difficulty: intermediate
    prompt: A team delivers a working increment every two weeks and relies on automated regression tests to release safely each sprint. Which SDLC approach is this most likely to be?
    options: ["Waterfall", "V-model", "An iterative and incremental agile approach such as Scrum", "Big-bang integration"]
    answer: [2]
    explanation: Short cycles that each deliver a working increment, with automated regression to support frequent change, are characteristic of agile approaches such as Scrum. Waterfall and the V-model are sequential, and big-bang is an integration strategy, not an SDLC model.
---

## Beginner-friendly explanation

Think about building a house. The **building lifecycle** covers everything: deciding what the family needs, drawing plans, laying foundations, building walls, wiring, plumbing, decorating and finally handing over the keys. That is like the **SDLC** (software development lifecycle).

Running through that whole process is a separate set of checking work: an inspector reviews the plans, checks the foundations before walls go up, tests the wiring before the plaster covers it, and does a final walk-through with the family. That checking has its own steps, from planning which inspections are needed to writing the final report. That is like the **STLC** (software testing lifecycle).

The checking is not something that starts after the house is finished. It happens alongside the building, at every stage. And how it is organised depends on how the house is built: all at once from a fixed plan, or room by room with the family moving in early.

## Technical explanation

### The SDLC

A **software development lifecycle model** describes the types of activity performed at each stage of a project and how they relate. ISTQB groups common models into:

| Category | Examples | Testing characteristics |
|---|---|---|
| Sequential | Waterfall, V-model | Phases follow each other; dynamic testing tends to come later; testers review documents early |
| Iterative | Spiral, prototyping | Repeated cycles refine the product; early feedback on prototypes |
| Incremental | Unified Process | The product grows in increments; each increment needs testing plus regression |
| Agile | Scrum, Kanban, Extreme Programming | Short iterations, whole-team quality, lightweight documentation, heavy regression automation |

ISTQB notes that agile approaches are iterative and incremental, and that development practices such as test-driven development (TDD), acceptance test-driven development (ATDD) and behaviour-driven development (BDD) support testing in them.

### The STLC, or ISTQB test process

"STLC" is a widely used industry term. ISTQB does not use it; it describes a **test process** made up of **test activities**:

```mermaid
flowchart TD
  P["Test planning: objectives, approach, entry and exit criteria"] --> A["Test analysis: what to test (test conditions)"]
  A --> D["Test design: how to test (test cases, coverage items)"]
  D --> I["Test implementation: testware ready (procedures, data, environment)"]
  I --> E["Test execution: run, compare, log anomalies"]
  E --> C["Test completion: report, archive, lessons learned"]
  MC["Test monitoring and control, throughout"] -.-> A
  MC -.-> E
  E -. "new information" .-> A
```

| Activity | Typical outputs |
|---|---|
| Test planning | Test plan, entry and exit criteria, schedule |
| Test monitoring and control | Progress reports, control directives |
| Test analysis | Prioritised test conditions, defects found in the test basis |
| Test design | Test cases, test data requirements, environment requirements |
| Test implementation | Test procedures, test suites, test data, environment set-up |
| Test execution | Test logs, defect reports |
| Test completion | Test completion report, archived testware, improvement actions |

These activities are often **iterative or parallel**, not a strict waterfall. How formal each one is depends on the context: the SDLC, risks, domain, regulation and team.

### Good practices in any SDLC

The syllabus lists practices that apply whatever model you use:

1. For every development activity, there is a corresponding test activity, so all development work is subject to quality control.
2. Different test levels have specific and different test objectives, which avoids redundant testing.
3. Test analysis and design for a given test level begin during the corresponding development phase, so testing follows the early-testing principle.
4. Testers are involved in reviewing work products as soon as drafts are available.

## Real-world example

A generic scenario: the same feature, "customers can save a card for future payments", built by two teams.

**Team A (V-model):** a business analyst writes a requirements specification. Testers review it in week one and raise questions about card expiry. Test analysis and design for system testing start while developers design the architecture. After implementation and integration, a formal system test phase executes the prepared cases; a separate acceptance phase follows with business users. A test completion report closes the project.

**Team B (Scrum):** the story is refined with the product owner, a developer and a tester, who agree acceptance criteria, including expired-card behaviour. During the sprint, the developer writes unit tests and the tester designs and runs tests as soon as each slice is ready, automating the regression checks. The increment is demonstrated at the sprint review, and the retrospective covers what slowed testing down.

Both teams performed planning, analysis, design, implementation, execution and completion. The difference was timing, formality and how the work was shared.

## Common mistakes

- **Treating testing as a phase after development.** In every model, test activities start with the first work product.
- **Using "STLC" in an ISTQB exam answer.** Refer to the test process and its activities.
- **Assuming agile means no planning or documentation.** Agile testing still plans, analyses and reports; it does so lightly and continuously.
- **Copying one model's test process into another.** A heavyweight formal sign-off every two weeks will not fit a Scrum team, and a lightweight approach may not satisfy a regulated sequential project.
- **Forgetting test completion.** Lessons learned and archived testware are what make the next release faster.

## Key takeaways summary

The SDLC describes how software is built; the test process, often called the STLC, describes how testing is organised within it. The test activities are the same in every model, but their timing, formality and ownership change with the lifecycle. Whatever the model, match every development activity with a test activity and get involved as early as possible.
