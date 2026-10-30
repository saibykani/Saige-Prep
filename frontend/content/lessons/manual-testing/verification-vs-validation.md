---
slug: verification-vs-validation
title: Verification versus validation
summary: Verification checks that a product meets its specified requirements; validation checks that it meets real stakeholder needs in its intended environment. Learn the difference and why you need both.
level: beginner
duration: 25
tags: [fundamentals, istqb, quality]
objectives:
  - Define verification and validation using ISTQB terminology
  - Explain why a product can pass verification and still fail validation
  - Classify test activities as primarily verification or validation
  - Show where verification and validation fit in the V-model
prerequisites:
  - What is software testing?
related: [what-is-software-testing, qa-qc-and-testing, static-vs-dynamic-testing, sdlc-and-stlc, acceptance-alpha-beta-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 1.1, What is Testing?)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary of testing terms (verification, validation)
    url: https://glossary.istqb.org/
interview:
  - q: What is the difference between verification and validation?
    a: Verification checks whether the system or work product meets its specified requirements, so it compares the product against the specification. Validation checks whether the system meets the needs of users and other stakeholders in its operational environment. A common short form is that verification asks whether we built the product right and validation asks whether we built the right product.
  - q: Can a product pass verification and still fail validation?
    a: Yes. If the requirements themselves are wrong or incomplete, the product can match them exactly and still not solve the user's problem. That is why validation activities such as user acceptance testing, prototype feedback and beta testing are needed alongside verification.
  - q: Is static testing only verification?
    a: Mostly, but not only. Reviewing a design against a requirement is verification. However, reviewing a requirement or prototype with real users to check that it describes what they actually need is validation, and it can be done without executing any code.
  - q: Give an example of a validation activity in an agile team.
    a: Demonstrating a working increment to the product owner and real users at a sprint review, and adjusting the backlog based on their feedback. It checks the product against actual needs rather than only against the written acceptance criteria.
practice:
  - "For a food delivery app's 'reorder previous meal' feature, write two verification checks and two validation checks."
  - "Describe a product you have used that did exactly what its description promised but still did not meet your needs. Was that a verification or validation failure?"
  - "Classify these: unit test against a specification, beta test with customers, review of a design against the requirements, usability session with real users."
takeaways:
  - Verification checks against specified requirements; validation checks against stakeholder needs in the real environment.
  - A product can be perfectly verified and still fail validation if the requirements are wrong.
  - Both can be static or dynamic; the difference is what you compare against, not how you test.
  - Early validation, such as prototype feedback, prevents building the wrong thing.
  - Acceptance testing is typically the most validation-focused test level.
quiz:
  - id: vv-q1
    type: single
    topic: verification-vs-validation
    difficulty: beginner
    prompt: Which activity is primarily validation?
    options: ["Checking that an API returns the fields listed in its specification", "Watching real users try to complete a purchase and noting where they get stuck", "Reviewing code against the team's coding standard", "Comparing a design document against the requirements document"]
    answer: [1]
    explanation: Observing real users checks whether the product meets their actual needs in a realistic context, which is validation. The other options compare a work product against a specification or standard, which is verification.
  - id: vv-q2
    type: truefalse
    topic: verification-vs-validation
    difficulty: beginner
    prompt: If a system passes every test derived from its requirements, it is guaranteed to meet the users' needs.
    options: ["True", "False"]
    answer: [1]
    explanation: Passing requirement-based tests shows successful verification. If the requirements are wrong or incomplete, users' needs can still be unmet, which only validation would reveal.
  - id: vv-q3
    type: scenario
    topic: verification-vs-validation
    difficulty: intermediate
    prompt: A warehouse scanning app meets every written requirement. On the warehouse floor, staff wear thick gloves and cannot press its small buttons. What happened?
    options: ["A verification failure, because a requirement was not implemented", "A validation failure, because the product does not meet user needs in its operational environment", "A debugging failure, because developers did not fix the defect", "Not a failure, because all requirements passed"]
    answer: [1]
    explanation: Every specified requirement passed, so verification succeeded. The product still fails users in the real environment, which is a validation failure caused by a missing or incomplete requirement.
  - id: vv-q4
    type: multiple
    topic: verification-vs-validation
    difficulty: intermediate
    prompt: Which statements are correct? Select all that apply.
    options: ["Verification can be performed by reviewing documents", "Validation can only be performed after the system is complete", "Prototype feedback sessions with users are a form of validation", "Validation compares the product against stakeholder needs and intended use"]
    answer: [0, 2, 3]
    explanation: Verification often uses reviews, and validation compares against needs and intended use. Validation does not have to wait for a complete system; showing prototypes or mock-ups to users is early validation.
---

## Beginner-friendly explanation

Imagine you hire a builder to make a garden shed and give them a drawing: 2 metres by 3 metres, one door, one window.

- When the shed is finished, you measure it. It is exactly 2 by 3 metres, with one door and one window. It matches the drawing perfectly. That check is **verification**: *did they build it the way the plan said?*
- Then you try to put your lawnmower inside, and it does not fit through the door. The shed matches the plan, but it does not do the job you needed. Discovering that is **validation**: *is this actually what I needed?*

The builder did nothing wrong against the drawing. The drawing was wrong. Good testing checks both: that the product matches the plan, and that the plan, and the product, meet the real need.

## Technical explanation

The ISTQB syllabus states that testing involves both verification and validation. The ISTQB glossary defines:

- **Verification**: confirmation by examination and through provision of objective evidence that specified requirements have been fulfilled.
- **Validation**: confirmation by examination and through provision of objective evidence that the requirements for a specific intended use or application have been fulfilled.

In plain terms, the syllabus describes verification as checking whether the system meets specified requirements, and validation as checking whether the system meets users' and other stakeholders' needs in its operational environment.

| | Verification | Validation |
|---|---|---|
| Compared against | Specifications, requirements, standards | Stakeholder needs and intended use |
| Common short form | "Are we building the product right?" | "Are we building the right product?" |
| Typical static examples | Reviewing design against requirements, code review, static analysis | Reviewing user stories or prototypes with real users |
| Typical dynamic examples | Component, integration and system tests derived from specifications | User acceptance testing, operational acceptance, alpha and beta testing, usability sessions |
| Found problems | Product differs from the specification | Specification, and therefore product, differs from the real need |

Two important points:

1. **Static and dynamic are a separate axis.** Both verification and validation can be done statically (reviews) or dynamically (executing the software). What differs is the reference you compare against.
2. **Most activities lean one way, but the line is not absolute.** A system test can reveal a usability issue (validation), and an acceptance test can be written straight from a specification (verification).

### Verification and validation in the V-model

The V-model pairs each development activity with a test level. The lower levels mostly verify against technical specifications; acceptance testing mostly validates against business and user needs.

```mermaid
flowchart LR
  subgraph Specify
    BR["Business needs and requirements"] --> SR["System requirements"] --> AD["Architecture and design"] --> CD["Component design"]
  end
  subgraph Test
    CT["Component testing"] --> IT["Integration testing"] --> ST["System testing"] --> AT["Acceptance testing"]
  end
  CD --> CT
  CD -. "verifies" .- CT
  AD -. "verifies" .- IT
  SR -. "verifies" .- ST
  BR -. "validates" .- AT
```

See [SDLC and STLC](/learn/manual-testing/sdlc-and-stlc) for how this model compares with iterative and agile approaches.

## Real-world example

A generic scenario: a council commissions an online parking-permit service. The specification says residents can apply by uploading a utility bill as proof of address.

- **Verification** finds that PDF uploads above a certain size are rejected even though the specification allows them. The team fixes the defect. The product now matches the specification.
- **Validation** happens in a pilot with real residents. Many younger residents do not receive paper utility bills; many older residents struggle to scan documents. Both groups abandon the application. The specification was met, but it described the wrong solution. The council adds other proof-of-address options, such as a bank statement or a council tax reference.

Without the pilot, the service would have passed every test and still failed many of the people it was built for.

## Step-by-step walkthrough

For any feature, plan both kinds of checking:

1. **Identify the specification**: requirements, acceptance criteria, API contracts, designs.
2. **Design verification tests** that compare the product against each specified item.
3. **Identify the real stakeholders and their goals**: who uses it, where, under what conditions?
4. **Plan validation activities** early: prototype reviews, demos, usability sessions, pilots, beta releases.
5. **Feed validation findings back into the requirements**, not only into defect reports, so the specification improves.
6. **Report both**: "matches the spec" and "meets the need" are separate claims.

## Common mistakes

- **Assuming that "all requirement tests passed" means "users will be happy".** That is verification only.
- **Leaving validation until the end.** Showing users a prototype early is far cheaper than discovering the wrong product at acceptance.
- **Thinking verification means static and validation means dynamic.** Either can be performed either way.
- **Treating validation findings as "not bugs".** A product that does not meet real needs is a problem even if the specification is satisfied; raise it as a requirements issue.
- **Validating with the wrong people.** Internal staff are not a substitute for real users in their real environment.

## Troubleshooting

- **You cannot get access to real users.** Use the closest available proxies, such as support staff who hear customer complaints or a product owner who has observed users, and record that validation was done with proxies as a limitation.
- **A validation finding is rejected as "not in the requirements".** Raise it as a requirements question rather than a defect, describe the user impact, and let the product owner decide whether to change the requirement.
- **Acceptance criteria are too vague to verify against.** Ask for concrete examples of inputs and expected outcomes during refinement. If they are still missing, write down your assumption in the test case and get it confirmed.

## Key takeaways summary

Verification asks whether the product matches its specification; validation asks whether it meets the real needs of its users and stakeholders where it will actually be used. You need both, because a perfect match to a flawed specification is still a failure. Plan validation early and treat its findings as input to the requirements.
