---
slug: ai-assisted-test-automation
title: AI-Assisted Test Automation
summary: Use LLMs to draft test ideas, Playwright tests and test data faster, while keeping humans accountable through review checklists, mutation checks, flakiness gates and clear rules for what AI-generated tests may and may not do.
level: intermediate
duration: 55
tags: [test-automation, playwright, ai-assisted, code-generation, human-review]
objectives:
  - Identify where AI assistance helps in test automation and where it adds risk
  - Generate Playwright test drafts from requirements and accessibility snapshots using structured prompts
  - Review AI-generated tests with a checklist covering oracles, locators, data and hallucinated behaviour
  - Validate generated tests by running them repeatedly and checking that they fail when the feature breaks
  - Set team policies for AI-assisted testing, including data privacy and authorship
prerequisites:
  - Playwright basics (locators, assertions, fixtures)
  - Prompt engineering
  - A strategy for testing AI systems
related: [prompt-engineering, llm-apis-and-structured-output, tool-use-and-ai-agents, testing-ai-systems-strategy, llm-evaluation-and-evals, ai-cost-latency-and-scaling]
references:
  - title: Playwright — Writing tests (Python)
    url: https://playwright.dev/python/docs/writing-tests
  - title: Playwright — Locators
    url: https://playwright.dev/docs/locators
  - title: Playwright — Codegen test generator
    url: https://playwright.dev/docs/codegen
  - title: Playwright — ARIA snapshots
    url: https://playwright.dev/docs/aria-snapshots
  - title: OWASP GenAI Security Project — Top 10 for LLM Applications
    url: https://genai.owasp.org/llm-top-10/
videos:
  - id: IixdI2bTR1g
    title: "Let AI Explore Your Site & Write Tests with Playwright MCP!"
    channel: "Playwright"
  - id: MIlcVo1x3Is
    title: "Generating Playwright Tests With AI: Let's Try the New Playwright MCP Server!"
    channel: "Checkly"
interview:
  - q: How do you use AI to write automated tests without lowering quality?
    a: I treat AI output as a draft from a fast junior contributor. I give it the requirement, the real page structure such as an accessibility snapshot, and our conventions, and ask for structured output. Then a human reviews every test against a checklist, checking that it asserts the requirement and not just what the page currently does, uses role-based locators, has no hard waits, and does not invent behaviour. I run it repeatedly to catch flakiness and break the feature deliberately to prove the test fails. Only then does it merge, with the human reviewer accountable for it.
  - q: What is the biggest risk with AI-generated tests?
    a: Tests that pass but prove nothing. A model generating tests from the current implementation tends to encode current behaviour, including bugs, as expected behaviour, or writes weak assertions such as checking that a page loaded. That creates false confidence. The mitigation is deriving assertions from requirements, human review of oracles, and mutation-style checks showing the test fails when the behaviour is broken.
  - q: What data should not be sent to an AI coding assistant when generating tests?
    a: Anything your organisation's policy and the tool's data terms do not allow, typically production personal data, secrets, credentials, tokens and confidential customer content. I use synthetic data, redact logs and page snapshots, use approved tools with appropriate retention settings, and keep secrets in environment variables that never enter prompts.
practice:
  - "Pick a page in an app you own. Capture its ARIA snapshot with Playwright, then prompt a model to draft three tests from a written requirement. Review them with the checklist in this lesson and record every change you made."
  - "For one generated test, break the feature deliberately (for example change a validation message) and confirm the test fails. If it passes, strengthen the assertion."
  - "Run a generated test suite 20 times with repeat-each and record any flaky tests and their root cause."
takeaways:
  - AI speeds up drafting test ideas, code and data, but humans stay accountable for what merges.
  - Ground generation in requirements and the real page structure, not in guesses about the UI.
  - Review generated tests for oracles derived from requirements, stable locators, no hard waits and no invented behaviour.
  - Prove generated tests by repeated runs and by breaking the feature so the test must fail.
  - Never send secrets or production personal data to AI tools; follow team policy and tool data terms.
quiz:
  - id: aie-aitest-q1
    type: single
    topic: ai-assisted-test-automation
    difficulty: intermediate
    prompt: An AI-generated test asserts only that the dashboard URL is reached after login. What is the main problem?
    options: ["It uses the wrong browser", "Its oracle is weak and would pass even if the dashboard showed wrong or no data", "It is too slow", "URLs cannot be asserted in Playwright"]
    answer: [1]
    explanation: Reaching a URL does not prove the requirement. Assertions should check the user-visible outcome the requirement describes.
  - id: aie-aitest-q2
    type: multiple
    topic: ai-assisted-test-automation
    difficulty: intermediate
    prompt: Which checks should a reviewer apply to an AI-generated Playwright test? Select all that apply.
    options: ["Assertions are derived from the requirement, not from current behaviour", "Locators use roles, labels or test ids rather than brittle CSS paths", "Fixed sleeps are used to make it stable", "The test fails when the feature is deliberately broken"]
    answer: [0, 1, 3]
    explanation: Fixed sleeps hide timing problems and slow suites. Playwright's auto-waiting and web-first assertions should be used instead.
  - id: aie-aitest-q3
    type: truefalse
    topic: ai-assisted-test-automation
    difficulty: beginner
    prompt: A test generated by an AI tool that passes on the first run is ready to merge without review.
    options: ["True", "False"]
    answer: [1]
    explanation: Passing once says nothing about whether it tests the right thing or is stable. Human review, repeated runs and a failing-when-broken check come first.
  - id: aie-aitest-q4
    type: scenario
    topic: ai-assisted-test-automation
    difficulty: intermediate
    prompt: A generated test clicks a "Export to PDF" button that does not exist in the app. What happened and what prevents it?
    options: ["A Playwright bug; upgrade Playwright", "The model hallucinated UI; ground the prompt in the real ARIA snapshot and requirement, and review before merging", "The browser blocked the button", "The test needs a longer timeout"]
    answer: [1]
    explanation: Models fill gaps with plausible inventions. Supplying the actual page structure and requiring human review catches invented elements.
---

## Beginner-friendly explanation

AI coding assistants can write test code quickly. Describe a feature and you get a Playwright test in seconds. That is genuinely useful for boilerplate, test ideas you had not considered, and varied test data. But the AI does not know your requirements, cannot see your real app unless you show it, and is very good at writing tests that **look** right and **pass** while checking almost nothing.

So the rule is simple: **AI drafts, humans decide.** You give the AI good inputs (the requirement and the real page structure), you review what it writes with a checklist, you run it many times to be sure it is stable, and you break the feature on purpose to make sure the test notices. The person who merges the test owns it, exactly as if they had typed it.

This lesson is about using AI to test software. The other lessons in this group are about testing AI itself, starting from [a strategy for testing AI systems](/careers/ai-engineering/ai-engineering/testing-ai-systems-strategy).

## Technical explanation

### Where AI helps and where it hurts

| Task | Helpfulness | Main risk |
|---|---|---|
| Brainstorm test ideas and edge cases from a requirement | High | Misses domain rules; needs expert pruning |
| Draft Playwright tests from requirement plus page structure | High | Invented elements, weak oracles |
| Generate synthetic test data | High | Unrealistic data; accidental real personal data |
| Refactor tests into page objects or fixtures | Medium | Subtle behaviour changes |
| Explain a failing test from a trace | Medium | Confident wrong diagnosis |
| Decide expected results | Low | Encodes current behaviour, including bugs |
| Self-healing locators applied automatically | Risky | Silently testing the wrong element |

### Grounding generation

Models invent plausible UI when they lack facts. Ground them with:

- **The requirement or acceptance criteria**, which define the oracle.
- **The real page structure**: Playwright's **ARIA snapshot** (`locator.aria_snapshot()`) gives a compact YAML view of roles and accessible names, ideal for role-based locators and safe to share once you check it for personal data.
- **Your conventions**: fixture names, page objects, locator policy, no fixed waits.
- **Structured output**: ask for a JSON list of test cases (title, steps, assertions, requirement id) before code, so a human reviews intent first.

Playwright's own **codegen** records real interactions and produces locators from the actual DOM; combining recorded flows with AI-suggested assertions from requirements is often more reliable than pure generation.

### Review checklist

1. **Oracle**: does each assertion trace to a requirement? Would it fail if the behaviour were wrong?
2. **Locators**: `get_by_role`, `get_by_label`, `get_by_test_id`, not long CSS or XPath chains.
3. **Waiting**: web-first assertions (`expect(...).to_be_visible()`), no `wait_for_timeout`.
4. **Reality**: every element, route and message exists in the app.
5. **Data**: synthetic, isolated per test, cleaned up; no secrets or real personal data.
6. **Independence**: no dependence on test order.
7. **Scope**: one behaviour per test, readable name.

### Validating generated tests

- **Repeat runs**: `pytest --count` (pytest-repeat) or Playwright Test's `--repeat-each` expose flakiness.
- **Mutation check**: deliberately break the behaviour (change a message, disable validation) in a local branch; the test must fail. This is a small, manual form of mutation testing and is the most direct proof that the oracle is real.
- **Coverage of the requirement**: map tests to acceptance criteria; gaps are visible.

### Security and policy

AI tools are part of your supply chain. Prompts may be retained by the provider depending on terms and settings. Agree which tools are approved, never paste secrets or production personal data, and remember that AI-suggested dependencies or snippets need the same review as any third-party code (see the supply-chain and improper-output-handling items in the OWASP Top 10 for LLM Applications). If an AI agent runs tests or browsers on your behalf, give it a sandboxed environment and test accounts only.

## Real-world example

A QA team adopted an assistant to generate end-to-end tests for a checkout flow. Within a sprint they had many new tests, all green. A later defect let orders through with an expired card, and no test failed. Review showed that many generated tests asserted only that a "Thank you" heading appeared, because the model had been given the page source of the success page and inferred that this was the outcome to check. Several tests also used `wait_for_timeout(3000)`.

The team changed the process: generation prompts included the acceptance criteria and the ARIA snapshot, the model first returned a JSON plan of cases mapped to criteria, a tester approved the plan, and generated code went through the checklist. Each new test had to pass 20 repeated runs and fail against a branch with the feature disabled. Fewer tests were added per sprint, but each one now caught real regressions, including a new case for expired cards.

## Step-by-step walkthrough

1. **Collect inputs**: requirement with acceptance criteria, ARIA snapshot of the page (in a test environment with synthetic data), team conventions.
2. **Ask for a test plan** in structured JSON; review and edit it.
3. **Generate code** for the approved plan only.
4. **Review** with the checklist; fix locators, waits and oracles.
5. **Run repeatedly** to catch flakiness.
6. **Break the feature** and confirm the test fails.
7. **Merge** with the human reviewer named as owner; note AI assistance if team policy requires.

## Code examples

Capture the real page structure to ground the prompt:

```python
# tools/snapshot_page.py
from playwright.sync_api import sync_playwright

def capture(url: str) -> str:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        snapshot = page.locator("body").aria_snapshot()
        browser.close()
        return snapshot

if __name__ == "__main__":
    print(capture("http://localhost:3000/signup"))  # your own test environment
```

Build a structured planning prompt and validate the model's plan before any code is written. `call_model` is your approved model client:

```python
# tools/plan_tests.py
import json
from pydantic import BaseModel, Field

class PlannedTest(BaseModel):
    title: str
    requirement_id: str
    steps: list[str] = Field(min_length=1)
    assertions: list[str] = Field(min_length=1)

class TestPlan(BaseModel):
    tests: list[PlannedTest]

PROMPT = """You draft Playwright test plans. Use ONLY elements present in the ARIA snapshot.
Every assertion must come from an acceptance criterion and name its id.
Return JSON: {{"tests": [{{"title", "requirement_id", "steps", "assertions"}}]}}

ACCEPTANCE CRITERIA:
{criteria}

ARIA SNAPSHOT:
{snapshot}"""

def plan_tests(call_model, criteria: str, snapshot: str) -> TestPlan:
    raw = call_model(PROMPT.format(criteria=criteria, snapshot=snapshot))
    plan = TestPlan.model_validate(json.loads(raw))
    known_ids = {line.split(":")[0].strip() for line in criteria.splitlines() if ":" in line}
    unknown = [t.requirement_id for t in plan.tests if t.requirement_id not in known_ids]
    if unknown:
        raise ValueError(f"plan references unknown requirements: {unknown}")
    return plan
```

A reviewed test, after a human applied the checklist (role locators, web-first assertions, oracles from criteria, synthetic data):

```python
# tests/e2e/test_signup.py
import uuid
import pytest
from playwright.sync_api import Page, expect

# AC-1: a valid sign-up shows the welcome heading with the user's first name.
# AC-2: an email already in use shows "This email is already registered" and no account is created.

@pytest.fixture
def new_email() -> str:
    return f"qa+{uuid.uuid4().hex[:10]}@example.test"

def fill_form(page: Page, email: str) -> None:
    page.get_by_label("First name").fill("Ada")
    page.get_by_label("Email").fill(email)
    page.get_by_label("Password", exact=True).fill("Correct-Horse-42")
    page.get_by_role("button", name="Create account").click()

def test_valid_signup_shows_personal_welcome(page: Page, base_url: str, new_email: str):
    page.goto(f"{base_url}/signup")
    fill_form(page, new_email)
    expect(page.get_by_role("heading", name="Welcome, Ada")).to_be_visible()

def test_duplicate_email_is_rejected(page: Page, base_url: str, new_email: str):
    page.goto(f"{base_url}/signup")
    fill_form(page, new_email)
    page.goto(f"{base_url}/signup")
    fill_form(page, new_email)
    expect(page.get_by_role("alert")).to_have_text("This email is already registered")
    expect(page.get_by_role("heading", name="Welcome, Ada")).not_to_be_visible()
```

A lightweight automated pre-review that flags common problems in generated test files before a human looks at them. It does not replace review:

```python
# tools/lint_generated_tests.py
import re
import sys
from pathlib import Path

RULES = {
    "fixed wait": re.compile(r"wait_for_timeout|time\.sleep"),
    "brittle xpath": re.compile(r"locator\(\s*['\"](//|xpath=)"),
    "no assertion": None,  # checked separately
    "possible secret": re.compile(r"(api[_-]?key|password)\s*=\s*['\"][^'\"]{12,}", re.I),
}

def check(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    problems = [name for name, rx in RULES.items() if rx and rx.search(text)]
    for match in re.finditer(r"def (test_\w+)\(.*?(?=\ndef |\Z)", text, re.S):
        if "expect(" not in match.group(0) and "assert " not in match.group(0):
            problems.append(f"no assertion in {match.group(1)}")
    return problems

if __name__ == "__main__":
    failed = False
    for file in sys.argv[1:]:
        for problem in check(Path(file)):
            print(f"{file}: {problem}")
            failed = True
    sys.exit(1 if failed else 0)
```

Run the stability and failing-when-broken checks:

```bash
python tools/lint_generated_tests.py tests/e2e/test_signup.py
pytest tests/e2e/test_signup.py --count=20 -p no:randomly   # requires pytest-repeat
git switch -c verify-oracle   # then break the duplicate-email check locally
pytest tests/e2e/test_signup.py::test_duplicate_email_is_rejected   # must FAIL
```

## Expected output

The linter prints nothing and exits 0 for the reviewed file; on a raw generated file it typically reports items such as `fixed wait` or `no assertion in test_open_page`. The repeated run reports 40 passed (2 tests times 20). On the branch where duplicate-email validation is disabled, `test_duplicate_email_is_rejected` fails because the alert never appears, which proves the oracle is real. Discard that branch afterwards.

## Common mistakes

- **Merging green generated tests without review**, mistaking volume for coverage.
- **Letting the model derive expected results from the current implementation**, which locks in existing bugs.
- **Prompting without the real page structure**, leading to invented buttons, routes and messages.
- **Accepting fixed sleeps and brittle CSS or XPath locators.**
- **Auto-applying self-healing locator changes** without a human checking that the new element is the right one.
- **Pasting secrets, tokens or production personal data** into prompts or snapshots.
- **No ownership**: nobody feels responsible for a test "the AI wrote".

## Troubleshooting

- **The model keeps inventing elements.** Shorten the snapshot to the relevant region, state "use only elements in the snapshot", and validate the plan before code generation.
- **Generated tests are flaky.** Look for fixed waits, shared data and order dependence; use unique synthetic data and web-first assertions.
- **Reviews take longer than writing tests by hand.** Use AI for ideas and boilerplate only on that area, and invest in good page objects and fixtures the model can reuse.

## Key takeaways summary

AI assistance makes test automation faster to draft, not automatically better. Ground generation in requirements and real ARIA snapshots, review intent as a structured plan before code, apply a checklist for oracles, locators, waits and data, and prove each test with repeated runs and a deliberate break. Keep secrets and personal data out of prompts, and keep a named human accountable for every merged test. When the system under test is itself an AI feature, combine these practices with [LLM evaluation and evals](/careers/ai-engineering/ai-engineering/llm-evaluation-and-evals).
