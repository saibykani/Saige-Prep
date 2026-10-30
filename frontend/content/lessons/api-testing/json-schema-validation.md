---
slug: json-schema-validation
title: JSON Schema Validation
summary: JSON Schema describes the shape of a JSON document. Learn the core keywords, how to write a strict but realistic schema, and how to validate API responses in RestAssured with matchesJsonSchemaInClasspath and in Postman.
level: intermediate
duration: 35
tags: [api, json-schema, contract, restassured]
objectives:
  - Explain what JSON Schema validates and what it cannot validate
  - Write a schema using type, properties, required, additionalProperties, enum, format and array keywords
  - Validate a RestAssured response against a schema file on the classpath
  - Decide how strict a schema should be for a given purpose
prerequisites:
  - JSON and XML for testers
  - RestAssured fundamentals
related: [json-and-xml-for-testers, restassured-fundamentals, contract-testing, postman-tests-and-request-chaining]
references:
  - title: JSON Schema — official site
    url: https://json-schema.org/
  - title: REST Assured — official site and documentation
    url: https://rest-assured.io/
  - title: Postman Learning Center — Overview
    url: https://learning.postman.com/docs/introduction/overview/
interview:
  - q: What does JSON Schema validation catch that field assertions miss?
    a: "Field assertions check the handful of values a test cares about. A schema checks the whole structure on every response — every field's type, required fields, allowed enum values, string formats and array item shapes. So it catches regressions in fields nobody wrote an assertion for, such as an id that became a string or a new unexpected property leaking internal data."
  - q: Should a response schema set additionalProperties to false?
    a: "It depends on the goal. For an API's own tests, false is useful because it catches accidental data exposure and undocumented changes. For a consumer validating a provider, false makes the consumer break whenever the provider adds an optional field, which is normally a compatible change. I usually make my own API's schemas strict and consumer-side checks tolerant."
  - q: What can JSON Schema not check?
    a: "Business rules that span values or requests — that total equals the sum of line items, that an order belongs to the authenticated user, that a status transition was legal. It also doesn't check correctness of values, only their shape. Schema validation complements, rather than replaces, functional assertions."
practice:
  - "Write a JSON Schema for the order resource returned by the local mock API in the Practice Lab, including required fields, types, an enum for status and an items array."
  - "Validate the mock API's response against your schema in RestAssured with matchesJsonSchemaInClasspath, then edit the schema to make it fail and read the error."
  - "Add the same schema check to a Postman request using pm.response.to.have.jsonSchema and compare the failure messages."
takeaways:
  - JSON Schema validates structure — types, required fields, formats, enums, array shapes — not business logic.
  - Use required plus additionalProperties deliberately; strict for your own API, tolerant when consuming others.
  - In RestAssured, add the json-schema-validator module and use matchesJsonSchemaInClasspath.
  - Declare the dialect with $schema and keep schemas versioned alongside tests.
  - Combine schema checks with targeted value assertions.
quiz:
  - id: schema-val-q1
    type: code-output
    topic: json-schema-validation
    difficulty: intermediate
    prompt: Does the instance {"id":"42","status":"open"} validate against this schema?
    code: |
      {
        "type": "object",
        "required": ["id", "status"],
        "properties": {
          "id": { "type": "integer" },
          "status": { "enum": ["open", "paid", "cancelled"] }
        }
      }
    codeLanguage: json
    options: ["Yes, both required fields are present", "No, because id is a string not an integer", "No, because status is not an enum", "Yes, because JSON Schema ignores types by default"]
    answer: [1]
    explanation: Presence alone is not enough; "42" is a string and the schema requires an integer. status is valid because "open" is one of the enum values.
  - id: schema-val-q2
    type: truefalse
    topic: json-schema-validation
    difficulty: beginner
    prompt: Listing a property under properties makes it mandatory in the instance.
    options: ["True", "False"]
    answer: [1]
    explanation: properties only describes how a property must look if present. A property is mandatory only if it appears in the required array.
  - id: schema-val-q3
    type: scenario
    topic: json-schema-validation
    difficulty: intermediate
    prompt: Your consumer-side schema has additionalProperties false. The provider adds a new optional field, and your tests start failing although your app still works. What is the best change?
    options: ["Ask the provider to remove the field", "Allow additional properties in the consumer-side schema and keep required fields strict", "Delete the schema test", "Mark every field as optional"]
    answer: [1]
    explanation: Adding an optional field is normally a backward-compatible change, so a consumer should tolerate it. Keep the fields you rely on required and correctly typed. Removing the test or making everything optional would lose real protection.
---

## Beginner-friendly explanation

When you fill in a passport application, the form has rules: date of birth must be a date, nationality must come from a list, photo is required. A clerk checks the **shape** of the form before anyone reads your answers carefully.

**JSON Schema** is that rule sheet for JSON. It says "this response is an object; it must have an `id` that is a whole number, a `status` that is one of open, paid or cancelled, and an `items` list where each item has a `sku`". A validator then checks any response against the rules in one step. If a developer accidentally changes a number into text, or removes a field, the schema check catches it even if no other test looked at that field.

## Technical explanation

JSON Schema is a vocabulary for describing and validating JSON documents, published at json-schema.org. A schema is itself JSON. Several drafts exist (draft-04, draft-07, 2019-09, 2020-12); declare which one you use with `$schema`, and check which drafts your validator supports. RestAssured's `json-schema-validator` module, for example, is based on a library that supports drafts up to draft-04/03, so newer keywords may not be available there; check the version you use.

### Core keywords

| Keyword | Purpose | Example |
|---|---|---|
| `type` | Allowed JSON type(s) | `"integer"`, `["string", "null"]` |
| `properties` | Schemas for named properties | `{"id": {"type": "integer"}}` |
| `required` | Properties that must be present | `["id", "status"]` |
| `additionalProperties` | Whether unlisted properties are allowed | `false` |
| `enum` / `const` | Allowed value(s) | `["open", "paid"]` |
| `minimum`, `maximum` | Numeric bounds | `"minimum": 1` |
| `minLength`, `maxLength`, `pattern` | String rules | `"pattern": "^ord_[a-z0-9]+$"` |
| `format` | Semantic format such as `date-time`, `email`, `uuid` | Assertion behaviour varies by validator |
| `items`, `minItems`, `uniqueItems` | Array rules | `"items": {"$ref": "#/definitions/item"}` |
| `$ref` | Reuse a sub-schema | `"$ref": "#/definitions/money"` |

Remember: `properties` describes properties **if present**; only `required` makes them mandatory. `"type": "integer"` rejects `"42"` (a string). In newer drafts `format` is annotation-only by default unless the validator is configured to assert it.

### What schema validation does and doesn't cover

| Covered | Not covered |
|---|---|
| Types, presence, enums, ranges, patterns | Whether values are correct for this request |
| Array length and item shape | Cross-field rules like total = sum of items |
| Unexpected properties (with `additionalProperties: false`) | Authorization, state transitions |

```mermaid
sequenceDiagram
    participant T as Test
    participant A as API
    participant V as Schema validator
    T->>A: GET /orders/42
    A-->>T: 200 OK + JSON body
    T->>V: validate body against order.schema.json
    V-->>T: valid, or list of violations with JSON pointers
    T->>T: then assert business values
```

## Real-world example

A customer-profile endpoint was refactored to return the database entity directly instead of a response object. All functional tests passed, because the fields they checked were still there. But the response now also contained `passwordHash` and `internalRiskScore`.

The API team's response schema had `additionalProperties: false`. The schema test failed on the first build with "object instance has properties which are not allowed by the schema", and the leak never reached an environment anyone else could access.

## Step-by-step walkthrough

1. **Start from the contract** (OpenAPI document or agreed example), not from whatever the API currently returns.
2. **Declare `$schema`** for the draft your validator supports.
3. **Describe each property's type**, using `["string", "null"]` where null is allowed.
4. **List required properties.**
5. **Constrain values**: enums for statuses, `minimum` for quantities, `pattern` for ids.
6. **Describe arrays** with `items` and `minItems` where an empty list would be wrong.
7. **Choose `additionalProperties`** deliberately.
8. **Validate a known-good and a known-bad document** to prove the schema can fail.
9. **Store schemas in version control** next to the tests (`src/test/resources/schemas`).

## Code examples

`src/test/resources/schemas/order.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "required": ["id", "status", "items", "createdAt"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": "^ord_[a-z0-9]+$" },
    "status": { "enum": ["open", "paid", "cancelled"] },
    "createdAt": { "type": "string", "format": "date-time" },
    "items": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["sku", "quantity"],
        "properties": {
          "sku": { "type": "string", "minLength": 1 },
          "quantity": { "type": "integer", "minimum": 1 }
        }
      }
    }
  }
}
```

The `$schema` value is a JSON Schema meta-schema identifier, not a reference link. RestAssured test (requires the `io.rest-assured:json-schema-validator` dependency):

```java
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

@Test
void orderMatchesSchema() {
    given().spec(req)
    .when().get("/orders/{id}", existingOrderId)
    .then().statusCode(200)
           .body(matchesJsonSchemaInClasspath("schemas/order.schema.json"));
}
```

The equivalent Postman check:

```javascript
const schema = JSON.parse(pm.collectionVariables.get("orderSchema"));
pm.test("Order matches schema", () => pm.response.to.have.jsonSchema(schema));
```

## Expected output

If `quantity` comes back as `"1"`, RestAssured reports something like:

```text
java.lang.AssertionError: 1 expectation failed.
Response body doesn't match expectation.
Expected: The content to match the given JSON schema.
error: instance type (string) does not match any allowed primitive type (allowed: ["integer"])
    level: "error"
    schema: {"loadingURI":"classpath:/schemas/order.schema.json#","pointer":"/properties/items/items/properties/quantity"}
    instance: {"pointer":"/items/0/quantity"}
```

The two pointers tell you which schema rule failed and where in the response.

## Common mistakes

- **Generating the schema from the current response** and committing it unchecked; you encode today's bugs as the contract.
- **Forgetting `required`**, so a schema with perfect `properties` accepts `{}`.
- **Being strict where tolerance is right**, such as consumer-side `additionalProperties: false`.
- **Assuming `format` is enforced**; it depends on the validator and draft.
- **Using keywords from a newer draft** than the validator supports; they may be silently ignored.
- **Treating a passing schema as a passing test**; values still need checking.

## Troubleshooting

- **Schema not found**: `matchesJsonSchemaInClasspath` paths are relative to the classpath root, e.g. `schemas/order.schema.json` under `src/test/resources`.
- **Schema never fails**: test it with a deliberately invalid document; check `required` and keyword spelling.
- **Unexpected "not allowed" errors**: a new field was added; decide whether it is a defect or a contract update.

## Key takeaways summary

JSON Schema checks the shape of every response in one assertion, catching type changes, missing fields and data leaks that field assertions miss. Write schemas from the contract, use `required` and `additionalProperties` deliberately, know your validator's draft, and pair schema checks with value assertions.
