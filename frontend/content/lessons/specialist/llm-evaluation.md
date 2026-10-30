---
slug: llm-evaluation
title: LLM Evaluation
summary: Learn how to measure the quality of large language model outputs with success criteria, evaluation datasets, code-based checks, human review and LLM-as-judge grading, and how to use evaluation results as a release gate.
level: intermediate
duration: 40
tags: [llm, evaluation, ai-testing, llm-as-judge, metrics]
objectives:
  - Write measurable success criteria for an LLM feature
  - Build an evaluation dataset that covers typical, edge and adversarial cases
  - Choose between code-based, human and model-based grading
  - Use aggregate scores and thresholds to compare versions and gate releases
prerequisites:
  - Testing AI applications
  - Test data design
related: [testing-ai-applications, rag-evaluation, test-data-design, qa-metrics-and-reporting, regression-testing]
references:
  - title: Anthropic — Define success criteria and build evaluations
    url: https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests
  - title: OpenAI — Evaluation best practices
    url: https://platform.openai.com/docs/guides/evaluation-best-practices
  - title: Stanford CRFM — HELM
    url: https://crfm.stanford.edu/helm/
  - title: NIST AI Risk Management Framework
    url: https://www.nist.gov/itl/ai-risk-management-framework
interview:
  - q: How would you evaluate a new LLM-powered summarisation feature?
    a: First I agree success criteria with the product owner, for example the summary contains all key decisions, invents nothing, is under 100 words and uses a neutral tone. Then I build a dataset of real or realistic inputs covering typical, edge and tricky cases with what a good output must contain. I grade with code where possible, such as length and format, use a carefully prompted model grader with a rubric for faithfulness and completeness, and calibrate that grader against human ratings on a sample. I report aggregate scores per criterion and compare them with the current version before release.
  - q: What is LLM-as-judge and what are its risks?
    a: It means using a language model to grade another model's outputs against a rubric. It scales much better than human review and handles open-ended text. Risks include bias towards longer or more confident answers, position bias when comparing two answers, inconsistency, and the judge sharing the same blind spots. I mitigate this with clear rubrics with specific criteria, asking for reasoning before the score, swapping answer order in pairwise comparisons, and regularly checking agreement with human graders.
  - q: Why are public benchmarks not enough to choose a model for your product?
    a: Benchmarks measure general abilities on fixed public tasks, and some benchmark questions may have leaked into training data. Your product has its own users, domain, format and risks. A model that leads a leaderboard can still fail your specific cases, so I build a task-specific evaluation set from my own use cases and use benchmarks only as a rough first filter.
practice:
  - "Write four measurable success criteria for an assistant that drafts polite replies to customer complaints."
  - "Create a 20-case evaluation dataset for that assistant with typical, edge and adversarial inputs."
  - "Write a grading rubric that a human or model grader could apply with a score from 1 to 5 for each criterion."
takeaways:
  - Start with specific, measurable success criteria agreed with stakeholders.
  - Evaluation datasets need typical, edge and adversarial cases, ideally from real usage.
  - Prefer code-based grading where possible; calibrate model graders against humans.
  - Compare versions on aggregate scores per criterion, not single examples.
  - Re-run evaluations on every prompt, model or data change.
quiz:
  - id: llme-q1
    type: single
    topic: llm-evaluation
    difficulty: beginner
    prompt: Which is the most measurable success criterion for a support reply generator?
    options: ["Replies should be good", "Replies should feel natural", "At least 95% of replies on the evaluation set include the correct order status and are under 120 words", "Replies should be better than before"]
    answer: [2]
    explanation: It names what to check, a threshold and the dataset, so anyone can measure it. The others are vague and graders would disagree.
  - id: llme-q2
    type: multiple
    topic: llm-evaluation
    difficulty: intermediate
    prompt: Which checks can reliably be graded with plain code? Select all that apply.
    options: ["Output is valid JSON matching a schema", "Answer is under 100 words", "The tone is empathetic", "The output contains the required ticket id"]
    answer: [0, 1, 3]
    explanation: Format, length and presence of an exact value are deterministic checks. Tone is subjective and needs a human or a carefully calibrated model grader.
  - id: llme-q3
    type: scenario
    topic: llm-evaluation
    difficulty: advanced
    prompt: Your model grader rates long answers higher even when they contain errors. What is the best response?
    options: ["Stop evaluating", "Refine the rubric with specific criteria, add length-controlled examples and check agreement with human ratings", "Only use longer answers", "Increase the temperature of the grader"]
    answer: [1]
    explanation: Verbosity bias is a known weakness of model graders. Specific rubrics and calibration against humans reduce it. Raising temperature adds randomness instead of fixing bias.
  - id: llme-q4
    type: truefalse
    topic: llm-evaluation
    difficulty: beginner
    prompt: If version B scores higher than version A on one hand-picked example, B is better.
    options: ["True", "False"]
    answer: [1]
    explanation: One example says little about non-deterministic systems. Compare aggregate scores across a representative dataset, ideally with several runs.
---

## Beginner-friendly explanation

Think of a cooking competition. Judges do not taste one spoonful and declare a winner. They agree on criteria in advance, such as taste, presentation and following the recipe, taste many dishes, and give scores that can be compared.

LLM evaluation is that judging process for AI answers. Because a model's answers vary, you agree what "good" means, collect many test inputs, score the answers on each criterion, and compare totals between versions.

## Technical explanation

### The evaluation loop

```mermaid
flowchart LR
  A[Success criteria] --> B[Evaluation dataset]
  B --> C[Run model or app]
  C --> D[Grade outputs]
  D --> E[Aggregate scores]
  E --> F{Meets thresholds?}
  F -->|no| G[Change prompt, model or data]
  G --> C
  F -->|yes| H[Release and monitor]
```

### Success criteria

Good criteria are **specific and measurable**: "at least 90% of answers contain the correct refund amount" rather than "answers are accurate". Cover several dimensions:

| Dimension | Example criterion |
|---|---|
| Correctness | Contains the right facts |
| Faithfulness | No claims beyond the provided source |
| Instruction following | Correct format, language and length |
| Safety | Refuses disallowed requests |
| Tone | Polite and on-brand |
| Latency and cost | Under 3 seconds, under a token budget |

### Evaluation datasets

Gather inputs from real usage where privacy rules allow, plus edge cases (empty, very long, other languages) and adversarial cases (injection, harmful requests). Each case records the input and what a good output must contain or avoid. Keep a held-out set so you do not tune the prompt to a few examples.

### Grading methods

| Method | Strength | Weakness |
|---|---|---|
| Code-based (exact match, regex, schema, numeric) | Fast, cheap, reliable | Only for checkable properties |
| Human review | Best for nuance | Slow, expensive, can be inconsistent |
| LLM-as-judge with a rubric | Scales to open-ended text | Biases; needs calibration against humans |

Common model-grader biases include preferring longer answers and preferring the answer shown first in a pairwise comparison.

### Reporting

Report per-criterion pass rates and averages, compare with the baseline, and look at failing cases, not only totals. Because outputs vary, run important evaluations more than once.

## Code examples

A minimal evaluation harness in Python with a code-based grader:

```python
cases = [
    {"input": "Where is order 5521?", "must_contain": "5521"},
    {"input": "Cancel order 9910 please", "must_contain": "9910"},
    {"input": "", "must_contain": "order number"},
]

def grade(output: str, case: dict) -> bool:
    return case["must_contain"].lower() in output.lower() and len(output.split()) <= 120

results = [grade(run_assistant(c["input"]), c) for c in cases]
print(f"pass rate: {sum(results)}/{len(results)} = {sum(results) / len(results):.0%}")
```

`run_assistant` is your application's function that calls the model.

## Expected output

```text
pass rate: 2/3 = 67%
```

The empty input case failed, so the assistant did not ask for an order number. With a release threshold of 95%, this version is blocked, and the failing case tells you what to fix.

## Real-world example

A legal-tech team switched to a newer model because it led a public benchmark. Their customers' contract summaries became longer and occasionally dropped termination clauses. The team had no product-specific evaluation, so the problem surfaced through complaints. They built a 300-case dataset from anonymised contracts, with required clauses per case, used code checks for clause presence and a calibrated model grader for faithfulness, and now compare every model or prompt change against the baseline before release.

## Common mistakes

- **Vague criteria** like "high quality".
- **Tiny or unrepresentative datasets**, often only happy-path questions.
- **Trusting an uncalibrated model grader.**
- **Looking only at the average** and never at failing examples.
- **Overfitting the prompt** to the evaluation set without a held-out set.

## Troubleshooting

- **Scores vary run to run.** Run several times and report the range; check the model version is pinned.
- **Graders disagree.** Make the rubric more specific with examples of each score.

## Key takeaways summary

Define measurable criteria, build a representative dataset, grade with code first and calibrated judges second, and compare versions on aggregate scores. For retrieval-based systems, continue with [RAG evaluation](/learn/specialist/rag-evaluation).
