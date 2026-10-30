---
slug: jmeter-capstone-payment-load-test
title: "Capstone: A Complete Payment Load Test"
summary: Build an end-to-end load test of a local payment API you run yourself, from workload model and Little's Law through login, token extraction, idempotent payment creation and assertions, to the HTML report and a written bottleneck analysis.
level: advanced
duration: 45
tags: [performance, jmeter, capstone, load-testing, api-testing]
objectives:
  - Derive a target throughput and user count with Little's Law
  - Build a realistic payment journey with CSV users, extractors, headers and transaction controllers
  - Assert correctness, not just speed, including idempotency
  - Run non-GUI, produce the HTML report and write an analysis with a clear conclusion
prerequisites:
  - All earlier JMeter modules, especially correlation, assertions and workload design
  - A local payment-style API you can run (for example in Docker)
related: [jmeter-workload-design, jmeter-testing-rest-apis, jmeter-correlation-and-parameterization, jmeter-assertions-and-extractors, jmeter-html-dashboard-report, jmeter-analyzing-results, jmeter-backend-listener-grafana]
references:
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: Apache JMeter - Component Reference
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter - Best Practices
    url: https://jmeter.apache.org/usermanual/best-practices.html
interview:
  - q: Walk me through how you would load-test a payment API.
    a: I agree goals first, such as a target transactions per second, a 95th percentile limit and an error budget, and confirm we own or are authorized to test the environment. I model the user journey and mix from production analytics where available, size users with Little's Law, and build the script with CSV test users, JSON Extractor for the token, a unique idempotency key per payment, and assertions on status and body. I run non-GUI with warm-up, monitor both server and generator, then analyse steady-state percentiles, errors and resource usage and report a clear pass or fail with the bottleneck.
  - q: How do you use Little's Law to size a JMeter test?
    a: Little's Law says concurrency equals throughput times the time each user spends in the system. If one iteration takes about 6 seconds including think time and I need 20 iterations per second, I need about 120 concurrent users. I then pace the users with timers so the throughput is controlled rather than whatever the threads happen to produce.
  - q: Why send an idempotency key when load-testing payments?
    a: Real clients send one so that retries do not charge twice. Including a unique key per attempt exercises that code path and the uniqueness check in the database, which can be a bottleneck. I also test the duplicate case, sending the same key twice and asserting the second response returns the original payment rather than creating a new one.
practice:
  - "Build the full test plan in this lesson against a payment API you run locally, with 50 CSV users."
  - "Calculate the users needed for 15 payments per second with a 4-second journey and 6 seconds of think time, then verify the achieved throughput in the HTML report."
  - "Write a one-page analysis using the template in this lesson, based on your own run."
  - "Add a duplicate-request check that reuses an idempotency key and asserts no second payment is created."
takeaways:
  - Start from goals and a workload model, not from a thread count.
  - Little's Law links throughput, response plus think time and concurrency.
  - Assert correctness, including token use and idempotency, not just speed.
  - Report steady-state percentiles, errors and the resource that limits capacity.
  - Only load-test systems you own or are explicitly authorized to test.
quiz:
  - id: jm-cap-q1
    type: code-output
    topic: jmeter-capstone-payment-load-test
    difficulty: intermediate
    prompt: Target throughput is 10 journeys per second. Each journey takes 3 s of response time plus 9 s of think time. How many concurrent users does Little's Law suggest?
    options: ["30", "90", "120", "12"]
    answer: [2]
    explanation: Concurrency = throughput x time in system = 10 x (3 + 9) = 120. Ignoring think time gives 30, which would push far more than 10 journeys per second unless paced.
  - id: jm-cap-q2
    type: single
    topic: jmeter-capstone-payment-load-test
    difficulty: intermediate
    prompt: How should the Idempotency-Key header be generated for each new payment?
    options: ["A fixed value in HTTP Header Manager", "${__UUID()} so each request gets a unique value", "The user's password", "The thread number"]
    answer: [1]
    explanation: Each new payment needs a unique key so the server treats it as a new request. A fixed value would make every payment after the first a duplicate. Thread numbers repeat across iterations.
  - id: jm-cap-q3
    type: debugging
    topic: jmeter-capstone-payment-load-test
    difficulty: intermediate
    prompt: "Every Create payment request returns 401, while Login returns 200. View Results Tree shows the header 'Authorization: Bearer NOT_FOUND'. What is wrong?"
    options: ["The payment API is down", "The JSON Extractor path does not match the login response, so its default value was used", "The idempotency key is missing", "The heap is too small"]
    answer: [1]
    explanation: NOT_FOUND is the extractor's default value, meaning the JSON path matched nothing. Check the login response body and fix the path, e.g. $.accessToken.
  - id: jm-cap-q4
    type: scenario
    topic: jmeter-capstone-payment-load-test
    difficulty: advanced
    prompt: At higher load, payment p95 rises steeply while browse stays flat, app CPU is moderate and the database connection pool is at its maximum. What is the most likely bottleneck?
    options: ["The load generator", "Network bandwidth", "Database connection pool saturation on the payment write path", "The JSON Extractor"]
    answer: [2]
    explanation: Only the write-heavy transaction slows, CPU is not saturated and the pool is full, so payments wait for connections. The generator would slow all transactions, not one.
---

## Beginner-friendly explanation

This capstone is your driving test. You have learned the controls one at a time; now you drive a full route. The route is a small online payment: a user signs in, looks at their account, and pays. You will plan how many "drivers" to send, build the route in JMeter, check that every payment is correct, run it, and write a short report saying whether the system passed and what slowed it down.

**Important:** you test a payment API you run locally on your own machine (for example a sample service in Docker). Never point this test at a real payment provider or any system you do not own or have written permission to test.

## Technical explanation

**Workload model.** Agree goals first. Example goals for the lab: 20 payments per second in steady state, payment p95 under 800 ms, errors under 1%.

Little's Law: **concurrent users = throughput x time per iteration**. If one journey takes about 1.5 s of responses plus 4.5 s of think time, that is 6 s, so 20/s x 6 s = **120 users**. Use a Constant Throughput Timer or the Throughput Shaping Timer to hold the rate (see [workload design](/learn/jmeter/jmeter-workload-design)).

**Journey and assertions**

```mermaid
sequenceDiagram
  participant U as JMeter user
  participant A as Local payment API
  U->>A: POST /auth/login (CSV user)
  A-->>U: 200 accessToken
  U->>A: GET /accounts/me (Bearer token)
  A-->>U: 200 balance
  U->>A: GET /payments?limit=10
  A-->>U: 200 list
  U->>A: POST /payments (Idempotency-Key: UUID)
  A-->>U: 201 paymentId, status
```

Each step sits in a **Transaction Controller** (`TX_Login`, `TX_Browse`, `TX_CreatePayment`) so the report shows business transactions.

## Step-by-step walkthrough

1. **Start the app** you own, e.g. `docker compose up -d`, and confirm `http://localhost:8080/health` returns 200.
2. **Test data:** create `users.csv` with `username,password` for 50 test accounts seeded in your local app.
3. **Test Plan:** add HTTP Request Defaults (`${__P(host,localhost)}`, port `${__P(port,8080)}`), an HTTP Header Manager with `Content-Type: application/json`, and a CSV Data Set Config (`users.csv`, Recycle on EOF true, Sharing mode All threads).
4. **Thread Group:** users `${__P(users,120)}`, ramp-up `${__P(rampup,120)}`, duration `${__P(duration,900)}` seconds, loop forever.
5. **TX_Login:** POST `/auth/login` with the body below. Add a JSON Extractor: name `token`, path `$.accessToken`, default `NOT_FOUND`. Add a Response Assertion for code 200. Use a Once Only Controller if tokens are long-lived.
6. **TX_Browse:** GET `/accounts/me` and GET `/payments?limit=10`, each with a child Header Manager `Authorization: Bearer ${token}` and a JSON Assertion on `$.id` or `$.items`.
7. **TX_CreatePayment:** POST `/payments` with a child Header Manager containing `Authorization: Bearer ${token}` and `Idempotency-Key: ${__UUID()}`. Assert code 201, JSON Assertion `$.status` equals `PENDING` or `COMPLETED` per your API, and a Duration Assertion of 2000 ms.
8. **Think time:** Uniform Random Timer between transactions; a Constant Throughput Timer set to `${__P(tpm,1200)}` per minute, shared across all active threads.
9. **Debug** with 1 user in the GUI, then disable View Results Tree.
10. **Run** non-GUI with a Backend Listener if you have [Grafana](/learn/jmeter/jmeter-backend-listener-grafana), monitoring the app, the database and the generator.
11. **Report:** open `report/index.html` and fill the analysis template.

## Code examples

```json
{ "username": "${username}", "password": "${password}" }
```

```json
{ "amount": ${__Random(100,5000)}, "currency": "EUR", "reference": "lab-${__threadNum}-${__time()}" }
```

```bash
jmeter -n -t payment-capstone.jmx -l capstone.jtl -e -o capstone-report \
  -Jusers=120 -Jrampup=120 -Jduration=900 -Jtpm=1200
```

Analysis template:

```markdown
# Payment load test - analysis
- Goal: 20 payments/s, p95 < 800 ms, errors < 1%, environment: local lab (owned)
- Build / versions: app x.y, JMeter 5.6.x, generator spec
- Steady-state window: from end of ramp-up to end of test
- Results per transaction: throughput, p90/p95/p99, error %
- Resources: app CPU, DB CPU, pool usage, generator CPU
- Verdict: PASS / FAIL against each goal
- Bottleneck and evidence
- Recommendations and next test
```

## Expected output

The illustrative table below shows what a filled-in result could look like. **These are made-up teaching numbers, not measurements of any real system**; your numbers will differ.

| Transaction | Throughput (/s) | p95 (ms) | Error % |
|---|---|---|---|
| TX_Login | 2.1 | 310 | 0.0 |
| TX_Browse | 20.4 | 180 | 0.0 |
| TX_CreatePayment | 17.6 | 1450 | 1.8 |

## Real-world example

Reading the illustrative table: browse is fast and stable, but payments miss both the throughput goal (17.6 vs 20/s) and the p95 goal, and errors exceed 1%. The failures are Duration Assertion failures and some 503 responses. Server monitoring shows moderate app CPU, while the database connection pool sits at its maximum and the payment insert waits on a unique-index check of the idempotency key. Conclusion: the bottleneck is the payment write path at the database, not JMeter (generator CPU stayed low) and not the network. Recommendations: review the pool size and the idempotency table index, then rerun the same test to compare.

## Common mistakes

- Picking a thread count without a workload model.
- A fixed idempotency key, which turns every payment into a duplicate.
- Asserting only status codes and missing wrong payment states.
- Including ramp-up in the results window.
- Testing a real payment provider or shared environment without authorization.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Bearer NOT_FOUND` | Fix the JSON path against the real login response |
| All payments 409 | Idempotency key reused; use `${__UUID()}` per request |
| Throughput below target, server idle | Check timers and generator CPU |
| Some users fail login | CSV data does not match seeded accounts |

## Self-review checklist

Before you call the capstone finished, check each item:

- The goals, environment and authorization are written at the top of your analysis.
- Your Little's Law calculation is shown, and the achieved throughput in the report is close to the target.
- A single-user run is fully green, and every request has at least one assertion beyond the status code.
- Each payment uses a new idempotency key, and you ran one deliberate duplicate check.
- The steady-state window excludes ramp-up, and the report uses percentiles, not only averages.
- Load-generator CPU and memory were monitored and stayed comfortably below saturation.
- The verdict is a clear pass or fail per goal, the bottleneck is supported by evidence, and the next test is named.

If you can explain every line of this checklist to a colleague, you can plan and run a real load test.

## Key takeaways summary

A complete load test is a chain: goals, a workload model sized with Little's Law, a realistic and correctly asserted script, a clean non-GUI run, and an analysis that names the bottleneck with evidence. Only load-test systems you own or are explicitly authorized to test.
