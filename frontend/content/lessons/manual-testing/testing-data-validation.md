---
slug: testing-data-validation
title: Testing Data Validation
summary: Every form field and API input has rules for type, format, length, range and required-ness. Learn to derive validation tests from those rules, check error messages, and confirm the server validates as well as the browser.
level: beginner
duration: 30
tags: [real-world, validation, forms, test-design]
objectives:
  - List the kinds of validation rules a field can have
  - Derive positive, negative and boundary tests for each rule
  - Evaluate the quality of validation error messages
  - Verify server-side validation independently of the user interface
prerequisites:
  - Equivalence partitioning
  - Boundary value analysis
related: [equivalence-partitioning, boundary-value-analysis, positive-and-negative-testing, test-data-design, api-negative-and-boundary-testing]
references:
  - title: OWASP Input Validation Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - title: MDN Web Docs — Client-side form validation
    url: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
  - title: W3C WCAG overview (error identification and suggestions)
    url: https://www.w3.org/WAI/standards-guidelines/wcag/
interview:
  - q: How do you test a single form field, such as a mobile number?
    a: I list its rules - required or optional, allowed characters, length, format, country code handling, uniqueness - and partition each into valid and invalid classes. I test boundaries on length, invalid characters, leading and trailing spaces, empty input, pasted values, and international formats if supported. For every invalid case I check the error message is specific, shown next to the field and accessible, and that the server rejects the value even if I bypass the browser.
  - q: Why test server-side validation when the UI already validates?
    a: Client-side validation is for user experience and can be bypassed by disabling JavaScript, editing the request in DevTools, or calling the API directly. Data also arrives through imports, integrations and mobile apps. Only server-side validation protects data integrity and security.
  - q: What makes a good validation error message?
    a: It says which field is wrong, what the rule is and how to fix it - "Postcode must be 6 digits" rather than "Invalid input". It appears next to the field, is announced to screen readers, keeps the user's other input, and does not leak internal details like stack traces or SQL errors.
practice:
  - "Write the full validation test set for a 'date of birth' field where users must be 18 or older."
  - "Take a sign-up form on a demo app and list every validation rule you can infer, then compare with its documentation."
  - "Find three error messages in apps you use and rewrite them to be specific and helpful."
takeaways:
  - Each field has several rule types - required, type, format, length, range, uniqueness and cross-field rules.
  - Use equivalence partitioning and BVA per rule, changing one thing at a time.
  - Test cross-field rules (end date after start date) with decision tables.
  - Error messages must be specific, near the field, accessible and safe.
  - Always confirm server-side validation by bypassing the browser.
quiz:
  - id: mtval-q1
    type: single
    topic: testing-data-validation
    difficulty: beginner
    prompt: Which error message is best for an invalid postcode?
    options: ["Error 422", "Invalid input", "Postcode must be 6 digits, for example 560001", "Something went wrong, please try again"]
    answer: [2]
    explanation: A good message names the field, states the rule and shows how to fix it. Codes and generic messages leave users guessing.
  - id: mtval-q2
    type: multiple
    topic: testing-data-validation
    difficulty: intermediate
    prompt: A "Name" field allows 2 to 50 characters. Which are useful tests? Select all that apply.
    options: ["1 character", "2 characters", "50 characters", "51 characters", "Only spaces", "A name with an apostrophe, like O'Brien"]
    answer: [0, 1, 2, 3, 4, 5]
    explanation: Lengths 1, 2, 50 and 51 are boundaries. All-spaces checks trimming and required-ness. Apostrophes are valid real names that poorly written validation or queries often reject or break on.
  - id: mtval-q3
    type: truefalse
    topic: testing-data-validation
    difficulty: beginner
    prompt: If the browser blocks an invalid email, there is no need to test the same email through the API.
    options: ["True", "False"]
    answer: [1]
    explanation: Browser checks are easily bypassed, and APIs, imports and mobile apps send data directly. The server must validate too.
  - id: mtval-q4
    type: scenario
    topic: testing-data-validation
    difficulty: intermediate
    prompt: A booking form accepts a check-out date earlier than the check-in date. Which kind of rule is missing?
    options: ["Required-field rule", "Format rule", "Cross-field (dependency) rule", "Length rule"]
    answer: [2]
    explanation: Each date may be valid on its own; the defect is in the relationship between two fields. Cross-field rules need their own tests, often designed with a decision table.
---

## Beginner-friendly explanation

Think of a bank teller accepting a cheque. They check the date is valid, the amount in words matches the amount in numbers, the signature is present, and the account number has the right number of digits. If something is wrong, a good teller tells you exactly what to fix: "You haven't signed it" — not just "Rejected".

**Data validation** is software doing the teller's job: checking every value a user (or another system) sends before accepting it. Testing validation means trying both good and bad values, and checking the system accepts the good ones, rejects the bad ones, and explains clearly why.

## Technical explanation

A field usually has several kinds of rules:

| Rule type | Example |
|---|---|
| Required | Email is mandatory |
| Data type | Quantity must be a whole number |
| Format | Email pattern; IFSC code is 11 characters, 4 letters + 0 + 6 alphanumerics |
| Length | Username 3 to 20 characters |
| Range | Age 18 to 100; amount greater than 0 |
| Allowed values | Country from a list |
| Uniqueness | Email not already registered |
| Cross-field | End date on or after start date; confirm password matches |
| Normalisation | Leading/trailing spaces trimmed; email compared case-insensitively |

Validation happens in layers. **Client-side** (HTML attributes such as `required`, `maxlength`, `pattern`, and JavaScript) gives quick feedback. **Server-side** validation is the real gate; the OWASP Input Validation Cheat Sheet recommends allow-list validation on the server for all input. The **database** may add constraints (NOT NULL, unique keys, column length) as a last line of defence — if a database error reaches the user, server validation is missing.

For each rule, use [equivalence partitioning](/learn/manual-testing/equivalence-partitioning) for classes and [boundary value analysis](/learn/manual-testing/boundary-value-analysis) for ordered limits. For cross-field rules, use a [decision table](/learn/manual-testing/decision-table-testing).

```mermaid
flowchart LR
  U[User input] --> C{Client checks}
  C -- fail --> M1[Inline message]
  C -- pass --> S{Server validation}
  S -- fail --> M2[400/422 + field errors shown]
  S -- pass --> D[(Database constraints)]
  D --> OK[Saved]
```

## Real-world example

A travel site's passenger form accepted names up to 100 characters. The airline's booking system it sends data to accepted 50. Short names passed every test. A passenger with a long full name booked successfully on the website, but the ticket was never issued because the downstream system rejected it — and the website showed "Booking confirmed".

Tests at the field's length boundary, plus asking "what limit does the next system have?", would have caught the mismatch.

## Step-by-step walkthrough

1. **List every field** and write down its rules. Where requirements are silent, ask — and record the answer.
2. **Partition each rule** into valid and invalid classes.
3. **Add boundaries** for length and range.
4. **Add special inputs:** empty, only spaces, leading/trailing spaces, Unicode and accents, emoji, apostrophes and hyphens in names, very long pasted text, copy-pasted values with hidden line breaks.
5. **Cross-field rules** via a decision table.
6. **Check messages:** specific, next to the field, keep other input, accessible (focus moves to or announces the error).
7. **Bypass the UI:** send invalid values through the API or by editing the request, confirm a 400 or 422 with field-level errors and nothing saved.
8. **Check stored data:** what was saved is exactly what was entered (or normalised as specified).

### Worked example: username, 3 to 20 characters, letters, digits and underscore

| ID | Input | Expected |
|---|---|---|
| VAL-01 | `ab` (2) | "Username must be 3 to 20 characters" |
| VAL-02 | `abc` (3) | Accepted |
| VAL-03 | `a` × 20 | Accepted |
| VAL-04 | `a` × 21 | Rejected, length message |
| VAL-05 | `john doe` | "Only letters, digits and underscore" |
| VAL-06 | `  john_1  ` | Trimmed to `john_1` or rejected, per spec |
| VAL-07 | empty | "Username is required" |
| VAL-08 | existing `john_1` | "Username already taken" |
| VAL-09 | `JOHN_1` when `john_1` exists | Per spec: case-insensitive uniqueness? |
| VAL-10 | `ab` via API | 400/422, not saved |

## Common mistakes

- **Only testing one invalid value per field.** Each rule needs its own negative test.
- **Changing several things at once**, so you cannot tell which rule triggered.
- **Rejecting real names** — apostrophes, hyphens, accents and single-word names are valid in many places.
- **Ignoring trimming and case**, which create duplicate accounts.
- **Accepting generic messages** like "Invalid data" as passing.
- **Not testing the server** directly.

## Key takeaways summary

Turn each field into a list of rules, then test every rule with valid, invalid and boundary values, one change at a time. Judge error messages as part of the test, and always confirm the server enforces the same rules as the browser.
