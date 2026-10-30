---
slug: testing-registration-and-password-reset
title: Testing registration and password reset
summary: A guided scenario for testing sign-up, email verification and forgotten-password flows - with a sample spec, technique choices, test cases, test data and the defects that matter, such as enumeration, reusable reset tokens and duplicate accounts.
level: intermediate
duration: 40
tags: [real-world, registration, password-reset, security, validation]
objectives:
  - Derive test conditions for registration, email verification and password reset from a sample specification
  - Apply equivalence partitioning and boundary value analysis to registration fields and password rules
  - Model reset tokens as a state machine and test expiry, single use and invalidation
  - Recognise high-impact defects such as user enumeration, token reuse, host header poisoning of reset links and duplicate accounts
prerequisites:
  - Testing login and authentication
  - Equivalence partitioning
related: [testing-login-and-authentication, equivalence-partitioning, boundary-value-analysis, state-transition-testing, testing-data-validation, testing-notifications]
references:
  - title: OWASP Forgot Password Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
  - title: OWASP Authentication Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
  - title: NIST SP 800-63B Digital Identity Guidelines - Authentication
    url: https://pages.nist.gov/800-63-3/sp800-63b.html
  - title: OWASP Web Security Testing Guide
    url: https://owasp.org/www-project-web-security-testing-guide/
interview:
  - q: How do you test a forgot-password feature?
    a: I test the request step, the token and the reset step separately. For the request, the response must be identical for registered and unregistered emails, and requests should be rate limited. For the token, it must be random, single use, expire after the stated time, and be invalidated when a newer token is issued or the password changes. The link must point at the real site domain regardless of request headers. For the reset step, password rules apply, the old password stops working, and depending on policy other sessions are signed out and the user is notified. All of this on an environment I am authorised to test.
  - q: What is wrong with a sign-up form that says "This email is already registered"?
    a: It confirms which emails have accounts, which is user enumeration. A safer pattern is to show the same "check your email" confirmation for all submissions, and send the existing account holder an email saying someone tried to register with their address, with a link to sign in or reset. The team may still choose the inline message for usability, but it should be a conscious, documented decision with rate limiting in place.
  - q: Which boundaries would you test for a password rule of 12 to 64 characters?
    a: Lengths 11, 12, 64 and 65, plus empty, keeping the content otherwise valid. I would also test multi-byte characters near the limits, because length might be counted in bytes instead of characters, leading spaces, and whether a very long input is silently truncated - truncation can let a user set a password they can never type again.
  - q: Two registration requests for the same email arrive at the same moment. What could go wrong and how would you test it?
    a: Both requests might pass the "email not taken" check before either is saved, creating duplicate accounts. I would send two near-simultaneous requests, for example from two browser windows or an API client, then check the database or admin view for one account only. The robust fix is a unique constraint on the normalised email, not only an application check.
practice:
  - "Draw the reset-token lifecycle as a state diagram (Issued, Used, Expired, Superseded) and write one test for each transition, including invalid ones."
  - "List ten email addresses for registration testing that cover case, plus addressing, Unicode, maximum length and invalid formats. Mark the expected result for each."
  - "Write the email content checks you would perform for the verification and reset emails, including link domain, expiry wording and what personal data must not appear."
takeaways:
  - Registration, verification and reset are separate flows with their own states; test each and their interactions.
  - Responses must not reveal whether an email is registered, in sign-up or reset.
  - Reset tokens must be unpredictable, single use, time limited and invalidated by newer tokens or a password change.
  - Normalise and uniquely constrain emails to avoid duplicate accounts.
  - Test password rule boundaries by length while keeping content valid, and watch for silent truncation.
quiz:
  - id: rwreg-q1
    type: single
    topic: testing-registration-and-password-reset
    difficulty: intermediate
    prompt: Which forgot-password response best avoids user enumeration?
    options: ["\"We have sent a link to your email\" for registered emails and \"Email not found\" for others", "\"If an account exists for that email, you will receive a reset link shortly\" for every request", "Redirect registered users to a success page and show an error inline for others", "Show nothing at all for any request"]
    answer: [1]
    explanation: A neutral message shown for every request, with the same status code and timing, does not reveal account existence. The other options leak it through wording or different redirects, and showing nothing harms usability without adding security.
  - id: rwreg-q2
    type: multiple
    topic: testing-registration-and-password-reset
    difficulty: advanced
    prompt: Which are defects in a password reset implementation? Select all that apply.
    options: ["The reset link still works after it has been used once", "An older reset link still works after a newer one was requested", "The link expires after the documented 30 minutes", "The reset link's domain changes when the request's Host header is altered", "The old password stops working after a successful reset"]
    answer: [0, 1, 3]
    explanation: Reusable tokens, superseded tokens that remain valid, and links built from an untrusted Host header (which can send the token to an attacker's domain) are all defects. Expiry at the documented time and the old password stopping working are the correct behaviours.
  - id: rwreg-q3
    type: truefalse
    topic: testing-registration-and-password-reset
    difficulty: beginner
    prompt: If a password field silently truncates input longer than 64 characters, a user can end up with a password different from the one they typed.
    options: ["True", "False"]
    answer: [0]
    explanation: True. If registration truncates but login does not, or vice versa, the stored password differs from what the user believes it is and they may be locked out. Over-long input should be rejected with a clear message, not silently altered.
  - id: rwreg-q4
    type: scenario
    topic: testing-registration-and-password-reset
    difficulty: intermediate
    prompt: A user registers as Asha@Example.test and later another registration succeeds for asha@example.test. What is the most likely root cause?
    options: ["The email field allows uppercase letters", "Emails are not normalised before the uniqueness check", "The verification email was not sent", "The password rules are too weak"]
    answer: [1]
    explanation: Email domains are case-insensitive and most providers treat the local part case-insensitively, so the system should normalise (for example lowercase and trim) before checking uniqueness. Allowing uppercase input is fine as long as it is normalised.
---

## Beginner-friendly explanation

Registration is like opening a membership at a gym, and password reset is like asking for a replacement key card. The gym should check you are who you say you are, not give two people the same membership, and never hand a replacement card to someone who just walks in and names a member. It also should not shout across the lobby "yes, that person is a member here!"

## Technical explanation

These flows rely on **email ownership**: a link with a secret token is sent to the address, and possession of the link proves control of the mailbox. That makes the **token** the key artefact. A reset token is effectively a temporary password, so it needs the same care: unpredictable, short-lived, single use, sent only to the registered address, and pointing only at the real site.

Security checks here are for your own or explicitly authorised test environments.

## Requirements

1. Registration fields: email (required, max 254 characters), display name (2–50 characters), password (12–64 characters), terms checkbox (required).
2. Emails are trimmed and compared case-insensitively; one account per email.
3. After sign-up the account is **unverified** until the user clicks a verification link valid for 24 hours.
4. Sign-up and reset requests always show: "If this email can be used, we've sent you a message." An existing account holder receives a "someone tried to register" email.
5. Reset links are valid for **30 minutes**, single use, and invalidated if a newer link is requested.
6. After a successful reset, all other sessions are signed out and a confirmation email is sent.
7. Max 5 reset requests per email per hour.

## Assumptions

- Passwords are checked against a list of commonly used or breached passwords (a practice recommended in NIST SP 800-63B); confirm which list and message.
- The test environment routes all email to a test mailbox; no real users are contacted.
- Time can be advanced or token expiry configured for testing.

## Test design

| Technique | Applied to | Why |
|---|---|---|
| Equivalence partitioning | Email formats, display names, password classes | Cover each validity class with one representative |
| Boundary value analysis | Field lengths, 24-hour and 30-minute expiries, 5-requests limit | Off-by-one errors in lengths and timers |
| State transition | Account (Unverified, Verified) and token (Issued, Used, Expired, Superseded) | Most reset defects are invalid transitions that succeed |
| Error guessing | Enumeration, race conditions, header manipulation | Known failure patterns for these flows |

```mermaid
stateDiagram-v2
  [*] --> Issued: reset requested
  Issued --> Used: password set
  Issued --> Expired: 30 minutes pass
  Issued --> Superseded: newer link requested
  Used --> [*]
  Expired --> [*]
  Superseded --> [*]
```

Only the Issued state may lead to a password change. Every other state must reject the link.

## Sample test cases

| ID | Scenario | Type | Test data | Steps summary | Expected result |
|---|---|---|---|---|---|
| RG-01 | Successful sign-up and verification | Positive | new.user@example.test, valid fields | Register, open email, click link | Account becomes verified; can log in |
| RG-02 | Duplicate email with different case | Negative | Existing Asha@Example.test, register asha@example.test | Submit | Neutral message shown; no second account; owner gets notice email |
| RG-03 | Password length boundaries | Boundary | Lengths 11, 12, 64, 65 | Submit each with otherwise valid data | 11 and 65 rejected with clear message; 12 and 64 accepted; no truncation |
| RG-04 | Verification link expiry | Boundary | Link aged 23:59 and 24:01 | Open link | First verifies; second shows expired with resend option |
| RG-05 | Reset for unregistered email | Security | nobody@example.test | Request reset | Same message, status and timing as for a registered email |
| RG-06 | Reset link single use | Negative | Valid link | Reset password, open link again | Second use rejected |
| RG-07 | Superseded link | Negative | Two links requested in order | Use the first link | Rejected; only newest works |
| RG-08 | Reset link expiry | Boundary | Link aged 29 and 31 minutes | Open and submit | First works; second rejected |
| RG-09 | Host header manipulation | Security | Request with altered Host header (authorised env) | Request reset, inspect email | Link still points to the real site domain |
| RG-10 | Sessions after reset | Positive | User logged in on two browsers | Reset in one | Other session signed out; confirmation email sent |
| RG-11 | Rate limit | Boundary | 5 then 6 requests in an hour | Request repeatedly | 6th throttled with the same neutral message |
| RG-12 | Concurrent sign-up | Negative | Same email, two simultaneous submits | Submit from two windows | Exactly one account exists |

## Test data

- Emails: mixed case, surrounding spaces, plus addressing, a 254-character address, internationalised domain, and invalid forms (missing @, double dots).
- Display names: 1, 2, 50 and 51 characters; names with apostrophes and accents (O'Brien, Zoë).
- Passwords: boundary lengths, multi-byte characters, a known commonly used password, a passphrase with spaces.
- Accounts: unverified, verified, disabled, with an outstanding reset token.
- A test mailbox that captures all outbound email.

## Defects to look for

- **User enumeration** in sign-up, reset or resend-verification responses, status codes or timing.
- **Reusable or long-lived reset tokens**, or tokens not invalidated by a newer request or password change.
- **Predictable tokens**, such as sequential numbers or timestamps.
- **Reset link built from the request Host header**, which can send a valid token to another domain.
- **Token leakage** to third parties, for example a reset page that loads external scripts while the token is in the URL.
- **Duplicate accounts** from case differences or race conditions.
- **Silent truncation** of passwords or names.
- **Login allowed before verification** when the spec requires verification.
- **Old sessions surviving a reset**, leaving a compromised session active.

## Real-world example

A team testing a community forum found that the reset flow showed a neutral message, but the "resend verification email" endpoint returned "Account already verified" for existing users. The enumeration hole was in the flow nobody thought was security-related. The tester added every email-driven endpoint (sign-up, reset, resend verification, change email) to a single comparison checklist.

## Common mistakes

- **Testing only the happy path** of one link click.
- **Not reading the emails**: wrong domain, missing expiry wording, or personal data in the subject line.
- **Using real email domains** in test data, which can contact real people.
- **Forgetting the change-email flow**, which has the same token risks.
- **Assuming the UI limits are the server limits.** Confirm length and format rules through the API too.

## Key takeaways summary

Treat registration and reset as token-driven state machines. Test every state of the token, keep responses neutral, normalise identifiers, and probe concurrency and header handling in an authorised environment.
