---
slug: blazemeter-chrome-recorder
title: Recording scripts with the BlazeMeter Chrome extension
summary: Record a user journey with the BlazeMeter Chrome extension, filter out third-party domains, export a JMX (or Selenium/Taurus YAML), and turn the raw recording into a reliable script by correlating dynamic values and parameterising data.
level: beginner
duration: 45
tags: [performance, jmeter, blazemeter, recording, correlation]
objectives:
  - Install the BlazeMeter Chrome extension and record a browser journey
  - Configure filter patterns, cache and embedded-resource options before recording
  - Export a recording as JMX, Selenium or Taurus YAML and open it in JMeter
  - Find and correlate dynamic values that a recording hard-codes
prerequisites:
  - Recording scripts with the JMeter HTTP(S) Test Script Recorder
  - Correlation and parameterisation in JMeter
related: [jmeter-recording-scripts, jmeter-correlation-and-parameterization, jmeter-csv-data-set-config, blazemeter-overview, blazemeter-running-jmeter-tests]
references:
  - title: BlazeMeter Help - Chrome extension - Record
    url: https://help.blazemeter.com/docs/guide/recorders-chrome-extension-record.html
  - title: BlazeMeter Help - BlazeMeter Chrome extension
    url: https://help.blazemeter.com/docs/guide/recorders-blazemeter-chrome-extension.html
  - title: Chrome extensions - Match patterns
    url: https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns
  - title: BlazeMeter Help - Calibrate a JMeter test
    url: https://help.blazemeter.com/docs/guide/performance-jmeter-calibration.html
interview:
  - q: How does the BlazeMeter Chrome extension differ from JMeter's HTTP(S) Test Script Recorder?
    a: The extension records inside Chrome without configuring a proxy or installing a certificate, and it can save the journey as a JMX, a Selenium script or a combined Taurus YAML, or upload it straight to BlazeMeter. JMeter's recorder is a proxy that works with any client and gives finer control inside JMeter. Both produce raw recordings that still need correlation, parameterisation and cleanup.
  - q: Why is a recorded script almost never ready to run at load?
    a: It hard-codes values captured once, such as session cookies, CSRF tokens, IDs and the recorded user's credentials. It may include analytics and third-party calls, and its think times reflect one person's pace. You filter domains, extract dynamic values with extractors, feed users from CSV, add assertions and sensible timers, then verify with one thread.
  - q: What would you put in the filter pattern?
    a: Only the domains of the application I am authorised to test, for example https://shop.example.test/*. That keeps out analytics, ads, fonts CDNs, single sign-on providers I do not own and the BlazeMeter traffic itself, which both cleans the script and stops me load-testing third parties.
  - q: Should you record embedded resources like images and CSS?
    a: It depends on the goal. To model a real browser hitting my own servers or CDN, I can let JMeter fetch embedded resources from my domains, ideally with parallel downloads, or record them explicitly. To focus on the application server, I record only top-level requests. Third-party resources should be excluded either way.
practice:
  - "Record a login-search-logout journey on an app you own with the extension, with a filter pattern for your domain only, and export the JMX."
  - "Open the JMX in JMeter, run one thread with View Results Tree, and list every dynamic value that needs correlation."
  - "Replace the recorded username and password with a CSV Data Set Config and confirm three different users log in."
takeaways:
  - The extension records in Chrome and exports JMX, Selenium or Taurus YAML, or runs the recording in BlazeMeter.
  - Set the filter pattern to your own domains before you press record.
  - Recordings hard-code tokens, IDs and credentials; correlate and parameterise before scaling.
  - Verify the edited script with one thread in JMeter before any cloud run.
  - Record only applications you are authorised to test.
quiz:
  - id: bzm-rec-q1
    type: single
    topic: blazemeter-chrome-recorder
    difficulty: beginner
    prompt: Which file type should you save from the extension when you only want a JMeter performance script?
    options: ["Selenium", "JMX", "Taurus YAML of JMeter & Selenium", "HAR"]
    answer: [1]
    explanation: JMX is the JMeter test plan format. Selenium is for GUI functional tests, and the combined Taurus YAML bundles both. HAR is not one of the documented save options.
  - id: bzm-rec-q2
    type: single
    topic: blazemeter-chrome-recorder
    difficulty: beginner
    prompt: What does the default filter pattern record?
    options: ["Only the current tab's domain", "All domains and paths over http and https", "Nothing until you add a domain", "Only XHR requests"]
    answer: [1]
    explanation: The documented default is http://*/*, https://*/*, so everything is recorded, including third parties, until you narrow it.
  - id: bzm-rec-q3
    type: scenario
    topic: blazemeter-chrome-recorder
    difficulty: intermediate
    prompt: Your recorded script works for one user but every replayed POST /cart returns 403 at load. The recording contains a header X-CSRF-Token with a fixed value. What is the fix?
    options: ["Add more engines", "Extract the token from the response that issues it and send ${csrfToken} instead of the fixed value", "Remove the header", "Increase the think time"]
    answer: [1]
    explanation: CSRF tokens are per session. Correlate it with an extractor and a variable. Removing it breaks the request, and more engines or timers do not fix an invalid token.
  - id: bzm-rec-q4
    type: multiple
    topic: blazemeter-chrome-recorder
    difficulty: intermediate
    prompt: Which should you do before recording? Select all that apply.
    options: ["Set the filter pattern to your app's domains", "Decide whether to record only top-level requests", "Log in to every third-party service your page uses", "Consider disabling the browser cache so cached objects are not missed"]
    answer: [0, 1, 3]
    explanation: Filtering, choosing embedded-resource handling and cache behaviour shape a clean recording. Logging in to third parties just records more traffic you should not load-test.
---

## Beginner-friendly explanation

Writing every HTTP request by hand is slow. A recorder watches you use a website and writes the requests down for you, like a court stenographer. JMeter has its own recorder (a proxy), which you met earlier. The **BlazeMeter Chrome extension** is a stenographer that sits inside Chrome itself: no proxy settings, no certificates. You press record, click through your journey, press stop, and download a `.jmx` file.

But a stenographer writes exactly what was said once. If the site gave you a session token "abc123", the recording says "abc123" forever. When 500 virtual users replay it, the server rejects them. So recording is the **first draft**; correlation and test data turn it into a real script.

## Technical explanation

According to BlazeMeter's documentation at the time of writing, the extension records HTTP/HTTPS requests and Selenium (WebDriver) actions **in parallel**, so one recording can become a JMeter performance script and a Selenium functional script. Its controls:

- **Name** (required), **Start recording** (red circle), **Stop** (red square), **Reset** (curved arrow).
- **Run**: uploads the recording to BlazeMeter as a Performance Test, GUI Functional Test or End User Experience Monitoring test.
- **Edit**: opens an editor for small changes.
- **Save...**: downloads as **Taurus YAML of JMeter & Selenium**, **Selenium** only, or **JMX** only.
- **Save in Project...**: choose account, workspace and project.

**Advanced options** (all optional):

| Option | Why it matters |
|---|---|
| User Agent | Emulates a browser or device by adding a User-Agent header |
| Filter Pattern | Chrome match patterns that restrict which requests are recorded; default `http://*/*, https://*/*` (everything) |
| Disable Browser Cache | Cached objects are not recorded, so caching changes what you capture |
| Wipe Service Workers | Removes service workers between pages |
| Record AJAX Requests | Include XHR/fetch calls (usually essential for modern apps) |
| Randomize recorded think times | Replaces exact pauses with a uniform random timer |
| Requests to Record | *Only Top-Level Requests* (JMeter parses HTML and fetches embedded resources at run time) or *Top Level Requests and the Following* (cookies, CSS and fonts, JavaScript, images, redirects, other) recorded explicitly |
| Export ID Locators | For Selenium: keep ID locators if your IDs are stable |

A filter pattern uses Chrome's match-pattern syntax: `https://shop.example.test/*` matches every path on that host over HTTPS. Multiple patterns are separated by commas.

**Correlation caveat.** The recorder captures literal values. Dynamic values you must handle in JMeter include session cookies (usually handled by an HTTP Cookie Manager), CSRF/anti-forgery tokens, JWTs, order or cart IDs in URLs, `ViewState`-style hidden fields and timestamps. BlazeMeter's docs also mention auto-correlation rules for JMeter tests, but you should still understand and verify each one yourself.

## Step-by-step walkthrough

Use an app you own, for example a sample shop running on your machine at `http://localhost:3000` (recording works locally; only cloud **runs** need a reachable host).

1. **Install.** In Chrome, open the Chrome Web Store, search for "BlazeMeter" and add the official BlazeMeter extension (publisher BlazeMeter/Perforce). Pin it to the toolbar.
2. **Log in.** Click the extension icon. Log in to your BlazeMeter account; the docs say you should see a "Hi [username]" greeting.
3. **Name the test**, for example `shop-login-search`.
4. **Expand Advanced Options.** Set Filter Pattern to `http://localhost:3000/*` (or your domain). Tick Record AJAX Requests. Choose Only Top-Level Requests for a first recording. Consider Disable Browser Cache.
5. **Open the start page** in the tab, then click the red circle.
6. **Perform the journey slowly and deliberately:** home page, log in as `test.user1`, search for "lamp", open a product, log out. Avoid extra clicks; every click becomes a request.
7. **Click the red square** to stop.
8. **Review.** The extension may show the domains it saw and let you include or exclude them. Exclude anything you do not own.
9. **Save... then JMX.** The file downloads.
10. **Open in JMeter.** Add a View Results Tree, set the thread group to 1 thread, 1 loop, and run. Then do the cleanup steps below.

**Cleanup checklist in JMeter**

1. Rename samplers to business names (`01 Home`, `02 Login`, ...), which become report labels.
2. Add HTTP Request Defaults with `${__P(host,localhost)}` and `${__P(port,3000)}`.
3. Ensure an HTTP Cookie Manager exists.
4. Search the plan for long random-looking strings. For each, find the earlier response that returns it, add a JSON or Regular Expression Extractor, and replace the literal with `${variable}`.
5. Replace the recorded credentials with a CSV Data Set Config (`users.csv`, filename only, no path, so it works in BlazeMeter).
6. Add Response Assertions on key pages.
7. Run 1 thread, then 3 threads with 3 users, and confirm in the app that three different users logged in.

## Code examples

A typical correlation after recording, shown as the logic you add:

```text
02 Login page (GET /login)
  Regular Expression Extractor
    Reference name: csrfToken
    Regular expression: name="csrf" value="(.+?)"
    Template: $1$
03 Login (POST /login)
  Parameters: username=${username}  password=${password}  csrf=${csrfToken}
```

`users.csv` (filename only in the CSV Data Set Config):

```text
username,password
test.user1,Passw0rd!1
test.user2,Passw0rd!2
test.user3,Passw0rd!3
```

## Expected output

After cleanup, View Results Tree shows every sampler green with your business names, the login POST contains a different token on each iteration, and the Debug Sampler (if you add one temporarily) shows `csrfToken` populated. Three threads log in as three different users.

## Real-world example

A travel site's team recorded a booking journey with the extension and got 214 requests. 140 were analytics, a chat widget, fonts and an ad network. Narrowing the filter pattern to their two domains brought it to 31 requests. The first replay at 20 users failed on payment because the recording contained a fixed `bookingRef` in the URL; a JSON Extractor on the "create booking" response fixed it. They also noticed the recording included calls to a third-party payment sandbox; they replaced it with their own stub, because the payment provider had not authorised load tests.

## Worked example: finding what to correlate

After a recording, the hardest question is "which values are dynamic?". A reliable method is to **record the same journey twice** and compare.

1. Record `shop-login-search` as above and save the JMX as `rec-a.jmx`.
2. Click **Reset**, log out, clear cookies for your site, and record exactly the same clicks again as `rec-b.jmx`.
3. Compare the two files with any text diff tool (for example `git diff --no-index rec-a.jmx rec-b.jmx`).

Lines that differ are your correlation candidates. A typical diff for a small shop looks like this:

```text
-  csrf=7f3a9c1e5b2d4a60
+  csrf=b81d02e4c9f7a315
-  /api/cart/5512/items
+  /api/cart/5519/items
-  _=1762851200345
+  _=1762851297811
```

Read each one and decide:

| Value | Where it came from | Action |
|---|---|---|
| `csrf` | Hidden field in the GET /login HTML | Regular Expression or CSS Selector Extractor on the login page, then `${csrfToken}` |
| Cart ID `5512` | JSON body of POST /api/cart | JSON Extractor `$.id` into `cartId`, then `/api/cart/${cartId}/items` |
| `_=1762851200345` | A cache-busting timestamp added by the browser | Replace with `${__time()}` or remove the parameter if the server ignores it |

Values that are identical in both recordings but tied to one account (for example a user ID returned after login) will still break when many different users replay the script, so also look for anything that appears in a response and is later sent back in a request.

## Interpreting the first replay

Run the cleaned script with one thread and View Results Tree, and read the result carefully rather than just looking for green icons.

- **Green but wrong.** A login request can return HTTP 200 with a page that says "Invalid session". Without an assertion it shows green. Add a Response Assertion that checks for something only a logged-in page contains, such as the user's name or a "Log out" link.
- **Redirect chains.** If you recorded "Top Level Requests and the Following", redirects may appear as separate samplers and JMeter may also follow them, doubling requests. Keep one approach: either let JMeter follow redirects, or keep the recorded redirect samplers and turn following off.
- **Embedded resources.** With "Only Top-Level Requests" you can enable "Retrieve All Embedded Resources" in HTTP Request Defaults to fetch CSS, scripts and images at run time. Restrict it with a URL pattern so you do not load third-party content you have no permission to test.
- **Think time.** The recorded pauses reflect how slowly you clicked. Replace them with timers based on your workload model, not your recording speed.

## When to use which save format

| Format | Use it when |
|---|---|
| JMX only | You will refine the script in JMeter and run it locally or on BlazeMeter |
| Taurus YAML of JMeter and Selenium | You want one file for a combined performance and browser test, run with `bzt` |
| Selenium only | You need a functional browser script, not load |

## Common mistakes

- **Leaving the default filter**, so you record (and later load-test) Google, ad networks and BlazeMeter itself.
- **Recording with real personal accounts** and committing those credentials in the JMX.
- **Running the raw recording at load** without correlation.
- **Absolute CSV paths** (`C:\Users\me\users.csv`), which break on cloud engines; use the file name only and upload the file.
- **Recording embedded resources and also enabling "Retrieve all embedded resources"**, doubling the traffic.
- **Treating the Selenium export as a load test.** Browser scripts are heavy; use them for functional or user-experience checks.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Extension shows nothing recorded | Check the filter pattern matches your URL scheme and port |
| AJAX calls missing | Enable Record AJAX Requests and re-record |
| Replay 401/403 | Session cookie or token not correlated; add Cookie Manager and extractors |
| Replay 404 on an ID | The ID was created during recording; extract it from the create response |
| Duplicate image requests | Choose either recorded resources or parsed embedded resources, not both |

## Hands-on exercise

1. Record a four-step journey on an app you own with a domain-only filter.
2. Export JMX and Selenium; open both and compare what each contains.
3. Correlate every dynamic value and parameterise users from CSV.
4. Run 5 threads for 2 minutes in non-GUI mode with zero errors.
5. Write a short note: which values you correlated and where each came from.

## Key takeaways summary

The BlazeMeter Chrome extension is the fastest way to a first draft: record in Chrome, filter to your own domains, export JMX (or Selenium/Taurus YAML). The draft hard-codes session data, so correlate tokens and IDs, parameterise users with CSV using file names only, add assertions, and verify with one and then a few threads before any cloud run. Record and test only applications you are authorised to test.
