---
slug: smoke-and-sanity-testing
title: Smoke and Sanity Testing
summary: Smoke tests quickly check that a new build's main functions work well enough to be worth testing further. Learn how the ISTQB glossary defines them, how many teams use sanity testing for a narrow post-change check, and how to design both.
level: beginner
duration: 25
tags: [test-types, smoke-testing, sanity-testing, build-verification, istqb]
objectives:
  - Define smoke testing and explain its role as a gate before further testing
  - Explain how the ISTQB glossary and common industry usage treat sanity testing
  - Design a short smoke suite for a web application
  - Decide when a build should be rejected after a failed smoke test
prerequisites:
  - Regression testing
  - Retesting and confirmation testing
related: [regression-testing, retesting-and-confirmation-testing, entry-and-exit-criteria, ci-cd-for-test-engineers, release-readiness]
references:
  - title: ISTQB official site (CTFL syllabus and glossary)
    url: https://www.istqb.org/
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: GitHub Actions documentation
    url: https://docs.github.com/en/actions
interview:
  - q: What is smoke testing?
    a: Smoke testing is a small, fast set of tests covering the main functionality of a build, run before planned testing begins, to decide whether the build is stable enough to test further. If the application does not start, users cannot log in, or the core transaction fails, there is no point running hundreds of detailed tests, so the build is rejected and returned to development. It is broad and shallow, and is often automated as a build verification step in CI.
  - q: What is the difference between smoke and sanity testing?
    a: Terminology varies. The ISTQB glossary treats sanity test as a synonym for smoke test. Many teams, however, use sanity testing for a narrow, focused check after a small change or fix, to see that the specific area behaves rationally before deciding whether deeper testing is needed. In that usage, smoke is broad and shallow across the whole build, and sanity is narrow and a little deeper in one area. In an interview or a new team I state both meanings and confirm which one the team uses.
  - q: Who decides what goes in a smoke suite?
    a: The test team proposes it with developers and the product owner, based on risk. It should contain only the checks whose failure would make further testing pointless or a release unthinkable, such as deployment health, login, the core business transaction and critical integrations. It should stay short, typically minutes, so it can run on every build.
practice:
  - "Write a smoke suite of no more than eight checks for an online banking web app. Explain why each check is there."
  - "A hotfix changes only the password-reset email template. Write a sanity check for it, then list which smoke checks you would still run."
  - "Define a rule your team could adopt for rejecting a build after a failed smoke test, including who is notified and what evidence is attached."
takeaways:
  - A smoke test checks the main functions of a build to decide if it is worth testing further.
  - The ISTQB glossary treats sanity test as a synonym for smoke test; many teams use sanity for a narrow post-change check.
  - Smoke suites must be short, stable and focused on the most critical paths.
  - A failed smoke test should reject the build before deeper testing begins.
  - Clarify the team's terminology rather than arguing over definitions.
quiz:
  - id: smoke-q1
    type: single
    topic: smoke-and-sanity-testing
    difficulty: beginner
    prompt: What is the main purpose of a smoke test?
    options: ["To test every feature in depth", "To check that the main functions of a build work well enough to proceed with further testing", "To measure performance under peak load", "To confirm users accept the system"]
    answer: [1]
    explanation: Smoke testing is a quick gate on the main functionality. In-depth testing comes after it passes, and load and acceptance testing have different goals.
  - id: smoke-q2
    type: scenario
    topic: smoke-and-sanity-testing
    difficulty: intermediate
    prompt: A new build is deployed. The smoke test shows users cannot log in. Two hundred regression tests are scheduled. What should the team do?
    options: ["Run all regression tests anyway and log every failure", "Reject the build, report the login failure with evidence and wait for a fixed build", "Skip login-related tests and run the rest", "Mark the release as ready because only one test failed"]
    answer: [1]
    explanation: When a smoke check on a critical path fails, further testing is mostly wasted effort and would produce many duplicate failures. Rejecting the build quickly is exactly what a smoke test exists for.
  - id: smoke-q3
    type: truefalse
    topic: smoke-and-sanity-testing
    difficulty: beginner
    prompt: In the ISTQB glossary, sanity test is treated as a synonym for smoke test.
    options: ["True", "False"]
    answer: [0]
    explanation: The glossary does not define them separately. The narrow post-change meaning of sanity testing is common industry usage, which is why teams should agree on their terms.
  - id: smoke-q4
    type: multiple
    topic: smoke-and-sanity-testing
    difficulty: intermediate
    prompt: Which checks belong in a smoke suite for an e-commerce site? Select all that apply.
    options: ["Home page loads and the health endpoint reports OK", "A registered user can log in", "A user can place an order with a test card", "Every product filter combination returns correct results", "The tooltip text on the profile page is correctly spelled"]
    answer: [0, 1, 2]
    explanation: Smoke checks cover critical, broad paths whose failure blocks further testing. Exhaustive filter combinations and cosmetic text are important but belong in detailed functional testing, not a quick gate.
---

## Beginner-friendly explanation

The term is often traced to hardware: when an engineer powered up a new circuit board, the first test was simply whether it started smoking. If it did, there was no point measuring anything else.

In software, a **smoke test** asks the same blunt question about a new build: **does it basically work?** Does it start, can you log in, does the main thing it is for work at all? If not, the build goes straight back and nobody wastes a day running detailed tests on it.

A **sanity test**, in the way many teams use the word, is a quick, focused check after a small change: "they fixed the discount code, let me make sure discount codes behave sensibly before I go further."

## Technical explanation

### Smoke testing

The ISTQB glossary defines a smoke test as a test suite that covers the main functionality of a component or system to determine whether it works properly before planned testing begins. In practice it is also called a **build verification test** (BVT). Its characteristics:

- **Broad and shallow**: touches the most important functions without going deep.
- **Fast**: minutes, so it can run on every build.
- **Gatekeeping**: failure means the build is rejected; this is often written into [entry criteria](/learn/manual-testing/entry-and-exit-criteria) for a test phase.
- **Stable**: a flaky smoke test is worse than none, because people learn to ignore it.

### Sanity testing

The ISTQB glossary treats **sanity test** as a synonym of smoke test. In common industry usage, though, many teams distinguish the two:

| | Smoke testing | Sanity testing (common usage) |
|---|---|---|
| Scope | Whole build, main functions | One area affected by a recent change |
| Depth | Shallow | Narrow, slightly deeper |
| When | Every new build or deployment | After a small fix or change, before deeper testing |
| Typical form | Scripted, often automated | Often unscripted, quick manual checks |
| Question | Is this build testable at all? | Does this changed area behave rationally? |

Neither replaces [regression testing](/learn/manual-testing/regression-testing) or [confirmation testing](/learn/manual-testing/retesting-and-confirmation-testing). A sanity check after a fix is lighter than a full confirmation test with variations.

```mermaid
flowchart TB
  B["New build deployed"] --> S{"Smoke suite passes?"}
  S -->|No| R["Reject build, report blocker"]
  S -->|Yes| C{"Is it a small targeted change?"}
  C -->|Yes| SA["Sanity check the changed area"]
  C -->|No| P["Proceed with planned testing"]
  SA --> OK{"Behaves sensibly?"}
  OK -->|Yes| P
  OK -->|No| R
```

## Real-world example

A team releasing a hotel booking site ran an automated smoke suite of six checks after every deployment to the test environment: health endpoint, home page, search returns results, hotel page loads, a test user can log in, and a booking can be made with a sandbox card.

One morning the booking check failed: the payment page showed a configuration error because a new environment variable had not been set in the test environment. The smoke run took four minutes and the team fixed the configuration within the hour. Without the gate, five testers would have started their planned work and logged a stream of duplicate "cannot book" defects.

## Step-by-step walkthrough

1. **List critical paths**: what must work for the product to be usable at all, such as availability, login, the core transaction and critical integrations.
2. **Write one check per path**, with a clear pass/fail result and no dependence on other tests.
3. **Keep it short**: if the suite grows past a few minutes, move checks into regression.
4. **Automate it where practical** and wire it into the pipeline right after deployment.
5. **Agree the rule**: a failed smoke check rejects the build; say who is notified and what evidence is attached.
6. **For small changes, add a sanity check** of the affected area before planned testing continues.
7. **Review the suite** each release: remove checks that no longer reflect critical paths, add new ones.

## Code examples

A GitHub Actions job that runs a tagged smoke suite after deployment and fails the pipeline if any check fails:

```yaml
smoke:
  runs-on: ubuntu-latest
  needs: deploy-test
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
    - run: npm ci
    - run: npx playwright test --grep @smoke
      env:
        BASE_URL: ${{ vars.TEST_ENV_URL }}
```

## Expected output

When every check passes, the job is green and later jobs, such as the full regression run, start. When one fails, the job is red, later jobs are skipped, and the failing check's name and trace show what blocked the build.

## Common mistakes

- **Letting the smoke suite grow** into a mini regression suite that takes an hour.
- **Including flaky checks**, which trains the team to ignore failures.
- **Running deeper tests after a smoke failure** and flooding the tracker with duplicates.
- **Arguing over definitions** instead of agreeing the team's meaning of "sanity".
- **Treating a sanity check as full confirmation testing** of a defect fix.

## Troubleshooting

- **Smoke passes but testers still hit blockers.** The suite misses a critical path; add a check for each blocker that slipped through.
- **Smoke fails intermittently.** Separate environment problems from product problems; add a health check before the suite starts.
- **Developers dispute smoke rejections.** Make the gate rule explicit in entry criteria so the decision is not personal.

## Key takeaways summary

Smoke testing is a fast, broad gate that protects the team from testing a broken build. Sanity testing, as many teams use it, is a quick, focused check of a changed area. Keep both short and stable, agree what each word means in your team, and never let them replace regression or confirmation testing.
