# Deployment

> Full production hardening is Phase 8. This document records the constraints already built in, and is expanded with exact steps in that phase.

## Target topology
- **Frontend:** Vercel (or any Node host). Set `BACKEND_URL` **before `next build`**, because rewrites are resolved at build time.
- **Backend:** any Python host that runs `uvicorn app.main:app --host 0.0.0.0 --port $PORT` behind HTTPS (Render, Fly.io, Railway, a VM…).
- **Database:** MongoDB Atlas with a least-privilege user (readWrite on `saige_prep` only) and an IP access list limited to the backend host.

## Required backend environment (production)
| Variable | Rule |
|---|---|
| `APP_ENV` | `production`. Disables `/docs` and `/openapi.json`, enables Secure cookies and HSTS. |
| `SESSION_SECRET` | ≥ 32 random chars. The app refuses to start with the placeholder. |
| `FRONTEND_ORIGIN` | `https://…`. The app refuses to start with an `http://` origin. |
| `MONGODB_URI` | Atlas SRV string from a secret store. |

## Checklist (will be completed in Phase 8)
- [ ] Verify `/health` and `/ready` from the host's health-check config
- [ ] Bootstrap the owner with `scripts.create_owner` against production
- [ ] Backup policy enabled on Atlas; restore tested
- [ ] Rollback: redeploy the previous frontend build and backend image; database changes ship as forward-compatible migrations
- [ ] Data export / account deletion endpoints
