# Testing strategy

Saige-Prep is tested like a product. Each phase adds tests for its own behaviour, and a phase is not done until its tests pass.

| Layer | Tool | Location | Scope |
|---|---|---|---|
| Backend unit | pytest | `backend/tests/unit` | Pure logic: hashing, rate limiter, config validation (later: scoring, content validation) |
| Backend integration | pytest + HTTPX ASGI transport + real MongoDB | `backend/tests/integration` | Endpoints end to end against `saige_prep_test` |
| Backend security | pytest | `backend/tests/security` | CSRF, rate limiting, no registration, no data echo, token storage, expiry, CORS, headers (later: answer-key leakage, authorization on every admin route) |
| Frontend unit/component | Vitest + Testing Library (jsdom) | `frontend/src/**/*.test.ts(x)` | API client, navigation registry, forms, a11y attributes, interactive components |
| End to end | Playwright (desktop + Pixel 7 viewports) | `frontend/e2e` | Real browser → Next.js → FastAPI → MongoDB (`saige_prep_e2e`, reset each run) |
| Static | tsc strict, ESLint, ruff | | |

## Deterministic data
- pytest empties all collections in `saige_prep_test` before each test and inserts a known owner where needed.
- Playwright's global setup drops and re-seeds `saige_prep_e2e` with a fixed owner (`e2e-owner@example.com`).
- E2E runs on ports 3100/8100 so it never collides with the dev servers on 3000/8000.

## Planned additions (per spec)
Accessibility scans (axe) in E2E, responsive snapshot checks, scoring tests for the assessment engine, seed idempotency tests, and the E2E journeys listed in the spec (lesson completion, bookmarks, timed assessment, mock interview, planner, search, admin publishing).
