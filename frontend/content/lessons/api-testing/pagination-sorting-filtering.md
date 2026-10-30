---
slug: pagination-sorting-filtering
title: Pagination, Sorting and Filtering
summary: Collection endpoints rarely return everything at once. Learn offset and cursor pagination, how sorting and filtering interact with paging, and the boundary, consistency and performance cases testers must cover.
level: intermediate
duration: 35
tags: [api, pagination, test-design]
objectives:
  - Compare offset/limit, page-number and cursor-based pagination and their trade-offs
  - Test page size limits, first and last pages, empty results and invalid parameters
  - Verify sorting is stable and deterministic across pages
  - Verify filters combine correctly and that totals and links are consistent
prerequisites:
  - REST principles
  - API negative and boundary testing
related: [rest-principles, api-negative-and-boundary-testing, api-database-validation, restassured-fundamentals]
references:
  - title: RFC 8288 — Web Linking (Link header)
    url: https://www.rfc-editor.org/rfc/rfc8288
  - title: MDN Web Docs — HTTP
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
  - title: REST Assured — official site and documentation
    url: https://rest-assured.io/
interview:
  - q: What is the difference between offset and cursor pagination?
    a: "Offset pagination asks for 'skip N, take M'. It is simple and lets clients jump to any page, but deep offsets get slower because the database still walks the skipped rows, and if records are inserted or deleted between requests, items can be skipped or duplicated. Cursor pagination returns an opaque cursor that encodes the position, usually the last item's sort key, and the next request continues after it. It is stable under inserts and efficient at depth, but you can't jump to an arbitrary page."
  - q: How do you test that sorting is correct across pages?
    a: "Fetch every page, concatenate the results and assert the combined list is sorted by the requested key and contains no duplicates or gaps compared to the full filtered set. I specifically use data with equal sort values, because if the API doesn't add a unique tiebreaker such as id, items with equal keys can appear on two pages or none."
  - q: What negative cases do you test for pagination parameters?
    a: "limit of 0, negative, non-numeric, and one above the documented maximum; offset negative or beyond the end; a tampered, expired or malformed cursor; unknown sort fields; and an unknown filter field. Each should produce a documented 4xx or a documented clamp, never a 5xx, and an unknown sort field should never be passed through into a database query."
practice:
  - "Seed 25 records in the local mock API in the Practice Lab and walk through every page with limit 10, checking counts, links and that the union of pages equals the full set."
  - "Create several records with identical sort values and check whether they are duplicated or skipped across page boundaries."
  - "Insert a new record between fetching page 1 and page 2 and compare the behaviour of offset and cursor pagination if the mock API supports both."
takeaways:
  - Offset pagination is simple and random-access but can skip or duplicate items when data changes and slows down at depth.
  - Cursor pagination is stable and efficient but sequential only; treat cursors as opaque.
  - Test first, middle, last, empty and beyond-the-end pages plus limit boundaries.
  - Sorting must be deterministic, with a unique tiebreaker, or paging becomes inconsistent.
  - Filters must combine correctly and agree with any reported total.
quiz:
  - id: api-page-q1
    type: scenario
    topic: pagination-sorting-filtering
    difficulty: intermediate
    prompt: A client reads page 1 of /orders?offset=0&limit=10 sorted by newest first. Before it reads offset=10, three new orders are created. What happens with offset pagination?
    options: ["Nothing changes", "Three orders from page 1 appear again on page 2", "Three orders are skipped", "The API returns 409"]
    answer: [1]
    explanation: Three new items push everything down, so the last three items of the old page 1 now sit at offsets 10 to 12 and are returned again. Skipping happens when items are deleted instead. Cursor pagination avoids both.
  - id: api-page-q2
    type: multiple
    topic: pagination-sorting-filtering
    difficulty: intermediate
    prompt: The documented maximum page size is 100. Which limit values belong in your tests? Select all that apply.
    options: ["0", "1", "100", "101", "-1", "50"]
    answer: [0, 1, 2, 3, 4]
    explanation: 1 and 100 are the valid boundaries, 0 and 101 their invalid neighbours, and -1 is an invalid negative partition value. 50 is a nominal value that adds little.
  - id: api-page-q3
    type: truefalse
    topic: pagination-sorting-filtering
    difficulty: intermediate
    prompt: Sorting by createdAt alone is always sufficient for stable pagination.
    options: ["True", "False"]
    answer: [1]
    explanation: Several records can share the same createdAt. Without a unique tiebreaker such as id, the database may return ties in any order, so items can shift between pages.
---

## Beginner-friendly explanation

A library catalogue doesn't print every book on one enormous page. It shows 20 results at a time with "next" and "previous" buttons, lets you sort by title or date, and lets you filter to "only available, only fiction".

Collection APIs do the same. **Pagination** splits big result lists into pages, **sorting** decides the order, and **filtering** narrows the results. Each is simple alone; together they create many ways to lose, duplicate or mis-order data. A tester's job is to make sure that, page after page, you get every matching item exactly once, in the right order.

## Technical explanation

### Pagination styles

| Style | Request | Pros | Cons |
|---|---|---|---|
| Offset/limit | `?offset=40&limit=20` | Simple; jump to any page | Deep offsets are slow; inserts/deletes cause duplicates/skips |
| Page number | `?page=3&size=20` | Familiar to users | Same as offset (it is offset in disguise) |
| Cursor (keyset) | `?limit=20&after=eyJpZCI6...` | Stable under changes; fast at depth | Sequential only; cursor must be opaque and validated |

Responses usually include metadata such as `total`, `hasMore` or a `nextCursor`, or a `Link` header (RFC 8288) with `rel="next"`, `rel="prev"`. Computing `total` can be expensive, so some APIs omit it; check what is documented.

### Sorting

`?sort=createdAt` or `?sort=-createdAt` (descending) or `?sort=price,asc`. Sorting must be **deterministic**: if two items share a sort value, the API must add a unique tiebreaker (usually the primary key). Otherwise the database may return ties in a different order on each query, and items move between pages.

### Filtering

`?status=open&minTotal=50&createdAfter=2026-01-01`. Check that filters combine with AND (or whatever is documented), that pagination applies **after** filtering, and that `total` reflects the filtered set. Unknown sort or filter fields must be rejected or ignored as documented and never inserted into a query unvalidated.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    C->>A: GET /orders?status=open&sort=-createdAt&limit=2
    A-->>C: 200, items 1-2, nextCursor c1
    C->>A: GET /orders?status=open&sort=-createdAt&limit=2&after=c1
    A-->>C: 200, items 3-4, nextCursor c2
    C->>A: GET /orders?...&after=c2
    A-->>C: 200, item 5, nextCursor null
```

## Real-world example

A reporting integration exported invoices nightly by walking `/invoices?offset=N&limit=500`, sorted by `issuedDate`. Invoices issued on the same day had identical sort values. The database returned ties in different orders on different queries, so some invoices appeared on two pages and others on none. Finance noticed totals that didn't reconcile with the ledger.

The fix was to sort by `(issuedDate, id)` and, later, to move the export to cursor pagination. The regression test seeds many invoices with the same date, walks all pages, and asserts the union equals the expected set with no duplicates.

## Step-by-step walkthrough

1. **Read the contract**: style, default and maximum page size, sort fields, filter fields, metadata.
2. **Seed known data**: more than two pages, including ties on sort keys and records matching and not matching each filter.
3. **Walk all pages** and assert the union equals the expected filtered set, without duplicates.
4. **Check first, last and empty pages**, and requests beyond the end.
5. **Check limit boundaries**: 0, 1, max, max+1, negative, non-numeric, and the default when omitted.
6. **Check sort order** ascending and descending, with ties.
7. **Check filter combinations** and that `total` matches.
8. **Tamper with cursors** (truncate, edit, reuse an expired one) and expect a 4xx.
9. **Change data mid-walk** to observe consistency behaviour.

## Code examples

Walking a cursor-paginated collection with RestAssured and checking completeness and order:

```java
@Test
void allOpenOrdersReturnedOnceInOrder() {
    List<Map<String, Object>> all = new ArrayList<>();
    String cursor = null;
    int pages = 0;

    do {
        var spec = given().spec(req)
                .queryParam("status", "open")
                .queryParam("sort", "-createdAt")
                .queryParam("limit", 10);
        if (cursor != null) spec.queryParam("after", cursor);

        var page = spec.get("/orders").then().statusCode(200).extract().jsonPath();
        all.addAll(page.getList("items"));
        cursor = page.getString("nextCursor");
        assertTrue(++pages < 100, "pagination did not terminate");
    } while (cursor != null);

    List<Object> ids = all.stream().map(o -> o.get("id")).toList();
    assertEquals(new HashSet<>(ids).size(), ids.size(), "duplicates across pages");
    assertEquals(seededOpenOrderIds.size(), ids.size(), "missing items");
    assertTrue(all.stream().allMatch(o -> "open".equals(o.get("status"))));
}
```

## Expected output

For 25 seeded open orders and `limit=10`, a correct implementation returns three pages of 10, 10 and 5 items, the last with `"nextCursor": null`, and the test passes. A missing tiebreaker typically fails like this:

```text
org.opentest4j.AssertionFailedError: duplicates across pages ==> expected: <25> but was: <24>
```

## Common mistakes

- **Testing only page 1.** Most defects live at page boundaries and the last page.
- **Seeding data without ties**, so non-deterministic sorting is never exposed.
- **Ignoring the maximum page size**, which lets clients request millions of rows (OWASP API4:2023 Unrestricted Resource Consumption).
- **Decoding and relying on cursor contents** in tests; cursors are opaque.
- **Not checking that `total` and filters agree.**
- **Forgetting the default** page size and sort when parameters are omitted.

## Troubleshooting

- **Counts differ between runs**: other tests are creating data; filter by a run-specific tag.
- **Last page never ends**: `nextCursor` is returned even when no items remain; guard loops with a page cap, as above.
- **Slow deep pages**: offset pagination at high offsets; raise it as a performance risk.

## Key takeaways summary

Pagination, sorting and filtering must together return every matching item exactly once, in a deterministic order. Know offset versus cursor trade-offs, seed data with ties, walk all pages, test limits and invalid parameters, and verify filters and totals agree.
