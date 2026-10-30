---
slug: owasp-top-10-for-testers
title: OWASP Top 10 for Testers
summary: "Walk through every category of the OWASP Top 10:2025, the current edition, with what each risk means, a safe test idea for an authorized lab, and how to report what you find."
level: intermediate
duration: 45
tags: [security, owasp, web-security, access-control, injection]
objectives:
  - List the ten categories of the OWASP Top 10:2025 and explain each in plain words
  - Derive at least one authorized test idea per category
  - Explain what changed from the 2021 edition
  - Map findings to an OWASP category when writing a defect report
prerequisites:
  - Security testing fundamentals
  - HTTP fundamentals
related: [security-testing-fundamentals, api-security-testing, authentication-and-authorization, testing-user-permissions, testing-file-uploads-and-downloads]
references:
  - title: OWASP Top 10:2025
    url: https://top10.owasp.org/2025
  - title: OWASP Top Ten project page
    url: https://owasp.org/www-project-top-ten/
  - title: OWASP Web Security Testing Guide
    url: https://owasp.org/www-project-web-security-testing-guide/
  - title: OWASP Cheat Sheet Series
    url: https://cheatsheetseries.owasp.org/
  - title: OWASP Juice Shop (intentionally vulnerable practice app)
    url: https://owasp.org/www-project-juice-shop/
interview:
  - q: What is the OWASP Top 10 and how do you use it as a tester?
    a: It is an awareness document from OWASP listing the ten most critical web application security risk categories, built from contributed data and a community survey. The current edition is 2025. I use it as a checklist to make sure my test plan covers the major risk areas, for example access-control tests, injection tests and misconfiguration checks, and to classify findings so developers understand them. It is not a complete standard; for detailed requirements I would use OWASP ASVS and the Web Security Testing Guide.
  - q: Which category is number one in 2025 and how would you test it?
    a: A01 Broken Access Control, which now also includes server-side request forgery. I test it by acting as one user and trying to reach another user's data by changing ids, calling admin endpoints as a normal user, changing roles or flags in requests, and, for SSRF, checking whether features that fetch a URL can be pointed at internal addresses in the lab. The expected result is always a denial enforced on the server.
  - q: What changed between the 2021 and 2025 editions?
    a: Two new categories appeared. A03 Software Supply Chain Failures widens the old Vulnerable and Outdated Components category to cover the whole build and dependency chain, and A10 Mishandling of Exceptional Conditions covers poor error handling and failing open. SSRF was folded into Broken Access Control. Security Misconfiguration moved up to second place, and some names changed, for example Authentication Failures and Security Logging and Alerting Failures.
practice:
  - "Run OWASP Juice Shop locally in Docker and find one broken access control issue. Write a defect report that names the OWASP category."
  - "For a signup form in a local practice app, write one test idea each for A05 Injection, A07 Authentication Failures and A10 Mishandling of Exceptional Conditions."
  - "List the third-party dependencies of a small project you own with your package manager's audit command and note which A03 risks it reveals."
takeaways:
  - "The current edition is OWASP Top 10:2025, led by A01 Broken Access Control."
  - "New in 2025: A03 Software Supply Chain Failures and A10 Mishandling of Exceptional Conditions."
  - Each category becomes concrete test ideas; the list is a coverage guide, not a full standard.
  - Practise only on your own lab or apps you are authorized to test.
  - Name the OWASP category in reports so developers can find the matching cheat sheet.
quiz:
  - id: owt-q1
    type: single
    topic: owasp-top-10-for-testers
    difficulty: beginner
    prompt: Which category is A01 in the OWASP Top 10:2025?
    options: ["Injection", "Broken Access Control", "Cryptographic Failures", "Security Misconfiguration"]
    answer: [1]
    explanation: Broken Access Control is A01 in both 2021 and 2025. Security Misconfiguration rose to A02 in 2025, and Injection is A05.
  - id: owt-q2
    type: multiple
    topic: owasp-top-10-for-testers
    difficulty: intermediate
    prompt: Which categories are new in the 2025 edition? Select all that apply.
    options: ["Software Supply Chain Failures", "Mishandling of Exceptional Conditions", "Insecure Design", "Server-Side Request Forgery"]
    answer: [0, 1]
    explanation: A03 Software Supply Chain Failures and A10 Mishandling of Exceptional Conditions are new. Insecure Design was introduced in 2021, and SSRF lost its own category because it is now part of Broken Access Control.
  - id: owt-q3
    type: scenario
    topic: owasp-top-10-for-testers
    difficulty: intermediate
    prompt: In your lab, when the payment provider times out, the order is marked as paid anyway. Which 2025 category fits best?
    options: ["A04 Cryptographic Failures", "A10 Mishandling of Exceptional Conditions", "A09 Security Logging and Alerting Failures", "A05 Injection"]
    answer: [1]
    explanation: The system fails open when an abnormal condition occurs, which is exactly what A10 describes. Nothing here involves encryption, logging or injected input.
  - id: owt-q4
    type: truefalse
    topic: owasp-top-10-for-testers
    difficulty: beginner
    prompt: Passing tests for all ten OWASP Top 10 categories proves an application is secure.
    options: ["True", "False"]
    answer: [1]
    explanation: The Top 10 is an awareness list of the most critical risks, not a complete standard. Business-logic flaws and many other issues fall outside it; OWASP points to ASVS for verification requirements.
---

## Beginner-friendly explanation

Think of a list of the ten most common ways houses get burgled: unlocked back doors, keys under the mat, weak window latches. A home inspector uses that list so they never forget to check the usual weak spots, even though burglars sometimes try something new.

The OWASP Top 10 is that list for web applications. OWASP (the Open Worldwide Application Security Project) is a non-profit community. Every few years it publishes the ten most critical risk categories, and testers use it to make sure they cover the usual weak spots.

## Technical explanation

The current edition is **OWASP Top 10:2025**. Use it only in a lab or on systems you are authorized to test.

| ID | Category | What it means | Authorized test idea |
|---|---|---|---|
| A01:2025 | Broken Access Control | Users act outside their permissions; includes SSRF | Request another user's record by id; call an admin API as a normal user |
| A02:2025 | Security Misconfiguration | Unsafe defaults, verbose errors, open cloud storage, missing headers | Check for default accounts, directory listings, debug pages and missing security headers |
| A03:2025 | Software Supply Chain Failures | Vulnerable or compromised dependencies, build tools and pipelines | Run a dependency audit; check that builds use pinned, verified packages |
| A04:2025 | Cryptographic Failures | Sensitive data unprotected in transit or at rest, weak algorithms | Confirm HTTPS everywhere and that passwords are never returned or logged |
| A05:2025 | Injection | Untrusted input interpreted as code or commands (SQL, OS, XSS) | Send a single quote and an HTML script tag as harmless test strings; confirm they are rejected or safely encoded |
| A06:2025 | Insecure Design | Missing security controls in the design itself | Look for business-logic abuse, such as reusing a single-use coupon many times |
| A07:2025 | Authentication Failures | Weak login, session or credential handling | Test lockout, rate limiting, session expiry and token invalidation on logout |
| A08:2025 | Software or Data Integrity Failures | Trusting data or code without verifying integrity | Tamper with a signed token or a hidden field and confirm the server rejects it |
| A09:2025 | Security Logging and Alerting Failures | Attacks are not logged or nobody is alerted | Trigger failed logins in the lab and check that they are logged and alerted |
| A10:2025 | Mishandling of Exceptional Conditions | Errors handled badly, the system fails open or leaks details | Force timeouts and malformed input; check for safe failure and generic errors |

### What changed since 2021

```mermaid
flowchart LR
  V[2021 A06 Vulnerable and Outdated Components] --> S[2025 A03 Software Supply Chain Failures]
  R[2021 A10 SSRF] --> AC[2025 A01 Broken Access Control]
  N[New category] --> X[2025 A10 Mishandling of Exceptional Conditions]
```

Security Misconfiguration moved from A05 to A02, and Injection dropped from A03 to A05.

## Code examples

A safe check for reflected input in your own lab application:

```bash
curl -s "http://localhost:3000/search?q=%3Cb%3Etest%3C%2Fb%3E" | grep -o "&lt;b&gt;test"
```

## Expected output

```text
&lt;b&gt;test
```

The search term is HTML-encoded, so a browser shows it as text instead of running it as markup. If the raw `<b>test</b>` appears in the page instead, user input reaches HTML unencoded, which is a likely A05 Injection (cross-site scripting) issue.

## Step-by-step walkthrough

1. Confirm the written scope and the test environment.
2. Map each feature to the categories it touches; a file upload touches A01, A05 and A10, for example.
3. Run automated checks: a dependency audit for A03 and a DAST scan for A02 and A05.
4. Do manual tests for A01, A06 and A07, which tools rarely catch well.
5. Report each finding with its OWASP category, impact, steps and evidence.

## Real-world example

A team running an online learning platform added a "import profile picture from URL" feature. In an authorized staging test, a tester entered the address of an internal admin service instead of an image URL, and the server fetched it. That is server-side request forgery, which the 2025 edition files under A01 Broken Access Control. The fix restricted fetches to an allowlist of external hosts, and the tester added the case to the regression suite.

## Common mistakes

- **Using an outdated edition** (2017 or 2021 numbering) in reports and training.
- **Treating the list as complete.** It is an awareness document; use ASVS for full requirements.
- **Only running a scanner.** A01 and A06 usually need a human who understands the business rules.
- **Testing payloads on systems you do not own** or outside the agreed scope.
- **Reporting without impact.** "XSS found" is weaker than "a script in a review runs in every viewer's session".

## Troubleshooting

- **Unsure which category fits.** Pick the one that describes the root cause; A01 versus A07 depends on whether the user was correctly identified but over-permitted (A01) or wrongly identified (A07).

## Key takeaways summary

The OWASP Top 10:2025 gives you ten risk areas to cover in every security test plan. Learn the categories, turn each into concrete test ideas, practise on a local lab such as Juice Shop, and report with the category name. Review the basics in [security testing fundamentals](/learn/specialist/security-testing-fundamentals).
