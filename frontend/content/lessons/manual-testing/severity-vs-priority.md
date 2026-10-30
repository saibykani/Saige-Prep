---
slug: severity-vs-priority
title: Severity versus Priority
summary: Severity is how badly a defect affects the system; priority is how urgently it should be fixed. Learn to rate both, use the high/low matrix, and explain the classic interview examples correctly.
level: beginner
duration: 25
tags: [defect-management, bug-tracking, istqb]
objectives:
  - Define severity and priority and explain who usually sets each
  - Classify defects using a severity scale and a priority scale
  - Give realistic examples for each quadrant of the severity versus priority matrix
  - Explain why severity and priority are kept as separate fields
prerequisites:
  - Defect lifecycle
related: [defect-lifecycle, defect-triage, writing-a-great-defect-report, risk-based-testing, release-sign-off]
references:
  - title: ISTQB Glossary (severity, priority)
    url: https://glossary.istqb.org/
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.5, Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Jira guides (issue priority and fields)
    url: https://www.atlassian.com/software/jira/guides
interview:
  - q: What is the difference between severity and priority?
    a: Severity is the degree of impact a defect has on the system or user — a crash or data loss is high severity, a typo is low. Priority is the order in which it should be fixed, which depends on business factors such as how many users are affected, deadlines, visibility and workarounds. Testers usually propose severity based on technical impact; the product owner or triage group sets priority. They are separate because a minor technical issue can be urgent and a serious one can wait.
  - q: Give an example of a high-severity, low-priority defect.
    a: The admin reporting module crashes when exporting more than a year of data, but the export is used once a year by one internal user, there is a workaround of exporting quarter by quarter, and the next year-end is months away. The crash is severe, but fixing it can be scheduled later.
  - q: Give an example of a low-severity, high-priority defect.
    a: The company name or logo is misspelled on the home page of a public website a day before a marketing launch. Functionally nothing breaks, so severity is low, but the reputational impact and visibility make it urgent.
practice:
  - "Classify ten defects from a recent project (or invent ten realistic ones) by severity and priority, and justify each rating in one sentence."
  - "Write your team's severity scale with a definition and one example per level."
  - "Explain to a new developer why a typo can block a release."
takeaways:
  - Severity measures impact on the system or user; priority measures fixing urgency.
  - Testers usually propose severity; the product owner or triage sets priority.
  - The four quadrants all occur in practice, so keep two separate fields.
  - Write definitions for each level so ratings are consistent.
  - Re-evaluate priority as context changes (dates, workarounds, user numbers).
quiz:
  - id: sev-pri-q1
    type: single
    topic: severity-vs-priority
    difficulty: beginner
    prompt: The company logo on the public home page is spelled wrongly, the day before a major marketing campaign. How should it be rated?
    options:
      - "High severity, high priority"
      - "Low severity, high priority"
      - "High severity, low priority"
      - "Low severity, low priority"
    answer: [1]
    explanation: "No function is broken, so impact on the system is low. Visibility and brand damage make the fix urgent, so priority is high. Treating it as high severity confuses business urgency with technical impact."
  - id: sev-pri-q2
    type: scenario
    topic: severity-vs-priority
    difficulty: intermediate
    prompt: "A legacy report crashes the application when run with a date range over five years. It is used by one internal analyst once a year, the next run is nine months away, and a shorter-range workaround exists. Which rating fits best?"
    options:
      - "High severity, low priority"
      - "Low severity, high priority"
      - "Low severity, low priority"
      - "High severity, high priority"
    answer: [0]
    explanation: "A crash is high severity, but rare use, a workaround and a distant deadline make the fix less urgent. Calling it low severity would misreport the technical impact."
  - id: sev-pri-q3
    type: truefalse
    topic: severity-vs-priority
    difficulty: beginner
    prompt: A defect's priority can change over time even when its severity stays the same.
    options: ["True", "False"]
    answer: [0]
    explanation: "Priority depends on business context such as release dates, user numbers and workarounds, which change. Severity describes the impact of the failure itself, which normally stays the same unless new information emerges."
  - id: sev-pri-q4
    type: single
    topic: severity-vs-priority
    difficulty: intermediate
    prompt: Who typically has the final say on a defect's priority?
    options:
      - "The tester who found it"
      - "The developer assigned to it"
      - "The product owner or triage group"
      - "The test automation tool"
    answer: [2]
    explanation: "Priority is a business scheduling decision, so it belongs to the product owner or triage group. Testers propose severity and provide impact information; developers estimate effort."
---

## Beginner-friendly explanation

Imagine a hotel. A guest reports two problems: the **fire alarm in a storeroom is broken**, and **the welcome sign in the lobby has a spelling mistake**.

The broken fire alarm is far more **severe**: if it matters, it matters a lot. But if a celebrity wedding is checking in within the hour, the manager may decide the lobby sign is the more **urgent** thing to fix right now, while the storeroom alarm is fixed by tomorrow because the room is locked and nobody is in it.

**Severity** asks "how bad is the damage?". **Priority** asks "how soon do we fix it?". They often agree, but not always, and that is why we track both.

## Technical explanation

The ISTQB glossary defines:

- **Severity**: the degree of impact that a defect has on the development or operation of a component or system.
- **Priority**: the level of (business) importance assigned to an item, for example a defect.

A typical severity scale (names and number of levels vary by organisation):

| Severity | Definition | Example |
|---|---|---|
| Critical (S1) | System unusable, data loss or corruption, security breach, no workaround | Payments charged twice |
| High (S2) | Major function broken, workaround hard or unavailable | Cannot apply any coupon at checkout |
| Medium (S3) | Function partly broken, reasonable workaround exists | Sort by price ignores items on sale |
| Low (S4) | Cosmetic or minor usability issue | Misaligned icon on profile page |

A typical priority scale:

| Priority | Meaning |
|---|---|
| P1 / Immediate | Fix now; may need a hotfix or blocks release |
| P2 / High | Fix in the current sprint or release |
| P3 / Medium | Fix when capacity allows, planned |
| P4 / Low | Fix if convenient; may be deferred |

Priority considers: number of users affected, business value of the feature, visibility, legal or contractual exposure, deadlines, availability of a workaround, and cost or risk of the fix.

### The severity versus priority matrix

| | **High priority** | **Low priority** |
|---|---|---|
| **High severity** | Checkout crashes for all card payments on an e-commerce site. Revenue stops; fix immediately. | An internal year-end report crashes for very large date ranges; used once a year, workaround exists, next use is months away. |
| **Low severity** | Brand name misspelled on the public landing page just before a launch campaign. Nothing breaks, but highly visible. | A tooltip on a rarely used settings page has a grammar mistake. |

## Real-world example

During a triage meeting for a mobile banking app, the team reviews three new defects:

| ID | Summary | Proposed severity (tester) | Agreed priority (product owner) | Reason |
|---|---|---|---|---|
| DEF-901 | App crashes when a user with more than 50 payees opens the payee list (Android) | High | P1 | Crash in a core flow; affects real customers with many payees; no workaround |
| DEF-902 | Statement PDF footer shows last year's copyright | Low | P3 | Cosmetic, low visibility; fix with next routine release |
| DEF-903 | Interest rate shown on the savings promo banner differs from the rate actually applied | Medium | P1 | Functionally minor display issue, but a wrong advertised rate is a regulatory and trust risk |

DEF-903 shows why severity and priority are separate: the technical impact is a text mismatch, but the business consequence is serious. The tester's job is to rate impact honestly and **describe the consequences** in the report so the product owner can set priority well.

## Step-by-step walkthrough

1. **Use your organisation's definitions**; if there are none, propose a scale like the one above.
2. **Rate severity from the failure's impact**, not from how hard it was to find or how annoyed you are.
3. **Describe user and business impact** in the report: who is affected, how often, any workaround.
4. **Leave priority to triage** or propose one clearly marked as a suggestion.
5. **Revisit priority** as dates, user numbers or workarounds change.
6. **Use both fields in reports**: open defects by severity for quality, by priority for planning.

## Common mistakes

- **Treating the two as one field**, which forces wrong ratings for the off-diagonal cases.
- **Inflating severity** to get a defect fixed faster. It erodes trust in all your ratings.
- **Rating severity by effort to fix.** A one-line fix can resolve a critical defect.
- **No definitions**, so two testers rate the same defect differently.
- **Ignoring business impact** in the description, leaving the product owner to guess.
- **Never re-prioritising** deferred defects when context changes.

## Troubleshooting

- **Developers dispute severity.** Point to the written definition and the observed impact; escalate to triage if needed.
- **Everything is marked P1.** Ask stakeholders to rank the P1 list; a priority scale only works if some items are lower.
- **Severity seems to depend on the user.** Rate for the worst realistic affected user and describe the scope of users in the report.

## Key takeaways summary

Severity is impact; priority is urgency. Testers rate impact honestly and explain consequences; the product owner sets urgency. All four combinations occur, so keep both fields, define each level, and revisit priority as circumstances change.
