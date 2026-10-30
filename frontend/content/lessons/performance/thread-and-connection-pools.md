---
slug: thread-and-connection-pools
title: Thread Pools and Connection Pools
summary: Pools are the most common hidden bottleneck in load tests. Learn how thread and connection pools work, how to recognise pool exhaustion, and how to size pools with Little's Law, including an illustrative payment-service exercise.
level: intermediate
duration: 40
tags: [performance, pools, bottlenecks, jvm]
objectives:
  - Explain how request-thread pools and database connection pools behave under load
  - Recognise the symptoms of pool exhaustion in metrics, logs and thread dumps
  - Size a pool using Little's Law with headroom and downstream limits
  - Recommend fixes that reduce hold time rather than only enlarging pools
prerequisites:
  - Little's Law and concurrency
  - CPU, memory, disk, network and bottlenecks
related: [resource-utilization-and-bottlenecks, database-and-caching-bottlenecks, littles-law, analyzing-performance-results]
references:
  - title: The USE Method (Brendan Gregg), including software resources
    url: https://www.brendangregg.com/usemethod.html
  - title: Apache Tomcat documentation (HTTP connector configuration)
    url: https://tomcat.apache.org/tomcat-10.1-doc/config/http.html
  - title: PostgreSQL documentation (connections and server configuration)
    url: https://www.postgresql.org/docs/
interview:
  - q: What are the symptoms of database connection pool exhaustion?
    a: Response times rise sharply and then plateau near the pool's acquisition timeout, while CPU on both the application and the database stays moderate. Pool metrics show active connections at the maximum and a growing number of threads waiting. Logs show connection acquisition timeouts, and a thread dump shows many request threads waiting inside the pool's getConnection call. Errors often appear as 500s or 503s after exactly the timeout value.
  - q: How would you size a database connection pool?
    a: Start from Little's Law. Average connections in use = rate of work needing a connection × average hold time. At 50 requests per second per instance with 100 ms hold time that is 5 connections on average, so I add headroom for bursts, then check that pool size × number of instances stays within what the database can actually serve. I validate under load by watching pool wait time, not just active count. Bigger is not always better, because more concurrent queries can increase contention inside the database.
  - q: Why can increasing the thread pool size make performance worse?
    a: More threads let more requests run at once, which helps only if the bottleneck is the thread count. If the real limit is CPU, a lock or the database, extra threads just add context switching, memory use and contention, and push more concurrent work onto the saturated resource, so latency increases. The fix is to find the true bottleneck and, often, reduce how long each request holds a scarce resource.
practice:
  - "An instance handles 80 requests per second; each holds a DB connection for 75 ms on average. Calculate average connections in use and propose a pool size."
  - "Take three thread dumps 10 seconds apart during a slow load step. Describe what pattern would confirm connection pool exhaustion."
  - "Six instances each have a pool maximum of 40, and the database allows 200 connections. What happens during a scale-out to 8 instances?"
takeaways:
  - Pools cap concurrency; when they are full, requests wait, which shows as latency, not CPU.
  - "Exhaustion symptoms: active = max, waiters growing, acquisition timeouts, low CPU, threads parked in getConnection."
  - "Size with Little's Law: connections = rate × hold time, plus headroom, within the database's limit across all instances."
  - The best fix usually shortens hold time, such as never holding a connection during a remote call.
  - Monitor pool utilization, saturation (waiters) and errors (timeouts) during every load test.
quiz:
  - id: perf-pool-q1
    type: single
    topic: thread-and-connection-pools
    difficulty: intermediate
    prompt: An instance serves 300 requests per second. Each request holds a database connection for 40 ms on average. How many connections are in use on average?
    options: ["7.5", "12", "40", "120"]
    answer: [1]
    explanation: By Little's Law, L = 300 × 0.04 s = 12 connections on average. The pool needs more than 12 to absorb bursts; 120 comes from a units slip (using 0.4 s).
  - id: perf-pool-q2
    type: scenario
    topic: thread-and-connection-pools
    difficulty: advanced
    prompt: "Under load, p95 jumps to about 30 s, errors show 'connection is not available, request timed out after 30000ms', app CPU is 35% and database CPU is 40%. What is the most likely bottleneck?"
    options: ["Application CPU", "Database CPU", "Connection pool exhaustion: threads wait up to the 30 s acquisition timeout", "Network bandwidth"]
    answer: [2]
    explanation: Both CPUs are moderate, and the latency matches the pool's 30-second acquisition timeout, so threads are waiting for connections. Adding CPU would not help; reducing hold time or resizing the pool might.
  - id: perf-pool-q3
    type: multiple
    topic: thread-and-connection-pools
    difficulty: intermediate
    prompt: Which changes reduce connection hold time? Select all that apply.
    options: ["Calling an external fraud-check API before opening the database transaction instead of inside it", "Fixing an N+1 query pattern so one query replaces many", "Doubling the pool maximum", "Adding an index so a slow query finishes faster"]
    answer: [0, 1, 3]
    explanation: Moving the remote call outside the transaction, removing redundant queries and speeding queries all shorten how long each request holds a connection. Doubling the pool changes capacity, not hold time, and may increase database contention.
  - id: perf-pool-q4
    type: truefalse
    topic: thread-and-connection-pools
    difficulty: beginner
    prompt: If 8 application instances each have a connection pool maximum of 50, the database may need to accept up to 400 connections from them.
    options: ["True", "False"]
    answer: [0]
    explanation: Each instance has its own pool, so the worst case is 8 × 50 = 400 connections. Forgetting this multiplication during scale-out is a common cause of database connection-limit errors.
---

## Beginner-friendly explanation

Picture a car-rental desk with ten cars. Customers arrive, take a car, use it and return it. While cars are available, nobody waits. When all ten are out, new customers queue at the desk, however fast the staff are. If customers keep cars much longer than planned, say because they wait in the car for a phone call, the queue grows even with the same number of customers.

Software uses pools the same way. A **thread pool** limits how many requests a server processes at once. A **connection pool** limits how many database connections exist. Pools protect resources from overload, but when a pool is empty, requests silently wait. That waiting often looks like a "slow server" even though the CPUs are mostly idle.

## Technical explanation

### Thread pools

Servers such as Tomcat accept requests and hand them to worker threads from a pool (Tomcat's `maxThreads`, whose documented default is 200; defaults vary by server and version). When all workers are busy, new connections wait in an accept queue; when that is full, they are refused. Executors in application code (`ThreadPoolExecutor` in Java) behave similarly: busy threads, a task queue, and a rejection policy when both are full.

### Connection pools

A connection pool (for example HikariCP in Java applications) keeps a set of open database connections. A request borrows one, uses it and returns it. Key settings: maximum pool size, minimum idle connections and the **acquisition timeout**, the time a thread waits for a connection before failing (HikariCP's default `connectionTimeout` is 30 seconds).

### Exhaustion symptoms

| Signal | What you see |
|---|---|
| Pool metrics | Active connections = maximum; pending/waiting threads > 0 and rising |
| Latency | p95 and p99 jump, often clustering near the acquisition timeout |
| CPU | Application and database CPU moderate or low |
| Errors | Acquisition timeout exceptions, HTTP 500/503 after a fixed delay |
| Thread dump | Many request threads `WAITING`/`TIMED_WAITING` inside the pool's get-connection method |

This is the USE method applied to a software resource: utilization (active/max), saturation (waiters), errors (timeouts).

### Sizing with Little's Law

**Average connections in use = rate × average hold time.** Add headroom for bursts and variance, and check the downstream limit: **pool max × instances ≤ connections the database can serve well**. More connections than the database can process concurrently increases contention rather than throughput.

```mermaid
sequenceDiagram
  participant T as Request thread
  participant P as Connection pool
  participant D as Database
  participant F as Fraud API
  T->>P: getConnection()
  P-->>T: connection
  T->>D: BEGIN, insert payment
  T->>F: fraud check (300 ms, connection still held)
  F-->>T: approve
  T->>D: update, COMMIT
  T->>P: return connection
```

## Real-world example

**Illustrative scenario (not data from a real system):** a payment service runs on 4 instances, each with a connection pool maximum of 10. The target is 200 payments per second, 50 per instance. A load test shows p95 rising from about 400 ms at 120 TPS to over 5 s at 200 TPS, with an error rate of about 2%, mostly acquisition timeouts. Application CPU is around 40% and database CPU around 35%.

Analysis:

1. **Hold time.** Tracing shows each payment opens a transaction, inserts a record, then calls an external fraud-check service *while holding the connection*, then commits. Average hold time is about 250 ms.
2. **Little's Law.** Per instance: 50 × 0.25 = **12.5** connections needed on average, but the pool maximum is **10**. At 120 TPS (30 per instance) the need is 7.5, which fits, which is why lower load steps passed.
3. **Fix options.** Enlarging pools to 20 would mean up to 80 connections to the database and does not address the cause. Moving the fraud check *before* the transaction cuts hold time to roughly 50 ms: 50 × 0.05 = **2.5** connections per instance, leaving ample headroom.
4. **Verify.** Re-run the same test and confirm pool waiters stay near zero and p95 meets the objective.

## Step-by-step walkthrough

1. **Expose pool metrics** (active, idle, pending, timeouts) for thread and connection pools.
2. **Run a stepped load test** and plot pool metrics against throughput and p95.
3. **Look for the step** where waiters appear and latency bends upward.
4. **Measure hold time** from traces or pool metrics.
5. **Calculate** required connections with Little's Law at the target rate.
6. **Prefer reducing hold time**; resize only after checking the downstream limit.
7. **Re-test** with identical workload and compare.

## Code examples

Capturing evidence during a slow step (Java service):

```bash
# three thread dumps 10 seconds apart
for i in 1 2 3; do jstack <pid> > dump-$i.txt; sleep 10; done
grep -c "getConnection" dump-*.txt
```

Sizing helper:

```python
def connections_needed(rate_per_s, hold_s, headroom=1.5):
    avg = rate_per_s * hold_s
    return avg, avg * headroom

print(connections_needed(50, 0.25))   # before fix
print(connections_needed(50, 0.05))   # after moving the fraud call
```

## Expected output

```text
(12.5, 18.75)
(2.5, 3.75)
```

In the thread dumps, exhaustion looks like dozens of request threads with the same stack, parked in the pool's connection-acquisition method, across all three dumps.

## Common mistakes

- **Raising pool sizes blindly**, moving the queue into the database.
- **Forgetting the instance multiplier** when scaling out.
- **Holding connections during remote calls** or long computations.
- **Watching only active connections** instead of waiters and acquisition time.
- **Very long acquisition timeouts**, which turn exhaustion into extreme latency instead of fast, visible failures.
- **Leaked connections** never returned on error paths, slowly emptying the pool during soak tests.

## Troubleshooting

- **Pool active count slowly climbs during a soak test and never drops.** Suspect a connection leak; enable the pool's leak detection in a test environment.
- **Thread pool full but CPU idle.** Threads are blocked on I/O or locks; take thread dumps to see where.
- **Database refuses connections after scale-out.** Total pool maximums exceed the database limit; reduce per-instance pools or add a pooling proxy.

## Key takeaways summary

Pools turn overload into waiting. Recognise exhaustion by full pools, growing waiters, timeouts and low CPU; size pools with Little's Law and the database's real limit; and fix the root cause by shortening how long each request holds the resource.
