---
slug: positive-and-negative-testing
title: Positive and Negative Testing
summary: Positive tests confirm the system does what it should with valid input; negative tests confirm it safely refuses what it should not. Learn to design both, balance them and write precise expected results.
level: beginner
duration: 25
tags: [test-design, black-box, validation]
objectives:
  - Distinguish positive tests from negative tests and explain the purpose of each
  - Derive positive and negative tests from equivalence partitions and boundaries
  - Write precise expected results for negative tests, including state checks
  - Decide an appropriate balance of positive and negative tests based on risk
prerequisites:
  - Equivalence partitioning
  - Boundary value analysis
related: [equivalence-partitioning, boundary-value-analysis, error-guessing, testing-data-validation]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: OWASP Input Validation Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - title: MDN HTTP response status codes
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
interview:
  - q: What is the difference between positive and negative testing?
    a: Positive testing uses valid inputs and expected user behaviour to confirm the system does what it is supposed to do. Negative testing uses invalid inputs, unexpected actions or abnormal conditions to confirm the system handles them gracefully by rejecting them with a clear message, keeping data consistent and not crashing or exposing information. Both are needed, and in terms of EP they map to valid and invalid partitions.
  - q: What makes a good negative test?
    a: It changes exactly one thing to be invalid while keeping everything else valid, so the cause of any failure is clear. Its expected result is specific, covering the exact error message or status code, no change to stored data, and no stack trace or sensitive detail in the response. "The system shows an error" is not specific enough.
  - q: Should you write more negative tests than positive tests?
    a: There is no fixed ratio. It depends on risk. Inputs from untrusted sources, money, security and data integrity justify many negative tests, while a read-only internal report may need few. Typically each valid partition needs a positive test and each invalid partition needs its own negative test, so input-heavy features naturally end up with more negative tests.
  - q: A negative test passes because the UI disables the submit button. Is that enough?
    a: No. The UI check is one layer, but the same request can reach the server through the API, a script or a modified browser request. I would confirm the UI behaviour and then send the invalid value directly to the API to make sure server-side validation rejects it too.
practice:
  - "For a 'change password' form (current password, new password 12 to 64 characters, confirm password), write five positive and eight negative tests with precise expected results."
  - "Take an API endpoint you know and list negative tests for missing fields, wrong types, extra fields and unauthorised access, with the expected status code for each."
  - "Review an existing test suite and calculate its positive-to-negative ratio. Which risky inputs have no negative test?"
takeaways:
  - Positive tests confirm correct behaviour with valid input; negative tests confirm safe handling of invalid input and abnormal conditions.
  - Valid partitions give positive tests; each invalid partition gives its own negative test.
  - Negative expected results must be specific, covering the message, status code and unchanged data.
  - Test negative cases at the API too, not only in the UI.
  - Balance by risk, not by a fixed ratio.
quiz:
  - id: posneg-q1
    type: single
    topic: positive-and-negative-testing
    difficulty: beginner
    prompt: Which of these is a negative test for a registration form that requires an email address?
    options: ["Register with a valid email and strong password", "Register with an email missing the @ symbol", "Log in after registering successfully", "Register with the shortest valid password"]
    answer: [1]
    explanation: An email without @ belongs to an invalid partition, so the test checks the system rejects it. The shortest valid password is a boundary test, but it is still positive because the value is valid.
  - id: posneg-q2
    type: scenario
    topic: positive-and-negative-testing
    difficulty: intermediate
    prompt: A negative API test sends quantity = -1 and receives HTTP 500 with a stack trace. The order is not created. Did the test pass?
    options: ["Yes, the order was not created", "No, the system should return a 4xx client error with a safe message and no internal details", "Yes, any error status means the input was rejected", "It cannot be judged without a UI test"]
    answer: [1]
    explanation: Rejecting the order is only part of graceful handling. A 500 means an unhandled exception, and a stack trace leaks internals. The expected result is a client error such as 400 or 422 with a clear, safe message.
  - id: posneg-q3
    type: truefalse
    topic: positive-and-negative-testing
    difficulty: beginner
    prompt: A good negative test changes several inputs to invalid values at once to save time.
    options: ["True", "False"]
    answer: [1]
    explanation: Changing several inputs at once causes fault masking, where the first error hides the others. Each negative test should make exactly one input invalid.
  - id: posneg-q4
    type: multiple
    topic: positive-and-negative-testing
    difficulty: intermediate
    prompt: Which checks belong in the expected result of a negative test for an invalid transfer amount? Select all that apply.
    options: ["A specific, user-friendly error message", "The account balance is unchanged", "No internal details such as stack traces are shown", "The transfer is processed with a corrected amount"]
    answer: [0, 1, 2]
    explanation: Graceful rejection means a clear message, unchanged data and no leaked internals. Silently "correcting" the amount and processing it would itself be a defect unless the requirement specifies it.
---

## Beginner-friendly explanation

Think of a door with a keypad. A **positive test** is typing the right code and checking the door opens. A **negative test** is typing a wrong code, typing nothing, or mashing ten buttons, and checking the door stays shut, the keypad shows a sensible message, and it does not jam or spring open.

Most people only check that the right code works. Testers also check that **everything else fails safely**, because real users mistype, systems send bad data and attackers deliberately try the wrong things.

## Technical explanation

- **Positive testing** (sometimes called happy-path or valid testing) exercises the system with **valid inputs and expected conditions** to confirm it produces the specified results.
- **Negative testing** (invalid or error-path testing) exercises it with **invalid inputs, unexpected actions or abnormal conditions** to confirm it handles them gracefully.

"Positive" and "negative" describe test intent rather than a separate ISTQB technique. They map directly onto [equivalence partitioning](/learn/manual-testing/equivalence-partitioning): valid partitions give positive tests and invalid partitions give negative tests. [Boundary value analysis](/learn/manual-testing/boundary-value-analysis) contributes both, because the boundary values inside a valid partition are positive tests and their neighbours outside it are negative tests.

**Graceful handling** for a negative test usually means:

1. The invalid input or action is **rejected** or safely ignored.
2. A **clear, specific message** is shown, or an appropriate status code is returned (for APIs, typically 4xx).
3. **No data changes**, with no partial records or half-completed transactions.
4. **No internal details leak**: no stack traces, SQL errors or file paths.
5. The system **remains usable** afterwards.

Negative testing is not only about input values. It also covers wrong sequences (submit before uploading), missing permissions, expired sessions, interrupted networks and dependency failures.

### Worked example: a registration form

Rules: email (valid format, not already registered), password (12 to 64 characters), terms checkbox must be ticked.

| ID | Type | Data (one change at a time) | Expected result |
|---|---|---|---|
| PN-01 | Positive | Valid new email, 16-char password, terms ticked | Account created; welcome email sent |
| PN-02 | Positive | Password exactly 12 characters | Account created |
| PN-03 | Positive | Password exactly 64 characters | Account created |
| PN-04 | Positive | Email with plus addressing (user+test@example.com) | Account created |
| PN-05 | Negative | Email missing @ | "Enter a valid email address"; no account |
| PN-06 | Negative | Email already registered | Generic message per security policy; no duplicate account |
| PN-07 | Negative | Password 11 characters | "Password must be at least 12 characters"; no account |
| PN-08 | Negative | Password 65 characters | "Password must be at most 64 characters"; no account |
| PN-09 | Negative | Terms not ticked | "Accept the terms to continue"; no account |
| PN-10 | Negative | All fields empty | Required-field messages on each field; no account |
| PN-11 | Negative | Submit twice quickly | Exactly one account created |
| PN-12 | Negative | API request with an extra field "role":"admin" | Request rejected or field ignored; account has default role |

PN-10 is a deliberate exception to "one invalid input at a time". It checks the specific behaviour of an empty form, not each field's validation, which PN-05 to PN-09 cover individually.

## Real-world example

A team building a loyalty-points API had thorough positive tests for earning and redeeming points. A tester added a negative test that redeemed **more points than the balance**, sent straight to the API. The UI had always prevented it, but the API accepted it and produced a negative balance, which could be exploited by anyone calling the endpoint directly. One negative test at the right layer exposed a defect that no amount of positive testing would reveal.

## Step-by-step walkthrough

1. **Partition each input** into valid and invalid classes.
2. **Write positive tests** for each valid partition and the valid boundaries.
3. **Write negative tests**, one invalid partition per test, keeping all other inputs valid.
4. **Add non-input negatives**: wrong order of steps, missing permissions, expired sessions, dependency failures, duplicate submissions.
5. **Define precise expected results** for each negative test: message or status, unchanged data and no leaked internals.
6. **Choose the layer.** Run negatives at the API as well as the UI wherever client-side validation exists.
7. **Prioritise by risk**: money, security and data integrity first.

## Code examples

A REST Assured style test pair for an API, with one positive and one negative check:

```java
public class RegistrationApiTest {

    @Test
    public void validRegistrationIsCreated() {
        given().contentType("application/json")
            .body(Map.of("email", "new.user@example.com",
                         "password", "CorrectHorse12", "acceptTerms", true))
        .when().post("/api/registrations")
        .then().statusCode(201);
    }

    @Test
    public void shortPasswordIsRejectedWithoutCreatingAccount() {
        given().contentType("application/json")
            .body(Map.of("email", "short.pw@example.com",
                         "password", "Short1", "acceptTerms", true))
        .when().post("/api/registrations")
        .then().statusCode(422)
            .body("errors[0].field", equalTo("password"))
            .body(not(containsString("Exception")));

        assertFalse(UserRepository.exists("short.pw@example.com"));
    }
}
```

## Expected output

Against a correct API both tests pass. If the server lacked length validation, the negative test would fail with `Expected status code <422> but was <201>`, and the repository check would also show the account was created.

## Common mistakes

- **Only testing the happy path.** The system "works" until the first real user mistypes.
- **Vague negative expected results** like "error shown". Specify which error, and that nothing changed.
- **Several invalid inputs in one test**, which hides defects through fault masking.
- **Trusting client-side validation.** Always confirm the server rejects the same input.
- **Ignoring non-input negatives** such as permissions, sequence, timeouts and duplicates.
- **Accepting 500 errors as "rejected".** A server error on bad input is itself a defect.

## Troubleshooting

- **The requirement does not say what error to show.** Ask, and record the assumption. Error behaviour is part of the specification.
- **You cannot produce an abnormal condition**, such as a dependency outage. Request a stub or fault-injection setting in the test environment.
- **The negative list is huge.** Use EP to group invalid values and [error guessing](/learn/manual-testing/error-guessing) to pick the ones most likely to break.

## Key takeaways summary

Positive tests prove the system works; negative tests prove it fails safely. Derive both from partitions and boundaries, keep negative tests to one invalid change at a time, write specific expected results that include unchanged data, and test at the API as well as the UI.
