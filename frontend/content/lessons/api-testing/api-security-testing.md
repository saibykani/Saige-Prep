---
slug: api-security-testing
title: API Security Testing
summary: A functional API tester's guide to security checks - broken object and function level authorization, authentication flaws, excessive data exposure, mass assignment, rate limits and injection - mapped to the OWASP API Security Top 10, for authorized testing only.
level: advanced
duration: 40
tags: [api, security, owasp, authorization]
objectives:
  - Name the main risks in the OWASP API Security Top 10 (2023)
  - Design authorization tests for object-level and function-level access
  - Test authentication, token handling, mass assignment and data exposure
  - Work within an authorized scope and report security defects responsibly
prerequisites:
  - Authentication and authorization
  - API negative and boundary testing
related: [authentication-and-authorization, api-negative-and-boundary-testing, testing-user-permissions, idempotency-retries-rate-limiting, http-status-codes]
references:
  - title: OWASP API Security Top 10
    url: https://owasp.org/API-Security/
  - title: OWASP Web Security Testing Guide
    url: https://owasp.org/www-project-web-security-testing-guide/
  - title: OWASP Cheat Sheet Series
    url: https://cheatsheetseries.owasp.org/
  - title: MDN Web Docs — HTTP authentication
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
interview:
  - q: What is BOLA and how do you test for it?
    a: Broken Object Level Authorization, the first item in the OWASP API Security Top 10. The API checks that you are logged in but not that the object you are asking for belongs to you. I test it with two users of the same role - user A creates or owns a resource, then user B requests, updates and deletes it by ID with B's token. Any success is a defect. I repeat for every endpoint that takes an object ID, including nested ones like /accounts/{id}/statements.
  - q: What is mass assignment?
    a: The API binds client JSON directly onto an internal object, so a client can set fields it should never control, such as role, isVerified or balance. I test it by adding such fields to create and update requests and then reading the object back to see if they changed. The fix is an explicit allow-list of writable fields, for example request models that forbid unknown fields.
  - q: As a QA engineer, what is the boundary of your security testing?
    a: I only test systems and environments I am explicitly authorized to test, within an agreed scope, normally a test environment, with written permission for anything beyond normal functional testing. I avoid denial-of-service style load, real customer data, and third-party systems. I report findings privately through the agreed channel, not in public trackers, and with enough detail to reproduce.
  - q: How do you test that an API does not over-expose data?
    a: I compare each response with what the client actually needs and the role is allowed to see. I look for sensitive fields such as password hashes, internal IDs, other users' emails, tokens or full card numbers, both in normal responses and in error messages. Filtering in the frontend is not enough; the API must not send it.
practice:
  - "With two test users in your own lab app, try reading, updating and deleting each other's resources by ID. Record each response."
  - "Add role and isAdmin fields to a profile update request in your own app and check whether they persist."
  - "Map ten endpoints of a sample API to the OWASP API Top 10 risk each could suffer from."
takeaways:
  - Authorization flaws (object, property and function level) are the most common serious API defects.
  - Always test with at least two users and two roles.
  - Send unexpected fields to catch mass assignment; read the object back.
  - Responses and errors must not include data the client doesn't need.
  - Test only with authorization and scope; report privately.
quiz:
  - id: apisec-q1
    type: scenario
    topic: api-security-testing
    difficulty: intermediate
    prompt: User B, a normal customer, calls GET /api/invoices/9001 with B's own valid token and receives User A's invoice. Which OWASP API risk is this?
    options: ["API1 Broken Object Level Authorization", "API4 Unrestricted Resource Consumption", "API8 Security Misconfiguration", "API9 Improper Inventory Management"]
    answer: [0]
    explanation: B is authenticated but not authorized for that specific object. That is BOLA. The others concern resource limits, configuration and undocumented API versions.
  - id: apisec-q2
    type: single
    topic: api-security-testing
    difficulty: intermediate
    prompt: "A PATCH /users/me request with {\"name\":\"Ravi\",\"role\":\"admin\"} returns 200, and GET /users/me now shows role admin. What is this?"
    options: ["BOLA", "Mass assignment (broken object property level authorization)", "Injection", "Rate limiting failure"]
    answer: [1]
    explanation: The client set a property it should not control. OWASP 2023 groups mass assignment and excessive data exposure as API3 Broken Object Property Level Authorization.
  - id: apisec-q3
    type: multiple
    topic: api-security-testing
    difficulty: advanced
    prompt: Which are appropriate authentication tests for a token-protected API? Select all that apply.
    options: ["Call with no token", "Call with an expired token", "Call with a token whose signature has been altered", "Call after logout with the old token, if the design supports revocation", "Brute-force a real customer's password in production"]
    answer: [0, 1, 2, 3]
    explanation: Missing, expired, tampered and revoked tokens are standard checks in an authorized test environment. Attacking real accounts in production is never acceptable without explicit, specific authorization.
  - id: apisec-q4
    type: truefalse
    topic: api-security-testing
    difficulty: beginner
    prompt: If the mobile app hides a user's date of birth, it is fine for the API response to include it.
    options: ["True", "False"]
    answer: [1]
    explanation: Anyone can read raw API responses with a proxy or DevTools. If a client should not see a field, the API must not send it.
---

## Beginner-friendly explanation

Picture a bank's safe-deposit room. Your key opens **your** box. A secure bank checks your key against **that specific box** every time. An insecure bank only checks that you are a customer, then lets you open any box whose number you type in.

APIs are like that room. Most serious API security defects are not exotic hacking; they are missing checks: "is this user allowed to see **this** record?", "is this user allowed to call **this** admin function?", "should the client be allowed to set **this** field?". A functional tester who thinks like this finds real vulnerabilities with ordinary tools like Postman.

**Ethics first:** only test systems you own or have written permission to test, within the agreed scope, in a test environment.

## Technical explanation

The **OWASP API Security Top 10 (2023)** is the standard list of API risks:

| ID | Risk | What a tester checks |
|---|---|---|
| API1 | Broken Object Level Authorization (BOLA) | User B accessing user A's object by ID |
| API2 | Broken Authentication | Missing/expired/tampered tokens, weak login protections |
| API3 | Broken Object Property Level Authorization | Mass assignment; over-exposed fields in responses |
| API4 | Unrestricted Resource Consumption | No rate limits, huge page sizes, giant uploads |
| API5 | Broken Function Level Authorization | Normal user calling admin endpoints |
| API6 | Unrestricted Access to Sensitive Business Flows | Automating flows like bulk buying or coupon abuse |
| API7 | Server Side Request Forgery (SSRF) | API fetching a user-supplied URL without restriction |
| API8 | Security Misconfiguration | Verbose errors, permissive CORS, missing TLS, debug endpoints |
| API9 | Improper Inventory Management | Old versions (`/v1`) still live without fixes |
| API10 | Unsafe Consumption of APIs | Trusting third-party API data without validation |

Key distinctions:

- **401 Unauthorized** — not authenticated (no or invalid credentials).
- **403 Forbidden** — authenticated but not allowed. Some APIs return **404** for others' objects to avoid revealing they exist; either is fine if consistent.
- **Object level** (which record) versus **function level** (which operation) authorization.

```mermaid
flowchart TD
  T[Pick an endpoint] --> A{Takes an object ID?}
  A -- Yes --> BOLA[Test with another user's ID]
  A -- No --> F
  BOLA --> F{Privileged function?}
  F -- Yes --> BFLA[Call it as a low-privilege user]
  F -- No --> W
  BFLA --> W{Accepts a body?}
  W -- Yes --> MA[Add role/price/owner fields, read back]
  W -- No --> R
  MA --> R[Check response for excess data and leaky errors]
```

## Real-world example

A fitness app's API had `GET /api/users/{id}/workouts`. The UI only ever requested the logged-in user's ID. A tester on the team, in the staging environment, created two accounts and replaced the ID with the other account's. The API returned the other user's workouts, including GPS routes that revealed home addresses.

The same tester tried `PATCH /api/users/me` with `"subscription":"premium"` added to the body. It persisted — free users could upgrade themselves. Both were found with Postman in under an hour, and both were fixed by adding ownership checks and an explicit allow-list of writable fields.

## Step-by-step walkthrough

1. **Confirm scope and permission** in writing: environment, endpoints, techniques, dates.
2. **Create test users:** two per role, plus an admin.
3. **Inventory endpoints** from the OpenAPI spec and from traffic (including old versions).
4. **Authentication tests:** no token, malformed, expired, tampered signature, token from another environment, token after logout or password change.
5. **BOLA tests:** for every ID parameter, swap in another user's ID for GET, PUT/PATCH and DELETE.
6. **Function-level tests:** call admin and internal endpoints as a normal user.
7. **Property-level tests:** add privileged fields to writes; inspect reads for excess fields.
8. **Resource tests:** very large `pageSize`, large payloads, and a gentle check that rate limiting exists (429) — without overloading shared environments.
9. **Injection and misconfiguration:** special characters in inputs (should be handled safely), error bodies without stack traces, CORS headers per policy.
10. **Report privately** with exact requests, responses and impact.

### Sample test cases

| ID | Request | As | Expected |
|---|---|---|---|
| SEC-01 | GET /orders/{A's id} | User B | 403 or 404 |
| SEC-02 | DELETE /orders/{A's id} | User B | 403 or 404; order still exists |
| SEC-03 | GET /admin/users | Customer | 403 |
| SEC-04 | PATCH /users/me with `role` | Customer | 400, or field ignored; role unchanged |
| SEC-05 | GET /users/me | Customer | No password hash or internal flags |
| SEC-06 | Any endpoint, expired token | Anyone | 401 |
| SEC-07 | GET /orders?pageSize=100000 | Customer | Capped or 400 |

## Code examples

A RestAssured BOLA check that runs for every user pair:

```java
@Test
public void userCannotReadAnotherUsersOrder() {
    String orderId = given().auth().oauth2(tokenA)
        .contentType(ContentType.JSON).body(validOrder)
        .post("/orders").then().statusCode(201)
        .extract().path("id");

    given().auth().oauth2(tokenB)
    .when().get("/orders/{id}", orderId)
    .then().statusCode(anyOf(is(403), is(404)));
}
```

## Common mistakes

- **Testing with one user.** BOLA is invisible without a second account.
- **Trusting the UI** to hide fields or buttons.
- **Checking only status codes** for writes — read the object back.
- **Running scanners or heavy load** against shared or third-party systems without permission.
- **Filing security defects in public trackers** with full exploit details.

## Key takeaways summary

Most API security defects are missing authorization checks. With two users per role, a list of endpoints and the OWASP API Top 10 as a checklist, a functional tester can find serious issues — always within authorized scope, and reported responsibly.
