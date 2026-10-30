---
slug: jmeter-jdbc-and-other-protocols
title: JDBC, JMS and Other Protocols
summary: Load-test a database directly with JDBC Connection Configuration and JDBC Request, use prepared statements and result variables, and learn when JMeter's JMS, TCP, FTP and LDAP samplers are the right tool.
level: intermediate
duration: 35
tags: [performance, jmeter, jdbc, database, protocols]
objectives:
  - Add a JDBC driver and configure a JDBC Connection Configuration pool
  - Send prepared statements with the JDBC Request sampler and bind results to variables
  - Explain what the JMS, TCP, FTP and LDAP samplers test and when to use them
  - Decide when testing below the HTTP layer is useful
prerequisites:
  - JMeter variables and CSV Data Set Config
  - Basic SQL
related: [jmeter-variables-and-properties, jmeter-csv-data-set-config, jmeter-assertions-and-extractors, jmeter-best-practices-and-troubleshooting, jmeter-http-request-sampler]
references:
  - title: Apache JMeter - Component Reference
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: PostgreSQL documentation
    url: https://www.postgresql.org/docs/
interview:
  - q: How do you set up a JDBC load test in JMeter?
    a: I copy the database vendor's JDBC driver jar into JMeter's lib folder and restart. I add a JDBC Connection Configuration with a pool variable name, the JDBC URL, driver class, credentials and pool size. Then JDBC Request samplers reference that same variable name and run prepared statements with parameter values and types, often fed from a CSV Data Set Config. Results can be bound to variables or a result variable for assertions and later requests.
  - q: Why use prepared statements in a JDBC Request?
    a: Prepared statements send the SQL with placeholders and the values separately. That matches how most applications talk to the database, lets the database reuse execution plans, and avoids building SQL by string concatenation. In JMeter I choose Prepared Select Statement or Prepared Update Statement and fill Parameter values and Parameter types.
  - q: When would you load-test a database directly rather than through the application?
    a: To isolate the database, for example to check a slow query, an index change or a migration under concurrency, or to compare pool sizes. It does not replace end-to-end tests, because it skips the application's caching, connection handling and business logic. I only run it against a database we own, with test data, never production without explicit approval.
practice:
  - "Run PostgreSQL locally in Docker, load a products table, and build a JDBC test that selects products by a random id from a CSV file."
  - "Bind the result count to a variable and add a Response Assertion that fails when no row is returned."
  - "Compare pool sizes of 5 and 20 with 30 threads and explain the difference in response times."
takeaways:
  - The JDBC driver jar goes in JMeter's lib folder; restart after adding it.
  - The pool Variable Name in JDBC Connection Configuration must match the JDBC Request exactly.
  - Prefer prepared statements with parameter values and types.
  - JMS, TCP, FTP and LDAP samplers exist for systems that are not HTTP.
  - Only load-test systems you own or are explicitly authorized to test.
quiz:
  - id: jm-jdbc-q1
    type: debugging
    topic: jmeter-jdbc-and-other-protocols
    difficulty: beginner
    prompt: "A JDBC Request fails with 'No suitable driver found'. What is the most likely cause?"
    options: ["The SQL has a syntax error", "The driver jar is not in JMeter's lib folder or JMeter was not restarted", "The thread count is too high", "The Response Assertion is wrong"]
    answer: [1]
    explanation: JMeter needs the vendor's JDBC driver on its classpath. Copy the jar to lib and restart. A SQL syntax error would come back from the database, not from driver lookup.
  - id: jm-jdbc-q2
    type: single
    topic: jmeter-jdbc-and-other-protocols
    difficulty: beginner
    prompt: What links a JDBC Request to its JDBC Connection Configuration?
    options: ["The Test Plan name", "The same Variable Name for the pool in both elements", "The database URL in the JDBC Request", "The thread group name"]
    answer: [1]
    explanation: The JDBC Connection Configuration declares a pool under a variable name, and each JDBC Request names that pool. A mismatch causes a "no pool" error.
  - id: jm-jdbc-q3
    type: multiple
    topic: jmeter-jdbc-and-other-protocols
    difficulty: intermediate
    prompt: Which JMeter samplers are built in for non-HTTP protocols? Select all that apply.
    options: ["JMS Publisher", "TCP Sampler", "FTP Request", "LDAP Request", "gRPC Request"]
    answer: [0, 1, 2, 3]
    explanation: JMS Publisher/Subscriber, TCP Sampler, FTP Request and LDAP Request ship with Apache JMeter. gRPC needs a third-party plugin.
  - id: jm-jdbc-q4
    type: scenario
    topic: jmeter-jdbc-and-other-protocols
    difficulty: intermediate
    prompt: With 50 threads and a pool Max Number of Connections of 10, response times rise sharply but the database CPU is low. What is the likely explanation?
    options: ["The database is overloaded", "Threads are waiting for a free pooled connection in JMeter", "The driver is the wrong version", "Prepared statements are slower"]
    answer: [1]
    explanation: Only 10 connections are available, so 40 threads queue for one. That wait counts in the sample time. Size the pool like the real application or deliberately test that limit.
---

## Beginner-friendly explanation

Most JMeter tests talk to a web server, like a customer ordering at the front desk. Sometimes you want to go straight to the kitchen and ask, "How fast can you cook this dish when 30 orders arrive at once?" The **JDBC** sampler lets JMeter talk directly to a database, skipping the website. JMeter also has samplers for other "doors": message queues (JMS), raw sockets (TCP), file servers (FTP) and directories (LDAP).

## Technical explanation

**JDBC** (Java Database Connectivity) is Java's standard database API. Each database vendor supplies a driver jar.

- **JDBC Connection Configuration** (Config Element) creates a connection pool. Key fields: *Variable Name for created pool* (e.g. `shopDb`), *Max Number of Connections*, *Max Wait (ms)*, *Validation Query*, *Database URL* (`jdbc:postgresql://localhost:5432/shop`), *JDBC Driver class* (`org.postgresql.Driver`), *Username*, *Password*.
- **JDBC Request** (Sampler) names the pool, a *Query Type* and the SQL.

| Query Type | Use |
|---|---|
| Select Statement | Plain SELECT |
| Update Statement | INSERT, UPDATE, DELETE |
| Prepared Select Statement | SELECT with `?` placeholders |
| Prepared Update Statement | Writes with `?` placeholders |
| Callable Statement | Stored procedures |

For prepared statements, fill *Parameter values* (comma-separated, e.g. `${productId}`) and *Parameter types* (e.g. `INTEGER`). *Variable names* binds columns of the result: `name,price` creates `name_1`, `price_1`, … and `name_#` for the row count. *Result variable name* stores the whole result as a list of maps for Groovy.

**Other protocols (brief):**

- **JMS Publisher / Subscriber / Point-to-Point**: send and receive messages on queues or topics via a JMS provider (needs its client jars). Use for message-driven systems.
- **TCP Sampler**: send raw bytes or text over a socket for custom protocols.
- **FTP Request**: upload or download files from an FTP server.
- **LDAP Request / LDAP Extended Request**: bind, search and modify directory entries, e.g. testing a login directory.

## Step-by-step walkthrough

1. Start a local PostgreSQL you own (`docker run -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres`).
2. Create a `products` table with a few thousand rows of test data.
3. Download the PostgreSQL JDBC driver jar from the official driver site and copy it to `JMETER_HOME/lib`. Restart JMeter.
4. Add **Config Element → JDBC Connection Configuration**: Variable Name `shopDb`, Max Connections `10`, URL `jdbc:postgresql://localhost:5432/postgres`, driver `org.postgresql.Driver`, user `postgres`, password `${__P(dbPassword)}`.
5. Add a **CSV Data Set Config** with `productId`.
6. Add **Sampler → JDBC Request**: pool `shopDb`, Query Type `Prepared Select Statement`, the query below, Parameter values `${productId}`, Parameter types `INTEGER`, Variable names `name,price`.
7. Add a **Response Assertion** or a JSR223 Assertion checking `name_#` equals `1`.
8. Add a Debug Sampler and View Results Tree while building; disable them before load.

## Code examples

```sql
SELECT name, price FROM products WHERE id = ?
```

```groovy
// JSR223 Assertion (Groovy): fail when no row was returned
if (vars.get("name_#") != "1") {
    AssertionResult.setFailure(true)
    AssertionResult.setFailureMessage("Expected one product row")
}
```

```bash
jmeter -n -t db-test.jmx -l db.jtl -JdbPassword=dev
```

## Expected output

In View Results Tree, the Response data tab shows a tab-separated result such as a header line `name	price` and one row. The Debug Sampler lists `name_#=1`, `name_1=...` and `price_1=...`. In the JTL each JDBC Request has a label, an elapsed time and `success=true`.

## Real-world example

A team plans to add an index to speed up order lookups. Before and after the change, they run the same JDBC test against a copy of the database in their own test environment: 30 threads running the lookup with ids from a CSV file. Comparing the two runs isolates the effect of the index from application caching. They then confirm with the normal HTTP test that end-to-end response times improved too.

## Common mistakes

- **Driver jar in the wrong folder** or forgetting to restart.
- **Pool name mismatch** between config and request.
- **Pool far smaller than threads**, so you measure JMeter's queue, not the database.
- **String-built SQL** instead of prepared statements.
- **Writes against shared data** without cleanup, which pollutes later runs.
- **Pointing at production databases**, or passwords stored in the `.jmx`.

## Troubleshooting

| Error | Cause and fix |
|---|---|
| `No suitable driver found` | Driver jar missing from `lib`; restart |
| `No pool found named: 'shopDb'` | Variable names differ; also the config must be in scope |
| `Cannot create PoolableConnectionFactory` | Wrong URL, host, port or credentials |
| Times include long waits | Increase Max Number of Connections or reduce threads |

## Choosing the right sampler

Before reaching for a protocol-specific sampler, ask what question you are answering.

| Question | Sampler | Notes |
|---|---|---|
| How does the website or API behave under load? | HTTP Request | The default for most tests |
| Is this query fast enough with concurrent users? | JDBC Request | Isolates the database |
| Can the message broker keep up with our order events? | JMS Publisher and Subscriber | Needs the provider's client jars in `lib` |
| Does our custom socket service respond in time? | TCP Sampler | You may need a custom TCPClient implementation for framing |
| How long do large file transfers take? | FTP Request | Measure bytes and time per file |
| Can our directory handle login lookups at peak? | LDAP Request | Use a test directory with test accounts |

**Writing data safely.** Update statements change state. Use a dedicated test database or schema, generate unique keys (for example with `${__UUID()}`), and add a tearDown Thread Group with a cleanup statement so each run starts from the same data. Record how many rows existed before and after, so you can prove the test did what you expected.

**Credentials.** Pass passwords as properties (`-JdbPassword=...`) or environment-specific property files that are not committed, never as plain text in the test plan.

## Key takeaways summary

JDBC testing isolates the database: a driver jar, a named pool, prepared statements and result variables. JMeter's JMS, TCP, FTP and LDAP samplers cover other back-end systems. Use them to answer focused questions, keep end-to-end HTTP tests for the full picture, and only load-test systems you own or are explicitly authorized to test.
