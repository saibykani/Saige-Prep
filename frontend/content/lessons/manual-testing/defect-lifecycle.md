---
slug: defect-lifecycle
title: Defect Lifecycle
summary: A defect moves through states from New to Closed, with side exits for Rejected, Duplicate and Deferred, and loops back when a fix fails. Learn the common states, who moves a defect between them, and how to configure a sensible workflow.
level: beginner
duration: 25
tags: [defect-management, bug-tracking, istqb]
objectives:
  - Describe the common states of a defect lifecycle and the transitions between them
  - Identify who is responsible for each transition
  - Explain Reopened, Rejected, Duplicate and Deferred outcomes
  - Recognise that workflows differ by tool and organisation
prerequisites:
  - Error, defect, bug and failure
related: [error-defect-bug-failure, writing-a-great-defect-report, defect-triage, severity-vs-priority, retesting-and-confirmation-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.5, Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Jira guides (workflows)
    url: https://www.atlassian.com/software/jira/guides
  - title: Bugzilla documentation (bug lifecycle and statuses)
    url: https://bugzilla.readthedocs.io/en/latest/
interview:
  - q: Walk me through a typical defect lifecycle.
    a: A tester logs a defect as New. In triage it is confirmed and assigned to a developer, who moves it to In Progress and then Fixed once the change is in a build. The tester retests it on that build — if the fix works it becomes Verified and then Closed, otherwise it is Reopened and goes back to the developer. From triage, a defect can also leave the main path as Rejected (not a defect), Duplicate (already reported) or Deferred (valid but postponed). Exact state names depend on the tool and team.
  - q: Who should close a defect?
    a: Usually the tester or the reporter, after confirming the fix on the build where it was delivered, and ideally after a short regression around the change. A developer closing their own fix skips independent verification. Some teams let the product owner close cosmetic issues or let a pipeline close defects verified by automated tests, but the rule should be explicit in the workflow.
  - q: What is the difference between Reopened and a new defect?
    a: Reopened means the original problem still occurs after a claimed fix — same steps, same failure. If the fix works but the change introduced a different problem, or the failure is different, it should be a new defect linked to the original. Mixing the two hides regressions and distorts metrics such as reopen rate.
practice:
  - "Draw the defect workflow your current or a hypothetical team uses. Mark who owns each transition."
  - "Write the comment you would add when reopening a defect, including build number and evidence."
  - "List three rules you would add to a Jira workflow to prevent defects being closed without verification."
takeaways:
  - The main path is New, Assigned, In Progress, Fixed, Retest, Verified, Closed.
  - Side exits are Rejected, Duplicate and Deferred; the failure loop is Reopened.
  - Each transition has an owner and should add information (build, reason, evidence).
  - Testers verify fixes on the build that contains them before closing.
  - State names vary by tool; agree definitions in your team.
quiz:
  - id: defect-lc-q1
    type: single
    topic: defect-lifecycle
    difficulty: beginner
    prompt: A tester retests a defect marked Fixed and the same failure still occurs. What should the defect's next state be?
    options: ["Closed", "Reopened", "Deferred", "Duplicate"]
    answer: [1]
    explanation: "The claimed fix did not resolve the problem, so the defect is reopened and returned to the developer with evidence. Closing it would hide the failure; Deferred and Duplicate describe different situations."
  - id: defect-lc-q2
    type: scenario
    topic: defect-lifecycle
    difficulty: intermediate
    prompt: "While retesting a fixed defect about a wrong discount, you find the discount is now correct but the order total no longer includes shipping. What do you do?"
    options:
      - "Reopen the original defect"
      - "Close the original defect and raise a new defect linked to it"
      - "Ignore the shipping issue because it was not in scope"
      - "Mark the original defect as Duplicate"
    answer: [1]
    explanation: "The original problem is fixed, so it can be verified and closed. The shipping problem is a different failure, likely a regression introduced by the fix, so it gets its own defect linked to the original."
  - id: defect-lc-q3
    type: truefalse
    topic: defect-lifecycle
    difficulty: beginner
    prompt: Every organisation uses exactly the same defect states and names.
    options: ["True", "False"]
    answer: [1]
    explanation: "Tools such as Jira and Bugzilla ship with different default workflows and teams customise them. The concepts are similar but names and transitions vary."
  - id: defect-lc-q4
    type: multiple
    topic: defect-lifecycle
    difficulty: intermediate
    prompt: Which are valid reasons for a defect to leave the main fix path during triage? Select all that apply.
    options:
      - "It describes intended behaviour (Rejected)"
      - "It was already reported (Duplicate)"
      - "It is valid but will be fixed in a later release (Deferred)"
      - "The developer is busy this week (Closed)"
    answer: [0, 1, 2]
    explanation: "Rejected, Duplicate and Deferred are legitimate triage outcomes with clear reasons. Developer workload is a scheduling matter and never a reason to close a valid defect."
---

## Beginner-friendly explanation

Think of sending a parcel with tracking. It is **created**, **picked up**, **in transit**, **out for delivery**, **delivered**. Sometimes it is **returned to sender** (wrong address), sometimes **held** for later delivery, and sometimes the recipient says "this is damaged" and it goes **back** through the system.

A defect has a tracking history too. Everyone involved can see where it is, who has it, and what happened at each step. Without that, defects get lost, fixed twice, or "fixed" without anyone checking.

## Technical explanation

ISTQB Foundation Level v4.0 describes defect management as a workflow for handling individual defects from discovery to closure, with rules for classification. The syllabus does not mandate state names; tools and teams define them. A common workflow:

```mermaid
stateDiagram-v2
  [*] --> New: tester logs defect
  New --> Assigned: triage accepts
  New --> Rejected: not a defect
  New --> Duplicate: already reported
  New --> Deferred: valid, fix later
  Assigned --> InProgress: developer starts
  InProgress --> Fixed: fix in a build
  Fixed --> Retest: build deployed to test
  Retest --> Verified: fix confirmed
  Retest --> Reopened: still fails
  Reopened --> Assigned
  Verified --> Closed
  Deferred --> Assigned: scheduled
  Rejected --> Reopened: new evidence
  Rejected --> Closed
  Duplicate --> Closed
  Closed --> [*]
```

| State | Meaning | Usual owner of the next move |
|---|---|---|
| New | Logged, not yet reviewed | Triage group / lead |
| Assigned | Accepted and given to a developer | Developer |
| In Progress | Being investigated or fixed | Developer |
| Fixed (Resolved) | Code change made and included in a build | Build/release, then tester |
| Retest (Ready for QA) | Fix deployed where it can be tested | Tester |
| Verified | Tester confirmed the fix | Tester or lead |
| Closed | No further action | n/a |
| Reopened | Fix did not work | Developer |
| Rejected | Not a defect (works as designed, cannot reproduce, invalid) | Reporter may challenge with evidence |
| Duplicate | Same root problem as an existing defect | Closed with link to the original |
| Deferred | Valid, but fix postponed | Product owner reschedules |

Tools differ: Jira's default workflows use statuses such as "To Do", "In Progress" and "Done" with resolutions such as "Duplicate" or "Won't Do"; Bugzilla uses statuses such as UNCONFIRMED, CONFIRMED, IN_PROGRESS, RESOLVED and VERIFIED, with resolutions such as FIXED, DUPLICATE and WONTFIX. Names change; the ideas map across.

## Real-world example

A travel-booking team tracks this defect's history:

| Date | Transition | By | Comment |
|---|---|---|---|
| Mon 10:12 | → New | Tester | "Return date picker allows a date before the departure date" (build 3.4.0-112) |
| Mon 15:00 | New → Assigned | Triage | Severity Medium, priority High (booking form, many users). Assigned to front-end dev |
| Tue 09:30 | Assigned → In Progress | Developer | Validation was missing on the client side |
| Tue 16:40 | In Progress → Fixed | Developer | Fixed in build 3.4.0-118; added server-side validation too |
| Wed 10:05 | Fixed → Retest | Release | 3.4.0-118 deployed to QA |
| Wed 11:20 | Retest → Reopened | Tester | Still fails when the date is typed manually instead of picked. Video attached |
| Thu 12:00 | Reopened → Assigned → Fixed | Developer | Typed input now validated; build 3.4.0-121 |
| Thu 15:30 | Fixed → Retest → Verified | Tester | Verified on 3.4.0-121: picker, typed input and API all rejected; regression of date search passed |
| Thu 15:31 | Verified → Closed | Tester | |

The history itself is valuable: it records which build fixed it, why it was reopened, and what was retested.

## Step-by-step walkthrough

1. **Log the defect** with full detail (see [writing a great defect report](/learn/manual-testing/writing-a-great-defect-report)).
2. **Triage** decides: accept and assign, reject, mark duplicate or defer (see [defect triage](/learn/manual-testing/defect-triage)).
3. **Developer fixes** and records the build or version that contains the fix.
4. **Tester retests** on that build, using the original steps plus variations.
5. **Run regression** around the change.
6. **Verify and close**, or **reopen** with new evidence.
7. **Review aged and deferred defects** regularly so nothing is forgotten.

## Common mistakes

- **Closing without retesting** because "the developer said it's fixed".
- **Reopening for a different problem** instead of raising a new linked defect.
- **Silent transitions** with no comment, so nobody knows why a defect was rejected.
- **Retesting on the wrong build**, which produces false results in both directions.
- **Deferred becoming a graveyard**: postponed defects never reviewed again.
- **Over-complicated workflows** with 15 states that nobody follows consistently.

## Troubleshooting

- **The fix is not in your build.** Check the fix version and build number before retesting; ask for the deployment if needed.
- **Developer and tester disagree on Rejected.** Bring the requirement and evidence to triage; the product owner decides on expected behaviour.
- **The defect cannot be reproduced any more** but nothing was changed. Record the build tested, keep it open for a defined period or close as "cannot reproduce" with a note on how to reopen.

## Key takeaways summary

A defect lifecycle makes ownership and history visible. Keep the main path simple, use clear side exits with reasons, verify fixes on the right build, and raise new linked defects for new problems rather than reopening old ones.
