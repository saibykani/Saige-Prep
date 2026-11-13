---
slug: blazemeter-capstone-end-to-end
title: "Capstone: an end-to-end load test with BlazeMeter"
summary: Take an app you own from authorisation and workload model through Chrome-extension recording, correlation, Taurus test-as-code, a BlazeMeter cloud run, analysis with baselines and a CI performance gate, and write the final report.
level: advanced
duration: 120
tags: [performance, jmeter, blazemeter, taurus, capstone]
objectives:
  - Write a test authorisation and workload model for an app you own
  - Record, correlate and parameterise a journey and verify it locally
  - Run it with Taurus locally, then on BlazeMeter with calibrated engines and failure criteria
  - Analyse the report, set a baseline, add a CI gate and write a defensible test report
prerequisites:
  - All earlier lessons in this module
  - The JMeter capstone payment load test
related: [jmeter-capstone-payment-load-test, blazemeter-chrome-recorder, blazemeter-running-jmeter-tests, blazemeter-distributed-load-and-locations, blazemeter-reports-and-analysis, taurus-bzt-automation, blazemeter-ci-cd-and-api-monitoring]
references:
  - title: BlazeMeter Help - Create a JMeter test
    url: https://help.blazemeter.com/docs/guide/performance-create-jmeter-test.html
  - title: BlazeMeter Help - Calibrate a JMeter test
    url: https://help.blazemeter.com/docs/guide/performance-jmeter-calibration.html
  - title: BlazeMeter Help - Failure criteria
    url: https://help.blazemeter.com/docs/guide/performance-failure-criteria.html
  - title: Taurus - Cloud provisioning
    url: https://gettaurus.org/docs/Cloud/
  - title: Taurus - Pass/Fail criteria
    url: https://gettaurus.org/docs/PassFail/
videos:
  - id: pYtZQ4Dyzvg
    title: "Load Testing with JMeter - BlazeMeter JMeter Meetup"
    channel: "techspringboard"
interview:
  - q: Describe an end-to-end load test you ran.
    a: I agreed scope and permission with the app owner, modelled the workload from expected traffic, recorded the journey with the BlazeMeter Chrome extension filtered to our domain, correlated the CSRF token and order ID, parameterised users from CSV, verified at one and five users, wrapped it in Taurus with criteria, calibrated users per engine, ran the cloud test, analysed Engine Health, Timeline, Request Stats and Errors, set a baseline and added a CI gate. I reported results against the criteria with the bottleneck and next steps.
  - q: How do you prove your results are trustworthy?
    a: Engine Health within limits, Max Users and duration as planned, a clean debug run, unique data, steady-state window excluding ramp-up, the exact script version and environment recorded, and ideally a repeat run with similar results.
  - q: What do you do if the target app is only on your laptop?
    a: Run Taurus locally against it, optionally with -report to see a BlazeMeter report, because cloud engines cannot reach localhost. For a cloud run I deploy it to a host I control that the engines can reach, or use a private location. I never borrow someone else's public site.
practice:
  - "Complete the capstone deliverables for an app you own and store them in a perf/ folder in its repository."
  - "Run the same YAML locally and in the cloud and explain every difference in the results."
  - "Present your test report in five minutes to a peer acting as the app owner."
takeaways:
  - Permission and scope come first and are written down.
  - Debug locally, calibrate, then scale; never the other way round.
  - Keep the whole test as code (JMX, CSV, YAML) in the repo, without secrets.
  - Judge runs by criteria on percentiles and errors, with validity checks.
  - A baseline and CI gate turn one test into ongoing protection.
quiz:
  - id: bzm-cap-q1
    type: scenario
    topic: blazemeter-capstone-end-to-end
    difficulty: advanced
    prompt: You want a public site to practise the capstone on. Which choice is correct?
    options: ["Any popular site, at low load", "Only an app you own or have written permission to test; otherwise deploy your own sample app", "A competitor's site, at night", "Any site with a free tier"]
    answer: [1]
    explanation: Authorisation is required regardless of load or time. Deploying your own sample app gives you a safe, legal target.
  - id: bzm-cap-q2
    type: code-output
    topic: blazemeter-capstone-end-to-end
    difficulty: intermediate
    prompt: Target 1,000 concurrent users, calibrated safe 300 users per engine, two locations weighted 1:1. How many engines in total if each location is rounded up separately?
    options: ["3", "4", "2", "5"]
    answer: [1]
    explanation: 500 users per location / 300 = 1.67, rounded up to 2 per location, 4 in total. The global estimate ceil(1000/300) = 4 agrees here.
  - id: bzm-cap-q3
    type: single
    topic: blazemeter-capstone-end-to-end
    difficulty: intermediate
    prompt: Which order is right?
    options: ["Cloud run, record, correlate, debug", "Authorise, model, record, correlate, debug locally, calibrate, cloud run, analyse, gate", "Record, cloud run, authorise", "Gate, record, cloud run"]
    answer: [1]
    explanation: Permission and a model come first; scaling only follows a verified script and calibration.
  - id: bzm-cap-q4
    type: multiple
    topic: blazemeter-capstone-end-to-end
    difficulty: advanced
    prompt: Which belong in the final test report? Select all that apply.
    options: ["Validity evidence such as Engine Health", "Results against each criterion with percentiles and error rate", "The BlazeMeter API secret for reproducibility", "Bottleneck hypothesis and next steps"]
    answer: [0, 1, 3]
    explanation: Evidence, results and actions belong in the report. Secrets never do; reference the test by name or URL instead.
---

## Beginner-friendly explanation

This capstone strings the whole module together, like a driving test after lessons on each skill. You choose an app you own, agree what "good enough" means, record a realistic user journey, fix it so many virtual users can replay it, check it on your laptop, run it at scale on BlazeMeter, read the results like an analyst, and finally add a robot (CI) that keeps checking it. At the end you write a short report that a manager could act on.

**The rule that overrides everything: only load-test systems you own or are explicitly authorised to test.** For this capstone that means your own sample app. Do not use someone else's website, even a "demo" one, unless its owner explicitly says it is intended for load testing; when in doubt, deploy your own. Also stub any third-party services your app calls (payments, email, maps) unless their owners approve.

## Technical explanation

**Target app.** Use any small web app you control with a login, a search or list, a detail page and a write action (for example a to-do or shop sample you built in earlier courses). Run it:

- locally (`http://localhost:3000`) for recording, debugging and local Taurus runs, and
- on a host you control that cloud engines can reach (for example a small cloud VM or container service in your own account) for the BlazeMeter run. Keep it isolated from real users and data, and switch it off afterwards. If your plan has a private location, that is the alternative for internal hosts.

**Deliverables** (in a `perf/` folder of the app's repository):

| File | Content |
|---|---|
| `AUTHORISATION.md` | Target URLs, environment, owner (you), approved peak load, date window, stop conditions |
| `workload.md` | Journeys, mix, think times, target concurrency and rate, success criteria |
| `shop.jmx`, `users.csv` | Correlated, parameterised script and data |
| `smoke.yml`, `load.yml` | Taurus configs for CI smoke and cloud load |
| `.github/workflows/perf-*.yml` | PR gate and nightly/manual cloud run |
| `REPORT.md` | Final analysis |

**Success criteria example:** at 200 concurrent users with 3-6 s think time, p90 of every transaction at most 800 ms, p99 at most 2 s, errors at most 1%, engines under 75% CPU.

## Step-by-step walkthrough

**Phase 1: Authorise and model (30 min)**

1. Write `AUTHORISATION.md`. Because you own the app, you are the approver; still write the window and stop conditions (for example, stop if error rate exceeds 20% or the VM becomes unresponsive). Confirm your cloud provider's acceptable-use rules allow load tests against your own instance.
2. Write `workload.md`: 60% browse (home, search, product), 30% add-to-cart, 10% checkout; target 200 users.

**Phase 2: Record and correlate (45 min)**

3. Record each journey with the BlazeMeter Chrome extension, filter pattern `http://localhost:3000/*`, Record AJAX on, top-level requests only. Save as JMX.
4. In JMeter: rename samplers, add HTTP Request Defaults with `${__P(host,localhost)}`, `${__P(port,3000)}`, `${__P(protocol,http)}`, Cookie Manager, extractors for every dynamic token or ID, CSV Data Set Config `users.csv` (name only), assertions and uniform random timers.
5. Create 250 test accounts in your app (more than peak concurrency).
6. Run 1 thread with View Results Tree, then 5 threads non-GUI. Zero errors.

**Phase 3: Taurus locally (30 min)**

7. Write `load.yml` (below). Run `bzt perf/load.yml -o execution.0.concurrency=10` against localhost. Fix any criterion failures you do not understand.
8. Optional: add `-report` (token in `~/.bzt-rc`) to see the run in a BlazeMeter report.

**Phase 4: Cloud run (60 min)**

9. Deploy the app to your own reachable host. Set `host` in the YAML or with `-o`.
10. Calibrate: one engine, slow ramp to high users, read Engine Health, choose safe users per engine (see lesson 4). For a small app the app itself may saturate first; that is a finding, not a failure.
11. Run `bzt perf/load.yml -cloud` (or create the test in the UI from the JMX and CSV, set Total Users 200, ramp 5 min, duration 20 min, one or two locations). Run a debug test first if using the UI.
12. Watch it live. Stop if your stop conditions are met.

**Phase 5: Analyse, baseline, gate (45 min)**

13. Analyse in order: Engine Health, Logs, Summary, Timeline (steady state only), Request Stats (p90, p99 per label), Errors grouped by code.
14. Set the run as the baseline if valid. Add a baseline-based criterion, for example `avg-rt>baseline+10%`.
15. Add the PR smoke workflow running `smoke.yml` against the app started in CI, and a manual or nightly cloud workflow with secrets.
16. Write `REPORT.md`, then shut down the cloud host.

## Code examples

`perf/load.yml`:

```yaml
execution:
- executor: jmeter
  scenario: shop
  concurrency:
    local: 10
    cloud: 200
  ramp-up: 5m
  hold-for: 20m
  locations:
    us-east-1: 1        # replace with location IDs from: bzt -locations

scenarios:
  shop:
    script: shop.jmx
    properties:
      host: localhost
      port: 3000
      protocol: http

reporting:
- module: final-stats
  summary: true
  percentiles: true
- module: passfail
  criteria:
  - p90>800ms for 60s, stop as failed
  - p99>2s, continue as failed
  - failures>1% for 60s, stop as failed
```

Cloud run with the real host (token from `~/.bzt-rc` or a CI secret):

```text
bzt perf/load.yml -cloud -o scenarios.shop.properties.host=perf.my-own-app.example -o scenarios.shop.properties.port=443 -o scenarios.shop.properties.protocol=https
```

`REPORT.md` outline:

```text
1. Scope and authorisation (target, window, approver)
2. Workload model and criteria
3. Environment and versions (app commit, JMX/YAML commit, Taurus/JMeter versions)
4. Validity (engines, CPU/memory, Max Users, steady-state window)
5. Results table per transaction: samples, p90, p99, error %, verdict
6. Observations and bottleneck hypothesis with evidence (screenshots/links)
7. Recommendations and next tests
```

## Expected output

Locally: a Taurus dashboard and final stats with all criteria passing at 10 users. In BlazeMeter: a report with Max Users about 200, engine CPU below the limit, steady hits/s, per-label p90/p99 and a criteria tab showing pass or fail. In GitHub: a green PR check and a manual cloud workflow with a report link.

## Real-world example

A learner used their own Flask shop app. Locally all criteria passed at 10 users. In the cloud at 200 users, p90 for search jumped to 2.4 s at around 120 users while engine CPU stayed at 30%, so the app was the bottleneck. The Timeline showed hits/s flattening at 120 users; the app's own logs showed a full table scan on product search. An index fixed it; the second run passed with p90 at 310 ms and became the baseline. The PR gate later caught a pagination change that doubled response time.

## Worked example: a sample REPORT.md results section

Learners often find the report the hardest part, so here is what a finished results section can look like for the learner's Flask shop described above (second run, after the index fix):

```text
Run: shop-load #2, staging VM in own cloud account, 2 locations
Validity: 2 engines, CPU max 41%, memory max 55%, Max Users 200/200
Steady state analysed: minutes 6 to 25 (ramp-up excluded)

Transaction      Samples   p90      p99      Errors   Verdict
01 Home           41,880   190 ms   420 ms   0.00%    PASS
02 Search         27,910   310 ms   780 ms   0.02%    PASS
03 Product        27,850   240 ms   610 ms   0.00%    PASS
04 Add to cart    12,560   380 ms   1.1 s    0.05%    PASS
05 Checkout        4,170   690 ms   1.8 s    0.31%    PASS (close to p90 limit)

Observations:
- Checkout p90 is within 15% of the 800 ms criterion; it is the first
  transaction likely to breach as load grows.
- Errors on checkout are 409 Conflict on stock reservation when two
  users buy the last unit; this is expected behaviour, not a defect,
  but the test data should include more stock.
Recommendations:
- Increase seeded stock; re-run to confirm checkout errors disappear.
- Run a step test (200, 300, 400 users) to find the knee before the sale.
```

Notice the structure: validity first, then numbers per transaction against criteria, then interpretation with evidence, then concrete next steps. A manager can read the verdict column; an engineer can follow the evidence.

## Interpreting your own results

Use these questions while writing the analysis, and answer each one with a link or screenshot:

1. **Was the test valid?** Engines within limits, planned users reached, no script errors in the logs.
2. **Did each transaction meet its criteria in steady state?** Report per label, not one blended average.
3. **Where is the knee?** If throughput stopped growing before your target users, say at what load.
4. **What do the errors mean?** Group by code and label; decide which are defects, which are data problems and which are expected business rules.
5. **What changed since the baseline?** Only compare runs with the same script, data and environment.
6. **What would you test next?** A step test, a longer soak test, or the same test after a fix.

## Time-boxing and stopping safely

Plan the cloud run inside the window written in `AUTHORISATION.md`, and keep the BlazeMeter report open while it runs. If a stop condition is met, stop the test from the report or by stopping the `bzt` process once (one Ctrl+C, then wait for a graceful shutdown), note the time, and record it in the report. A stopped test is still a result: it tells you the load level at which the system stopped coping. Afterwards, delete test accounts or reset the database, shut down the cloud host, and revoke any temporary API key you created for the capstone.

## Common mistakes

- **Testing a site you do not own** or forgetting to stub third-party calls.
- **Recording on localhost and running in the cloud** without changing the host.
- **Too few test accounts** for the concurrency.
- **Skipping calibration** and misreading engine saturation as app slowness.
- **Analysing ramp-up as if it were steady state.**
- **Leaving the cloud host running** after the test, or secrets in the repo.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Cloud engines get connection refused | Host or port not public, firewall, or still `localhost` |
| Many 401s at scale | Accounts reused across engines or token not correlated |
| Criteria failed in ramp-up only | Use timeframes, ignore ramp-up in UI criteria, or analyse steady state |
| Local and cloud results differ a lot | Different network path and host; compare connect time and latency |
| Report missing labels | Samplers renamed after the run; re-run with final names |

## Self-review checklist

- [ ] Authorisation and stop conditions written before any run
- [ ] Script verified at 1 and 5 users with zero errors
- [ ] Unique data for peak concurrency
- [ ] Engine Health within limits
- [ ] Criteria on percentiles and errors, results reported per transaction
- [ ] Baseline set and CI gate working
- [ ] No secrets in the repository; cloud host shut down

## Key takeaways summary

An end-to-end BlazeMeter test is a chain: permission, model, recording, correlation, local verification, Taurus as code, calibration, cloud run, analysis, baseline and CI gate. Each link protects the next. Do it on your own app, keep everything as code without secrets, and report results against agreed criteria with evidence. And always: only load-test systems you own or are explicitly authorised to test.
