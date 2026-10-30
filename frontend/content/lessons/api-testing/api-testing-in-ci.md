---
slug: api-testing-in-ci
title: API Testing in CI/CD
summary: Run API tests automatically on every change - choose which suites run when, manage environments and secrets, use Newman or Maven in GitHub Actions or Jenkins, publish reports, and handle flaky failures without ignoring real ones.
level: intermediate
duration: 35
tags: [api, ci-cd, github-actions, newman, automation]
objectives:
  - Explain where API tests fit in a CI/CD pipeline
  - Configure a pipeline that runs Newman or RestAssured tests and publishes reports
  - Manage environment URLs and secrets safely in CI
  - Decide what blocks a merge or deployment and how to treat flaky tests
prerequisites:
  - Newman command-line runs
  - RestAssured fundamentals
  - Git for testers
related: [newman-command-line-runs, restassured-fundamentals, contract-testing, api-test-data-management, shift-left-and-continuous-testing, git-for-testers]
references:
  - title: GitHub Actions documentation
    url: https://docs.github.com/en/actions
  - title: Jenkins User Documentation
    url: https://www.jenkins.io/doc/
  - title: Postman Learning Center — Newman
    url: https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/
  - title: Apache Maven Surefire Plugin
    url: https://maven.apache.org/surefire/maven-surefire-plugin/
interview:
  - q: How would you structure API tests in a CI/CD pipeline?
    a: In layers. On every pull request, fast checks run - unit tests, contract tests, and a smoke set of API tests against an ephemeral or service-level environment, ideally in a few minutes. After merge and deployment to a test environment, the full API regression runs. After deploying to staging or production, a small read-only smoke suite confirms the deployment. Failures on the PR block the merge; failures after deploy can trigger a rollback.
  - q: How do you handle secrets like API keys in CI?
    a: Never in the repository or collection files. They go in the CI system's secret store - GitHub Actions secrets, Jenkins credentials - and are injected as environment variables at runtime. They are masked in logs, scoped to the environments that need them, and test accounts use least privilege. I also check reports and logs don't print tokens.
  - q: A test fails intermittently in CI. What do you do?
    a: I don't just add retries and move on. I look at the failure history and logs, reproduce locally, and classify the cause - test data collision, timing or async write, environment instability, or a real intermittent product defect. Short-term I may quarantine it with a tracked ticket so it doesn't block everyone, but it stays visible and gets fixed or deleted. A retry hides a race condition that customers will hit.
practice:
  - "Write a GitHub Actions workflow that runs a Postman collection with Newman on every pull request and uploads a JUnit report."
  - "List which API tests in your project should block a merge and which should run nightly."
  - "Move one hard-coded API key out of a collection into a CI secret."
takeaways:
  - Fast, reliable API checks on every PR; fuller regression after deploy.
  - Environments and secrets are injected by CI, never committed.
  - Produce JUnit-style reports so the CI system shows each failure.
  - A red pipeline must mean something - fix or quarantine flaky tests visibly.
  - Gate deployments on contract verification and smoke tests.
quiz:
  - id: apici-q1
    type: single
    topic: api-testing-in-ci
    difficulty: beginner
    prompt: Where should an API key used by CI tests be stored?
    options: ["In the Postman environment file committed to Git", "Hard-coded in the test class", "In the CI system's secret store, injected as an environment variable", "In the README so the team can find it"]
    answer: [2]
    explanation: Secret stores keep keys out of version control, mask them in logs and control access. Anything committed to Git should be considered exposed.
  - id: apici-q2
    type: code-output
    topic: api-testing-in-ci
    difficulty: intermediate
    prompt: In this GitHub Actions step, what happens if any Newman assertion fails?
    code: |
      - name: Run API tests
        run: npx newman run collection.json -e ci.env.json --reporters cli,junit --reporter-junit-export results.xml
    codeLanguage: yaml
    options: ["Nothing; Newman always exits 0", "Newman exits with a non-zero code, so the step and job fail", "Only the JUnit report is affected", "The workflow retries automatically"]
    answer: [1]
    explanation: Newman returns a non-zero exit code when tests fail, and GitHub Actions marks a step failed on a non-zero exit. The JUnit file is written as well, if the run gets that far.
  - id: apici-q3
    type: multiple
    topic: api-testing-in-ci
    difficulty: intermediate
    prompt: Which practices make CI API tests trustworthy? Select all that apply.
    options: ["Each test creates its own data", "Tests depend on the execution order of other tests", "Reports are published in a format the CI shows (e.g. JUnit XML)", "Flaky tests are quarantined with a tracked ticket", "Failures are retried until they pass and then ignored"]
    answer: [0, 2, 3]
    explanation: Independent data, visible reports and tracked quarantines keep the signal reliable. Order dependence causes cascading failures, and blind retries hide real defects.
  - id: apici-q4
    type: truefalse
    topic: api-testing-in-ci
    difficulty: beginner
    prompt: A post-deployment smoke test against production should only use safe, read-only or clearly isolated test operations.
    options: ["True", "False"]
    answer: [0]
    explanation: Production smoke tests must not create real orders, charge cards or alter customer data. Use read-only checks or dedicated, isolated test accounts approved for this purpose.
---

## Beginner-friendly explanation

Imagine a bakery where every new batch of bread is tasted before it goes on the shelf — automatically, every single time, not just when someone remembers. If a batch tastes wrong, it never reaches customers, and the baker knows immediately which change to the recipe caused it.

**CI/CD** (continuous integration and continuous delivery/deployment) is that automatic tasting for software. Every time a developer pushes code, a pipeline builds it and runs tests. **API tests in CI** mean your Postman collections or RestAssured suites run automatically, and a failure stops a broken change before it ships.

## Technical explanation

A **pipeline** is a series of stages triggered by events (push, pull request, merge, schedule). Common tools are GitHub Actions, GitLab CI, Jenkins and Azure Pipelines. API tests plug in at several points:

| Stage | Trigger | What runs | Blocks? |
|---|---|---|---|
| Pull request | Every PR | Unit, [contract](/learn/api-testing/contract-testing), API smoke against an ephemeral or service-level environment | Merge |
| After merge | Merge to main, deploy to test env | Full API regression | Promotion to staging |
| Nightly | Schedule | Long-running suites, data-heavy cases | Raises a ticket |
| Post-deploy | Each deployment | Small read-only smoke suite | Rollback decision |

Requirements for running tests in CI:

- **Headless command-line execution:** Newman for Postman collections (see [Newman command-line runs](/learn/api-testing/newman-command-line-runs)), `mvn test` for RestAssured with TestNG or JUnit.
- **Exit codes:** a failing test must make the command exit non-zero so the job fails.
- **Configuration from the environment:** base URLs and credentials come from environment variables or CI secrets, not from files in Git.
- **Reports:** JUnit XML (understood by most CI systems), plus HTML artifacts for humans.
- **Isolation:** each test creates the data it needs; no order dependence.

```mermaid
flowchart LR
  PR[Pull request] --> B[Build + unit tests]
  B --> C[Contract tests]
  C --> S[API smoke on ephemeral env]
  S -->|green| M[Merge]
  M --> D[Deploy to test env]
  D --> R[Full API regression]
  R -->|green| ST[Deploy to staging/prod]
  ST --> PS[Post-deploy smoke]
```

## Real-world example

A logistics team ran their Postman collection manually "before releases". Releases happened twice a week, and twice in a month a backend change broke the shipment-tracking endpoint for a day. They moved the collection to Newman in GitHub Actions on every PR against a containerised test environment. The next breaking change — a renamed query parameter — failed the PR check within minutes, with the failed request highlighted in the JUnit report. The developer fixed it before merging.

## Step-by-step walkthrough

1. **Make tests runnable headless** with one command and no manual steps.
2. **Externalise configuration:** base URL, tokens and test-account credentials as environment variables.
3. **Add secrets** to the CI secret store and reference them in the workflow.
4. **Write the workflow** (below): check out, set up tools, run tests, publish reports.
5. **Decide gates:** what blocks a merge, what blocks a deploy, what only notifies.
6. **Watch flakiness:** track failure rates; quarantine with a ticket; fix the root cause.

## Code examples

GitHub Actions running a Postman collection with Newman on every pull request:

```yaml
name: api-tests
on:
  pull_request:
    branches: [main]

jobs:
  newman:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Run API tests
        env:
          API_KEY: ${{ secrets.API_TEST_KEY }}
        run: >
          npx newman run tests/orders.postman_collection.json
          -e tests/ci.postman_environment.json
          --env-var "apiKey=$API_KEY"
          --reporters cli,junit
          --reporter-junit-export results/newman.xml
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: newman-report
          path: results/
```

For a RestAssured suite, the run step becomes `mvn -B test -DbaseUrl=$BASE_URL`, and Maven Surefire writes JUnit XML to `target/surefire-reports`. Action versions change over time; check the current major versions in the GitHub Actions documentation.

## Expected output

On success the job is green. On failure Newman prints a summary and exits non-zero:

```text
┌─────────────────────────┬──────────┬──────────┐
│                         │ executed │   failed │
├─────────────────────────┼──────────┼──────────┤
│              assertions │       48 │        1 │
└─────────────────────────┴──────────┴──────────┘
#  failure        detail
1. AssertionError Status code is 200
                  expected response to have status code 200 but got 400
```

## Troubleshooting

- **Works locally, fails in CI:** compare base URL, environment variables, time zone, and whether the CI runner can reach the environment (network rules).
- **Secrets appear empty:** secrets are not passed to workflows triggered from forks by default; check the trigger.
- **Intermittent failures:** look for shared data, fixed sleeps, and environment restarts during the run.

## Common mistakes

- **Committing environment files with real tokens.**
- **Running the entire slow regression on every PR**, so developers stop waiting for it.
- **Tests that depend on each other's data or order.**
- **Retrying failures automatically and never investigating.**
- **Production smoke tests that create real transactions.**

## Key takeaways summary

Put fast, reliable API checks on every pull request and fuller suites after deployment. Configure through environment variables and secrets, publish JUnit reports, and keep the pipeline trustworthy by fixing flaky tests rather than hiding them.
