"use client";

import { Database, Eye, Play, RotateCcw, Table2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Database as SqlDatabase } from "sql.js";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Alert, Kbd, Spinner } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { ExerciseHeader, Hint, LabShell, markPracticeDone, NextButton, Panel, recordAttempt, Verdict } from "./practice-ui";
import { isReadOnlySql, sameResult, SQL_EXERCISES, SQL_SCHEMA, SQL_SEED, type Row } from "./sql-data";

type Result = { columns: string[]; rows: Row[] };

const TABLES = ["customers", "products", "orders", "order_items", "payments"];

function ResultTable({ result }: { result: Result }) {
  if (result.columns.length === 0) return <p className="text-sm text-muted">Query ran — no rows returned.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-surface-raised">
          <tr>
            {result.columns.map((c) => (
              <th key={c} className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-mono text-xs font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="odd:bg-background/40">
              {row.map((v, j) => (
                <td key={j} className="whitespace-nowrap border-b border-border/50 px-3 py-1.5 font-mono text-xs">
                  {v === null ? <span className="text-subtle">NULL</span> : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-3 py-1.5 text-[11px] text-subtle">
        {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function SqlLab() {
  const dbRef = useRef<SqlDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(SQL_EXERCISES[0].id);
  const [sql, setSql] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [browse, setBrowse] = useState<{ name: string; result: Result } | null>(null);
  const [attempt, setAttempt] = useState(0);

  const exercise = SQL_EXERCISES.find((e) => e.id === activeId)!;
  const query = sql[activeId] ?? "SELECT * FROM customers;";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const initSqlJs = (await import("sql.js")).default;
        const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
        if (cancelled) return;
        const db = new SQL.Database();
        db.run(SQL_SCHEMA);
        db.run(SQL_SEED);
        dbRef.current = db;
        setReady(true);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Could not start the SQL engine");
      }
    })();
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
  }, []);

  const exec = useCallback((statement: string): Result => {
    const res = dbRef.current!.exec(statement);
    const last = res[res.length - 1];
    return last ? { columns: last.columns, rows: last.values as Row[] } : { columns: [], rows: [] };
  }, []);

  function select(id: string) {
    setActiveId(id);
    setResult(null);
    setError(null);
    setVerdict(null);
    setShowSolution(false);
  }

  function run(check: boolean) {
    setVerdict(null);
    if (!isReadOnlySql(query)) {
      setError("Only read-only SELECT (or WITH … SELECT) queries are allowed in this lab, so the sample data stays the same for every exercise.");
      setResult(null);
      return;
    }
    try {
      const got = exec(query);
      setResult(got);
      setError(null);
      if (check) {
        const ok = sameResult(got, exec(exercise.solution), exercise.ordered);
        setVerdict(ok);
        setAttempt((a) => a + 1);
        recordAttempt(ok);
        if (ok) markPracticeDone("sql", exercise.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    }
  }

  return (
    <LabShell
      lab="sql"
      title="SQL lab"
      description="Write queries against a sample e-commerce database that runs entirely in your browser. Nothing is sent to a server. The data deliberately contains quality problems for you to find."
      icon={Database}
      exercises={SQL_EXERCISES}
      activeId={activeId}
      onSelect={select}
      aside={
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">
            <Table2 className="h-3.5 w-3.5" aria-hidden /> Tables
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TABLES.map((t) => (
              <button
                key={t}
                type="button"
                disabled={!ready}
                onClick={() => setBrowse(browse?.name === t ? null : { name: t, result: exec(`SELECT * FROM ${t}`) })}
                aria-pressed={browse?.name === t}
                className={cn("rounded-md border px-2 py-1 font-mono text-[11px] disabled:opacity-50", browse?.name === t ? "border-accent text-foreground" : "border-border text-muted hover:text-foreground")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {loadError && <Alert tone="error" title="The SQL engine could not load">{loadError}</Alert>}

      <Panel>
        <ExerciseHeader title={exercise.title} level={exercise.level}>
          {exercise.prompt}
        </ExerciseHeader>
        <div className="mt-3 flex flex-wrap gap-2">
          <Hint>{exercise.hint}</Hint>
          <Button variant="ghost" size="sm" onClick={() => setShowSolution((s) => !s)} aria-expanded={showSolution}>
            <Eye className="h-3.5 w-3.5" aria-hidden /> {showSolution ? "Hide solution" : "Show a solution"}
          </Button>
        </div>
        {showSolution && <CodeBlock code={exercise.solution} language="sql" className="mt-3" />}
      </Panel>

      <Panel className="space-y-3">
        <label htmlFor="sql-editor" className="text-sm font-medium">
          Your query
        </label>
        <textarea
          id="sql-editor"
          value={query}
          spellCheck={false}
          onChange={(e) => setSql((s) => ({ ...s, [activeId]: e.target.value }))}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              if (ready) run(false);
            }
          }}
          rows={7}
          className="w-full resize-y rounded-lg border border-border bg-[#0b0b0d] p-3 font-mono text-[13px] leading-6 text-[#e4defc] focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
        <div className="flex flex-wrap items-center gap-2">
          {!ready && !loadError ? (
            <Spinner label="Starting SQLite…" />
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => run(false)} disabled={!ready}>
                <Play className="h-3.5 w-3.5" aria-hidden /> Run
              </Button>
              <Button size="sm" onClick={() => run(true)} disabled={!ready}>
                Check answer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSql((s) => ({ ...s, [activeId]: "SELECT * FROM customers;" }))}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
              </Button>
              <span className="hidden text-xs text-subtle sm:inline">
                <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> to run
              </span>
            </>
          )}
        </div>
        {verdict !== null && (
          <Verdict ok={verdict} attempt={attempt}>
            {verdict
              ? "Your result set matches the expected answer exactly. That's the kind of query testers run every day to prove data is right."
              : "Your query ran, but the result differs from what we expected. Check three things: the columns you SELECT, your WHERE filters, and which JOIN you used."}
          </Verdict>
        )}
        {verdict && <NextButton ids={SQL_EXERCISES.map((e) => e.id)} activeId={activeId} onSelect={select} />}
        {error && (
          <Alert tone="error" title="Query error">
            <span className="font-mono text-xs">{error}</span>
          </Alert>
        )}
        {result && <ResultTable result={result} />}
      </Panel>

      {browse && (
        <Panel className="animate-slide-up">
          <h3 className="mb-3 font-mono text-sm font-semibold">{browse.name}</h3>
          <ResultTable result={browse.result} />
        </Panel>
      )}
    </LabShell>
  );
}
