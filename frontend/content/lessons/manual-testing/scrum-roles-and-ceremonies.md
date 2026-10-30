---
slug: scrum-roles-and-ceremonies
title: Scrum roles and ceremonies
summary: The three Scrum accountabilities, the five events, the three artifacts and their commitments, as defined in the 2020 Scrum Guide, and exactly where testing fits into each of them.
level: beginner
duration: 30
tags: [agile, scrum, scrum-guide, ceremonies]
objectives:
  - Name the three Scrum accountabilities and what each is accountable for
  - Describe the five Scrum events, their purpose and their maximum timeboxes
  - Explain the three artifacts and their commitments (Product Goal, Sprint Goal, Definition of Done)
  - Describe how a tester contributes to each event as one of the Developers
prerequisites:
  - Agile principles for testers
related: [agile-principles-for-testers, acceptance-criteria-dor-dod, release-readiness, jira-workflows-and-test-management-tools]
references:
  - title: The Scrum Guide (2020)
    url: https://www.scrumguides.org/scrum-guide.html
  - title: Scrum Guides home
    url: https://www.scrumguides.org/
  - title: Manifesto for Agile Software Development
    url: https://agilemanifesto.org/
interview:
  - q: What are the roles in Scrum, and where does a tester fit?
    a: The 2020 Scrum Guide calls them accountabilities. There are three - the Product Owner, accountable for maximising the value of the product and for effective Product Backlog management; the Scrum Master, accountable for establishing Scrum and for the Scrum Team's effectiveness; and the Developers, the people committed to creating a usable Increment each Sprint. There is no separate tester accountability. A tester is one of the Developers, sharing accountability for quality and for meeting the Definition of Done.
  - q: Walk me through the Scrum events and what a tester does in each.
    a: The Sprint is the container event of one month or less. In Sprint Planning I help the team understand what can be done and how, raising test effort, environment and data needs, and turning acceptance criteria into examples. In the Daily Scrum I report progress toward the Sprint Goal and blockers, such as a broken test environment. In the Sprint Review I help show the working Increment and listen to stakeholder feedback that might become new tests or backlog items. In the Sprint Retrospective I bring quality observations such as escaped defects or flaky checks and help agree improvements. Backlog refinement is an ongoing activity, not an event, and it is where I ask most of my edge-case questions.
  - q: Is the Definition of Ready part of Scrum?
    a: No. The Scrum Guide defines the Definition of Done as the commitment for the Increment, but the Definition of Ready is a practice some teams add on top. The Guide only says that Product Backlog items that can be done within one Sprint are deemed ready for selection in Sprint Planning. A team can use a Definition of Ready, but it should not become a gate that blocks collaboration.
  - q: Who decides whether a story is "done" in Scrum?
    a: The Definition of Done decides. When a Product Backlog item meets it, an Increment is born. If an item does not meet the Definition of Done it cannot be released or even presented at the Sprint Review; it returns to the Product Backlog. The Developers are required to conform to it, and testers help make the quality criteria in it explicit and verifiable.
practice:
  - "Draw a timeline of a two-week Sprint and mark each Scrum event on it. Next to each, write one thing a tester contributes."
  - "List three things that would make a story untestable in the current Sprint and decide which event or activity should surface each one."
  - "Write five quality-related items you would propose for a team's Definition of Done and explain how each is verified."
takeaways:
  - Scrum has three accountabilities, the Product Owner, the Scrum Master and the Developers; testers are Developers.
  - The five events are the Sprint, Sprint Planning, the Daily Scrum, the Sprint Review and the Sprint Retrospective.
  - Product Backlog refinement is an ongoing activity, not an event.
  - Each artifact has a commitment - Product Goal, Sprint Goal and Definition of Done.
  - Work that does not meet the Definition of Done is not part of the Increment and returns to the Product Backlog.
quiz:
  - id: scrumroles-q1
    type: single
    topic: scrum-roles-and-ceremonies
    difficulty: beginner
    prompt: According to the 2020 Scrum Guide, which accountabilities make up a Scrum Team?
    options: ["Product Owner, Scrum Master, Developers", "Product Owner, Scrum Master, Testers, Developers", "Project Manager, Scrum Master, Team", "Product Owner, Tech Lead, QA Lead"]
    answer: [0]
    explanation: The Scrum Team consists of one Scrum Master, one Product Owner and Developers. There is no separate tester or QA accountability; people who test are Developers. Project Manager and Tech Lead are not Scrum accountabilities.
  - id: scrumroles-q2
    type: truefalse
    topic: scrum-roles-and-ceremonies
    difficulty: beginner
    prompt: Product Backlog refinement is one of the five formal Scrum events.
    options: ["True", "False"]
    answer: [1]
    explanation: False. The five events are the Sprint, Sprint Planning, the Daily Scrum, the Sprint Review and the Sprint Retrospective. The Scrum Guide describes refinement as an ongoing activity that adds detail, such as descriptions, order and size, to Product Backlog items.
  - id: scrumroles-q3
    type: single
    topic: scrum-roles-and-ceremonies
    difficulty: intermediate
    prompt: What is the commitment associated with the Increment in the 2020 Scrum Guide?
    options: ["The Sprint Goal", "The Product Goal", "The Definition of Done", "The Definition of Ready"]
    answer: [2]
    explanation: Each artifact has a commitment - the Product Backlog has the Product Goal, the Sprint Backlog has the Sprint Goal, and the Increment has the Definition of Done. The Definition of Ready is not part of the Scrum Guide at all.
  - id: scrumroles-q4
    type: scenario
    topic: scrum-roles-and-ceremonies
    difficulty: intermediate
    prompt: On the last day of the Sprint a story is coded but two of its Definition of Done checks (regression run and accessibility check) have not been done. The Product Owner wants to show it at the Sprint Review anyway. What does the Scrum Guide say?
    options: ["Show it, because it is coded", "Show it, but label it as 90 percent done", "It cannot be presented as part of the Increment; it returns to the Product Backlog", "Extend the Sprint by two days to finish it"]
    answer: [2]
    explanation: Work that does not meet the Definition of Done cannot be released or presented at the Sprint Review; it returns to the Product Backlog for future consideration. Partially done work is not an Increment, and Sprints are not extended to fit work in.
---

## Beginner-friendly explanation

Imagine a small restaurant kitchen that plans one menu every two weeks. One person decides what dishes are worth cooking for the guests (that is the **Product Owner**). One person makes sure the kitchen works well together and removes obstacles, like a broken oven (that is the **Scrum Master**). Everyone who actually cooks, plates and tastes the food is a **Developer**, and that includes the person who tastes every dish.

Every two weeks they meet to choose dishes, huddle briefly every morning, show the finished dishes to guests for feedback, and then talk honestly about how to work better. Those meetings are the Scrum **events**. People often call them "ceremonies", but the Scrum Guide's word is *events*.

## Technical explanation

Scrum is a lightweight framework defined by the [Scrum Guide](https://www.scrumguides.org/scrum-guide.html), most recently updated in 2020. It rests on three pillars, **transparency, inspection and adaptation**, and five values: commitment, focus, openness, respect and courage.

### Accountabilities

| Accountability | Accountable for | Tester's relationship |
|---|---|---|
| Product Owner | Maximising the value of the product; effective Product Backlog management, including the Product Goal and ordering of items | Clarify rules and acceptance criteria with them; flag risk that affects value |
| Scrum Master | Establishing Scrum as defined in the Guide; the Scrum Team's effectiveness | Raise impediments, such as unstable environments, that block quality work |
| Developers | Creating any aspect of a usable Increment each Sprint; the Sprint Backlog; instilling quality by adhering to the Definition of Done | A tester **is** a Developer and shares this accountability |

A Scrum Team is typically 10 or fewer people, with no sub-teams or hierarchies.

### Events and maximum timeboxes

| Event | Purpose | Max timebox (one-month Sprint) |
|---|---|---|
| Sprint | Container for all other events; fixed length of one month or less | One month |
| Sprint Planning | Answer why this Sprint is valuable (Sprint Goal), what can be Done, and how the work will get done | 8 hours |
| Daily Scrum | Developers inspect progress toward the Sprint Goal and adapt the plan | 15 minutes |
| Sprint Review | Inspect the outcome of the Sprint with stakeholders and determine future adaptations | 4 hours |
| Sprint Retrospective | Plan ways to increase quality and effectiveness | 3 hours |

For shorter Sprints the events are usually shorter. **Product Backlog refinement** is an *ongoing activity*, not an event: breaking items down and adding detail such as description, order and size.

### Artifacts and commitments

| Artifact | Commitment |
|---|---|
| Product Backlog | Product Goal |
| Sprint Backlog | Sprint Goal |
| Increment | Definition of Done |

The Definition of Done is a formal description of the state of the Increment when it meets the quality measures required for the product. If an item does not meet it, it cannot be released or presented at the Sprint Review.

```mermaid
flowchart LR
  PB[Product Backlog] --> SP[Sprint Planning]
  SP --> SB[Sprint Backlog]
  SB --> DS[Daily Scrum, every day]
  DS --> INC[Increment meeting the Definition of Done]
  INC --> SR[Sprint Review]
  SR --> RE[Sprint Retrospective]
  RE --> PB
  REF[Refinement, ongoing] -.-> PB
```

## Real-world example

A team building an appointment-booking app runs two-week Sprints. Here is how the team's tester spends one Sprint:

- **Refinement (ongoing):** asks what happens when two people book the same slot at the same moment, and whether cancellations within one hour are allowed. Both answers become acceptance criteria.
- **Sprint Planning:** points out that the reminder-SMS story needs a test phone number in the staging environment; the team adds a task for it to the Sprint Backlog.
- **Daily Scrum:** "Booking story is tested and meets the acceptance criteria. Cancellation is blocked because staging has no test data; I'm pairing with the developer this morning to seed it."
- **Sprint Review:** demonstrates the double-booking prevention. A stakeholder asks about time zones for remote clinics, which becomes a new backlog item.
- **Retrospective:** shows that three defects this Sprint came from missing time-zone handling and proposes adding a time-zone check to the team's test checklist.

## Step-by-step walkthrough

1. **Know the Sprint Goal.** Test effort should protect the goal first.
2. **Bring test considerations to planning**: environments, data, devices, integrations, and work that should be automated.
3. **Make testing visible** in the Sprint Backlog as tasks or as part of each item's workflow, so progress at the Daily Scrum is honest.
4. **Test continuously**, story by story, rather than in a block at the end.
5. **Check every item against the Definition of Done** before calling it done.
6. **Feed learning back** at the Sprint Review (new risks from stakeholders) and the Retrospective (process improvements).

## Common mistakes

- **Inventing a "QA" accountability.** Testers are Developers; separating them recreates hand-offs.
- **Treating the Daily Scrum as a status report to a manager.** It is for the Developers to adapt their plan.
- **Calling refinement an event.** It is an ongoing activity; teams schedule it however suits them.
- **Presenting undone work at the Sprint Review.** Undone work returns to the Product Backlog.
- **Claiming the Definition of Ready is part of Scrum.** It is an optional team practice.
- **Extending the Sprint to finish testing.** The Sprint length is fixed; a recurring overrun is a retrospective topic.

## Troubleshooting

- **Testing always finishes after the Sprint.** Slice stories smaller, limit work in progress, and make testing part of the Definition of Done.
- **Stakeholders skip the Sprint Review.** Show working software on real scenarios rather than slides, so the session is worth attending.
- **Retrospectives produce no change.** Pick one improvement, put it in the next Sprint Backlog, and check it next time.

## Key takeaways summary

Learn the Scrum Guide's own words: three accountabilities, five events, three artifacts with their commitments. A tester is a Developer who brings risk thinking to every event and holds the team to its Definition of Done.
