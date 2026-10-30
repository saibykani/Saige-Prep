---
slug: capacity-planning-and-baselines
title: Capacity Planning, Baselines and Thresholds
summary: Establish a performance baseline, define pass/fail thresholds from SLOs, catch regressions between builds, and estimate how much load the system can take and when it will need more capacity - with worked headroom calculations.
level: advanced
duration: 40
tags: [performance, capacity-planning, baselines, slo]
objectives:
  - Create a repeatable performance baseline and compare runs against it
  - Define measurable thresholds from SLAs and SLOs
  - Estimate capacity and headroom from load test results
  - Plan for growth and peaks using simple, documented assumptions
prerequisites:
  - Analysing results and root cause
  - Little's Law and concurrency
  - Workload modelling, think time and pacing
related: [analyzing-performance-results, littles-law, workload-modeling, resource-utilization-and-bottlenecks, performance-testing-types, throughput-latency-and-percentiles]
references:
  - title: Google SRE books (service level objectives, capacity planning)
    url: https://sre.google/books/
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: The USE Method (Brendan Gregg)
    url: https://www.brendangregg.com/usemethod.html
interview:
  - q: What is a performance baseline and why do you need one?
    a: A baseline is a recorded set of results - percentiles, throughput, errors and resource use - from a known build, environment and workload, run under controlled conditions. It is the reference you compare later runs against. Without it you cannot say whether a new build is faster or slower, or whether a tuning change helped. It must be repeatable, so I run it more than once to understand normal variation.
  - q: How do you turn an SLO into a load-test threshold?
    a: I make it measurable and specific - per transaction, a percentile, a load level and an error rate. For example, "at 200 checkouts per second for 30 minutes, p95 for Place order is at most 800 ms and errors are under 0.5%". In JMeter or CI I implement it as assertions or a post-run check on the results, and the build fails if it is exceeded.
  - q: How would you estimate how much more traffic a system can handle?
    a: I run a stepped load test to find the knee - the load where throughput plateaus or the SLO is breached - and identify the bottleneck resource. Capacity is the highest load that still meets the SLO, not the crash point. Headroom is capacity divided by current peak, minus one. I then apply growth assumptions and a safety margin to estimate when the headroom runs out, and document every assumption.
practice:
  - "Your current peak is 120 orders per second. The system meets its SLO up to 300 per second. Traffic grows 5% a month. When does peak reach 80% of capacity?"
  - "Write three measurable thresholds for a login, search and checkout flow."
  - "Run the same small test three times in your lab and calculate the variation in p95. What change would you treat as a real regression?"
takeaways:
  - A baseline is a controlled, repeatable reference run - document everything about it.
  - Thresholds are measurable - transaction, percentile, load level, duration, error rate.
  - Capacity is the highest load that still meets the SLO, not the breaking point.
  - Headroom and growth estimates rest on assumptions; write them down.
  - Compare runs only when the build is the only thing that changed.
quiz:
  - id: perfcap-q1
    type: single
    topic: capacity-planning-and-baselines
    difficulty: intermediate
    prompt: A system meets its p95 SLO up to 400 requests per second and starts returning errors at 650. What is its capacity for planning purposes?
    options: ["650 requests per second", "400 requests per second", "525 requests per second (the midpoint)", "Unknown without a spike test"]
    answer: [1]
    explanation: Capacity is the highest load that still meets the service objective. Beyond 400 the user experience is already unacceptable, even though the system has not yet failed.
  - id: perfcap-q2
    type: scenario
    topic: capacity-planning-and-baselines
    difficulty: advanced
    prompt: Current peak is 200 req/s, capacity at SLO is 500 req/s, and the team wants to stay below 70% of capacity. Traffic is expected to double next year. What should you report?
    options: ["No action; 400 is below 500", "Next year's peak of 400 req/s is 80% of capacity, above the 70% target, so capacity or efficiency must increase", "Capacity is fine because the system fails only at higher load", "Run a smoke test"]
    answer: [1]
    explanation: 70% of 500 is 350 req/s. A doubled peak of 400 exceeds that safety threshold, so the plan must add capacity or improve efficiency before then.
  - id: perfcap-q3
    type: multiple
    topic: capacity-planning-and-baselines
    difficulty: intermediate
    prompt: Which details must be recorded with a baseline so later comparisons are valid? Select all that apply.
    options: ["Build/version", "Environment size and configuration", "Workload model and test data", "Test duration and ramp-up", "The tester's favourite IDE"]
    answer: [0, 1, 2, 3]
    explanation: Any of the first four changing can alter results. Recording them lets you ensure the build is the only variable. The IDE is irrelevant.
  - id: perfcap-q4
    type: truefalse
    topic: capacity-planning-and-baselines
    difficulty: beginner
    prompt: A threshold such as "the system should be fast" is suitable as a pass/fail criterion for a load test.
    options: ["True", "False"]
    answer: [1]
    explanation: Thresholds must be measurable - which transaction, which percentile, what value, at what load and for how long. Vague criteria can't be automated or agreed upon.
---

## Beginner-friendly explanation

Imagine a stadium. Before a big match, the organisers need to know three things. **How many people fit comfortably?** That's capacity — and "comfortably" matters: the stands might physically hold more, but then the exits jam. **How many come to a normal match?** That's the baseline. **What crowd size triggers extra stewards and gates?** Those are thresholds. And if attendance grows 10% every season, they need to know **when** to build more seats.

Software works the same way. A **baseline** tells you how the system normally performs. **Thresholds** turn goals into pass/fail checks. **Capacity planning** tells you how much load the system can take while still meeting its goals, and when you'll need more.

## Technical explanation

### SLA, SLO, SLI

| Term | Meaning | Example |
|---|---|---|
| SLI (indicator) | A measured quantity | p95 latency of Place order |
| SLO (objective) | Internal target for an SLI | p95 ≤ 800 ms over 30 days |
| SLA (agreement) | External contract, often with penalties | 99.9% monthly availability |

The Google SRE books describe SLIs and SLOs in depth. Load-test thresholds are derived from SLOs (or requirements when SLOs don't exist yet).

### Thresholds

A good threshold names: **transaction, metric and percentile, limit, load level, duration, error budget.**

> At 200 checkouts/s for 30 minutes of steady state, Place order p95 ≤ 800 ms, p99 ≤ 1,500 ms, error rate < 0.5%.

In JMeter, thresholds can be checked with assertions (for example a Duration Assertion for individual samples) and, more usefully for percentiles, by a post-run check on the results in CI (see [JMeter in CI/CD](/learn/jmeter/jmeter-ci-cd)).

### Baselines

A baseline is a **controlled reference run**: fixed build, environment, workload, data and duration. Run it several times to learn normal **variation** — if p95 varies ±8% between identical runs, a 5% change is not a regression. Compare future runs against it only when one thing has changed.

### Capacity and headroom

From a stepped load test ([performance testing types](/learn/performance/performance-testing-types)):

- **Capacity** = highest load that still meets the SLO (not the crash point).
- **Utilization of capacity** = current peak ÷ capacity.
- **Headroom** = capacity ÷ current peak − 1.

**Worked example.** Capacity at SLO = 500 req/s. Current peak = 200 req/s.

| Quantity | Calculation | Result |
|---|---|---|
| Utilization at peak | 200 ÷ 500 | 40% |
| Headroom | 500 ÷ 200 − 1 | 150% more traffic |
| Safe limit at 70% target | 0.7 × 500 | 350 req/s |
| Peak after 10% monthly growth for 6 months | 200 × 1.1⁶ | ≈ 354 req/s |

So at 10% monthly growth, peak crosses the 70% safety line in about six months. The assumptions (growth rate, peak shape, the 70% target) must be written next to the result.

Two cautions:

1. **Scaling is rarely linear.** Doubling servers doesn't double capacity if the database is the bottleneck. Find the bottleneck first ([resource utilization and bottlenecks](/learn/performance/resource-utilization-and-bottlenecks)).
2. **Test environments are often smaller than production.** Extrapolating is risky; state the difference and confidence level.

Use [Little's Law](/learn/performance/littles-law) and [workload modelling](/learn/performance/workload-modeling) to convert business forecasts (orders per day, peak hour share) into request rates and concurrent users.

```mermaid
flowchart LR
  F[Business forecast] --> W[Workload model: req/s at peak]
  B[Baseline run] --> C[Stepped test: capacity at SLO]
  W --> H[Headroom = capacity / peak - 1]
  C --> H
  H --> D{Below safety target?}
  D -- Yes --> P[Plan: scale, optimise, or both]
  D -- No --> M[Monitor, re-test each release]
```

## Real-world example

An online exam platform expected a big jump in students at the start of term. Their baseline (release 3.2) showed "Submit answer" at 320 ms p95 at 150 submissions/s. A stepped test found the SLO (p95 ≤ 1 s) held up to 420/s, with the database's write I/O as the bottleneck. The forecast peak was 480/s at exam start, because every student clicks "Start" at once.

The team had headroom for normal days but not for exam peaks. They batched answer autosaves and moved the database to faster storage; a rerun showed capacity at SLO of 900/s. They added the stepped test to each release, comparing against the new baseline, so a later ORM upgrade that cut capacity by 30% was caught before deployment.

## Step-by-step walkthrough

1. **Collect objectives:** SLOs, SLAs or requirements per critical transaction.
2. **Write measurable thresholds** for each.
3. **Fix the baseline conditions:** build, environment, data, workload, duration. Document them.
4. **Run the baseline 3+ times;** record the mean and spread of key metrics.
5. **Run a stepped test** to find capacity at SLO and the bottleneck.
6. **Calculate utilization and headroom** against current and forecast peaks.
7. **Recommend:** scale, optimise, or both, with dates based on growth assumptions.
8. **Automate:** run a smaller regression test per release, compare with the baseline, and fail the build on threshold breaches.
9. **Re-baseline** when the architecture or environment changes significantly.

## Common mistakes

- **Using the crash point as capacity.**
- **Vague thresholds** that can't be measured.
- **One-off baselines** with no idea of normal variation.
- **Comparing runs where several things changed.**
- **Assuming linear scaling** from more servers.
- **Extrapolating from a small test environment** without saying so.
- **Load testing shared or third-party systems** without authorisation.

## Key takeaways summary

Record a controlled, repeatable baseline; turn SLOs into measurable thresholds; find capacity as the highest load that still meets them; and compute headroom against forecast peaks with written assumptions. Re-test every release so regressions are caught early.
