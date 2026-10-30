---
slug: http-status-codes
title: HTTP Status Codes
summary: Status codes are the API's first and most important answer. Learn the five classes, the codes testers meet daily, and how to tell 401 from 403, 400 from 422, and when 409 and 429 apply.
level: beginner
duration: 30
tags: [api, http, status-codes]
objectives:
  - Name the five status code classes and what each one means
  - Choose the correct expected status code for success, client error and server error scenarios
  - Distinguish 401 from 403, 400 from 422, and 404 from 405
  - Verify supporting headers such as Location, Allow, WWW-Authenticate and Retry-After
prerequisites:
  - HTTP requests, responses and methods
related: [http-fundamentals, api-negative-and-boundary-testing, idempotency-retries-rate-limiting, authentication-and-authorization]
references:
  - title: RFC 9110 — HTTP Semantics (section 15, Status Codes)
    url: https://www.rfc-editor.org/rfc/rfc9110
  - title: MDN Web Docs — HTTP response status codes
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
  - title: RFC 6585 — Additional HTTP Status Codes (429)
    url: https://www.rfc-editor.org/rfc/rfc6585
interview:
  - q: Explain the difference between 401 and 403.
    a: "401 Unauthorized means the request lacks valid authentication credentials; the server must send a WWW-Authenticate header describing how to authenticate, and the client may retry with credentials. 403 Forbidden means the server understood the request and refuses it; re-authenticating will not help, typically because the authenticated identity lacks permission. In short, 401 is 'who are you?' and 403 is 'I know who you are, and no'."
  - q: When would you expect 409 rather than 400 or 422?
    a: "409 Conflict means the request conflicts with the current state of the resource, for example creating a user whose email already exists or updating a record with a stale version. 400 is for a request the server cannot process because it is malformed, such as invalid JSON. 422 Unprocessable Content means the syntax is fine but the content fails semantic validation, such as a negative quantity. Whatever an API chooses, a tester checks it is consistent and documented."
  - q: What should a correct 429 response contain?
    a: "429 Too Many Requests (RFC 6585) indicates the client has sent too many requests in a given time. It may include a Retry-After header, either a number of seconds or an HTTP date, telling the client when to try again. I would verify the status, the Retry-After value, that the body does not leak internals, and that requests succeed again after the window."
  - q: Why is returning 200 with an error message in the body a problem?
    a: "Clients, proxies, monitoring and retry logic all rely on the status code. A 200 with {\"error\": ...} looks like success to all of them, so failures go unnoticed, caches may store the error, and alerting based on 5xx or 4xx rates misses it. I would log it as a defect against the API contract."
practice:
  - "Using the local mock API in the Practice Lab, trigger at least one response from each of the 2xx, 4xx and 5xx classes and record the status line and relevant headers."
  - "Call a protected endpoint with no token, with an expired token, and with a valid token belonging to a user without permission. Write down the expected and actual status for each."
  - "Send requests faster than the mock API's rate limit until you receive 429, then check whether Retry-After is present and correct."
takeaways:
  - The first digit gives the class — 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error.
  - 401 means missing or invalid authentication; 403 means authenticated but not allowed.
  - 400 is malformed, 422 is well-formed but semantically invalid, 409 is a conflict with current state.
  - 429 signals rate limiting and may carry Retry-After; 503 can carry it too.
  - Assert on the exact expected code, never just "not 500".
quiz:
  - id: http-status-q1
    type: scenario
    topic: http-status-codes
    difficulty: beginner
    prompt: A logged-in customer requests GET /admin/reports with a valid token. They are not an administrator. Which status is most appropriate?
    options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "400 Bad Request"]
    answer: [1]
    explanation: The user is authenticated, so 401 (missing or invalid credentials) is the tempting but wrong choice. The server knows who they are and refuses, which is 403. Some APIs deliberately return 404 to hide a resource's existence, but that is a documented design choice, not the default meaning.
  - id: http-status-q2
    type: single
    topic: http-status-codes
    difficulty: beginner
    prompt: Which status class indicates that the server failed to fulfil an apparently valid request?
    options: ["2xx", "3xx", "4xx", "5xx"]
    answer: [3]
    explanation: 5xx codes are server errors. 4xx is tempting because the request failed, but 4xx means the client did something wrong.
  - id: http-status-q3
    type: multiple
    topic: http-status-codes
    difficulty: intermediate
    prompt: Which responses may include a Retry-After header? Select all that apply.
    options: ["429 Too Many Requests", "503 Service Unavailable", "201 Created", "3xx redirects"]
    answer: [0, 1, 3]
    explanation: RFC 9110 allows Retry-After with 503 and with 3xx redirects, and RFC 6585 allows it with 429. It is not meaningful on 201.
  - id: http-status-q4
    type: debugging
    topic: http-status-codes
    difficulty: intermediate
    prompt: This test passes even when the API returns a validation error. What is the bug?
    code: |
      Response r = given().body(order).post("/orders");
      assertTrue(r.statusCode() < 500);
    codeLanguage: java
    options: ["The test should use statusCode() == 200", "The assertion accepts any 4xx, so validation failures pass; assert the exact expected code such as 201", "post() should be put()", "The body must be serialised to XML"]
    answer: [1]
    explanation: Asserting less than 500 accepts 400, 401 and 422, so the test cannot fail on a client error. A create endpoint should be asserted with its exact documented code, usually 201; asserting 200 would be the wrong exact code.
---

## Beginner-friendly explanation

When you post a parcel, the tracking page shows a short verdict before any detail: "delivered", "address problem", "returned to sender", "depot closed". You can act on that verdict without reading the full report.

**HTTP status codes** are that verdict. Every response starts with a three-digit number that tells the client, in one glance, whether the request worked, whether the client got something wrong, or whether the server failed. Programs, proxies and monitoring dashboards all make decisions based on this number, so getting it right matters as much as getting the data right.

## Technical explanation

RFC 9110 groups status codes into five classes by their first digit:

| Class | Meaning | Examples |
|---|---|---|
| 1xx | Informational, interim response | `100 Continue` |
| 2xx | Successful | `200`, `201`, `202`, `204` |
| 3xx | Redirection, further action needed | `301`, `302`, `304`, `307`, `308` |
| 4xx | Client error | `400`, `401`, `403`, `404`, `405`, `409`, `415`, `422`, `429` |
| 5xx | Server error | `500`, `502`, `503`, `504` |

Clients that don't recognise a specific code must treat it as the `x00` of its class, which is why the class matters.

### Codes testers meet daily

| Code | Use it when | Check also |
|---|---|---|
| 200 OK | Successful request with a body | Body content |
| 201 Created | A new resource was created | `Location` header |
| 202 Accepted | Accepted for asynchronous processing | A status URL to poll |
| 204 No Content | Success with no body (common for DELETE) | Body is empty |
| 304 Not Modified | Conditional GET, cached copy still valid | `ETag` / `If-None-Match` |
| 400 Bad Request | Malformed syntax, e.g. unparseable JSON | Error message is helpful, not a stack trace |
| 401 Unauthorized | Missing or invalid authentication | `WWW-Authenticate` header |
| 403 Forbidden | Authenticated but not permitted | No data leaked |
| 404 Not Found | Target resource not found | — |
| 405 Method Not Allowed | Method not supported for this resource | `Allow` header |
| 409 Conflict | Conflicts with current state (duplicate, stale version) | Explanation in body |
| 415 Unsupported Media Type | Body format not supported | Request `Content-Type` |
| 422 Unprocessable Content | Well-formed but semantically invalid | Field-level errors |
| 429 Too Many Requests | Rate limit exceeded (RFC 6585) | `Retry-After` |
| 500 Internal Server Error | Unexpected server failure | Always a defect to investigate |
| 503 Service Unavailable | Temporarily overloaded or in maintenance | `Retry-After` |

### 401 versus 403

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    C->>A: GET /reports (no Authorization header)
    A-->>C: 401 Unauthorized + WWW-Authenticate: Bearer
    C->>A: GET /reports (Bearer token for a standard user)
    A-->>C: 403 Forbidden
    C->>A: GET /reports (Bearer token for an admin)
    A-->>C: 200 OK
```

Despite its name, **401 is about authentication** ("we don't know who you are"). **403 is about authorization** ("we know who you are and the answer is no").

### 400, 422 and 409

These three are often confused. **400** is for requests the server cannot or will not process because of a client error such as malformed JSON. **422** (named "Unprocessable Content" in RFC 9110) is for well-formed requests whose content is semantically invalid, such as `"quantity": -3`. **409** is for a conflict with the resource's current state, such as a duplicate username or an update based on an outdated version. Many APIs use 400 for all validation errors; that is acceptable if it is documented and consistent.

## Real-world example

A subscriptions team built an endpoint that wrapped every outcome in `200 OK` with a body such as `{"success": false, "error": "card declined"}`. Dashboards showed a near-zero error rate, so nobody noticed when a configuration change made every renewal fail. The failures were only discovered from customer complaints.

The fix was to return proper status codes (`402` or `422` for declined cards per the team's contract, `503` when the payment provider was down) and to add API tests that asserted the exact code for each scenario.

## Step-by-step walkthrough

1. **List the scenarios** for an endpoint: success, each validation rule, missing auth, wrong permission, missing resource, conflict, rate limit.
2. **Write the expected status for each** from the contract. If the contract is silent, raise a question rather than guessing.
3. **Assert the exact code**, not a range.
4. **Assert the companion headers**: `Location` on 201, `Allow` on 405, `WWW-Authenticate` on 401, `Retry-After` on 429 when documented.
5. **Check error bodies** are consistent in structure and never expose stack traces or SQL.

## Code examples

```bash
# 401: no credentials
curl -i http://localhost:8080/reports

# 405: method not supported on this resource
curl -i -X DELETE http://localhost:8080/reports

# 422: valid JSON, invalid value
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{"sku": "BOOK-001", "quantity": -3}'
```

## Expected output

Exact headers depend on the server, but a correct implementation returns:

```text
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer

HTTP/1.1 405 Method Not Allowed
Allow: GET, HEAD

HTTP/1.1 422 Unprocessable Content
Content-Type: application/json
{"errors":[{"field":"quantity","message":"must be at least 1"}]}
```

## Common mistakes

- **Asserting "not 500" or "less than 400".** Ranges hide the exact defect.
- **Swapping 401 and 403** in expectations or bug reports.
- **Accepting 200 for a create.** If the contract says 201 with `Location`, 200 is a defect.
- **Treating every 404 as correct.** A 404 on a route that should exist can mean a routing or deployment fault.
- **Ignoring 5xx on negative tests.** Invalid input must produce a 4xx; a 500 means the server failed to validate.
- **Forgetting headers that give codes their meaning**, such as `Retry-After` on 429.

## Troubleshooting

- **You get 404 for a resource you just created**: check the base URL, path prefix (for example `/api/v1`) and whether creation is asynchronous (`202`).
- **You get 403 when you expected 401**: some gateways reject unauthenticated calls with 403; confirm the documented behaviour and report inconsistency.
- **You get 502 or 504**: a gateway or proxy could not reach the upstream service; check service health before blaming the API logic.

## Key takeaways summary

The status code is the API's headline. Know the classes, pick the exact expected code for every scenario, verify the headers that accompany it, and treat a wrong code as a real defect even when the body looks fine.
