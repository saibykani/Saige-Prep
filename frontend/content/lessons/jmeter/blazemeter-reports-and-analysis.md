---
slug: blazemeter-reports-and-analysis
title: BlazeMeter reports, comparisons and analysis
summary: Read a BlazeMeter run like an analyst - Summary, Timeline, Request Stats, Errors, Engine Health and Logs - set failure criteria, compare runs against a baseline, and write a defensible conclusion.
level: intermediate
duration: 50
tags: [performance, jmeter, blazemeter, reporting, analysis]
objectives:
  - Navigate the Summary, Timeline, Request Stats, Errors, Engine Health and Logs reports
  - Interpret Max Users, hits/s, average and percentile response times and error percentage correctly
  - Configure failure criteria, including the 1-minute sliding window and ramp-up exclusion
  - Set a baseline and use baseline comparison and baseline-based failure criteria to detect regressions
prerequisites:
  - Running a JMeter test on BlazeMeter
  - Analyzing JMeter results and the HTML dashboard
related: [jmeter-analyzing-results, jmeter-html-dashboard-report, blazemeter-distributed-load-and-locations, blazemeter-ci-cd-and-api-monitoring, jmeter-workload-design]
references:
  - title: BlazeMeter Help - Summary report
    url: https://help.blazemeter.com/docs/guide/performance-summary-report.html
  - title: BlazeMeter Help - Timeline report
    url: https://help.blazemeter.com/docs/guide/performance-timeline-report.html
  - title: BlazeMeter Help - Request stats report
    url: https://help.blazemeter.com/docs/guide/performance-request-stats-report.html
  - title: BlazeMeter Help - Errors report
    url: https://help.blazemeter.com/docs/guide/performance-errors-report.html
  - title: BlazeMeter Help - Failure criteria
    url: https://help.blazemeter.com/docs/guide/performance-failure-criteria.html
  - title: BlazeMeter Help - Baseline comparison
    url: https://help.blazemeter.com/docs/guide/performance-baseline-comparison.html
interview:
  - q: Walk me through how you analyse a BlazeMeter run.
    a: First I check the run is valid - Engine Health below about 75% CPU and 85% memory, Max Users and duration as planned, no setup errors in Logs. Then Summary for the headline numbers, Timeline to correlate users, hits/s, response time and errors over time and find the knee, Request Stats to see which labels drive the 90th/99th percentiles, and Errors grouped by response code and label for causes. Finally I compare against the baseline and state a conclusion with evidence and limits.
  - q: Why is Max Users in the Summary sometimes lower than Total Users?
    a: Max Users is the maximum number of users active simultaneously, computed per second and then per minute, not the configured total. Users that ramp, finish iterations or sit idle at different moments do not all overlap, so the measured concurrency can be lower.
  - q: Why use percentiles rather than averages for pass/fail?
    a: Averages hide the tail. A 300 ms average can include 5% of users waiting 6 seconds. The 90th or 99th percentile describes what most users experience at worst, which is what service levels are usually written against.
  - q: What is a baseline-based failure criterion?
    a: After marking a good run as the test's baseline, you can set criteria relative to it, for example average response time greater than baseline plus 5% fails the run. It catches regressions without hard-coding absolute numbers, and from Taurus it works only for an existing BlazeMeter test that already has a baseline.
practice:
  - "Open a finished run and write a five-line analysis: validity, throughput, latency (p90/p99), errors, verdict."
  - "Add failure criteria for p90 > 1000 ms and error rate > 1% with the 1-min slide window and ramp-up exclusion; trigger one deliberately."
  - "Set a run as baseline, change something (for example add a 200 ms timer), re-run and read the comparison."
takeaways:
  - Check validity first (Engine Health, Logs, Max Users) before believing any number.
  - Timeline shows cause and effect over time; Request Stats shows which label is slow.
  - Use percentiles and error percentage for criteria, not averages alone.
  - Failure criteria can stop a test early with the 1-min sliding window and can ignore ramp-up.
  - Baselines turn single runs into a regression history.
quiz:
  - id: bzm-rep-q1
    type: single
    topic: blazemeter-reports-and-analysis
    difficulty: beginner
    prompt: Which report tells you whether the load generators themselves were a bottleneck?
    options: ["Summary", "Engine Health", "Errors", "Request Stats"]
    answer: [1]
    explanation: Engine Health shows CPU, memory, network I/O and connections of the engines, which are not your system under test.
  - id: bzm-rep-q2
    type: code-output
    topic: blazemeter-reports-and-analysis
    difficulty: intermediate
    prompt: "Request Stats: Login avg 420 ms, 90% line 650 ms, 99% line 4,800 ms, error 0.2%. Criteria: p90 <= 800 ms and error <= 1%. Which statement is true?"
    options: ["Login fails both criteria", "Login passes both criteria, but the 99th percentile shows a tail worth investigating", "Login fails on p90", "Login fails on error rate"]
    answer: [1]
    explanation: 650 is under 800 and 0.2% under 1%, so it passes. The 4.8 s 99th percentile still indicates some users wait a long time.
  - id: bzm-rep-q3
    type: truefalse
    topic: blazemeter-reports-and-analysis
    difficulty: beginner
    prompt: The Stop Test option on a failure criterion can only be used together with the 1-min slide window eval option.
    options: ["True", "False"]
    answer: [0]
    explanation: Per BlazeMeter's documentation, stopping immediately on a violation requires in-run evaluation with the sliding window; otherwise criteria are evaluated at the end.
  - id: bzm-rep-q4
    type: scenario
    topic: blazemeter-reports-and-analysis
    difficulty: intermediate
    prompt: "Timeline: users rise steadily; hits/s rise until 400 users then stay flat; response time climbs sharply after 400 users; errors stay near zero. What does this most likely show?"
    options: ["A healthy system with spare capacity", "The system's throughput limit is around 400 users; extra users only queue", "The engines crashed", "An RPS limit of 400"]
    answer: [1]
    explanation: Flat throughput with rising response time is the classic saturation knee. Engine Health should confirm generators were fine; an RPS cap would keep response times low.
---

## Beginner-friendly explanation

A BlazeMeter report is like a car's dashboard plus its trip recorder. The **Summary** is the dashboard glance: speed, distance, warnings. The **Timeline** is the trip graph: when you sped up and when the engine overheated. **Request Stats** lists each road segment. **Errors** is the breakdown log. **Engine Health** checks the measuring equipment itself; if the speedometer was broken, every other number is suspect. Good analysis reads them in that spirit: first "can I trust this?", then "what happened?", then "why?".

## Technical explanation

Reports are under Performance, Reports; open a run to see tabs. At the time of writing they include:

| Report | Key content |
|---|---|
| **Summary** | Max Users, Average Throughput (hits/s), errors, average and 90th percentile response time, average bandwidth, duration; compared with the baseline if set; overview graphs; printable executive summary |
| **Timeline** | Virtual users, hits, response time, connect time, latency, bytes, errors, response codes over time; per-label KPIs; anomalies; up to 50 KPIs per chart |
| **Request Stats** | Per label: samples, average, 90% line, 99% line (others selectable via Edit Columns), max, error percentage, hits/s, bandwidth; CSV download; baseline comparison toggle |
| **Errors** | Grouped by label, response code or assertion name; top requests, assertion failures, failed embedded resources; first unique error response bodies |
| **Engine Health** | CPU, memory, network I/O and connections per engine |
| **Logs** | Engine logs and `artifacts.zip` (including the modified JMX and JTL) |

Important definitions from the docs: **Max Users** is the maximum number of simultaneously active users (maximum per second, then per minute), not your configured total. **Hits/s** for JMeter counts the samples in the JTL; whether sub-samples (embedded resources) count depends on whether you included them. **Response time** runs from the first byte sent to the last byte received; **latency** to the first byte received; **connect time** includes DNS and TLS handshake.

**Failure criteria** (Configuration tab, Failure Criteria toggle): each rule has Label (default ALL), KPI, Condition (less than, greater than, equal, not equal) and Threshold. Options: **1-min slide window eval** evaluates every 10 seconds over 60-second windows during the run instead of once at the end; **Stop Test** stops on the first violation and requires the sliding window; **Ignore failure criteria during ramp-up** is under advanced configuration. A run that violates any rule is marked failed, which CI can read. Taurus `passfail` criteria uploaded in YAML are largely translated into BlazeMeter criteria.

**Baselines.** Mark a good run as the test's baseline; the Summary and Request Stats then show differences. With a baseline, criteria can use **Use from baseline** with an offset, and Taurus can express `avg-rt>baseline+5%` for an existing BlazeMeter test that has a baseline. Multi-tests support baseline comparison but not baseline-based criteria.

## Step-by-step walkthrough

1. **Open the run.** Performance, Reports, Show all reports, click the run.
2. **Validity check.** Engine Health tab: are CPU and memory below about 75% and 85%? Logs tab: any "file not found", Java exceptions or engine restarts? Summary: Max Users and duration as planned? If not valid, stop here and fix the setup.
3. **Summary.** Note average hits/s, error percentage, average and 90th percentile response time. Compare with the baseline columns if present.
4. **Timeline.** Select Virtual Users, Hits, Response Time and Errors on one chart. Look for the moment hits/s stops growing while response time rises (the knee), spikes, or step changes. Drag the sliders to zoom into steady state and exclude ramp-up.
5. **Request Stats.** Sort by 90% line or 99% line. Which labels are slowest? Which have errors? Use Edit Columns to add the 95th percentile if your criteria use it. Download CSV for your records.
6. **Errors.** Group by response code, then by label. Open the response bodies of the first unique errors. 5xx usually means the server; 4xx often means script or data; non-HTTP errors (timeouts, connection reset) can mean network or saturation.
7. **Write the verdict** in a short structure: scope, validity, results against criteria, bottleneck hypothesis, next steps.
8. **Set the baseline** if this run is your reference: in the report, choose the option to set it as baseline (wording may vary). Then enable failure criteria with Use from baseline and an offset.

## Code examples

A reusable analysis note (copy into your test log):

```text
Run: shop-baseline #12, 2026-11-11, staging (authorised by: J. Owner)
Validity: 3 engines, CPU max 68%, memory max 61%, Max Users 600/600
Throughput: 182 hits/s steady state (20-50 min)
Latency: p90 640 ms (crit 800), p99 2,900 ms; slowest label 05 Checkout
Errors: 0.4% (crit 1%) - 92% are 503 on 05 Checkout after minute 38
Verdict: PASS against criteria; risk: checkout tail and late 503s
Next: check payment-worker pool and DB connections at minute 38
```

## Expected output

For a healthy run: engine CPU flat below 70%, hits/s plateau matching your model, response-time lines flat in steady state, errors near zero, criteria tab all green. For a saturated run: hits/s flat while users still rise, response time climbing, errors appearing late, criteria marked red with the violating window.

## Real-world example

A bank's run "passed" on average response time (310 ms) but customers complained. The Request Stats 99% line for `Transfer` was 7 seconds, and the Errors tab showed 0.3% timeouts clustered in two-minute bursts. The Timeline revealed those bursts every 10 minutes, matching a scheduled batch job on the shared database. They replaced the average criterion with p90 and p99 criteria per critical label, made the batch run outside the test window, and set the next good run as baseline with a 10% offset.

## Worked example: diagnosing a saturated run

A team runs 800 users with a 10-minute ramp and a 30-minute hold. The Summary says p90 is 1.9 s and errors are 3.2%, both breaching criteria. Here is a realistic analysis path.

**1. Validity.** Engine Health shows four engines, CPU peaking at 61%, memory flat. Logs show no exceptions. Max Users is 800. The numbers can be trusted.

**2. Timeline.** With Virtual Users, Hits and Response Time on one chart:

```text
minute  users  hits/s  avg rt
   5     400    210     280 ms
   8     640    330     300 ms
  10     800    352     610 ms
  15     800    348    1,450 ms
  25     800    341    1,520 ms
```

Between minutes 8 and 10, users grew by 25% but hits/s grew by only about 7%, and response time doubled. That is the knee: the system reached its maximum useful throughput, around 350 hits/s. After it, extra users only wait in queues. Little's Law gives a sanity check: concurrent users roughly equal throughput multiplied by (response time + think time). If each user's iteration is far longer than your think time alone explains, the extra time is queueing.

**3. Request Stats.** Sorting by 90% line shows `04 Search` at 3.4 s, while `01 Home` stays at 220 ms. The slowdown is not uniform, which points at a specific dependency rather than the network or the engines.

**4. Errors.** Grouped by response code: 96% are 504 Gateway Timeout on `04 Search`. Opening the first unique error body shows the proxy's timeout page, so the search service did not answer in time.

**5. Verdict.** "System saturates near 350 hits/s, about 650 users, at the current workload mix. Search is the bottleneck. Recommend investigating search service capacity and query performance, then re-running the same test for comparison."

Notice what the analysis does not claim: it does not say "the database is slow" without evidence. The report shows where and when; the application's own monitoring shows why.

## Patterns to recognise on the Timeline

| Shape | Usual meaning |
|---|---|
| Hits/s flat while users rise, response time rising | Saturation (the knee) |
| Response time climbing steadily during a flat hold | Resource leak, growing queue or data growth (for example a cart that keeps growing) |
| Regular spikes every N minutes | Scheduled job, garbage collection, cache expiry or log rotation |
| Sudden step change, then stable | Autoscaling event, failover or a cache warming up |
| Errors starting at once with a drop in response time | Fast failures: the server rejects requests quickly instead of serving them |
| Hits/s drops to zero briefly on all labels | Engine or network interruption; check Engine Health and Logs |

The last pattern is a trap: falling response time can look like good news when it really means requests are failing quickly. Always read response time together with errors.

## Comparing two runs fairly

Before calling something a regression, confirm the two runs share the same script version, data, load configuration, locations, target build and environment size. Note them in the analysis note. If any differ, describe the result as "different" rather than "worse", and re-run under matching conditions.

## Common mistakes

- **Trusting numbers from overloaded engines.**
- **Including ramp-up in steady-state statistics.** Zoom the timeline or ignore ramp-up in criteria.
- **Judging by averages only.**
- **Reading total errors without grouping**; one broken label can look like a system-wide problem.
- **Comparing runs with different scripts, data or environments** and calling it a regression.
- **Setting a bad run as baseline**, so regressions look normal.

## Troubleshooting

| Symptom | Likely meaning |
|---|---|
| Max Users lower than configured | Users not all active at once; check iterations, pacing and ramp |
| Hits/s far higher than expected | Embedded resources counted, or no think time |
| Many 4xx errors from the start | Script, correlation or data problem |
| Errors only after a point in time | Saturation, resource leak or external event |
| Criteria passed but users unhappy | Criteria too loose or on averages; add percentiles per label |

## Hands-on exercise

1. Take your last run and complete the analysis note template.
2. Add three failure criteria (p90 per critical label, error rate, hits/s minimum) with sliding window and ramp-up exclusion.
3. Set the run as baseline, add a 300 ms Constant Timer to one request, re-run and confirm the comparison and baseline criteria flag it.
4. Explain in two sentences why the change showed up where it did.

## Key takeaways summary

Analyse in order: validity (Engine Health, Logs, Max Users), headline numbers (Summary), behaviour over time (Timeline), per-label detail (Request Stats) and causes (Errors). Use percentiles and error rates in failure criteria, evaluate them during the run when you need to stop early, and keep a good baseline so each new run answers "better or worse than before?".
