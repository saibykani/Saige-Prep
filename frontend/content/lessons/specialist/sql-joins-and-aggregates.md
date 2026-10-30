---
slug: sql-joins-and-aggregates
title: SQL Joins and Aggregates
summary: Combine tables with INNER, LEFT, RIGHT, FULL and CROSS joins, summarise with GROUP BY and HAVING, and meet window functions. Every query comes with sample tables and its exact result set.
level: intermediate
duration: 40
tags: [sql, database, joins, aggregation, data-validation]
objectives:
  - Choose the right join type and predict its result set, including unmatched rows
  - Summarise data with COUNT, SUM, AVG, GROUP BY and filter groups with HAVING
  - Explain the difference between WHERE and HAVING and between ON and WHERE in outer joins
  - Use ROW_NUMBER and windowed SUM to answer per-group questions without losing detail rows
prerequisites:
  - SQL for testers
related: [sql-for-testers, database-testing, etl-and-data-warehouse-testing, api-database-validation]
references:
  - title: PostgreSQL Documentation — Queries (joins, grouping)
    url: https://www.postgresql.org/docs/current/queries.html
  - title: PostgreSQL Documentation — Window Functions tutorial
    url: https://www.postgresql.org/docs/current/tutorial-window.html
  - title: PostgreSQL Documentation — Aggregate Functions
    url: https://www.postgresql.org/docs/current/functions-aggregate.html
interview:
  - q: What is the difference between INNER JOIN and LEFT JOIN?
    a: INNER JOIN returns only rows where the join condition matches in both tables. LEFT JOIN returns every row from the left table, and for left rows with no match it fills the right table's columns with NULL. So to find customers who have never ordered, I LEFT JOIN customers to orders and keep rows where the order key IS NULL, an anti-join.
  - q: What is the difference between WHERE and HAVING?
    a: WHERE filters individual rows before grouping, and cannot use aggregate results. HAVING filters groups after GROUP BY and can use aggregates such as SUM or COUNT. For example, WHERE status = 'PAID' keeps only paid orders, then HAVING SUM(amount) > 200 keeps only customers whose paid total exceeds 200.
  - q: How do window functions differ from GROUP BY?
    a: GROUP BY collapses each group into one output row. A window function computes a value across a set of related rows, defined by OVER with PARTITION BY and ORDER BY, but keeps every detail row. That makes it ideal for questions like the latest order per customer with ROW_NUMBER, or showing each order next to its customer's total with SUM over a partition.
  - q: Why might a LEFT JOIN accidentally behave like an INNER JOIN?
    a: If you filter a right-table column in the WHERE clause, for example WHERE o.status = 'PAID', then rows where the right side is NULL fail the condition and are removed, so unmatched left rows disappear. To keep them, move the condition into the ON clause or explicitly allow NULL.
practice:
  - "Using the lesson's tables, write a query listing every customer with their number of PAID orders, including customers with zero."
  - "Write a query returning each customer's most recent order using ROW_NUMBER, then rewrite it without window functions and compare."
  - "Given a source table and a target table that should hold the same orders, write a FULL OUTER JOIN that lists rows missing on either side."
takeaways:
  - INNER keeps matches only; LEFT keeps all left rows; FULL keeps all rows from both sides; CROSS produces every combination.
  - LEFT JOIN plus IS NULL on the right key finds missing relationships.
  - WHERE filters rows before grouping; HAVING filters groups after.
  - Filtering the right table in WHERE turns a LEFT JOIN into an inner join in effect.
  - Window functions answer per-group questions while keeping detail rows.
quiz:
  - id: sql-join-q1
    type: code-output
    topic: sql-joins-and-aggregates
    difficulty: intermediate
    prompt: Using the lesson's tables (4 customers, 5 orders, Dana has no orders), how many rows does this query return?
    code: |
      SELECT c.name, o.order_id
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.customer_id;
    codeLanguage: sql
    options: ["4", "5", "6", "20"]
    answer: [2]
    explanation: The five orders each match one customer, giving 5 rows, and Dana has no match so LEFT JOIN adds one row with NULL order_id, totalling 6. An INNER JOIN would return 5, and 20 is the CROSS JOIN count.
  - id: sql-join-q2
    type: single
    topic: sql-joins-and-aggregates
    difficulty: beginner
    prompt: Which clause filters groups based on an aggregate such as SUM(amount) > 200?
    options: ["WHERE", "HAVING", "ORDER BY", "ON"]
    answer: [1]
    explanation: HAVING runs after GROUP BY and may reference aggregates. WHERE runs before grouping on individual rows, so it cannot use SUM.
  - id: sql-join-q3
    type: debugging
    topic: sql-joins-and-aggregates
    difficulty: advanced
    prompt: This query should list all customers with their paid order count, including zero, but Dana is missing. What is the fix?
    code: |
      SELECT c.name, COUNT(o.order_id) AS paid_orders
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.customer_id
      WHERE o.status = 'PAID'
      GROUP BY c.customer_id, c.name;
    codeLanguage: sql
    options: ["Change LEFT JOIN to INNER JOIN", "Move the status condition into the ON clause", "Use COUNT(*) instead of COUNT(o.order_id)", "Add ORDER BY c.name"]
    answer: [1]
    explanation: For Dana, o.status is NULL, so the WHERE condition removes her row before grouping. Moving it into ON keeps all customers and only matches paid orders. INNER JOIN would also drop her, and COUNT(*) would wrongly count 1 for unmatched rows.
  - id: sql-join-q4
    type: multiple
    topic: sql-joins-and-aggregates
    difficulty: intermediate
    prompt: Which statements about window functions are true? Select all that apply.
    options: ["They keep every input row in the output", "PARTITION BY defines the groups the function is computed over", "They must be used with GROUP BY", "ROW_NUMBER can pick the top row per group when filtered in an outer query"]
    answer: [0, 1, 3]
    explanation: Window functions compute across partitions without collapsing rows, and ROW_NUMBER filtered to 1 in an outer query or CTE gives the top row per group. They do not require GROUP BY; that is the point of using them.
---

## Beginner-friendly explanation

Imagine two lists on a desk: a class register with every student's name, and a list of homework handed in, each with a student's name on it. Joining the lists means matching homework to students.

- If you only want students who handed something in, you keep the **matches** (an inner join).
- If you want **every** student, with blanks next to those who handed nothing in, you keep the whole register (a left join).

Aggregates are the summaries you write at the bottom: how many pieces each student handed in, or the average mark. Testers use joins and aggregates to check that related data lines up, such as every order belonging to a real customer and every total adding up.

## Technical explanation

### Sample tables

`customers`

| customer_id | name |
|---|---|
| 1 | Asha |
| 2 | Ben |
| 3 | Chen |
| 4 | Dana |

`orders`

| order_id | customer_id | amount | status |
|---|---|---|---|
| 101 | 1 | 250.00 | PAID |
| 102 | 1 | 80.00 | CANCELLED |
| 103 | 2 | 120.00 | PAID |
| 104 | 3 | 40.00 | PENDING |
| 105 | 3 | 300.00 | PAID |

### Join types

| Join | Keeps | Rows for these tables |
|---|---|---|
| `INNER JOIN` | Only matching pairs | 5 |
| `LEFT JOIN` | All left rows; NULLs where no match | 6 (Dana with NULLs) |
| `RIGHT JOIN` | All right rows; NULLs where no match | 5 (every order has a customer) |
| `FULL OUTER JOIN` | All rows from both sides | 6 |
| `CROSS JOIN` | Every combination | 4 x 5 = 20 |

Not every database supports every join; for example, MySQL has no `FULL OUTER JOIN` and it is emulated with a `UNION` of left and right joins.

### Aggregates and grouping

`COUNT`, `SUM`, `AVG`, `MIN` and `MAX` reduce many rows to one value per group. Every non-aggregated column in the `SELECT` list must appear in `GROUP BY` (or be functionally dependent on it). `SUM` and `AVG` ignore NULLs, and `SUM` of no rows is NULL, not zero; use `COALESCE(SUM(x), 0)` when you need zero.

### Window functions

A window function is written `function() OVER (PARTITION BY ... ORDER BY ...)`. It computes across a "window" of rows related to the current row but does **not** collapse them. Common ones: `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD`, and aggregates such as `SUM` used with `OVER`.

## Code examples

```sql
-- 1. Customers with no orders (anti-join)
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;
```

| name |
|---|
| Dana |

```sql
-- 2. Order count and total per customer, including zero
SELECT c.name,
       COUNT(o.order_id)          AS orders,
       COALESCE(SUM(o.amount), 0) AS total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;
```

| name | orders | total |
|---|---|---|
| Asha | 2 | 330.00 |
| Ben | 1 | 120.00 |
| Chen | 2 | 340.00 |
| Dana | 0 | 0 |

```sql
-- 3. Customers whose PAID total exceeds 200 (WHERE then HAVING)
SELECT customer_id, SUM(amount) AS paid_total
FROM orders
WHERE status = 'PAID'
GROUP BY customer_id
HAVING SUM(amount) > 200
ORDER BY customer_id;
```

| customer_id | paid_total |
|---|---|
| 1 | 250.00 |
| 3 | 300.00 |

Ben's paid total is 120.00, so his group is removed by `HAVING`.

```sql
-- 4. Largest order per customer, keeping a per-customer total alongside
SELECT order_id, customer_id, amount, customer_total
FROM (
  SELECT order_id, customer_id, amount,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC) AS rn,
         SUM(amount)  OVER (PARTITION BY customer_id)                      AS customer_total
  FROM orders
) ranked
WHERE rn = 1
ORDER BY customer_id;
```

| order_id | customer_id | amount | customer_total |
|---|---|---|---|
| 101 | 1 | 250.00 | 330.00 |
| 103 | 2 | 120.00 | 120.00 |
| 105 | 3 | 300.00 | 340.00 |

The filter on `rn` happens in the outer query because window functions are evaluated after `WHERE`.

## Real-world example

A marketplace team migrated orders from an old system. Spot checks of a few orders in the UI looked fine. A tester ran two checks: an anti-join of orders to customers, which found orders whose customer did not exist in the new system, and a per-merchant `SUM(amount)` comparison between old and new databases, which found one merchant whose totals differed because refunds had been migrated as positive amounts. Neither defect was visible from individual order pages.

## Step-by-step walkthrough

Designing a join-based data check:

1. **State the rule**, for example "every order belongs to an existing customer".
2. **Turn it into a query that returns violations**, so an empty result means pass.
3. **Pick the join** that exposes missing rows: usually `LEFT JOIN ... WHERE right.key IS NULL`.
4. **Add aggregates** when the rule is about totals or counts.
5. **Check row counts** before and after adding each join; an unexpected increase means a one-to-many join is duplicating rows.
6. **Save the query** as a reusable regression check.

## Expected output

A violation-style check passes with zero rows. For example, this check should return nothing on a healthy database:

```sql
SELECT o.order_id
FROM orders o
LEFT JOIN customers c ON c.customer_id = o.customer_id
WHERE c.customer_id IS NULL;
```

## Common mistakes

- **Filtering the right table in `WHERE` after a `LEFT JOIN`**, which removes the unmatched rows you wanted.
- **Fan-out:** joining a one-to-many table before summing, so amounts are counted several times.
- **Using `COUNT(*)` with a `LEFT JOIN`**, which counts 1 for customers with no orders; count a right-table column instead.
- **Forgetting that `SUM` of nothing is NULL.**
- **Putting aggregate conditions in `WHERE`**, which is a syntax error; they belong in `HAVING`.
- **Relying on result order** without `ORDER BY`.

## Troubleshooting

- **Totals are too large.** Look for duplicated rows from a one-to-many join; aggregate in a subquery first, then join.
- **Rows disappeared after adding a join.** An inner join is dropping unmatched rows; switch to a left join and inspect the NULLs.
- **"column must appear in the GROUP BY clause".** Add the column to `GROUP BY` or aggregate it.

## Key takeaways summary

Joins let you test relationships, and aggregates let you test totals. Know what each join keeps, write checks that return violations, filter rows with `WHERE` and groups with `HAVING`, and use window functions when you need a per-group answer without losing detail rows.
