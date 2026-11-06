---
slug: ai-landscape-and-roles
title: The AI Landscape and AI Career Roles
summary: Understand how artificial intelligence, machine learning, deep learning and generative AI relate, and what AI Engineers, AI Test Engineers, AI Specialists and AI Scientists actually do day to day.
level: beginner
duration: 40
tags: [ai, machine-learning, careers, llm, generative-ai]
objectives:
  - Distinguish artificial intelligence, machine learning, deep learning and generative AI
  - Describe the AI product lifecycle from data to monitoring
  - Explain the responsibilities of the AI Engineer, AI Test Engineer, AI Specialist and AI Scientist roles
  - Map the lessons in this track to the roles they prepare you for
prerequisites:
  - Basic computer literacy
  - Curiosity about how software that learns from data is built and tested
related: [python-for-ai, machine-learning-fundamentals, llm-fundamentals-and-tokens, testing-ai-systems-strategy, reading-ai-research-papers]
references:
  - title: Google — Machine Learning Crash Course
    url: https://developers.google.com/machine-learning/crash-course
  - title: NIST — AI Risk Management Framework
    url: https://www.nist.gov/itl/ai-risk-management-framework
  - title: scikit-learn — Getting Started
    url: https://scikit-learn.org/stable/getting_started.html
  - title: PyTorch — Learn the Basics
    url: https://docs.pytorch.org/tutorials/beginner/basics/intro.html
interview:
  - q: What is the difference between machine learning and traditional programming?
    a: In traditional programming a developer writes explicit rules that turn inputs into outputs. In machine learning the developer supplies example inputs, often with known outputs, and a training algorithm finds the parameters of a model that maps inputs to outputs. The rules are learned from data rather than written by hand, so behaviour depends on data quality and is probabilistic rather than exactly specified.
  - q: How does testing an AI system differ from testing a conventional application?
    a: Outputs are often non-deterministic and there may be no single correct answer, so exact-match assertions rarely work. You evaluate on representative datasets with statistical metrics, check behaviour across slices of users, test robustness to unusual and adversarial inputs, watch for bias and safety issues, and keep monitoring in production because data drifts over time. Conventional functional, API and performance testing of the surrounding application is still needed.
  - q: How would you describe the difference between an AI Engineer and an AI Scientist?
    a: An AI Engineer builds reliable products with models, usually integrating existing models or APIs, wiring data pipelines, retrieval, evaluation and deployment. An AI Scientist advances the methods themselves, forming hypotheses, designing experiments, training or modifying models and reporting results rigorously. The engineer optimises for a working, maintainable system; the scientist optimises for new, validated knowledge. In practice the roles overlap and collaborate.
practice:
  - "Pick three AI features you use (for example spam filtering, photo search, a chat assistant). For each, write whether it is classic ML, deep learning or generative AI, and what could go wrong for a user."
  - "Read two real job adverts for AI-related roles and highlight which responsibilities match the Engineer, Test Engineer, Specialist and Scientist descriptions in this lesson."
  - "Draw the AI product lifecycle for one feature and mark which role owns each stage."
takeaways:
  - AI is the broad goal; machine learning learns from data; deep learning uses multi-layer neural networks; generative AI produces new content.
  - Models are only one part of an AI product; data, evaluation, deployment and monitoring matter as much.
  - AI Engineers build, AI Test Engineers assure quality, AI Specialists apply AI to a domain or capability, AI Scientists advance methods.
  - This track builds shared foundations first, then branches into building, testing, operating and researching AI.
quiz:
  - id: aie-landscape-q1
    type: single
    topic: ai-landscape-and-roles
    difficulty: beginner
    prompt: Which statement best describes the relationship between AI, machine learning and deep learning?
    options: ["They are three unrelated fields", "Deep learning is a subset of machine learning, which is a subset of AI", "AI is a subset of deep learning", "Machine learning is a subset of deep learning"]
    answer: [1]
    explanation: AI is the broadest field. Machine learning is one approach to AI that learns from data, and deep learning is a family of machine learning methods using multi-layer neural networks.
  - id: aie-landscape-q2
    type: scenario
    topic: ai-landscape-and-roles
    difficulty: beginner
    prompt: A team needs someone to design an evaluation dataset, measure hallucination rate across releases and run prompt-injection tests on a chatbot. Which role fits best?
    options: ["AI Scientist", "AI Test Engineer", "Database administrator", "UX writer"]
    answer: [1]
    explanation: Designing evaluations, regression-testing model behaviour and adversarial testing are core AI Test Engineer responsibilities.
  - id: aie-landscape-q3
    type: truefalse
    topic: ai-landscape-and-roles
    difficulty: beginner
    prompt: Once a model reaches good accuracy on its test set, it no longer needs monitoring in production.
    options: ["True", "False"]
    answer: [1]
    explanation: Real-world data changes over time (drift), users find new inputs and upstream systems change, so production monitoring is essential.
  - id: aie-landscape-q4
    type: multiple
    topic: ai-landscape-and-roles
    difficulty: beginner
    prompt: Which of these are typically generative AI tasks? Select all that apply.
    options: ["Writing a draft email from a short instruction", "Predicting whether a transaction is fraudulent", "Creating an image from a text description", "Summarising a long document"]
    answer: [0, 2, 3]
    explanation: Generative models produce new content such as text or images. Fraud prediction is a classification task, usually handled by discriminative models.
---

## Beginner-friendly explanation

Imagine teaching a child to recognise cats. You do not hand them a rulebook ("pointy ears, whiskers, four legs"). You show them many pictures and say "cat" or "not cat" until they get it. **Machine learning** works the same way: instead of writing rules, we show a computer many examples and let an algorithm adjust a **model** until its answers match the examples.

**Artificial intelligence (AI)** is the broad goal of making computers do tasks that normally need human intelligence: understanding language, recognising images, making decisions. Machine learning is the most successful way we have found to do it. **Deep learning** is a kind of machine learning that uses large **neural networks** with many layers. **Generative AI** uses (mostly deep learning) models to *create* new content: text, images, code, audio. Large language models (LLMs) such as chat assistants are generative AI.

```text
+--------------------------------------------------+
| Artificial Intelligence                          |
|   +------------------------------------------+   |
|   | Machine Learning                         |   |
|   |   +----------------------------------+   |   |
|   |   | Deep Learning                    |   |   |
|   |   |   +--------------------------+   |   |   |
|   |   |   | Generative AI / LLMs     |   |   |   |
|   |   |   +--------------------------+   |   |   |
|   |   +----------------------------------+   |   |
|   +------------------------------------------+   |
+--------------------------------------------------+
```

AI is now built into everyday software, which means companies need people who can **build** it, **test** it, **apply** it well in specific domains and **invent** better methods. Those four needs map to four role families you will meet in this track.

## Technical explanation

### Kinds of machine learning

| Type | What the data looks like | Example task | Example algorithms |
|---|---|---|---|
| Supervised learning | Inputs with known labels | Spam or not spam; house price | Logistic regression, random forests, neural networks |
| Unsupervised learning | Inputs without labels | Group customers by behaviour | k-means clustering, PCA |
| Reinforcement learning | An agent gets rewards from an environment | Game playing, robot control | Q-learning, policy gradients |
| Self-supervised learning | Labels created from the data itself | Predict the next word in a sentence | Transformer language models |

LLMs are pretrained with self-supervised learning (predicting the next token over huge text collections) and are then usually adapted with supervised fine-tuning and preference-based methods so they follow instructions.

### Discriminative vs generative

A **discriminative** model predicts a label or number from an input ("is this email spam?"). A **generative** model produces new samples ("write an email"). Many products combine both: a generative assistant may use a discriminative classifier as a safety filter.

### The AI product lifecycle

A model is only one part of an AI system. A typical lifecycle:

```text
Problem framing -> Data collection & labelling -> Training or model selection
      -> Evaluation -> Deployment -> Monitoring -> (feedback) -> Data ...
```

| Stage | Key questions | Typical artefacts |
|---|---|---|
| Problem framing | What decision does this support? What does "good" mean? | Success metrics, risk assessment |
| Data | Is it representative, legal to use, correctly labelled? | Datasets, data cards |
| Modelling | Train our own, fine-tune, or call an API? | Model, training code, prompts |
| Evaluation | Does it meet the bar on the right metrics and slices? | Eval reports, test sets |
| Deployment | How is it served, versioned and rolled back? | API service, model registry |
| Monitoring | Is quality, cost or input data drifting? | Dashboards, alerts |

### The four roles

**AI Engineer.** Builds production features with models. Today that often means integrating LLM APIs, writing prompts and structured outputs, building retrieval-augmented generation (RAG) with embeddings and vector search, wiring tools and agents, and deploying with good latency and cost. Strong software engineering is the base skill: APIs, testing, data handling, cloud deployment.

**AI Test Engineer.** Assures quality of AI-powered systems. Designs evaluation datasets, chooses metrics, builds automated eval suites that run in CI, uses LLM-as-judge with human calibration, performs red teaming and prompt-injection testing, checks fairness across user groups, and still covers classic functional, API and performance testing of the surrounding app. They also use AI to accelerate test automation.

**AI Specialist.** Applies AI deeply within a domain or capability: for example responsible AI and governance, MLOps, fine-tuning, or AI for a specific industry such as healthcare or finance. Specialists combine solid ML understanding with domain knowledge and often advise on risk, regulation and model choices.

**AI Scientist (or Research Scientist).** Advances the methods. Reads and writes research papers, forms hypotheses, designs controlled experiments with proper baselines and statistics, trains and modifies models, and publishes or transfers results into products. Strong maths, experimental rigour and deep learning framework skills (such as PyTorch) are central.

| | AI Engineer | AI Test Engineer | AI Specialist | AI Scientist |
|---|---|---|---|---|
| Main question | Can we ship it reliably? | Can we trust it? | Is it right for this domain and risk? | Is there a better method? |
| Core output | Working features | Evals, test suites, risk findings | Guidance, tuned systems, policy | Experiments, papers, new models |
| Key skills | Software engineering, APIs, RAG | Evaluation design, statistics, adversarial testing | Domain + ML depth | Maths, research methods, PyTorch |

### How this track maps to the roles

| Lessons | Engineer | Test Engineer | Specialist | Scientist |
|---|---|---|---|---|
| Foundations: Python, maths, ML fundamentals, evaluation metrics | Yes | Yes | Yes | Yes |
| Neural networks, PyTorch, transformers | Useful | Useful | Yes | Essential |
| LLMs, prompting, APIs, embeddings, RAG, agents | Essential | Essential | Yes | Useful |
| Testing strategy, evals, LLM-as-judge, red teaming, bias | Useful | Essential | Yes | Useful |
| Fine-tuning, MLOps, monitoring, cost and scaling | Essential | Useful | Essential | Useful |
| Governance and regulation | Useful | Useful | Essential | Useful |
| Reading papers, experiment design, advanced topics | Useful | Useful | Useful | Essential |

## Real-world example

A support team adds an AI assistant that answers customer questions from the help centre.

- The **AI Engineer** builds a RAG pipeline: help articles are split into chunks, embedded and stored in a vector index; the assistant retrieves relevant chunks and asks an LLM to answer with citations.
- The **AI Test Engineer** builds a set of a few hundred real, anonymised questions with expected facts, measures answer correctness and citation accuracy on every change, and red-teams the bot with prompt-injection attempts hidden in user messages.
- An **AI Specialist** in responsible AI checks that the assistant discloses it is automated, handles personal data correctly and escalates to humans for sensitive topics, in line with the company's obligations.
- An **AI Scientist** on a research team experiments with a new retrieval re-ranking method and shows, with a controlled experiment, whether it improves answer quality enough to adopt.

## Step-by-step walkthrough

Here is a tiny taste of "learning from data" using scikit-learn. Install with `pip install scikit-learn`.

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

# 1. Data: 150 iris flowers, 4 measurements each, 3 species labels
X, y = load_iris(return_X_y=True)

# 2. Hold some data back to test honestly
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 3. Train: the algorithm finds rules from examples
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# 4. Evaluate on unseen data
print("Test accuracy:", model.score(X_test, y_test))
```

Nobody wrote "if petal length < 2.5 then setosa"; the decision tree learned rules like that from the examples.

## Expected output

The script prints a test accuracy close to 1.0 for this easy dataset (the exact value depends on the split). Real problems are much harder, which is why evaluation gets a whole lesson later in the track.

## Common mistakes

- **Thinking AI means only chatbots.** Classic ML (fraud detection, recommendations, forecasting) is still everywhere.
- **Focusing only on the model.** Data quality, evaluation and monitoring decide whether a product works.
- **Assuming model outputs are always right.** Models are probabilistic and can be confidently wrong; LLMs can invent facts (hallucinate).
- **Skipping foundations.** Jumping straight to LLM APIs without understanding evaluation makes it hard to know whether a change helped.
- **Treating role titles as fixed.** Companies use the titles differently; read the responsibilities, not just the title.

## Troubleshooting

- **Unsure which role to aim for?** If you enjoy building products, start with the Engineer path. If you enjoy breaking things and measuring quality, the Test Engineer path. If you love a domain or governance, Specialist. If you love maths and experiments, Scientist.
- **Overwhelmed by tools and news?** Focus on the stable foundations in the first eight lessons; they change slowly.

## Hands-on exercise

Write a one-page "AI feature brief" for a product you know. Include: the task, whether it is classification, regression or generation, what data it needs, how you would measure success, two ways it could harm users, and which of the four roles would own each lifecycle stage.

## Key takeaways summary

AI is the broad field, machine learning learns from data, deep learning uses multi-layer neural networks, and generative AI creates new content. Building trustworthy AI products needs engineers who build, testers who measure and challenge, specialists who apply AI responsibly in context, and scientists who improve the methods. This track starts with shared foundations and then branches toward each role.
