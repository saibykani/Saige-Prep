---
slug: jmeter-html-dashboard-report
title: The JMeter HTML Dashboard Report Explained
summary: Generate JMeter's HTML dashboard from a non-GUI run or an existing results file, and learn to read every part of it, from APDEX and the Statistics table to Errors, Response Times Over Time, Percentiles, Active Threads and Throughput charts.
level: intermediate
duration: 35
tags: [performance, jmeter, reporting, dashboard]
objectives:
  - Generate the dashboard during a run with -e -o and afterwards with -g
  - Explain APDEX and configure its satisfied and tolerated thresholds
  - Read the Statistics and Errors tables and know which columns matter
  - Use the time-series and percentile charts to describe how the system behaved over the run
prerequisites:
  - Non-GUI execution of JMeter
  - Throughput, latency and percentiles
related: [jmeter-non-gui-and-distributed, jmeter-analyzing-results, jmeter-listeners-and-results, throughput-latency-and-percentiles, analyzing-performance-results]
references:
  - title: Apache JMeter - Generating Report Dashboard
    url: https://jmeter.apache.org/usermanual/generating-dashboard.html
  - title: Apache JMeter Best Practices
    url: https://jmeter.apache.org/usermanual/best-practices.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: How do you generate a JMeter HTML report?
    a: "During a non-GUI run with jmeter -n -t plan.jmx -l results.jtl -e -o report/, or afterwards from an existing results file with jmeter -g results.jtl -o report/. The output folder must be empty or not exist. The results file must be CSV with the default fields, including timestamps and labels, so the report generator can parse it."
  - q: What is APDEX and how does JMeter compute it?
    a: "APDEX, the Application Performance Index, is a score from 0 to 1. Each sample is satisfied if its time is at or below the satisfied threshold T, tolerating if it is above T and at or below the frustration threshold F, and frustrated if above F or failed. The score is (satisfied + tolerating / 2) / total. JMeter defaults are 500 ms and 1500 ms, set by jmeter.reportgenerator.apdex_satisfied_threshold and apdex_tolerated_threshold, and should be tuned to your agreed targets."
  - q: Which parts of the dashboard do you look at first?
    a: "The Statistics table for error percentage, 90th/95th/99th percentiles and throughput per transaction, then the Errors table for error types. Then Response Times Over Time together with Active Threads Over Time and Transactions per Second, to see whether response times degraded as load increased or at a specific moment."
practice:
  - "Run a 5-minute non-GUI test against your local app with -e -o report/ and open report/index.html. Write down the error percentage and 95th percentile for each transaction."
  - "Change the APDEX thresholds to 300 ms and 1000 ms using -J properties and regenerate the report from the same .jtl with -g. Explain how the scores changed."
  - "Find the moment in Response Times Over Time where response time first rises and match it to the Active Threads Over Time chart."
takeaways:
  - "Generate during the run with -e -o, or later from a .jtl with -g; the output folder must be empty."
  - APDEX turns response times into a 0–1 score using satisfied and tolerated thresholds you should set to your targets.
  - The Statistics table gives per-transaction counts, error percentage, percentiles and throughput.
  - Time-series charts explain when and why numbers changed; always read them alongside Active Threads.
  - Exclude ramp-up and warm-up periods from conclusions when they distort the steady state.
quiz:
  - id: jm-dash-q1
    type: single
    topic: jmeter-html-dashboard-report
    difficulty: beginner
    prompt: Which command builds a dashboard from an existing results file?
    options: ["jmeter -n -t results.jtl", "jmeter -g results.jtl -o report/", "jmeter -l report/ -e", "jmeter -r results.jtl"]
    answer: [1]
    explanation: -g names an existing results file and -o the output folder. -t expects a test plan, and -r starts remote servers.
  - id: jm-dash-q2
    type: code-output
    topic: jmeter-html-dashboard-report
    difficulty: intermediate
    prompt: With thresholds T = 500 ms and F = 1500 ms, a transaction has 100 samples - 70 at or below 500 ms, 20 between 501 and 1500 ms, and 10 above 1500 ms, all successful. What is the APDEX?
    code: "APDEX = (satisfied + tolerating / 2) / total"
    codeLanguage: text
    options: ["0.70", "0.80", "0.90", "0.95"]
    answer: [1]
    explanation: (70 + 20/2) / 100 = 80 / 100 = 0.80. 0.90 would wrongly count tolerating samples as fully satisfied.
  - id: jm-dash-q3
    type: debugging
    topic: jmeter-html-dashboard-report
    difficulty: beginner
    prompt: Report generation fails with a message that the output folder is not empty. What should you do?
    options: ["Use a different -l file", "Delete or rename the old report folder, or choose a new -o folder", "Restart Java", "Add -Jjmeter.save.saveservice.output_format=xml"]
    answer: [1]
    explanation: JMeter refuses to overwrite an existing non-empty report folder. Pointing -o to a new or empty folder fixes it. Switching to XML output would actually break report generation, which needs CSV.
  - id: jm-dash-q4
    type: truefalse
    topic: jmeter-html-dashboard-report
    difficulty: intermediate
    prompt: A high average response time in the Statistics table alone tells you when the slowdown happened during the test.
    options: ["True", "False"]
    answer: [1]
    explanation: The Statistics table is aggregated over the whole run. To see when the slowdown occurred you need the time-series charts such as Response Times Over Time.
---

## Beginner-friendly explanation

After a long car trip, the dashboard tells you average speed, fuel used and warning lights. A JMeter test produces thousands of raw result lines, which are hard to read. The **HTML dashboard report** is JMeter's trip summary: a folder of web pages with tables and charts built from your results file.

You open `index.html` in a browser and see, for every request type, how many ran, how many failed, how fast they were and how the numbers changed over time. It is the main way to share results with your team.

> **Authorisation rule:** the results you report must come from tests on systems you own (for example a local app) or are authorised in writing to test.

## Technical explanation

**Generating it**

```bash
# During a non-GUI run: results to results.jtl, report to report/
jmeter -n -t plan.jmx -l results.jtl -e -o report/

# Afterwards, from an existing results file
jmeter -g results.jtl -o report/
```

- `-n` non-GUI, `-t` test plan, `-l` results log (a **.jtl**, which is CSV by default), `-e` generate report at end, `-o` output folder, `-g` generate from an existing file.
- The output folder must be empty or not exist.
- Settings live in `bin/reportgenerator.properties` and can be overridden in `user.properties` or with `-J`.

**APDEX (Application Performance Index)** scores user satisfaction from 0 (everyone frustrated) to 1 (everyone satisfied):

| Sample category | Rule (JMeter defaults) |
|---|---|
| Satisfied | time ≤ T (500 ms) |
| Tolerating | T < time ≤ F (1500 ms) |
| Frustrated | time > F, or the sample failed |

Score = (satisfied + tolerating ÷ 2) ÷ total. Set thresholds with `jmeter.reportgenerator.apdex_satisfied_threshold` and `jmeter.reportgenerator.apdex_tolerated_threshold` (in ms) to match your agreed targets.

**Dashboard page**

- **Test and Report information:** file, start and end time.
- **APDEX table:** score per transaction.
- **Requests Summary:** pie of pass vs fail.
- **Statistics table:** per label: #Samples, FAIL, Error %, Average, Min, Max, Median, 90th, 95th, 99th percentile, Transactions/s, Received and Sent KB/sec.
- **Errors table:** error type (for example `500/Internal Server Error` or an assertion message), count, % of errors and % of all samples.
- **Top 5 Errors by sampler.**

**Charts menu** (left side): *Over Time* (Response Times Over Time, Active Threads Over Time, Bytes Throughput, Latencies, Connect Time), *Throughput* (Hits per Second, Codes per Second, Transactions per Second, Response Time vs Request), and *Response Times* (Response Time Percentiles, Response Time Overview, Time vs Threads, Response Time Distribution).

```mermaid
flowchart LR
  P["plan.jmx"] -->|"jmeter -n -t ... -l"| J["results.jtl (CSV)"]
  J -->|"-e -o at end of run"| R["report/index.html"]
  J -->|"later: jmeter -g results.jtl -o"| R
  R --> S["Statistics, APDEX, Errors"]
  R --> C["Charts: over time, throughput, percentiles"]
```

**Percentile** reminder: the 95th percentile is the value that 95 % of samples were at or below. See [Throughput, latency and percentiles](/learn/performance/throughput-latency-and-percentiles).

## Step-by-step walkthrough

1. Run your plan (pointed at your local app) from JMeter's `bin` folder:

```bash
jmeter -n -t shop.jmx -l run1/results.jtl -e -o run1/report -Jjmeter.reportgenerator.apdex_satisfied_threshold=300 -Jjmeter.reportgenerator.apdex_tolerated_threshold=1200
```

2. Open `run1/report/index.html` in a browser.
3. Read **Statistics** first. Sort by Error % and then by 95th percentile.
4. Open **Errors** to see what kinds of failures occurred.
5. Open **Charts → Over Time → Response Times Over Time**, then **Active Threads Over Time** and **Throughput → Transactions Per Second**, and compare their time axes.
6. Open **Charts → Response Times → Response Time Percentiles** to see the shape of the distribution.
7. Use **Transaction Controllers** in your plan so the report shows business steps, not dozens of URLs. With "Generate parent sample" ticked, child samplers are hidden and only the transaction appears.

## Expected output

Illustrative Statistics excerpt (numbers depend entirely on your app and machine):

| Label | #Samples | Error % | Average | 90th pct | 95th pct | 99th pct | Transactions/s |
|---|---|---|---|---|---|---|---|
| 01 Login | 1,200 | 0.00 % | 180 | 260 | 310 | 520 | 4.0 |
| 02 Search | 3,600 | 0.08 % | 240 | 390 | 470 | 900 | 12.0 |
| 03 Checkout | 600 | 1.50 % | 610 | 980 | 1,250 | 2,400 | 2.0 |

Reading it: checkout has the highest error rate and a long tail (99th about 4× the average), so it is the first place to investigate.

## Real-world example

A team shared only the average response time from the report: "checkout 610 ms, fine". A reviewer opened the Percentiles chart and Response Times Over Time and saw that the 99th percentile was several seconds and that spikes lined up with every minute mark. The cause was a scheduled job on the test server competing for the database. The averages had hidden it.

## Common mistakes

- **Reporting averages only**; always show 90th/95th/99th percentiles.
- **Default APDEX thresholds** that have nothing to do with your targets.
- **Including ramp-up and warm-up** in conclusions about steady state; the report generator can filter with `jmeter.reportgenerator.start_date` / `end_date` or you can trim the .jtl.
- **Too many labels** from un-renamed recorded URLs, making the tables unreadable.
- **Running the GUI with listeners** during the load test instead of non-GUI plus the report.

## Troubleshooting

- **"Output folder not empty":** use a new `-o` folder.
- **Report generation errors about missing fields:** the .jtl must be CSV with timestamp, label and success fields saved; do not set XML output.
- **Empty or weird charts:** very short tests give few points; adjust `jmeter.reportgenerator.overall_granularity` (ms) for shorter runs.
- **Transactions missing:** check Transaction Controller settings and that sample labels are consistent.

## Sharing the report

The `report/` folder is self-contained: zip it, or publish it as a build artifact in CI, and anyone can open `index.html` offline. Keep the matching `results.jtl` alongside it so the report can be regenerated with different thresholds or time filters later. Name folders by date and run purpose (for example `2026-10-30-baseline`) so comparisons are easy.

## Key takeaways summary

The dashboard turns a .jtl into a shareable report. Generate it with `-e -o` or `-g`, set APDEX thresholds to your real targets, read Statistics and Errors for the "what", and the time-series and percentile charts for the "when" and "why". The next lesson, [Analysing results](/learn/jmeter/jmeter-analyzing-results), turns these readings into findings.
