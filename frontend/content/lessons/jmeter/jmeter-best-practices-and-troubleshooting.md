---
slug: jmeter-best-practices-and-troubleshooting
title: Best Practices, Memory Tuning and Troubleshooting
summary: Make JMeter tests trustworthy and efficient with non-GUI runs, lean listeners, heap tuning, Groovy instead of BeanShell, warm-up and realistic data, and diagnose common errors such as OutOfMemoryError, connection refused and ephemeral port exhaustion.
level: intermediate
duration: 40
tags: [performance, jmeter, best-practices, troubleshooting, load-testing]
objectives:
  - Apply the main JMeter best practices for script building and test execution
  - Tune the JMeter heap with the HEAP environment variable
  - Monitor the load generator so it does not become the bottleneck
  - Diagnose the most common JMeter and network errors
prerequisites:
  - Non-GUI and distributed execution
  - Groovy and JSR223 basics
related: [jmeter-non-gui-and-distributed, jmeter-groovy-jsr223, jmeter-listeners-and-results, jmeter-csv-data-set-config, jmeter-analyzing-results, jmeter-ci-cd]
references:
  - title: Apache JMeter - Best Practices
    url: https://jmeter.apache.org/usermanual/best-practices.html
  - title: Apache JMeter - Remote Testing
    url: https://jmeter.apache.org/usermanual/remote-test.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: How do you make sure JMeter itself is not the bottleneck?
    a: I run in non-GUI mode, remove or disable View Results Tree and other heavy listeners, write results to a CSV-format JTL with only the fields I need, use Groovy with caching instead of BeanShell, and size the heap appropriately. During the run I watch the load generator's CPU, memory, garbage collection and network. If it is saturated, I reduce threads per machine or add generators. A sign of trouble is throughput that stops rising while the server is idle.
  - q: You get java.lang.OutOfMemoryError in JMeter. What do you do?
    a: First check for memory-hungry elements, mainly View Results Tree or other listeners keeping all results, saving response data in the JTL, or huge responses. Remove them, then increase the heap with the HEAP environment variable, for example HEAP=-Xms1g -Xmx4g, staying well under the machine's RAM. If threads are still too many for one machine, distribute the load.
  - q: What does "Non HTTP response code java.net.BindException Address already in use" mean?
    a: The load generator ran out of local ephemeral ports, usually because many connections are opened and closed and sit in TIME_WAIT. I check that keep-alive is on in the HTTP Request, avoid closing connections each iteration unless intended, and if necessary widen the operating system's ephemeral port range or add load generators.
practice:
  - "Take an existing test plan and apply the checklist in this lesson. Record what you changed and why."
  - "Run a test with View Results Tree enabled and disabled at the same thread count and compare load-generator CPU and memory."
  - "Deliberately point a test at a closed port and at a missing CSV file, and match each error to the troubleshooting table."
takeaways:
  - Build in the GUI, run in non-GUI, with heavy listeners removed.
  - Size the heap with HEAP and watch the load generator during every run.
  - Use Groovy with caching; avoid BeanShell for load.
  - Warm up, use realistic data and analyse steady state only.
  - Only load-test systems you own or are explicitly authorized to test.
quiz:
  - id: jm-bp-q1
    type: single
    topic: jmeter-best-practices-and-troubleshooting
    difficulty: beginner
    prompt: How do you give JMeter a 4 GB maximum heap on Windows without editing jmeter.bat?
    options: ["set HEAP=-Xms1g -Xmx4g before running jmeter", "jmeter -Xmx4g -n -t plan.jmx", "Add heap=4g to user.properties", "Increase the thread count"]
    answer: [0]
    explanation: The startup scripts read the HEAP environment variable. JVM flags are not JMeter command-line options, and user.properties sets JMeter properties, not JVM memory.
  - id: jm-bp-q2
    type: multiple
    topic: jmeter-best-practices-and-troubleshooting
    difficulty: intermediate
    prompt: Which practices reduce load-generator overhead? Select all that apply.
    options: ["Run in non-GUI mode", "Disable View Results Tree during load", "Use BeanShell for scripting", "Avoid saving response data in the JTL", "Use JSR223 with Groovy and caching"]
    answer: [0, 1, 3, 4]
    explanation: Non-GUI mode, lean listeners, small JTLs and compiled, cached Groovy all cut overhead. BeanShell is interpreted and much slower, which is why the JMeter docs recommend Groovy.
  - id: jm-bp-q3
    type: debugging
    topic: jmeter-best-practices-and-troubleshooting
    difficulty: intermediate
    prompt: "Every sample fails with 'Non HTTP response code: org.apache.http.conn.HttpHostConnectException ... Connection refused'. What is the most likely cause?"
    options: ["The server returned HTTP 500", "Nothing is listening on the target host and port", "The heap is too small", "The CSV file has a header"]
    answer: [1]
    explanation: Connection refused means the TCP connection was rejected, so no HTTP response exists. Check the host, port, that the app is running, and firewalls. An HTTP 500 would show a response code.
  - id: jm-bp-q4
    type: scenario
    topic: jmeter-best-practices-and-troubleshooting
    difficulty: intermediate
    prompt: As you add threads, throughput stops increasing, server CPU is at 25% and the load generator CPU is at 98%. What should you conclude?
    options: ["The server has reached capacity", "The load generator is the bottleneck; reduce its overhead or add generators", "Response times are accurate", "Add more threads on the same machine"]
    answer: [1]
    explanation: The generator cannot produce more load, so results describe JMeter's limit, not the server's. Adding threads to a saturated generator makes timings worse.
  - id: jm-bp-q5
    type: truefalse
    topic: jmeter-best-practices-and-troubleshooting
    difficulty: beginner
    prompt: A CSV Data Set Config with a relative path is resolved relative to the location of the .jmx file.
    options: ["True", "False"]
    answer: [0]
    explanation: Relative CSV paths are resolved against the test plan's directory, which is why keeping data next to the .jmx makes plans portable. Errors usually come from absolute paths copied from another machine.
---

## Beginner-friendly explanation

A load test is a measuring instrument. If the ruler is bent, every measurement is wrong. Best practices keep JMeter's "ruler" straight: JMeter should spend its effort sending requests, not drawing charts or running slow scripts. Troubleshooting is learning to read the error messages, which usually tell you exactly which part broke: your script, your machine, the network or the system you are testing.

## Technical explanation

**Building scripts**

- Use the GUI only to build and debug. Use **Debug Sampler** and View Results Tree while building, then disable them.
- Use **JSR223 elements with Groovy** and *Cache compiled script* ticked; avoid BeanShell, which is interpreted and slow. Do not inline `${var}` inside script text; use `vars.get("var")` so caching works (see [Groovy and JSR223](/learn/jmeter/jmeter-groovy-jsr223)).
- Use realistic, varied data from CSV files, enough so users do not all hit the same cached record.
- Use properties (`${__P(users,10)}`) for anything that changes between runs.

**Running tests**

- Run **non-GUI**: `jmeter -n -t plan.jmx -l results.jtl`.
- Keep the JTL in **CSV format** and save only needed fields; never save response data during load.
- Tune the heap with the **HEAP** environment variable. Default heap in 5.6.x is 1 GB.
- Include a **warm-up** period and analyse the steady state.
- **Monitor the load generator**: CPU, memory, GC, network and open sockets.
- **Distributed mode** multiplies threads but has limits: all servers must have the same JMeter, Java, plugins and data files; RMI needs open ports and SSL keystore setup by default; the controller can be overloaded collecting results. See [remote testing](/learn/jmeter/jmeter-non-gui-and-distributed).

## Step-by-step walkthrough

Before a real run, work through this checklist:

1. Open the plan in the GUI, run one thread, one iteration with View Results Tree. Fix every red sample.
2. Disable View Results Tree, Debug Samplers and graph listeners.
3. Replace BeanShell elements with JSR223 + Groovy.
4. Confirm CSV files use paths relative to the `.jmx`, and that there is enough data.
5. Set the heap (below) and start JMeter non-GUI with `-l` and optionally `-e -o`.
6. During the run, watch the generator with Task Manager / `top` and the server with your monitoring.
7. After the run, check the error column first, then percentiles in steady state.

## Code examples

```bat
:: Windows (cmd)
set HEAP=-Xms1g -Xmx4g -XX:MaxMetaspaceSize=256m
jmeter -n -t plan.jmx -l results.jtl -e -o report
```

```bash
# macOS / Linux
HEAP="-Xms1g -Xmx4g -XX:MaxMetaspaceSize=256m" jmeter -n -t plan.jmx -l results.jtl
```

```properties
# user.properties: lean CSV results
jmeter.save.saveservice.output_format=csv
jmeter.save.saveservice.response_data=false
jmeter.save.saveservice.samplerData=false
```

## Expected output

With non-GUI mode, the console prints a summariser line every 30 seconds by default, for example a line beginning `summary +` with sample count, rate per second, average, min, max and `Err:` count. A healthy run ends with `Tidying up ...` and `... end of run`. The log file `jmeter.log` shows the heap setting at startup.

## Real-world example

A tester sees response times creep up during a one-hour test, but the server dashboards look calm. Checking the load generator reveals repeated full garbage collections: a View Results Tree listener was left enabled and was keeping every result in memory. After removing it and setting a 4 GB heap, the same load produced flat response times. The "slowdown" was JMeter, not the application.

## Common mistakes

- Running load from the GUI or with View Results Tree enabled.
- Setting `-Xmx` larger than physical RAM, causing swapping.
- One CSV row for all users, so caches make results unrealistically fast.
- No warm-up, so cold-start times skew averages.
- Ignoring errors and reporting only averages.
- Load-testing third-party services or systems without written authorization.

## Troubleshooting

| Error or symptom | Likely cause | Fix |
|---|---|---|
| `java.lang.OutOfMemoryError: Java heap space` | Heavy listeners, saved responses, too many threads | Remove listeners, lean JTL, raise HEAP, distribute |
| `Non HTTP response code: org.apache.http.conn.HttpHostConnectException` / `Connection refused` | Nothing listening; wrong host/port; firewall | Check the app is up and the URL |
| `java.net.SocketException: Connection reset` | Server or proxy closed the connection under load | Check server limits, timeouts, load balancer logs |
| `java.net.SocketException: Too many open files` | OS file descriptor limit on the generator | Raise `ulimit -n` (Linux/macOS) |
| `java.net.BindException: Address already in use` | Ephemeral ports exhausted (TIME_WAIT) | Use keep-alive, widen the port range, add generators |
| `javax.net.ssl.SSLHandshakeException` / PKIX path errors | Untrusted or self-signed certificate, TLS version | Import the CA into the Java truststore or configure the JVM truststore |
| `java.io.FileNotFoundException` for CSV | Wrong or absolute path, wrong working directory | Use paths relative to the `.jmx` |
| Throughput flat, server idle | Load generator saturated or timers too long | Monitor the generator, review timers |

## A troubleshooting method

When something goes wrong, work from the outside in rather than guessing:

1. **Read the exact error.** In View Results Tree (while debugging) or the JTL `responseMessage` column, note whether there is an HTTP status code. "Non HTTP response code" means the request never got a proper HTTP answer, so look at network, DNS, TLS or the load generator.
2. **Check `jmeter.log`.** Script errors, missing classes, CSV problems and Backend Listener failures appear there with stack traces.
3. **Reproduce with one thread.** If one user fails, it is a script or environment problem. If only many users fail, it is a capacity or limit problem.
4. **Check the load generator.** CPU, memory, garbage collection, open files and sockets.
5. **Check the system under test.** Application logs, server metrics, database and load balancer.
6. **Change one thing at a time** and rerun the same test so results stay comparable.

Keep notes of each problem and its fix in the project repository. The same errors return whenever a new machine, environment or team member joins, and a short known-issues list saves hours.

## Key takeaways summary

Trustworthy results come from a lean load generator: non-GUI, minimal listeners, Groovy with caching, a right-sized heap and continuous monitoring of the generator itself. Read error messages carefully; most point straight at the layer that failed. Only load-test systems you own or are explicitly authorized to test.
