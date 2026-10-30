---
slug: qa-metrics-and-reporting
title: QA Metrics and Reporting
summary: Choose metrics that reveal real quality and delivery health - the DORA software delivery metrics, escaped defects, flaky-test rate and coverage used with care - and report them so they drive decisions instead of becoming vanity numbers.
level: advanced
duration: 35
tags: [metrics, reporting, dora, quality-engineering]
objectives:
  - Describe the four DORA software delivery metrics accurately
  - Calculate escaped-defect rate and flaky-test rate from raw data
  - Explain the limits of code coverage and other easily gamed numbers
  - Build a quality report that pairs metrics with context and decisions
prerequisites:
  - Defect lifecycle and severity concepts
  - CI/CD basics
related: [defect-metrics, test-execution-and-closure-reports, flaky-test-reduction, release-readiness, ci-cd-for-test-engineers, test-management-and-leadership]
references:
  - title: DORA research program and metrics guide
    url: https://dora.dev/
  - title: ISTQB Certified Tester Foundation Level (test monitoring, control and reporting)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Martin Fowler, TestCoverage
    url: https://martinfowler.com/bliki/TestCoverage.html
interview:
  - q: What are the DORA metrics and why would a QA lead care about them?
    a: DORA's research uses four software delivery metrics. Two measure throughput - deployment frequency and change lead time, the time from a change being committed to it running in production. Two measure stability - change failure rate, the share of deployments that cause a failure needing remediation, and the time to recover from a failed deployment, which older material calls time to restore service or MTTR. A QA lead cares because testing practices directly affect both sides, slow or flaky suites stretch lead time, and weak gates raise change failure rate. They also show that speed and stability are not a trade-off to be negotiated by testing alone.
  - q: Is high code coverage a good quality metric?
    a: Coverage is a useful diagnostic, not a target. Low coverage tells you some code is never executed by tests, which is worth knowing. High coverage does not tell you the assertions are meaningful - a test can execute every line and check nothing. When coverage becomes a goal, teams write tests to hit the number. I use it to find untested risky areas, alongside mutation testing results or escaped-defect analysis to judge test effectiveness.
  - q: "System design: design a quality dashboard for engineering leadership."
    a: I would start from the decisions leaders need to make - can we release, where should we invest, is quality improving. The dashboard would show trends, not snapshots - DORA delivery metrics from the deployment pipeline, escaped defects by severity and by the area they came from, flaky-test rate and quarantine size from the central results store, and pipeline duration. Each metric has a definition, a data source and an owner. I would avoid test-case counts and pass percentages as headline numbers, and pair the dashboard with a short written narrative each period explaining what changed and what we are doing about it.
practice:
  - "Collect the last 30 days of CI results for one suite and calculate the flaky-test rate using the definition in this lesson."
  - "Classify last quarter's production defects by the test level that could have caught them. What does the pattern suggest?"
  - "Replace one vanity metric in your team's report with a decision-oriented metric and write one sentence explaining why."
takeaways:
  - DORA's four metrics are deployment frequency, change lead time, change failure rate and failed deployment recovery time.
  - Escaped defects measure what testing missed; analyse them by severity and origin, not just count.
  - Flaky rate measures how trustworthy the test signal is.
  - Coverage shows what is not tested, not how well the rest is tested.
  - Every metric needs a definition, a source, an owner and a decision it informs.
quiz:
  - id: sdet-metrics-q1
    type: multiple
    topic: qa-metrics-and-reporting
    difficulty: intermediate
    prompt: Which of these are among DORA's four software delivery metrics? Select all that apply.
    options:
      - "Deployment frequency"
      - "Change failure rate"
      - "Number of test cases executed"
      - "Change lead time"
      - "Code coverage percentage"
    answer: [0, 1, 3]
    explanation: The four metrics are deployment frequency, change lead time, change failure rate and the time to recover from a failed deployment. Test-case counts and coverage are not DORA metrics.
  - id: sdet-metrics-q2
    type: code-output
    topic: qa-metrics-and-reporting
    difficulty: intermediate
    prompt: What does this script print?
    code: |
      found_before_release = 45
      found_in_production = 5
      rate = found_in_production / (found_before_release + found_in_production)
      print(f"Escaped defect rate: {rate:.0%}")
    codeLanguage: python
    options: ["Escaped defect rate: 5%", "Escaped defect rate: 10%", "Escaped defect rate: 11%", "Escaped defect rate: 0.1"]
    answer: [1]
    explanation: 5 out of a total of 50 defects is 0.10, and the :.0% format prints it as 10%. Dividing 5 by 45 instead would give about 11 percent, the tempting wrong answer.
  - id: sdet-metrics-q3
    type: truefalse
    topic: qa-metrics-and-reporting
    difficulty: beginner
    prompt: A suite with 100 percent line coverage is guaranteed to detect every defect in the covered code.
    options: ["True", "False"]
    answer: [1]
    explanation: Coverage shows that code was executed, not that the tests asserted the right outcomes. Tests with weak or missing assertions can reach full coverage and still miss defects.
  - id: sdet-metrics-q4
    type: scenario
    topic: qa-metrics-and-reporting
    difficulty: advanced
    prompt: Management sets a target that each tester must log at least 20 defects per sprint. What is the most likely effect?
    options:
      - "Product quality improves because more defects are found"
      - "Testers start logging duplicates and trivial issues, and collaboration with developers suffers"
      - "Developers write fewer defects"
      - "Nothing changes"
    answer: [1]
    explanation: Turning a measure into a personal target invites gaming (Goodhart's law). Defect counts depend on product quality and many other factors, so a quota rewards noise and harms trust.
---

## Beginner-friendly explanation

A car dashboard shows speed, fuel and engine temperature because those numbers help the driver make decisions: slow down, refuel, stop. A dashboard showing "number of times the steering wheel was turned" would be easy to measure and completely useless.

**QA metrics** work the same way. Good ones help a team decide something: can we release, what should we fix first, is our testing getting better? Bad ones, often called **vanity metrics**, look impressive in a slide but do not change any decision, and some actively encourage the wrong behaviour.

## Technical explanation

### DORA software delivery metrics

The DORA research programme (see dora.dev) studies software delivery performance. It uses four core metrics:

| Metric | Measures | Category |
|---|---|---|
| **Deployment frequency** | How often changes are deployed to production | Throughput |
| **Change lead time** | Time from a change being committed to running in production | Throughput |
| **Change failure rate** | Share of deployments that cause a failure needing remediation (rollback, hotfix) | Stability |
| **Failed deployment recovery time** | Time to recover from a failed deployment (earlier material calls this time to restore service) | Stability |

DORA's definitions and names have evolved across its annual reports, and newer reports discuss additional measures, so check dora.dev for the current wording before quoting them. Testing influences all four: slow suites stretch lead time, weak gates raise change failure rate, and good post-deploy checks speed up recovery.

### Testing-specific metrics

| Metric | Definition | Why it matters |
|---|---|---|
| **Escaped-defect rate** | Defects found in production divided by all defects found in the period | What testing missed; analyse by severity and origin |
| **Flaky-test rate** | Tests with both pass and fail outcomes on the same code, divided by tests run | Trust in the pipeline signal |
| **Pipeline duration** | Time from commit to test results, per stage | Feedback speed |
| **Defect age / time to fix** | Time from report to resolution, by severity | Flow and prioritisation |
| **Coverage** | Share of code (or requirements) exercised by tests | Finds untested areas; not a measure of test quality |

### Coverage caveats

Code coverage tells you which lines or branches ran during tests. It cannot tell you whether the tests checked anything. Use it to find untested risky code, not as a target. Mutation testing, which deliberately changes code to see if tests fail, is a stronger signal of test effectiveness, at a higher compute cost.

### Avoiding vanity metrics

Once a measure becomes a target, people optimise the number rather than the goal (often summarised as Goodhart's law). Warning signs: test-case counts, defects logged per tester, "percentage of tests automated" with no reference to risk, and pass rates without context. Prefer **trends over snapshots**, **ratios over raw counts**, and **paired metrics** that balance each other, such as deployment frequency alongside change failure rate.

## Real-world example

A QA group reported "number of automated tests" every month, and the number rose steadily. Meanwhile production incidents were not falling and the nightly pipeline was red most mornings. A new lead replaced the headline with three numbers: escaped defects by severity and the component they came from, flaky-test rate from the central results store, and pipeline duration. The first month's report showed that most escaped defects came from one integration area with almost no API-level tests, and that a small number of flaky UI tests caused most red builds. Investment moved to those two areas, and the report gave leadership something to decide on rather than something to applaud.

## Step-by-step walkthrough

1. **Start from decisions**: release readiness, investment, process change.
2. **Pick a small set of metrics** that inform those decisions.
3. **Write a definition** for each: formula, data source, time window, owner.
4. **Automate collection** from CI, the defect tracker and deployment tooling.
5. **Show trends** over several periods, not single values.
6. **Add narrative**: what changed, why, and what you will do.
7. **Review the metric set** periodically and drop anything that no longer drives action.

## Code examples

Calculating flaky-test rate from stored results. A test is flaky in the window if it both passed and failed on the same commit:

```python
from collections import defaultdict

# (test_id, commit, outcome) rows exported from a results store
results = [
    ("checkout_total", "a1", "pass"), ("checkout_total", "a1", "fail"),
    ("login_ok",       "a1", "pass"), ("login_ok",       "a1", "pass"),
    ("search_filter",  "a1", "fail"), ("search_filter",  "a1", "fail"),
    ("profile_save",   "a1", "pass"),
]

outcomes = defaultdict(set)
for test_id, commit, outcome in results:
    outcomes[(test_id, commit)].add(outcome)

tests = {t for t, _ in outcomes}
flaky = {t for (t, _), seen in outcomes.items() if seen == {"pass", "fail"}}

print(f"Tests: {len(tests)}, flaky: {sorted(flaky)}")
print(f"Flaky rate: {len(flaky) / len(tests):.0%}")
```

## Expected output

```text
Tests: 4, flaky: ['checkout_total']
Flaky rate: 25%
```

`search_filter` failed twice on the same commit, so it is consistently failing, not flaky: that is a real defect or a broken test, and it needs a different response.

## Common mistakes

- **Quoting DORA metrics loosely**, for example calling lead time "time from ticket creation". DORA measures from commit to production.
- **Using coverage as a target.**
- **Reporting raw counts** (tests, defects) without normalising or context.
- **Individual performance metrics** for testers, such as defects logged, which damage collaboration.
- **Mixing flaky and consistently failing tests** into one "failure" number.
- **Dashboards with no owner or action.**

## Troubleshooting

- **Leaders still ask for test counts.** Show the count once next to a decision-oriented metric and explain what each tells them.
- **Data is spread across tools.** Start with one exported data set and automate later.
- **Metrics look worse after improvement work.** Better detection often raises numbers at first; explain the change in the narrative.

## Key takeaways summary

Measure to decide, not to impress. Know the DORA metrics precisely, track escaped defects and flaky rate for testing effectiveness and trust, use coverage as a flashlight rather than a scoreboard, and always pair numbers with definitions, trends and a narrative.
