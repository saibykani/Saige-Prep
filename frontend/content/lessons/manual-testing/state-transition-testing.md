---
slug: state-transition-testing
title: State Transition Testing
summary: Systems with memory react differently to the same event depending on their current state. Model them with a state diagram and state table, then test every valid and invalid transition.
level: intermediate
duration: 40
tags: [test-design, black-box, istqb]
objectives:
  - Identify states, events, guard conditions and actions in a requirement
  - Draw a state transition diagram and convert it into a state table
  - Derive a test set that achieves valid transitions (0-switch) coverage
  - Explain all states, valid transitions and all transitions coverage, and when to use each
prerequisites:
  - Equivalence partitioning
  - Decision table testing
related: [decision-table-testing, use-case-testing, testing-sessions-and-concurrency, testing-cart-and-checkout]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 4.2.4, State Transition Testing)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: Mermaid state diagram documentation
    url: https://mermaid.js.org/syntax/stateDiagram.html
interview:
  - q: What is state transition testing and when do you use it?
    a: It is a black-box technique for systems whose response to an event depends on their current state, such as order workflows, login lockouts, devices or subscriptions. You model states, events and transitions in a state diagram or table, then design tests that exercise transitions. It is the right choice whenever "what happened before" changes "what happens now".
  - q: What is the difference between valid transitions coverage and all transitions coverage?
    a: Valid transitions coverage, also called 0-switch coverage, requires every valid transition in the model to be exercised at least once. All transitions coverage additionally requires every invalid transition in the state table to be attempted, to prove the system rejects or ignores it. ISTQB v4.0 notes that all transitions coverage is a sensible minimum for mission- and safety-critical software.
  - q: Why is a state table useful when you already have a diagram?
    a: A diagram shows only valid transitions. A state table lists every state against every event, so the empty cells are the invalid transitions. It makes them visible and countable, which is how you find untested behaviour such as cancelling an order that has already shipped.
  - q: Why should invalid transitions be tested one per test case?
    a: Once an invalid event is attempted, the system might move into an unexpected state. Any further steps in that test are then running from an unknown state, so a second invalid attempt could be masked or misinterpreted. ISTQB recommends one invalid transition per test to avoid this fault masking.
practice:
  - "A login screen locks an account after three consecutive wrong passwords; a correct password resets the counter; an admin unlock returns a locked account to the start. Draw the state diagram and list tests for 0-switch coverage."
  - "Build the full state table for a traffic light with a pedestrian button and identify every invalid transition."
  - "Extend the order example with a 'Returned' state reachable only from Delivered within 7 days. Update the diagram, the table and the 0-switch test list."
takeaways:
  - A state model has states, events, transitions, guards and actions.
  - The diagram shows valid transitions; the state table also reveals invalid ones as empty cells.
  - Valid transitions coverage is also called 0-switch coverage; all transitions coverage adds every invalid transition.
  - Test each invalid transition in its own test to avoid fault masking.
  - Start every test from a known state, and state the expected end state, not only the screen message.
quiz:
  - id: stt-q1
    type: single
    topic: state-transition-testing
    difficulty: intermediate
    prompt: Which coverage criterion is also known as 0-switch coverage?
    options: ["All states coverage", "Valid transitions coverage", "All transitions coverage", "Decision coverage"]
    answer: [1]
    explanation: ISTQB v4.0 states that valid transitions coverage is also called 0-switch coverage, meaning every single valid transition is exercised. All transitions coverage adds the invalid transitions, and all states coverage only visits each state.
  - id: stt-q2
    type: scenario
    topic: state-transition-testing
    difficulty: intermediate
    prompt: In this lesson's order model, which single test sequence exercises the most valid transitions?
    options: ["place order, cancel", "place order, pay, cancel", "place order, pay, ship, deliver", "place order, timeout"]
    answer: [2]
    explanation: Pending payment to Paid to Shipped to Delivered exercises three valid transitions (pay, ship, deliver). The other sequences exercise one or two. All four are still needed for 0-switch coverage because each covers different transitions.
  - id: stt-q3
    type: truefalse
    topic: state-transition-testing
    difficulty: beginner
    prompt: Achieving all states coverage guarantees that every valid transition has been tested.
    options: ["True", "False"]
    answer: [1]
    explanation: You can visit every state without using every transition. In the order model, ST-01 and ST-02 reach all five states but never exercise the timeout or the paid-order cancellation transitions.
  - id: stt-q4
    type: multiple
    topic: state-transition-testing
    difficulty: advanced
    prompt: Using the order state table in this lesson, which of these are invalid transitions that all transitions coverage would require you to attempt? Select all that apply.
    options: ["Cancel while Shipped", "Pay while Paid", "Ship while Pending payment", "Deliver while Shipped"]
    answer: [0, 1, 2]
    explanation: Cancel in Shipped, pay in Paid and ship in Pending payment are empty cells in the state table, so they are invalid and must be shown to be rejected. Deliver while Shipped is a valid transition to Delivered.
---

## Beginner-friendly explanation

Think of a washing machine. Pressing **Start** does something different depending on what the machine is doing: if it is idle it starts a wash, if it is already washing it does nothing, and if the door is open it beeps. The machine **remembers** where it is, and the same button has different effects.

That memory is called **state**. State transition testing is a way of drawing every state a system can be in, the events that move it between states, and then testing each move, including the moves that should *not* be allowed, such as opening the door in the middle of a spin.

## Technical explanation

ISTQB CTFL v4.0 describes a state transition model in terms of:

- **State**: a condition the system is in, such as *Paid*.
- **Event**: something that triggers a change, such as *ship*.
- **Transition**: a change from one state to another caused by an event. It may stay in the same state.
- **Guard condition**: a condition that must be true for the transition to fire, such as *payment approved*.
- **Action**: what the system does during the transition, such as *issue refund*.

A **state transition diagram** shows the valid transitions. A **state table** lists every state against every event; filled cells are valid transitions and **empty cells are invalid transitions**.

Coverage criteria in CTFL v4.0:

| Criterion | Requirement |
|---|---|
| All states coverage | Every state is visited at least once |
| Valid transitions coverage (0-switch) | Every valid transition is exercised at least once |
| All transitions coverage | Every valid transition is exercised and every invalid transition is attempted |

Valid transitions coverage guarantees all states coverage, and all transitions coverage guarantees valid transitions coverage. Invalid transitions should be tested **one per test case** to avoid fault masking. **N-switch** coverage extends the idea to sequences: 1-switch covers every valid pair of consecutive transitions.

### Worked example: an online order

Requirement: *"A placed order waits for payment. Approved payment makes it Paid. An unpaid order can be cancelled by the customer or is cancelled automatically after 30 minutes. A paid order can be cancelled (with a refund) until it ships. Shipped orders are then delivered."*

```mermaid
stateDiagram-v2
  [*] --> PendingPayment: place order
  PendingPayment --> Paid: pay (approved)
  PendingPayment --> Cancelled: cancel
  PendingPayment --> Cancelled: timeout 30 min
  Paid --> Shipped: ship
  Paid --> Cancelled: cancel, issue refund
  Shipped --> Delivered: deliver
  Delivered --> [*]
  Cancelled --> [*]
```

**State table** (5 states × 5 events = 25 cells, 6 valid, 19 invalid):

| Current state | pay | cancel | timeout | ship | deliver |
|---|---|---|---|---|---|
| Pending payment | Paid | Cancelled | Cancelled | invalid | invalid |
| Paid | invalid | Cancelled (refund) | invalid | Shipped | invalid |
| Shipped | invalid | invalid | invalid | invalid | Delivered |
| Delivered | invalid | invalid | invalid | invalid | invalid |
| Cancelled | invalid | invalid | invalid | invalid | invalid |

**0-switch (valid transitions) coverage test list.** The six valid transitions are numbered VT1–VT6:

| Test | Start | Event sequence | Transitions covered | Expected end state |
|---|---|---|---|---|
| ST-01 | Pending payment | pay → ship → deliver | VT1 pay, VT4 ship, VT6 deliver | Delivered |
| ST-02 | Pending payment | cancel | VT2 cancel unpaid | Cancelled, no refund |
| ST-03 | Pending payment | wait 30 min (timeout) | VT3 timeout | Cancelled, no refund |
| ST-04 | Pending payment | pay → cancel | VT1, VT5 cancel paid | Cancelled, refund issued |

Four tests cover all six valid transitions (100% 0-switch coverage) and all five states. For **all transitions coverage**, add one test per invalid cell, for example:

| Test | Start state | Invalid event | Expected |
|---|---|---|---|
| ST-INV-01 | Shipped | cancel | Rejected with a message; state stays Shipped; no refund |
| ST-INV-02 | Pending payment | ship | Rejected; state stays Pending payment |
| ST-INV-03 | Paid | pay | Rejected; customer not charged twice |
| ST-INV-04 | Cancelled | pay | Rejected; no charge |

## Real-world example

A ticketing team let customers cancel bookings and receive refunds. Every functional test cancelled a *confirmed* booking. Nobody tried cancelling a booking that had already been **refunded once**. The state table showed that cell as invalid, so a tester tried it through the API. The system accepted the second cancellation and issued a second refund. A single invalid-transition test exposed a defect that the happy-path tests could never reach.

## Step-by-step walkthrough

1. **List the states** from the requirement, along with status fields, badges and enum values in the UI or API.
2. **List the events**: user actions, timers, messages from other systems.
3. **Draw the diagram** with guards and actions on the arrows.
4. **Build the state table** with every state × every event. Mark each cell as a target state or invalid.
5. **Confirm questionable cells** with the product owner. "Can a delivered order be cancelled?" is a requirement question.
6. **Design valid-transition tests** as event sequences from the initial state, chaining transitions to reduce test count.
7. **Add invalid-transition tests**, one per test, each starting from a known state.
8. **Check the end state**, not only the message. Query the order status through the UI, API or database.

## Code examples

The state table can drive an automated check that every invalid cell is rejected and leaves the state unchanged:

```python
import pytest
from orders import OrderService, InvalidTransition

EVENTS = ["pay", "cancel", "timeout", "ship", "deliver"]
VALID = {
    ("PendingPayment", "pay"): "Paid",
    ("PendingPayment", "cancel"): "Cancelled",
    ("PendingPayment", "timeout"): "Cancelled",
    ("Paid", "cancel"): "Cancelled",
    ("Paid", "ship"): "Shipped",
    ("Shipped", "deliver"): "Delivered",
}
STATES = ["PendingPayment", "Paid", "Shipped", "Delivered", "Cancelled"]
INVALID = [(s, e) for s in STATES for e in EVENTS if (s, e) not in VALID]

@pytest.mark.parametrize("state, event", INVALID)
def test_invalid_transition_is_rejected(state, event):
    order = OrderService.create_in_state(state)
    with pytest.raises(InvalidTransition):
        order.apply(event)
    assert order.state == state
```

## Expected output

`INVALID` contains 19 pairs, so pytest reports `19 passed` on a correct implementation. If shipped orders could be cancelled, the run would show `test_invalid_transition_is_rejected[Shipped-cancel] FAILED`.

## Common mistakes

- **Testing only the happy path** (place, pay, ship, deliver) and calling the workflow tested.
- **Never building the state table**, so invalid transitions stay invisible.
- **Chaining several invalid events in one test**, which masks defects once the system enters an unexpected state.
- **Forgetting timer and system events** such as timeouts, expiry and scheduled jobs.
- **Checking only the UI message** and not the actual stored state.
- **Ignoring guards.** "pay" with a declined card is a different transition (or none) from "pay" with an approved card.

## Troubleshooting

- **The state count is exploding.** You may be mixing data values into states. Keep states as distinct behaviours and use EP for the data.
- **You cannot reach a state through the UI quickly.** Ask for a test hook or API to create entities in a given state, and document it.
- **Timers make tests slow.** Ask for a configurable timeout in test environments rather than waiting 30 minutes.

## Key takeaways summary

Model the states and events, turn the diagram into a table, then test every valid transition (0-switch coverage) and, where risk demands, every invalid one. Always start from a known state and verify the end state. Related techniques: [decision table testing](/learn/manual-testing/decision-table-testing) for the rules inside a transition, and [use-case testing](/learn/manual-testing/use-case-testing) for end-to-end flows.
