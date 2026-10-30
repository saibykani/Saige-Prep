---
slug: why-testing-is-required
title: Why testing is required
summary: Software is built by people, and people make mistakes. Learn why testing is necessary, how it contributes to project success, and why finding defects early is cheaper than finding them in production.
level: beginner
duration: 20
tags: [fundamentals, istqb, risk]
objectives:
  - Explain why software contains defects even when built by skilled people
  - Describe the ways testing contributes to the success of a product
  - Explain why defects found early are cheaper to fix than defects found late
  - Connect testing to risk, compliance and stakeholder decisions
prerequisites:
  - What is software testing?
related: [what-is-software-testing, seven-testing-principles, testing-objectives-and-limitations, risk-based-testing, qa-qc-and-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 1.2, Why is Testing Necessary?)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary of testing terms
    url: https://glossary.istqb.org/
interview:
  - q: Why is software testing necessary if developers are skilled?
    a: Skill reduces mistakes but does not eliminate them. Requirements can be ambiguous, systems are complex, deadlines create pressure and integrations behave unexpectedly. Testing is an independent check that finds defects before users do, gives stakeholders evidence about quality and reduces the risk of failures in production.
  - q: Why is it cheaper to find defects early?
    a: A defect introduced in a requirement spreads into the design, code, tests and documentation built on top of it. The later it is found, the more of that work must be redone, re-tested and possibly re-released. Finding it in a review of the requirement means changing one document instead of many artefacts, which is why early testing is one of the seven principles.
  - q: How would you explain the value of testing to a manager who sees it as a cost?
    a: I would frame testing as risk reduction and decision support. It finds defects while they are cheap to fix, it provides evidence for release decisions, it helps meet contractual and regulatory obligations, and it protects the company from the cost of production failures such as incidents, support load, refunds and reputational damage. I would also show what we test and why, so the effort is clearly tied to the highest risks.
practice:
  - "Think of a software failure you have personally experienced, such as a payment that failed or an app that lost data. Describe what harm it caused and which kind of testing might have caught it."
  - "For a hospital appointment-booking app, list three risks that make testing necessary and say who would be harmed if each risk occurred."
  - "Write a short paragraph explaining to a non-technical stakeholder why reviewing requirements is part of testing."
takeaways:
  - People make mistakes, and complex software, time pressure and changing requirements make defects inevitable.
  - Testing finds defects, evaluates quality, supports decisions and helps meet legal and contractual obligations.
  - The later a defect is found, the more rework it causes, so testing starts as early as possible.
  - Testers also represent users' interests by checking needs, not only specifications.
  - Testing reduces risk; it cannot remove it entirely.
quiz:
  - id: wtr-q1
    type: single
    topic: why-testing-is-required
    difficulty: beginner
    prompt: What is the main reason that defects are almost always present in software?
    options: ["Programming languages are unreliable", "Software is built by people, who make errors, often under time pressure and with complex requirements", "Testers do not test enough", "Users use the software incorrectly"]
    answer: [1]
    explanation: Defects originate from human errors, made more likely by complexity, ambiguous requirements and time pressure. Insufficient testing does not create defects; it only lets existing ones go undetected.
  - id: wtr-q2
    type: truefalse
    topic: why-testing-is-required
    difficulty: beginner
    prompt: A defect in a requirement usually becomes more expensive to fix the later it is found.
    options: ["True", "False"]
    answer: [0]
    explanation: Later work products such as designs, code and tests are built on the requirement, so a late fix means changing and re-testing all of them. This is why ISTQB lists early testing as a principle.
  - id: wtr-q3
    type: multiple
    topic: why-testing-is-required
    difficulty: intermediate
    prompt: Which of these are ways testing contributes to the success of a product? Select all that apply.
    options: ["Detecting defects so they can be removed before release", "Providing information for release decisions", "Guaranteeing the product will never fail in production", "Helping meet contractual, legal or regulatory requirements", "Representing users' needs during development"]
    answer: [0, 1, 3, 4]
    explanation: Testing finds defects, informs decisions, supports compliance and represents users. It can never guarantee that no failures will happen in production, because exhaustive testing is impossible.
  - id: wtr-q4
    type: scenario
    topic: why-testing-is-required
    difficulty: intermediate
    prompt: A team must ship a tax-calculation feature by a legal deadline. A manager proposes skipping testing to save two weeks. What is the strongest argument against this?
    options: ["Testing is always required by the ISTQB syllabus", "Incorrect tax calculations carry legal and financial risk, and testing provides evidence that the calculations comply before the deadline", "Developers cannot be trusted", "Testers would otherwise have nothing to do"]
    answer: [1]
    explanation: The strongest argument ties testing to the specific risk and to the need for evidence of compliance. Appeals to a syllabus, distrust of developers or keeping testers busy are not business reasons.
---

## Beginner-friendly explanation

Imagine writing an important email to a hundred customers. You are careful and you know the subject well. Would you still read it once more before pressing Send? Most people would, because everyone makes small slips: a wrong date, a missing word, a link to the wrong page. Once the email is sent, fixing a mistake means a second, embarrassing email to everyone.

Software is the same, only much bigger. A single app can contain thousands of decisions made by dozens of people. Each person can misunderstand something or slip up. Testing is the "read it again before you send it" step, done carefully and systematically, and done as early as possible so mistakes are caught while they are still cheap to fix.

## Technical explanation

### Why defects exist

The ISTQB syllabus explains that people make **errors** (mistakes), which produce **defects** in work products, which may cause **failures** when the software runs. Errors become more likely when there is:

- time pressure,
- complex code, infrastructure or business rules,
- ambiguous or changing requirements,
- unfamiliar technologies or domains,
- misunderstandings between people and teams.

The details of this chain are covered in [error, defect, bug, failure and root cause](/learn/manual-testing/error-defect-bug-failure).

### How testing contributes to success

ISTQB describes testing as a cost-effective way of detecting defects that can then be removed by debugging. Testing contributes by:

| Contribution | What it means in practice |
|---|---|
| Finding defects | Failures and defects are found and fixed before users meet them |
| Evaluating quality | Evidence about how well the product meets requirements and needs |
| Supporting decisions | Information to decide whether to release, delay or reduce scope |
| Representing users | Checking real user needs, since users cannot be involved in every step |
| Meeting obligations | Evidence for contractual, legal or regulatory requirements |

Testing is also closely tied to **risk**: the likelihood of a problem and the impact if it happens. Testing does not remove risk, but it reduces the level of risk of inadequate quality and tells stakeholders what risk remains.

### Why early testing saves money

One of the [seven testing principles](/learn/manual-testing/seven-testing-principles) is that **early testing saves time and money**. A defect in a requirement flows into everything built on it:

```mermaid
flowchart LR
  R["Requirement defect"] --> D["Wrong design"] --> C["Wrong code"] --> T["Tests based on the wrong expectation"] --> P["Failure in production"]
  R -. "found in review: fix one document" .-> F1["Cheap fix"]
  P -. "found by users: fix everything above, re-test, re-release" .-> F2["Expensive fix"]
```

The later the defect is found, the more artefacts must change and the more re-testing is needed. In production there are extra costs: support calls, incident handling, refunds, emergency releases and damage to trust. The syllabus does not give a fixed multiplier, and neither should you; the point is the direction, not a number.

## Real-world example

A generic scenario: a ticketing team builds a feature that lets users transfer tickets to friends. The user story says "a ticket can be transferred to another account".

- In a **story review**, a tester asks whether a ticket can be transferred *after* it has been scanned at the venue. Nobody had considered it. The product owner adds a rule: scanned tickets cannot be transferred. That question cost a few minutes.
- Had the gap been found **in production**, scanned tickets could have been resold and reused, causing entry disputes at the venue, refunds and a hurried fix.

The same defect, the same rule, but very different costs depending on when it was found.

## Step-by-step walkthrough

Use these steps to justify testing for any feature:

1. **Name the stakeholders**: users, the business, operations, regulators.
2. **List what could go wrong** for each: wrong data, lost money, unavailable service, breached law.
3. **Estimate impact and likelihood** in simple terms (high, medium, low).
4. **Map tests to the highest risks** so the effort is clearly justified.
5. **Identify early checks**, such as story reviews, that can find problems before code exists.
6. **Agree what evidence stakeholders need** to make the release decision.

## Common mistakes

- **Saying "testing ensures quality".** Testing measures and reports quality and finds defects; quality is built in by the whole team.
- **Promising zero defects.** Testing reduces risk but cannot prove software is defect-free.
- **Starting testing only when code is ready.** This throws away the cheapest opportunity to find defects.
- **Justifying testing with invented numbers.** Use your own project's data or reason about risk; do not quote unsourced cost multipliers.
- **Testing everything equally.** Without risk-based prioritisation, effort goes to low-impact areas while high-risk ones are under-tested.

## Troubleshooting

- **Stakeholders see testing only as a cost.** Show which risks each test area covers and what the impact would be if those risks occurred. Use your own project's incident and defect history rather than industry numbers you cannot source.
- **You are not invited to early discussions.** Ask to join refinement or design reviews with a concrete offer, such as "I will bring a list of questions and edge cases for each story". Early, useful questions quickly earn a permanent seat.
- **There is not enough time to test everything.** That is expected, because exhaustive testing is impossible. Agree priorities with the product owner based on risk, test the highest risks first and report clearly what was left untested.
- **Defects keep escaping to production in the same area.** Treat it as evidence for more testing focus there, and raise it in a retrospective so the underlying cause, not just each defect, gets fixed.

## Key takeaways summary

Testing is necessary because people make mistakes and software is complex. It finds defects, evaluates quality, informs release decisions, represents users and supports compliance. The earlier testing starts, the less each defect costs to fix, so good testers get involved from the very first requirement.
