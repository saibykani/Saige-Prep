---
slug: retesting-and-confirmation-testing
title: Retesting and Confirmation Testing
summary: Confirmation testing, often called retesting, checks that a reported defect has really been fixed. Learn how to retest precisely, why the original conditions matter, and how it fits with regression testing in the defect lifecycle.
level: beginner
duration: 25
tags: [test-types, confirmation-testing, retesting, change-related-testing, istqb]
objectives:
  - Define confirmation testing and explain why it is also called retesting
  - Distinguish confirmation testing from regression testing
  - Retest a fix under the original conditions and at least one variation
  - Close or reopen a defect with clear, evidence-based notes
prerequisites:
  - Defect lifecycle (basic awareness)
  - Writing a defect report
related: [regression-testing, defect-lifecycle, writing-a-great-defect-report, root-cause-analysis, smoke-and-sanity-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 2.2.3, Confirmation testing and regression testing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Atlassian Jira guides (issue workflows)
    url: https://www.atlassian.com/software/jira/guides
interview:
  - q: What is the difference between retesting and regression testing?
    a: Retesting, which ISTQB calls confirmation testing, checks that a specific defect has been fixed, by repeating the tests that failed because of it under the same conditions. Regression testing checks that the change, including that fix, has not broken anything else. Retesting is narrow and planned per defect; regression testing is broader and selected by impact and risk. Normally I confirm the fix first, then run regression.
  - q: How do you retest a defect properly?
    a: I re-run the original reproduction steps with the same data, configuration and environment type, on the build that contains the fix, and I verify the build number. Then I try close variations, such as nearby boundary values, another browser, or the other path into the same function, because a fix can be too narrow. If it passes, I close it with the build number and evidence. If it fails, I reopen it with fresh evidence rather than just changing the status.
  - q: Can confirmation testing be done by just running the new automated test the developer added?
    a: That is part of it, and ISTQB notes confirmation testing may be limited to the steps needed to reproduce the failure if time is short. But a developer's test reflects the developer's understanding of the defect. I still exercise the original user-visible scenario, because the defect report describes a failure the user saw, and the new unit test may only cover one cause of it.
practice:
  - "Take a closed defect from any project and write the confirmation test you would run, including the build check, original steps and two variations."
  - "Write a reopen comment for a fix that works in Chrome but still fails in Safari. Include everything a developer needs."
  - "Draw the defect lifecycle from 'Fixed' to 'Closed' or 'Reopened' and mark where confirmation and regression testing happen."
takeaways:
  - Confirmation testing, commonly called retesting, verifies that a specific defect is fixed.
  - Repeat the original steps, data and conditions, on a build you have verified contains the fix.
  - Add a few close variations, because fixes are often too narrow.
  - Confirmation testing does not replace regression testing; do both.
  - Close or reopen with evidence, including build number, environment and results.
quiz:
  - id: confirm-q1
    type: single
    topic: retesting-and-confirmation-testing
    difficulty: beginner
    prompt: A defect marked as fixed is tested again using the steps from the original report. What type of testing is this?
    options: ["Regression testing", "Confirmation testing", "Smoke testing", "Acceptance testing"]
    answer: [1]
    explanation: Re-executing the tests that failed because of the defect, to check it is fixed, is confirmation testing (retesting). Regression testing would look for side effects elsewhere.
  - id: confirm-q2
    type: scenario
    topic: retesting-and-confirmation-testing
    difficulty: intermediate
    prompt: You retest a fixed defect and it still fails. You then notice the test environment is running last week's build. What should you do?
    options: ["Reopen the defect immediately", "Close the defect because the developer said it is fixed", "Verify and deploy the build that contains the fix, then retest before changing the defect status", "Log a new defect about the old build"]
    answer: [2]
    explanation: The result is invalid because the fix is not deployed. Reopening would waste developer time on a false alarm, and closing without evidence is worse. Confirm the build first.
  - id: confirm-q3
    type: truefalse
    topic: retesting-and-confirmation-testing
    difficulty: beginner
    prompt: If confirmation testing passes, regression testing is unnecessary for that change.
    options: ["True", "False"]
    answer: [1]
    explanation: ISTQB describes regression testing as checking that a change, including a fix that has already been confirmation tested, has not caused adverse effects. A passing retest says nothing about side effects.
  - id: confirm-q4
    type: debugging
    topic: retesting-and-confirmation-testing
    difficulty: intermediate
    prompt: The original defect was that a quantity of 0 was accepted at checkout. The developer's fix is shown. Which retest variation is most likely to reveal that the fix is incomplete?
    code: |
      if (quantity == 0) {
          throw new ValidationException("Quantity must be at least 1");
      }
    codeLanguage: java
    options: ["Quantity 0", "Quantity 1", "Quantity -1", "Quantity 5"]
    answer: [2]
    explanation: The fix only rejects exactly 0, so negative quantities are still accepted. Retesting with only the original value 0 would pass and hide the incomplete fix, which is why close variations matter.
---

## Beginner-friendly explanation

You take your car to a garage because it makes a squealing noise when you brake. When you collect it, the mechanic says "Fixed!". What do you do? You drive around the block and brake, the same way you did when it squealed. Maybe you also brake a little harder, or on a downhill stretch, just to be sure.

That is **retesting**, which ISTQB calls **confirmation testing**: repeating the exact situation that showed the problem to confirm it is really gone. It sounds simple, and it is, but doing it carelessly is one of the most common reasons defects come back after release.

## Technical explanation

ISTQB CTFL v4.0 groups two kinds of **change-related testing**:

| | Confirmation testing (retesting) | Regression testing |
|---|---|---|
| Question | Is this specific defect fixed? | Did the change break anything else? |
| Scope | Narrow: the failed tests and the defect's scenario | Broad: areas affected by the change |
| Selection | Driven by the defect report | Driven by impact analysis and risk |
| Timing | First, as soon as the fix is deployed | After, or alongside, confirmation |

According to the syllabus, confirmation testing confirms that an original defect has been successfully fixed. Depending on risk, the fixed version can be tested by executing **all test cases that previously failed due to the defect**, or by adding new tests to cover changes needed to fix it. When time or money is short, confirmation testing may be restricted to exercising the steps that reproduce the failure and checking that it no longer occurs.

### Where it sits in the defect lifecycle

```mermaid
stateDiagram-v2
  [*] --> New
  New --> Open
  Open --> Fixed: developer resolves
  Fixed --> Retest: fix deployed to test environment
  Retest --> Closed: confirmation test passes
  Retest --> Reopened: confirmation test fails
  Reopened --> Fixed
  Closed --> [*]
```

Exact state names vary between tools and teams; see [defect lifecycle](/learn/manual-testing/defect-lifecycle) for the full picture.

### Why variations matter

A fix often addresses the **exact symptom** reported rather than the underlying cause. If a report says "quantity 0 is accepted", a developer might block `0` but not negative numbers. Good retesting repeats the original scenario **and** tries a few close variations: neighbouring values, another entry point (UI versus API), another browser or user role.

## Real-world example

A banking app had a defect: "Transfer confirmation screen shows the wrong currency symbol for EUR accounts." The fix was marked done. A tester retested with the original EUR account and the symbol was now correct.

Because the defect's root cause was a currency lookup, the tester also tried a GBP account and a transfer from the mobile app instead of the web. Both still showed the wrong symbol: the fix had added a special case for EUR only, in the web front end only. The defect was reopened with three screenshots and the build number, and the second fix corrected the shared lookup instead.

## Step-by-step walkthrough

1. **Read the defect report fully**: steps, data, environment, expected and actual results, and any developer notes on the fix.
2. **Verify the build.** Check the build or version number in the test environment contains the fix. This one step prevents many false reopenings.
3. **Restore the original conditions**: same data state, user role, configuration and environment type.
4. **Execute the original reproduction steps** exactly and record the result.
5. **Try close variations** suggested by the defect's nature: boundaries, other inputs, other entry points, other platforms.
6. **Decide and document.** If it passes, close it with build number, environment and evidence. If it fails, reopen it with new evidence and what you observed.
7. **Hand over to regression testing** for the areas the fix might affect.

### Worked example: retest record

| Field | Value |
|---|---|
| Defect | Quantity of 0 accepted at checkout |
| Build verified | 2.14.3 (contains fix commit referenced in ticket) |
| Original steps | Add item, set quantity 0, check out |
| Result | Rejected with "Quantity must be at least 1", which is correct |
| Variations | Quantity -1 via API was **accepted**, which is wrong |
| Decision | Reopened with API request and response attached |

## Common mistakes

- **Not checking the build** and reopening a defect whose fix was never deployed.
- **Retesting with different data** and drawing conclusions about the original scenario.
- **Only repeating the exact steps** and missing an incomplete fix.
- **Closing without evidence**, so nobody can tell later what was verified and where.
- **Skipping regression testing** because "the retest passed".
- **Reopening an old defect for a new problem.** If the original failure is fixed but you found something different, log a new defect and link them.

## Troubleshooting

- **You cannot reproduce the original failure on the old build either.** The report may be missing a condition; ask the reporter or check logs before retesting the fix.
- **The fix passes in test but the reporter still sees it.** Compare environments, caches, feature flags and data; the fix may not be released to their environment yet.
- **A defect has been reopened many times.** Suggest a [root cause analysis](/learn/manual-testing/root-cause-analysis) instead of another symptom fix.

## Key takeaways summary

Confirmation testing is narrow but must be precise: verify the build, reproduce the original conditions, try a few close variations, and record the result with evidence. Then follow with regression testing, because a fix that works can still break something else.
