---
slug: root-cause-analysis
title: Root Cause Analysis
summary: Root cause analysis asks why a defect was introduced and why it escaped, so the team can fix the process, not just the code. Learn the 5 Whys and the fishbone (Ishikawa) diagram, and how to run a blameless RCA.
level: intermediate
duration: 30
tags: [defect-management, process-improvement, quality]
objectives:
  - Distinguish a symptom, a direct cause and a root cause
  - Apply the 5 Whys technique to a defect and recognise its limits
  - Use a fishbone (Ishikawa) diagram to explore causes across categories
  - Turn RCA findings into specific, owned preventive actions
prerequisites:
  - Error, defect, bug and failure
  - Defect triage
related: [error-defect-bug-failure, defect-triage, defect-metrics, defect-lifecycle, test-execution-and-closure-reports]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (defects, root causes and effects)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Google SRE books (postmortem culture)
    url: https://sre.google/books/
  - title: ISTQB Glossary (root cause, root cause analysis)
    url: https://glossary.istqb.org/
interview:
  - q: What is root cause analysis and when would you do it?
    a: RCA is a structured investigation into why a defect occurred and why it was not caught earlier, so that the underlying cause can be removed. I would use it for production incidents, escaped high-severity defects, repeated defects in the same area, or a trend such as many requirement-related defects. It is not worth doing for every cosmetic bug.
  - q: Explain the 5 Whys technique and its limitations.
    a: You start from the problem and ask "why?" repeatedly, each answer becoming the next question, until you reach a cause you can act on — five is a guideline, not a rule. Its limits are that it follows a single chain when problems often have several contributing causes, the result depends on the knowledge of the people in the room, and it can stop at a person ("the developer forgot") instead of the process that allowed it. Combining it with a fishbone diagram and evidence helps.
  - q: What does "blameless" mean in RCA?
    a: It means we assume people acted reasonably with the information and tools they had, and we look for the conditions that made the mistake possible or likely, such as unclear requirements, missing checks or confusing tooling. People then share what really happened instead of hiding it, which is the only way to find real causes. Accountability is for fixing the system, not punishing individuals.
practice:
  - "Pick an escaped defect (real or invented) and write a 5 Whys chain that ends in a process cause. Then list two other possible causal chains you did not follow."
  - "Draw a fishbone diagram for 'users received duplicate notification emails' with at least two causes per category."
  - "Rewrite these weak actions so they are specific and owned: 'be more careful', 'test better', 'improve communication'."
takeaways:
  - Fixing the defect removes the symptom; RCA removes the conditions that created it.
  - Ask both why it was introduced and why it escaped detection.
  - 5 Whys is quick but linear; fishbone explores multiple categories of causes.
  - Stopping at a person is a red flag; look for the process or system cause.
  - Every RCA should end with specific, owned, dated actions that are tracked.
quiz:
  - id: rca-q1
    type: single
    topic: root-cause-analysis
    difficulty: intermediate
    prompt: Which is the most useful final answer in a 5 Whys analysis of an escaped defect?
    options:
      - "The developer made a mistake"
      - "The tester missed it"
      - "Acceptance criteria for rounding were never defined, and refinement has no checklist step for calculation rules"
      - "The bug was in the code"
    answer: [2]
    explanation: "It names a process gap that can be fixed with a concrete action. Answers that stop at a person or restate the symptom do not prevent recurrence."
  - id: rca-q2
    type: multiple
    topic: root-cause-analysis
    difficulty: intermediate
    prompt: Which are known limitations of the 5 Whys technique? Select all that apply.
    options:
      - "It tends to follow a single causal chain"
      - "Results depend on the knowledge of the participants"
      - "It can stop at blaming a person"
      - "It requires specialised software"
    answer: [0, 1, 2]
    explanation: "5 Whys is linear, knowledge-dependent and easily ends in blame. It needs no special software, which is one reason it is popular."
  - id: rca-q3
    type: truefalse
    topic: root-cause-analysis
    difficulty: beginner
    prompt: Root cause analysis should be performed in full for every low-severity cosmetic defect.
    options: ["True", "False"]
    answer: [1]
    explanation: "RCA takes time, so teams reserve it for high-impact, escaped or recurring defects and trends. Cosmetic one-off defects rarely justify it."
  - id: rca-q4
    type: single
    topic: root-cause-analysis
    difficulty: beginner
    prompt: What is a fishbone (Ishikawa) diagram used for?
    options:
      - "Tracking defect status over time"
      - "Grouping possible causes of a problem into categories to explore them systematically"
      - "Estimating test effort"
      - "Mapping requirements to test cases"
    answer: [1]
    explanation: "The fishbone diagram puts the problem at the head and groups candidate causes into categories (bones). Status tracking, estimation and traceability use other tools."
---

## Beginner-friendly explanation

If your kitchen floor is wet, you can mop it. Tomorrow it is wet again. You can mop every day, or you can find out **why** it is wet: a leaking pipe under the sink, which leaks because a washer is worn, which wore out because the water pressure is too high.

Fixing a defect is mopping. **Root cause analysis (RCA)** is finding the leak, and then the reason for the leak, so the floor stops getting wet.

## Technical explanation

ISTQB distinguishes errors (human mistakes), defects (flaws in a work product) and failures (observed deviations). A **root cause** is a source of a defect such that, if it is removed, the occurrence of that type of defect is decreased or removed. **Root cause analysis** is the technique for finding it.

Two questions matter for every significant defect:

1. **Why was it introduced?** (requirements, design, coding, configuration)
2. **Why did it escape?** (reviews, tests, environments, monitoring)

### 5 Whys

Start with the problem statement and ask "why?" repeatedly, using evidence for each answer, until you reach a cause you can act on. Five is a guideline.

### Fishbone (Ishikawa) diagram

Write the problem at the "head" and draw "bones" for categories of cause. Common software categories: **Requirements, Process, People/Skills, Tools, Environment, Code/Design**. Brainstorm candidate causes under each, then use evidence to confirm or discard them.

### Blameless approach

Practices described in the Google SRE books emphasise blameless postmortems: look at the systems and conditions that allowed a mistake, not at punishing the person who made it. People share facts only when it is safe to do so.

## Real-world example

**Incident:** after a release, customers of a utilities billing portal in one region were charged a late fee even though they paid on the due date. The defect was fixed by a hotfix within a day. The team then ran an RCA.

### 5 Whys (introduction chain)

| Why? | Answer (with evidence) |
|---|---|
| 1. Why were customers charged late fees? | The late-fee job treated payments made on the due date as late (job logs) |
| 2. Why were due-date payments treated as late? | The comparison used `paymentDate > dueDate` with timestamps in UTC, while due dates are in local time (code review) |
| 3. Why was UTC compared with local time? | The new payment service returns UTC; the old one returned local time. The change was not noticed (API diff) |
| 4. Why was the change not noticed? | The API contract did not specify time zone, and no consumer test covered it (contract file) |
| 5. Why was there no requirement or test for time zone? | Refinement has no checklist step for date/time rules and the story's acceptance criteria were silent on it |

**Escape chain:** test data used payments at midday local time, so the UTC offset never crossed a day boundary. No boundary test existed for "paid on the due date, late evening". (Compare [boundary value analysis](/learn/manual-testing/boundary-value-analysis) applied to time.)

### Fishbone

```mermaid
flowchart LR
  REQ["Requirements: no time-zone rule in story; due date definition ambiguous"] --> P
  PROC["Process: no refinement checklist for date and time; API change not announced"] --> P
  PEOPLE["People: new team owned the payment service; knowledge of old behaviour lost"] --> P
  TOOLS["Tools: no consumer contract tests for date fields"] --> P
  ENV["Environment: test servers and data all in the same time zone"] --> P
  CODE["Code: string timestamps without zone; comparison mixes UTC and local"] --> P
  P(("Late fees charged for on-time payments"))
```

### Actions agreed

| Action | Owner | Due |
|---|---|---|
| Add "date, time and time zone rules" to the refinement checklist | Product owner | Next sprint |
| Specify time zone (ISO 8601 with offset) in the payment API contract | Payments tech lead | 2 weeks |
| Add consumer contract tests for date fields | Billing developers | 2 weeks |
| Add boundary test cases for due-date payments at 23:59 local and 00:00 next day | QA | Next sprint |
| Run one test environment in a different time zone | Platform team | 1 month |

Notice what is **not** an action: "developers must be more careful". It is not specific, not measurable and does not change the conditions.

## Step-by-step walkthrough

1. **Choose what deserves RCA**: escaped high-severity defects, incidents, recurring problems.
2. **Write a precise problem statement** with impact and timeline.
3. **Collect evidence**: logs, commits, test cases, requirements, timeline of events.
4. **Run 5 Whys** for both "introduced" and "escaped", checking each answer against evidence.
5. **Build a fishbone** to look for contributing causes beyond the single chain.
6. **Agree actions** that are specific, owned and dated.
7. **Track actions** to completion and check later whether similar defects decreased (see [defect metrics](/learn/manual-testing/defect-metrics)).

## Common mistakes

- **Stopping at a person** ("tester missed it") instead of asking why the system made it easy to miss.
- **Only one chain.** Real incidents usually have several contributing causes.
- **Answers without evidence**, which turn RCA into guesswork.
- **Vague actions** like "test more" that nobody can complete.
- **No follow-up**, so actions are forgotten.
- **RCA for everything**, which burns time and makes people resent the practice.

## Troubleshooting

- **The discussion turns into blame.** Restate the blameless rule and redirect to "what made this possible?".
- **The team cannot agree on the root cause.** Record the contributing causes and act on the ones with the best evidence and cheapest prevention.
- **Actions keep slipping.** Put them in the backlog with the same visibility as features.

## Key takeaways summary

RCA looks past the fix to the conditions that created the defect and let it escape. Use 5 Whys for depth, a fishbone for breadth, evidence for every claim, and finish with specific, owned actions that change the process, in a blameless setting.
