---
slug: blazemeter-distributed-load-and-locations
title: "Scaling: engines, locations and distributed load"
summary: Plan large BlazeMeter runs by calibrating users per engine, choosing and weighting cloud locations, using private locations for internal apps, and handling test data so distributed engines do not collide.
level: intermediate
duration: 50
tags: [performance, jmeter, blazemeter, distributed-testing, private-location]
objectives:
  - Calculate engines needed from total users and users per engine, and split users across weighted locations
  - Calibrate a test to find a safe users-per-engine value using the Engine Health report
  - Explain how private locations (on-premise agents) let you test apps behind a firewall
  - Design test data so multiple engines do not reuse the same accounts
prerequisites:
  - Running a JMeter test on BlazeMeter
  - Distributed JMeter concepts
related: [blazemeter-running-jmeter-tests, jmeter-non-gui-and-distributed, jmeter-csv-data-set-config, jmeter-workload-design, blazemeter-reports-and-analysis]
references:
  - title: BlazeMeter Help - Load distribution
    url: https://help.blazemeter.com/docs/guide/performance-load-distribution.html
  - title: BlazeMeter Help - Calibrate a JMeter test
    url: https://help.blazemeter.com/docs/guide/performance-jmeter-calibration.html
  - title: BlazeMeter Help - Engine Health report
    url: https://help.blazemeter.com/docs/guide/performance-engine-health-report.html
  - title: BlazeMeter Help - Cloud vs Private Location
    url: https://help.blazemeter.com/docs/guide/private-locations-vs-cloud.html
  - title: Taurus - Cloud provisioning
    url: https://gettaurus.org/docs/Cloud/
interview:
  - q: How do you decide how many users one engine should run?
    a: By calibration, not guessing. Run the real script on one engine with a slow ramp to a high user count and watch the Engine Health report. Note the user count where CPU first crosses about 75% or memory about 85%, take roughly 10% off, then confirm with a run at that level. Heavy scripts with big payloads, regex extractors or Groovy need fewer users per engine.
  - q: What is a private location and when do you need one?
    a: It is a set of your own servers running BlazeMeter's agent inside your network. The agent polls BlazeMeter with outgoing requests, receives test instructions, generates load against internal targets and streams results back. You need it for apps behind a firewall that cloud engines cannot reach, or when traffic must stay inside your network. It is limited to some plans and you maintain the machines.
  - q: Why does test data become harder with many engines?
    a: Each engine runs its own copy of the script and reads its own copy of the CSV, so without care two engines log in as the same user, which causes session conflicts and unrealistic caching. Split the data per engine, generate unique values, or use a shared data approach, and size the data for total users times iterations.
  - q: Why spread load across several locations?
    a: To mimic where real users are, to exercise CDNs, geo-DNS and load balancers realistically, and to see regional latency differences. It is not a way to hide traffic; the test still needs authorisation.
practice:
  - "Calibrate your script on one engine: ramp to a high user count over 30+ minutes, read Engine Health, and record the safe users per engine."
  - "Plan a 2,000-user test across three locations weighted 50/30/20 with a calibrated limit; compute users and engines per location."
  - "Split a 1,200-row users.csv so each of four engines uses a different 300 rows, and verify no user logs in twice concurrently."
takeaways:
  - Engines = ceil(users / users per engine); calibrate the ratio with Engine Health.
  - Keep engine CPU under about 75% and memory under about 85%, or results describe the generators.
  - Locations can be weighted; check the current per-test location limit in the docs.
  - Private locations run your own agents inside your network for internal apps.
  - Every engine reads its own data copy; design data for distribution.
quiz:
  - id: bzm-dist-q1
    type: code-output
    topic: blazemeter-distributed-load-and-locations
    difficulty: beginner
    prompt: Total users 1,300 and a calibrated limit of 500 users per engine. How many engines are needed?
    options: ["2", "3", "4", "1"]
    answer: [1]
    explanation: 1300 / 500 = 2.6, rounded up to 3 engines. Two engines would need 650 users each, above the safe limit.
  - id: bzm-dist-q2
    type: truefalse
    topic: blazemeter-distributed-load-and-locations
    difficulty: beginner
    prompt: A private location requires you to open inbound firewall ports so BlazeMeter can push commands to the agents.
    options: ["True", "False"]
    answer: [1]
    explanation: The agent sends outgoing heartbeat requests to BlazeMeter and receives instructions in the responses, so no inbound requests are needed.
  - id: bzm-dist-q3
    type: scenario
    topic: blazemeter-distributed-load-and-locations
    difficulty: intermediate
    prompt: Response times jump at 600 users. The Engine Health report shows engine CPU at 98% from that point. What do you conclude?
    options: ["The application cannot handle 600 users", "The generators are overloaded; reduce users per engine (more engines) and re-run before judging the app", "Add more locations to the same engine", "Disable the Engine Health report"]
    answer: [1]
    explanation: Saturated engines delay sending and timing requests, so the response times are unreliable. Fix the generator capacity first.
  - id: bzm-dist-q4
    type: multiple
    topic: blazemeter-distributed-load-and-locations
    difficulty: intermediate
    prompt: Which are valid ways to stop four engines from reusing the same test accounts? Select all that apply.
    options: ["Give each engine its own slice of the user data", "Generate unique usernames that include the engine or thread number", "Use the same CSV and hope collisions are rare", "Create enough accounts for the peak concurrency across all engines"]
    answer: [0, 1, 3]
    explanation: Slicing, unique generation and enough accounts all prevent collisions. Hoping is not a strategy.
---

## Beginner-friendly explanation

One load generator is one kitchen. If you need 5,000 meals, you open several kitchens (**engines**), maybe in several cities (**locations**), and give each kitchen a share of the orders. Two things go wrong in real kitchens and in load tests: a kitchen that is overworked serves meals late, and you blame the diners (in testing: an overloaded engine makes your app look slow); and two kitchens that use the same customer list deliver the same order twice (in testing: two engines log in as the same user).

## Technical explanation

**Engines.** BlazeMeter computes engines from Total Users and the **users per engine** ratio (default set by your plan, adjustable in Load Distribution as "Max Users Per an Engine"). Engines needed = ceil(total users / users per engine), and users are split across them. If Total Users is toggled off, you set Total Engines yourself and then users = script threads x engines. Asking for more engines than your plan allows gives the error "Load generators are more than account's plan limit".

**Calibration** (from BlazeMeter's guide, at the time of writing): after a clean debug test, run one engine with a high thread count and a long ramp (the guide suggests 500 threads, 40-minute ramp-up, 50-minute duration), watch Engine Health. If CPU stays under 75% and memory under 85%, try more threads; if it crosses, note the user count at that point, reduce by about 10%, and confirm. The Engine Health docs recommend keeping average CPU and memory below 70%.

**Locations.** In Load Distribution, choose a location from the list; add more with **+ Add Location**. Traffic is split evenly by default and you can edit the **% of Traffic** per location (must total 100%). At the time of writing there is a limit of ten locations per test; use a multi-test for more. Taurus expresses the same idea as relative weights:

```yaml
execution:
- executor: jmeter
  scenario: shop
  concurrency: 900
  ramp-up: 5m
  hold-for: 20m
  locations:
    us-east-1: 2
    eu-west-1: 1
provisioning: cloud
```

Here 600 users go to the first location and 300 to the second. Location IDs depend on your account; list them with `bzt -locations` (token required). In Taurus, `concurrency` and `throughput` are always the total across locations.

**Private locations.** Your servers run BlazeMeter's agent. The agent sends outgoing "heartbeat" requests; when a test starts it gets instructions, generates load against internal targets, and sends results back for real-time reports. BlazeMeter's older names were "harbor" (private location) and "ship" (agent). The feature depends on your plan, and you maintain the machines. Engine health metrics there may be less precise.

**Test data across engines.** Each engine downloads all test files and runs the script independently. A shared `users.csv` read from the top by every engine means engine 1's thread 1 and engine 2's thread 1 are the same user. Options: split data per engine (BlazeMeter's CSV handling and Taurus data sources offer options; check the docs for your version), generate unique data with `${__threadNum}` and an engine-specific property, or use BlazeMeter's Test Data features. Size data for peak concurrency, and consider iterations if each iteration consumes a record (for example "register once").

## Step-by-step walkthrough

1. **Calibrate.** Duplicate your test as `shop-calibration`. Set Total Users 500, Ramp Up 40 min, Duration 50 min, one location, and set users per engine so exactly one engine runs. Run against your authorised staging target (warn its owners first).
2. **Read Engine Health** (Reports, open the run, Engine Health tab). Toggle CPU and Memory. Find where CPU first stays above 75%. Read the user count at that moment on the Timeline (Virtual Users KPI).
3. **Set the ratio.** If CPU crossed at 420 users, use about 380. In Load Distribution, set Max Users Per an Engine to 380.
4. **Plan the real test.** 2,000 users / 380 = 5.26, so 6 engines.
5. **Add locations.** Click **+ Add Location** twice; choose regions near your users; set % of Traffic to 50, 30, 20.
6. **Check data.** 2,000 concurrent users need at least 2,000 distinct accounts if each holds one session. Prepare them in staging.
7. **Run the debug test**, then the full test. In the report, filter by location to compare regions.
8. **For an internal app**, ask your admin for a private location, install the agent on servers inside the network following the system requirements page, then select that location in Load Distribution.

## Code examples

Unique, engine-safe usernames without a CSV (in an HTTP Request body):

```text
username=perf_${__P(engineId,0)}_${__threadNum}
```

Set `engineId` differently per engine via your data strategy, or generate accounts in a setUp step. A simple per-location split to plan before you click:

```text
users 2000, weights 50/30/20 -> 1000 / 600 / 400
safe 380 users per engine    -> ceil(1000/380)=3, ceil(600/380)=2, ceil(400/380)=2 engines
```

Note per-location rounding can need more engines (7 here) than the global calculation (6). Check how your plan computes it.

## Expected output

The calibration run's Engine Health curve climbs steadily with users; past the knee, CPU flattens near 100% and response times rise together. The real run keeps every engine's CPU below about 75%, and the Summary report's Max Users matches the plan. Per-location filters show similar error rates and higher response times for distant regions.

## Real-world example

A retailer planned a 10,000-user Black Friday rehearsal across three regions. Their first attempt used the plan's default ratio; Engine Health showed 95% CPU because the script parsed large JSON with regular expressions. Switching to a JSON Extractor and lowering users per engine fixed it. Their login error rate of 4% turned out to be data collisions: every engine read the same 3,000-row CSV. They generated 12,000 accounts, gave each engine its own slice, and errors dropped to zero. Their internal stock service was tested separately from a private location inside the data centre.

## Worked example: interpreting a calibration run

Here is how a calibration run typically reads, minute by minute, for one engine ramping to 500 threads over 40 minutes (about 12 new users per minute):

| Minute | Virtual users | Engine CPU | Hits/s | p90 response time |
|---|---|---|---|---|
| 10 | 125 | 22% | 41 | 310 ms |
| 20 | 250 | 44% | 82 | 320 ms |
| 30 | 375 | 69% | 121 | 340 ms |
| 34 | 425 | 78% | 133 | 420 ms |
| 38 | 475 | 94% | 136 | 910 ms |

How to read it:

- Up to minute 30, users, CPU and hits/s grow in proportion and response time is flat. The engine is doing its job.
- At minute 34 CPU crosses 75%. Hits/s is still rising, but more slowly. This is the point the calibration guide tells you to note: about 425 users.
- At minute 38 hits/s barely moves while users keep rising, and p90 more than doubles. Is the application slow, or the engine? Check the target's own monitoring. If the application's CPU and response times on its side are steady, the jump is caused by the overloaded engine queueing requests, and the measurement is no longer trustworthy.

Safe users per engine: about 10% under 425, so roughly 380. That is the number used in the walkthrough above. Repeat calibration whenever the script changes significantly (new heavy extractors, larger payloads, more embedded resources), because users per engine is a property of the script, not of BlazeMeter.

## Comparing locations without fooling yourself

When you filter the report by location, differences in response time are expected: a region farther from your servers adds network round-trip time to every request. To separate network distance from application behaviour:

1. Compare **connect time** and **latency** per location. If the distant region's connect time is higher by roughly the same amount as its response time, the difference is network distance, not your application.
2. Compare **error rates**. Errors that appear in only one location suggest something regional: a CDN edge, a DNS answer, a geo-blocking rule or a firewall that allows some engine addresses and not others.
3. Compare **throughput per user**. If one location's users complete far fewer iterations, they are waiting longer per request, which compounds over a journey.

Report regional results separately when they matter to the business, for example "European shoppers see p90 checkout of 640 ms, North American shoppers 820 ms, both within criteria".

## Planning data for several engines

A quick sizing rule: unique records needed = peak concurrent users x records each user holds at once. For a login journey where each virtual user keeps one session, 2,000 users need at least 2,000 accounts. For a "register a new account every iteration" journey, multiply by the expected iterations per user too. Write the calculation into your test plan, and ask the environment owner to confirm the data can be created and cleaned up afterwards.

## Common mistakes

- **Never calibrating**, then blaming the app for generator saturation.
- **Total Engines left at 2 when you meant 1** with Total Users toggled off, doubling the load.
- **Choosing locations far from real users** without a reason.
- **One CSV for all engines** without slicing or unique data.
- **Using a private location you did not size**: an underpowered agent is just as misleading.
- **Exceeding plan limits** and discovering it at run time.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Plan limit error on start | Lower engines/users or raise the plan |
| One location much slower | Expected latency, or a regional CDN/DNS issue; compare connect time |
| Login conflicts or 409s at scale | Data collisions; slice data per engine |
| Private location never picks up tests | Agent offline or cannot reach BlazeMeter outbound; check agent logs and proxy |
| CPU high but users low | Heavy script logic; optimise extractors, remove listeners |

## Hands-on exercise

1. Calibrate your script and record the safe users per engine with a screenshot of Engine Health.
2. Plan 1,500 users across two locations at 70/30; compute users and engines per location.
3. Prepare data so no account is used concurrently twice; run and verify zero login conflicts.
4. Write a one-paragraph explanation of when you would request a private location at your workplace.

## Key takeaways summary

Scale is engines times users per engine, and the ratio must come from calibration with Engine Health, not hope. Spread load across weighted locations to match your audience, use private locations for internal apps, and design test data so every engine and thread has its own records. All of it still applies only to targets you are authorised to test.
