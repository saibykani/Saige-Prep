---
slug: jmeter-logic-controllers
title: "Logic controllers: transactions, loops and conditions"
summary: Control the flow of a JMeter test with Simple, Loop, Transaction, If, While, Once Only, Throughput, Random, Module and Include controllers, including Generate parent sample and __jexl3 and __groovy conditions, with a local hands-on example.
level: beginner
duration: 40
tags: [performance, jmeter, controllers, test-design]
objectives:
  - Group samplers into business transactions with the Transaction Controller
  - Repeat and condition steps with Loop, While and If Controllers
  - Run steps once or for a share of iterations with Once Only and Throughput Controllers
  - Reuse fragments with Module and Include Controllers
prerequisites:
  - Element scope and execution order
related: [jmeter-scope-and-execution-order, jmeter-thread-groups, jmeter-functions, jmeter-workload-design]
references:
  - title: Apache JMeter - Component Reference (Logic Controllers)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter - Elements of a Test Plan
    url: https://jmeter.apache.org/usermanual/test_plan.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: What is a Transaction Controller and what does Generate parent sample do?
    a: It groups several samplers into one named business transaction, such as Login, and records an extra sample with the total time of its children. With Generate parent sample ticked, the children become sub-samples of one parent sample, so reports show only the transaction. Unticked, reports show both the transaction and each child. Include duration of timer and pre-post processors controls whether timers count toward the time.
  - q: Why is __jexl3 or __groovy recommended in the If Controller?
    a: With Interpret Condition as Variable Expression ticked, which is the default, the If Controller just checks whether the expression evaluates to true, and using __jexl3 or __groovy is efficient. The older JavaScript interpretation mode is slower and the JMeter docs advise against it for performance.
  - q: How would you make 10% of users perform checkout and 90% only browse?
    a: Use a Throughput Controller set to Percent Executions with 10 around the checkout steps, with Per User unticked so the percentage applies across all executions. For more precise mixes I would use separate Thread Groups sized to the workload model.
  - q: What does a Once Only Controller do inside a looping Thread Group?
    a: Its children run only on the first iteration of each thread, which suits login. Subsequent iterations skip it. If placed inside a Loop Controller, it also runs only once per thread.
practice:
  - "Wrap two GET requests to localhost:8000 in a Transaction Controller named Browse. Run once with Generate parent sample ticked and once unticked, and compare Summary Report labels."
  - "Add an If Controller with ${__jexl3(${__Random(1,2)} == 1)} around one request and confirm it runs on about half the iterations."
  - "Put a 'Login' request in a Once Only Controller with Loop Count 5 and verify it appears once per thread."
takeaways:
  - Controllers decide order, repetition and conditions; they never send requests themselves.
  - Transaction Controller measures business steps; Generate parent sample hides child rows.
  - Use __jexl3 or __groovy in If and While conditions.
  - Once Only suits login; Throughput Controller splits traffic; Random picks one child.
  - Module and Include Controllers let you reuse fragments instead of copy-pasting.
quiz:
  - id: jm-ctrl-q1
    type: single
    topic: jmeter-logic-controllers
    difficulty: beginner
    prompt: You want the Summary Report to show one row called Login that covers three requests. Which controller do you use?
    options: ["Simple Controller", "Transaction Controller", "Random Controller", "Loop Controller"]
    answer: [1]
    explanation: The Transaction Controller produces a sample with the combined time of its children. A Simple Controller only groups elements visually and produces no timing sample of its own.
  - id: jm-ctrl-q2
    type: single
    topic: jmeter-logic-controllers
    difficulty: beginner
    prompt: Inside a Thread Group with Loop Count 10, which controller makes a Login request run only once per user?
    options: ["Once Only Controller", "While Controller", "Throughput Controller", "Interleave Controller"]
    answer: [0]
    explanation: Once Only runs its children on the first iteration of each thread only. A While Controller repeats while a condition holds, which is the opposite intent.
  - id: jm-ctrl-q3
    type: debugging
    topic: jmeter-logic-controllers
    difficulty: intermediate
    prompt: An If Controller has the condition ${status} == "ok" with Interpret Condition as Variable Expression ticked, and its children never run even when status is ok. What is the fix?
    options: ['Use ${__jexl3("${status}" == "ok")} so the expression evaluates to true', "Untick Use KeepAlive", "Increase the number of threads", "Move the If Controller to the Test Plan"]
    answer: [0]
    explanation: In variable-expression mode the controller only checks whether the text equals true. A raw comparison is never the word true, so it must be evaluated with __jexl3 or __groovy. Threads and KeepAlive are unrelated.
  - id: jm-ctrl-q4
    type: truefalse
    topic: jmeter-logic-controllers
    difficulty: beginner
    prompt: A Random Controller runs exactly one of its child elements each time it is executed.
    options: ["True", "False"]
    answer: [0]
    explanation: The Random Controller picks one child at random per pass, unlike the Simple Controller, which runs all children in order.
---

## Beginner-friendly explanation

If samplers are individual actions ("open home page", "click product"), **logic controllers** are the instructions that arrange them: "do these three as one step called Login", "repeat this five times", "only do this if the basket is not empty", "do this just once", "one in ten users goes to checkout". They are like the "if", "repeat" and "group" blocks in a children's coding game. Controllers never send requests themselves; they decide which children run, how often and in what order.

## Technical explanation

Add with **right-click Thread Group (or another controller) → Add → Logic Controller → ...**.

| Controller | What it does | Key settings |
|---|---|---|
| Simple | Groups children for organisation; runs them in order | none |
| Loop | Repeats children N times (in addition to Thread Group loops) | Loop Count, Infinite |
| Transaction | Measures total time of its children as one named sample | Generate parent sample; Include duration of timer and pre-post processors in generated sample |
| If | Runs children only if the condition is true | Condition; Interpret Condition as Variable Expression; Evaluate for all children |
| While | Repeats children while the condition is true | Condition (blank = until a sampler fails; LAST = until last sample fails) |
| Once Only | Runs children on the first iteration of each thread only | none |
| Throughput | Runs children for a share of executions | Total Executions or Percent Executions; Per User |
| Random | Runs one randomly chosen child per pass | Ignore sub-controller blocks |
| Module | Runs another controller in the plan (often in a Test Fragment) | Module to run |
| Include | Loads a Test Fragment from another `.jmx` file | Filename |

**Transaction Controller details.** Without **Generate parent sample**, reports show each child row plus a transaction row. With it ticked, children become sub-samples and only the transaction row appears in reports (View Results Tree still lets you expand children). By default timer and processor time is **excluded**; tick the include option to count it.

**If and While conditions.** With **Interpret Condition as Variable Expression** ticked (the default), the condition must evaluate to the text `true`, so write it with a function:

```text
${__jexl3("${status}" == "ok")}
${__groovy(vars.get("count").toInteger() < 3)}
```

The legacy JavaScript mode (unticked) works but is slower, and the manual recommends `__jexl3` or `__groovy`. Learn more in [JMeter functions](/learn/jmeter/jmeter-functions).

```mermaid
flowchart TD
  TG[Thread Group, 5 loops] --> O[Once Only: Login]
  TG --> T[Transaction: Browse]
  T --> H[GET /]
  T --> A[GET /about.html]
  TG --> I{If: random == 1}
  I -- true --> X[GET /extra.html]
  TG --> TC[Throughput 20%: GET /report.html]
```

## Step-by-step walkthrough

1. In a folder with `index.html`, `about.html`, `extra.html` and `report.html`, run `python -m http.server 8000`.
2. Thread Group: 2 threads, Loop Count 5. Add HTTP Request Defaults for `localhost:8000`.
3. **Add → Logic Controller → Once Only Controller**, name `Login once`; inside add HTTP Request `Login (simulated)` with path `/`.
4. **Add → Logic Controller → Transaction Controller**, name `Browse`. Inside add `GET home` (`/`) and `GET about` (`/about.html`). Tick **Generate parent sample**.
5. **Add → Logic Controller → If Controller**, condition `${__jexl3(${__Random(1,2)} == 1)}`. Inside add `GET extra` (`/extra.html`).
6. **Add → Logic Controller → Throughput Controller**: Percent Executions, Throughput `20`, Per User unticked. Inside add `GET report` (`/report.html`).
7. Add **Summary Report** and **View Results Tree**. Start.

## Expected output

Illustrative Summary Report (counts for random parts will vary):

| Label | # Samples | Notes |
|---|---|---|
| Login (simulated) | 2 | Once per thread |
| Browse | 10 | 2 threads × 5 loops; children hidden |
| GET extra | about 5 | Roughly half the iterations |
| GET report | 2 | 20% of 10 executions |

Untick Generate parent sample and rerun: `GET home` and `GET about` now appear as separate rows alongside `Browse`.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| If Controller never runs children | Raw comparison in variable-expression mode | Wrap in `__jexl3` or `__groovy` |
| While Controller loops forever | Condition never becomes false | Update the variable inside the loop, or add a counter limit |
| Transaction time looks too long | Timers included | Untick include-duration option, or keep it consistently |
| Children rows missing from reports | Generate parent sample ticked | Untick it if you need per-request rows |
| Module Controller shows nothing to choose | No controller or Test Fragment to target | Add a Test Fragment containing a controller |

## Real-world example

A team scripting a user journey for its own shopping app in staging uses a Once Only Controller for login, Transaction Controllers named after business steps (Search, View product, Add to basket, Checkout) so reports match the language of the requirements, an If Controller to skip checkout when the basket is empty, and a Throughput Controller so only a fraction of iterations check out. Shared steps live in a Test Fragment reused via Module Controllers.

Two more controllers appear in the Add menu that are worth recognising. The **Interleave Controller** runs one child per pass, in turn, so successive iterations alternate between children. The **Runtime Controller** runs its children for a set number of seconds. And a **Test Fragment** (added via right-click Test Plan → Add → Test Fragment) is a container that never runs by itself; it only runs when a Module or Include Controller calls it.

## Common mistakes

- **Using Simple Controller and expecting timings.** Use a Transaction Controller.
- **Nested Transaction Controllers with parent samples**, producing confusing double counting.
- **Slow JavaScript conditions** at high load.
- **Infinite While loops.**
- **Using Throughput Controller as a precise workload model**; for exact mixes consider separate Thread Groups, see [workload design](/learn/jmeter/jmeter-workload-design).
- **Pointing practice runs at systems you do not own.**

## Key takeaways summary

Controllers shape the journey: group with Simple, measure with Transaction, repeat with Loop and While, branch with If, run once with Once Only, split traffic with Throughput and Random, and reuse with Module and Include. Write conditions with `__jexl3` or `__groovy`, and name transactions after business steps.
