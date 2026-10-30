---
slug: testing-cart-and-checkout
title: Testing shopping cart and checkout
summary: A guided scenario for testing a shopping cart and checkout - sample spec, assumptions, test design, sample test cases, test data and the defects that cost real money, such as price tampering, stale prices, stock oversell and rounding errors.
level: intermediate
duration: 40
tags: [real-world, e-commerce, checkout, cart, decision-tables]
objectives:
  - Derive test conditions for cart operations, pricing rules and the checkout journey from a sample specification
  - Apply decision tables to discount and delivery rules and BVA to quantities and thresholds
  - Design end-to-end checkout cases that verify totals, stock and order state
  - Recognise high-impact cart defects such as client-side price trust, stale prices, overselling and rounding errors
prerequisites:
  - Decision table testing
  - Boundary value analysis
related: [decision-table-testing, boundary-value-analysis, testing-payments-refunds-cancellations, testing-sessions-and-concurrency, use-case-testing, state-transition-testing]
references:
  - title: OWASP Top Ten
    url: https://owasp.org/www-project-top-ten/
  - title: OWASP Web Security Testing Guide (business logic testing)
    url: https://owasp.org/www-project-web-security-testing-guide/
  - title: WCAG overview (W3C Web Accessibility Initiative)
    url: https://www.w3.org/WAI/standards-guidelines/wcag/
  - title: ISTQB Certified Tester Foundation Level (CTFL) v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
interview:
  - q: How would you test a shopping cart and checkout?
    a: I clarify the pricing rules first - discounts, delivery thresholds, tax, rounding and currency - and capture them in a decision table. Then I test cart operations (add, update quantity, remove, persist across sessions and devices) with boundaries on quantity, the totals at every stage, and the checkout journey end to end, including address, delivery option and payment outcomes. I verify the order record, stock levels and confirmation email, not only the screen. Finally I check business logic abuse on an authorised environment - tampered prices or quantities in requests, reused single-use coupons, and stock oversell when two buyers race for the last item.
  - q: Why should the server never trust a price sent from the browser?
    a: Anything sent from the client can be modified with browser developer tools or a proxy. If the server accepts the item price or total from the request, a user could pay any amount they like. The server should look up prices itself from the product identifier and recalculate totals. I test it by changing the price or quantity in the request on an authorised environment and checking the order uses the server's values or rejects the request.
  - q: A price changes while an item is in someone's cart. What should happen and how do you test it?
    a: The spec should say, but a typical rule is that the cart shows the current price and clearly tells the user it changed before they pay. I add an item, change its price in the admin tool, then refresh the cart and proceed to checkout, checking the displayed price, the notice, the order total and the charged amount all agree. The defect to look for is the old price being charged or the new price charged without notice.
  - q: How do you test rounding in a checkout?
    a: I pick prices and percentages that produce fractions of the smallest currency unit, such as a 10 percent discount on 1.15 across three units, and compare rounding each discounted unit price with rounding only the order total. The spec must say which applies. I check the sum of line items equals the displayed total, the total equals the charged amount, and the invoice matches - a one-cent difference across those is a real defect.
practice:
  - "Build a full decision table for the sample spec's discount and delivery rules, then reduce it by merging columns with identical outcomes."
  - "Write five test cases for a cart shared across a phone and a laptop with the same account, including conflicting edits."
  - "Choose prices, quantities and a discount that produce a rounding difference between unit-level and whole-order rounding. Show both calculations."
takeaways:
  - Capture pricing, discount and delivery rules in a decision table before testing.
  - Verify totals at every step and in the stored order, the charge and the invoice, not just on screen.
  - The server must calculate prices and totals itself; test by tampering with requests in an authorised environment.
  - Use BVA on quantities, thresholds and stock levels; test the last item with two buyers.
  - Watch for rounding, stale prices and coupon reuse - defects that cost real money.
quiz:
  - id: rwcart-q1
    type: scenario
    topic: testing-cart-and-checkout
    difficulty: intermediate
    prompt: Free delivery applies when the subtotal after discounts is 50.00 or more. A cart has a subtotal of 55.00 and a 10.00 coupon. What delivery charge is expected?
    options: ["Free, because the subtotal before discount is 55.00", "The standard charge, because the subtotal after discount is 45.00", "Free, because a coupon was applied", "It depends on the payment method"]
    answer: [1]
    explanation: The rule uses the subtotal after discounts, which is 45.00 and below the 50.00 threshold, so standard delivery applies. Using the pre-discount figure is exactly the defect this case is designed to catch.
  - id: rwcart-q2
    type: single
    topic: testing-cart-and-checkout
    difficulty: intermediate
    prompt: In an authorised test, you change the unit price in the add-to-cart request from 120.00 to 1.00 and the order is placed for 1.00. What kind of defect is this?
    options: ["A cosmetic display defect", "A business logic flaw where the server trusts client-supplied prices", "A performance defect", "An expected behaviour for promotional prices"]
    answer: [1]
    explanation: The server must calculate prices from its own data. Accepting the client's price lets anyone set what they pay, a serious business logic and security defect. It is not cosmetic because the stored order and charge are wrong.
  - id: rwcart-q3
    type: multiple
    topic: testing-cart-and-checkout
    difficulty: intermediate
    prompt: The maximum quantity per line is 10 and stock is 3. Which are useful boundary tests? Select all that apply.
    options: ["Quantity 3 succeeds", "Quantity 4 is refused with a stock message", "Quantity 10 when stock is ample succeeds", "Quantity 11 is refused with a limit message", "Quantity 5 when stock is ample"]
    answer: [0, 1, 2, 3]
    explanation: Stock and the per-line limit are two separate boundaries, so 3 and 4 test stock while 10 and 11 test the limit. Quantity 5 with ample stock is a mid-range value inside the valid partition.
  - id: rwcart-q4
    type: truefalse
    topic: testing-cart-and-checkout
    difficulty: beginner
    prompt: If the order confirmation page shows the correct total, there is no need to check the stored order or the confirmation email.
    options: ["True", "False"]
    answer: [1]
    explanation: False. The page, stored order, payment charge, email and invoice can each be calculated or formatted separately. Mismatches between them are common defects and only show up if every place is checked.
---

## Beginner-friendly explanation

Think of a supermarket trolley and checkout lane. You add and remove items, the scanner adds up prices, coupons are taken off, and the receipt should match exactly what you paid. Testing an online cart is checking every step of that, including awkward moments: a price changes while you shop, someone else buys the last item, or a coupon is used twice.

## Technical explanation

A cart is a **state** (items, quantities, prices, applied coupons) held on the server, often linked to a guest session or account. Checkout is a **multi-step workflow**: cart, address, delivery, payment, confirmation, ending in an **order** record, a stock reduction and notifications.

Two principles drive most of the risk:

- **The server is the source of truth** for prices, discounts, stock and totals. The browser only displays them.
- **Money must reconcile** across the screen, the stored order, the payment charge, the email and the invoice.

Security checks here are for environments you own or are authorised to test.

## Requirements

1. Users can add, update quantity (1–10 per line) and remove items. Quantity cannot exceed available stock.
2. Guest carts persist for 7 days; on login they merge with the account cart (quantities added, capped at 10).
3. One coupon per order. SAVE10 takes 10.00 off subtotals of 40.00 or more.
4. Delivery: standard 4.99, free when subtotal after discounts is 50.00 or more; express 9.99 always.
5. Prices include tax; discounted unit prices are rounded half-up to 2 decimals before multiplying by quantity.
6. If a price changes while in the cart, the cart shows the new price and a notice before payment.
7. Stock is reserved only when payment succeeds; if stock runs out first, checkout stops with a clear message.

## Assumptions

- Prices are in a single currency for this release.
- Coupon codes are case-insensitive (to confirm).
- The payment provider sandbox returns success, decline and timeout outcomes on demand.

## Test design

| Technique | Applied to | Why |
|---|---|---|
| Decision table | Coupon eligibility × delivery option × threshold | Interacting rules are easy to get wrong |
| Boundary value analysis | Quantity (0, 1, 10, 11), stock (n, n+1), thresholds (39.99/40.00, 49.99/50.00) | Off-by-one errors in money and counts |
| State transition / use case | Cart → checkout → order states | Abandoned, resumed and failed journeys |
| Error guessing | Request tampering, coupon reuse, two buyers for the last item, stale price | Known money-losing defects |

Decision table for delivery (standard selected):

| Rule | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Subtotal ≥ 40.00 (SAVE10 eligible) | N | Y | Y | Y |
| SAVE10 applied | – | Y | Y | N |
| Subtotal after discount ≥ 50.00 | N | N | Y | Y |
| **Delivery charge** | 4.99 | 4.99 | 0.00 | 0.00 |

## Sample test cases

| ID | Scenario | Type | Test data | Steps summary | Expected result |
|---|---|---|---|---|---|
| CT-01 | Add, update, remove | Positive | Item at 12.50, qty 2 → 3 → removed | Perform each action | Line totals and subtotal correct after each step |
| CT-02 | Quantity boundaries | Boundary | Qty 0, 1, 10, 11 | Set each | 1 and 10 accepted; 0 removes or is refused per spec; 11 refused |
| CT-03 | Stock boundary | Boundary | Stock 3, qty 3 then 4 | Update quantity | 3 accepted; 4 refused with stock message |
| CT-04 | Coupon threshold | Boundary | Subtotals 39.99 and 40.00 with SAVE10 | Apply coupon | Rejected then accepted |
| CT-05 | Discount drops below free delivery | Positive | Subtotal 55.00 with SAVE10 | Go to delivery | Standard delivery 4.99 charged |
| CT-06 | Price tampering | Security | Edited price in request (authorised env) | Add to cart via modified request | Server uses catalogue price or rejects |
| CT-07 | Price change in cart | Negative | Price 20.00 → 22.00 in admin | Refresh cart, checkout | New price and notice shown; charge equals displayed total |
| CT-08 | Last item, two buyers | Negative | Stock 1, two accounts | Both pay at nearly the same time | One order succeeds; other is told stock ran out and is not charged |
| CT-09 | Guest cart merge | Positive | Guest qty 6, account qty 6 same item | Log in | Merged quantity capped at 10 with notice |
| CT-10 | Rounding | Boundary | 3 × 1.15 with 10 percent promotion | Checkout | Unit 1.035 rounds to 1.04; total 3.12 on page, order, charge and invoice |
| CT-11 | Coupon reuse | Negative | Single-use code used on a previous order | Apply again | Rejected with clear message |
| CT-12 | Payment declined | Negative | Sandbox decline card | Pay | Order not created as paid; cart preserved; stock unchanged |

## Test data

- Products at boundary prices (39.99, 40.00, 49.99, 50.00) and with fractional discount results.
- Stock levels of 0, 1 and 3; one product that becomes unpublished during checkout.
- Coupons: valid, expired, single-use already used, mixed case.
- Accounts: guest, new account, account with an existing cart.
- Sandbox payment cards for success, decline and timeout from the payment provider's test documentation.

## Defects to look for

- **Client-side price or total trusted** by the server.
- **Negative or zero quantities** accepted through the API, creating credits.
- **Stale prices** charged after a price change, or changed without notice.
- **Stock oversell** when two buyers race for the last item.
- **Coupon stacking or reuse** beyond the rules.
- **Threshold logic using the wrong subtotal** (before vs after discount).
- **Rounding differences** between lines, total, charge and invoice.
- **Order created as paid** when payment failed or timed out.
- **Cart lost** on login, on a declined payment, or across devices.

## Real-world example

A team testing a gift shop checkout verified totals on screen in every test. When the tester started comparing the confirmation email and the payment sandbox records, one case stood out: three units at 1.15 with a 10 percent promotion showed 3.12 on screen (1.035 rounded up to 1.04, times three) but 3.11 was charged, because the payment service applied the discount to the order total of 3.45, giving 3.105, which rounds to 3.11. The spec requires unit-level rounding, so the charge was wrong by one cent, and only reconciliation across screen, order and charge exposed it.

## Common mistakes

- **Only checking the screen** instead of reconciling order, charge, email and invoice.
- **Testing rules one at a time** instead of in a decision table.
- **Ignoring concurrency** on limited stock and single-use coupons.
- **Not testing failed and abandoned payments**, which leave orders and stock in odd states.
- **Using production payment details** in tests instead of the provider's sandbox data.

## Key takeaways summary

Cart and checkout testing is about rules and reconciliation. Model pricing in a decision table, test boundaries on quantities and thresholds, reconcile every total, and look for the business logic abuse that costs money.
