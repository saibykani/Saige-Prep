/**
 * In-browser code runners for lesson coding exercises. Nothing leaves the learner's browser:
 * - Python runs in a Web Worker with Pyodide (served from /pyodide by scripts/copy-runtimes.mjs).
 * - JavaScript runs in a throwaway Blob worker; TypeScript is first stripped to JavaScript with Sucrase.
 * - SQL runs in sql.js (already used by the SQL lab).
 * Each run is time-limited; a worker that runs past the limit (an infinite loop) is terminated.
 */
import type { CodingExercise } from "@/content/schema";

export interface TestResult {
  name: string;
  ok: boolean;
  message: string;
}

export interface RunResult {
  stdout: string[];
  /** Error raised by the learner's code itself (syntax or runtime), if any. */
  error: string | null;
  results: TestResult[];
}

type Test = { name: string; code: string };
const TIMEOUT_MS = 10_000;

function timedOut(tests: Test[]): RunResult {
  return {
    stdout: [],
    error: `Stopped after ${TIMEOUT_MS / 1000} seconds. Check for an infinite loop.`,
    results: tests.map((t) => ({ name: t.name, ok: false, message: "Did not run (time limit)." })),
  };
}

/* --------------------------------- Python ---------------------------------- */

let pyWorker: Worker | null = null;
let pyRunId = 0;

function pythonWorker() {
  pyWorker ??= new Worker("/runners/python-worker.js");
  return pyWorker;
}

/** Starts downloading and booting Python in the background (about 14 MB, cached afterwards). */
export function warmUpPython() {
  pythonWorker();
}

export function runPython(code: string, tests: Test[]): Promise<RunResult> {
  const worker = pythonWorker();
  const id = ++pyRunId;
  return new Promise((resolve) => {
    // The first run also pays for booting Python, so it gets a longer allowance.
    const timer = setTimeout(() => {
      worker.removeEventListener("message", onMessage);
      worker.terminate();
      pyWorker = null;
      resolve(timedOut(tests));
    }, TIMEOUT_MS * 3);
    function onMessage(event: MessageEvent) {
      if (event.data?.id !== id) return;
      clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      resolve(event.data as RunResult);
    }
    worker.addEventListener("message", onMessage);
    worker.postMessage({ id, code, tests });
  });
}

/* ------------------------------- JavaScript -------------------------------- */

/** Test helpers available to JS/TS tests: assert(cond, msg) and assertEqual(actual, expected, msg). */
const JS_HARNESS = String.raw`
const __out = [];
const __fmt = (v) => typeof v === "string" ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
const console = { log: (...a) => __out.push(a.map(__fmt).join(" ")), info: (...a) => __out.push(a.map(__fmt).join(" ")),
  warn: (...a) => __out.push(a.map(__fmt).join(" ")), error: (...a) => __out.push(a.map(__fmt).join(" ")) };
function assert(cond, msg) { if (!cond) throw new Error(msg || "Assertion failed"); }
function __eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function assertEqual(actual, expected, msg) {
  if (!__eq(actual, expected)) throw new Error((msg ? msg + ": " : "") + "expected " + __fmt(expected) + ", got " + __fmt(actual));
}
`;

export function buildJsScript(code: string, tests: Test[]): string {
  const testBlocks = tests
    .map(
      (t) => `try { await (async () => {\n${t.code}\n})(); __results.push({ name: ${JSON.stringify(t.name)}, ok: true, message: "" }); }
catch (e) { __results.push({ name: ${JSON.stringify(t.name)}, ok: false, message: String(e && e.message || e) }); }`,
    )
    .join("\n");
  return `${JS_HARNESS}
const __results = [];
(async () => {
  try {
${code}
;
${testBlocks}
    postMessage({ stdout: __out, error: null, results: __results });
  } catch (e) {
    postMessage({ stdout: __out, error: String(e && e.message || e), results: ${JSON.stringify(tests.map((t) => t.name))}
      .map((name) => ({ name, ok: false, message: "Your code raised an error before this check could run." })) });
  }
})();`;
}

export function runJavaScript(code: string, tests: Test[]): Promise<RunResult> {
  const url = URL.createObjectURL(new Blob([buildJsScript(code, tests)], { type: "text/javascript" }));
  const worker = new Worker(url);
  return new Promise((resolve) => {
    const done = (r: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(() => done(timedOut(tests)), TIMEOUT_MS);
    worker.onmessage = (event) => done(event.data as RunResult);
    worker.onerror = (event) => {
      event.preventDefault();
      done({
        stdout: [],
        error: event.message || "Syntax error in your code",
        results: tests.map((t) => ({ name: t.name, ok: false, message: "Your code did not compile." })),
      });
    };
  });
}

export async function runTypeScript(code: string, tests: Test[]): Promise<RunResult> {
  const { transform } = await import("sucrase");
  let js: string;
  try {
    js = transform(code, { transforms: ["typescript"], disableESTransforms: true }).code;
  } catch (e) {
    return {
      stdout: [],
      error: `TypeScript error: ${e instanceof Error ? e.message : String(e)}`,
      results: tests.map((t) => ({ name: t.name, ok: false, message: "Your code did not compile." })),
    };
  }
  // Tests may use type annotations too.
  const jsTests = tests.map((t) => ({ name: t.name, code: transform(t.code, { transforms: ["typescript"], disableESTransforms: true }).code }));
  return runJavaScript(js, jsTests);
}

/* ----------------------------------- SQL ------------------------------------ */

export type Cell = string | number | null;

/** Normalises cell values so 3 and 3.0, or "a" and "a", compare equal. */
function norm(v: unknown): Cell {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Math.round(v * 1e6) / 1e6;
  if (typeof v === "bigint") return Number(v);
  return String(v);
}

/** Compares a query result with the expected table. Column names are compared case-insensitively. */
export function compareTables(
  actual: { columns: string[]; rows: unknown[][] },
  expected: { columns: string[]; rows: Cell[][] },
  ordered: boolean,
): TestResult[] {
  const colsOk =
    actual.columns.length === expected.columns.length &&
    actual.columns.every((c, i) => c.toLowerCase() === expected.columns[i].toLowerCase());
  const key = (r: unknown[]) => JSON.stringify(r.map(norm));
  const a = actual.rows.map(key);
  const e = expected.rows.map(key);
  const sameRows = a.length === e.length && [...a].sort().join("\n") === [...e].sort().join("\n");
  const results: TestResult[] = [
    {
      name: "Returns the right columns",
      ok: colsOk,
      message: colsOk ? "" : `expected columns (${expected.columns.join(", ")}), got (${actual.columns.join(", ")})`,
    },
    {
      name: "Returns the right rows",
      ok: sameRows,
      message: sameRows ? "" : `expected ${e.length} row(s), got ${a.length}${a.length === e.length ? " with different values" : ""}`,
    },
  ];
  if (ordered) {
    const inOrder = sameRows && a.join("\n") === e.join("\n");
    results.push({ name: "Rows are in the requested order", ok: inOrder, message: inOrder ? "" : "the rows are right but not in the required order" });
  }
  return results;
}

let sqlEngine: Promise<import("sql.js").SqlJsStatic> | null = null;

export async function runSql(ex: Extract<CodingExercise, { language: "sql" }>, query: string): Promise<RunResult> {
  sqlEngine ??= import("sql.js").then((m) => m.default({ locateFile: () => "/sql-wasm.wasm" }));
  const SQL = await sqlEngine;
  const db = new SQL.Database();
  try {
    db.run(ex.setup);
    let result;
    try {
      result = db.exec(query);
    } catch (e) {
      return {
        stdout: [],
        error: e instanceof Error ? e.message : String(e),
        results: compareTables({ columns: [], rows: [] }, ex.expected, ex.ordered).map((r) => ({ ...r, ok: false, message: "Your query did not run." })),
      };
    }
    const last = result.at(-1) ?? { columns: [], values: [] };
    const preview = [last.columns.join(" | "), ...last.values.slice(0, 20).map((r) => r.map((v) => (v === null ? "NULL" : String(v))).join(" | "))];
    return { stdout: last.columns.length ? preview : ["(no rows returned)"], error: null, results: compareTables({ columns: last.columns, rows: last.values }, ex.expected, ex.ordered) };
  } finally {
    db.close();
  }
}

/** Splits an exercise's marks across the SQL checks [columns, rows, order?]; the rows check gets any remainder. */
export function sqlCheckMarks(total: number, ordered: boolean): number[] {
  const parts = ordered ? 3 : 2;
  const each = Math.floor(total / parts);
  const marks = Array.from({ length: parts }, () => each);
  marks[1] += total - each * parts;
  return marks;
}
