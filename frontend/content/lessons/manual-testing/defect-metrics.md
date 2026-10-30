---
slug: defect-metrics
title: "Defect Metrics: Leakage, Density, Aging and Escapes"
summary: Defect metrics such as density, leakage, removal efficiency, age and reopen rate show where quality risk sits and whether the process is improving. Learn the formulas, a worked example, and how to avoid misusing them.
level: intermediate
duration: 30
tags: [defect-management, metrics, test-management]
objectives:
  - Calculate defect density, defect leakage, defect removal efficiency, defect age and reopen rate
  - Explain that formulas and time windows vary by organisation and must be stated
  - Interpret defect metrics in context rather than as targets
  - Recognise how metrics can be gamed and how to prevent it
prerequisites:
  - Defect lifecycle
  - Basic percentages
related: [defect-lifecycle, root-cause-analysis, test-execution-and-closure-reports, defect-triage, release-sign-off]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.3.1, Metrics used in Testing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary (defect density, defect detection percentage)
    url: https://glossary.istqb.org/
  - title: Jira guides (reports and dashboards)
    url: https://www.atlassian.com/software/jira/guides
interview:
  - q: What is defect leakage and how do you calculate it?
    a: Defect leakage measures how many defects escaped a phase and were found later — most commonly, defects found after release compared with all defects found. A common formula is defects found after release divided by total defects found before and after release, times 100, over an agreed window such as the first 30 days in production. Some organisations divide by pre-release defects only, or measure leakage between test phases such as system test to UAT, so I always state the formula and window used.
  - q: What is defect density and what are its weaknesses?
    a: Defect density is the number of defects divided by a measure of size — lines of code, function points, story points or number of modules. It helps compare components and find hotspots. Its weaknesses are that size measures differ between languages and teams, a low density can mean poor testing rather than good code, and it ignores severity. I compare densities only within the same team and measurement method, and pair them with severity.
  - q: How can defect metrics be misused?
    a: When they become targets for individuals. Rewarding testers for defect counts encourages splitting and trivial reports; punishing developers for density encourages rejecting or reclassifying defects; targets on leakage can discourage logging production issues. Metrics should be used to ask questions about the process and to spot trends, always with context and never as personal performance ratings.
practice:
  - "A release had 240 defects found before release and 12 found in the first 30 days of production. Calculate leakage (both common definitions) and DRE."
  - "Calculate the average age of these open defects on 30 June: opened 1 June, 15 June, 20 June, 28 June."
  - "Design a one-page defect dashboard for a product owner. Choose four metrics and justify each."
takeaways:
  - "Defect density = defects ÷ size (KLOC, function points, story points or modules)."
  - "Defect leakage % = defects found after release ÷ total defects × 100, over a stated window."
  - "DRE % = defects found before release ÷ total defects × 100."
  - "Defect age = closed date (or today) − opened date; watch the oldest high-severity items."
  - Formulas vary by organisation; always state yours and never use metrics to rank individuals.
quiz:
  - id: defect-met-q1
    type: code-output
    topic: defect-metrics
    difficulty: intermediate
    prompt: Using leakage % = post-release defects ÷ (pre-release + post-release defects) × 100, what is the defect leakage?
    code: |
      Defects found before release: 190
      Defects found in first 30 days after release: 10
    codeLanguage: text
    options: ["5.0%", "5.3%", "10.0%", "95.0%"]
    answer: [0]
    explanation: "10 ÷ (190 + 10) × 100 = 10 ÷ 200 × 100 = 5.0%. 5.3% comes from dividing by pre-release defects only (10 ÷ 190), a different definition. 95.0% is the defect removal efficiency."
  - id: defect-met-q2
    type: single
    topic: defect-metrics
    difficulty: beginner
    prompt: A module of 8 KLOC has 24 defects. What is its defect density per KLOC?
    options: ["0.33", "3", "8", "24"]
    answer: [1]
    explanation: "Density = defects ÷ size = 24 ÷ 8 = 3 defects per KLOC. 0.33 inverts the formula."
  - id: defect-met-q3
    type: truefalse
    topic: defect-metrics
    difficulty: beginner
    prompt: A component with very low defect density must have high quality.
    options: ["True", "False"]
    answer: [1]
    explanation: "Low density can also mean the component was barely tested or defects were not logged. Metrics need context such as test coverage and production incident data."
  - id: defect-met-q4
    type: multiple
    topic: defect-metrics
    difficulty: intermediate
    prompt: Which practices make defect metrics more trustworthy? Select all that apply.
    options:
      - "Stating the formula and time window used"
      - "Breaking metrics down by severity"
      - "Using defect counts to rank individual testers"
      - "Looking at trends across releases rather than single values"
    answer: [0, 1, 3]
    explanation: "Stated formulas, severity breakdowns and trends give context. Ranking individuals by defect counts invites gaming, such as splitting reports, and damages collaboration."
---

## Beginner-friendly explanation

A restaurant owner wants to know how the kitchen is doing. Counting complaints alone is misleading: a busy night with 300 meals and 3 complaints is different from a quiet night with 30 meals and 3 complaints. So the owner looks at complaints **per meal served** (density), how many problems were caught by the head chef **before** plates left the kitchen versus by customers **after** (leakage), and how long complaints sat **unresolved** (age).

**Defect metrics** do the same for software. They turn a list of bugs into questions: where are problems concentrated, how many slip through to users, and are we fixing them in time?

## Technical explanation

ISTQB Foundation Level v4.0 lists defect metrics (such as number of defects found and fixed, defect density and defect detection percentage) among common test metrics. Exact formulas and windows **vary by organisation**; the definitions below are common ones. Always state which you use.

| Metric | Common formula | What it suggests |
|---|---|---|
| **Defect density** | defects ÷ size (KLOC, function points, story points, modules) | Hotspots; compare components measured the same way |
| **Defect leakage %** | defects found after release ÷ (defects before + after release) × 100 | How much escaped testing |
| **Defect leakage % (variant)** | defects found in later phase ÷ defects found in current phase × 100 | Used by some teams, for example system test → UAT |
| **Defect removal efficiency (DRE) %** | defects found before release ÷ total defects × 100 | Effectiveness of pre-release activities; ISTQB's related term is defect detection percentage |
| **Escaped defects** | count of defects found in production in a window | Raw number, best broken down by severity |
| **Defect age** | closed date (or today, if open) − opened date | Responsiveness; ageing backlog |
| **Reopen rate %** | reopened defects ÷ defects marked fixed × 100 | Fix quality and retest rigour |

**Time window matters.** Leakage measured after 7 days differs from leakage after 90 days. Pick a window and keep it consistent.

## Real-world example

A team releases version 6.0 of an inventory web app. The change set was about 42 KLOC (new and modified code, as counted by their tooling).

**Raw data**

| Item | Value |
|---|---|
| Defects found before release (all test phases) | 160 |
| Defects found in production, first 30 days | 8 (1 High, 4 Medium, 3 Low) |
| Defects marked Fixed during the release | 140 |
| Of those, reopened at least once | 7 |

**Calculations**

```text
Total defects            = 160 + 8 = 168
Defect density           = 168 ÷ 42 KLOC = 4.0 defects per KLOC
Defect leakage %         = 8 ÷ 168 × 100 ≈ 4.8%
Leakage (variant)        = 8 ÷ 160 × 100 = 5.0%
DRE %                    = 160 ÷ 168 × 100 ≈ 95.2%
Reopen rate %            = 7 ÷ 140 × 100 = 5.0%
```

**Density by module** shows where to look:

| Module | KLOC changed | Defects | Density |
|---|---|---|---|
| Stock adjustments | 6 | 54 | 9.0 |
| Purchase orders | 14 | 50 | 3.6 |
| Reports | 12 | 38 | 3.2 |
| User admin | 10 | 26 | 2.6 |

Stock adjustments has more than double the density of other modules, and 5 of the 8 escaped defects also came from it. That is a reason to investigate (see [root cause analysis](/learn/manual-testing/root-cause-analysis)), not a verdict on the developers.

**Defect age** for open defects on 30 June:

| Defect | Severity | Opened | Age (days) |
|---|---|---|---|
| DEF-2201 | High | 2 June | 28 |
| DEF-2240 | Medium | 14 June | 16 |
| DEF-2262 | Medium | 21 June | 9 |
| DEF-2280 | Low | 27 June | 3 |

Average age = (28 + 16 + 9 + 3) ÷ 4 = 14 days. The useful finding is not the average but the **28-day-old High defect**, which should go to triage immediately.

## Step-by-step walkthrough

1. **Decide the questions** you want answered (where are risks? are we improving?), then pick metrics.
2. **Define formulas, size measures and time windows** in the test strategy or plan.
3. **Make sure data is reliable**: consistent severity definitions, correct "found in phase" and "found in production" fields, linked duplicates.
4. **Calculate from tool data**, not hand counts.
5. **Break down by severity and component**.
6. **Show trends across releases** rather than single numbers.
7. **Discuss in retrospectives** and turn findings into actions.

## Common mistakes

- **Not stating the formula**, so two dashboards disagree and both are "right".
- **Comparing density across teams** with different languages or size measures.
- **Using metrics as individual targets**, which leads to split defects, reclassification and hidden production issues.
- **Ignoring severity**: eight cosmetic escapes are not the same as one data-loss escape.
- **Averages that hide outliers**, like the old High defect above.
- **Celebrating zero leakage after 3 days** when users have barely used the release.

## Troubleshooting

- **Production defects are not logged in the same tool.** Agree a "found in: production" field or link support tickets to defects.
- **Size measures are unavailable.** Use a simpler denominator (for example, modules or stories) and say so.
- **Numbers jump between releases.** Check for changes in definitions, tools or triage practice before drawing conclusions.

## Key takeaways summary

Density shows where defects concentrate, leakage and DRE show how much escapes, age shows how fast you respond, and reopen rate shows fix quality. State formulas and windows, break down by severity, follow trends, and use metrics to improve the process, never to rank people.
