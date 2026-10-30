# Implementation status

_Last updated: 2026-10-30._

## Phase checklist
| Phase | Scope | Status |
|---|---|---|
| 0 | Inspection, CLAUDE.md, architecture docs, checklist | ✅ Done |
| 1 | Shell, design system, FastAPI, DB, health checks, auth foundation, test infra | ✅ Done |
| 2 | Curriculum & learning engine | 🟡 Engine done; content ~75% (see below) |
| 3 | Practice labs and QA toolkit | 🟡 In progress (SQL lab data + checker done; UI not yet) |
| 4 | Assessment engine | 🟡 Scoring engine + question UI done; mock-test flow not yet |
| 5 | Interview preparation | 🟡 Content in progress (6 of 8 tracks); flow not yet |
| 6 | Projects, resource library, content admin | 🟡 2 example projects started, unverified |
| 7 | Personalization and analytics | 🟡 Local data store done (progress, bookmarks, notes, plan, attempts); planner/analytics UI not yet |
| 8 | Security and production hardening | ☐ |
| 9 | Content and quality audit | ☐ |

## Architecture decision: learner data and content (recorded 2026-10-29)
Login is disabled at the owner's request, and the hosted backend is not reachable from the live site. So:
- **Content** (lessons, roles, question banks, interviews, projects) lives in `frontend/content/`, is validated by `src/content/content.test.ts`, and is bundled at build time. It works on Vercel with no backend.
- **Learner data** (progress, bookmarks, notes, quiz/assessment attempts, interview sessions, study plan, activity) is stored in the browser's localStorage via `src/lib/store.ts`. It is schema-validated, versioned, and can be exported and imported.
- **Trade-off:** data is per-browser, and assessment answer keys ship to the client, so scoring is **not authoritative** (the spec asks for server-side scoring). `src/lib/scoring.ts` is pure and can move server-side unchanged once a backend and login are re-enabled. MongoDB remains the intended store for that mode.

## Completed since Phase 1
- **Content pipeline:** zod schemas, a curriculum map (7 tracks, 152 topics), a role catalogue (80 roles from spec §8), a validator with per-folder mode, an authoring guide (`docs/content-authoring.md`) and an exemplar lesson.
- **Learning Center:**
  - track catalogue and track pages (core vs optional modules, per-topic status)
  - lesson reader: objectives, prerequisites, Markdown with tables/code/Mermaid, practice tasks, interactive quiz, interview Q&A, takeaways, references, related lessons, previous/next, table of contents
  - mark complete, bookmark, per-lesson notes
  - unwritten topics are shown honestly as "not written yet"
- **Role Roadmaps:** a filterable catalogue and a detail page per role (skills split into essential, role-specific and optional, a 3-stage roadmap linked to lessons, tools, exercises, sample project, interview Q&A, common mistakes, readiness criteria, next roles, and an ethics boundary for penetration testing). There is also a "set as target role" action.
- **Search:** a static index built at build time (lessons, roles, sections), the Ctrl+K palette, and a `/search` page with type/track/level/duration filters. Interview, project, tool and practice entries will be added to the index once their pages exist.
- **Bookmarks and Notes** pages (Markdown preview, search, delete confirmation).
- **Engines:** the scoring engine (exact-set match, negative marking, per-topic breakdown, seeded shuffle), the local data store, and the SQL lab dataset with 12 graded exercises verified against real SQLite.

## Content inventory
| Content | Done | Target |
|---|---|---|
| Lessons | 114 | 152 topics |
| Role roadmaps | 68 | 80 |
| Interview questions | 88 (6 tracks) | 8 tracks |
| Assessment question bank | 60 (manual testing) | 7 banks |
| Example projects | 2 started (RestAssured, Selenium), **not yet verified** | 7 |

Content agents stopped mid-task when the API usage limit was reached. Four lessons cut off mid-write sit in `frontend/content-drafts/`; they are not loaded by the site and must be fixed and revalidated before being moved back.

## Tests executed (2026-10-30)
| Suite | Result |
|---|---|
| Frontend unit + content validation (`npx vitest run`) | **191 passed** (9 files) |
| Type-check / lint | clean |
| Production build (`next build`) | success, 270 pages pre-rendered |
| Browser smoke test (production build) | Learning Center, a lesson (incl. Mermaid diagram), a role page and lesson completion → progress all work; no page errors |
| Backend (`pytest`) | 38 passed (last run 2026-10-16; backend unchanged since) |
| E2E (Playwright) | not run: needs local MongoDB, and C: is low on disk |

## Known limitations
- **Login is OFF** at the owner's request (open guest access). Backend auth code is kept and tested.
- Learner data is per-browser (see the architecture decision above).
- The live site's backend connection is blocked by Vercel Deployment Protection (dashboard System status shows "Unreachable"). Learning features don't need it.
- `npm audit`: dev-only ESLint advisories; production dependencies are clean.
- Reference links in agent-written lessons have not yet been link-checked (Phase 9).

## Next actions
1. Resume the content agents to finish the missing lessons, roles, question banks, interviews and example projects.
2. Phase 3 UI: practice labs (SQL, API mock, test design, defect report, code, performance) and the QA toolkit.
3. Phase 4–5 flows: timed mock tests with results/revision/history, and mock interviews with rubric self-evaluation.
4. Phase 6–7: the projects library, planner and analytics, and a real dashboard.
5. Phases 8–9: hardening, link check and content audit.
