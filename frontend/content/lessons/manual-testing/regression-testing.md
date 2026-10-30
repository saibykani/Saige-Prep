---
slug: regression-testing
title: Regression Testing
summary: Regression testing confirms that a change has not broken something that used to work. Learn how it differs from confirmation testing, how to select and prioritise a regression suite, and why it is a prime candidate for automation.
level: beginner
duration: 35
tags: [test-types, regression-testing, change-related-testing, istqb, maintenance]
objectives:
  - Define regression testing and distinguish it from confirmation testing
  - Use impact analysis to decide what to include in a regression run
  - Compare retest-all, selective and prioritised regression strategies
  - Explain why regression suites need ongoing maintenance and are strong automation candidates
prerequisites:
  - Test scenarios and test cases
  - Retesting and confirmation testing (helpful but not required)
related: [retesting-and-confirmation-testing, smoke-and-sanity-testing, risk-based-testing, traceability-matrix-and-coverage, ci-cd-for-test-engineers, flaky-test-reduction]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 2.2.3, Confirmation testing and regression testing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: GitHub Actions documentation (running regression suites in CI)
    url: https://docs.github.com/en/actions
  - title: Jenkins user documentation
    url: https://www.jenkins.io/doc/
interview:
  - q: What is regression testing?
    a: Regression testing confirms that no adverse consequences have been caused by a change, including a fix that has already been confirmation tested. A change in one place can break behaviour elsewhere in the same component, in other components, or even in connected systems. Regression testing looks for those unintended side effects, which ISTQB calls regressions.
  - q: How do you decide what to include in a regression run when time is short?
    a: I start with impact analysis, looking at what changed, what depends on it, and which areas share data, code or configuration. Then I prioritise by risk, combining the likelihood that the change affected an area with the business impact if it did. Critical business flows and areas near the change come first, then frequently used features, then historically defect-prone areas. I report clearly which parts were not regression tested so the release decision is informed.
  - q: Why is regression testing a good candidate for automation?
    a: Regression suites run repeatedly, often on every build, and mostly contain stable, known checks with clear expected results. Automating them gives fast, consistent feedback in CI and frees testers for exploratory work on the new change. The suite still needs maintenance, removing obsolete tests and fixing flaky ones, or its results stop being trusted.
practice:
  - "A developer changes the tax calculation used by checkout, invoices and refunds. Perform an impact analysis and list the regression tests you would run first."
  - "Take a regression suite of 200 tests and propose criteria for tagging 30 of them as a fast 'critical path' set that runs on every commit."
  - "Explain to a product owner, in plain words, why fixing one bug can break another feature."
takeaways:
  - Regression testing checks that changes have not broken existing behaviour, anywhere it could reach.
  - Confirmation testing checks the fix itself; regression testing checks everything around it.
  - Use impact analysis and risk to select and order regression tests when time is limited.
  - Regression suites grow; review them regularly to remove obsolete and duplicate tests.
  - Stable, repeated regression checks are strong candidates for automation in CI.
quiz:
  - id: regr-q1
    type: single
    topic: regression-testing
    difficulty: beginner
    prompt: What is the main purpose of regression testing?
    options: ["To confirm that a reported defect has been fixed", "To confirm that a change has not caused adverse effects in unchanged areas", "To find defects in brand-new features", "To decide whether users accept the system"]
    answer: [1]
    explanation: Regression testing looks for unintended side effects of a change. Confirming that the reported defect itself is fixed is confirmation testing, which is the tempting wrong answer.
  - id: regr-q2
    type: scenario
    topic: regression-testing
    difficulty: intermediate
    prompt: A fix to the date-formatting utility is deployed. Only one hour of testing is available before release. Which regression approach is most appropriate?
    options: ["Run the full regression suite, however long it takes", "Skip regression and only confirm the fix", "Use impact analysis to find features using the utility and run their highest-risk tests first", "Run tests in alphabetical order until time runs out"]
    answer: [2]
    explanation: A shared utility can affect many features, so impact analysis plus risk-based prioritisation gives the best coverage for the time available. Skipping regression ignores side effects, and the full suite does not fit the time box.
  - id: regr-q3
    type: truefalse
    topic: regression-testing
    difficulty: beginner
    prompt: Regression testing may be needed after changes to the environment, such as an operating system or database upgrade, even when the application code has not changed.
    options: ["True", "False"]
    answer: [0]
    explanation: Changes to the environment, configuration or connected systems can break existing behaviour just as code changes can. ISTQB includes them in the triggers for maintenance and regression testing.
  - id: regr-q4
    type: multiple
    topic: regression-testing
    difficulty: intermediate
    prompt: Which practices keep a regression suite effective over time? Select all that apply.
    options: ["Removing tests for features that no longer exist", "Adding a test for each significant defect fixed", "Never changing a test once written", "Quarantining and fixing flaky tests", "Tagging tests by priority so subsets can run quickly"]
    answer: [0, 1, 3, 4]
    explanation: Suites need curation, which means removing obsolete tests, adding tests for escaped defects, fixing flakiness and tagging for selective runs. Freezing tests forever makes them drift away from the product and lose value.
---

## Beginner-friendly explanation

Imagine a plumber fixes a leak under your kitchen sink. You check the sink: no more drip. Good. But the next morning, the shower upstairs has no hot water, because the plumber closed a valve while working and forgot to reopen it.

Checking the sink is **confirmation testing**: did the fix work? Checking the shower, the washing machine and the other taps is **regression testing**: did the fix, or any other change, **break something that used to work**?

In software, parts are connected in ways that are not always obvious. A change to how dates are formatted might affect invoices, reports and emails. Regression testing is how we catch those surprises before customers do.

## Technical explanation

ISTQB CTFL v4.0 groups confirmation testing and regression testing as **change-related testing**:

- **Confirmation testing** confirms that an original defect has been successfully fixed.
- **Regression testing** confirms that no adverse consequences have been caused by a change, including a fix that has already been confirmation tested.

A **regression** is a degradation in previously working behaviour caused by a change. Changes include new features, defect fixes, refactoring, configuration changes, library upgrades and changes to the environment such as a new operating system or database version. The adverse effects can appear in the same component, other components of the same system, or other connected systems.

```mermaid
flowchart LR
  CH["Change: fix, feature, upgrade, config"] --> CT["Confirmation test: is the fix right?"]
  CH --> IA["Impact analysis: what could be affected?"]
  IA --> RS["Select and prioritise regression tests"]
  RS --> RUN["Run regression tests"]
  CT --> RUN
  RUN --> RES{"All pass?"}
  RES -->|Yes| OK["Report and release decision"]
  RES -->|No| DEF["Raise regression defect"]
```

### Selecting regression tests

| Strategy | What runs | When it fits |
|---|---|---|
| Retest all | The full regression suite | Major releases, platform upgrades, when time allows |
| Selective (impact-based) | Tests covering changed areas and their dependents | Targeted fixes with clear impact |
| Prioritised (risk-based) | Tests ordered by risk so the most important run first | Time-boxed releases |
| Hybrid | A fast critical set on every build, wider sets nightly or per release | Most CI/CD pipelines |

**Impact analysis** identifies what a change can affect: code that calls the changed component, shared data, shared configuration, and interfaces with other systems. A [traceability matrix](/learn/manual-testing/traceability-matrix-and-coverage) makes this faster because it links requirements, code areas and tests.

### Regression and automation

Regression suites are run many times, so ISTQB notes they are strong candidates for automation, and that automated regression suites should run frequently, ideally in continuous integration. Suites also **grow** with every release, so they need regular review to remain fast, relevant and trustworthy.

## Real-world example

A subscription business changed how its billing service rounded currency, to fix a one-cent discrepancy on invoices. Confirmation testing showed invoices were now correct. The regression run, chosen by impact analysis, included refunds and proration because they used the same rounding function.

A proration test failed: customers downgrading mid-month were now refunded one cent more than they had paid in some cases. Because the regression set was chosen by tracing who used the changed function, rather than only re-checking invoices, the side effect was found before release instead of in a finance reconciliation weeks later.

## Step-by-step walkthrough

1. **Understand the change.** Read the ticket, commit description and, if possible, the diff with a developer.
2. **Perform impact analysis.** List components, features, data and interfaces that use what changed.
3. **Select tests** covering those areas, plus a fixed critical-path set that always runs.
4. **Prioritise by risk** so the most important tests run first if time runs out.
5. **Run confirmation tests first**: there is little point regression testing a fix that does not work.
6. **Run the regression set** and investigate every failure. Is it a regression, an intended behaviour change, or a broken test?
7. **Report** what ran, what failed and, explicitly, what was not covered.
8. **Update the suite**: add a test for the escaped defect, retire obsolete tests.

## Code examples

Tagging tests lets a pipeline run different regression subsets. A TestNG example:

```java
public class CheckoutRegressionTest {

    @Test(groups = {"regression", "critical"})
    public void guestCanPayByCard() { /* ... */ }

    @Test(groups = {"regression"})
    public void savedAddressIsPrefilled() { /* ... */ }
}
```

```bash
# Every commit: only the critical regression subset
mvn test -Dgroups=critical
# Nightly: the full regression group
mvn test -Dgroups=regression
```

## Expected output

On a commit build, only tests in the `critical` group run, so the report shows a small, fast set; the nightly build runs both groups and shows the larger total.

## Common mistakes

- **Confusing confirmation and regression testing.** Re-running the failed test proves the fix, not the absence of side effects.
- **Running the same fixed list forever** without considering what actually changed.
- **Letting the suite rot.** Obsolete, duplicate and flaky tests waste time and erode trust in results.
- **Ignoring environment changes.** Library, browser, OS and database upgrades also need regression testing.
- **Hiding gaps.** If part of the suite was skipped, say so in the report.

## Troubleshooting

- **The full suite takes too long.** Split it into tiers, parallelise, and move checks down to API or component level where possible.
- **Failures are often "test problems".** Track flaky tests separately and fix or quarantine them; see [flaky test reduction](/learn/automation/flaky-test-reduction).
- **You cannot tell what a change touches.** Ask developers for an impact note on each pull request and keep traceability up to date.

## Key takeaways summary

Every change carries a risk of breaking something that used to work. Confirm the fix, analyse the impact, run the highest-risk regression tests first, report coverage honestly, and keep the suite lean enough that it can run as often as the product changes.
