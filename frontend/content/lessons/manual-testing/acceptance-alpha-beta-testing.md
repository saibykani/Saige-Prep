---
slug: acceptance-alpha-beta-testing
title: Acceptance, Alpha and Beta Testing
summary: Acceptance testing establishes whether a system is ready to be accepted and deployed. Learn the ISTQB forms of acceptance testing, including user, operational, contractual and regulatory, alpha and beta testing, and who owns each.
level: beginner
duration: 30
tags: [test-levels, acceptance-testing, uat, istqb]
objectives:
  - Explain the objective of acceptance testing and how it differs from system testing
  - Describe user, operational, contractual, regulatory, alpha and beta acceptance testing
  - Distinguish alpha testing from beta testing by location and participants
  - Plan a user acceptance test session with clear acceptance criteria and sign-off
prerequisites:
  - System and end-to-end testing
  - Acceptance criteria basics
related: [system-and-end-to-end-testing, acceptance-criteria-dor-dod, release-sign-off, release-readiness, verification-vs-validation]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 2.2.1, Test levels)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Cucumber documentation (executable acceptance criteria)
    url: https://cucumber.io/docs/
  - title: The Scrum Guide (Definition of Done)
    url: https://www.scrumguides.org/
interview:
  - q: What is the goal of acceptance testing?
    a: Acceptance testing focuses on validation and on demonstrating readiness for deployment, meaning the system fulfils the user's business needs. Finding defects is not its main aim; ideally few remain by then. Its outcome feeds a decision, such as whether the customer accepts the delivery, operations can support it, or regulators' requirements are met.
  - q: What is the difference between alpha and beta testing?
    a: Both are forms of acceptance testing used mainly for software that will be distributed to many users. Alpha testing is performed at the developing organisation's site, by potential or existing customers or an independent test team, under some supervision. Beta testing is performed by potential or existing customers at their own locations, in their real environments, and gives feedback about conditions the developer could not reproduce.
  - q: What is operational acceptance testing?
    a: It is acceptance testing done by operations or system administration staff, often in a production-like environment, to confirm the system can be run and supported. Typical checks are backup and restore, installation and upgrade, disaster recovery, user management, maintenance tasks, data loading and migration, security vulnerability checks and performance under expected load.
  - q: Who should own user acceptance testing?
    a: The business. Testers can help plan UAT, prepare environments and data, and coach users, but the people who will actually use the system should execute and judge it against their real work. If the test team runs UAT alone, it becomes another round of system testing and loses its validation value.
practice:
  - "Write three acceptance criteria in Given-When-Then form for a 'request annual leave' feature, then the UAT scenario a manager would run."
  - "List eight checks you would include in operational acceptance testing for a new payroll system."
  - "Design a beta programme for a mobile fitness app: who participates, how long, what feedback you collect and how you decide it has succeeded."
takeaways:
  - Acceptance testing focuses on validation and readiness for deployment, not mainly on finding defects.
  - ISTQB forms are user, operational, contractual and regulatory, alpha and beta acceptance testing.
  - Alpha testing happens at the developer's site; beta testing happens at users' own locations.
  - The business owns UAT; testers support with planning, data, environments and coaching.
  - Agree acceptance criteria and exit criteria before UAT starts, so sign-off is evidence-based.
quiz:
  - id: accab-q1
    type: single
    topic: acceptance-alpha-beta-testing
    difficulty: beginner
    prompt: Which form of acceptance testing is performed by customers at their own locations, in their own environments?
    options: ["Alpha testing", "Beta testing", "Operational acceptance testing", "Component testing"]
    answer: [1]
    explanation: Beta testing happens at the users' own sites. Alpha testing is also done by customers or independent testers, but at the developing organisation's site.
  - id: accab-q2
    type: single
    topic: acceptance-alpha-beta-testing
    difficulty: intermediate
    prompt: System administrators verify backup and restore, patching and disaster recovery before go-live. Which form of acceptance testing is this?
    options: ["User acceptance testing", "Contractual acceptance testing", "Operational acceptance testing", "Beta testing"]
    answer: [2]
    explanation: Operational acceptance testing confirms the system can be operated and supported. UAT focuses on users' business tasks, and contractual testing checks the agreed contract criteria.
  - id: accab-q3
    type: truefalse
    topic: acceptance-alpha-beta-testing
    difficulty: beginner
    prompt: The main objective of acceptance testing is to find as many defects as possible.
    options: ["True", "False"]
    answer: [1]
    explanation: Acceptance testing aims to build confidence and validate that the system is fit for use and ready to deploy. Finding many defects at this stage signals that earlier levels were weak.
  - id: accab-q4
    type: multiple
    topic: acceptance-alpha-beta-testing
    difficulty: intermediate
    prompt: Which are forms of acceptance testing listed in ISTQB CTFL v4.0? Select all that apply.
    options: ["User acceptance testing", "Regulatory acceptance testing", "Smoke testing", "Alpha testing", "Component integration testing"]
    answer: [0, 1, 3]
    explanation: The syllabus lists user, operational, contractual and regulatory, alpha and beta testing. Smoke testing is a quick check of main functions, and component integration testing is a separate test level.
---

## Beginner-friendly explanation

When you buy a made-to-measure suit, the tailor has already checked the seams, the buttons and the measurements. But before you pay, you put it on, walk around, sit down and lift your arms. You are not hunting for loose threads; you are deciding **"Is this what I wanted, and can I wear it to work?"**

**Acceptance testing** is that fitting. After the development team has tested the product thoroughly, the people who asked for it, will use it or will run it confirm that it does their job. The result is a decision: accept, accept with conditions, or reject.

## Technical explanation

Acceptance testing is the final ISTQB test level. Its focus is on **validation** and on demonstrating **readiness for deployment**, meaning the system fulfils the user's business needs. Ideally it reveals few defects; serious defects found here are expensive and may indicate gaps earlier. See [verification vs validation](/learn/manual-testing/verification-vs-validation) for the underlying distinction.

ISTQB CTFL v4.0 lists these main forms:

| Form | Who | Focus |
|---|---|---|
| User acceptance testing (UAT) | Intended users | Can users do their real tasks in a real or simulated environment? |
| Operational acceptance testing (OAT) | Operations and administration staff | Backup and restore, installation, upgrades, disaster recovery, user management, maintenance, data migration, security and performance in operation |
| Contractual acceptance testing | Users or independent testers | Criteria written into a contract for custom-developed software |
| Regulatory acceptance testing | Users or independent testers, sometimes with regulators observing | Compliance with laws, regulations or safety standards |
| Alpha testing | Customers or an independent test team | Performed at the **developing organisation's site** |
| Beta testing | Potential or existing customers | Performed at **users' own locations**, in their real environments |

**Test basis** for acceptance testing includes business processes, user and business requirements, regulations, contracts and standards, use cases, system documentation, installation procedures and risk analysis.

```mermaid
flowchart LR
  ST["System testing done"] --> A["Alpha: users at developer's site"]
  A --> B["Beta: users at their own sites"]
  B --> D{"Acceptance criteria met?"}
  D -->|Yes| R["Release decision"]
  D -->|No| F["Fix, confirm, re-assess"]
```

### Acceptance in agile teams

In agile teams, acceptance criteria on each user story act as small acceptance tests. Approaches such as acceptance test-driven development (ATDD) and BDD capture them as examples before coding, sometimes as executable Gherkin scenarios. Story-level acceptance does not replace a release-level UAT for large business changes.

## Real-world example

A logistics company replaced its warehouse picking system. System testing passed, including performance tests. During UAT, warehouse supervisors ran a normal shift's work on handheld scanners and found that a common real-world action, splitting one pallet across two delivery bays, needed eleven screens. It was technically correct per the specification, but would have slowed every shift.

The business accepted the release with a condition: a simplified split-pallet flow delivered before peak season. Meanwhile, operational acceptance testing by the infrastructure team found that the nightly backup job overlapped the early shift's start and locked tables. Neither problem was a "bug" against the written requirements; both would have hurt the business.

## Step-by-step walkthrough

1. **Agree acceptance criteria and exit criteria** with business owners before testing starts.
2. **Choose the forms needed**: UAT almost always; OAT for anything operations must run; contractual or regulatory where applicable; alpha and beta for widely distributed products.
3. **Select participants** who do the work daily, not only managers.
4. **Prepare the environment and data**: production-like, with realistic, anonymised data.
5. **Write business scenarios** rather than step-by-step scripts, so users exercise real workflows.
6. **Run sessions with support**: a tester records issues, helps reproduce them and separates defects from training needs.
7. **Triage findings** into defects, change requests and training or documentation gaps.
8. **Record the sign-off decision** with evidence and any conditions; see [release sign-off](/learn/manual-testing/release-sign-off).

### Worked example: a UAT scenario

| Item | Content |
|---|---|
| Scenario | Manager approves an annual leave request that overlaps a public holiday |
| Acceptance criterion | Given a request spanning a public holiday, when the manager approves it, then the holiday is not deducted from the employee's balance |
| Participants | Two line managers, one HR officer |
| Evidence | Balance before and after, approval email, HR report row |

## Common mistakes

- **Letting the test team run UAT alone.** It turns into another round of system testing and loses its validation value.
- **Starting UAT with unstable builds.** Users lose trust quickly; enter UAT only when system testing exit criteria are met.
- **Undefined acceptance criteria.** Without them, sign-off becomes a matter of opinion.
- **Forgetting operational acceptance.** A system users love can still fail if nobody can back it up, patch it or restore it.
- **Treating beta feedback as noise.** Beta users reveal environments and usage patterns the team never imagined; collect it in a structured way.

## Troubleshooting

- **Users report "it's wrong" without detail.** Pair them with a tester who captures steps, data and expected behaviour.
- **UAT finds many requirement gaps.** Log them as change requests, then ask why reviews and story refinement missed them.
- **Beta participants stop responding.** Keep the programme short, make feedback one tap away and show them their reports were acted on.

## Key takeaways summary

Acceptance testing answers "Is this fit for use and ready to deploy?" Use the right forms, including user, operational, contractual, regulatory, alpha and beta, let the business own the decision, define criteria up front, and record sign-off with evidence and conditions.
