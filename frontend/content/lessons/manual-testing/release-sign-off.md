---
slug: release-sign-off
title: Release Sign-off
summary: Release sign-off is the recorded decision that a release may go live. Learn who decides, what QA contributes, how conditional sign-off with known issues works, and a practical sign-off checklist.
level: intermediate
duration: 25
tags: [test-documentation, release-management, test-management]
objectives:
  - Explain the purpose of release sign-off and who is accountable for it
  - Describe what testing contributes to a go/no-go decision
  - Use a release sign-off checklist covering quality, operations and business readiness
  - Handle conditional sign-off with known defects and documented risk acceptance
prerequisites:
  - Entry and exit criteria
  - Test execution and closure reports
related: [entry-and-exit-criteria, test-execution-and-closure-reports, release-readiness, defect-triage, severity-vs-priority]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Google SRE books (release engineering and launch practices)
    url: https://sre.google/books/
  - title: The Scrum Guide
    url: https://www.scrumguides.org/
interview:
  - q: Does QA sign off the release?
    a: QA provides a recommendation based on evidence — results against exit criteria, open defects and residual risks. The decision to release normally belongs to the product or business owner, often together with engineering and operations, because it weighs quality risk against business value and deadlines. Testers should make sure the decision is informed, not make it alone or be blamed for it.
  - q: What is a conditional sign-off?
    a: It is approval to release with known exceptions — for example, two Medium defects with workarounds deferred to the next release, or a feature hidden behind a feature flag. Each exception is listed with its impact, workaround, owner and target fix date, and the risk acceptance is recorded with the name of the person accepting it.
  - q: What would make you recommend a no-go?
    a: An unmet exit criterion with significant risk — an open Critical or High defect in a core flow, untested high-risk areas, a failed data migration rehearsal, or no working rollback plan. I would present the evidence, the risk if we go, and options such as delaying, reducing scope or switching the feature off, so the decision-makers can choose.
practice:
  - "Write a release sign-off checklist for a mobile app update that adds biometric login."
  - "Draft the known-issues section for a release shipping with one Medium defect (wrong date format in an email for one locale)."
  - "Role-play: the product owner wants to release with an open High defect. Write the three-paragraph risk statement you would send."
takeaways:
  - Sign-off is a recorded, accountable go/no-go decision, usually owned by the business.
  - Testing contributes evidence and a recommendation, not a guarantee.
  - The checklist covers quality, operational readiness, rollback, support and communication.
  - Conditional sign-off lists every known issue with impact, workaround, owner and accepted risk.
  - Record who decided, when, and on what evidence.
quiz:
  - id: signoff-q1
    type: single
    topic: release-sign-off
    difficulty: beginner
    prompt: Who usually owns the final go/no-go decision for a release?
    options:
      - "The most junior tester"
      - "The product or business owner, with engineering and operations input"
      - "The developer who wrote the most code"
      - "The test automation framework"
    answer: [1]
    explanation: "Release is a business decision that weighs value against risk, so it sits with the accountable owner. QA supplies evidence and a recommendation; it does not usually own the decision."
  - id: signoff-q2
    type: scenario
    topic: release-sign-off
    difficulty: intermediate
    prompt: "All exit criteria are met except one open Medium defect: the PDF receipt shows the wrong logo for one region. A workaround exists. What is the best approach?"
    options:
      - "Block the release until it is fixed"
      - "Release without mentioning the defect"
      - "Recommend conditional sign-off, documenting the defect, impact, workaround, owner and target fix"
      - "Downgrade the defect to Low so criteria are fully met"
    answer: [2]
    explanation: "A Medium defect with a workaround is a classic conditional sign-off case. Hiding it or re-labelling it to pass criteria destroys trust; blocking may be disproportionate to the risk."
  - id: signoff-q3
    type: multiple
    topic: release-sign-off
    difficulty: intermediate
    prompt: Which items belong on a release sign-off checklist? Select all that apply.
    options:
      - "Rollback plan tested"
      - "Release notes and known issues prepared"
      - "Monitoring and alerts in place for the new feature"
      - "Exit criteria evaluated with evidence"
      - "Number of lines of code changed exceeds a target"
    answer: [0, 1, 2, 3]
    explanation: "Rollback, release notes, monitoring and exit-criteria evidence all reduce release risk. Lines of code changed is not a readiness criterion and says nothing about quality."
---

## Beginner-friendly explanation

Before a bride and groom's wedding day, a lot of people have done their part: the caterer, the florist, the photographer. But one person, usually the couple, says "yes, we're going ahead" and accepts that the weather might not be perfect.

**Release sign-off** is that "yes, we're going ahead" for software. Many people contribute: testers report what they found, developers confirm the fixes, operations confirm they can deploy and roll back. Then an accountable person decides, knowing the remaining risks, and that decision is written down.

## Technical explanation

**Release sign-off** (also called go/no-go approval or release approval) is a formal, recorded decision that a specific build may be deployed to production. It typically follows the [test completion report](/learn/manual-testing/test-execution-and-closure-reports) and the evaluation of [exit criteria](/learn/manual-testing/entry-and-exit-criteria).

| Role | Typical contribution |
|---|---|
| Test lead / QA | Results versus exit criteria, open defects, residual risk, recommendation |
| Development lead | Fix status, code freeze, known technical debt |
| Operations / SRE | Deployment plan, monitoring, rollback, capacity |
| Security / compliance (where relevant) | Required reviews completed |
| Product / business owner | Accepts residual risk and approves go or no-go |
| Support | Ready with known issues and workarounds |

Outcomes:

- **Go**: all criteria met.
- **Conditional go**: release with listed exceptions, each with recorded risk acceptance.
- **No-go**: delay, reduce scope or disable features (for example, with a feature flag).

In continuous delivery, sign-off is often **automated** for low-risk changes (pipeline gates replace a meeting), while high-risk changes still get a human decision. The principle is the same: explicit criteria and a recorded decision.

## Real-world example

A food-delivery company is releasing version 5.8 of its customer web app, which adds scheduled orders. This is the sign-off checklist used in the go/no-go meeting.

**Release sign-off checklist: v5.8**

| # | Item | Owner | Status | Evidence |
|---|---|---|---|---|
| 1 | All exit criteria evaluated | Test lead | Met except #3 | Completion report v1.0 |
| 2 | No open Critical or High defects | Test lead | Met | Defect dashboard filter "5.8 open" |
| 3 | Medium/Low open defects triaged and accepted | Product owner | 2 accepted | Known issues KI-1, KI-2 |
| 4 | Regression suite passed on release candidate build | Test lead | Met | Run RC-3 |
| 5 | Performance check of order scheduling at expected peak | Performance tester | Met | Test summary attached |
| 6 | Accessibility check of new screens | QA | Met | Checklist completed |
| 7 | Deployment runbook reviewed | Ops lead | Met | Runbook v5.8 |
| 8 | Rollback tested in staging | Ops lead | Met | Rehearsal notes |
| 9 | Monitoring dashboards and alerts for scheduled orders | SRE | Met | Dashboard link |
| 10 | Feature flag to disable scheduled orders | Dev lead | Met | Flag verified in staging |
| 11 | Release notes and support known-issues article | Product / support | Met | Draft approved |
| 12 | Final go/no-go decision recorded | Product owner | Conditional go | Meeting notes |

**Known issues accepted for this release**

| ID | Defect | Severity | Impact | Workaround | Fix target |
|---|---|---|---|---|---|
| KI-1 | Scheduled time shows in 24-hour format on one locale's confirmation email | Low | Cosmetic confusion | Correct time shown in app | 5.9 |
| KI-2 | Editing a scheduled order within 5 minutes of cut-off shows a generic error | Medium | User must cancel and reorder | Support script prepared | 5.8.1 hotfix |

**Decision record:** "Conditional go for v5.8, approved by the product owner for scheduled orders after reviewing the completion report and known issues KI-1 and KI-2. Feature flag remains available to disable scheduled orders if error rates exceed the alert threshold."

## Step-by-step walkthrough

1. **Agree the sign-off process early** in the test plan: who signs, what evidence, which criteria.
2. **Prepare the evidence**: completion report, defect list, RTM, non-functional results.
3. **Run the checklist** with each owner confirming their items.
4. **List every exception** with severity, impact, workaround, owner and target.
5. **Give a clear QA recommendation** with reasons.
6. **Let the accountable owner decide** and record the decision, the date and the names.
7. **After release**, monitor, and verify in production that the critical flows work (a post-release smoke check where policy allows).

## Common mistakes

- **Treating QA sign-off as a guarantee** of zero defects. Testing reduces risk; it cannot remove it.
- **Verbal approvals** that nobody can find later.
- **Hidden known issues**, discovered by support on day one.
- **Ignoring operational readiness**: no rollback plan or no monitoring for the new feature.
- **Last-minute changes after sign-off** without re-evaluating risk.
- **Testers being pressured to "just sign".** The tester's job is to make risk visible; the owner decides.

## Troubleshooting

- **Nobody wants to own the decision.** Escalate to whoever owns the product roadmap; the test plan should name the approver.
- **A fix lands after sign-off.** Re-run the agreed smoke and regression subset and update the decision record.
- **Disagreement on whether a defect blocks release.** Present severity, user impact and workarounds; let the owner decide and record the decision.

## Key takeaways summary

Sign-off turns test evidence into an accountable, recorded decision. QA brings facts and a recommendation; operations brings rollback and monitoring readiness; the business owner accepts the residual risk. List known issues openly and write the decision down.
