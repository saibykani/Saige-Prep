---
slug: test-suites-and-test-data
title: Test Suites and Test Data
summary: Group test cases into suites that match how you actually run them (smoke, feature, regression), and prepare test data that is valid, varied, private and reusable.
level: beginner
duration: 30
tags: [test-documentation, test-data, test-management]
objectives:
  - Organise test cases into purposeful suites such as smoke, feature and regression
  - Identify the categories of test data a feature needs
  - Choose between production-derived, masked and synthetic data
  - Document test data so tests are reproducible
prerequisites:
  - Test scenarios and test cases
related: [test-scenarios-and-test-cases, test-data-design, regression-testing, smoke-and-sanity-testing, traceability-matrix-and-coverage]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: Jira guides (organising work and test artefacts)
    url: https://www.atlassian.com/software/jira/guides
interview:
  - q: How do you organise a large set of manual test cases?
    a: By purpose and by how they are run. I keep a small smoke suite that checks the build is testable, feature suites grouped by functional area, and a regression suite built from risk — critical flows plus areas with a history of defects. Cases are tagged with component, priority and requirement so I can assemble a suite for a specific release, rather than duplicating cases in several folders.
  - q: Why should production data not be copied directly into a test environment?
    a: It usually contains personal and sensitive data, so copying it can breach privacy law and company policy, and test environments rarely have production-grade security. If production-like data is needed, it should be masked or anonymised under an approved process, or replaced by synthetic data that has the same shape and edge cases.
  - q: What types of test data do you prepare for a feature?
    a: Valid data for the happy path, invalid data for each validation rule, boundary values, special and edge cases such as empty, very long, Unicode or special characters, data in each relevant state (for example active, locked, closed accounts), and volume data when performance or pagination matters. I also note which data is consumed by a test and must be recreated.
practice:
  - "Design a smoke suite of no more than 8 test cases for an online food-ordering app. Justify each one."
  - "List the test accounts you would need to test a role-based admin panel with Admin, Editor and Viewer roles, including their states."
  - "Write a test data sheet for a registration form covering valid, invalid, boundary and special-character inputs."
takeaways:
  - Suites should reflect purpose and run cadence, not just folder structure.
  - Tag cases (component, priority, requirement) so suites can be assembled without duplication.
  - Test data needs valid, invalid, boundary, state-based and special-character variants.
  - Never use unmasked personal production data in test environments.
  - Document data and its reset procedure so tests are reproducible.
quiz:
  - id: suite-data-q1
    type: single
    topic: test-suites-and-test-data
    difficulty: beginner
    prompt: What is the main purpose of a smoke suite?
    options:
      - "To test every feature in depth"
      - "To confirm the build is stable enough for further testing"
      - "To measure performance under load"
      - "To retest fixed defects only"
    answer: [1]
    explanation: "A smoke suite is a short, broad check of critical functions that decides whether deeper testing is worthwhile. In-depth and performance testing belong to other suites; retesting targets specific fixes."
  - id: suite-data-q2
    type: scenario
    topic: test-suites-and-test-data
    difficulty: intermediate
    prompt: "Your team needs realistic customer records to test a new reporting feature. A developer offers a full copy of the production database. What is the best response?"
    options:
      - "Accept it; realistic data finds more defects"
      - "Use it but delete it after testing"
      - "Use masked or synthetic data produced through an approved process instead"
      - "Test the reports directly in production"
    answer: [2]
    explanation: "Raw production data contains personal information and copying it into a less secure environment can breach privacy obligations. Masked or synthetic data gives realism without the exposure. Deleting afterwards does not undo the exposure, and testing in production adds risk."
  - id: suite-data-q3
    type: multiple
    topic: test-suites-and-test-data
    difficulty: beginner
    prompt: Which are useful test data variants for a 'Full name' field? Select all that apply.
    options:
      - "A name with an apostrophe, such as O'Neill"
      - "A name with accented or non-Latin characters"
      - "An empty value"
      - "A value at the maximum allowed length"
      - "Only the name 'Test User'"
    answer: [0, 1, 2, 3]
    explanation: "Apostrophes, Unicode, empty and maximum-length values each exercise different handling paths. Using one generic name for everything misses those paths."
---

## Beginner-friendly explanation

Think of a music app. You do not play every song you own every time; you make **playlists** for a purpose: a short warm-up playlist, a long road-trip one, a favourites list. **Test suites** are playlists of test cases: a short smoke list to check the build is alive, a feature list for the area that changed, a regression list for "make sure we didn't break anything".

**Test data** is the ingredients. A recipe (test case) is useless if the fridge is empty or full of the wrong things. You need the right customers, products, accounts and values ready before you start, and you need to be able to get them back to the same state next time.

## Technical explanation

A **test suite** is a set of test cases or procedures grouped for execution. Common suites:

| Suite | Purpose | Size and cadence |
|---|---|---|
| Smoke | Is the build testable at all? | Small; every new build |
| Sanity | Does the changed area basically work? | Small, focused; after a fix or small change |
| Feature / functional | Thorough checks of one area | Medium; when the area changes |
| Regression | Did changes break existing behaviour? | Large; per release, ideally mostly automated |
| End-to-end business flows | Critical journeys across systems | Medium; per release |

Organise cases once and **tag** them (component, priority, risk, requirement ID, suite membership). Most test management tools let you build a run from a filter, which avoids copying the same case into five folders.

**Test data** is the data that exists before a test runs or is input during it. Categories:

- **Valid** data for main flows
- **Invalid** data for each validation rule
- **Boundary** values (see [boundary value analysis](/learn/manual-testing/boundary-value-analysis))
- **State-based** data: records in each lifecycle state (active, suspended, closed)
- **Special** data: empty, whitespace, very long, Unicode, emoji, special characters
- **Volume** data for pagination, search and performance checks

**Sources of data**:

| Source | Strength | Risk |
|---|---|---|
| Manually created | Exactly what you need | Slow; inconsistent between testers |
| Synthetic (scripts or generators) | Repeatable, safe, scalable | May miss real-world oddities |
| Masked production copy | Realistic shapes and volumes | Masking can be incomplete; needs governance |
| Raw production copy | Realistic | Privacy and security breach risk; usually not acceptable |

## Real-world example

A team testing a subscription-billing web app documents its regression suite and data like this:

```text
SUITE: Billing regression (Release 7.3)       Tags: billing, priority-high
  Smoke  (6 cases)   login, view plan, add card, pay invoice, download PDF, logout
  Plans  (14 cases)  upgrade, downgrade, proration, trial expiry, cancel, reactivate
  Cards  (9 cases)   valid card, declined card, expired card, 3-D Secure challenge
  Invoices (11 cases) tax rounding, currency display, credit notes, PDF content
Run order: Smoke first; stop the run if any smoke case fails.
```

The shared **test data sheet** for that suite:

| Data ID | Account | State | Plan | Notes | Reset method |
|---|---|---|---|---|---|
| TD-01 | billing_active_monthly | Active | Pro monthly | Card ending 4242 (sandbox) | Restore snapshot `billing-base` |
| TD-02 | billing_trial_day13 | Trial, 1 day left | Pro trial | For trial-expiry tests | Re-run seed script daily |
| TD-03 | billing_past_due | Past due | Basic | Invoice unpaid 15 days | Restore snapshot |
| TD-04 | billing_cancelled | Cancelled | None | Reactivation tests | Restore snapshot |
| TD-05 | billing_eur_customer | Active | Pro annual | Currency EUR, VAT number set | Restore snapshot |

Card numbers are payment-provider **sandbox test cards**, never real cards. Customer names and emails were generated, not copied from production.

## Step-by-step walkthrough

1. **List the run occasions** (every build, every fix, every release) and create one suite per occasion.
2. **Tag every case** with component, priority and requirement IDs.
3. **Select regression cases by risk**: critical business flows, frequently changed areas, defect-prone areas.
4. **For each case, list its data needs** and whether it consumes data (for example, a one-time coupon).
5. **Build a shared data sheet** with IDs, state and reset method.
6. **Automate data setup** where possible (seed scripts, database snapshots, API calls).
7. **Review suites each release**: retire obsolete cases and add cases for escaped defects.

## Common mistakes

- **Regression suites that only grow.** Without pruning they become too slow to run and are skipped.
- **Shared accounts that testers change** mid-run, causing false failures for others.
- **Using production personal data** in test environments.
- **Undocumented data**, so nobody can reproduce a failure a week later.
- **Only "happy" data.** Names with apostrophes, long addresses and non-Latin scripts expose real defects.
- **Duplicating cases** into several suites, so fixing one copy leaves the others wrong.

## Troubleshooting

- **Tests fail randomly in a shared environment.** Give each tester or run its own data set, or reset data before each run.
- **The needed state is hard to reach manually** (for example, "trial expires tomorrow"). Ask for a seed script, an admin tool or a controllable clock in test environments.
- **Masked data breaks tests** (for example, masked emails fail validation). Agree masking rules that keep formats valid.

## Key takeaways summary

Suites organise cases by purpose and cadence; tags let you assemble them without duplication. Good test data covers valid, invalid, boundary, state and special cases, is private by design, and can be reset so every run starts from a known state.
