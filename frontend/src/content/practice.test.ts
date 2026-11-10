/**
 * Validates content/practice/: schema, lesson links, unique ids, and — the important part — that every
 * coding exercise is sound: the model solution passes all of its tests and the starter code does not.
 * Python runs in Pyodide under Node, SQL in sql.js, JS/TS through the same harness the browser uses.
 * CONTENT_ONLY narrows the files, as in content.test.ts.
 */
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { CodingExercise } from "./schema";

vi.mock("server-only", () => ({}));

const { allTopics } = await import("./curriculum");
const { lessonPracticeFile, exerciseMarks } = await import("./schema");
const { CONTENT_DIR, readDir, readJson } = await import("./loader");
const { buildJsScript, compareTables } = await import("@/features/lesson-practice/runners");

const ONLY = (process.env.CONTENT_ONLY ?? "").replace(/\\/g, "/");
const files = readDir(path.join(CONTENT_DIR, "practice"), ".json").filter((f) => !ONLY || f.replace(/\\/g, "/").includes(ONLY));
const rel = (f: string) => path.relative(CONTENT_DIR, f).replace(/\\/g, "/");
const practices = files.map((f) => ({ file: rel(f), data: readJson(f, lessonPracticeFile) }));

type Outcome = { error: string | null; passed: boolean[] };

async function runJs(code: string, tests: { name: string; code: string }[]): Promise<Outcome> {
  let posted: { error: string | null; results: { ok: boolean }[] } | undefined;
  try {
    await new Function("postMessage", `${buildJsScript(code, tests)}\n;return new Promise((r) => setTimeout(r, 0));`)((m: typeof posted) => {
      posted = m;
    });
  } catch (e) {
    return { error: String(e), passed: tests.map(() => false) };
  }
  return { error: posted?.error ?? "no result", passed: posted?.results.map((r) => r.ok) ?? [] };
}

let py: Awaited<ReturnType<typeof import("pyodide").loadPyodide>>;
let SQL: import("sql.js").SqlJsStatic;

async function runPy(code: string, tests: { code: string }[]): Promise<Outcome> {
  const ns = py.globals.get("dict")();
  try {
    try {
      await py.runPythonAsync(code, { globals: ns });
    } catch (e) {
      return { error: String(e).split("\n").filter(Boolean).at(-1) ?? "error", passed: tests.map(() => false) };
    }
    const passed: boolean[] = [];
    for (const t of tests) {
      try {
        await py.runPythonAsync(t.code, { globals: ns });
        passed.push(true);
      } catch {
        passed.push(false);
      }
    }
    return { error: null, passed };
  } finally {
    ns.destroy();
  }
}

function runSqlEx(ex: Extract<CodingExercise, { language: "sql" }>, query: string): Outcome {
  const db = new SQL.Database();
  try {
    db.run(ex.setup);
    const last = db.exec(query).at(-1) ?? { columns: [], values: [] };
    return { error: null, passed: compareTables({ columns: last.columns, rows: last.values }, ex.expected, ex.ordered).map((r) => r.ok) };
  } catch (e) {
    return { error: String(e), passed: [false] };
  } finally {
    db.close();
  }
}

async function outcome(ex: CodingExercise, code: string): Promise<Outcome> {
  if (ex.language === "python") return runPy(code, ex.tests);
  if (ex.language === "javascript") return runJs(code, ex.tests);
  if (ex.language === "typescript") {
    const { transform } = await import("sucrase");
    const strip = (c: string) => transform(c, { transforms: ["typescript"], disableESTransforms: true }).code;
    try {
      return runJs(strip(code), ex.tests.map((t) => ({ ...t, code: strip(t.code) })));
    } catch (e) {
      return { error: String(e), passed: ex.tests.map(() => false) };
    }
  }
  if (ex.language === "sql") return runSqlEx(ex, code);
  return { error: null, passed: [] };
}

const exercises = practices.flatMap((p) => p.data.coding.map((ex) => [`${p.file} › ${ex.id}`, ex] as const));

beforeAll(async () => {
  if (exercises.some(([, ex]) => ex.language === "python")) {
    const { loadPyodide } = await import("pyodide");
    py = await loadPyodide();
  }
  if (exercises.some(([, ex]) => ex.language === "sql")) {
    SQL = await (await import("sql.js")).default();
  }
}, 180_000);

describe("lesson practice files", () => {
  const topics = allTopics();

  it.each(practices.map((p) => [p.file, p] as const))("%s links to its lesson", (_n, p) => {
    const folderTrack = p.file.split("/")[1];
    const topic = topics.find((t) => t.slug === p.data.lesson);
    expect(topic, `unknown lesson ${p.data.lesson}`).toBeDefined();
    expect(topic?.track.slug, "practice file is in the wrong track folder").toBe(folderTrack);
    expect(path.basename(p.file, ".json")).toBe(p.data.lesson);
    for (const q of p.data.questions) expect(q.topic, `${q.id} topic`).toBe(p.data.lesson);
    const levels = new Set(p.data.questions.map((q) => q.difficulty));
    expect(levels.size, "practice test should span at least two difficulty levels").toBeGreaterThanOrEqual(2);
  });

  it("uses globally unique question and exercise ids", () => {
    const ids = practices.flatMap((p) => [...p.data.questions.map((q) => q.id), ...p.data.coding.map((c) => c.id)]);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });
});

describe("coding exercises", () => {
  it.each(exercises)("%s: model solution passes every check, starter passes none", async (_n, ex) => {
    if (ex.language === "java") {
      expect(ex.junit).toMatch(/@Test/);
      expect(exerciseMarks(ex)).toBeGreaterThan(0);
      return;
    }
    const solved = await outcome(ex, ex.solution);
    expect(solved.error, "model solution raised an error").toBeNull();
    expect(solved.passed.every(Boolean), `model solution failed checks: ${JSON.stringify(solved.passed)}`).toBe(true);
    // Learners must not earn marks for untouched starter code, so it must fail every check.
    const starter = await outcome(ex, ex.starter);
    expect(starter.passed.some(Boolean), `starter code passes checks: ${JSON.stringify(starter.passed)}`).toBe(false);
  }, 60_000);
});
