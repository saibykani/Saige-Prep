---
slug: risk-based-scenario-selection
title: Risk-Based Scenario Selection
summary: You can never test everything, so test what matters most first. Score scenarios by likelihood and impact, rank them, and match the depth of testing to the level of risk.
level: intermediate
duration: 30
tags: [test-design, risk, test-planning, istqb]
objectives:
  - Explain risk level as a combination of risk likelihood and risk impact
  - Identify likelihood and impact factors for test scenarios
  - Score, rank and select scenarios using a risk matrix
  - Match test depth and technique choice to the risk level, and handle time pressure transparently
prerequisites:
  - Risk-based testing
  - Test scenarios and test cases
related: [risk-based-testing, test-scenarios-and-test-cases, exploratory-testing-charters, test-estimation]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 5.2, Risk Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary
    url: https://glossary.istqb.org/
  - title: ISO 31000 Risk management
    url: https://www.iso.org/iso-31000-risk-management.html
interview:
  - q: How do you decide which scenarios to test first when time is short?
    a: I score each scenario by likelihood of failure and impact if it fails, combine them into a risk level, and rank the list. High-risk scenarios get tested first and most thoroughly, with several techniques and negative cases; low-risk ones get a smoke check or are consciously deferred. I share the ranked list and what will not be tested with stakeholders so the residual risk is an informed decision, not a surprise.
  - q: What factors affect likelihood and impact?
    a: Likelihood is driven by things like complexity, amount of change, new technology or third-party integrations, team unfamiliarity and defect history in that area. Impact covers financial loss, number of users affected, legal or regulatory consequences, safety, data loss and reputational damage. I gather both with developers, product owners and support, because no single person sees all of them.
  - q: What is a weakness of multiplying likelihood by impact?
    a: It can flatten very different risks to the same number. A rare but catastrophic failure such as login being broken for everyone can score lower than a frequent cosmetic issue. I use a matrix with a rule that any maximum-impact item gets at least a smoke test regardless of score, and I review the ranking with stakeholders rather than trusting the arithmetic blindly.
  - q: How does ISTQB describe the purpose of product risk analysis?
    a: In CTFL v4.0, product risk analysis aims to focus test effort to minimise residual product risk. Its results are used to decide test scope and thoroughness, test levels and test types, the techniques and coverage to apply, effort estimates and the prioritisation of tests, and whether other activities beyond testing are needed to reduce risk.
practice:
  - "List ten scenarios for an online exam portal, score likelihood and impact on a 1 to 3 scale with one-line justifications, and rank them."
  - "Your release window shrinks from five days to two. Using the ranked list from this lesson, write the message to stakeholders explaining what will and will not be tested."
  - "Re-score the lesson's scenarios after learning the payment provider SDK was NOT changed this release. What moves and why?"
takeaways:
  - Risk level combines likelihood and impact; score both with stated reasons.
  - Rank scenarios and test the highest risks first and most deeply.
  - Match depth to risk with more techniques, more negative cases and more regression for high risk.
  - Give every maximum-impact scenario at least a minimal check, whatever its score.
  - Make residual risk visible so skipping tests is an informed stakeholder decision.
quiz:
  - id: rbss-q1
    type: single
    topic: risk-based-scenario-selection
    difficulty: beginner
    prompt: According to ISTQB CTFL v4.0, the risk level is determined by which two factors?
    options: ["Severity and priority", "Risk likelihood and risk impact", "Test effort and test coverage", "Defect count and test count"]
    answer: [1]
    explanation: The risk level is a combination of the likelihood of the risk occurring and its impact if it does. Severity and priority describe defects, not risks.
  - id: rbss-q2
    type: scenario
    topic: risk-based-scenario-selection
    difficulty: intermediate
    prompt: Using a 1 to 3 scale, a refund flow has likelihood 2 and impact 3, while a profile photo upload has likelihood 3 and impact 1. Which statement is correct?
    options: ["The photo upload is higher risk because it is more likely to fail", "The refund flow scores 6 and the photo upload 3, so the refund flow is tested first and more deeply", "Both score the same, so either can go first", "Impact should be ignored when likelihood is high"]
    answer: [1]
    explanation: 2 × 3 = 6 for refunds and 3 × 1 = 3 for photo upload. Likelihood alone does not decide priority, because the financial impact of a refund failure is much greater.
  - id: rbss-q3
    type: truefalse
    topic: risk-based-scenario-selection
    difficulty: intermediate
    prompt: In risk-based testing, low-risk scenarios that are not tested should be quietly dropped so stakeholders are not distracted.
    options: ["True", "False"]
    answer: [1]
    explanation: Untested scenarios represent residual risk, which must be reported transparently so stakeholders can accept it or provide more time. Hiding it removes their ability to make an informed release decision.
  - id: rbss-q4
    type: multiple
    topic: risk-based-scenario-selection
    difficulty: intermediate
    prompt: Which are typical likelihood factors when scoring a scenario? Select all that apply.
    options: ["The area changed significantly in this release", "It integrates with a new third-party service", "It handles customer payments", "It has a history of defects"]
    answer: [0, 1, 3]
    explanation: Change, new integrations and defect history make failure more likely. Handling payments raises the impact of a failure, not its likelihood.
---

## Beginner-friendly explanation

Imagine you have ten minutes before guests arrive and the house is a mess. You do not clean evenly. You clear the living room and the bathroom, the places guests will definitely see, and leave the spare room door shut. You chose based on two questions: *how likely is it a guest goes there?* and *how bad would it be if it were messy?*

Testing works the same way. There is never enough time to test everything, so you ask, for each scenario, **how likely is it to break?** and **how bad would it be if it did?** Then you spend your time where both answers are biggest.

## Technical explanation

ISTQB CTFL v4.0 (section 5.2) defines a **risk** as a potential event, hazard, threat or situation whose occurrence causes an adverse effect. A risk is characterised by:

- **Risk likelihood**: the probability of the risk occurring.
- **Risk impact (harm)**: the consequences if it occurs.

Together they determine the **risk level**. Risk management consists of **risk analysis** (identification and assessment) and **risk control** (mitigation and monitoring). Assessment can be **quantitative** (for example, risk level = likelihood × impact) or **qualitative** (a risk matrix).

**Product risk analysis** shapes testing: scope and thoroughness, test levels and types, techniques and coverage, effort, the **prioritisation of tests** so critical defects are found as early as possible, and whether non-testing activities are also needed. This lesson applies that at the level of **scenarios**: deciding which ones to test, in what order and how deeply. For the broader approach, see [risk-based testing](/learn/manual-testing/risk-based-testing).

| Factor | Raises **likelihood** | Raises **impact** |
|---|---|---|
| Examples | Complex logic, heavy change, new technology or third-party integration, defect history, tight deadlines, unclear requirements | Money, many users affected, legal or regulatory exposure, safety, data loss, reputation, no workaround |

### Worked example: a food-delivery release

Scale: 1 low, 2 medium, 3 high. Risk score = likelihood × impact (1 to 9). Levels: **High 6–9**, **Medium 3–4**, **Low 1–2**.

| ID | Scenario | L | Why | I | Why | Score | Level |
|---|---|---|---|---|---|---|---|
| S1 | Pay by card and place order | 3 | Payment SDK upgraded this release | 3 | Revenue, every order | 9 | High |
| S2 | Apply promo code | 3 | New coupon-stacking logic | 2 | Wrong totals, support load | 6 | High |
| S3 | Refund for a cancelled order | 2 | Shares code with the SDK upgrade | 3 | Money, regulatory complaints | 6 | High |
| S4 | Live delivery tracking | 2 | Map library minor update | 2 | Annoyance, support calls | 4 | Medium |
| S5 | Search restaurants by cuisine | 2 | Index changes | 2 | Fewer orders | 4 | Medium |
| S6 | Log in with OTP | 1 | Unchanged, stable | 3 | No one can order | 3 | Medium |
| S7 | Rate a restaurant | 2 | Reworked rating widget | 1 | Cosmetic | 2 | Low |
| S8 | Change profile photo | 1 | Unchanged | 1 | Cosmetic | 1 | Low |

**Depth by level**

| Level | Test depth |
|---|---|
| High | Full positive and negative tests; EP, BVA and decision tables; state transitions for order status; exploratory charter; add to automated regression |
| Medium | Main and key alternate flows; main negative cases; existing regression |
| Low | Smoke check or consciously deferred, with the deferral reported |

Note S6. Its score is only 3, but its impact is maximum, because if login fails nobody can order. A sensible rule is that **every impact-3 scenario gets at least a smoke test**, however unlikely it seems.

```mermaid
flowchart LR
  A["Identify scenarios"] --> B["Score likelihood and impact"]
  B --> C["Rank by risk level"]
  C --> D["Assign depth and techniques"]
  D --> E["Execute in risk order"]
  E --> F["Report residual risk"]
  F -->|"new information"| B
```

## Real-world example

A team building an insurance portal had three days of testing time for a release that would normally need eight. Instead of starting at the top of the regression suite, the test lead ran a 45-minute risk workshop with a developer, the product owner and a support lead. Support pointed out that the premium-renewal page generated the most complaints, which nobody else had flagged. It went to the top of the list, testing found a rounding defect there, and the lead's release report listed exactly which low-risk scenarios were deferred. The product owner accepted that residual risk in writing.

## Step-by-step walkthrough

1. **List scenarios** from requirements, user journeys and the regression suite.
2. **Run a short risk workshop** with development, product and support to collect likelihood and impact evidence.
3. **Score each scenario** on an agreed scale and write a one-line reason for each score.
4. **Rank** by risk level and apply override rules (for example, every maximum-impact scenario gets a smoke test).
5. **Assign depth and techniques** per level.
6. **Estimate effort** and draw the line at what fits the available time.
7. **Execute in risk order**, so stopping early still leaves the highest risks covered.
8. **Report residual risk**: what was not tested and why. Re-score when new information arrives, such as defects found or late changes.

## Code examples

A small script keeps scores, reasons and ranking in version control instead of in someone's head:

```python
scenarios = [
    ("S1", "Pay by card and place order", 3, 3),
    ("S2", "Apply promo code", 3, 2),
    ("S3", "Refund for a cancelled order", 2, 3),
    ("S4", "Live delivery tracking", 2, 2),
    ("S5", "Search restaurants by cuisine", 2, 2),
    ("S6", "Log in with OTP", 1, 3),
    ("S7", "Rate a restaurant", 2, 1),
    ("S8", "Change profile photo", 1, 1),
]

def level(score: int) -> str:
    return "High" if score >= 6 else "Medium" if score >= 3 else "Low"

ranked = sorted(scenarios, key=lambda s: (s[2] * s[3], s[3]), reverse=True)
for sid, name, likelihood, impact in ranked:
    score = likelihood * impact
    flag = " (smoke test mandatory)" if impact == 3 and score < 6 else ""
    print(f"{sid} {score} {level(score):6} {name}{flag}")
```

## Expected output

```text
S1 9 High   Pay by card and place order
S3 6 High   Refund for a cancelled order
S2 6 High   Apply promo code
S4 4 Medium Live delivery tracking
S5 4 Medium Search restaurants by cuisine
S6 3 Medium Log in with OTP (smoke test mandatory)
S7 2 Low    Rate a restaurant
S8 1 Low    Change profile photo
```

S3 now ranks above S2 although both score 6, because the sort key uses impact as a tiebreaker: when scores are equal, the scenario with the bigger consequence is tested first. S4 and S5 tie on both values, and Python's sort is stable, so they keep their original order. Agree a tiebreak rule with your team rather than leaving it to chance.

## Common mistakes

- **Scoring alone.** One tester cannot see all likelihood and impact factors.
- **Scores without reasons**, which makes them impossible to challenge or update.
- **Trusting the multiplication blindly**, so catastrophic but unlikely failures are under-tested.
- **Silently dropping low-risk tests** instead of reporting residual risk.
- **Never re-scoring.** A cluster of defects found mid-cycle raises likelihood for that area.
- **Confusing impact with likelihood**, for example rating payments "likely to fail" just because they matter.

## Troubleshooting

- **Everything is rated High.** Force a distribution (for example, at most a third of scenarios can be High) or compare pairs: "Is A riskier than B?"
- **Stakeholders disagree on impact.** Escalate to the product owner, who owns business impact; record the decision.
- **No defect history exists.** Use change size and complexity as likelihood proxies, and update scores after the first test cycle.

## Key takeaways summary

Risk-based scenario selection spends limited time where failure is most likely and most harmful. Score likelihood and impact with reasons, rank, match depth to risk, protect maximum-impact scenarios, execute in risk order and report what was left untested.
