---
slug: json-and-xml-for-testers
title: JSON and XML for Testers
summary: API payloads are almost always JSON or XML. Learn their data models, the type traps that cause real defects, and how to locate values with JSONPath-style expressions and XPath.
level: beginner
duration: 30
tags: [api, json, xml, data-formats]
objectives:
  - Read and write valid JSON and well-formed XML
  - Name JSON's data types and spot type mismatches in responses
  - Locate values with GPath/JSONPath-style expressions and with XPath
  - Choose assertions that are robust to field order and formatting
prerequisites:
  - HTTP requests, responses and methods
related: [json-schema-validation, restassured-fundamentals, rest-principles, api-negative-and-boundary-testing]
references:
  - title: RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format
    url: https://www.rfc-editor.org/rfc/rfc8259
  - title: W3C — Extensible Markup Language (XML) 1.0
    url: https://www.w3.org/TR/xml/
  - title: JSON Schema
    url: https://json-schema.org/
interview:
  - q: What are the data types in JSON?
    a: "Per RFC 8259, JSON values are objects, arrays, strings, numbers, and the literals true, false and null. There is no date type, so dates travel as strings (usually ISO 8601), and there is no separate integer type; numbers are just numbers, which is why very large integers can lose precision in JavaScript clients. As a tester I check types, not just values, because \"42\" and 42 are different."
  - q: What is the difference between well-formed and valid XML?
    a: "Well-formed XML obeys the syntax rules — a single root element, properly nested and closed tags, quoted attributes, escaped special characters. Valid XML is well-formed and also conforms to a schema such as an XSD or DTD. A parser rejects malformed XML outright; validity is a separate check against the contract."
  - q: Why shouldn't you compare a whole JSON response as a string?
    a: "Object member order is not significant in JSON, whitespace varies, and responses often contain volatile fields such as timestamps and generated ids. String comparison fails on harmless changes and tells you little about what broke. Better to assert specific fields with path expressions and validate the overall structure with JSON Schema."
practice:
  - "Fetch a resource from the local mock API in the Practice Lab and write down the JSON type of every field. Note any field whose type looks wrong, such as a numeric price sent as a string."
  - "Write path expressions that extract the second item's SKU, all item prices, and the count of items from a nested order response."
  - "Request the same resource as XML if the mock API supports Accept application/xml, and write the XPath for the same values."
takeaways:
  - JSON has six value kinds — object, array, string, number, boolean and null — and no date type.
  - XML is element-and-attribute based, supports namespaces and is validated with XSD.
  - Check types as well as values; "10" and 10 are different, and null is different from a missing field.
  - Use path expressions for targeted assertions and schemas for structure; avoid whole-string comparison.
quiz:
  - id: json-xml-q1
    type: single
    topic: json-and-xml-for-testers
    difficulty: beginner
    prompt: Which is valid JSON?
    options: ["{'id': 1}", "{\"id\": 1,}", "{\"id\": 1, \"tags\": [\"a\", \"b\"]}", "{id: 1}"]
    answer: [2]
    explanation: JSON requires double-quoted member names and string values and does not allow trailing commas. The trailing-comma version is tempting because many programming languages accept it, but JSON does not.
  - id: json-xml-q2
    type: code-output
    topic: json-and-xml-for-testers
    difficulty: intermediate
    prompt: For this response, what does the GPath expression items.price return in RestAssured?
    code: |
      {"items": [{"sku": "A", "price": 10.5}, {"sku": "B", "price": 4}]}
    codeLanguage: json
    options: ["10.5", "[10.5, 4]", "14.5", "An error, because items is an array"]
    answer: [1]
    explanation: GPath applies the property access to every element of the array and collects the results into a list. It does not sum them; summing would need items.price.sum().
  - id: json-xml-q3
    type: truefalse
    topic: json-and-xml-for-testers
    difficulty: beginner
    prompt: In JSON, a field set to null and a field that is absent mean the same thing.
    options: ["True", "False"]
    answer: [1]
    explanation: They are different. Absent usually means "not provided" or "not applicable", while null is an explicit value. In a PATCH they often mean "leave unchanged" versus "clear this field", so testers should check both.
---

## Beginner-friendly explanation

When two people who speak different languages trade goods, they agree on a standard form: name here, quantity here, price here. Nobody has to guess what a scribble means.

**JSON** and **XML** are those standard forms for software. When an API sends you an order, it writes it in one of these formats so any program can read it back. As a tester you need to read these forms fluently, spot a box filled in wrongly (a price written as words instead of a number) and point precisely at the value you want to check.

## Technical explanation

### JSON

JSON is defined by RFC 8259. A JSON text is a value, and values are:

| Type | Example | Notes |
|---|---|---|
| object | `{"id": 42}` | Unordered set of name/value pairs; names are strings |
| array | `[1, 2, 3]` | Ordered list |
| string | `"BOOK-001"` | Double quotes only; escapes such as `\n`, `é` |
| number | `19.99`, `-3`, `1e3` | No separate integer type; no `NaN` or `Infinity` |
| boolean | `true`, `false` | Lowercase |
| null | `null` | An explicit "no value" |

There is **no date type**; APIs usually send ISO 8601 strings such as `"2026-03-01T09:30:00Z"`. Member order in objects is not significant, and RFC 8259 says names *should* be unique, so duplicate keys behave unpredictably across parsers.

### XML

XML 1.0 is a W3C recommendation. Data lives in **elements** and **attributes**:

```xml
<order id="42" xmlns="urn:example:orders">
  <item sku="BOOK-001"><price currency="EUR">10.50</price></item>
</order>
```

XML is **well-formed** if it has one root, properly nested and closed tags, quoted attributes and escaped `&` and `<`. It is **valid** if it also conforms to a schema (XSD or DTD). Namespaces (`xmlns`) qualify element names, which is a common source of XPath failures. In XML everything is text until a schema says otherwise.

### Locating values

| Goal | JSON (RestAssured GPath) | JSONPath | XPath |
|---|---|---|---|
| Root field | `id` | `$.id` | `/order/@id` |
| Nested field | `customer.email` | `$.customer.email` | `/order/customer/email` |
| Array element | `items[1].sku` | `$.items[1].sku` | `/order/item[2]/@sku` |
| All values | `items.price` | `$.items[*].price` | `//price` |
| Count | `items.size()` | tool-specific | `count(//item)` |

Note the index base: GPath and JSONPath arrays start at 0, XPath positions start at 1.

## Real-world example

A pricing service changed its serialiser and began sending `"price": "19.90"` (a string) instead of `"price": 19.90`. Every UI screen still displayed "19.90", and existing tests that compared the displayed text passed. But a mobile client that added prices numerically started concatenating them, producing totals like "19.909.95".

A single type-aware assertion, or a JSON Schema with `"type": "number"` for price, would have failed on the first build after the change.

## Step-by-step walkthrough

1. **Pretty-print the response** so the structure is visible.
2. **Map the structure.** Note objects, arrays and nesting depth.
3. **Record the type of every field** and compare with the contract.
4. **Identify volatile fields** (ids, timestamps) that tests should check by pattern or type, not exact value.
5. **Write targeted path assertions** for business-critical fields.
6. **Add a schema check** for overall structure (see [JSON schema validation](/learn/api-testing/json-schema-validation)).
7. **Test edge content**: Unicode, empty strings, empty arrays, null versus missing, very large numbers.

## Code examples

Type-aware assertions with RestAssured and Hamcrest:

```java
given()
    .accept(ContentType.JSON)
.when()
    .get("/orders/42")
.then()
    .statusCode(200)
    .body("id", equalTo(42))
    .body("items.sku", hasItems("BOOK-001"))
    .body("items[0].price", isA(Float.class))      // numbers, not strings
    .body("items.size()", greaterThan(0))
    .body("createdAt", matchesPattern("\\d{4}-\\d{2}-\\d{2}T.*"));
```

RestAssured parses JSON decimals as `Float` by default; configure `JsonPathConfig.NumberReturnType.BIG_DECIMAL` for money fields.

## Expected output

If `price` arrives as the string `"10.50"`, the type assertion fails with a message similar to:

```text
java.lang.AssertionError: 1 expectation failed.
JSON path items[0].price doesn't match.
Expected: an instance of java.lang.Float
  Actual: 10.50
```

## Common mistakes

- **Comparing whole JSON strings.** Order and whitespace differ; volatile fields change every run.
- **Ignoring types.** `"true"` is not `true`; `"0"` is not `0`.
- **Treating null and missing as the same.**
- **Using floating-point equality for money.** Prefer `BigDecimal` or compare with a tolerance.
- **Forgetting XML namespaces** in XPath, so expressions match nothing.
- **Off-by-one indexing** when switching between JSONPath (0-based) and XPath (1-based).

## Troubleshooting

- **Path returns null**: check spelling and case, whether the value is inside an array, and whether the response is wrapped (for example in `data`).
- **XPath matches nothing** though the element is visible: the document probably declares a default namespace; register it or use `local-name()`.
- **Parsing fails**: confirm the `Content-Type` header matches the actual body.

## Key takeaways summary

Read payloads as typed data, not text. Know JSON's six value kinds and XML's elements and attributes, point at values with the right path language, and assert on types, presence and structure so that subtle serialisation changes cannot slip through.
