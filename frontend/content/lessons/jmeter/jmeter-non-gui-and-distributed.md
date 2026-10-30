---
slug: jmeter-non-gui-and-distributed
title: Non-GUI and Distributed Execution in JMeter
summary: Run real load the way the JMeter documentation recommends - from the command line, with properties, results files and the HTML dashboard - and scale out with distributed mode using a controller and remote JMeter servers.
level: intermediate
duration: 40
tags: [performance, jmeter, ci, distributed-testing]
objectives:
  - Run a JMeter test in non-GUI mode and generate the HTML dashboard report
  - Parameterize a test plan with properties passed on the command line
  - Set up distributed testing with a controller and remote JMeter servers
  - Calculate total load in distributed mode and avoid common data and network pitfalls
prerequisites:
  - JMeter fundamentals
  - Command-line basics
  - Basic networking (hosts, ports, firewalls)
related: [jmeter-fundamentals, jmeter-timers-and-throughput-shaping, monitoring-with-influxdb-grafana, analyzing-performance-results]
references:
  - title: Apache JMeter - Getting Started (non-GUI mode and command-line options)
    url: https://jmeter.apache.org/usermanual/get-started.html
  - title: Apache JMeter - Remote (distributed) Testing
    url: https://jmeter.apache.org/usermanual/remote-test.html
  - title: Apache JMeter - Generating the Dashboard Report
    url: https://jmeter.apache.org/usermanual/generating-dashboard.html
  - title: Apache JMeter - Best Practices
    url: https://jmeter.apache.org/usermanual/best-practices.html
interview:
  - q: How do you run a JMeter test from the command line and produce the HTML report?
    a: jmeter -n -t plan.jmx -l results.jtl -e -o report/. -n is non-GUI mode, -t the test plan, -l the results file, -e generates the dashboard at the end and -o is the output folder, which must be empty or not exist. If I already have a results file I can generate the report later with jmeter -g results.jtl -o report/.
  - q: How does distributed testing work in JMeter, and how many users does it generate?
    a: One controller (client) sends the test plan to several remote machines running jmeter-server. Each server runs the complete plan independently and sends results back to the controller. So the load multiplies; a thread group of 200 threads on 3 servers gives 600 threads. All machines need the same JMeter, Java and plugin versions, and any CSV files must exist on each server at the expected path.
  - q: What is the difference between -J and -G properties?
    a: -J sets a JMeter property locally on the machine where the command runs. -G sets a global property that the controller sends to all remote servers in distributed mode. In the plan I read them with the __P function, for example ${__P(threads,10)}, so the same plan can run at different loads without editing.
  - q: How do you know your load generators are not the bottleneck?
    a: I monitor CPU, memory, garbage collection and network on every generator during the run. If generator CPU is near saturation, network bandwidth is close to the limit or the JVM is spending a lot of time in garbage collection, the response times include client-side queueing. I also compare the achieved rate with the target and, if in doubt, add generators and check whether results change.
practice:
  - "Write the non-GUI command that runs checkout.jmx with 150 threads and a 900-second duration passed as properties, and generates a report."
  - "You must simulate 1,200 users from 4 remote servers. What thread count should the plan use and how do you pass it?"
  - "List everything that must be identical or present on every remote server before a distributed run."
takeaways:
  - Use GUI mode to build and debug; use non-GUI mode for every real load test.
  - "jmeter -n -t plan.jmx -l results.jtl -e -o report/ runs the test and generates the HTML dashboard."
  - Pass load parameters as properties and read them with __P so plans are reusable.
  - In distributed mode each remote server runs the whole plan, so total threads = threads per plan × servers.
  - Keep JMeter, Java, plugins and data files consistent across generators, and monitor the generators themselves.
quiz:
  - id: perf-jnd-q1
    type: single
    topic: jmeter-non-gui-and-distributed
    difficulty: beginner
    prompt: What does the -e option do in jmeter -n -t plan.jmx -l results.jtl -e -o report/?
    options: ["Enables extra logging", "Generates the HTML dashboard report after the test", "Exits remote servers at the end", "Encrypts the results file"]
    answer: [1]
    explanation: -e generates the report dashboard after the load test, written to the folder given by -o. Exiting remote servers is -X.
  - id: perf-jnd-q2
    type: scenario
    topic: jmeter-non-gui-and-distributed
    difficulty: intermediate
    prompt: A plan's Thread Group uses ${__P(threads,100)}. You start it with -R gen1,gen2,gen3 and -Gthreads=250. How many threads run in total?
    options: ["100", "250", "300", "750"]
    answer: [3]
    explanation: -G sends threads=250 to every remote server, and each server runs the full plan, so 3 × 250 = 750 threads. 300 would be the default of 100 per server, ignored here because the global property overrides it.
  - id: perf-jnd-q3
    type: debugging
    topic: jmeter-non-gui-and-distributed
    difficulty: intermediate
    prompt: In a distributed run, logins fail with "user already logged in" errors that never appear in single-machine runs. Every server has an identical copy of users.csv. What is the likely cause?
    options: ["The controller's clock is wrong", "Each server reads the same CSV lines, so the same accounts log in from several servers at once", "The -e option was missing", "Remote servers cannot run CSV Data Set Config"]
    answer: [1]
    explanation: CSV Data Set Config is evaluated independently on each server, so identical files mean server 1, 2 and 3 all use user0001 first. Split the data so each server gets a distinct set of accounts.
  - id: perf-jnd-q4
    type: truefalse
    topic: jmeter-non-gui-and-distributed
    difficulty: beginner
    prompt: The folder given to -o must be empty or must not exist yet.
    options: ["True", "False"]
    answer: [0]
    explanation: JMeter refuses to overwrite a non-empty report folder, so use a new folder per run, which also keeps reports from different runs separate.
---

## Beginner-friendly explanation

Building a test in the JMeter window is like rehearsing a play on stage with the lights and cameras on: great for checking every line, but expensive. When the real show starts, you turn off the rehearsal equipment and let the actors perform. That is **non-GUI mode**: JMeter runs the test from the command line, saving its energy for generating load.

Sometimes one stage is not big enough for the cast. **Distributed mode** puts the same play on several stages at once, with one director (the controller) starting them all and collecting the reviews.

## Technical explanation

### Non-GUI mode

```bash
jmeter -n -t plan.jmx -l results.jtl -e -o report/
```

| Option | Meaning |
|---|---|
| `-n` | Non-GUI mode |
| `-t` | Test plan (`.jmx`) |
| `-l` | Results file (`.jtl`, CSV by default) |
| `-e` | Generate the HTML dashboard after the test |
| `-o` | Dashboard output folder (must be empty or not exist) |
| `-g` | Generate a dashboard from an existing results file (with `-o`) |
| `-j` | JMeter log file |
| `-J name=value` | Set a local JMeter property |
| `-G name=value` | Set a global property sent to remote servers |
| `-q file` | Additional property file |
| `-R h1,h2` | Start the test on these remote servers |
| `-r` | Start on the servers listed in `remote_hosts` |
| `-X` | Exit remote servers when the test ends |

Plans read properties with the `__P` function, for example `${__P(threads,10)}`, where 10 is the default.

### Distributed mode

```mermaid
flowchart LR
  C["Controller: jmeter -n -t plan.jmx -R gen1,gen2,gen3"] -->|"sends plan"| G1["gen1: jmeter-server"]
  C -->|"sends plan"| G2["gen2: jmeter-server"]
  C -->|"sends plan"| G3["gen3: jmeter-server"]
  G1 -->|"load"| S["System under test"]
  G2 -->|"load"| S
  G3 -->|"load"| S
  G1 -->|"results"| C
  G2 -->|"results"| C
  G3 -->|"results"| C
```

Key facts from the JMeter remote-testing documentation:

- Every server runs the **whole** plan, so **total threads = threads in the plan × number of servers**.
- All machines should run the **same JMeter and Java versions**, and the same plugins.
- **Data files** (CSV) are read locally on each server; they must exist there, and should contain different rows per server when uniqueness matters.
- Communication uses Java RMI. Since JMeter 4.0, RMI uses SSL by default, which needs a keystore created with the `create-rmi-keystore` script and copied to every machine; disabling SSL (`server.rmi.ssl.disable=true`) is only acceptable on an isolated, trusted network.
- Firewalls must allow the RMI registry port (1099 by default) and the server and client ports, which you can fix with `server.rmi.localport` and `client.rmi.localport`.
- Results stream back to the controller; the sample sender `mode` property controls batching, which matters at high sample rates.
- Generators, controller and system under test should be on a fast, close network so the network path does not distort results.

## Real-world example

A team needed 1,200 concurrent users for a soak test. A single generator ran out of CPU at around 500 threads, so they set up 4 remote servers. Their first run produced 4,800 users, because they left the plan at 1,200 threads and forgot that each server runs the whole plan. The second run used `-Gthreads=300`. It then hit duplicate-login errors, since all four servers read the same `users.csv`. Splitting the file into four distinct 300-row files, one per server at the same path, fixed the test. Throughout, they monitored generator CPU to confirm the generators were never the bottleneck.

## Step-by-step walkthrough

1. **Parameterize the plan**: threads, ramp-up, duration and host via `${__P(...)}`.
2. **Remove heavy listeners** (View Results Tree, graph listeners); results go to the `.jtl` file.
3. **Run a short non-GUI smoke test** with a handful of threads.
4. **For distributed runs**, install identical JMeter, Java and plugins on each server, create and distribute the RMI keystore, and copy data files.
5. **Start `jmeter-server`** on each generator, then run the controller with `-R` and `-G` properties.
6. **Monitor generators** (CPU, memory, GC, network) as closely as the system under test.
7. **Generate and archive the dashboard** with the plan version, properties and environment details.

## Code examples

Single machine, parameterized:

```bash
jmeter -n -t checkout.jmx \
  -Jthreads=150 -Jrampup=300 -Jduration=900 -Jhost=perf-env.internal.example \
  -l results/run-01.jtl -j results/run-01.log \
  -e -o results/run-01-report
```

Distributed, 4 servers × 300 threads = 1,200 users:

```bash
# on each generator
jmeter-server

# on the controller
jmeter -n -t soak.jmx -R gen1,gen2,gen3,gen4 \
  -Gthreads=300 -Grampup=600 -Gduration=21600 \
  -l results/soak.jtl -e -o results/soak-report -X
```

Thread Group fields in the plan: `${__P(threads,10)}`, `${__P(rampup,30)}`, `${__P(duration,300)}`.

## Expected output

The console prints the summariser every 30 seconds by default, and at the end a line such as `Tidying up ...` followed by `... end of run`. The `-o` folder contains `index.html`; opening it shows the APDEX table, request summary, statistics with percentiles, errors and time-series graphs.

## Common mistakes

- **Load from GUI mode**, making JMeter the bottleneck.
- **Forgetting the multiplier** in distributed mode.
- **Same CSV on every server** when data must be unique.
- **Mismatched versions or missing plugins** on a generator, causing the plan to fail to load there.
- **Reusing a report folder**, which JMeter rejects.
- **Not monitoring generators**, so client-side saturation is reported as server slowness.

## Troubleshooting

- **Controller cannot connect to a server.** Check firewall rules, the RMI ports, the `java.rmi.server.hostname` setting on multi-homed hosts, and that the keystore is present.
- **Report generation fails.** Check that the `.jtl` file has the default CSV columns and a header line, and that the output folder is empty.
- **Out of memory on the controller.** Reduce what is sent back (sample sender mode), save fewer fields, or increase the heap with the `HEAP` environment variable.

## Key takeaways summary

Run every real load test in non-GUI mode with properties, a results file and the HTML dashboard. Scale out with distributed mode, remembering that each server runs the full plan, data files are local to each server and every generator needs identical software. Watch the generators as carefully as the system under test, and only target systems you are authorized to load.
