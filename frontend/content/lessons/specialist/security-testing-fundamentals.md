---
slug: security-testing-fundamentals
title: Security Testing Fundamentals
summary: Learn what security testing is, the CIA triad, the main testing types (SAST, DAST, SCA, penetration testing), how to think like an attacker inside an authorized scope, and the everyday security checks any functional tester can run.
level: beginner
duration: 40
tags: [security, owasp, dast, sast, non-functional]
objectives:
  - Explain confidentiality, integrity and availability and give a test idea for each
  - Distinguish vulnerability scanning, SAST, DAST, SCA and penetration testing
  - Describe the legal and ethical rules of authorized security testing
  - Run basic security checks on authentication, authorization, input handling and error messages
prerequisites:
  - HTTP fundamentals
  - Authentication and authorization basics
related: [owasp-top-10-for-testers, api-security-testing, authentication-and-authorization, testing-user-permissions, testing-login-and-authentication, http-fundamentals]
references:
  - title: OWASP Web Security Testing Guide
    url: https://owasp.org/www-project-web-security-testing-guide/
  - title: OWASP Top Ten project
    url: https://owasp.org/www-project-top-ten/
  - title: OWASP Application Security Verification Standard (ASVS)
    url: https://owasp.org/www-project-application-security-verification-standard/
  - title: OWASP Cheat Sheet Series
    url: https://cheatsheetseries.owasp.org/
  - title: MDN Web Docs — Web security
    url: https://developer.mozilla.org/en-US/docs/Web/Security
interview:
  - q: What is the CIA triad and how does it guide security testing?
    a: Confidentiality, integrity and availability. Confidentiality means only authorized people can read data, so I test that one user cannot see another user's records. Integrity means data cannot be changed without authorization, so I try to modify prices or other users' data through tampered requests. Availability means the system stays usable, so I check rate limiting and that malformed input cannot crash the service. Each feature gets test ideas from all three.
  - q: What is the difference between SAST, DAST and a penetration test?
    a: SAST analyses source code without running it and finds issues like dangerous functions or hard-coded secrets early, with some false positives. DAST attacks the running application from the outside, like a black-box attacker, and finds runtime issues such as missing headers or reflected injection. A penetration test is a time-boxed, human-led exercise by skilled testers who chain weaknesses together to show real impact. They complement each other; automation gives breadth and frequency, humans give depth.
  - q: What must be in place before you run any security test?
    a: Written authorization from the system owner that states the scope, which hosts, environments and techniques are allowed, the time window, and who to contact if something breaks. I test only in my own lab or an agreed test environment, never production or third-party systems without permission. I handle any data I find carefully and report findings privately through the agreed channel.
practice:
  - "Pick a feature in a demo app you run locally, such as profile editing. Write one test idea each for confidentiality, integrity and availability."
  - "Log in as user A in a local practice app, note the id in a URL such as /orders/101, then log in as user B and request the same URL. Record what should happen."
  - "Trigger an error in a local app with an unexpected input and check whether the response leaks a stack trace, SQL or version numbers."
takeaways:
  - Only test systems you own or have written permission to test, within the agreed scope.
  - Use the CIA triad to generate security test ideas for every feature.
  - SAST, DAST, SCA and penetration testing find different problems; use them together.
  - Broken access control is often found by simply changing an id and replaying a request.
  - Report vulnerabilities privately with clear impact and reproduction steps.
quiz:
  - id: secf-q1
    type: single
    topic: security-testing-fundamentals
    difficulty: beginner
    prompt: User B can open user A's invoice by changing the invoice number in the URL. Which CIA property is violated?
    options: ["Availability", "Confidentiality", "Integrity", "Non-repudiation"]
    answer: [1]
    explanation: Reading data you are not allowed to see is a confidentiality failure. Integrity would be violated if B could change the invoice, and availability if the invoice service went down.
  - id: secf-q2
    type: multiple
    topic: security-testing-fundamentals
    difficulty: intermediate
    prompt: Which techniques analyse a running application rather than its source code? Select all that apply.
    options: ["DAST", "SAST", "Penetration testing", "Code review"]
    answer: [0, 2]
    explanation: DAST and penetration testing interact with the running system. SAST and code review read the code without running it, which is why they can run earlier in development.
  - id: secf-q3
    type: truefalse
    topic: security-testing-fundamentals
    difficulty: beginner
    prompt: A public website is fair game for security scanning because anyone can visit it.
    options: ["True", "False"]
    answer: [1]
    explanation: Being able to visit a site does not authorize you to attack it. Scanning or probing without the owner's written permission can be illegal. Practise on your own lab or intentionally vulnerable apps.
  - id: secf-q4
    type: scenario
    topic: security-testing-fundamentals
    difficulty: intermediate
    prompt: A login error says "Password incorrect for this account" for a real email and "No such user" for an unknown one. What is the main risk?
    options: ["Slow logins", "Username enumeration, so attackers learn which accounts exist", "Passwords are stored in plain text", "Cross-site scripting"]
    answer: [1]
    explanation: Different messages reveal which emails are registered, which helps targeted password guessing and phishing. A generic message such as "Invalid email or password" avoids this. Nothing in the message says how passwords are stored.
---

## Beginner-friendly explanation

Imagine you are hired to check the locks of an office building. You walk around with the owner's permission, try the doors, check whether the back window closes, and see whether a visitor badge also opens the server room. You do not break in at night, and you do not try the building next door. When you find a weak lock, you tell the owner privately.

Security testing is the same idea for software. You look for ways an attacker could read data they should not see, change data they should not touch, or knock the system over, and you do it only with permission.

## Technical explanation

### The CIA triad

| Property | Meaning | Example test idea |
|---|---|---|
| Confidentiality | Only authorized parties can read data | User B requests user A's order by id |
| Integrity | Data changes only through authorized actions | Change the price field in a checkout request |
| Availability | The service stays usable | Send 100 login attempts per second and check rate limiting |

### Types of security testing

- **Vulnerability scanning:** automated tools check for known weaknesses, such as outdated server versions or missing security headers.
- **SAST (static application security testing):** analyses source code or bytecode without running it. Good for early feedback in CI.
- **DAST (dynamic application security testing):** sends crafted requests to the running application. OWASP ZAP is a common open-source example.
- **SCA (software composition analysis):** lists third-party libraries and flags those with known vulnerabilities.
- **Penetration testing:** skilled humans try to exploit and chain weaknesses inside an agreed scope to show real business impact.
- **Security code review and threat modelling:** finding design flaws before code exists, often by asking "what can go wrong?" for each data flow.

### Authorization and ethics

Professional security testing always has a written **scope**: target hosts, environments, allowed techniques, time window and contacts. Testing outside it can break laws and contracts even if your intent is good. For learning, use intentionally vulnerable apps you run locally, such as OWASP Juice Shop.

```mermaid
flowchart LR
  A[Written permission and scope] --> B[Recon and threat model]
  B --> C[Test: automated plus manual]
  C --> D[Verify and assess impact]
  D --> E[Private report]
  E --> F[Retest the fix]
```

### Checks any functional tester can do

1. **Access control:** change ids in URLs and request bodies; call admin endpoints as a normal user.
2. **Authentication:** generic login errors, lockout or rate limiting, session expiry after logout.
3. **Input handling:** special characters such as `'`, `"`, `<` and very long values must be rejected or safely encoded, never executed.
4. **Error handling:** no stack traces, SQL or version numbers in responses.
5. **Transport and cookies:** HTTPS everywhere; session cookies marked `Secure`, `HttpOnly` and with a suitable `SameSite` value.

## Code examples

Replaying a request as a different user against a local practice app with curl:

```bash
# Logged in as user B (token for B), asking for an order that belongs to user A
curl -i http://localhost:3000/api/orders/101 \
  -H "Authorization: Bearer $TOKEN_USER_B"
```

## Expected output

A secure application answers with `403 Forbidden` or `404 Not Found` and no order data:

```text
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error":"Order not found"}
```

If you get `200 OK` with user A's order, you have found broken access control. Stop, record the evidence and report it.

## Real-world example

A team building a clinic booking portal ran functional tests on every screen but never swapped user tokens. During an authorized test in the staging environment, a tester logged in as patient B and replayed patient A's appointment request. The API returned A's appointment, including the reason for the visit. The UI never showed a link to it, so nobody had noticed. The fix added an ownership check on the server, and the team added "replay with another user's token" to their API regression suite.

## Common mistakes

- **Testing without written permission**, or drifting outside the agreed scope.
- **Trusting the UI.** Hidden buttons are not security; attackers call the API directly.
- **Relying only on a scanner.** Scanners miss business-logic and access-control flaws.
- **Reporting in public channels** or including real personal data in tickets.
- **Treating security as a final phase** instead of building checks into every sprint.

## Troubleshooting

- **Scanner reports hundreds of findings.** Triage by severity and confirm each one manually; many are false positives or low risk.
- **Cannot reproduce a finding.** Record the exact request, headers, user and time; session state often matters.

## Key takeaways summary

Security testing asks how someone could read, change or break what they should not. Get permission, think in CIA terms, combine automated tools with manual checks, and report privately. Next, learn the most common web risks in [OWASP Top 10 for testers](/learn/specialist/owasp-top-10-for-testers).
