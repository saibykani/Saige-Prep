---
slug: test-execution-and-closure-reports
title: Test Execution and Closure Reports
summary: Progress reports keep stakeholders informed during testing; completion (closure) reports summarise what was tested, what was found and what risk remains. Learn what each contains and how to write them honestly.
level: intermediate
duration: 30
tags: [test-documentation, test-management, reporting, istqb]
objectives:
  - Distinguish a test progress report from a test completion (closure) report
  - Calculate execution and pass percentages from raw results
  - Write an execution report summary that highlights risk, not just numbers
  - Outline a closure report including lessons learned and archived testware
prerequisites:
  - Entry and exit criteria
  - Traceability matrix and coverage
related: [entry-and-exit-criteria, traceability-matrix-and-coverage, release-sign-off, defect-metrics, test-strategy-vs-test-plan]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.3, Test Monitoring, Test Control and Test Completion)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISO/IEC/IEEE 29119-3 Software testing — Test documentation
    url: https://www.iso.org/standard/79429.html
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
interview:
  - q: What is the difference between a test progress report and a test completion report?
    a: A progress report is produced regularly during testing — daily or weekly — to show status against the plan, blockers, new risks and what happens next, so stakeholders can act while there is still time. A completion report is produced once at the end of a test level, release or project. It summarises what was tested, results against exit criteria, outstanding defects and residual risk, deviations from the plan, and lessons learned, and it supports the release decision.
  - q: What would you put at the top of a test report?
    a: A short summary a busy stakeholder can read in thirty seconds — the overall status, whether exit criteria are met, the top risks or blocking defects, and a recommendation or the decision needed from them. Detailed numbers and tables come after that summary.
  - q: How do you avoid misleading metrics in a test report?
    a: I give context with every number — a 95 percent pass rate means little if the 5 percent includes the payment flow. I report by risk and requirement, not just counts, I show blocked and not-run tests separately rather than hiding them, I state the formulas used, and I never round or exclude results to make status look greener.
practice:
  - "From these results — 180 planned, 162 executed, 140 passed, 14 failed, 8 blocked — calculate execution % and pass % of executed, and write a three-sentence summary."
  - "Write a closure report outline for a two-month project that ended with two known Medium defects deferred to the next release."
  - "Rewrite this status line so it is useful to a product owner: 'Testing is going OK, some defects found.'"
takeaways:
  - Progress reports are frequent and action-oriented; completion reports are final and decision-oriented.
  - Lead with a short summary of status, risk and decisions needed.
  - Report blocked and not-run tests separately; they are not passes.
  - Tie results to requirements and risk, not just raw counts.
  - Closure includes archiving testware and capturing lessons learned.
quiz:
  - id: exec-close-q1
    type: code-output
    topic: test-execution-and-closure-reports
    difficulty: intermediate
    prompt: What is the execution percentage for this cycle?
    code: |
      Planned: 200
      Passed: 150   Failed: 20   Blocked: 10   Not run: 20
    codeLanguage: text
    options: ["75%", "85%", "90%", "100%"]
    answer: [1]
    explanation: "Executed tests are those with a pass or fail result: 150 + 20 = 170, and 170 ÷ 200 = 85%. Blocked tests were not executed, so including them (90%) overstates progress; 75% is the pass rate against planned tests."
  - id: exec-close-q2
    type: single
    topic: test-execution-and-closure-reports
    difficulty: beginner
    prompt: When is a test completion (closure) report typically produced?
    options:
      - "Every day during test execution"
      - "Before test design starts"
      - "When a test level, release or project's testing is complete"
      - "Whenever a defect is found"
    answer: [2]
    explanation: "The completion report summarises testing once an activity ends. Daily reporting describes progress reports; defects are reported individually in defect reports."
  - id: exec-close-q3
    type: multiple
    topic: test-execution-and-closure-reports
    difficulty: intermediate
    prompt: Which items belong in a test completion report? Select all that apply.
    options:
      - "Evaluation of results against exit criteria"
      - "Unresolved defects and residual risks"
      - "Deviations from the test plan"
      - "Lessons learned"
      - "Personal performance ratings of each tester"
    answer: [0, 1, 2, 3]
    explanation: "Exit criteria, residual risk, deviations and lessons learned are standard completion report content. Individual performance ratings are HR matters and would discourage honest reporting."
  - id: exec-close-q4
    type: truefalse
    topic: test-execution-and-closure-reports
    difficulty: beginner
    prompt: Blocked test cases can be counted as passed if the blocker is outside the team's control.
    options: ["True", "False"]
    answer: [1]
    explanation: "A blocked test has not produced a result, so nothing is known about that functionality. It must be reported as blocked, whatever the cause."
---

## Beginner-friendly explanation

Think of a long road trip with a group. During the drive, someone sends **regular updates** to the family chat: "Halfway there, traffic jam near the bridge, we'll be 40 minutes late." That is a **progress report**: frequent, short, and useful because people can still react.

When you arrive, you write a **trip summary**: where you went, what went wrong, what to do differently next time and where you left the spare keys. That is the **completion (closure) report**: written once, looking back, used to decide what happens next.

## Technical explanation

ISTQB Foundation Level v4.0 names two main test reports:

| Report | When | Purpose | Typical content |
|---|---|---|---|
| **Test progress report** | Regularly during testing (daily, weekly, per sprint) | Support ongoing control | Period covered, progress against plan, impediments and workarounds, metrics, new or changed risks, plan for next period |
| **Test completion report** | At the end of a test level, iteration, release or project | Support the release decision and improvement | Summary, evaluation against exit criteria, deviations from plan, unresolved defects, residual risks, metrics, lessons learned, testware produced |

Common execution metrics (definitions vary by organisation, so state yours):

```text
Execution %          = (passed + failed) ÷ planned × 100
Pass % of executed   = passed ÷ (passed + failed) × 100
Blocked              = cannot be run because of an impediment (report separately)
Not run              = not attempted yet
```

**Test closure activities** include checking exit criteria, archiving testware (cases, data, scripts, environment notes) for reuse, handing over to maintenance or operations, and holding a retrospective.

## Real-world example

A team is finishing system testing of a new online claims form for an insurer. This is the Friday progress report summary in week 3:

```text
TEST PROGRESS REPORT - Claims Form R2, week 3 (ends Fri)
Overall: AMBER - on track for execution, one High defect threatens exit

Summary
 - 95.0% of planned tests executed; all high-risk tests executed.
 - DEF-482 (High): claim amount rounds incorrectly for values with 3+ decimals
   from the currency service. Fix expected Tue; retest + regression needs 1 day.
 - Document upload blocked on staging for 1 day (storage quota); resolved Wed.
Decision needed: none this week. If DEF-482 slips past Wed, release date at risk.
```

| Metric | Value |
|---|---|
| Planned | 240 |
| Passed | 205 |
| Failed | 15 |
| Blocked | 8 |
| Not run | 12 |
| Execution % ((205 + 15) ÷ 240) | 91.7% |
| Pass % of executed (205 ÷ 220) | 93.2% |

Notice the problem in this draft: the summary says 95.0% executed, but the table says 91.7%. Spotting this kind of contradiction **before** sending is part of the job. The writer had counted blocked tests as executed ((205 + 15 + 8) ÷ 240 = 95.0%). The corrected summary line reads "91.7% executed (8 blocked by the storage issue, 12 not yet run)". Status reports lose trust fast when numbers do not reconcile.

| Defects this cycle | Raised | Fixed and verified | Open |
|---|---|---|---|
| Critical | 1 | 1 | 0 |
| High | 6 | 5 | 1 |
| Medium | 18 | 12 | 6 |
| Low | 12 | 4 | 8 |

### Test completion report outline

The final report, written after cycle 2, follows this outline:

1. **Summary and recommendation**: what was tested, overall result, recommendation to the release decision-makers
2. **Scope**: test items, versions and environments; what was out of scope
3. **Results against exit criteria**: each criterion, met or not met, with evidence
4. **Coverage**: requirements coverage from the RTM; untested items and why
5. **Defect summary**: by severity and status; list of open defects with triage decisions
6. **Residual risks**: what could still go wrong, and who accepted each risk
7. **Deviations from the plan**: schedule changes, scope changes, skipped activities
8. **Metrics**: execution, pass rates, defect trends (with formulas)
9. **Lessons learned**: what helped, what hurt, what to change
10. **Testware archive**: where cases, data, scripts and reports are stored

## Step-by-step walkthrough

1. **Agree the audience and cadence** in the test plan (who gets which report, how often).
2. **Collect raw data** from the test management and defect tools; do not retype numbers by hand.
3. **Calculate metrics** using stated formulas and reconcile totals.
4. **Write the summary first**: status, top risks, decisions needed.
5. **Add detail** below: tables, defect lists, coverage.
6. **Review for consistency** (do the summary and tables agree?).
7. **At the end**, evaluate exit criteria, write the completion report, archive testware and run a retrospective.

## Common mistakes

- **Numbers without meaning.** "212 passed" says nothing about whether checkout works.
- **Counting blocked as executed or passed**, which hides untested areas.
- **Watermelon reporting**: green outside, red inside. Bad news delayed is bad news multiplied.
- **Reports nobody reads** because the key message is on page four.
- **Skipping lessons learned** because the project is over; the next project pays for it.
- **No archive**, so the next release rebuilds test data and cases from scratch.

## Troubleshooting

- **Stakeholders only look at the colour.** Define what Green, Amber and Red mean in the test plan.
- **Data in tools is inconsistent.** Fix the source (statuses, links) rather than patching the report.
- **Pressure to show Green.** Report facts and risks neutrally; the release decision is the stakeholders' to make with accurate information.

## Key takeaways summary

Progress reports help people act during testing; completion reports help them decide at the end and improve next time. Lead with the summary, reconcile your numbers, separate blocked from executed, tie everything to risk, and close by archiving testware and lessons learned.
