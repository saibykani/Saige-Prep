# Implementation status

_Last updated: 2026-10-16. Phases 0–1._

## Environment (inspected 2026-10-16)
| Tool | Version | Notes |
|---|---|---|
| Node.js / npm | 24.12.0 / 11.6.2 | |
| Python | 3.12.10 | backend venv at `backend/.venv` |
| Git | 2.53.0 | |
| Docker | 29.2.1 | Docker Desktop was stopped and was started for this session |
| MongoDB | 8.2.3 | **already running as a Windows service on 127.0.0.1:27017**, so it is used directly; `docker-compose.yml` is the alternative for machines without it |
| Claude Code | 2.1.273 | |

## Phase checklist
| Phase | Scope | Status |
|---|---|---|
| 0 | Inspection, CLAUDE.md, architecture docs, checklist | ✅ Done |
| 1 | Shell, design system, FastAPI, DB, health checks, auth foundation, test infra | ✅ Done (see test results) |
| 2 | Curriculum & learning engine: roles, paths, lessons, search, Markdown/Mermaid, bookmarks, progress, seeds | ⏳ Next |
| 3 | Practice labs and QA toolkit | ☐ |
| 4 | Assessment engine | ☐ |
| 5 | Interview preparation | ☐ |
| 6 | Projects, resource library, admin CMS | ☐ |
| 7 | Personalization and analytics | ☐ |
| 8 | Security and production hardening, deployment | ☐ |
| 9 | Content and quality audit | ☐ |

## Completed (Phase 1)
- **Backend:** FastAPI app factory, pydantic-settings config with production guards, PyMongo async connection, startup index creation, `GET /health`, `GET /ready` (503 + no credential leakage when the DB is down), security-headers and request-ID middleware, sanitized validation and 500 errors, restricted CORS.
- **Auth:** owner bootstrap script (`scripts.create_owner`, with `--reset-password`, which also revokes sessions), Argon2id hashing, opaque HMAC-stored sessions with a TTL index, `POST /api/auth/login`, `POST /api/auth/logout` (CSRF-protected), `GET /api/auth/me`, per-account login rate limiting, no registration endpoint.
- **Frontend:** dark design tokens; UI components (Button, Card, Badge, Input/Label/FieldError, Alert, Skeleton, Spinner, EmptyState, Kbd, CodeBlock with copy, ConfirmDialog, Toast); AppShell with grouped collapsible sidebar, mobile drawer, top bar, breadcrumbs, Ctrl+K section search, skip link; login page (RHF + Zod, safe `?next=` redirect); proxy-based route protection; dashboard (real user, live system status, honest empty state); settings (account, status, sign-out confirm); admin UI gate; all 19 navigation sections routed.
- **Tooling:** pinned dependencies (`requirements.txt`, `requirements-dev.txt`, `requirements.lock.txt`, exact npm versions), ruff, ESLint, tsc strict, Vitest, Playwright config with an isolated e2e stack.

## In progress / blocked
- **Playwright E2E is blocked by disk space on C:** (0.43 GB free). MongoDB refuses `createIndexes` below 500 MB free (`OutOfDiskSpace`, code 14031), so the e2e backend cannot seed its database. Chromium is installed on D: (`PLAYWRIGHT_BROWSERS_PATH=D:\ms-playwright`; set `TEMP`/`TMP` to `D:\tmp` when installing). Free space on C:, then run `npm run test:e2e` with `PLAYWRIGHT_BROWSERS_PATH` set.
- Fixed as a result: an index-creation failure at startup no longer crashes the backend; `/ready` reports an `indexes` check instead.

## Outstanding (not yet built; pages say "Planned · Phase N")
Everything in Phases 2–9: curriculum content and role roadmaps, lesson rendering (Markdown/Mermaid), content search, bookmarks/notes, practice labs, toolkit, assessments, interviews, projects, planner, analytics, admin CMS, data export/deletion, deployment.
Phase 1 components still to come with their features: diagram viewer, screenshot gallery, video embed, quiz question, assessment timer, results summary, progress charts, bookmark control, note editor, study checklist, search filters.

## Tests executed
| Suite | Command | Result |
|---|---|---|
| Backend (unit + integration + security) | `python -m pytest` | **37 passed** |
| Backend lint/format | `ruff check .` / `ruff format --check .` | clean |
| Frontend unit/component | `npm test` | **27 passed** (4 files) |
| Frontend types / lint | `npm run typecheck` / `npm run lint` | clean |
| Frontend production build | `npm run build` | success; 24 routes prerendered as static shells |
| E2E | `npm run test:e2e` | **not run: blocked** by low disk space on C: (see above). 10 specs written; desktop + mobile projects |

## Known limitations
- The login rate limiter is in-memory (single backend process).
- `npm audit` reports 5 high-severity advisories in the **dev-only** ESLint toolchain (`braces` via `eslint-config-next`). `npm audit --omit=dev` reports 0. The suggested fix is a breaking downgrade, so it is deferred until upstream updates.
- No Content-Security-Policy yet (needs nonce support with Next.js inline scripts); planned for Phase 8.
- Global search covers sections only until Phase 2 adds content search.

## Next actions
1. Free disk space on C:, then run the E2E suite and fix any failures.
2. Phase 2: content schema + validator, idempotent seeding, role catalogue (all roles in spec §8), full Manual Testing curriculum, lesson reader, search, bookmarks, progress.
