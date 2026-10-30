---
slug: github-actions-for-tests
title: GitHub Actions for Tests
summary: Write GitHub Actions workflows that run your automated tests on every push and pull request, across a matrix of versions, with dependency caching and test reports saved as artifacts.
level: intermediate
duration: 40
tags: [github-actions, ci-cd, yaml, automation]
objectives:
  - Explain the structure of a workflow file - triggers, jobs, runners and steps
  - Write a workflow that checks out code, sets up Java or Node.js and runs tests
  - Use a matrix to test several versions or browsers in parallel
  - Cache dependencies and upload test reports as artifacts even when tests fail
prerequisites:
  - Git and GitHub pull requests
  - Running Maven or npm tests locally
  - Basic YAML syntax
related: [ci-cd-for-test-engineers, jenkins-pipelines-for-tests, docker-for-testers, parallel-execution, reporting-and-logging, git-for-testers]
references:
  - title: GitHub Actions documentation
    url: https://docs.github.com/en/actions
  - title: actions/setup-java repository and usage
    url: https://github.com/actions/setup-java
  - title: actions/upload-artifact repository and usage
    url: https://github.com/actions/upload-artifact
interview:
  - q: Walk me through the structure of a GitHub Actions workflow.
    a: A workflow is a YAML file in the .github/workflows directory. The on key lists the events that trigger it, such as push and pull_request. It contains one or more jobs; each job has an id, a runs-on value naming the runner, and a list of steps. Steps either use a published action with uses, such as actions/checkout, or run shell commands with run. Jobs run in parallel by default unless one declares needs on another, and steps inside a job run sequentially on the same runner.
  - q: Your matrix runs tests on three Java versions. How do you make sure every leg uploads its report, including failing ones?
    a: Add an upload-artifact step with if always() so it runs even after the test step fails, and give each artifact a unique name built from the matrix value, for example test-results-java-17. With upload-artifact v4, artifact names must be unique within a run, so a shared name across matrix legs causes a conflict. I would also set fail-fast to false if I want every leg to finish rather than being cancelled when the first one fails.
  - q: "System design: how would you structure GitHub Actions for a repo with unit, API and UI suites?"
    a: I would have a fast job for build and unit tests on every pull request, then API and UI jobs that declare needs on it so they only start once the build is green. Large UI suites are sharded across a matrix of shard indexes. Dependencies are cached through the setup actions, reports and traces are uploaded as artifacts with if always(), and a nightly scheduled workflow runs the broad browser matrix that would be too slow for every pull request. Secrets come from repository or environment secrets, never from the YAML, and branch protection makes the required jobs block merges.
practice:
  - "Write a workflow that runs npm ci and npm test on Node.js 20 and 22 using a matrix, on push and pull_request."
  - "Break a test deliberately, push it, and confirm that your report artifact is still uploaded. Then remove if always() and observe the difference."
  - "Add caching to an existing Maven workflow and compare the duration of the dependency download step between two runs."
takeaways:
  - Workflows live in .github/workflows and are triggered by events listed under on.
  - A job runs on a runner chosen by runs-on; its steps run in order and share the workspace.
  - Use the official setup actions with their cache option to speed up dependency installs.
  - A matrix runs the same job across combinations in parallel; set fail-fast to false when you want every result.
  - Upload reports with if always() and unique artifact names so failures are diagnosable.
quiz:
  - id: sdet-gha-q1
    type: code-output
    topic: github-actions-for-tests
    difficulty: intermediate
    prompt: How many jobs does this matrix produce for a single push?
    code: |
      strategy:
        matrix:
          java: [17, 21]
          os: [ubuntu-latest, windows-latest, macos-latest]
    codeLanguage: yaml
    options: ["2", "3", "5", "6"]
    answer: [3]
    explanation: A matrix creates one job per combination of values, so 2 Java versions times 3 operating systems gives 6 jobs. Five would be adding the lists rather than multiplying them.
  - id: sdet-gha-q2
    type: debugging
    topic: github-actions-for-tests
    difficulty: intermediate
    prompt: Test reports are uploaded when tests pass but never when they fail. What is the fix?
    code: |
      - run: mvn -B test
      - uses: actions/upload-artifact@v4
        with:
          name: surefire-reports
          path: target/surefire-reports
    codeLanguage: yaml
    options:
      - "Add continue-on-error: true to the upload step"
      - "Add if: always() to the upload step"
      - "Change upload-artifact@v4 to upload-artifact@latest"
      - "Move the upload step before the test step"
    answer: [1]
    explanation: Steps are skipped after a failure unless their condition says otherwise; if always() makes the upload run regardless of earlier failures. continue-on-error on the upload step does not help because the upload step is never started, and uploading before the tests run would upload nothing.
  - id: sdet-gha-q3
    type: multiple
    topic: github-actions-for-tests
    difficulty: beginner
    prompt: Which of the following are valid ways to trigger a workflow on both pushes and pull requests? Select all that apply.
    options:
      - "on: [push, pull_request]"
      - "on: { push: {}, pull_request: {} }"
      - "trigger: [push, pull_request]"
      - "runs-on: [push, pull_request]"
    answer: [0, 1]
    explanation: The on key accepts a list of event names or a map of events with optional filters. trigger is not a workflow key, and runs-on selects the runner, not the event.
  - id: sdet-gha-q4
    type: truefalse
    topic: github-actions-for-tests
    difficulty: intermediate
    prompt: Jobs in the same workflow run one after another by default.
    options: ["True", "False"]
    answer: [1]
    explanation: Jobs run in parallel by default. To make one job wait for another you declare needs. Steps within a single job, by contrast, do run sequentially.
---

## Beginner-friendly explanation

Imagine a robot assistant who lives next to your code repository. Every time someone pushes a change or opens a pull request, the robot rents a clean computer, downloads the code, installs the tools, runs all the tests and reports back with a green tick or a red cross. If something fails, it keeps the evidence in a folder you can download.

**GitHub Actions** is that robot. You give it instructions in a small text file, and GitHub runs them for you whenever the events you choose happen.

## Technical explanation

A **workflow** is a YAML file stored in `.github/workflows/` in the repository. Its main parts are:

| Key | Purpose |
|---|---|
| `on` | Events that trigger the workflow, such as `push`, `pull_request`, `schedule` or `workflow_dispatch` (manual) |
| `jobs.<job_id>` | A unit of work; jobs run **in parallel** unless one declares `needs` |
| `runs-on` | The runner the job executes on, for example `ubuntu-latest` (GitHub-hosted) or a self-hosted label |
| `steps` | Ordered commands in the job: `uses` calls an action, `run` executes shell commands |
| `strategy.matrix` | Runs the job once for every combination of the listed values |

Each job gets a fresh runner, so the first step is almost always `actions/checkout@v4` to fetch the code. The official setup actions install language toolchains: `actions/setup-java@v4` needs a `distribution` such as `temurin` and a `java-version`; `actions/setup-node@v4` takes a `node-version`. Both accept a `cache` input (`maven`, `gradle`, `npm` and others) that caches dependencies between runs. For anything else, `actions/cache@v4` caches arbitrary paths keyed on a hash of your lock files.

Steps are **skipped after a failure** by default. The expression `if: always()` makes a step run regardless, which is essential for uploading test reports. Since version 4 of `actions/upload-artifact`, artifact names must be unique within a run, so matrix legs need names that include the matrix value.

Secrets are referenced as `${{ secrets.NAME }}` and are stored in repository, environment or organisation settings, never in the YAML. Workflows triggered by pull requests from forks do not receive repository secrets.

## Real-world example

An API automation team kept their REST Assured suite in the same repository as the service. Tests were only run on a tester's laptop before releases, so regressions were discovered weeks late. They added one workflow: on every pull request it built the service, ran unit tests, started the service and its database, ran the API suite on two Java versions, and uploaded the Surefire reports. Branch protection was configured so the workflow had to pass before merging. Failures now surfaced on the pull request that caused them, and reviewers could open the uploaded report directly instead of asking someone to reproduce the failure.

## Step-by-step walkthrough

1. Create `.github/workflows/tests.yml` in the default branch.
2. Declare triggers under `on`.
3. Define a job with `runs-on: ubuntu-latest`.
4. Add `actions/checkout@v4`, then the setup action for your language with caching enabled.
5. Run the build and tests with a single command that exits non-zero on failure.
6. Add `actions/upload-artifact@v4` with `if: always()` to keep reports.
7. Add a `strategy.matrix` when you need several versions or shards.
8. Push, open the **Actions** tab, and read the logs for each step.

## Code examples

A Java test workflow with a version matrix, Maven caching and reports kept on failure:

```yaml
name: tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false            # let every matrix leg finish
      matrix:
        java: [17, 21]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: ${{ matrix.java }}
          cache: maven

      - name: Run tests
        run: mvn -B test

      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: surefire-reports-java-${{ matrix.java }}
          path: target/surefire-reports/
```

The equivalent for a Node.js project (for example Playwright or Jest) swaps the setup step:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
```

## Expected output

The run summary shows two jobs, `test (17)` and `test (21)`. If a test fails on one version, that job is red, the other still completes because `fail-fast` is false, and the **Artifacts** section of the run lists both `surefire-reports-java-17` and `surefire-reports-java-21`. In the failing job's log the test step ends with Maven's failure summary followed by:

```text
Error: Process completed with exit code 1.
```

## Common mistakes

- **Forgetting `actions/checkout`.** The runner starts empty, so later steps cannot find your code.
- **No `if: always()` on report uploads**, so the evidence disappears exactly when you need it.
- **Reusing one artifact name across matrix legs** with `upload-artifact@v4`, which causes a conflict.
- **Hard-coding credentials** in YAML instead of using secrets.
- **Using `npm install` in CI** instead of `npm ci`, which installs exactly what the lock file records.
- **Running every slow suite on every pull request.** Use `needs`, sharding and scheduled workflows for the heavy parts.
- **Unpinned third-party actions.** Pin to a major version at least, and consider a full commit SHA for actions you do not control.

## Troubleshooting

- **Workflow never starts.** Check the file is in `.github/workflows/` on the branch being pushed, the YAML is valid, and the event matches (for example, branch filters under `push`).
- **Cache never hits.** The cache key is derived from lock files such as `pom.xml` or `package-lock.json`; if those are missing or always change, the cache is rebuilt.
- **Secrets are empty on pull requests.** Pull requests from forks do not receive repository secrets; design those checks to run without them.
- **Tests pass locally but time out on the runner.** Hosted runners have fewer cores than many laptops; reduce parallelism or increase explicit timeouts with care, and review waits.

## Key takeaways summary

A small, well-structured workflow gives every pull request an automatic, repeatable test run. Know the building blocks (`on`, jobs, `runs-on`, steps), use the official setup actions with caching, fan out with a matrix, and always keep the reports. That is the core of most CI work a test engineer will do on GitHub.
