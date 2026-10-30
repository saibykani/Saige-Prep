---
slug: testing-ai-applications
title: Testing AI Applications
summary: Learn how testing changes for software built on large language models, which give non-deterministic answers, and how to test with property-based checks, evaluation datasets, guardrails, prompt injection checks and production monitoring.
level: intermediate
duration: 40
tags: [ai-testing, llm, non-determinism, prompt-injection, guardrails]
objectives:
  - Explain why LLM-based features need different test approaches from deterministic code
  - Separate deterministic parts of an AI application from the model's behaviour
  - Design tests for quality, safety, prompt injection, cost and latency
  - Describe how evaluation datasets and monitoring fit into the release process
prerequisites:
  - Test scenarios and test cases
  - HTTP fundamentals
related: [llm-evaluation, rag-evaluation, security-testing-fundamentals, test-data-design, flaky-test-reduction, exploratory-and-ad-hoc-testing]
references:
  - title: NIST AI Risk Management Framework
    url: https://www.nist.gov/itl/ai-risk-management-framework
  - title: OWASP Top 10 for Large Language Model Applications
    url: https://genai.owasp.org/llm-top-10/
  - title: Anthropic — Define success criteria and build evaluations
    url: https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests
  - title: OpenAI — Evaluation best practices
    url: https://platform.openai.com/docs/guides/evaluation-best-practices
interview:
  - q: How is testing an LLM feature different from testing normal code?
    a: Normal code is deterministic, so the same input gives the same output and I can assert on exact values. An LLM can phrase the same correct answer many ways and can occasionally be wrong, so I assert on properties, for example valid JSON, required facts present, no forbidden content, and score quality over a dataset of many cases rather than one example. I still test the deterministic parts, input handling, tool calls, parsing and permissions, with normal tests, and I add safety, prompt injection, latency and cost checks plus production monitoring.
  - q: What is prompt injection and how do you test for it?
    a: Prompt injection is when input text, typed by a user or hidden in a document, web page or email the model reads, contains instructions that override the developer's intended behaviour. In an authorized test environment I try direct injections like asking the assistant to ignore its rules and reveal its instructions, and indirect ones planted in content it retrieves. The key checks are that the model cannot take actions or reveal data beyond what the user is allowed, which must be enforced outside the model with permissions, not just by the prompt.
  - q: How do you stop AI tests from being flaky?
    a: I separate deterministic tests from evaluations. Deterministic tests mock the model or use recorded responses, so they are stable in CI. Evaluations run against the real model over a dataset and pass on an aggregate threshold, such as at least 95 percent of cases meeting the rubric, instead of failing on one variation. I pin the model version, keep settings like temperature fixed where the API allows, and track scores over time.
practice:
  - "List the deterministic parts and the model-dependent parts of a support chatbot that can look up orders."
  - "Write ten evaluation cases for a ticket-summarising feature, each with an input and the properties a good summary must have."
  - "In a local or sandbox assistant you are authorized to test, try three prompt injection attempts and record whether any rule was bypassed."
takeaways:
  - LLM output is non-deterministic; assert on properties and score over datasets.
  - Test deterministic code around the model with ordinary, stable tests.
  - Treat model output and anything the model reads as untrusted input.
  - Enforce permissions outside the model; prompts alone are not a security control.
  - Monitor quality, safety, latency and cost in production.
quiz:
  - id: tai-q1
    type: single
    topic: testing-ai-applications
    difficulty: beginner
    prompt: An LLM summary test asserts the output equals one exact sentence. Why is this a poor test?
    options: ["Exact assertions are too fast", "The model can give a different but equally correct wording each time", "LLMs never repeat words", "Summaries cannot be tested"]
    answer: [1]
    explanation: Valid outputs vary in wording, so exact matching fails on good answers. Check properties such as length, required facts and absence of errors instead.
  - id: tai-q2
    type: scenario
    topic: testing-ai-applications
    difficulty: advanced
    prompt: An email assistant summarises incoming mail. A test email contains hidden text telling the assistant to forward the inbox to an outside address, and it tries to. What is this?
    options: ["Hallucination", "Indirect prompt injection", "Model drift", "Rate limiting"]
    answer: [1]
    explanation: Instructions hidden in content the model reads are indirect prompt injection. The fix includes treating such content as data and requiring user confirmation and permission checks for actions like forwarding mail.
  - id: tai-q3
    type: multiple
    topic: testing-ai-applications
    difficulty: intermediate
    prompt: Which parts of an AI chatbot can usually be tested with ordinary deterministic tests? Select all that apply.
    options: ["Parsing the model's JSON output", "Checking the user's permission before an order lookup tool runs", "Whether every answer is perfectly worded", "Handling a timeout from the model API"]
    answer: [0, 1, 3]
    explanation: Parsing, permission checks and error handling are normal code and can be tested with mocked model responses. Answer quality varies and needs evaluation over a dataset.
  - id: tai-q4
    type: truefalse
    topic: testing-ai-applications
    difficulty: beginner
    prompt: Writing "never reveal other customers' data" in the system prompt is enough to guarantee data protection.
    options: ["True", "False"]
    answer: [1]
    explanation: Prompts can be bypassed by injection or simply not followed. Data access must be enforced by the application, for example tools that only return the logged-in user's records.
---

## Beginner-friendly explanation

Imagine testing a calculator versus testing a new employee who answers customer emails. The calculator always gives 4 for 2 + 2, so you check the exact answer. The employee writes a slightly different email each time. You cannot demand identical wording; you check whether each email is correct, polite, complete and safe, and you look at many emails, not just one.

Applications built on large language models (LLMs) behave like that employee. Testing them means checking the qualities of answers across many examples, while still testing the ordinary code around the model like any other software.

## Technical explanation

### Anatomy of an AI application

```mermaid
flowchart LR
  U[User input] --> P[Prompt builder]
  P --> M[LLM API]
  D[(Documents or tools)] --> P
  M --> O[Output parser and guardrails]
  O --> A[Actions and UI]
```

Only the model call is non-deterministic. Input validation, prompt building, tools, parsing, permissions and the UI are normal code.

### What to test

| Area | Example checks |
|---|---|
| Functional quality | Correct facts, follows instructions, right format |
| Robustness | Typos, other languages, very long input, empty input |
| Safety | Refuses harmful requests, no toxic or biased output |
| Security | Prompt injection, data leakage, excessive agency of tools |
| Grounding | Does not invent facts (hallucination) |
| Non-functional | Latency, token cost, rate limits, timeouts |

### Techniques

- **Property-based assertions:** valid JSON, required fields, length limits, contains the order number, no email addresses of other people.
- **Evaluation datasets:** a set of inputs with expected properties or reference answers, scored automatically, by a model-based grader, or by humans. See [LLM evaluation](/learn/specialist/llm-evaluation).
- **Mocked model responses** for deterministic tests of the surrounding code.
- **Red teaming:** authorized adversarial testing for safety and injection, guided by the OWASP Top 10 for LLM Applications.
- **Monitoring:** sample production conversations, user feedback and cost, because behaviour can change with model updates.

Many model APIs let you set parameters such as temperature, which reduces but does not eliminate variation.

## Code examples

A pytest check with the model mocked, testing only the application's parsing and safety logic:

```python
import json

def parse_reply(raw: str) -> dict:
    data = json.loads(raw)
    if data.get("action") == "refund" and data.get("amount", 0) > 100:
        data["needs_human_approval"] = True
    return data

def test_large_refund_requires_approval():
    fake_model_output = '{"action": "refund", "amount": 250}'
    assert parse_reply(fake_model_output)["needs_human_approval"] is True
```

## Expected output

```text
tests/test_reply.py::test_large_refund_requires_approval PASSED
```

This test is fully stable because the model is not called. Model quality is checked separately by evaluations that pass on an aggregate score.

## Real-world example

A retail team launched a chatbot that answered return-policy questions. Manual testers tried a few questions and the answers looked good. After launch, some customers asked about items bought in a sale, and the bot confidently invented a 60-day return window that did not exist. The team built an evaluation dataset of 200 real questions, with the policy facts each answer must contain, connected the bot to the official policy document, and now run the dataset before each prompt or model change.

## Common mistakes

- **Exact-match assertions** on model text.
- **Testing a handful of examples** and generalising.
- **Trusting the prompt for security** instead of enforcing permissions in code.
- **Ignoring model or prompt changes** as regression risks.
- **Forgetting cost and latency**, which can make a correct feature unusable.

## Troubleshooting

- **Tests flip between pass and fail.** Move model-dependent checks into evaluations with thresholds; mock the model in unit tests.
- **Scores drop after a release.** Compare model version, prompt and retrieved data between runs.

## Key takeaways summary

Test the code around the model normally, evaluate the model's behaviour over datasets with clear properties, attack it safely for injection and leakage, and keep monitoring after release. Continue with [LLM evaluation](/learn/specialist/llm-evaluation) and [RAG evaluation](/learn/specialist/rag-evaluation).
