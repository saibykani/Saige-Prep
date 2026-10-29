# Content authoring guide

All learning content lives in `frontend/content/` and is bundled into the site at build time. Every file is validated by `frontend/src/content/content.test.ts` against the zod schemas in `frontend/src/content/schema.ts`. **Content that fails validation breaks the build, so validate before you finish.**

```bash
cd frontend
CONTENT_ONLY=lessons/api-testing npx vitest run src/content   # just your files
npx vitest run src/content                                    # everything
```

## Ground truth files (read before writing)

| File | What it defines |
|---|---|
| `frontend/src/content/curriculum.ts` | Every track → module → topic, with fixed **topic slugs** |
| `frontend/src/content/role-catalog.ts` | Every role with fixed **role slugs** and categories |
| `frontend/src/content/schema.ts` | Exact field names, types and minimums |
| `frontend/content/lessons/manual-testing/boundary-value-analysis.md` | **The exemplar lesson.** Match its depth, tone and structure |

## Integrity rules (non-negotiable)

1. **Be technically correct.** Prefer standard definitions (ISTQB for terminology, official tool docs for tools). If something varies by tool version, say so.
2. **Never invent** statistics, studies, quotes, case-study company names, screenshots, videos or URLs. A "real-world example" is a realistic, clearly generic scenario ("a payments team…"), never a claim about a named company.
3. **References must be real, stable, official URLs** that you are certain exist, preferably documentation home or section pages, for example: `https://www.selenium.dev/documentation/`, `https://playwright.dev/docs/intro`, `https://testng.org/`, `https://junit.org/junit5/docs/current/user-guide/`, `https://maven.apache.org/guides/`, `https://rest-assured.io/`, `https://learning.postman.com/docs/introduction/overview/`, `https://jmeter.apache.org/usermanual/index.html`, `https://appium.io/docs/en/latest/`, `https://www.w3.org/WAI/standards-guidelines/wcag/`, `https://owasp.org/www-project-top-ten/`, `https://developer.mozilla.org/en-US/docs/Web/HTTP`, `https://www.istqb.org/`, `https://docs.github.com/en/actions`, `https://www.jenkins.io/doc/`, `https://docs.docker.com/`, `https://www.postgresql.org/docs/`, `https://json-schema.org/`, `https://docs.pact.io/`, `https://grafana.com/docs/`, `https://docs.influxdata.com/`, `https://cucumber.io/docs/`, `https://git-scm.com/doc`, `https://www.atlassian.com/software/jira/guides`, `https://www.scrumguides.org/`, `https://agilemanifesto.org/`, `https://webdriver.io/docs/gettingstarted`, `https://docs.cypress.io/`, `https://robotframework.org/`, `https://developer.android.com/training/testing`, `https://developer.apple.com/documentation/xctest`, `https://www.deque.com/axe/`, `https://principlesofchaos.org/`, `https://sre.google/books/`. Use `https://` only. When unsure a deep link exists, use the documentation home page.
4. **Ethics:** security content covers only authorized testing in your own lab or with written permission. Performance content: never load-test third-party systems without authorization.
5. **No raw HTML** in Markdown (no `<div>`, `<img>`, `<span>`, `<script>`, `<iframe>`, `<style>`).
6. **Distinguish essential vs optional skills.** Don't claim every role needs every tool.

## Lessons: `frontend/content/lessons/<track>/<topic-slug>.md`

- The file name **must equal** the topic slug from `curriculum.ts`, inside the folder of that topic's **track** slug.
- Front matter fields are listed in `lessonFrontmatter` (schema.ts); copy the exemplar's structure.
- `summary` is 20–300 characters. `duration` is in minutes (realistic: 15–45).
- `related` and every `quiz[].topic` must be topic slugs from `curriculum.ts`.
- **Quiz:** 3–5 questions, mixing `single`, `multiple`, `truefalse` (options exactly `["True", "False"]`), `code-output`, `scenario` and `debugging`. `answer` is an array of 0-based option indexes. Every explanation says *why* the right answer is right and the tempting wrong one is wrong.
- **Quiz ids must be globally unique.** Prefix them with a short lesson code, e.g. `ep-q1`, `rest-status-q2`.
- **Interview:** at least 3 Q&A pairs with model answers a strong candidate would give.
- **Body:** 900–1,800 words. It must contain these exact `##` headings:
  - `## Beginner-friendly explanation` (an analogy, no jargon)
  - `## Technical explanation` (precise definitions and mechanics)
  - `## Real-world example`
  - `## Common mistakes`
- Add the other contract sections wherever they fit:
  - `## Step-by-step walkthrough`
  - `## Code examples` (fenced, with a language tag)
  - `## Expected output`
  - `## Troubleshooting`
  - `## Key takeaways summary`
  - a ```` ```mermaid ```` diagram where a picture helps (flowchart, sequenceDiagram or stateDiagram-v2)
- Use tables for worked examples (BVA tables, decision tables, state tables).
- Internal links use `/learn/<track>/<topic-slug>`.

## Roles: `frontend/content/roles/<category>.json`

```json
{ "category": "core-qa", "roles": [ { ...role } ] }
```

- Field list: `role` in schema.ts. One file per category, containing **every** role in that category from `role-catalog.ts`, with the exact slug and title.
- `overview` is at least 80 characters. Roadmap stages are `beginner`, `intermediate` and `advanced`, each with `title`, 2+ `goals` and `topics` (curriculum topic slugs).
- `skills`: `essential` (truly required), `roleSpecific` and `optional`.
- `interviewQuestions` has at least 4 entries, with substantive answers.
- `nextRoles` must use slugs from `role-catalog.ts`.
- `penetration-testing-specialist` **must** include `boundaries` (authorized scope, written permission, legal compliance).

## Question banks: `frontend/content/questions/<track>.json`

```json
{ "bank": "manual-testing", "title": "Manual Testing", "track": "manual-testing", "questions": [ ... ] }
```

- Each question follows `choiceQuestion` in schema.ts, with a `topic` that is a curriculum slug.
- Ids are globally unique, prefixed with the bank, e.g. `mt-101`.
- Aim for at least 40 questions per bank, covering most topics in the track, across all three difficulties and several question types.

## Interviews: `frontend/content/interviews/<track>.json`

- Follows `interviewTrack` in schema.ts. `roles` uses slugs from `role-catalog.ts`.
- Each question has these fields:
  - `kind`: technical, scenario, coding, behavioral or system-design
  - `followUps`: realistic probing questions
  - `modelAnswer`: at least 80 characters, written as a strong candidate would say it
  - `keyPoints`: at least 3; this is the self-evaluation checklist
  - `redFlags`: weak-answer signals
  - `minutes`: expected answer time
- Ids are globally unique, prefixed per track, e.g. `int-api-07`.
