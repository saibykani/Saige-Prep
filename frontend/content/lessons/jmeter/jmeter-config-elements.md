---
slug: jmeter-config-elements
title: "Config elements: defaults, headers, cookies and cache"
summary: Use JMeter's HTTP Request Defaults, HTTP Header Manager, HTTP Cookie Manager and HTTP Cache Manager to remove duplication, send realistic headers, keep sessions and mimic browser caching, with placement and scoping rules explained for beginners.
level: beginner
duration: 30
tags: [performance, jmeter, http, config-elements]
objectives:
  - Centralise host, port and protocol with HTTP Request Defaults
  - Send common and per-request headers with HTTP Header Manager
  - Maintain sessions with HTTP Cookie Manager
  - Decide when to use HTTP Cache Manager and how it affects results
prerequisites:
  - The HTTP Request sampler in depth
related: [jmeter-http-request-sampler, jmeter-scope-and-execution-order, jmeter-csv-data-set-config, jmeter-variables-and-properties]
references:
  - title: Apache JMeter - Component Reference (Config Elements)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter - Building a Web Test Plan
    url: https://jmeter.apache.org/usermanual/build-web-test-plan.html
  - title: Apache JMeter - Elements of a Test Plan
    url: https://jmeter.apache.org/usermanual/test_plan.html
interview:
  - q: Why use HTTP Request Defaults?
    a: It holds shared values such as protocol, server, port and timeouts so individual samplers can leave those fields empty. When the environment changes I edit one element instead of every sampler. Values set directly on a sampler override the defaults.
  - q: What happens if a test of a logged-in application has no Cookie Manager?
    a: JMeter will not store the session cookie returned at login, so subsequent requests are sent without it and the server treats each as anonymous. Typically you see redirects to the login page or 401/403 responses, even though the login sampler itself succeeded.
  - q: What does the HTTP Cache Manager do and why does it matter for realism?
    a: It simulates a browser cache per thread, honouring headers like Cache-Control, Expires, Last-Modified and ETag. Returning users then do not re-download cached static resources, or send conditional requests that get 304 responses. Without it, every iteration downloads everything, overstating load on static content.
practice:
  - "Move host and port from three HTTP Request samplers into one HTTP Request Defaults element and confirm the test still passes against localhost:8000."
  - "Add an HTTP Header Manager with a User-Agent header, run once, and find the header in View Results Tree → Request → Request Headers."
  - "Add an HTTP Cache Manager, enable Retrieve All Embedded Resources and compare first and second iteration response codes for a CSS file."
takeaways:
  - Config elements supply settings to samplers in their scope; they do not send requests themselves.
  - HTTP Request Defaults removes duplication; sampler values override it.
  - Header Managers in scope are merged; a closer one wins for the same header name.
  - Add one HTTP Cookie Manager per Thread Group for any session-based app.
  - HTTP Cache Manager mimics browser caching for realistic returning users.
quiz:
  - id: jm-cfg-q1
    type: single
    topic: jmeter-config-elements
    difficulty: beginner
    prompt: HTTP Request Defaults sets Server Name to localhost. A sampler sets Server Name to 127.0.0.1. Which host is used for that sampler?
    options: ["localhost", "127.0.0.1", "Both, two requests are sent", "Neither, it errors"]
    answer: [1]
    explanation: Values filled in on the sampler override the defaults. Defaults only fill empty fields, so only one request goes to 127.0.0.1.
  - id: jm-cfg-q2
    type: scenario
    topic: jmeter-config-elements
    difficulty: beginner
    prompt: Login returns 200, but every later request in your local app test gets redirected to /login. What is the most likely missing element?
    options: ["HTTP Cache Manager", "HTTP Cookie Manager", "Constant Timer", "Summary Report"]
    answer: [1]
    explanation: The session lives in a cookie, and without a Cookie Manager JMeter does not store or resend it. The Cache Manager deals with cached resources, not sessions.
  - id: jm-cfg-q3
    type: multiple
    topic: jmeter-config-elements
    difficulty: intermediate
    prompt: Which are true about the HTTP Header Manager? Select all that apply.
    options: ["It can sit at Thread Group level to apply to all samplers in scope", "A Header Manager under a sampler can add headers for just that request", "It sends its own HTTP request", "It is the usual place to set Content-Type: application/json"]
    answer: [0, 1, 3]
    explanation: Header Managers apply to samplers in their scope, can be placed per request and commonly carry Content-Type. They are config elements and never send requests on their own.
  - id: jm-cfg-q4
    type: truefalse
    topic: jmeter-config-elements
    difficulty: beginner
    prompt: Config elements are processed before the sampler they apply to.
    options: ["True", "False"]
    answer: [0]
    explanation: Configuration elements come first in JMeter's execution order, so their settings are ready when the sampler runs.
---

## Beginner-friendly explanation

Imagine filling in twenty delivery forms that all have the same return address. You would buy a rubber stamp. **Config elements** are JMeter's rubber stamps: they hold settings once and apply them to every request beneath them in the tree.

- **HTTP Request Defaults** stamps the address (server, port, protocol).
- **HTTP Header Manager** stamps extra labels on the envelope (headers).
- **HTTP Cookie Manager** is a wallet that keeps the membership card (session cookie) the server hands you and shows it on every visit.
- **HTTP Cache Manager** is a memory of pictures you already have, so you do not ask for them again.

A **header** is a small name/value note sent with a request, like `Accept-Language: en`. A **cookie** is a value the server asks the client to store and send back, often used to remember who is logged in. A **cache** is a local copy of a file kept to avoid downloading it again.

## Technical explanation

All four are added via **right-click (Test Plan, Thread Group, controller or sampler) → Add → Config Element → ...**. A config element affects samplers **in its scope**: those in the same branch of the tree at or below its level. See [scope and execution order](/learn/jmeter/jmeter-scope-and-execution-order).

| Element | Key fields | Behaviour |
|---|---|---|
| HTTP Request Defaults | Protocol, Server Name, Port, Path, Content encoding, Timeouts, Embedded resources | Fills empty fields on samplers in scope; sampler values win |
| HTTP Header Manager | Table of Name / Value | Adds headers; managers in scope are merged, and for the same name the one closest to the sampler wins |
| HTTP Cookie Manager | Clear cookies each iteration?, Cookie Policy (standard), user-defined cookies | Stores cookies per thread and resends them like a browser |
| HTTP Cache Manager | Clear cache each iteration?, Use Cache-Control/Expires headers, Max number of elements | Per-thread cache; may skip requests or send conditional ones (304) |

Thread Group's **Same user on each iteration** interacts with these: when ticked, cookies and cache survive between iterations; when unticked, they are cleared, like a new user each time.

```mermaid
flowchart TD
  TG[Thread Group] --> D[HTTP Request Defaults: localhost:8000]
  TG --> H[HTTP Header Manager: User-Agent]
  TG --> C[HTTP Cookie Manager]
  TG --> K[HTTP Cache Manager]
  TG --> S1[HTTP Request: GET /]
  TG --> S2[HTTP Request: GET /about.html]
  S2 --> H2[Header Manager: X-Page about]
```

Here both samplers get the defaults, the cookie and cache behaviour and the User-Agent header; only `/about.html` also gets `X-Page`.

## Step-by-step walkthrough

1. Run `python -m http.server 8000` in a folder with `index.html` and `about.html`. If you want to try caching, also create a `style.css` file and reference it from `index.html` with a normal stylesheet link.
2. Add a Thread Group: 1 thread, Loop Count 2, **Same user on each iteration** ticked.
3. **Right-click Thread Group → Add → Config Element → HTTP Request Defaults**: Protocol `http`, Server `localhost`, Port `8000`.
4. Add two HTTP Requests with **only** Path filled in: `/` and `/about.html`.
5. **Add → Config Element → HTTP Header Manager** under the Thread Group. Click **Add**: Name `User-Agent`, Value `Saige-Prep-Learner`.
6. **Add → Config Element → HTTP Cookie Manager** under the Thread Group. Leave defaults.
7. **Add → Config Element → HTTP Cache Manager**. On the `/` sampler's **Advanced** tab tick **Retrieve All Embedded Resources**.
8. Add **View Results Tree** and **Start**.
9. Inspect **Request → Request Headers**: you should see `User-Agent: Saige-Prep-Learner`.

## Expected output

Illustrative View Results Tree list (first iteration, then second):

| Sample | Response code |
|---|---|
| GET / | 200 |
|   ↳ /style.css (sub-result) | 200 |
| GET /about.html | 200 |
| GET / | 200 or 304 |
|   ↳ /style.css | served from cache or 304 |
| GET /about.html | 200 or 304 |

Exact codes depend on the headers your server sends; Python's simple server sends `Last-Modified`, so conditional requests returning **304 Not Modified** are typical.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Samplers fail with empty host | Defaults outside the Thread Group's scope or disabled | Place under Test Plan or the same Thread Group; enable it |
| Header missing | Typo in name, or manager scoped to a different branch | Check spelling and tree position |
| Logged-in steps redirect to login | No Cookie Manager | Add one per Thread Group |
| Each iteration downloads everything | No Cache Manager, or "Clear cache each iteration" ticked | Add it; untick that option for returning users |
| Unexpected duplicated headers | Two managers set the same name at different levels | Keep each header in one place |

## Real-world example

A team load-testing its own web shop in staging keeps one HTTP Request Defaults element pointing at the staging host, one Header Manager with `Accept` and `Accept-Language`, a Cookie Manager for sessions and a Cache Manager so returning shoppers behave like real browsers. When they move the same plan to a second environment, only the Defaults' Server Name changes, usually supplied by a property.

There are other config elements you will meet later in this track. **CSV Data Set Config** feeds rows of test data, such as usernames, into variables ([CSV Data Set Config](/learn/jmeter/jmeter-csv-data-set-config)). **User Defined Variables** holds named values like a base path. **Counter** generates increasing numbers. They all follow the same scoping idea you learned here.

## Common mistakes

- **Copying host and port into every sampler** instead of using Defaults.
- **Forgetting the Cookie Manager** on any login-based flow.
- **Putting secrets like real tokens in plain headers** in a shared `.jmx`; use variables instead ([variables and properties](/learn/jmeter/jmeter-variables-and-properties)).
- **Assuming the Cache Manager speeds up the server**; it only changes what the client requests.
- **Testing systems you do not own.** Stay on localhost or authorised environments.

## Key takeaways summary

Config elements are shared settings, not requests. Defaults centralise the address, Header Managers add headers, the Cookie Manager keeps sessions alive and the Cache Manager mimics browser caching. Where you place them decides which samplers they affect.
