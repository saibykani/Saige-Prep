---
slug: api-negative-and-boundary-testing
title: API Negative and Boundary Testing
summary: Most API defects hide in the requests nobody expected - missing fields, wrong types, oversized payloads and values just past a limit. Learn to design negative and boundary API tests and judge the error responses.
level: intermediate
duration: 35
tags: [api, negative-testing, boundary-testing, rest]
objectives:
  - Classify negative API inputs by layer - transport, headers, body structure, fields and business rules
  - Apply boundary value analysis to API fields and collection sizes
  - Choose the expected status code and error body for each negative case
  - Automate a data-driven negative test set with RestAssured
prerequisites:
  - HTTP status codes
  - Boundary value analysis
  - RestAssured fundamentals
related: [http-status-codes, json-schema-validation, restassured-fundamentals, boundary-value-analysis, positive-and-negative-testing, testing-data-validation]
references:
  - title: MDN Web Docs — HTTP response status codes
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
  - title: RFC 9457 — Problem Details for HTTP APIs
    url: https://www.rfc-editor.org/rfc/rfc9457
  - title: REST Assured documentation
    url: https://rest-assured.io/
  - title: OWASP API Security Top 10
    url: https://owasp.org/API-Security/
interview:
  - q: What negative tests would you write for a POST /users endpoint?
    a: Layer by layer. Transport and headers - missing or wrong Content-Type, missing or invalid auth. Body structure - empty body, malformed JSON, an array instead of an object, unknown extra fields. Fields - each required field missing, null, wrong type, empty string, too short, too long, invalid format. Business rules - duplicate email, age below the minimum. For each I assert the status code, a structured error body that names the field, that nothing was created, and that no internal details like stack traces leak.
  - q: Should a validation error return 400 or 422?
    a: Both are used. 400 Bad Request is generic for a request the server will not process due to a client error, and 422 Unprocessable Content is used when the syntax is fine but the content fails validation. What matters most is that the API is consistent and documented; I test against the contract, and raise inconsistency between endpoints as a defect.
  - q: How do you apply boundary value analysis to an API?
    a: Every limit in the contract is a boundary - string lengths, numeric ranges, array sizes, page size, payload size, and date ranges. I test at, just below and just above each limit, one field at a time with everything else valid, so a failure points to exactly one rule.
practice:
  - "For POST /transfers with fields amount (0.01 to 100000.00), currency (ISO code), and toAccount (10 digits), write a negative and boundary test table."
  - "Send malformed JSON to an API you own with Postman and record the status code and error body."
  - "Convert your test table into a TestNG DataProvider with RestAssured."
takeaways:
  - Organise negatives by layer - transport, headers, structure, fields, business rules.
  - One invalid thing per request, everything else valid.
  - Every documented limit is a boundary - test at and around it.
  - Assert status, error body, no side effects and no leaked internals.
  - A 500 for bad input is always a defect; client errors are 4xx.
quiz:
  - id: apineg-q1
    type: single
    topic: api-negative-and-boundary-testing
    difficulty: beginner
    prompt: You send malformed JSON to POST /orders and receive 500 Internal Server Error. Is this correct?
    options: ["Yes, the server failed to parse it", "No, a client error like malformed JSON should return a 4xx such as 400", "Yes, if the body is empty", "It depends on the database"]
    answer: [1]
    explanation: 5xx means the server failed while handling a valid request. Malformed input is the client's fault and should give a 4xx with a helpful error. A 500 suggests unhandled exceptions.
  - id: apineg-q2
    type: multiple
    topic: api-negative-and-boundary-testing
    difficulty: intermediate
    prompt: The field quantity must be an integer from 1 to 99. Which values are good negative or boundary tests? Select all that apply.
    options: ["0", "1", "99", "100", "\"5\" (a string)", "2.5"]
    answer: [0, 1, 2, 3, 4, 5]
    explanation: 0, 1, 99 and 100 test the range edges. A string and a decimal test type validation - some frameworks silently coerce "5" or truncate 2.5, which may or may not be intended.
  - id: apineg-q3
    type: code-output
    topic: api-negative-and-boundary-testing
    difficulty: intermediate
    prompt: What does this test check?
    code: |
      given().contentType("application/json")
             .body("{\"email\": \"a@b.com\"}")
      .when().post("/users")
      .then().statusCode(400)
             .body("errors.field", hasItem("name"));
    codeLanguage: java
    options: ["That a user is created", "That a missing required name field is rejected with a field-level error", "That the email is invalid", "That authentication is required"]
    answer: [1]
    explanation: The body omits name, and the test asserts a 400 and that the errors list mentions the name field. It checks both rejection and error quality.
  - id: apineg-q4
    type: truefalse
    topic: api-negative-and-boundary-testing
    difficulty: beginner
    prompt: When a negative test receives the expected 400, you should also check that no record was created.
    options: ["True", "False"]
    answer: [0]
    explanation: Some defects return an error but still save partial data. Checking for no side effects, via a GET or the database, completes the test.
---

## Beginner-friendly explanation

Imagine a vending machine. Testing it by pressing "B4" and paying the right amount only tells you the happy path works. The interesting questions are: what if you insert a foreign coin? Press a button that doesn't exist? Press B4 with ₹1 less than the price? Insert ₹1 more? A well-built machine refuses politely and returns your money. A badly built one swallows coins or jams.

An API is a vending machine for data. **Negative testing** sends requests the API should refuse. **Boundary testing** sends values exactly at and around limits. Together they find the defects that real clients, bad integrations and attackers will hit.

## Technical explanation

Think about a request in layers, and break one layer at a time:

| Layer | Negative examples | Typical expected status |
|---|---|---|
| Method / path | Wrong method (DELETE on a read-only resource), unknown path | 405, 404 |
| Auth | No token, expired token, token for another user | 401, 403 |
| Headers | Missing/wrong `Content-Type`, unsupported `Accept` | 415, 406 |
| Body structure | Empty body, malformed JSON, array instead of object, unknown fields | 400 |
| Field | Missing required, `null`, wrong type, empty string, too long, bad format | 400 or 422 |
| Business rule | Duplicate email, insufficient balance, invalid state change | 409, 422 |
| Size and rate | Payload too large, too many requests | 413, 429 |

(See [HTTP status codes](/learn/api-testing/http-status-codes) for definitions.) Exact codes come from your API's contract; consistency matters more than any single choice.

A good error response is structured — many APIs follow RFC 9457 "Problem Details" (`type`, `title`, `status`, `detail`) and add a list of field errors. Check that errors:

- Identify the field and rule
- Do not echo back sensitive submitted values unnecessarily
- Do not leak stack traces, SQL, or internal hostnames

### Boundaries in APIs

[Boundary value analysis](/learn/manual-testing/boundary-value-analysis) applies to every limit in the contract — and APIs have more limits than UIs:

| Limit | Boundary tests |
|---|---|
| `name` length 2–50 | 1, 2, 50, 51 characters |
| `amount` 0.01–100000.00 | 0.00, 0.01, 100000.00, 100000.01 |
| `items` array 1–20 | 0, 1, 20, 21 elements |
| `pageSize` max 100 | 0, 1, 100, 101 |
| Body size limit | Just under and just over |
| Integer type | Very large numbers beyond 32/64-bit range |

## Real-world example

A wallet API validated `amount > 0` in the mobile app. The backend accepted any number. A tester sent `"amount": -500` to the transfer endpoint with Postman. The API returned 200 and **credited** the sender's wallet by 500, because the transfer logic subtracted a negative value. A one-line negative test would have caught a direct money-loss defect. This kind of testing must only be done in your own test environment.

## Step-by-step walkthrough

1. **Read the contract** (OpenAPI spec or docs). List every field with type, required-ness, format and limits.
2. **Build a table** with one row per negative or boundary case: input, expected status, expected error field.
3. **Keep a valid baseline payload** and change one thing per test.
4. **Assert four things:** status code, error body shape, no side effect, no leaked internals.
5. **Automate** the table data-driven (below) and run it in CI.

## Code examples

A data-driven RestAssured + TestNG test, each row is one negative case:

```java
public class CreateUserNegativeTest {

    private static final String VALID = """
        {"name":"Asha Rao","email":"asha@example.test","age":30}""";

    @DataProvider
    public Object[][] invalidUsers() {
        return new Object[][] {
            {"{\"email\":\"asha@example.test\",\"age\":30}",              "name"},  // missing
            {"{\"name\":\"A\",\"email\":\"asha@example.test\",\"age\":30}", "name"},  // too short
            {"{\"name\":\"Asha\",\"email\":\"not-an-email\",\"age\":30}",   "email"}, // format
            {"{\"name\":\"Asha\",\"email\":\"asha@example.test\",\"age\":17}", "age"}, // below min
            {"{\"name\":\"Asha\",\"email\":\"asha@example.test\",\"age\":\"30\"}", "age"}, // wrong type
        };
    }

    @Test(dataProvider = "invalidUsers")
    public void rejectsInvalidUser(String body, String field) {
        given().contentType(ContentType.JSON).body(body)
        .when().post("/users")
        .then().statusCode(anyOf(is(400), is(422)))
               .body("errors.field", hasItem(field))
               .body(not(containsString("Exception")));
    }

    @Test
    public void rejectsMalformedJson() {
        given().contentType(ContentType.JSON).body("{\"name\": ")
        .when().post("/users")
        .then().statusCode(400);
    }
}
```

## Expected output

Against a well-behaved API every case passes. A typical defect shows up as:

```text
FAILED: rejectsInvalidUser({"name":"Asha", ... "age":"30"}, age)
Expected status code <400 or 422> but was <201>.
```

That means the API coerced `"30"` into a number and created the user — worth a conversation about whether lenient parsing is intended.

## Common mistakes

- **Breaking several fields at once**, so you can't tell which rule rejected the request.
- **Only asserting the status code** and not the error body or side effects.
- **Accepting 500 for bad input** as "it rejected it anyway".
- **Forgetting type confusion** — strings for numbers, `null`, arrays, booleans.
- **Ignoring headers and auth** as negative dimensions.
- **Running these tests against systems you don't own** or have permission to test.

## Key takeaways summary

Negative and boundary API tests break one layer or one field at a time, starting from a valid baseline. Assert the status, a useful error body, zero side effects and no internal leaks, and automate the table so it runs on every build.
