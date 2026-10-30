---
slug: recovery-reliability-availability-testing
title: Recovery, Reliability and Availability Testing
summary: Reliability testing checks that a system performs its functions under stated conditions for a period of time. Learn its sub-characteristics, how availability is measured, and how to test failover, backup restore and recovery against agreed RTO and RPO targets.
level: intermediate
duration: 40
tags: [non-functional, reliability-testing, recovery-testing, availability, istqb]
objectives:
  - Define reliability and its sub-characteristics, including availability, fault tolerance and recoverability
  - Calculate availability from uptime figures and from MTBF and MTTR
  - Explain recovery time objective and recovery point objective, and test against them
  - Plan safe recovery, failover and backup-restore tests in a controlled environment
prerequisites:
  - Functional versus non-functional testing
  - System and end-to-end testing
related: [functional-vs-non-functional-testing, chaos-engineering-basics, performance-testing-types, compatibility-and-installation-testing, risk-based-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 2.2.2, Test types)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: Google SRE books (service level objectives, error budgets)
    url: https://sre.google/books/
  - title: Principles of Chaos Engineering
    url: https://principlesofchaos.org/
  - title: ISO/IEC 25010 Systems and software quality models
    url: https://www.iso.org/standard/35733.html
interview:
  - q: What is the difference between reliability and availability?
    a: Reliability is the degree to which a system performs specified functions under specified conditions for a specified period of time. Availability is one sub-characteristic of reliability, the degree to which the system is operational and accessible when required for use. A system can be highly available but unreliable, for example always reachable but sometimes returning wrong results, or reliable while running but with long planned downtime.
  - q: What are RTO and RPO and how would you test them?
    a: Recovery time objective is the maximum acceptable time to restore service after a failure. Recovery point objective is the maximum acceptable data loss, measured as time, such as no more than 15 minutes of transactions. To test them I run a controlled failure or restore exercise in a production-like environment, record when the failure started and when service was fully restored and verified, and compare the last recovered transaction with the last one written before failure. Both measurements are compared with the agreed targets.
  - q: How is recovery testing different from chaos engineering?
    a: Recovery testing typically verifies specific, planned recovery procedures, such as failover, restore from backup or restart after a crash, against expected outcomes and targets. Chaos engineering runs controlled experiments that inject failures to learn how a system behaves and to build confidence in its resilience, often continuously and at larger scale. Both must only be done with authorisation and with a way to stop the experiment.
practice:
  - "A service had 4 hours of unplanned downtime in a 30-day month. Calculate its availability and compare it with a 99.9% target."
  - "Write a recovery test for restoring the order database from last night's backup, including how you will measure RTO and RPO."
  - "List five failure modes for a web application with a load balancer, two app servers and one database, and the expected behaviour for each."
takeaways:
  - Reliability covers maturity, availability, fault tolerance and recoverability.
  - Availability is uptime divided by total required time, or MTBF divided by MTBF plus MTTR.
  - Recovery tests must measure against agreed RTO and RPO, not just check that the system came back.
  - A backup that has never been restored is not proven; test restores regularly.
  - Run failure-injection tests only in authorised, controlled environments with a stop plan.
quiz:
  - id: relavail-q1
    type: single
    topic: recovery-reliability-availability-testing
    difficulty: intermediate
    prompt: A system has an MTBF of 199 hours and an MTTR of 1 hour. What is its availability?
    options: ["99.0%", "99.5%", "99.9%", "95.0%"]
    answer: [1]
    explanation: Availability equals MTBF divided by MTBF plus MTTR, which is 199 / 200 = 0.995, or 99.5%. 99.0% would need an MTTR of about 2 hours for the same MTBF, and 99.9% would need an MTTR of about 12 minutes.
  - id: relavail-q2
    type: single
    topic: recovery-reliability-availability-testing
    difficulty: intermediate
    prompt: The business accepts losing at most 15 minutes of transactions after a database failure. Which objective is this?
    options: ["Recovery time objective (RTO)", "Recovery point objective (RPO)", "Mean time between failures (MTBF)", "Service level indicator (SLI)"]
    answer: [1]
    explanation: RPO bounds acceptable data loss, expressed as time. RTO bounds how long the service may be down, which is the commonly confused alternative.
  - id: relavail-q3
    type: scenario
    topic: recovery-reliability-availability-testing
    difficulty: intermediate
    prompt: Nightly backups have reported success for a year but have never been restored. What is the most important test to run?
    options: ["Check the backup job's success log again", "Restore a backup into an isolated environment and verify data completeness and the time taken", "Delete production data to see whether recovery works", "Increase backup frequency"]
    answer: [1]
    explanation: Only an actual restore proves the backup is usable and shows how long recovery takes. A success log proves the job ran, not that the data can be recovered. Destroying production data is never acceptable.
  - id: relavail-q4
    type: multiple
    topic: recovery-reliability-availability-testing
    difficulty: beginner
    prompt: Which are sub-characteristics of reliability in ISO/IEC 25010 (2011)? Select all that apply.
    options: ["Availability", "Fault tolerance", "Recoverability", "Learnability", "Maturity"]
    answer: [0, 1, 2, 4]
    explanation: Reliability comprises maturity, availability, fault tolerance and recoverability. Learnability belongs to usability. The 2023 revision renames maturity to faultlessness.
---

## Beginner-friendly explanation

Think about the lifts in a busy office building. You care that a lift **works every time** you press the button (reliability), that it is **in service** when you need it rather than "out of order" (availability), that if one lift breaks the **others keep running** (fault tolerance), and that when it does break, an engineer gets it **back in service quickly**, ideally without anyone stuck inside (recoverability).

Software has the same needs. **Reliability, availability and recovery testing** check whether a system keeps working, stays reachable, survives faults and recovers within agreed limits when things go wrong.

## Technical explanation

ISTQB CTFL v4.0 lists **reliability** as a quality characteristic for non-functional testing. ISO/IEC 25010 (2011) defines it as the degree to which a system performs specified functions under specified conditions for a specified period of time, with four sub-characteristics:

| Sub-characteristic | Question it answers | Example test |
|---|---|---|
| Maturity | Does it meet reliability needs in normal operation? | Run a realistic workload for 72 hours and count failures |
| Availability | Is it operational and accessible when needed? | Measure uptime against an agreed target |
| Fault tolerance | Does it keep operating despite hardware or software faults? | Stop one of two app servers; users should see no errors |
| Recoverability | Can it recover data and re-establish the desired state after a failure? | Restore from backup and measure time and data loss |

The 2023 revision of ISO/IEC 25010 renames maturity to faultlessness; check which version your organisation uses.

### Measuring availability

Availability is usually expressed as a percentage of required time:

- **Uptime-based**: availability = uptime / (uptime + downtime).
- **MTBF-based**: availability = MTBF / (MTBF + MTTR), where MTBF is mean time between failures and MTTR is mean time to repair (or restore).

| Target | Maximum downtime in a 30-day month |
|---|---|
| 99% | 7.2 hours |
| 99.9% | about 43 minutes |
| 99.99% | about 4.3 minutes |

These figures come straight from the arithmetic: 30 days is 720 hours, and 0.1% of 720 hours is 0.72 hours. Whether planned maintenance counts as downtime must be agreed in advance.

### Recovery objectives

- **Recovery time objective (RTO)**: the maximum acceptable time to restore service after a failure.
- **Recovery point objective (RPO)**: the maximum acceptable data loss, measured in time, for example "no more than 15 minutes of transactions".

Recovery testing checks the real values against these targets.

```mermaid
sequenceDiagram
  participant T as Tester
  participant P as Primary DB
  participant S as Standby DB
  participant A as Application
  T->>P: Stop primary (controlled failure)
  A->>P: Writes fail
  S->>S: Detects failure, promotes itself
  A->>S: Reconnects, writes succeed
  T->>A: Verify last committed order present
  T->>T: Record recovery time and data loss
```

### Related practices

Long-running **soak tests** check maturity, such as memory leaks and resource exhaustion over time; see [performance testing types](/learn/performance/performance-testing-types). **Chaos engineering** runs controlled failure experiments to build confidence in resilience; see [chaos engineering basics](/learn/specialist/chaos-engineering-basics). All failure-injection work must be authorised, scoped and have an agreed way to stop.

## Real-world example

An online grocery service agreed an RTO of 30 minutes and an RPO of 5 minutes for its order database. In a scheduled recovery test in the pre-production environment, the team stopped the primary database. Automatic failover worked in 2 minutes, but the application kept retrying the old primary's address for another 25 minutes because of a cached DNS entry. Total recovery took 27 minutes, inside RTO but only just, and the team had believed failover was "about 2 minutes".

The restore-from-backup test was worse: restoring took 3 hours, far over the RTO for a scenario where both databases were lost. The findings went into the risk register, the DNS caching was fixed, and a faster restore process was prioritised.

## Step-by-step walkthrough

1. **Agree targets** with the business and operations: availability, RTO, RPO, and what counts as downtime.
2. **List failure modes**: server crash, process kill, network loss, disk full, dependency outage, data-centre loss, corrupted deployment.
3. **Get authorisation and choose the environment.** Use a production-like, isolated environment unless production experiments are explicitly approved and controlled.
4. **Define expected behaviour per failure**: no user-visible error, degraded mode, or full recovery within RTO.
5. **Prepare measurement**: synchronised clocks, monitoring dashboards, a marker transaction just before failure.
6. **Inject the failure** and record exact times.
7. **Verify recovery**: service restored, data consistent, last committed transaction present, no duplicates.
8. **Compare with targets** and report gaps as risks or defects, then retest after fixes.

## Code examples

A simple availability probe that records every failed health check during a recovery test, so downtime can be measured afterwards:

```bash
while true; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 https://staging.example.test/health)
  echo "$(date -u +%H:%M:%S) $code" >> probe.log
  sleep 1
done
```

## Expected output

The log shows when the health check first failed and when it returned to `200`; the gap is the observed recovery time:

```text
10:14:05 200
10:14:06 000
...
10:41:12 000
10:41:13 200
```

## Common mistakes

- **Trusting backups that have never been restored.**
- **Testing only that "it came back"** without measuring time and data loss against RTO and RPO.
- **Injecting failures without authorisation** or without a stop plan.
- **Ignoring dependencies** such as DNS, caches, queues and third-party services in recovery paths.
- **Unclear availability definitions**: whether maintenance windows, partial outages or slow responses count as downtime.
- **One-off tests.** Infrastructure changes; recovery must be re-tested regularly.

## Troubleshooting

- **Recovery time varies widely between runs.** Look for timeouts, retries and caches; record each phase separately (detect, fail over, reconnect, verify).
- **Data is missing after restore.** Compare the backup schedule and replication lag with the RPO; the design, not the test, may be the problem.
- **No safe environment exists.** Raise it as a project risk; untested recovery is an unknown, not a pass.

## Key takeaways summary

Reliability is about doing the job consistently; availability is about being there when needed; recovery is about coming back within agreed limits. Agree measurable targets, test real failures safely and with authorisation, measure time and data loss, and repeat the tests as the system changes.
