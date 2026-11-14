# Expansion plan: from testing platform to career and exam preparation platform

_Drafted 2026-11-14. Analysis and planning only; no app code or content was changed._

## 1. Current state and what must generalise

**Shape today:** a static Next.js site (about 420 pages) with content bundled from `frontend/content/` and learner data in localStorage. There is no backend dependency and no login.

| Concept | Where it lives | Testing-specific assumption |
|---|---|---|
| Curriculum | `src/content/curriculum.ts`: `TRACKS` -> modules -> topics (9 tracks, 203 topics). A topic slug must exist here or the lesson fails to load (`parseLessonFile`). | Hardcoded TypeScript array; the lesson route is `/learn/[track]/[lesson]`; `href` per track points at `/learn/<track>`. |
| Lessons | `content/lessons/<track>/<slug>.md`; frontmatter in `schema.ts` | Required headings ("Beginner-friendly explanation", "Technical explanation", ...). The `interview` and `practice` fields are tester-flavoured but generic enough. |
| Roles | `role-catalog.ts` (89 roles) + `content/roles/<category>.json`; `ROLE_CATEGORIES` is an enum of 8 testing categories | Role `category` is a closed testing enum. The validator demands exactly the catalogue slugs. Roadmap stages reference curriculum topics. |
| Question banks | `content/questions/<track>.json`; one bank per track; `choiceQuestion` (single/multiple/truefalse/code-output/debugging/scenario) | `track` is required and must be a curriculum track. `topic` is a free slug. No section, passage, image, language or source field. |
| Lesson practice | `content/practice/<track>/<lesson>.json`: marked questions plus coding exercises (python/js/ts/sql/java) | Fine for IT. Not relevant to aptitude or exam subjects. |
| Interviews | `content/interviews/<track>.json`, 9 tracks | Tied to testing tracks and roles. |
| Scoring | `src/lib/scoring.ts` already supports `pointsPerQuestion` and `negativeMarking` | Reusable for exams (needs per-section marks and sectional timers). |
| Navigation | `src/lib/navigation.ts`: one flat `NAV_GROUPS` list. Every track is a sidebar item (Manual Testing, Automation, ...). It also feeds search, breadcrumbs and `PlannedSection`. | A sidebar listing each track does not scale to 20+ domains and 30+ exams. |
| Routes | `/learn`, `/roadmaps`, `/practice`, `/mock-tests`, `/interviews`, `/projects`, `/toolkit`, `/planner`, `/progress` | Top-level routes are feature-first, not audience-first. A UPSC aspirant and a data analyst share the same menu. |
| Static params | Eight `generateStaticParams` routes. Search index is one `search-index.json`. | Whole index is shipped to the client (see section 7). |

**What has to generalise**
1. Replace hardcoded `TRACKS` and `ROLE_CATEGORIES` with a **domain** concept (data files, validated).
2. Introduce an **exam** entity with structure (stages, sections, marks, syllabus tree), which lessons do not model.
3. Introduce **aptitude** topics and large question banks with sections, difficulty, and shortcut-method explanations.
4. Make mock tests accept exam-shaped definitions (sections, timers, negative marking, section cut-off flags).
5. Make navigation two-level (area -> domain) and data-driven.
6. Keep every existing URL working.

## 2. Target information architecture

Four areas, one shared shell. The learner picks an area first; everything else (dashboard, search, practice) is scoped by it and can be widened.

| Area | Route root | Contents |
|---|---|---|
| **Careers (IT)** | `/careers` | Domain hubs: Testing & QA, Software development, Data, Cloud/DevOps/SRE, Security, Networking, Databases, Product/Project/Business analysis, UI/UX, IT support, ERP/SAP, AI/ML. Each hub has roles, learning paths, courses, practice, interviews. |
| **Government exams** | `/exams` | Exam families (UPSC, SSC, Banking, Railways, Defence, State PSC, Teaching, Insurance, Others) -> exam page -> syllabus -> study path -> mock tests. |
| **Aptitude** | `/aptitude` | Quantitative, reasoning, verbal/English, general awareness, current affairs (monthly digests), computer awareness, data interpretation. Used by exams and by IT/job-test prep. |
| **Non-IT careers** | `/careers/non-it` (same engine, a "kind: non-it" domain flag) | Overview-level pages: finance/accounting, banking, sales/marketing, HR, operations, core engineering branches. |

**Learner flow**
- First visit: three big doors (I want a job in IT / I am preparing for a government exam / I want to practise aptitude). Choice is stored locally as `focus` and can be changed in one click. Not a gate: all areas remain reachable.
- Domain hub: role cards -> role page -> roadmap -> lessons -> practice -> interview. Same as today's flow, one level higher.
- Exam page: overview -> pattern -> syllabus tree (each node links to aptitude topics, lessons or "no material yet") -> study path -> mock tests -> official links.

**Cross-cutting**

| Feature | Behaviour across domains |
|---|---|
| Search (Ctrl+K and `/search`) | Single index with `type` (lesson, role, exam, aptitude topic, domain) and `area` filters. Results grouped by area. Index is sharded (section 7). |
| Dashboard | Scoped to the learner's focus: continue where I left off, target role or target exam, today's plan from the planner, last mock score. No invented stats; empty states say what to do. |
| Roadmaps | IT roles keep the 3-stage roadmap. Exams get a **study path** (phases, weekly hours as a suggestion, syllabus nodes). Same `Roadmap` component fed by two shapes. |
| Practice | Lesson-level tests stay. Aptitude gets topic drills (timed or untimed) with shortcut-method explanations. |
| Mock tests | One runner. A test definition is `{ sections[], duration, marking }`. Sources: question banks tagged by exam/section/topic. IT banks keep the current format. |
| Interviews | Domain interview tracks for IT. For exams: the UPSC personality test and SSB-style/interview stage get a prep guide only if open decision 6 says yes. |
| Progress/planner | Keyed by entity id (`lesson:`, `exam-topic:`, `aptitude:`), not by track. The existing store gets a version bump with a migration. |

**Navigation:** the sidebar shows **areas** and a handful of utilities; domains and exam families appear in a left-hand "section tree" inside each area. `navigation.ts` is regenerated from data (domains, exam families) plus a small static list of tools.

## 3. Content model changes

All new entities are JSON or Markdown under `frontend/content/`, validated by zod in `schema.ts` (split into `schema/*.ts`) and by `content.test.ts`.

### 3.1 Domain (replaces `TRACKS` and `ROLE_CATEGORIES`)
```
content/domains/<domain>.json
{ slug, title, kind: "it" | "non-it", summary, icon, accent?,
  roleGroups: [{ id, label }],
  courses: [{ slug, title, description, level, modules: [{slug,title,path:"core"|"optional",topics:[{slug,title}]}] }] }
```
`TRACKS` become `courses` inside the `testing` domain. This keeps the module/topic structure and "not written yet" behaviour.

### 3.2 Role (generalised)
Keep the existing `role` shape. Change `category` from an enum to `domain` + `group` (validated against the domain file). Add optional `salaryNote` only as free text with a required `source` (no numbers without a source), and `relatedExams` (for example, bank roles). Keep `boundaries` for offensive-security roles.

### 3.3 Exam
```
content/exams/<family>/<exam>.json
{
  slug, family, title, shortTitle, conductingBody,
  level: "central" | "state" | "psu", language: ["en","hi",...],
  summary,
  eligibility: { age: {text}, education: {text}, nationality?, attempts?, other? },   // free text quoting the notification
  stages: [{ id, name, mode: "cbt"|"written"|"physical"|"interview"|"document",
             qualifying: boolean, durationMin?, notes? }],
  papers: [{ stage, id, name, sections: [{ id, name, questions, marks, durationMin?,
             negativeMarking: { perWrong: number } | null, language? }],
             totalMarks, sectionalTiming: boolean }],
  syllabus: SyllabusNode[],            // tree, see below
  studyPath: [{ phase, title, weeks?, nodes: [syllabusNodeId], focus }],
  source: {                             // REQUIRED
    notificationYear: number,
    officialLinks: [{ label, url, kind: "notification"|"syllabus"|"pattern"|"homepage" }],
    lastVerified: "YYYY-MM-DD",
    verifiedBy: "owner" | "agent",
    changesToWatch?: string
  }
}
SyllabusNode = { id, title, children?: SyllabusNode[], topicRefs?: [{ type:"aptitude"|"lesson"|"gk", slug }], officialText?: string }
```
Rules: no field exists for cut-offs, vacancies, salary or "difficulty trends". A `notes` free-text field is allowed, but see section 4.

### 3.3b Aptitude
```
content/aptitude/<subject>/<topic>.md      // lesson-like: concept, formulae, shortcut, worked examples
content/aptitude/<subject>/_subject.json   // title, topic order
```
Reuse the lesson frontmatter minus `interview` and required headings; the aptitude contract is "Concept", "Method", "Worked examples", "Common traps". Topic examples: percentages, ratio, time and work, profit and loss, number series, syllogisms, blood relations, reading comprehension, DI tables/charts.

### 3.4 Question banks (generalised)
Extend `questionBankFile`: `track` becomes `scope: { domain?, course?, subject?, exam? }`. Question gains optional `section` (exam section id), `passageId` (RC, DI sets share a passage), `image` (path, alt required), `language`, `source` ("original", "adapted", or "official PYQ"; see below), `year`. Banks are **sharded by topic** (`content/questions/aptitude/percentages.json`) so builds and diffs stay manageable.

**Previous-year questions:** do not copy copyrighted papers wholesale. Policy: original questions written in the style of the exam, tagged `source: "original"`. Official papers may be **linked**, not reproduced. This is open decision 4.

### 3.5 Mock test definition
```
content/mocks/<exam>/<mock>.json
{ slug, exam, title, sections: [{ examSection, pick: { topics[], count, difficultyMix } }], durationMin, marking, seed }
```
Questions are drawn from banks at build time (deterministic) or at runtime with a seeded shuffle (the scorer already supports one). Full-length mocks are only offered when enough questions exist; otherwise the page says "sectional practice only".

### 3.6 Migration and URLs (no breakage)
| Old | New canonical | Mechanism |
|---|---|---|
| `/learn/<track>` and `/learn/<track>/<lesson>` | `/careers/testing/<course>/<lesson>` | `redirects()` in `next.config.ts` (permanent), generated from the domain data by a script; a vitest test asserts every old URL in a frozen list (`legacy-urls.json`, captured now from the build) redirects to a page that exists. |
| `/roadmaps`, `/roadmaps/<role>` | `/careers/<domain>/roles/<role>` | Same. |
| `/mock-tests/<bank>`, `/interviews/<track>` | Scoped equivalents | Same. |
| `/learn`, `/roadmaps`, `/mock-tests`... | Remain as cross-area index pages (all-content browse) | Not removed: they become filtered views, so bookmarks work and no redirect is needed. |
| localStorage keys (progress, bookmarks, notes keyed by lesson slug) | Unchanged keys, because lesson slugs do not change | Store version bump only for new entity prefixes. |

Rule: slugs never change. Only the route prefix moves. Step 4 of the delivery plan implements this before any new content.

## 4. Accuracy policy for government exams

Syllabi, patterns, age limits and stage names change between notifications. A wrong exam page hurts a learner more than a missing one.

1. **Every exam file requires** `source.officialLinks` (at least one `notification` or `syllabus` link on an allow-listed official domain), `source.notificationYear` and `source.lastVerified`. Zod enforces presence and format; the file does not load otherwise.
2. **Domain allow-list** in the schema: `upsc.gov.in`, `ssc.gov.in`, `ibps.in`, `sbi.co.in`, `rbi.org.in`, `rrbcdg.gov.in` and regional `rrb*.gov.in`, `joinindianarmy.nic.in`, `joinindiannavy.gov.in`, `afcat.cdac.in`, `ctet.nic.in`, `licindia.in`, `newindia.co.in`, state PSC sites (`*.gov.in`, `*.nic.in`). Anything else (coaching sites, news) is rejected as a primary source.
3. **Staleness test:** a vitest check fails CI if `lastVerified` is older than 12 months or in the future (configurable), and warns above 6 months. The UI shows the verified date on every exam page and a "pattern may have changed; confirm on the official site" banner next to the links when the date is older than 6 months.
4. **Forbidden content:** no cut-offs, vacancy counts, number of applicants, salary figures, "expected difficulty", toppers' strategies presented as fact. A test greps exam JSON and exam Markdown for patterns like `cut-?off`, `vacanc`, `lakh`, `crore`, `\bLPA\b` and fails unless the line sits in a block explicitly flagged `quotedFromOfficial: true` with a link. Salary and pay level can only appear as a link to the official notification.
5. **Numbers need provenance.** Marks, question counts, duration and negative marking come from the official pattern. If the official source is only a PDF the agent cannot read, the field is omitted and the page shows "see official notification", not a guess.
6. **Practice material** says "original questions in the style of this exam", never "previous year paper" unless the source is linked.
7. **Review cycle:** a `docs/exam-verification-log.md` records who checked what and when. A yearly refresh step is added to the delivery plan.

### Verified vs to-verify exam facts
Official sites could not be fully read from this environment (upsc.gov.in returned 403; ssc.gov.in returned only a page title). Everything below is from general knowledge and must be re-checked against the official source before it enters content.

| Fact | Status |
|---|---|
| IBPS conducts CRP exams for PO/MT, Clerks (CSA), Specialist Officers and Regional Rural Banks | **Verified** on ibps.in |
| UPSC Civil Services Exam: Preliminary, Main (written), Personality Test (interview) | To verify (upsc.gov.in blocked) |
| UPSC conducts NDA/NA, CDS, CAPF, ESE (engineering services), CMS | To verify |
| SSC conducts CGL, CHSL, MTS, CPO, GD Constable, JE (and others) | To verify (ssc.gov.in page did not render) |
| SSC CGL stages (Tier I and Tier II CBT; stage/typing/skill tests by post). The tier structure has changed over time. | To verify against the current notification |
| SBI conducts its own PO and Clerk (Junior Associate) recruitment (not IBPS) | To verify |
| RBI conducts Grade B (Phase I, Phase II, interview) and Assistant (prelims, mains, language proficiency test) | To verify |
| RRBs under Railway Recruitment Control Board: NTPC, Group D (RRC), JE, ALP (CBT stages incl. CBAT for ALP) | To verify |
| NDA/NA via UPSC (written + SSB); CDS via UPSC (written + SSB; OTA vs IMA/INA/AFA papers differ); AFCAT via IAF (AFCAT + EKT + AFSB) | To verify |
| CTET by CBSE (Paper I and Paper II); state TETs by state boards | To verify |
| LIC AAO/ADO and NIACL/others (insurers conduct their own recruitment) | To verify |
| State PSC exams are conducted by each state's commission | General, but per-state pattern to verify |

## 5. Content plan: honest scope

Current throughput reference: the platform has 203 lessons, 428 bank questions, 128 interview questions and about 1,600 practice questions. That took many agent sessions plus an audit. Estimates below are for **drafted, validated and spot-checked** content; each also needs the fact-check pass the repo already practises (Phase 9).

| Block | Unit | Estimate | Notes |
|---|---|---|---|
| Aptitude core (quant, reasoning, verbal, DI) | topics / questions | about 90 topics, 2,500 questions | Quant about 35 topics, reasoning about 25, English about 20, DI about 10. Question counts need arithmetic checking by script; reasoning puzzles need a solver or review. |
| General awareness (static GK: polity, history, geography, economy, science) | topics / questions | about 60 topics, 1,500 questions | Fact-heavy; each fact needs a source. High risk. |
| Current affairs | monthly digest | Only as a pipeline, not bulk content | Needs a dated, sourced format; recommend deferring (open decision 7). |
| Computer awareness | topics / questions | about 15 topics, 300 questions | Overlaps with IT lessons; cheap. |
| Exams, MVP | exam pages | 4 (SSC CGL, IBPS PO, RRB NTPC, UPSC CSE prelims-first) | Plus 1 sectional mock each from aptitude banks. |
| Exams, full target | exam pages | about 45-60 | Each: pattern, syllabus tree, eligibility, links, study path. About 1 page-day of verification each. |
| IT domains beyond testing | roles / lessons | 12 domains x about 8 roles = about 100 roles; lessons about 40-60 per major domain | Roles are cheap (about 1 file each); lessons are the cost. Target 5 domains with about 40 lessons each in MVP+1 (about 200 lessons), then 7 more later (about 280). |
| IT interview tracks | questions | 8-10 per domain track minimum (schema floor 8) | About 120-150 questions for the first 5 domains. |
| Non-IT overviews | pages | about 10 domains x 5 roles, overview only, no lessons | Clearly labelled overview. |

**Phases**
- **MVP (target: 10-14 delivery steps):** foundations (schema, IA, nav, UI system), aptitude core (about 40 priority topics, about 1,000 questions), 4 exams, 5 IT domains: Software Development (backend, frontend, full-stack), Data (analyst, engineer, scientist), Cloud/DevOps/SRE, Cybersecurity, and Databases/DBA. Roles first (about 40), lessons for the highest-demand topics only.
- **Phase 2:** 10 more exams (rest of SSC, IBPS Clerk/SO, SBI, RBI, RRB JE/Group D/ALP, NDA/CDS/AFCAT, CTET), rest of aptitude, GA statics, 4 more IT domains (Networking, Product/Project/BA, UI/UX, IT support).
- **Phase 3:** ERP/SAP, AI/ML as a domain (reusing the AI-engineering course), non-IT overviews, state PSC (one or two states at a time), insurance, current-affairs pipeline.
- **Ongoing:** yearly exam re-verification.

## 6. UI/UX direction

Build on `docs/ui-audit.md`: the neon and aurora are already gone; calm neutrals, one brand colour and tokens are in place. What remains is that the product still reads as a generic dashboard template: card grids, a sidebar of 20 items, equal-weight blocks, and Lucide icons on everything. The direction is **editorial and quiet**, closer to a well-set reference book plus a precise tool than to a SaaS template.

**Principles**
1. **Type carries the identity.** Pair a serif display face (for H1/H2 and exam titles) with a neutral grotesque or humanist sans for UI, and a mono for code and numbers. Self-host via `next/font` (no CDN, CSP already blocks external fonts). Tight scale: 12/14/16/20/28/40; lesson body 17-18px/1.7 at 68-72ch. Numerals tabular everywhere stats appear.
2. **A strict grid.** 12-column grid with a 1200px max, an 8px base unit, and a fixed left rail (area switcher) plus content column plus optional right rail (on this page, syllabus nodes, progress). Fewer boxes: separate with hairlines and whitespace, not card-in-card.
3. **Density with hierarchy.** One primary action per screen. Tables and lists over card walls for catalogues (exams, roles). Cards only for entities a learner picks between (domains).
4. **Iconography:** one icon set at one stroke weight and size (16/20px), used only where it labels something (nav, status). Drop icons that decorate card headers. Domain identity comes from a typographic monogram or a small flat glyph, not from a coloured icon tile.
5. **Illustration policy:** none generated, none stock. Allowed: diagrams that explain (Mermaid, SVG written for the lesson), and a small set of hand-drawn-style geometric marks for domain hubs commissioned or drawn once. No mascots, no 3D blobs, no gradient meshes.
6. **Motion:** keep state-explaining motion only (progress fill, route transition, test timer). Remove hover-lift on every card, stagger-in on every list, and count-up animations on stats. Everything honours `prefers-reduced-motion`.
7. **Colour:** keep one accent plus amber for celebration. Introduce **area tints** (a 4-step desaturated tone per area, used only for a 3px top rule and a label) instead of per-domain colours. Semantic colours stay separate. Check contrast at AA for all text pairs.
8. **Copy:** plain, specific, no "supercharge", "unlock", "journey". Empty states state what is missing. The tone of a good reference, not marketing.

**Remove:** gradient text, glow borders, confetti except on a passed practice/mock (as today), emoji in UI chrome, equal-weight stat tiles with made-up trends, a sidebar listing every course, decorative badges, the repeated hero banner on hubs.

**Per screen**

| Screen | Changes |
|---|---|
| Home/dashboard | Replace the tile wall with three zones: (a) *Continue* (one resume card per active item), (b) *Today* (planner tasks, text list), (c) *Your target* (role or exam with readiness checklist, not a percent made of nothing). First-run: three doors. Empty states instead of zero-tiles. |
| Domain hub | A header with title, one-sentence scope, counts computed from content (never typed). Then three columns: Roles, Courses, Practice. Role list as a table (role, level, skills count). No hero image. |
| Exam page | Editorial layout: left, a sticky in-page contents (Overview, Eligibility, Stages, Pattern, Syllabus, Study path, Mocks); centre, content; top strip with conducting body, **verified date and official links** always visible. Pattern as a real table (section, questions, marks, time, negative marking). Syllabus as a collapsible tree with per-node progress. A stage diagram as a linear stepper. |
| Lesson | Keep the 72ch reader. Add a right rail (contents + progress), serif H1/H2, marginal "key point" callouts, sticky practice bar. Quieter code blocks. |
| Practice | One question at a time, large type, a clear timer only when timed, immediate rationale after submit in drill mode. Topic drills for aptitude show method steps (collapsed) after the answer. |
| Mock test | Exam-faithful chrome: section tabs, question palette (answered, marked, not visited), timer, language toggle where available, review screen, score with per-section and per-topic breakdown and marks lost to negative marking. Plain light surface, no celebration unless pass rule in the exam definition exists. |

## 7. Performance and build impact

Today: about 420 pages, about 7.7 MB of content, a single `search-index.json`, localStorage-only learner data. Projected: 3,000-6,000 pages (every aptitude topic, exam, role, lesson, practice test), and 10,000+ questions.

| Risk | Mitigation |
|---|---|
| Build time grows linearly with pages | Keep static generation but **prerender only high-value pages** (hubs, exams, roles, lessons). Generate long-tail pages (per-topic drills, per-question views) on demand with `dynamicParams` and cache, or serve drills from a client runner reading one JSON. Measure build time per step; set a budget (suggest under 10 minutes on CI). |
| Search index grows to several MB | Shard by area (`search-index/<area>.json`), load the focused area first, load others lazily; keep only title, summary and keywords; consider a client index (MiniSearch/FlexSearch) over a trimmed field set. Budget: index under 300 KB gzip per area. |
| Question banks ship answer keys to the client (known trade-off) | Keep as is, but never ship all banks together: one JSON per topic and per mock, loaded when the runner opens. Mark in the docs that scoring is not authoritative. Move scoring server-side if login returns. |
| Loader reads and validates all content on every build | Cache parsed content on disk keyed by file hash; validate in vitest, load lazily by area in the build. |
| Large `curriculum.ts` | Replaced by data files; load per domain. |
| Syllabus trees and exam JSON | Small; no concern. |
| Vercel deployment limits (build time, output size) | Check plan limits before Phase 2; consider ISR for long-tail pages. |
| E2E/test time | Playwright covers smoke paths per area, not per page; add a link-checker script over the static output instead. |
| Fonts and images | Self-hosted subsetted fonts (Latin plus Devanagari only if Hindi is added, open decision 5); no raster illustrations. |

## 8. Delivery plan (one agent per step, each with its own validation and push)

Every step: `npm run check` (tsc, eslint, vitest) green, `npm run build` green, relevant Playwright specs green, `docs/implementation-status.md` updated. Mark "not run" if something was not run.

| # | Step | Acceptance criteria |
|---|---|---|
| 1 | **Freeze legacy URLs.** Script that lists every route from the current build into `frontend/src/content/legacy-urls.json`; vitest asserts they all resolve (as page or redirect) from now on. | File committed with about 420 URLs; test passes on current code. |
| 2 | **Domain and exam schemas** in `schema/` with unit tests (valid and invalid fixtures): domain, role (domain/group), exam, syllabus node, aptitude topic, extended question, mock definition. Old schemas still pass. | Existing content validates unchanged; fixtures for each new schema; official-domain allow-list implemented and tested. |
| 3 | **Data-driven domains:** move `TRACKS` into `content/domains/testing.json` plus AI engineering; `curriculum.ts` becomes a loader that returns the same shape. Roles' categories mapped to domain groups. | Zero route changes; all 203 lessons and 89 roles load; content tests unchanged and green; page count unchanged. |
| 4 | **New route structure and redirects:** `/careers/<domain>/...`; old URLs redirect permanently; old index pages (`/learn`, `/roadmaps`, ...) stay as filtered views. | Step 1 test passes with redirects; e2e opens an old lesson URL and lands on the new one; localStorage progress still shows. |
| 5 | **Navigation rewrite:** areas plus section tree from data; `navigation.ts` generated from domains/exam families; breadcrumbs and `PlannedSection` for unbuilt areas (Exams, Aptitude, Non-IT) that say so honestly. | Sidebar shows areas, not courses; every nav href resolves; planned pages state "not built yet". |
| 6 | **UI system v2:** fonts, type scale, grid, area tints, restyled shell, button/table/tabs/tree primitives; remove the listed decorations (hover-lift, count-up, card-in-card). Update `docs/ui-audit.md`. | Contrast checks pass AA; screenshots of 6 key screens in light and dark attached to the PR notes; reduced-motion respected; no hard-coded colours (lint rule or test). |
| 7 | **Home, onboarding and dashboard redesign** (three doors, continue, today, target). Store: `focus` and entity-prefixed keys with migration and export/import tests. | Old localStorage data survives (unit test); no number on screen not computed from data. |
| 8 | **Search v2:** sharded index by area, type/area filters, lazy load. | Index size budget met (assert in a test); old search queries still work; e2e. |
| 9 | **Domain hub page and role-list table** for any domain; seed with Testing. | Counts computed from content; renders for domains with zero lessons honestly. |
| 10 | **Exam engine:** exam page, pattern table, stage stepper, syllabus tree with progress, official-source strip, staleness banner; seed with a **fixture exam** (marked as fixture, not published). | Schema-required source fields enforced; staleness test works (fixture date manipulated in test); forbidden-term test works. |
| 11 | **Mock runner v2:** sections, sectional timers, palette, mark-for-review, per-section negative marking using the existing scorer, deterministic seeding. | Scoring unit tests for negative marking and unattempted questions; e2e finishes a 2-section mock; old banks run unchanged. |
| 12 | **Aptitude engine:** `/aptitude` hub, subject and topic pages, topic drill (timed/untimed), method explanations. Seed 3 topics. | Question arithmetic checked by script where numeric; lessons pass the aptitude content contract test. |
| 13 | **Aptitude content batches** (several steps, about 10 topics each, quant first, then reasoning, verbal, DI). | Each batch: all questions validate, numeric answers recomputed by script, no duplicates (test), build time within budget. |
| 14 | **First exam: SSC CGL** with sources verified by a human-readable log entry; sectional mock from aptitude banks. | Official URLs reachable (manual check noted in the log); `lastVerified` set; every pattern number traceable to a link; open decision 3 answered. |
| 15 | **Exams IBPS PO, RRB NTPC, UPSC CSE (prelims and mains structure)**, one per sub-step. | Same as 14; UPSC syllabus entered as the official text, not paraphrased facts. |
| 16 | **IT domain 1: Software development** (hub, roles for backend/frontend/full-stack/mobile, one course with about 30 lessons in batches, interview track, bank). | Content validation, fact-check log; lesson count stated honestly in status doc. |
| 17-20 | **IT domains 2-5:** Data; Cloud/DevOps/SRE; Cybersecurity (with boundaries note); Databases/DBA. One step per domain, lessons in batches. | As step 16. |
| 21 | **Cross-links:** exam syllabus nodes link to aptitude topics; roles link to domain courses; progress per exam node. | A test fails on any `topicRef` that does not resolve. |
| 22 | **Performance pass:** measure build time, page count and bundle; implement on-demand generation for long-tail routes if over budget. | Budget numbers recorded in `docs/implementation-status.md`. |
| 23+ | Phase 2 exams and domains, one exam or domain per step. | As above. |
| Last | **Yearly verification run:** a script lists exams by `lastVerified` age; owner and an agent re-verify. | Log updated; stale exams flagged. |

## 9. Risks, open decisions, recommended defaults

**Risks**
- Government exam accuracy (largest risk): mitigated by section 4, but depends on being able to read official sites. Several refused automated fetches; a human or browser-capable pass may be needed.
- Scope creep: 60 exams and 12 domains is a multi-month content effort. The MVP cap protects this.
- Copyright on previous-year papers and on coaching-site content; do not copy.
- Reasoning and GK questions are easy to get subtly wrong at scale; use scripts for numeric checks and a review pass for the rest.
- Sidebar and URL changes can lose bookmarks and learner progress; mitigated by step 1, 4, 7.
- Without login or a backend, scoring is client-side and not authoritative; this is fine for self-prep but should be stated.
- Build and search size (section 7).
- Brand: the name "Saige-Prep" and the "private" positioning may not fit a broader audience; see decision 8.

**Open decisions for the user**

| # | Decision | Recommended default |
|---|---|---|
| 1 | Keep it private/open with no login, or make it public with accounts? | Stay open, no login, until content is ready; revisit server-side scoring then. |
| 2 | Which 4 exams first? | SSC CGL, IBPS PO, RRB NTPC, UPSC CSE (prelims first). |
| 3 | Which 5 IT domains first? | Software development, Data, Cloud/DevOps/SRE, Cybersecurity, Databases. |
| 4 | Previous-year papers: link only or original lookalikes? | Original questions in the exam's style, tagged as such; link official papers. |
| 5 | Languages: English only, or Hindi (and others) for exam content? | English first; design schema for `language` now; add Hindi per exam later. Needs Devanagari fonts. |
| 6 | Interview-stage prep for exams (UPSC personality test, SSB)? | Short guide pages only, no mock scoring. |
| 7 | Current affairs: include? | Defer; if included, monthly digests with dated, sourced entries only. |
| 8 | Product name and positioning (keep "Saige-Prep"?) | Keep the name; update the tagline and `docs`; revisit only if it goes public. |
| 9 | Non-IT careers: overview pages only, or add learning paths? | Overview only (as asked), clearly labelled. |
| 10 | Can I use a browser or human verification of exam facts (since sites block bots)? | Yes: owner confirms each exam's official links during step 14-15. |
| 11 | Hosting limits: stay on current Vercel plan? | Check build limits before step 22. |
| 12 | Redirect model: permanent redirects, or keep both route trees? | Permanent redirects plus the old index pages kept as filtered views. |

## Decisions taken (2026-11-14, by the owner)
- First exams: SSC CGL, IBPS PO, RRB NTPC, UPSC CSE (prelims).
- First IT domains: software development, data, cloud/DevOps/SRE, cybersecurity, databases.
- Previous-year questions: original look-alike questions only; link the official papers where the exam body publishes them.
- Language: English first; schema carries a locale so Hindi can be added later.
- Other open decisions: the recommended defaults above apply until changed.
- Delivery: one agent per step, sequentially; each step is validated and pushed before the next starts.

## Scope update (2026-11-14, by the owner)
- **India first, world later.** Coverage expands beyond IT to every major career path in India, including professional fields such as law (CLAT, AILET, AIBE; LLB path), chartered accountancy and commerce (ICAI CA Foundation/Inter/Final, CS, CMA), medicine and allied fields (NEET-UG/PG), engineering entrance (JEE Main/Advanced, GATE), management (CAT), and the government exams listed above. Each path gets an overview first (role, eligibility, qualifying exams with official links and last-verified dates, study route), with deep lessons, practice and mocks added in waves. Global (non-India) coverage is a later phase; the domain/exam schema carries a `country` field from the start so it can be added without migration.
- **Voice interview practice: browser voice, no AI.** The interview simulator uses the browser's built-in Web Speech API: speech synthesis reads each question aloud in the best available system voice (user-selectable, with rate and pitch), and speech recognition captures the spoken answer as a live transcript where the browser supports it (typed answers otherwise). There's no AI scoring: after answering, the learner sees the model answer and key points beside their transcript and self-rates; ratings are stored locally like other practice. Nothing is sent to a third-party AI service. Caveats to state in the UI: recognition availability varies by browser, and Chrome's recognition is processed by the browser vendor's speech service.

### Added delivery steps
- **Step 12a: Voice interview simulator** (after the mock runner v2): question queue from the existing interview banks (role, domain, exam interview), voice picker, read-aloud, live transcript, model answer + key-point checklist, self-rating, keyboard-only and screen-reader friendly, works without speech support. Acceptance: unit tests for the session state machine; e2e with speech APIs stubbed; CSP still has no third-party connect-src.
- **Step 23a: India career catalogue**: overview pages for the professional paths above, each with official-source links and last-verified dates, built on the domain/exam schema.
- **Later phase: global**: country dimension in navigation and exams.

### Previous-year papers library (owner request, 2026-11-14)
Every exam page gets a **Previous papers** section:
- A year-by-year index (exam, stage, shift, year) linking to the official question papers and answer keys on the conducting body's site (e.g. UPSC publishes prelims papers and keys; SSC/RRB/IBPS publish answer keys and response sheets for a limited window). Each link carries a last-verified date. Dead links are flagged by the yearly verification step.
- **Year-wise practice sets**: original questions written to mirror each year's section pattern, topic mix and difficulty, timed and marked like the real paper (with negative marking), so learners can take a "2024-style" full paper. Clearly labelled "modelled on", never presented as the real paper.
- Topic-wise PYQ trend notes (which topics appear most often), written from the official papers.
Aptitude and reasoning (quant, logical/analytical reasoning, verbal, data interpretation, GA, computer awareness) are the shared core across all exams (steps 12–13).
Delivered with each exam (steps 14–15 and later exam waves).
