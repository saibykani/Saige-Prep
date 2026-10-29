---
slug: boundary-value-analysis
title: Boundary Value Analysis
summary: Defects cluster at the edges of input ranges. Learn to find the boundaries of every partition and test exactly on, just below and just above them.
level: beginner
duration: 30
tags: [test-design, black-box, istqb]
objectives:
  - Explain why defects cluster at boundaries
  - Identify the boundary values of a valid or invalid equivalence partition
  - Apply two-value and three-value boundary value analysis to a requirement
  - Combine boundary value analysis with equivalence partitioning to build a compact test set
prerequisites:
  - Equivalence partitioning
  - Basic understanding of requirements and test cases
related: [equivalence-partitioning, decision-table-testing, test-data-design, positive-and-negative-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 4.2.2, Boundary Value Analysis)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISO/IEC/IEEE 29119-4 Software testing — Test techniques
    url: https://www.iso.org/standard/60245.html
interview:
  - q: What is boundary value analysis and why does it work?
    a: It is a black-box technique that tests values at the edges of equivalence partitions — the minimum, maximum and the values just outside them. It works because developers commonly make off-by-one mistakes such as writing `<` instead of `<=`, so the edges are where defects concentrate. Testing boundaries finds those defects with very few test cases.
  - q: What is the difference between two-value and three-value BVA?
    a: Two-value BVA tests each boundary and its closest neighbour in the adjacent partition (for 18–60 that is 17, 18, 60, 61). Three-value BVA also tests the neighbour inside the partition (17, 18, 19 and 59, 60, 61). Three-value is more thorough and catches defects such as a condition written as `== 18` instead of `>= 18`, at the cost of extra cases.
  - q: How would you apply BVA to a text field that accepts 8 to 20 characters?
    a: The boundaries are on length, not content. With two-value BVA you would test lengths 7, 8, 20 and 21 (and usually 0 as a special case for an empty field). You keep the content otherwise valid so that any failure is attributable to length alone.
  - q: Can boundary value analysis be used for non-numeric inputs?
    a: Yes, as long as the partition is ordered. Dates, times, string lengths, file sizes, list counts and even enumerated ranges such as account tiers all have boundaries. It does not apply to unordered sets such as a list of country names, where equivalence partitioning alone is used.
practice:
  - "A shipping form accepts parcel weights from 0.1 kg to 30 kg, with one decimal place. List the two-value and three-value boundary tests."
  - "A password must be 12 to 64 characters. Write test cases for the length boundaries, keeping every other password rule satisfied."
  - "A coupon is valid from 1 March 00:00 to 31 March 23:59 in the store's time zone. Identify the time boundaries and the time-zone risk."
takeaways:
  - Boundaries are the minimum and maximum of each ordered partition; test on them and on their nearest neighbours.
  - Two-value BVA tests each boundary plus its neighbour outside; three-value adds the neighbour inside.
  - Always use BVA together with equivalence partitioning, not instead of it.
  - Change one boundary at a time and keep other inputs valid so failures are easy to diagnose.
  - Check the precision of the input (integers, one decimal place, seconds) before choosing neighbour values.
quiz:
  - id: bva-q1
    type: single
    topic: boundary-value-analysis
    difficulty: beginner
    prompt: An age field accepts 18 to 60 inclusive. Which set is the two-value boundary value analysis test set?
    options: ["18, 60", "17, 18, 60, 61", "17, 18, 19, 59, 60, 61", "0, 18, 60, 100"]
    answer: [1]
    explanation: Two-value BVA takes each boundary (18, 60) and its closest neighbour in the adjacent invalid partition (17, 61). The six-value set is three-value BVA.
  - id: bva-q2
    type: multiple
    topic: boundary-value-analysis
    difficulty: intermediate
    prompt: A discount applies to orders of 100.00 to 499.99 (two decimal places). Which values are boundary tests for this partition? Select all that apply.
    options: ["99.99", "100.00", "100.01", "499.99", "500.00", "250.00"]
    answer: [0, 1, 3, 4]
    explanation: With two-decimal precision the neighbours are 0.01 away. 99.99 and 100.00 test the lower edge; 499.99 and 500.00 test the upper edge. 100.01 is the inside neighbour used only by three-value BVA, and 250.00 is a typical equivalence partition value.
  - id: bva-q3
    type: truefalse
    topic: boundary-value-analysis
    difficulty: beginner
    prompt: Boundary value analysis can be applied to the number of items in a shopping cart.
    options: ["True", "False"]
    answer: [0]
    explanation: Item count is an ordered integer range (for example 1 to 50), so it has boundaries like any numeric input.
  - id: bva-q4
    type: code-output
    topic: boundary-value-analysis
    difficulty: intermediate
    prompt: The rule is "eligible if age is 18 to 60 inclusive". Which input exposes the bug in this code?
    code: |
      boolean isEligible(int age) {
          return age > 18 && age <= 60;
      }
    codeLanguage: java
    options: ["17", "18", "60", "61"]
    answer: [1]
    explanation: The code uses `> 18` instead of `>= 18`, so age 18 is wrongly rejected. Only the exact lower boundary reveals it — a typical off-by-one defect that BVA is designed to catch.
---

## Beginner-friendly explanation

Imagine a theme-park ride with a sign: **"Riders must be 120 cm to 195 cm tall."** If you were checking that the ticket gate enforces this rule, which heights would you try?

You could try 150 cm, but almost any gate would get that right. The interesting questions are at the edges: does a 120 cm child get in? Is a 119 cm child turned away? What about exactly 195 cm, and 196 cm? Edges are where people — and programs — make mistakes, because someone has to decide whether "120" means "more than 120" or "120 or more".

**Boundary value analysis (BVA)** is the habit of testing exactly those edge values. It is one of the most effective techniques you will ever learn, because a handful of carefully chosen tests finds a large share of input-handling defects.

## Technical explanation

BVA builds on [equivalence partitioning](/learn/manual-testing/equivalence-partitioning). First you split an input's domain into partitions that the system should treat the same way. For an **ordered** domain (numbers, dates, lengths, counts), each partition has a minimum and a maximum value: its **boundaries**.

A boundary value is the minimum or maximum of a partition. Its **neighbours** are the closest values on either side, determined by the input's precision:

| Input precision | Neighbour of 100 |
|---|---|
| Integer | 99 and 101 |
| One decimal place | 99.9 and 100.1 |
| Two decimal places (currency) | 99.99 and 100.01 |
| Dates (day precision) | the previous and next day |

There are two common variants:

- **Two-value BVA** tests each boundary and its nearest neighbour in the *adjacent* partition.
- **Three-value BVA** tests the boundary plus *both* neighbours. This catches extra defect types, such as a comparison written as `== 18` instead of `>= 18`, which two-value BVA can miss.

Why it works: developers implement ranges with relational operators (`<`, `<=`, `>`, `>=`). Using the wrong one, or an off-by-one constant, shifts a boundary by exactly one step. Only a test on or next to the boundary can see that shift.

### Worked example: an age rule

Requirement: *"Customers aged 18 to 60 inclusive can open a standard account. Customers under 18 or over 60 are rejected."* Ages are whole numbers from 0 to 120.

Partitions: invalid low **0–17**, valid **18–60**, invalid high **61–120**.

```mermaid
flowchart LR
  A["0 … 17<br/>invalid (too young)"] --- B["18 … 60<br/>valid"] --- C["61 … 120<br/>invalid (too old)"]
  style B fill:#1f3b2f,stroke:#4fbf8f,color:#ededef
  style A fill:#3b1f1f,stroke:#ef6f6c,color:#ededef
  style C fill:#3b1f1f,stroke:#ef6f6c,color:#ededef
```

| Variant | Lower edge | Upper edge | Total |
|---|---|---|---|
| Two-value | 17, 18 | 60, 61 | 4 tests |
| Three-value | 17, 18, 19 | 59, 60, 61 | 6 tests |

If the domain itself is bounded (0 to 120), the outer edges 0, −1, 120 and 121 are boundaries too, and are worth testing when invalid input could crash the system rather than just be rejected.

## Real-world example

A payments team shipped a rule that blocked card transactions **over** ₹2,00,000 without extra verification. The requirement said "₹2,00,000 **or more** requires step-up authentication". The code used `amount > 200000`. Every functional test used round amounts like ₹50,000 and ₹5,00,000, so all passed.

In production, a customer paid exactly ₹2,00,000 and was not challenged, which breached the bank's risk policy. A single boundary test — amount = 200000.00 — would have exposed it before release.

## Step-by-step walkthrough

1. **Read the requirement and list ordered inputs.** Note the type and precision of each (integer, 2 decimals, date, length).
2. **Partition each input** into valid and invalid equivalence partitions.
3. **Mark the boundaries** — the minimum and maximum of every ordered partition.
4. **Choose two-value or three-value BVA** based on risk. Use three-value for money, security and safety rules.
5. **Write the neighbour values** using the input's precision.
6. **Design test cases that change one input at a time.** Keep every other field valid so that a failure clearly points to the boundary under test.
7. **Record expected results** for each value, including the exact error message for invalid ones.

### Worked example: a password length rule

*"Passwords must be 12 to 64 characters."* The boundaries are on **length**, so keep the content valid (mixed case, digits) and vary only the length:

| Test | Length | Expected |
|---|---|---|
| BVA-01 | 11 | Rejected: "Password must be at least 12 characters" |
| BVA-02 | 12 | Accepted |
| BVA-03 | 64 | Accepted |
| BVA-04 | 65 | Rejected: "Password must be at most 64 characters" |
| EP-extra | 0 (empty) | Rejected: "Password is required" |

## Code examples

The same boundary tests expressed as a data-driven TestNG test, so each value is a separate, clearly reported case:

```java
public class AgeEligibilityTest {

    @DataProvider(name = "ageBoundaries")
    public Object[][] ageBoundaries() {
        return new Object[][] {
            {17, false}, {18, true}, {19, true},   // lower boundary (three-value)
            {59, true},  {60, true}, {61, false},  // upper boundary (three-value)
        };
    }

    @Test(dataProvider = "ageBoundaries")
    public void eligibilityRespectsAgeBoundaries(int age, boolean expected) {
        assertEquals(Eligibility.isEligible(age), expected, "age=" + age);
    }
}
```

## Expected output

Against a correct implementation, all six cases pass. Against the buggy `age > 18 && age <= 60` from the quiz, TestNG reports exactly one failure:

```text
FAILED: eligibilityRespectsAgeBoundaries(18, true)
java.lang.AssertionError: age=18 expected [true] but found [false]
```

## Common mistakes

- **Testing only "typical" values.** 25 and 45 tell you nothing about the edges.
- **Ignoring precision.** For a currency field, 99 is not the neighbour of 100.00 — 99.99 is.
- **Changing several inputs at once.** If two boundaries fail together you cannot tell which caused the error.
- **Forgetting implicit boundaries**, such as maximum field length, empty input, zero, or the largest value a data type can hold.
- **Skipping invalid neighbours** because "the UI prevents it". APIs and imports often bypass UI validation.
- **Confusing inclusive and exclusive wording.** "Under 18" and "up to 18" put the boundary in different places — clarify ambiguous requirements before writing tests.

## Troubleshooting

- **The requirement doesn't say whether limits are inclusive.** Raise a clarification question; record the assumption in the test case until it is answered.
- **You can't type an out-of-range value in the UI.** Test the boundary through the API or by editing the request in browser developer tools, and separately confirm the UI restriction.
- **Too many inputs make the test set huge.** Apply BVA per input while holding the others at a valid nominal value, then use pairwise testing for interactions.

## Key takeaways summary

Boundary value analysis is fast, cheap and finds a disproportionate number of defects. Partition first, find each ordered partition's edges, then test on and around them at the right precision — one input at a time.
