---
slug: what-is-jmeter
title: What is Apache JMeter (and what it is not)
summary: A from-zero introduction to Apache JMeter, the open-source load testing tool, covering what performance testing is, how JMeter simulates many users, what it can and cannot do, and where it fits in a tester's toolkit.
level: beginner
duration: 20
tags: [performance, jmeter, load-testing, tools]
objectives:
  - Explain in plain words what performance and load testing are
  - Describe how JMeter simulates many users with threads and samplers
  - List what JMeter is good at and what it is not designed to do
  - State the ethical rule about which systems you may load-test
prerequisites:
  - Basic idea of what a website and a web server are
related: [installing-jmeter, jmeter-gui-tour, jmeter-fundamentals, jmeter-thread-groups]
references:
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: Apache JMeter - Getting Started
    url: https://jmeter.apache.org/usermanual/get-started.html
  - title: Apache JMeter - Elements of a Test Plan
    url: https://jmeter.apache.org/usermanual/test_plan.html
interview:
  - q: What is Apache JMeter and what is it typically used for?
    a: JMeter is an open-source, Java-based tool from the Apache Software Foundation for load and performance testing. It simulates many concurrent users by running threads that send requests, mostly HTTP, to a system under test and records response times, throughput and errors. Teams use it to check that an application meets its performance goals before release and to find the load at which it degrades.
  - q: Is JMeter a browser? Does it execute JavaScript on the page?
    a: No. JMeter works at the protocol level. It sends HTTP requests and receives responses, but it does not render HTML or run JavaScript the way a browser does. So it measures server-side response times, not how long a page takes to paint in a real browser. For browser-side timing you would use tools focused on front-end performance.
  - q: Why is GUI mode not used to run the real load test?
    a: The GUI itself consumes CPU and memory on the load generator machine, and live listeners make it worse. That can turn JMeter into the bottleneck and distort the numbers. The official guidance is to build and debug in the GUI and run the load test in non-GUI command-line mode.
practice:
  - "In your own words, write three sentences explaining the difference between functional testing and load testing."
  - "List three questions a product owner might ask that a load test could answer, for example how many users checkout can handle."
  - "Write down one system you own (for example a local Python server) that you could safely use for JMeter practice, and one you must never test without permission."
takeaways:
  - JMeter is a free, open-source, Java-based load testing tool.
  - It simulates users with threads that send protocol-level requests and records timings.
  - It is not a browser, so it does not run JavaScript or measure page rendering.
  - Build and debug in the GUI; run real load in non-GUI mode.
  - Only load-test systems you own or have written permission to test.
quiz:
  - id: jm-what-q1
    type: single
    topic: what-is-jmeter
    difficulty: beginner
    prompt: What does a "thread" represent in a JMeter test?
    options: ["A single HTTP request", "One simulated user running the test steps", "A results file", "A server process on the system under test"]
    answer: [1]
    explanation: Each JMeter thread behaves like one virtual user working through the steps in its Thread Group. A single request is a sample, not a thread, and threads run on the load generator, not on the server.
  - id: jm-what-q2
    type: truefalse
    topic: what-is-jmeter
    difficulty: beginner
    prompt: JMeter executes the JavaScript on a web page just like Chrome or Firefox does.
    options: ["True", "False"]
    answer: [1]
    explanation: JMeter is a protocol-level tool. It sends requests and reads responses but does not render pages or run JavaScript. It can be tempting to think of it as a browser because it downloads HTML, but it never executes scripts in it.
  - id: jm-what-q3
    type: multiple
    topic: what-is-jmeter
    difficulty: beginner
    prompt: Which tasks is JMeter well suited for? Select all that apply.
    options: ["Sending many concurrent HTTP requests to a web API", "Measuring response times and error rates under load", "Checking that a button is the right colour", "Load testing a database through JDBC"]
    answer: [0, 1, 3]
    explanation: JMeter generates load over protocols such as HTTP and JDBC and measures timings and errors. Visual checks like button colour need a UI or visual testing tool because JMeter never renders the page.
  - id: jm-what-q4
    type: scenario
    topic: what-is-jmeter
    difficulty: beginner
    prompt: You just learned JMeter and want to practise. Which target is acceptable?
    options: ["A popular shopping website, because it can handle the traffic", "Your company's production site, without asking", "A local server you started yourself with python -m http.server 8000", "A friend's blog, because they will not notice"]
    answer: [2]
    explanation: Load testing sends a lot of traffic and can harm a service, so you may only test systems you own or have written permission to test. A local server on your own machine is safe. Assuming a big site can cope does not make unauthorized testing acceptable.
---

## Beginner-friendly explanation

Imagine you open a small café. One customer at a time is easy: you take the order, make the coffee, hand it over. But what happens at 8 a.m. when forty people walk in at once? Does the queue move? Does the coffee machine overheat? Does the till crash? You would love to find out **before** opening day, by hiring forty pretend customers to rush in on purpose.

That is what **Apache JMeter** does for software. It is a program that pretends to be many users at once. Each pretend user sends requests to a website or API, just like a real person clicking around, and JMeter writes down how long every answer took and whether it was correct. Afterwards you can say things like "with 50 users, the login page answers in under a second, but at 200 users it starts failing".

This kind of testing has a name: **performance testing**. It asks "is the system fast and stable enough?", not "does the button work?". **Load testing** is one type of performance testing where you apply an expected amount of traffic and check the system copes.

## Technical explanation

Some terms you will meet in every JMeter lesson:

| Term | Plain meaning |
|---|---|
| System under test (SUT) | The application you are testing, for example a web server |
| Load generator | The machine running JMeter that produces the traffic |
| Thread (virtual user) | One simulated user; JMeter runs many in parallel |
| Sampler | An element that sends one request, such as **HTTP Request** |
| Sample | The record of one request: time taken, size, success or failure |
| Response time | Time from sending a request until the full response arrives |
| Throughput | How many requests the system completes per second |
| Listener | An element that collects and displays results |

JMeter is an open-source project of the Apache Software Foundation, written in Java. That is why you need Java installed to run it. You build a **Test Plan**, a tree of elements saved as a `.jmx` file (an XML document). The plan contains **Thread Groups** that define how many users to simulate, and inside them **samplers** that describe the requests.

JMeter works at the **protocol level**. For a web page, it sends the HTTP request and receives the HTML bytes. It can optionally download embedded resources such as images and CSS, but it does not lay out the page or run JavaScript. This makes it efficient: one machine can simulate many more users than if it had to run real browsers.

Besides HTTP and HTTPS, JMeter supports other protocols out of the box, such as JDBC (databases), JMS (messaging), FTP, LDAP, SMTP and TCP. Its capabilities can be extended with plugins and with scripting in Groovy.

```mermaid
flowchart LR
  A[JMeter on your laptop] -->|threads send requests| B[System under test]
  B -->|responses| A
  A --> C[Results: response times, errors, throughput]
```

### What JMeter is not

| JMeter is not... | Because... |
|---|---|
| A browser | It does not render HTML or execute JavaScript |
| A functional UI test tool | Tools like Selenium or Playwright drive real browsers for that |
| A monitoring system | It measures the client side; you still need server metrics (CPU, memory) |
| Magic | A badly designed test produces misleading numbers |

JMeter has two ways of running. **GUI mode** (graphical user interface) is a window where you build and debug test plans. **Non-GUI mode** (also called CLI mode) runs a saved plan from the command line without a window. The JMeter documentation is clear: use the GUI to create and debug, and non-GUI mode to run actual load, because the GUI consumes resources that should go into generating load.

## Real-world example

A team building an online booking app expects about 300 people to search for appointments during a busy hour. Before launch, a tester builds a JMeter plan in which each virtual user opens the home page, searches for a date and views results. They run it in a test environment that mirrors production, ramping up to 300 users. The results show that search stays fast but the "view results" step slows down sharply above 200 users. Developers find an unindexed database query, fix it, and the tester reruns the same plan to confirm the improvement. Nobody touched the real production system, and the test environment belonged to the team.

## Step-by-step walkthrough

You will not build anything yet; this is a map of the journey ahead.

1. **Install Java and JMeter** on your own machine (next lesson: [Installing JMeter](/learn/jmeter/installing-jmeter)).
2. **Start a practice server you own.** Throughout this track we use Python's built-in server: open a terminal in an empty folder and run `python -m http.server 8000`. It serves files at `http://localhost:8000`.
3. **Explore the GUI** ([GUI tour](/learn/jmeter/jmeter-gui-tour)).
4. **Build a first plan**: a Thread Group, an HTTP Request to `localhost:8000` and a listener ([JMeter fundamentals](/learn/jmeter/jmeter-fundamentals)).
5. **Learn the building blocks** one by one, starting with [Thread Groups](/learn/jmeter/jmeter-thread-groups).

## Expected output

When you eventually run a small test against your local server, a results table might look like this (illustrative numbers only, yours will differ):

| Label | # Samples | Average (ms) | Error % | Throughput |
|---|---|---|---|---|
| Home page | 100 | 4 | 0.00% | 48.2/sec |

Do not read too much into tiny local tests: your laptop is both the client and the server, so the numbers mostly reflect your machine.

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| You expected JMeter to show the page visually | JMeter is not a browser | Use the View Results Tree listener to read the raw response |
| Numbers vary wildly between runs | Small tests on a busy laptop | Close other programs, run longer, compare trends not single runs |
| "Is it allowed to test site X?" | Unclear ownership | If you do not own it and have no written permission, do not test it |

## Common mistakes

- **Testing websites you do not own.** Sending load to third-party systems without written authorization can disrupt real users and may be illegal. Practise against your own local server.
- **Treating JMeter like Selenium.** JMeter will not click buttons or run scripts on a page.
- **Running big tests in the GUI.** The GUI slows down the load generator and skews results.
- **Reading one number in isolation.** An average response time without error rate and throughput tells an incomplete story.
- **Forgetting the server side.** JMeter tells you something got slow; server monitoring tells you why.

## Key takeaways summary

JMeter is a free, Java-based, protocol-level load testing tool. It simulates users with threads, sends requests with samplers and records results with listeners. It is not a browser and not a monitoring tool. Build in the GUI, run in non-GUI mode, and only ever test systems you own or are authorized to test.
