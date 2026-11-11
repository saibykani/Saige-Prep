"use client";

import { CheckCircle2, Eye, Lightbulb, Loader2, Play, RotateCcw, XCircle } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Markdown } from "@/components/learning/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Confetti } from "@/features/practice/practice-ui";
import { exerciseMarks, type CodingExercise } from "@/content/schema";
import { actions, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { shouldSave } from "./marks";
import { runJavaScript, runPython, runSql, runTypeScript, sqlCheckMarks, warmUpPython, type RunResult } from "./runners";

const CodeEditor = lazy(() => import("./code-editor"));

const LANGUAGE_LABEL: Record<CodingExercise["language"], string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  sql: "SQL",
  java: "Java",
};

/** Marks per check, in the same order as the run results. */
function checkMarks(ex: CodingExercise): number[] {
  if ("tests" in ex) return ex.tests.map((t) => t.marks);
  if (ex.language === "sql") return sqlCheckMarks(ex.marks, ex.ordered);
  return [];
}

async function run(ex: CodingExercise, code: string): Promise<RunResult> {
  switch (ex.language) {
    case "python":
      return runPython(code, ex.tests);
    case "javascript":
      return runJavaScript(code, ex.tests);
    case "typescript":
      return runTypeScript(code, ex.tests);
    case "sql":
      return runSql(ex, code);
    case "java":
      throw new Error("Java runs on your machine");
  }
}

export function CodingExerciseCard({ exercise: ex }: { exercise: CodingExercise }) {
  const key = `code:${ex.id}`;
  const best = useStore((d) => d.practice[key]?.score);
  const [code, setCode] = useState(ex.starter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const total = exerciseMarks(ex);
  const marks = checkMarks(ex);
  const earned = result ? result.results.reduce((n, r, i) => n + (r.ok ? (marks[i] ?? 0) : 0), 0) : 0;
  const attempted = result !== null;
  const allPassed = attempted && total > 0 && earned === total;

  function save(points: number) {
    const percent = Math.round((points / total) * 100);
    if (shouldSave(best, percent)) actions.completePractice(key, percent);
  }

  async function check() {
    setRunning(true);
    try {
      const r = await run(ex, code);
      setResult(r);
      save(r.results.reduce((n, t, i) => n + (t.ok ? (marks[i] ?? 0) : 0), 0));
    } finally {
      setRunning(false);
    }
  }

  return (
    <article className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6" onPointerEnter={ex.language === "python" ? warmUpPython : undefined}>
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-base font-semibold">{ex.title}</h3>
        <Badge>{LANGUAGE_LABEL[ex.language]}</Badge>
        <Badge className="capitalize">{ex.difficulty}</Badge>
        <Badge tone="accent">{total} marks</Badge>
        {best !== undefined && <Badge tone="success">Best: {best}%</Badge>}
      </header>

      <Markdown source={ex.prompt} />

      <Suspense fallback={<div className="h-[180px] animate-pulse rounded-lg border border-border bg-surface-raised" />}>
        <CodeEditor value={code} onChange={setCode} language={ex.language} label={`${ex.title} code editor`} />
      </Suspense>

      {ex.language === "java" ? (
        <JavaLocalRun exercise={ex} total={total} onSelfMark={save} />
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button onClick={check} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            {running ? (ex.language === "python" && !attempted ? "Starting Python…" : "Running…") : "Run and check"}
          </Button>
          <Button variant="ghost" onClick={() => { setCode(ex.starter); setResult(null); }}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset code
          </Button>
        </div>
      )}

      {result && (
        <div className="space-y-3" role="status">
          <p
            key={allPassed ? "passed" : "not-yet"}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold tabular-nums",
              allPassed ? "celebrate text-success" : "border-border bg-surface-raised",
            )}
          >
            {allPassed && (
              <>
                <Confetti pieces={12} />
                <svg viewBox="0 0 24 24" className="check-draw h-4 w-4" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
            {earned} / {total} marks
            {earned === total ? " · All checks passed" : ""}
          </p>
          {result.error && <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 font-mono text-xs text-danger">{result.error}</p>}
          <ul className="space-y-1.5 text-sm">
            {result.results.map((r, i) => (
              <li key={r.name} className="flex items-start gap-2">
                {r.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Passed" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label="Failed" />}
                <span className="min-w-0">
                  {r.name} <span className="text-subtle">({marks[i] ?? 0} mark{marks[i] === 1 ? "" : "s"})</span>
                  {!r.ok && r.message && <span className="block font-mono text-xs text-muted">{r.message}</span>}
                </span>
              </li>
            ))}
          </ul>
          {result.stdout.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Output</p>
              <pre className="max-h-48 overflow-auto rounded-lg bg-code-bg p-3 font-mono text-xs text-code-foreground">{result.stdout.join("\n")}</pre>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        {hints < ex.hints.length && (
          <Button variant="secondary" size="sm" onClick={() => setHints((h) => h + 1)}>
            <Lightbulb className="h-3.5 w-3.5" aria-hidden /> {hints === 0 ? "Show a hint" : "Next hint"}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => setShowSolution((s) => !s)}>
          <Eye className="h-3.5 w-3.5" aria-hidden /> {showSolution ? "Hide model solution" : attempted ? "Show model solution" : "Give up and show the solution"}
        </Button>
      </div>
      {hints > 0 && (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground/90">
          {ex.hints.slice(0, hints).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      )}
      {showSolution && (
        <div className="space-y-2">
          <CodeBlock code={ex.solution} language={ex.language} />
          <p className="text-sm leading-6 text-foreground/85">{ex.explanation}</p>
        </div>
      )}
    </article>
  );
}

function JavaLocalRun({
  exercise: ex,
  total,
  onSelfMark,
}: {
  exercise: Extract<CodingExercise, { language: "java" }>;
  total: number;
  onSelfMark: (points: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [marked, setMarked] = useState<number | null>(null);
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-raised p-4 text-sm">
      <p className="text-foreground/90">
        Java cannot run in the browser, so this one is checked on your machine with JUnit: write your solution above, copy it into a project with the test class below, and run the tests.
      </p>
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide the JUnit tests" : "Show the JUnit tests and how to run them"}
      </Button>
      {open && (
        <div className="space-y-2">
          <Markdown source={ex.runInstructions} />
          <CodeBlock code={ex.junit} language="java" />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Self-assessed marks:</span>
        {[
          ["All tests passed", total],
          ["Some passed", Math.ceil(total / 2)],
          ["None passed yet", 0],
        ].map(([label, pts]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setMarked(pts as number);
              onSelfMark(pts as number);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              marked === pts ? "border-accent bg-accent-soft text-accent" : "border-border hover:border-border-strong",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
