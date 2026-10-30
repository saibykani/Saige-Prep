---
slug: entry-and-exit-criteria
title: Entry and Exit Criteria
summary: Entry criteria say when testing can sensibly start; exit criteria say when it can stop. Learn to write measurable criteria, plus suspension and resumption rules, and how they map to Definition of Ready and Done.
level: beginner
duration: 25
tags: [test-documentation, test-management, istqb]
objectives:
  - Define entry criteria and exit criteria using ISTQB terminology
  - Write measurable entry and exit criteria checklists for a test level
  - Explain suspension and resumption criteria
  - Relate entry and exit criteria to Definition of Ready and Definition of Done
prerequisites:
  - Test strategy versus test plan
related: [test-strategy-vs-test-plan, acceptance-criteria-dor-dod, release-sign-off, test-execution-and-closure-reports, smoke-and-sanity-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.1.3, Entry Criteria and Exit Criteria)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: The Scrum Guide (Definition of Done)
    url: https://www.scrumguides.org/
interview:
  - q: What are entry and exit criteria?
    a: Entry criteria are the preconditions for starting a test activity — for example a stable build that passes smoke tests, an available environment, test data, and reviewed test cases. Exit criteria define what must be achieved to declare the activity complete — for example planned tests executed, coverage targets met, no open critical defects, and remaining defects reviewed. Both are agreed in the test plan so starting and stopping are objective decisions rather than arguments.
  - q: What happens if exit criteria are not met by the release date?
    a: Testing does not silently stop and the criteria are not quietly rewritten. I report which criteria are not met, the residual risk, and options — extend testing, reduce scope, or ship with documented risk acceptance. The decision belongs to the stakeholders who own the release, and it is recorded.
  - q: How do entry and exit criteria work in Scrum?
    a: Definition of Ready acts as entry criteria for a backlog item — it is understood, has testable acceptance criteria and dependencies are resolved. Definition of Done acts as exit criteria for an increment — coded, reviewed, tested, regression passed, and so on. Teams may also keep release-level exit criteria, such as non-functional checks, that sit above the sprint DoD.
practice:
  - "Write entry and exit criteria for system testing of a new mobile banking transfer feature. Make every item measurable."
  - "Convert these vague exit criteria into measurable ones: 'testing is complete', 'few defects remain', 'performance is acceptable'."
  - "Write suspension and resumption criteria for a test cycle that depends on a third-party sandbox."
takeaways:
  - Entry criteria are preconditions for starting; exit criteria define 'done' for a test activity.
  - Make criteria measurable and checkable by anyone.
  - Suspension and resumption criteria stop wasted effort on broken builds.
  - Definition of Ready and Definition of Done play these roles in Scrum.
  - Unmet exit criteria are a risk decision for stakeholders, not something testers quietly waive.
quiz:
  - id: entry-exit-q1
    type: single
    topic: entry-and-exit-criteria
    difficulty: beginner
    prompt: Which is a typical entry criterion for system testing?
    options:
      - "All high-priority defects are closed"
      - "The build has been deployed to the test environment and passed the smoke suite"
      - "The test closure report is approved"
      - "Defect density is below the agreed threshold"
    answer: [1]
    explanation: "A deployed build that passes smoke is a precondition for starting. Closed defects, density thresholds and an approved closure report are conditions for finishing, so they are exit criteria or closure activities."
  - id: entry-exit-q2
    type: multiple
    topic: entry-and-exit-criteria
    difficulty: intermediate
    prompt: Which of these are measurable exit criteria? Select all that apply.
    options:
      - "100% of high-risk test cases executed"
      - "No open defects with severity Critical or High"
      - "Testing feels complete"
      - "All open Medium defects reviewed and accepted by the product owner"
      - "The software is of good quality"
    answer: [0, 1, 3]
    explanation: "Percent executed, open defects by severity and documented acceptance can be checked objectively. 'Feels complete' and 'good quality' are opinions that cannot be verified."
  - id: entry-exit-q3
    type: scenario
    topic: entry-and-exit-criteria
    difficulty: intermediate
    prompt: "On day two of a test cycle, a new build makes login fail for all users. What does good test practice suggest?"
    options:
      - "Continue testing other features through workarounds"
      - "Apply the suspension criteria, report the blocker, and resume when a fixed build passes smoke"
      - "Mark all blocked tests as failed"
      - "Lower the exit criteria to keep the schedule"
    answer: [1]
    explanation: "Suspension criteria exist for exactly this. Testing through workarounds wastes effort and produces unreliable results; marking blocked tests as failed misrepresents status; changing exit criteria to save the date hides risk."
---

## Beginner-friendly explanation

A pilot does not take off just because passengers are seated. There is a **pre-flight checklist**: fuel loaded, doors closed, weather cleared, tower permission given. That is the **entry criteria**. At the end, the plane is only "arrived" when it is at the gate, engines off and doors open. That is the **exit criteria**.

Testing has the same two checklists. Starting with a broken build or no test data wastes everyone's time. Stopping because "we ran out of time" without checking what is left hides risk. Agreed criteria turn both decisions into checklists instead of arguments.

## Technical explanation

ISTQB Foundation Level v4.0 defines:

- **Entry criteria**: the preconditions for undertaking a given activity. If they are not met, the activity is likely to be harder, more time-consuming, costlier and riskier.
- **Exit criteria**: what must be achieved to declare an activity completed.

Typical categories:

| Type | Entry examples | Exit examples |
|---|---|---|
| Resources | Environment ready, testers available, tools configured | n/a |
| Test basis | Requirements or stories reviewed and baselined | n/a |
| Test ware | Test cases and data prepared and reviewed | Test results recorded, ware archived |
| Build quality | Smoke suite passes, unit tests green | Defect density or open defect counts within agreed limits |
| Coverage | n/a | Planned tests executed, requirements coverage met |
| Defects | Known blockers resolved | No open Critical/High; others reviewed and accepted |

ISTQB also notes that **running out of time or budget** can be valid exit criteria, as long as stakeholders have reviewed and accepted the risk of stopping.

**Suspension criteria** say when testing should pause (for example, a blocking defect stops more than a set share of tests). **Resumption criteria** say what must happen to restart (for example, a fixed build passes smoke).

In Scrum, the **Definition of Ready** works as entry criteria for a backlog item and the **Definition of Done** as exit criteria for an increment. See [acceptance criteria, DoR and DoD](/learn/manual-testing/acceptance-criteria-dor-dod).

## Real-world example

An insurance team plans the system test cycle for a new online claims form. The test plan contains these checklists.

**Entry criteria: system test cycle 1**

- [ ] All in-scope stories are marked "Ready for test" and meet the Definition of Ready
- [ ] Build deployed to the QA environment with release notes listing included stories
- [ ] Smoke suite (8 cases) passes 100%
- [ ] Unit and API automated tests are green in the CI pipeline for this build
- [ ] Test data loaded: policies in Active, Lapsed and Cancelled states
- [ ] Document-upload service sandbox reachable
- [ ] Test cases for high-risk areas reviewed by a second tester

**Suspension and resumption**

- Suspend if the smoke suite fails, or if a single defect blocks more than 30% of planned cases (the team's agreed threshold)
- Resume when a new build passes the full smoke suite and the blocking defect is verified

**Exit criteria: system test cycle**

- [ ] 100% of high-risk and 95% of all planned test cases executed
- [ ] All requirements have at least one executed test (see the RTM)
- [ ] No open defects of severity Critical or High
- [ ] All open Medium and Low defects reviewed in triage, with a decision recorded
- [ ] Regression suite for existing claim types executed with no new failures
- [ ] Test progress report published and reviewed with the product owner

The 30% and 95% thresholds are team decisions for this project, not industry standards. Each organisation sets its own.

At the end of cycle 1, the team had executed 97% of cases but one High defect (claim amount rounding) was open. The exit criteria were **not met**, so the lead reported it, the fix was retested in cycle 2, and only then did the team recommend moving to acceptance testing.

## Step-by-step walkthrough

1. **Start from the organisational strategy**, which may define standard criteria.
2. **Tailor per test level** (component, integration, system, acceptance).
3. **Make each criterion measurable**: a number, a state or a named approval.
4. **Add suspension and resumption criteria**, especially where environments are fragile.
5. **Agree the criteria** with development, product and operations in the test plan.
6. **Check them visibly**: at the start of the cycle and in every progress report.
7. **If an exit criterion will not be met**, escalate early with options and let stakeholders decide.

## Common mistakes

- **Unmeasurable criteria** such as "testing is sufficient" or "quality is good".
- **Starting anyway** when entry criteria fail, then spending days on defects caused by a broken deployment.
- **Treating exit criteria as optional** when the deadline arrives, with no recorded risk acceptance.
- **Only counting tests**, never defects or coverage.
- **Copying the same criteria to every level.** Unit-level exit criteria differ from acceptance-level ones.
- **Forgetting non-functional criteria** such as performance or accessibility checks.

## Troubleshooting

- **Management asks to start without a stable build.** Start with what is possible (test design, static review) and record the risk.
- **Criteria are always missed.** They may be unrealistic; review them at the retrospective rather than ignoring them.
- **Disagreement on whether a criterion is met.** That signals it was not measurable; rewrite it.

## Key takeaways summary

Entry criteria protect testers from starting too early; exit criteria protect the business from stopping too early. Write them measurably, add suspension and resumption rules, check them openly, and escalate unmet criteria as a risk decision.
