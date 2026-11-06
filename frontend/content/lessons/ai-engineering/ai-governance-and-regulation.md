---
slug: ai-governance-and-regulation
title: AI Governance and Regulation
summary: Understand the main frameworks shaping responsible AI work, including the EU AI Act risk tiers and phased application, the NIST AI Risk Management Framework, ISO/IEC 42001 and model cards, and what they mean for engineers and testers.
level: intermediate
duration: 55
tags: [governance, regulation, eu-ai-act, nist-ai-rmf, iso-42001]
objectives:
  - Describe the EU AI Act's risk-based structure and explain that its obligations apply in phases
  - Summarise the four functions of the NIST AI Risk Management Framework
  - Explain what ISO/IEC 42001 is and how a management-system standard differs from a law
  - Write a model card and other evidence that supports audits and risk reviews
  - Translate governance requirements into concrete engineering and testing tasks
prerequisites:
  - Bias, fairness and responsible AI basics
  - How AI systems are evaluated and monitored
related: [bias-fairness-and-responsible-ai, testing-ai-systems-strategy, llm-evaluation-and-evals, red-teaming-and-prompt-injection, monitoring-ai-in-production, mlops-and-model-deployment]
references:
  - title: EUR-Lex — Regulation (EU) 2024/1689 (Artificial Intelligence Act)
    url: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
  - title: EU Artificial Intelligence Act — explorer and implementation timeline
    url: https://artificialintelligenceact.eu/
  - title: NIST — AI Risk Management Framework
    url: https://www.nist.gov/itl/ai-risk-management-framework
  - title: ISO — ISO/IEC 42001:2023 AI management systems
    url: https://www.iso.org/standard/81230.html
  - title: Mitchell et al. — Model Cards for Model Reporting (arXiv 1810.03993)
    url: https://arxiv.org/abs/1810.03993
interview:
  - q: Explain the risk-based approach of the EU AI Act.
    a: The Act sorts AI uses by risk. A small set of practices is prohibited, such as certain manipulative techniques and social scoring by public or private actors as defined in the Act. High-risk systems, for example AI used as safety components of regulated products or in listed areas such as employment, education, credit and essential services, carry obligations including risk management, data governance, technical documentation, logging, transparency to deployers, human oversight, and accuracy, robustness and cybersecurity. Some systems carry transparency duties, for example telling people they are interacting with an AI or marking AI-generated content. Everything else has few specific obligations. There are separate rules for general-purpose AI models. Exact scope depends on the legal text, so real classification decisions go to legal and compliance specialists.
  - q: What are the four functions of the NIST AI RMF?
    a: Govern, Map, Measure and Manage. Govern sets up culture, policies, roles and accountability and applies across the others. Map establishes context and identifies risks for a specific system. Measure analyses and tracks those risks with quantitative and qualitative methods, including testing and evaluation. Manage prioritises and acts on risks, including responses, monitoring and incident handling. It is voluntary guidance, not a law.
  - q: As a tester, how do you contribute to AI governance?
    a: I turn requirements into verifiable evidence. That includes evaluation reports on held-out data with slice and fairness metrics, robustness and red-team results, logging tests that prove decisions are traceable, tests of human-oversight controls such as override and escalation, monitoring and drift alerts, and keeping the model card and data documentation accurate and versioned with each release. I also flag when a change in intended use might move a system into a different risk category.
practice:
  - "Write a model card for a model you have trained, covering intended use, out-of-scope uses, training data, evaluation data, metrics by slice, limitations and ethical considerations."
  - "Map a hypothetical CV-screening tool against the NIST AI RMF functions and list three concrete tests for each Measure activity you identify."
  - "Read the official EU AI Act timeline page and write down, with dates and sources, which obligations already apply today and which are still pending. Note any proposed amendments."
takeaways:
  - The EU AI Act is risk-based, with prohibited practices, high-risk obligations, transparency duties and rules for general-purpose AI models.
  - Its obligations apply in phases, so always check the official text and current timeline.
  - The NIST AI RMF is voluntary guidance organised as Govern, Map, Measure and Manage.
  - ISO/IEC 42001 specifies requirements for an AI management system that organisations can be certified against.
  - "Engineers and testers supply the evidence: documentation, evaluations, logs, oversight tests and model cards."
quiz:
  - id: ai-gov-q1
    type: single
    topic: ai-governance-and-regulation
    difficulty: intermediate
    prompt: Which of these is one of the four core functions of the NIST AI RMF?
    options: ["Certify", "Map", "Encrypt", "Deploy"]
    answer: [1]
    explanation: The functions are Govern, Map, Measure and Manage.
  - id: ai-gov-q2
    type: truefalse
    topic: ai-governance-and-regulation
    difficulty: intermediate
    prompt: All obligations of the EU AI Act started to apply on the same day the regulation entered into force.
    options: ["True", "False"]
    answer: [1]
    explanation: The Act entered into force in 2024 but its provisions apply in stages, with prohibitions applying first and other obligations later. Always check the current official timeline.
  - id: ai-gov-q3
    type: single
    topic: ai-governance-and-regulation
    difficulty: intermediate
    prompt: What kind of document is ISO/IEC 42001?
    options: ["A European law", "A management-system standard for AI that organisations can be audited and certified against", "A benchmark dataset", "A programming library"]
    answer: [1]
    explanation: ISO/IEC 42001 specifies requirements for establishing, implementing, maintaining and improving an AI management system.
  - id: ai-gov-q4
    type: multiple
    topic: ai-governance-and-regulation
    difficulty: intermediate
    prompt: Which sections belong in a model card as proposed by Mitchell et al.? Select all that apply.
    options: ["Intended use", "Evaluation data and metrics", "Ethical considerations and caveats", "The marketing slogan"]
    answer: [0, 1, 2]
    explanation: Model cards document intended use, factors, metrics, evaluation and training data, quantitative analyses, ethical considerations and caveats.
---

## Beginner-friendly explanation

AI systems can affect who gets a job interview, a loan or medical attention. **Governance** is how an organisation decides who is accountable, what risks are acceptable and how it proves it behaved responsibly. **Regulation** is what the law requires.

Think of it like food safety. There are laws (what you must do), standards (a recognised way of running a safe kitchen that an inspector can certify), and good practice guides (advice on how to do it well). For AI the rough equivalents are:

- **Law:** the EU AI Act (and other national and sector rules).
- **Certifiable standard:** ISO/IEC 42001, an AI management system.
- **Guidance framework:** the NIST AI Risk Management Framework.
- **Documentation practice:** model cards, datasheets and system cards.

This lesson is an engineer's orientation, not legal advice. Laws change and their details matter, so real decisions go through legal and compliance teams using the official texts.

## Technical explanation

### The EU AI Act

Regulation (EU) 2024/1689 entered into force on 1 August 2024. It is **risk-based**:

| Tier | Idea | Examples of what follows |
|---|---|---|
| Prohibited practices | Uses considered unacceptable | Banned, subject to the Act's definitions and exceptions |
| High-risk | AI in regulated products or listed areas (for example employment, education, access to essential services, law enforcement) | Risk management, data governance, technical documentation, record-keeping, transparency to deployers, human oversight, accuracy, robustness, cybersecurity, conformity assessment |
| Transparency obligations | Systems that interact with people or generate content | Disclose AI interaction; label certain synthetic content |
| Minimal risk | Most other AI | Few specific obligations; voluntary codes |

There are also obligations for **general-purpose AI (GPAI) models**, with additional duties for models deemed to pose systemic risk.

**Phased application.** Obligations apply in stages. Prohibitions and AI-literacy provisions have applied since 2 February 2025, and the obligations for general-purpose AI (GPAI) models since 2 August 2025. Most remaining provisions apply from 2 August 2026. Following later amendments, the official implementation timeline (checked November 2026) lists the core high-risk requirements as applying from 2 December 2027 for Annex III systems and from 2 August 2028 for Annex I systems (high-risk AI in products that are already regulated). Dates have changed before, so verify them against EUR-Lex and the official implementation pages before relying on them.

Roles matter: **providers** (who develop or place a system on the market) and **deployers** (who use it) have different duties.

### NIST AI RMF

The NIST AI Risk Management Framework (AI RMF 1.0, released January 2023) is voluntary. Its core has four functions:

- **Govern:** policies, roles, accountability, culture. Cross-cutting.
- **Map:** context, intended use, stakeholders, potential harms.
- **Measure:** analyse, test and track risks.
- **Manage:** prioritise and act on risks, monitor, respond to incidents.

NIST also publishes a companion Playbook and a Generative AI Profile (NIST AI 600-1) that applies the framework to generative AI risks. It describes characteristics of trustworthy AI, such as valid and reliable, safe, secure and resilient, accountable and transparent, explainable and interpretable, privacy-enhanced, and fair with harmful bias managed.

### ISO/IEC 42001

ISO/IEC 42001:2023 specifies requirements for an **AI management system (AIMS)**, in the same family style as ISO/IEC 27001 for information security: leadership, policy, risk assessment and treatment, AI impact assessment, controls, internal audit and continual improvement. Organisations can be certified by accredited bodies. It is about how the organisation manages AI, not a test that a single model passes.

### Model cards and documentation

Model cards (Mitchell et al., 2019) are short structured documents: model details, intended use, factors (groups, environments), metrics, evaluation data, training data, quantitative analyses (including disaggregated results), ethical considerations, caveats and recommendations. Datasheets for datasets play the same role for data. Good cards are versioned with the model and generated partly from evaluation pipelines, so they do not go stale.

### From requirement to test

| Requirement theme | Engineering evidence |
|---|---|
| Accuracy and robustness | Held-out evaluation, slice metrics, perturbation and adversarial tests |
| Data governance | Data lineage, quality checks, representativeness analysis |
| Record-keeping | Logging tests: every decision traceable to model version and inputs |
| Human oversight | Tests that override, escalation and stop functions work |
| Transparency | UI tests that AI disclosure and instructions appear |
| Post-market monitoring | Drift and quality monitoring with incident process |

## Real-world example

A recruitment platform added an AI feature that ranked applicants. During a governance review, the team recognised that AI used to evaluate candidates falls into an area the EU AI Act lists as high-risk, so legal counsel was brought in early. Engineering work followed from the review: a model card with selection rates by group, a data-lineage record for training data, logs linking every ranking to the model version, a recruiter override with audit trail and tests for it, and a monitoring dashboard for drift and selection-rate disparities. The team also mapped the work to the NIST AI RMF functions, which gave a shared vocabulary with the risk office.

## Step-by-step walkthrough

1. **Inventory** AI systems and their intended uses.
2. **Classify** each with legal input: which laws and risk tiers could apply, and whether you are provider or deployer.
3. **Map risks** for each system (NIST Map): who could be harmed and how.
4. **Define controls and tests** (Measure): metrics, thresholds, red-teaming, oversight checks.
5. **Document**: model card, data documentation, technical documentation, versioned with releases.
6. **Monitor and respond** (Manage): drift, incidents, complaints, periodic review.
7. **Re-assess** when intended use, data or model changes.

## Code examples

A model card generated from evaluation results, so it stays in sync with releases:

```python
import json
from datetime import date

def render_model_card(meta: dict, metrics: dict, slices: dict) -> str:
    lines = [
        f"# Model card: {meta['name']} v{meta['version']}",
        f"Date: {date.today().isoformat()}",
        "## Intended use", meta["intended_use"],
        "## Out-of-scope uses", meta["out_of_scope"],
        "## Training data", meta["training_data"],
        "## Evaluation data", meta["evaluation_data"],
        "## Metrics (overall)",
        *[f"- {k}: {v:.3f}" for k, v in metrics.items()],
        "## Metrics by slice",
        *[f"- {group}: " + ", ".join(f"{k}={v:.3f}" for k, v in m.items()) for group, m in slices.items()],
        "## Limitations and ethical considerations", meta["limitations"],
    ]
    return "\n\n".join(lines)

# model_meta.json is written by the team; eval_results.json by the eval job. Illustrative shapes:
#   model_meta.json:   {"name": "cv-ranker", "version": "2.3.0", "intended_use": "...", "out_of_scope": "...",
#                       "training_data": "...", "evaluation_data": "...", "limitations": "..."}
#   eval_results.json: {"overall": {"auc": 0.874}, "slices": {"group_a": {"selection_rate": 0.31}}}
meta = json.load(open("model_meta.json"))
results = json.load(open("eval_results.json"))
open("MODEL_CARD.md", "w").write(render_model_card(meta, results["overall"], results["slices"]))
```

A pytest check that every logged decision is traceable:

```python
def test_decision_log_is_traceable(client, log_store):
    r = client.post("/rank", json={"candidate_id": "c-1", "job_id": "j-9"})
    assert r.status_code == 200
    entry = log_store.latest()
    for field in ("request_id", "model_version", "input_hash", "score", "timestamp"):
        assert field in entry
```

## Expected output

`MODEL_CARD.md` contains each required section with metrics pulled from the same evaluation run that gated the release, plus slice metrics that reviewers can compare across versions. The logging test passes only when each decision records the fields auditors and incident responders need.

## Common mistakes

- **Treating governance as a one-off document** instead of a lifecycle activity.
- **Quoting dates or obligations from memory or blog posts** rather than the official text and timeline.
- **Confusing frameworks with law:** NIST AI RMF is voluntary; ISO/IEC 42001 is a certifiable standard; the EU AI Act is legislation.
- **Model cards with only overall metrics**, hiding poor performance for subgroups.
- **Ignoring changes of intended use**, which can change the risk classification.
- **Engineers making legal classification calls alone.**

## Troubleshooting

- **"We do not know if we are high-risk":** document the intended use precisely and ask legal; the answer depends on the use, not the algorithm.
- **Documentation always out of date:** generate it from pipelines and make it a release gate.
- **Teams talk past each other:** use the NIST functions as a shared vocabulary.

## Exercise

Pick an AI feature (real or hypothetical). Write a two-page governance pack: intended use, a provisional risk classification with open questions for legal, a NIST AI RMF mapping, a model card, and ten concrete tests that produce evidence.

## Key takeaways summary

Regulation, standards and guidance work together. The EU AI Act is risk-based and phased; verify its current dates officially. NIST AI RMF gives the Govern, Map, Measure, Manage structure. ISO/IEC 42001 defines a certifiable AI management system. Engineers and testers make governance real by producing versioned, honest evidence.
