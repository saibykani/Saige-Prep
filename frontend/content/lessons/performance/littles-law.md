---
slug: littles-law
title: Little's Law and Concurrency
summary: Little's Law (L = λW) links concurrency, throughput and time. Use it to size virtual users for closed workloads, sanity-check test results and estimate pool sizes, with fully worked examples.
level: intermediate
duration: 35
tags: [performance, littles-law, concurrency, workload]
objectives:
  - State Little's Law and the conditions under which it holds
  - Calculate concurrency, throughput or time when the other two are known
  - Size virtual users for a closed workload using N = X × (R + Z)
  - Use Little's Law to sanity-check load test results
prerequisites:
  - Throughput, latency and percentiles
  - Basic algebra
related: [throughput-latency-and-percentiles, workload-modeling, thread-and-connection-pools, capacity-planning-and-baselines]
references:
  - title: Apache JMeter User Manual (Thread Group and timers)
    url: https://jmeter.apache.org/usermanual/index.html
  - title: Google SRE books (handling overload and capacity)
    url: https://sre.google/books/
  - title: The USE Method (Brendan Gregg)
    url: https://www.brendangregg.com/usemethod.html
interview:
  - q: State Little's Law and give a performance-testing use for it.
    a: L = λW, where L is the average number of items in the system, λ is the average arrival rate (equal to throughput in a stable system) and W is the average time each item spends in the system. In load testing I use it to size virtual users. For a closed workload the users are always either waiting for a response or thinking, so N = X × (R + Z). For 50 transactions per second with 1 s response time and 9 s think time I need 50 × 10 = 500 virtual users.
  - q: Your JMeter test has 100 threads with no timers, average response time is 0.5 s, but throughput is only 40 requests per second. What does Little's Law tell you?
    a: With no think time each thread should complete 1 / 0.5 = 2 requests per second, so 100 threads should give about 200 per second. Getting 40 means threads spend far more time somewhere other than the measured response time, or not all threads are active. I would check whether ramp-up is still in progress, whether hidden timers or pre-processors add delay, whether threads are finishing early, and whether the load generator itself is saturated.
  - q: What assumptions does Little's Law need?
    a: It applies to long-run averages in a stable system, where arrivals and departures balance over the measurement window, and the boundaries of the system are defined consistently for all three quantities. It does not need any particular arrival or service-time distribution. It does not hold during ramp-up or when queues are growing without limit.
  - q: How can Little's Law help size a database connection pool?
    a: Average connections in use = rate of queries that need a connection × average time each holds it. If 200 requests per second each hold a connection for 50 ms on average, about 200 × 0.05 = 10 connections are busy on average. Because that is an average, the pool needs headroom for bursts and variance, and I would verify it under test by watching pool wait time.
practice:
  - "Target: 30 searches per second. Response time 1.5 s, think time 8.5 s. How many virtual users do you need?"
  - "A closed test with 600 users and 11 s think time shows response time rising from 1 s to 4 s. Calculate throughput before and after."
  - "A message queue processes 120 messages per second and the average message spends 2.5 s from enqueue to completion. How many messages are in the system on average?"
takeaways:
  - L = λW holds for long-run averages in a stable system, regardless of distribution.
  - "For closed workloads: users N = throughput X × (response time R + think time Z)."
  - With fixed users, rising response time automatically lowers throughput in a closed model.
  - Use Little's Law to check whether reported throughput is consistent with threads and response time.
  - Average concurrency is not peak concurrency; size pools and capacity with headroom.
quiz:
  - id: perf-ll-q1
    type: single
    topic: littles-law
    difficulty: intermediate
    prompt: An API receives 120 requests per second and the average time in the system is 250 ms. How many requests are in progress on average?
    options: ["4.8", "30", "48", "480"]
    answer: [1]
    explanation: L = λW = 120 × 0.25 s = 30. A common slip is forgetting to convert 250 ms to 0.25 s, which gives 30,000, or multiplying by 0.025 to get 3.
  - id: perf-ll-q2
    type: scenario
    topic: littles-law
    difficulty: intermediate
    prompt: You need 25 checkouts per second. Each checkout iteration has 0.8 s of total response time and 9.2 s of think time. How many virtual users does a closed-model test need?
    options: ["25", "125", "250", "2,500"]
    answer: [2]
    explanation: N = X × (R + Z) = 25 × (0.8 + 9.2) = 25 × 10 = 250 users. Using response time only (25 × 0.8 = 20) ignores the time users spend thinking, which is the most common sizing error.
  - id: perf-ll-q3
    type: single
    topic: littles-law
    difficulty: advanced
    prompt: A closed test runs 400 users with 7 s think time. Response time is 1 s at first, then degrades to 3 s. What happens to throughput?
    options: ["It stays at 50 per second", "It drops from 50 to 40 per second", "It rises from 50 to 57 per second", "It drops from 400 to 133 per second"]
    answer: [1]
    explanation: X = N / (R + Z). Before, 400 / (1 + 7) = 50 per second; after, 400 / (3 + 7) = 40 per second. In a closed model, slower responses throttle the arrival rate, which can hide overload unless you compare throughput against the target.
  - id: perf-ll-q4
    type: truefalse
    topic: littles-law
    difficulty: intermediate
    prompt: Little's Law only applies when arrivals follow a Poisson distribution.
    options: ["True", "False"]
    answer: [1]
    explanation: Little's Law is distribution-free. It requires long-run averages in a stable system with consistent boundaries, not any specific arrival or service-time distribution.
---

## Beginner-friendly explanation

Picture a restaurant. On average, 20 guests arrive every hour and each guest stays for 1.5 hours. How many guests are inside at any moment, on average? 20 × 1.5 = **30**. You did not need to know how meals are cooked, how many waiters there are or whether guests arrive in groups. You only needed the arrival rate and the time spent inside.

That simple multiplication is **Little's Law**. It works for restaurants, supermarket queues, web servers, database connection pools and load tests, and it is the most useful formula in performance testing.

## Technical explanation

**L = λW**

| Symbol | Meaning | Performance example |
|---|---|---|
| L | Average number of items in the system | Requests in flight, busy threads, active users |
| λ (lambda) | Average arrival rate; equals throughput X when the system is stable | Requests per second |
| W | Average time each item spends in the system | Response time (plus think time, if users are the items) |

Conditions:

- It describes **long-run averages** over a window where the system is **stable**: what goes in comes out, and queues are not growing without bound. Do not apply it to ramp-up.
- It is **distribution-free**: no assumption about Poisson arrivals or service times.
- The **system boundary** must be the same for all three numbers. "Requests inside the app server" and "time inside the whole platform" cannot be mixed.

### Open systems: concurrency from rate and time

API at 120 requests per second, average response time 0.25 s: **L = 120 × 0.25 = 30** requests in flight on average.

### Closed systems: sizing virtual users

In a **closed workload** a fixed population of N users loops: send a request, wait for the response (R), think (Z), repeat. Draw the boundary around *the user* and each user is always either waiting or thinking, so:

**N = X × (R + Z)**, equivalently **X = N / (R + Z)**

| Scenario | Calculation | Result |
|---|---|---|
| Target 25 checkouts/s, R = 0.8 s, Z = 9.2 s | N = 25 × 10 | 250 users |
| 400 users, R = 1 s, Z = 7 s | X = 400 / 8 | 50 per second |
| Same 400 users, R degrades to 3 s | X = 400 / 10 | 40 per second |
| 100 threads, R = 0.5 s, no think time | X = 100 / 0.5 | 200 per second |

The third row is important: in a closed model, when the system slows down, users send work more slowly, so the load **eases off by itself**. Real public traffic (an open model) does not do that. See [workload modelling](/learn/performance/workload-modeling).

```mermaid
flowchart LR
  U["N virtual users"] -->|"send request"| S["System: response time R"]
  S -->|"response"| T["Think time Z"]
  T -->|"next iteration"| U
```

### Little's Law as a result validator

Before trusting any load test report, check that threads, throughput and time are consistent. If 100 threads with no think time and 0.5 s response time produce only 40 requests per second instead of about 200, then something else is consuming time: hidden timers, slow pre-processors, threads still ramping, threads that finished early, or a saturated load generator.

## Real-world example

A team was asked to prove that a booking service could handle 60 bookings per second. Analytics showed each booking journey contained about 4 seconds of server response time in total and roughly 26 seconds of user reading and typing. Their first test used 60 virtual users "because the target is 60 per second" and achieved only about 2 bookings per second: 60 / (4 + 26) = 2. Applying Little's Law, they needed 60 × 30 = **1,800** virtual users, and they also checked the load generators could sustain that many threads. The corrected test exposed a lock contention problem that the undersized test never reached.

## Step-by-step walkthrough

1. **Define the system boundary** (whole journey per user, one service, one pool).
2. **Get the target throughput X** from the workload model.
3. **Estimate R** from a baseline run and **Z** from analytics or agreed assumptions.
4. **Calculate N = X × (R + Z)**, then add headroom because response time will rise under load.
5. **Run the test** and re-check: does measured throughput ≈ N / (measured R + Z)?
6. **Investigate any mismatch** before reporting results.

## Code examples

A small helper used during test planning:

```python
def users_needed(throughput_per_s, response_s, think_s):
    return throughput_per_s * (response_s + think_s)

def throughput(users, response_s, think_s):
    return users / (response_s + think_s)

print(users_needed(25, 0.8, 9.2))      # checkout sizing
print(throughput(400, 1.0, 7.0))       # healthy
print(throughput(400, 3.0, 7.0))       # degraded
print(120 * 0.250)                     # open model: requests in flight
```

## Expected output

```text
250.0
50.0
40.0
30.0
```

## Common mistakes

- **Equating users with requests per second.** 100 users do not mean 100 requests per second unless R + Z = 1 s.
- **Forgetting think time** when sizing closed workloads.
- **Mixing units** (milliseconds with seconds, per minute with per second).
- **Applying it during ramp-up** or when queues are growing; the law needs a stable window.
- **Treating the average as the peak.** L is an average; pools and capacity need headroom for variance.

## Troubleshooting

- **Measured throughput is below N / (R + Z).** Look for extra delays in the script, threads that ended early, or a saturated load generator.
- **Measured throughput is above the target.** Think time or pacing may be missing or misconfigured.
- **Numbers never stabilise.** The system may be overloaded, with queues growing; reduce load to find the stable region.

## Key takeaways summary

L = λW connects how many, how fast and how long. Use N = X × (R + Z) to size closed tests, use L = λW to estimate concurrency in open systems and pools, and use both to check that a test report is internally consistent.
