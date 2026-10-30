---
slug: resource-utilization-and-bottlenecks
title: CPU, Memory, Disk, Network and Bottlenecks
summary: Response times tell you that a system is slow; resource metrics tell you why. Learn utilization, saturation and errors for CPU, memory, disk and network, how to spot the bottleneck, and the USE method for checking them systematically.
level: intermediate
duration: 40
tags: [performance, monitoring, bottlenecks, use-method]
objectives:
  - Define utilization, saturation and errors for each hardware resource
  - Read key CPU, memory, disk and network metrics during a load test
  - Identify the bottleneck resource using the USE method
  - Recognise load-generator bottlenecks that invalidate a test
prerequisites:
  - Throughput, latency and percentiles
  - Performance testing types
related: [throughput-latency-and-percentiles, thread-and-connection-pools, database-and-caching-bottlenecks, monitoring-with-influxdb-grafana, analyzing-performance-results, littles-law]
references:
  - title: The USE Method (Brendan Gregg)
    url: https://www.brendangregg.com/usemethod.html
  - title: Google SRE books (monitoring distributed systems)
    url: https://sre.google/books/
  - title: Grafana documentation
    url: https://grafana.com/docs/
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: What is a bottleneck?
    a: The resource that limits the throughput of the whole system - the narrowest point. When load increases, it saturates first, requests start queuing in front of it, and response time rises while throughput flattens. It can be hardware like CPU or disk, or a software limit like a thread pool, connection pool or lock.
  - q: Explain the USE method.
    a: For every resource, check Utilization - how busy it is over time, Saturation - how much work is queued waiting for it, and Errors - error events. Going through CPU, memory, disk, network and software resources like pools with those three questions is a quick, systematic way to find the bottleneck instead of guessing.
  - q: CPU is at 40% but response time is climbing. What could be wrong?
    a: Something other than CPU is the bottleneck. Average CPU may hide one core at 100% for a single-threaded component. Or threads are waiting rather than working - on a database, a lock, a connection pool, disk I/O, a slow downstream call or garbage collection pauses. I would check saturation metrics - run queue, pool wait times, disk queue and latency, GC pauses - and thread dumps.
  - q: How do you know the load generator is not the bottleneck?
    a: I monitor the load generator itself - CPU, memory, network and, for JMeter, heap and GC. If its CPU is near 100% or the JVM is in heavy GC, the measured response times include client-side delay. I run JMeter in non-GUI mode, avoid heavy listeners, and if needed distribute load across machines.
practice:
  - "During any load test you run in your own lab, record CPU, memory, disk and network for the app server and the load generator every minute. Which saturated first?"
  - "Apply the USE checklist to a database server: list one utilization, saturation and error metric for each resource."
  - "Explain why a memory leak shows up in an endurance test but not in a 10-minute load test."
takeaways:
  - Utilization, saturation and errors - check all three for every resource.
  - The bottleneck saturates first; response time rises while throughput flattens.
  - Averages hide hot cores, spikes and per-process limits.
  - Software resources (pools, locks, queues) are bottlenecks too.
  - Always monitor the load generator so the test itself isn't the limit.
quiz:
  - id: perfres-q1
    type: single
    topic: resource-utilization-and-bottlenecks
    difficulty: intermediate
    prompt: As load rises, throughput stops increasing and response time climbs steeply. What does this pattern usually mean?
    options: ["The system has spare capacity", "A resource has saturated and requests are queuing", "The test is too short", "The network is idle"]
    answer: [1]
    explanation: When a bottleneck saturates, extra load cannot be processed faster, so it waits in queues. Throughput plateaus and latency rises - the classic knee of the curve.
  - id: perfres-q2
    type: multiple
    topic: resource-utilization-and-bottlenecks
    difficulty: intermediate
    prompt: Which are saturation metrics (not utilization)? Select all that apply.
    options: ["CPU run-queue length / load average above core count", "Disk average queue length", "CPU percent busy", "Swap-in/swap-out activity", "Connection-pool threads waiting for a connection"]
    answer: [0, 1, 3, 4]
    explanation: Saturation measures queued or extra work - run queues, disk queues, swapping and pool waiters. CPU percent busy is utilization.
  - id: perfres-q3
    type: scenario
    topic: resource-utilization-and-bottlenecks
    difficulty: advanced
    prompt: In a 6-hour endurance test, response time slowly rises, heap usage after each GC keeps creeping up, and GC pauses grow longer. What is the most likely cause?
    options: ["Network bandwidth limit", "A memory leak in the application", "Disk is full", "Think time is too short"]
    answer: [1]
    explanation: Rising post-GC heap means objects are retained and never freed. The JVM spends more time collecting, which slows requests. Endurance tests exist to catch exactly this.
  - id: perfres-q4
    type: truefalse
    topic: resource-utilization-and-bottlenecks
    difficulty: beginner
    prompt: If average CPU on an 8-core server is 15%, CPU cannot be the bottleneck.
    options: ["True", "False"]
    answer: [1]
    explanation: A single-threaded process can max out one core (about 12.5% of 8 cores) and be the bottleneck. Check per-core and per-process CPU, not just the average.
---

## Beginner-friendly explanation

Think of a busy restaurant. There are cooks (CPU), counter space for ingredients (memory), a storeroom you fetch things from (disk), and waiters carrying plates (network). If dinner service gets slow, it is usually because **one** of these is overloaded: maybe there are plenty of waiters, but only two cooks, so orders pile up in the kitchen.

That overloaded part is the **bottleneck**. Adding more waiters won't help; you need to find the kitchen queue. In performance testing, response times tell you the restaurant is slow. **Resource metrics** tell you which part of the restaurant is the problem.

## Technical explanation

Brendan Gregg's **USE method** checks every resource for:

- **Utilization** — the percentage of time the resource was busy.
- **Saturation** — extra work that can't be served and is waiting (queues).
- **Errors** — error events (failed I/O, dropped packets, out-of-memory kills).

| Resource | Utilization | Saturation | Errors |
|---|---|---|---|
| CPU | % busy, per core and per process | Run-queue length; load average vs core count; CPU throttling in containers | — |
| Memory | Used vs available; JVM heap after GC | Swapping, paging; long or frequent GC pauses | Out-of-memory errors, OOM-killed containers |
| Disk | % busy, IOPS, throughput (MB/s) | Queue length, I/O wait, rising I/O latency | I/O errors |
| Network | Bandwidth used vs link capacity | Retransmits, socket backlogs | Dropped packets, connection resets |
| Software (pools, locks) | Active threads/connections vs max | Waiters for a pool or lock | Pool timeouts, rejected tasks |

Why this matters: as load approaches a resource's capacity, **queueing** makes response time rise sharply rather than linearly. Throughput then plateaus — see [throughput, latency and percentiles](/learn/performance/throughput-latency-and-percentiles) and [Little's Law](/learn/performance/littles-law).

```mermaid
flowchart TD
  S[Response time rising?] --> T{Throughput still increasing?}
  T -- Yes --> L[Not saturated yet; keep raising load]
  T -- No --> U[Check USE for each resource]
  U --> C{CPU saturated?}
  C -- Yes --> CP[Profile hot code, scale CPU]
  C -- No --> M{Memory / GC?}
  M -- Yes --> MP[Heap, leaks, GC tuning]
  M -- No --> D{Disk or network queues?}
  D -- Yes --> DP[I/O, payload size, bandwidth]
  D -- No --> P[Software limits: pools, locks, downstream calls]
```

**Common bottleneck signatures:**

- **CPU-bound:** CPU near 100%, run queue grows; response time scales with load.
- **Memory / GC:** heap after GC creeps up (leak) or GC pauses spike; latency has periodic jumps.
- **Disk-bound:** high I/O wait, disk latency rises; common for databases and logging.
- **Network-bound:** link near capacity, often from large payloads or uncompressed responses.
- **Pool or lock-bound:** low hardware use but many threads waiting — see [thread and connection pools](/learn/performance/thread-and-connection-pools).

**Don't forget the load generator.** If the JMeter machine is saturated, the test measures JMeter, not your app. Use non-GUI mode and light listeners ([non-GUI and distributed testing](/learn/jmeter/jmeter-non-gui-and-distributed)).

## Real-world example

A team load-tested an order API. At 300 requests per second the 95th percentile jumped from 200 ms to 2 s, but application servers showed CPU at 35%. The tester walked through USE: memory fine, network fine, app disk fine. The **database** server, which nobody had been monitoring, showed disk queue length climbing and high I/O wait — every order wrote a verbose audit row to a slow volume with synchronous commits. Moving audit writes to an asynchronous queue and faster storage moved the knee past 900 requests per second. The lesson: monitor every tier, not just the app server.

## Step-by-step walkthrough

1. **List every component** in the request path: load balancer, app servers, cache, database, queues, external calls, and the load generator.
2. **Set up monitoring** for each before the test (OS metrics, JVM metrics, database metrics). See [monitoring with InfluxDB and Grafana](/learn/performance/monitoring-with-influxdb-grafana).
3. **Run a step-load test**, increasing load in stages and holding each stage long enough to stabilise.
4. **Find the knee:** the stage where throughput stops rising and latency jumps.
5. **At the knee, apply USE** to each resource; look for the first one saturating.
6. **Confirm the hypothesis:** relieve that bottleneck (in a test environment) and rerun; the knee should move.
7. **Record** metrics, timestamps and conclusions with the test results.

### Example findings table

| Load (req/s) | p95 (ms) | Throughput (req/s) | App CPU | DB disk queue | Notes |
|---|---|---|---|---|---|
| 100 | 180 | 100 | 15% | 0.2 | Healthy |
| 200 | 210 | 199 | 25% | 0.8 | Healthy |
| 300 | 2,100 | 240 | 35% | 12 | DB disk saturated |

(Illustrative values for the scenario above, not benchmarks.)

## Common mistakes

- **Monitoring only the application server.** Bottlenecks often live in the database, cache or load generator.
- **Looking only at utilization**, missing saturation such as queues and waiters.
- **Trusting averages** — one hot core, short spikes and per-container limits disappear in averages.
- **Ignoring GC** in JVM or .NET services.
- **Changing several things at once** after finding a suspect, so you can't prove the cause.
- **Running load tests against systems you are not authorised to test.**

## Key takeaways summary

Response times say "slow"; resources say "why". Monitor every tier, find the knee, and for each resource check utilization, saturation and errors. The first resource to saturate is your bottleneck — prove it by relieving it and watching the knee move.
