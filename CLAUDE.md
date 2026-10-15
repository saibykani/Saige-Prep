# CLAUDE.md: working on Saige-Prep

Private software-testing learning platform. Monorepo: `frontend/` (Next.js 16.4), `backend/` (FastAPI + PyMongo async), `docs/`.
Phases, acceptance criteria and progress are tracked in `docs/implementation-status.md`; update it at the end of every phase.

## Ground rules
- Build in phase order (see status doc). Run the tests for anything you touch before moving on. Never claim a test ran if it did not.
- No fake data: no hardcoded statistics, fake quiz results or placeholder content dressed up as real. Unbuilt sections use `PlannedSection`, which says so honestly.
- Don't replace MongoDB or change the architecture without writing down the trade-off.
- Never commit `.env` files or secrets. Tests only touch databases ending in `_test` or `_e2e`. The dev DB is `saige_prep`. Other databases on the local MongoDB (e.g. `saige_ai`, `spira_db`) belong to other projects; never touch them.

## Frontend (Next.js 16.4: read `frontend/node_modules/next/dist/docs/` before using unfamiliar APIs)
- `cacheComponents` and `partialPrefetching` are on. Request-time reads (`cookies()`, `searchParams`, `useSearchParams`) must sit behind `<Suspense>`.
- Middleware is now `src/proxy.ts`. It only does optimistic cookie-presence redirects; the backend is the real auth boundary.
- The browser calls same-origin `/api/*`, and `next.config.ts` rewrites it to `BACKEND_URL` (resolved at build time). Use `apiFetch` from `src/lib/api.ts`; it adds the CSRF header.
- Navigation is defined once, in `src/lib/navigation.ts` (sidebar, search, breadcrumbs, planned pages).
- Design tokens are in `src/app/globals.css` (`bg-surface`, `text-muted`, `text-accent`, …). Dark-first, violet/emerald accents, no default blue.
- Tests: `npm run check` (tsc + eslint + vitest), `npm run test:e2e` (Playwright, isolated ports 3100/8100).

## Backend
- Run tools with `.venv\Scripts\python.exe` (no activation needed).
- App factory is `app/main.py:create_app(settings)`. Dependencies are in `app/dependencies.py` (`DbDep`, `CurrentUser`, `AdminUser`, `verify_csrf`).
- Every state-changing endpoint must depend on `verify_csrf`. Admin endpoints use `AdminUser`.
- Request models use `extra="forbid"`. Never echo submitted values in errors.
- Tests: `python -m pytest` (needs MongoDB), `python -m ruff check . && python -m ruff format --check .`.
