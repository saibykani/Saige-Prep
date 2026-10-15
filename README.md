# Saige-Prep

**Learn. Practice. Test. Get Hired.**

A private, single-owner platform for learning software testing and preparing for interviews. It covers manual QA, automation, API, performance, mobile and specialist testing, with practice labs, timed assessments and mock interviews.

> **Status:** Phase 1 (foundation) is complete. Curriculum, practice, assessments and interviews arrive in later phases. See [docs/implementation-status.md](docs/implementation-status.md) for an honest list of what works today.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.4 (App Router, Cache Components), React 19.3, TypeScript (strict), Tailwind CSS 4, TanStack Query, React Hook Form + Zod, Lucide |
| Backend | Python 3.12, FastAPI, Pydantic v2, PyMongo async API, Argon2id |
| Database | MongoDB (local Windows service, Docker, or Atlas) |
| Tests | Vitest + Testing Library, pytest + HTTPX, Playwright |

## Repository layout

```text
backend/    FastAPI app (app/), scripts/, tests/ (unit, integration, security), content/
frontend/   Next.js app (src/), unit tests alongside sources, e2e/ Playwright specs
docs/       Architecture, database, testing strategy, deployment, status
examples/   Runnable example projects (added in Phase 6)
docker-compose.yml   Optional local MongoDB
```

## Prerequisites

- Node.js 20.9+ (developed on 24.12) and npm
- Python 3.12
- MongoDB 7+ reachable locally, **or** Docker Desktop, **or** a MongoDB Atlas cluster

## First-time setup (Windows PowerShell)

```powershell
# 1. Backend
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
Copy-Item ..\.env.example .env
# Edit .env: set SESSION_SECRET (command in the file) and MONGODB_URI

# 2. Database: skip if MongoDB already runs locally
docker compose -f ..\docker-compose.yml up -d mongo

# 3. Create the owner account. This is the only way to create an account;
#    there is no public sign-up and no default password.
.\.venv\Scripts\python.exe -m scripts.create_owner --email you@example.com --name "Your Name"

# 4. Frontend
cd ..\frontend
npm install
```

If PowerShell blocks `Activate.ps1`, you don't need to change execution policy: call `.\.venv\Scripts\python.exe` directly as shown.

## Running locally

```powershell
# Terminal 1: API on http://127.0.0.1:8000 (docs at /docs)
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: web app on http://localhost:3000
cd frontend
npm run dev
```

Health checks: `GET /health` (liveness) and `GET /ready` (checks MongoDB; returns 503 if it's down).

## Commands

| Where | Command | Purpose |
|---|---|---|
| backend | `.\.venv\Scripts\python.exe -m pytest` | Unit, integration and security tests (needs MongoDB; uses `saige_prep_test`) |
| backend | `.\.venv\Scripts\python.exe -m ruff check .` | Lint |
| backend | `.\.venv\Scripts\python.exe -m ruff format .` | Format |
| frontend | `npm run typecheck` | TypeScript strict check |
| frontend | `npm run lint` | ESLint |
| frontend | `npm test` | Vitest unit/component tests |
| frontend | `npm run build` | Production build |
| frontend | `npm run test:e2e:install` | One-time Playwright browser download |
| frontend | `npm run test:e2e` | Playwright E2E (starts an isolated backend on :8100 against `saige_prep_e2e` and the frontend on :3100) |
| frontend | `npm run check` | typecheck + lint + unit tests |

## Security model (summary)

- Single owner account, created by a script. No registration endpoint.
- Argon2id password hashing; per-account login rate limiting.
- Opaque server-side sessions in an HttpOnly, SameSite=Lax cookie (Secure in production). Only an HMAC of the token is stored.
- Double-submit CSRF token on state-changing requests.
- Browser traffic is same-origin: Next.js rewrites `/api/*` to FastAPI.
- The backend refuses to start in production with a placeholder secret or a non-HTTPS origin.

See [docs/architecture.md](docs/architecture.md) for details.
