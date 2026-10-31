---
slug: writing-a-great-defect-report
title: Writing a Great Defect Report
summary: A defect report is only useful if a developer can reproduce, understand and prioritise it without asking you a single question. Learn the fields, the wording and the evidence that make that happen.
level: beginner
duration: 30
tags: [defect-management, bug-report, documentation]
objectives:
  - List the fields of a complete defect report and explain why each one exists
  - Write a clear, specific title and reproducible steps
  - Separate expected result, actual result and evidence
  - Avoid the wording and habits that get defects rejected or bounced back
prerequisites:
  - Error, defect, bug and failure
  - Severity versus priority
related: [defect-lifecycle, severity-vs-priority, defect-triage, root-cause-analysis, error-defect-bug-failure]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.5, Defect Management)
    url: https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Atlassian Jira guides (issue types and fields)
    url: https://www.atlassian.com/software/jira/guides
interview:
  - q: What makes a defect report good?
    a: A developer can reproduce it on the first attempt without contacting me. That means a specific title, the exact environment and build, numbered minimal steps with the test data used, a clear expected result tied to a requirement, the actual result described factually, and evidence such as a screenshot, video, console log or request ID. It also states severity, my suggested priority, and how often it reproduces.
  - q: How do you handle a defect you cannot reproduce consistently?
    a: I still log it if the impact is real, but I say so honestly, for example "reproduced 3 of 10 attempts". I capture everything around the failures — timestamps, logs, network traces, the user and data involved — and note what I tried that did not reproduce it. Intermittent defects are often timing, data or environment related, so those details give the developer a starting point.
  - q: What is the difference between the actual result and your opinion of the cause?
    a: The actual result is an observable fact, like "the order total shows ₹0.00 and no error appears". The suspected cause is a hypothesis, like "the discount is probably applied twice". I keep them separate, and label the hypothesis as a note, so the report stays accurate even if my guess is wrong.
  - q: A developer rejected your defect as "works on my machine". What do you do?
    a: I compare environments first — build number, browser, configuration, feature flags, user role and test data. I then reproduce it again, record a video and attach logs or the request/response, and ask to pair for five minutes on my setup. The goal is to find the difference, not to win an argument.
practice:
  - "Rewrite this title so it is specific and searchable: 'Checkout broken'."
  - "You find that uploading a 0-byte PDF shows a spinner forever. Write a full defect report with all fields."
  - "Take a real bug from any open-source project's issue tracker and list which fields are missing from it."
takeaways:
  - The test of a defect report is whether someone else can reproduce it without asking you anything.
  - Titles follow the pattern what is wrong + where + under what condition.
  - Steps are numbered, minimal and include the exact test data.
  - Expected result comes from a requirement; actual result is an observed fact.
  - Evidence (screenshot, video, logs, request IDs) turns a claim into proof.
quiz:
  - id: mtdr-q1
    type: single
    topic: writing-a-great-defect-report
    difficulty: beginner
    prompt: Which is the best defect title?
    options: ["Login not working", "URGENT!!! Users cannot log in", "Login fails with 'Invalid credentials' for valid emails that contain a plus sign (+)", "Bug in authentication module, please fix"]
    answer: [2]
    explanation: A good title says what is wrong, where and under which condition, so it can be understood and searched for. The others are vague, emotional or describe nothing specific.
  - id: mtdr-q2
    type: multiple
    topic: writing-a-great-defect-report
    difficulty: beginner
    prompt: Which items belong in a defect report? Select all that apply.
    options: ["Build or version number", "Steps to reproduce with the test data used", "The developer you think wrote the bug", "Expected and actual result", "Screenshot, video or logs"]
    answer: [0, 1, 3, 4]
    explanation: Build, steps, expected/actual and evidence let someone reproduce and understand the issue. Naming a suspected developer adds blame, not information, and assignment is done during triage.
  - id: mtdr-q3
    type: truefalse
    topic: writing-a-great-defect-report
    difficulty: beginner
    prompt: If a defect only reproduces sometimes, you should not log it until you can reproduce it every time.
    options: ["True", "False"]
    answer: [1]
    explanation: Intermittent defects are real and often serious (race conditions, timeouts). Log them with the reproduction rate and all the context you captured, rather than hiding them.
  - id: mtdr-q4
    type: scenario
    topic: writing-a-great-defect-report
    difficulty: intermediate
    prompt: "Your actual result says: 'The discount is calculated twice in the backend.' What is wrong with it?"
    options: ["Nothing, it is precise", "It states a guess about the cause instead of what was observed", "It is too short", "It should be in the title only"]
    answer: [1]
    explanation: The actual result must be an observation, such as "the total shows ₹800 instead of ₹900". A suspected cause can go in a separate note, clearly labelled, because it might be wrong.
---

## Beginner-friendly explanation

Imagine you call a plumber and say, "Something's wrong with the water." The plumber has to come over, ask twenty questions and hunt around before starting. Now imagine you say, "The hot tap in the upstairs bathroom drips about once a second, and it started after the boiler was serviced on Monday. Here's a video." The plumber knows exactly what to bring.

A **defect report** (also called a bug report) is that second phone call. You are describing a problem to someone who was not there when you saw it. If they can see what you saw, quickly, they will fix it. If they cannot, the report bounces back to you as "cannot reproduce" or "need more information", and everyone loses time.

## Technical explanation

ISTQB describes a defect report as having three purposes: give the people responsible enough information to resolve the issue, provide a way to track the quality of the work product, and give ideas for improving the development and test process. A typical report contains these fields (names vary by tool, such as Jira or Azure DevOps):

| Field | What to write | Why it matters |
|---|---|---|
| ID | Generated by the tool | Unique reference for discussion and traceability |
| Title / summary | What is wrong + where + condition | Triage happens from the title; it must be searchable |
| Environment | Build/version, OS, browser and version, device, test environment URL, user role | Many defects depend on environment |
| Preconditions | State needed before step 1 (logged in as X, cart has 2 items) | Removes hidden setup |
| Steps to reproduce | Numbered, minimal, with exact test data | The core of reproducibility |
| Expected result | What should happen, linked to the requirement or acceptance criterion | Shows why this is a defect |
| Actual result | What did happen, stated as fact | The observable failure |
| Evidence | Screenshot, screen recording, console log, HAR file, server request ID | Turns a claim into proof |
| Severity | Impact on the system (see [severity versus priority](/learn/manual-testing/severity-vs-priority)) | Drives triage |
| Priority | Suggested urgency (often set by the product owner) | Drives scheduling |
| Reproducibility | Always, or e.g. 3 of 10 attempts | Sets expectations for the developer |
| Links | Story, test case, related or duplicate defects | Traceability |

The report then moves through the [defect lifecycle](/learn/manual-testing/defect-lifecycle): New, Assigned/Open, Fixed, Retest, Closed or Reopened, with side states such as Rejected, Duplicate and Deferred.

### The title formula

**[What is wrong] + [where] + [under what condition].**

| Weak title | Strong title |
|---|---|
| Search broken | Search returns no results when the query has a trailing space |
| Payment issue | Card payment charged twice when "Pay" is double-clicked on slow network |
| Error on profile | Profile save shows HTTP 500 when the phone number has 15 digits |

## Real-world example

A food-delivery team receives this report: *"App crashed when ordering. Please fix ASAP."* The developer tries ordering and it works. The report is marked "Cannot reproduce".

The tester rewrites it:

- **Title:** Android app crashes when applying coupon to an order containing a combo item
- **Environment:** App 4.12.0 (build 812), Android 14, Pixel 7, staging, customer account `qa.cust07`
- **Preconditions:** Logged in; restaurant "Test Kitchen 3" open
- **Steps:** 1. Add "Family Combo" to cart. 2. Open cart. 3. Enter coupon `SAVE50`. 4. Tap Apply.
- **Expected:** Coupon applies, or a message explains it does not apply to combos (story FOOD-221).
- **Actual:** App closes immediately. Reproduces 5 of 5 times. Coupon on a non-combo item works.
- **Evidence:** Screen recording, Logcat excerpt with the stack trace.

The developer fixes it the same day. The difference was not effort — it was information.

## Step-by-step walkthrough

1. **Reproduce it again** before writing. Note whether it happens every time.
2. **Minimise the steps.** Remove anything not needed to trigger the failure.
3. **Isolate the condition.** Change one thing at a time (different data, browser, user) to find what matters.
4. **Check for duplicates** in the tracker by searching key words.
5. **Capture evidence** while it happens: screenshot with the URL visible, video, browser DevTools console and network tab, server request or correlation ID.
6. **Write the report** using the fields above. Use neutral, factual language.
7. **Set severity, suggest priority**, link the story and test case.
8. **Re-read it as a stranger.** Could someone who has never seen the feature reproduce it?

## Common mistakes

- **Vague titles** like "Not working" or "Issue in page".
- **Several defects in one report.** One report, one problem, so each can be fixed and retested independently.
- **Missing test data.** "Enter an invalid email" — which one? Write the exact value.
- **Opinions in the actual result**, or blaming language ("developer forgot again").
- **No expected result**, or one that is just "it should work".
- **Screenshots without context**, cropped so the URL, build or error is not visible.
- **Logging sensitive data** such as real customer details, passwords or full card numbers in the report or attachments.
- **Not retesting after the fix** in the same environment and data as the original.

## Troubleshooting

- **"Cannot reproduce."** Compare build, configuration, feature flags, role and data. Offer a short pairing session.
- **"Works as designed."** Point to the requirement. If the requirement is ambiguous, ask the product owner to decide, and change the issue to a clarification or improvement if needed.
- **The tester and developer disagree on severity.** Describe impact in user terms (how many users, what they lose) and let triage decide.

## Key takeaways summary

A great defect report is short, specific and complete: a searchable title, the environment, minimal steps with real test data, expected versus actual, evidence and honest reproducibility. Write it for a reader who was not there.
