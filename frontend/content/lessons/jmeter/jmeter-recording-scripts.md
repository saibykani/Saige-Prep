---
slug: jmeter-recording-scripts
title: Recording Scripts with the HTTP(S) Test Script Recorder
summary: Let JMeter watch you click through your own local app and turn every request into a sampler. Set up the Recording template, proxy port 8888, the temporary root certificate for HTTPS, and clean the recording into a usable script.
level: beginner
duration: 40
tags: [performance, jmeter, recording, proxy]
objectives:
  - Explain what a recording proxy is and how JMeter sits between the browser and the server
  - Create a recording plan from File → Templates → Recording and start the HTTP(S) Test Script Recorder
  - Configure a browser to use the proxy on localhost port 8888 and install the JMeter temporary root certificate for HTTPS
  - Clean a recording by excluding static resources, grouping requests and renaming samplers
prerequisites:
  - JMeter fundamentals (Thread Group, HTTP Request, listeners)
  - Basic understanding of HTTP requests and responses
related: [jmeter-fundamentals, jmeter-http-request-sampler, jmeter-correlation-and-parameterization, jmeter-config-elements, http-fundamentals]
references:
  - title: Apache JMeter - Recording tests, step by step (HTTP(S) Test Script Recorder)
    url: https://jmeter.apache.org/usermanual/jmeter_proxy_step_by_step.html
  - title: Apache JMeter - Component Reference (HTTP(S) Test Script Recorder)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: How does the JMeter HTTP(S) Test Script Recorder work?
    a: "It starts a local proxy server, by default on port 8888. You point a browser at that proxy, so every request goes browser → JMeter → server and back. For each request that passes the include/exclude filters, JMeter creates an HTTP Request sampler (plus a Header Manager) under the target controller. For HTTPS it acts as a man in the middle, so the browser must trust JMeter's generated ApacheJMeterTemporaryRootCA certificate."
  - q: Why can you not simply replay a raw recording under load?
    a: "A raw recording contains hard-coded dynamic values such as session ids, CSRF tokens and timestamps that were valid only for that one session, plus noise like static files and third-party calls. Before using it I exclude static resources, rename samplers, group steps into Transaction Controllers, add think time, correlate dynamic values with extractors, parameterise test data and add assertions."
  - q: What do you do when the browser shows a certificate warning while recording?
    a: "That means the browser does not trust JMeter's temporary root CA. I import ApacheJMeterTemporaryRootCA.crt from JMeter's bin folder into the browser's or OS trust store for websites. The certificate is regenerated and is valid for about seven days, so an expired one must be deleted and re-imported. I remove it from the trust store when I finish recording."
practice:
  - "Run a small web app on localhost, record a three-step journey (open home page, log in, open profile) and list every sampler JMeter created before cleaning."
  - "Add an exclude pattern so that .css, .js, .png and .ico requests are not recorded, then record the same journey again and compare the sampler count."
  - "Rename each recorded sampler to a business name like '02 Login - POST /login' and wrap each step in a Transaction Controller."
takeaways:
  - The recorder is a proxy; the browser must be pointed at it (localhost:8888 by default) for anything to be captured.
  - HTTPS recording needs the browser to trust ApacheJMeterTemporaryRootCA, which expires after about seven days.
  - Use the Recording template; it adds the recorder, a Recording Controller, defaults and a cookie manager for you.
  - A recording is a draft. Exclude static files, rename samplers, group steps, then correlate and parameterise.
  - Record only applications you run yourself or are authorised in writing to test.
quiz:
  - id: jm-rec-q1
    type: single
    topic: jmeter-recording-scripts
    difficulty: beginner
    prompt: What is the default port of the JMeter HTTP(S) Test Script Recorder proxy?
    options: ["80", "443", "8080", "8888"]
    answer: [3]
    explanation: The recorder listens on port 8888 by default. 8080 is a common port for local web servers, which is exactly why it is a tempting but wrong choice; using it for the proxy often clashes with the app itself.
  - id: jm-rec-q2
    type: debugging
    topic: jmeter-recording-scripts
    difficulty: beginner
    prompt: You clicked Start in the recorder and browsed your local app, but no samplers appear in the plan. What is the most likely cause?
    options: ["The Thread Group has 1 user", "The browser is not configured to use the proxy at localhost:8888", "The HTML dashboard is disabled", "The CSV file is missing"]
    answer: [1]
    explanation: JMeter only sees traffic that is sent through its proxy. If the browser still connects directly, nothing reaches the recorder. Thread Group size has no effect on recording.
  - id: jm-rec-q3
    type: truefalse
    topic: jmeter-recording-scripts
    difficulty: beginner
    prompt: The ApacheJMeterTemporaryRootCA certificate is valid forever once imported.
    options: ["True", "False"]
    answer: [1]
    explanation: JMeter generates this certificate with a short validity (about seven days by default). After it expires you get certificate errors again and must import the newly generated one.
  - id: jm-rec-q4
    type: multiple
    topic: jmeter-recording-scripts
    difficulty: intermediate
    prompt: Which steps belong to cleaning a raw recording before it is used as a load test? Select all that apply.
    options: ["Exclude static resources such as images and stylesheets", "Rename samplers to meaningful step names", "Correlate session ids and tokens", "Increase the proxy port to 9999", "Add think time with timers"]
    answer: [0, 1, 2, 4]
    explanation: Removing noise, naming steps, correlating dynamic values and adding think time all make the script realistic and maintainable. The proxy port only matters during recording and changes nothing about the script.
  - id: jm-rec-q5
    type: scenario
    topic: jmeter-recording-scripts
    difficulty: intermediate
    prompt: A teammate wants to record a journey on a public shopping website they do not own, to 'practise'. What should you advise?
    options: ["Go ahead; recording is harmless", "Record it but only replay with 1 user", "Do not test systems you are not authorised to test; practise on a local app you run yourself", "Use a VPN so it cannot be traced"]
    answer: [2]
    explanation: Even replaying a recording sends traffic to the owner's servers. Performance testing must only target systems you own or have written permission to test, so a local practice app is the right choice.
---

## Beginner-friendly explanation

Writing every HTTP request by hand is slow. Imagine instead hiring a note-taker who stands between you and a shop counter. Every time you ask the shopkeeper for something, the note-taker passes your request on, brings back the answer, and writes both down. At the end you have a perfect list of everything you asked for.

The **HTTP(S) Test Script Recorder** is that note-taker. It is a small **proxy** (a program that forwards traffic on your behalf) built into JMeter. You tell your browser "send everything through JMeter", click through your app normally, and JMeter writes one **HTTP Request sampler** (the element that sends a request) for every request it sees.

The result is a fast first draft of a script. It is only a draft, though: it contains noise and values that will not work a second time, and you will learn to clean it.

> **Authorisation rule:** only record and load-test applications you run yourself (for example on `localhost`) or that you have written permission to test. Never point JMeter at third-party websites.

## Technical explanation

The recorder listens on a TCP **port** (a numbered door on your computer), **8888 by default**. The browser is configured to use `localhost:8888` as its HTTP and HTTPS proxy.

```mermaid
sequenceDiagram
  participant B as Browser
  participant R as JMeter recorder (localhost:8888)
  participant S as Your local app (localhost:3000)
  B->>R: GET /login
  R->>S: GET /login (forwarded)
  S-->>R: 200 OK + HTML
  R-->>B: 200 OK + HTML
  Note over R: Creates HTTP Request sampler 'GET /login' under Recording Controller
```

Key parts of the recorder (Component Reference → HTTP(S) Test Script Recorder):

| Setting | What it does |
|---|---|
| Port | Proxy port, default 8888 |
| Target Controller | Where new samplers go, e.g. the Recording Controller |
| Grouping | Put each group of requests in a new controller or transaction, or add separators |
| URL Patterns to Include / Exclude | Regular expressions that decide what is recorded |
| Add suggested Excludes | One click adds patterns for common static files (images, CSS, JS, fonts) |
| Naming scheme / prefix | How sampler names are built, e.g. a step prefix |

**HTTPS** traffic is encrypted, so JMeter must decrypt and re-encrypt it. On start, JMeter generates a root certificate called **ApacheJMeterTemporaryRootCA** and saves `ApacheJMeterTemporaryRootCA.crt` in its `bin` folder. Your browser must trust it; otherwise you see "Your connection is not private". The certificate is **valid for about 7 days**, after which you must import the regenerated one.

Note: many browsers bypass a proxy for `localhost` addresses by default. If your local app is on `localhost`, either use your machine's hostname or LAN IP, or remove localhost from the browser's proxy bypass list.

## Step-by-step walkthrough

1. Start your practice app locally, for example on `http://localhost:3000`.
2. In JMeter choose **File → Templates…**, pick **Recording** in the drop-down and click **Create**. Enter your app's host when asked. JMeter builds a plan with **User Defined Variables**, **HTTP Request Defaults**, an **HTTP Cookie Manager**, a **Thread Group** containing a **Recording Controller**, and the **HTTP(S) Test Script Recorder** under the Test Plan.
3. Select the recorder. Check that **Port** is 8888 and **Target Controller** is "Test Plan > Thread Group > Recording Controller".
4. Under **Request Filtering**, click **Add suggested Excludes**.
5. Click **Start**. A dialog tells you the root CA certificate was created. Click OK. A small **Recorder: Transactions Control** window appears.
6. Configure the browser proxy. In Firefox: **Settings → Network Settings → Settings… → Manual proxy configuration**, HTTP Proxy `localhost`, Port `8888`, tick "Also use this proxy for HTTPS". In Windows (affects Chrome and Edge): **Settings → Network & internet → Proxy → Manual proxy setup**.
7. For HTTPS apps, import `bin/ApacheJMeterTemporaryRootCA.crt`: in Firefox **Settings → Privacy & Security → Certificates → View Certificates → Authorities → Import**, tick "Trust this CA to identify websites".
8. In the Transactions Control window, type a prefix like `01 Home` before each step, then perform it in the browser.
9. Click **Stop**, switch the browser proxy back off, and expand the Recording Controller.

## Expected output

Illustrative result after recording home → login → profile with suggested excludes on:

```text
Recording Controller
├── 01 Home
│   └── /           (HTTP Request + HTTP Header Manager)
├── 02 Login
│   ├── /login
│   └── /api/session
└── 03 Profile
    └── /profile
```

Without excludes the same journey typically also contains samplers for every stylesheet, script, image and favicon.

## Real-world example

A QA team needs a load test for the checkout of an internal web shop running in their own test environment. Hand-writing 25 requests would take hours, so they record the journey once. The raw recording has 140 samplers, most of them images and analytics calls. After adding excludes and re-recording, 22 samplers remain. They rename each to the business step, wrap steps in Transaction Controllers, replace the recorded session id with a correlated variable, and only then add users.

## Cleaning the recording

| Problem in raw recording | Fix |
|---|---|
| Hundreds of `.png`, `.css`, `.js` samplers | Exclude patterns, or enable "Retrieve All Embedded Resources" in HTTP Request Defaults if you want them fetched realistically |
| Names like `/api/v1/x?id=93` | Rename to `03 View product - GET /api/v1/x` |
| Calls to external analytics or fonts domains | Delete them; you are not authorised to load them |
| Hard-coded session ids, CSRF tokens | Correlate, see [Correlation and parameterization](/learn/jmeter/jmeter-correlation-and-parameterization) |
| Hard-coded usernames | Parameterise with [CSV Data Set Config](/learn/jmeter/jmeter-csv-data-set-config) |
| No pauses | Add timers, see [Timers](/learn/jmeter/jmeter-timers-and-throughput-shaping) |

## Common mistakes

- **Leaving the browser on the proxy** after recording, then wondering why the internet is broken when JMeter is closed.
- **Recording with dozens of browser tabs open**, which records background traffic from other sites.
- **Replaying without correlation**, so every user reuses one expired session.
- **Keeping the root certificate trusted forever.** Remove it after recording; a trusted interception CA is a security risk.
- **Recording third-party sites.** It is unauthorised traffic, even "just for practice".

## Troubleshooting

- **Nothing is recorded:** confirm the browser proxy is `localhost:8888`, the recorder says it is running, and your include patterns are not too strict. Check the localhost bypass note above.
- **"Address already in use" on Start:** another program uses 8888; pick another port in both the recorder and the browser.
- **Certificate errors on HTTPS:** import the current `ApacheJMeterTemporaryRootCA.crt`; delete the old one if it expired.
- **Requests from other domains appear:** add an include pattern for your app's host only.

## Key takeaways summary

The recorder is a proxy that converts your browsing into samplers. Use the Recording template, route the browser through port 8888, trust the temporary root CA for HTTPS, and filter static files. Treat the output as a draft: rename, group, correlate, parameterise and add think time before any load is applied, and only against systems you are authorised to test.
