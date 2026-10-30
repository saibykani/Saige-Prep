---
slug: workload-modeling
title: Workload Modelling, Think Time and Pacing
summary: A load test is only as good as its workload model. Learn to derive transaction mix and target rates from production data, choose open or closed models, and use think time and pacing correctly.
level: intermediate
duration: 40
tags: [performance, workload-model, think-time, pacing]
objectives:
  - Build a workload model with transaction mix, target rates and user journeys
  - Distinguish open and closed workload models and when each fits
  - Explain the difference between think time and pacing and calculate pacing
  - Translate a workload model into virtual users and timers
prerequisites:
  - Little's Law and concurrency
  - Throughput, latency and percentiles
related: [littles-law, performance-testing-types, jmeter-timers-and-throughput-shaping, capacity-planning-and-baselines]
references:
  - title: Apache JMeter User Manual (Thread Group, timers)
    url: https://jmeter.apache.org/usermanual/index.html
  - title: JMeter Plugins (Concurrency Thread Group, Arrivals Thread Group)
    url: https://jmeter-plugins.org/
  - title: Google SRE books
    url: https://sre.google/books/
interview:
  - q: What is the difference between an open and a closed workload model?
    a: In a closed model a fixed number of users loop through a script, and each waits for its response before sending the next request, so arrival rate depends on response time. In an open model requests arrive at a rate set by the outside world, regardless of how the system is coping, like public web traffic. If the system slows down, a closed model sends less load while an open model keeps sending and queues build up. I choose the model that matches how the real users behave.
  - q: What is the difference between think time and pacing?
    a: Think time is a delay between steps inside an iteration that imitates a user reading or typing. Pacing controls how often a whole iteration starts, for example every 30 seconds per user regardless of how long the steps took, which keeps the iteration rate per user constant. Think time shapes realism; pacing gives predictable throughput.
  - q: How do you build a workload model for a new performance test?
    a: I start from production data such as access logs, analytics or APM, pick the peak window that matters, and derive the transaction mix as percentages and absolute rates per second. I group requests into user journeys, measure or agree think times, decide whether the traffic is open or closed, add growth and event factors, and then size virtual users using Little's Law. I also specify the test data volumes and the ramp-up and steady-state durations, and get the model reviewed by product and operations.
practice:
  - "From a peak hour of 180,000 page views split 60% browse, 25% search, 10% add to cart and 5% checkout, calculate the per-second rate of each transaction."
  - "Each iteration of a script takes about 8 s including think time. You need 12 iterations per second with 300 users. What pacing should you set, and does it work?"
  - "Decide whether an internal call-centre application with a fixed number of agents is better modelled open or closed, and justify it."
takeaways:
  - Derive the workload from production evidence and the business event you are testing, not from guesses.
  - The model specifies transaction mix, target rates, journeys, think times, data and load profile.
  - Closed models self-throttle when the system slows; open models keep arriving, which is realistic for public traffic.
  - Think time imitates human delays within an iteration; pacing fixes how often iterations start.
  - "With pacing P per user, throughput per user is 1/P iterations per second, so users N = X × P."
quiz:
  - id: perf-wm-q1
    type: single
    topic: workload-modeling
    difficulty: intermediate
    prompt: The peak hour shows 36,000 searches. Searches are evenly spread. What target rate should the test use for search?
    options: ["6 per second", "10 per second", "36 per second", "600 per second"]
    answer: [1]
    explanation: 36,000 per hour / 3,600 seconds = 10 per second. 600 is the per-minute rate. Real traffic is rarely perfectly even, so you would also check the busiest minute inside that hour.
  - id: perf-wm-q2
    type: scenario
    topic: workload-modeling
    difficulty: intermediate
    prompt: You need 10 iterations per second. Each iteration takes about 6 s including think time, and you set a pacing of 30 s per user. How many virtual users are required?
    options: ["60", "100", "300", "360"]
    answer: [2]
    explanation: With pacing of 30 s, each user starts one iteration every 30 s, or 1/30 per second. N = X × P = 10 × 30 = 300 users. Pacing works because the 6 s iteration fits inside the 30 s interval; the 60 answer wrongly uses iteration duration instead of pacing.
  - id: perf-wm-q3
    type: single
    topic: workload-modeling
    difficulty: advanced
    prompt: A public website's response time doubles under load. Which model reproduces what real traffic would do?
    options: ["A closed model, because users wait for responses", "An open model, because new visitors keep arriving regardless of response time", "Either; they always give the same result", "Neither; only a soak test can show this"]
    answer: [1]
    explanation: New visitors arriving at a public site do not know the site is slow, so arrivals continue at the external rate and queues grow. A closed model would reduce its own request rate as responses slow, making overload look milder than it is.
  - id: perf-wm-q4
    type: truefalse
    topic: workload-modeling
    difficulty: beginner
    prompt: Removing all think time from a script is a good way to make a load test more realistic.
    options: ["True", "False"]
    answer: [1]
    explanation: Without think time each virtual user generates far more requests than a real user, so you need fewer users to hit the same rate, but the concurrency, sessions and caching behaviour no longer match reality. Zero think time is a deliberate stress tactic, not realism.
---

## Beginner-friendly explanation

Imagine rehearsing for opening day at a new supermarket. If you send 100 friends to the checkout all at once and nobody browses, you have learnt about checkouts, but nothing about the bakery, the aisles or the car park. A good rehearsal copies how real shoppers behave: most browse, some compare prices, fewer buy, and they pause to read labels.

A **workload model** is that rehearsal plan for software: which actions happen, how often, in what order and with what pauses. If the model is wrong, the load test measures the wrong thing, no matter how good the tooling is.

## Technical explanation

A workload model specifies:

| Element | Example |
|---|---|
| Business event and window | Peak hour on the busiest day of the season |
| Transaction mix | 60% browse, 25% search, 10% add to cart, 5% checkout |
| Target rates | Per transaction, per second, at the peak |
| User journeys | Ordered steps such as login, search, view, add, pay |
| Think time | Human delays between steps, often a range or distribution |
| Pacing | How often each user starts a new iteration |
| Model type | Open or closed |
| Data | Number of users, products and orders; uniqueness rules |
| Profile | Ramp-up, steady-state duration, ramp-down |

### Worked example: from logs to rates

A peak hour of 180,000 page views (illustrative numbers):

| Transaction | Share | Per hour | Per second |
|---|---|---|---|
| Browse | 60% | 108,000 | 30 |
| Search | 25% | 45,000 | 12.5 |
| Add to cart | 10% | 18,000 | 5 |
| Checkout | 5% | 9,000 | 2.5 |
| Total | 100% | 180,000 | 50 |

An hourly average hides peaks within the hour, so also check the busiest minute and decide whether to design for it.

### Open versus closed

- **Closed model:** a fixed population of users loop; each waits for a response before continuing. Arrival rate = N / (R + Z), so it falls when response time rises. It fits systems with a bounded user base, such as an internal tool used by a fixed number of agents.
- **Open model:** arrivals are driven externally at rate λ, independent of response time. It fits public websites and APIs. When the system slows, requests still arrive and queues grow, which is the behaviour you need to see.

JMeter's standard Thread Group is naturally closed. To approximate an open model you can drive arrivals by rate: the built-in Precise Throughput Timer or Constant Throughput Timer (as long as enough threads are available), or the **Arrivals Thread Group** from the third-party JMeter Plugins project. See [timers and throughput shaping](/learn/performance/jmeter-timers-and-throughput-shaping).

### Think time versus pacing

- **Think time** is the pause *between steps* inside an iteration (reading a page, filling a form). It controls realism and per-user request rate.
- **Pacing** is the interval *between iteration starts* for a user. If pacing is 30 s and the iteration finishes in 6 s, the user waits 24 s before starting again. If the iteration takes longer than the pacing interval, the target rate cannot be met.

With pacing P, each user produces 1/P iterations per second, so **N = X × P**. For 10 iterations per second at P = 30 s you need 300 users.

```mermaid
sequenceDiagram
  participant U as Virtual user
  participant S as System
  U->>S: Step 1 (login)
  Note over U: think time 3 s
  U->>S: Step 2 (search)
  Note over U: think time 2 s
  U->>S: Step 3 (checkout)
  Note over U: wait until 30 s pacing interval ends
  U->>S: Next iteration starts
```

## Real-world example

A retail team load-tested checkout at 100 requests per second with no think time and 20 threads. Everything passed. In production, the season's peak produced many more simultaneous sessions, each holding a cart in a session store. Because the test used only 20 threads, the session store held only 20 sessions and its memory limit was never approached. Rebuilding the model from access logs, with realistic think time and thousands of concurrent users, reproduced the session store evictions that had caused carts to empty.

## Step-by-step walkthrough

1. **Choose the business event** (normal peak, sale day, month-end).
2. **Extract evidence** from logs, analytics or APM for that window; never invent rates.
3. **Calculate mix and per-second rates**, then check the busiest minute.
4. **Define journeys and think times** from observed session behaviour.
5. **Pick open or closed** based on who generates the traffic.
6. **Size users** with [Little's Law](/learn/performance/littles-law) and set pacing where you need fixed rates.
7. **Define data and profile**, then review the model with product and operations before scripting.

## Code examples

Pacing logic in plain Python, showing why iterations must fit inside the interval:

```python
import time

PACING_S = 30

def run_user(iterations, do_iteration):
    for _ in range(iterations):
        started = time.monotonic()
        do_iteration()                       # steps plus think times
        elapsed = time.monotonic() - started
        remaining = PACING_S - elapsed
        if remaining > 0:
            time.sleep(remaining)            # wait for the next slot
        else:
            print(f"pacing missed by {-remaining:.1f} s")
```

## Expected output

When iterations take about 6 s, the loop sleeps about 24 s and prints nothing. If the system slows so an iteration takes 34 s, it prints:

```text
pacing missed by 4.0 s
```

That message means the per-user rate has fallen below 1/30 per second and the test is no longer delivering the planned throughput.

## Common mistakes

- **Using averages over a whole day** instead of the peak window.
- **Testing one transaction in isolation** when the real risk is the mix competing for shared resources.
- **Zero think time** described as "realistic".
- **Pacing shorter than the iteration**, so the rate silently drops.
- **Closed model for public traffic**, which hides overload.
- **Too little test data**, so every user hits the same cached record.

## Troubleshooting

- **Throughput below target although user count looks right.** Recalculate with the measured response time; add users or shorten think time within realistic limits.
- **No production data exists.** Use business forecasts, document every assumption and revisit after launch.
- **The mix drifts during the test.** Use a throughput controller or separate thread groups per journey so each rate is controlled explicitly.

## Key takeaways summary

Model the workload from evidence, decide whether it is open or closed, use think time for realism and pacing for predictable rates, and size users with Little's Law. A precise model turns a load test into a meaningful prediction.
