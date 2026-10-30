---
slug: release-readiness
title: Release readiness
summary: Decide, with evidence, whether an increment is ready to ship. Use a release readiness checklist covering scope, testing, defects, non-functional checks, operations and rollback, and present residual risk honestly.
level: intermediate
duration: 30
tags: [release, release-readiness, risk, go-no-go, agile]
objectives:
  - Explain what release readiness means and who decides to release
  - Use a release readiness checklist across scope, quality, non-functional, operational and support areas
  - Present residual risk clearly so stakeholders can make an informed go or no-go decision
  - Distinguish the Definition of Done from release readiness
prerequisites:
  - Entry and exit criteria
  - Acceptance criteria, Definition of Ready and Done
related: [release-sign-off, entry-and-exit-criteria, test-execution-and-closure-reports, risk-based-testing, severity-vs-priority, acceptance-criteria-dor-dod]
references:
  - title: The Scrum Guide (2020) - Increment and Definition of Done
    url: https://www.scrumguides.org/scrum-guide.html
  - title: ISTQB Certified Tester Foundation Level (CTFL) v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Google SRE books (release engineering and monitoring)
    url: https://sre.google/books/
  - title: OWASP Top Ten
    url: https://owasp.org/www-project-top-ten/
interview:
  - q: Who decides whether a release goes ahead, and what is the tester's role?
    a: The decision belongs to whoever owns the product and business risk, usually the Product Owner or a release owner, sometimes with operations and security sign-off. The tester's role is to provide clear, honest evidence - what was tested, what was not, what defects are open and their impact, and the residual risk. A tester should not silently block or silently approve; they make risk visible so the decision is informed.
  - q: What would you put on a release readiness checklist?
    a: Scope confirmed and every included item meeting the Definition of Done; planned tests executed with results recorded; no open critical defects and known issues documented with workarounds; regression of high-risk areas done; non-functional checks relevant to the change, such as performance, security and accessibility; database migrations rehearsed; configuration and feature flags set per environment; monitoring and alerts ready; a tested rollback or roll-forward plan; release notes and support briefed; and a named owner for the release and the post-release checks.
  - q: The release date is tomorrow and you found a high-severity defect in a rarely used admin report. What do you do?
    a: I would report it immediately with evidence and assess impact - who uses the report, whether data is wrong or just displayed wrongly, whether there is a workaround, and whether it is a regression. Then I would present options - fix and retest if low risk, release with the feature disabled behind a flag, release with a documented known issue and a follow-up fix, or delay. The product owner decides with that information. I would make sure whichever option is chosen is recorded.
  - q: How is release readiness different from the Definition of Done?
    a: The Definition of Done is the quality bar each item must meet to be part of the Increment. Release readiness is a broader decision about deploying to users now - it adds operational and business concerns such as migrations, rollback, monitoring, support readiness, timing, dependencies on other teams and the overall residual risk across all items. An Increment can meet the Definition of Done and still not be released yet.
practice:
  - "Adapt the release readiness checklist in this lesson for a mobile app release that needs app store review. What items change?"
  - "Write a one-page release readiness summary for a fictional release with 12 stories, 2 open medium defects and one untested integration. State the residual risk and your recommendation."
  - "List five signals you would monitor in the first hour after a release of a checkout change and what threshold would trigger a rollback discussion."
takeaways:
  - Release readiness is an evidence-based business decision; the tester supplies the evidence and the risk picture.
  - Cover scope, testing, defects, non-functional checks, deployment, rollback, monitoring and support.
  - Report what was not tested as clearly as what was.
  - The Definition of Done covers each item; release readiness covers deploying the whole increment now.
  - Plan the first hours after release - smoke checks, monitoring and a rollback trigger.
quiz:
  - id: relready-q1
    type: single
    topic: release-readiness
    difficulty: beginner
    prompt: What is the tester's primary contribution to a go or no-go release decision?
    options: ["Making the final decision alone", "Providing clear evidence of test coverage, open defects and residual risk", "Guaranteeing the release has no defects", "Approving the release once all test cases have been executed"]
    answer: [1]
    explanation: The decision belongs to the product or release owner. The tester provides the evidence and risk picture that makes the decision informed. No amount of testing can guarantee zero defects, and executed test count alone says nothing about results or gaps.
  - id: relready-q2
    type: multiple
    topic: release-readiness
    difficulty: intermediate
    prompt: Which items belong on a release readiness checklist but are usually not part of a single story's acceptance criteria? Select all that apply.
    options: ["Rollback plan tested", "Monitoring dashboards and alerts in place", "Support team briefed on changes and known issues", "Discount code is rejected after its expiry date", "Database migration rehearsed on a production-like copy"]
    answer: [0, 1, 2, 4]
    explanation: Rollback, monitoring, support briefing and migration rehearsal are release-level operational concerns. The discount expiry rule is feature behaviour, which belongs in that story's acceptance criteria.
  - id: relready-q3
    type: scenario
    topic: release-readiness
    difficulty: intermediate
    prompt: All stories meet the Definition of Done, but the payment provider's sandbox was down so refunds could not be tested end to end. The release is tomorrow. What is the best tester action?
    options: ["Mark refunds as passed because the code was reviewed", "Say nothing, since the stories meet the Definition of Done", "Report refunds as untested with the risk and options, such as a feature flag, a production smoke test with a controlled transaction, or a delay", "Block the release without discussion"]
    answer: [2]
    explanation: Untested areas must be visible with their risk and possible mitigations, so the owner can decide. Reporting untested work as passed is dishonest, silence hides risk, and blocking without discussion removes the business from a business decision.
  - id: relready-q4
    type: truefalse
    topic: release-readiness
    difficulty: beginner
    prompt: An Increment that meets the Definition of Done must be released to users immediately.
    options: ["True", "False"]
    answer: [1]
    explanation: False. The Scrum Guide says an Increment may be delivered to stakeholders prior to the end of the Sprint and that the Sprint Review should not be considered a gate to releasing value, but the decision to release to users is a separate product decision that depends on timing, operations and business readiness.
---

## Beginner-friendly explanation

Before a plane takes off, the pilots run a pre-flight checklist: fuel, instruments, doors, weather, flight plan. They do not ask "did each mechanic finish their job?" only; they ask "is this aircraft ready to fly *now*, with these passengers, on this route?"

**Release readiness** is the software team's pre-flight checklist. Each feature might be finished, but the question is bigger: is the whole thing safe to put in front of users today, and if something goes wrong, can we land safely?

## Technical explanation

Release readiness is the evaluation of whether a version of the product can be deployed to users with acceptable risk. It is a decision made by the product or release owner, informed by evidence from testing, development, operations, security and support.

It differs from the related ideas you have already met:

| Concept | Scope | Question it answers |
|---|---|---|
| Acceptance criteria | One item | Does this item behave as agreed? |
| Definition of Done | Every item in the Increment | Does each item meet our quality bar? |
| Exit criteria | A test level or phase | Have we tested enough to stop this level? |
| Release readiness | The whole release, now | Is it acceptable to deploy to users today? |

### Release readiness checklist

| Area | Check | Evidence |
|---|---|---|
| Scope | Release content agreed; every included item meets the Definition of Done | Release board or fix-version filter |
| Testing | Planned tests executed; results recorded; untested areas listed with reasons | Test cycle report |
| Regression | High-risk areas regression-tested on the release candidate build | Regression run results |
| Defects | No open critical defects; open defects reviewed and accepted with workarounds | Defect filter by severity |
| Non-functional | Performance, security and accessibility checks appropriate to the change | Reports, scan results, manual checks |
| Data | Database migrations rehearsed on a production-like copy; backups confirmed | Rehearsal log |
| Configuration | Environment settings, secrets and feature flags reviewed per environment | Config diff, flag list |
| Dependencies | Other teams and third parties ready; API versions compatible | Confirmations |
| Deployment | Deployment steps written or automated and rehearsed | Pipeline run on staging |
| Rollback | Rollback or roll-forward plan tested; data compatibility understood | Rehearsal result |
| Observability | Dashboards, logs and alerts ready for new features | Dashboard links |
| Support | Release notes, known issues and support briefing done | Notes, briefing record |
| Post-release | Smoke tests and monitoring owner named for the first hours | Plan with names |

### Presenting residual risk

The tester's report should answer four questions in plain language:

1. **What did we test, and how?** (scope, levels, environments)
2. **What did we not test, and why?** (blocked areas, time, environments)
3. **What is still open?** (defects with severity, impact and workaround)
4. **What is the residual risk and what mitigations exist?** (feature flags, monitoring, staged rollout)

```mermaid
flowchart TD
  E[Evidence: tests, defects, gaps, ops checks] --> R[Residual risk summary]
  R --> D{Release owner decision}
  D -->|Go| G[Deploy, smoke test, monitor]
  D -->|Go with mitigations| M[Flags off, staged rollout, known issues published]
  D -->|No-go| N[Fix, retest, re-plan]
```

## Real-world example

A team is releasing a new returns flow for an online clothing shop. All eight stories meet the Definition of Done. The release readiness review finds three gaps: the warehouse system's new endpoint was only tested with stubs, the refund email template was not checked in one supported language, and no alert exists for failed returns.

The tester's summary states each gap plainly with its risk. The Product Owner decides to release with the returns feature behind a flag enabled for a small percentage of users, adds an alert before the deployment, and schedules a live check with the warehouse team in the first hour. The release goes ahead with risk understood and contained, rather than either blindly shipping or blocking indefinitely.

## Step-by-step walkthrough

1. **Agree the checklist early** in the release cycle, not the day before.
2. **Freeze scope** for the release candidate and confirm each item meets the Definition of Done.
3. **Run regression** on the exact release candidate build.
4. **Review open defects** with the Product Owner; record accepted known issues.
5. **Rehearse deployment, migration and rollback** on a production-like environment.
6. **Write the readiness summary**: tested, not tested, open, residual risk, recommendation.
7. **Hold the go or no-go conversation** and record the decision and its owner.
8. **After deployment**, run smoke tests and watch monitoring for an agreed period.

## Common mistakes

- **Equating "all tests executed" with "ready".** Executed is not passed, and passed is not complete coverage.
- **Hiding untested areas** to avoid looking slow.
- **Testers owning the go decision alone**, which turns a business decision into a tester's burden.
- **Never testing the rollback**, then discovering during an incident that it does not work with the new database schema.
- **Skipping non-functional checks** for changes that clearly affect performance or security.
- **No plan for the first hours after release**, so problems are noticed by customers first.

## Troubleshooting

- **Pressure to sign off quickly.** Keep the summary short and factual; offer options rather than a bare yes or no.
- **Third-party sandbox unavailable.** Record it as untested, propose a controlled production check with an authorised test account, or a flag.
- **Defects found late in the release window.** Assess severity and impact, check for regressions, and present fix, flag, accept or delay options.

## Key takeaways summary

Release readiness asks whether this increment can safely meet users now. Use a checklist that covers quality, operations and support, report gaps honestly, and help the release owner make an informed, recorded decision.
