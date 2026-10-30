---
slug: test-strategy-vs-test-plan
title: Test Strategy versus Test Plan
summary: A test strategy sets the general rules for how an organisation or programme tests; a test plan applies those rules to one project or release. Learn what each contains and how to write a practical plan.
level: beginner
duration: 30
tags: [test-documentation, test-management, istqb, iso-29119]
objectives:
  - Distinguish a test strategy from a test plan by scope, owner and lifespan
  - List the main sections of a test plan aligned with ISO/IEC/IEEE 29119-3
  - Write a one-page test plan outline for a small release
  - Explain how the plan stays useful in agile teams without becoming bureaucracy
prerequisites:
  - SDLC and STLC
  - Risk-based testing
related: [sdlc-and-stlc, risk-based-testing, test-estimation, entry-and-exit-criteria, test-execution-and-closure-reports]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (chapter 5, Managing the Test Activities)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISO/IEC/IEEE 29119-3 Software testing — Test documentation
    url: https://www.iso.org/standard/79429.html
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
interview:
  - q: What is the difference between a test strategy and a test plan?
    a: A test strategy is a high-level, relatively stable description of how testing is done across an organisation or programme — test levels, types, techniques, tools, environments, risk approach and standard criteria. A test plan applies that strategy to a specific project, release or test level. It names the scope, the people, the schedule, the specific risks, the environments and the entry and exit criteria for that piece of work. The strategy changes rarely; a plan is created per project and updated as the project changes.
  - q: What would you put in a test plan for a two-week sprint?
    a: I would keep it short and living — often a page in the team wiki. It covers the stories in scope and anything explicitly out of scope, the key product risks and how we mitigate them, which test types we run (story testing, exploratory sessions, regression, any non-functional checks), environments and test data, who does what, entry criteria such as acceptance criteria being agreed, and the Definition of Done as the exit criteria. Anything already defined in the organisational strategy I reference rather than copy.
  - q: Who owns the test plan and who approves it?
    a: Usually the test manager or test lead writes and owns it, but it is built with input from developers, product owner, operations and business stakeholders, because it contains commitments from all of them. Approval normally comes from the project or product owner and key stakeholders. The point of approval is shared agreement on scope, risk and criteria, not a signature for its own sake.
practice:
  - "Write a one-page test plan outline for adding Apple Pay to an existing checkout. Include scope, out of scope, three product risks, environments, entry criteria and exit criteria."
  - "Take any test plan you have seen and mark which sections really belong in an organisational test strategy instead."
  - "List five assumptions or constraints that could make a test plan fail, and the mitigation for each."
takeaways:
  - The strategy is the general approach; the plan is the specific application to one project, release or level.
  - A plan exists to record agreements on scope, risk, approach, resources, schedule and criteria.
  - ISO/IEC/IEEE 29119-3 offers a reference structure; tailor it rather than filling every heading.
  - Reference the strategy from the plan instead of duplicating it.
  - A plan is a living document; update it when scope, risk or dates change.
quiz:
  - id: strat-plan-q1
    type: single
    topic: test-strategy-vs-test-plan
    difficulty: beginner
    prompt: Which statement best describes a test plan compared with a test strategy?
    options:
      - "It is the organisation-wide approach that rarely changes"
      - "It applies the testing approach to a specific project, release or test level"
      - "It is a list of all test cases with expected results"
      - "It is the report written after testing is complete"
    answer: [1]
    explanation: "A plan is specific: scope, schedule, people and criteria for one piece of work. The organisation-wide, stable approach is the strategy. Test cases and reports are separate work products."
  - id: strat-plan-q2
    type: multiple
    topic: test-strategy-vs-test-plan
    difficulty: intermediate
    prompt: Which items normally belong in a project test plan? Select all that apply.
    options:
      - "Features in scope and explicitly out of scope"
      - "Project-specific product risks"
      - "Detailed step-by-step instructions for every test case"
      - "Entry and exit criteria for the release"
      - "Test schedule and staffing"
    answer: [0, 1, 3, 4]
    explanation: "Scope, risks, criteria, schedule and staffing are core plan content. Step-by-step instructions belong in test case specifications or procedures, not the plan, which would otherwise become unreadable and constantly out of date."
  - id: strat-plan-q3
    type: truefalse
    topic: test-strategy-vs-test-plan
    difficulty: beginner
    prompt: Agile teams do not need any form of test planning because they deliver every sprint.
    options: ["True", "False"]
    answer: [1]
    explanation: "Agile teams still plan testing; they do it in smaller, lighter and more frequent increments (release and iteration planning, story-level test ideas, a shared Definition of Done). The format changes, the need does not."
  - id: strat-plan-q4
    type: scenario
    topic: test-strategy-vs-test-plan
    difficulty: intermediate
    prompt: "Halfway through a release, the business adds a new payment provider. The test plan was approved a month ago. What should the test lead do?"
    options:
      - "Ignore it; the approved plan is fixed"
      - "Test the provider informally without telling anyone"
      - "Update scope, risks, estimates and schedule in the plan and agree the changes with stakeholders"
      - "Refuse the change because it was not in the original plan"
    answer: [2]
    explanation: "A plan is a living agreement. New scope changes risk, effort and possibly dates, so the plan is updated and re-agreed. Silently absorbing the work hides the impact; refusing outright is not the tester's call."
---

## Beginner-friendly explanation

Think about a family that has a **general rule for holidays**: "We always book refundable tickets, keep a first-aid kit, and check visa rules before paying." That rule applies to every trip. Then, for **a specific trip to the mountains in July**, they write a list: who is going, dates, budget, what could go wrong (landslides, closed roads), what to pack, and when to decide whether to cancel.

The general rule is the **test strategy**. The trip-specific list is the **test plan**. The strategy rarely changes. A new plan is written for each trip and updated when something changes, such as a road closing.

## Technical explanation

The ISTQB glossary describes a **test plan** as documentation of the test objectives and the means and schedule for achieving them, organised to coordinate testing activities. A **test strategy** describes the general approach to testing, often for an organisation or a programme of projects. ISO/IEC/IEEE 29119 separates an **organisational test strategy** from **project and level test plans**.

| Aspect | Test strategy | Test plan |
|---|---|---|
| Scope | Organisation, product line or programme | One project, release, sprint or test level |
| Lifespan | Long; reviewed periodically | Project duration; updated as the project changes |
| Typical owner | Head of QA, test manager | Test lead or test manager for the project |
| Content | Test levels and types, techniques, tools, standard criteria, defect process, metrics | Scope, risks, approach for this work, environments, people, schedule, criteria |
| Question answered | "How do we test here, in general?" | "How will we test *this*, by when, with whom?" |

In smaller companies the two are often merged into one document. That is fine, as long as everyone knows which parts are general and which are specific.

### A test plan outline aligned with ISO/IEC/IEEE 29119-3

The standard describes the information a test plan contains rather than a mandatory template. A generic outline that follows its structure:

1. **Context of testing**: project and test sub-processes covered, test items, scope (in and out), assumptions and constraints, stakeholders
2. **Testing communication**: how and when status is shared, with whom
3. **Risk register**: product risks and project risks, with likelihood, impact and mitigation
4. **Test strategy for this plan**: test levels and types, design techniques, deliverables, completion criteria, metrics, test data and environment needs, retesting and regression approach, suspension and resumption criteria, and any deviations from the organisational strategy
5. **Testing activities and estimates**
6. **Staffing**: roles, responsibilities, training needs
7. **Schedule**: milestones and dependencies

## Real-world example

A retail team is adding "buy now, pay later" to its web checkout for one release. The organisational strategy already says: risk-based testing, three environments (dev, QA, staging), Jira for defects, and a standard rule that no open Critical defects may ship.

The test plan for this release is three pages long:

```text
TEST PLAN - Checkout: Pay Later option (Release 4.2)

1. Context
   In scope : Pay Later at checkout (web), order confirmation, refunds to Pay Later
   Out scope: Mobile apps (next release), provider's own onboarding pages
   Test items: checkout-service 4.2.x, web-frontend 4.2.x, provider sandbox
   Assumptions: provider sandbox available from 3 Mar; stable API contract
2. Communication
   Daily status in team stand-up; written progress report every Friday
3. Risks
   PR-1 Wrong amount sent to provider (High)    -> BVA on totals, API checks
   PR-2 Refund not reflected at provider (High)  -> end-to-end refund scenarios
   PJ-1 Sandbox outages delay testing (Medium)   -> mock service for early tests
4. Approach
   Story testing + exploratory charters + regression of existing payment methods
   Techniques: EP/BVA on amounts, state transition on order status
   Suspension: stop if build fails smoke; resume on a green smoke run
5. Activities and estimates   -> see estimation sheet (22 tester-days)
6. Staffing                   -> 2 testers, 1 developer for test data scripts
7. Schedule                   -> test window 3-21 Mar; sign-off 24 Mar
Entry criteria: stories meet Definition of Ready; build deployed to QA; smoke passes
Exit criteria : all High-risk tests executed; no open Critical/High defects;
                remaining defects reviewed and accepted by product owner
```

Notice what it does **not** repeat: the defect workflow, tool choices and environment naming are in the strategy and are only referenced.

## Step-by-step walkthrough

1. **Read the strategy first** so you know what is already decided.
2. **Define scope and out of scope.** Out of scope is as important as in scope: it prevents surprises at sign-off.
3. **Identify product and project risks** with stakeholders and rate them. See [risk-based testing](/learn/manual-testing/risk-based-testing).
4. **Choose the approach** per risk: levels, types and techniques.
5. **Estimate effort** ([test estimation](/learn/manual-testing/test-estimation)) and build the schedule.
6. **Agree [entry and exit criteria](/learn/manual-testing/entry-and-exit-criteria)** and suspension rules.
7. **Review the plan with stakeholders**, then keep it current. Record each significant change and its date.

## Common mistakes

- **Copying a 40-page template** and filling every heading with boilerplate nobody reads.
- **No "out of scope" section**, so stakeholders assume everything was tested.
- **Treating the plan as frozen.** Scope, dates and risks change; a stale plan is worse than none because people trust it.
- **Duplicating the strategy** in every plan, which creates contradictions when one copy is updated.
- **Listing risks without mitigation.** A risk register only helps if each risk drives a test decision.
- **Writing the plan alone.** Commitments about environments, data and dates involve other teams; get their agreement.

## Troubleshooting

- **Nobody reads the plan.** Shorten it, put the scope, risks and criteria on the first page, and link it from the team board.
- **Stakeholders disagree on scope.** Escalate to the product owner with the risk impact of each option written down.
- **Your organisation has no strategy.** Add a short "approach" section to the plan and propose turning it into a shared strategy later.

## Key takeaways summary

The strategy answers "how do we test here?"; the plan answers "how will we test this release, by when and with whom?". Use ISO/IEC/IEEE 29119-3 as a checklist of what a plan should cover, tailor it to your context, and keep it alive as the project changes.
