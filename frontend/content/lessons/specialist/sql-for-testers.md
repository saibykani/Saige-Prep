---
slug: sql-for-testers
title: SQL for Testers
summary: Testers use SQL to confirm what the application really stored. Learn SELECT, WHERE, ORDER BY, NULL handling, DISTINCT and simple counts, with sample tables and the exact result sets they produce.
level: beginner
duration: 35
tags: [sql, database, data-validation, backend]
objectives:
  - Write SELECT queries with WHERE, ORDER BY, DISTINCT and LIMIT to inspect application data
  - Handle NULL correctly with IS NULL and IS NOT NULL and explain three-valued logic
  - Use COUNT and simple GROUP BY to find duplicates and verify record counts
  - Validate the result of a UI or API action directly in the database, safely
prerequisites:
  - Basic understanding of tables, rows and columns
  - Test scenarios and test cases
related: [sql-joins-and-aggregates, database-testing, api-database-validation, test-data-design, testing-data-validation]
references:
  - title: PostgreSQL Documentation — The SQL Language
    url: https://www.postgresql.org/docs/current/sql.html
  - title: PostgreSQL Documentation — Comparison Functions and Operators
    url: https://www.postgresql.org/docs/current/functions-comparison.html
interview:
  - q: Why would a tester need SQL if the UI shows the data?
    a: The UI shows a view of the data, often formatted, filtered or cached. SQL lets me verify what was actually persisted, for example that an order was stored once with the right status and amount, that a soft delete set a flag rather than removing a row, or that a background job updated the records it should. It also lets me set up and find test data quickly and investigate defects at the source instead of guessing from the screen.
  - q: Why does WHERE city <> 'Pune' not return rows where city is NULL?
    a: SQL uses three-valued logic. Comparing NULL with anything using =, <> or < gives UNKNOWN, not TRUE, and WHERE keeps only rows where the condition is TRUE. So rows with a NULL city are dropped. To include them I write WHERE city <> 'Pune' OR city IS NULL, or use IS DISTINCT FROM where the database supports it.
  - q: How would you check that an email column has no duplicates?
    a: Group by the email and keep groups with more than one row, SELECT email, COUNT(*) FROM customers GROUP BY email HAVING COUNT(*) > 1. If the business rule is case-insensitive, I group by LOWER(email) instead, because Asha@example.com and asha@example.com would otherwise look different. An empty result means no duplicates; I would also check whether a unique constraint exists to enforce the rule.
practice:
  - "Using the customers table in this lesson, write a query that lists customers with no city recorded, ordered by name."
  - "After registering a user through the UI of an application you test, write the query that proves exactly one row was created with the expected email, status and created timestamp."
  - "Write a query that finds duplicate phone numbers, treating numbers with and without spaces as the same, and explain any limitations."
takeaways:
  - SELECT shows what was really stored; use it to verify UI and API behaviour at the source.
  - WHERE keeps only rows where the condition is TRUE, and comparisons with NULL are UNKNOWN.
  - Use IS NULL and IS NOT NULL, never = NULL.
  - COUNT(*) counts rows; COUNT(column) counts non-NULL values in that column.
  - Use read-only access and test databases; never run UPDATE or DELETE on shared data without permission and a WHERE clause you have checked.
quiz:
  - id: sql-basic-q1
    type: code-output
    topic: sql-for-testers
    difficulty: beginner
    prompt: Using the customers table in this lesson (four rows, Dana has a NULL city), what does this query return?
    code: |
      SELECT COUNT(*), COUNT(city) FROM customers;
    codeLanguage: sql
    options: ["4, 4", "4, 3", "3, 3", "3, 4"]
    answer: [1]
    explanation: COUNT(*) counts all four rows. COUNT(city) skips NULL values, so Dana's row is not counted and the result is 3. Choosing 4, 4 assumes COUNT(column) counts NULLs, which it does not.
  - id: sql-basic-q2
    type: single
    topic: sql-for-testers
    difficulty: beginner
    prompt: Which condition correctly finds rows where city has no value?
    options: ["WHERE city = NULL", "WHERE city IS NULL", "WHERE city = ''", "WHERE city <> NULL"]
    answer: [1]
    explanation: NULL is not a value that can be compared with =, so city = NULL is UNKNOWN for every row and returns nothing. IS NULL is the correct test. An empty string is a real value, different from NULL.
  - id: sql-basic-q3
    type: truefalse
    topic: sql-for-testers
    difficulty: intermediate
    prompt: The query SELECT name FROM customers WHERE city <> 'Pune' returns Dana, whose city is NULL.
    options: ["True", "False"]
    answer: [1]
    explanation: NULL <> 'Pune' evaluates to UNKNOWN, and WHERE only keeps TRUE rows, so Dana is excluded. Only Ben is returned.
  - id: sql-basic-q4
    type: scenario
    topic: sql-for-testers
    difficulty: intermediate
    prompt: After clicking Submit once, a tester sees one order on screen. What is the most useful database check?
    options: ["SELECT * FROM orders", "Count orders for that customer and created in the last minute, and check status and amount", "DELETE FROM orders WHERE customer_id = 1", "Check that the orders table exists"]
    answer: [1]
    explanation: A targeted count with status and amount proves the order was stored exactly once with the right values, catching duplicate submissions the UI might hide. SELECT * is unfocused, DELETE is destructive, and table existence proves nothing about the action.
---

## Beginner-friendly explanation

Imagine a shop where the shop window shows the products, but the real stock list is in a ledger in the back office. If you want to know whether a sale was really recorded, you do not trust the window display; you open the ledger.

A database is that ledger, and **SQL** (Structured Query Language) is how you ask it questions: "show me the customers in Pune", "how many orders were paid today", "is anyone registered twice with the same email?". Testers mostly read data with SQL, to check that what the application shows matches what it actually stored.

## Technical explanation

A relational database stores data in **tables** made of **rows** (records) and **columns** (attributes). The core query statement is `SELECT`, evaluated in this logical order:

1. `FROM` picks the table.
2. `WHERE` keeps rows whose condition is TRUE.
3. `GROUP BY` and `HAVING` group and filter groups.
4. `SELECT` picks the output columns, `DISTINCT` removes duplicate output rows.
5. `ORDER BY` sorts; `LIMIT` (or `FETCH FIRST n ROWS ONLY` in standard SQL) restricts row count.

### Sample table: `customers`

| customer_id | name | city | email |
|---|---|---|---|
| 1 | Asha | Pune | asha@example.com |
| 2 | Ben | Leeds | ben@example.com |
| 3 | Chen | Pune | chen@example.com |
| 4 | Dana | NULL | ben@example.com |

### NULL and three-valued logic

`NULL` means "unknown or missing", not zero and not an empty string. Any comparison with NULL using `=`, `<>`, `<` or `>` yields **UNKNOWN**. `WHERE` keeps only TRUE rows, so UNKNOWN rows disappear silently. Use `IS NULL` and `IS NOT NULL`.

| Expression | Result |
|---|---|
| `'Pune' = 'Pune'` | TRUE |
| `NULL = 'Pune'` | UNKNOWN |
| `NULL <> 'Pune'` | UNKNOWN |
| `NULL = NULL` | UNKNOWN |
| `NULL IS NULL` | TRUE |

### Counting

- `COUNT(*)` counts rows.
- `COUNT(column)` counts rows where that column is not NULL.
- `COUNT(DISTINCT column)` counts distinct non-NULL values.

## Code examples

```sql
-- 1. Customers in Pune, alphabetically
SELECT name, city
FROM customers
WHERE city = 'Pune'
ORDER BY name;
```

| name | city |
|---|---|
| Asha | Pune |
| Chen | Pune |

```sql
-- 2. Everyone not in Pune: note who is missing
SELECT name FROM customers WHERE city <> 'Pune';
```

| name |
|---|
| Ben |

Dana is missing because her city is NULL. To include her:

```sql
SELECT name FROM customers WHERE city <> 'Pune' OR city IS NULL ORDER BY name;
```

| name |
|---|
| Ben |
| Dana |

```sql
-- 3. Distinct cities, including NULL as one group
SELECT DISTINCT city FROM customers ORDER BY city;
```

| city |
|---|
| Leeds |
| Pune |
| NULL |

PostgreSQL sorts NULLs last in ascending order by default; other databases may sort them first.

```sql
-- 4. Duplicate emails
SELECT email, COUNT(*) AS occurrences
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;
```

| email | occurrences |
|---|---|
| ben@example.com | 2 |

## Real-world example

A subscription team tested an "upgrade plan" button. The UI showed the new plan immediately, and all UI tests passed. A tester checking the database found that the button created a **new** subscription row instead of updating the existing one, so affected customers had two active subscriptions. The UI only displayed the latest row, hiding the defect, while the billing job charged both. A simple query counting active subscriptions per customer would have exposed it on day one, and it became part of the team's regression checks.

## Step-by-step walkthrough

Verifying a UI or API action in the database:

1. **Get safe access.** Use a read-only account on a test environment. Never experiment on production.
2. **Identify the tables** that the action should change, using the data model or by asking developers.
3. **Capture a "before" state** with a targeted query, such as the count of rows for your test user.
4. **Perform the action** once in the UI or through the API.
5. **Query the "after" state** with precise filters: the user id, a recent timestamp, the expected status.
6. **Compare** the difference with the expected result: exactly one new row, correct values, no unintended changes elsewhere.
7. **Record the queries** in the test case so others can repeat them.

## Expected output

For the duplicate-subscription check, a correct system returns an empty result for:

```sql
SELECT customer_id, COUNT(*)
FROM subscriptions
WHERE status = 'ACTIVE'
GROUP BY customer_id
HAVING COUNT(*) > 1;
```

Any row returned is a defect, and the `customer_id` gives you the exact test data to put in the report.

## Common mistakes

- **Writing `= NULL`.** It never matches; use `IS NULL`.
- **Forgetting NULLs in `<>` filters**, so rows silently vanish from the result.
- **Confusing `COUNT(*)` and `COUNT(column)`.**
- **Using `SELECT *` on large tables** in shared environments, which is slow and makes evidence hard to read.
- **Running `UPDATE` or `DELETE` without a `WHERE`** clause, or on shared data without permission. Prefer a transaction you can roll back, and test the `WHERE` with a `SELECT` first.
- **Assuming a sort order** without `ORDER BY`. Without it, row order is not guaranteed.
- **Case-sensitive comparisons** when the business rule is case-insensitive; compare with `LOWER()` when appropriate.

## Troubleshooting

- **Query returns no rows but the UI shows data.** You may be connected to a different environment or schema, the data may not be committed yet, or the UI may be reading from a cache.
- **Text comparison fails unexpectedly.** Look for trailing spaces, different case or different Unicode forms of the same character.
- **Query is very slow.** Filter on indexed columns such as primary keys and add `LIMIT` while exploring.

## Key takeaways summary

SQL lets you check the truth behind the screen. Filter precisely with `WHERE`, respect NULL's three-valued logic, know what each `COUNT` counts, and use read-only access on test data. A small, well-chosen query often finds defects that no UI test can see.
