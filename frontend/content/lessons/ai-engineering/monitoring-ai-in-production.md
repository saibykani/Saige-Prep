---
slug: monitoring-ai-in-production
title: Monitoring AI in Production
summary: Learn what to watch once a model or LLM feature is live, including data drift, prediction drift, concept drift, quality signals, LLM traces and alerts, with a working drift check using the Kolmogorov-Smirnov test.
level: intermediate
duration: 55
tags: [monitoring, drift, observability, llmops, production]
objectives:
  - Distinguish data drift, prediction drift and concept drift and explain why each matters
  - Detect numeric feature drift with a two-sample Kolmogorov-Smirnov test and categorical drift with PSI or chi-square
  - Design monitoring for LLM features using traces, online evaluations and user feedback
  - Set alerts that are actionable and avoid alert fatigue
  - Plan responses to drift such as investigation, retraining and rollback
prerequisites:
  - Model evaluation metrics
  - Basic statistics (distributions, p-values)
  - How a model is deployed as a service
related: [mlops-and-model-deployment, model-evaluation-metrics, llm-evaluation-and-evals, llm-as-judge-and-human-review, ai-cost-latency-and-scaling, testing-ai-systems-strategy]
references:
  - title: SciPy — scipy.stats.ks_2samp
    url: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ks_2samp.html
  - title: SciPy — scipy.stats.chi2_contingency
    url: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.chi2_contingency.html
  - title: Google — Rules of Machine Learning
    url: https://developers.google.com/machine-learning/guides/rules-of-ml
  - title: OpenTelemetry — Documentation
    url: https://opentelemetry.io/docs/
videos:
  - id: J9T0X9Jxl_w
    title: "AWS re:Invent 2020: Detect machine learning (ML) model drift in production"
    channel: "AWS Events"
  - id: EZPyrDk4kus
    title: "Intro to ML Monitoring: Data Drift, Quality, Bias and Explainability"
    channel: "WhyLabs"
interview:
  - q: What is the difference between data drift and concept drift?
    a: Data drift, also called covariate shift, is a change in the distribution of inputs, for example customers getting younger or a new device type appearing. Concept drift is a change in the relationship between inputs and the correct output, for example fraud patterns changing so the same features now mean something different. Data drift can be detected without labels by comparing input distributions. Concept drift usually needs ground-truth labels or proxy outcomes, because the inputs may look the same while the right answer has changed.
  - q: Your drift test flags 40 features out of 200 every day. What do you do?
    a: With large samples, statistical tests detect tiny, harmless differences, and testing many features at once produces false positives. I would add an effect-size threshold such as the KS statistic or PSI rather than relying on the p-value, correct for multiple comparisons, weight features by importance to the model, and alert on sustained drift over a window rather than single days. Most importantly I would tie alerts to model performance or business outcomes where labels are available, so drift is a signal to investigate rather than an automatic page.
  - q: How do you monitor an LLM feature where there is no single correct answer?
    a: I log traces of each request including prompt version, retrieved context, model, tokens, latency and output. I run automated checks on a sample of live traffic, such as format validity, groundedness against retrieved context, refusal rate and policy filters, often using an LLM judge calibrated against human labels. I collect explicit and implicit user feedback, track cost and latency, and have humans review a stratified sample regularly. Regressions are investigated by comparing slices across prompt or model versions.
practice:
  - "Generate a reference sample and a shifted production sample for two numeric features and run ks_2samp on each. Find the smallest mean shift your test detects at sample sizes of 100, 1,000 and 10,000."
  - "Implement PSI for a categorical feature and compare it with chi-square on the same data."
  - "Design an alert policy for a support chatbot covering latency, error rate, cost, refusal rate and thumbs-down rate, including thresholds, windows and owners."
takeaways:
  - Monitor the system (latency, errors, cost), the data (input drift), the model (prediction drift, quality) and the outcome (business metrics).
  - Data drift can be detected without labels; concept drift usually needs labels or proxies.
  - With big samples, p-values flag trivial changes; use effect sizes, windows and feature importance.
  - LLM monitoring relies on traces, sampled online evaluations, user feedback and human review.
  - Every alert needs a threshold, an owner and a runbook.
quiz:
  - id: mon-ai-q1
    type: single
    topic: monitoring-ai-in-production
    difficulty: intermediate
    prompt: What does scipy.stats.ks_2samp compare?
    options: ["The means of two samples only", "The empirical cumulative distributions of two samples", "Two categorical frequency tables", "Model accuracy before and after deployment"]
    answer: [1]
    explanation: The two-sample KS test measures the maximum distance between the two empirical CDFs, so it is sensitive to differences in location and shape for continuous data.
  - id: mon-ai-q2
    type: scenario
    topic: monitoring-ai-in-production
    difficulty: intermediate
    prompt: Input distributions are stable, but a fraud model's precision drops sharply after criminals change tactics. Which type of drift is this?
    options: ["Data drift", "Concept drift", "Training-serving skew", "Label noise only"]
    answer: [1]
    explanation: The relationship between features and the label changed while inputs looked similar, which is concept drift. It is visible through labelled outcomes.
  - id: mon-ai-q3
    type: truefalse
    topic: monitoring-ai-in-production
    difficulty: intermediate
    prompt: With very large samples, a statistically significant drift test always means the model's performance has meaningfully degraded.
    options: ["True", "False"]
    answer: [1]
    explanation: Large samples make tiny differences significant. Significance is not the same as practical impact, so pair tests with effect sizes and performance signals.
  - id: mon-ai-q4
    type: multiple
    topic: monitoring-ai-in-production
    difficulty: intermediate
    prompt: Which are useful fields in an LLM request trace? Select all that apply.
    options: ["Prompt template version", "Model name and parameters", "Input and output token counts", "Retrieved document IDs"]
    answer: [0, 1, 2, 3]
    explanation: All four help explain regressions, cost changes and grounding problems when comparing behaviour across versions.
---

## Beginner-friendly explanation

A model is trained on a snapshot of the past. The moment it goes live, the world starts moving away from that snapshot. New products launch, users behave differently, a partner changes a data format. The model does not notice; it keeps answering confidently.

Monitoring is how **you** notice. Think of it like a car dashboard: speed and fuel (system health), the engine warning light (errors), and occasionally a mechanic checking whether the car still drives straight (quality). Without it, you find out from angry customers.

Three kinds of change matter:

- **Data drift:** the inputs look different from training.
- **Prediction drift:** the model's outputs shift, for example far more "reject" decisions.
- **Concept drift:** the right answer for the same input has changed.

## Technical explanation

### Four layers to monitor

| Layer | Examples | Labels needed? |
|---|---|---|
| System | latency percentiles, error rate, throughput, GPU use, cost | No |
| Data | missing values, schema breaks, feature distributions | No |
| Model | prediction distribution, confidence, accuracy, calibration | Some |
| Outcome | conversion, complaints, manual overrides | Delayed |

Labels often arrive late (a loan default takes months), so unlabelled signals act as early warnings.

### Detecting drift

- **Numeric features:** the two-sample **Kolmogorov-Smirnov (KS) test** compares empirical CDFs. Its statistic D is the largest gap between them (0 to 1), a useful effect size.
- **Categorical features:** the **chi-square test** of a contingency table, or the **Population Stability Index (PSI)**, sum over bins of (p_prod − p_ref) × ln(p_prod / p_ref). Rule-of-thumb PSI thresholds are common in industry, but treat them as conventions to tune, not laws.
- **Multivariate and text:** compare embedding distributions, or train a classifier to distinguish reference from production data; if it succeeds easily, the data has shifted.

Pitfalls: large samples make tiny differences significant; testing hundreds of features yields false alarms by chance; and seasonal patterns look like drift if the reference window is wrong.

### Monitoring LLM features

LLM outputs are open-ended, so you combine:

- **Traces** per request: prompt version, model, parameters, retrieved context, tool calls, tokens, latency, output. OpenTelemetry-based tooling is common.
- **Deterministic checks:** JSON validity, length, banned content, PII patterns.
- **Online evaluations** on a sample: groundedness, relevance, tone, via an LLM judge calibrated against human labels.
- **User signals:** thumbs, edits, retries, escalations to humans.
- **Human review** of a stratified sample, including low-scoring and random items.

### Alerting

Good alerts are actionable: a threshold, a time window (sustained, not a single spike), an owner and a runbook. Separate pages (user-impacting now) from tickets (investigate this week).

## Real-world example

A ride-hailing ETA model began under-estimating trip times in one city. System metrics were green. The data-drift dashboard showed the distribution of a "road speed" feature had shifted after a map provider changed units in its feed. Because the team logged served features, they confirmed the KS statistic for that feature jumped overnight while others stayed flat, traced it to the upstream change, added a schema-and-range data test and patched the feature pipeline. The model itself did not need retraining. Drift was a symptom; the cause was a broken input.

## Step-by-step walkthrough

1. **Store a reference sample** of inputs and predictions from training or a known-good production period.
2. **Log served inputs, outputs and versions**, respecting privacy.
3. **Schedule drift checks** per feature on a rolling window.
4. **Use effect sizes** (KS statistic, PSI) plus p-values, and weight by feature importance.
5. **Track model quality** whenever labels arrive, sliced by segment.
6. **Alert on sustained changes** with owners and runbooks.
7. **Respond:** investigate data pipelines first, then retrain, roll back or adjust thresholds.

## Code examples

A KS drift check across numeric features:

```python
# pip install numpy pandas scipy
import numpy as np
import pandas as pd
from scipy.stats import ks_2samp

rng = np.random.default_rng(7)
reference = pd.DataFrame({
    "amount": rng.lognormal(3.0, 0.5, 5000),
    "age": rng.normal(40, 10, 5000),
})
production = pd.DataFrame({
    "amount": rng.lognormal(3.2, 0.5, 2000),   # shifted
    "age": rng.normal(40, 10, 2000),           # unchanged
})

def drift_report(ref, prod, d_threshold=0.1, alpha=0.01):
    rows = []
    for col in ref.columns:
        res = ks_2samp(ref[col], prod[col])
        rows.append({
            "feature": col,
            "ks_stat": round(res.statistic, 3),
            "p_value": res.pvalue,
            "drift": res.statistic > d_threshold and res.pvalue < alpha,
        })
    return pd.DataFrame(rows)

print(drift_report(reference, production))
```

PSI for a categorical feature:

```python
import numpy as np

def psi(ref_counts: dict, prod_counts: dict, eps=1e-6) -> float:
    cats = set(ref_counts) | set(prod_counts)
    r_tot, p_tot = sum(ref_counts.values()), sum(prod_counts.values())
    total = 0.0
    for c in cats:
        r = ref_counts.get(c, 0) / r_tot + eps
        p = prod_counts.get(c, 0) / p_tot + eps
        total += (p - r) * np.log(p / r)
    return total

print(round(psi({"web": 700, "ios": 200, "android": 100},
                {"web": 500, "ios": 250, "android": 250}), 3))
```

A minimal structured log line for an LLM call:

```python
import json, time, uuid

def log_llm_call(prompt_version, model, usage, latency_ms, output_ok):
    print(json.dumps({
        "trace_id": str(uuid.uuid4()), "ts": time.time(),
        "prompt_version": prompt_version, "model": model,
        "input_tokens": usage["input"], "output_tokens": usage["output"],
        "latency_ms": latency_ms, "format_valid": output_ok,
    }))
```

## Expected output

The drift report shows `amount` with a noticeably larger KS statistic and a tiny p-value, flagged as drift, while `age` has a small statistic and is not flagged. Exact numbers depend on the random generator. The PSI example returns a positive value; larger values mean bigger shifts.

## Common mistakes

- **Only monitoring system health**, so a model returning confident nonsense stays green.
- **Alerting on p-values alone** with huge samples, which floods the team with trivial alerts.
- **Wrong reference window**, so weekly or seasonal patterns look like drift.
- **Not logging the model and prompt version**, making regressions impossible to attribute.
- **Retraining automatically on drift** without checking whether the drift came from a broken pipeline.
- **Ignoring slices**: overall accuracy is flat while one region or language collapses.
- **Logging sensitive prompts** without redaction and retention rules.

## Troubleshooting

- **Everything drifts at once:** suspect an upstream pipeline or schema change, not the world.
- **Nothing ever drifts:** check the window sizes and that production data is actually being logged.
- **LLM judge scores swing:** pin the judge model and prompt, and re-check agreement with human labels.

## Exercise

For a model you have deployed (or the MLOps lesson's example service), log 1,000 requests, simulate a shift in one feature, and build a daily drift report with KS and PSI. Write a runbook entry saying who is alerted, at what threshold, and what they check first.

## Key takeaways summary

Production monitoring spans system, data, model and outcome. Use KS, chi-square or PSI to detect input drift, with effect sizes and sensible windows. Concept drift needs labels or proxies. For LLM features, rely on traces, sampled online evals, user feedback and human review. Make every alert actionable.
