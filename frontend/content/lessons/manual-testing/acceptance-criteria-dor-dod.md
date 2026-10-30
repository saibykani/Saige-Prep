---
slug: acceptance-criteria-dor-dod
title: Acceptance criteria, Definition of Ready and Done
summary: Write testable acceptance criteria in Given/When/Then form, and understand how they differ from a team's Definition of Ready and the Scrum Definition of Done.
level: beginner
duration: 30
tags: [agile, acceptance-criteria, bdd, definition-of-done, user-stories]
objectives:
  - Write acceptance criteria that are specific, testable and free of implementation detail
  - Express acceptance criteria as Given/When/Then scenarios
  - Distinguish story-level acceptance criteria from the team-wide Definition of Done
  - Explain what a Definition of Ready is, and why it is an optional practice rather than part of Scrum
prerequisites:
  - Scrum roles and ceremonies
  - Test scenarios and test cases
related: [scrum-roles-and-ceremonies, test-scenarios-and-test-cases, cucumber-bdd, requirements-analysis-for-testers, boundary-value-analysis]
references:
  - title: The Scrum Guide (2020) - Increment and Definition of Done
    url: https://www.scrumguides.org/scrum-guide.html
  - title: Cucumber documentation (Gherkin reference)
    url: https://cucumber.io/docs/
  - title: ISTQB Certified Tester Foundation Level (CTFL) v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
interview:
  - q: What is the difference between acceptance criteria and the Definition of Done?
    a: Acceptance criteria are specific to one backlog item and describe the behaviour that item must show to be accepted, for example how a discount code is validated. The Definition of Done applies to every item and describes the quality bar for the Increment, for example code reviewed, automated tests passing, no open critical defects, accessibility checked. A story is done only when it meets both - its own acceptance criteria and the team's Definition of Done.
  - q: What makes an acceptance criterion testable?
    a: It has an observable, unambiguous outcome. "The page should be fast" is not testable; "search results appear within 2 seconds for the standard catalogue on the reference environment" is. Good criteria name the precondition, the action and the expected result, use concrete values, cover the unhappy paths and boundaries, and describe behaviour rather than implementation.
  - q: Is the Definition of Ready a Scrum requirement? Would you use one?
    a: It is not in the Scrum Guide, which only says items that can be done within one Sprint are ready for selection. Many teams find a lightweight Definition of Ready useful, for example acceptance criteria agreed, dependencies known, test data identified, small enough for a Sprint. The risk is turning it into a rigid gate that stops conversation, so I would keep it short and treat it as a checklist for refinement rather than a contract.
  - q: How would you write acceptance criteria for "users can reset their password"?
    a: I would cover the main path and the risky paths as examples. Given a registered email, when the user requests a reset, then a single-use link valid for a defined time is sent. Given an unregistered email, when a reset is requested, then the same neutral confirmation message is shown, to avoid revealing which emails exist. Given an expired or already used link, when it is opened, then the user is told it is invalid and can request a new one. Plus password rules, and that existing sessions are signed out after a successful reset if the product requires it.
practice:
  - "Rewrite these vague criteria as testable Given/When/Then scenarios - 'Search should work well', 'Users get a sensible error for bad input', 'The coupon applies correctly'."
  - "Draft a Definition of Done of 6 to 10 items for a web product team. Mark which items are verified by automation and which by a person."
  - "Take a story with five acceptance criteria and add the missing negative and boundary scenarios."
takeaways:
  - Acceptance criteria belong to one item; the Definition of Done applies to every item in the Increment.
  - Given/When/Then makes the precondition, action and observable outcome explicit.
  - Good criteria include unhappy paths and boundaries, use concrete values and avoid implementation detail.
  - The Definition of Done is a Scrum commitment; the Definition of Ready is an optional team practice.
  - Testers add most value by turning vague rules into concrete examples before development starts.
quiz:
  - id: acdod-q1
    type: single
    topic: acceptance-criteria-dor-dod
    difficulty: beginner
    prompt: Which acceptance criterion is the most testable?
    options: ["The checkout should be user friendly", "Given a cart total of 49.99, when the user views delivery options, then standard delivery costs 4.99", "Delivery charges should be calculated correctly", "The system should handle delivery well for all users"]
    answer: [1]
    explanation: The Given/When/Then example names a concrete precondition, action and observable result that anyone can verify. The others use subjective words such as user friendly, correctly or well, which cannot be passed or failed objectively.
  - id: acdod-q2
    type: single
    topic: acceptance-criteria-dor-dod
    difficulty: intermediate
    prompt: Which item belongs in a team's Definition of Done rather than in a single story's acceptance criteria?
    options: ["A discount of 10 percent applies to orders of 100.00 or more", "All new and changed code has been peer reviewed and the automated regression suite passes", "The password reset link expires after 30 minutes", "Search results are sorted by relevance by default"]
    answer: [1]
    explanation: Code review and a passing regression suite are quality measures that apply to every item, which is what the Definition of Done describes. The other options are behaviours specific to one feature and therefore acceptance criteria.
  - id: acdod-q3
    type: truefalse
    topic: acceptance-criteria-dor-dod
    difficulty: beginner
    prompt: The 2020 Scrum Guide requires every Scrum Team to have a Definition of Ready.
    options: ["True", "False"]
    answer: [1]
    explanation: False. The Scrum Guide defines the Definition of Done as the commitment for the Increment. A Definition of Ready is an optional practice some teams adopt; the Guide only says items that can be done within one Sprint are ready for selection.
  - id: acdod-q4
    type: multiple
    topic: acceptance-criteria-dor-dod
    difficulty: intermediate
    prompt: A story says "Users can apply one promo code per order." Which additional scenarios should a tester propose as acceptance criteria? Select all that apply.
    options: ["Applying a second code when one is already applied", "Applying an expired code", "Applying a code with different letter case than issued", "The colour of the Apply button", "Removing an applied code and the total updating"]
    answer: [0, 1, 2, 4]
    explanation: A second code, an expired code, letter-case handling and removal are behaviours with business rules that can go wrong. Button colour is a visual design detail, normally covered by the design, not a behavioural acceptance criterion for this rule.
---

## Beginner-friendly explanation

Imagine ordering a birthday cake. You tell the baker: "Chocolate sponge, two layers, 'Happy 30th Asha' written on top, ready by 5 pm Saturday." Those are **acceptance criteria**: specific things you can check when you collect the cake.

The bakery also has its own rules for *every* cake it sells: ingredients labelled, food-safety checks done, box sealed. That is like a **Definition of Done**: a quality bar that applies to everything, whatever the order.

Some bakeries also refuse to start a cake until they have the date, the size and the message confirmed. That is like a **Definition of Ready**: a checklist for when work is clear enough to begin.

## Technical explanation

### Acceptance criteria

Acceptance criteria are the conditions a specific backlog item must satisfy to be accepted by the Product Owner and users. They are not defined in the Scrum Guide; they are a widely used practice. Good criteria are:

- **Specific and observable**: a tester can say pass or fail without debate.
- **Behavioural**: they describe *what* the system does, not *how* it is coded.
- **Complete enough**: they cover the main path, error paths and important boundaries.
- **Agreed before development**, usually during refinement or Sprint Planning.

### Given/When/Then

The Given/When/Then format, used by Gherkin in BDD tools such as [Cucumber](/learn/automation/cucumber-bdd), splits each example into three parts:

- **Given** the precondition or context
- **When** the action or event
- **Then** the observable outcome

Example story: *As a shopper, I want free delivery on larger orders so that I spend less on shipping.*

```gherkin
Feature: Free delivery threshold

  Scenario: Order at the threshold qualifies for free delivery
    Given my cart subtotal is 50.00
    When I view the delivery options
    Then standard delivery costs 0.00

  Scenario: Order just below the threshold pays delivery
    Given my cart subtotal is 49.99
    When I view the delivery options
    Then standard delivery costs 4.99

  Scenario: Discount pushes subtotal below the threshold
    Given my cart subtotal is 55.00
    And I apply a promo code worth 10.00
    When I view the delivery options
    Then standard delivery costs 4.99
```

Notice how the tester used [boundary value analysis](/learn/manual-testing/boundary-value-analysis) (49.99 and 50.00) and an interaction (a discount changing eligibility) to sharpen a vague rule.

### Definition of Done

In the 2020 Scrum Guide, the Definition of Done is "a formal description of the state of the Increment when it meets the quality measures required for the product". It is the commitment for the Increment. If an organisation has one, teams must follow it as a minimum. A sample:

| Definition of Done item | How it is verified |
|---|---|
| Acceptance criteria all pass | Story testing, automated where valuable |
| Code peer reviewed | Pull request approval |
| Unit and API tests added or updated; pipeline green | CI results |
| No open critical or high defects against the item | Defect tracker query |
| Regression checks for affected areas pass | Regression run |
| Accessibility checks done for new UI (for example keyboard use and labels) | Manual check plus automated scan |
| User-facing text and help updated | Review |

### Definition of Ready (optional)

A Definition of Ready is a team-chosen checklist for when an item is clear enough to take into a Sprint, for example: story has a clear value statement; acceptance criteria are written and agreed; dependencies and test data are identified; the item is small enough to finish in one Sprint. It is **not** part of the Scrum Guide and should not become a bureaucratic gate.

| | Acceptance criteria | Definition of Ready | Definition of Done |
|---|---|---|---|
| Scope | One item | Every item, before the Sprint | Every item, before it is in the Increment |
| In the Scrum Guide? | No (common practice) | No (optional practice) | Yes |
| Owner | Product Owner, with the team | The team | The Scrum Team (or organisation standard) |

## Real-world example

A banking team receives the story "Customers can schedule a transfer for a future date." The tester joins refinement and asks: Can the date be today? What is the furthest date allowed? What happens if the account has insufficient funds on the scheduled day? What if the date is a bank holiday?

The Product Owner answers, and the acceptance criteria grow from one line to six scenarios, including "Given a scheduled date that is a non-working day, when the transfer runs, then it is processed on the next working day and the customer is notified." Two of these scenarios exposed a missing business rule that would otherwise have been discovered in production.

## Common mistakes

- **Vague words** like "fast", "correct", "user friendly" or "appropriate error".
- **Only the happy path.** Most defects hide in errors, boundaries and unusual states.
- **Implementation detail** ("store the flag in the session table") instead of behaviour.
- **Mixing levels**, such as putting "code reviewed" into each story's acceptance criteria instead of the Definition of Done.
- **Writing criteria after coding**, which turns them into documentation of what was built rather than what was needed.
- **Treating the Definition of Ready as a wall** that blocks any item with an open question, even a small one.

## Troubleshooting

- **The Product Owner doesn't have time to write criteria.** Offer to draft examples and review them together; the Product Owner still decides.
- **Criteria change mid-Sprint.** Update the scenarios, make the change visible, and discuss scope with the Product Owner rather than silently absorbing it.
- **The Definition of Done is ignored under pressure.** Raise it at the retrospective; an item that skips the Definition of Done is not done.

## Key takeaways summary

Acceptance criteria say what one item must do; the Definition of Done says what quality every item must reach; a Definition of Ready, if used, says when work is clear enough to start. Write criteria as concrete Given/When/Then examples, and include the unhappy paths.
