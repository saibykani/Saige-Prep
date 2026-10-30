---
slug: test-data-design
title: Test Data Design
summary: Tests are only as good as their data. Learn to design valid, invalid, boundary and special data classes, choose safe data sources, and keep data independent and repeatable.
level: intermediate
duration: 35
tags: [test-design, test-data, data-driven]
objectives:
  - Design test data in four classes, namely valid, invalid, boundary and special
  - Derive data values systematically from equivalence partitions and boundaries
  - Choose between synthetic, masked production and generated data, considering privacy
  - Keep test data independent, repeatable and maintainable, including in data-driven tests
prerequisites:
  - Equivalence partitioning
  - Boundary value analysis
related: [equivalence-partitioning, boundary-value-analysis, test-suites-and-test-data, data-driven-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: pytest documentation
    url: https://docs.pytest.org/
  - title: The Unicode Standard
    url: https://www.unicode.org/standard/standard.html
interview:
  - q: How do you design test data for a form?
    a: For each field I partition the domain and pick data in four classes. Valid data covers each valid partition, invalid data covers each invalid partition one at a time, boundary data covers the edges and their neighbours, and special data covers values that commonly break systems, such as apostrophes, non-Latin characters, emoji, leading or trailing spaces, empty versus missing, leap days and time zones. I record the purpose of each value so anyone can see why it exists.
  - q: Why not just copy production data into the test environment?
    a: Production data often contains personal and confidential information, and using it in less-protected environments can breach data protection law and company policy. It also rarely contains the edge cases you need, and it changes over time, so tests are not repeatable. I prefer synthetic data designed for the tests, and if production-like volume or variety is needed, properly masked or anonymised data approved by the data owner.
  - q: What makes test data independent?
    a: Each test creates or reserves the data it needs and does not rely on data left behind by other tests. I generate unique values such as emails with a run identifier, reset or clean up after the test, and never share mutable records between tests that run in parallel. That way tests can run in any order and failures are reproducible.
  - q: What is "special" test data?
    a: It is data that is valid or at least plausible but is known to break naive implementations. Examples are names such as O'Brien or single-letter surnames, accented and non-Latin characters, emoji, very long values, values with leading zeros, 29 February, daylight-saving transitions and amounts that cause rounding. It often comes from error-guessing checklists and past defects.
practice:
  - "Design a four-class data table (valid, invalid, boundary, special) for a hotel booking form with guest name, check-in date, nights (1 to 30) and number of guests (1 to 4)."
  - "Convert your table into a CSV file and a data-driven test, with a purpose column for every row."
  - "Your team uses a copy of production for testing. List the privacy risks and propose a safer data strategy."
takeaways:
  - Design data deliberately in four classes, namely valid, invalid, boundary and special.
  - Derive values from partitions and boundaries, and record the purpose of each value.
  - Prefer synthetic data; use masked production data only with approval and proper anonymisation.
  - Keep data independent with unique values, set-up and clean-up, and no shared mutable records.
  - Store data with the tests, under version control, so it is reviewable and repeatable.
quiz:
  - id: tdata-q1
    type: single
    topic: test-data-design
    difficulty: beginner
    prompt: A name field accepts 1 to 50 characters. Which value belongs to the special data class rather than plain valid data?
    options: ["Priya", "O'Brien", "A 51-character name", "An empty string"]
    answer: [1]
    explanation: O'Brien is valid but contains an apostrophe, which commonly breaks string handling and queries. Priya is plain valid data, an empty string is invalid, and 51 characters is the boundary neighbour outside the valid range.
  - id: tdata-q2
    type: multiple
    topic: test-data-design
    difficulty: intermediate
    prompt: Which practices keep test data independent and repeatable? Select all that apply.
    options: ["Generate a unique email per test run", "Rely on the record created by the previous test in the suite", "Clean up or reset data the test created", "Store data files with the test code under version control"]
    answer: [0, 2, 3]
    explanation: Unique values, clean-up and versioned data files make tests order-independent and reproducible. Depending on another test's leftovers creates hidden coupling, so one failure cascades and parallel runs break.
  - id: tdata-q3
    type: truefalse
    topic: test-data-design
    difficulty: beginner
    prompt: Copying unmasked production customer data into a shared test environment is acceptable as long as the testers are employees.
    options: ["True", "False"]
    answer: [1]
    explanation: Test environments usually have weaker access controls, and using real personal data there can breach data protection law and policy regardless of who the testers are. Use synthetic data or properly anonymised data approved by the data owner.
  - id: tdata-q4
    type: code-output
    topic: test-data-design
    difficulty: intermediate
    prompt: This data-driven test reads the CSV shown. How many test cases does pytest collect?
    code: |
      # nights.csv
      # case_id,nights,expected
      # TD-01,1,accepted
      # TD-02,30,accepted
      # TD-03,0,rejected
      # TD-04,31,rejected

      rows = list(csv.DictReader(open("nights.csv")))

      @pytest.mark.parametrize("row", rows, ids=[r["case_id"] for r in rows])
      def test_nights(row): ...
    codeLanguage: python
    options: ["1", "3", "4", "5"]
    answer: [2]
    explanation: DictReader treats the first line as the header, so the four data rows become four parametrised cases, TD-01 to TD-04. Counting the header as a case gives the tempting wrong answer of 5.
---

## Beginner-friendly explanation

A driving instructor does not only test a learner on an empty road on a sunny day. They pick routes on purpose: a normal street, a busy junction, a steep hill start, a roundabout in the rain. The **choice of conditions** decides what the test can reveal.

Test data is the software equivalent. If every test uses "John Smith, 30 years old, john@example.com", you are always driving on the empty sunny road. **Test data design** means choosing data on purpose: normal values, wrong values, values right at the limits, and the awkward real-world values that tend to break things.

## Technical explanation

Test data is the data needed to execute tests: inputs, preconditions in the database, configuration and expected outputs. Good test data design applies [equivalence partitioning](/learn/manual-testing/equivalence-partitioning) and [boundary value analysis](/learn/manual-testing/boundary-value-analysis) to *data*, and adds experience-based knowledge of what breaks systems.

**Four data classes**

| Class | Purpose | Derived from |
|---|---|---|
| Valid | Confirm normal processing | One representative per valid partition |
| Invalid | Confirm safe rejection | One value per invalid partition, one at a time |
| Boundary | Catch off-by-one and precision errors | Edges of ordered partitions and their neighbours |
| Special | Catch encoding, formatting, locale and timing defects | Error guessing, past defects, domain knowledge |

**Data sources**

| Source | Strengths | Risks |
|---|---|---|
| Synthetic (hand-designed or generated) | Precise control, covers edge cases, no personal data | Can miss real-world variety |
| Masked or anonymised production | Realistic volume and variety | Re-identification if masking is weak; needs data-owner approval |
| Unmasked production | Realistic | Usually prohibited for personal data in test environments |

**Data management principles**: independence (each test owns its data), repeatability (same data gives same result), traceability (each value has a purpose), minimalism (only the data the test needs) and versioning (data stored alongside tests).

### Worked example: customer sign-up

Rules: full name 1–50 characters; date of birth giving age 18–100; email in valid format and unique; Indian PIN code of six digits not starting with 0.

| Field | Valid | Invalid | Boundary | Special |
|---|---|---|---|---|
| Full name | Priya Sharma | empty; 51 characters | 1 char "A"; 50 chars; 51 chars | O'Brien; Anne-Marie; Zoë; 李华; leading or trailing spaces; emoji |
| Date of birth | Age 35 | future date; malformed "31/02/1990" | exactly 18 today; 18 tomorrow; exactly 100; 101 | born 29 February; sign-up at midnight; different time zone from server |
| Email | asha@example.com | no @; spaces inside | maximum length allowed by the system | plus addressing a+b@example.com; uppercase; already registered |
| PIN code | 560001 | 5 digits; letters; starts with 0 | 100000; 999999 | leading or trailing space; pasted with a hyphen |

Each value has a reason to exist. For example, "18 tomorrow" (the person turns 18 tomorrow, so is 17 today) is the invalid neighbour of the age boundary, and "born 29 February" tests age calculation in non-leap years.

## Real-world example

A clinic booking system passed every test, all of which used names like "Test User". In its first week, patients with apostrophes in their surnames could not book, because the name broke a search query. The fix was quick, but the lesson stuck: the team added a "special names" set to their shared test data, with apostrophes, hyphens, accented and non-Latin characters, single-letter names and very long names, and every form test now draws from it.

## Step-by-step walkthrough

1. **List the data each test needs**: inputs, existing records (preconditions) and expected outputs.
2. **Partition each field** and pick valid and invalid representatives.
3. **Add boundaries** at the input's precision (dates, decimals, lengths).
4. **Add special data** from error-guessing checklists and past defects.
5. **Record a purpose** for every value, either a test case ID or a short reason.
6. **Choose the source**: synthetic by default, masked production only when justified and approved.
7. **Make it independent**: generate unique values, set up and clean up per test.
8. **Store it with the tests** under version control, and review it like code.

## Code examples

Data-driven tests keep data separate from logic. Each CSV row is one case with a purpose:

```text
case_id,class,name,expected
TD-01,valid,Priya Sharma,accepted
TD-02,boundary,A,accepted
TD-03,boundary,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,accepted
TD-04,invalid,,rejected
TD-05,special,O'Brien,accepted
TD-06,special,Zoë Ångström,accepted
```

```python
import csv
import uuid
import pytest
from signup import register

with open("signup_names.csv", encoding="utf-8") as f:
    ROWS = list(csv.DictReader(f))

def unique_email() -> str:
    return f"td-{uuid.uuid4().hex[:8]}@example.com"  # independence: no clashes

@pytest.mark.parametrize("row", ROWS, ids=[r["case_id"] for r in ROWS])
def test_name_handling(row):
    result = register(name=row["name"], email=unique_email(), dob="1990-05-17")
    assert result.status == row["expected"], f'{row["class"]}: {row["name"]!r}'
```

TD-03 is exactly 50 characters (the maximum); add a 51-character row for the invalid neighbour.

## Expected output

On a correct implementation pytest reports `6 passed`, with case IDs TD-01 to TD-06. If apostrophes broke the system, you would see `test_name_handling[TD-05] FAILED` with the message `special: "O'Brien"`, which tells you the data class and the value at a glance.

## Common mistakes

- **One "happy" record for everything**, which never exercises edges or special characters.
- **Shared mutable data**, so tests pass alone but fail when run together or in parallel.
- **Unmasked production data** in test environments, a privacy and compliance risk.
- **Hard-coded dates** like "1990-05-17 makes the user 35", which silently change meaning as time passes. Calculate dates relative to today.
- **Data without a purpose**, which grows forever because nobody knows what is safe to delete.
- **Ignoring encoding.** Files saved without UTF-8 turn "Zoë" into garbage before the system even sees it.

## Troubleshooting

- **A test fails only on certain days.** Look for date logic that depends on "today", leap years or time zones, and make the date explicit or relative.
- **Unique-constraint errors in reruns.** Generate unique values per run or clean up after each test.
- **Masked data still identifies people.** Combinations such as PIN code, birth date and gender can re-identify; involve the data owner and mask more aggressively or switch to synthetic data.

## Key takeaways summary

Good test data is designed, not grabbed. Build valid, invalid, boundary and special classes from partitions, boundaries and experience; prefer synthetic data; keep each test's data independent and versioned; and record why each value exists. See [data-driven testing](/learn/automation/data-driven-testing) for scaling this in automation.
