---
slug: ci-cd-for-test-engineers
title: CI/CD for Test Engineers
summary: Understand continuous integration, continuous delivery and continuous deployment from a tester's point of view, and learn how to place the right tests in the right pipeline stage as quality gates.
level: intermediate
duration: 35
tags: [ci-cd, devops, pipelines, quality-gates]
objectives:
  - Distinguish continuous integration, continuous delivery and continuous deployment precisely
  - Explain how a pipeline uses exit codes and quality gates to stop a bad change
  - Assign test types to pipeline stages based on speed, cost and confidence
  - Design a pipeline that gives fast feedback without sacrificing release confidence
prerequisites:
  - Basic Git workflow (branches, commits, pull requests)
  - Running an automated test suite from the command line
related: [github-actions-for-tests, jenkins-pipelines-for-tests, docker-for-testers, test-pyramid-and-strategy, shift-left-and-continuous-testing, api-testing-in-ci]
references:
  - title: Martin Fowler, Continuous Integration
    url: https://martinfowler.com/articles/continuousIntegration.html
  - title: DORA research and capabilities
    url: https://dora.dev/
  - title: GitHub Actions documentation
    url: https://docs.github.com/en/actions
  - title: Jenkins User Documentation
    url: https://www.jenkins.io/doc/
interview:
  - q: What is the difference between continuous delivery and continuous deployment?
    a: Both keep the main branch in a releasable state by running every change through an automated pipeline. In continuous delivery, the final push to production is a deliberate human or business decision, often a single button. In continuous deployment, every change that passes all pipeline stages is released to production automatically with no manual step. Continuous deployment therefore needs much stronger automated gates, monitoring and rollback, because nobody looks at the change before customers do.
  - q: Where would you put each type of test in a CI/CD pipeline, and why?
    a: I order stages by speed and cost. The commit stage runs compilation, static analysis, unit tests and fast component tests so a developer gets feedback within minutes. A later acceptance stage deploys the build to a production-like environment and runs API, contract and a small set of critical end-to-end journeys. Slower suites such as performance, broad cross-browser or security scans run in parallel or on a schedule if they would otherwise block every commit. Each stage is a gate, so a failure stops the artifact from being promoted.
  - q: "System design: how would you make a slow, flaky 90-minute pipeline useful again?"
    a: First I would measure, splitting duration and failure causes by stage and by test. Then I would move checks down the pyramid where possible, run independent suites in parallel and shard large suites across agents, and cache dependencies. Flaky tests go into a tracked quarantine with an owner and a deadline rather than being silently retried, so the main gate becomes trustworthy again. Finally I would split the pipeline into a fast blocking path for every pull request and a slower non-blocking or scheduled path, and agree with the team which signals actually block a release.
practice:
  - "Draw your current project's pipeline as stages. For each stage write its duration, which tests run, and whether a failure blocks promotion."
  - "Take a test suite that runs on every commit and identify three tests that could move to a cheaper level of the pyramid."
  - "Write a short policy for flaky tests: how they are detected, who owns the fix, and when a quarantined test must be fixed or deleted."
takeaways:
  - CI means integrating small changes into the main branch frequently, with every integration verified by an automated build and tests.
  - Continuous delivery keeps every change releasable; continuous deployment also releases it automatically.
  - Pipelines detect failure through process exit codes, so a test runner must exit non-zero when tests fail.
  - Order stages fastest and cheapest first; every stage is a quality gate that stops promotion.
  - A red build must mean something, so flaky tests destroy the value of the pipeline.
quiz:
  - id: sdet-cicd-q1
    type: single
    topic: ci-cd-for-test-engineers
    difficulty: beginner
    prompt: Which statement correctly describes continuous deployment?
    options:
      - "Developers merge to the main branch at least once a day"
      - "Every change is kept releasable, and a person decides when to release"
      - "Every change that passes the automated pipeline is released to production automatically"
      - "Builds are deployed to a test environment every night"
    answer: [2]
    explanation: Continuous deployment removes the manual release decision. Option two describes continuous delivery, which is the tempting distractor; option one describes a practice of continuous integration.
  - id: sdet-cicd-q2
    type: scenario
    topic: ci-cd-for-test-engineers
    difficulty: intermediate
    prompt: Every pull request runs a 70-minute end-to-end suite before anyone gets feedback, and developers have started merging without waiting. What is the best first change?
    options:
      - "Delete the end-to-end suite"
      - "Add a fast commit stage with unit and component tests that gives feedback first, and run the long suite in parallel shards or later in the pipeline"
      - "Make the end-to-end suite non-blocking for all branches including main"
      - "Ask developers to run the suite locally instead"
    answer: [1]
    explanation: Fast feedback comes from ordering stages by speed and moving checks to cheaper levels, while still keeping the slower confidence-building suite. Deleting or ignoring the suite removes the safety net; local runs are not a reliable gate.
  - id: sdet-cicd-q3
    type: debugging
    topic: ci-cd-for-test-engineers
    difficulty: intermediate
    prompt: A team's test step always shows green even when tests fail. What is the defect in this script?
    code: |
      #!/bin/sh
      mvn -B test | tee test.log
      echo "Tests finished"
    codeLanguage: bash
    options:
      - "mvn needs the -X flag to report failures"
      - "The script's exit status comes from the last command, echo, which always succeeds, so the failure is lost"
      - "tee deletes the test reports"
      - "-B makes Maven ignore test failures"
    answer: [1]
    explanation: CI decides pass or fail from the exit code. A shell script returns the status of its last command, and in a pipeline the status of the last command in the pipe (tee) is used unless pipefail is set. Use set -e and set -o pipefail where supported, or check the exit code explicitly. -B only selects batch mode.
  - id: sdet-cicd-q4
    type: truefalse
    topic: ci-cd-for-test-engineers
    difficulty: beginner
    prompt: In continuous delivery, a successful pipeline run means the build could be released to production, even if the team chooses not to release it yet.
    options: ["True", "False"]
    answer: [0]
    explanation: The defining property of continuous delivery is that the software is always in a releasable state. Releasing is a business decision taken separately.
---

## Beginner-friendly explanation

Picture a busy restaurant kitchen. If every cook prepared their part of a dish alone all week and only combined everything on Friday night, the plates would be a disaster and nobody would know whose ingredient caused the problem. Good kitchens taste and combine continuously: each component is checked the moment it is ready, and the head chef will not send a plate out until it passes a final look.

**Continuous integration and delivery (CI/CD)** brings that habit to software. Every small change is combined with everyone else's work straight away and checked automatically by a sequence of steps called a **pipeline**. As a test engineer, you decide which checks run, in what order, and which ones are allowed to stop a plate leaving the kitchen.

## Technical explanation

Three terms are often blurred together. Use them precisely:

| Practice | What it means | Who triggers production release |
|---|---|---|
| **Continuous integration (CI)** | Developers merge small changes into the main branch frequently; each merge is verified by an automated build and tests | Not about release |
| **Continuous delivery** | Every change that passes the pipeline is kept in a releasable state and can be deployed at any time | A person, as a business decision |
| **Continuous deployment** | Every change that passes the pipeline is deployed to production automatically | The pipeline itself |

A **pipeline** is an ordered set of **stages**. Each stage runs commands and the CI server reads their **exit codes**: zero means success, anything else means failure. A failed stage stops the build artifact from being **promoted** to the next stage. That is what makes each stage a **quality gate**: an automated pass or fail decision based on agreed criteria, such as "all unit tests pass" or "no new critical static-analysis findings".

A good pipeline builds the artifact **once** and promotes the same artifact through every stage. Rebuilding for each environment means you test one binary and ship another.

### Placing tests in stages

```mermaid
flowchart LR
  A["Commit stage: compile, lint, unit and component tests"] --> B["Acceptance stage: deploy to test env, API and contract tests, critical E2E"]
  B --> C["Extended checks: performance, security scans, cross-browser"]
  C --> D{"Release decision"}
  D -->|"continuous delivery: manual approval"| E["Production"]
  D -->|"continuous deployment: automatic"| E
```

The governing principle is **fast feedback**. The commit stage should return results while the developer still has the change in their head; Martin Fowler's article on CI describes aiming for a build of around ten minutes as a common rule of thumb. Slower suites move later, run in parallel, or run on a schedule, but they still need an owner who acts on failures.

| Stage | Typical tests | Goal |
|---|---|---|
| Commit | Unit, component, static analysis | Minutes; catch most logic errors cheaply |
| Acceptance | API, contract, integration, a few E2E journeys | Prove the deployed system works together |
| Extended | Load, security, accessibility, broad browser matrix | Non-functional confidence before release |
| Post-deploy | Smoke tests, synthetic monitoring | Confirm production health; trigger rollback |

## Real-world example

A retail team released once a month after a two-week manual regression phase. Their pipeline only compiled the code. A test engineer led the change in steps: unit and component tests were added to a commit stage that ran on every pull request; the team's most valuable checkout journeys were automated at API level and ran after each deploy to a shared test environment; and a handful of browser tests covered only what the API tests could not, such as the payment iframe hand-off.

Because the main branch was now verified on every merge, defects were found on the day they were introduced and fixed by the person who wrote them. The team moved to continuous delivery: they still pressed a button to release, but any green build could be shipped. They did not adopt continuous deployment until monitoring and automated rollback were in place.

## Step-by-step walkthrough

1. **Map the current flow** from commit to production, including manual steps and waiting time.
2. **Make the build reproducible** from a clean checkout with one command.
3. **Ensure every test runner exits non-zero on failure** and publishes machine-readable results (JUnit XML is widely supported).
4. **Create the commit stage** with the fastest, most reliable tests and make it block merges.
5. **Build the artifact once**, store it, and deploy that same artifact to later environments.
6. **Add acceptance and extended stages**, parallelising where suites are independent.
7. **Publish reports and artifacts** (logs, screenshots, traces) so failures can be diagnosed without re-running.
8. **Track pipeline health**: duration, failure causes and flaky tests.

## Code examples

Pipelines trust exit codes, so check what your runner returns. This shell snippet runs Maven tests and preserves the failure status even when output is piped to a log file:

```bash
#!/usr/bin/env bash
set -euo pipefail          # stop on errors, unset variables and failures inside pipes

mvn -B test | tee test.log
echo "Tests passed"
```

## Expected output

When a test fails, Maven prints a failure summary and exits non-zero. Because `pipefail` is set, the script stops before the final `echo` and the CI stage is marked as failed:

```text
[ERROR] Tests run: 12, Failures: 1, Errors: 0, Skipped: 0
[ERROR] BUILD FAILURE
Error: Process completed with exit code 1.
```

Without `set -o pipefail` the script would report the exit status of `tee`, which succeeds, and the failing build would show green.

## Common mistakes

- **Using CI, continuous delivery and continuous deployment as synonyms.** Interviewers notice; the difference is who decides to release.
- **Putting every test in one giant stage.** One slow suite delays all feedback, and developers start ignoring the pipeline.
- **Rebuilding per environment** instead of promoting one artifact.
- **Swallowing exit codes** with pipes, `|| true` or wrapper scripts, so failures look green.
- **Auto-retrying flaky tests forever** without tracking them. The gate becomes noise.
- **No artifacts on failure.** Without logs, screenshots or reports, every red build needs a manual re-run to diagnose.

## Troubleshooting

- **Passes locally, fails in CI.** Compare tool versions, time zone, locale, environment variables and test data. Running the build inside the same container image in both places removes most differences (see [Docker for testers](/learn/sdet/docker-for-testers)).
- **Pipeline is too slow.** Measure per stage first, then cache dependencies, parallelise and push tests down the pyramid.
- **Random red builds.** Identify flaky tests from history, quarantine them visibly with an owner, and fix the cause (usually waits, shared data or ordering).

## Key takeaways summary

CI/CD is how modern teams turn testing into a continuous, automated safety net. Know the three definitions precisely, order stages for fast feedback, make every stage an honest quality gate based on exit codes, and keep the signal trustworthy by treating flaky tests and missing reports as defects in the pipeline itself.
