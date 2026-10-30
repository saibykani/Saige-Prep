---
slug: pairwise-and-combinatorial-testing
title: Pairwise and Combinatorial Testing
summary: When many parameters interact, exhaustive testing explodes. Pairwise testing covers every pair of values at least once in a small set of tests. Learn to build and verify a pairwise array.
level: intermediate
duration: 35
tags: [test-design, black-box, combinatorial]
objectives:
  - Explain the combinatorial explosion and why pairwise testing is effective for interaction defects
  - Calculate exhaustive combinations, the number of pairs to cover and the minimum pairwise test count
  - Build a pairwise array by hand from an orthogonal array and verify every pair is covered
  - Use a tool such as PICT with constraints, and know when to go to 3-wise coverage
prerequisites:
  - Equivalence partitioning
  - Decision table testing
related: [equivalence-partitioning, decision-table-testing, cross-browser-testing, device-and-os-coverage-strategy]
references:
  - title: ISTQB certifications (combinatorial techniques are covered in the Advanced Level Test Analyst syllabus)
    url: https://www.istqb.org/
  - title: Microsoft PICT (Pairwise Independent Combinatorial Testing) on GitHub
    url: https://github.com/microsoft/pict
  - title: ISO/IEC/IEEE 29119-4 Software testing — Test techniques
    url: https://www.iso.org/standard/60245.html
interview:
  - q: What is pairwise testing and why does it work?
    a: Pairwise testing selects a set of tests in which every possible pair of values for every pair of parameters appears at least once. It works because many configuration and input defects are triggered by a single value or by the interaction of two values, so covering all pairs catches them with far fewer tests than the full Cartesian product. It does not guarantee finding defects that need three or more specific values together.
  - q: How do you work out the minimum number of pairwise tests?
    a: The lower bound is the product of the two largest parameter value counts, because those two parameters alone generate that many distinct pairs and each test covers only one of them. For parameters with 5, 3 and 2 values the lower bound is 15, against 30 exhaustive combinations. Real tools may produce slightly more than the bound, especially with constraints.
  - q: How do you handle impossible combinations such as Safari on Windows?
    a: I express them as constraints in the tool model, for example a PICT IF/THEN rule, so the generator never produces them. I do not just delete rows from a generated array afterwards, because that can remove the only occurrence of other valid pairs and silently break coverage.
  - q: When is pairwise not enough?
    a: When risk analysis or past defects show three-way interactions matter, such as a specific browser, locale and payment combination, or for safety-critical configuration. Then I raise the strength to 3-wise for the risky parameters, add specific high-risk combinations by hand, and keep important single-value business rules in decision tables.
practice:
  - "A report export has Format (PDF, CSV, XLSX), Orientation (Portrait, Landscape) and Page size (A4, Letter, Legal). Calculate exhaustive and minimum pairwise counts, then build a pairwise set and verify it."
  - "Add a constraint to the checkout model, Pickup is not available on Tablet, and explain why you cannot simply delete row 6 from the array in this lesson."
  - "Write a PICT model for a mobile app matrix (OS, OS version, screen size, network) and decide which parameters deserve 3-wise coverage."
takeaways:
  - Exhaustive combinations equal the product of all value counts and grow multiplicatively.
  - Pairwise covers every value pair of every parameter pair at least once.
  - The minimum pairwise test count is at least the product of the two largest value counts.
  - Always verify generated or hand-built arrays pair by pair, and model impossible combinations as constraints.
  - Increase to 3-wise or add targeted tests where risk shows higher-order interactions matter.
quiz:
  - id: pwc-q1
    type: single
    topic: pairwise-and-combinatorial-testing
    difficulty: beginner
    prompt: Four parameters each have three values. How many exhaustive combinations are there?
    options: ["12", "27", "81", "9"]
    answer: [2]
    explanation: Exhaustive testing is the product of value counts, 3 × 3 × 3 × 3 = 81. Nine is the size of a pairwise array for this model, and 12 wrongly adds the counts.
  - id: pwc-q2
    type: single
    topic: pairwise-and-combinatorial-testing
    difficulty: intermediate
    prompt: Parameters have 5, 3 and 2 values. What is the smallest possible number of tests that achieves pairwise coverage?
    options: ["6", "10", "15", "30"]
    answer: [2]
    explanation: The two largest parameters alone create 5 × 3 = 15 distinct pairs, and each test covers only one of them, so at least 15 tests are needed. 15 is achievable here by choosing the third value so it pairs with every value of the others. 30 is exhaustive.
  - id: pwc-q3
    type: truefalse
    topic: pairwise-and-combinatorial-testing
    difficulty: beginner
    prompt: Pairwise testing guarantees detection of a defect that only occurs when three specific parameter values occur together.
    options: ["True", "False"]
    answer: [1]
    explanation: Pairwise only guarantees that every two-value combination appears. A specific triple might never appear in the set. 3-wise coverage or a targeted test is needed for that.
  - id: pwc-q4
    type: scenario
    topic: pairwise-and-combinatorial-testing
    difficulty: advanced
    prompt: A tester generates a pairwise set, then deletes every row containing Guest with Wallet because guests cannot use wallets. What is the risk?
    options: ["None, invalid rows should always be deleted", "Other pairs in the deleted rows may no longer be covered anywhere", "Pairwise sets cannot contain invalid combinations", "The set becomes exhaustive"]
    answer: [1]
    explanation: Each row covers several pairs at once. Deleting a row can remove the only occurrence of valid pairs such as Wallet with Express. The correct approach is to declare the constraint in the model and regenerate.
---

## Beginner-friendly explanation

Imagine an ice-cream shop with 3 flavours, 3 cone types, 3 toppings and 3 sizes. Tasting every combination means 81 ice creams. Most problems, though, come from a **pair** that does not work together, like a heavy topping on a small cone, not from all four choices at once.

**Pairwise testing** picks a small menu of combinations so that every pair (every flavour with every cone, every cone with every topping, and so on) shows up at least once. For the shop, nine carefully chosen ice creams cover every pair. That is nine tests instead of eighty-one.

## Technical explanation

**Combinatorial testing** designs tests to cover combinations of parameter values. The parameters are often partitions from [equivalence partitioning](/learn/manual-testing/equivalence-partitioning).

- **Exhaustive (all combinations)**: the product of the value counts. Ten parameters with three values each give 3^10 = 59,049.
- **Each-choice (1-wise)**: every value appears at least once.
- **Pairwise (2-wise)**: every pair of values, for every pair of parameters, appears at least once.
- **t-wise**: every combination of t values appears at least once.

Pairwise works because each test covers many pairs at once. With four parameters a single test covers C(4,2) = 6 pairs. The minimum number of tests is at least the **product of the two largest value counts**.

**Orthogonal arrays** are a mathematical structure where every pair appears *exactly* the same number of times. **Pairwise arrays** only require *at least once*, so tools such as PICT generate small sets that handle mixed value counts and constraints. Combinatorial techniques are part of the ISTQB Advanced Level Test Analyst syllabus rather than CTFL v4.0.

### Worked example: checkout configurations

| Parameter | Values |
|---|---|
| Payment | Card, UPI, Wallet |
| Delivery | Standard, Express, Pickup |
| Customer | Guest, Member, Premium |
| Device | Desktop, Mobile, Tablet |

Exhaustive: 3^4 = **81** tests. Pairs to cover: 6 parameter pairs × 9 value pairs = **54**. Minimum: 3 × 3 = **9** tests.

The array below comes from the standard L9(3^4) orthogonal array. Coding values as 0, 1 and 2, the columns are a, b, (a + b) mod 3 and (a + 2b) mod 3.

| Test | Payment | Delivery | Customer | Device |
|---|---|---|---|---|
| PW-1 | Card | Standard | Guest | Desktop |
| PW-2 | Card | Express | Member | Tablet |
| PW-3 | Card | Pickup | Premium | Mobile |
| PW-4 | UPI | Standard | Member | Mobile |
| PW-5 | UPI | Express | Premium | Desktop |
| PW-6 | UPI | Pickup | Guest | Tablet |
| PW-7 | Wallet | Standard | Premium | Tablet |
| PW-8 | Wallet | Express | Guest | Mobile |
| PW-9 | Wallet | Pickup | Member | Desktop |

9 tests × 6 pairs per test = 54 pair slots for 54 required pairs, so every pair appears **exactly once**.

**Verifying by hand.** Check each of the six parameter pairs. For example, Payment × Customer:

| | Guest | Member | Premium |
|---|---|---|---|
| Card | PW-1 | PW-2 | PW-3 |
| UPI | PW-6 | PW-4 | PW-5 |
| Wallet | PW-8 | PW-9 | PW-7 |

And Delivery × Device:

| | Desktop | Mobile | Tablet |
|---|---|---|---|
| Standard | PW-1 | PW-4 | PW-7 |
| Express | PW-5 | PW-8 | PW-2 |
| Pickup | PW-9 | PW-3 | PW-6 |

Every cell is filled and no cell is empty, so these pairs are covered. Repeat for Payment × Delivery, Payment × Device, Delivery × Customer and Customer × Device, or let a script do it (below).

## Real-world example

A mobile banking team supported several Android versions, screen sizes, languages and network types. Exhaustive testing was impossible within a sprint, so testers ran the same handful of "favourite" devices every release. After they switched to a generated pairwise matrix, one early run paired a right-to-left language with a small screen for the first time and exposed a truncated "Confirm transfer" button. Neither value was a problem alone. The pair was.

## Step-by-step walkthrough

1. **List parameters** that can vary independently: browsers, roles, options, input classes.
2. **Reduce each parameter's values** using EP. Use one value per partition, not every possible value.
3. **Write down constraints** (impossible or forbidden combinations).
4. **Calculate** exhaustive count, pairs and minimum tests to set expectations.
5. **Generate** the array with a tool, or by hand from an orthogonal array for small, uniform models.
6. **Verify** every parameter pair is fully covered.
7. **Add expected results** for each row, and add specific high-risk combinations by hand.
8. **Raise strength** to 3-wise for parameters where risk or defect history justifies it.

## Code examples

A PICT model with a constraint. Run `pict checkout.txt` for pairwise, or `pict checkout.txt /o:3` for 3-wise:

```text
Payment:  Card, UPI, Wallet
Delivery: Standard, Express, Pickup
Customer: Guest, Member, Premium
Device:   Desktop, Mobile, Tablet

IF [Customer] = "Guest" THEN [Payment] <> "Wallet";
```

PICT prints a tab-separated table. The exact rows and row count can differ from the hand-built array, especially once constraints are added. A short script verifies any array:

```python
from itertools import combinations, product

params = {
    "Payment": ["Card", "UPI", "Wallet"],
    "Delivery": ["Standard", "Express", "Pickup"],
    "Customer": ["Guest", "Member", "Premium"],
    "Device": ["Desktop", "Mobile", "Tablet"],
}
rows = [
    ("Card", "Standard", "Guest", "Desktop"), ("Card", "Express", "Member", "Tablet"),
    ("Card", "Pickup", "Premium", "Mobile"), ("UPI", "Standard", "Member", "Mobile"),
    ("UPI", "Express", "Premium", "Desktop"), ("UPI", "Pickup", "Guest", "Tablet"),
    ("Wallet", "Standard", "Premium", "Tablet"), ("Wallet", "Express", "Guest", "Mobile"),
    ("Wallet", "Pickup", "Member", "Desktop"),
]
names = list(params)
required = covered = 0
for i, j in combinations(range(len(names)), 2):
    seen = {(r[i], r[j]) for r in rows}
    for pair in product(params[names[i]], params[names[j]]):
        required += 1
        if pair in seen:
            covered += 1
        else:
            print("MISSING", names[i], names[j], pair)
print(f"{covered} of {required} pairs covered")
```

## Expected output

```text
54 of 54 pairs covered
```

If you mistype a row, for example changing PW-5's device to Mobile, the script prints `MISSING` lines such as `MISSING Delivery Device ('Express', 'Desktop')`, which tells you exactly which pair you lost.

## Common mistakes

- **Using raw values instead of partitions**, which inflates the model for no benefit.
- **Deleting invalid rows after generation** instead of declaring constraints, which silently drops pairs.
- **Trusting an array without verifying it**, especially a hand-edited one.
- **Forgetting expected results.** A pairwise row is a test only when you know what should happen.
- **Treating pairwise as complete.** It does not replace decision tables for business rules or BVA for edges.

## Troubleshooting

- **The tool produces more rows than the minimum.** That is normal with mixed value counts and constraints. Check coverage, not row count.
- **Results differ between runs.** Some tools randomise. Fix a seed if the tool supports one, or store the generated set under version control.
- **One parameter has many values.** Split it by partition, or test it separately with each-choice coverage.

## Key takeaways summary

Pairwise testing tames combinatorial explosion by covering every value pair at least once. Partition the values first, calculate the bounds, generate with constraints, verify every pair and add targeted higher-strength tests where risk demands. Related: [decision table testing](/learn/manual-testing/decision-table-testing) and [cross-browser testing](/learn/specialist/cross-browser-testing).
