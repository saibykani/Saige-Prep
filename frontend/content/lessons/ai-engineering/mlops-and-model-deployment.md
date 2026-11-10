---
slug: mlops-and-model-deployment
title: MLOps and Model Deployment
summary: Learn how to take a model from a notebook to a reliable service, with experiment tracking in MLflow, a model registry, a FastAPI inference API, a Docker image, CI checks and safe rollout strategies.
level: intermediate
duration: 60
tags: [mlops, deployment, mlflow, fastapi, docker]
objectives:
  - Describe the machine learning lifecycle and what MLOps adds to normal DevOps
  - Track parameters, metrics and artefacts with MLflow and register model versions
  - Serve a model behind a validated FastAPI endpoint and package it with Docker
  - Choose between batch, online and streaming inference and between canary, shadow and blue-green rollouts
  - Write tests and CI gates for data, model quality and the serving API
prerequisites:
  - Python and basic machine learning with scikit-learn
  - HTTP APIs and JSON
  - Basic Docker and Git usage
related: [machine-learning-fundamentals, model-evaluation-metrics, monitoring-ai-in-production, ai-cost-latency-and-scaling, fine-tuning-and-adaptation, testing-ai-systems-strategy]
references:
  - title: MLflow documentation
    url: https://mlflow.org/docs/latest/index.html
  - title: FastAPI documentation
    url: https://fastapi.tiangolo.com/
  - title: FastAPI — FastAPI in Containers (Docker)
    url: https://fastapi.tiangolo.com/deployment/docker/
  - title: Google Cloud — MLOps, continuous delivery and automation pipelines in machine learning
    url: https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning
videos:
  - id: biqYkVf-a7Y
    title: "MLOps Explained - What It Is, Why You Need It and How It Works"
    channel: "TechWorld with Nana"
  - id: e1rl1DYfPy4
    title: "What is ML Ops?"
    channel: "codebasics"
interview:
  - q: What makes MLOps different from ordinary DevOps?
    a: In normal software, behaviour is defined by code, so versioning and testing code is most of the job. In ML, behaviour depends on code, data and the trained model together, so all three must be versioned and linked. Models can degrade without any code change when real data drifts, so monitoring and retraining become part of the lifecycle. Testing also extends to data validation, model quality gates on held-out data and checking that training and serving use the same preprocessing.
  - q: How would you roll out a new model version safely?
    a: First it must pass offline gates on a fixed test set compared with the current model. Then I would run it in shadow mode, receiving copies of real traffic without affecting users, to compare outputs, latency and errors. Next a canary releases it to a small percentage of traffic with monitoring and automatic rollback triggers. Only then do I ramp up. The registry keeps the previous version so rollback is a configuration change, not a rebuild.
  - q: What is training-serving skew and how do you prevent it?
    a: It is when the features or preprocessing at inference differ from those used in training, so the model sees inputs it was not trained on. Prevention includes packaging preprocessing with the model, for example as a scikit-learn pipeline, sharing feature code between training and serving, logging served inputs and comparing their distributions with training data, and having a test that runs the same raw record through both paths.
practice:
  - "Train two scikit-learn models with different hyperparameters, log both runs to MLflow, and register the better one as a new model version."
  - "Wrap the registered model in a FastAPI service with a Pydantic request model, a health endpoint and a version endpoint, then build and run it in Docker."
  - "Write pytest tests for the API that cover a valid prediction, an invalid payload returning 422 and the reported model version."
takeaways:
  - MLOps versions and links code, data and models, and treats monitoring and retraining as part of the lifecycle.
  - Experiment tracking records parameters, metrics and artefacts so results can be reproduced and compared.
  - A model registry gives named versions and makes promotion and rollback explicit.
  - Serving should validate input, report its model version and bundle preprocessing with the model.
  - Roll out with offline gates, shadow traffic and canaries, and keep rollback cheap.
quiz:
  - id: mlops-deploy-q1
    type: single
    topic: mlops-and-model-deployment
    difficulty: intermediate
    prompt: What does shadow deployment mean?
    options: ["Deploying only at night", "The new model receives a copy of live traffic but its outputs are not returned to users", "Hiding the model behind a VPN", "Sending all traffic to the new model and keeping the old one as backup"]
    answer: [1]
    explanation: In shadow mode the candidate processes mirrored requests so you can compare behaviour and performance with no user impact.
  - id: mlops-deploy-q2
    type: multiple
    topic: mlops-and-model-deployment
    difficulty: intermediate
    prompt: Which should be recorded so a model result can be reproduced? Select all that apply.
    options: ["Code commit", "Training data version or hash", "Hyperparameters and random seed", "The colour theme of the notebook"]
    answer: [0, 1, 2]
    explanation: Code, data, configuration and seeds together determine the trained model. The notebook theme does not.
  - id: mlops-deploy-q3
    type: scenario
    topic: mlops-and-model-deployment
    difficulty: intermediate
    prompt: A model scores well offline but badly in production, and you find the API lower-cases text while training did not. What is this?
    options: ["Concept drift", "Training-serving skew", "Overfitting", "Label leakage"]
    answer: [1]
    explanation: Different preprocessing between training and serving is training-serving skew. Bundling preprocessing with the model prevents it.
  - id: mlops-deploy-q4
    type: truefalse
    topic: mlops-and-model-deployment
    difficulty: beginner
    prompt: Once a model is deployed with tests passing, it will keep the same accuracy as long as the code does not change.
    options: ["True", "False"]
    answer: [1]
    explanation: Real-world data changes over time, so accuracy can fall with no code change. That is why monitoring is part of MLOps.
---

## Beginner-friendly explanation

Training a model in a notebook is like cooking one good meal at home. Running a restaurant is different: the recipe must be written down, ingredients must be consistent, every dish must come out the same, and someone must notice when customers stop finishing their plates.

**MLOps** (machine learning operations) is the set of practices that turns a one-off model into a dependable service. It covers:

- **Tracking experiments** so you know exactly how a model was made.
- **Versioning** code, data and models together.
- **Packaging and serving** the model so other systems can call it.
- **Testing and gating** releases on quality, not just on "the code compiles".
- **Monitoring and retraining** when the world changes.

## Technical explanation

### The lifecycle

1. Data collection and validation
2. Feature engineering and training
3. Evaluation against a held-out set and the current production model
4. Registration of an approved model version
5. Deployment (batch, online or streaming)
6. Monitoring of inputs, outputs, latency and outcomes
7. Retraining or rollback, which starts the loop again

Maturity grows from manual notebooks, to automated training pipelines, to CI/CD that also retrains and redeploys models when gates pass.

### Experiment tracking and registries

A tracking tool such as **MLflow** records each run's parameters, metrics, artefacts (the model file, plots) and tags such as the Git commit. Runs are grouped into experiments and can be compared in a UI. The **model registry** gives a model a name and numbered versions, with aliases such as `champion` or `challenger`, so deployment code loads `models:/fraud@champion` rather than a file path.

### Inference patterns

| Pattern | When | Example |
|---|---|---|
| Batch | Predictions can be computed ahead of time | Nightly churn scores |
| Online (request/response) | Answer needed now | Fraud check at checkout |
| Streaming | Continuous events | Sensor anomaly detection |

### Serving

A serving layer should validate inputs strictly, run the same preprocessing as training, return the model version with each prediction, expose health and readiness checks, and log inputs and outputs (with privacy controls) for monitoring. FastAPI with Pydantic models is a common Python choice; dedicated servers exist for high-throughput or GPU workloads.

### Rollout strategies

- **Blue-green:** two identical environments; switch traffic at once, switch back to roll back.
- **Canary:** send a small percentage of traffic to the new version and increase gradually.
- **Shadow:** mirror traffic to the new version without returning its output.
- **A/B test:** split users to measure business impact with statistical analysis.

### Testing in MLOps

- **Data tests:** schema, ranges, missing values, duplicates.
- **Model tests:** quality gate against a fixed test set and the champion, slice metrics, invariance tests (for example, changing a name should not change a credit decision).
- **Serving tests:** contract tests, invalid input, latency budget, version reporting.
- **Skew test:** the same raw record produces the same features in training and serving code.

## Real-world example

A retailer's demand-forecasting model was retrained by hand every quarter from a data scientist's laptop. When forecasts went wrong, nobody could say which data or code produced the deployed model. The team moved training into a scheduled pipeline that logged every run to MLflow with the data snapshot ID and Git commit, added a gate that blocked registration unless error on the last eight weeks beat the current champion, and deployed through a canary. The next time accuracy dropped, they could trace it to a supplier feed that had changed units, roll back in minutes and add a data test for that column.

## Step-by-step walkthrough

1. Put training code in a script, not only a notebook, and fix the random seed.
2. Log parameters, metrics, the model and the Git commit to MLflow.
3. Compare runs and register the best model; set an alias such as `champion`.
4. Write a FastAPI app that loads the model by alias at startup.
5. Add request validation, `/health` and `/version` endpoints.
6. Package with Docker, pinning dependency versions.
7. In CI: run unit, data and API tests, then the quality gate.
8. Deploy as shadow or canary, monitor, then promote.

## Code examples

Training with MLflow tracking and registration:

```python
# pip install mlflow scikit-learn
import mlflow, mlflow.sklearn
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

mlflow.set_experiment("cancer-classifier")
for C in [0.1, 1.0, 10.0]:
    with mlflow.start_run():
        model = make_pipeline(StandardScaler(), LogisticRegression(C=C, max_iter=1000))
        model.fit(X_tr, y_tr)
        f1 = f1_score(y_te, model.predict(X_te))
        mlflow.log_param("C", C)
        mlflow.log_metric("f1", f1)
        mlflow.sklearn.log_model(model, name="model", input_example=X_te.head(2),
                                 registered_model_name="cancer-classifier")
        print(f"C={C} f1={f1:.3f}")
```

The scaler lives inside the pipeline, so serving cannot forget it. Run `mlflow ui` to compare runs. Parameter names in `log_model` have changed across MLflow versions, so check the docs for the version you install.

A FastAPI service:

```python
# app.py  -  pip install fastapi uvicorn mlflow scikit-learn pandas
import os
import mlflow.pyfunc
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field

MODEL_URI = os.environ.get("MODEL_URI", "models:/cancer-classifier/1")
model = mlflow.pyfunc.load_model(MODEL_URI)
app = FastAPI(title="cancer-classifier")

class Features(BaseModel):
    model_config = ConfigDict(extra="forbid")
    values: dict[str, float] = Field(min_length=1)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/version")
def version():
    return {"model_uri": MODEL_URI}

@app.post("/predict")
def predict(body: Features):
    pred = model.predict(pd.DataFrame([body.values]))
    return {"prediction": int(pred[0]), "model_uri": MODEL_URI}
```

A Dockerfile:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
ENV MODEL_URI=models:/cancer-classifier/1
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

API tests with pytest:

```python
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_invalid_payload_rejected():
    assert client.post("/predict", json={"values": {}, "extra": 1}).status_code == 422

def test_version_reported():
    assert "model_uri" in client.get("/version").json()
```

In the container, the tracking URI must point at a reachable MLflow server or the model must be copied into the image.

## Expected output

The training script prints an F1 score for each C value, and the MLflow UI shows three runs with parameters and metrics, plus versions 1 to 3 of `cancer-classifier` in the registry. `docker run -p 8000:8000 image` serves `/docs` with the interactive OpenAPI page; `/predict` returns a prediction and the model URI, and an unknown field returns 422.

## Common mistakes

- **Notebook-only training** with no script, seed or record of the data used.
- **Preprocessing outside the model artefact**, causing training-serving skew.
- **Loading "latest"** instead of a pinned version or alias, so deployments change silently.
- **Gating only on code tests** and never on model quality.
- **No rollback path**, because the previous model was overwritten.
- **Unpinned dependencies**, so the image behaves differently from training.
- **Logging raw personal data** from requests without a retention policy.

## Troubleshooting

- **Model loads locally but not in Docker:** the tracking URI or artefact store is not reachable from the container; set `MLFLOW_TRACKING_URI` or bake the model in.
- **Version mismatch warnings:** pin scikit-learn and MLflow to the training versions.
- **Slow first request:** load the model at startup, not per request.

## Exercise

Build the full loop: train, track, register, serve, containerise and test. Then train a deliberately worse model and show that your CI gate refuses to promote it. Document how you would roll back.

## Key takeaways summary

MLOps makes models reproducible and operable. Track every run, register versions, bundle preprocessing, serve with strict validation and version reporting, gate releases on quality, roll out gradually and keep rollback cheap. Then monitor, because data will change.
