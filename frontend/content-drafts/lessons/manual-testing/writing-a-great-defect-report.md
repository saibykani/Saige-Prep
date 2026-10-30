---
slug: writing-a-great-defect-report
title: Writing a Great Defect Report
summary: A great defect report lets a developer reproduce, understand and fix the problem without asking you a single question. Learn the fields, the writing rules and study two complete, realistic reports.
level: beginner
duration: 35
tags: [defect-management, bug-tracking, communication, istqb]
objectives:
  - List the fields of a complete defect report as described by ISTQB
  - Write a specific, searchable defect title
  - Write minimal, reproducible steps with exact expected and actual results
  - Attach the right evidence (screenshots, video, logs, network traces) for the defect type
prerequisites:
  - Defect lifecycle
  - Severity versus priority
related: [defect-lifecycle, severity-vs-priority, defect-triage, error-defect-bug-failure, test-scenarios-and-test-cases]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.5, Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Chrome DevTools documentation (capturing console and network evidence)
    url: https://developer.chrome.com/docs/devtools
  - title: Jira guides
    url: https://www.atlassian.com/software/jira/guides
interview:
  - q: What makes a defect report good?
    a: A developer can reproduce it on the first attempt and understand the impact without contacting me. That means a specific title, the exact build and environment, minimal numbered steps with test data, a precise expected result tied to a requirement, the actual result described factually, evidence such as screenshots, video, logs or network traces, and a severity based on impact. It reports one problem, is neutral in tone and is checked for duplicates before submission.
  - q: What do you do if you cannot reproduce a defect consistently?
    a: I still report it if it is significant, but I say it is intermittent and give the observed frequency, for example 3 out of 10 attempts. I capture as much context as possible — timestamps, logs, network traces, device state, account used — and note the variables I have already ruled out. That gives the developer a place to start and lets others add observations.
  - q: How would you write the title of a defect?
    a: As a short summary of what fails, where and under which condition — for example "Checkout: order total excludes shipping when a 100% discount coupon is applied". It should be searchable for duplicate checks, avoid vague words like "not working", and not contain the whole description.
practice:
  - "Find a minor defect in any public website you use legitimately (for example a layout issue on a narrow screen). Write a complete report for it in the format of this lesson, without submitting it anywhere."
  - "Rewrite this title: 'Login broken!!!' so that it is specific and searchable."
  - "Take a 15-step report and reduce it to the minimal steps that still reproduce the failure."
takeaways:
  - The goal is first-time reproduction without follow-up questions.
  - Title = what fails + where + under which condition.
  - Include build, environment, data, minimal steps, expected (with source) and actual.
  - Evidence must match the defect type; include logs and network traces for back-end symptoms.
  - One defect per report, neutral tone, duplicate check first.
quiz:
  - id: defect-rpt-q1
    type: single
    topic: writing-a-great-defect-report
    difficulty: beginner
    prompt: Which defect title is best?
    options:
      - "Search not working"
      - "URGENT!!! Big problem in search, please fix ASAP"
      - "Product search returns no results when the query contains a trailing space"
      - "Search issue found during regression testing on Tuesday afternoon"
    answer: [2]
    explanation: "The third title states what fails, where, and the triggering condition, so it is specific and searchable. The others are vague, emotional or describe when the tester worked rather than the problem."
  - id: defect-rpt-q2
    type: multiple
    topic: writing-a-great-defect-report
    difficulty: intermediate
    prompt: Which items should a complete defect report contain? Select all that apply.
    options:
      - "Build or version tested"
      - "Expected result and its source (requirement or acceptance criterion)"
      - "The tester's opinion of the developer's skill"
      - "Steps to reproduce with test data"
      - "Evidence such as screenshots, logs or video"
    answer: [0, 1, 3, 4]
    explanation: "Build, expected result with source, steps with data and evidence are needed to reproduce and judge the defect. Personal comments about developers are unprofessional and get in the way of fixing the problem."
  - id: defect-rpt-q3
    type: debugging
    topic: writing-a-great-defect-report
    difficulty: intermediate
    prompt: What is the biggest problem with this defect report?
    code: |
      Title: Payment fails
      Steps: Tried to pay, it failed.
      Expected: It should work.
      Actual: It didn't work.
    codeLanguage: text
    options:
      - "It has no severity"
      - "It cannot be reproduced or judged — no environment, data, concrete steps, specific results or evidence"
      - "The title is too short"
      - "It should have been an email instead"
    answer: [1]
    explanation: "A developer cannot reproduce or diagnose anything from this. Missing severity and a short title are real but secondary problems; the core issue is the absence of reproducible, specific information."
---

## Beginner-friendly explanation

Imagine calling a mechanic and saying "my car makes a weird noise". The mechanic has to ask: which car, when, what noise, at what speed, since when? Now imagine saying: "2019 hatchback, grinding noise from the front left wheel when braking above 50 km/h, started after the tyre change last week, here is a recording." The mechanic can almost start the repair before you arrive.

A **defect report** is that second phone call, written down. The better it is, the faster the fix, and the less time everyone spends asking questions.

## Technical explanation

ISTQB Foundation Level v4.0 lists typical defect report content:

- Unique identifier
- Title with a short summary of the anomaly
- Date, author and organisation
- Identification of the test object and test environment
- Context: test case, test activity, SDLC phase, technique or test data used
- Description to enable reproduction and resolution: steps, logs, screenshots, recordings
- Expected and actual results
- Severity (impact on stakeholders or requirements)
- Priority (urgency to fix)
- Status
- References, for example to the test case

### Writing rules

| Rule | Why |
|---|---|
| **One defect per report** | Each has its own lifecycle, fix and verification |
| **Title = what + where + condition** | Searchable; readable in a list |
| **Minimal steps** | Remove anything not needed to trigger the failure |
| **Exact test data** | "a long name" is not reproducible; "a 256-character name" is |
| **Expected result with its source** | Shows it is a defect, not a preference |
| **Factual actual result** | Exact message, value, status code; no guessing at causes |
| **Evidence matched to the symptom** | UI: screenshot or video. Back end: logs, request and response, status codes |
| **Neutral tone** | The report describes the product, not a person |

## Real-world example

### Report 1: a functional defect in checkout

```text
ID:          DEF-1427
Title:       Checkout: order total excludes shipping when a 100% discount coupon is applied
Reporter:    QA (checkout squad)          Date: 2026-03-11
Build:       web 4.2.0-rc.3 / checkout-service 4.2.0 (build 518)
Environment: QA2 · Chrome 128 on Windows 11 · also reproduced on Firefox 129
Test case:   TC-CHK-044 (coupon + shipping)
Requirement: REQ-CHK-12 "Discount coupons apply to item subtotal only; shipping is always charged"

Preconditions
  - Logged in as qa_checkout_07 (standard customer, UK address)
  - Coupon FULLITEMS100 active (100% off items)

Steps to reproduce
  1. Add product SKU 30021 (price £24.00) to the cart.
  2. Go to checkout and choose "Standard delivery (£3.95)".
  3. Enter coupon FULLITEMS100 and click Apply.
  4. Observe the order summary.

Expected result
  Items £24.00, Discount −£24.00, Shipping £3.95, Total £3.95 (per REQ-CHK-12)

Actual result
  Items £24.00, Discount −£24.00, Shipping £3.95, Total £0.00
  "Place order" completes; order confirmation and payment request both show £0.00.

Reproducibility: 5/5 attempts. Does NOT occur with a 50% coupon (total correct).
Evidence:   checkout-summary.png, order-confirmation.png,
            HAR file of POST /api/orders (response body shows "total": 0.00)
Severity:   High (revenue loss; shipping never charged for any 100% coupon order)
Priority:   (proposed) P1 — coupon campaign starts 15 March
```

### Report 2: an intermittent mobile defect

```text
ID:          DEF-1433
Title:       Android app: transfer screen freezes after biometric prompt is cancelled and retried
Build:       Android app 7.8.0 (build 2210), API: payments-gateway 3.1.4
Environment: Staging · Pixel 7, Android 14 · also seen on a Galaxy A54, Android 14
             Fingerprint enrolled; network: Wi-Fi
Test charter: EXP-27 "Biometric confirmation interruptions"

Preconditions
  - Logged in as stg_user_221 with saved payee "Test Payee B"
  - Biometric confirmation enabled for transfers

Steps to reproduce
  1. Start a transfer of 10.00 to "Test Payee B" and tap Confirm.
  2. When the fingerprint prompt appears, tap Cancel.
  3. Tap Confirm again immediately (within about 1 second).
  4. Authenticate with the fingerprint.

Expected result
  Second prompt accepts the fingerprint and the transfer success screen appears
  (acceptance criterion AC-4 of story PAY-310).

Actual result
  The prompt closes, the screen shows a spinner indefinitely, buttons do not respond.
  Force-closing the app and reopening shows NO transfer in history and no debit.
Reproducibility: 4 of 10 attempts when step 3 is within ~1 s; 0 of 10 when waiting 3 s.
Evidence:   screen recording (transfer-freeze.mp4), logcat extract around 14:32:05 UTC
            showing "IllegalStateException: Callback already invoked" (attached)
Severity:   High (core flow blocked; user unsure whether money was sent)
Priority:   (proposed) P2 — workaround: wait before retrying; release in 2 weeks
Notes:      Not reproduced on iOS 17 build 7.8.0 (10 attempts).
```

Both reports state the build, the account, the exact data, the requirement, the frequency and what was ruled out. The second one also handles the hard case, an intermittent defect, by giving numbers instead of "sometimes".

## Step-by-step walkthrough

1. **Reproduce it** at least once more, and note the frequency if it is intermittent.
2. **Search for duplicates** using key words from your title.
3. **Isolate**: remove steps and data until you have the minimum that still fails; try one variation (another browser, another account) to find the scope.
4. **Capture evidence** at the moment of failure: screenshot or video, console log, network request and response, server log time stamp.
5. **Write the title**: what + where + condition.
6. **Fill in the fields**, with expected result linked to its source.
7. **Rate severity** honestly; propose priority only if your process allows.
8. **Re-read it as the developer.** Could you fix it from this alone?

## Common mistakes

- **Vague titles** like "Page broken" or "Error on submit".
- **Missing build or environment**, so the developer tests the wrong version.
- **Several problems in one report**, which cannot be closed until all are fixed.
- **Guessing the cause** in the actual result ("database is down") instead of stating what you saw.
- **Screenshots without context**: crop to show the problem, but keep the URL or screen name visible.
- **Emotional or blaming language**.
- **Including real customer personal data** in evidence; use test accounts or redact.

## Troubleshooting

- **Developer replies "works on my machine".** Compare build, environment, data and browser versions; offer a short screen share.
- **The failure disappeared.** Note what changed (new build, data reset); keep the evidence and the timestamp for log searches.
- **The report is huge.** Move extra observations to a comment and keep the main steps minimal.

## Key takeaways summary

Write every defect report so that a developer can reproduce it on the first attempt and understand why it matters. A precise title, exact build and data, minimal steps, an expected result with its source, factual actual results and matching evidence turn a defect into a fix quickly.
