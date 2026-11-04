---
slug: experiment-design-for-ai-research
title: Experiment Design for AI Research
summary: Design AI experiments that produce trustworthy conclusions, with clear hypotheses, strong baselines, controlled variables, fixed seeds, multiple runs, bootstrap confidence intervals, paired comparisons and honest reporting.
level: advanced
duration: 70
tags: [experiments, statistics, reproducibility, research, evaluation]
objectives:
  - Write a falsifiable hypothesis with a primary metric and a decision rule chosen before running experiments
  - Control randomness with seeds and estimate run-to-run variance with multiple runs
  - Compute bootstrap confidence intervals and paired comparisons for model evaluation results
  - Design ablations and baselines that isolate the cause of an improvement
  - Avoid common pitfalls such as test-set overfitting, multiple comparisons and unequal tuning budgets
prerequisites:
  - Model evaluation metrics
  - Basic statistics (mean, variance, confidence intervals)
  - Python with NumPy
related: [reading-ai-research-papers, model-evaluation-metrics, llm-evaluation-and-evals, mlops-and-model-deployment, fine-tuning-and-adaptation, math-for-machine-learning]
references:
  - title: NumPy — Random Generator
    url: https://numpy.org/doc/stable/reference/random/generator.html
  - title: SciPy — scipy.stats.bootstrap
    url: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html
  - title: PyTorch — Reproducibility notes
    url: https://pytorch.org/docs/stable/notes/randomness.html
  - title: MLflow — Tracking documentation
    url: https://mlflow.org/docs/latest/ml/tracking/
  - title: NeurIPS — Paper Checklist Guidelines
    url: https://neurips.cc/public/guides/PaperChecklist
interview:
  - q: Your new model beats the baseline by one point of accuracy on one run. Is it better?
    a: Not yet. One run cannot separate a real improvement from noise due to random initialisation, data order and test-set sampling. I would run both models with several seeds, compute the mean and spread, and compare them on the same test examples with a paired analysis, for example a paired bootstrap over test items, to get a confidence interval on the difference. If the interval comfortably excludes zero and the gain survives on a second dataset or slice, I am more confident. I would also check that both models were tuned with the same budget.
  - q: How do you design an ablation study?
    a: I start from the full method and remove or replace one component at a time while keeping everything else fixed, including data, compute, seeds and evaluation. Each variant runs with multiple seeds. The drop in the primary metric when a component is removed estimates its contribution. I also include the plain baseline and, where components may interact, a few combinations. I decide the list of ablations in advance so I am not tempted to only report the flattering ones.
  - q: Why should the test set be touched rarely?
    a: Every time you look at test results and change something, information about the test set leaks into your choices, so the final score becomes optimistically biased. That is overfitting by researcher decisions. I tune on a validation set, keep the test set for the final evaluation of a small number of pre-registered comparisons, and if the test set has been used heavily I create a fresh held-out set.
practice:
  - "Train a small classifier with five seeds. Report mean, standard deviation and a 95% bootstrap confidence interval of accuracy."
  - "For two models evaluated on the same 500 test items, compute a paired bootstrap interval for the accuracy difference and compare it with an unpaired analysis."
  - "Write a one-page pre-registration for an experiment: hypothesis, primary metric, datasets, baselines, ablations, number of seeds, decision rule."
takeaways:
  - State the hypothesis, primary metric and decision rule before running experiments.
  - Seeds make runs repeatable; multiple seeds measure variance, which you must report.
  - Use paired comparisons on the same test items and bootstrap confidence intervals for differences.
  - Strong, equally tuned baselines and planned ablations isolate what actually helps.
  - Protect the test set and correct for many comparisons.
quiz:
  - id: exp-design-q1
    type: single
    topic: experiment-design-for-ai-research
    difficulty: intermediate
    prompt: Why run an experiment with several random seeds?
    options: ["To make training faster", "To estimate how much results vary from randomness alone", "To increase the dataset size", "To avoid needing a test set"]
    answer: [1]
    explanation: Different seeds change initialisation and data order. The spread across seeds shows the noise level that a claimed improvement must exceed.
  - id: exp-design-q2
    type: scenario
    topic: experiment-design-for-ai-research
    difficulty: advanced
    prompt: Two models are evaluated on the same 1,000 questions. Which analysis best uses this structure?
    options: ["Compare their accuracies by eye", "A paired comparison, such as a paired bootstrap over questions of the difference in correctness", "An unpaired test treating the two result sets as independent", "Average the two accuracies"]
    answer: [1]
    explanation: Because both models answer the same items, pairing removes item difficulty variation and gives a tighter interval on the difference.
  - id: exp-design-q3
    type: truefalse
    topic: experiment-design-for-ai-research
    difficulty: advanced
    prompt: Tuning your method for 100 trials but the baseline for 5 trials is a fair comparison if both use the same test set.
    options: ["True", "False"]
    answer: [1]
    explanation: Unequal tuning budgets favour the more-tuned method. Baselines should receive comparable tuning effort.
  - id: exp-design-q4
    type: multiple
    topic: experiment-design-for-ai-research
    difficulty: advanced
    prompt: Which practices reduce false discoveries? Select all that apply.
    options: ["Pre-registering the primary metric", "Correcting for multiple comparisons", "Reporting only the best of many metrics", "Holding out a test set used once at the end"]
    answer: [0, 1, 3]
    explanation: Picking the best of many metrics after the fact inflates false positives. The others limit researcher degrees of freedom.
---

## Beginner-friendly explanation

An experiment is a fair test of an idea. In AI, unfairness sneaks in easily: one lucky random seed, a baseline that got less tuning, a test set you peeked at twenty times. Each makes a weak idea look strong.

Think of comparing two running shoes. If one runner wears shoe A on a calm day and shoe B into a headwind, you learn nothing about shoes. A fair test uses the same runner, the same course, several attempts each, and decides in advance what "faster" means. AI experiments need the same discipline: same data, same budget, several runs, and a decision rule written down before the results arrive.

## Technical explanation

### Start with the question

- **Hypothesis:** "Adding re-ranking improves answer accuracy on our support questions."
- **Primary metric:** one metric, decided in advance (secondary metrics are reported but do not decide).
- **Decision rule:** "Adopt if the 95% confidence interval of the accuracy difference is above zero and latency p95 stays under budget."
- **Datasets and splits:** train, validation for tuning, test touched once.

### Variables

- **Independent variable:** what you change (the method).
- **Controlled variables:** data, preprocessing, compute, tuning budget, decoding settings, evaluation code.
- **Dependent variable:** the metric.

Change one thing at a time unless you are deliberately testing interactions.

### Randomness and seeds

Randomness enters through initialisation, data shuffling, dropout, sampling during generation and even non-deterministic GPU kernels. Set seeds for Python, NumPy and your framework so a run is repeatable, but remember that **a fixed seed hides variance; it does not remove it**. Run multiple seeds (commonly 3 to 10 depending on cost) and report mean and spread. Note that GPU results may still differ slightly even with seeds unless deterministic algorithms are enabled.

### Uncertainty from the test set

Even a perfectly deterministic model has uncertainty because the test set is a sample. The **bootstrap** resamples test items with replacement many times, recomputes the metric, and takes percentiles as a confidence interval. For comparing two systems on the **same** items, use a **paired** bootstrap: resample item indices and compute the difference each time. Pairing removes variation in item difficulty and is usually far more sensitive than comparing two separate intervals.

You can combine sources: report seed variance and test-set intervals, or bootstrap over both.

### Baselines and ablations

- **Baselines:** the simplest reasonable approach, the current production system, and the strongest published method you can run under the same conditions. Tune them with comparable effort.
- **Ablations:** remove each component of your method in turn. If removing component C costs nothing, C is not why your method works.

### Pitfalls

- **Multiple comparisons:** test 20 variants and one will look significant by chance at the 5% level. Pre-register, limit comparisons, or apply corrections such as Bonferroni or Holm.
- **Test-set reuse:** repeated peeking overfits the test set.
- **Leakage:** duplicate items across splits, or features that encode the label.
- **Non-stationary LLM APIs:** hosted models can change behind the same name; record model versions and dates.
- **LLM judges:** pin the judge and its prompt, and validate agreement with humans.
- **Selective reporting:** report failures and negative ablations too.

## Real-world example

A team tested whether a new prompt improved their RAG assistant. On a single run over 300 questions the new prompt scored 4 points higher. Following their experiment template, they ran both prompts three times each (generation used sampling) and computed a paired bootstrap over questions. The difference shrank to under 2 points with an interval that included zero. Breaking down by slice showed a real gain on multi-hop questions and a small loss on yes/no questions. They shipped the new prompt only for queries classified as multi-hop and noted the result as "promising, needs a larger set" rather than claiming a general win.

## Step-by-step walkthrough

1. **Write the plan:** hypothesis, primary metric, decision rule, datasets, baselines, ablations, seeds.
2. **Freeze evaluation code and data**, and log their versions.
3. **Tune on validation** with equal budgets for all methods.
4. **Run each configuration with multiple seeds**, tracking every run (for example in MLflow).
5. **Evaluate once on test.** Compute per-item results, not just aggregates.
6. **Analyse:** mean and spread across seeds, paired bootstrap intervals for differences, slices.
7. **Report honestly:** all configurations, negative results, compute used, limitations.

## Code examples

Seeding helpers:

```python
import os, random
import numpy as np

def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    try:
        import torch
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
    except ImportError:
        pass
```

Multiple seeds, bootstrap CI and a paired comparison with scikit-learn:

```python
# pip install numpy scikit-learn
import numpy as np
from sklearn.datasets import load_digits
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X, y = load_digits(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

def per_item_correct(model_fn, seed):
    m = model_fn(seed).fit(X_tr, y_tr)
    return (m.predict(X_te) == y_te).astype(float)

seeds = [0, 1, 2, 3, 4]
a = np.array([per_item_correct(lambda s: RandomForestClassifier(n_estimators=50, random_state=s), s) for s in seeds])
b = np.array([per_item_correct(lambda s: LogisticRegression(max_iter=2000, random_state=s), s) for s in seeds])

print("A accuracy per seed:", a.mean(axis=1).round(3), "std", a.mean(axis=1).std(ddof=1).round(4))
print("B accuracy per seed:", b.mean(axis=1).round(3))

def bootstrap_ci(values, n_boot=10_000, alpha=0.05, seed=0):
    rng = np.random.default_rng(seed)
    n = len(values)
    stats = np.array([values[rng.integers(0, n, n)].mean() for _ in range(n_boot)])
    return np.quantile(stats, [alpha / 2, 1 - alpha / 2])

# average over seeds per item, then paired bootstrap over test items
diff = a.mean(axis=0) - b.mean(axis=0)
lo, hi = bootstrap_ci(diff)
print(f"mean diff A-B = {diff.mean():.3f}, 95% CI [{lo:.3f}, {hi:.3f}]")
print("A better" if lo > 0 else "B better" if hi < 0 else "no clear difference")
```

SciPy also provides `scipy.stats.bootstrap`, which supports paired data and BCa intervals:

```python
from scipy.stats import bootstrap
res = bootstrap((diff,), np.mean, confidence_level=0.95, n_resamples=10_000,
                random_state=np.random.default_rng(0))
print(res.confidence_interval)
```

## Expected output

The script prints per-seed accuracies for both models (the random forest varies slightly across seeds; logistic regression with the default solver barely varies), the mean paired difference with a 95% interval, and a verdict. Exact values depend on library versions. If the interval straddles zero, the honest conclusion is "no clear difference on this data".

## Common mistakes

- **Single-run claims** with gains smaller than seed variance.
- **Unpaired analysis** when both systems were scored on the same items, wasting statistical power.
- **Unequal tuning budgets** between method and baseline.
- **Choosing the metric after seeing results.**
- **Peeking at the test set** during development.
- **Reporting only the best seed** or the best of many prompts.
- **Not recording versions** of data, code, model APIs and judges.

## Troubleshooting

- **Interval too wide to decide:** collect more test items; more seeds do not shrink test-sampling uncertainty.
- **Results differ on rerun with the same seed:** non-deterministic GPU ops or unseeded components; enable deterministic modes where available.
- **Baseline unexpectedly strong:** good news; your method may not be needed, which is a valid result.

## Exercise

Pick a change you believe improves a model or prompt. Write the pre-registration, run baseline and change with five seeds, compute a paired bootstrap interval on the primary metric, run two ablations, and write a half-page report that a sceptical reviewer would accept.

## Key takeaways summary

Good AI experiments decide the question and decision rule first, control everything except the change under test, measure variance with multiple seeds, quantify uncertainty with bootstrap intervals and paired comparisons, use strong baselines and ablations, and report everything honestly.
