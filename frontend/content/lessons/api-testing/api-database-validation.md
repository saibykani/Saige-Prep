---
slug: api-database-validation
title: Database Validation for API Tests
summary: A 201 Created proves the API answered, not that the right data was stored. Learn when and how to verify API results in the database with SQL and JDBC, what to compare, and how to keep these checks reliable and safe.
level: intermediate
duration: 35
tags: [api, database, sql, jdbc]
objectives:
  - Explain why API responses alone can hide persistence defects
  - Write SQL queries that verify creates, updates, deletes and side effects
  - Implement a JDBC-based database check alongside a RestAssured test
  - Avoid brittle, unsafe or slow database assertions
prerequisites:
  - RestAssured fundamentals
  - SQL basics (SELECT, WHERE, JOIN)
related: [restassured-fundamentals, api-test-data-management, json-schema-validation, api-negative-and-boundary-testing, api-testing-in-ci]
references:
  - title: PostgreSQL Documentation
    url: https://www.postgresql.org/docs/
  - title: Oracle Java Tutorials — JDBC Database Access
    url: https://docs.oracle.com/javase/tutorial/jdbc/
  - title: REST Assured documentation
    url: https://rest-assured.io/
interview:
  - q: Why would you check the database in an API test?
    a: The response may be built from the request rather than from what was saved, writes can be partially committed, values can be transformed wrongly, and side effects like audit rows, status history or stock decrements are not visible in the response. A database check confirms the persisted state. I use it selectively for critical writes and side effects, and otherwise prefer verifying through a GET on the API, which tests the public contract.
  - q: How do you keep database assertions from becoming flaky?
    a: I query by the unique ID returned by the API rather than "latest row", give each test its own data, compare only meaningful fields, handle asynchronous writes with a bounded poll rather than a fixed sleep, and run against a dedicated test database. I use parameterized queries and read-only credentials where possible.
  - q: What would you check in the database after DELETE /customers/42?
    a: Depending on the design - either the row is gone, or it is soft-deleted with a deleted flag or timestamp. Related data should follow the defined rule, for example addresses removed or orders kept but anonymised. An audit entry may be required. And a GET should now return 404.
practice:
  - "Write SQL to verify that POST /orders created one order row, the correct number of order_items rows, and decremented stock."
  - "Write a JDBC helper method that fetches a row by ID using a PreparedStatement."
  - "List three side effects of a 'cancel order' API that the response would not show."
takeaways:
  - The response shows what the API said; the database shows what it did.
  - Verify by the ID the API returned, never by 'the newest row'.
  - Check side effects - related tables, audit logs, counters, status history.
  - Use parameterized queries, test databases and least-privilege accounts.
  - Poll with a timeout for asynchronous writes; never sleep blindly.
quiz:
  - id: apidb-q1
    type: scenario
    topic: api-database-validation
    difficulty: intermediate
    prompt: POST /accounts returns 201 with the submitted phone number "+91 98765 43210". In the database the phone column holds "+91 98765". What kind of defect is this, and which check found it?
    options: ["Response defect, found by schema validation", "Persistence defect (truncation), found by database validation", "Performance defect", "Not a defect, the response is correct"]
    answer: [1]
    explanation: The API echoed the request while the stored value was truncated, probably by a too-short column. Only checking the stored data reveals it.
  - id: apidb-q2
    type: single
    topic: api-database-validation
    difficulty: intermediate
    prompt: Which query is the most reliable way to verify the order your test just created?
    options: ["SELECT * FROM orders ORDER BY created_at DESC LIMIT 1", "SELECT * FROM orders WHERE id = ? (using the id returned by the API)", "SELECT COUNT(*) FROM orders", "SELECT * FROM orders WHERE status = 'NEW'"]
    answer: [1]
    explanation: Querying by the returned ID is exact. "Newest row" and status filters break when other tests or users create orders at the same time.
  - id: apidb-q3
    type: debugging
    topic: api-database-validation
    difficulty: intermediate
    prompt: What is the main problem with this test helper?
    code: |
      String sql = "SELECT status FROM orders WHERE id = '" + orderId + "'";
      ResultSet rs = conn.createStatement().executeQuery(sql);
    codeLanguage: java
    options: ["It is too slow", "It builds SQL by string concatenation instead of using a PreparedStatement with parameters", "ResultSet cannot read strings", "It should use SELECT *"]
    answer: [1]
    explanation: Concatenated SQL is vulnerable to injection and breaks on quotes in data. A PreparedStatement with ? placeholders is the correct pattern, even in tests.
  - id: apidb-q4
    type: truefalse
    topic: api-database-validation
    difficulty: beginner
    prompt: Every API test should include a direct database assertion.
    options: ["True", "False"]
    answer: [1]
    explanation: Database checks couple tests to the internal schema. Use them for critical writes and side effects; elsewhere, verify through the public API, for example a follow-up GET.
---

## Beginner-friendly explanation

When you deposit money at an ATM, the screen says "Deposit successful". That's the **response**. But what you actually care about is your **account balance** — the record in the bank's system. If the screen says "successful" but the balance never changes, you have a big problem.

An API's response is the ATM screen. The **database** is the account ledger. Database validation means looking in the ledger to confirm the API really did what it said: the right row, with the right values, plus every related change it was supposed to make.

## Technical explanation

An API test usually asserts the status code and response body. That can miss:

| Defect | Why the response hides it |
|---|---|
| Value truncated or transformed on save | Response echoes the request object |
| Transaction partly committed | Main row saved, child rows not |
| Missing side effects | Audit log, stock count, status history not updated |
| Wrong defaults | Server-set fields like `status` or `created_by` wrong |
| Soft-delete errors | DELETE returns 204 but row unchanged |
| Duplicates | Retry created two rows; response shows one |

Ways to verify persisted state, in order of preference:

1. **Through the API** — a follow-up `GET` (tests the public contract; no coupling to tables).
2. **Directly in the database** — SQL via JDBC (or an ORM/DB client) for things the API doesn't expose.
3. **Through events or logs** — for asynchronous systems.

What to compare: the fields the request set, server-generated fields (IDs, timestamps within a range, status), related tables (via JOINs), counts (exactly one row, N child rows), and that nothing else changed.

```mermaid
sequenceDiagram
  participant T as Test
  participant A as API
  participant D as Test DB
  T->>A: POST /orders {items: 2}
  A->>D: INSERT orders, order_items; UPDATE stock
  A-->>T: 201 {id: 7781}
  T->>D: SELECT ... WHERE id = 7781
  D-->>T: order row, 2 item rows, stock reduced
  T->>T: Assert values match
```

## Real-world example

A hospital appointment API returned 201 for bookings and passed every test. A tester added a database check and found that the `doctor_slots` table was not marked as taken when the appointment was created in a different time zone — the slot was saved with the wrong UTC offset. The response simply echoed the requested time, so it looked correct. The same slot could therefore be booked twice. The database check exposed it in the first run.

## Step-by-step walkthrough

1. **Get read access** to a dedicated test database and the schema (table and column names). Never point tests at production.
2. **Pick the writes worth checking:** money, stock, status changes, deletes, anything with side effects.
3. **Call the API** and capture the returned ID.
4. **Query by that ID** with a parameterized query.
5. **Assert** stored fields, server-generated fields, related rows and counts.
6. **Handle async writes** with a bounded poll (for example up to 10 seconds, checking every 500 ms).
7. **Clean up** test data or use unique data per test; see [API test data management](/learn/api-testing/api-test-data-management).

### Example SQL checks

```sql
-- One order with the expected totals
SELECT id, customer_id, status, total_amount
FROM orders
WHERE id = 7781;

-- Exactly two line items
SELECT COUNT(*) FROM order_items WHERE order_id = 7781;

-- Stock decremented for the product
SELECT quantity_available FROM products WHERE id = 501;
```

## Code examples

A RestAssured test with a JDBC check (driver and URL depend on your database):

```java
@Test
public void createOrderPersistsOrderAndItems() throws SQLException {
    long id = given().contentType(ContentType.JSON).body(orderWithTwoItems)
        .when().post("/orders")
        .then().statusCode(201)
        .extract().jsonPath().getLong("id");

    String sql = "SELECT status, total_amount FROM orders WHERE id = ?";
    try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setLong(1, id);
        try (ResultSet rs = ps.executeQuery()) {
            assertTrue(rs.next(), "order row exists");
            assertEquals(rs.getString("status"), "NEW");
            assertEquals(rs.getBigDecimal("total_amount"), new BigDecimal("1499.00"));
            assertFalse(rs.next(), "exactly one row");
        }
    }
}
```

Note `BigDecimal` for money: comparing currency as `double` gives rounding surprises. Also note `BigDecimal.equals` compares scale, so `1499.0` and `1499.00` differ; use `compareTo` if scale may vary.

## Expected output

```text
PASSED: createOrderPersistsOrderAndItems
```

If the order saved but items did not, a follow-up count assertion fails with `expected [2] but found [0]`, pointing straight at a partial-commit defect.

## Common mistakes

- **Querying "the latest row"** instead of by ID.
- **Asserting every column**, including timestamps and internal fields, so tests break on harmless changes.
- **Concatenating SQL strings** instead of using parameters.
- **Using production or shared databases**, or write-enabled credentials when read-only would do.
- **Fixed sleeps** for asynchronous writes.
- **Database checks everywhere**, coupling the whole suite to the schema.

## Key takeaways summary

Database validation confirms what an API actually stored. Use it for critical writes and side effects, query by the returned ID with parameterized SQL on a test database, compare only meaningful fields, and prefer API-level verification everywhere else.
