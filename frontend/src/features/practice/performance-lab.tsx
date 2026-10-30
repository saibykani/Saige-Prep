"use client";

import { Gauge } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PERF_EXERCISES, SAMPLE_MS } from "./performance-data";
import { ExerciseHeader, Hint, LabShell, markPracticeDone, NextButton, Panel, recordAttempt, Verdict } from "./practice-ui";

/** Tiny bar chart of the sample so learners *see* the long tail. */
function SampleChart({ sorted }: { sorted: boolean }) {
  const data = useMemo(() => (sorted ? [...SAMPLE_MS].sort((a, b) => a - b) : SAMPLE_MS), [sorted]);
  const max = Math.max(...SAMPLE_MS);
  return (
    <div>
      <div className="flex h-32 items-end gap-1" role="img" aria-label="Bar chart of 20 response times">
        {data.map((v, i) => (
          <div key={`${sorted}-${i}`} className="group relative flex flex-1 flex-col items-center justify-end">
            <span className="pointer-events-none absolute -top-6 hidden rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] group-hover:block">{v}</span>
            <div
              className={cn("w-full rounded-t-sm transition-[height] duration-500", v > 500 ? "bg-danger/80" : "bg-accent/70")}
              style={{ height: `${Math.max(4, (v / max) * 100)}%`, transitionDelay: `${i * 15}ms` }}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-xs leading-6 text-muted">{data.join(", ")} ms</p>
    </div>
  );
}

export function PerformanceLab() {
  const [activeId, setActiveId] = useState(PERF_EXERCISES[0].id);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [result, setResult] = useState<boolean | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [sorted, setSorted] = useState(false);
  const ex = PERF_EXERCISES.find((e) => e.id === activeId)!;

  function select(id: string) {
    setActiveId(id);
    setResult(null);
  }

  function check() {
    const ok =
      ex.kind === "number"
        ? Math.abs(Number((inputs[ex.id] ?? "").replace(/,/g, "")) - ex.answer) <= ex.tolerance + 1e-9 && (inputs[ex.id] ?? "").trim() !== ""
        : choices[ex.id] === ex.answer;
    setResult(ok);
    setAttempt((a) => a + 1);
    recordAttempt(ok);
    if (ok) markPracticeDone("performance", ex.id);
  }

  return (
    <LabShell
      lab="performance"
      title="Performance analysis lab"
      description="Read results like a performance engineer: percentiles, error rates, Little's Law and bottleneck diagnosis. Sample data is synthetic and illustrative — never load-test systems you're not authorised to test."
      icon={Gauge}
      exercises={PERF_EXERCISES}
      activeId={activeId}
      onSelect={select}
    >
      {ex.usesSample && (
        <Panel className="animate-slide-up">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Sample run · 20 checkout requests</h3>
            <Button variant="ghost" size="sm" onClick={() => setSorted((s) => !s)} aria-pressed={sorted}>
              {sorted ? "Show arrival order" : "Sort ascending"}
            </Button>
          </div>
          <SampleChart sorted={sorted} />
          <p className="mt-2 text-xs text-muted">Red bars are slower than 500 ms. Percentiles here use the nearest-rank method.</p>
        </Panel>
      )}

      <Panel className="space-y-4">
        <ExerciseHeader title={ex.title} level={ex.level}>
          {ex.prompt}
        </ExerciseHeader>

        {ex.kind === "number" ? (
          <div className="flex items-center gap-2">
            <Input
              value={inputs[ex.id] ?? ""}
              onChange={(e) => {
                setInputs((s) => ({ ...s, [ex.id]: e.target.value }));
                setResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && check()}
              inputMode="decimal"
              aria-label="Your answer"
              className="h-11 w-44 font-mono"
            />
            <span className="text-sm text-muted">{ex.unit}</span>
          </div>
        ) : (
          <div className="grid gap-2">
            {ex.options.map((o, i) => (
              <button
                key={o}
                type="button"
                aria-pressed={choices[ex.id] === i}
                onClick={() => {
                  setChoices((c) => ({ ...c, [ex.id]: i }));
                  setResult(null);
                }}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm leading-6 transition-all duration-150 active:scale-[0.99]",
                  choices[ex.id] === i ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong hover:bg-surface-raised",
                )}
              >
                {o}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={check}>Check my answer</Button>
          <Hint>{ex.hint}</Hint>
        </div>
        {result !== null && (
          <Verdict ok={result} attempt={attempt}>
            {result ? ex.explanation : "Not quite. Re-read the question carefully, or open the hint and try once more."}
          </Verdict>
        )}
        {result && <NextButton ids={PERF_EXERCISES.map((e) => e.id)} activeId={activeId} onSelect={select} />}
      </Panel>
    </LabShell>
  );
}
