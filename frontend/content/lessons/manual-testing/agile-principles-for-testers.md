---
slug: agile-principles-for-testers
title: Agile principles for testers
summary: What the Agile Manifesto's values and principles actually mean for a tester, how the testing mindset changes inside an agile team, and how to add value from the first conversation about a story.
level: beginner
duration: 25
tags: [agile, agile-manifesto, whole-team-quality, collaboration]
objectives:
  - State the four values of the Agile Manifesto and explain what "over" means in them
  - Relate the most testing-relevant agile principles to day-to-day testing work
  - Contrast a phase-based "test at the end" approach with whole-team quality
  - Describe concrete ways a tester contributes before, during and after development of a story
prerequisites:
  - What is software testing
  - SDLC and STLC
related: [scrum-roles-and-ceremonies, acceptance-criteria-dor-dod, shift-left-and-continuous-testing, sdlc-and-stlc]
references:
  - title: Manifesto for Agile Software Development
    url: https://agilemanifesto.org/
  - title: Principles behind the Agile Manifesto
    url: https://agilemanifesto.org/principles.html
  - title: The Scrum Guide
    url: https://www.scrumguides.org/
  - title: ISTQB Certified Tester Foundation Level (CTFL) v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
interview:
  - q: What are the four values of the Agile Manifesto, and does "working software over comprehensive documentation" mean testers should stop writing test documentation?
    a: Individuals and interactions over processes and tools; working software over comprehensive documentation; customer collaboration over contract negotiation; responding to change over following a plan. The manifesto explicitly says there is value in the items on the right, the items on the left are just valued more. So testers still document, but only what earns its keep. Lightweight charters, checklists and acceptance criteria that the team actually uses replace large documents nobody reads. Regulated products may still need formal evidence, and that is a legitimate requirement, not a contradiction.
  - q: How does the role of a tester change in an agile team compared with a waterfall project?
    a: In a phase-based model testing is a stage after development and the tester is often a gatekeeper. In an agile team quality is a whole-team responsibility and testing is continuous. The tester questions stories during refinement, helps write acceptance criteria and examples, pairs with developers, tests each story as soon as it is ready, explores risk areas, and helps the team automate checks. The tester becomes a quality coach and risk analyst rather than the only person who finds bugs at the end.
  - q: Which agile principle do you find most relevant to testing, and why?
    a: A good answer picks one and connects it to practice. For example, "Working software is the primary measure of progress" means a story is not done because the code is written; it is done when it is tested and meets the Definition of Done. Or "Continuous attention to technical excellence and good design enhances agility", which justifies investing in fast automated regression checks so the team can change code safely every Sprint.
  - q: Your team says "we are agile, so we don't need test planning." How do you respond?
    a: Agile changes the shape of planning, not the need for it. I would propose lightweight planning at the right level, a short test strategy for the product, risk discussion during refinement, acceptance criteria and test ideas per story in Sprint Planning, and an exploratory charter for risky features. Responding to change over following a plan still values a plan; it just stays adaptable.
practice:
  - "Take the four Agile Manifesto values and, for each one, write one testing habit that honours it and one anti-pattern that violates it."
  - "Pick a user story from any product you use (for example, 'save a card for faster checkout'). List five questions a tester should ask during refinement before any code is written."
  - "Your team finishes development on day 9 of a 10-day Sprint and hands everything to you. Write a short proposal to the team for how to spread testing across the Sprint instead."
takeaways:
  - The Agile Manifesto has four values and twelve principles; the right-hand items still have value, the left-hand ones are valued more.
  - Quality is a whole-team responsibility; testers contribute most by preventing defects, not just finding them.
  - Testing happens continuously inside the iteration, starting with questions during refinement.
  - Documentation is kept lean and useful rather than eliminated.
  - Fast feedback, through early conversations and automated regression checks, is what lets agile teams change software safely.
quiz:
  - id: agileprin-q1
    type: single
    topic: agile-principles-for-testers
    difficulty: beginner
    prompt: Which of these is one of the four values of the Agile Manifesto?
    options: ["Working software over comprehensive documentation", "Automated tests over manual tests", "Speed over quality", "Developers over testers"]
    answer: [0]
    explanation: The four values are individuals and interactions over processes and tools, working software over comprehensive documentation, customer collaboration over contract negotiation, and responding to change over following a plan. The other options are not in the manifesto, and "speed over quality" contradicts its principle of continuous attention to technical excellence.
  - id: agileprin-q2
    type: truefalse
    topic: agile-principles-for-testers
    difficulty: beginner
    prompt: According to the Agile Manifesto, the items on the right (processes, documentation, contracts, plans) have no value.
    options: ["True", "False"]
    answer: [1]
    explanation: False. The manifesto states that while there is value in the items on the right, the items on the left are valued more. It is a statement of priority, not a rejection of documentation or planning.
  - id: agileprin-q3
    type: scenario
    topic: agile-principles-for-testers
    difficulty: intermediate
    prompt: In a two-week iteration, developers routinely finish coding on the last two days and testers find many defects that roll into the next iteration. Which change best reflects agile principles?
    options: ["Add a separate testing iteration after every development iteration", "Ask testers to work overtime at the end of each iteration", "Slice stories smaller, test each story as soon as it is ready, and involve testers in refinement", "Stop testing stories that are low priority"]
    answer: [2]
    explanation: Smaller stories that flow through development and testing continuously, with testers shaping them early, deliver working software frequently and sustainably. A separate testing iteration recreates a mini-waterfall, and overtime breaks the principle of a sustainable pace.
  - id: agileprin-q4
    type: multiple
    topic: agile-principles-for-testers
    difficulty: intermediate
    prompt: Which activities show a tester applying the whole-team approach? Select all that apply.
    options: ["Asking about edge cases during backlog refinement", "Pairing with a developer to review unit test coverage of a risky rule", "Waiting until all stories are complete before starting to test", "Helping the Product Owner express acceptance criteria as concrete examples", "Logging defects only through a formal ticket rather than talking to the developer"]
    answer: [0, 1, 3]
    explanation: Questioning stories early, pairing, and turning acceptance criteria into examples all spread quality work across the team. Waiting until everything is complete delays feedback, and avoiding direct conversation goes against individuals and interactions over processes and tools (a ticket can still be raised, but not instead of talking).
---

## Beginner-friendly explanation

Think about two ways to cook a big family meal. In the first, one person cooks every dish alone, and only when everything is plated does someone else taste it. If the soup is too salty, it is too late; the whole meal is already on the table. In the second, the cooks taste as they go, ask the family what they want before starting, and adjust the recipe as they learn.

Agile software development is the second kitchen. Instead of building everything and testing at the end, a team builds small pieces, checks them constantly, and adjusts based on feedback. For a tester this is a big shift. You are no longer the person who tastes the finished meal; you are one of the cooks, tasting and asking questions all the way through.

## Technical explanation

The [Agile Manifesto](https://agilemanifesto.org/) (2001) contains four values:

| Valued more | Over | Valued less (but still valued) |
|---|---|---|
| Individuals and interactions | over | Processes and tools |
| Working software | over | Comprehensive documentation |
| Customer collaboration | over | Contract negotiation |
| Responding to change | over | Following a plan |

The closing line matters: *while there is value in the items on the right, we value the items on the left more.* Agile is a statement of priorities, not an excuse to drop documentation, process or planning.

The manifesto is backed by twelve principles. Several have direct consequences for testing:

| Principle (paraphrased closely) | What it means for testers |
|---|---|
| Satisfy the customer through early and continuous delivery of valuable software | Test in small increments so each one can be shipped with confidence |
| Welcome changing requirements, even late in development | Keep test assets easy to change; prefer examples and checklists over brittle scripts |
| Deliver working software frequently | Regression risk grows with every release, so fast, repeatable checks are essential |
| Business people and developers must work together daily | Testers bridge business language and technical detail, often by turning rules into examples |
| Working software is the primary measure of progress | "Code complete" is not done; tested and accepted is |
| Continuous attention to technical excellence and good design enhances agility | Invest in testability, automation and clean test design |
| At regular intervals, the team reflects and adjusts | Bring quality data (escaped defects, flaky tests) to retrospectives |

### Whole-team quality

In a phase-based model, testing is a stage and the test team is a gate. In an agile team, **quality is everyone's responsibility**. Developers write unit tests, the Product Owner clarifies what "right" means, and testers bring a risk-focused, questioning mindset to every stage. Scrum, the most common agile framework, does not even have a "tester" accountability; people who test are among the **Developers** (see [Scrum roles and ceremonies](/learn/manual-testing/scrum-roles-and-ceremonies)).

```mermaid
flowchart LR
  R[Refinement: question the story] --> P[Planning: agree examples and test ideas]
  P --> D[Development: pair, review, test early builds]
  D --> T[Story testing and exploration]
  T --> F[Feedback in review and retrospective]
  F --> R
```

## Real-world example

A team building a loyalty-points feature worked in two-week Sprints. Historically, developers merged everything in the final days, the tester found a pile of defects, and half the stories slipped.

The team changed three things. First, the tester joined refinement and asked questions such as "what happens to points when an order is partially refunded?" That question alone produced two new acceptance criteria. Second, stories were sliced smaller, so the first one was ready for testing on day three rather than day nine. Third, the tester and a developer paired to automate the points calculation checks at the API level, leaving the tester free to explore the user journey.

Nothing about this required new tools. It was the agile principles applied: earlier collaboration, smaller increments, and attention to technical excellence.

## Step-by-step walkthrough

How a tester adds value across one story's life:

1. **Before the Sprint (refinement):** read the story, ask about rules, edge cases, error states, permissions and data. Suggest splitting stories that are too large to test in a few days.
2. **Sprint Planning:** help turn acceptance criteria into concrete examples and agree what will be automated and what will be explored.
3. **During development:** review unit and API tests with developers, test early builds or feature branches, and give feedback within hours rather than days.
4. **Story testing:** verify the acceptance criteria, then run a short exploratory session on the risks you noted.
5. **Done:** confirm the story meets the team's Definition of Done, including regression checks.
6. **Sprint Review and Retrospective:** share what you learned about quality, such as recurring defect types, and propose improvements.

## Common mistakes

- **Treating agile as "no documentation".** Keep what helps the team: acceptance criteria, charters, risk notes. Drop what nobody reads.
- **Mini-waterfall inside the Sprint.** Coding for nine days and testing on the tenth gives the worst of both worlds.
- **Testers as the only quality gate.** If only the tester cares about quality, defects are found late and expensively.
- **Skipping regression because "it's only a small change".** Frequent delivery makes regression risk constant, not occasional.
- **Silent testers in refinement.** The cheapest defect is the one prevented by a question before coding starts.
- **Confusing agile with a specific framework.** Agile is the values and principles; Scrum and Kanban are ways of applying them.

## Troubleshooting

- **The team won't involve you early.** Offer something concrete: "Give me ten minutes per story in refinement and I will bring three edge cases." Results build the habit.
- **Requirements change mid-Sprint.** Talk to the Product Owner about impact, update the examples, and make the change visible rather than silently retesting.
- **Too much manual regression each Sprint.** Raise it in the retrospective with data (hours spent, defects escaped) and agree an automation plan with the developers.

## Key takeaways summary

Agile asks testers to move from checking at the end to collaborating throughout. Learn the four values and the principles that shape testing, ask questions early, test in small increments, and help the whole team own quality.
