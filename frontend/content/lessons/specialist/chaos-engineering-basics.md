---
slug: chaos-engineering-basics
title: Chaos Engineering Basics
summary: Learn how chaos engineering builds confidence in a system by running controlled experiments that inject failures, such as killed instances or added latency, with a steady-state hypothesis, a small blast radius and a way to stop.
level: intermediate
duration: 35
tags: [chaos-engineering, resilience, reliability, sre, distributed-systems]
objectives:
  - Explain the principles of chaos engineering and how it differs from ordinary testing
  - Define a steady state and write a falsifiable hypothesis
  - Design an experiment with a limited blast radius and abort conditions
  - Interpret results and turn weaknesses into fixes and regression checks
prerequisites:
  - Microservices and event-driven testing
  - Recovery, reliability and availability testing
related: [microservices-testing, recovery-reliability-availability-testing, monitoring-with-influxdb-grafana, performance-testing-types, idempotency-retries-rate-limiting]
references:
  - title: Principles of Chaos Engineering
    url: https://principlesofchaos.org/
  - title: Google SRE books
    url: https://sre.google/books/
  - title: Chaos Mesh documentation
    url: https://chaos-mesh.org/docs/
  - title: LitmusChaos documentation
    url: https://docs.litmuschaos.io/
  - title: AWS Fault Injection Service documentation
    url: https://docs.aws.amazon.com/fis/
interview:
  - q: What is chaos engineering?
    a: It is the discipline of experimenting on a system to build confidence in its ability to withstand turbulent conditions in production, as defined by the Principles of Chaos Engineering. In practice you define the system's steady state with business metrics, hypothesise that it will stay steady when you inject a realistic failure, run the experiment with a small blast radius and a way to stop, and then look for differences between the control and the experiment.
  - q: How is chaos engineering different from normal failure testing?
    a: Failure testing usually checks a known expectation, for example that a retry happens after one timeout. Chaos engineering is an experiment to learn something new about the whole system's behaviour under realistic turbulence, often in production or production-like environments, measured by steady-state business metrics rather than one assertion. They overlap, and good chaos findings become regular automated tests.
  - q: How do you keep a chaos experiment safe?
    a: Get approval from the system owners, start in a test environment, minimise the blast radius to a small percentage of traffic or one instance, run during working hours with the team watching, define abort conditions based on monitoring such as error rate thresholds, have an automated stop and rollback, and communicate before and after. Never run experiments on systems you are not authorized to touch.
practice:
  - "Pick a service in a local Docker Compose setup you own. Write a steady-state metric, a hypothesis and an abort condition for stopping its cache container."
  - "Run the experiment locally by stopping the container, record what users would see, then restart it and note recovery time."
  - "Turn one weakness you found into a regular automated test."
takeaways:
  - Chaos engineering is controlled experimentation, not random breakage.
  - Define steady state with business metrics, then hypothesise it will hold.
  - Minimise blast radius, set abort conditions and get approval first.
  - Start in test environments; production experiments need maturity and monitoring.
  - Turn every weakness found into a fix and a regression check.
quiz:
  - id: chaos-q1
    type: single
    topic: chaos-engineering-basics
    difficulty: beginner
    prompt: What is the first step of a chaos experiment according to the Principles of Chaos Engineering?
    options: ["Kill random servers in production", "Define steady state as measurable output that shows normal behaviour", "Write unit tests", "Disable monitoring to avoid noise"]
    answer: [1]
    explanation: You cannot tell whether a failure had an effect unless you first define normal behaviour with measurable output such as successful checkouts per minute. Random killing without a hypothesis is not an experiment.
  - id: chaos-q2
    type: scenario
    topic: chaos-engineering-basics
    difficulty: intermediate
    prompt: "Your first experiment: add 500 ms latency to the recommendation service. Which blast radius is most appropriate?"
    options: ["All production traffic at peak time", "One instance in a staging environment, then a small share of traffic", "Every service at once", "A competitor's API"]
    answer: [1]
    explanation: Start small and controlled, then widen as confidence grows. Full peak traffic risks a real outage, and testing third-party systems you do not own is never authorized.
  - id: chaos-q3
    type: truefalse
    topic: chaos-engineering-basics
    difficulty: beginner
    prompt: An experiment where the steady state did not hold is a failed experiment that wasted time.
    options: ["True", "False"]
    answer: [1]
    explanation: Disproving the hypothesis reveals a weakness before it causes an unplanned outage, which is the most valuable result. Fix it and rerun to confirm.
  - id: chaos-q4
    type: multiple
    topic: chaos-engineering-basics
    difficulty: intermediate
    prompt: Which should be in place before a chaos experiment? Select all that apply.
    options: ["Approval from system owners", "Monitoring of steady-state metrics", "Abort conditions and a way to stop", "A guarantee that nothing can go wrong"]
    answer: [0, 1, 2]
    explanation: Approval, monitoring and a stop mechanism keep the experiment safe. No one can guarantee nothing will go wrong; that uncertainty is why you limit the blast radius.
---

## Beginner-friendly explanation

Fire drills are a good comparison. A school does not wait for a real fire to discover that one exit is locked. It runs a planned drill, with teachers watching, at a time it chooses, and it can stop the drill at any moment. Afterwards it fixes what went wrong.

Chaos engineering is a fire drill for software. You deliberately cause a small, controlled failure, such as switching off one server, and watch whether the system keeps serving users. If it does not, you have learned something before a real failure taught you the hard way.

## Technical explanation

The Principles of Chaos Engineering describe the method:

1. **Define steady state** as measurable output that shows normal behaviour, for example orders per minute or the share of successful requests.
2. **Hypothesise** that steady state will continue in both a control group and an experimental group.
3. **Introduce variables that reflect real-world events**, such as servers crashing, disks filling, network latency or a dependency failing.
4. **Try to disprove the hypothesis** by comparing the control and experimental groups.

Advanced practice adds: run in production when mature, automate experiments to run continuously, and **minimise the blast radius**.

```mermaid
flowchart LR
  A[Steady state metric] --> B[Hypothesis]
  B --> C[Inject fault, small blast radius]
  C --> D{Steady state holds?}
  D -->|yes| E[Confidence grows, widen scope]
  D -->|no| F[Abort, analyse, fix]
  F --> G[Add regression test, rerun]
```

### Common fault types

| Fault | Example | What it reveals |
|---|---|---|
| Instance failure | Stop one container or pod | Load balancing, health checks, restart |
| Latency | Add 500 ms to a dependency | Timeouts, retries, user experience |
| Dependency error | Return HTTP 503 from a service | Fallbacks, circuit breakers |
| Resource exhaustion | Fill disk or use CPU | Alerts, graceful degradation |
| Network partition | Block traffic between zones | Consistency and failover |

### Safety

Chaos experiments are only run with approval from the system owners, during staffed hours, with monitoring, abort conditions and an automatic stop. Begin in test environments. Tools such as Chaos Mesh and LitmusChaos for Kubernetes, and AWS Fault Injection Service, provide controlled fault injection with stop conditions.

## Code examples

A simple local experiment with Docker Compose on a system you own:

```bash
# 1. Measure steady state: successful requests in 30 seconds
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/products; sleep 1; done | sort | uniq -c

# 2. Inject the fault: stop the cache
docker compose stop redis

# 3. Measure again, then 4. restore
docker compose start redis
```

## Expected output

```text
# Before
     30 200
# During the experiment, if the app degrades gracefully
     30 200
# During the experiment, if it does not
     12 200
     18 500
```

Hypothesis: "Product pages keep returning 200 when the cache is down, only slower." Eighteen 500 responses disprove it: the app has no fallback to the database.

## Real-world example

An online ticketing team believed their service would survive the loss of its cache. In a staging experiment approved by the team lead, they stopped the cache for five minutes during a load test. Response times rose as expected, but the database connection pool was exhausted within a minute and the error rate climbed past the abort threshold, so the experiment was stopped. The fix added a connection limit and a short-lived local cache. A rerun held steady state, and the experiment became part of their monthly reliability checks.

## Common mistakes

- **Breaking things randomly** without a hypothesis or metrics.
- **Starting in production** with a large blast radius.
- **No abort conditions** or nobody watching.
- **Measuring only technical metrics** instead of user-facing outcomes.
- **Not fixing findings**, so the experiment just repeats the same failure.

## Troubleshooting

- **Nothing seems to happen.** Confirm the fault was really injected and that monitoring covers the affected path.
- **Results are noisy.** Compare with a control group and run longer.

## Key takeaways summary

Chaos engineering is careful, scientific fire drilling: define normal, predict, inject a small realistic fault, observe, and fix. It pairs naturally with [microservices testing](/learn/specialist/microservices-testing).
