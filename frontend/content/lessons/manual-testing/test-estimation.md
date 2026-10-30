---
slug: test-estimation
title: Test Estimation
summary: Estimate testing effort with a work breakdown, three-point (PERT-style) estimates, ratios from your own history and team techniques like Wideband Delphi and Planning Poker, and communicate estimates as ranges with assumptions.
level: intermediate
duration: 35
tags: [test-documentation, test-management, estimation, istqb]
objectives:
  - Break testing work into estimable tasks using a work breakdown structure
  - Apply the three-point estimation formula and calculate a standard deviation
  - Compare metrics-based and expert-based estimation techniques
  - Present an estimate as a range with explicit assumptions and risks
prerequisites:
  - Test strategy versus test plan
  - Basic arithmetic
related: [test-strategy-vs-test-plan, entry-and-exit-criteria, risk-based-testing, test-execution-and-closure-reports]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.1.4, Estimation Techniques)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: The Scrum Guide
    url: https://www.scrumguides.org/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
interview:
  - q: How do you estimate testing effort for a new feature?
    a: I start with a work breakdown — analysis, design, environment and data setup, execution, retesting and regression, reporting — because you cannot estimate what you have not listed. For each task I give a three-point estimate (optimistic, most likely, pessimistic), compute the expected value, and sense-check it against history from similar features if we have it. I present the result as a range, list the assumptions such as build stability and environment availability, and revisit it when those change.
  - q: Explain three-point estimation.
    a: For each task you estimate an optimistic value a, a most likely value m and a pessimistic value b. The weighted expected value is E = (a + 4m + b) / 6 and a common measure of spread is SD = (b − a) / 6. E gives the planning figure and E ± SD gives a range that communicates uncertainty. The value lies in forcing people to think about what could go wrong, not in the precision of the arithmetic.
  - q: Your estimate is 20 days but the manager says you have 12. What do you do?
    a: I do not just cut the number. I show the breakdown and ask what we change — scope, depth, or risk acceptance. With risk-based prioritisation I can show what 12 days covers (for example all high-risk areas plus smoke regression) and what is left untested, so the stakeholder makes an informed decision. I document the agreed trade-off in the test plan.
practice:
  - "Create a work breakdown for testing a 'change delivery address' feature on a web and mobile app. Give each task a three-point estimate and compute the total expected effort."
  - "Recalculate the worked example in this lesson assuming the test environment will be shared with another team and setup could take up to 10 days in the worst case."
  - "Write five assumptions that should accompany any test estimate you give."
takeaways:
  - Break the work down first; most bad estimates come from forgotten tasks.
  - "Three-point: E = (a + 4m + b) / 6 and SD = (b − a) / 6."
  - Use your own historical data for ratios; borrowed ratios from other contexts are unreliable.
  - Team techniques (Wideband Delphi, Planning Poker) reduce individual bias.
  - Always present a range plus assumptions, and re-estimate when assumptions break.
quiz:
  - id: test-est-q1
    type: code-output
    topic: test-estimation
    difficulty: intermediate
    prompt: Using three-point estimation, what is the expected effort E for this task?
    code: |
      Optimistic (a)  = 4 days
      Most likely (m) = 6 days
      Pessimistic (b) = 14 days
      E = (a + 4m + b) / 6
    codeLanguage: text
    options: ["6 days", "7 days", "8 days", "8.5 days"]
    answer: [1]
    explanation: "E = (4 + 4×6 + 14) / 6 = (4 + 24 + 14) / 6 = 42 / 6 = 7 days. 8 days is the simple average (4 + 6 + 14) / 3, which ignores the extra weight on the most likely value."
  - id: test-est-q2
    type: single
    topic: test-estimation
    difficulty: beginner
    prompt: Which estimation technique is expert-based rather than metrics-based?
    options:
      - "Ratio-based estimation using past projects"
      - "Extrapolation from measurements taken early in the project"
      - "Wideband Delphi"
      - "Counting test cases from a previous release"
    answer: [2]
    explanation: "Wideband Delphi gathers estimates from several experts in rounds until they converge. Ratios, extrapolation and historical counts all rely on measured data, which makes them metrics-based."
  - id: test-est-q3
    type: multiple
    topic: test-estimation
    difficulty: intermediate
    prompt: Which factors typically increase testing effort? Select all that apply.
    options:
      - "Unstable or late test environments"
      - "Low-quality builds with many defects to retest"
      - "Clear, testable acceptance criteria agreed early"
      - "Regulatory documentation requirements"
      - "Many browser and device combinations in scope"
    answer: [0, 1, 3, 4]
    explanation: "Environment problems, retest cycles, compliance documentation and platform combinations all add effort. Clear acceptance criteria usually reduce effort because less time is lost to clarification and rework."
  - id: test-est-q4
    type: truefalse
    topic: test-estimation
    difficulty: beginner
    prompt: A good test estimate is a single precise number that should never change once agreed.
    options: ["True", "False"]
    answer: [1]
    explanation: "Estimates carry uncertainty and depend on assumptions. Present a range, state assumptions, and re-estimate when scope, quality or environments change."
---

## Beginner-friendly explanation

If a friend asks how long it takes to drive to the airport, you do not say "43 minutes". You say "about 40 minutes, maybe 30 with no traffic, an hour if the motorway is jammed". You also think about the parts of the trip: getting out of town, the motorway, parking, the walk to the terminal.

**Test estimation** works the same way. You split testing into parts, think about the best, normal and worst case for each, and give a range with the conditions it depends on ("assuming the build arrives on Monday").

## Technical explanation

ISTQB Foundation Level v4.0 groups estimation techniques into two families:

| Family | Technique | How it works |
|---|---|---|
| Metrics-based | Estimation based on ratios | Use ratios from your own past projects (for example, test effort relative to development effort) |
| Metrics-based | Extrapolation | Measure early in the project and extrapolate (for example, average execution time per test case) |
| Expert-based | Wideband Delphi | Experts estimate independently, discuss outliers, and re-estimate until estimates converge |
| Expert-based | Three-point estimation | Each task gets optimistic, most likely and pessimistic estimates combined by formula |

Agile teams commonly use **Planning Poker**, a Wideband Delphi variant, to size stories including their testing work.

### Three-point formula

```text
E  = (a + 4m + b) / 6        expected effort
SD = (b − a) / 6             spread (a common approximation of standard deviation)
a = optimistic, m = most likely, b = pessimistic
```

The weighting assumes the most likely value deserves four times the influence of the extremes. Treat the result as a planning aid, not a statistical guarantee.

### Work breakdown structure (WBS)

A WBS lists every testing task before you estimate it. The usual top-level buckets are: test planning, analysis and design, environment and data preparation, execution, defect retesting and regression, and reporting and closure. Missing buckets (often environment setup and retesting) are the most common cause of underestimates.

## Real-world example

A team is adding a loyalty-points feature to an e-commerce checkout: earn points on orders, redeem points as a discount, see a points history. The test lead runs a short estimation session with two testers and a developer.

**Work breakdown with three-point estimates (tester-days):**

| Task | a | m | b | E = (a+4m+b)/6 | SD = (b−a)/6 |
|---|---|---|---|---|---|
| Analysis and test design (EP/BVA on points, rounding rules) | 3 | 5 | 10 | 5.50 | 1.17 |
| Environment and test data setup (accounts with balances) | 1 | 2 | 6 | 2.50 | 0.83 |
| First execution pass (web + mobile web) | 6 | 8 | 14 | 8.67 | 1.33 |
| Defect retesting and regression of checkout | 3 | 4 | 9 | 4.67 | 1.00 |
| Reporting and closure | 1 | 1 | 2 | 1.17 | 0.17 |
| **Total** | | | | **22.5** | |

Combining spreads: if tasks are treated as independent, the total SD is the square root of the sum of squared SDs:

```text
SD_total = √(1.17² + 0.83² + 1.33² + 1.00² + 0.17²)
         = √(1.37 + 0.69 + 1.77 + 1.00 + 0.03)
         ≈ √4.86 ≈ 2.2 tester-days

Planning range (E ± SD): about 20.3 to 24.7 tester-days
With 2 testers: roughly 10 to 12.5 working days of elapsed time
```

**Assumptions recorded with the estimate:**

- The build passes smoke testing on day 1 of the test window.
- The payment sandbox is available for the full window.
- Points rules (rounding, expiry) are agreed before test design starts.
- Mobile apps are out of scope for this release.

When the product owner later added "points expire after 12 months", the test lead re-estimated analysis and execution and updated the plan, instead of absorbing the work silently.

## Step-by-step walkthrough

1. **List the scope** and what is out of scope.
2. **Build the WBS**: every activity from planning to closure, including environment setup and retests.
3. **Estimate each task** with a, m and b, ideally with the people who will do the work.
4. **Calculate E and SD** per task and in total.
5. **Cross-check with history**: does a similar past feature support this order of magnitude?
6. **Convert effort to elapsed time** using the number of people and their real availability.
7. **Write down assumptions and risks**, and present the range.
8. **Track actuals** against the estimate so the next estimate has real data.

## Common mistakes

- **Estimating execution only** and forgetting design, data, environments, retests and reporting.
- **Giving a single number** with no range or assumptions; it becomes a promise.
- **Assuming 100% availability.** Meetings, support work and leave reduce real capacity.
- **Using someone else's ratios.** Ratios only work with your own comparable history.
- **Cutting the estimate under pressure** without cutting scope or accepting risk explicitly.
- **Never comparing estimate to actual**, so estimates never improve.

## Troubleshooting

- **No historical data.** Use three-point or Wideband Delphi now, and start recording actuals for next time.
- **Huge gap between a and b.** The task is poorly understood; split it or run a short spike before committing.
- **Stakeholders want a lower number.** Show what each reduced budget covers by risk level and let them choose.

## Key takeaways summary

Good estimates come from a complete breakdown, honest ranges and written assumptions. Use three-point estimation and team techniques to handle uncertainty, convert effort to calendar time realistically, and re-estimate when the facts change.
