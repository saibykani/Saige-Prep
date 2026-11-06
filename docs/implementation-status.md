# Implementation status

_Last updated: 2026-10-30._

## Phase checklist
| Phase | Scope | Status |
|---|---|---|
| 0 | Inspection, CLAUDE.md, architecture docs, checklist | ✅ Done |
| 1 | Shell, design system, FastAPI, DB, health checks, auth foundation, test infra | ✅ Done |
| 2 | Curriculum & learning engine | ✅ Done (9 tracks incl. AI Engineering, 203 lessons = every curriculum topic; 85 role roadmaps incl. 5 AI roles) |
| 3 | Practice labs and QA toolkit | ✅ Done (7 labs, 15 tools) |
| 4 | Assessment engine | ✅ Done (mock-test hub + runner; 9 banks, 428 questions: manual, JMeter, API, automation, performance, mobile, SDET, specialist, AI engineering) |
| 5 | Interview preparation | ✅ Done (9 tracks, 128 questions; 15/30/60-min runner with self-rated rubric) |
| 6 | Projects, resource library, content admin | 🟡 13 guided projects done; content admin not built (site stays open with no login, by owner decision 2026-11-05) |
| 7 | Personalization and analytics | ✅ Done (study planner, progress analytics, light/dark/system theme) |
| 8 | Security and production hardening | 🟡 CSP/HSTS/COOP headers, data export/import/delete; backend auth unused while login is off |
| 9 | Content and quality audit | 🟡 JMeter audit and 15-lesson audit done; AI track: EU AI Act dates checked against the official timeline, Python examples executed where possible (2 fixed; API-key/network/model-download examples only syntax-checked). Full live source check of all lessons still pending |

## Architecture decision: learner data and content (recorded 2026-10-29)
Login is disabled at the owner's request, and the hosted backend is not reachable from the live site. So:
- **Content** (lessons, roles, question banks, interviews, projects) lives in `frontend/content/`, is validated by `src/content/content.test.ts`, and is bundled at build time. It works on Vercel with no backend.
- **Learner data** (progress, bookmarks, notes, quiz/assessment attempts, interview sessions, study plan, activity) is stored in the browser's localStorage via `src/lib/store.ts`. It is schema-validated, versioned, and can be exported and imported.
- **Trade-off:** data is per-browser, and assessment answer keys ship to the client, so scoring is **not authoritative** (the spec asks for server-side scoring). `src/lib/scoring.ts` is pure and can move server-side unchanged once a backend and login are re-enabled. MongoDB remains the intended store for that mode.

## Completed since Phase 1
- **Content pipeline:** zod schemas, a curriculum map (7 tracks, 152 topics), a role catalogue (85 roles from spec §8), a validator with per-folder mode, an authoring guide (`docs/content-authoring.md`) and an exemplar lesson.
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
| Lessons | 203 | 203 topics |
| Role roadmaps | 85 | 85 |
| Interview questions | 128 (9 tracks) | 9 tracks |
| Assessment question bank | 428 (9 banks) | 9 banks |
| Guided projects | 13 (2 with runnable example code, not yet verified end to end) | 13 |

Content agents stopped mid-task when the API usage limit was reached. Four lessons cut off mid-write sit in `frontend/content-drafts/`; they are not loaded by the site and must be fixed and revalidated before being moved back.

## Tests executed (2026-11-05)
| Suite | Result |
|---|---|
| Content validation (`npx vitest run src/content`) | **238 passed** |
| Other frontend unit tests | all passed (one sidebar test timed out under load, passed on rerun) |
| Type-check / lint | clean |
| Production build (`next build`) | success, 389 pages |
| Playwright e2e (desktop + mobile) | **29 passed, 1 skipped** (desktop-only shortcut) |

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
