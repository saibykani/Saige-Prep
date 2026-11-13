---
slug: taurus-bzt-automation
title: "Taurus (bzt): test-as-code for JMeter"
summary: Install Taurus, describe load tests in YAML (execution, scenarios, concurrency, ramp-up, hold-for), run a .jmx or a YAML-only scenario with JMeter locally, add pass/fail criteria, report to BlazeMeter and switch to cloud provisioning.
level: intermediate
duration: 55
tags: [performance, jmeter, taurus, yaml, automation]
objectives:
  - Install Taurus and run an existing .jmx and a YAML-defined scenario with the JMeter executor
  - Write execution and scenario settings with concurrency, ramp-up, hold-for, iterations and throughput
  - Add passfail criteria and read Taurus exit codes
  - Send results to BlazeMeter with -report or the blazemeter reporter, and run in the cloud with -cloud and locations
prerequisites:
  - Running a JMeter test on BlazeMeter
  - Basic YAML and command-line use
related: [blazemeter-running-jmeter-tests, blazemeter-reports-and-analysis, blazemeter-ci-cd-and-api-monitoring, jmeter-non-gui-and-distributed, jmeter-ci-cd]
references:
  - title: Taurus - Installation
    url: https://gettaurus.org/docs/Installation/
  - title: Taurus - Execution settings
    url: https://gettaurus.org/docs/ExecutionSettings/
  - title: Taurus - JMeter executor
    url: https://gettaurus.org/docs/JMeter/
  - title: Taurus - Pass/Fail criteria
    url: https://gettaurus.org/docs/PassFail/
  - title: Taurus - BlazeMeter reporting service
    url: https://gettaurus.org/docs/BlazemeterReporter/
  - title: Taurus source on GitHub
    url: https://github.com/Blazemeter/taurus
videos:
  - id: DN0VNnG-lzs
    title: "Automating Performance Tests with Taurus"
    channel: "Perforce BlazeMeter"
  - id: OJwrlCabND0
    title: "How to Automate Performance Testing with JMeter and Taurus"
    channel: "Perforce BlazeMeter"
  - id: wVSbalE_Nh8
    title: "Execute JMeter script Using Taurus"
    channel: "Perforce BlazeMeter"
interview:
  - q: What is Taurus and why use it with JMeter?
    a: Taurus (the bzt command) is an open-source automation wrapper maintained by BlazeMeter. It runs JMeter and other tools from a YAML file, can generate a JMX from simple YAML requests or run an existing .jmx, overrides load settings without editing the plan, adds pass/fail criteria with a meaningful exit code, and can report to or run on BlazeMeter. It makes load tests readable, reviewable code.
  - q: How does a Taurus pass/fail criterion like "p90>800ms for 30s, stop as failed" work?
    a: The subject is the 90th percentile response time, the condition is greater than 800 ms, and the "for 30s" timeframe logic means every one of 30 consecutive one-second values must breach before it triggers. Then the test stops and is marked failed, and bzt exits with code 3. Without a timeframe, it is checked once at the end against the whole-test aggregate.
  - q: How do you keep the BlazeMeter token out of the repository?
    a: Put modules.blazemeter.token (and modules.cloud.token) in the per-user ~/.bzt-rc file locally, or inject it in CI from a secret, for example with -o modules.blazemeter.token=... from a masked environment variable. Never place it in the committed YAML.
  - q: What changes when you run bzt with -cloud?
    a: Provisioning becomes cloud, so Taurus uploads the config and files to BlazeMeter and the engines run them; locations and total concurrency apply across engines. You do not use -report or the blazemeter reporter in that mode because BlazeMeter collects results itself. The target must be reachable from the chosen locations.
practice:
  - "Install bzt in a virtual environment and run your existing shop.jmx with concurrency 5, ramp-up 30s and hold-for 2m overriding the thread group."
  - "Write a YAML-only scenario with two requests, a JSON extractor and an assertion, and run it locally."
  - "Add passfail criteria, trigger one deliberately, and print the bzt exit code."
takeaways:
  - "Taurus YAML has execution (load), scenarios (what to do), reporting (results and pass/fail) and modules/settings."
  - concurrency, ramp-up, hold-for, iterations and throughput override the JMX thread group.
  - "passfail criteria use subject, condition, threshold and optional timeframe logic (for, within, over)."
  - bzt exits 3 when stopped by pass/fail criteria, which fails CI jobs.
  - Keep tokens in ~/.bzt-rc or CI secrets; use -report locally and -cloud for BlazeMeter engines.
quiz:
  - id: tz-q1
    type: single
    topic: taurus-bzt-automation
    difficulty: beginner
    prompt: Which command installs Taurus?
    options: ["npm install taurus", "pip install bzt", "apt install jmeter-taurus", "java -jar taurus.jar"]
    answer: [1]
    explanation: Taurus is a Python package named bzt, installed with pip (ideally in a virtual environment). It downloads JMeter automatically if needed.
  - id: tz-q2
    type: code-output
    topic: taurus-bzt-automation
    difficulty: intermediate
    prompt: "Criterion: avg-rt>500ms for 3s, stop as failed. Per-second averages: 450, 520, 610, 480, 530, 540, 560. Does it trigger?"
    options: ["No", "Yes, at the 3rd second", "Yes, at the 7th second", "Yes, at the 2nd second"]
    answer: [2]
    explanation: "'for 3s' needs three consecutive breaching seconds. 520, 610 are broken by 480; then 530, 540, 560 are three in a row, so it triggers at the 7th value."
  - id: tz-q3
    type: truefalse
    topic: taurus-bzt-automation
    difficulty: beginner
    prompt: In Taurus cloud provisioning, concurrency is the total across all locations, not per location.
    options: ["True", "False"]
    answer: [0]
    explanation: The Taurus Cloud docs state concurrency and throughput are always the total value for an execution, distributed among locations by weight.
  - id: tz-q4
    type: debugging
    topic: taurus-bzt-automation
    difficulty: intermediate
    prompt: This criterion is never applied. Why?
    code: "reporting:\n- module: passfail\n  criteria:\n  - avg-rt > 500ms for 30s, stop as failed"
    codeLanguage: yaml
    options: ["avg-rt is not a valid subject", "There must be no spaces around the operator: avg-rt>500ms", "Criteria must go under execution", "ms is not a valid unit"]
    answer: [1]
    explanation: Taurus docs say no spaces should surround the operator in the short form. avg-rt and ms are valid, and global criteria belong under reporting.
---

## Beginner-friendly explanation

Clicking through a web UI is fine once, but you cannot code-review clicks, and you cannot put them in a pipeline. **Taurus** turns a load test into a short text file. Think of it as a universal remote control: one simple YAML file says "50 users, ramp up over 2 minutes, hold for 10 minutes, fail if the 90th percentile goes over 800 ms", and Taurus presses the right buttons on JMeter for you. The same file can run on your laptop, in CI, or on BlazeMeter's cloud.

Taurus is open source (Apache 2.0) and maintained by BlazeMeter; the command is `bzt`.

## Technical explanation

A Taurus config has four main sections:

| Section | Purpose |
|---|---|
| `execution` | List of load profiles: `executor`, `scenario`, `concurrency`, `ramp-up`, `hold-for`, `iterations`, `throughput`, `steps`, and (for cloud) `locations` |
| `scenarios` | Named scenarios: either `script: file.jmx` or a list of `requests` with headers, body, extractors and assertions; `data-sources` for CSV |
| `reporting` | Reporters such as `final-stats`, `console`, `passfail`, `junit-xml`, `blazemeter` |
| `modules` / `settings` / `provisioning` | Tool versions and options (for example JMeter `version`, `properties`), `local` or `cloud` provisioning |

Load settings (from the Execution Settings docs): `concurrency` is target concurrent virtual users; `ramp-up` the time to reach it; `hold-for` the time to hold it; `iterations` limits loops; `throughput` applies a requests-per-second shaper and needs `ramp-up` and/or `hold-for`; `steps` makes a stepping ramp-up. When running an existing JMX, these values override the thread groups.

**Pass/fail.** Criteria use `subject[ of label]` `condition` `threshold` `[logic timeframe]`, `action as status`. Subjects include `avg-rt`, `avg-lt`, `avg-ct`, `stdev-rt`, percentiles like `p90`, `hits`, `bytes`, `succ`/`success`, `fail`/`failures` (percent allowed) and `rc...` response codes. No spaces around the operator. Timeframe logic: **`for`** (each value in the timeframe must breach), **`within`** (values aggregated over the window), **`over`** (like within, but only when a full window is available). Without a timeframe the check runs at the end on cumulative data. `stop` is the default action and `failed` the default status. Criteria can also be per execution or per scenario.

**Exit codes:** 0 no problems, 1 generic error, 2 manual shutdown, 3 automatic shutdown (pass/fail criteria, failed cloud tests).

**BlazeMeter integration.** `bzt test.yml -report` streams a local run to a BlazeMeter report (anonymous reports are kept for a limited time per the Taurus docs; with your token, per your account's retention). With `reporting: - module: blazemeter` you can set `test`, `project` and `report-name`. `bzt test.yml -cloud` (or `provisioning: cloud`) runs on BlazeMeter engines; `locations` assigns relative weights; `-detach` starts the cloud test and exits. In cloud mode, do not use `-report` or the blazemeter reporter.

## Step-by-step walkthrough

1. **Install** (Python 3 and Java required):
   ```text
   python -m venv .venv
   .venv/bin/pip install bzt      (Windows: .venv\Scripts\pip install bzt)
   bzt -h
   ```
2. **Run your JMX with overrides.** Create `perf/load.yml` (below, first file) and run `bzt perf/load.yml`. Taurus downloads JMeter if needed and shows a live console dashboard. Press Ctrl+C once only if you must stop; let it shut down gracefully.
3. **Find artifacts.** Each run creates a timestamped artifacts folder with the JTL, the modified JMX, logs and `bzt.log`.
4. **Write a YAML-only scenario** (second file) to learn the requests format.
5. **Add pass/fail** and test it: set a silly threshold like `avg-rt>1ms` and confirm `echo $?` prints 3.
6. **Store your token** (Settings, API Keys in BlazeMeter) in `~/.bzt-rc`:
   ```yaml
   modules:
     blazemeter:
       token: <id>:<secret>
   ```
7. **Report a local run:** `bzt perf/load.yml -report`. The console prints a report link.
8. **Run in the cloud** against a reachable, authorised target: `bzt perf/load.yml -cloud`. Put `modules.cloud.token` in `~/.bzt-rc` too.

## Code examples

Existing JMX with overrides and criteria:

```yaml
execution:
- executor: jmeter
  scenario: shop
  concurrency: 20
  ramp-up: 1m
  hold-for: 5m

scenarios:
  shop:
    script: shop.jmx
    properties:
      host: staging.example.test

reporting:
- module: final-stats
  summary: true
  percentiles: true
- module: passfail
  criteria:
  - p90>800ms for 30s, stop as failed
  - failures>1% for 30s, stop as failed
  - avg-rt of 05 Checkout>600ms, continue as failed
```

YAML-only scenario:

```yaml
execution:
- concurrency: 5
  ramp-up: 30s
  hold-for: 2m
  scenario: api

scenarios:
  api:
    default-address: http://localhost:3000
    think-time: 1s
    requests:
    - url: /api/products?q=lamp
      label: search
      extract-jsonpath:
        productId: $.items[0].id
      assert:
      - contains: ["items"]
        subject: body
    - url: /api/products/${productId}
      label: product
```

Cloud with weighted locations (IDs vary; list yours with `bzt -locations`):

```yaml
execution:
- executor: jmeter
  scenario: shop
  concurrency:
    local: 5
    cloud: 600
  ramp-up: 5m
  hold-for: 20m
  locations:
    us-east-1: 1
    eu-west-1: 1
```

Check extractor and assertion keys against the JMeter executor docs for your Taurus version.

## Expected output

The console dashboard shows active users, hits, response times and errors live. At the end, `final-stats` prints totals and percentiles. If a criterion triggers you see a line naming it, the test stops (for `stop` criteria) and `echo $?` prints 3. With `-report` you get a BlazeMeter link.

## Real-world example

A SaaS team kept twelve JMX files with thread counts edited by hand before each run, and nobody remembered which numbers were used last month. They wrapped each JMX in a Taurus YAML stored next to it, with load settings and criteria visible in code review. Environment hosts came from `-o scenarios.shop.properties.host=...`. A pull request that raised `concurrency` from 50 to 500 was questioned in review and correctly redirected to the weekly cloud run. CI now runs `bzt smoke.yml` on every merge and fails on exit code 3.

## Worked example: one config, three environments

Taurus merges several config files given on the command line, with later files overriding earlier ones, and `-o` overrides any single setting. That lets you keep one base file and small environment files instead of copying the whole test.

`perf/base.yml` holds the scenario and criteria (as in the first example above). `perf/env-staging.yml` holds only what differs:

```yaml
scenarios:
  shop:
    properties:
      host: staging.example.test
$execution:
- concurrency: 50
  hold-for: 10m
```

Runs then look like this:

```text
bzt perf/base.yml                                  (local defaults)
bzt perf/base.yml perf/env-staging.yml             (staging profile)
bzt perf/base.yml perf/env-staging.yml -o execution.0.concurrency=5   (quick check)
```

Watch the `$` in front of `execution`. By default Taurus merges dictionaries but **joins lists**, so a plain `execution:` list in the second file would be appended and you would run two load tests. The `$` prefix merges list items element by element instead, so the staging values update the first execution. (A `~` prefix replaces a value outright.) Also use the same form (always a list, or always a single dictionary) for `execution` in every file you merge. Then check the result: Taurus saves `merged.yml` (your files combined) and `effective.yml` (after defaults are applied) in the artifacts folder next to `bzt.log`. Reading it after a surprising run is the fastest way to see which value actually won.

## Reading the artifacts folder

After a run, the artifacts folder is your evidence. The exact file names vary by version, but you will typically find:

| File | What to use it for |
|---|---|
| `bzt.log` | Full Taurus log; the first place to look when the exit code is 1 |
| Effective (merged) config | Proves which settings were used |
| Modified JMX | The plan JMeter really ran, with your overrides applied |
| JTL / KPI results | Raw samples, usable with JMeter's HTML report generator |
| JMeter log | Errors from inside JMeter, such as missing CSV files or script exceptions |

To set the folder name yourself, for example in CI, use `-o settings.artifacts-dir=perf-artifacts`.

## Interpreting pass/fail output

Suppose a run ends like this (simplified):

```text
Failed requests: 0.6%
Percentiles: 90.0 -> 0.912 s
Pass/Fail criterion triggered: p90>800ms for 30s, stop as failed
Done performing with code: 3
```

Read it in three steps. First, the criterion text tells you which rule fired. Second, `for 30s` means p90 stayed above 800 ms for thirty consecutive seconds, so this was a sustained problem, not a single slow sample. Third, exit code 3 means Taurus stopped the test deliberately; your CI job will fail, which is the intended behaviour. Exit code 1 would instead mean Taurus itself had a problem (bad YAML, missing Java, unreachable host), and that must not be read as a performance verdict.

A good habit is to calibrate criteria from evidence: run the test a few times against a stable build, note the typical p90 and error rate, and set thresholds with a margin above them. Thresholds pulled from thin air either never fire or fire on every run, and in both cases people stop trusting them.

## Debugging a YAML-only scenario

When a generated scenario misbehaves, run it with one user and short duration (`-o execution.0.concurrency=1 -o execution.0.hold-for=30s`) and open the generated JMX from the artifacts folder in the JMeter GUI. You will see exactly how Taurus translated your `requests`, extractors and assertions, which makes mistakes such as a wrong JSONPath obvious.

## Common mistakes

- **Spaces around operators** in short-form criteria.
- **Token committed in the YAML.**
- **`throughput` without `ramp-up` or `hold-for`.**
- **Using `-report` with `-cloud`.**
- **Labels with colons (URLs) in short-form criteria**; use the full form.
- **Pressing Ctrl+C twice**, leaving JMeter running and reports incomplete.
- **Cloud runs at localhost targets.**

## Troubleshooting

| Symptom | Fix |
|---|---|
| `bzt` not found | Activate the venv or call it by path |
| Java errors | Install a supported JDK; check `bzt.log` |
| Criterion never triggers | Check syntax, label spelling, timeframe logic |
| Exit code 1 | Generic error; read `bzt.log` in the artifacts folder |
| Cloud test refuses to start | Token, plan limits or not enough engines in the account |
| Override seems ignored | Check `merged.yml`/`effective.yml` in artifacts; a later file or `-o` may win, and lists are appended unless the key has a `$` prefix |
| CSV not found in cloud runs | Reference the file by name only and list it so Taurus uploads it with the test |
| Local results much slower than expected | Your machine may be saturated; watch its CPU and reduce concurrency |

## Hands-on exercise

1. Run your JMX through Taurus with overrides and find the modified JMX in artifacts.
2. Write a YAML-only scenario for two API calls with an extractor and an assertion.
3. Add three criteria (percentile, failures, per-label average); prove one triggers and exit code is 3.
4. Report a run to BlazeMeter with `-report` using your token from `~/.bzt-rc`.

## Key takeaways summary

Taurus makes load tests code: execution for load shape, scenarios for behaviour, reporting for results and pass/fail. It runs JMeter locally, streams to BlazeMeter with `-report`, or runs on BlazeMeter engines with `-cloud` and weighted locations. Exit code 3 on failed criteria makes it CI-ready. Keep tokens in `~/.bzt-rc` or CI secrets, and target only systems you are authorised to test.
