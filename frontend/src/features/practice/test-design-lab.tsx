"use client";

import { ClipboardCheck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExerciseHeader, Hint, LabShell, markPracticeDone, NextButton, Panel, recordAttempt, Verdict } from "./practice-ui";
import { DESIGN_EXERCISES, parseValues, sameValues, type DesignExercise } from "./test-design-data";

type Answer = { text?: string; picks?: Record<number, string>; multi?: number[] };

function check(ex: DesignExercise, a: Answer): { ok: boolean; message?: string } {
  switch (ex.kind) {
    case "values": {
      const values = parseValues(a.text ?? "");
      if (!values) return { ok: false, message: "Enter numbers separated by commas, e.g. 17, 18, 65, 66." };
      const missing = ex.expected.filter((e) => !values.some((v) => Math.round(v * 100) === Math.round(e * 100)));
      const extra = values.filter((v) => !ex.expected.some((e) => Math.round(v * 100) === Math.round(e * 100)));
      if (sameValues(ex.expected, values)) return { ok: true };
      return {
        ok: false,
        message: `${missing.length ? `You're missing ${missing.length} value${missing.length > 1 ? "s" : ""}. ` : ""}${extra.length ? `${extra.join(", ")} ${extra.length > 1 ? "aren't boundary values" : "isn't a boundary value"} here.` : ""}`,
      };
    }
    case "classify": {
      const wrong = ex.items.filter((item, i) => a.picks?.[i] !== item.answer).length;
      return wrong === 0 ? { ok: true } : { ok: false, message: `${wrong} of ${ex.items.length} ${wrong === 1 ? "is" : "are"} not right yet.` };
    }
    case "decision-table": {
      const wrong = ex.rules.filter((r, i) => a.picks?.[i] !== r.answer).length;
      return wrong === 0 ? { ok: true } : { ok: false, message: `${wrong} rule${wrong > 1 ? "s have" : " has"} the wrong action.` };
    }
    case "multi": {
      const picks = [...(a.multi ?? [])].sort();
      const ok = picks.length === ex.answer.length && [...ex.answer].sort().every((v, i) => v === picks[i]);
      return ok ? { ok } : { ok, message: "Your selection doesn't match yet — check each option against the requirement." };
    }
    case "number":
      return Number(a.text) === ex.answer ? { ok: true } : { ok: false, message: "Not the minimum. Think about which pair of parameters creates the most combinations." };
  }
}

export function TestDesignLab() {
  const [activeId, setActiveId] = useState(DESIGN_EXERCISES[0].id);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const ex = DESIGN_EXERCISES.find((e) => e.id === activeId)!;
  const answer = answers[activeId] ?? {};
  const setAnswer = (a: Answer) => {
    setAnswers((all) => ({ ...all, [activeId]: { ...answer, ...a } }));
    setResult(null);
  };

  function select(id: string) {
    setActiveId(id);
    setResult(null);
  }

  function submit() {
    const r = check(ex, answer);
    setResult(r);
    setAttempt((n) => n + 1);
    recordAttempt(r.ok);
    if (r.ok) markPracticeDone("test-design", ex.id);
  }

  const pickClass = (selected: boolean) =>
    cn(
      "rounded-lg border px-3 py-1.5 text-xs transition-all duration-150 active:scale-95",
      selected ? "border-accent bg-accent-soft text-foreground" : "border-border text-muted hover:border-border-strong hover:text-foreground",
    );

  return (
    <LabShell
      lab="test-design"
      title="Test design lab"
      description="Turn requirements into the smallest set of tests that finds the most bugs. Every answer is checked instantly — and every check explains why."
      icon={ClipboardCheck}
      exercises={DESIGN_EXERCISES}
      activeId={activeId}
      onSelect={select}
    >
      <Panel className="space-y-4">
        <ExerciseHeader title={ex.title} level={ex.level} />
        <blockquote className="rounded-lg border-l-2 border-accent bg-accent-soft/40 px-4 py-3 text-[15px] leading-7">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-accent">Requirement</span>
          {ex.requirement}
        </blockquote>
        <p className="text-sm font-medium">{ex.task}</p>

        {ex.kind === "values" && (
          <Input
            value={answer.text ?? ""}
            onChange={(e) => setAnswer({ text: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. 17, 18, 65, 66"
            aria-label="Boundary values"
            inputMode="decimal"
            className="h-11 font-mono"
          />
        )}

        {ex.kind === "number" && (
          <Input
            type="number"
            value={answer.text ?? ""}
            onChange={(e) => setAnswer({ text: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-label="Your answer"
            className="h-11 w-40 font-mono"
          />
        )}

        {ex.kind === "classify" && (
          <ul className="space-y-2">
            {ex.items.map((item, i) => (
              <li key={item.label} className="flex flex-col gap-2 rounded-lg border border-border bg-background/50 p-3 sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1 font-mono text-sm">{item.label}</span>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Category for ${item.label}`}>
                  {ex.categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={answer.picks?.[i] === c}
                      onClick={() => setAnswer({ picks: { ...answer.picks, [i]: c } })}
                      className={pickClass(answer.picks?.[i] === c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        {ex.kind === "decision-table" && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-surface-raised">
                <tr>
                  <th className="border-b border-border px-3 py-2 text-left font-semibold">Rule</th>
                  {ex.conditions.map((c) => (
                    <th key={c} className="border-b border-border px-3 py-2 text-left font-semibold">
                      {c}
                    </th>
                  ))}
                  <th className="border-b border-border px-3 py-2 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {ex.rules.map((rule, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-subtle">R{i + 1}</td>
                    {rule.values.map((v, j) => (
                      <td key={j} className="px-3 py-2">
                        <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", v ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>{v ? "Yes" : "No"}</span>
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <label className="sr-only" htmlFor={`rule-${i}`}>
                        Action for rule {i + 1}
                      </label>
                      <select
                        id={`rule-${i}`}
                        value={answer.picks?.[i] ?? ""}
                        onChange={(e) => setAnswer({ picks: { ...answer.picks, [i]: e.target.value } })}
                        className="h-8 rounded-md border border-border bg-background px-2 text-xs focus-visible:border-accent focus-visible:outline-none"
                      >
                        <option value="">Choose…</option>
                        {ex.actions.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {ex.kind === "multi" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {ex.options.map((o, i) => {
              const on = answer.multi?.includes(i) ?? false;
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAnswer({ multi: on ? (answer.multi ?? []).filter((x) => x !== i) : [...(answer.multi ?? []), i] })}
                  className={cn("rounded-lg border px-3 py-2.5 text-left font-mono text-sm transition-all duration-150 active:scale-[0.98]", on ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong")}
                >
                  <span className={cn("mr-2 inline-block h-3.5 w-3.5 rounded border align-[-2px]", on ? "border-accent bg-accent" : "border-border-strong")} aria-hidden />
                  {o}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={submit}>Check my answer</Button>
          <Hint>{ex.hint}</Hint>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAnswers((all) => ({ ...all, [activeId]: {} }));
              setResult(null);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Clear
          </Button>
        </div>

        {result && (
          <Verdict ok={result.ok} attempt={attempt}>
            {result.ok ? ex.explanation : result.message}
          </Verdict>
        )}
        {result?.ok && <NextButton ids={DESIGN_EXERCISES.map((e) => e.id)} activeId={activeId} onSelect={select} />}
      </Panel>
    </LabShell>
  );
}
