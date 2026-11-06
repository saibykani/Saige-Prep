---
slug: model-evaluation-metrics
title: Model Evaluation Metrics
summary: Choose and interpret the right metrics, from confusion matrices, precision, recall and F1 to ROC AUC, precision-recall curves, thresholds, calibration and regression errors, and report them with uncertainty and per-slice results.
level: intermediate
duration: 60
tags: [evaluation, metrics, precision-recall, roc-auc, scikit-learn]
objectives:
  - Build and read a confusion matrix and derive accuracy, precision, recall, specificity and F1
  - Explain why accuracy misleads on imbalanced data and choose a metric based on error costs
  - Use ROC AUC, precision-recall curves and decision thresholds appropriately
  - Evaluate regression with MAE, RMSE and R², and report results with confidence intervals and per-slice breakdowns
prerequisites:
  - Machine learning fundamentals (splits, cross-validation)
  - Basic probability
related: [machine-learning-fundamentals, testing-ai-systems-strategy, llm-evaluation-and-evals, bias-fairness-and-responsible-ai, experiment-design-for-ai-research]
references:
  - title: scikit-learn — Metrics and scoring, quantifying the quality of predictions
    url: https://scikit-learn.org/stable/modules/model_evaluation.html
  - title: scikit-learn — Probability calibration
    url: https://scikit-learn.org/stable/modules/calibration.html
  - title: Google Machine Learning Crash Course — Classification (accuracy, precision, recall, ROC and AUC)
    url: https://developers.google.com/machine-learning/crash-course/classification
  - title: scikit-learn — Tuning the decision threshold for class prediction
    url: https://scikit-learn.org/stable/modules/classification_threshold.html
interview:
  - q: When would you prefer recall over precision?
    a: When missing a positive is much more costly than a false alarm. For example, in screening for a serious disease or detecting fraud for later human review, a false negative may cause serious harm while a false positive only costs a follow-up check. I would set the threshold to reach a required recall and then maximise precision at that level, and confirm the trade-off with the business owner.
  - q: Why can ROC AUC look good on a highly imbalanced dataset while the model is not useful?
    a: The ROC curve uses the false positive rate, whose denominator is the large number of negatives. Even a small false positive rate can be many false alarms in absolute terms, swamping the true positives, so precision is low. The precision-recall curve and average precision focus on the positive class and show this problem more clearly.
  - q: What does it mean for a classifier to be well calibrated?
    a: Its predicted probabilities match observed frequencies. Among all cases where it predicts 0.8, about 80% should actually be positive. Calibration matters when probabilities drive decisions or are shown to users. It is checked with reliability diagrams and the Brier score and can be improved with Platt scaling or isotonic regression.
practice:
  - "Train a classifier on an imbalanced dataset made with make_classification(weights=[0.95]). Report accuracy, precision, recall, F1, ROC AUC and average precision, and explain which you would show a stakeholder."
  - "Sweep the decision threshold from 0.1 to 0.9 and find the threshold that achieves at least 90% recall with the best precision."
  - "Compute a 95% bootstrap confidence interval for F1 on your test set."
takeaways:
  - The confusion matrix is the source of most classification metrics.
  - Accuracy misleads when classes are imbalanced; use precision, recall, F1 and PR curves.
  - Choose metrics and thresholds from the real cost of each error type.
  - ROC AUC and average precision are threshold-free ranking metrics; the deployed threshold still needs choosing.
  - Report uncertainty and per-slice results, not just one number.
quiz:
  - id: aie-metrics-q1
    type: single
    topic: model-evaluation-metrics
    difficulty: intermediate
    prompt: A model has TP=40, FP=10, FN=60, TN=890. What is its precision?
    options: ["0.40", "0.80", "0.93", "0.04"]
    answer: [1]
    explanation: Precision = TP / (TP + FP) = 40 / 50 = 0.80. Recall would be 40 / 100 = 0.40.
  - id: aie-metrics-q2
    type: scenario
    topic: model-evaluation-metrics
    difficulty: intermediate
    prompt: 1% of transactions are fraudulent. A model that predicts "not fraud" for everything is reported as 99% accurate. What is the best response?
    options: ["Ship it, 99% is excellent", "Point out that recall for fraud is 0 and evaluate with precision, recall and PR curves", "Increase the test set size only", "Switch to mean squared error"]
    answer: [1]
    explanation: With 1% positives, always predicting the majority class gets 99% accuracy while catching no fraud. Metrics focused on the positive class are needed.
  - id: aie-metrics-q3
    type: truefalse
    topic: model-evaluation-metrics
    difficulty: intermediate
    prompt: Raising the decision threshold of a classifier usually increases precision and decreases recall.
    options: ["True", "False"]
    answer: [0]
    explanation: A higher threshold predicts positive less often, so fewer false positives (precision tends to rise) but more missed positives (recall falls). It is a tendency, not guaranteed for every step.
  - id: aie-metrics-q4
    type: single
    topic: model-evaluation-metrics
    difficulty: intermediate
    prompt: Which regression metric penalises large errors most heavily?
    options: ["MAE", "RMSE", "Median absolute error", "Accuracy"]
    answer: [1]
    explanation: RMSE squares errors before averaging, so large errors dominate. MAE treats all errors linearly.
---

## Beginner-friendly explanation

Imagine a smoke alarm. It can make two kinds of mistakes: going off when there is no fire (annoying) or staying silent during a real fire (dangerous). Saying "the alarm is right 99% of the time" hides which mistake it makes. **Evaluation metrics** are how we describe a model's mistakes precisely, so we can decide whether it is good enough for its job.

The key lesson: **there is no single best metric.** The right metric depends on what each kind of mistake costs in the real world.

## Technical explanation

### The confusion matrix

For binary classification with a "positive" class (e.g. fraud):

```text
                   Predicted positive   Predicted negative
Actual positive         TP                    FN
Actual negative         FP                    TN
```

| Metric | Formula | Question it answers |
|---|---|---|
| Accuracy | (TP+TN) / all | How often is it right overall? |
| Precision | TP / (TP+FP) | When it says positive, how often is it right? |
| Recall (sensitivity, TPR) | TP / (TP+FN) | Of real positives, how many did it catch? |
| Specificity (TNR) | TN / (TN+FP) | Of real negatives, how many did it correctly clear? |
| False positive rate | FP / (FP+TN) | How often are negatives falsely flagged? |
| F1 | 2·P·R / (P+R) | Balance of precision and recall (harmonic mean) |

### Worked example

1,000 transactions, 100 fraudulent. The model flags 50: 40 truly fraud (TP), 10 legitimate (FP). It misses 60 frauds (FN); 890 legitimate are correctly cleared (TN).

- Accuracy = (40 + 890) / 1000 = **0.93**
- Precision = 40 / 50 = **0.80**
- Recall = 40 / 100 = **0.40**
- F1 = 2 × 0.8 × 0.4 / 1.2 ≈ **0.53**

93% accuracy sounds great, yet the model misses 60% of fraud.

### Thresholds

Most classifiers output a score or probability; a **threshold** (default 0.5) turns it into a class. Moving the threshold trades precision against recall. Pick it from costs, for example "recall at least 0.9" or "at most 50 alerts per day for the review team".

### Threshold-free metrics

- **ROC curve:** TPR vs FPR across all thresholds. **ROC AUC** is the probability that a random positive is scored above a random negative; 0.5 is random ranking, 1.0 perfect.
- **Precision-recall curve** and **average precision (AP):** more informative when positives are rare.

### Multiclass

Compute per-class precision/recall, then average: **macro** (each class equal weight, exposes poor minority-class performance), **weighted** (by support) or **micro** (pooled counts).

### Calibration

A model is **calibrated** if predictions of 0.7 come true about 70% of the time. Check with `CalibrationDisplay` and the Brier score; fix with `CalibratedClassifierCV`.

### Regression metrics

| Metric | Formula idea | Notes |
|---|---|---|
| MAE | mean of absolute errors | Same units as target; robust to outliers |
| RMSE | square root of mean squared error | Penalises big errors more |
| R² | 1 − SSE / total variance | 1 is perfect; 0 equals predicting the mean; can be negative |
| MAPE | mean absolute percentage error | Breaks down when true values are near zero |

### Uncertainty and slices

A test set is a sample, so metrics have uncertainty. Report confidence intervals (e.g. bootstrap) and break results down by **slices** such as region, device or demographic group. A good average can hide a group where the model fails, which is also a fairness concern.

## Real-world example

A hospital triage model flags patients who may deteriorate. Clinicians agreed that missing a deteriorating patient is far worse than an extra check, but too many alerts cause alert fatigue. The team chose the threshold that gave the required recall on validation data, then reported precision at that recall, the expected number of alerts per shift, and recall per ward and age group. One ward had noticeably lower recall because of different recording practices, which became a data-quality fix rather than a model change.

## Step-by-step walkthrough

```python
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    confusion_matrix, classification_report, roc_auc_score,
    average_precision_score, precision_recall_curve, f1_score,
)

# Imbalanced data: about 5% positives
X, y = make_classification(n_samples=5000, n_features=20, weights=[0.95], random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)

model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
proba = model.predict_proba(X_te)[:, 1]
pred = (proba >= 0.5).astype(int)

print(confusion_matrix(y_te, pred))
print(classification_report(y_te, pred, digits=3))
print("ROC AUC:", round(roc_auc_score(y_te, proba), 3))
print("Average precision:", round(average_precision_score(y_te, proba), 3))

# Choose the threshold with best precision subject to recall >= 0.8
prec, rec, thr = precision_recall_curve(y_te, proba)
ok = rec[:-1] >= 0.8
best = np.argmax(np.where(ok, prec[:-1], -1))
print(f"threshold {thr[best]:.3f}: precision {prec[best]:.3f}, recall {rec[best]:.3f}")

# Bootstrap 95% confidence interval for F1
rng = np.random.default_rng(0)
f1s = []
for _ in range(1000):
    idx = rng.integers(0, len(y_te), len(y_te))
    f1s.append(f1_score(y_te[idx], pred[idx]))
print("F1 95% CI:", np.percentile(f1s, [2.5, 97.5]).round(3))
```

(In a real project choose the threshold on validation data, not the test set.)

## Expected output

Accuracy in the classification report is high mainly because negatives dominate. Recall for class 1 at threshold 0.5 is noticeably lower than accuracy. ROC AUC is typically higher than average precision on this imbalanced data. The chosen threshold is likely below 0.5, trading precision for recall. The F1 interval shows the uncertainty from a finite test set.

## Common mistakes

- **Reporting accuracy alone on imbalanced data.**
- **Choosing thresholds on the test set,** which leaks and inflates results.
- **Comparing models on different test sets** or splits.
- **Ignoring uncertainty:** a 0.5-point difference may be noise.
- **Only reporting averages,** hiding failures on important slices.
- **Treating predicted probabilities as calibrated** without checking.
- **Optimising a metric nobody cares about** instead of one tied to the real decision.

## Troubleshooting

- **Precision is undefined (warning):** the model predicted no positives at that threshold; lower it or inspect scores.
- **ROC AUC high but users complain about false alarms:** look at the PR curve and absolute alert counts.
- **Metrics differ between runs:** fix random seeds and report variation across seeds or folds.

## Hands-on exercise

Write an evaluation report function `evaluate(y_true, proba, groups, threshold)` that prints the confusion matrix, precision, recall, F1, ROC AUC, average precision, and recall per value in `groups`. Test it on the synthetic data above with a random group label and explain in two sentences what you would tell a product owner.

## Key takeaways summary

Start from the confusion matrix, pick metrics that reflect the real cost of false positives and false negatives, choose thresholds deliberately on validation data, use PR curves for rare positives, check calibration when probabilities matter, and always report uncertainty and per-slice results.
