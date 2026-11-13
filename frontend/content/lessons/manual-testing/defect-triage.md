---
slug: defect-triage
title: Defect Triage, Duplicates, Rejected and Deferred Defects
summary: Defect triage reviews new and open defects to confirm them, set priority, assign owners, and decide on duplicates, rejections and deferrals. Learn how to run a triage session and handle each outcome fairly.
level: intermediate
duration: 30
tags: [defect-management, bug-tracking, test-management]
objectives:
  - Explain the purpose of defect triage and who takes part
  - Run a triage session with a clear agenda and decision rules
  - Handle duplicate, rejected (works as designed, cannot reproduce) and deferred outcomes correctly
  - Respond professionally when your defect is rejected
prerequisites:
  - Defect lifecycle
  - Severity versus priority
related: [defect-lifecycle, severity-vs-priority, writing-a-great-defect-report, release-sign-off, root-cause-analysis]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.5, Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Jira guides (issue resolutions and workflows)
    url: https://www.atlassian.com/software/jira/guides
  - title: Bugzilla documentation
    url: https://bugzilla.readthedocs.io/en/latest/
interview:
  - q: What is defect triage and who attends?
    a: Triage is a regular review of new and unresolved defects to decide what happens to each one — confirm it is valid, agree severity and priority, assign an owner and target release, or close it as duplicate, rejected or deferred. Typical attendees are the test lead, a development lead and the product owner, plus specialists when needed. Each decision and its reason is recorded on the defect.
  - q: Your defect was rejected as "works as designed". What do you do?
    a: First I re-read the requirement and acceptance criteria. If the behaviour really matches them, I accept the rejection, but if the design still harms users I may raise it with the product owner as an improvement or a requirement question. If the behaviour contradicts the documented requirement, I add the reference and evidence and ask triage to review it again. I keep it factual — the goal is the right product decision, not winning the argument.
  - q: How do you decide whether two defects are duplicates?
    a: Duplicates share the same root problem, not just a similar symptom. Two error messages on the same page might have different causes, and one cause may show up on several pages. I compare steps, conditions, logs and, where possible, the developer's analysis. When unsure, I link them as related rather than closing one, and resolve it once the cause is known. The surviving report should keep the best details from both.
practice:
  - "Prepare the agenda and decision log template for a 30-minute weekly triage meeting."
  - "Given five defect summaries (write your own), decide which are duplicates, which need more information, and which should be deferred. Justify each."
  - "Write the comment you would add when deferring a defect, including the risk accepted and the review date."
takeaways:
  - Triage turns a pile of reports into decisions with owners and dates.
  - Duplicates share a root cause; link and merge useful details rather than discarding them.
  - Rejection needs a stated reason such as works as designed, cannot reproduce or invalid.
  - Deferral is a recorded risk acceptance with a review date, not a polite deletion.
  - Record every decision and reason on the defect itself.
quiz:
  - id: triage-q1
    type: scenario
    topic: defect-triage
    difficulty: intermediate
    prompt: "Two testers report 'Error 500 on profile save' and 'Avatar upload fails with error 500'. Logs show both come from the same null check in the profile service. What should triage do?"
    options:
      - "Keep both open and assign to different developers"
      - "Mark one as Duplicate of the other, link them, and keep useful details in the surviving report"
      - "Reject both because the logs explain the cause"
      - "Defer both until the next release"
    answer: [1]
    explanation: "Same root cause means duplicate. Linking preserves both sets of steps so the fix is verified for both symptoms. Fixing them separately wastes effort; rejecting ignores a real defect."
  - id: triage-q2
    type: single
    topic: defect-triage
    difficulty: beginner
    prompt: What does it usually mean when a defect is Deferred?
    options:
      - "It is not a defect"
      - "It is valid, but the fix is postponed to a later release with the risk accepted"
      - "It has been fixed and verified"
      - "It was reported twice"
    answer: [1]
    explanation: "Deferred means valid but postponed. 'Not a defect' is Rejected, 'reported twice' is Duplicate, and 'fixed and verified' leads to Closed."
  - id: triage-q3
    type: multiple
    topic: defect-triage
    difficulty: intermediate
    prompt: Which are legitimate reasons to reject a defect? Select all that apply.
    options:
      - "The behaviour matches the documented requirement (works as designed)"
      - "It cannot be reproduced after a documented attempt with the reporter's details"
      - "It was caused by an incorrect test environment configuration"
      - "The fix would be inconvenient for the current sprint"
    answer: [0, 1, 2]
    explanation: "Works as designed, cannot reproduce (after a genuine attempt) and environment or test errors are valid rejection reasons. Inconvenient timing makes a valid defect a deferral candidate, not a rejection."
  - id: triage-q4
    type: truefalse
    topic: defect-triage
    difficulty: beginner
    prompt: A defect rejected as 'cannot reproduce' can be reopened if new evidence shows how to reproduce it.
    options: ["True", "False"]
    answer: [0]
    explanation: "Rejection is based on the information available at the time. New evidence such as reliable steps or logs justifies reopening."
---

## Beginner-friendly explanation

In a hospital emergency department, a nurse sees each new patient first and decides: urgent, can wait, wrong department, or already being treated under another name. That is **triage**. It makes sure the most important cases are handled first and nobody is lost.

**Defect triage** does the same with bug reports. A small group looks at each new defect and decides: is it real, how urgent is it, who will fix it, or is it a duplicate, not a bug, or something to fix later?

## Technical explanation

**Defect triage** is a recurring review of new and unresolved defects to reach a decision on each. Typical participants: test lead, development lead and product owner, with others (security, operations, UX) as needed. Frequency ranges from daily near a release to weekly during normal development.

For each defect, triage decides one of these outcomes:

| Outcome | Meaning | Required information |
|---|---|---|
| **Accept and assign** | Valid; set severity, priority, owner, target release | Owner, target version |
| **Need more information** | Cannot decide yet | Specific question to the reporter, due date |
| **Duplicate** | Same root problem as an existing defect | Link to the original |
| **Rejected: works as designed** | Behaviour matches the agreed requirement | Requirement reference |
| **Rejected: cannot reproduce** | Not reproducible with given details after a real attempt | What was tried, build and environment |
| **Rejected: invalid / test error** | Caused by wrong test data, config or test case | Explanation |
| **Deferred** | Valid but postponed | Reason, accepted risk, who accepted it, review date or target release |

A defect that is "works as designed" but where the design is questionable can become a **change request** or new backlog item: the product decides, not the defect tracker.

### A simple triage agenda (30 minutes)

1. New defects since last session: decide outcome for each
2. Reopened defects: why did the fix fail?
3. Blockers and P1s: status and owners
4. Deferred defects due for review
5. Trends worth flagging (for example, many defects in one component)

## Real-world example

An e-learning platform's weekly triage session reviews five defects. The decision log:

| ID | Summary | Decision | Reason recorded |
|---|---|---|---|
| DEF-610 | Quiz timer continues after the browser tab is hidden | Accepted, S2/P2, assigned to front-end, target 3.6 | Breaks exam integrity rule REQ-Q-08 |
| DEF-611 | Certificate PDF shows wrong date for learners in UTC+13 | Accepted, S3/P2 | Affects learners in that time zone; reproducible with the time-zone setting |
| DEF-612 | "Course completion % wrong after retake" | **Duplicate** of DEF-598 | Developer confirmed same aggregation bug; DEF-612's steps (retake path) copied into DEF-598 so the fix is verified for both |
| DEF-613 | Cannot submit an empty forum post | **Rejected: works as designed** | REQ-F-03 requires at least 1 non-space character; tester agreed after reading it |
| DEF-614 | Course search ignores accented characters (searching "resume" does not find "résumé") | **Deferred** to 3.8 | Valid. Product owner accepts the risk for 3.6 because search is being replaced in 3.8; review in 3.8 planning. Known issue added to release notes |

A sixth defect, DEF-615 "video occasionally stops at 2:14", was marked **Need more information**: the developer asked for browser version, network type and whether it happened on more than one video. The tester added a network trace two days later showing the video segment request failing with a timeout; triage then accepted it.

### When your own defect is rejected

1. Read the reason and the referenced requirement carefully.
2. If you agree, say so in a comment. That builds trust.
3. If you disagree, add **new** facts: the requirement text, the user impact, a video, other affected flows.
4. If the requirement is unclear, ask the product owner to decide; the decision may update the requirement.
5. Never reopen repeatedly without new information.

## Step-by-step walkthrough

1. **Set a cadence and attendees** in the test plan.
2. **Pre-filter**: the test lead checks new defects for completeness and obvious duplicates before the session.
3. **Go through the agenda**, deciding each defect in a minute or two; park long technical discussions.
4. **Record the decision and reason** on the defect itself, not only in meeting notes.
5. **Notify reporters** of rejections and duplicates so they learn and can respond.
6. **Review deferred defects** on their review date, re-assessing priority with current context.
7. **Feed trends** into [root cause analysis](/learn/manual-testing/root-cause-analysis) and test planning.

## Common mistakes

- **Rejecting without a reason**, which feels dismissive and leaves no audit trail.
- **Closing duplicates without merging details**, losing the steps for a second symptom.
- **Treating "deferred" as "never"**, with no review date and no risk acceptance.
- **Triage by the loudest voice** rather than severity, priority and evidence.
- **Debating fixes in triage.** Decide ownership; solve the problem afterwards.
- **"Cannot reproduce" after one quick try** on a different build or environment.

## Troubleshooting

- **The triage meeting runs too long.** Pre-filter, time-box each defect, and move deep discussions offline.
- **The deferred list keeps growing.** Report it with ages and severity in progress reports; ask the product owner to close or schedule items.
- **Testers and developers keep disputing rejections.** Clarify acceptance criteria earlier, in story refinement, so expected behaviour is agreed before testing.

## Key takeaways summary

Triage turns defect reports into decisions with owners, dates and reasons. Merge duplicates with their details, reject only with a stated reason, and treat deferral as an explicit, reviewed risk acceptance. When your defect is rejected, respond with facts, not repetition.
