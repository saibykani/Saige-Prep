---
slug: llm-apis-and-structured-output
title: LLM APIs and Structured Output
summary: Call LLM APIs like a production engineer, with messages, system prompts, streaming, retries and timeouts, and get reliable machine-readable JSON by combining schemas, tool-based extraction and pydantic validation.
level: intermediate
duration: 55
tags: [llm-api, json, pydantic, structured-output, ai-engineering]
objectives:
  - Use the messages API with system prompts, multi-turn history, usage data and stop reasons
  - Handle errors, rate limits, timeouts and retries safely
  - Produce structured JSON output via tool schemas and validate it with pydantic
  - Design tests for structured LLM output, including invalid and adversarial cases
prerequisites:
  - LLM fundamentals and tokens
  - Prompt engineering
  - Python classes and type hints
related: [prompt-engineering, tool-use-and-ai-agents, llm-evaluation-and-evals, ai-cost-latency-and-scaling, python-for-ai]
references:
  - title: Anthropic docs — Messages API reference
    url: https://platform.claude.com/docs/en/api/messages
  - title: Anthropic docs — Tool use overview
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
  - title: Anthropic docs — Errors
    url: https://platform.claude.com/docs/en/api/errors
  - title: Anthropic Python SDK on GitHub
    url: https://github.com/anthropics/anthropic-sdk-python
  - title: OpenAI platform docs — Structured outputs
    url: https://developers.openai.com/api/docs/guides/structured-outputs
  - title: Pydantic documentation — Models
    url: https://pydantic.dev/docs/validation/latest/concepts/models/
videos:
  - id: H7LZb20-fUY
    title: "Claude API Crash Course #1 - Introduction & Setup"
    channel: "Net Ninja"
  - id: JII7cloPjXc
    title: "Get LLM to respond in JSON - OpenAI API Structured Outputs Explained"
    channel: "Breakpoint"
interview:
  - q: How do you get reliable JSON out of an LLM?
    a: Define the schema once, for example as a pydantic model, and pass its JSON schema to the provider's structured output or tool-use feature so the model fills typed fields rather than free text. Then always validate the result with pydantic on my side, because the application must not trust unvalidated model output. On a validation failure I retry with the error message once or twice, and otherwise fail safely and log the case for the eval set.
  - q: Which API errors should be retried and how?
    a: Transient ones, rate limiting (429), overloaded or server errors (5xx) and timeouts, with exponential backoff and jitter and a capped number of attempts, respecting any retry-after header. Client errors such as 400 invalid request or 401 authentication should not be retried because they will fail again. The official SDKs already implement retries with sensible defaults that you can configure.
  - q: How would you test a feature that extracts structured data with an LLM?
    a: Build a labelled set of inputs and expected fields, then measure schema validity rate, per-field accuracy, handling of missing fields (null rather than invented), long and messy inputs, other languages and injection attempts. Unit-test the validation and retry logic with mocked API responses, including malformed JSON, so the deterministic code is covered without network calls.
practice:
  - "Define a pydantic model for an invoice (vendor, date, currency, total, line items) and extract it from five sample invoices. Record schema-validity rate and field accuracy."
  - "Mock the API client to return malformed output and write pytest tests proving your retry-then-fail logic works."
  - "Stream a long answer and measure time to first token versus total time."
takeaways:
  - The API is stateless; you send the full message history and system prompt every call.
  - Check stop_reason and usage on every response.
  - Retry only transient errors, with backoff and a cap; set timeouts.
  - Use schemas (tool use or structured output) to get JSON, and always validate with pydantic.
  - Test the deterministic glue code with mocks and the model behaviour with evaluation sets.
quiz:
  - id: aie-api-q1
    type: single
    topic: llm-apis-and-structured-output
    difficulty: intermediate
    prompt: Which HTTP error is a good candidate for automatic retry with backoff?
    options: ["400 invalid request", "401 authentication error", "429 rate limit", "404 not found"]
    answer: [2]
    explanation: 429 is transient; waiting and retrying usually succeeds. 400, 401 and 404 indicate problems that a retry will not fix.
  - id: aie-api-q2
    type: truefalse
    topic: llm-apis-and-structured-output
    difficulty: beginner
    prompt: If the model was given a JSON schema, the application no longer needs to validate the output.
    options: ["True", "False"]
    answer: [1]
    explanation: Validate anyway. Output can be truncated, fields can contain invalid business values, and defence in depth is cheap with pydantic.
  - id: aie-api-q3
    type: debugging
    topic: llm-apis-and-structured-output
    difficulty: intermediate
    prompt: This code sometimes crashes with JSONDecodeError. What is the most robust fix?
    code: |
      resp = client.messages.create(model=MODEL, max_tokens=100, messages=msgs)
      text = next(b.text for b in resp.content if b.type == "text")
      data = json.loads(text)
    codeLanguage: python
    options: ["Wrap in try/except and ignore errors", "Use tool-based structured output, check stop_reason, validate with pydantic and retry on failure", "Lower temperature to 2", "Use eval() instead of json.loads"]
    answer: [1]
    explanation: Free text may include prose or be truncated by a low max_tokens. Schema-driven output plus stop_reason checks and validation with a bounded retry fixes the cause. eval() is a security hole.
  - id: aie-api-q4
    type: multiple
    topic: llm-apis-and-structured-output
    difficulty: intermediate
    prompt: What should be in place before an LLM API call goes to production? Select all that apply.
    options: ["A request timeout", "API key loaded from a secret store or environment", "Logging of token usage", "Unlimited automatic retries"]
    answer: [0, 1, 2]
    explanation: Timeouts, secure keys and usage logging are basics. Unlimited retries can cause runaway cost and hammer an overloaded service.
---

## Beginner-friendly explanation

When you chat with an assistant in a web app, a program behind it is sending your text to an **API** and getting text back. As an engineer you write that program. Two things make it hard in practice: networks and services fail, and the reply is text written by a probabilistic model, while your code needs predictable data such as `{"severity": "high"}`.

This lesson covers both: calling the API robustly, and getting **structured output** that your code can trust after validating it.

## Technical explanation

### The messages API

A request contains:

- `model`: which model to use, e.g. `claude-sonnet-5-5`.
- `system`: durable instructions.
- `messages`: alternating `user` and `assistant` turns. The API is **stateless**, so you send the whole conversation every time.
- `max_tokens`, `temperature`, optional `stop_sequences`, `tools`.

The response contains `content` blocks (text, tool use), `stop_reason` (`end_turn`, `max_tokens`, `tool_use`, `stop_sequence`...) and `usage` (input and output tokens). Log usage; it is your cost and latency signal.

### Reliability

| Problem | Practice |
|---|---|
| Rate limits (429), overload, 5xx | Exponential backoff with jitter, capped attempts; the official SDK retries by default (`max_retries`) |
| Hanging requests | Set `timeout` on the client |
| Bad requests (400), auth (401/403) | Do not retry; fix and alert |
| Long responses | Stream to improve perceived latency |
| Secrets | Key from environment or secret manager, never committed |

### Structured output

Options from weakest to strongest:

1. **"Reply in JSON"** in the prompt. Often works, sometimes adds prose or gets truncated.
2. **Examples** in the prompt to steer format. (Assistant-message prefill used to be another lever, but current Claude models reject a prefilled last assistant turn with a 400.)
3. **Tool-based extraction**: define a "tool" whose `input_schema` is your JSON schema and instruct the model to call it. Older models let you force the call with `tool_choice={"type": "tool", ...}`; current Claude models (Sonnet 5.5, Opus 5.5) reject forced `tool` / `any` choices with a 400, so use `tool_choice={"type": "auto"}` plus an explicit instruction, optionally with `strict: true` on the tool. The model returns a `tool_use` block with arguments matching the schema. You do not actually need to run a tool; you just read the arguments.
4. **Native structured-output modes** offered by providers (for example OpenAI's structured outputs, and Anthropic's structured outputs via `output_config.format`, or `strict: true` on a tool) constrain generation to a schema.

Whatever you use, **validate on your side** with pydantic: types, enums, ranges and business rules (e.g. `total >= 0`). Schema-valid is not the same as correct; a field can be well-typed and wrong, so evaluation still matters.

```mermaid
flowchart LR
  A[Pydantic model] -->|model_json_schema| B[Tool input_schema]
  B --> C[LLM call with tool]
  C --> D[tool_use input]
  D --> E{pydantic validate}
  E -- ok --> F[Typed object to app]
  E -- error --> G[Retry with error, max N]
  G --> C
  G -->|exhausted| H[Fail safe and log]
```

## Real-world example

A test-management tool let users paste a free-text defect description and auto-filled fields: component, severity, steps, environment. The first version asked for JSON in the prompt and parsed with `json.loads`. Around one call in a few dozen failed in testing: the model sometimes wrapped JSON in a sentence, and long inputs hit `max_tokens`, truncating the object. Worse, severity occasionally came back as "Severe", which was not a valid option, and was saved to the database.

The rebuilt version defined a pydantic model with an enum for severity, used tool-based extraction, checked `stop_reason`, validated, retried once with the validation error, and otherwise showed the user an empty form. The QA team added an evaluation set of 60 real descriptions and mocked unit tests for the retry path.

## Step-by-step walkthrough

1. Define the pydantic model with types, enums and descriptions.
2. Generate its JSON schema and use it as a tool's `input_schema`.
3. Call the API with that tool and an instruction to use it.
4. Find the `tool_use` block and validate its `input`.
5. On `ValidationError`, retry once with the error text; then fail safe.
6. Unit-test with a fake client; evaluate with real calls on a labelled set.

## Code examples

```python
from enum import Enum
from anthropic import Anthropic
from pydantic import BaseModel, Field, ValidationError

client = Anthropic(timeout=30.0, max_retries=3)  # SDK retries transient errors with backoff
MODEL = "claude-sonnet-5-5"

class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class Defect(BaseModel):
    title: str = Field(min_length=5, max_length=120)
    component: str | None = Field(description="Affected component, or null if not stated")
    severity: Severity
    steps: list[str] = Field(min_length=1)

EXTRACT_TOOL = {
    "name": "record_defect",
    "description": "Record a structured defect extracted from the user's description.",
    "input_schema": Defect.model_json_schema(),
}

def extract_defect(text: str, attempts: int = 2) -> Defect | None:
    messages = [{"role": "user", "content": f"Extract the defect.\n<description>{text}</description>"}]
    for _ in range(attempts):
        resp = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system="Always call record_defect. Extract only facts present in the description. Use null for unknown fields.",
            tools=[EXTRACT_TOOL],
            tool_choice={"type": "auto"},  # forced "tool"/"any" choices return 400 on current Claude models
            messages=messages,
        )
        if resp.stop_reason == "max_tokens":
            continue  # truncated: do not trust partial arguments
        block = next((b for b in resp.content if b.type == "tool_use"), None)
        if block is None:
            continue  # model answered in text instead of calling the tool
        try:
            return Defect.model_validate(block.input)
        except ValidationError as err:
            # Give the model its own output and the error, then try again
            messages += [
                {"role": "assistant", "content": resp.content},
                {"role": "user", "content": [{
                    "type": "tool_result", "tool_use_id": block.id, "is_error": True,
                    "content": f"Validation failed: {err.errors(include_input=False)}. Fix and call again.",
                }]},
            ]
    return None

print(extract_defect("Payments: card form crashes app when expiry is 13/30. Repro: open checkout, type 13/30, submit."))
```

Testing the deterministic logic without the network, using a fake client:

```python
from types import SimpleNamespace as NS

def fake_response(payload, stop="tool_use"):
    return NS(stop_reason=stop, content=[NS(type="tool_use", id="t1", input=payload)])

def test_invalid_severity_then_valid(monkeypatch):
    replies = iter([
        fake_response({"title": "Crash on expiry", "component": None, "severity": "Severe", "steps": ["a"]}),
        fake_response({"title": "Crash on expiry", "component": None, "severity": "high", "steps": ["a"]}),
    ])
    monkeypatch.setattr(client.messages, "create", lambda **kw: next(replies))
    result = extract_defect("x")
    assert result is not None and result.severity is Severity.high
```

Other providers follow the same pattern: OpenAI exposes function calling and a structured-outputs mode with a JSON schema; you still validate with pydantic.

## Expected output

`extract_defect` returns a `Defect` such as `title='Card form crashes on invalid expiry 13/30' component='Payments' severity=<Severity.high: 'high'> steps=[...]`. The pytest test passes, proving that an invalid enum triggers exactly one retry.

## Common mistakes

- **`json.loads` on free text** with no schema or validation.
- **Ignoring `stop_reason`** and using truncated output.
- **Retrying everything forever**, including 400s, causing cost spikes.
- **No timeout**, so a stuck call blocks a worker.
- **Trusting schema-valid values as correct** without evaluation.
- **Echoing raw model output into SQL, HTML or shell** without sanitising.
- **Hardcoding API keys.**

## Troubleshooting

- **Fields invented instead of null:** make fields optional, describe "null if not stated", add an example.
- **Frequent validation failures:** simplify the schema, add field descriptions, check enums are obvious.
- **Rate limits in batch jobs:** add concurrency limits, or use the provider's batch API for offline work.

## Key takeaways summary

Treat the LLM API like any remote dependency: timeouts, bounded retries for transient errors, logging and secrets hygiene. For machine-readable results, define a schema once in pydantic, have the model fill it through tools or structured output, validate every time, and test both the glue code (mocked) and the behaviour (evaluated).
