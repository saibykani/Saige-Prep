---
slug: restassured-fundamentals
title: RestAssured Fundamentals
summary: RestAssured is a Java DSL for testing HTTP APIs. Learn the given/when/then structure, body assertions with Hamcrest and GPath, extracting values, and reusable request and response specifications.
level: intermediate
duration: 40
tags: [api, restassured, java, automation]
objectives:
  - Set up RestAssured with JUnit 5 or TestNG in a Maven project
  - Write tests with the given/when/then structure and Hamcrest matchers
  - Extract values from responses to chain requests in code
  - Remove duplication with RequestSpecification and ResponseSpecification
  - Log requests and responses only when a test fails
prerequisites:
  - HTTP requests, responses and methods
  - JSON and XML for testers
  - Basic Java and a unit test framework (JUnit or TestNG)
related: [json-schema-validation, api-test-data-management, json-and-xml-for-testers, api-testing-in-ci]
references:
  - title: REST Assured — official site and documentation
    url: https://rest-assured.io/
  - title: JUnit 5 User Guide
    url: https://junit.org/junit5/docs/current/user-guide/
  - title: Maven — Getting started guides
    url: https://maven.apache.org/guides/
interview:
  - q: Explain given, when and then in RestAssured.
    a: "given() builds the request — base URI, headers, auth, query and path parameters, body. when() performs the HTTP call with a method such as get or post. then() returns a ValidatableResponse for assertions like statusCode(201), header checks and body(path, matcher). The structure mirrors Gherkin, keeping setup, action and verification visibly separate."
  - q: What are request and response specifications for?
    a: "A RequestSpecification captures shared request settings — base URI, base path, content type, auth, filters — and a ResponseSpecification captures shared expectations such as a content type or a response-time ceiling. Built with RequestSpecBuilder and ResponseSpecBuilder, they are applied with spec(...) in given() and then(), so a change like a new required header is made in one place."
  - q: How do you chain two calls in RestAssured?
    a: "Make the first call and finish with extract().path(\"id\") or extract().as(Order.class) to pull the value out, then pass it as a path parameter to the next call with pathParam or a template like get(\"/orders/{id}\", id). I always assert the first response's status before extracting, otherwise a failure shows up as a confusing error in the second call."
  - q: How do you keep RestAssured logs useful without flooding CI output?
    a: "Use log().ifValidationFails() on both request and response, or enable logging for failures globally with RestAssured.enableLoggingOfRequestAndResponseIfValidationFails(). Then passing tests stay quiet, and failing ones show the exact request and response. I also make sure Authorization headers are blacklisted from logs so tokens don't leak."
practice:
  - "Create a Maven project with RestAssured and JUnit 5, and write a test that GETs a resource from the local mock API in the Practice Lab and asserts status, content type and two body fields."
  - "Write a create-read-delete test that extracts the new id from the POST response and uses it in later calls."
  - "Refactor your tests to use a shared RequestSpecification and ResponseSpecification and confirm they still pass."
takeaways:
  - given() sets up the request, when() sends it, then() validates the response.
  - Use body(path, matcher) with GPath expressions and Hamcrest matchers such as equalTo, notNullValue and hasItems.
  - Assert before you extract, then pass extracted values to later calls.
  - Request and response specifications remove duplication and centralise configuration.
  - Log on validation failure and hide credentials from logs.
quiz:
  - id: ra-fund-q1
    type: code-output
    topic: restassured-fundamentals
    difficulty: intermediate
    prompt: The API returns 201 with body {"id":"ord_9","items":[]}. What is the result of this test?
    code: |
      given().contentType(ContentType.JSON).body(order)
      .when().post("/orders")
      .then().statusCode(200).body("id", notNullValue());
    codeLanguage: java
    options: ["Passes, because id is present", "Fails, because the status is 201 not 200", "Fails, because items is empty", "Throws a compilation error"]
    answer: [1]
    explanation: statusCode(200) is an exact check, so 201 fails the test even though the id assertion would pass. The empty items array is not asserted on.
  - id: ra-fund-q2
    type: single
    topic: restassured-fundamentals
    difficulty: beginner
    prompt: Which RestAssured part is responsible for building the request?
    options: ["given()", "when()", "then()", "extract()"]
    answer: [0]
    explanation: given() configures headers, parameters, auth and body. when() sends the request and then() validates it.
  - id: ra-fund-q3
    type: multiple
    topic: restassured-fundamentals
    difficulty: intermediate
    prompt: Which belong naturally in a shared RequestSpecification? Select all that apply.
    options: ["Base URI and base path", "Default content type", "Authentication", "The expected status code", "A logging filter"]
    answer: [0, 1, 2, 4]
    explanation: The expected status code is a response expectation and belongs in the test or a ResponseSpecification, not a request specification.
  - id: ra-fund-q4
    type: debugging
    topic: restassured-fundamentals
    difficulty: intermediate
    prompt: This test fails with a NullPointerException in the second call when the create endpoint is broken. What is the best fix?
    code: |
      String id = given().spec(spec).body(order).post("/orders").path("id");
      given().spec(spec).get("/orders/" + id).then().statusCode(200);
    codeLanguage: java
    options: ["Wrap the calls in try/catch", "Assert statusCode(201) on the create response before extracting id", "Use PUT instead of POST", "Increase the timeout"]
    answer: [1]
    explanation: Without an assertion the create failure is silent and only surfaces later as a confusing error. Asserting then().statusCode(201).extract().path("id") makes the real failure obvious. try/catch would hide it further.
---

## Beginner-friendly explanation

Writing an API test by hand in Java means opening connections, setting headers, reading streams and parsing JSON before you can check anything. That is like writing a letter by first making your own paper.

**RestAssured** is a library that hands you the paper and an envelope. You describe what you want in near-English: **given** these headers and this body, **when** I POST to `/orders`, **then** the status should be 201 and the id should not be null. The library does the plumbing so your test reads like the requirement it checks.

## Technical explanation

RestAssured is an open-source Java DSL for testing HTTP APIs. It integrates with any test runner (JUnit 5, TestNG) and uses Hamcrest matchers for assertions. Add it with Maven:

```xml
<dependency>
  <groupId>io.rest-assured</groupId>
  <artifactId>rest-assured</artifactId>
  <version>5.5.0</version>
  <scope>test</scope>
</dependency>
```

Check the official site for the current version; the API shown here is stable across 5.x.

### The three parts

| Part | Returns | Typical calls |
|---|---|---|
| `given()` | `RequestSpecification` | `baseUri`, `header`, `contentType`, `auth`, `queryParam`, `pathParam`, `body`, `spec`, `log` |
| `when()` | request sender | `get`, `post`, `put`, `patch`, `delete` |
| `then()` | `ValidatableResponse` | `statusCode`, `header`, `contentType`, `body`, `time`, `spec`, `extract` |

### Body assertions

`body(path, matcher)` evaluates a **GPath** expression (Groovy's path syntax) against the parsed JSON or XML, then applies a Hamcrest matcher:

```java
.body("id", notNullValue())
.body("status", equalTo("open"))
.body("items.sku", hasItems("BOOK-001"))
.body("items.size()", equalTo(2))
.body("items.find { it.sku == 'BOOK-001' }.quantity", equalTo(1))
```

### Extraction

`then().extract()` pulls values out: `.path("id")` for one value, `.as(Order.class)` to deserialise (needs Jackson or Gson on the classpath), or `.response()` for the whole response.

```mermaid
sequenceDiagram
    participant T as JUnit test
    participant R as RestAssured
    participant A as API
    T->>R: given() spec, body
    T->>R: when().post("/orders")
    R->>A: POST /orders
    A-->>R: 201 Created, id ord_9
    R-->>T: then() statusCode(201), extract id
    T->>R: get("/orders/{id}", id)
    R->>A: GET /orders/ord_9
    A-->>R: 200 OK
    R-->>T: assertions pass
```

## Real-world example

A logistics team had 120 RestAssured tests, each starting with a copied block that set the base URI, content type and a bearer token. When the API moved behind a gateway that required a new `X-Client-Id` header, half the tests were updated and the rest failed in confusing ways for a week.

Introducing one `RequestSpecification` built in a base class, and one `ResponseSpecification` asserting JSON content type and a response-time ceiling, reduced each test to its unique parts. The next header change was a one-line edit.

## Step-by-step walkthrough

1. **Add dependencies**: `rest-assured`, a test runner, and `json-schema-validator` if you will validate schemas.
2. **Use static imports** for `io.restassured.RestAssured.*` and `org.hamcrest.Matchers.*`.
3. **Build a request spec** with base URI, content type, auth and failure logging.
4. **Build a response spec** for checks every response must pass.
5. **Write one test per behaviour**: status, then headers, then body.
6. **Extract and chain** only after asserting.
7. **Run** with `mvn test` and read the report.

## Code examples

```java
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import java.util.Map;

class OrdersApiTest {

    static RequestSpecification req;
    static ResponseSpecification json;

    @BeforeAll
    static void setUp() {
        req = new RequestSpecBuilder()
                .setBaseUri(System.getProperty("baseUri", "http://localhost:8080"))
                .setContentType(ContentType.JSON)
                .addHeader("Authorization", "Bearer " + System.getenv("API_TOKEN"))
                .log(LogDetail.ALL)
                .build();
        json = new ResponseSpecBuilder()
                .expectContentType(ContentType.JSON)
                .expectResponseTime(lessThan(2000L))
                .build();
    }

    @Test
    void createdOrderCanBeReadBack() {
        String id =
            given().spec(req).body(Map.of("sku", "BOOK-001", "quantity", 1))
            .when().post("/orders")
            .then().spec(json).statusCode(201)
                   .header("Location", containsString("/orders/"))
                   .body("id", notNullValue())
                   .extract().path("id");

        given().spec(req)
        .when().get("/orders/{id}", id)
        .then().spec(json).statusCode(200)
               .body("id", equalTo(id))
               .body("sku", equalTo("BOOK-001"))
               .body("quantity", equalTo(1));
    }
}
```

`LogDetail.ALL` in a spec logs every request; in a large suite prefer `RestAssured.enableLoggingOfRequestAndResponseIfValidationFails()` and add `Authorization` to the blacklisted headers via `LogConfig`.

## Expected output

`mvn test` against a correct API prints a Surefire summary like:

```text
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

If the read returns the wrong quantity, the failure is precise:

```text
java.lang.AssertionError: 1 expectation failed.
JSON path quantity doesn't match.
Expected: <1>
  Actual: <2>
```

## Common mistakes

- **Extracting without asserting**, so failures surface in a later call.
- **Copying setup into every test** instead of using specifications.
- **Asserting floats with `equalTo(19.99)`** when RestAssured returns a `Float`; use `19.99f`, a tolerance, or configure `BigDecimal`.
- **Logging everything always**, which floods CI and can leak tokens.
- **Hardcoding base URIs and tokens**; read them from system properties or environment variables.
- **One giant test** that checks every field of every endpoint, making failures hard to read.

## Troubleshooting

- **`Connection refused`**: wrong base URI or port, or the service isn't running.
- **`Cannot deserialize`**: add Jackson or Gson to the classpath, or match field names.
- **Matcher type mismatch** (`Expected: <1L>, Actual: <1>`): JSON integers are returned as `Integer`; match the type.
- **Path returns null**: the response is wrapped (e.g. in `data`) or the field name differs in case.

## Key takeaways summary

RestAssured makes Java API tests read like specifications: given a request, when it is sent, then the response must match. Use GPath with Hamcrest for precise body checks, assert before extracting, and centralise configuration in request and response specifications so the suite stays readable as it grows.
