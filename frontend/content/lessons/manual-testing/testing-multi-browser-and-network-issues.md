---
slug: testing-multi-browser-and-network-issues
title: Testing Multi-browser Behaviour and Network Interruptions
summary: Users arrive on different browsers, screen sizes and unreliable networks. Learn to choose a browser matrix from real usage, use DevTools throttling and offline mode, and test what happens when a request is slow, fails or is repeated.
level: intermediate
duration: 30
tags: [real-world, compatibility, cross-browser, network]
objectives:
  - Choose a browser and device matrix based on risk and usage data
  - Identify the kinds of defects that differ between browser engines
  - Simulate slow, offline and flaky networks with browser developer tools
  - Design tests for timeouts, retries and double submissions
prerequisites:
  - Compatibility and installation testing
  - Basic use of browser developer tools
related: [compatibility-and-installation-testing, testing-sessions-and-concurrency, testing-file-uploads-and-downloads, idempotency-retries-rate-limiting, testing-cart-and-checkout]
references:
  - title: Chrome DevTools — Network features reference (throttling)
    url: https://developer.chrome.com/docs/devtools/network/reference
  - title: MDN Web Docs — Cross browser testing
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing
  - title: Can I use (browser support tables)
    url: https://caniuse.com/
interview:
  - q: How do you decide which browsers to test?
    a: I start from the product's analytics and target market, plus any contractual requirements. I make sure each main engine is covered - Chromium (Chrome, Edge), Gecko (Firefox) and WebKit (Safari, and all browsers on iOS) - on the main platforms and screen sizes. High-risk flows get the full matrix; the rest get the primary browser plus spot checks. I review the matrix periodically as usage changes.
  - q: How do you test what happens when the network drops during checkout?
    a: With DevTools I throttle to a slow profile or go offline at specific points - before submit, right after clicking Pay, while waiting for the response. I check the user sees a clear message, the form data is kept, the Pay button cannot be submitted twice, and that after reconnecting the order is not duplicated and its true status is shown. I verify in the backend or admin screen how many orders and payments were actually created.
  - q: Why do all browsers on iOS behave similarly?
    a: Historically Apple required third-party browsers on iOS to use the WebKit engine, so Chrome or Firefox on iPhone rendered pages largely like Safari. Apple has allowed alternative engines in some regions under newer rules, so I check the current situation for the target market rather than assume.
practice:
  - "Open a web app you own in Chrome with DevTools network throttling set to a slow 3G-style preset. Note every place without a loading indicator."
  - "Go offline in DevTools just after submitting a form. Record what the user sees and whether the data was saved."
  - "Build a browser matrix for a banking app targeted at Indian mobile users. Justify each row."
takeaways:
  - Choose browsers by engine, platform and real usage, not by habit.
  - Layout, date inputs, file pickers, autofill and storage differ between browsers.
  - DevTools throttling and offline mode make network testing repeatable.
  - Every slow or failed request needs a loading state, a clear error and safe retry.
  - Double submission on slow networks is a classic duplicate-order defect.
quiz:
  - id: mtnet-q1
    type: single
    topic: testing-multi-browser-and-network-issues
    difficulty: beginner
    prompt: Which set covers the three major browser engines?
    options: ["Chrome, Edge, Opera", "Chrome, Firefox, Safari", "Chrome on Windows and Chrome on macOS", "Edge and Internet Explorer"]
    answer: [1]
    explanation: Chrome (Chromium/Blink), Firefox (Gecko) and Safari (WebKit) are three different engines. Chrome, Edge and Opera all use Chromium, so they share most rendering behaviour.
  - id: mtnet-q2
    type: scenario
    topic: testing-multi-browser-and-network-issues
    difficulty: intermediate
    prompt: On a throttled connection, a user taps Place Order, sees nothing happen for 6 seconds, taps again, and two orders are created. Which fixes address this? Pick the best answer.
    options: ["Tell users to wait", "Disable the button with a loading state and make order creation idempotent on the server", "Increase the server timeout", "Only test on fast Wi-Fi"]
    answer: [1]
    explanation: The UI should prevent repeat taps and show progress, and the server should recognise a repeated request (for example with an idempotency key). Either alone is weaker; together they prevent duplicates.
  - id: mtnet-q3
    type: truefalse
    topic: testing-multi-browser-and-network-issues
    difficulty: beginner
    prompt: Testing in Chrome's device emulation mode is the same as testing on a real iPhone in Safari.
    options: ["True", "False"]
    answer: [1]
    explanation: Device emulation changes viewport size and user agent, but the page still runs in Chrome's engine. Safari-specific behaviour needs real Safari or WebKit.
  - id: mtnet-q4
    type: multiple
    topic: testing-multi-browser-and-network-issues
    difficulty: intermediate
    prompt: Which behaviours should you check when a request fails because the network is offline? Select all that apply.
    options: ["A clear, human-readable error appears", "Entered form data is kept", "A retry option is available or retry is automatic and safe", "The page shows a blank white screen", "No duplicate data is created after reconnecting"]
    answer: [0, 1, 2, 4]
    explanation: Good offline handling explains the problem, keeps the user's work, allows safe retry and avoids duplicates. A blank screen is the defect you are hunting for.
---

## Beginner-friendly explanation

Imagine you write a letter and send copies through three different postal services. One delivers next day, one takes a week, one sometimes loses letters. And each household reads it differently — some in large print, some on a small card. You would want to know your message survives all of that.

Websites face the same thing. Users open your site in **different browsers** (Chrome, Safari, Firefox, Edge) on **different devices**, over **different networks** — fast office Wi-Fi, a crowded train's mobile data, or a lift where the signal disappears. This lesson teaches you to test that the site works for all of them, and fails gracefully when the network does not cooperate.

## Technical explanation

### Browsers and engines

A browser's **engine** decides how HTML, CSS and JavaScript behave. The main engines today:

| Engine | Browsers |
|---|---|
| Blink (Chromium) | Chrome, Edge, Opera, Samsung Internet, Brave |
| Gecko | Firefox |
| WebKit | Safari on macOS and iOS; historically all iOS browsers |

So testing Chrome and Edge alone mostly tests one engine. Typical cross-browser defects:

- Layout differences (flexbox/grid edge cases, fonts, scrollbars)
- Date and time inputs, file pickers and select boxes that look and behave differently
- Autofill and password manager behaviour
- Storage and cookie rules (for example stricter third-party cookie handling)
- Newer JavaScript or CSS features not yet supported (check caniuse.com)
- Touch versus mouse, and mobile on-screen keyboards covering inputs

A **browser matrix** lists the browser, version range, OS and device to test. Build it from analytics and risk; see also [compatibility and installation testing](/learn/manual-testing/compatibility-and-installation-testing).

### Networks

Real networks have **latency** (delay per request), limited **bandwidth**, **packet loss** and complete **disconnection**. Browser developer tools can simulate these. In Chrome DevTools, the Network panel has throttling presets and an Offline option; you can also add custom profiles. Firefox has similar throttling.

What to observe when a request is slow or fails:

| Situation | Expected behaviour |
|---|---|
| Slow response | Loading indicator; button disabled; no layout jumps |
| Timeout | Clear message; data kept; retry available |
| Offline before submit | Warning; submission blocked or queued |
| Offline after submit, before response | On reconnect, the true status is shown; no duplicate |
| Repeated request (double tap, retry) | Server treats it idempotently; one record |

```mermaid
sequenceDiagram
  participant U as User
  participant B as Browser
  participant S as Server
  U->>B: Tap Pay
  B->>S: POST /orders (key=abc123)
  Note over B,S: Connection drops, no response
  B-->>U: "We couldn't confirm your order"
  U->>B: Tap Retry
  B->>S: POST /orders (key=abc123)
  S-->>B: 200, existing order returned (not created again)
```

## Real-world example

A ticket-booking site worked flawlessly in Chrome on office Wi-Fi. Two issues were found by a tester on a throttled connection and an iPhone:

1. On a slow network the "Book" button stayed clickable for several seconds without feedback. Impatient users clicked repeatedly and were charged for multiple bookings.
2. In Safari on iOS, a custom date picker did not open because it relied on an event behaviour that differed in WebKit. Desktop Chrome emulation of an iPhone did not show the problem — only real Safari did.

## Step-by-step walkthrough

1. **Build the matrix** from analytics: top browsers by share, each engine, mobile and desktop, plus any contractually required browsers.
2. **Rank flows by risk.** Login, checkout and payments get the full matrix; low-risk pages get spot checks.
3. **Run cross-browser checks:** layout at common widths, forms and native inputs, file upload/download, autofill, keyboard navigation, and console errors.
4. **Network tests in DevTools:**
   - Throttle to a slow preset and walk through key flows, noting missing loading states.
   - Go offline before submitting, right after submitting, and mid-upload.
   - Reconnect and check the real state in the backend or admin screen.
5. **Double submission:** double-click and rapidly tap submit buttons under throttling.
6. **Record the environment** precisely in any [defect report](/learn/manual-testing/writing-a-great-defect-report): browser and version, OS, device, network profile.

### Sample test cases

| ID | Environment | Action | Expected |
|---|---|---|---|
| NET-01 | Chrome, slow preset | Submit login | Spinner, button disabled, success within agreed time |
| NET-02 | Chrome, offline after Pay | Reconnect, open orders | Exactly one order; status accurate |
| NET-03 | Firefox, offline | Submit contact form | "You're offline" message; text kept |
| XB-01 | Safari iOS | Pick a date | Native or custom picker opens and saves |
| XB-02 | Edge, 1366 px wide | Open checkout | No overlapping or cut-off elements |

## Common mistakes

- **Treating Chrome and Edge as two engines.** They share Chromium.
- **Relying only on device emulation** for mobile Safari behaviour.
- **Testing only on fast office networks.**
- **Not checking the backend** after a network failure; the UI may say "failed" while the order exists.
- **Writing defects without the network profile**, so they cannot be reproduced.

## Troubleshooting

- **Throttling seems to have no effect?** Ensure DevTools is open on the right tab and disable cache when reloading.
- **Offline mode doesn't stop a request?** Service workers can serve cached responses; check the Application panel.

## Key takeaways summary

Cover each browser engine on the platforms your users really use, and make network trouble part of normal testing: throttle, go offline at key moments, retry, and verify the backend state so nothing is lost or duplicated.
