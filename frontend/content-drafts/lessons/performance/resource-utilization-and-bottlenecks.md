---
slug: resource-utilization-and-bottlenecks
title: CPU, Memory, Disk, Network and Bottlenecks
summary: Learn to find what limits a system's throughput. Apply the USE method (utilization, saturation, errors) to CPU, memory, disk, network and software resources, and use the utilization law and basic queueing to explain why response time rises before 100%.
level: intermediate
duration: 40
tags: [performance, monitoring, bottlenecks, use-method]
objectives:
  - Apply the USE method to hardware and software resources
  - Distinguish utilization from saturation and explain why both matter
  - Calculate utilization with U = X × S and estimate maximum throughput
  - Explain why response time rises sharply as utilization approaches 100%
prerequisites:
  - Throughput, latency and percentiles
  - Little's Law
  - Basic operating system concepts (processes, memory, disks)
related: [thread-and-connection-pools, database-and-caching-bottlenecks, analyzing-performance-results, monitoring-with-influxdb-grafana]
references:
  - title: The USE Method (Brendan Gregg)
    url: https://www.brendangregg.com/usemethod.html
  - title: Google SRE books (monitoring distributed systems)
    url: https://sre.google/books/
  - title: Grafana documentation
    url: https://grafana.com/docs/
interview:
  - q: Explain the USE method.
    a: For every resource, check Utilization, Saturation and Errors. Utilization is how busy the resource is, saturation is how much extra work is waiting for it, and errors are failures such as dropped packets or disk errors. I apply it to hardware like CPU, memory, disks and network interfaces, and also to software resources such as thread pools and connection pools. It gives a systematic checklist so I do not stop at the first odd-looking graph.
  - q: Why can response time be poor when CPU utilization is only 70%?
    a: Several reasons. Averages over a minute can hide short periods at 100%. A single hot thread can saturate one core while the average across many cores looks moderate. And the bottleneck may be a different resource entirely, such as a lock, a connection pool, disk I/O or a downstream dependency, where requests are waiting rather than computing. Also, queueing delay grows quickly well before 100%, so 70% can already add noticeable waiting at that resource.
  - q: How do you estimate the maximum throughput of a resource?
    a: With the utilization law U = X × S, where S is the service demand per request at that resource. If a request uses 20 ms of CPU and there are 4 cores, maximum throughput is 4 / 0.02 = 200 per second at 100%. In practice I plan for a lower utilization target, because queueing makes response times climb steeply near saturation.
practice:
  - "Each request needs 15 ms of CPU on an 8-core server. Calculate the maximum throughput and the CPU utilization at 300 requests per second."
  - "Write a USE checklist (one metric each for utilization, saturation and errors) for CPU, memory, disk and network on a Linux host."
  - "Explain to a developer why a database disk at 60% utilization can still be the bottleneck."
takeaways:
  - "A bottleneck is the resource that limits throughput; find it with Utilization, Saturation and Errors."
  - Saturation (queueing) is often the clearest signal; high utilization alone is not a defect.
  - "U = X × S: utilization equals throughput times service demand; maximum throughput is capacity divided by S."
  - Response time grows non-linearly as utilization approaches 100%, so plan for headroom.
  - Apply USE to software resources (pools, locks, queues), not just hardware.
quiz:
  - id: perf-res-q1
    type: single
    topic: resource-utilization-and-bottlenecks
    difficulty: intermediate
    prompt: Each request consumes 20 ms of CPU. The server has 4 cores. What is the CPU utilization at 150 requests per second?
    options: ["30%", "60%", "75%", "300%"]
    answer: [2]
    explanation: CPU demand is 150 × 0.02 = 3 core-seconds per second. With 4 cores, U = 3 / 4 = 75%. 300% is the single-core figure without dividing by the 4 cores.
  - id: perf-res-q2
    type: single
    topic: resource-utilization-and-bottlenecks
    difficulty: intermediate
    prompt: Using the same numbers (20 ms CPU per request, 4 cores), what is the theoretical maximum throughput limited by CPU?
    options: ["50 per second", "200 per second", "400 per second", "800 per second"]
    answer: [1]
    explanation: Maximum throughput is capacity divided by service demand, 4 / 0.02 = 200 per second at 100% CPU. In practice you would plan well below this because queueing delay rises steeply near saturation.
  - id: perf-res-q3
    type: multiple
    topic: resource-utilization-and-bottlenecks
    difficulty: intermediate
    prompt: Which observations are signs of saturation rather than just utilization? Select all that apply.
    options: ["CPU run-queue length consistently above the number of cores", "Swapping or paging activity on a server", "Disk average queue size growing during the test", "CPU at 60% with an empty run queue"]
    answer: [0, 1, 2]
    explanation: Saturation means work is waiting: a run queue longer than the core count, memory pressure forcing paging, and a growing disk queue. 60% CPU with nothing waiting is utilization without saturation.
  - id: perf-res-q4
    type: truefalse
    topic: resource-utilization-and-bottlenecks
    difficulty: beginner
    prompt: The USE method should also be applied to software resources such as connection pools and locks.
    options: ["True", "False"]
    answer: [0]
    explanation: Brendan Gregg's USE method explicitly covers software resources. A connection pool has utilization (connections in use), saturation (threads waiting for a connection) and errors (acquisition timeouts).
---

## Beginner-friendly explanation

Think of a motorway. Traffic flows smoothly until one point where three lanes merge into one. However wide the rest of the road is, the merge decides how many cars per hour get through, and the queue forms just before it. That merge is the **bottleneck**.

Every computer system has a merge point too: a busy CPU, a slow disk, a full network link, or a small pool of database connections. Performance analysis is the search for that merge point. The **USE method** is a simple checklist that stops you guessing: for every resource, ask how busy it is, whether work is queueing for it, and whether it is reporting errors.

## Technical explanation

### The USE method

Defined by Brendan Gregg, the method says: **for every resource, check Utilization, Saturation and Errors.**

- **Utilization:** the share of time the resource was busy (or the share of its capacity in use).
- **Saturation:** the amount of work waiting because the resource cannot serve it yet, usually a queue.
- **Errors:** the count of error events.

| Resource | Utilization | Saturation | Errors |
|---|---|---|---|
| CPU | % busy per core and overall | Run-queue length above core count; throttling in containers | Machine-check errors (rare) |
| Memory | Used versus available | Paging or swapping; out-of-memory kills; GC pressure in a JVM | Allocation failures |
| Disk | Device busy %, throughput | Average queue size, await time | Device I/O errors |
| Network | Throughput versus link bandwidth | Drops, retransmits, socket backlog overflows | Interface errors |
| Thread pool | Busy threads / max | Tasks waiting in the queue | Rejected tasks |
| Connection pool | Active / max connections | Threads waiting for a connection | Acquisition timeouts |

On Linux, common sources include `vmstat` (run queue, swap), `mpstat` (per-CPU), `iostat -x` (device utilization, queue, await), `sar -n DEV` (network), and `dmesg` (errors). Note that disk "% utilization" can understate capacity for devices that serve many requests in parallel, such as SSDs and arrays; queue size and latency are more telling there.

### Utilization law

**U = X × S**: utilization equals throughput times the service demand per request at that resource. With 20 ms of CPU per request on 4 cores:

| Throughput | CPU demand | Utilization |
|---|---|---|
| 50/s | 1.0 core | 25% |
| 100/s | 2.0 cores | 50% |
| 150/s | 3.0 cores | 75% |
| 200/s | 4.0 cores | 100% (theoretical maximum) |

### Why response time rises before 100%

Requests arrive unevenly, so they sometimes collide and wait. In the simplest single-server queueing model (M/M/1), response time R = S / (1 − U). For S = 20 ms:

| Utilization | Response time |
|---|---|
| 50% | 40 ms |
| 80% | 100 ms |
| 90% | 200 ms |
| 95% | 400 ms |

Real systems differ from this idealised model, but the shape holds: the curve bends sharply upward as utilization approaches 100%. That is why capacity plans target headroom.

```mermaid
flowchart TD
  A["Symptom: high p95 or low throughput"] --> B["List resources on the request path"]
  B --> C{"For each: Errors?"}
  C -->|"yes"| D["Investigate errors first"]
  C -->|"no"| E{"Saturated: queue or waiting?"}
  E -->|"yes"| F["Likely bottleneck: confirm with timing data"]
  E -->|"no"| G{"High utilization?"}
  G -->|"yes"| H["Approaching limit: candidate"]
  G -->|"no"| B
```

## Real-world example

A team's search API missed its p95 objective at the target load, and CPU on the application servers averaged only around 50%. Applying USE methodically: CPU run queue was low and memory showed no paging, but the application's HTTP client pool to a downstream pricing service was fully used with a growing wait queue. The downstream service itself was healthy. Requests were not computing; they were *waiting* for one of a handful of outbound connections. Raising the client pool size, after confirming the pricing service had capacity, brought p95 within the objective. Looking only at CPU would never have found it.

## Step-by-step walkthrough

1. **Draw the request path**: load balancer, app servers, pools, caches, database, downstream services.
2. **List resources** at each hop, including software resources.
3. **Collect U, S, E metrics** at fine granularity (10 seconds or less) during the test.
4. **Correlate with load steps**: which saturation metric rises first as load increases?
5. **Confirm with timing data**: traces, slow-query logs or thread dumps showing where time goes.
6. **Change one thing**, re-run the same test and compare.

## Code examples

A quick USE snapshot on a Linux host during a test:

```bash
vmstat 5 3          # r = run queue, si/so = swap in/out
mpstat -P ALL 5 1   # per-CPU utilization
iostat -x 5 2       # %util, aqu-sz (queue), r_await/w_await
sar -n DEV 5 1      # network throughput per interface
sar -n EDEV 5 1     # network errors and drops
```

Utilization-law helper:

```python
def utilization(throughput_per_s, service_demand_s, servers):
    return throughput_per_s * service_demand_s / servers

print(f"{utilization(150, 0.020, 4):.0%}")
print(f"max throughput = {4 / 0.020:.0f}/s")
```

## Expected output

```text
75%
max throughput = 200/s
```

For `vmstat`, a run-queue column `r` consistently larger than the number of CPUs indicates CPU saturation; non-zero `si`/`so` columns indicate memory pressure.

## Common mistakes

- **Only looking at CPU and memory** and missing pools, locks and downstream dependencies.
- **Averages over long intervals**, which hide short saturation bursts.
- **Treating high utilization as a defect.** 85% CPU with no queueing and met objectives is efficient, not broken.
- **Ignoring the load generator**, which is also a resource that can saturate.
- **Changing several things at once**, so you cannot tell which change helped.

## Troubleshooting

- **No resource looks saturated but response time is high.** Look for waiting: locks, pool waits, synchronous calls to slow dependencies, or garbage-collection pauses.
- **Container shows low CPU but the app is slow.** Check CPU throttling against the container's CPU limit.
- **Metrics disagree with the load test.** Align clocks and time ranges, and check sampling intervals.

## Key takeaways summary

The bottleneck is wherever work queues. Use the USE method on every hardware and software resource, use U = X × S to estimate limits, and remember that response time climbs steeply well before 100% utilization. See [thread and connection pools](/learn/performance/thread-and-connection-pools) for the most common software bottleneck.
