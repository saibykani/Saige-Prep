---
slug: error-defect-bug-failure
title: Error, defect, bug, failure and root cause
summary: A human error introduces a defect, which may cause a failure when the code runs. Learn the precise ISTQB chain from error to failure, where root causes fit, and why using the right word makes you a better tester.
level: beginner
duration: 25
tags: [fundamentals, istqb, defects]
objectives:
  - Define error, defect, bug, failure and root cause using ISTQB terminology
  - Trace a failure back through defect and error to a root cause
  - Explain why a defect does not always cause a failure
  - Recognise failures caused by environmental conditions rather than defects
prerequisites:
  - What is software testing?
related: [what-is-software-testing, why-testing-is-required, root-cause-analysis, writing-a-great-defect-report, defect-lifecycle]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 1.2.3, Errors, Defects, Failures, and Root Causes)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary of testing terms (error, defect, failure, root cause)
    url: https://glossary.istqb.org/
interview:
  - q: Explain the difference between an error, a defect and a failure.
    a: An error, also called a mistake, is a human action that produces an incorrect result, such as misreading a requirement. That error can introduce a defect, also called a fault or bug, into a work product such as code or a document. If defective code is executed under the right conditions, it may cause a failure, which is the system not doing what it should, observable by a user or a test.
  - q: Can a defect exist without causing a failure?
    a: Yes. The defective code may never be executed, or only under conditions that have not occurred, such as a particular date, data value or configuration. Defects in documents, such as an ambiguous requirement, never fail on their own; they cause problems only when they lead to defects in later work products.
  - q: What is a root cause, and why does it matter?
    a: A root cause is the fundamental reason a problem occurred, for example a misunderstanding caused by unclear requirements, or a missing review step. Fixing the defect removes one instance; addressing the root cause prevents similar defects in future. Root cause analysis is how teams turn individual defects into process improvements.
  - q: Can a failure happen without any defect in the software?
    a: Yes. ISTQB notes that environmental conditions such as radiation or electromagnetic fields can cause failures in firmware, and in practice infrastructure problems such as a full disk or a network outage can cause failures too. That is why a tester confirms whether a failure is reproducible and what the environment was before calling it a software defect.
practice:
  - "A banking app shows yesterday's balance after a transfer. Write a plausible chain of root cause, error, defect and failure for this symptom."
  - "Write down one example of a defect that could exist in production for months without causing a failure. What condition would finally trigger it?"
  - "Rewrite this defect title to describe the failure rather than guess at the defect: 'Cache bug in profile service'."
takeaways:
  - Error (mistake) is a human action; defect (fault, bug) is the flaw it leaves in a work product; failure is the observable wrong behaviour.
  - A defect causes a failure only if it is executed under conditions that trigger it.
  - A root cause is the fundamental reason the error happened; fixing it prevents future defects.
  - Failures can also come from the environment, not only from defects.
  - Testers observe failures; debugging locates the defect behind them.
quiz:
  - id: edf-q1
    type: single
    topic: error-defect-bug-failure
    difficulty: beginner
    prompt: A developer misreads a requirement and writes the wrong discount formula. Customers are later charged too much at checkout. Which item is the failure?
    options: ["The developer misreading the requirement", "The wrong discount formula in the code", "Customers being charged too much at checkout", "The unclear requirement document"]
    answer: [2]
    explanation: The failure is the observable incorrect behaviour, the wrong charge. Misreading is the error, the wrong formula is the defect, and an unclear requirement could be a root cause.
  - id: edf-q2
    type: truefalse
    topic: error-defect-bug-failure
    difficulty: beginner
    prompt: Every defect in the code will eventually cause a failure.
    options: ["True", "False"]
    answer: [1]
    explanation: A defect causes a failure only if the defective code is executed under triggering conditions. Some defects sit in code paths that are never reached or require data that never occurs.
  - id: edf-q3
    type: code-output
    topic: error-defect-bug-failure
    difficulty: intermediate
    prompt: The requirement is "average of the scores". Which call reveals a failure caused by the defect in this code?
    code: |
      def average(scores):
          total = 0
          for s in scores:
              total += s
          return total / len(scores) if len(scores) > 1 else 0
    codeLanguage: python
    options: ["average([4, 6])", "average([10])", "average([1, 2, 3])", "average([5, 5, 5, 5])"]
    answer: [1]
    explanation: The condition should be len(scores) > 0 or similar. For a single score it returns 0 instead of 10, so only average([10]) triggers the failure. The other calls have more than one score and return the correct result, so the defect stays hidden.
  - id: edf-q4
    type: multiple
    topic: error-defect-bug-failure
    difficulty: intermediate
    prompt: Which of these could be root causes rather than defects or failures? Select all that apply.
    options: ["Acceptance criteria were never written for the story", "The function returns null for empty input", "No one with domain knowledge reviewed the pricing rules", "The order page shows a 500 error", "Developers were rushed to meet a fixed date"]
    answer: [0, 2, 4]
    explanation: Missing acceptance criteria, no domain review and time pressure are fundamental reasons errors happen. Returning null is a defect, and the 500 error page is a failure.
---

## Beginner-friendly explanation

Imagine a recipe book with a typo: "add 2 tablespoons of salt" instead of "2 teaspoons".

- The **error** is the moment the writer, tired and distracted, typed the wrong word. It is a human slip.
- The **defect** is the wrong word now sitting in the book. It does no harm while the book is on the shelf.
- The **failure** happens when someone actually cooks that recipe and the dish is far too salty.
- The **root cause** is why the slip happened and was not caught: maybe the writer was rushed and nobody proof-read the book.

If nobody ever cooks that recipe, the defect is still there, but no failure ever happens. And if you only correct this one typo without fixing the "nobody proof-reads" problem, the next book will have new typos.

## Technical explanation

The ISTQB syllabus (v4.0, section 1.2.3) describes a chain:

```mermaid
flowchart LR
  RC["Root cause, for example unclear requirement or time pressure"] --> E["Error (mistake): a human action"]
  E --> D["Defect (fault, bug): flaw in a work product"]
  D -- "executed under triggering conditions" --> F["Failure: observable deviation from expected behaviour"]
  ENV["Environmental condition, for example radiation or hardware fault"] -.-> F
```

| Term | ISTQB meaning | Example |
|---|---|---|
| **Error** (mistake) | A human action that produces an incorrect result | A developer assumes prices are in whole currency units |
| **Defect** (fault, bug) | An imperfection or deficiency in a work product where it does not meet its requirements | The code stores price as an integer and drops the decimals |
| **Failure** | An event in which a component or system does not perform a required function within specified limits | An item priced 9.99 is charged as 9 |
| **Root cause** | A source of a defect such that if it is removed, the occurrence of the defect type is decreased or removed | No examples with decimals in the acceptance criteria |

Key mechanics:

- **Defects can be in any work product**, not only code: requirements, designs, test scripts, build files. A defect in a requirement can lead to defects in the code built from it.
- **A defect does not always cause a failure.** The defective code must be executed, often with specific data, configuration or timing. Some defects are never triggered.
- **Failures can also be caused by environmental conditions.** ISTQB gives examples such as radiation or electromagnetic fields affecting firmware. In everyday practice, misconfigured or unhealthy environments also cause failures that are not software defects.
- **Not every unexpected result is a failure.** A **false positive** is a reported failure that is not real, for example caused by a wrong test or broken test data. A **false negative** is a test that misses a real defect.
- **"Bug" is an informal synonym for defect.** In exams, use the precise word.

### Testing and debugging along the chain

Dynamic testing observes **failures**. Static testing such as a review finds **defects** directly, without needing them to fail. Debugging traces a failure back to its **defect** and fixes it. Root cause analysis goes one step further to the **root cause**, so that the process can be improved. See [root cause analysis](/learn/manual-testing/root-cause-analysis).

## Real-world example

A generic scenario: a gym's booking app lets members book classes up to seven days ahead.

- **Failure:** a member tries to book next Sunday's class on a Sunday evening and is told the class is "not yet available".
- **Investigation (testing):** the tester reproduces it on a test environment, notes that it only happens for classes exactly seven days ahead and only after a certain time of day, and reports it with clear steps and times.
- **Defect (debugging):** the developer finds the code compares the class start time with "now plus seven days" using the server's UTC clock while class times are stored in local time.
- **Error:** the developer assumed all times were in the same time zone.
- **Root cause:** the team had no agreed convention for time zones, and the acceptance criteria said "seven days" without defining when a day starts.

Fixing the comparison removes this defect. Agreeing a time-zone convention and adding time-boundary examples to acceptance criteria removes the root cause, preventing a whole family of similar defects.

## Code examples

A small defect that hides until a specific input triggers it:

```python
def apply_discount(price: float, percent: int) -> float:
    # Defect: integer division drops the fractional part of the discount
    discount = price * percent // 100
    return round(price - discount, 2)
```

## Expected output

Most inputs look fine, so the defect stays hidden. A boundary-style input triggers the failure:

```text
apply_discount(200.0, 10) -> 180.0   (correct: 180.00)
apply_discount(9.99, 10)  -> 9.99    (expected 8.99: failure)
```

For 9.99 at 10%, `9.99 * 10` is 99.9, and floor division by 100 gives 0.0, so no discount is applied. The defect existed for every call; the failure appears only for certain inputs.

## Common mistakes

- **Calling everything a bug.** Distinguish the failure you observed from the defect you suspect.
- **Writing defect titles that guess the cause.** Describe the failure and its conditions; let debugging confirm the defect.
- **Assuming a failure means a code defect.** Check the environment, test data and the test itself first.
- **Stopping at the defect.** Without addressing the root cause, similar defects keep appearing.
- **Blaming people.** Errors are normal human behaviour; root causes are usually in processes, information or tools.

## Key takeaways summary

A human error introduces a defect into a work product; when that defect is executed under the right conditions it causes a failure. A root cause is the deeper reason the error happened. Testers observe failures and find defects, debugging locates and fixes them, and root cause analysis prevents them from coming back.
