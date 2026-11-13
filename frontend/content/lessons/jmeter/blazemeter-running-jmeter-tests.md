---
slug: blazemeter-running-jmeter-tests
title: Running a JMeter test on BlazeMeter
summary: Create a BlazeMeter performance test from a .jmx and its CSV files, understand how load configuration (users, ramp-up, duration, iterations, RPS limit) overrides the thread group, run a debug test, then a real run, and read what happened.
level: intermediate
duration: 50
tags: [performance, jmeter, blazemeter, load-configuration, cloud-testing]
objectives:
  - Upload a .jmx with its CSV and JAR files and fix file-path problems
  - Configure total users, ramp-up, duration or iterations and an RPS limit
  - Explain how BlazeMeter overrides and splits thread group values, including multiple thread groups
  - Run a debug test before a full run and use the logs and artifacts to diagnose failures
prerequisites:
  - What BlazeMeter is and when to use it
  - Thread groups, CSV Data Set Config and non-GUI runs in JMeter
related: [blazemeter-overview, blazemeter-chrome-recorder, blazemeter-distributed-load-and-locations, jmeter-thread-groups, jmeter-csv-data-set-config, jmeter-timers-and-throughput-shaping]
references:
  - title: BlazeMeter Help - Create a JMeter test
    url: https://help.blazemeter.com/docs/guide/performance-create-jmeter-test.html
  - title: BlazeMeter Help - Load configuration
    url: https://help.blazemeter.com/docs/guide/performance-load-configuration.html
  - title: BlazeMeter Help - Upload files
    url: https://help.blazemeter.com/docs/guide/performance-upload-files.html
  - title: BlazeMeter Help - Calibrate a JMeter test
    url: https://help.blazemeter.com/docs/guide/performance-jmeter-calibration.html
  - title: BlazeMeter Help - Debug test
    url: https://help.blazemeter.com/docs/guide/performance-debug-test.html
videos:
  - id: sxA5E2tojPI
    title: "BlazeMeter Beginner Tutorial 1 - Introduction"
    channel: "Tech Grantha"
  - id: CEMfZJLQqc0
    title: "BlazeMeter Free Training Session3-Oct14-Test Execution using BlazeMeter, Test Report"
    channel: "PerformanceAutomationSecurityTesting,MGMITTraining"
interview:
  - q: How does BlazeMeter treat the thread count in your JMX?
    a: With overrides on, the Total Users value wins. If every thread group has the default 1 thread, BlazeMeter splits the total evenly across thread groups, rounding as needed. If they have different counts, it keeps the ratio, so 5, 3 and 2 threads with 1,000 total users become 500, 300 and 200. On a paid plan with a JMeter script you can disable overrides and use the script's own values.
  - q: Your test hangs at "booting" and never starts. What do you check?
    a: Missing or mis-referenced files first. BlazeMeter downloads all test files to every engine before starting, and a CSV Data Set Config with a local absolute path or a file that was not uploaded can make the test fail to start or hang. I check that every file is uploaded, names match case exactly, contain no spaces, and the script references file names only. Then the logs report.
  - q: What is a debug test and why run it?
    a: It is a low-scale copy of the test (the docs describe 10 threads for at most 5 minutes or 100 iterations) that validates the script, files and the target's reachability from the engines. It catches firewall, file and correlation problems cheaply before a full run.
  - q: Why might requests per second be capped even though you set many users?
    a: If a Limit RPS value is set in the load configuration, or the script has throughput timers, BlazeMeter shapes traffic to that rate regardless of users. That is useful to model an arrival rate, but forgetting it explains a flat hits-per-second line.
practice:
  - "Upload a two-thread-group JMX with weights 3:1 and set 40 total users; predict the split, run a debug test and check the logs to confirm."
  - "Deliberately reference C:/data/users.csv in a CSV Data Set Config, run, observe the failure, and fix it."
  - "Run the same test once with a 50 RPS limit and once without; compare hits/s and response time."
takeaways:
  - Upload the JMX and every data file; reference files by name only, with exact case and no spaces.
  - Load configuration overrides the thread group; multiple thread groups are split evenly or by ratio.
  - Choose duration or iterations; an RPS limit caps throughput whatever the user count.
  - Always run a debug test before the full load.
  - Calibrate users per engine before large runs.
quiz:
  - id: bzm-run-q1
    type: code-output
    topic: blazemeter-running-jmeter-tests
    difficulty: intermediate
    prompt: A JMX has three thread groups set to 5, 3 and 2 threads. You set Total Users to 1,000 with overrides on. How many users run in each group?
    options: ["334, 333, 333", "500, 300, 200", "1000 each", "5, 3, 2"]
    answer: [1]
    explanation: When thread groups have different counts, BlazeMeter keeps their ratio (50%, 30%, 20%). Even splitting only happens when all groups are left at 1 thread.
  - id: bzm-run-q2
    type: single
    topic: blazemeter-running-jmeter-tests
    difficulty: beginner
    prompt: How should a CSV Data Set Config reference users.csv for BlazeMeter?
    options: ["C:\\perf\\users.csv", "/home/me/users.csv", "users.csv", "~/users.csv"]
    answer: [2]
    explanation: Upload the file with the test and reference only the file name, as if it sat next to the script. Local absolute paths do not exist on engines.
  - id: bzm-run-q3
    type: truefalse
    topic: blazemeter-running-jmeter-tests
    difficulty: beginner
    prompt: With overrides on you can set both Duration and Iterations at the same time in the BlazeMeter UI.
    options: ["True", "False"]
    answer: [1]
    explanation: The docs say you pick one of Duration or Iterations when using overrides. If you disable overrides and set both in the script, the run stops at whichever limit is hit first.
  - id: bzm-run-q4
    type: scenario
    topic: blazemeter-running-jmeter-tests
    difficulty: intermediate
    prompt: A test with 200 users shows hits/s flat at exactly 50 for the whole run while response times are low. What is the most likely cause?
    options: ["The server is saturated", "A Limit RPS of 50 (or a throughput timer) is capping the rate", "The engines are out of memory", "Ramp-up is too long"]
    answer: [1]
    explanation: A perfectly flat rate with low response times points to a deliberate cap. A saturated server would show rising response times or errors.
---

## Beginner-friendly explanation

You have a working `.jmx`. Running it on BlazeMeter is like handing a recipe to a restaurant kitchen. You give them the recipe (the script) and the ingredients (CSV and JAR files), then tell the head chef how many plates and how fast (the **load configuration**). The chef may ignore the "serves 4" written on the recipe and cook for 1,000; that is an **override**. Before the dinner rush, a good chef cooks one small test plate: that is the **debug test**.

## Technical explanation

**Create the test.** In the Performance tab: Create Test, choose a project, Performance Test, then upload the JMX and supporting files (CSV, JAR, properties). BlazeMeter calls the uploaded set the scenario definition. All files are downloaded to every engine before the test starts, so large unnecessary files slow startup.

**File rules (from the docs at the time of writing):** names should use letters, digits, underscores and hyphens, always have an extension, contain no spaces, and are case-sensitive (`File.csv` is not `file.csv`). Files must not contain non-ASCII characters (ZIP and JAR excepted). There is a per-file upload size limit; check the current value in the Upload files page. Missing files or local paths can make the test fail to start or hang.

**Load configuration and overrides.**

| Setting | Meaning |
|---|---|
| Total Users | Peak concurrent users, divided across engines |
| Duration **or** Iterations | Run for minutes, or until iterations complete (not both with overrides) |
| Ramp Up Time and Steps | Time to reach peak, optionally in steps |
| Limit RPS | Caps requests per second; can be changed during a run |

Overrides replace values in your thread groups. With multiple thread groups: all at 1 thread means an even split (10 users over 2 groups: 5 each; 11 over 3: rounds to 4 each; 7 over 3: rounds to 2 each); different counts keep the ratio. On a paid plan with a JMeter script you may **disable overrides** and let the script's thread groups decide. Safeguards exist: very high-iteration overrides get a default duration of about 1 hour 10 minutes, and an infinite-loop script with no duration gets a short default duration. After a JMeter run, the logs report's `artifacts.zip` contains a `modified_(script name).jmx` showing exactly what BlazeMeter ran.

For complex shapes (spikes, stepping down), the docs point to the Concurrency Thread Group or Ultimate Thread Group in the script.

**Calibration.** BlazeMeter strongly recommends calibrating: find how many users one engine can run while CPU stays under about 75% and memory under about 85%, then set users per engine accordingly. The next lesson covers engines.

## Step-by-step walkthrough

Prerequisites: a JMX that runs cleanly locally, a `users.csv`, and a target reachable from the internet that you own or are authorised to test (for example a staging instance of your own app on a cloud VM). If your app is only local, use Taurus locally (later lesson) instead.

1. **Prepare the script.** Remove View Results Tree and other heavy listeners. Set the CSV Data Set Config filename to `users.csv`. Use `${__P(host,staging.example.test)}` in HTTP Request Defaults.
2. **Performance tab, Create Test, Performance Test.** Pick your project and name the test `shop-baseline`.
3. **Upload.** Click the upload area (or drag) and add `shop.jmx` and `users.csv`. Wait for validation; the JMX is detected as the main script.
4. **Load Configuration section.** Total Users 20, Ramp Up Time 2 minutes, Duration 10 minutes. Leave Limit RPS off for now.
5. **Load Distribution section.** Pick one location close to your server. Keep the engine count automatic.
6. **JMeter properties (optional).** If your script reads `${__P(host)}`, set `host` in the test's JMeter properties section so you can change targets without editing the file.
7. **Failure Criteria (optional now).** Add "Avg. Response Time > 800 ms" for ALL labels; lesson 5 covers this.
8. **Click Debug Test.** It runs a small copy (10 threads, up to 5 minutes or 100 iterations per the docs). Open the report: check Errors, Logs and Engine Health.
9. **Fix and repeat** until the debug test is clean.
10. **Click Run Test.** Watch the Summary report fill in live. Do not walk away from your first runs; be ready to stop the test if the target struggles in a way you did not agree.
11. **After the run**, download `artifacts.zip` from the Logs report and open `modified_shop.jmx` to see what actually ran.

## Code examples

Keep the script environment-neutral so the same file runs locally and in BlazeMeter:

```text
HTTP Request Defaults
  Protocol: https
  Server:   ${__P(host,staging.example.test)}
Thread Group
  Threads:  ${__P(users,1)}       (overridden by Total Users in BlazeMeter)
  Ramp-up:  ${__P(rampup,1)}
CSV Data Set Config
  Filename: users.csv            (name only, uploaded with the test)
  Recycle on EOF: True   Stop thread on EOF: False
```

Locally: `jmeter -n -t shop.jmx -Jhost=localhost -Jusers=5 -l r.jtl`.

## Expected output

The debug test report shows about 10 users, a short timeline and zero or explainable errors. The full run's Summary shows Max Users near 20, hits/s rising during ramp-up and levelling off, and your labels listed in Request Stats. The `modified_shop.jmx` shows thread counts rewritten by BlazeMeter.

## Real-world example

An insurance team uploaded a quote-journey JMX with two thread groups: "browse" with 8 threads and "buy" with 2. They set 500 total users and expected 250 each; BlazeMeter kept the 4:1 ratio and ran 400 and 100, which was actually their intended mix. Their first run hung at start: the CSV Data Set Config pointed at `D:\perf\quotes.csv`. Changing it to `quotes.csv` and uploading the file fixed it. The debug test then showed connection timeouts: the staging firewall blocked the engines; the infrastructure team allowed the test traffic for the agreed window.

## Worked example: predicting what an override will do

Before you click Run Test, predict the effective load on paper. It catches surprises that otherwise cost a whole run.

Your script has three thread groups:

```text
Browse   threads 6   loops forever   (with a Uniform Random Timer)
Cart     threads 3   loops forever
Checkout threads 1   loops forever
```

You set Total Users 300, Ramp Up 5 minutes, Duration 20 minutes. Because the thread counts differ, BlazeMeter keeps the ratio 6:3:1, so you should expect about 180 browse, 90 cart and 30 checkout users. Write that prediction down. After the run, open `modified_shop.jmx` from `artifacts.zip` and compare: if the numbers differ (for example because there is more than one engine and rounding was applied per engine), you now know why the Request Stats mix looks different from your plan.

Now consider iterations instead of duration. If you switch to Iterations 50 and each checkout iteration takes about 40 seconds including think time, checkout users finish in roughly 33 minutes, but browse users with shorter iterations finish much earlier. The load therefore drops off unevenly at the end of the run. For a steady-state test, duration is usually easier to analyse; iterations suit "process exactly N orders" style tests.

## Reading the debug test like a checklist

The debug test is cheap insurance. Go through its report in this order:

1. **Logs.** Open the engine log in the Logs tab and search for `ERROR`, `FileNotFoundException` and `NoClassDefFoundError`. Any of these means a missing file or plugin, not a performance problem.
2. **Errors tab.** Group by response code. A wall of 401 or 403 almost always means correlation or test data; a wall of connection errors means the engines cannot reach the target.
3. **Request Stats.** Check every label you expect is present. A missing label means that sampler never ran, often because an earlier failure stopped the thread or a controller condition was false.
4. **Engine Health.** Even at 10 users, CPU should be low. High CPU this early points at heavy listeners, a big regular expression on large responses or a JSR223 script without caching.
5. **Target side.** Ask the application owner (or check your own monitoring) whether they saw the traffic. Seeing requests arrive confirms the route, host and firewall rules are right.

Only move to the full run when you can explain every error in the debug report.

## Using JMeter properties for one script, many environments

The properties section of the test is the cleanest way to reuse one script across environments. If your script reads `${__P(host,staging.example.test)}`, `${__P(thinkMin,3000)}` and `${__P(thinkMax,6000)}`, you can set different values per BlazeMeter test without uploading a new JMX. Keep a short table in your repository listing each property, its default and what it controls, so nobody has to open the script to know what to change.

| Property | Default | Purpose |
|---|---|---|
| `host` | `staging.example.test` | Target host |
| `thinkMin` / `thinkMax` | 3000 / 6000 | Think-time range in ms |
| `searchTerms` | `terms.csv` | Data file for searches |

## Common mistakes

- **Skipping the debug test** and burning a full run on a broken script.
- **Local or absolute file paths**, wrong case or spaces in file names.
- **Forgetting a file** (CSV, JAR for a custom function, `user.properties`).
- **Expecting the JMX thread count to apply** when overrides are on.
- **Leaving an RPS limit or throughput timer** and then wondering why throughput is flat.
- **Infinite loops with no duration** when overrides are off.
- **Heavy listeners left in the script**, which waste engine CPU and memory.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Test hangs before starting | Missing file or local path; upload it and use the name only |
| "file not found" for `File.csv` | Case mismatch; names are case-sensitive |
| Test ended early | Iteration safeguard or plan duration limit; check the Load configuration limitations |
| Users differ from what you set per group | Overrides split by ratio; check `modified_*.jmx` |
| Errors only in the cloud | Firewall, DNS or host property; check the Errors and Logs reports |

## Hands-on exercise

1. Upload a JMX with two thread groups and a CSV. Predict the per-group split for 30 total users, then confirm in `modified_*.jmx`.
2. Run a debug test and fix every error.
3. Run 10 minutes at your agreed load. Note Max Users, average hits/s and error percentage.
4. Re-run with a Limit RPS value and describe how the timeline changed.

## Key takeaways summary

Create the test from your JMX plus every data file, referenced by name only. The load configuration (users, ramp-up, duration or iterations, RPS limit) overrides the thread groups, splitting users evenly or by ratio. Always run a debug test, read the Errors, Logs and Engine Health reports, then run at load on a target you are authorised to test.
