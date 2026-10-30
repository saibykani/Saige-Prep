---
slug: idempotency-retries-rate-limiting
title: Idempotency, Retries and Rate Limiting
summary: Networks fail and clients retry. Learn how idempotent methods and idempotency keys prevent duplicates, how retries with exponential backoff and jitter should behave, and how to test rate limits, 429 and Retry-After.
level: advanced
duration: 40
tags: [api, reliability, idempotency, rate-limiting]
objectives:
  - Explain idempotency per RFC 9110 and why it matters for retries
  - Test idempotency-key behaviour for non-idempotent operations such as payments
  - Describe safe retry policies with exponential backoff, jitter and limits
  - Test rate limiting, 429 Too Many Requests and Retry-After
prerequisites:
  - HTTP requests, responses and methods
  - HTTP status codes
related: [http-fundamentals, http-status-codes, api-security-testing, api-database-validation]
references:
  - title: RFC 9110 — HTTP Semantics (idempotent methods, Retry-After)
    url: https://www.rfc-editor.org/rfc/rfc9110
  - title: RFC 6585 — Additional HTTP Status Codes (429)
    url: https://www.rfc-editor.org/rfc/rfc6585
  - title: MDN Web Docs — HTTP
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
  - title: OWASP API Security Top 10 (2023)
    url: https://owasp.org/API-Security/
interview:
  - q: How does an idempotency key work, and how would you test it?
    a: "The client generates a unique key, usually a UUID, and sends it in a header such as Idempotency-Key with a non-idempotent request like POST /payments. The server stores the key with the outcome; if the same key arrives again, it returns the stored result instead of executing again. I test that a repeated request with the same key and body creates one payment and returns the same response, that the same key with a different body is rejected, that concurrent duplicates still produce one payment, and that keys expire as documented."
  - q: Which requests is it safe to retry automatically?
    a: "Idempotent ones — GET, HEAD, PUT, DELETE — and non-idempotent ones only when they carry an idempotency key the server honours. I'd retry on network errors, timeouts, 429, 502, 503 and 504, but not on 400, 401, 403, 404 or 422 because repeating the same bad request won't help. Retries should use exponential backoff with jitter, a maximum number of attempts, and respect Retry-After."
  - q: How do you test a rate limit without causing problems?
    a: "Only against a system I'm authorized to test, ideally a dedicated environment or the Practice Lab mock with a low configured limit. I send requests at a controlled rate just under and just over the limit, verify 429 with Retry-After at the boundary, check that the limit is per client or per key as documented, that it resets after the window, and that rate-limited requests have no side effects."
practice:
  - "In the local mock API in the Practice Lab, send the same POST /payments twice with the same Idempotency-Key and confirm only one payment exists. Then reuse the key with a different amount and record the response."
  - "Send requests in a loop until you receive 429, record the Retry-After value, wait that long and confirm requests succeed again."
  - "Write a small retry helper with exponential backoff and jitter, and test it against the mock API's endpoint that fails the first two calls."
takeaways:
  - Idempotent methods (GET, HEAD, OPTIONS, PUT, DELETE) can be retried safely; POST and PATCH need an idempotency key.
  - Test idempotency keys for repeats, conflicting bodies, concurrency and expiry.
  - Retry only transient failures, with exponential backoff, jitter, a cap and respect for Retry-After.
  - 429 Too Many Requests signals rate limiting; Retry-After may be seconds or an HTTP date.
  - Rate-limit testing must be authorized and controlled.
quiz:
  - id: api-idem-q1
    type: scenario
    topic: idempotency-retries-rate-limiting
    difficulty: advanced
    prompt: Two identical POST /payments requests with the same Idempotency-Key arrive 5 ms apart, before the first has finished. What should a correct implementation guarantee?
    options: ["Two payments are created because neither had finished", "Exactly one payment; the second waits for or is rejected pending the first result", "Both requests fail with 500", "The second creates a refund"]
    answer: [1]
    explanation: Idempotency must hold under concurrency. A naive check-then-insert lets both through. Correct implementations lock or use a unique constraint on the key and return the first result or a conflict status to the duplicate.
  - id: api-idem-q2
    type: multiple
    topic: idempotency-retries-rate-limiting
    difficulty: intermediate
    prompt: Which responses are generally reasonable to retry automatically with backoff? Select all that apply.
    options: ["429 Too Many Requests", "503 Service Unavailable", "422 Unprocessable Content", "401 Unauthorized", "504 Gateway Timeout"]
    answer: [0, 1, 4]
    explanation: 429, 503 and 504 are usually transient. 422 and 401 are caused by the request itself; retrying the identical request will fail the same way (a 401 needs a new token, not a blind retry).
  - id: api-idem-q3
    type: code-output
    topic: idempotency-retries-rate-limiting
    difficulty: intermediate
    prompt: With this backoff formula, base 200 ms and no jitter, what is the delay before attempt 4?
    code: |
      delay(attempt) = min(maxDelay, base * 2^(attempt - 1))
      // base = 200 ms, maxDelay = 5000 ms
    codeLanguage: text
    options: ["800 ms", "1600 ms", "3200 ms", "5000 ms"]
    answer: [1]
    explanation: 200 × 2^(4−1) = 200 × 8 = 1600 ms, under the 5000 ms cap. 800 ms is attempt 3.
  - id: api-idem-q4
    type: truefalse
    topic: idempotency-retries-rate-limiting
    difficulty: beginner
    prompt: A repeated DELETE that returns 404 instead of 204 breaks idempotency.
    options: ["True", "False"]
    answer: [1]
    explanation: Idempotency is about the effect on server state. The resource is gone after one call or many; the status code may differ.
---

## Beginner-friendly explanation

You press a lift's call button five times. The lift still comes once. Pressing it again has the same effect as pressing it once: that is **idempotency**.

Now imagine a "pay" button that charges your card each time you press it. If the screen freezes and you press again, you pay twice. Networks freeze all the time, and software retries automatically, so APIs need a way to make "pay" behave like the lift button: the **idempotency key**. Separately, services protect themselves from too many requests with **rate limiting**, a polite "slow down, try again in 30 seconds". Testers check all three: safe repeats, sensible retries and fair limits.

## Technical explanation

### Idempotency

RFC 9110 defines a method as idempotent if the intended effect of multiple identical requests equals that of one. GET, HEAD, OPTIONS, TRACE, PUT and DELETE are idempotent; POST and PATCH are not by definition.

For non-idempotent operations, many APIs accept an **idempotency key**: a client-generated unique value (commonly a UUID in an `Idempotency-Key` header). The server stores the key with the request fingerprint and the response. An IETF draft specifies this header, but it was not a published RFC at the time of writing, so behaviour varies between APIs; test against the API's own documentation.

| Case | Expected (typical) |
|---|---|
| Same key, same body, after completion | Original response replayed; no new side effect |
| Same key, same body, while first in progress | One side effect; duplicate waits or gets a conflict (often 409) |
| Same key, different body | Rejected (often 409 or 422) |
| Key expired | Treated as a new request |
| No key | Normal non-idempotent behaviour |

### Retries

Retry only **transient** failures: connection errors, timeouts, 429, 502, 503, 504. Use **exponential backoff** (`base × 2^(attempt−1)`, capped), add **jitter** (randomness) so many clients don't retry in lockstep, cap the number of attempts, and honour `Retry-After` when present.

### Rate limiting

When a client exceeds its allowance the server returns **429 Too Many Requests** (RFC 6585), optionally with `Retry-After` as seconds (`Retry-After: 30`) or an HTTP date. Many APIs also send informational headers (names vary, e.g. `RateLimit-*` or `X-RateLimit-*`). Missing or weak limits are part of OWASP API4:2023 Unrestricted Resource Consumption.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Payments API
    C->>A: POST /payments (Idempotency-Key k1, amount 50)
    A--xC: response lost (timeout)
    C->>C: wait 200 ms + jitter
    C->>A: POST /payments (Idempotency-Key k1, amount 50)
    A-->>C: 201 Created (replayed, same payment id)
    C->>A: GET /payments?key=k1 (verification)
    A-->>C: one payment only
    loop burst beyond limit
        C->>A: GET /payments
    end
    A-->>C: 429 Too Many Requests, Retry-After 30
```

## Real-world example

A ticketing team added automatic retries to its mobile client to cope with flaky connections. "Reserve seats" was a POST without an idempotency key. During a busy on-sale, slow responses caused timeouts, the client retried, and customers ended up holding several reservations each, which made seats appear sold out.

The fix had three parts: an idempotency key on reservation requests, a unique constraint on the key in the database to handle concurrent duplicates, and a retry policy with jittered backoff. The test suite gained cases for replay, concurrent duplicates and key reuse with a different body.

## Step-by-step walkthrough

1. **Classify each endpoint**: idempotent by method, idempotent by key, or neither.
2. **Replay test**: send the same keyed request twice; check one side effect (verify in the database or via GET) and identical responses.
3. **Conflict test**: same key, different body.
4. **Concurrency test**: fire duplicates in parallel.
5. **Expiry test**: if the window is documented and short in a test environment, reuse the key after it.
6. **Retry policy test**: use a mock that fails N times; check attempts, delays and that non-retryable codes aren't retried.
7. **Rate-limit test** (authorized environment only): just under and just over the limit; check 429, `Retry-After`, reset, per-client scope and no side effects.

## Code examples

Testing concurrent duplicates with RestAssured and a thread pool:

```java
@Test
void concurrentDuplicatesCreateOnePayment() throws Exception {
    String key = UUID.randomUUID().toString();
    Map<String, Object> body = Map.of("orderId", orderId, "amount", 5000, "currency", "EUR");

    ExecutorService pool = Executors.newFixedThreadPool(5);
    List<Future<Integer>> results = new ArrayList<>();
    for (int i = 0; i < 5; i++) {
        results.add(pool.submit(() -> given().spec(req)
                .header("Idempotency-Key", key).body(body)
                .post("/payments").statusCode()));
    }
    pool.shutdown();
    for (Future<Integer> f : results) {
        assertTrue(Set.of(200, 201, 409).contains(f.get()));
    }

    given().spec(req).queryParam("orderId", orderId).get("/payments")
           .then().statusCode(200).body("items.size()", equalTo(1));
}
```

A client retry helper with capped exponential backoff and full jitter (Python):

```python
import random, time, requests

RETRYABLE = {429, 502, 503, 504}

def get_with_retry(url, attempts=5, base=0.2, cap=5.0):
    for attempt in range(1, attempts + 1):
        resp = requests.get(url, timeout=5)
        if resp.status_code not in RETRYABLE or attempt == attempts:
            return resp
        retry_after = resp.headers.get("Retry-After")
        if retry_after and retry_after.isdigit():
            delay = int(retry_after)
        else:
            delay = random.uniform(0, min(cap, base * 2 ** (attempt - 1)))
        time.sleep(delay)
```

## Expected output

For the concurrency test against a correct implementation, one call returns `201` and the others return `201` (replayed) or `409`, and the final list contains one payment. The rate-limit check should show:

```text
HTTP/1.1 429 Too Many Requests
Retry-After: 30
Content-Type: application/problem+json
```

## Common mistakes

- **Testing idempotency only sequentially**; most real defects are races.
- **Retrying non-idempotent requests** without a key.
- **Retrying 4xx validation errors**, wasting capacity and hiding bugs.
- **Fixed retry intervals without jitter**, causing synchronised retry storms.
- **Ignoring `Retry-After`.**
- **Load-testing someone else's rate limits.** Only test systems you are authorized to test.

## Troubleshooting

- **Duplicates despite a key**: check the key is actually sent (header name and case), and whether the server scopes keys per user or per endpoint.
- **No 429 even at high rates**: limits may be enforced at a gateway not present in your environment; confirm where limiting lives.
- **429 arrives but requests still take effect**: rate-limited requests must have no side effects; report it.

## Key takeaways summary

Retries are inevitable, so APIs must make repeats harmless. Rely on idempotent methods, require idempotency keys for operations like payments and test them under concurrency, retry only transient failures with jittered backoff, and verify that rate limits return 429 with a sensible `Retry-After` and no side effects.
