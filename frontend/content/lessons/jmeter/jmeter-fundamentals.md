---
slug: jmeter-fundamentals
title: JMeter Fundamentals
summary: Understand how Apache JMeter test plans are built from thread groups, samplers, config elements, timers, assertions and listeners, how scoping and execution order work, and how to build a first HTTP load test.
level: beginner
duration: 40
tags: [performance, jmeter, load-testing, tools]
objectives:
  - Name the main JMeter test plan elements and what each does
  - Configure a Thread Group with threads, ramp-up, loop count and duration
  - Build an HTTP Request test with defaults, header and cookie managers
  - Explain JMeter's scoping rules and execution order
prerequisites:
  - HTTP basics (methods, headers, status codes)
  - Performance test types and workload modelling
related: [jmeter-correlation-and-parameterization, jmeter-assertions-and-extractors, jmeter-timers-and-throughput-shaping, jmeter-non-gui-and-distributed]
references:
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: Apache JMeter - Elements of a Test Plan
    url: https://jmeter.apache.org/usermanual/test_plan.html
  - title: Apache JMeter - Component Reference
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter - Best Practices
    url: https://jmeter.apache.org/usermanual/best-practices.html
interview:
  - q: Describe the main elements of a JMeter test plan.
    a: A Test Plan contains one or more Thread Groups, which define the virtual users. Inside them, Samplers such as HTTP Request send the actual requests; Logic Controllers decide the order and conditions; Config Elements such as HTTP Request Defaults, CSV Data Set Config and the Cookie Manager supply settings and data; Timers add delays; Pre- and Post-Processors prepare requests and extract data from responses; Assertions check responses; and Listeners collect and display results.
  - q: In what order does JMeter execute elements in the same scope?
    a: Configuration elements first, then Pre-Processors, then Timers, then the Sampler itself, then Post-Processors, then Assertions, and finally Listeners. Post-Processors and Assertions run only if there is a sample result. This is why a timer placed anywhere in a controller delays every sampler in its scope before the sampler runs.
  - q: What does the ramp-up period in a Thread Group mean?
    a: It is the time JMeter takes to start all the threads. With 100 threads and a 50-second ramp-up, JMeter starts about two threads per second, and all 100 are running after about 50 seconds. A sensible ramp-up avoids an artificial spike at the start and lets the system warm up; results from the ramp-up period are usually excluded from steady-state analysis.
  - q: Why should you not use GUI mode for load tests?
    a: The GUI consumes CPU and memory on the load generator and, combined with listeners like View Results Tree, can make JMeter itself the bottleneck, distorting results. The JMeter documentation recommends GUI mode only for creating and debugging scripts, and non-GUI mode for the actual load test.
practice:
  - "Build a test plan that logs in, searches for a product and views it, using HTTP Request Defaults for the server name and a Cookie Manager."
  - "Configure a Thread Group for 50 threads, a 100-second ramp-up and a 10-minute duration. How many threads start per second?"
  - "Place a Constant Timer at the Thread Group level and another inside one sampler. Run with a Debug Sampler and explain the delays you observe."
takeaways:
  - A Thread Group defines virtual users; samplers send requests; listeners record results.
  - "Execution order in a scope: config, pre-processors, timers, sampler, post-processors, assertions, listeners."
  - Elements apply to everything in their scope, so placement in the tree matters.
  - Use GUI mode to build and debug scripts and non-GUI mode to run load.
  - Only load-test systems you own or are explicitly authorized to test.
quiz:
  - id: perf-jmf-q1
    type: single
    topic: jmeter-fundamentals
    difficulty: beginner
    prompt: A Thread Group has 120 threads and a ramp-up period of 60 seconds. Approximately how many threads does JMeter start per second?
    options: ["0.5", "2", "60", "120"]
    answer: [1]
    explanation: JMeter spreads thread starts across the ramp-up period, so 120 threads / 60 s = 2 threads per second. The ramp-up says nothing about requests per second, which depends on response times and timers.
  - id: perf-jmf-q2
    type: single
    topic: jmeter-fundamentals
    difficulty: intermediate
    prompt: Which order matches JMeter's execution order for elements in the same scope?
    options: ["Sampler, Timers, Assertions, Post-Processors", "Config elements, Pre-Processors, Timers, Sampler, Post-Processors, Assertions, Listeners", "Timers, Config elements, Sampler, Listeners, Assertions", "Pre-Processors, Sampler, Timers, Assertions, Post-Processors"]
    answer: [1]
    explanation: The JMeter manual defines the order as config elements, pre-processors, timers, sampler, post-processors, assertions and listeners. Timers run before the sampler, which is why they delay the request rather than follow it.
  - id: perf-jmf-q3
    type: multiple
    topic: jmeter-fundamentals
    difficulty: beginner
    prompt: Which of these are JMeter Config Elements? Select all that apply.
    options: ["HTTP Request Defaults", "CSV Data Set Config", "HTTP Cookie Manager", "Response Assertion", "Constant Timer"]
    answer: [0, 1, 2]
    explanation: HTTP Request Defaults, CSV Data Set Config and HTTP Cookie Manager are config elements. Response Assertion is an assertion and Constant Timer is a timer, even though they also sit in the test tree.
  - id: perf-jmf-q4
    type: truefalse
    topic: jmeter-fundamentals
    difficulty: beginner
    prompt: A timer placed directly under a Thread Group applies to every sampler in that Thread Group.
    options: ["True", "False"]
    answer: [0]
    explanation: Elements apply to all samplers within their scope. A timer at Thread Group level is in scope for every sampler below it, so each sampler is delayed. To delay only one request, make the timer a child of that sampler.
---

## Beginner-friendly explanation

Imagine directing a play with hundreds of actors. You need a cast list (how many actors), a script (what each says), stage directions (pauses and order), props (data each actor uses), a critic checking each line is correct and a recorder writing down how the performance went.

**Apache JMeter** is that director for load tests. You build a **test plan**: a tree that says how many virtual users to run, what requests they send, which data they use, how long they pause, how to check the answers and where to save the results. JMeter then runs that plan with many threads at once, each thread behaving like one user.

## Technical explanation

JMeter is an open-source Java application from the Apache Software Foundation. A test plan is saved as a `.jmx` (XML) file.

| Element type | Purpose | Examples |
|---|---|---|
| Thread Group | Defines virtual users and how they start | Thread Group, setUp and tearDown Thread Groups |
| Sampler | Sends a request and measures it | HTTP Request, JDBC Request, JSR223 Sampler |
| Logic Controller | Controls order and conditions | Transaction Controller, Loop, If, Throughput Controller |
| Config Element | Supplies settings and data | HTTP Request Defaults, HTTP Header Manager, HTTP Cookie Manager, CSV Data Set Config |
| Timer | Adds delays before samplers | Constant Timer, Uniform Random Timer, Constant Throughput Timer |
| Pre-/Post-Processor | Prepares requests, extracts response data | JSON Extractor, Regular Expression Extractor |
| Assertion | Checks responses | Response Assertion, JSON Assertion, Duration Assertion |
| Listener | Collects or displays results | Simple Data Writer, Summary Report, Backend Listener |

### Thread Group settings

- **Number of Threads (users):** concurrent virtual users.
- **Ramp-up period:** seconds to start all threads. 100 threads with 50 s ramp-up starts about 2 per second.
- **Loop Count** or **Infinite**, often combined with **Specify Thread lifetime** (duration and startup delay; older versions call the option "Scheduler").
- **Same user on each iteration:** controls whether cookies and cache are reset between iterations.

### Scoping and execution order

Elements apply to the samplers in their **scope**: their parent and everything below it. Config elements nearer the sampler override more general ones. For each sampler JMeter executes, in order:

```mermaid
flowchart LR
  A["Config elements"] --> B["Pre-Processors"] --> C["Timers"] --> D["Sampler"] --> E["Post-Processors"] --> F["Assertions"] --> G["Listeners"]
```

Post-Processors and Assertions run only when there is a sample result.

### Key HTTP elements

- **HTTP Request Defaults:** protocol, server and port set once.
- **HTTP Header Manager:** headers such as `Content-Type: application/json`.
- **HTTP Cookie Manager:** stores and sends cookies per thread, like a browser.
- **HTTP Request:** method, path, parameters or body. Its **Transaction Controller** parent can group several requests into one business transaction with its own timing.

## Real-world example

A team new to JMeter recorded a shopping journey and ran it with 200 threads in GUI mode with View Results Tree enabled. Their laptop's CPU hit 100% and reported response times climbed steadily. The application servers, meanwhile, were mostly idle. JMeter itself was the bottleneck. After removing View Results Tree, disabling the GUI and running from a dedicated load generator, response times were stable and much lower, and the real application bottleneck appeared only at a far higher load.

## Step-by-step walkthrough

1. **Confirm authorization** to load the target system and agree the test window.
2. **Add a Thread Group**: for a first test, 10 threads, 10 s ramp-up, 5 loops.
3. **Add HTTP Request Defaults** with protocol, host and port of the test environment.
4. **Add an HTTP Cookie Manager and Header Manager** at Thread Group level.
5. **Add HTTP Request samplers** for each step, grouped in Transaction Controllers.
6. **Add assertions** so failures are counted (see [assertions and extractors](/learn/performance/jmeter-assertions-and-extractors)).
7. **Debug with 1 thread** and View Results Tree, then disable that listener.
8. **Run in non-GUI mode** (see [non-GUI and distributed execution](/learn/performance/jmeter-non-gui-and-distributed)).

## Code examples

An HTTP Request sampler as it appears inside a `.jmx` file (simplified; JMeter writes many more properties):

```xml
<HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="GET /products">
  <stringProp name="HTTPSampler.path">/api/products</stringProp>
  <stringProp name="HTTPSampler.method">GET</stringProp>
  <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
  <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
</HTTPSamplerProxy>
```

A first non-GUI run from the command line:

```bash
jmeter -n -t first-test.jmx -l results.jtl
```

## Expected output

In non-GUI mode JMeter prints a periodic summary line (the summariser). The format looks like this; the numbers depend entirely on your system:

```text
summary +   2500 in 00:00:30 =   83.3/s Avg:   120 Min:    45 Max:   640 Err:     0 (0.00%) Active: 10 Started: 10 Finished: 0
```

`Err: 0 (0.00%)` only means something if assertions are in place; without them, a wrong page with HTTP 200 counts as a success.

## Common mistakes

- **Running load in GUI mode** with heavy listeners.
- **No Cookie Manager**, so every request looks like a new, logged-out user.
- **Timers in the wrong scope**, delaying every sampler instead of one.
- **No assertions**, so errors hidden behind HTTP 200 pages pass silently.
- **Recording and replaying without correlation**, so session tokens are stale. See [correlation and parameterization](/learn/performance/jmeter-correlation-and-parameterization).
- **Hard-coding hostnames** in every sampler instead of using HTTP Request Defaults or properties.

## Troubleshooting

- **All requests fail with 403 or 401 after login.** A dynamic token or cookie is not being passed; check the Cookie Manager and correlation.
- **JMeter runs out of memory.** Remove result-tree listeners, write results to a file, and increase the heap via the `HEAP` environment variable used by the start scripts.
- **Throughput is much lower than expected.** Check the load generator's CPU and network first, then apply Little's Law to your thread count.

## Key takeaways summary

A JMeter test plan is a tree: thread groups for users, samplers for requests, config elements for settings and data, timers for delays, assertions for correctness and listeners for results. Understand scope and execution order, debug in the GUI, and run load in non-GUI mode against systems you are authorized to test.
