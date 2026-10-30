---
slug: http-fundamentals
title: HTTP Requests, Responses and Methods
summary: Every API test is an HTTP conversation. Learn the anatomy of requests and responses, what each method means, and which methods are safe and idempotent under RFC 9110.
level: beginner
duration: 30
tags: [api, http, fundamentals]
objectives:
  - Describe the parts of an HTTP request and an HTTP response
  - Explain the intended semantics of GET, HEAD, POST, PUT, PATCH, DELETE and OPTIONS
  - Classify methods as safe and/or idempotent according to RFC 9110
  - Use headers such as Content-Type, Accept and Authorization correctly in tests
prerequisites:
  - Basic understanding of client and server
  - Comfort using a terminal
related: [http-status-codes, rest-principles, json-and-xml-for-testers, idempotency-retries-rate-limiting]
references:
  - title: RFC 9110 — HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110
  - title: MDN Web Docs — HTTP
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
interview:
  - q: What is the difference between a safe method and an idempotent method?
    a: "A safe method is read-only in intent: the client is not requesting any change of state on the server (GET, HEAD, OPTIONS, TRACE). An idempotent method is one where sending the same request several times has the same intended effect on the server as sending it once (all safe methods plus PUT and DELETE). Every safe method is idempotent, but PUT and DELETE are idempotent without being safe. POST and PATCH are neither by definition, although a particular API can make them idempotent."
  - q: Is DELETE idempotent if the second call returns 404?
    a: "Yes. Idempotency is about the effect on server state, not the response. After the first DELETE the resource is gone; after the second it is still gone. A different status code on the repeat (204 then 404) does not break idempotency. As a tester I would still check that the documented behaviour is consistent."
  - q: What is the difference between PUT and PATCH?
    a: "PUT replaces the target resource's state with the representation in the body, so fields you omit may be cleared or defaulted. PATCH (RFC 5789) applies a partial modification described by the body, for example a JSON Merge Patch. PUT is idempotent by definition; PATCH is not guaranteed to be, because a patch such as 'increment counter' changes the result each time."
  - q: Why do Content-Type and Accept matter in an API test?
    a: "Content-Type describes the format of the body actually being sent; Accept tells the server which response formats the client can handle. A wrong Content-Type often produces 415 Unsupported Media Type or a confusing parse error, and an unsupported Accept can produce 406 Not Acceptable. Tests should set both explicitly so results don't depend on tool defaults."
practice:
  - "Using the local mock API in the Practice Lab, send GET, HEAD and OPTIONS to the same resource and compare the status lines, headers and bodies."
  - "Send the same PUT request three times and the same POST request three times to the mock API. Record how server state differs and explain it in terms of idempotency."
  - "Send a POST with a JSON body but Content-Type set to text/plain. Record the status code and error message, then fix the request."
takeaways:
  - An HTTP request has a method, a target, headers and an optional body; a response has a status code, headers and an optional body.
  - Safe methods (GET, HEAD, OPTIONS, TRACE) request no state change; idempotent methods (safe ones plus PUT and DELETE) have the same effect when repeated.
  - POST and PATCH are not idempotent by definition; retrying them blindly can create duplicates.
  - Always set Content-Type for bodies and Accept for the format you expect, and assert on response headers as well as the body.
quiz:
  - id: http-fund-q1
    type: multiple
    topic: http-fundamentals
    difficulty: beginner
    prompt: According to RFC 9110, which methods are idempotent? Select all that apply.
    options: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    answer: [0, 2, 3]
    explanation: GET (safe, therefore idempotent), PUT and DELETE are idempotent by definition. POST is not, and PATCH is not guaranteed to be because a patch may describe a relative change. Picking PATCH is the common trap.
  - id: http-fund-q2
    type: truefalse
    topic: http-fundamentals
    difficulty: beginner
    prompt: A safe method is one that cannot ever change anything on the server.
    options: ["True", "False"]
    answer: [1]
    explanation: Safe means the client does not request a state change. A server may still log the request or update a hit counter. What matters is that the client is not responsible for side effects, which is why crawlers and prefetchers may call GET freely.
  - id: http-fund-q3
    type: scenario
    topic: http-fundamentals
    difficulty: intermediate
    prompt: A client times out while waiting for the response to a POST /payments request and automatically retries it. What is the main risk?
    options: ["The server returns 405 Method Not Allowed", "A duplicate payment may be created because POST is not idempotent", "The retry is cached and never reaches the server", "Nothing, because HTTP retries are always safe"]
    answer: [1]
    explanation: The first request may have succeeded even though the response was lost. Because POST is not idempotent, the retry can create a second payment unless the API supports something like an idempotency key. 405 is unrelated, and POST responses are not cached by default.
  - id: http-fund-q4
    type: single
    topic: http-fundamentals
    difficulty: beginner
    prompt: Which header tells the server what format the request body is in?
    options: ["Accept", "Content-Type", "Authorization", "Cache-Control"]
    answer: [1]
    explanation: Content-Type describes the body being sent. Accept is tempting but describes which formats the client wants back.
---

## Beginner-friendly explanation

Think of ordering at a restaurant counter. You walk up and say **what you want done** ("I'd like to order"), **which item** ("the veggie burger"), add some **notes** ("no onions, I'm paying by card") and maybe hand over a **written slip** with details. The cashier replies with **a quick verdict** ("done", "we're out of that", "you can't order from the staff menu"), some notes of their own ("ready in 10 minutes") and finally **your food**.

HTTP works the same way. The client (your browser, Postman, or a test) sends a **request**. The server sends back a **response**. API testing is mostly about sending carefully chosen requests and checking that every part of the response is what the requirement says it should be.

## Technical explanation

HTTP semantics are defined in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110). The message format differs between HTTP/1.1, HTTP/2 and HTTP/3, but the semantics (methods, status codes, headers) are the same.

A **request** contains:

- a **method** (GET, POST, …),
- a **target URI** (scheme, host, path and optional query, e.g. `https://api.example.test/orders?status=open`),
- **header fields** (metadata such as `Content-Type`, `Accept`, `Authorization`),
- an optional **body** (content), typically JSON for modern APIs.

A **response** contains a **status code** (e.g. `200`), header fields and an optional body.

### Methods and their properties

RFC 9110 defines two properties testers must know:

- **Safe**: the client does not request any state change. Safe methods are essentially read-only.
- **Idempotent**: the intended effect of N identical requests is the same as one request.

| Method | Intended meaning | Safe | Idempotent |
|---|---|---|---|
| GET | Retrieve a representation of the resource | Yes | Yes |
| HEAD | Same as GET but without the response body | Yes | Yes |
| OPTIONS | Describe communication options (e.g. allowed methods) | Yes | Yes |
| POST | Process the enclosed body (often "create a child resource") | No | No |
| PUT | Create or replace the target resource with the body | No | Yes |
| DELETE | Remove the association for the target resource | No | Yes |
| PATCH | Apply a partial modification (RFC 5789) | No | No (not guaranteed) |

Idempotency describes **server state**, not the response. A repeated DELETE may return `204` and then `404`; it is still idempotent because the resource is gone either way.

### Headers testers check most often

| Header | Direction | Purpose |
|---|---|---|
| `Content-Type` | both | Media type of the body, e.g. `application/json` |
| `Accept` | request | Media types the client can handle |
| `Authorization` | request | Credentials, e.g. `Bearer <token>` |
| `Location` | response | URI of a newly created resource (with `201`) or redirect target |
| `Cache-Control` | both | Caching directives |
| `Allow` | response | Methods the resource supports (with `405` or `OPTIONS`) |

```mermaid
sequenceDiagram
    participant C as Client (test)
    participant S as API server
    C->>S: POST /orders  (Content-Type: application/json)
    S-->>C: 201 Created  (Location: /orders/42)
    C->>S: GET /orders/42  (Accept: application/json)
    S-->>C: 200 OK  + JSON body
    C->>S: DELETE /orders/42
    S-->>C: 204 No Content
```

## Real-world example

An ordering team exposed `PUT /carts/{id}/items` to "add an item". Because PUT is idempotent, a mobile SDK retried it automatically on network timeouts. Each retry added another item, so customers who were on poor connections saw duplicate products in their cart.

The fix was a design change, not a code tweak: adding an item became `POST /carts/{id}/items`, and PUT was reserved for replacing the whole item list. A tester who knew method semantics could have flagged the mismatch in design review by asking one question: "if this PUT is sent twice, is the result the same?"

## Step-by-step walkthrough

1. **Read the endpoint contract.** Note the method, path, required headers, body schema and documented responses.
2. **Send the happy-path request** with explicit `Content-Type` and `Accept` headers.
3. **Assert on the status line first**, then on important headers (`Content-Type`, `Location`), then on the body.
4. **Check method semantics.** Repeat PUT and DELETE and confirm state is unchanged after the first call. Confirm GET does not change state.
5. **Try unsupported methods**, for example PATCH on a read-only resource, and expect `405 Method Not Allowed` with an `Allow` header.
6. **Vary headers.** Send a wrong `Content-Type` (expect `415`) and an unsupported `Accept` (often `406`).

## Code examples

The same conversation using `curl`. `-i` prints the status line and headers.

```bash
# Create
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"sku": "BOOK-001", "quantity": 2}'

# Read
curl -i http://localhost:8080/orders/42 -H "Accept: application/json"

# HEAD returns the same headers as GET but no body
curl -I http://localhost:8080/orders/42
```

## Expected output

For the create call against a correct implementation (header values will vary):

```text
HTTP/1.1 201 Created
Content-Type: application/json
Location: /orders/42

{"id":42,"sku":"BOOK-001","quantity":2,"status":"open"}
```

The `HEAD` call prints a `200 OK` status line and headers, but no body.

## Common mistakes

- **Asserting only on the body.** A body that "looks right" with status `200` instead of `201`, or with a wrong `Content-Type`, is still a defect.
- **Treating idempotency as "same response".** It is about the effect on the server.
- **Assuming PATCH is idempotent.** It may be in a given API, but the specification does not guarantee it.
- **Relying on tool defaults for headers.** Some clients add `Accept: */*` or a default `Content-Type`; make tests explicit.
- **Putting sensitive data in query strings.** URLs end up in logs, history and proxies; flag APIs that do this.
- **Ignoring HEAD and OPTIONS.** They are cheap to test and often reveal routing or CORS defects.

## Troubleshooting

- **`415 Unsupported Media Type`**: the server cannot parse the body format; check `Content-Type`.
- **`405 Method Not Allowed`**: the path exists but not for that method; read the `Allow` header.
- **The body is empty but the status is 200**: check whether you sent `HEAD` by mistake, or whether the server returns `204` for this case.

## Key takeaways summary

HTTP is a structured conversation: method, target, headers and body out; status, headers and body back. Knowing which methods are safe and idempotent lets you predict retry behaviour, spot design defects early and write assertions that cover the whole response, not just the JSON.
