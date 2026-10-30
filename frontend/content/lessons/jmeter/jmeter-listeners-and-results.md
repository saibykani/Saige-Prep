---
slug: jmeter-listeners-and-results
title: Listeners and reading results
summary: Learn what JMeter listeners do, how to use View Results Tree for debugging and Summary Report and Aggregate Report for numbers, what every column means (average, median, percentiles, min, max, error %, throughput, KB/sec), and why listeners must be disabled under load.
level: beginner
duration: 35
tags: [performance, jmeter, listeners, analysis]
objectives:
  - Choose the right listener for debugging versus measuring
  - Explain every column of Summary Report and Aggregate Report
  - Interpret percentiles, error rate and throughput correctly
  - Save results to a file and avoid listener memory problems under load
prerequisites:
  - The HTTP Request sampler in depth
related: [jmeter-html-dashboard-report, jmeter-analyzing-results, jmeter-non-gui-and-distributed, jmeter-scope-and-execution-order]
references:
  - title: Apache JMeter - Component Reference (Listeners)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter - Elements of a Test Plan
    url: https://jmeter.apache.org/usermanual/test_plan.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: What does the 90% Line in the Aggregate Report mean?
    a: It is the 90th percentile response time. 90% of samples for that label took this long or less, and 10% took longer. Percentiles are better than averages for user experience because a few very slow requests can hide behind a healthy-looking average.
  - q: Why should View Results Tree be disabled during a load test?
    a: It keeps every request and response in memory and renders them in the GUI, which consumes lots of CPU and heap and can make JMeter the bottleneck or crash it. It is a debugging tool. For load runs I use non-GUI mode with a results file and generate reports afterwards.
  - q: How is throughput calculated in JMeter's reports?
    a: Throughput is the number of samples divided by the elapsed time from the start of the first sample to the end of the last sample for that label, shown per second, minute or hour. It reflects completed requests per unit time, not the number of users.
practice:
  - "Run 5 threads × 20 loops against localhost:8000 with Summary Report and Aggregate Report. Write one sentence interpreting each column for your Home page label."
  - "Add a request to /missing.html and observe how Error % changes in both reports."
  - "Set a filename in Summary Report's Write results to file, run, and open the CSV in a spreadsheet. Identify the elapsed, success and responseCode columns."
takeaways:
  - View Results Tree is for debugging single requests; Summary and Aggregate Reports are for numbers.
  - Percentiles (90/95/99% Line) describe user experience better than averages.
  - Error % counts failed samples, which depends on assertions as well as status codes.
  - Throughput is completed samples per unit of time, not users.
  - Disable GUI listeners under load; write a results file and report afterwards.
quiz:
  - id: jm-lis-q1
    type: single
    topic: jmeter-listeners-and-results
    difficulty: beginner
    prompt: Which listener shows the full request and response of each individual sample?
    options: ["Summary Report", "Aggregate Report", "View Results Tree", "Simple Data Writer"]
    answer: [2]
    explanation: View Results Tree shows each sample with its request, response data and headers. Summary and Aggregate Reports show statistics per label, not individual responses.
  - id: jm-lis-q2
    type: scenario
    topic: jmeter-listeners-and-results
    difficulty: intermediate
    prompt: "Aggregate Report for Checkout shows Average 300 ms, Median 250 ms, 95% Line 2,400 ms. What is the best interpretation?"
    options: ["Checkout is fast for everyone", "Most requests are quick, but at least 5% take 2.4 s or more, so some users have a poor experience", "The average proves there is no problem", "95% of requests failed"]
    answer: [1]
    explanation: The 95th percentile shows a long tail of slow requests that the average hides. Percentile lines are about time, not errors, so they do not mean 95% failed.
  - id: jm-lis-q3
    type: multiple
    topic: jmeter-listeners-and-results
    difficulty: beginner
    prompt: Which columns appear in the Aggregate Report? Select all that apply.
    options: ["Median", "90% Line", "Error %", "CPU usage of the server"]
    answer: [0, 1, 2]
    explanation: Median, percentile lines and Error % are Aggregate Report columns. JMeter listeners measure the client side and do not show server CPU; you need server monitoring for that.
  - id: jm-lis-q4
    type: truefalse
    topic: jmeter-listeners-and-results
    difficulty: beginner
    prompt: Listeners consume memory and CPU on the load generator, so heavy GUI listeners should be disabled during load tests.
    options: ["True", "False"]
    answer: [0]
    explanation: Listeners process every sample. View Results Tree in particular stores responses in memory. Under load this distorts results, so disable them and use a results file.
---

## Beginner-friendly explanation

When you run a race, someone at the finish line holds a stopwatch and a clipboard. **Listeners** are JMeter's clipboard holders. Every time a request finishes, JMeter hands the result to the listeners, which either show you the details (like a photo-finish camera) or add it to a scoreboard (like a league table of averages).

Two terms first. A **percentile** answers "how long did most people wait?". The 90th percentile is the time within which 90 out of 100 requests finished. The **median** is the 50th percentile: half were faster, half slower. **Throughput** is how many requests completed per second, like customers served per minute at a till.

## Technical explanation

Add listeners with **right-click Thread Group (or Test Plan) → Add → Listener → ...**. A listener records samples from samplers in its scope.

| Listener | Use it for | Cost |
|---|---|---|
| View Results Tree | Debugging: request, response body, headers, sampler result | High: stores everything |
| Summary Report | Quick statistics per label | Low |
| Aggregate Report | Statistics including median and percentiles | Moderate: keeps values to compute percentiles |
| Simple Data Writer | Only writes results to a file | Low |

**Summary Report columns**

| Column | Meaning |
|---|---|
| Label | The sampler name; same names are grouped |
| # Samples | Number of samples |
| Average | Mean elapsed time (ms) |
| Min / Max | Fastest / slowest sample (ms) |
| Std. Dev. | How spread out the times are |
| Error % | Percentage of failed samples |
| Throughput | Samples per second/minute/hour |
| Received KB/sec, Sent KB/sec | Data volume per second |
| Avg. Bytes | Mean response size |

**Aggregate Report** adds **Median**, **90% Line**, **95% Line** and **99% Line** (the 90th/95th/99th percentiles) and keeps Average, Min, Max, Error %, Throughput, Received and Sent KB/sec.

A sample is "failed" when the response code is an error (by default 4xx/5xx), the connection fails, or an **assertion** fails. Throughput is calculated as samples ÷ (end of last sample − start of first sample).

```mermaid
flowchart LR
  S[Sampler finishes] --> A[Assertions mark pass/fail]
  A --> L1[View Results Tree: details]
  A --> L2[Summary Report: totals]
  A --> L3[Aggregate Report: percentiles]
  A --> F[Results file .jtl/.csv]
```

Every listener has **Write results to file / Read from file**. Results files (`.jtl`, CSV by default) are what you keep; in non-GUI mode you pass `-l results.jtl` and build the HTML report later, see [the HTML dashboard report](/learn/jmeter/jmeter-html-dashboard-report).

## Step-by-step walkthrough

1. Run `python -m http.server 8000` with an `index.html`.
2. Thread Group: 5 threads, ramp-up 5, loop count 20.
3. HTTP Requests: `Home page` (`/`) and `Missing page` (`/missing.html`).
4. Add **View Results Tree**, **Summary Report** and **Aggregate Report** under the Thread Group.
5. In Summary Report, under **Write results to file**, type a path such as `results/run1.csv`.
6. Start. Open each listener.
7. In View Results Tree, set the dropdown at the top to **Text** or **HTML** to change how responses are shown; tick **Errors** to see only failures.
8. Disable View Results Tree (Ctrl+T), Clear All, and run again; note that the reports still fill.

## Expected output

Illustrative Aggregate Report (your numbers will differ; local runs are very fast):

| Label | # Samples | Average | Median | 90% Line | 95% Line | 99% Line | Min | Max | Error % | Throughput | Received KB/sec |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home page | 100 | 3 | 2 | 5 | 7 | 15 | 1 | 18 | 0.00% | 45.1/sec | 22.6 |
| Missing page | 100 | 2 | 2 | 4 | 5 | 9 | 1 | 11 | 100.00% | 45.3/sec | 21.0 |
| TOTAL | 200 | 2 | 2 | 5 | 6 | 12 | 1 | 18 | 50.00% | 89.8/sec | 43.5 |

Reading it: every Missing page sample failed (404), so overall Error % is 50%. Home page's 99% Line is much higher than its median, showing occasional slow outliers.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Listener stays empty | Disabled, or placed in another Thread Group's branch | Enable; move to Test Plan level |
| JMeter slows down or runs out of memory | View Results Tree under load | Disable it; run non-GUI with `-l` |
| Error % is 0 but pages show errors | Server returns 200 with an error page | Add a Response Assertion |
| Results from previous runs mixed in | Didn't clear or file appended | Clear All; use a new file name per run |
| Percentiles look odd with few samples | Too little data | Run more iterations before drawing conclusions |

## Real-world example

A tester debugging a new script against their team's test environment keeps View Results Tree enabled while running a single thread, fixing each red sample. Before the real run they disable it, keep only a Simple Data Writer, and run in non-GUI mode. Afterwards they generate the HTML dashboard and report the 95th percentile and error rate per transaction against the agreed targets, not just averages.

A note on **Std. Dev.** (standard deviation) in the Summary Report: it measures how much response times vary around the average. A low value means times are consistent; a high value means some requests are much slower or faster than others, so check the percentiles and Max to understand why.

## Common mistakes

- **Reporting only the average.** Include percentiles and error rate.
- **Leaving View Results Tree on under load.**
- **Duplicate labels** for different requests, merging their statistics.
- **Confusing throughput with users.** 50 users may produce far more or fewer than 50 requests per second.
- **Treating 200 OK as success** without assertions.
- **Generating load against systems you do not own.**

## Key takeaways summary

Use View Results Tree to debug, Summary and Aggregate Reports to measure, and results files for anything you keep. Read percentiles alongside average, check Error %, and remember throughput is completed requests per second. Disable heavy listeners under load. Go deeper in [analysing JMeter results](/learn/jmeter/jmeter-analyzing-results).
