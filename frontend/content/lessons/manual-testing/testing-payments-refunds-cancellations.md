---
slug: testing-payments-refunds-cancellations
title: Testing payments, refunds and cancellations
summary: A guided scenario for testing payment capture, partial and full refunds and order cancellation - sample spec, assumptions, state-based test design, test cases, sandbox test data and the defects that matter, such as double charges on retry and over-refunds.
level: advanced
duration: 45
tags: [real-world, payments, refunds, idempotency, state-transition]
objectives:
  - Model an order's payment lifecycle as states and derive valid and invalid transition tests
  - Apply boundary value analysis to refund amounts, cancellation windows and currency precision
  - Design tests for retries, timeouts and duplicate notifications using idempotency concepts
  - Recognise high-impact payment defects such as double charges, over-refunds, lost refunds and inconsistent order states
prerequisites:
  - Testing shopping cart and checkout
  - State transition testing
related: [testing-cart-and-checkout, state-transition-testing, boundary-value-analysis, idempotency-retries-rate-limiting, testing-sessions-and-concurrency, testing-notifications]
references:
  - title: OWASP Transaction Authorization Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html
  - title: OWASP Web Security Testing Guide (business logic testing)
    url: https://owasp.org/www-project-web-security-testing-guide/
  - title: PCI Security Standards Council
    url: https://www.pcisecuritystandards.org/
  - title: MDN HTTP documentation (methods and idempotency)
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
interview:
  - q: How would you test that a customer is never charged twice?
    a: I look at every way a payment request can be repeated - double-clicking Pay, refreshing the confirmation page, the browser Back button, a network timeout followed by a retry, and the payment provider sending the same webhook twice. For each, I check there is exactly one charge in the provider's sandbox dashboard and one paid order. The underlying control is usually an idempotency key per payment attempt, so I also check that a retry with the same key returns the original result instead of creating a new charge.
  - q: What is the difference between authorisation, capture, void and refund?
    a: Authorisation reserves funds on the customer's card without moving them. Capture actually takes the authorised money, sometimes at shipment. Void cancels an authorisation before capture, so no money moves. Refund returns money after capture, fully or partially. Testing has to check that cancellations before capture void rather than refund, and that refunds never exceed the captured amount. Exact terminology and behaviour vary by payment provider, so I confirm against the provider's documentation.
  - q: Which boundary tests would you run on partial refunds?
    a: For a captured amount of 100.00 with no previous refunds - refund 0.00 and 0.01 at the bottom, 99.99 and 100.00 at the top, and 100.01 which must be refused. Then the cumulative boundary - after a refund of 60.00, a second refund of 40.00 succeeds and 40.01 is refused. I also check currency precision, such as currencies with no minor units, and that the order status changes to partially or fully refunded at the right moment.
  - q: The payment provider times out but actually charged the card. How should the system behave and how do you test it?
    a: The system should not assume failure. It should mark the payment as pending or unknown, and reconcile using the provider's webhook or a status query, then complete the order or release it. I simulate the timeout using the provider's sandbox or a stub, confirm no second charge occurs if the user retries, and check the order ends in the correct state once the webhook arrives - including when the webhook arrives before the API response.
practice:
  - "Draw the payment state diagram for the sample spec and list every invalid transition (for example refund from Authorised). Write one test for each."
  - "Write boundary tests for a cancellation window of 30 minutes after order placement, including how the clock is measured (order placed vs payment authorised)."
  - "List all the ways a customer could submit the same payment twice, and the evidence you would collect to prove a single charge."
takeaways:
  - Model payments as states (Pending, Authorised, Captured, Partially refunded, Refunded, Voided, Failed) and test invalid transitions.
  - Every repeated request - double click, refresh, retry, duplicate webhook - must produce exactly one charge.
  - Refunds have boundaries on the single amount and the cumulative total, at currency precision.
  - Timeouts mean unknown, not failed; reconciliation must resolve them.
  - Use only the payment provider's sandbox and test card numbers, never real card data.
quiz:
  - id: rwpay-q1
    type: scenario
    topic: testing-payments-refunds-cancellations
    difficulty: intermediate
    prompt: A customer clicks Pay, sees a spinner for 40 seconds, then a timeout error, and clicks Pay again. The provider sandbox shows two successful charges. What is the most likely missing control?
    options: ["A larger timeout value", "An idempotency key so a retried payment returns the original result instead of charging again", "Client-side validation of the card number", "A CAPTCHA on the payment page"]
    answer: [1]
    explanation: The first request succeeded at the provider but the response was lost. Without an idempotency key, the retry is treated as a new payment. A longer timeout only makes the problem rarer, and validation or CAPTCHA do nothing about duplicate submission.
  - id: rwpay-q2
    type: multiple
    topic: testing-payments-refunds-cancellations
    difficulty: intermediate
    prompt: An order captured 100.00 and has already been refunded 70.00. Which further refund requests should succeed? Select all that apply.
    options: ["0.01", "30.00", "30.01", "29.99", "100.00"]
    answer: [0, 1, 3]
    explanation: The remaining refundable amount is 30.00, so any amount from 0.01 up to 30.00 is valid. 30.01 and 100.00 would make total refunds exceed the captured amount and must be refused.
  - id: rwpay-q3
    type: single
    topic: testing-payments-refunds-cancellations
    difficulty: advanced
    prompt: Payment is authorised at order time and captured at shipment. A customer cancels before shipment. What is the expected payment operation?
    options: ["Refund the full amount", "Void (cancel) the authorisation so no money is captured", "Capture then refund", "Do nothing; the authorisation will be charged later"]
    answer: [1]
    explanation: Before capture, no money has moved, so the correct action is to void or release the authorisation. Refunding or capture-then-refund moves money unnecessarily and can incur fees; doing nothing risks a later capture of a cancelled order.
  - id: rwpay-q4
    type: truefalse
    topic: testing-payments-refunds-cancellations
    difficulty: beginner
    prompt: It is acceptable to use your own real credit card on a test environment as long as you refund the payment afterwards.
    options: ["True", "False"]
    answer: [1]
    explanation: False. Test environments should use the payment provider's sandbox and published test card numbers. Real card data in test systems creates security and compliance risk, and test environments are often not secured to the standard required for cardholder data.
---

## Beginner-friendly explanation

Paying for something online is like a shop putting a hold on your money, taking it when your parcel ships, and giving some back if you return an item. Testing payments means checking that money moves exactly once, in the right amount, at the right time, and that every return and cancellation leaves both the shop's records and your bank statement agreeing.

## Technical explanation

Payment flows depend on an external **payment provider**. The application sends requests (authorise, capture, refund, void) and receives results both synchronously and through asynchronous **webhooks**. Because networks fail, any request might succeed at the provider while the response is lost. Robust systems use **idempotency keys**, a unique key per intended operation, so a repeated request returns the original result instead of repeating the operation (see [idempotency, retries and rate limiting](/learn/api-testing/idempotency-retries-rate-limiting)).

Terminology and features vary by provider; always confirm against the provider's documentation. Use only sandbox environments and published test cards; never real card data.

## Requirements

1. Card payment is authorised at order placement and captured when the order ships.
2. Customers can cancel within **30 minutes** of placing an order. Orders are never shipped inside that window, so a cancellation always happens before capture and voids the authorisation. After 30 minutes, customers must contact support.
3. After capture, staff can issue full or partial refunds. Total refunds cannot exceed the captured amount.
4. Refunds go to the original payment method only.
5. Order statuses: Pending payment, Authorised, Captured, Partially refunded, Refunded, Cancelled, Payment failed.
6. Each payment and refund request carries an idempotency key; repeated requests must not repeat the operation.
7. Webhooks may arrive late, twice or out of order; the system must handle all three.
8. Customers receive an email for payment, cancellation and each refund.

## Assumptions

- A single currency with two decimal places for this release.
- The provider sandbox can simulate success, decline, timeout and delayed webhooks.
- Only users with the Refunds permission can issue refunds.

## Test design

| Technique | Applied to | Why |
|---|---|---|
| State transition | Order and payment statuses | Most payment defects are invalid or missing transitions |
| Boundary value analysis | Refund amounts (single and cumulative), cancellation window, precision | Money errors are off-by-one-cent errors |
| Error guessing and fault injection | Timeouts, retries, duplicate and out-of-order webhooks | Real networks fail in these ways |
| Decision table | Cancel request × payment state × shipment state | Decides void vs refund vs refuse |

```mermaid
stateDiagram-v2
  [*] --> PendingPayment
  PendingPayment --> Authorised: authorisation approved
  PendingPayment --> PaymentFailed: declined
  Authorised --> Cancelled: customer cancels (void)
  Authorised --> Captured: shipped
  Captured --> PartiallyRefunded: partial refund
  PartiallyRefunded --> PartiallyRefunded: further partial refund
  PartiallyRefunded --> Refunded: remaining amount refunded
  Captured --> Refunded: full refund
```

Any transition not on the diagram, such as refunding an Authorised order or capturing a Cancelled one, must be refused.

## Sample test cases

| ID | Scenario | Type | Test data | Steps summary | Expected result |
|---|---|---|---|---|---|
| PY-01 | Successful pay and capture | Positive | Sandbox success card, 100.00 | Place order, ship | One authorisation, one capture of 100.00; status Captured; email sent |
| PY-02 | Declined card | Negative | Sandbox decline card | Pay | Status Payment failed; clear message; no order fulfilment |
| PY-03 | Double click on Pay | Negative | Success card | Click Pay twice rapidly | Exactly one charge in sandbox; one order |
| PY-04 | Timeout then retry | Negative | Simulated provider timeout | Pay, retry after error | One charge; order resolves to Authorised after reconciliation |
| PY-05 | Duplicate webhook | Negative | Same capture event sent twice | Replay event in sandbox | Processed once; one email; no double stock change |
| PY-06 | Cancel before capture | Positive | Authorised order, 10 minutes old | Cancel | Authorisation voided; status Cancelled; no refund created |
| PY-07 | Cancel window boundary | Boundary | Unshipped orders aged 29:59 and 30:01 | Attempt cancel | First allowed and voided; second refused with a contact-support message |
| PY-08 | Partial refund boundaries | Boundary | Captured 100.00 | Refund 0.00, 0.01, 100.00, 100.01 | 0.00 and 100.01 refused; 0.01 and 100.00 allowed |
| PY-09 | Cumulative refund | Boundary | Refunded 70.00 already | Refund 30.00 then 0.01 | 30.00 succeeds, status Refunded; 0.01 refused |
| PY-10 | Refund retry | Negative | Same refund submitted twice with same key | Submit, resubmit | One refund created |
| PY-11 | Refund without permission | Security | Support user without Refunds permission | Call refund via UI and API | Refused with 403; no refund created |
| PY-12 | Out-of-order webhooks | Negative | Refund event before capture event | Replay in that order | Final state correct (Partially refunded or Refunded), no error |

## Test data

- Provider sandbox test cards for success, decline, insufficient funds, authentication required and timeout (from the provider's documentation).
- Orders in every status from the diagram, ready to use.
- Amounts at precision boundaries: 0.01, 99.99, 100.00, 100.01.
- Staff accounts with and without the Refunds permission.
- A way to replay or delay webhook events in the sandbox.

## Defects to look for

- **Double charge** on double click, refresh, Back button or retry after a timeout.
- **Duplicate processing of webhooks**: two emails, double stock changes, or two ledger entries.
- **Over-refund**: cumulative refunds exceeding the captured amount, often when two staff refund at once.
- **Refund instead of void** for uncaptured orders, or capture of a cancelled order.
- **Timeout treated as failure**, cancelling an order the customer has actually paid for.
- **Status drift**: order says Refunded but the provider shows a partial refund.
- **Refund to a different payment method** than the original.
- **Missing authorisation checks** on refund endpoints.
- **Card data in logs**, screenshots or defect reports.

## Real-world example

A team testing a ticketing site ran all positive payment tests successfully. The tester then simulated a provider timeout in the sandbox. The application showed "Payment failed", released the seats and let the customer retry, while the sandbox showed the first authorisation as successful. The customer could end up charged twice, or charged once with no ticket. The fix introduced a pending state, idempotency keys and webhook reconciliation, and the timeout case joined the regression suite.

## Common mistakes

- **Testing only the happy path** with a success card.
- **Checking the application but not the provider dashboard**, so mismatches go unseen.
- **Ignoring asynchronous events**, which is where many payment defects live.
- **Testing refunds one at a time** and never concurrently.
- **Using real cards** or copying card numbers into defect reports.

## Key takeaways summary

Payments are a state machine wrapped around an unreliable network. Model the states, test invalid transitions, push every retry path, apply boundaries to refund amounts, and always reconcile your application against the provider's sandbox records.
