---
slug: risk-based-testing
title: Risk-Based Testing
summary: Risk-based testing uses product risk analysis to decide what to test, how deeply and in what order. Learn ISTQB risk terminology, how to assess likelihood and impact, and how risk levels drive test scope, techniques, effort and reporting.
level: intermediate
duration: 35
tags: [test-management, risk-based-testing, prioritisation, istqb]
objectives:
  - Define risk, risk level, product risk and project risk using ISTQB terminology
  - Perform a simple product risk analysis using likelihood and impact
  - Use risk levels to choose test scope, depth, techniques and execution order
  - Monitor and report residual risk to support release decisions
prerequisites:
  - What is software testing
  - Test strategy versus test plan (helpful)
related: [risk-based-scenario-selection, regression-testing, test-strategy-vs-test-plan, test-estimation, release-readiness, exploratory-and-ad-hoc-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.2, Risk management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB official site and glossary
    url: https://www.istqb.org/
  - title: OWASP Top Ten (security risk categories)
    url: https://owasp.org/www-project-top-ten/
interview:
  - q: What is risk-based testing?
    a: It is an approach where test activities are selected, prioritised and managed based on risk analysis and risk control. We identify product risks, assess each by likelihood and impact to get a risk level, and then let that level decide how much testing each area gets, which techniques and test levels we use, and in what order we execute. Throughout the project we monitor the risks and report the residual risk, so stakeholders can make informed release decisions.
  - q: What is the difference between product risk and project risk?
    a: Product risks relate to the quality of the product itself, such as wrong calculations, poor performance, security vulnerabilities or a confusing interface, and testing directly mitigates them. Project risks relate to managing and controlling the project, such as late deliveries, staff shortages, unstable environments or tool problems. Project risks affect schedule, budget and scope, and are handled with management actions rather than by more testing.
  - q: How do you get a meaningful risk assessment rather than everyone rating everything high?
    a: I involve a mix of stakeholders, including business, developers, support and operations, and agree scales with concrete descriptions, for example what 'high impact' means in money, customers or regulatory terms. I assess likelihood and impact separately, using evidence such as defect history, complexity, change size and usage data. I also force ranking where needed, since if everything is critical nothing is. Then I revisit the assessment as we learn.
practice:
  - "List eight product risks for a hotel booking website, rate likelihood and impact on a 1 to 3 scale, and sort them by risk level."
  - "For the top three risks from your list, describe the test levels, test types and techniques you would use, and the extent of testing."
  - "Write a three-sentence residual risk statement for a release where two medium risks were only partially tested."
takeaways:
  - Risk is defined by likelihood and impact; together they give the risk level.
  - Product risks are about the product's quality; project risks are about managing the project.
  - Product risk analysis has two parts, identification and assessment; risk control has two, mitigation and monitoring.
  - Risk levels drive scope, depth, techniques, test levels, effort and execution order.
  - Report residual risk, not just pass counts, so release decisions are informed.
quiz:
  - id: riskbt-q1
    type: single
    topic: risk-based-testing
    difficulty: beginner
    prompt: In ISTQB terminology, which two factors determine the risk level?
    options: ["Severity and priority", "Likelihood and impact", "Cost and schedule", "Coverage and defect density"]
    answer: [1]
    explanation: Risk level is determined by the likelihood of the risk occurring and its impact if it does. Severity and priority are defect attributes, which is the tempting wrong pair.
  - id: riskbt-q2
    type: single
    topic: risk-based-testing
    difficulty: intermediate
    prompt: Which of these is a project risk rather than a product risk?
    options: ["Interest may be calculated incorrectly for leap years", "The test environment will not be ready until a week before release", "The login page may be vulnerable to brute-force attacks", "Search may be too slow with a full catalogue"]
    answer: [1]
    explanation: An environment delay affects the project's ability to test, which is a project risk managed by management actions. The others describe possible failures of the product itself.
  - id: riskbt-q3
    type: scenario
    topic: risk-based-testing
    difficulty: intermediate
    prompt: Payment refunds are rated high likelihood and high impact; profile picture upload is low likelihood and low impact. Time is limited. What is the best plan?
    options: ["Test both with equal effort for fairness", "Test refunds thoroughly with several techniques and run them first; give the upload light testing later", "Skip refunds because they are complicated", "Test upload first because it is quicker to finish"]
    answer: [1]
    explanation: Risk-based testing gives higher-risk areas more extensive testing, more rigorous techniques and earlier execution. Equal effort ignores risk, and starting with the easy item delays information about the riskiest area.
  - id: riskbt-q4
    type: multiple
    topic: risk-based-testing
    difficulty: intermediate
    prompt: According to ISTQB CTFL v4.0, which can product risk analysis influence? Select all that apply.
    options: ["The test levels and test types to perform", "The test techniques to use", "The prioritisation of testing", "The extent of testing", "The programming language the product is written in"]
    answer: [0, 1, 2, 3]
    explanation: Risk analysis shapes scope, levels, types, techniques, coverage, effort and prioritisation. The implementation language is an architectural decision outside test risk analysis.
---

## Beginner-friendly explanation

Imagine packing for a two-week trip with only ten minutes left before the taxi arrives. You cannot check everything, so you think: what would be a **disaster** to forget, and what am I **likely** to forget? Passport, tickets and medication are high on both counts, so you check them first and twice. A spare pair of socks is low on both, so you grab some if there is time.

**Risk-based testing** is that same thinking applied to software. There is never time to test everything equally, so we ask two questions about each area: **how likely is it to go wrong**, and **how bad would it be if it did**? The answers decide what we test first, how thoroughly and with which techniques.

## Technical explanation

### Key terms (ISTQB CTFL v4.0)

- **Risk**: a potential event, hazard, threat or situation whose occurrence causes an adverse effect.
- **Risk likelihood**: the probability of the risk occurring.
- **Risk impact**: the harm, or consequences, if it occurs.
- **Risk level**: determined by likelihood and impact together.
- **Product risk**: related to the quality of the product, such as missing or wrong functionality, incorrect calculations, poor performance, security vulnerabilities or poor usability.
- **Project risk**: related to managing and controlling the project, such as delays, staff shortages, environment or tool problems, and supplier issues.

**Risk-based testing** is an approach in which test activities are selected, prioritised and managed based on risk analysis and risk control.

### Product risk analysis and control

| Activity | Part | What happens |
|---|---|---|
| Risk analysis | Identification | Build a list of risks through brainstorming, workshops, interviews, checklists, defect history and cause-effect diagrams |
| Risk analysis | Assessment | Categorise, estimate likelihood and impact, determine the risk level and prioritise |
| Risk control | Mitigation | Implement actions to reduce the risk level, often by testing |
| Risk control | Monitoring | Check that mitigation works, gather information to improve the analysis and identify new risks |

Risk assessment can be **quantitative** (risk level = likelihood × impact, using numbers) or **qualitative** (using a risk matrix of words such as low, medium and high).

```mermaid
flowchart LR
  I["Identify risks"] --> A["Assess likelihood and impact"]
  A --> P["Prioritise by risk level"]
  P --> M["Mitigate: plan and run tests"]
  M --> MO["Monitor: results and new information"]
  MO --> A
  MO --> R["Report residual risk"]
```

### How risk shapes testing

The syllabus states that product risk analysis can influence the thoroughness and scope of testing. Results are used to determine the scope, the particular test levels and test types, the test techniques and coverage, the effort for each task, the prioritisation of testing and other activities besides testing that could reduce risk.

Responses to an analysed product risk include **mitigation by testing**, **risk acceptance**, **risk transfer** and a **contingency plan**.

## Real-world example

A team was rebuilding the checkout of an online pharmacy with four weeks of testing time. In a risk workshop with pharmacists, support staff, developers and the product owner, they identified risks and rated them on 1 to 3 scales:

| Risk | Likelihood | Impact | Level (L × I) | Response |
|---|---|---|---|---|
| Prescription items sold without a valid prescription check | 2 | 3 | 6 | Decision tables, three-value BVA on dates, exploratory sessions, early start |
| Wrong total when discounts and delivery fees combine | 3 | 2 | 6 | Decision tables, automated regression |
| Payment provider timeout leaves order in unknown state | 2 | 3 | 6 | Integration tests with fault injection |
| Slow search with full catalogue | 2 | 2 | 4 | Performance test on production-sized data |
| Address autocomplete misses rural addresses | 2 | 1 | 2 | Light functional checks |
| Typos in footer pages | 1 | 1 | 1 | Accept; review if time allows |

The highest-risk items started first and received the most rigorous techniques. When the payment-timeout tests revealed orders stuck in a "pending" state, there were still two weeks to fix it, because the riskiest area had not been left until the end.

## Step-by-step walkthrough

1. **Gather stakeholders** from business, development, operations and support. Risk is a shared judgement, not a tester's guess.
2. **Identify product risks** per feature or quality characteristic, using defect history, complexity, change size, usage and regulations.
3. **Agree scales** with concrete descriptions, such as what "high impact" means in money, customers or compliance.
4. **Assess likelihood and impact separately** and compute or look up the risk level.
5. **Decide responses**: test extent, levels, types, techniques and order for each risk; record accepted risks explicitly.
6. **Trace tests to risks** so you can show coverage per risk.
7. **Execute highest risks first.**
8. **Monitor and re-assess** as defects are found, scope changes or new information arrives.
9. **Report residual risk**: which risks are mitigated, partially mitigated or untested, so release decisions are informed.

## Common mistakes

- **Rating everything high.** Without differentiation, risk analysis cannot guide anything.
- **Confusing product and project risks.** More testing does not fix a late environment.
- **A one-time analysis** filed away and never updated.
- **Testers assessing impact alone**, without the business people who understand consequences.
- **Reporting only pass percentages.** "95% passed" hides whether the 5% that failed are the highest risks.
- **Dropping low-risk areas silently.** Accepted risks should be documented and agreed.

## Troubleshooting

- **Stakeholders disagree on ratings.** Discuss the evidence and the concrete scale definitions; if still split, record the higher rating and the reason.
- **The risk list is enormous.** Group related risks by feature or quality characteristic and assess the groups first.
- **There is no time even for high risks.** Escalate with the risk list as evidence; the decision to accept untested high risks belongs to stakeholders, not to the tester alone.

## Key takeaways summary

Risk-based testing turns limited time into the most valuable information. Identify and assess product risks with stakeholders, let risk levels drive scope, depth, techniques and order, keep the analysis alive as the project changes, and report residual risk so the release decision is made with open eyes. See [risk-based scenario selection](/learn/manual-testing/risk-based-scenario-selection) for applying it to individual test scenarios.
