---
slug: jmeter-variables-and-properties
title: Variables, Properties and User Defined Variables in JMeter
summary: Stop hard-coding hosts, users and durations. Learn the ${var} syntax, User Defined Variables, per-thread variable scope, and JMeter properties set with -J, user.properties and the __P function.
level: beginner
duration: 35
tags: [performance, jmeter, variables, properties]
objectives:
  - Reference a value anywhere in a test plan with the ${name} syntax
  - Define constants with User Defined Variables and explain when they are evaluated
  - Explain that variables are local to each thread while properties are shared by the whole JMeter process
  - Override test settings from the command line with -J and read them with __P
prerequisites:
  - JMeter fundamentals
  - A JMeter test plan with at least one HTTP Request
related: [jmeter-functions, jmeter-csv-data-set-config, jmeter-non-gui-and-distributed, jmeter-scope-and-execution-order, jmeter-correlation-and-parameterization]
references:
  - title: Apache JMeter User Manual - Functions and Variables
    url: https://jmeter.apache.org/usermanual/functions.html
  - title: Apache JMeter - Component Reference (User Defined Variables)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: What is the difference between a JMeter variable and a JMeter property?
    a: "A variable is local to one thread: each virtual user has its own copy, so an extracted token for user 1 never leaks to user 2. A property is global to the JMeter process and shared by all threads and thread groups. Properties are set at startup from jmeter.properties, user.properties or -J on the command line, and read with __P or __property. I use properties for run settings like host, users and duration, and variables for per-user data."
  - q: How would you run the same test plan against different environments without editing it?
    a: "I put fields like host, threads and duration behind properties with defaults, for example ${__P(host,localhost)} and ${__P(threads,1)}. Then CI runs jmeter -n -t plan.jmx -Jhost=test-server -Jthreads=50. The .jmx file stays the same and the defaults keep it runnable in the GUI."
  - q: Why can't a value extracted in one thread be used by another thread through a variable?
    a: "Because each thread has its own variable map. To share a value across threads you must deliberately copy it into a property, for example with __setProperty or props.put in Groovy, and read it with __P. That is rarely needed and must be done carefully because all threads see the same value."
practice:
  - "Create User Defined Variables HOST=localhost and PORT=3000 and use them in HTTP Request Defaults. Change PORT in one place and confirm all samplers follow."
  - "Replace the Thread Group's number of threads with ${__P(users,2)} and run once in the GUI and once with -Jusers=5 in non-GUI mode. Compare the thread counts in the results."
  - "Add a Debug Sampler with JMeter variables and JMeter properties set to true, run with 2 threads and inspect the output for each thread in View Results Tree."
takeaways:
  - "${name} inserts a variable or function result into any text field."
  - User Defined Variables hold constants and are processed once at the start of the test, not per iteration.
  - Variables are per thread; properties are global to the JMeter process.
  - Use -Jname=value and ${__P(name,default)} to change settings without editing the .jmx file.
  - A missing variable is left as the literal text ${name}, which is a common sign of a typo or scope problem.
quiz:
  - id: jm-var-q1
    type: single
    topic: jmeter-variables-and-properties
    difficulty: beginner
    prompt: Which syntax inserts the value of a variable named host into an HTTP Request's Server Name field?
    options: ["$host", "{host}", "${host}", "%host%"]
    answer: [2]
    explanation: JMeter uses ${name} for variables and functions. %host% is Windows environment variable syntax and is not expanded by JMeter.
  - id: jm-var-q2
    type: truefalse
    topic: jmeter-variables-and-properties
    difficulty: beginner
    prompt: If thread 1 extracts a token into the variable token, thread 2 can read the same value through ${token}.
    options: ["True", "False"]
    answer: [1]
    explanation: Variables are local to each thread, so thread 2 has its own token variable (or none). Sharing across threads requires a property.
  - id: jm-var-q3
    type: code-output
    topic: jmeter-variables-and-properties
    difficulty: intermediate
    prompt: The Thread Group's Number of Threads field contains the text below. The test is started with jmeter -n -t plan.jmx -Jusers=20. How many threads start?
    code: "${__P(users,5)}"
    codeLanguage: text
    options: ["5", "20", "25", "0, because the field is not numeric"]
    answer: [1]
    explanation: __P reads the property users, which -J set to 20. The default 5 is only used when the property is not defined, such as in a GUI run without -J.
  - id: jm-var-q4
    type: debugging
    topic: jmeter-variables-and-properties
    difficulty: intermediate
    prompt: A request is sent to the literal path /users/${userId}. What does this tell you?
    options: ["The server rejected the variable", "The variable userId was not defined in that thread at that moment", "JMeter does not support variables in paths", "The property file is corrupted"]
    answer: [1]
    explanation: When a variable does not exist, JMeter leaves the reference text unchanged. Typical causes are a typo, a case mismatch, or an extractor that runs after the sampler or in another scope. Variables do work in paths.
  - id: jm-var-q5
    type: multiple
    topic: jmeter-variables-and-properties
    difficulty: intermediate
    prompt: Which are valid ways to set a JMeter property? Select all that apply.
    options: ["-Jname=value on the command line", "A line name=value in bin/user.properties", "A User Defined Variables row", "A -q file passed on the command line containing name=value"]
    answer: [0, 1, 3]
    explanation: -J, user.properties and an additional property file given with -q all set properties. User Defined Variables create variables, not properties.
---

## Beginner-friendly explanation

Think of a recipe card that says "bake at **OVEN_TEMP**". You can write the real number on a sticky note once, and every step that mentions OVEN_TEMP uses it. Change the sticky note, and the whole recipe changes.

In JMeter that placeholder is a **variable**: a named value you reference with `${name}`. Instead of typing `localhost` into twenty samplers, you type `${host}` and define `host` once.

There is a second, similar idea called a **property**. A variable is like a note in each cook's own pocket: every cook (each **thread**, which is one virtual user) has a private copy. A property is like a notice pinned on the kitchen wall: one value everyone shares, usually set before cooking starts.

## Technical explanation

**Variables**

- Referenced as `${name}`. Names are case-sensitive.
- Created by User Defined Variables, CSV Data Set Config, extractors (JSON, Regular Expression, Boundary), scripts (`vars.put` in Groovy) and some functions.
- **Local to each thread.** Thread 3's `${token}` is independent of thread 4's.
- If undefined, the text `${name}` is sent unchanged.

**User Defined Variables (UDV)** is a config element (**Add → Config Element → User Defined Variables**, or the table on the Test Plan itself). It is processed **once at the start**, regardless of where it sits, so it is meant for constants. Do not expect a UDV containing `${__Random(1,9)}` to give a fresh value each iteration.

**Properties**

- Global to the JMeter process (all threads and thread groups).
- Defined in `bin/jmeter.properties` (defaults, do not edit), `bin/user.properties` (your overrides), with `-Jname=value` on the command line, or with `-q extra.properties`. Remote servers in distributed mode use `-Gname=value`.
- Read with `${__P(name,default)}` or `${__property(name,,default)}`.

| | Variable | Property |
|---|---|---|
| Scope | One thread | Whole JMeter process |
| Syntax to read | `${name}` | `${__P(name,default)}` |
| Typical source | UDV, CSV, extractor | `-J`, user.properties |
| Typical use | Per-user data, tokens | Host, users, duration, environment |

```mermaid
flowchart TD
  CLI["Command line: -Jhost=localhost -Jusers=10"] --> P["Properties (shared)"]
  UP["bin/user.properties"] --> P
  P -->|"__P(users,1)"| TG["Thread Group: threads"]
  P -->|"__P(host,localhost)"| UDV["User Defined Variables: HOST"]
  UDV --> T1["Thread 1 variables: HOST, token=abc"]
  UDV --> T2["Thread 2 variables: HOST, token=xyz"]
```

A common, clean pattern combines both: a UDV row `HOST` = `${__P(host,localhost)}`. Samplers use `${HOST}`, and the run can override it with `-Jhost=...`.

## Step-by-step walkthrough

Practice target: a REST app you run yourself on `localhost:3000`. (Only test systems you own or are authorised in writing to test.)

1. Select **Test Plan**, right-click → **Add → Config Element → User Defined Variables**. Add rows:

| Name | Value |
|---|---|
| HOST | `${__P(host,localhost)}` |
| PORT | `${__P(port,3000)}` |
| THINK_MS | `1000` |

2. Add **Config Element → HTTP Request Defaults**: Server Name `${HOST}`, Port Number `${PORT}`.
3. In the Thread Group set **Number of Threads** to `${__P(users,1)}`, **Ramp-up** to `${__P(rampup,1)}` and **Loop Count** to `${__P(loops,1)}`.
4. Add an HTTP Request with Path `/health` (leave server blank; it inherits defaults).
5. Add **Sampler → Debug Sampler** with "JMeter properties" set to True, and a **View Results Tree** listener.
6. Run in the GUI (green Start button). Then from a terminal in JMeter's `bin` folder:

```bash
jmeter -n -t vars-demo.jmx -Jusers=3 -Jloops=2 -Jport=3000 -l vars.jtl
```

## Code examples

Reading and writing from Groovy (see [Groovy and JSR223](/learn/jmeter/jmeter-groovy-jsr223)):

```groovy
// per-thread variable
vars.put("orderId", "A-" + vars.get("__jm__Thread Group__idx"))
// global property (shared by all threads, use sparingly)
props.put("lastRunHost", vars.get("HOST"))
log.info("users property = " + props.get("users"))
```

## Expected output

Illustrative Debug Sampler response data (trimmed) for a run with `-Jusers=3`:

```text
JMeterVariables:
HOST=localhost
PORT=3000
THINK_MS=1000
...
JMeterProperties:
users=3
loops=2
```

The summary at the end of the non-GUI run shows 6 samples for `/health` (3 users × 2 loops), plus the Debug Sampler's own samples.

## Real-world example

A team keeps one test plan for its internal order service. Developers run it in the GUI with defaults (1 user, localhost). The CI pipeline runs the same file with `-Jhost=perf-env -Jusers=40 -Jduration=900`. Because every environment-specific value goes through `__P`, nobody edits the `.jmx` per environment, and code review only sees real script changes.

## Common mistakes

- **Expecting UDV to re-evaluate** each iteration. It is processed once; use functions directly in the sampler or a User Parameters pre-processor instead.
- **Using variables to share data between threads.** Variables are per thread.
- **Typos and case:** `${Host}` and `${HOST}` are different.
- **Editing jmeter.properties** instead of user.properties, so an upgrade wipes your changes.
- **No default in __P**, so a GUI run gets an empty value and fails.

## Troubleshooting

- **Literal `${name}` in the request:** check spelling, check the element that creates it runs earlier and is in scope (see [Scope and execution order](/learn/jmeter/jmeter-scope-and-execution-order)).
- **-J value ignored:** you probably used `${name}` instead of `${__P(name)}`; -J sets properties, not variables.
- **Distributed run uses wrong value:** `-J` only sets the controller; use `-G` for remote engines.

## Choosing between them: a quick decision guide

Ask two questions about any value in your plan.

1. **Does it change per virtual user or per iteration?** Usernames, tokens, order ids and cart contents differ between users, so they must be **variables**. They come from CSV files, extractors or functions.
2. **Does it change per run or per environment?** Host name, port, number of users, ramp-up, duration and think-time multipliers are the same for every user in one run, but differ between a laptop run and a CI run. Make them **properties** with sensible defaults, then copy them into variables through User Defined Variables if you like the shorter `${HOST}` syntax.

| Value | Per user? | Per run? | Recommended |
|---|---|---|---|
| Server host | No | Yes | Property via `__P`, copied into UDV |
| Number of threads | No | Yes | `${__P(users,1)}` in the Thread Group |
| Login username | Yes | No | Variable from CSV Data Set Config |
| Access token | Yes | No | Variable from JSON Extractor |
| Fixed API version string | No | No | Plain UDV constant |

Following this rule keeps the test plan readable for the next person: anything that looks like `${__P(...)}` is a knob you can turn from the command line, and anything that looks like `${name}` comes from somewhere inside the plan.

## Key takeaways summary

`${name}` connects every field to a single source of truth. Variables belong to one thread and carry per-user data; properties belong to the process and carry run settings. Combine them with `${__P(name,default)}` so one test plan runs anywhere without edits.
