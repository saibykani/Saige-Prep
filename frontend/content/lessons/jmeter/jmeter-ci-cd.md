---
slug: jmeter-ci-cd
title: Running JMeter in CI/CD
summary: Run JMeter tests in a pipeline with the non-GUI command line in GitHub Actions or the jmeter-maven-plugin, publish the HTML report as an artifact, and fail the build automatically when response-time or error thresholds are breached.
level: intermediate
duration: 40
tags: [performance, jmeter, ci-cd, github-actions, automation]
objectives:
  - Run a JMeter test in GitHub Actions with the non-GUI command line
  - Publish the HTML dashboard and JTL as build artifacts
  - Fail a build on thresholds by parsing statistics.json or using assertions
  - Describe how the jmeter-maven-plugin fits into a Maven build
prerequisites:
  - Non-GUI execution and the HTML dashboard report
  - Basic Git and GitHub Actions
related: [jmeter-non-gui-and-distributed, jmeter-html-dashboard-report, jmeter-assertions-and-extractors, jmeter-plugins-manager, jmeter-best-practices-and-troubleshooting]
references:
  - title: GitHub Actions documentation
    url: https://docs.github.com/en/actions
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: Apache JMeter - Best Practices
    url: https://jmeter.apache.org/usermanual/best-practices.html
interview:
  - q: How would you add a JMeter test to a CI pipeline?
    a: I keep the .jmx, CSV data and a properties file in the repository. The pipeline installs a pinned JMeter version, runs it in non-GUI mode with -n -t -l -e -o, passing environment-specific values as -J properties, then uploads the JTL and HTML report as artifacts. A separate step compares results to agreed thresholds and exits non-zero if they are breached, so the build fails. The target is a dedicated test environment we own, never production by default.
  - q: Does JMeter fail the build when requests fail?
    a: Not by default. JMeter exits 0 even if samples fail, as long as the test itself ran. You need a gate, for example a script that reads statistics.json from the dashboard and checks error percentage and the 95th percentile, or a plugin or Maven goal that checks results. Assertions such as the Duration Assertion mark samples as failed, which feeds that gate.
  - q: Why run a small load test on every merge instead of a full load test?
    a: CI runners are shared and noisy, so absolute numbers are not reliable, and full tests take too long. A short, low-load smoke performance test catches big regressions and broken scripts quickly. Full load, stress and soak tests run on a schedule or before release on dedicated load generators and an environment sized like production.
practice:
  - "Create a GitHub Actions workflow that runs a 2-minute JMeter test against an app started in the same job and uploads the HTML report."
  - "Write a gate script that fails if the error percentage exceeds 1% or the overall 95th percentile exceeds 800 ms."
  - "Add a Duration Assertion of 1000 ms to your login request and confirm the gate fails when you lower it to 1 ms."
takeaways:
  - In CI, always run non-GUI with a pinned JMeter version.
  - Upload the JTL and HTML report as artifacts for every run.
  - JMeter does not fail the build on its own; add an explicit threshold gate.
  - Keep CI load small and reliable; run full tests on dedicated infrastructure.
  - Only load-test systems you own or are explicitly authorized to test.
quiz:
  - id: jm-ci-q1
    type: single
    topic: jmeter-ci-cd
    difficulty: beginner
    prompt: Which command runs a test in non-GUI mode and generates the HTML dashboard?
    options: ["jmeter -t plan.jmx", "jmeter -n -t plan.jmx -l results.jtl -e -o report", "jmeter -g plan.jmx", "jmeter -n -o report"]
    answer: [1]
    explanation: -n is non-GUI, -t the plan, -l the results file, -e generates the report at the end and -o is the empty output folder. The first option opens the GUI; -g builds a report from an existing JTL only.
  - id: jm-ci-q2
    type: truefalse
    topic: jmeter-ci-cd
    difficulty: beginner
    prompt: If 30% of samples fail, the jmeter command exits with a non-zero code by default.
    options: ["True", "False"]
    answer: [1]
    explanation: JMeter exits successfully when the test runs, regardless of sample failures. To fail a pipeline you need an explicit check on the results.
  - id: jm-ci-q3
    type: code-output
    topic: jmeter-ci-cd
    difficulty: intermediate
    prompt: "A gate script reads statistics.json where Total has errorPct 2.5 and pct3ResTime 640. The thresholds are errorPct <= 1 and pct3ResTime <= 800. What happens?"
    options: ["The build passes", "The build fails because of the error rate", "The build fails because of response time", "The build fails because of both"]
    answer: [1]
    explanation: 640 ms is under 800 ms so the response-time check passes, but 2.5% is above the 1% error budget, so the gate exits non-zero for the error rate only.
  - id: jm-ci-q4
    type: scenario
    topic: jmeter-ci-cd
    difficulty: intermediate
    prompt: Your nightly CI performance job shows response times varying by 40% between runs with no code change. What is the best first step?
    options: ["Raise the thresholds until it passes", "Check whether the shared runner and the test environment are noisy, and move absolute comparisons to dedicated infrastructure", "Remove all assertions", "Switch to GUI mode"]
    answer: [1]
    explanation: Shared runners and shared environments add variance unrelated to the code. Raising thresholds hides real regressions, and removing assertions or using the GUI makes things worse.
---

## Beginner-friendly explanation

A CI pipeline is a robot that checks every change automatically. Adding JMeter to it is like adding a quick fitness test to a team's daily routine: not a full marathon each day, just a short run that would reveal if something suddenly got much worse. If the run is too slow or too many requests fail, the robot raises a red flag and the change does not ship until someone looks.

## Technical explanation

In CI, JMeter always runs in **non-GUI mode**:

```text
jmeter -n -t plan.jmx -l results.jtl -e -o report -Jhost=localhost -Jusers=10
```

`-J` sets JMeter properties, read in the plan with `${__P(host,localhost)}`, so one `.jmx` works for every environment. `-e -o report` generates the HTML dashboard, which includes `report/statistics.json` with per-transaction and `Total` figures such as `errorPct`, `meanResTime`, `pct1ResTime` (90th), `pct2ResTime` (95th) and `pct3ResTime` (99th) by default.

**JMeter does not fail the build on sample errors.** Gates you can use:

- **Assertions** (Response Assertion, JSON Assertion, **Duration Assertion**) mark samples as failed, which raises the error percentage.
- **A threshold script** reads `statistics.json` and exits non-zero.
- **Build tool plugins**: the `jmeter-maven-plugin` (`com.lazerycode.jmeter`) downloads JMeter, runs `.jmx` files from `src/test/jmeter` during the `verify` phase, and has a results-check goal that can fail the build on errors. Gradle users have similar community plugins.

```mermaid
flowchart LR
  A[Push or schedule] --> B[Start app under test]
  B --> C[Install pinned JMeter]
  C --> D[jmeter -n ... -e -o report]
  D --> E[Upload JTL and report]
  D --> F{Gate: thresholds met?}
  F -->|yes| G[Pass]
  F -->|no| H[Fail build]
```

## Step-by-step walkthrough

1. Commit `perf/shop.jmx`, `perf/users.csv` and `perf/gate.py`. Use relative CSV paths.
2. Create `.github/workflows/perf.yml` (below).
3. Start the application under test in the same job (for example with Docker Compose) and wait for its health endpoint.
4. Download a pinned JMeter release from the Apache archive and unzip it.
5. Run JMeter non-GUI with small load.
6. Upload artifacts with `actions/upload-artifact@v4` using `if: always()` so you get the report even on failure.
7. Run the gate script; it fails the job if thresholds are exceeded.

## Code examples

```yaml
name: perf-smoke
on:
  pull_request:
  workflow_dispatch:
jobs:
  jmeter:
    runs-on: ubuntu-latest
    env:
      JMETER_VERSION: "5.6.3"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"
      - name: Start app under test
        run: docker compose -f perf/app-compose.yml up -d --wait
      - name: Install JMeter
        run: |
          curl -sSLO https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz
          tar -xzf apache-jmeter-${JMETER_VERSION}.tgz
      - name: Run test
        run: |
          apache-jmeter-${JMETER_VERSION}/bin/jmeter -n -t perf/shop.jmx \
            -l results.jtl -e -o report -Jhost=localhost -Jusers=10 -Jduration=120
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: jmeter-report
          path: |
            results.jtl
            report/
      - name: Threshold gate
        run: python perf/gate.py report/statistics.json
```

```python
# perf/gate.py - fail the build when thresholds are exceeded
import json, sys

MAX_ERROR_PCT = 1.0
MAX_P95_MS = 800

stats = json.load(open(sys.argv[1]))["Total"]
problems = []
if stats["errorPct"] > MAX_ERROR_PCT:
    problems.append(f"error rate {stats['errorPct']:.2f}% > {MAX_ERROR_PCT}%")
if stats["pct2ResTime"] > MAX_P95_MS:
    problems.append(f"p95 {stats['pct2ResTime']:.0f} ms > {MAX_P95_MS} ms")
for p in problems:
    print("FAIL:", p)
sys.exit(1 if problems else 0)
```

The pct field to percentile mapping follows the `aggregate_rpt_pct1..3` properties (defaults 90, 95, 99); check them if your team changed them.

## Expected output

The job log shows JMeter's summariser lines (`summary = ... Err: 0 (0.00%)`), then `... end of run`. The gate prints nothing and exits 0 when healthy, or lines such as `FAIL: error rate 2.50% > 1.0%` and exits 1. The run page lists a `jmeter-report` artifact you can download and open (`report/index.html`).

## Real-world example

A team adds a five-minute, ten-user smoke performance test on pull requests that touch the checkout service, using a containerized copy of the service and its database. A full one-hour load test runs weekly from dedicated load generators against a staging environment they own. The PR job once failed because a new query lacked an index; the 95th percentile tripled, the gate caught it, and the fix landed before merge.

## Common mistakes

- **Assuming a green JMeter step means a healthy system.** Add a gate.
- **Unpinned JMeter or plugin versions**, which make runs incomparable.
- **Hardcoded hosts** instead of `-J` properties.
- **Treating shared-runner numbers as capacity results.**
- **Uploading artifacts only on success**, losing the evidence you need most.
- **Pointing CI at production or third-party systems** without authorization.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `-o` fails: folder not empty | Delete `report` first or use a fresh path |
| CSV not found | Paths are relative to where JMeter resolves them; use paths relative to the `.jmx` or `${__P(dataDir)}` |
| Plugin class missing | Install plugins in the job (see [Plugins Manager](/learn/jmeter/jmeter-plugins-manager)) |
| Connection refused | App not ready; wait for its health check before running |

## Choosing what runs where

Not every performance test belongs in every pipeline. A practical split:

| Trigger | Test | Load | Purpose |
|---|---|---|---|
| Pull request | Smoke performance | A few users, 2 to 5 minutes | Catch broken scripts and large regressions |
| Nightly | Baseline load | Expected normal load, 15 to 30 minutes | Track trends between builds |
| Before release | Load, stress, soak | Full model on dedicated generators | Capacity and stability decision |

Store each run's `statistics.json` (or a summary of it) so you can compare builds over time; a slow drift across ten builds is easy to miss if you only look at one run.

**Using Maven instead.** If your project is Java-based, the `jmeter-maven-plugin` lets developers run `mvn verify` locally and in CI with the same configuration. Typical setup: put `.jmx` files in `src/test/jmeter`, declare the plugin in `pom.xml` with goals to configure, run the tests and check results, and list any jmeter-plugins.org dependencies in the plugin configuration so they are downloaded automatically. Check the plugin's own documentation for the exact goal names and options for your version, as they change between releases.

**Secrets.** Store passwords and tokens as GitHub Actions secrets and pass them as `-J` properties; never commit them inside the `.jmx`.

## Key takeaways summary

CI turns performance testing into a habit: pinned JMeter, non-GUI runs, artifacts every time and an explicit threshold gate. Keep pipeline tests small and stable, run big tests on dedicated infrastructure, and only load-test systems you own or are explicitly authorized to test.
