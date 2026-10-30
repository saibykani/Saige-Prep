---
slug: authentication-and-authorization
title: Authentication and Authorization for APIs
summary: Learn how APIs establish who is calling and what they may do — Basic auth, API keys, OAuth 2.0 client credentials and authorization code with PKCE, JWT structure, validation pitfalls and token refresh.
level: intermediate
duration: 40
tags: [api, security, oauth, jwt, authentication]
objectives:
  - Distinguish authentication from authorization and map each to 401 and 403
  - Explain how Basic auth, API keys and bearer tokens are sent and what risks each carries
  - Describe the OAuth 2.0 client credentials and authorization code with PKCE flows
  - Decode a JWT and list the checks a server must perform before trusting it
  - Design tests for token expiry, refresh and permission boundaries
prerequisites:
  - HTTP requests, responses and methods
  - HTTP status codes
related: [http-status-codes, api-security-testing, postman-tests-and-request-chaining, restassured-fundamentals]
references:
  - title: OAuth 2.0 (oauth.net)
    url: https://oauth.net/2/
  - title: RFC 6749 — The OAuth 2.0 Authorization Framework
    url: https://datatracker.ietf.org/doc/html/rfc6749
  - title: RFC 7636 — Proof Key for Code Exchange (PKCE)
    url: https://datatracker.ietf.org/doc/html/rfc7636
  - title: RFC 7519 — JSON Web Token (JWT)
    url: https://datatracker.ietf.org/doc/html/rfc7519
  - title: MDN Web Docs — HTTP authentication
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP
interview:
  - q: Which OAuth 2.0 flow would you use for a nightly job calling another service, and which for a mobile app acting for a user?
    a: "The nightly job has no user, so client credentials — the job authenticates with its own client id and secret at the token endpoint and receives an access token for its own permissions. A mobile app is a public client that cannot keep a secret, so authorization code with PKCE — the user signs in at the authorization server, the app receives a short-lived code and exchanges it together with the code_verifier. Implicit and resource owner password grants are discouraged by current OAuth security guidance."
  - q: A JWT looks valid when you decode it on a JWT debugger site. Is it trustworthy?
    a: "No. Decoding only base64url-decodes the header and payload; anyone can create a token that decodes nicely. Trust requires verifying the signature with the expected key and an allow-listed algorithm, then checking exp, nbf, iss and aud. I also wouldn't paste production tokens into third-party websites because they are live credentials."
  - q: How do you test token refresh?
    a: "Obtain an access token and refresh token, let the access token expire (or use a short-lived token in a test environment), confirm the API returns 401, call the token endpoint with grant_type=refresh_token and confirm a new access token works. Then test negatives — a revoked or reused refresh token (if rotation is enabled), a refresh token for another client, and a refresh after logout should all fail."
  - q: Why is authorization testing harder than authentication testing?
    a: "Authentication is mostly one gate per request. Authorization is per user, per resource and per action, so the number of combinations grows quickly. Broken object level authorization — user A reading user B's order by changing an id — is a classic gap. I build a role-by-endpoint matrix and test with at least two users of each role so I can try cross-account access."
practice:
  - "Using the local mock API in the Practice Lab, call a protected endpoint with Basic auth, with an API key header and with a bearer token, and record what happens when each credential is missing or wrong."
  - "Obtain a token from the mock API's token endpoint using the client credentials grant, decode its header and payload locally, and list each claim and its purpose."
  - "With two test users, attempt to read and update each other's resources and record the status codes. Write a defect report for any cross-account access that succeeds."
takeaways:
  - Authentication proves identity (401 when it fails); authorization decides permission (403 when it fails).
  - Basic auth and API keys are only safe over HTTPS and should be treated as secrets in tests and logs.
  - Use client credentials for machine-to-machine calls and authorization code with PKCE for user-facing clients.
  - A JWT is signed, not encrypted by default; servers must verify the signature with an allow-listed algorithm and check exp, iss and aud.
  - Test expiry, refresh, revocation and cross-user access, not just the happy-path login.
quiz:
  - id: authn-q1
    type: single
    topic: authentication-and-authorization
    difficulty: intermediate
    prompt: What problem does PKCE solve in the authorization code flow?
    options: ["It encrypts the access token", "It stops an attacker who intercepts the authorization code from exchanging it for tokens", "It removes the need for HTTPS", "It lets the client skip the user login"]
    answer: [1]
    explanation: The client sends a hashed code_challenge at the start and must present the matching code_verifier when redeeming the code, so a stolen code alone is useless. PKCE does not encrypt tokens, and HTTPS is still required.
  - id: authn-q2
    type: multiple
    topic: authentication-and-authorization
    difficulty: advanced
    prompt: Which checks must an API perform before trusting a JWT access token? Select all that apply.
    options: ["Verify the signature with the expected key", "Accept whatever algorithm the token header names", "Check that exp is in the future", "Check iss and aud match expected values", "Check the token decodes as valid base64url"]
    answer: [0, 2, 3]
    explanation: Trusting the header's alg is the root of the 'alg none' and algorithm-confusion attacks; the server must use an allow-list. Successful decoding proves nothing because anyone can encode a payload. Signature, expiry, issuer and audience checks are required.
  - id: authn-q3
    type: truefalse
    topic: authentication-and-authorization
    difficulty: beginner
    prompt: The payload of a standard signed JWT (JWS) can be read by anyone who has the token.
    options: ["True", "False"]
    answer: [0]
    explanation: The header and payload are only base64url-encoded, not encrypted. Never put secrets in JWT claims unless the token is encrypted (JWE).
  - id: authn-q4
    type: scenario
    topic: authentication-and-authorization
    difficulty: intermediate
    prompt: A scheduled reconciliation service with no human user needs to call the billing API. Which grant type fits best?
    options: ["Authorization code with PKCE", "Client credentials", "Implicit", "Resource owner password credentials"]
    answer: [1]
    explanation: Client credentials is designed for a client acting on its own behalf. Authorization code with PKCE is for acting on behalf of a signed-in user, and implicit and password grants are discouraged by current security guidance.
---

## Beginner-friendly explanation

At an office building, the reception desk checks your ID and gives you a visitor badge. That is **authentication**: proving who you are. Later, your badge opens the meeting room on floor 2 but not the server room. That is **authorization**: deciding what you're allowed to do.

APIs work the same way. Every request carries some kind of badge: a password, a key or a token. The API first checks that the badge is genuine, then checks whether the badge's owner may perform this action on this particular piece of data. Testers check both gates, and especially the second one, because that is where serious data leaks happen.

## Technical explanation

| Concept | Question | Failure status |
|---|---|---|
| Authentication | Who is calling? | `401 Unauthorized` + `WWW-Authenticate` |
| Authorization | May they do this to this resource? | `403 Forbidden` (or `404` to hide existence, if documented) |

### Common schemes

- **Basic** (RFC 7617): `Authorization: Basic base64(username:password)`. Base64 is encoding, not encryption, so it is only acceptable over HTTPS.
- **API key**: a static secret in a header such as `X-API-Key`. Simple, but keys identify an application rather than a user, rarely expire and leak easily if sent in query strings.
- **Bearer token** (RFC 6750): `Authorization: Bearer <token>`. Whoever holds the token can use it, so tokens are short-lived.

### OAuth 2.0

OAuth 2.0 (RFC 6749) is a **delegated authorization** framework: an authorization server issues access tokens that a resource server (the API) accepts. Key grants:

- **Client credentials**: a confidential client authenticates with its own id and secret and gets a token for itself. No user involved; used for service-to-service calls.
- **Authorization code with PKCE** (RFC 7636): the user signs in at the authorization server, the client receives a one-time code and exchanges it for tokens. PKCE binds the code to the client that started the flow.
- **Refresh token**: exchanged at the token endpoint (`grant_type=refresh_token`) for a new access token without asking the user to sign in again.

The implicit and resource owner password grants are discouraged by the OAuth 2.0 Security Best Current Practice (RFC 9700).

```mermaid
sequenceDiagram
    participant U as User
    participant App as Client app
    participant AS as Authorization server
    participant API as Resource server (API)
    App->>App: create code_verifier and code_challenge = SHA256(verifier)
    App->>AS: GET /authorize (response_type=code, code_challenge, S256, state)
    AS->>U: login and consent page
    U->>AS: credentials and consent
    AS-->>App: redirect with code and state
    App->>AS: POST /token (grant_type=authorization_code, code, code_verifier)
    AS-->>App: access_token, refresh_token, expires_in
    App->>API: GET /orders (Authorization: Bearer access_token)
    API-->>App: 200 OK
```

### JWT structure and validation

A JWT (RFC 7519) in its common signed form is three base64url parts separated by dots: `header.payload.signature`. The header names the algorithm (`alg`, e.g. `RS256`) and often a key id (`kid`). The payload holds **claims** such as `sub` (subject), `iss` (issuer), `aud` (audience), `exp` (expiry), `iat` and `scope`.

A server must, at minimum:

1. Verify the signature using a key it trusts, with an **allow-list of algorithms** (never trust `alg` blindly; reject `none`).
2. Check `exp` and `nbf` with a small clock-skew tolerance.
3. Check `iss` and `aud` match this API.
4. Check scopes or roles for the requested action.

Known pitfalls: accepting `alg: none`, algorithm confusion (an RS256 public key used as an HS256 secret), skipping `aud` checks so a token for another API is accepted, and putting sensitive data in claims.

## Real-world example

A team building an internal reporting API validated JWT signatures and expiry but not the `aud` claim. Every service in the company used the same identity provider. A token issued for a low-risk wiki integration was therefore accepted by the reporting API, granting access to financial reports.

A tester found it by requesting a token for a different audience in the test environment and calling the reporting API with it. The expected `401` came back as `200`. Adding an audience check closed the gap.

## Step-by-step walkthrough

1. **Build an access matrix**: roles down the side, endpoints and actions across, expected status in each cell.
2. **Test authentication negatives**: no header, malformed header, wrong scheme, expired token, token with a tampered payload, token signed by another key.
3. **Test authorization**: each role against each action; then the same role against *another user's* resource ids.
4. **Test token lifecycle**: expiry, refresh, refresh after logout or revocation, reuse of a rotated refresh token.
5. **Check hygiene**: credentials never in URLs or response bodies, error messages that don't say whether the username or password was wrong.

## Code examples

Client credentials with `curl`, then calling the API:

```bash
curl -s -X POST http://localhost:8080/oauth/token \
  -u "$CLIENT_ID:$CLIENT_SECRET" \
  -d "grant_type=client_credentials&scope=orders.read"

curl -i http://localhost:8080/orders -H "Authorization: Bearer $ACCESS_TOKEN"
```

Decoding a JWT payload locally (inspection only, this does not verify anything):

```python
import base64, json

def decode_part(part: str) -> dict:
    padded = part + "=" * (-len(part) % 4)
    return json.loads(base64.urlsafe_b64decode(padded))

header, payload, _signature = token.split(".")
print(decode_part(header))
print(decode_part(payload))
```

## Expected output

The token endpoint returns JSON like this (values differ):

```text
{"access_token":"eyJhbGciOiJSUzI1NiIsImtpZCI6ImsxIn0...","token_type":"Bearer","expires_in":3600,"scope":"orders.read"}
```

The decoder prints something like `{'alg': 'RS256', 'kid': 'k1'}` and a payload with `iss`, `aud`, `sub`, `exp` and `scope`.

## Common mistakes

- **Testing only valid credentials.** Most auth defects are in the negative paths.
- **Confusing 401 and 403** in expectations.
- **Testing authorization with a single user per role.** You need two users to test cross-account access.
- **Pasting real tokens into online debuggers** or committing them to collections and repositories.
- **Assuming a decodable JWT is a valid JWT.**
- **Hardcoding long-lived tokens in tests**, which then fail when they expire or hide refresh defects.

## Troubleshooting

- **Valid token, still 401**: check clock skew, audience, issuer and whether the API expects a different scheme or header name.
- **403 for an action you expected to work**: inspect the token's scopes or roles; the token may have been requested with too narrow a scope.
- **`invalid_grant` from the token endpoint**: the code or refresh token was already used, expired, or the PKCE verifier doesn't match.

## Key takeaways summary

Authentication and authorization are separate gates with separate status codes. Know how each scheme sends credentials, choose the right OAuth grant for the client type, never trust a JWT without full validation, and test the token lifecycle and cross-user access as rigorously as the login itself.
