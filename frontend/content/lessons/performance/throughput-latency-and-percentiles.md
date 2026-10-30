---
slug: throughput-latency-and-percentiles
title: Throughput, Latency and Percentiles
summary: Learn the core performance metrics, how to calculate percentiles such as p50, p90, p95 and p99 from raw samples, why averages mislead, and how throughput and error rate complete the picture.
level: beginner
duration: 35
tags: [performance, metrics, percentiles, statistics]
objectives:
  - Distinguish latency, response time, throughput and error rate
  - Calculate p50, p90, p95 and p99 from a sorted data set using the nearest-rank method
  - Explain why the arithmetic mean hides tail latency
  - Calculate throughput (TPS) from a test's sample count and duration
prerequisites:
  - Basic arithmetic (sorting, averages)
  - Load, stress and other performance test types
related: [performance-testing-types, littles-law, analyzing-performance-results, capacity-planning-and-baselines]
references:
  - title: Apache JMeter User Manual (listeners, glossary and dashboard report)
    url: https://jmeter.apache.org/usermanual/index.html
  - title: Google SRE books (service level indicators and percentiles)
    url: https://sre.google/books/
  - title: Grafana documentation
    url: https://grafana.com/docs/
interview:
  - q: Why do performance engineers prefer percentiles over averages?
    a: The mean is pulled by a few very slow requests but also hides them, because it blends them into one number that no real user experienced. A p95 of 800 ms says 95% of requests completed in 800 ms or less, which maps directly to user experience and to SLOs. I usually report p50 for the typical case and p95 or p99 for the tail, alongside throughput and error rate.
  - q: Can you average percentiles from several servers or time windows?
    a: No. The mean of several p95 values is not the p95 of the combined data, because percentiles are not additive. To get the true combined percentile you need the raw samples or a mergeable structure such as a histogram. Averaging percentiles in a dashboard is a common way to report a tail that looks better than reality.
  - q: What is throughput and how do you calculate it?
    a: Throughput is completed work per unit of time, for example requests or business transactions per second. You calculate it as the number of completed samples divided by the elapsed time of the measurement window, ideally the steady-state window only. 54,000 requests in a 30-minute steady state is 54,000 / 1,800 s = 30 requests per second.
  - q: What is the difference between latency and response time?
    a: Strictly, latency is the time spent waiting, for example until the first byte of the response arrives, while response time is the full time the client experiences until the last byte is received. Tools differ in naming; JMeter, for instance, reports Latency as time to first response and Elapsed as the full sample time. Always check which one a report means.
practice:
  - "Given the response times 210, 180, 950, 200, 190, 230, 220, 205, 3100, 215 ms, sort them and calculate the mean, p50, p90 and p99 using the nearest-rank method."
  - "A 15-minute steady-state window recorded 81,000 successful and 900 failed requests. Calculate total throughput, successful throughput and error rate."
  - "Explain to a product manager, in three sentences, why the average response time on the dashboard looks fine while users complain."
takeaways:
  - Response time is what the user experiences; throughput is completed work per second; error rate is failed work as a share of all work.
  - The p-th percentile is the value at or below which p% of samples fall; p95 = 800 ms means 95% of requests took 800 ms or less.
  - The mean hides the tail; always report a high percentile alongside p50.
  - Percentiles cannot be averaged; merge raw data or histograms instead.
  - With few samples, high percentiles are unstable; p99 of 10 samples is simply the maximum.
quiz:
  - id: perf-tlp-q1
    type: single
    topic: throughput-latency-and-percentiles
    difficulty: intermediate
    prompt: "Sorted response times (ms): 100, 110, 120, 130, 140, 150, 160, 170, 600, 1500. Using the nearest-rank method (rank = ceiling of p/100 × N), what is p90?"
    options: ["170 ms", "600 ms", "1050 ms", "1500 ms"]
    answer: [1]
    explanation: N = 10, so the rank for p90 is ceiling(0.9 × 10) = 9. The 9th value is 600 ms. 1500 ms is the 10th value (p95 and p99 here); 1050 ms would come from interpolating between values, which this method does not do.
  - id: perf-tlp-q2
    type: single
    topic: throughput-latency-and-percentiles
    difficulty: beginner
    prompt: For the same ten samples (100, 110, 120, 130, 140, 150, 160, 170, 600, 1500 ms), what is the arithmetic mean?
    options: ["145 ms", "298 ms", "318 ms", "600 ms"]
    answer: [2]
    explanation: The first eight values sum to 1,080 ms; adding 600 and 1,500 gives 3,180 ms, and 3,180 / 10 = 318 ms. The p50 here is only 140 ms, so the mean sits above 8 of the 10 samples, which is exactly how two slow outliers distort an average.
  - id: perf-tlp-q3
    type: single
    topic: throughput-latency-and-percentiles
    difficulty: beginner
    prompt: A 20-minute steady-state window recorded 72,000 completed requests. What is the throughput?
    options: ["36 requests per second", "60 requests per second", "120 requests per second", "3,600 requests per second"]
    answer: [1]
    explanation: 20 minutes is 1,200 seconds, and 72,000 / 1,200 = 60 requests per second. 3,600 is the per-minute rate, a common unit slip.
  - id: perf-tlp-q4
    type: truefalse
    topic: throughput-latency-and-percentiles
    difficulty: intermediate
    prompt: If server A reports p95 = 400 ms and server B reports p95 = 600 ms with equal traffic, the p95 across both servers is 500 ms.
    options: ["True", "False"]
    answer: [1]
    explanation: Percentiles are not additive, so averaging them is invalid. The combined p95 depends on the full distributions and can be anywhere from 400 ms to 600 ms or close to either; you need the raw samples or merged histograms.
---

## Beginner-friendly explanation

Imagine a coffee shop. Three things matter to the owner: **how long each customer waits** (response time), **how many coffees are served per hour** (throughput) and **how many orders go wrong** (error rate).

Now suppose nine customers wait two minutes and one waits forty minutes. The *average* wait is almost six minutes, a number that describes nobody's real experience. It makes the nine happy customers look worse off and hides how badly the tenth was treated. A better summary is: "half of customers waited two minutes or less, and nine in ten waited two minutes or less, but the slowest waited forty." That is what **percentiles** give you.

## Technical explanation

| Metric | Definition | Typical unit |
|---|---|---|
| **Response time** | Time from sending a request to receiving the complete response, as seen by the client | ms |
| **Latency** | Time spent waiting; in JMeter, time until the first part of the response arrives | ms |
| **Throughput** | Completed requests or transactions per unit of time | req/s, TPS |
| **Error rate** | Failed samples / total samples × 100 | % |
| **Concurrency** | Requests in progress at the same time | count |

**Throughput** = completed samples / elapsed seconds of the measurement window. Measure it over the **steady state**, excluding ramp-up and ramp-down. TPS usually means business transactions per second (one "checkout" may involve several HTTP requests), so always say which unit you mean.

### Percentiles

The **p-th percentile** is the value at or below which p% of the samples fall. A simple, widely taught definition is the **nearest-rank method**:

1. Sort the N samples in ascending order.
2. rank = ceiling(p / 100 × N).
3. The percentile is the value at that rank (counting from 1).

Tools use different interpolation methods, so small data sets can give slightly different answers in different tools. Check the documentation of the tool you report from.

### Worked example

Ten response times, already sorted (ms):

| Rank | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Value | 120 | 130 | 140 | 150 | 160 | 170 | 180 | 200 | 900 | 2400 |

| Statistic | Calculation | Result |
|---|---|---|
| Mean | 4,550 / 10 | 455 ms |
| p50 | ceiling(0.50 × 10) = rank 5 | 160 ms |
| p90 | ceiling(0.90 × 10) = rank 9 | 900 ms |
| p95 | ceiling(0.95 × 10) = 9.5, rounded up to rank 10 | 2,400 ms |
| p99 | ceiling(0.99 × 10) = 9.9, rounded up to rank 10 | 2,400 ms |

Notice:

- The **mean (455 ms) is slower than 8 of the 10 requests** yet far faster than the slowest two. It describes nobody.
- **p50 (160 ms)** shows the typical experience; **p90 and above** expose the tail.
- With only 10 samples, p95 and p99 are both the maximum. High percentiles need many samples to be meaningful: p99 is only stable with thousands of samples.

### Why averages mislead

- A few very slow requests inflate the mean, while the mean still hides **how slow** they were.
- Two systems can have the same mean with completely different tails.
- In a real page load, a user often makes many requests, so the chance of hitting at least one tail request is much higher than for a single request. Tail percentiles matter more than intuition suggests.

### Never average percentiles

The p95 of server A and the p95 of server B cannot be averaged into a combined p95, and per-minute p95 values cannot be averaged into an hourly p95. Combine **raw samples** or **histograms** instead.

## Real-world example

A team's dashboard showed an average checkout response time of about 450 ms, comfortably inside their 1-second target, yet support tickets about slow checkouts kept arriving. When they plotted p50 and p99 from the raw results, p50 was low but p99 was several seconds. The slow tail came from requests that missed the cache and hit a slow database query. The average had blended a fast majority with a painful minority. They changed their objective to "p95 under 800 ms and p99 under 2 s" and fixed the uncached query path.

## Step-by-step walkthrough

1. **Collect raw samples** for the steady-state window (for example JMeter's `.jtl` results file).
2. **Filter** to one transaction type; mixing a fast health check with a slow search distorts every statistic.
3. **Separate errors**: report error rate, and calculate response-time percentiles for successful samples as well as all samples, since fast failures can make percentiles look better.
4. **Calculate** throughput, p50, p90, p95, p99 and maximum.
5. **Compare** against the objective, and look at the percentiles over time, not just one summary.

## Code examples

Computing the worked example in Python with the nearest-rank method:

```python
import math

samples = [120, 130, 140, 150, 160, 170, 180, 200, 900, 2400]

def percentile(values, p):
    ordered = sorted(values)
    rank = math.ceil(p * len(ordered) / 100)
    return ordered[max(rank, 1) - 1]

mean = sum(samples) / len(samples)
print(f"mean={mean:.0f} ms")
for p in (50, 90, 95, 99):
    print(f"p{p}={percentile(samples, p)} ms")

window_seconds = 30 * 60
completed = 54_000
print(f"throughput={completed / window_seconds:.1f} req/s")
```

## Expected output

```text
mean=455 ms
p50=160 ms
p90=900 ms
p95=2400 ms
p99=2400 ms
throughput=30.0 req/s
```

## Common mistakes

- **Reporting only the average.** Always include a tail percentile.
- **Averaging percentiles** across servers, transactions or time windows.
- **Including ramp-up in throughput.** It lowers the measured rate and mixes cold and warm behaviour.
- **Mixing transaction types** in one percentile.
- **Quoting p99 from a tiny sample.** With 50 samples, p99 is effectively the maximum.
- **Ignoring errors.** Fast 500 responses can make response times look excellent.

## Troubleshooting

- **Your p95 differs from the tool's p95.** Check the interpolation method and whether the tool includes failed samples.
- **p99 jumps between runs.** You probably have too few samples; run longer or report p95.
- **Throughput is lower than planned.** Use [Little's Law](/learn/performance/littles-law) to check whether you have enough virtual users for the response time you are seeing.

## Key takeaways summary

Measure throughput over the steady state, report p50 for the typical case and p95 or p99 for the tail, keep errors visible, and never trust or average a single summary number. Percentiles describe real user experience; averages describe nobody.
