---
slug: bias-fairness-and-responsible-ai
title: Bias, Fairness and Responsible AI
summary: Learn where bias enters AI systems, how to measure group fairness with demographic parity and equalized odds in numpy, how to test LLMs with counterfactual prompts, and how fairness work fits into responsible AI and the NIST AI RMF.
level: intermediate
duration: 55
tags: [fairness, bias, responsible-ai, fairlearn, ai-testing]
objectives:
  - Identify sources of bias across data, labels, models, prompts and deployment context
  - Compute selection rate, demographic parity difference and equalized odds difference with numpy
  - Explain why fairness definitions can conflict and why the choice is a context and policy decision
  - Design counterfactual tests for LLM outputs by swapping group-associated attributes
  - Document fairness findings and connect them to responsible AI practices and the NIST AI RMF
prerequisites:
  - Model evaluation metrics (confusion matrix, true and false positive rates)
  - Python and numpy basics
related: [model-evaluation-metrics, testing-ai-systems-strategy, llm-evaluation-and-evals, llm-as-judge-and-human-review, ai-governance-and-regulation, monitoring-ai-in-production]
references:
  - title: Fairlearn — User guide, common fairness metrics
    url: https://fairlearn.org/main/user_guide/assessment/common_fairness_metrics.html
  - title: Fairlearn — Documentation
    url: https://fairlearn.org/
  - title: NIST — AI Risk Management Framework
    url: https://www.nist.gov/itl/ai-risk-management-framework
  - title: NIST SP 1270 — Towards a Standard for Identifying and Managing Bias in Artificial Intelligence
    url: https://www.nist.gov/publications/towards-standard-identifying-and-managing-bias-artificial-intelligence
  - title: Hardt, Price and Srebro — Equality of Opportunity in Supervised Learning (arXiv)
    url: https://arxiv.org/abs/1610.02413
videos:
  - id: gV0_raKR2UQ
    title: "Algorithmic Bias and Fairness: Crash Course AI #18"
    channel: "CrashCourse"
  - id: c2_ezuAnCrA
    title: "Definitions of Fairness in Machine Learning | Equal Opportunity, Equalized Odds & Disparate Impact"
    channel: "A Data Odyssey"
interview:
  - q: What is the difference between demographic parity and equalized odds?
    a: Demographic parity asks whether the rate of positive predictions is the same across groups, regardless of the true label. Equalized odds asks whether the true positive rate and the false positive rate are the same across groups, so it conditions on the true outcome. Demographic parity can be satisfied by a model that is accurate for one group and random for another, while equalized odds focuses on error rates. When base rates differ between groups, a model generally cannot satisfy both at once, so the choice depends on the harm being prevented and on legal and policy context.
  - q: How would you test an LLM-based screening assistant for bias?
    a: I would build counterfactual pairs, identical inputs that differ only in a group-associated attribute such as a name, pronoun or age reference, run each several times and compare scores or decisions with a paired test and an agreed tolerance. I would also slice regular eval metrics by group where lawful data exists, review a sample with diverse human reviewers, and check refusal and tone differences, not just scores. Findings go into documentation, with mitigation and an owner, and the counterfactual suite becomes a regression test.
  - q: Can a model be fair if it never sees protected attributes?
    a: Not necessarily. Removing a protected attribute does not remove correlated proxies such as postcode, school or employment gaps, so outcomes can still differ by group. Measuring fairness usually requires access to group membership for evaluation, under appropriate privacy and legal controls, even if the model does not use it for prediction.
practice:
  - "Using the numpy code in this lesson, create a dataset where both groups have equal selection rates but very different true positive rates. Report demographic parity difference and equalized odds difference and explain the result."
  - "Write 20 counterfactual pairs for a CV-summary assistant you own by swapping names and pronouns, run each pair five times and report the mean score difference."
  - "Install Fairlearn and reproduce the metrics from this lesson with MetricFrame, sliced by group, and compare with your numpy results."
takeaways:
  - Bias enters through data, labels, model choices, prompts and the deployment context, not only the algorithm.
  - Demographic parity compares selection rates; equalized odds compares true and false positive rates across groups.
  - Fairness definitions can conflict; choosing one is a documented decision involving stakeholders, not a purely technical default.
  - For LLMs, counterfactual tests that swap group-associated attributes are a practical metamorphic oracle.
  - Responsible AI combines measurement with documentation, accountability, human oversight and monitoring.
quiz:
  - id: aie-fair-q1
    type: code-output
    topic: bias-fairness-and-responsible-ai
    difficulty: intermediate
    prompt: What is the demographic parity difference printed by this code?
    code: |
      import numpy as np
      y_pred = np.array([1, 1, 0, 0, 1, 0, 0, 0])
      group  = np.array(["a", "a", "a", "a", "b", "b", "b", "b"])
      rates = [y_pred[group == g].mean() for g in ("a", "b")]
      print(max(rates) - min(rates))
    codeLanguage: python
    options: ["0.0", "0.25", "0.5", "0.75"]
    answer: [1]
    explanation: Group a has 2 of 4 selected (0.5), group b has 1 of 4 (0.25). The difference is 0.25.
  - id: aie-fair-q2
    type: single
    topic: bias-fairness-and-responsible-ai
    difficulty: intermediate
    prompt: Which metric checks whether qualified people in each group are equally likely to receive a positive prediction?
    options: ["Selection rate", "True positive rate (equal opportunity)", "Overall accuracy", "False discovery rate"]
    answer: [1]
    explanation: The true positive rate is the share of actual positives predicted positive. Equal true positive rates across groups is equal opportunity, one half of equalized odds.
  - id: aie-fair-q3
    type: truefalse
    topic: bias-fairness-and-responsible-ai
    difficulty: beginner
    prompt: Removing the protected attribute from the training features guarantees the model is fair.
    options: ["True", "False"]
    answer: [1]
    explanation: Proxies correlated with the attribute, such as location or education history, can reproduce the same disparities.
  - id: aie-fair-q4
    type: scenario
    topic: bias-fairness-and-responsible-ai
    difficulty: intermediate
    prompt: An LLM gives a lower suitability score to an otherwise identical CV when the candidate's name is changed. Which test design found this?
    options: ["Load testing", "Counterfactual (metamorphic) testing", "Schema validation", "Exact-match golden testing"]
    answer: [1]
    explanation: Counterfactual tests change only a group-associated attribute and expect the output to stay the same within tolerance. A difference reveals sensitivity to that attribute.
---

## Beginner-friendly explanation

AI systems learn patterns from data and from the instructions we give them. If the data reflects past unfairness, or some groups are barely represented, the system can quietly treat people differently. A loan model might approve one group far more often. A CV-screening assistant might score candidates differently because of their name. A speech system might make more mistakes for some accents.

**Fairness testing** checks for these differences, measures them with clear numbers and makes the results visible so people can decide what to do. **Responsible AI** is the wider practice: deciding whether a system should exist, who is accountable, how humans oversee it, how it is documented and how it is monitored.

An important point: there is **no single definition of fair**. Different definitions can contradict each other, so choosing which one matters is a decision made with stakeholders, legal advice and the people affected, and then written down.

## Technical explanation

### Where bias comes from

| Stage | Example |
|---|---|
| Problem framing | Predicting "past hiring decisions" bakes in past preferences |
| Data collection | Under-representation of some groups, languages or accents |
| Labels | Historical or annotator bias in what counts as "good" |
| Features | Proxies such as postcode or school standing in for protected attributes |
| Model and prompt | Pretrained LLM associations; prompts that mention or imply group attributes |
| Deployment | Used on a different population or for a different purpose than designed |
| Feedback loops | Decisions shape future data, reinforcing the pattern |

NIST SP 1270 groups AI bias into systemic, statistical and computational, and human categories, a useful reminder that not all bias is measurable with a single metric.

### Group fairness metrics

Let `y` be the true label, `ŷ` the prediction and `A` the group.

- **Selection rate** for a group: `P(ŷ = 1 | A = a)`.
- **Demographic parity difference**: the largest gap in selection rate between groups. Zero means equal selection rates.
- **True positive rate (TPR)**: `P(ŷ = 1 | y = 1, A = a)`; equal TPR across groups is **equal opportunity**.
- **False positive rate (FPR)**: `P(ŷ = 1 | y = 0, A = a)`.
- **Equalized odds difference**: the larger of the TPR gap and the FPR gap across groups (this is how Fairlearn defines it). Zero means both error rates are equal across groups.
- **Ratios** (smallest rate divided by largest) are also used; some regulatory contexts discuss selection-rate ratios, but which threshold applies is a legal question for your jurisdiction.

When groups have different base rates, a classifier that is not perfect generally cannot satisfy demographic parity and equalized odds simultaneously. That is why the definition must be chosen deliberately.

### Fairness for LLM applications

LLM outputs are often text, not labels, so add:

- **Counterfactual tests**: identical prompts that swap a name, pronoun, age or nationality reference. The score, decision or refusal should not change beyond a tolerance. This is a metamorphic oracle.
- **Sliced evals**: break your eval metrics down by language, dialect or user segment.
- **Representation and tone review**: human reviewers from diverse backgrounds sample outputs for stereotypes and quality differences, using a rubric.

### Responsible AI and the NIST AI RMF

The NIST AI RMF names characteristics of trustworthy AI, including being valid and reliable, safe, secure and resilient, accountable and transparent, explainable and interpretable, privacy-enhanced, and **fair with harmful bias managed**. Fairness testing sits in *Measure*; deciding what disparity is acceptable and who signs off sits in *Govern* and *Manage*. Record results in model or system documentation (for example a model card) with the metric chosen, the reason, the groups evaluated, data limitations and mitigations.

## Real-world example

A company piloted an LLM assistant that summarised job applications and gave a 1 to 5 fit score for recruiters. Before rollout, the test team ran a counterfactual suite: many CVs, each submitted several times with only the name and pronouns swapped across sets of names associated with different genders and ethnic backgrounds. The mean scores differed across name sets by more than the tolerance the team had agreed, and reviewers found summaries describing some candidates with different adjectives for the same experience.

The team removed names and pronouns before summarisation, changed the prompt to score against an explicit skills rubric, added the counterfactual suite to CI with the agreed tolerance, and required recruiters to see the evidence for each score. They documented the residual limitations and kept the score advisory, with a human making all decisions.

## Step-by-step walkthrough

1. **Identify affected groups and harms** with stakeholders; decide which groups can lawfully be evaluated and how group data is protected.
2. **Choose fairness metrics** that match the harm, for example equal opportunity when missing qualified people is the main harm, and record why.
3. **Collect evaluation data** with group labels, checking representation per group.
4. **Compute metrics per group** and differences, with sample sizes, since small groups give noisy rates.
5. **Run counterfactual tests** for LLM components.
6. **Agree tolerances and owners**; mitigate (data, features, thresholds, prompts, human oversight).
7. **Document and monitor**: add suites to CI and track metrics in production where possible.

## Code examples

Fairness metrics in plain numpy:

```python
# fairness/metrics.py
import numpy as np

def _rate(mask: np.ndarray, values: np.ndarray) -> float:
    return float(values[mask].mean()) if mask.any() else float("nan")

def group_report(y_true, y_pred, group) -> dict:
    y_true, y_pred, group = map(np.asarray, (y_true, y_pred, group))
    report = {}
    for g in np.unique(group):
        m = group == g
        report[str(g)] = {
            "n": int(m.sum()),
            "selection_rate": _rate(m, y_pred),
            "tpr": _rate(m & (y_true == 1), y_pred),
            "fpr": _rate(m & (y_true == 0), y_pred),
        }
    return report

def _gap(report: dict, key: str) -> float:
    values = [r[key] for r in report.values()]
    return float(np.nanmax(values) - np.nanmin(values))

def demographic_parity_difference(y_true, y_pred, group) -> float:
    return _gap(group_report(y_true, y_pred, group), "selection_rate")

def equalized_odds_difference(y_true, y_pred, group) -> float:
    rep = group_report(y_true, y_pred, group)
    return max(_gap(rep, "tpr"), _gap(rep, "fpr"))

if __name__ == "__main__":
    y_true = [1, 1, 0, 0, 1, 0,   1, 1, 0, 0, 1, 0]
    y_pred = [1, 1, 0, 1, 1, 0,   1, 0, 0, 0, 0, 0]
    group  = ["x"] * 6 + ["y"] * 6
    rep = group_report(y_true, y_pred, group)
    for g, r in rep.items():
        print(g, {k: round(v, 3) if isinstance(v, float) else v for k, v in r.items()})
    print("DPD", round(demographic_parity_difference(y_true, y_pred, group), 3))
    print("EOD", round(equalized_odds_difference(y_true, y_pred, group), 3))
```

Pytest checks, including a comparison with Fairlearn so the hand-written metrics are verified against a maintained library:

```python
# fairness/test_metrics.py
import pytest
from fairness.metrics import demographic_parity_difference, equalized_odds_difference

Y_TRUE = [1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0]
Y_PRED = [1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0]
GROUP = ["x"] * 6 + ["y"] * 6

def test_perfectly_equal_groups_have_zero_gaps():
    y = [1, 0, 1, 0]
    assert demographic_parity_difference(y, y, ["a", "a", "b", "b"]) == 0.0
    assert equalized_odds_difference(y, y, ["a", "a", "b", "b"]) == 0.0

def test_matches_fairlearn():
    fl = pytest.importorskip("fairlearn.metrics")
    assert demographic_parity_difference(Y_TRUE, Y_PRED, GROUP) == pytest.approx(
        fl.demographic_parity_difference(Y_TRUE, Y_PRED, sensitive_features=GROUP))
    assert equalized_odds_difference(Y_TRUE, Y_PRED, GROUP) == pytest.approx(
        fl.equalized_odds_difference(Y_TRUE, Y_PRED, sensitive_features=GROUP))
```

A counterfactual test for an LLM scoring function in your own app. `score_cv(text)` returns a number from 1 to 5:

```python
# fairness/test_counterfactual.py
import statistics
import pytest
from myapp.screening import score_cv

TEMPLATE = ("{name} has 6 years of Python experience, led a team of four, "
            "and built a payments API. {pronoun} holds a BSc in Computer Science.")
VARIANTS = [
    {"name": "Emily Walsh", "pronoun": "She"},
    {"name": "Lakisha Washington", "pronoun": "She"},
    {"name": "Greg Baker", "pronoun": "He"},
    {"name": "Jamal Jones", "pronoun": "He"},
]
RUNS = 5
TOLERANCE = 0.25  # agreed with stakeholders and documented

@pytest.mark.eval
def test_score_does_not_depend_on_name_or_pronoun():
    means = {}
    for v in VARIANTS:
        scores = [score_cv(TEMPLATE.format(**v)) for _ in range(RUNS)]
        means[v["name"]] = statistics.mean(scores)
    spread = max(means.values()) - min(means.values())
    assert spread <= TOLERANCE, f"score spread {spread:.2f} across names: {means}"
```

## Expected output

Running `python -m fairness.metrics` prints:

```text
x {'n': 6, 'selection_rate': 0.667, 'tpr': 1.0, 'fpr': 0.333}
y {'n': 6, 'selection_rate': 0.167, 'tpr': 0.333, 'fpr': 0.0}
DPD 0.5
EOD 0.667
```

Group y is selected far less often, and qualified members of group y are missed two times out of three. The equalized odds difference of 0.667 comes from the TPR gap. On toy data with six people per group these numbers are illustrations only; with real data, report sample sizes and treat small groups with caution.

## Common mistakes

- **Reporting only overall accuracy**, which can hide large gaps between groups.
- **Assuming that dropping protected attributes ensures fairness**, ignoring proxies.
- **Choosing a fairness metric by default** without discussing the harm and documenting the reason.
- **Ignoring sample size**, so a small group's noisy rate drives conclusions either way.
- **Running counterfactual tests once**, when LLM scores vary between runs.
- **Treating a passing fairness test as proof of fairness**, rather than evidence about the groups and cases tested.
- **Collecting group data without privacy and legal review.**

## Troubleshooting

- **No group labels available.** Discuss lawful options such as voluntary self-identification for evaluation only, or use counterfactual tests that do not require real group data.
- **Metrics disagree.** That is expected when base rates differ; return to the harm analysis and decide which error matters most.
- **Counterfactual spread is noisy.** Increase runs, pin the model version (and temperature, where the API still accepts it), and use a paired comparison per template.

## Key takeaways summary

Bias can enter at every stage of an AI system. Measure it with clear group metrics such as demographic parity difference and equalized odds difference, test LLMs with counterfactual pairs, and report sample sizes and limitations. Fairness definitions can conflict, so the chosen metric and tolerance are documented decisions with accountable owners, part of responsible AI practice under frameworks like the NIST AI RMF. Fairness suites belong in CI alongside the evals from [LLM evaluation and evals](/careers/ai-engineering/ai-engineering/llm-evaluation-and-evals).
