---
slug: error-guessing
title: Error Guessing
summary: Use knowledge of typical developer mistakes and past failures to anticipate defects, and turn that knowledge into a structured fault-attack checklist instead of random poking.
level: intermediate
duration: 25
tags: [test-design, experience-based, istqb]
objectives:
  - Define error guessing and place it among experience-based techniques
  - Explain the three knowledge sources ISTQB lists for error guessing
  - Build and apply a fault-attack checklist to a feature
  - Combine error guessing with systematic techniques without replacing them
prerequisites:
  - Equivalence partitioning
  - Boundary value analysis
related: [exploratory-testing-charters, boundary-value-analysis, positive-and-negative-testing, test-data-design]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 4.4.1, Error Guessing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: OWASP Input Validation Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
interview:
  - q: What is error guessing?
    a: It is an experience-based technique where the tester anticipates errors, defects and failures based on knowledge of how the application behaved in the past, the kinds of mistakes developers commonly make, and failures seen in similar applications. Tests are designed specifically to expose those anticipated problems.
  - q: What is a fault attack?
    a: It is the methodical form of error guessing described by ISTQB. You create or acquire a list of possible errors, defects and failures, then design tests that target each item to expose the defect or cause the failure. The list can come from experience, defect and failure data, or general knowledge about why software fails, which makes error guessing repeatable and reviewable.
  - q: Isn't error guessing just ad hoc testing?
    a: No. Ad hoc testing has no plan. Error guessing deliberately targets known failure patterns, and done as a fault attack it uses a written checklist that the team maintains and improves from defect data. It complements systematic techniques such as EP and BVA rather than replacing them, because its coverage depends on the tester's knowledge.
  - q: How do you keep an error-guessing checklist useful?
    a: I feed it from real sources, namely escaped defects, root-cause analyses, production incidents and code review findings, and I prune items that never find anything. I organise it by category such as input, timing, state, files and integration, so a new tester can apply it consistently.
practice:
  - "Build a fault-attack checklist of at least 15 items for a file-upload feature and group the items by category."
  - "Pick three defects from your team's recent history. For each, write the checklist item that would have caught it."
  - "Apply the wallet top-up checklist in this lesson to a 'change email address' form and write the expected result for each attack."
takeaways:
  - Error guessing anticipates defects from experience, typical developer mistakes and failures in similar systems.
  - A fault attack is the structured version, a maintained list of likely failures turned into tests.
  - Feed the checklist from defect data, incidents and reviews; prune items that never find anything.
  - Error guessing complements, never replaces, EP, BVA, decision tables and state transition testing.
  - Expected results still matter, because a "graceful" error is a specific, verifiable behaviour.
quiz:
  - id: errg-q1
    type: multiple
    topic: error-guessing
    difficulty: intermediate
    prompt: According to ISTQB CTFL v4.0, which knowledge sources does error guessing draw on? Select all that apply.
    options: ["How the application has worked in the past", "The types of errors developers tend to make", "Failures that have occurred in similar applications", "The statement coverage of the unit tests"]
    answer: [0, 1, 2]
    explanation: ISTQB lists past behaviour of the application, typical developer errors and resulting defects, and failures in other similar applications. Statement coverage is a white-box measure, not a knowledge source for anticipating failures.
  - id: errg-q2
    type: single
    topic: error-guessing
    difficulty: beginner
    prompt: What best describes a fault attack?
    options: ["A security penetration test", "A methodical approach that designs tests from a list of possible errors, defects and failures", "Running random inputs until the system crashes", "A code review technique"]
    answer: [1]
    explanation: ISTQB describes fault attacks as the methodical implementation of error guessing, which starts from a list of possible errors, defects and failures. Random inputs are closer to fuzzing or monkey testing, and the term is not limited to security.
  - id: errg-q3
    type: scenario
    topic: error-guessing
    difficulty: intermediate
    prompt: A tester double-clicks the "Pay" button on a slow network and is charged twice. Which checklist category did this attack come from?
    options: ["Input format", "Timing and concurrency", "Localisation", "Accessibility"]
    answer: [1]
    explanation: The defect is caused by two requests arriving in quick succession, which is a timing and concurrency (idempotency) problem. The input value itself was valid.
  - id: errg-q4
    type: truefalse
    topic: error-guessing
    difficulty: beginner
    prompt: Because error guessing is experience-based, it can replace systematic techniques for experienced testers.
    options: ["True", "False"]
    answer: [1]
    explanation: Experience-based techniques find defects that systematic techniques can miss, but their coverage is hard to measure and depends on the individual. ISTQB positions them as complementary to black-box and white-box techniques.
---

## Beginner-friendly explanation

A good car mechanic does not inspect every bolt in the same order every time. When a car comes in with a strange noise, they think: "On this model, it's usually the brake pads or a loose heat shield." They check the usual suspects first because they have seen these problems before.

**Error guessing** is that instinct applied to software. Experienced testers know where software tends to break: empty fields, double clicks, the 29th of February, the back button after paying. They aim tests straight at those weak spots. The professional twist is to write the suspects down as a **checklist**, so the knowledge is shared and repeatable instead of living in one person's head.

## Technical explanation

ISTQB CTFL v4.0 places error guessing among **experience-based test techniques** (section 4.4.1). It is used to anticipate the occurrence of errors, defects and failures based on the tester's knowledge, including:

- How the application has worked in the past
- The types of errors developers are likely to make, and the defects that result from them
- The types of failures that have occurred in other, similar applications

Errors, defects and failures may relate to input (correct input not accepted, wrong parameters), output (wrong format or result), logic (missing cases, wrong operator), computation (incorrect operand or calculation), interfaces (parameter mismatch, incompatible types) and data (incorrect initialisation, wrong type).

A **fault attack** is the methodical approach. The tester creates or acquires a list of possible errors, defects and failures, then designs tests that expose each defect or cause each failure. The list can be built from experience, defect and failure data, or common knowledge about why software fails.

Error guessing finds defects that specification-based techniques miss, for example those from unstated assumptions. Its weakness is that coverage is hard to measure and depends on the tester, which is why it is used **alongside** systematic techniques.

### Worked example: a fault-attack checklist

Feature: *wallet top-up*. The user enters an amount (₹10 to ₹10,000), chooses a saved card, confirms and sees an updated balance.

| # | Category | Attack | Expected (graceful) result |
|---|---|---|---|
| FA-01 | Input | Leave the amount empty and submit | "Enter an amount"; no API call |
| FA-02 | Input | Spaces only | Treated as empty |
| FA-03 | Input | Leading zeros, "0100" | Interpreted as 100 or rejected, consistently |
| FA-04 | Input | Negative amount "-50" | Rejected; balance not reduced |
| FA-05 | Input | Three decimals, "100.005" | Rejected or rounded per rule; never a silent cent difference |
| FA-06 | Input | Locale separator "1.000,50" | Rejected or parsed correctly; never read as 1.0 |
| FA-07 | Input | Very long string of digits | Validation message; no server error |
| FA-08 | Input | Script or SQL characters | Rejected or stored safely; nothing executed |
| FA-09 | Timing | Double-click "Confirm" | Exactly one charge, one top-up |
| FA-10 | Timing | Back button after success, then resubmit | Duplicate submission prevented |
| FA-11 | Timing | Session expires on the confirm screen | Redirect to login; no partial top-up |
| FA-12 | State | Refresh during payment redirect | Final state consistent between wallet and payment provider |
| FA-13 | Concurrency | Top up in two tabs at once | Balance equals the sum of both top-ups |
| FA-14 | Integration | Payment provider times out | Clear pending or failed status; no balance change until confirmed |
| FA-15 | Data | Card expired since it was saved | Card rejected with an actionable message |
| FA-16 | Date/time | Top-up at midnight on month end | Statement shows it in the correct period |
| FA-17 | Calculation | Top-up that crosses the wallet's maximum balance | Rejected or capped per rule; no overflow |

Each row is a test idea with a defined expected result, not a vague "try weird stuff".

## Real-world example

A retail team kept a shared checklist in their wiki. After a production incident in which a coupon was applied twice when the user pressed Enter and clicked the button at the same time, the root-cause review added "submit by keyboard and mouse simultaneously" to the timing section. Two releases later the same attack, run by a newly joined tester on a different form, found the same class of defect in the gift-card flow before it shipped. The checklist turned one person's lesson into team knowledge.

## Step-by-step walkthrough

1. **Start from the systematic tests.** Apply EP, BVA and decision tables first so error guessing adds to them rather than repeating them.
2. **Gather knowledge sources**: defect history, incident reports, code review notes, similar products' known issues and your own experience.
3. **Pick checklist categories** that fit the feature: input, timing, state, concurrency, files, integration, date/time, calculation.
4. **Write specific attacks** with an expected graceful result for each.
5. **Prioritise** attacks by risk: money, data loss, security and irreversible actions first.
6. **Execute and record** results, including attacks that found nothing, because that is useful coverage information.
7. **Update the checklist** after each release with new failure patterns, and remove dead items.

## Code examples

Input attacks are easy to automate at the API level. The key assertion is "client error, never a server error":

```python
import pytest
import requests

BASE = "https://wallet.test.local/api"
ATTACKS = {
    "FA-01 empty": "",
    "FA-02 spaces": "   ",
    "FA-04 negative": "-50",
    "FA-05 three decimals": "100.005",
    "FA-06 locale separator": "1.000,50",
    "FA-07 very long": "9" * 500,
    "FA-08 sql characters": "100'; DROP TABLE topups; --",
}

@pytest.mark.parametrize("name, amount", ATTACKS.items(), ids=list(ATTACKS))
def test_topup_rejects_bad_amount(name, amount, auth_session):
    resp = auth_session.post(f"{BASE}/wallet/topups", json={"amount": amount})
    assert resp.status_code in (400, 422), f"{name}: got {resp.status_code}"
```

## Expected output

On a well-validated API, pytest reports `7 passed`. A failure such as `FA-07 very long: got 500` means an unhandled exception reached the user, which is a defect even though the bad input was eventually refused.

## Common mistakes

- **Doing error guessing only from memory.** Without a written list, results vary by tester and mood.
- **Using it instead of systematic techniques**, and then being unable to say what was covered.
- **No expected results.** "It didn't crash" is not a pass if it silently stored a wrong value.
- **Never updating the list** from escaped defects, which is the richest source of attacks.
- **Attacking production or third-party systems** without permission. Run attacks only in authorised test environments.

## Troubleshooting

- **The checklist is too long to run every time.** Tag items by risk and feature type, and run the high-risk subset on every change and the full list before major releases.
- **Developers dismiss findings as unrealistic.** Show the realistic path, such as a slow mobile network causing a double tap, and the impact.
- **You lack experience to guess from.** Borrow it from defect databases, incident reviews and the OWASP cheat sheets for input handling.

## Key takeaways summary

Error guessing turns experience into targeted tests. Make it a fault attack with a written, categorised and maintained checklist with expected results, run it after systematic techniques, and feed it with every defect that escapes. Pair it with [exploratory testing charters](/learn/manual-testing/exploratory-testing-charters) to go deeper where attacks find trouble.
