---
slug: functional-vs-non-functional-testing
title: Functional versus Non-Functional Testing
summary: Functional testing checks what a system does; non-functional testing checks how well it does it. Learn the ISTQB test types, the ISO/IEC 25010 quality characteristics, and how to write measurable non-functional requirements.
level: beginner
duration: 30
tags: [test-types, functional-testing, non-functional-testing, istqb, quality-characteristics]
objectives:
  - Distinguish functional testing from non-functional testing with examples
  - Name the quality characteristics used to organise non-functional testing
  - Explain functional completeness, correctness and appropriateness
  - Rewrite a vague non-functional requirement into a measurable, testable one
prerequisites:
  - What is software testing
  - System and end-to-end testing
related: [system-and-end-to-end-testing, performance-testing-types, security-testing-fundamentals, accessibility-testing-fundamentals, compatibility-and-installation-testing, recovery-reliability-availability-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 2.2.2, Test types)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISO/IEC 25010 Systems and software quality models
    url: https://www.iso.org/standard/35733.html
  - title: W3C Web Content Accessibility Guidelines (WCAG) overview
    url: https://www.w3.org/WAI/standards-guidelines/wcag/
  - title: OWASP Top Ten
    url: https://owasp.org/www-project-top-ten/
interview:
  - q: What is the difference between functional and non-functional testing?
    a: Functional testing evaluates the functions a system should perform, what it does, against functional requirements, for example that a transfer moves the right amount between the right accounts. Non-functional testing evaluates attributes other than functional characteristics, how well the system behaves, such as performance efficiency, usability, security, reliability, compatibility, maintainability and portability. Both can be done at every test level.
  - q: Can non-functional testing be done before system testing?
    a: Yes, and ISTQB encourages it. Some non-functional checks are cheap early, for example measuring the response time of one service, running static analysis for maintainability, or checking accessibility of a component library. Leaving everything non-functional until the end makes problems expensive because they are often architectural.
  - q: How do you test a requirement like "the system must be fast"?
    a: I cannot, as written, so the first step is to make it measurable with stakeholders. For example, "95% of product searches return results within 2 seconds with 500 concurrent users on the production-sized dataset". That gives a metric, a threshold, a load condition and an environment, which I can then test and report against.
practice:
  - "Classify 15 requirements from a real or sample project as functional or non-functional, and name the quality characteristic for each non-functional one."
  - "Rewrite these as measurable requirements: 'easy to use', 'secure login', 'works on all phones'."
  - "Pick a login page and list three functional tests and five non-functional tests covering at least four quality characteristics."
takeaways:
  - Functional testing checks what the system does; non-functional testing checks how well it does it.
  - ISTQB CTFL v4.0 groups non-functional testing by quality characteristics such as performance efficiency, compatibility, usability, reliability, security, maintainability and portability.
  - Both test types apply at every test level, not only system testing.
  - Non-functional requirements must be measurable before they can be tested.
  - Non-functional defects are often architectural, so start checking them early.
quiz:
  - id: funcnf-q1
    type: single
    topic: functional-vs-non-functional-testing
    difficulty: beginner
    prompt: Which of these is a functional test?
    options: ["Checking that a password reset email contains a working one-time link", "Checking the reset page loads within 2 seconds under load", "Checking the reset page works with a screen reader", "Checking the reset link cannot be reused by an attacker after it expires"]
    answer: [0]
    explanation: Whether the email contains a working link is about what the system does. Load time is performance efficiency, screen reader support is usability or accessibility, and link reuse after expiry is a security check, so they are non-functional.
  - id: funcnf-q2
    type: multiple
    topic: functional-vs-non-functional-testing
    difficulty: intermediate
    prompt: Which are quality characteristics that non-functional testing evaluates, as listed in ISTQB CTFL v4.0? Select all that apply.
    options: ["Performance efficiency", "Compatibility", "Traceability", "Reliability", "Portability"]
    answer: [0, 1, 3, 4]
    explanation: The syllabus lists performance efficiency, compatibility, usability, reliability, security, maintainability and portability. Traceability is a test management property linking tests to the test basis, not a quality characteristic of the product.
  - id: funcnf-q3
    type: truefalse
    topic: functional-vs-non-functional-testing
    difficulty: beginner
    prompt: Non-functional testing can only be performed at the system test level.
    options: ["True", "False"]
    answer: [1]
    explanation: Test types are independent of test levels. Performance of a single component, maintainability through static analysis, or security of an API can all be tested early.
  - id: funcnf-q4
    type: scenario
    topic: functional-vs-non-functional-testing
    difficulty: intermediate
    prompt: A requirement says "Reports must load quickly." What should the tester do first?
    options: ["Run a load test with default settings and report the average", "Ask stakeholders to agree a measurable target, such as a percentile response time under a defined load", "Mark the requirement as untestable and skip it", "Test it functionally by checking the report data is correct"]
    answer: [1]
    explanation: The word "quickly" has no pass/fail threshold. Agreeing a metric, threshold and conditions makes it testable. Running a test first produces numbers nobody can judge, and checking data correctness tests a different, functional requirement.
---

## Beginner-friendly explanation

Imagine reviewing a new coffee machine. First you check: does it make an espresso when you press "espresso"? Does the milk button froth milk? Does it refuse to start when the water tank is empty? Those checks are about **what** the machine does.

Then you ask different questions. How long does it take to make a cup? Is it loud? Can someone with poor eyesight read the buttons? Does it still work after a thousand cups? Will it fit and run with the power socket in your country? Those are about **how well** it does its job.

That is the difference between **functional testing** (what) and **non-functional testing** (how well). A product can do every function correctly and still fail its users because it is slow, confusing, insecure or unreliable.

## Technical explanation

ISTQB CTFL v4.0 describes four test types: functional, non-functional, black-box and white-box testing. This lesson covers the first two.

### Functional testing

Functional testing evaluates the functions a component or system should perform. Its main objective is checking **functional completeness** (all required functions exist), **functional correctness** (they give correct results) and **functional appropriateness** (they help users achieve their tasks). The test basis is typically requirements, user stories, use cases and business rules. Techniques like [equivalence partitioning](/learn/manual-testing/equivalence-partitioning) and decision tables are used heavily here.

### Non-functional testing

Non-functional testing evaluates attributes other than functional characteristics. CTFL v4.0 organises it by the product quality characteristics of ISO/IEC 25010:

| Quality characteristic | What you check | Example test |
|---|---|---|
| Performance efficiency | Time behaviour, resource use, capacity | Search returns in under 2 s at 500 concurrent users |
| Compatibility | Co-existence and interoperability | App runs alongside antivirus software; exports open in the partner's system |
| Usability | Learnability, operability, accessibility, error protection | New users complete sign-up unaided; screen reader announces form errors |
| Reliability | Maturity, availability, fault tolerance, recoverability | Service recovers within 5 minutes after a database failover |
| Security | Confidentiality, integrity, authenticity, accountability | Users cannot see other users' orders by changing an id |
| Maintainability | Modularity, analysability, modifiability, testability | Static analysis finds no critical code smells in changed modules |
| Portability | Adaptability, installability, replaceability | Installer works on all supported OS versions |

The 2023 revision of ISO/IEC 25010 renames and extends some of these (for example adding safety), so check which version your organisation follows.

```mermaid
flowchart TB
  R["Requirement"] --> Q{"Does it describe what the system does, or how well?"}
  Q -->|What it does| F["Functional test"]
  Q -->|How well| N["Non-functional test"]
  N --> M{"Is it measurable?"}
  M -->|No| C["Clarify metric, threshold and conditions"]
  M -->|Yes| T["Design test and environment"]
```

### Test types are independent of test levels

Both types apply at every level. A developer can measure a function's execution time in a component test; operations can check recoverability during operational acceptance testing. Non-functional testing sometimes needs a very specific environment, such as a usability lab or a production-sized performance environment.

## Real-world example

A team built an online exam platform. All functional tests passed: students could log in, answer questions and submit. On the first real exam morning, thousands of students logged in within the same few minutes, and pages took over 30 seconds to load. Some students' answers timed out on submit.

The requirement had said "the platform must handle exam traffic", with no number. A performance test with a realistic peak was never run because nobody could say what "handle" meant. After the incident the team agreed measurable targets, built a load test modelled on the exam-start spike, and ran it before every release.

## Step-by-step walkthrough

1. **Sort requirements** into functional and non-functional. Many stories hide non-functional expectations, such as "users can quickly find…".
2. **Map each non-functional requirement to a quality characteristic** so nothing important (security, accessibility, recoverability) is forgotten.
3. **Make it measurable**: metric, threshold, conditions, environment. For example, "p95 under 2 s, 500 users, production-sized data".
4. **Choose techniques and tools**: black-box techniques for functional; load tools, accessibility checkers, security scanners or usability sessions for non-functional.
5. **Plan the environment.** Non-functional results are only meaningful in a representative environment.
6. **Execute, measure and compare** to thresholds, and report results with the conditions under which they were measured.

## Common mistakes

- **Treating non-functional testing as optional extras** done "if there is time" at the end.
- **Accepting unmeasurable requirements** like "fast", "secure" or "user-friendly".
- **Classifying by tool rather than by intent.** An automated UI script can be a functional test; a manual usability session is non-functional.
- **Measuring in an unrepresentative environment** and presenting the numbers as if they apply to production.
- **Ignoring accessibility**, which is both a usability characteristic and, in many jurisdictions, a legal obligation.

## Troubleshooting

- **Stakeholders cannot give a number.** Offer options based on current behaviour or user expectations and let them choose; record the agreed value.
- **Results vary widely between runs.** Check environment noise, test data and warm-up; repeat runs and report percentiles, not single values.
- **A non-functional defect needs redesign.** Raise it as early as possible with evidence; this is why early non-functional checks matter.

## Key takeaways summary

Functional testing asks "does it do the right thing?"; non-functional testing asks "does it do it well enough?" Use quality characteristics as a checklist, make every non-functional requirement measurable, and test both types at every level rather than leaving the "how well" questions until the end.
