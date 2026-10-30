---
slug: testing-login-and-authentication
title: Testing login and authentication
summary: A guided scenario for testing a real login feature - requirements, assumptions, technique choice, sample test cases, test data and the authentication defects that matter most, such as user enumeration, weak lockout and session fixation.
level: intermediate
duration: 40
tags: [real-world, authentication, login, security, session-management]
objectives:
  - Derive test conditions for a login feature from a realistic specification
  - Combine equivalence partitioning, boundary value analysis, state transition and error guessing for authentication
  - Design positive, negative, boundary and security test cases for login, lockout, MFA and logout
  - Recognise high-impact authentication defects such as user enumeration, session fixation and open redirects
prerequisites:
  - State transition testing
  - Boundary value analysis
  - Security testing fundamentals (helpful)
related: [state-transition-testing, boundary-value-analysis, error-guessing, testing-sessions-and-concurrency, testing-registration-and-password-reset, security-testing-fundamentals]
references:
  - title: OWASP Authentication Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
  - title: OWASP Session Management Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
  - title: OWASP Web Security Testing Guide
    url: https://owasp.org/www-project-web-security-testing-guide/
  - title: NIST SP 800-63B Digital Identity Guidelines - Authentication
    url: https://pages.nist.gov/800-63-3/sp800-63b.html
  - title: MDN HTTP documentation (cookies and Set-Cookie)
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
interview:
  - q: How would you test a login page? Walk me through your approach.
    a: I start from the requirements and clarify the rules - identifier format, lockout policy, MFA, remember-me, session lifetime and redirect behaviour. Then I partition inputs (valid, wrong password, unknown user, empty, malformed), apply boundaries to the lockout counter and session timeouts, and model the account states (active, locked, MFA pending, disabled) for state transition tests. Finally I add security-focused error guessing on my authorised test environment - identical messages for unknown user and wrong password, session ID regenerated after login, server-side logout, cookie flags, open redirect on the return URL, and that credentials never appear in URLs or logs.
  - q: What is user enumeration and how do you test for it?
    a: User enumeration is when an attacker can tell whether an account exists from the system's behaviour. I compare responses for an existing email with a wrong password against a non-existent email - the visible message, HTTP status code, response body, redirect target and roughly the response time. Any consistent difference, including lockout messages that only appear for real accounts, is a finding. The same check applies to registration and password reset.
  - q: What is session fixation, and how would you check for it manually?
    a: Session fixation is when a session identifier set before authentication remains valid after login, so an attacker who planted that identifier can ride the victim's session. In an authorised test environment I note the session cookie value before login using the browser developer tools, log in, and check the value changes. If it stays the same, that is a defect. I also check the old value no longer works after logout.
  - q: The requirement says lock the account after 5 failed attempts. Which tests would you write?
    a: Boundaries on the counter - 4 failures then a correct password should succeed and reset the counter; the 5th failure locks; a 6th attempt with the correct password is still refused with the lockout message. Then the lockout duration boundary, just before and just after 15 minutes. Then whether the counter is per account rather than per browser session, whether it applies to the API as well as the UI, whether a successful login resets it, and that the lockout message does not reveal more than the policy allows.
practice:
  - "Draw a state transition diagram for the sample login spec (Active, Locked, MFA pending, Authenticated, Logged out) and derive one test per valid and invalid transition."
  - "Using your own local or authorised test app, compare the full HTTP responses for a wrong password and an unknown email in the browser developer tools Network tab. List every difference you find."
  - "Extend the sample test case table with four cases for 'remember me', including what should happen after a password change."
takeaways:
  - Clarify the policy first - lockout, MFA, remember-me, session lifetime and redirects all change what correct means.
  - Use EP and BVA for inputs and counters, state transition testing for account and session states, and error guessing for security.
  - Error messages, status codes and timing must not reveal whether an account exists.
  - The session identifier must change at login and be invalidated server-side at logout.
  - Only perform security checks on systems you own or are explicitly authorised to test.
quiz:
  - id: rwlogin-q1
    type: scenario
    topic: testing-login-and-authentication
    difficulty: intermediate
    prompt: For a wrong password the app shows "Incorrect password", and for an unknown email it shows "No account found for this email". What is the main problem?
    options: ["The messages are too long", "It enables user enumeration because the response reveals whether an account exists", "It is a usability improvement and not a defect", "The password should be shown so users can check it"]
    answer: [1]
    explanation: Different messages let anyone discover which emails have accounts, which helps targeted password guessing and phishing. A single neutral message such as "Email or password is incorrect" avoids this. The usability argument is tempting, but the security cost outweighs it for most products.
  - id: rwlogin-q2
    type: single
    topic: testing-login-and-authentication
    difficulty: intermediate
    prompt: The lockout rule is "lock after 5 consecutive failed attempts". Which sequence best tests the lower side of the boundary?
    options: ["5 wrong passwords, then the correct password", "4 wrong passwords, then the correct password, expecting success and a reset counter", "1 wrong password, then the correct password", "10 wrong passwords in a row"]
    answer: [1]
    explanation: Four failures is the last value before the lockout boundary, so a following correct login must succeed and reset the counter. Five failures tests the boundary itself (the other side), while one or ten failures are mid-partition values that miss off-by-one errors.
  - id: rwlogin-q3
    type: truefalse
    topic: testing-login-and-authentication
    difficulty: intermediate
    prompt: If the session cookie value is the same before and after a successful login, the application may be vulnerable to session fixation.
    options: ["True", "False"]
    answer: [0]
    explanation: True. The OWASP Session Management Cheat Sheet recommends renewing the session identifier after any privilege level change, including login. An unchanged identifier means a value planted before login could be used after it.
  - id: rwlogin-q4
    type: multiple
    topic: testing-login-and-authentication
    difficulty: advanced
    prompt: After clicking Log out, which checks confirm logout is implemented correctly? Select all that apply.
    options: ["Replaying a request with the old session cookie is rejected by the server", "The browser Back button does not show authenticated pages with live data", "The login button turns green", "Protected API calls with the old session return an unauthenticated response", "The session cookie is removed or expired in the browser"]
    answer: [0, 1, 3, 4]
    explanation: Correct logout invalidates the session on the server, so replayed cookies and API calls fail, cached authenticated pages are not usable, and the cookie is cleared. Button colour says nothing about whether the session is still valid; client-only logout that just deletes the cookie is a classic defect.
---

## Beginner-friendly explanation

A login page is the front door of an application. Testing it is not only checking that the right key opens the door. You also check that wrong keys are refused, that the door locks after too many attempts, that it doesn't tell a stranger "you have the right house, wrong key", and that when someone leaves, the door really locks behind them.

## Technical explanation

**Authentication** proves who a user is; **authorisation** decides what they may do (see [testing user permissions](/learn/manual-testing/testing-user-permissions)). After a successful login the server usually issues a **session**, often a cookie holding a random identifier. Most serious login defects are not about wrong passwords being accepted; they are about information leaks, weak lockout and poor session handling.

Security checks in this lesson are for applications you own or are explicitly authorised to test.

## Requirements

Sample specification for a web login:

1. Users sign in with email and password. Email is case-insensitive; leading and trailing spaces are trimmed.
2. On failure the page shows one message: "Email or password is incorrect."
3. After **5 consecutive failed attempts** for an account, the account is locked for **15 minutes**. A successful login resets the counter.
4. Users with MFA enabled must enter a 6-digit time-based code after the password. A code can be used only once.
5. "Remember me" keeps the user signed in for 30 days; otherwise the session ends after 30 minutes of inactivity.
6. After login, the user returns to the page they originally requested, but only for paths on the same site.
7. Logout ends the session on the server.
8. Session cookies are set with `Secure`, `HttpOnly` and `SameSite=Lax`.

## Assumptions

- The lockout counter is per account, not per browser or IP address (confirm with the Product Owner).
- The same rules apply to the login API used by the mobile app.
- The test environment uses test accounts only and allows clock or configuration changes for timeouts.
- We are authorised to perform the security checks below on this environment.

## Test design

| Technique | Applied to | Why |
|---|---|---|
| Equivalence partitioning | Credentials: valid, wrong password, unknown email, empty, malformed | One representative per behaviour class |
| Boundary value analysis | Failed-attempt counter (4, 5, 6), lockout time (just under, just over 15 min), inactivity timeout | Off-by-one errors in counters and timers |
| State transition | Active, MFA pending, Authenticated, Locked, Logged out | Login is a state machine; invalid transitions hide defects |
| Error guessing and security heuristics | Enumeration, session fixation, open redirect, credential leakage | Known high-impact failure patterns |

```mermaid
stateDiagram-v2
  [*] --> Active
  Active --> MfaPending: correct password, MFA on
  Active --> Authenticated: correct password, MFA off
  Active --> Locked: 5th consecutive failure
  MfaPending --> Authenticated: valid unused code
  Locked --> Active: 15 minutes elapse
  Authenticated --> LoggedOut: logout or timeout
  LoggedOut --> Active
```

## Sample test cases

| ID | Scenario | Type | Test data | Steps summary | Expected result |
|---|---|---|---|---|---|
| LG-01 | Valid login | Positive | active.user@example.test / valid password | Enter credentials, submit | Dashboard shown; session cookie set with Secure, HttpOnly, SameSite=Lax |
| LG-02 | Email case and spaces | Positive | " Active.User@Example.test " | Submit with valid password | Login succeeds |
| LG-03 | Wrong password vs unknown email | Security | Existing email + wrong password; unknown@example.test | Submit each; compare in DevTools | Same message, same status code, same redirect, no meaningful timing gap |
| LG-04 | Counter just below lockout | Boundary | 4 wrong, then correct | Submit 5 times | 5th attempt succeeds; counter resets |
| LG-05 | Lockout at 5th failure | Boundary | 5 wrong, then correct | Submit 6 times | Account locked; correct password refused during lockout |
| LG-06 | Lockout expiry | Boundary | Locked account | Try at 14:59 and 15:01 after lock | Refused, then allowed |
| LG-07 | MFA code reuse | Negative | Valid code already used | Log in, log out, reuse code | Code rejected |
| LG-08 | Session ID renewal | Security | Any valid account | Note cookie before and after login | Session identifier changes |
| LG-09 | Server-side logout | Security | Copied session cookie | Log out, replay request with old cookie | Server rejects; login required |
| LG-10 | Open redirect | Security | returnUrl=https://attacker.example/ | Log in via crafted link | Redirect to default page, not the external site |
| LG-11 | Lockout via API | Negative | 5 wrong attempts via API | Send to login endpoint | Same lockout applies as in UI |
| LG-12 | Empty fields | Negative | Blank email and password | Submit | Field-level required messages; no server error |

## Test data

- Accounts in each state: active without MFA, active with MFA, locked, disabled, never-verified.
- Emails with mixed case, surrounding spaces and plus addressing (user+tag@example.test).
- Passwords at the minimum and maximum allowed lengths, with Unicode and special characters.
- A crafted external return URL and a same-site path for redirect tests.
- Use reserved domains such as `example.test` so no real person receives email.

## Defects to look for

- **User enumeration** through different messages, status codes, redirects, response times or lockout messages shown only for real accounts.
- **Lockout counted per session**, so clearing cookies resets it, or lockout enforced in the UI but not the API.
- **Lockout as denial of service**: anyone can lock any user. Report the trade-off so the team chooses consciously (for example, progressive delays or CAPTCHA).
- **Session fixation**: identifier not renewed at login.
- **Client-only logout**: the cookie is deleted but the server session stays valid.
- **Open redirect** through return URL parameters.
- **Credentials in URLs or logs**, for example a form submitted with GET.
- **Missing cookie flags** (`Secure`, `HttpOnly`) on the session cookie.
- **Remember-me tokens not revoked** after password change or logout from all devices.

## Real-world example

A team testing a customer portal found that login responses were identical in text, but the developer tools showed unknown emails returned noticeably faster because the password hash was only computed for real accounts. Combined with the absence of rate limiting, this allowed account discovery at scale. The fix was to perform equivalent work for unknown accounts and add rate limiting, and the tester added a response comparison to the regression checklist.

## Common mistakes

- **Testing only valid and wrong passwords** and skipping states such as locked, disabled and MFA pending.
- **Checking the message but not the full response**: status code, headers and timing can leak too.
- **Ignoring the API**: the mobile app or scripts may bypass UI-only checks.
- **Treating logout as a UI action** without replaying the old session.
- **Running security checks against systems without authorisation.** Always test your own or approved environments.

## Key takeaways summary

Login testing combines classic techniques with a security mindset: partition credentials, test lockout and timeout boundaries, model the account states, then hunt for enumeration, session and redirect defects in an authorised environment.
