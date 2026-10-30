---
slug: jmeter-assertions-and-extractors
title: Assertions and Extractors in JMeter
summary: Without assertions, a load test counts error pages as successes. Learn JMeter's Response, JSON and Duration assertions and the Regular Expression, JSON and Boundary extractors, and how to use them without distorting results.
level: intermediate
duration: 35
tags: [performance, jmeter, assertions, extractors]
objectives:
  - Choose the right JMeter assertion to verify status, content, JSON values and duration
  - Configure Regular Expression, JSON and Boundary extractors correctly
  - Explain how assertion failures affect error rate and results
  - Keep assertions and extractors lightweight enough for high load
prerequisites:
  - JMeter fundamentals
  - Correlation and parameterization
  - Basic regular expressions and JSONPath
related: [jmeter-correlation-and-parameterization, jmeter-groovy-jsr223, jmeter-fundamentals, analyzing-performance-results]
references:
  - title: Apache JMeter - Component Reference (Assertions and Post-Processors)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter - Regular Expressions
    url: https://jmeter.apache.org/usermanual/regular_expressions.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: Why are assertions essential in a load test?
    a: JMeter marks a sample as failed only for transport errors or HTTP error codes by default. Many applications return HTTP 200 with an error page, an empty result or a login page when something goes wrong under load. Without assertions those count as successes, the error rate looks perfect, and the fast error responses even improve the response-time figures. Assertions make correctness part of the performance result.
  - q: When would you use a JSON Extractor instead of a Regular Expression Extractor?
    a: For JSON responses I prefer the JSON Extractor because a JSONPath such as $.data.token follows the document structure and does not break when field order or whitespace changes. Regular expressions are more general and work for HTML, headers or plain text, but are fragile on structured data. For simple text between two known strings, the Boundary Extractor is often simplest and cheaper than a regex.
  - q: What does a Duration Assertion do and how does it differ from an SLA in the report?
    a: A Duration Assertion fails any individual sample that takes longer than the configured number of milliseconds, so slow responses are counted as errors. It is a per-sample hard limit. An SLA or SLO is usually stated as a percentile over many samples, for example p95 under 800 ms, which you evaluate in analysis or with the dashboard's thresholds. Mixing the two can make the error rate reflect slowness rather than functional failures, so I label it clearly if I use it.
practice:
  - "Add a Response Assertion that fails a login request if the response does not contain the text Welcome and the response code is not 200."
  - "Write a JSON Extractor and a JSON Assertion for a response that returns an order with a status field that must equal CONFIRMED."
  - "Rewrite a Regular Expression Extractor that captures an ID between id= and & as a Boundary Extractor."
takeaways:
  - HTTP 200 does not mean success; assert on content, status and business values.
  - "Response Assertion checks text, codes, headers; JSON Assertion checks JSONPath values; Duration Assertion fails slow samples."
  - Prefer JSON Extractor for JSON and Boundary Extractor for simple text; use regex when structure is irregular.
  - Always set a default value on extractors and assert that extraction succeeded.
  - Keep assertions cheap; heavy checks on large responses consume load generator CPU.
quiz:
  - id: perf-jae-q1
    type: scenario
    topic: jmeter-assertions-and-extractors
    difficulty: intermediate
    prompt: Under load, a search API starts returning HTTP 200 with body {"results":[],"error":"timeout"}. The JMeter error rate stays at 0%. Which assertion best catches this?
    options: ["Duration Assertion of 5,000 ms", "JSON Assertion that $.error does not exist, or that $.results has at least one element", "Size Assertion greater than 0 bytes", "No assertion is needed because status is 200"]
    answer: [1]
    explanation: The failure is in the content, so a JSON Assertion on the error field or result count catches it. The body is not empty and may be fast, so size and duration checks would pass; relying on status 200 is exactly the mistake.
  - id: perf-jae-q2
    type: code-output
    topic: jmeter-assertions-and-extractors
    difficulty: intermediate
    prompt: "A Regular Expression Extractor uses expression id=(\\d+)&type=(\\w+), template $2$, Match No. 1, and the response contains id=42&type=card. What is stored in the variable?"
    code: |
      Response body: ...href="/pay?id=42&type=card"...
      Regular Expression: id=(\d+)&type=(\w+)
      Template: $2$
      Match No.: 1
    codeLanguage: text
    options: ["42", "card", "id=42&type=card", "42card"]
    answer: [1]
    explanation: The template $2$ selects the second capture group, (\w+), which matched card. $1$ would give 42 and $0$ the whole match.
  - id: perf-jae-q3
    type: single
    topic: jmeter-assertions-and-extractors
    difficulty: beginner
    prompt: What does Match No. 0 mean in JMeter's Regular Expression and JSON extractors?
    options: ["The first match", "A random match", "All matches", "No match; use the default"]
    answer: [1]
    explanation: In JMeter's extractors, 0 picks a random match, a positive number picks that match, and -1 returns all matches as numbered variables. Assuming 0 means first is a common mistake that causes random data in later requests.
  - id: perf-jae-q4
    type: truefalse
    topic: jmeter-assertions-and-extractors
    difficulty: beginner
    prompt: A failed assertion marks the sample as an error, so it counts towards the error percentage in JMeter reports.
    options: ["True", "False"]
    answer: [0]
    explanation: When an assertion fails, the sample result is marked unsuccessful, and listeners and the HTML dashboard include it in the error count and error percentage.
---

## Beginner-friendly explanation

Imagine timing pizza deliveries. A driver who arrives in five minutes with an empty box is fast, but the delivery failed. If you only measure speed, the empty boxes make your average look great.

Load tests have the same trap. A server under pressure may answer quickly with "Something went wrong" while still saying "200 OK". **Assertions** open the box and check the pizza is actually inside. **Extractors** read information from a response, like the order number on the receipt, so the next request can use it.

## Technical explanation

### Assertions

Assertions run after the sampler and post-processors, in the same scope. A failed assertion marks the sample unsuccessful, so it appears in the error count.

| Assertion | Checks | Typical use |
|---|---|---|
| **Response Assertion** | Text response, response code, message, headers, URL; rules Contains, Matches, Equals, Substring, with Not and Or options | "Response code equals 200", "body contains Welcome", "body does not contain Exception" |
| **JSON Assertion** | That a JSONPath exists and optionally that its value equals an expected value (or matches a regex) | `$.status` equals `CONFIRMED` |
| **Duration Assertion** | Sample took no longer than N milliseconds | Hard per-request timeout check |
| **Size Assertion** | Response size compared with a byte count | Detect truncated or empty responses |
| **JSR223 Assertion** | Any logic in Groovy | Multi-field business rules |

Note the difference between **Contains/Matches** (regular expressions) and **Equals/Substring** (plain text). Using Contains with a string containing `?` or `.` can match unexpectedly because they are regex metacharacters.

### Extractors (post-processors)

| Extractor | Input | Key settings |
|---|---|---|
| **Regular Expression Extractor** | Body, headers, URL, response code | Reference name, regex, template (`$1$`), Match No., default |
| **JSON Extractor** | JSON body | Variable names, JSONPath (e.g. `$.data.token`), Match No., default |
| **Boundary Extractor** | Any text | Left boundary, right boundary, Match No., default |
| **CSS Selector Extractor** | HTML | CSS selector and attribute |
| **XPath Extractor** | XML or XHTML | XPath query |

**Match No.** works the same across these extractors: `1` is the first match, `n` the nth, `0` a **random** match, and `-1` all matches (creating `name_1`, `name_2`, … and `name_matchNr`).

```mermaid
flowchart LR
  S["Sampler: POST /orders"] --> E["JSON Extractor: orderId = $.id"]
  E --> A["JSON Assertion: $.status == CONFIRMED"]
  A -->|"pass"| N["Next sampler uses orderId"]
  A -->|"fail"| F["Sample counted as error"]
```

## Real-world example

A payments team's load test reported 0% errors and a healthy p95. During a review, someone noticed the p95 had *improved* at the highest load step. Inspecting a sample of responses showed that, beyond a certain rate, the gateway returned HTTP 200 with a JSON body containing `"status":"REJECTED","reason":"RATE_LIMITED"`. Those rejections were fast, pulling percentiles down. After adding a JSON Assertion on `$.status` the error rate at that step became clearly visible and the test correctly identified the rate limit as the capacity ceiling.

## Step-by-step walkthrough

1. **List what "success" means** for each request: status code, key text, key JSON fields.
2. **Add a Response Assertion** for status code (and, for HTML, a key text marker).
3. **Add JSON Assertions** for business fields on API responses.
4. **Add extractors** for every value later requests need, with `NOT_FOUND` defaults.
5. **Assert extraction**: a Response Assertion on the variable or the next request's success.
6. **Debug with View Results Tree** using one or two threads, then disable it for load.
7. **Review assertion cost**: avoid regex over multi-megabyte bodies on every sample.

## Code examples

JSON Extractor and JSON Assertion settings for an order response:

```text
JSON Extractor
  Names of created variables: orderId;orderStatus
  JSON Path expressions:      $.id;$.status
  Match No.:                  1;1
  Default Values:             NOT_FOUND;NOT_FOUND

JSON Assertion
  Assert JSON Path exists:    $.status
  Additionally assert value:  checked
  Expected Value:             CONFIRMED
```

Boundary Extractor for a token in a header such as `X-Request-Token: abc123;`:

```text
Field to check:   Response Headers
Left Boundary:    X-Request-Token:
Right Boundary:   ;
Match No.:        1
Default Value:    NOT_FOUND
```

The Boundary Extractor returns the text between the boundaries exactly, so a space after the colon would be included; add it to the left boundary if needed.

## Expected output

When the JSON Assertion fails, View Results Tree shows a failure message along these lines (exact wording varies by version):

```text
Assertion error: false
Assertion failure: true
Assertion failure message: Value expected to be 'CONFIRMED', but found 'REJECTED'
```

In the HTML dashboard, these samples appear in the Errors and Top 5 Errors by sampler tables.

## Common mistakes

- **No assertions at all**, so HTTP 200 error pages count as success.
- **Treating Match No. 0 as "first match"**; it is random.
- **Regex for JSON**, which breaks when field order or formatting changes.
- **Asserting on whole bodies** with large regexes, burning load generator CPU.
- **Duration Assertions used as SLOs**, which turns slowness into "errors" and confuses error analysis.
- **Extractor scoped too broadly**, running on every sampler and overwriting a good value with the default.

## Troubleshooting

- **Variable is NOT_FOUND.** Check "Apply to" (main sample versus sub-samples after redirects), the field to check and the expression against the actual response.
- **Assertion passes but data is wrong.** Assert on business fields, not just a keyword that also appears in error pages.
- **High CPU on load generators.** Simplify assertions and prefer JSON or Boundary extractors over complex regexes.

## Key takeaways summary

Assertions turn a speed test into a correct speed test, and extractors make multi-step journeys work. Assert on what success really means, extract with structure-aware tools and safe defaults, and keep both cheap enough that the load generator stays healthy.
