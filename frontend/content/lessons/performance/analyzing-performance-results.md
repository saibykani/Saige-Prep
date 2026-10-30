---
slug: analyzing-performance-results
title: Analysing Performance Results and Root Cause
summary: Turn a load test's numbers into a conclusion. Learn to validate the run, read percentiles, throughput and errors together, find the knee, correlate with resource metrics, and write findings that point to a root cause rather than just a symptom.
level: intermediate
duration: 40
tags: [performance, analysis, root-cause, reporting]
objectives:
  - Validate that a test run is trustworthy before analysing it
  - Interpret percentiles, throughput and error rate together over time
  - Correlate test metrics with resource metrics to form and test hypotheses
  - Write a performance findings report with evidence and clear recommendations
prerequisites:
  - Throughput, latency and percentiles
  - CPU, memory, disk, network and bottlenecks
  - Monitoring with InfluxDB and Grafana
related: [throughput-latency-and-percentiles, resource-utilization-and-bottlenecks, monitoring-with-influxdb-grafana, capacity-planning-and-baselines, littles-law, root-cause-analysis]
references:
  - title: Apache JMeter User Manual — Generating the HTML report
    url: https://jmeter.apache.org/usermanual/generating-dashboard.html
  - title: The USE Method (Brendan Gregg)
    url: https://www.brendangregg.com/usemethod.html
  - title: Google SRE books
    url: https://sre.google/books/
  - title: Grafana documentation
    url: https://grafana.com/docs/
interview:
  - q: What is the first thing you do after a load test finishes?
    a: Check the run is valid before trusting any number. Did the planned load actually happen - threads, throughput and duration? Were errors real application errors or script problems like failed correlation? Was the load generator healthy? Was the environment as expected, with no deployments or other tests running? Then I exclude ramp-up and ramp-down and analyse the steady state.
  - q: Why are percentiles better than averages for analysing response time?
    a: Response times are usually skewed - most requests are fast and a few are very slow. The average mixes them and hides the slow tail that real users feel. Percentiles like p90, p95 and p99 tell me what most users experience and how bad the tail is, which is what SLAs are usually written against.
  - q: Response time rose sharply at 400 users. How do you find the root cause?
    a: I look at the timeline at that point. Did throughput stop increasing - meaning saturation? Did errors appear and of what type? Then I correlate with resource metrics across tiers using the USE method - CPU, memory and GC, disk, network, pools and the database. That gives a hypothesis, such as connection-pool exhaustion. I confirm it with more evidence - pool waiters, thread dumps, slow queries - and ideally by changing that one factor and rerunning to see if the knee moves.
  - q: What should a performance test report contain?
    a: The objective and acceptance criteria, the workload model and environment, a summary verdict against the criteria, key metrics per transaction (percentiles, throughput, error rate), graphs over time, resource observations, bottlenecks found with evidence, risks and limitations of the test, and prioritised recommendations. The verdict comes first so managers can act on it.
practice:
  - "Take an HTML dashboard report from a JMeter run in your lab. Write three observations and one hypothesis, each backed by a graph."
  - "Use Little's Law to check whether the throughput in your report is consistent with thread count, response time and think time."
  - "Write a one-page findings summary for a test that missed its p95 target, including recommendations."
takeaways:
  - Validate the run before analysing it.
  - Analyse the steady state; treat ramp-up separately.
  - Read percentiles, throughput and errors together over time.
  - Symptom, then correlation, then hypothesis, then proof by a controlled change.
  - Reports lead with the verdict against criteria and back every claim with evidence.
quiz:
  - id: perfana-q1
    type: scenario
    topic: analyzing-performance-results
    difficulty: intermediate
    prompt: A test shows a 30% error rate. Most errors are assertion failures because a session token was not extracted. What should you conclude?
    options: ["The application fails under load", "The run is invalid for performance conclusions until the script's correlation is fixed", "Error rate is acceptable", "Increase the number of threads"]
    answer: [1]
    explanation: Script errors mean the workload didn't match real user behaviour, so response times and throughput are unreliable. Fix correlation and rerun before drawing conclusions.
  - id: perfana-q2
    type: single
    topic: analyzing-performance-results
    difficulty: beginner
    prompt: Why should ramp-up time usually be excluded from steady-state response-time analysis?
    options: ["Ramp-up always has errors", "During ramp-up load is still increasing and caches and pools are warming, so it doesn't represent the target load", "JMeter doesn't record ramp-up samples", "It makes the report longer"]
    answer: [1]
    explanation: The target load is only reached after ramp-up. Mixing in warm-up samples distorts the steady-state figures. Analyse ramp-up separately if warm-up behaviour matters.
  - id: perfana-q3
    type: multiple
    topic: analyzing-performance-results
    difficulty: intermediate
    prompt: At 300 users, p95 jumps from 400 ms to 3 s and throughput stays flat at 120 requests per second. Which are reasonable next checks? Select all that apply.
    options: ["Resource saturation on each tier at that timestamp", "Thread and connection pool waiters", "Load generator CPU and memory", "Ignore it because the average is still acceptable", "Slow-query log on the database"]
    answer: [0, 1, 2, 4]
    explanation: Flat throughput with rising latency signals saturation somewhere. Check every tier, pools, the load generator and the database. Ignoring a p95 jump because of the average is the mistake percentiles exist to prevent.
  - id: perfana-q4
    type: truefalse
    topic: analyzing-performance-results
    difficulty: intermediate
    prompt: If a graph shows database CPU rising at the same time as response time, that alone proves the database is the root cause.
    options: ["True", "False"]
    answer: [1]
    explanation: Correlation suggests a hypothesis. Both could be effects of another cause, such as a cache failure sending more queries. Confirm with more evidence or a controlled change.
---

## Beginner-friendly explanation

Imagine you're a doctor with a patient's test results: temperature, blood pressure, blood tests. A list of numbers is not a diagnosis. First you check the tests were done properly (was the sample contaminated?). Then you look at which values are abnormal, how they relate to each other, and what single cause would explain them. Finally you confirm it, and write a clear note for the next doctor.

Analysing a performance test is the same. JMeter gives you numbers and graphs. Your job is to check the test was valid, find what is abnormal, connect it to what the servers were doing, identify the most likely cause, prove it, and explain it clearly.

## Technical explanation

### Step 1: Validate the run

| Check | Why |
|---|---|
| Planned vs actual load (threads, throughput, duration) | A test that didn't reach its target load proves nothing about that load |
| Error breakdown (codes, messages, assertion failures) | Script errors (correlation, data) invalidate results |
| Load generator health (CPU, heap, GC, network) | A saturated generator inflates response times |
| Environment (deployments, other tests, config) | Unexpected changes break comparisons |
| Data (unique, sufficient, realistic) | Reused data inflates cache hits |

### Step 2: Read the key metrics together

See [throughput, latency and percentiles](/learn/performance/throughput-latency-and-percentiles). For each transaction, during **steady state**:

- **Percentiles** (p50, p90, p95, p99) and max — not just averages.
- **Throughput** — achieved versus target.
- **Error rate** — and its types.
- **Over time**, not only as totals. Trends (gradual rise = leak or growing queue), periodic spikes (scheduled jobs, GC) and sudden steps (saturation, failover) each suggest different causes.

Use [Little's Law](/learn/performance/littles-law) as a consistency check: with a closed workload, users ≈ throughput × (response time + think time). A mismatch hints at hidden delays or a test problem.

### Step 3: Find the knee and correlate

In a stepped test, the **knee** is the load at which throughput stops increasing and latency rises steeply. At the knee, look across tiers for the first resource that saturates using the USE method — see [resource utilization and bottlenecks](/learn/performance/resource-utilization-and-bottlenecks).

### Step 4: Hypothesis, then proof

| Symptom | Possible causes | Evidence to confirm |
|---|---|---|
| Throughput plateau + latency up, low CPU | Pool or lock limit, slow dependency | Pool waiters, thread dumps, downstream latency |
| Gradual latency rise over hours | Memory leak, growing table, log growth | Post-GC heap trend, table sizes |
| Periodic spikes | GC, scheduled jobs, cache expiry | GC logs, job schedules, cache metrics |
| Errors only above N users | Connection limits, timeouts | Error messages, server limits |
| One transaction slow, others fine | Specific query or endpoint | Slow-query log, profiler, traces |

A root cause is confirmed when changing **one** factor (in a test environment) changes the result as predicted.

```mermaid
flowchart LR
  V[Validate run] --> M[Read metrics over time]
  M --> K[Find knee / anomaly]
  K --> C[Correlate with resources]
  C --> H[Form hypothesis]
  H --> P[Confirm with evidence or a controlled change]
  P --> R[Report verdict + recommendations]
```

## Real-world example

A ticketing team's test showed p95 for "Reserve seat" at 4.2 s against a 1 s target; other transactions were fine. The run was valid: target throughput reached, errors under 0.1%, generator healthy. Over time, latency was fine up to 250 users, then rose steeply while throughput flattened. App CPU was 40%, but the database showed growing **lock waits** on the `seats` table. Thread dumps showed request threads blocked on the database. Hypothesis: the reservation transaction locked a whole row range while calling a slow payment pre-check. The developers moved the external call outside the transaction; a rerun with nothing else changed met the target up to 600 users. That before/after comparison is the proof.

## Step-by-step walkthrough

1. **Validate** using the checklist above. If invalid, fix and rerun — don't analyse.
2. **Trim** ramp-up and ramp-down; define the steady-state window.
3. **Summarise per transaction:** p50/p90/p95/p99, throughput, error %, compared with acceptance criteria.
4. **Plot over time** with active threads on the same chart; find the knee or anomalies.
5. **Correlate** each anomaly with resource and application metrics at the same timestamps.
6. **Write hypotheses** and the evidence that would confirm or reject each.
7. **Confirm** with additional data or a single controlled change and rerun.
8. **Report:** verdict first, then evidence, bottlenecks, risks and recommendations.

### Example summary table

| Transaction | Target p95 | Actual p95 | Throughput (target / actual) | Errors | Verdict |
|---|---|---|---|---|---|
| Search | 800 ms | 610 ms | 50 / 50 per s | 0.02% | Pass |
| Reserve seat | 1,000 ms | 4,200 ms | 20 / 14 per s | 0.08% | Fail |
| Pay | 1,500 ms | 1,180 ms | 14 / 14 per s | 0.05% | Pass |

(Illustrative figures for the scenario above.)

## Common mistakes

- **Analysing an invalid run** — script errors or a saturated generator.
- **Reporting averages** instead of percentiles.
- **Including ramp-up** in steady-state numbers.
- **Stopping at the symptom** ("the database is slow") without a confirmed cause.
- **Calling a correlation a cause** without further evidence.
- **Changing several things before rerunning**, so you can't tell what helped.
- **Reports that are a dump of graphs** with no verdict or recommendations. See [HTML dashboard report](/learn/jmeter/jmeter-html-dashboard-report) and [analysing JMeter results](/learn/jmeter/jmeter-analyzing-results) for the JMeter side.

## Key takeaways summary

Validate first, then analyse the steady state with percentiles, throughput and errors over time. Find the knee, correlate with resources, form a hypothesis and prove it with a controlled change. Report a clear verdict against the criteria, backed by evidence.
