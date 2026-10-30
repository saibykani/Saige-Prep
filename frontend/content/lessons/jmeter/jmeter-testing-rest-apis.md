---
slug: jmeter-testing-rest-apis
title: Testing REST APIs with JSON, Tokens and Chaining in JMeter
summary: Build an API load test from scratch. Send JSON bodies with the right Content-Type, extract an access token with the JSON Extractor, chain it into an Authorization Bearer header, and validate responses with JSON and Response Assertions.
level: intermediate
duration: 40
tags: [performance, jmeter, api-testing, json]
objectives:
  - Send a POST request with a JSON body and a Content-Type header from an HTTP Header Manager
  - Extract an access token from a JSON response with the JSON Extractor and the JSONPath $.access_token
  - Chain the token into later requests as Authorization Bearer ${token}
  - Validate status codes with a Response Assertion and JSON fields with a JSON Assertion
prerequisites:
  - JMeter fundamentals and the HTTP Request sampler
  - Basic JSON and HTTP status codes
related: [jmeter-assertions-and-extractors, jmeter-correlation-and-parameterization, jmeter-http-request-sampler, json-and-xml-for-testers, http-status-codes]
references:
  - title: Apache JMeter - Component Reference (HTTP Request, HTTP Header Manager, JSON Extractor, JSON Assertion)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: MDN Web Docs - HTTP
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
interview:
  - q: How do you test a token-protected REST API in JMeter?
    a: "First a login sampler POSTs JSON credentials, with Content-Type application/json set in a Header Manager. A JSON Extractor on that sampler stores $.access_token in a variable such as token, with a default like TOKEN_NOT_FOUND. Later requests have a Header Manager with Authorization set to Bearer ${token}. I add assertions on each step so a failed login is reported as an error instead of letting later calls fail confusingly."
  - q: Why is a 200 status code alone not enough to call an API request successful?
    a: "Some APIs return 200 with an error object in the body, or an empty list when data is missing. I combine a Response Assertion on the status code with a JSON Assertion on a key field, for example that $.status equals CREATED or that $.id exists. That catches functional failures that only appear under load."
  - q: Where should the Header Manager for the Authorization header be placed?
    a: "In the scope of the requests that need it, for example under a Transaction Controller containing the protected calls, or directly as a child of each sampler. If I put it at Thread Group level it also applies to the login request, where ${token} does not exist yet, which sends a literal Bearer ${token} header."
practice:
  - "Run a small REST API on localhost with /api/login, /api/products and /api/orders. Build login → list products → create order with token chaining and assertions."
  - "Break the password in your CSV and check that the login assertion fails and the order request is skipped or clearly marked, instead of producing confusing 401s."
  - "Extract the first product id with $.items[0].id and use it in the order body. Then change it to a random product using Match No. 0."
takeaways:
  - JSON bodies go in Body Data, and Content-Type application/json goes in an HTTP Header Manager.
  - The JSON Extractor stores values from responses; always set a default value that is easy to spot.
  - Chain tokens with an Authorization header of Bearer ${token}, scoped to the requests that need it.
  - Assert the status code and at least one meaningful JSON field on every important step.
  - Only test APIs you run yourself or are authorised in writing to test.
quiz:
  - id: jm-rest-q1
    type: single
    topic: jmeter-testing-rest-apis
    difficulty: beginner
    prompt: Your login response is {"access_token":"eyJ...","expires_in":3600}. Which JSONPath expression extracts the token?
    options: ["//access_token", "$.access_token", "access_token=(.+)", "${access_token}"]
    answer: [1]
    explanation: $ is the root of the JSON document and .access_token selects the field. //access_token is XPath, the third option is a regular expression, and ${access_token} is JMeter variable syntax.
  - id: jm-rest-q2
    type: debugging
    topic: jmeter-testing-rest-apis
    difficulty: intermediate
    prompt: Your POST with a JSON body returns 415 Unsupported Media Type from your local API. What is the most likely fix?
    options: ["Add a Constant Timer", "Add an HTTP Header Manager with Content-Type application/json", "Change the method to GET", "Increase the connect timeout"]
    answer: [1]
    explanation: 415 means the server does not accept the declared media type. Without a Content-Type header the API cannot tell the body is JSON. Timers and timeouts do not change the media type.
  - id: jm-rest-q3
    type: scenario
    topic: jmeter-testing-rest-apis
    difficulty: intermediate
    prompt: All /api/orders requests fail with 401. View Results Tree shows the header Authorization Bearer TOKEN_NOT_FOUND. What happened?
    options: ["The server is overloaded", "The JSON Extractor did not find the token, so its default value was used", "The Bearer keyword is wrong", "The CSV file has too many rows"]
    answer: [1]
    explanation: TOKEN_NOT_FOUND is the extractor's default value, so the JSONPath did not match the login response, often because login itself failed or the field name differs. Check the login response and the path.
  - id: jm-rest-q4
    type: multiple
    topic: jmeter-testing-rest-apis
    difficulty: intermediate
    prompt: Which checks verify that an order was really created? Select all that apply.
    options: ["Response Assertion: Response Code equals 201", "JSON Assertion: $.id exists", "JSON Assertion: $.status equals CREATED", "Duration Assertion of 10 minutes"]
    answer: [0, 1, 2]
    explanation: The status code, a generated id and the expected status field together prove creation. A very generous duration assertion says nothing about correctness.
  - id: jm-rest-q5
    type: truefalse
    topic: jmeter-testing-rest-apis
    difficulty: beginner
    prompt: A JSON Extractor only affects samplers in its scope and runs after the sampler it is attached to.
    options: ["True", "False"]
    answer: [0]
    explanation: Extractors are post-processors. Attached as a child of the login sampler, they run after that sampler's response arrives, which is exactly what chaining needs.
---

## Beginner-friendly explanation

A **REST API** is a set of web addresses that programs (not people) call to read or change data, usually exchanging **JSON**, a text format like `{"name":"Asha","age":30}`.

Many APIs work like a hotel. First you check in at reception (the **login** call) and receive a key card (an **access token**, a long string proving who you are). For every later door (API call) you show the key card. If you show no card, you get a "401 Unauthorized".

In JMeter you must automate that: log in, copy the token out of the response, and attach it to every later request. Copying a value from one response into another request is called **chaining**.

> **Authorisation rule:** practise only on an API you run yourself, for example a small app on `localhost:3000`. Never load-test third-party APIs without written permission.

## Technical explanation

Building blocks:

| Element | Add via | Role |
|---|---|---|
| HTTP Request | Add → Sampler → HTTP Request | Method, path and **Body Data** (raw JSON) |
| HTTP Header Manager | Add → Config Element → HTTP Header Manager | Headers such as `Content-Type: application/json` and `Authorization` |
| JSON Extractor | Add → Post Processors → JSON Extractor | Reads a value with a **JSONPath** into a variable |
| Response Assertion | Add → Assertions → Response Assertion | Checks the status code or text |
| JSON Assertion | Add → Assertions → JSON Assertion | Checks a JSONPath exists or equals a value |

**JSONPath** is a query language for JSON: `$` is the root, `.field` a child, `[0]` the first array element. `$.access_token` reads the token; `$.items[0].id` the first item's id.

**JSON Extractor fields:** *Names of created variables* (`token`), *JSON Path expressions* (`$.access_token`), *Match No.* (`1` = first, `0` = random, `-1` = all), *Default Values* (`TOKEN_NOT_FOUND`).

```mermaid
sequenceDiagram
  participant J as JMeter thread
  participant A as Local API (localhost:3000)
  J->>A: POST /api/login {username,password} Content-Type application/json
  A-->>J: 200 {"access_token":"eyJ...","expires_in":3600}
  Note over J: JSON Extractor $.access_token to token
  J->>A: GET /api/products Authorization Bearer ${token}
  A-->>J: 200 {"items":[{"id":"p-7"}]}
  Note over J: JSON Extractor $.items[0].id to productId
  J->>A: POST /api/orders {"productId":"${productId}"}
  A-->>J: 201 {"id":"o-123","status":"CREATED"}
```

For deeper coverage of extractors and assertions see [Assertions and extractors](/learn/jmeter/jmeter-assertions-and-extractors) and [Correlation](/learn/jmeter/jmeter-correlation-and-parameterization).

## Step-by-step walkthrough

1. **Test Plan → Add → Config Element → HTTP Request Defaults:** Protocol `http`, Server `localhost`, Port `3000`.
2. **Thread Group → Add → Config Element → CSV Data Set Config** with `username,password` (see [CSV Data Set Config](/learn/jmeter/jmeter-csv-data-set-config)).
3. **Login request.** HTTP Request named `01 Login`, Method `POST`, Path `/api/login`, **Body Data** tab:

```json
{ "username": "${username}", "password": "${password}" }
```

4. Right-click `01 Login` → **Add → Config Element → HTTP Header Manager**, click **Add**: Name `Content-Type`, Value `application/json`.
5. Right-click `01 Login` → **Add → Post Processors → JSON Extractor**: variable `token`, path `$.access_token`, Match No. `1`, Default `TOKEN_NOT_FOUND`.
6. Right-click `01 Login` → **Add → Assertions → Response Assertion**: *Field to Test* = **Response Code**, *Pattern Matching Rules* = **Equals**, pattern `200`.
7. Add a **Transaction Controller** named `Authenticated calls`. Under it add an HTTP Header Manager with `Content-Type: application/json` and `Authorization: Bearer ${token}`.
8. Inside it: `02 List products` (`GET /api/products`) with a JSON Extractor `productId` = `$.items[0].id`, default `PRODUCT_NOT_FOUND`.
9. `03 Create order` (`POST /api/orders`), body `{"productId":"${productId}","quantity":1}`. Add a Response Assertion (Response Code equals `201`) and a **JSON Assertion**: *Assert JSON Path exists* `$.status`, tick *Additionally assert value*, *Expected Value* `CREATED`.
10. Optionally, select the Thread Group and set **Action to be taken after a Sampler error** to *Start Next Thread Loop*, so a failed login skips the rest of that iteration.
11. Add **View Results Tree**, run 1 thread first, then a few.

## Expected output

Illustrative View Results Tree for one iteration:

```text
01 Login            200  Response: {"access_token":"eyJhbGciOi...","expires_in":3600}
Authenticated calls
  02 List products  200  Request headers: Authorization: Bearer eyJhbGciOi...
  03 Create order   201  Response: {"id":"o-123","status":"CREATED"}
```

With a wrong password, `01 Login` is red with "Test failed: code expected to equal 200" and the next steps are skipped.

## Real-world example

A team load-testing its own order API saw a 30-minute run with almost no errors and impressive speed. View Results Tree revealed every order call returned 200 with `{"error":"token expired"}`: the token lived 15 minutes and was fetched once. They added a JSON Assertion on `$.status`, re-logged in each iteration, and the real response time of order creation became visible.

## Common mistakes

- **No Content-Type header**, giving 415 or 400 responses.
- **Authorization header at Thread Group level**, sending `Bearer ${token}` on the login call itself.
- **No default value in the extractor**, making a missed match hard to see.
- **Asserting only status codes** on APIs that return errors inside 200 responses.
- **Hard-coding a token** copied from a browser; it expires and every user shares it.
- **Pointing the test at a public API** you do not own.

## Troubleshooting

- **401 on protected calls:** inspect the request headers in View Results Tree; check the token value and spelling of `Bearer`.
- **Extractor gives the default:** paste the response into a JSONPath tester (View Results Tree has a "JSON Path Tester" renderer) and fix the path.
- **400 Bad Request:** the JSON body is invalid, often an unquoted string variable or a trailing comma.
- **Works for 1 user, fails for many:** check data uniqueness and token expiry.

## Handling token expiry under load

Tokens usually expire (the `expires_in` field above says 3600 seconds). Choose a strategy that matches how real clients behave:

| Strategy | How in JMeter | When it fits |
|---|---|---|
| Log in every iteration | Login sampler inside the main loop | Short sessions; also load-tests the login service |
| Log in once per thread | Put login in a **Once Only Controller** | Long sessions; login is not the focus |
| Refresh when expired | If Controller checking a stored expiry time, then a refresh call | Long soak tests with short token lifetimes |

Whichever you choose, keep an assertion on every protected call so an expired token shows up as an error, not as a suspiciously fast 401 that looks like good performance.

## Key takeaways summary

A JMeter API test is a chain: send JSON with the right headers, extract what the next step needs, attach the token as `Bearer ${token}`, and assert both status and content at every step. Keep header managers scoped correctly and always run against an API you are authorised to test.
