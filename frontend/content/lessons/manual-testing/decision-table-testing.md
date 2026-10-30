---
slug: decision-table-testing
title: Decision Table Testing
summary: When business rules combine several conditions, a decision table lists every combination and its outcome so no rule is missed. Learn to build, check and collapse one.
level: intermediate
duration: 35
tags: [test-design, black-box, istqb]
objectives:
  - Identify the conditions and actions in a business rule
  - Build a full limited-entry decision table with 2^n rules
  - Collapse a decision table safely using "-" (irrelevant) entries
  - Derive test cases that achieve 100% decision table coverage
prerequisites:
  - Equivalence partitioning
  - Boundary value analysis
related: [equivalence-partitioning, boundary-value-analysis, state-transition-testing, pairwise-and-combinatorial-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 4.2.3, Decision Table Testing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: ISO/IEC/IEEE 29119-4 Software testing — Test techniques
    url: https://www.iso.org/standard/60245.html
interview:
  - q: When would you choose decision table testing over equivalence partitioning?
    a: When the outcome depends on a combination of conditions rather than on each input independently. EP tests each input's classes, but it does not systematically check how conditions interact. A decision table enumerates every combination of conditions with the expected actions, so it finds missing or contradictory rules, which is exactly where combinatorial business logic such as pricing, eligibility or approvals goes wrong.
  - q: How many rules does a full decision table have, and how do you reduce it?
    a: A limited-entry table with n Boolean conditions has 2^n rules. You reduce it by removing infeasible combinations and by collapsing columns where a condition does not affect the outcome, marking that condition with "-". The collapsed table still covers every distinct behaviour, but you should only collapse when the requirement genuinely says the condition is irrelevant, not because it looks convenient.
  - q: What does decision table coverage mean?
    a: In ISTQB v4.0, it is the number of exercised feasible columns (rules) divided by the total number of feasible columns, as a percentage. 100% coverage means at least one test for every feasible rule in the table you chose, full or collapsed.
  - q: What extra value does building the table give before any test runs?
    a: It is a static review tool. Filling every column forces the question "what should happen here?" for combinations that the requirement never mentions. Gaps, contradictions and ambiguous rules surface as empty or conflicting action entries, and they can be resolved with the product owner before coding is finished.
practice:
  - "A library charges a late fee unless the member is a student or the book was returned within a 2-day grace period; students pay half fees on reference books only. List the conditions and actions and build the full decision table."
  - "The fund-transfer rule gains a fourth condition, 'payee added in the last 24 hours', which forces an OTP regardless of amount. Rebuild the full table (16 rules), then collapse it."
  - "Login rules - valid username, valid password and account locked. Build the decision table, collapse it, and write one concrete test per rule."
takeaways:
  - Conditions are inputs to a rule; actions are the expected outcomes; each column is one rule.
  - n Boolean conditions give 2^n rules in a full limited-entry table.
  - Collapse with "-" only when the requirement makes a condition irrelevant for that rule.
  - Coverage is exercised feasible rules divided by all feasible rules.
  - Building the table often finds requirement gaps before any test is executed.
quiz:
  - id: dtt-q1
    type: single
    topic: decision-table-testing
    difficulty: beginner
    prompt: A rule depends on four independent Boolean conditions. How many rules does the full limited-entry decision table contain?
    options: ["4", "8", "16", "24"]
    answer: [2]
    explanation: Each Boolean condition doubles the combinations, so four conditions give 2^4 = 16 rules. Eight would be three conditions, and 4 confuses conditions with rules.
  - id: dtt-q2
    type: single
    topic: decision-table-testing
    difficulty: intermediate
    prompt: In a collapsed decision table, what does a "-" entry for a condition mean?
    options: ["The condition is false", "The combination is infeasible", "The condition's value does not affect the outcome for that rule", "The test for that rule is optional"]
    answer: [2]
    explanation: A dash means "don't care" for that rule, because the outcome is the same whether the condition is true or false. It does not mean false (shown as F), and infeasible combinations are marked N/A or removed rather than tested.
  - id: dtt-q3
    type: scenario
    topic: decision-table-testing
    difficulty: intermediate
    prompt: Using the fund-transfer table in this lesson, a test uses an active account, sufficient balance and an amount of ₹75,000. Which action is expected?
    options: ["Reject, account frozen", "Reject, insufficient funds", "Ask for OTP", "Process the transfer immediately"]
    answer: [2]
    explanation: The account is not frozen (C1 = F), balance is sufficient (C2 = T) and the amount exceeds ₹50,000 (C3 = T), which is rule R5, so the expected action is ask for OTP. Immediate processing applies only when the amount is ₹50,000 or less.
  - id: dtt-q4
    type: truefalse
    topic: decision-table-testing
    difficulty: beginner
    prompt: 100% decision table coverage requires at least one test for each feasible column in the table.
    options: ["True", "False"]
    answer: [0]
    explanation: ISTQB v4.0 defines decision table coverage as exercised feasible columns divided by all feasible columns. Infeasible columns are excluded, so each feasible rule needs at least one test.
---

## Beginner-friendly explanation

Think of a restaurant that gives free dessert to **birthday guests**, but only if they **booked online**, unless they are **loyalty members**, who always get it. Say that out loud and people start to argue: "What about a member who has no birthday today?" The words hide combinations.

A **decision table** is a grid that settles the argument. Down the side you list every yes/no question (birthday? booked online? member?). Across the top you write every possible mix of answers. Under each mix you write what should happen. Nothing is left to guesswork, and each column becomes a test.

## Technical explanation

ISTQB CTFL v4.0 describes decision tables as a way to test how a system implements **combinations of conditions** that result in different outcomes.

- **Conditions** (rows at the top) are the inputs to the rule. In a **limited-entry** table they are Boolean: **T** (true) or **F** (false).
- **Actions** (rows at the bottom) are the outcomes. **X** means the action occurs and a blank means it does not.
- Each **column** is a **rule**, one unique combination of conditions with its actions.
- **"-"** means the condition's value is irrelevant to that rule. **N/A** marks an infeasible combination.

A full table with *n* Boolean conditions has **2^n** columns. Conditions can also be extended-entry, taking several values such as an EP partition, in which case the column count is the product of the number of values for each condition.

You **collapse** (minimise) a table by deleting infeasible columns and merging columns that have identical actions and differ in only one condition, replacing that condition with "-".

**Coverage** = exercised feasible columns ÷ all feasible columns × 100%.

### Worked example: fund transfer rules

Requirement: *"If the account is frozen, reject the transfer. Otherwise, if the balance is insufficient, reject it with 'insufficient funds'. Otherwise, transfers above ₹50,000 require an OTP; others are processed immediately."*

Conditions: **C1** account frozen, **C2** sufficient balance, **C3** amount > ₹50,000. Three conditions give 2^3 = 8 rules.

**Full decision table**

| | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
|---|---|---|---|---|---|---|---|---|
| C1 Account frozen | T | T | T | T | F | F | F | F |
| C2 Sufficient balance | T | T | F | F | T | T | F | F |
| C3 Amount > ₹50,000 | T | F | T | F | T | F | T | F |
| A1 Reject, account frozen | X | X | X | X | | | | |
| A2 Reject, insufficient funds | | | | | | | X | X |
| A3 Ask for OTP | | | | | X | | | |
| A4 Process immediately | | | | | | X | | |

R1–R4 share the same action and C2 and C3 do not matter once the account is frozen, so they merge. R7 and R8 share an action and differ only in C3, so they merge too.

**Collapsed decision table**

| | R1' (R1–R4) | R2' (R5) | R3' (R6) | R4' (R7–R8) |
|---|---|---|---|---|
| C1 Account frozen | T | F | F | F |
| C2 Sufficient balance | - | T | T | F |
| C3 Amount > ₹50,000 | - | T | F | - |
| A1 Reject, account frozen | X | | | |
| A2 Reject, insufficient funds | | | | X |
| A3 Ask for OTP | | X | | |
| A4 Process immediately | | | X | |

Four tests now give 100% coverage of the collapsed table:

| Test | Frozen | Balance | Amount | Expected |
|---|---|---|---|---|
| DT-01 | Yes | ₹10,000 | ₹60,000 | Rejected, "Account frozen" |
| DT-02 | No | ₹1,00,000 | ₹75,000 | OTP requested |
| DT-03 | No | ₹1,00,000 | ₹20,000 | Transfer processed |
| DT-04 | No | ₹5,000 | ₹8,000 | Rejected, "Insufficient funds" |

For the "-" entries you choose any value. Varying them across runs (for example DT-01 with a sufficient balance next time) adds cheap extra confidence. Add [boundary value analysis](/learn/manual-testing/boundary-value-analysis) on C3 with ₹50,000.00 and ₹50,000.01.

## Real-world example

A subscription team had a rule set for proration: plan upgrade or downgrade, monthly or annual billing, and mid-cycle or at renewal. Developers implemented it from a paragraph of prose. A tester turned the paragraph into a decision table with 2^3 = 8 columns and found that the requirement never said what happens on a **downgrade of an annual plan mid-cycle**. The column had no action. The question went to the product owner before release, and the answer changed the refund logic. The table found a defect in the requirement itself.

## Step-by-step walkthrough

1. **Read the rule and underline conditions** (if, when, unless, only) and **actions** (then, gets, is rejected).
2. **Express each condition as true/false**, or as a small set of EP values for an extended-entry table.
3. **Calculate the column count**: 2^n for Boolean conditions.
4. **Fill condition rows systematically.** Alternate the last row T/F, the one above in pairs, then fours, so no combination is missed.
5. **Fill the actions for each column** from the requirement. Any column you cannot fill is a question for the product owner.
6. **Mark infeasible columns** (for example, "age < 18" and "age > 65" both true).
7. **Collapse** columns with identical actions that differ in exactly one condition.
8. **Write one test per remaining column** with concrete data and expected results.

## Code examples

Each column maps to one row of a data-driven test, which keeps the table and the automation in sync:

```java
public class TransferRulesTest {

    @DataProvider(name = "decisionTable")
    public Object[][] rules() {
        return new Object[][] {
            // rule, frozen, balance, amount, expected
            {"R1'", true,  10_000,  60_000, Outcome.REJECT_FROZEN},
            {"R2'", false, 100_000, 75_000, Outcome.OTP_REQUIRED},
            {"R3'", false, 100_000, 20_000, Outcome.PROCESSED},
            {"R4'", false, 5_000,   8_000,  Outcome.REJECT_INSUFFICIENT},
        };
    }

    @Test(dataProvider = "decisionTable")
    public void transferFollowsRule(String rule, boolean frozen, long balance,
                                    long amount, Outcome expected) {
        Account account = TestAccounts.with(frozen, balance);
        assertEquals(TransferService.submit(account, amount), expected, "rule " + rule);
    }
}
```

## Expected output

All four cases pass on a correct implementation. If a developer checked the balance before the frozen flag, DT-01 would fail. Its balance of ₹10,000 is insufficient for ₹60,000, so the buggy code returns "insufficient funds" instead of "account frozen", and the assertion message names rule R1'. This is why the frozen-account test deliberately uses a value for the "-" conditions that would trigger a different action if precedence were wrong.

## Common mistakes

- **Collapsing because it looks tidy.** Merge only when the requirement truly makes a condition irrelevant; otherwise you hide untested combinations.
- **Conditions that are not independent**, such as "age < 18" and "age ≥ 18" as two rows. That is one condition.
- **Leaving action cells blank without asking.** An empty column is a requirement gap, not a "no action".
- **Too many conditions in one table.** Ten conditions mean 1,024 columns; split the rule into smaller tables or use pairwise testing.
- **Ignoring the order of evaluation.** Precedence ("frozen wins over balance") must be visible in the expected actions.

## Troubleshooting

- **The table is too big to handle.** Group related conditions into sub-tables, or treat a sub-decision as a single derived condition.
- **Two columns give conflicting actions.** The requirement is contradictory; log it as a requirement defect.
- **Stakeholders cannot read the table.** Walk them through one column at a time as a sentence: "If not frozen, sufficient balance and amount above 50,000, then ask for OTP."

## Key takeaways summary

Decision tables make combinational logic explicit. List conditions and actions, enumerate 2^n rules, fill every action, collapse only where a condition is truly irrelevant, and write one test per feasible column. The table is valuable even before testing, because it exposes requirement gaps.
