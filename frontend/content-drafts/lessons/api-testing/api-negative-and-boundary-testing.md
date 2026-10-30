---
slug: api-negative-and-boundary-testing
title: API Negative and Boundary Testing
summary: APIs are reached by any client, not just your UI, so they must reject bad input safely. Learn to design negative and boundary tests for payloads, parameters, headers and types, and what a good error response looks like.
level: intermediate
duration: 35
tags: [api, negative-testing, test-design, validation]
objectives:
  - Explain why API-level validation must not rely on UI validation
  - Apply boundary value analysis and equivalence partitioning to API fields and parameters
  - Design negative tests for types, required fields, formats, headers and payload structure
  - Define the expected status and error body for each negative case
prerequisites:
  - HTTP status codes
  - JSON and XML for testers
  - Boundary value analysis
related: [http-status-codes, json-schema-validation, api-security-testing, api-test-data-management]
references:
  - title: RFC 9110 — HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110
  - title: RFC 9457 — Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457
  - title: OWASP API Security Top 10 (2023)
    url: https://owasp.org/API-Security/
interview:
  - q: How do you design negative tests for a POST endpoint?
    a: "I list every input — path, query, headers and each body field — and for each one partition it into valid and invalid classes. Then I cover missing, null, empty, wrong type, out-of-range boundaries, wrong format, too long, and unexpected extra fields, plus structural cases like malformed JSON, wrong Content-Type and an empty body. I change one thing at a time from a valid baseline and expect a 4xx with a clear, consistent error body — never a 5xx."
  - q: What does a good API error response look like?
    a: "The right 4xx status, a consistent machine-readable body — RFC 9457 Problem Details is a good standard, with type, title, status, detail and often a list of field errors — a message that helps the client fix the request, and no internals such as stack traces, SQL or framework versions. It also shouldn't echo the submitted value back unescaped, which can create injection or data-exposure issues."
  - q: Why is a 500 on a negative test always a defect?
    a: "A 500 means the server failed to handle input it should have validated. Even if the request is rejected, the client can't tell whether it was its fault, retries may hammer the server, and the unhandled path may reveal internal details or hint at injection points. Invalid input should be caught and turned into a 4xx."
practice:
  - "Pick the create-order endpoint of the local mock API in the Practice Lab and build a negative test table covering missing, null, wrong type, boundary and extra fields for every body property."
  - "Run your table against the mock API with Postman or RestAssured and record any case that returns 5xx or 2xx instead of 4xx."
  - "Send a malformed JSON body, an empty body and a body with Content-Type text/plain, and compare the error responses for consistency."
takeaways:
  - Every API must validate its own input; clients other than your UI can send anything.
  - Vary one input at a time from a valid baseline so each failure has one cause.
  - Cover missing, null, empty, wrong type, boundaries, format, length, extra fields and malformed structure.
  - Expect a specific 4xx and a consistent error body; any 5xx is a defect.
  - Error responses must be helpful without leaking internals.
quiz:
  - id: api-neg-q1
    type: multiple
    topic: api-negative-and-boundary-testing
    difficulty: intermediate
    prompt: quantity must be an integer from 1 to 100. Which payload values are boundary or type tests worth sending? Select all that apply.
    options: ["0", "1", "100", "101", "\"5\" (a string)", "50"]
    answer: [0, 1, 2, 3, 4]
    explanation: 0, 1, 100 and 101 are the two-value boundaries, and the string "5" tests type handling, which APIs often get wrong through lenient coercion. 50 is a nominal equivalence-partition value, not a boundary.
  - id: api-neg-q2
    type: scenario
    topic: api-negative-and-boundary-testing
    difficulty: beginner
    prompt: Sending {"quantity": "abc"} to POST /orders returns 500 Internal Server Error with a Java stack trace. How should you classify this?
    options: ["Correct, because the request was invalid", "A defect: invalid input should produce a 4xx with a safe error body", "Expected behaviour for type errors", "A test environment problem"]
    answer: [1]
    explanation: Rejecting the request is right, but a 500 means validation was missing and the stack trace leaks internals. Expected is a 400 or 422 with a clean, documented error body.
  - id: api-neg-q3
    type: truefalse
    topic: api-negative-and-boundary-testing
    difficulty: beginner
    prompt: If the web form already restricts a field to 1–100, the API does not need its own boundary tests.
    options: ["True", "False"]
    answer: [1]
    explanation: Anyone can call the API directly with curl, scripts or other clients, bypassing the UI entirely. Validation and its tests must exist at the API.
  - id: api-neg-q4
    type: single
    topic: api-negative-and-boundary-testing
    difficulty: intermediate
    prompt: The API silently ignores an unknown field isAdmin true in a POST /users body and creates a normal user. Which risk should you still test for?
    options: ["None, ignoring unknown fields is always safe", "Mass assignment, where a known but protected field such as role can be set by the client", "Rate limiting", "Caching"]
    answer: [1]
    explanation: Ignoring truly unknown fields can be fine, but you must also try protected fields the model really has (role, balance, ownerId). Accepting them is mass assignment, part of OWASP API3:2023 Broken Object Property Level Authorization.
---

## Beginner-friendly explanation

A shop's front door has a sign: "maximum 10 people inside". The doorman counts. But the shop also has a loading bay round the back. If only the front door checks, anyone can walk in through the back.

The UI is the front door; the **API is the loading bay**. Scripts, partner systems, mobile apps and attackers all call the API directly. **Negative testing** checks what happens when someone sends something wrong; **boundary testing** checks the edges of what is allowed. Together they make sure the API itself refuses bad input politely, clearly and safely, whoever sends it.

## Technical explanation

An API's inputs are its **path parameters**, **query parameters**, **headers** and **body**. Each has a valid domain; anything else should be rejected with a **4xx** status and a consistent error body. [Boundary value analysis](/learn/manual-testing/boundary-value-analysis) and [equivalence partitioning](/learn/manual-testing/equivalence-partitioning) apply directly to API fields.

### Negative test categories

| Category | Examples for `"quantity": 1..100` | Typical expected status |
|---|---|---|
| Boundaries | 0, 1, 100, 101 | 422/400 outside, 201 inside |
| Missing | field omitted | 400/422 |
| Null / empty | `null`, `""` | 400/422 |
| Wrong type | `"5"`, `5.5`, `true`, `[]` | 400/422 (unless coercion is documented) |
| Extreme | `-1`, `2147483648`, `1e309` | 400/422, never 500 |
| Format and length | invalid email, 10,000-char name | 400/422 |
| Extra fields | unknown `foo`, protected `role` | ignored or 400, never applied |
| Structure | malformed JSON, empty body, array instead of object | 400 |
| Headers | missing/wrong `Content-Type`, unsupported `Accept` | 415 / 406 |
| Path/query | non-numeric id, unknown id, negative `limit` | 400 / 404 |

Status choices between 400 and 422 vary by API; what matters is that they are documented and consistent.

### Good error responses

RFC 9457 (Problem Details for HTTP APIs, which obsoletes RFC 7807) defines `application/problem+json` with members `type`, `title`, `status`, `detail` and `instance`, plus extensions such as a list of field errors. Whatever format is used, check that errors:

- name the field and the rule broken,
- are identical in shape across endpoints,
- contain no stack traces, SQL, file paths or library versions,
- don't reflect submitted values unescaped.

```mermaid
sequenceDiagram
    participant T as Test
    participant A as API
    T->>A: POST /orders (baseline, quantity 1)
    A-->>T: 201 Created
    T->>A: POST /orders (quantity 0)
    A-->>T: 422 problem+json, field quantity
    T->>A: POST /orders (quantity "abc")
    A-->>T: 400 problem+json, never 500
    T->>A: POST /orders (malformed JSON)
    A-->>T: 400 Bad Request
```

## Real-world example

A booking API accepted `"nights": 2147483647` because validation only checked `nights > 0`. Pricing multiplied nights by a nightly rate in a 32-bit integer, overflowed, and produced a negative total, which the payment step treated as a refund. The UI dropdown only allowed 1–30 nights, so no UI test could have found it.

A boundary test at the API level with the maximum documented value (30), its neighbour (31) and the data type's extreme value would have exposed both the missing upper bound and the overflow.

## Step-by-step walkthrough

1. **Collect the contract** for every input: type, required, range, length, format, allowed values.
2. **Create a valid baseline request** that returns success.
3. **For each input, list partitions and boundaries.**
4. **Add structural and header cases** for the endpoint as a whole.
5. **Write the expected status and error content** for each case before running.
6. **Change one thing per test** from the baseline.
7. **Run and triage**: any 5xx, any 2xx for invalid data, any leaked internals, any inconsistency.
8. **Automate** the table as a parameterised test.

## Code examples

A data-driven negative test in RestAssured (JUnit 5):

```java
static Stream<Arguments> invalidQuantities() {
    return Stream.of(
        Arguments.of("below minimum", 0, 422),
        Arguments.of("above maximum", 101, 422),
        Arguments.of("negative", -1, 422),
        Arguments.of("string", "abc", 400),
        Arguments.of("decimal", 5.5, 422),
        Arguments.of("null", null, 422)
    );
}

@ParameterizedTest(name = "{0}")
@MethodSource("invalidQuantities")
void rejectsInvalidQuantity(String name, Object quantity, int expected) {
    Map<String, Object> body = new HashMap<>(Map.of("sku", "BOOK-001"));
    body.put("quantity", quantity);

    given().spec(req).body(body)
    .when().post("/orders")
    .then().statusCode(expected)
           .contentType("application/problem+json")
           .body("errors.field", hasItem("quantity"))
           .body(not(containsString("Exception")));
}
```

Malformed JSON cannot be produced from a map, so send it as a raw string:

```java
given().spec(req).body("{\"sku\": \"BOOK-001\", ")
.when().post("/orders")
.then().statusCode(400);
```

## Expected output

A well-behaved API answers the "above maximum" case with something like:

```text
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{"type":"https://api.example.test/problems/validation","title":"Validation failed","status":422,
 "errors":[{"field":"quantity","message":"must be between 1 and 100"}]}
```

The `type` URI here is a placeholder for the API's own problem-type identifier.

## Common mistakes

- **Testing negatives only through the UI.**
- **Changing several fields at once**, so you can't tell which caused the rejection.
- **Accepting any 4xx** without checking the specific code and the field reported.
- **Ignoring 5xx because "it was rejected anyway".**
- **Forgetting type coercion**: some frameworks quietly turn `"5"` into `5`; make sure that matches the contract.
- **Skipping protected fields** like `role` or `price`, which hides mass-assignment flaws.

## Troubleshooting

- **All negatives return the same generic 400**: check whether validation happens at all, or whether a gateway rejects everything before the service; ask for field-level errors.
- **Different endpoints return different error shapes**: log it as a consistency defect; clients have to handle each shape.
- **Can't send a wrong type through your client**: build the body as a raw string or a `Map<String, Object>`.

## Key takeaways summary

The API is the real boundary. From a valid baseline, change one input at a time across missing, null, type, boundary, format, length, extra and structural cases, and expect a specific 4xx with a clean, consistent error body. Any 5xx or silently accepted invalid value is a defect worth reporting.
