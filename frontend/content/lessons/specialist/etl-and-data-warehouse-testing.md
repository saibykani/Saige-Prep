---
slug: etl-and-data-warehouse-testing
title: ETL and Data Warehouse Testing
summary: Verify that data extracted, transformed and loaded into a warehouse is complete, correct and consistent. Learn source-to-target mapping, reconciliation with counts and checksums, SCD testing and data quality dimensions.
level: intermediate
duration: 45
tags: [etl, data-warehouse, sql, data-quality, data-validation]
objectives:
  - Read a source-to-target mapping and derive test cases from each transformation rule
  - Reconcile loads with row counts, rejects, aggregate checksums and set-difference queries
  - Test slowly changing dimensions, especially Type 1 and Type 2 behaviour
  - Assess data against quality dimensions such as completeness, validity, uniqueness and timeliness
prerequisites:
  - SQL joins and aggregates
  - Database testing
related: [sql-joins-and-aggregates, database-testing, sql-for-testers, test-data-design]
references:
  - title: PostgreSQL Documentation — Combining Queries (UNION, INTERSECT, EXCEPT)
    url: https://www.postgresql.org/docs/current/queries-union.html
  - title: PostgreSQL Documentation — Aggregate Functions
    url: https://www.postgresql.org/docs/current/functions-aggregate.html
interview:
  - q: How do you prove that an ETL load is complete?
    a: I reconcile at several levels. First, row counts, where source rows in scope must equal target rows loaded plus rows rejected, with every reject logged with a reason. Second, aggregate checksums such as the sum of amounts and counts per business date or per category, compared between source and target. Third, set-difference queries using EXCEPT on the business keys in both directions to list exactly which rows are missing or unexpected. Counts alone are not enough, because one missing row and one duplicate cancel out.
  - q: Explain SCD Type 1 and Type 2 and how you would test Type 2.
    a: Type 1 overwrites the attribute, so no history is kept. Type 2 keeps history by closing the current row, setting its end date and current flag, and inserting a new row with a new surrogate key and the new value. To test Type 2, I change a tracked attribute in the source and run the load. I verify the old row is closed with the right end date, a new current row exists with the new value, there is exactly one current row per business key, date ranges do not overlap or leave gaps, and facts loaded after the change point to the new surrogate key. I also check that changes to untracked attributes do not create new versions.
  - q: What are data quality dimensions and how do you test them?
    a: Common dimensions are completeness, validity, accuracy, consistency, uniqueness and timeliness. Each becomes a measurable check, such as the percentage of NULLs in a mandatory column for completeness, values outside an allowed list or format for validity, comparison with a trusted source for accuracy, the same figure agreeing across tables for consistency, duplicate business keys for uniqueness, and load finish time against the agreed deadline for timeliness. Thresholds are agreed with data owners.
practice:
  - "Write the reconciliation queries for a daily sales load: source count, target count, rejects, and a per-day SUM(amount) comparison."
  - "Design Type 2 test cases for a customer dimension where city and segment are tracked and email is overwritten with Type 1."
  - "Write an EXCEPT query, in both directions, that lists business keys present in the staging table but missing in the warehouse, and the reverse."
takeaways:
  - Start from the source-to-target mapping; every rule becomes at least one test.
  - Reconcile with counts, rejects, aggregate checksums and set differences, because counts alone can hide errors.
  - Test Type 2 dimensions for one current row per key, correct dates, no overlaps and correct fact linkage.
  - Rerunning the same load must not duplicate data.
  - Turn data quality dimensions into measurable checks with agreed thresholds.
quiz:
  - id: etl-q1
    type: scenario
    topic: etl-and-data-warehouse-testing
    difficulty: intermediate
    prompt: The source has 10,000 rows in scope and the target has 10,000 rows. Why is this not enough to prove the load is correct?
    options: ["Counts are always enough", "A missing row and a duplicated row would cancel out, and values could be transformed wrongly", "The target should always have more rows", "Row counts are not allowed in warehouses"]
    answer: [1]
    explanation: Equal counts can hide a dropped row offset by a duplicate, and they say nothing about values. Set-difference queries on keys and aggregate checksums are needed alongside counts.
  - id: etl-q2
    type: single
    topic: etl-and-data-warehouse-testing
    difficulty: beginner
    prompt: In a Type 2 slowly changing dimension, what happens when a tracked attribute changes?
    options: ["The existing row is overwritten", "The current row is closed and a new row with a new surrogate key becomes current", "A previous-value column is updated", "The change is ignored"]
    answer: [1]
    explanation: Type 2 preserves history by versioning rows. Overwriting is Type 1, a previous-value column is Type 3, and ignoring changes is Type 0.
  - id: etl-q3
    type: code-output
    topic: etl-and-data-warehouse-testing
    difficulty: intermediate
    prompt: staging_orders holds order_ids 1, 2, 3, 4 and dw_orders holds 2, 3, 4, 5. What does this query return?
    code: |
      SELECT order_id FROM staging_orders
      EXCEPT
      SELECT order_id FROM dw_orders;
    codeLanguage: sql
    options: ["1", "5", "1 and 5", "2, 3 and 4"]
    answer: [0]
    explanation: EXCEPT returns rows in the first query that are not in the second, so only order 1, missing from the warehouse, is returned. Finding the unexpected order 5 needs the query in the reverse direction.
  - id: etl-q4
    type: multiple
    topic: etl-and-data-warehouse-testing
    difficulty: intermediate
    prompt: Which checks belong to data quality testing of a customer dimension? Select all that apply.
    options: ["No duplicate customer business keys among current rows", "Mandatory columns such as country are not NULL", "Email values match an agreed format", "The ETL tool's licence is valid", "The load finished before the agreed reporting deadline"]
    answer: [0, 1, 2, 4]
    explanation: These map to uniqueness, completeness, validity and timeliness. A software licence is an operational concern, not a property of the data.
---

## Beginner-friendly explanation

Imagine moving house. Boxes are packed at the old house (extract), some things are repacked or relabelled on the way (transform), and everything is unpacked into the new house (load). Afterwards, you want to know: did every box arrive? Did anything break? Is everything in the right room?

ETL testing asks the same questions about data. Data is copied from source systems, cleaned and reshaped, then loaded into a **data warehouse** used for reports and decisions. If a row goes missing or a number is transformed wrongly, the reports quietly become wrong, and people make decisions on bad numbers.

## Technical explanation

**ETL** stands for Extract, Transform, Load. In **ELT**, raw data is loaded first and transformed inside the warehouse; the testing ideas are the same. A warehouse typically uses a **dimensional model**: **fact** tables hold measurable events (sales, payments) and **dimension** tables hold descriptive context (customer, product, date). Dimensions use **surrogate keys** generated by the warehouse, separate from source **business keys**.

```mermaid
flowchart LR
  S[Source systems] --> X[Extract]
  X --> ST[Staging]
  ST --> T[Transform and validate]
  T --> R[Reject table with reasons]
  T --> D[Dimensions]
  T --> F[Facts]
  D --> RPT[Reports]
  F --> RPT
```

### Source-to-target mapping (STTM)

The mapping document is the tester's main oracle. Each row defines a target column, its source, and the rule.

| Target column | Source | Rule | Example test |
|---|---|---|---|
| `dim_customer.full_name` | `crm.first_name`, `crm.last_name` | Trim, join with one space | `'  Asha '` + `'Rao'` gives `'Asha Rao'` |
| `dim_customer.country_code` | `crm.country` | Map names to ISO 3166 alpha-2 | `'India'` gives `'IN'`; unknown goes to reject table |
| `fact_sales.amount` | `pos.amount_cents` | Divide by 100, two decimals | `1999` gives `19.99` |
| `fact_sales.date_key` | `pos.sold_at` | Store-local date as `YYYYMMDD` | Sale at 23:30 local stays on that date |

### Reconciliation techniques

| Technique | What it proves | Blind spot |
|---|---|---|
| Row counts | Volume matches: source = loaded + rejected | Offsetting errors, wrong values |
| Aggregate checksums | Totals agree per day or category | Errors that cancel out within a group |
| Set difference (`EXCEPT`) on keys | Exactly which rows are missing or extra | Value differences on matched keys |
| Column-level comparison or row hashes | Values match for matched keys | Needs both sides accessible |

### Slowly changing dimensions (SCD)

| Type | Behaviour |
|---|---|
| Type 0 | Keep the original value; ignore changes |
| Type 1 | Overwrite; no history |
| Type 2 | Close the current row, insert a new version with a new surrogate key |
| Type 3 | Keep the previous value in an extra column |

Type 2 example after customer 42 moves from Pune to Mumbai on 1 March 2026:

| customer_sk | customer_id | city | valid_from | valid_to | is_current |
|---|---|---|---|---|---|
| 1001 | 42 | Pune | 2024-05-10 | 2026-02-28 | N |
| 1057 | 42 | Mumbai | 2026-03-01 | 9999-12-31 | Y |

### Data quality dimensions

Commonly used dimensions: **completeness** (required data present), **validity** (conforms to format and allowed values), **accuracy** (matches reality or a trusted source), **consistency** (agrees across systems and tables), **uniqueness** (no unintended duplicates) and **timeliness** (available when needed). Each needs a measurable check and a threshold agreed with the data owner.

## Code examples

```sql
-- Count reconciliation for one business date
SELECT
  (SELECT COUNT(*) FROM staging_sales  WHERE sale_date = DATE '2026-03-01') AS source_rows,
  (SELECT COUNT(*) FROM fact_sales     WHERE date_key  = 20260301)          AS loaded_rows,
  (SELECT COUNT(*) FROM reject_sales   WHERE sale_date = DATE '2026-03-01') AS rejected_rows;

-- Aggregate checksum per store
SELECT store_id, SUM(amount_cents) / 100.0 AS source_total
FROM staging_sales WHERE sale_date = DATE '2026-03-01' GROUP BY store_id
EXCEPT
SELECT store_id, SUM(amount) FROM fact_sales WHERE date_key = 20260301 GROUP BY store_id;

-- SCD Type 2: exactly one current row per business key
SELECT customer_id, COUNT(*) FROM dim_customer
WHERE is_current = 'Y'
GROUP BY customer_id HAVING COUNT(*) <> 1;
```

## Expected output

For a healthy load, the count query shows `source_rows = loaded_rows + rejected_rows`, for example:

| source_rows | loaded_rows | rejected_rows |
|---|---|---|
| 10000 | 9985 | 15 |

The checksum and SCD queries return **zero rows**. Any store listed by the checksum query has a total mismatch, and any customer listed by the SCD query has zero or several current versions.

## Real-world example

A retail analytics team noticed that daily revenue in the warehouse was occasionally lower than the point-of-sale system. Row counts matched every day. A per-store checksum revealed the gap was always in stores in one time zone. The transform converted timestamps to UTC before deriving the date, so late-evening sales landed on the next day's date key. The STTM said "store-local date", and a boundary test with a sale at 23:30 local time would have caught it before release.

## Step-by-step walkthrough

1. **Review the STTM** and data model; question ambiguous rules early.
2. **Derive test cases per rule**, including boundaries, NULLs, invalid codes and time zones.
3. **Prepare source test data** that exercises each rule, plus a volume sample from realistic data.
4. **Run the load** and capture the job log, timings and reject output.
5. **Reconcile** counts, checksums and key differences in both directions.
6. **Validate transformations** column by column for sampled and edge-case rows.
7. **Test SCDs and incremental loads**: changes, no-change reruns, late-arriving data.
8. **Rerun the same load** to confirm it is idempotent and creates no duplicates.
9. **Run data quality checks** against agreed thresholds and report results.

## Common mistakes

- **Relying on row counts alone.**
- **Testing only the initial full load**, not incremental loads, reruns and late data.
- **Ignoring rejects**, so rows silently disappear without reasons.
- **Comparing floating-point totals with exact equality** when rounding rules differ; compare in the agreed precision.
- **Overlooking time zones and date boundaries** in date keys.
- **Not checking fact-to-dimension links**, leaving facts pointing to missing or outdated surrogate keys.

## Troubleshooting

- **Checksums differ slightly.** Compare in integer cents or the agreed decimal precision, and check rounding order.
- **Duplicate rows after a rerun.** The load lacks a merge or upsert on business keys, or the incremental watermark was not advanced.
- **Source and target are on different platforms.** Extract both sides' keys and aggregates into a common test database for comparison.

## Key takeaways summary

ETL testing proves that reports are built on complete and correct data. Work from the mapping, reconcile with counts, checksums and set differences, test history handling in slowly changing dimensions, rerun loads to prove idempotency, and measure quality dimensions with agreed thresholds.
