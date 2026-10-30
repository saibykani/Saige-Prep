---
slug: jmeter-correlation-and-parameterization
title: Correlation and Parameterization in JMeter
summary: Recorded scripts break because servers issue dynamic values such as session IDs and CSRF tokens. Learn to correlate them with extractors and to parameterize test data with CSV Data Set Config so each virtual user behaves like a distinct real user.
level: intermediate
duration: 40
tags: [performance, jmeter, correlation, test-data]
objectives:
  - Explain correlation and identify dynamic values in recorded traffic
  - Extract dynamic tokens and reuse them as JMeter variables
  - Parameterize requests with CSV Data Set Config and understand its sharing modes
  - Plan unique, sufficient test data for a load test
prerequisites:
  - JMeter fundamentals
  - HTTP cookies, headers and JSON
related: [jmeter-fundamentals, jmeter-assertions-and-extractors, jmeter-groovy-jsr223, workload-modeling]
references:
  - title: Apache JMeter - Component Reference (CSV Data Set Config, extractors)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter - Functions and Variables
    url: https://jmeter.apache.org/usermanual/functions.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: What is correlation in performance scripting?
    a: Correlation means capturing a dynamic value that the server generates in one response, such as a session ID, CSRF token, order ID or OAuth access token, and sending it back in later requests instead of the stale value captured during recording. In JMeter I add an extractor, such as a JSON Extractor or Regular Expression Extractor, to the response that returns the value, store it in a variable, and reference it as ${variableName} in later requests.
  - q: How do you find which values need correlating?
    a: I record the journey twice and compare the requests; values that differ between recordings, and are not my own input, are dynamic. I also search earlier responses for each suspicious value to find where the server first issued it. Typical candidates are tokens in hidden form fields, Set-Cookie headers, Location headers after redirects, and IDs in JSON responses.
  - q: What does the Sharing mode in CSV Data Set Config do?
    a: It controls which threads share one file pointer. With All threads, every thread in the test reads the next line from one shared pointer, so each line is used once per pass. With Current thread group, each thread group has its own pointer. With Current thread, every thread reads the file independently from the start, so all threads use the same lines in the same order, which usually creates unrealistic duplicates.
  - q: Why does parameterization matter for performance results, not just for functional correctness?
    a: If every virtual user searches for the same product or logs in as the same account, caches, database buffers and locks behave unrealistically. You may see excellent response times because everything is cached, or artificial lock contention because all users update the same row. Realistic, varied data makes the system do realistic work.
practice:
  - "Record a login that returns a CSRF token in a hidden form field. Write the Regular Expression Extractor settings that capture it and the request that reuses it."
  - "Create a CSV file of 500 test accounts and configure CSV Data Set Config so each account is used by only one thread at a time."
  - "Explain how you would generate a unique order reference per iteration without a CSV file."
takeaways:
  - Correlation captures server-generated dynamic values and replays them; parameterization supplies varied input data.
  - Find dynamic values by comparing two recordings and searching earlier responses.
  - Use extractors with a clear default value such as NOT_FOUND so failures are obvious.
  - "CSV Data Set Config: choose the sharing mode, recycle and stop-on-EOF settings deliberately."
  - Realistic data volumes and distribution matter as much as realistic request rates.
quiz:
  - id: perf-jcp-q1
    type: debugging
    topic: jmeter-correlation-and-parameterization
    difficulty: intermediate
    prompt: A recorded script works with 1 thread for a few minutes, then every POST returns 403 Forbidden. The POST body contains csrf_token=8f2a91c0 copied from the recording. What is the most likely fix?
    options: ["Increase the ramp-up period", "Extract the CSRF token from the preceding response and send ${csrfToken} instead of the recorded value", "Add a Duration Assertion", "Switch the HTTP implementation"]
    answer: [1]
    explanation: The hard-coded token was valid only for the recording session. The server issues a new token per session or page, so it must be extracted and correlated. Ramp-up and assertions do not change what is sent.
  - id: perf-jcp-q2
    type: single
    topic: jmeter-correlation-and-parameterization
    difficulty: intermediate
    prompt: CSV Data Set Config is set to Sharing mode "All threads" with 3 threads and a file of 6 lines. In which order are lines handed out?
    options: ["Each thread reads lines 1 to 6 independently", "Threads take the next unused line from one shared pointer, so each line is used once before recycling", "Only the first thread reads the file", "Lines are chosen at random"]
    answer: [1]
    explanation: All threads share one file pointer, so each read takes the next line in sequence across threads. Independent reading per thread is the Current thread mode, which makes threads reuse the same lines.
  - id: perf-jcp-q3
    type: multiple
    topic: jmeter-correlation-and-parameterization
    difficulty: beginner
    prompt: Which of these values typically need correlation? Select all that apply.
    options: ["A session ID issued in a Set-Cookie header", "A CSRF token in a hidden form field", "An order ID returned after creating an order", "The username you type at login"]
    answer: [0, 1, 2]
    explanation: Correlation is for values generated by the server. The username is your own input, which you parameterize from test data rather than correlate.
  - id: perf-jcp-q4
    type: scenario
    topic: jmeter-correlation-and-parameterization
    difficulty: intermediate
    prompt: You need 400 concurrent logged-in users for 30 minutes, and the application allows only one active session per account. How many unique accounts do you need at minimum?
    options: ["1", "40", "400", "It does not matter"]
    answer: [2]
    explanation: With one session per account, each concurrent user needs its own account, so at least 400. Fewer accounts would cause session kick-outs and login errors that are artefacts of the test, not real defects.
---

## Beginner-friendly explanation

Imagine visiting a cloakroom. You hand over your coat and get ticket number 147. Later, you must show ticket 147 to get your coat back. If you photographed yesterday's ticket (number 52) and showed that instead, the attendant would refuse.

A recorded load test script is like that photograph. During recording, the server issued "tickets" such as session IDs and security tokens. Replaying the old ones fails. **Correlation** means reading the new ticket from each response and showing it on the next request.

**Parameterization** is the other half: instead of every virtual user being the same person buying the same product, you give each user their own name, password and choices from a data file, so the system does realistic work.

## Technical explanation

### Correlation

A **dynamic value** is generated by the server and changes per session, request or time. Examples: session cookies, CSRF tokens, OAuth access tokens, `ViewState`-style hidden fields, IDs of newly created records, signed URLs.

The correlation loop:

1. **Identify** values that change between two recordings and are not user input.
2. **Locate** the first response that contains the value.
3. **Extract** it with a post-processor (JSON Extractor, Regular Expression Extractor, Boundary Extractor, CSS Selector Extractor or XPath Extractor) into a variable.
4. **Replace** the hard-coded value with `${variableName}` in later requests.
5. **Verify** with a Debug Sampler and an assertion that the value was found.

Cookies are a special case: the **HTTP Cookie Manager** stores and resends them automatically, so session cookies usually need no manual extraction.

```mermaid
sequenceDiagram
  participant J as JMeter thread
  participant S as Server
  J->>S: GET /login
  S-->>J: 200, form with csrf_token=a91f...
  Note over J: Extractor stores csrfToken
  J->>S: POST /login (csrf_token=${csrfToken})
  S-->>J: 302, Set-Cookie session
  Note over J: Cookie Manager keeps session
  J->>S: POST /orders (JSON body)
  S-->>J: 201, orderId 7781
  Note over J: JSON Extractor stores orderId
  J->>S: GET /orders/${orderId}
```

### Parameterization with CSV Data Set Config

| Setting | Meaning |
|---|---|
| Filename | Path to the CSV file (relative paths resolve from the test plan's folder) |
| Variable Names | Comma-separated names; leave empty to use the file's header line |
| Ignore first line | Skip a header line when Variable Names is set |
| Delimiter | Usually `,` |
| Recycle on EOF | Start again from the top when the file ends |
| Stop thread on EOF | Stop the thread when the file ends (used when each line must be used once) |
| Sharing mode | All threads, Current thread group, or Current thread |

Lines are read once per iteration of the thread. Other parameterization sources include JMeter functions such as `${__Random(1,1000)}`, `${__UUID()}`, `${__time()}` and `${__threadNum}`, documented in the JMeter functions reference.

## Real-world example

A team scripted an insurance quote journey and saw excellent response times at the target load. A reviewer noticed every virtual user requested a quote for the same postcode and vehicle. The pricing service cached results by those inputs, so almost every request was a cache hit. After parameterizing postcodes and vehicles from a file built from anonymised, representative data, the cache hit ratio dropped to a realistic level and the pricing service's p95 rose well above the objective, revealing a genuine capacity gap.

## Step-by-step walkthrough

1. **Record** the journey twice with different users (HTTP(S) Test Script Recorder or browser export).
2. **Diff** the two recordings and list every changing value.
3. **Classify** each: user input (parameterize), server-generated (correlate), or time-based (generate with a function).
4. **Add extractors** to the responses that first issue each dynamic value, with a default of `NOT_FOUND`.
5. **Create CSV data** with enough unique rows for the concurrency and duration.
6. **Configure CSV Data Set Config** and replace literals with `${variables}`.
7. **Debug with 2 threads** and a Debug Sampler to confirm each thread gets its own data and tokens.

## Code examples

Test data file `users.csv`:

```text
username,password,productId
user0001,Test-Pass-0001,1043
user0002,Test-Pass-0002,2210
user0003,Test-Pass-0003,1877
```

Regular Expression Extractor settings for a hidden form field:

```text
Apply to:            Main sample only
Field to check:      Body
Name of variable:    csrfToken
Regular Expression:  name="csrf_token" value="([^"]+)"
Template:            $1$
Match No.:           1
Default Value:       NOT_FOUND
```

The request body then uses the variables:

```text
username=${username}&password=${password}&csrf_token=${csrfToken}
```

## Expected output

A Debug Sampler after login shows each thread's variables, for example:

```text
csrfToken=3c0d5e7b9a
username=user0002
productId=2210
```

If you see `csrfToken=NOT_FOUND`, the extractor did not match and the next request will fail.

## Common mistakes

- **Leaving recorded tokens hard-coded**, which often passes briefly and then fails when tokens expire.
- **Extracting from the wrong response** (for example, after a redirect the token is in the final page, not the 302).
- **No default value**, so failed extraction sends an empty string that is hard to spot.
- **Using Current thread sharing mode** by accident, giving every thread the same data.
- **Too little test data**, causing duplicate logins, unique-constraint errors or unrealistic caching.
- **Using production personal data** in test files instead of synthetic or properly anonymised data.

## Troubleshooting

- **Extraction works for one thread but not many.** The value may be per-user; confirm the extractor is in thread scope and data is unique.
- **Regex matches the wrong occurrence.** Make the pattern more specific or prefer a JSON or CSS selector extractor for structured responses.
- **CSV values come out quoted or empty.** Check the delimiter, encoding and "Allow quoted data" setting.

## Key takeaways summary

Correlation replays server-generated values correctly; parameterization makes each virtual user a distinct, realistic user. Find dynamic values systematically, extract with safe defaults, verify with a Debug Sampler, and size your test data for the concurrency and duration of the test.
