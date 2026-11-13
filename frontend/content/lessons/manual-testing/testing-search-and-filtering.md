---
slug: testing-search-and-filtering
title: Testing search and filtering
summary: A guided scenario for testing product search with filters, sorting and pagination - sample spec, assumptions, techniques, test cases, test data and the defects that hide in combinations, empty states, special characters and paging.
level: intermediate
duration: 35
tags: [real-world, search, filtering, pagination, combinatorial-testing]
objectives:
  - Turn a search and filter specification into test conditions, including empty and boundary states
  - Use equivalence partitioning, boundary value analysis and pairwise testing on search inputs and filter combinations
  - Design test data that makes the expected result of every search provable
  - Recognise common search defects such as wrong filter logic, unstable pagination, injection and data leaks in results
prerequisites:
  - Equivalence partitioning
  - Pairwise and combinatorial testing
related: [pairwise-and-combinatorial-testing, equivalence-partitioning, boundary-value-analysis, test-data-design, pagination-sorting-filtering, testing-data-validation]
references:
  - title: OWASP Input Validation Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - title: OWASP Top Ten
    url: https://owasp.org/www-project-top-ten/
  - title: WCAG overview (W3C Web Accessibility Initiative)
    url: https://www.w3.org/WAI/standards-guidelines/wcag/
  - title: ISTQB Certified Tester Foundation Level (CTFL) v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
interview:
  - q: How would you test a search feature with filters?
    a: First I clarify the matching rules - which fields are searched, case and accent sensitivity, partial words, and whether filters combine with AND across groups and OR within a group. Then I build a controlled data set where I know exactly which items should match each query. I partition search terms (exact, partial, no match, special characters, empty, very long), apply boundaries to length and price ranges, and use pairwise testing to choose filter combinations. I check counts, sorting, pagination, URL state, empty states, performance on large result sets, and that results never include items the user should not see.
  - q: Why is test data so important for search testing?
    a: Because without a known data set you cannot say what the correct result is - you can only say the results look plausible. I create or seed items designed for the rules, such as two products differing only in accent, one exactly on a price boundary, one out of stock and one unpublished. Then each test has a provable expected result, including the exact count.
  - q: What defects do you commonly find in pagination?
    a: Items duplicated or skipped between pages when sorting is not stable or data changes between requests; wrong total counts; the last page being empty or off by one; page numbers beyond the range returning errors instead of an empty or last page; and filters or sorting being lost when moving between pages or using the browser Back button.
  - q: How do you test search input safely for injection risks?
    a: On an environment I am authorised to test, I enter characters that have meaning in queries and markup, such as quotes, percent and underscore wildcards, angle brackets and backslashes, and check that they are treated as literal text - no errors, no stack traces, no changed result logic, and the term is safely encoded when echoed back on the page. Any database error message or unexpected broadening of results is a finding to report to the developers.
practice:
  - "Design a seed data set of 15 products for the sample spec so that every test case in the table has a provable expected result and count."
  - "Use pairwise testing to choose combinations for these filters - category (3 values), brand (4 values), price band (3 values), in stock (yes, no). How many combinations do you need?"
  - "Write five test cases for the empty state, including what the page should suggest to the user."
takeaways:
  - Clarify the matching and combination rules before testing; "correct" search results depend on them.
  - Seed a known data set so every expected result, including counts, is provable.
  - Use EP for search terms, BVA for lengths and ranges, and pairwise testing for filter combinations.
  - Pagination needs a stable sort; check for duplicates, gaps and lost state.
  - Search must treat special characters as data and never return items the user should not see.
quiz:
  - id: rwsearch-q1
    type: scenario
    topic: testing-search-and-filtering
    difficulty: intermediate
    prompt: The spec says filters combine with OR within a group and AND across groups. A user selects Brand A and Brand B, and Colour Red. Which items should be returned?
    options: ["Items that are Brand A and Brand B and Red", "Items that are (Brand A or Brand B) and Red", "Items that are Brand A or Brand B or Red", "Only Red items regardless of brand"]
    answer: [1]
    explanation: Values in the same group (Brand) combine with OR, and different groups (Brand, Colour) combine with AND, giving (A or B) and Red. Using AND within a group would return nothing, because an item has one brand; OR across groups would return far too many.
  - id: rwsearch-q2
    type: single
    topic: testing-search-and-filtering
    difficulty: intermediate
    prompt: Results are sorted by price, and several items share the same price. Moving from page 1 to page 2 sometimes shows an item again. What is the most likely cause?
    options: ["The page size is too small", "The sort is not stable, because there is no unique tie-breaker such as product ID", "The browser cache is full", "The search term contains spaces"]
    answer: [1]
    explanation: Without a unique secondary sort key, items with equal prices can be returned in a different order for each page request, causing duplicates and gaps. Page size and caching do not by themselves cause items to repeat.
  - id: rwsearch-q3
    type: multiple
    topic: testing-search-and-filtering
    difficulty: intermediate
    prompt: A price filter accepts a minimum and maximum between 0.00 and 10,000.00. Which inputs are boundary or invalid-partition tests? Select all that apply.
    options: ["Minimum 0.00", "Maximum 10,000.00 and 10,000.01", "Minimum greater than maximum", "Minimum 250.00 and maximum 500.00", "Minimum -0.01"]
    answer: [0, 1, 2, 4]
    explanation: 0.00, 10,000.00, 10,000.01 and -0.01 are on or just outside the range boundaries, and minimum greater than maximum is an invalid relationship between fields. 250.00 to 500.00 is a typical mid-range value.
  - id: rwsearch-q4
    type: truefalse
    topic: testing-search-and-filtering
    difficulty: beginner
    prompt: A search for a single percent sign returning every product in the catalogue may indicate that the input is being used as a wildcard instead of literal text.
    options: ["True", "False"]
    answer: [0]
    explanation: True. In SQL LIKE patterns the percent sign matches any sequence of characters. If user input is not escaped, a search for % matches everything, which shows input is interpreted as query syntax and should be investigated.
---

## Beginner-friendly explanation

Searching a shop is like asking a librarian for "books about birds, in English, under 20 pounds, newest first". A good librarian brings exactly those books, tells you how many there are, and never brings books from the staff-only shelf. Testing search means checking that the librarian understands your words, applies every condition correctly, counts accurately, and behaves sensibly when nothing matches.

## Technical explanation

Search features combine several mechanisms: **text matching** (exact, partial, case and accent handling), **filters** (facets such as brand or price), **sorting**, and **pagination**. Each has rules, and defects often appear where they interact, for example a filter that is lost when you change page.

The key testing problem is the **oracle**: how do you know the right answer? With production-like random data you cannot. You need a **seeded data set** where you know which items should match each query.

## Requirements

1. Search matches product name and description; case-insensitive; accents ignored ("cafe" finds "Café").
2. Minimum 2 characters, maximum 100 characters; leading and trailing spaces trimmed.
3. Filters: Category (single select), Brand (multi-select), Price range (min and max, 0.00–10,000.00), In stock only (toggle).
4. Values within a filter group combine with **OR**; different groups combine with **AND**.
5. Sort by Relevance (default), Price low to high, Price high to low, Newest.
6. 24 results per page; total count shown; page, filters and sort reflected in the URL.
7. Unpublished products never appear in results.
8. With no results, show "No products match" and a Clear filters option.

## Assumptions

- Prices in the filter are inclusive at both ends.
- Relevance ranking is not specified precisely, so tests check that exact name matches appear on the first page rather than an exact order.
- The test environment can be seeded with a controlled catalogue.

## Test design

| Technique | Applied to | Why |
|---|---|---|
| Equivalence partitioning | Search terms: exact, partial, no match, accented, special characters, too short, too long | Each class exercises different matching logic |
| Boundary value analysis | Term length (1, 2, 100, 101), price range ends, page boundaries (24, 25 results) | Off-by-one in limits and paging |
| Pairwise testing | Category, Brand, Price, In stock combinations | Full combinations are too many; pairs catch most interaction defects |
| Decision table | Filter combination logic (OR within, AND across) | Makes the combination rule explicit |
| Error guessing | Wildcards, quotes, markup, Back button, stale URLs | Known search failure patterns |

## Sample test cases

| ID | Scenario | Type | Test data | Steps summary | Expected result |
|---|---|---|---|---|---|
| SR-01 | Exact name match | Positive | "Trail Runner 2" | Search | Product on page 1; count matches seed |
| SR-02 | Accent and case insensitivity | Positive | "cafe" vs seeded "Café Mug" | Search | Café Mug returned |
| SR-03 | Term length boundaries | Boundary | 1, 2, 100, 101 characters | Search each | 1 and 101 show a validation hint; 2 and 100 search |
| SR-04 | No results | Negative | "zzqxv" | Search | "No products match" with Clear filters; no error |
| SR-05 | OR within, AND across | Positive | Brand A + Brand B, Category Shoes | Apply filters | Only shoes from brand A or B; count exact |
| SR-06 | Price boundary inclusive | Boundary | Min 50.00, max 100.00; seeds at 49.99, 50.00, 100.00, 100.01 | Apply | 50.00 and 100.00 included, others excluded |
| SR-07 | Min greater than max | Negative | Min 200, max 100 | Apply | Clear validation message; no misleading results |
| SR-08 | Pagination at 25 results | Boundary | Query with exactly 25 matches | Visit page 1 and 2 | 24 then 1; no duplicates or gaps |
| SR-09 | Stable sort with ties | Negative | 30 items at the same price | Sort by price, page through | Every item appears exactly once |
| SR-10 | Wildcard and quote characters | Security | %, _, ', " | Search each | Treated as literal text; no error or stack trace |
| SR-11 | Markup in search term | Security | a term containing an HTML tag | Search | Shown as text, not rendered or executed |
| SR-12 | Unpublished item hidden | Security | Seeded unpublished "Hidden Jacket" | Search its exact name | Not returned; count excludes it |
| SR-13 | State in URL | Positive | Filters, sort, page 2 | Copy URL to new tab; use Back | Same results and state restored |

## Test data

Seed a small catalogue designed for the rules:

| Item | Purpose |
|---|---|
| Café Mug, Cafe Grinder | Accent handling |
| Products at 49.99, 50.00, 100.00, 100.01 | Price boundaries |
| 30 products at identical price | Stable sorting |
| Exactly 25 matches for one term | Pagination boundary |
| One unpublished, one out-of-stock product | Visibility and stock filter |
| Names with apostrophes and ampersands (Kids' & Baby) | Special characters |

## Defects to look for

- **Wrong combination logic**: AND within a group (zero results) or OR across groups (too many).
- **Inclusive vs exclusive range errors** at price boundaries.
- **Count mismatches** between the total shown and items actually listed.
- **Unstable pagination**: duplicates or missing items across pages.
- **Lost state**: filters cleared after changing page, sorting or using Back.
- **Injection symptoms**: database errors or unexpectedly broad results for quotes and wildcards.
- **Reflected markup**: the search term rendered as HTML in "Results for …".
- **Data leaks**: unpublished, deleted or other customers' items appearing in results or suggestions.
- **Accessibility gaps**: result count changes not announced to screen readers, filters unusable by keyboard.

## Real-world example

A team testing a marketplace search found that results looked fine in every exploratory session. Once the tester seeded 30 identically priced items and paged through a price sort, three items never appeared and two appeared twice. The database returned ties in arbitrary order for each page query. Adding product ID as a tie-breaker fixed it, and the seed became part of the regression data set.

## Common mistakes

- **Judging results by eye** instead of against a known data set and exact counts.
- **Testing filters one at a time** and never in combination.
- **Ignoring the empty state** and error states.
- **Forgetting URL and Back button behaviour**, which users rely on constantly.
- **Testing only the UI**, when the search API may accept page sizes or parameters the UI never sends.

## Key takeaways summary

Search testing is only as good as its oracle. Seed known data, clarify the combination rules, apply EP, BVA and pairwise testing, and look hard at paging, special characters and visibility of restricted items.
