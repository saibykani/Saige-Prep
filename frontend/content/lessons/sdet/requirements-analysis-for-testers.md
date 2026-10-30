---
slug: requirements-analysis-for-testers
title: Requirements Analysis for Testers
summary: Find defects before any code exists by reviewing requirements and user stories for ambiguity, testability and missing cases, using INVEST, an ambiguity checklist, example mapping and well-formed acceptance criteria.
level: intermediate
duration: 35
tags: [requirements, static-testing, user-stories, acceptance-criteria, shift-left]
objectives:
  - Review a requirement or user story for ambiguity, completeness and testability
  - Apply the INVEST criteria to a user story
  - Turn vague statements into measurable, example-based acceptance criteria
  - Run a short example-mapping session and capture rules, examples and questions
prerequisites:
  - Basic test design techniques
  - Familiarity with user stories in agile teams
related: [static-vs-dynamic-testing, acceptance-criteria-dor-dod, shift-left-and-continuous-testing, cucumber-bdd, boundary-value-analysis, traceability-matrix-and-coverage]
references:
  - title: ISTQB Certified Tester Foundation Level (static testing and reviews)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Cucumber documentation (Gherkin and example mapping)
    url: https://cucumber.io/docs/
  - title: The Scrum Guide
    url: https://www.scrumguides.org/
interview:
  - q: How do you review a user story before development starts?
    a: I read it from three angles. Clarity - are there vague words like fast, user-friendly or appropriate, undefined terms, or pronouns with unclear references. Completeness - what about errors, empty states, permissions, limits, concurrency and non-functional needs. Testability - can each acceptance criterion be verified with an objective pass or fail. I turn gaps into concrete questions with proposed examples, discuss them with the product owner and developer, and make sure the answers end up in the acceptance criteria rather than in a chat thread.
  - q: What does INVEST stand for, and which letter matters most to a tester?
    a: Independent, Negotiable, Valuable, Estimable, Small and Testable. All matter, but Testable is where testers add the most direct value - if nobody can say how to verify a story, it is not ready. Small also matters because large stories hide many rules and edge cases, and splitting them often reveals ambiguity.
  - q: "System design: how would you introduce requirements reviews across several teams without slowing delivery?"
    a: I would make the review part of the existing refinement flow rather than a separate gate - for example, a short three-amigos or example-mapping session for each story before it is considered ready. I would give teams a lightweight ambiguity checklist and a definition of ready that includes testable acceptance criteria. Then I would measure whether it helps using signals such as stories reopened for unclear requirements and defects traced back to requirement gaps, and adjust. Coaching a few people per team to facilitate matters more than a central QA approval step.
practice:
  - "Take this story and list every question you would ask - As a user, I want to reset my password quickly so that I can log in again."
  - "Rewrite three vague acceptance criteria from your backlog into measurable, example-based criteria."
  - "Run a 25-minute example-mapping session on one real story and record the rules, examples and open questions."
takeaways:
  - Requirements review is static testing; it finds defects when they are cheapest to fix.
  - Hunt for vague words, missing error and edge cases, undefined terms and hidden assumptions.
  - A requirement is testable when an objective pass or fail can be decided.
  - INVEST - Independent, Negotiable, Valuable, Estimable, Small, Testable.
  - Concrete examples expose misunderstanding faster than abstract rules.
quiz:
  - id: sdet-req-q1
    type: single
    topic: requirements-analysis-for-testers
    difficulty: beginner
    prompt: Which acceptance criterion is testable as written?
    options:
      - "The search should be fast"
      - "The search page should be user-friendly"
      - "Search returns results within 2 seconds at the 95th percentile for 100 concurrent users"
      - "Search should handle a lot of data"
    answer: [2]
    explanation: Only the third option defines a measurable threshold, a statistic and a load condition, so a test can pass or fail objectively. Fast, user-friendly and a lot are subjective and need to be quantified with the product owner.
  - id: sdet-req-q2
    type: multiple
    topic: requirements-analysis-for-testers
    difficulty: intermediate
    prompt: "Review this requirement - Users can upload files up to 10MB. Which are valid clarification questions? Select all that apply."
    options:
      - "Is 10MB inclusive, and is it 10,000,000 or 10,485,760 bytes?"
      - "Which file types are allowed?"
      - "What should the user see when the limit is exceeded?"
      - "Which font should the upload button use?"
    answer: [0, 1, 2]
    explanation: The boundary definition, allowed types and error behaviour are all missing and directly affect tests. Button font is a visual design detail unrelated to the ambiguity of the upload rule.
  - id: sdet-req-q3
    type: truefalse
    topic: requirements-analysis-for-testers
    difficulty: beginner
    prompt: Reviewing requirements is a form of static testing.
    options: ["True", "False"]
    answer: [0]
    explanation: Static testing examines work products without executing code. Reviews of requirements, user stories and designs are classic static testing activities in the ISTQB syllabus.
  - id: sdet-req-q4
    type: scenario
    topic: requirements-analysis-for-testers
    difficulty: intermediate
    prompt: During example mapping, the team keeps finding new rules for a single story and the questions column grows long. What does this usually indicate?
    options:
      - "The story is ready for development"
      - "The story is probably too large or not well understood, and may need splitting or more discovery"
      - "The tester is asking too many questions"
      - "Acceptance criteria are unnecessary for this story"
    answer: [1]
    explanation: Many rules suggest the story is not Small, and many open questions suggest it is not yet understood. Splitting or further discovery is the usual response; pushing on would turn questions into defects later.
---

## Beginner-friendly explanation

Imagine a friend asks you to "pick up some snacks for the party". You return with crisps, but they wanted fruit, for twelve people, and nothing with nuts because a guest has an allergy. Nobody did anything wrong; the request was simply unclear.

Software requirements fail in the same way. **Requirements analysis** is asking the right questions **before** anyone starts building: how many, what exactly, what if, who is allowed. A tester who spots "snacks" and asks "which, how many, any allergies?" prevents defects that would otherwise be found weeks later.

## Technical explanation

Reviewing a requirement, user story or design is **static testing**: you look for defects without running code. Defects found here are usually the cheapest to fix, because nothing has been built on top of the misunderstanding yet.

### What to look for

| Category | Questions to ask | Red-flag words or patterns |
|---|---|---|
| **Ambiguity** | Could two readers interpret this differently? | fast, easy, user-friendly, appropriate, etc., some, usually |
| **Completeness** | What about errors, empty states, limits, permissions, time zones, concurrency? | Only the happy path is described |
| **Consistency** | Does it contradict another story, the UI design or a regulation? | Different names for the same thing |
| **Testability** | Can pass or fail be decided objectively? | No measurable threshold |
| **Assumptions** | What is being taken for granted? | "As usual", "the standard flow" |
| **Boundaries** | Inclusive or exclusive? Which unit? | "Up to", "within", "under" |

### INVEST

User stories are often checked against **INVEST**:

| Letter | Meaning | Tester's angle |
|---|---|---|
| I | Independent | Can it be tested without waiting for another story? |
| N | Negotiable | Is the detail still open for discussion with the team? |
| V | Valuable | Is the user value clear enough to test for? |
| E | Estimable | Are there unknowns that make it impossible to size? |
| S | Small | Is it small enough that its rules and edge cases can be listed? |
| T | Testable | Are there objective acceptance criteria? |

### Acceptance criteria and examples

Good acceptance criteria are **specific, measurable, and expressed through examples**. The Given/When/Then format used in Gherkin is one useful structure, not the only one. **Example mapping** is a short workshop technique, described in the Cucumber documentation, where the team writes the story, its rules, a concrete example for each rule, and open questions on separate cards. Too many rules suggest the story is too big; too many questions suggest it is not ready.

```mermaid
flowchart LR
  S["Story"] --> R1["Rule: lock after 5 failed attempts"]
  S --> R2["Rule: lock lasts 15 minutes"]
  R1 --> E1["Example: 5th wrong password locks account"]
  R1 --> E2["Example: correct password on 4th attempt resets counter"]
  R2 --> E3["Example: login at 15 minutes succeeds"]
  S --> Q["Question: does a password reset unlock immediately?"]
```

## Real-world example

A team received the story: "As a customer, I want my account locked after too many failed logins so that it is protected." A tester reviewed it and asked: how many is too many? Is the count consecutive or per time window? How long is the lock? Is the user told? Does a successful login reset the counter? Can support unlock it? Does a password reset unlock it? Are attempts counted per account or per device?

Each answer became a rule with an example. Two of the questions exposed a conflict with an existing support process, which was resolved before development rather than found during a release. The final acceptance criteria were short, measurable and directly automatable.

## Step-by-step walkthrough

1. **Read for understanding** first; summarise the goal in one sentence.
2. **Highlight vague words** and undefined terms.
3. **List inputs, outputs, states and actors**, then ask what happens at each boundary and error.
4. **Check INVEST**, especially Small and Testable.
5. **Write questions with proposed answers** ("Should the limit be inclusive? I'd suggest 10,485,760 bytes inclusive.") so discussion is quick.
6. **Agree examples** in a three-amigos or example-mapping session.
7. **Update the acceptance criteria** in the story itself, and trace tests to them.

## Code examples

Agreed examples written as Gherkin acceptance criteria:

```gherkin
Feature: Account lockout

  Rule: An account is locked after 5 consecutive failed login attempts

    Scenario: Fifth consecutive failure locks the account
      Given a customer with 4 consecutive failed login attempts
      When they log in with a wrong password
      Then the account is locked
      And they see "Your account is locked. Try again in 15 minutes."

    Scenario: A successful login resets the counter
      Given a customer with 4 consecutive failed login attempts
      When they log in with the correct password
      Then they are logged in
      And their failed-attempt count is 0
```

## Expected output

Once step definitions exist, a Cucumber run reports each scenario separately, so the acceptance criteria double as an executable checklist. A run against an implementation that forgets to reset the counter would show the first scenario passing and the second failing on the last step:

```text
2 scenarios (1 failed, 1 passed)
8 steps (1 failed, 7 passed)
```

## Common mistakes

- **Waiting for the build to start testing.** The cheapest defects are in the text.
- **Accepting vague words** like "fast" or "secure" without numbers or standards.
- **Only reviewing the happy path**; most questions are about errors, limits and permissions.
- **Asking open-ended questions with no proposal**, which slows the conversation.
- **Leaving answers in chat** instead of updating the story.
- **Treating Gherkin as the goal.** The conversation and shared understanding are the goal; the format is a record.

## Troubleshooting

- **Product owner has no time.** Batch questions, propose answers, and bring them to refinement.
- **Answers keep changing.** The story is probably not ready; flag it against the definition of ready.
- **Non-functional needs are missing.** Ask directly about performance, security, accessibility and data retention for every significant story.

## Key takeaways summary

Requirements analysis is the earliest and cheapest testing you can do. Read critically for ambiguity, gaps and testability, check stories against INVEST, and turn rules into concrete examples the whole team agrees on. Clear acceptance criteria make every later test easier to design and automate.
