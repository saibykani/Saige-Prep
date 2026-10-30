---
slug: jmeter-scope-and-execution-order
title: Element scope and execution order
summary: Understand how the position of an element in the JMeter tree decides which samplers it affects, and the fixed order in which JMeter runs config elements, pre-processors, timers, samplers, post-processors, assertions and listeners, with hands-on experiments.
level: beginner
duration: 30
tags: [performance, jmeter, scoping, test-design]
objectives:
  - Predict which samplers an element affects from its position in the tree
  - State JMeter's execution order for elements in scope
  - Explain why timers and assertions placed at a parent level apply to every sampler
  - Debug misplaced elements using a Debug Sampler and View Results Tree
prerequisites:
  - "Config elements: defaults, headers, cookies and cache"
related: [jmeter-fundamentals, jmeter-config-elements, jmeter-logic-controllers, jmeter-timers-and-throughput-shaping]
references:
  - title: Apache JMeter - Elements of a Test Plan (Scoping Rules, Execution order)
    url: https://jmeter.apache.org/usermanual/test_plan.html
  - title: Apache JMeter - Component Reference
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: Explain JMeter's scoping rules.
    a: The test tree is hierarchical. Hierarchical elements such as config elements, pre-processors, post-processors, timers, assertions and listeners apply to all samplers at their level and below in the same branch. If placed as a child of a sampler, they apply only to that sampler. Logic controllers and samplers are ordered elements, executed in the order they appear.
  - q: Two Constant Timers of 1 second each are in scope of a sampler, one at Thread Group level and one under the sampler. How long is the delay before that sampler?
    a: About 2 seconds. All timers in scope run before the sampler and their delays are added together. A common surprise is that the Thread Group timer also delays every other sampler in the group.
  - q: In what order do pre-processors and post-processors run when there are several in scope?
    a: The overall order is config elements, pre-processors, timers, sampler, post-processors, assertions, listeners. Within the same type, elements at outer levels run before those closer to the sampler, and siblings run in tree order. Post-processors and assertions only run if a sample result exists.
practice:
  - "Build the walkthrough plan against localhost:8000 and predict the total delay per sampler before running. Measure it in View Results Tree timestamps."
  - "Move a Response Assertion from Thread Group level to under one sampler and observe which samples can now fail."
  - "Draw the execution order for a sampler that has a JSR223 PreProcessor, a Constant Timer, a JSON Extractor and a Response Assertion."
takeaways:
  - Position in the tree is scope; children of a sampler apply only to that sampler.
  - Elements at a parent level apply to every sampler beneath them.
  - Order is config, pre-processors, timers, sampler, post-processors, assertions, listeners.
  - Timers in scope add up, and always run before the sampler.
  - Samplers and controllers are ordered; other elements are hierarchical.
quiz:
  - id: jm-scope-q1
    type: single
    topic: jmeter-scope-and-execution-order
    difficulty: beginner
    prompt: A Response Assertion is placed directly under the Thread Group, which has three samplers. Which samplers does it check?
    options: ["Only the first sampler", "Only the last sampler", "All three samplers", "None, assertions must be under a sampler"]
    answer: [2]
    explanation: Assertions are hierarchical, so at Thread Group level they apply to every sampler in that scope. To check one sampler only, make the assertion its child.
  - id: jm-scope-q2
    type: single
    topic: jmeter-scope-and-execution-order
    difficulty: beginner
    prompt: Which element runs immediately before the sampler itself?
    options: ["Pre-Processors", "Timers", "Post-Processors", "Assertions"]
    answer: [1]
    explanation: The order is config, pre-processors, timers, sampler. Timers are last before the sampler so the delay sits right before the request. Pre-processors run earlier, before the timers.
  - id: jm-scope-q3
    type: code-output
    topic: jmeter-scope-and-execution-order
    difficulty: intermediate
    prompt: Roughly how long does each thread wait in timers during one iteration of this tree?
    code: "Thread Group\n  Constant Timer (500 ms)\n  HTTP Request A\n  HTTP Request B\n    Constant Timer (1000 ms)"
    codeLanguage: text
    options: ["1,500 ms", "2,000 ms", "500 ms", "1,000 ms"]
    answer: [1]
    explanation: Request A waits 500 ms. Request B waits 500 + 1000 = 1,500 ms because both timers are in its scope. Total 2,000 ms. 1,500 ms forgets that the group timer also applies to A.
  - id: jm-scope-q4
    type: truefalse
    topic: jmeter-scope-and-execution-order
    difficulty: intermediate
    prompt: Post-Processors and Assertions run even if no sample result was produced.
    options: ["True", "False"]
    answer: [1]
    explanation: The JMeter manual notes that post-processors and assertions are only executed if there is a sample result, since there is nothing to process or check otherwise.
---

## Beginner-friendly explanation

Think of a school. A rule announced in assembly ("no phones") applies to every class. A rule a teacher sets in their own classroom ("no talking during the test") applies only to that class. A note handed to one student applies only to that student. The JMeter tree works the same way: an element placed high up applies to everything below it; one placed under a single request applies only to that request. This is called **scope**.

**Execution order** is the daily routine that never changes: before each request JMeter first reads its settings, then does preparation, then waits, then sends the request, then extracts data, then checks the answer, then records it. You cannot reorder this by dragging elements; you can only change what is in scope.

## Technical explanation

JMeter has two kinds of elements:

| Kind | Elements | Behaviour |
|---|---|---|
| Ordered | Samplers, Logic Controllers | Run top to bottom in tree order |
| Hierarchical | Config elements, Pre-Processors, Timers, Post-Processors, Assertions, Listeners | Apply to samplers in their scope |

**Scoping rules.** A hierarchical element applies to every sampler at the same level and below in its branch. As a child of a sampler, it applies to that sampler only. Elements in a sibling branch, such as another controller, are out of scope.

**Execution order** for each sampler, per the JMeter manual:

```mermaid
flowchart TD
  A[1. Configuration elements] --> B[2. Pre-Processors]
  B --> C[3. Timers]
  C --> D[4. Sampler]
  D --> E[5. Post-Processors]
  E --> F[6. Assertions]
  F --> G[7. Listeners]
```

Notes:

- **Timers add up.** All timers in scope run before the sampler, and their delays are summed.
- **Outer before inner.** When several elements of one type are in scope, those at outer levels run before those closer to the sampler.
- **Post-Processors and Assertions need a result.** They run only if the sampler produced a sample.
- **Config elements differ slightly.** Some, like Header Managers, are merged; for HTTP Request Defaults, sampler values win. The User Defined Variables element is processed at the start of the test regardless of position.

## Step-by-step walkthrough

Start `python -m http.server 8000`. Build:

```text
Test Plan
└── Thread Group (1 thread, 1 loop)
    ├── HTTP Request Defaults (localhost, 8000)
    ├── Constant Timer: 1000 ms          ← applies to A and B
    ├── Response Assertion: code = 200   ← applies to A and B
    ├── HTTP Request A: GET /
    ├── HTTP Request B: GET /missing.html
    │   └── Constant Timer: 2000 ms      ← applies to B only
    └── View Results Tree
```

1. **Right-click Thread Group → Add → Timer → Constant Timer**, Thread Delay `1000`.
2. **Right-click Thread Group → Add → Assertions → Response Assertion**: Field to Test **Response Code**, Pattern Matching Rules **Equals**, Patterns to Test `200`.
3. Add the two HTTP Requests (path only).
4. **Right-click HTTP Request B → Add → Timer → Constant Timer**, `2000`.
5. Add View Results Tree, Start, and compare each sample's **Sample Start** time in the Sampler result tab.
6. Now drag the Response Assertion onto HTTP Request A and choose **Add as Child**. Run again.

## Expected output

Illustrative timings for the first run:

| Sample | Delay before it | Result |
|---|---|---|
| A: GET / | about 1 s | Pass |
| B: GET /missing.html | about 3 s (1 s + 2 s) | Fail: 404 and assertion failure |

After step 6, B still fails (404 is an error code by default) but now without an assertion message, because the assertion only checks A.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Whole test far slower than expected | Timer at a high level delays every sampler | Move the timer under the sampler(s) it is meant for |
| Extractor variable empty in the next request | Extractor in the wrong branch or under a different sampler | Make it a child of the sampler whose response holds the value |
| Assertion failing on unrelated requests | Assertion at Thread Group level | Move it under the specific sampler |
| A config element seems ignored | Placed in a sibling controller | Move it up to a common parent |
| Unsure what ran | Hard to see | Add a Debug Sampler to view variables at that point |

## Real-world example

A tester adds a "think time" timer at the Thread Group level to simulate users pausing. Later they add a transaction with eight samplers, including image and API calls that a browser fires in parallel, and the test shows unrealistically low throughput: every sampler waits. Moving the timer to a single sampler at the start of each user action fixes the pacing. Understanding scope turned a confusing result into a one-minute fix.

A helpful habit is to read your tree from the sampler's point of view. Pick a sampler and walk upwards to the Test Plan, listing every config element, pre-processor, timer, post-processor, assertion and listener you pass at each level, including siblings at those levels. That list is exactly what applies to this sampler, and the execution order tells you when each one runs. If an element you expected is not on the list, it is in the wrong place.

## Common mistakes

- **Thinking tree order changes execution order** for hierarchical elements. A timer placed after a sampler still runs before it.
- **Placing extractors at Thread Group level**, so they run against every response and overwrite variables.
- **Forgetting that timers add up.**
- **Putting listeners inside one controller** and wondering why other samples are missing.
- **Running experiments against systems you do not own.** Use your local server.

## Key takeaways summary

Where you put an element decides what it affects; what kind of element it is decides when it runs. Remember the sequence config, pre-processors, timers, sampler, post-processors, assertions, listeners, and keep element placement as close as possible to the samplers they are meant for. Next: steering flow with [logic controllers](/learn/jmeter/jmeter-logic-controllers).
