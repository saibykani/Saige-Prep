---
slug: testing-sessions-and-concurrency
title: Testing Session Expiry and Concurrent Updates
summary: What happens when a session times out mid-form, or two people edit the same record at once? Learn to test idle and absolute timeouts, logout, multiple tabs and devices, lost updates and optimistic locking.
level: intermediate
duration: 35
tags: [real-world, sessions, concurrency, state-transition]
objectives:
  - Explain idle timeout, absolute timeout and session invalidation
  - Test session behaviour across tabs, devices, logout and the Back button
  - Recognise the lost-update problem and how optimistic locking prevents it
  - Design manual tests for concurrent edits and double submissions
prerequisites:
  - Testing login and authentication
  - State transition testing
related: [testing-login-and-authentication, state-transition-testing, testing-user-permissions, idempotency-retries-rate-limiting, testing-multi-browser-and-network-issues]
references:
  - title: OWASP Session Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
  - title: MDN Web Docs — HTTP conditional requests (ETag, If-Match)
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests
  - title: MDN Web Docs — Using HTTP cookies
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
interview:
  - q: How would you test session timeout?
    a: I find out the idle timeout and the absolute timeout from the requirements or config, ideally shortened in a test environment. I then go idle past the limit and confirm the next action redirects to login without data loss beyond what the requirement allows, that activity just before the limit extends an idle session, that the absolute limit ends the session regardless of activity, and that an expired session cookie replayed via the API is rejected. I also check what happens to an unsaved form and whether the user is returned to where they were after logging in again.
  - q: What is a lost update and how would you test for it?
    a: Two users load the same record, both edit, and both save; the second save silently overwrites the first. To test it, I open the record in two browsers as two users, change different fields in each, save one then the other, and reload. If the first change has vanished without warning, it is a lost update. The usual fix is optimistic locking, where the save includes a version or ETag and the server rejects a stale save with a conflict message.
  - q: What should happen after logout if the user presses the browser Back button?
    a: The previous page may appear from the browser cache, but no sensitive data should be shown if pages are marked not to be cached, and any action or refresh must require logging in again. The session must be invalidated on the server, so replaying the old cookie must fail.
practice:
  - "Open the same editable record in two browsers on an app you own. Edit and save in both. Record what the second save does."
  - "Draw a state diagram for a session: Anonymous, Active, Idle-warning, Expired, Logged out."
  - "Write test cases for 'log out from all devices'."
takeaways:
  - Know both timeouts - idle and absolute - and test each edge.
  - Logout and expiry must invalidate the session on the server, not just clear the screen.
  - Test multiple tabs, browsers and devices with the same account.
  - Concurrent edits need a defined behaviour - conflict message, merge or last-write-wins by design.
  - Double submissions are a concurrency problem too; check for duplicates.
quiz:
  - id: mtsess-q1
    type: single
    topic: testing-sessions-and-concurrency
    difficulty: intermediate
    prompt: An app has a 15-minute idle timeout and an 8-hour absolute timeout. A user clicks something every 5 minutes for 9 hours. What should happen?
    options: ["They stay logged in because they are active", "They are logged out at the 8-hour mark", "They are logged out after 15 minutes", "Nothing; timeouts only apply to idle users"]
    answer: [1]
    explanation: The idle timeout keeps being reset by activity, but the absolute timeout ends the session after 8 hours regardless. Forgetting the absolute timeout is a common gap.
  - id: mtsess-q2
    type: scenario
    topic: testing-sessions-and-concurrency
    difficulty: intermediate
    prompt: User A and User B open ticket #42. A changes the priority and saves. B then changes the description and saves. On reload, the priority is back to its old value. What is this?
    options: ["A caching issue only", "A lost update caused by missing concurrency control", "Expected behaviour of every web app", "A permissions defect"]
    answer: [1]
    explanation: B's save sent the whole stale record and overwrote A's change. Optimistic locking (a version or ETag check) would reject B's stale save or merge the fields.
  - id: mtsess-q3
    type: truefalse
    topic: testing-sessions-and-concurrency
    difficulty: beginner
    prompt: If the logout button clears the screen and shows the login page, the session has definitely been invalidated.
    options: ["True", "False"]
    answer: [1]
    explanation: The client may only delete its cookie while the server session stays valid. Replay the old session cookie through an API client or DevTools to confirm the server rejects it.
  - id: mtsess-q4
    type: single
    topic: testing-sessions-and-concurrency
    difficulty: advanced
    prompt: A server using optimistic locking receives an update with If-Match containing an outdated ETag. Which response is typical?
    options: ["200 OK", "304 Not Modified", "412 Precondition Failed", "401 Unauthorized"]
    answer: [2]
    explanation: If-Match makes the update conditional on the current version. A mismatch means the client's copy is stale, so the server returns 412. Some APIs use 409 Conflict for version fields in the body; check the contract.
---

## Beginner-friendly explanation

**Sessions.** When you check into a hotel you get a key card. It works until checkout, but some hotels also deactivate cards if you have not been seen for a while. When you check out, the card must stop working — even if you keep it in your pocket. A web **session** is that key card: after login, the server gives your browser a token (usually in a cookie) that proves who you are on every request.

**Concurrency.** Now imagine two people editing the same shared shopping list on paper copies. Both cross things out and add items, then each copies their version onto the master list. Whoever copies last wipes out the other person's changes. Software has the same problem when two users edit the same record at the same time.

## Technical explanation

### Session timeouts

| Term | Meaning |
|---|---|
| Idle (inactivity) timeout | Session ends after N minutes with no requests; activity resets the timer |
| Absolute timeout | Session ends N hours after login regardless of activity |
| Invalidation | Server deletes or revokes the session on logout, password change or admin action |
| Renewal | Some apps issue a new session ID after login or privilege change to prevent fixation |

The OWASP Session Management Cheat Sheet recommends both idle and absolute timeouts, and server-side invalidation on logout. A session can be server-side (a session ID mapped to data on the server) or a self-contained token such as a JWT, which is harder to revoke before it expires — worth asking about.

```mermaid
stateDiagram-v2
  [*] --> Anonymous
  Anonymous --> Active: login
  Active --> Active: request (idle timer reset)
  Active --> Warning: idle near limit
  Warning --> Active: user clicks Stay signed in
  Warning --> Expired: idle limit reached
  Active --> Expired: absolute limit reached
  Active --> LoggedOut: logout
  Expired --> Anonymous
  LoggedOut --> Anonymous
```

### Concurrent updates

- **Lost update:** two clients read version 1, both write; the second write overwrites the first without warning.
- **Optimistic locking:** each record has a version number or ETag. A save says "update only if the version is still 5". If someone else saved first, the server rejects it (HTTP 412 Precondition Failed with `If-Match`, or 409 Conflict in many APIs) and the UI shows a conflict message.
- **Pessimistic locking:** the first editor locks the record; others see "being edited by A".
- **Last write wins** is acceptable only when the product explicitly chooses it.

Double submission (clicking Pay twice, or two tabs submitting the same form) is a related concurrency issue — see [idempotency, retries and rate limiting](/learn/api-testing/idempotency-retries-rate-limiting).

## Real-world example

A clinic's appointment system lets receptionists book slots. Two receptionists at different desks both see 10:30 with Dr. Rao as free, and both book it for different patients within a few seconds. Both get "Booked". Two patients arrive at 10:30.

The test that would have caught it: two browsers, same slot, click Book at nearly the same moment. The fix was a database constraint on doctor + slot, plus a friendly "This slot was just taken" message for the second receptionist.

## Step-by-step walkthrough

**Session tests**

1. Ask for the idle and absolute timeouts; request shortened values in test (for example 2 and 10 minutes).
2. Stay idle just under the idle limit, act, and confirm you are still logged in.
3. Stay idle past the limit, act, and confirm redirection to login with a clear message.
4. Stay active past the absolute limit and confirm the session ends.
5. Start filling a long form, let the session expire, submit — check what happens to the data.
6. Log out, press Back, refresh, and replay the old cookie via an API client.
7. Log in on two browsers; log out in one; check the other matches the requirement.
8. Change the password in one session; check other sessions are ended if required.

**Concurrency tests**

| ID | Setup | Action | Expected |
|---|---|---|---|
| CON-01 | Users A and B open record 42 | A saves priority; B saves description | B sees conflict message or fields merge; no silent loss |
| CON-02 | Two browsers on same slot | Both click Book together | Exactly one booking; other sees "slot taken" |
| CON-03 | Same user, two tabs | Submit same order form in both | One order, or a clear duplicate warning |
| CON-04 | A deletes record | B saves edit to it | B sees "record no longer exists" |
| CON-05 | Slow network | Double-click Submit | One record created |

## Common mistakes

- **Waiting the full production timeout** instead of asking for a configurable test value.
- **Testing only the idle timeout** and forgetting the absolute one.
- **Believing the logout screen** instead of checking the server rejects the old session.
- **Testing concurrency alone in one browser tab.** You need two sessions, ideally two users.
- **Calling a lost update "random"** and closing it as not reproducible. Concurrency defects need precise timing; describe the order of actions exactly.

## Troubleshooting

- **Hard to hit the exact same moment?** Open both forms, prepare both edits, then save one immediately after the other — most lost updates do not need millisecond timing.
- **Session never seems to expire?** Background polling may count as activity; check the network tab for periodic requests.

## Key takeaways summary

Sessions must expire on idle and absolute limits and be invalidated on the server. Concurrent edits must never lose data silently. Test both with multiple tabs, browsers and users, and record the exact order of actions.
