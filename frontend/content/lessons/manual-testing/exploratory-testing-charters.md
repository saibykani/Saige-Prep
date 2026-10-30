---
slug: exploratory-testing-charters
title: Exploratory Testing Charters
summary: Give exploratory testing direction and accountability with well-written charters, time-boxed sessions, session sheets and debriefs, so learning-driven testing becomes visible and manageable.
level: intermediate
duration: 30
tags: [test-design, experience-based, exploratory, istqb]
objectives:
  - Define exploratory testing as described in ISTQB CTFL v4.0
  - Write charters in the "Explore target with resources to discover information" format
  - Run a time-boxed session and record it on a session sheet
  - Explain session-based test management, its metrics and the debrief
prerequisites:
  - Exploratory and ad hoc testing
  - Error guessing
related: [exploratory-and-ad-hoc-testing, error-guessing, risk-based-scenario-selection, writing-a-great-defect-report]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 4.4.2, Exploratory Testing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: Atlassian Jira guides (tracking sessions and defects)
    url: https://www.atlassian.com/software/jira/guides
interview:
  - q: What is a test charter?
    a: A charter is a short mission statement for an exploratory session that states what to explore, with what resources or techniques, and what kind of information to look for. A common format is "Explore target with resources to discover information". It is specific enough to focus the session and to be reviewed afterwards, but open enough to leave room for learning and judgement, unlike a scripted test case.
  - q: What is session-based test management?
    a: It is a way of managing exploratory testing in uninterrupted, time-boxed sessions, each driven by a charter. The tester records notes, defects, issues and how the time was split on a session sheet, and a short debrief with a lead follows each session. It makes exploratory testing plannable, measurable and auditable without scripting it.
  - q: When is exploratory testing most useful?
    a: ISTQB notes it is useful when specifications are few or inadequate, when there is significant time pressure, and to complement more formal techniques. In practice I also use it on new features to learn quickly, after a risky change, and to probe areas where scripted tests keep passing but users still report problems.
  - q: How do you report coverage from exploratory testing?
    a: I map charters to risk areas or features and report which charters were completed, how much session time went to each area, and what was found, including bugs, issues and open questions. Session sheets give the evidence, and the debrief decides whether an area needs another charter.
practice:
  - "Write five charters in the Explore/with/to discover format for a hotel booking site, each targeting a different risk."
  - "Run a 45-minute session on any public demo application you are authorised to test. Fill in a session sheet including the time split."
  - "Rewrite these charters to be neither too broad nor too narrow, namely 'Explore the app' and 'Check that coupon SAVE10 gives 10% off'."
takeaways:
  - Exploratory testing designs, executes and evaluates tests simultaneously while learning about the test object.
  - A charter gives a session its mission, using the format Explore target with resources to discover information.
  - Session-based test management adds time-boxes, session sheets, metrics and debriefs.
  - Good charters are risk-driven and sized to fit one session.
  - Exploratory testing complements scripted and systematic techniques; it is not unplanned ad hoc testing.
quiz:
  - id: xchart-q1
    type: single
    topic: exploratory-testing-charters
    difficulty: beginner
    prompt: Which charter best follows the Explore/with/to discover format and is well scoped?
    options: ["Explore the application", "Verify that coupon SAVE10 applies a 10% discount", "Explore the coupon field with stacked, expired and malformed codes to discover pricing and validation defects", "Test everything related to payments before Friday"]
    answer: [2]
    explanation: It names a target (coupon field), resources (stacked, expired, malformed codes) and the information sought (pricing and validation defects). "Explore the application" is too broad for one session, and the SAVE10 check is a scripted test case, not a charter.
  - id: xchart-q2
    type: multiple
    topic: exploratory-testing-charters
    difficulty: intermediate
    prompt: Which items typically appear on a session sheet in session-based test management? Select all that apply.
    options: ["The charter", "Start time and duration", "Bugs and issues found", "The developer's unit test results"]
    answer: [0, 1, 2]
    explanation: A session sheet records the charter, the time-box, notes, bugs, issues and how time was split. Unit test results belong to the build pipeline, not to an exploratory session record.
  - id: xchart-q3
    type: truefalse
    topic: exploratory-testing-charters
    difficulty: beginner
    prompt: In ISTQB CTFL v4.0, exploratory testing means tests are designed, executed and evaluated at the same time while the tester learns about the test object.
    options: ["True", "False"]
    answer: [0]
    explanation: That is the ISTQB v4.0 description. Learning feeds directly into the next test, which is what distinguishes it from executing pre-written scripts.
  - id: xchart-q4
    type: scenario
    topic: exploratory-testing-charters
    difficulty: intermediate
    prompt: During a 90-minute session on the coupon field, a tester notices the cart total is wrong when the currency is switched. What should they do?
    options: ["Ignore it because it is outside the charter", "Abandon the charter and spend the rest of the session on currency", "Note it as an opportunity or bug, briefly confirm it, and propose a new charter for currency switching", "Delete the session sheet and start again"]
    answer: [2]
    explanation: Off-charter findings are valuable but should not hijack the mission. Record the bug or opportunity, spend a little time confirming it, and raise a follow-up charter in the debrief. Ignoring it wastes information, and abandoning the charter loses focus and coverage.
---

## Beginner-friendly explanation

Imagine visiting a new city with one free afternoon. You could wander randomly, or you could set yourself a mission: *"Explore the old market with a street-food map to discover the best breakfast places."* You are still free to follow your curiosity, take side streets and change plans, but you know what you are looking for, and at the end you can tell a friend exactly what you covered.

Exploratory testing is like that afternoon: you learn the software while testing it, and each discovery shapes the next test. A **charter** is your mission statement for the trip. It keeps exploration focused and makes it easy to report what you did.

## Technical explanation

ISTQB CTFL v4.0 (section 4.4.2) describes **exploratory testing** as testing in which tests are simultaneously designed, executed and evaluated while the tester learns about the test object. It is used to learn more about the test object, to explore it more deeply with focused tests, and to create tests for untested areas. ISTQB notes it is useful when specifications are few or inadequate, under significant time pressure, or to complement more formal techniques. It is more effective when the tester is experienced, has domain knowledge and applies skills such as curiosity, analytical thinking and creativity, and it can incorporate other techniques such as equivalence partitioning.

ISTQB adds that exploratory testing is sometimes conducted as **session-based testing**: the tester works within a defined **time-box**, guided by a **test charter** containing test objectives, and the session is usually followed by a **debriefing** with stakeholders.

### The charter format

A widely used template, popularised by Elisabeth Hendrickson in her book *Explore It!*, is:

> **Explore** *target* **with** *resources* **to discover** *information*

| Part | Meaning | Example |
|---|---|---|
| Target | Where to explore: a feature, area, requirement, module | the coupon field at checkout |
| Resources | What you bring: data, tools, techniques, personas, configurations | stacked, expired and malformed codes |
| Information | What you are looking for: risks, defects, quality characteristics | pricing and validation defects |

### Worked example: charters for a checkout release

| ID | Charter | Risk addressed |
|---|---|---|
| CH-1 | Explore the coupon field with stacked, expired and malformed codes to discover pricing and validation defects | Wrong totals |
| CH-2 | Explore the address form with long, non-Latin and incomplete addresses to discover data loss and formatting problems | Failed deliveries |
| CH-3 | Explore checkout with two concurrent browser sessions on one account to discover stale-cart and double-order problems | Duplicate orders |
| CH-4 | Explore the payment step with a throttled network and the browser back button to discover inconsistent order states | Charged but no order |
| CH-5 | Explore checkout with keyboard only and a screen reader to discover accessibility barriers | Excluded users |

**Too broad:** "Explore checkout." It cannot be finished in one session and cannot be reviewed. **Too narrow:** "Check that SAVE10 gives 10%." That is a scripted test case with nothing left to explore.

## Session-based test management

**Session-based test management (SBTM)**, developed by Jonathan Bach and James Bach, makes exploratory testing manageable:

- **Session**: an uninterrupted, time-boxed period of testing against one charter, commonly 60 to 120 minutes.
- **Session sheet**: the record of the session.
- **Time split**: the share of session time spent on **test design and execution**, **bug investigation and reporting**, and **session setup**. A high setup or bug share explains why less was covered.
- **Debrief**: a short conversation with a lead after each session about what was tested, what was found, what got in the way, and what should come next.

```mermaid
flowchart LR
  A["Risk list"] --> B["Charters"]
  B --> C["Time-boxed session"]
  C --> D["Session sheet"]
  D --> E["Debrief"]
  E -->|"new charters"| B
  E --> F["Bugs and issues logged"]
```

### Example session sheet

```text
CHARTER   CH-1 Explore the coupon field with stacked, expired and malformed
          codes to discover pricing and validation defects
TESTER    A. Tester            DATE 2026-03-12   START 10:00   DURATION 90 min
BUILD     checkout-web 4.2.0 on staging, Chrome desktop

TIME SPLIT   design and execution 60%   bug investigation 30%   setup 10%
CHARTER vs OPPORTUNITY   85 / 15

TEST NOTES
- Valid code, then remove item below minimum spend: discount removed correctly
- Two percentage codes: second replaces first, message shown
- Expired code: generic "invalid code" (no expiry reason) -> issue
- Code with trailing space: rejected; same code trimmed: accepted -> bug
- Lower-case code accepted; mixed case accepted

BUGS      BUG-ref: trailing whitespace makes valid coupon fail
ISSUES    Expiry message wording unclear (question for product owner)
          Switching currency changed total unexpectedly (off-charter, new charter proposed)
DATA      coupons-staging.csv
```

## Real-world example

A team building an internal claims tool had thin requirements and a fixed demo date. Instead of writing scripts that would be outdated within days, the test lead listed the main risks, wrote one or two charters per risk, and ran two 90-minute sessions per tester per day with ten-minute debriefs. The debriefs repeatedly showed high setup time for one area because test claims were hard to create, so the team built a data seeding script. Session sheets gave stakeholders a clear record of what had been explored, which they had never had from earlier unstructured "free testing".

## Step-by-step walkthrough

1. **List risks** for the release or feature. See [risk-based scenario selection](/learn/manual-testing/risk-based-scenario-selection).
2. **Write charters** in the Explore/with/to discover format, each sized for one session.
3. **Prioritise charters** by risk and assign them.
4. **Prepare**: environment, build, accounts, test data, tools such as a screen recorder or proxy.
5. **Run the session** uninterrupted. Take notes as you go: what you tried, what you observed, questions.
6. **Log bugs and issues** with enough detail to reproduce.
7. **Complete the session sheet**, including the time split and charter-versus-opportunity share.
8. **Debrief** within the day. Decide whether the charter is done, needs another session or has spawned new charters.

## Common mistakes

- **No charter at all**, which turns exploratory testing into undirected ad hoc clicking.
- **Charters that are really test cases**, with nothing left to discover.
- **Charters too big for a session**, so they never finish and coverage is unclear.
- **Taking notes afterwards from memory**, which loses steps needed to reproduce bugs.
- **Skipping debriefs**, which wastes what the session taught about risk and next steps.
- **Treating exploratory testing as unaccountable.** Session sheets and debriefs make it as auditable as scripted testing.

## Troubleshooting

- **Sessions keep getting interrupted.** Agree protected session slots with the team; an interrupted session should be noted and its time adjusted.
- **Setup eats the time-box.** Track it in the time split and use the evidence to request data seeding or environment fixes.
- **Stakeholders want "proof".** Share the charter list with status, session sheets and the bugs and issues raised.

## Key takeaways summary

Charters give exploratory testing a mission. Write them as "Explore target with resources to discover information", size them for one session, run uninterrupted time-boxes, record a session sheet and debrief every time. That is how learning-driven testing stays focused and visible. Pair it with [error guessing](/learn/manual-testing/error-guessing) checklists for extra ideas.
