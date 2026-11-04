---
slug: machine-learning-fundamentals
title: Machine Learning Fundamentals
summary: Learn the core supervised learning workflow, covering features and labels, train, validation and test splits, classification versus regression, overfitting, preprocessing pipelines and cross-validation, all with scikit-learn.
level: beginner
duration: 60
tags: [machine-learning, scikit-learn, supervised-learning, overfitting, cross-validation]
objectives:
  - Frame a problem as classification or regression with features and labels
  - Split data into training, validation and test sets and explain why
  - Diagnose underfitting and overfitting and apply regularisation
  - Build a scikit-learn Pipeline with preprocessing and evaluate it with cross-validation
prerequisites:
  - Python for AI (NumPy and pandas)
  - Math for machine learning (gradient descent, loss)
related: [math-for-machine-learning, model-evaluation-metrics, neural-networks-and-deep-learning, python-for-ai, testing-ai-systems-strategy]
references:
  - title: scikit-learn — Getting Started
    url: https://scikit-learn.org/stable/getting_started.html
  - title: scikit-learn — Cross-validation, evaluating estimator performance
    url: https://scikit-learn.org/stable/modules/cross_validation.html
  - title: scikit-learn — Common pitfalls and recommended practices
    url: https://scikit-learn.org/stable/common_pitfalls.html
  - title: Google Machine Learning Crash Course
    url: https://developers.google.com/machine-learning/crash-course
interview:
  - q: What is overfitting and how do you detect it?
    a: Overfitting is when a model learns noise and quirks of the training data rather than general patterns, so it performs well on training data and worse on unseen data. You detect it by comparing training and validation performance; a large gap, or validation performance getting worse while training keeps improving, indicates overfitting. Remedies include more data, simpler models, regularisation, early stopping and better features.
  - q: What is data leakage? Give an example.
    a: Leakage is when information that would not be available at prediction time, or information from the test set, influences training. Examples are fitting a scaler on the full dataset before splitting, including a feature that is derived from the label such as a refund flag when predicting fraud, or putting records of the same customer in both train and test. Leakage produces optimistic scores that collapse in production. Pipelines and careful splits prevent many cases.
  - q: Why keep a separate test set if you already use cross-validation?
    a: Cross-validation is used to choose models and hyperparameters, so those choices are tuned to that data. A held-out test set, touched once at the end, gives an unbiased estimate of performance on new data for the final chosen model.
practice:
  - "Train a DecisionTreeClassifier with max_depth values 1 to 15 on the breast cancer dataset and plot or print training and validation accuracy for each. Identify where overfitting begins."
  - "Deliberately introduce leakage by scaling before splitting and compare cross-validation scores to the Pipeline version. Explain why the difference may be small here but dangerous in general."
  - "Pick a real problem from your work and write down the label, five candidate features, and one feature that would leak."
takeaways:
  - Supervised learning maps features to labels; classification predicts categories, regression predicts numbers.
  - Train on training data, tune on validation data or cross-validation, and report on a test set used once.
  - Underfitting means too simple; overfitting means memorising noise. Compare train and validation scores.
  - Put preprocessing inside a Pipeline to avoid leakage.
  - Always compare against a simple baseline.
quiz:
  - id: aie-mlfund-q1
    type: single
    topic: machine-learning-fundamentals
    difficulty: beginner
    prompt: Predicting tomorrow's temperature in degrees is an example of which task?
    options: ["Classification", "Regression", "Clustering", "Reinforcement learning"]
    answer: [1]
    explanation: The output is a continuous number, so it is regression.
  - id: aie-mlfund-q2
    type: scenario
    topic: machine-learning-fundamentals
    difficulty: beginner
    prompt: A model scores 99% accuracy on training data and 70% on validation data. What is most likely happening?
    options: ["Underfitting", "Overfitting", "Perfect generalisation", "The validation set is too easy"]
    answer: [1]
    explanation: A large gap between training and validation performance is the classic sign of overfitting.
  - id: aie-mlfund-q3
    type: debugging
    topic: machine-learning-fundamentals
    difficulty: intermediate
    prompt: A colleague calls StandardScaler().fit_transform(X) on the whole dataset, then splits into train and test. What is the problem?
    options: ["Nothing, scaling is harmless", "Test-set statistics leak into training preprocessing", "StandardScaler only works on test data", "The model will underfit"]
    answer: [1]
    explanation: Fitting the scaler on all data uses test-set means and variances. Fit preprocessing on training data only, ideally via a Pipeline.
  - id: aie-mlfund-q4
    type: multiple
    topic: machine-learning-fundamentals
    difficulty: intermediate
    prompt: Which actions typically reduce overfitting? Select all that apply.
    options: ["Collect more training data", "Increase regularisation strength", "Make the decision tree much deeper", "Use a simpler model"]
    answer: [0, 1, 3]
    explanation: More data, stronger regularisation and simpler models reduce variance. A deeper tree increases capacity and usually increases overfitting.
---

## Beginner-friendly explanation

Think of a student preparing for an exam with past papers. If they understand the ideas, they do well on new questions. If they just memorise the answers to the past papers, they do brilliantly on those and badly on the real exam. Machine learning has exactly this problem.

In **supervised learning** you give the algorithm examples with the right answers. Each example has **features** (the inputs, like an email's words, sender and time) and a **label** (the answer, like spam or not spam). The algorithm learns a **model** that maps features to labels. We then check it on examples it has **never seen** to find out whether it really learned or just memorised.

## Technical explanation

### Task types

| Task | Label type | Example | Typical metric |
|---|---|---|---|
| Binary classification | One of two classes | Fraud / not fraud | Precision, recall, F1, ROC AUC |
| Multiclass classification | One of many classes | Which product category | Accuracy, macro F1 |
| Regression | A number | House price | MAE, RMSE |

### Data splits

```text
All labelled data
├── Training set   (~60–80%)  -> model learns parameters
├── Validation set (~10–20%)  -> choose model and hyperparameters
└── Test set       (~10–20%)  -> final, one-time estimate
```

**Parameters** are learned during training (weights). **Hyperparameters** are set by you (tree depth, regularisation strength, learning rate) and are tuned with validation data.

**k-fold cross-validation** splits the training data into k parts, trains k times each with a different part held out, and averages the scores. It uses data efficiently and shows how much results vary.

Splits must match reality: for time-series, train on the past and test on the future; if one customer has many rows, keep all their rows on one side (`GroupKFold`); for imbalanced classes use stratified splits.

### Bias, variance, underfitting and overfitting

| | Training score | Validation score | Fix |
|---|---|---|---|
| Underfitting (high bias) | Low | Low | More features, more capable model, less regularisation |
| Good fit | High | Close to training | Ship candidate |
| Overfitting (high variance) | Very high | Much lower | More data, simpler model, regularisation, early stopping |

**Regularisation** penalises complex models. In scikit-learn's `LogisticRegression`, smaller `C` means stronger L2 regularisation. In `Ridge`, larger `alpha` means stronger regularisation.

### Preprocessing

- **Scaling** numeric features (`StandardScaler`) matters for distance- and gradient-based models (logistic regression, SVMs, k-NN, neural networks); tree models mostly do not need it.
- **Encoding** categories (`OneHotEncoder`).
- **Imputing** missing values (`SimpleImputer`).

A `Pipeline` chains these with the model so that `fit` learns preprocessing from training data only, preventing leakage during cross-validation.

### Baselines

Always compare with a trivial model, such as `DummyClassifier(strategy="most_frequent")`. If 95% of emails are not spam, a model that always says "not spam" gets 95% accuracy; your model must beat that meaningfully.

## Real-world example

A QA team wants to predict which tests are likely to be flaky so they can quarantine them. Features: historical pass rate, duration variance, number of network calls, recent code churn. Label: was the test flaky in the following week. A first model scored very high in validation, until someone noticed a feature "number of reruns this week", which is only known after the fact: leakage. Removing it dropped the score to a realistic level, and splitting by time (train on earlier weeks, test on later weeks) gave an honest estimate.

## Step-by-step walkthrough

```python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyClassifier

# 1. Load data: 569 tumours, 30 numeric features, label 0=malignant 1=benign
X, y = load_breast_cancer(return_X_y=True)

# 2. Hold out a test set, stratified to keep class proportions
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 3. Baseline
baseline = DummyClassifier(strategy="most_frequent")
print("Baseline CV accuracy:", cross_val_score(baseline, X_train, y_train, cv=5).mean().round(3))

# 4. Pipeline: scaling + model, tuned over regularisation strength C
for C in [0.001, 0.01, 0.1, 1, 10, 100]:
    pipe = make_pipeline(StandardScaler(), LogisticRegression(C=C, max_iter=5000))
    scores = cross_val_score(pipe, X_train, y_train, cv=5)
    print(f"C={C:<6} CV accuracy {scores.mean():.3f} ± {scores.std():.3f}")

# 5. Fit the chosen model on all training data, evaluate once on test
final = make_pipeline(StandardScaler(), LogisticRegression(C=1, max_iter=5000))
final.fit(X_train, y_train)
print("Train accuracy:", round(final.score(X_train, y_train), 3))
print("Test accuracy: ", round(final.score(X_test, y_test), 3))
```

In a real project, choose `C` from the cross-validation results rather than fixing it in advance, or use `GridSearchCV`.

## Expected output

The baseline scores roughly the share of the majority class (about 0.63). The logistic regression pipelines score well above that for moderate `C`, with very small `C` underfitting. Training accuracy is usually slightly higher than test accuracy. Exact numbers vary with library version and split.

## Common mistakes

- **Evaluating on training data** and reporting it as performance.
- **Tuning on the test set,** repeatedly peeking until it looks good.
- **Preprocessing before splitting,** leaking test statistics.
- **Random splits for time-based or grouped data.**
- **No baseline,** so "90% accuracy" has no context.
- **Using accuracy alone on imbalanced data** (see the evaluation metrics lesson).
- **Features that are not available at prediction time.**

## Troubleshooting

- **`ConvergenceWarning` from LogisticRegression:** scale features and/or raise `max_iter`.
- **Cross-validation scores vary a lot between folds:** small or heterogeneous data; report mean and standard deviation and consider more data.
- **Production performance far below test:** check for leakage, distribution shift and mismatched preprocessing.

## Hands-on exercise

Using the same dataset, compare `LogisticRegression`, `DecisionTreeClassifier(max_depth=3)`, `DecisionTreeClassifier()` (unlimited depth) and `RandomForestClassifier(random_state=0)` with 5-fold cross-validation inside pipelines. For each, print mean training accuracy (use `cross_validate(..., return_train_score=True)`) and validation accuracy. Label each as underfitting, good or overfitting and justify it in one sentence.

## Key takeaways summary

Supervised learning maps features to labels. Honest evaluation needs data the model has never seen: train, tune with validation or cross-validation, and test once. Watch the gap between training and validation scores, regularise when overfitting, use Pipelines to prevent leakage, and always beat a baseline.
