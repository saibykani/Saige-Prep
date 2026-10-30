/** Reference content for the QA Toolkit. */

export const HTTP_STATUSES: { code: number; name: string; meaning: string; testing: string }[] = [
  { code: 200, name: "OK", meaning: "The request succeeded.", testing: "Check the body and headers too — a 200 with an error message in the body is a defect." },
  { code: 201, name: "Created", meaning: "A new resource was created.", testing: "Expect a Location header (or the new id) and verify the resource really exists with a follow-up GET." },
  { code: 202, name: "Accepted", meaning: "Accepted for asynchronous processing; not finished yet.", testing: "Poll the status endpoint and assert the final outcome; don't treat 202 as success of the work itself." },
  { code: 204, name: "No Content", meaning: "Success with no response body.", testing: "Assert the body is empty; common for DELETE and some PUTs." },
  { code: 301, name: "Moved Permanently", meaning: "The resource has a new permanent URL.", testing: "Check the Location header; clients and SEO cache this, so it's hard to undo." },
  { code: 302, name: "Found", meaning: "Temporary redirect.", testing: "Common after login. Check the target, and that open redirects (redirecting to arbitrary external URLs) are blocked." },
  { code: 304, name: "Not Modified", meaning: "Cached version is still valid (conditional request).", testing: "Send If-None-Match with the ETag and expect 304 with no body." },
  { code: 307, name: "Temporary Redirect", meaning: "Temporary redirect that keeps the HTTP method.", testing: "Verify a POST stays a POST after redirect." },
  { code: 308, name: "Permanent Redirect", meaning: "Permanent redirect that keeps the method.", testing: "Like 301 but the method and body must be preserved." },
  { code: 400, name: "Bad Request", meaning: "The request is malformed (bad syntax, invalid parameters).", testing: "Send broken JSON, wrong types and missing fields; expect clear, non-leaky error messages." },
  { code: 401, name: "Unauthorized", meaning: "Not authenticated: missing or invalid credentials.", testing: "No token, expired token, malformed token. Should include WWW-Authenticate. Contrast with 403." },
  { code: 403, name: "Forbidden", meaning: "Authenticated but not allowed.", testing: "Try every role against every protected action; try other users' resources (object-level authorization)." },
  { code: 404, name: "Not Found", meaning: "The resource does not exist (or is hidden).", testing: "Some APIs return 404 instead of 403 to avoid revealing that a resource exists — check the spec." },
  { code: 405, name: "Method Not Allowed", meaning: "The method isn't supported for this URL.", testing: "Should include an Allow header listing supported methods." },
  { code: 406, name: "Not Acceptable", meaning: "Can't produce a response matching the Accept header.", testing: "Send Accept: application/xml to a JSON-only API." },
  { code: 408, name: "Request Timeout", meaning: "The server timed out waiting for the request.", testing: "Usually tested with slow clients; check retries don't duplicate actions." },
  { code: 409, name: "Conflict", meaning: "Conflicts with the current state (duplicate, version clash).", testing: "Create duplicates, edit with a stale version, act on an already-cancelled order." },
  { code: 410, name: "Gone", meaning: "Permanently removed.", testing: "Deprecated endpoints or deleted resources that will never return." },
  { code: 412, name: "Precondition Failed", meaning: "A conditional header (e.g. If-Match) didn't match.", testing: "Optimistic locking: update with an old ETag and expect 412." },
  { code: 413, name: "Content Too Large", meaning: "The request body is too large.", testing: "Upload files just over the limit (boundary value analysis!)." },
  { code: 415, name: "Unsupported Media Type", meaning: "The body's Content-Type isn't supported.", testing: "Send JSON without Content-Type: application/json, or send form data to a JSON API." },
  { code: 422, name: "Unprocessable Content", meaning: "Well-formed request with semantic validation errors.", testing: "Negative price, invalid email, end date before start date. Errors should name the field." },
  { code: 429, name: "Too Many Requests", meaning: "Rate limit exceeded.", testing: "Exceed the limit, check Retry-After, and verify the limit resets. Only test systems you're authorised to." },
  { code: 500, name: "Internal Server Error", meaning: "Unexpected server failure.", testing: "Always a defect to investigate. The response must not leak stack traces or secrets." },
  { code: 502, name: "Bad Gateway", meaning: "A gateway/proxy got an invalid response upstream.", testing: "Often seen when a downstream service is down; check the error is handled gracefully." },
  { code: 503, name: "Service Unavailable", meaning: "Temporarily overloaded or in maintenance.", testing: "Check readiness probes, Retry-After and client retry behaviour." },
  { code: 504, name: "Gateway Timeout", meaning: "A gateway timed out waiting upstream.", testing: "Look for slow dependencies; check timeouts are configured consistently across layers." },
];

export const HTTP_HEADERS: { name: string; direction: "Request" | "Response" | "Both"; purpose: string; testing: string }[] = [
  { name: "Content-Type", direction: "Both", purpose: "Media type of the body, e.g. application/json; charset=utf-8.", testing: "Wrong or missing type should give 415 (request) — and responses must declare the right type." },
  { name: "Accept", direction: "Request", purpose: "Which response formats the client accepts.", testing: "Unsupported Accept values should give 406 or a sensible default." },
  { name: "Authorization", direction: "Request", purpose: "Credentials, e.g. Bearer <token>.", testing: "Missing, expired, malformed and other-user tokens. Never log full tokens." },
  { name: "WWW-Authenticate", direction: "Response", purpose: "Tells the client how to authenticate (sent with 401).", testing: "Present on 401 responses." },
  { name: "Cache-Control", direction: "Both", purpose: "Caching rules (no-store, max-age…).", testing: "Responses with personal data should be no-store; static assets cacheable." },
  { name: "ETag / If-None-Match", direction: "Both", purpose: "Version identifier for caching and conditional requests.", testing: "Expect 304 when the ETag matches; 412 with If-Match on a stale version." },
  { name: "Location", direction: "Response", purpose: "URL of a created resource (201) or a redirect target (3xx).", testing: "Follow it and verify the resource exists." },
  { name: "Retry-After", direction: "Response", purpose: "How long to wait before retrying (429, 503).", testing: "Check it's present and the client honours it." },
  { name: "Set-Cookie / Cookie", direction: "Both", purpose: "Session and preference cookies.", testing: "Session cookies need HttpOnly, Secure (on HTTPS) and an appropriate SameSite value." },
  { name: "Origin", direction: "Request", purpose: "Origin of a cross-site request (used by CORS).", testing: "Requests from unexpected origins must not be allowed by CORS." },
  { name: "Access-Control-Allow-Origin", direction: "Response", purpose: "Which origins may read the response (CORS).", testing: "Avoid * together with credentials; check it only lists trusted origins." },
  { name: "Strict-Transport-Security", direction: "Response", purpose: "Forces browsers to use HTTPS.", testing: "Present on HTTPS production responses." },
  { name: "Content-Security-Policy", direction: "Response", purpose: "Restricts where scripts and resources can load from.", testing: "Helps mitigate XSS; check it isn't overly permissive (e.g. unsafe-inline everywhere)." },
  { name: "X-Content-Type-Options", direction: "Response", purpose: "nosniff stops browsers guessing content types.", testing: "Expect nosniff on responses." },
  { name: "Idempotency-Key", direction: "Request", purpose: "Lets a server safely de-duplicate retried requests (an emerging convention used by many payment APIs).", testing: "Repeat the same request with the same key: one charge, same response." },
  { name: "X-Request-ID", direction: "Both", purpose: "Correlation id for tracing a request through logs (a common convention, not a standard).", testing: "Use it to find the server-side logs for a failing request." },
];

export const SQL_SNIPPETS: { title: string; sql: string; note: string }[] = [
  { title: "Filter and sort", sql: "SELECT id, email, created_at\nFROM customers\nWHERE country = 'IN'\nORDER BY created_at DESC\nLIMIT 20;", note: "Always limit exploratory queries on large tables." },
  { title: "Inner vs left join", sql: "-- Only customers WITH orders\nSELECT c.id, o.id AS order_id\nFROM customers c\nJOIN orders o ON o.customer_id = c.id;\n\n-- ALL customers, orders or not\nSELECT c.id, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;", note: "LEFT JOIN … WHERE right.id IS NULL finds rows with no match." },
  { title: "Group and filter groups", sql: "SELECT status, COUNT(*) AS n\nFROM orders\nGROUP BY status\nHAVING COUNT(*) > 10;", note: "WHERE filters rows before grouping; HAVING filters groups after." },
  { title: "Find duplicates", sql: "SELECT email, COUNT(*) AS uses\nFROM customers\nWHERE email IS NOT NULL\nGROUP BY email\nHAVING COUNT(*) > 1;", note: "A classic data-quality check after imports and migrations." },
  { title: "Find orphan rows", sql: "SELECT oi.id, oi.order_id\nFROM order_items oi\nLEFT JOIN orders o ON o.id = oi.order_id\nWHERE o.id IS NULL;", note: "Child rows whose parent is missing (no or disabled foreign key)." },
  { title: "Reconcile totals", sql: "SELECT o.id, o.total, SUM(oi.quantity * oi.unit_price) AS line_total\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY o.id, o.total\nHAVING ABS(o.total - SUM(oi.quantity * oi.unit_price)) > 0.005;", note: "Compare stored totals with recalculated values (allow for rounding)." },
  { title: "Rows missing in target (ETL)", sql: "SELECT s.id FROM source_orders s\nEXCEPT\nSELECT t.id FROM target_orders t;", note: "Some databases use MINUS instead of EXCEPT." },
  { title: "Window function: latest per group", sql: "SELECT *\nFROM (\n  SELECT p.*, ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY created_at DESC) AS rn\n  FROM payments p\n) x\nWHERE rn = 1;", note: "Latest payment attempt per order." },
  { title: "Check NULLs correctly", sql: "SELECT COUNT(*) FROM customers WHERE email IS NULL;   -- correct\nSELECT COUNT(*) FROM customers WHERE email = NULL;    -- always 0!", note: "Comparisons with NULL are never true; use IS NULL / IS NOT NULL." },
];

export const GIT_SNIPPETS: { title: string; cmd: string; note: string }[] = [
  { title: "Start work on a branch", cmd: "git switch main\ngit pull\ngit switch -c test/checkout-coupon-cases", note: "Keep test changes on their own branch." },
  { title: "See what changed", cmd: "git status\ngit diff            # unstaged\ngit diff --staged   # staged", note: "Review before every commit." },
  { title: "Commit selectively", cmd: "git add -p\ngit commit -m \"Add boundary tests for coupon expiry\"", note: "-p lets you stage hunks one by one." },
  { title: "Update your branch", cmd: "git fetch origin\ngit rebase origin/main", note: "Resolve conflicts, then git rebase --continue." },
  { title: "Park unfinished work", cmd: "git stash push -m \"wip: flaky wait fix\"\ngit stash list\ngit stash pop", note: "Handy when you must switch branches quickly." },
  { title: "Find the commit that broke a test", cmd: "git bisect start\ngit bisect bad            # current commit fails\ngit bisect good v4.11.0   # last known good\n# run the test, then mark: git bisect good | git bisect bad\ngit bisect reset", note: "Binary search through history — great for regressions." },
  { title: "Who changed this line?", cmd: "git log -p -- path/to/LoginTest.java\ngit blame path/to/LoginTest.java", note: "Understand why before you change it." },
  { title: "Undo safely", cmd: "git restore path/to/file      # discard local edits\ngit revert <commit>           # undo a pushed commit with a new commit", note: "Prefer revert over rewriting shared history." },
];

/** Official documentation only. */
export const RESOURCES: { group: string; items: { name: string; url: string; note: string }[] }[] = [
  {
    group: "Standards & foundations",
    items: [
      { name: "ISTQB", url: "https://www.istqb.org/", note: "Syllabi and glossary for testing terminology." },
      { name: "Scrum Guide", url: "https://www.scrumguides.org/", note: "The official definition of Scrum." },
      { name: "Agile Manifesto", url: "https://agilemanifesto.org/", note: "Values and principles." },
    ],
  },
  {
    group: "Web automation",
    items: [
      { name: "Selenium documentation", url: "https://www.selenium.dev/documentation/", note: "WebDriver, waits, Grid." },
      { name: "Playwright", url: "https://playwright.dev/docs/intro", note: "Modern browser automation." },
      { name: "Cypress", url: "https://docs.cypress.io/", note: "JavaScript end-to-end testing." },
      { name: "TestNG", url: "https://testng.org/", note: "Java test framework." },
      { name: "JUnit 5 User Guide", url: "https://junit.org/junit5/docs/current/user-guide/", note: "Java test framework." },
      { name: "Cucumber", url: "https://cucumber.io/docs/", note: "BDD with Gherkin." },
    ],
  },
  {
    group: "API testing",
    items: [
      { name: "MDN: HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", note: "Methods, status codes, headers." },
      { name: "Postman Learning Center", url: "https://learning.postman.com/docs/introduction/overview/", note: "Collections, tests, Newman." },
      { name: "REST Assured", url: "https://rest-assured.io/", note: "Java API testing." },
      { name: "JSON Schema", url: "https://json-schema.org/", note: "Validate response structure." },
      { name: "Pact", url: "https://docs.pact.io/", note: "Consumer-driven contract testing." },
      { name: "OWASP API Security", url: "https://owasp.org/API-Security/", note: "API security risks (authorised testing only)." },
    ],
  },
  {
    group: "Performance",
    items: [
      { name: "Apache JMeter user manual", url: "https://jmeter.apache.org/usermanual/index.html", note: "Test plans, listeners, non-GUI mode." },
      { name: "Grafana documentation", url: "https://grafana.com/docs/", note: "Dashboards for test monitoring." },
      { name: "Google SRE books", url: "https://sre.google/books/", note: "SLOs, monitoring, reliability." },
    ],
  },
  {
    group: "Mobile",
    items: [
      { name: "Appium", url: "https://appium.io/docs/en/latest/", note: "Mobile automation (Appium 2)." },
      { name: "Android testing", url: "https://developer.android.com/training/testing", note: "Espresso and Android test tooling." },
      { name: "XCTest", url: "https://developer.apple.com/documentation/xctest", note: "iOS testing framework." },
    ],
  },
  {
    group: "Specialist",
    items: [
      { name: "WCAG", url: "https://www.w3.org/WAI/standards-guidelines/wcag/", note: "Accessibility guidelines." },
      { name: "axe by Deque", url: "https://www.deque.com/axe/", note: "Accessibility testing engine." },
      { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", note: "Web application security risks." },
      { name: "Principles of Chaos Engineering", url: "https://principlesofchaos.org/", note: "Chaos experiments done safely." },
    ],
  },
  {
    group: "DevOps",
    items: [
      { name: "GitHub Actions", url: "https://docs.github.com/en/actions", note: "CI workflows." },
      { name: "Jenkins", url: "https://www.jenkins.io/doc/", note: "Pipelines." },
      { name: "Docker", url: "https://docs.docker.com/", note: "Containers for test environments." },
      { name: "Git", url: "https://git-scm.com/doc", note: "Version control reference." },
    ],
  },
];

export const TEMPLATES: { slug: string; title: string; description: string; body: string }[] = [
  {
    slug: "test-plan",
    title: "Test plan",
    description: "Scope, approach, environments, risks, schedule and exit criteria for a release or feature.",
    body: `# Test plan: <feature / release>

| Field | Value |
|---|---|
| Version | 1.0 |
| Author | |
| Last updated | |
| Approvers | |

## 1. Purpose and scope
- **In scope:**
- **Out of scope:**

## 2. References
- Requirements / user stories:
- Designs / API specs:

## 3. Test approach
- Test levels (component, integration, system, acceptance):
- Test types (functional, regression, performance, security, accessibility):
- Techniques (equivalence partitioning, boundary values, decision tables, exploratory):
- Automation vs manual split:

## 4. Test environments and data
- Environments and builds:
- Test data (synthetic only, no production personal data):
- Tools:

## 5. Risks and mitigations
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| | | | |

## 6. Entry criteria
- [ ] Build deployed to test environment
- [ ] Smoke test passed
- [ ] Test data available

## 7. Exit criteria
- [ ] All planned tests executed
- [ ] No open Critical/Major defects (or approved exceptions)
- [ ] Regression suite passed

## 8. Schedule and responsibilities
| Activity | Owner | Dates |
|---|---|---|

## 9. Deliverables
Test cases, execution report, defect summary, sign-off.
`,
  },
  {
    slug: "test-case",
    title: "Test case",
    description: "A single, repeatable test with preconditions, data, steps and expected results.",
    body: `# Test case: TC-<id> <short title>

| Field | Value |
|---|---|
| Requirement / story | |
| Priority | High / Medium / Low |
| Type | Functional / Negative / Boundary / Regression |
| Technique | |

**Preconditions**
-

**Test data**
-

| Step | Action | Expected result |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |

**Postconditions / clean-up**
-

| Execution | Build | Result | Defect | Tester | Date |
|---|---|---|---|---|---|
| | | Pass / Fail / Blocked | | | |
`,
  },
  {
    slug: "defect-report",
    title: "Defect report",
    description: "Everything a developer needs to reproduce, understand and prioritise a bug.",
    body: `# <Area>: <what happens> (<impact>)

| Field | Value |
|---|---|
| Environment | e.g. Staging |
| Build / version | |
| Browser / device / OS | |
| Severity | Critical / Major / Minor / Trivial |
| Priority | P1 / P2 / P3 / P4 |
| Reproducibility | Always / Intermittent (x of y) |

## Steps to reproduce
1.
2.
3.

## Expected result

## Actual result

## Evidence
Screenshots, video, logs, request/response (remove secrets and personal data).

## Notes
Workarounds, related defects, first build seen.
`,
  },
  {
    slug: "api-checklist",
    title: "API testing checklist",
    description: "A practical checklist for testing a REST endpoint end to end.",
    body: `# API testing checklist: <METHOD> <path>

## Contract
- [ ] Status codes match the spec for success and each failure
- [ ] Response matches the JSON schema (types, required fields, formats)
- [ ] Content-Type and other important headers are correct

## Functional
- [ ] Happy path with typical data
- [ ] Boundary values for every numeric/length field
- [ ] Missing, null, empty and wrong-type fields → 400/422 with clear errors
- [ ] Unknown fields handled as specified
- [ ] Pagination, sorting and filtering (first/last page, empty results)

## State & data
- [ ] Data is persisted correctly (verify with GET or in the database)
- [ ] Idempotency for retries (PUT/DELETE, Idempotency-Key on POST if supported)
- [ ] Concurrent updates (409/412 or a defined last-write-wins rule)

## Security (authorised testing only)
- [ ] No token → 401; expired/invalid token → 401
- [ ] Wrong role → 403; another user's resource → 403/404 (no data leak)
- [ ] Errors don't leak stack traces, SQL or secrets
- [ ] Rate limiting → 429 with Retry-After

## Non-functional
- [ ] Response time within target at expected load
- [ ] Logs include a correlation id; no sensitive data logged
`,
  },
  {
    slug: "performance-test-plan",
    title: "Performance test plan",
    description: "Objectives, workload model, SLAs, environment, monitoring and pass/fail criteria.",
    body: `# Performance test plan: <system>

> Only load-test systems you own or are explicitly authorised to test.

## 1. Objectives
- e.g. Confirm checkout supports peak load with p95 < 800 ms and error rate < 1%.

## 2. Workload model
| Transaction | % of mix | Target TPS | Think time | Pacing |
|---|---|---|---|---|
| | | | | |

Virtual users (closed model) = throughput × (response time + think time)

## 3. Test types
- [ ] Baseline (low load)
- [ ] Load (expected peak)
- [ ] Stress (beyond peak, find the breaking point)
- [ ] Spike
- [ ] Endurance / soak

## 4. SLAs and pass/fail criteria
| Metric | Target |
|---|---|
| p95 response time | |
| p99 response time | |
| Error rate | |
| Throughput | |
| CPU / memory headroom | |

## 5. Environment
Production-like sizing? Differences and their expected impact:

## 6. Test data
Volumes, uniqueness (CSV datasets), clean-up.

## 7. Monitoring
Application metrics, infrastructure (CPU, memory, disk, network), database, connection/thread pools, logs.

## 8. Execution and reporting
Non-GUI runs, ramp-up, duration, result analysis, bottleneck findings, recommendations.
`,
  },
];
