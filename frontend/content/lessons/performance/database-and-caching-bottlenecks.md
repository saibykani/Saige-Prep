---
slug: database-and-caching-bottlenecks
title: Database Bottlenecks and Caching
summary: Databases are the most common performance bottleneck. Learn to recognise slow queries, missing indexes, N+1 queries, lock contention and pool exhaustion, and how caching helps - with the hit ratio, staleness and cold-cache traps testers must test.
level: intermediate
duration: 40
tags: [performance, database, caching, sql]
objectives:
  - Identify common database bottlenecks and their symptoms under load
  - Use execution plans and slow-query logs to find expensive queries
  - Explain cache hit ratio, TTL, invalidation and cold versus warm cache
  - Design performance tests that account for caching realistically
prerequisites:
  - CPU, memory, disk, network and bottlenecks
  - Thread pools and connection pools
  - SQL basics
related: [resource-utilization-and-bottlenecks, thread-and-connection-pools, analyzing-performance-results, workload-modeling, api-database-validation]
references:
  - title: PostgreSQL Documentation — Using EXPLAIN
    url: https://www.postgresql.org/docs/current/using-explain.html
  - title: MySQL Reference Manual — Optimization
    url: https://dev.mysql.com/doc/refman/8.4/en/optimization.html
  - title: Redis documentation
    url: https://redis.io/docs/latest/
  - title: MDN Web Docs — HTTP caching
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
interview:
  - q: What database problems do you look for when an API slows down under load?
    a: Slow individual queries, usually from missing or unused indexes causing full scans; N+1 query patterns where one request triggers many small queries; lock contention and deadlocks on hot rows; connection-pool exhaustion where threads wait for a connection; and resource saturation on the database server itself - CPU, disk I/O or memory. I check slow-query logs, execution plans, pool metrics and database wait statistics alongside the load test timeline.
  - q: What is the N+1 query problem?
    a: Code fetches a list with one query, then runs another query for each item, for example to load each order's customer. With 50 orders that is 51 queries per request. It looks fine with small test data but multiplies database load under real data volumes. The fix is a join or batch fetch. I find it by counting queries per request in logs or APM traces.
  - q: How does caching affect your performance tests?
    a: A cache makes repeated requests for the same data very fast, so a test that hits the same few IDs measures the cache, not the system, and gives optimistic results. I use realistic, varied test data with a production-like access distribution, run a warm-up period and report it separately, and also test cold-cache scenarios like after a deploy or cache flush. I measure the hit ratio and check data freshness after updates.
practice:
  - "Run EXPLAIN on a query in a local PostgreSQL database before and after adding an index. Compare the plans."
  - "Design a JMeter CSV data set that avoids a 100% cache hit rate for a product-details endpoint."
  - "Write test cases that verify a cached product price updates within the agreed TTL after an admin changes it."
takeaways:
  - Most database slowness comes from queries, indexes, N+1 patterns, locks and pools.
  - Execution plans and slow-query logs show which queries to fix.
  - Test with production-like data volumes; small tables hide missing indexes.
  - Caches need realistic data distribution, warm-up and cold-cache tests.
  - Measure cache hit ratio and test staleness after writes.
quiz:
  - id: perfdb-q1
    type: scenario
    topic: database-and-caching-bottlenecks
    difficulty: intermediate
    prompt: An order-history endpoint is fast with 100 test orders but slow in production with 2 million orders. EXPLAIN shows a sequential scan on orders filtered by customer_id. What is the likely fix?
    options: ["Add more app servers", "Add an index on orders(customer_id)", "Increase think time", "Disable the cache"]
    answer: [1]
    explanation: A sequential scan reads the whole table; an index lets the database find a customer's rows directly. The small test table hid the problem, which is why data volume matters.
  - id: perfdb-q2
    type: single
    topic: database-and-caching-bottlenecks
    difficulty: intermediate
    prompt: A request loads 40 products and then runs a separate query for each product's reviews. What is this pattern called?
    options: ["Cache stampede", "N+1 query problem", "Deadlock", "Connection leak"]
    answer: [1]
    explanation: One query for the list plus N queries for related data is the N+1 problem. It multiplies database round trips as data grows.
  - id: perfdb-q3
    type: truefalse
    topic: database-and-caching-bottlenecks
    difficulty: beginner
    prompt: A load test that requests the same product ID in every iteration gives realistic response times for a cached product page.
    options: ["True", "False"]
    answer: [1]
    explanation: After the first request, every hit comes from the cache, so the test measures the best case. Real users request many different products, so many requests miss the cache.
  - id: perfdb-q4
    type: multiple
    topic: database-and-caching-bottlenecks
    difficulty: advanced
    prompt: Which observations suggest database connection-pool exhaustion? Select all that apply.
    options: ["Active connections equal the pool maximum", "Threads waiting to acquire a connection", "Errors like 'timeout waiting for connection from pool'", "Database server CPU at 95%"]
    answer: [0, 1, 2]
    explanation: Pool exhaustion shows as a full pool, waiters and acquisition timeouts - often while the database itself is not busy. High database CPU points to the database being the bottleneck instead.
---

## Beginner-friendly explanation

Think of a library. The **database** is the main archive in the basement: it holds everything, but each trip down takes time. If the books aren't in order (**no index**), the librarian has to search every shelf. If someone asks for 50 books one trip at a time instead of with one list (**N+1**), the librarian spends all day on the stairs. If two people want to edit the same book at once, one must wait (**locks**).

A **cache** is the small shelf at the front desk holding popular books. Most visitors get their book instantly. But the shelf only helps if people ask for popular books, and someone has to replace a book on the shelf when the archive copy changes — otherwise visitors get an old edition (**stale data**).

## Technical explanation

### Common database bottlenecks

| Bottleneck | Symptom under load | How to find it |
|---|---|---|
| Missing/unused index | One query's time grows with table size; high DB CPU or disk reads | Execution plan (`EXPLAIN`/`EXPLAIN ANALYZE`) shows full/sequential scans |
| N+1 queries | Many tiny queries per request; DB round trips dominate | Query count per request in logs or APM traces |
| Lock contention | Latency spikes on writes to hot rows; deadlock errors | Lock wait statistics, deadlock logs |
| Connection-pool exhaustion | App waits for connections; DB not busy | Pool active = max, waiters, acquire timeouts |
| Large result sets | Memory and network spikes | Response sizes, missing pagination |
| DB server saturation | High CPU, I/O wait, memory pressure on the DB host | USE method on the DB host |

Most databases offer a **slow-query log** (queries above a time threshold) and statistics views (for example PostgreSQL's `pg_stat_statements` extension) that rank queries by total time. Fixing the top few queries often fixes most of the problem.

### Caching

Caches exist at several layers: browser and CDN (HTTP caching headers), application in-memory caches, and distributed caches such as Redis or Memcached. A common pattern is **cache-aside**: check the cache; on a miss, read the database and store the result with a **TTL** (time to live).

| Concept | Meaning | Why testers care |
|---|---|---|
| Hit ratio | hits ÷ (hits + misses) | Unrealistic test data inflates it |
| TTL / expiry | How long an entry lives | Determines staleness window |
| Invalidation | Removing entries when data changes | Missing invalidation = stale data defects |
| Cold vs warm cache | Empty vs populated cache | After deploys or restarts, every request misses |
| Stampede | Many requests miss together and hit the DB at once | Load spikes when popular keys expire |

```mermaid
flowchart LR
  R[Request] --> C{In cache?}
  C -- Hit --> F[Return fast]
  C -- Miss --> D[(Database)]
  D --> W[Write to cache with TTL]
  W --> F
```

## Real-world example

A retail site prepared for a sale. Load tests showed product pages at 80 ms p95 — excellent. But the test used 20 product IDs; with Redis caching, almost every request was a hit. On sale day, a new catalogue of thousands of items was published, the cache was cold, and every request missed. The database, sized for the cached load, saturated within minutes.

The re-designed test used a CSV of 50,000 product IDs weighted like real traffic, included a cold-cache start, and measured the database during the first ten minutes. It revealed a missing index on `products(category_id, published_at)` that only mattered on cache misses.

## Step-by-step walkthrough

1. **Use production-like data volumes** in the test database (anonymised or generated). Indexes only matter at scale.
2. **Monitor the database:** CPU, I/O, connections, lock waits, slow-query log, top queries by total time.
3. **Monitor the pool** in the application: active, idle, waiting, acquire time.
4. **Design test data for caching:** many keys, realistic distribution (some popular, many rare) via [CSV Data Set Config](/learn/jmeter/jmeter-csv-data-set-config).
5. **Run scenarios:** warm-cache steady state, cold-cache start, and a cache flush during load.
6. **Measure hit ratio** from the cache's own statistics (Redis `INFO stats` reports `keyspace_hits` and `keyspace_misses`).
7. **Test freshness:** update data, then read it repeatedly; confirm it changes within the agreed TTL or immediately if invalidation is promised.
8. **Find the top queries**, inspect their plans, and hand developers the evidence.

## Code examples

Inspecting a query plan in PostgreSQL:

```sql
EXPLAIN ANALYZE
SELECT id, total_amount, created_at
FROM orders
WHERE customer_id = 48213
ORDER BY created_at DESC
LIMIT 20;
```

## Expected output

Before an index, the plan includes a line like `Seq Scan on orders` with a large number of rows removed by the filter. After `CREATE INDEX ON orders (customer_id, created_at);` the plan shows an `Index Scan` and execution time drops. Exact output varies by PostgreSQL version and data; compare the plan type and the actual time, not exact numbers.

## Common mistakes

- **Tiny test databases** that hide missing indexes and N+1 costs.
- **Reusing the same few IDs**, so every request hits the cache.
- **Only testing warm cache** and never the restart or deploy case.
- **Increasing the pool size blindly** — a bigger pool can overload the database further.
- **Ignoring staleness** as "a functional issue". Caching changes correctness too.
- **Running heavy queries against shared or production databases** without approval.

## Key takeaways summary

Databases fail under load through slow queries, missing indexes, N+1 patterns, locks and pool limits — all visible with the right monitoring. Caches hide that load, so test with realistic data distributions, both warm and cold, and verify both hit ratio and freshness.
