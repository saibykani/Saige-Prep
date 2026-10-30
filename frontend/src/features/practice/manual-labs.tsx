"use client";

import { Bug, FileSearch } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DEFECT_EXERCISES, DEFECT_QUALITY_CHECKLIST, lintDefectReport, REQUIREMENTS_EXERCISES } from "./manual-labs-data";
import { ExerciseHeader, LabShell, markPracticeDone, NextButton, Panel, recordAttempt, Verdict } from "./practice-ui";

const textareaClass =
  "w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-6 placeholder:text-subtle focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

function Checklist({ items, checked, onToggle }: { items: string[]; checked: number[]; onToggle: (i: number) => void }) {
  return (
    <ul className="space-y-1.5">
      {items.map((text, i) => {
        const on = checked.includes(i);
        return (
          <li key={i}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(i)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm leading-6 transition-all duration-150 active:scale-[0.99]",
                on ? "border-success/40 bg-success-soft" : "border-border hover:border-border-strong",
              )}
            >
              <span className={cn("mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]", on ? "border-success bg-success text-success-foreground" : "border-border-strong")} aria-hidden>
                {on ? "✓" : ""}
              </span>
              {text}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------ Requirements review ------------------------------ */

export function RequirementsLab() {
  const [activeId, setActiveId] = useState(REQUIREMENTS_EXERCISES[0].id);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [found, setFound] = useState<Record<string, number[]>>({});
  const [scored, setScored] = useState<string | null>(null);
  const ex = REQUIREMENTS_EXERCISES.find((e) => e.id === activeId)!;
  const hits = found[ex.id] ?? [];

  function select(id: string) {
    setActiveId(id);
    setScored(null);
  }

  function finish() {
    const ratio = hits.length / ex.findings.length;
    markPracticeDone("requirements", ex.id, ratio);
    recordAttempt(ratio >= 0.5);
    setScored(ex.id);
  }

  return (
    <LabShell
      lab="requirements"
      title="Requirements review lab"
      description="Testers save the most time before any code exists. Read each user story like you're in a refinement meeting: what's ambiguous, missing, untestable or risky?"
      icon={FileSearch}
      exercises={REQUIREMENTS_EXERCISES}
      activeId={activeId}
      onSelect={select}
    >
      <Panel className="space-y-4">
        <ExerciseHeader title={ex.title} level={ex.level} />
        <div className="rounded-lg border-l-2 border-accent bg-accent-soft/40 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">User story</p>
          <p className="mt-1 text-[15px] leading-7">{ex.story}</p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-accent">Acceptance criteria</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6">
            {ex.acceptance.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`rq-notes-${ex.id}`}>Your questions and concerns</Label>
          <textarea
            id={`rq-notes-${ex.id}`}
            rows={6}
            value={notes[ex.id] ?? ""}
            onChange={(e) => setNotes((n) => ({ ...n, [ex.id]: e.target.value }))}
            placeholder={"One per line, e.g.\n- How long is the link valid?\n- What if the email isn't registered?"}
            className={textareaClass}
          />
        </div>
        {!revealed[ex.id] ? (
          <Button onClick={() => setRevealed((r) => ({ ...r, [ex.id]: true }))} disabled={!(notes[ex.id] ?? "").trim()}>
            Compare with an expert review
          </Button>
        ) : (
          <div className="animate-slide-up space-y-3">
            <p className="text-sm text-muted">Tick every point you raised (in your own words). Be honest — this is self-assessed, not auto-graded.</p>
            <ul className="space-y-1.5">
              {ex.findings.map((f, i) => {
                const on = hits.includes(i);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFound((all) => ({ ...all, [ex.id]: on ? hits.filter((x) => x !== i) : [...hits, i] }))}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm leading-6 transition-all duration-150 active:scale-[0.99]",
                        on ? "border-success/40 bg-success-soft" : "border-border hover:border-border-strong",
                      )}
                    >
                      <Badge tone={f.kind === "Security" ? "danger" : f.kind === "Testability" ? "warning" : "accent"} className="mt-0.5 shrink-0">
                        {f.kind}
                      </Badge>
                      <span className="flex-1">{f.text}</span>
                      <span className={cn("mt-1 text-xs", on ? "text-success" : "text-subtle")}>{on ? "✓ I raised this" : "Missed"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Button onClick={finish}>Save my review</Button>
            {scored === ex.id && (
              <Verdict ok={hits.length / ex.findings.length >= 0.5} xp={hits.length * 5} attempt={hits.length}>
                You spotted {hits.length} of {ex.findings.length}. {hits.length / ex.findings.length >= 0.5 ? "That's a strong review — these questions prevent real defects." : "Every point you missed is a pattern to reuse next time: expiry, enumeration, limits, failure modes and accessibility."}
              </Verdict>
            )}
            {scored === ex.id && <NextButton ids={REQUIREMENTS_EXERCISES.map((e) => e.id)} activeId={activeId} onSelect={select} />}
          </div>
        )}
      </Panel>
    </LabShell>
  );
}

/* --------------------------------- Defect reports -------------------------------- */

const EMPTY = { title: "", environment: "", steps: "", expected: "", actual: "", severity: "", priority: "" };

export function DefectReportLab() {
  const [activeId, setActiveId] = useState(DEFECT_EXERCISES[0].id);
  const [forms, setForms] = useState<Record<string, typeof EMPTY>>({});
  const [issues, setIssues] = useState<string[] | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [quality, setQuality] = useState<Record<string, number[]>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const ex = DEFECT_EXERCISES.find((e) => e.id === activeId)!;
  const form = forms[ex.id] ?? EMPTY;
  const set = (patch: Partial<typeof EMPTY>) => setForms((f) => ({ ...f, [ex.id]: { ...form, ...patch } }));

  function select(id: string) {
    setActiveId(id);
    setIssues(null);
    setSaved(null);
  }

  function submit() {
    const found = lintDefectReport(form);
    setIssues(found);
    if (found.length === 0) setSubmitted((s) => ({ ...s, [ex.id]: true }));
  }

  const checked = quality[ex.id] ?? [];

  return (
    <LabShell
      lab="defect-report"
      title="Defect report lab"
      description="A great defect report gets fixed fast. Write one for each scenario, then compare it with a model report and grade yourself against a quality checklist."
      icon={Bug}
      exercises={DEFECT_EXERCISES}
      activeId={activeId}
      onSelect={select}
    >
      <Panel className="space-y-3">
        <ExerciseHeader title={ex.title} level={ex.level}>
          {ex.scenario}
        </ExerciseHeader>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">What you observed</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6">
            {ex.observed.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ol>
        </div>
      </Panel>

      <Panel className="space-y-4">
        <h3 className="text-sm font-semibold">Your defect report</h3>
        <div className="space-y-2">
          <Label htmlFor="df-title">Title</Label>
          <Input id="df-title" value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Where — what happens — impact" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="df-env">Environment &amp; build</Label>
          <Input id="df-env" value={form.environment} onChange={(e) => set({ environment: e.target.value })} placeholder="e.g. Staging, build 4.12.0, Chrome 130, Windows 11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="df-steps">Steps to reproduce (one per line)</Label>
          <textarea id="df-steps" rows={5} value={form.steps} onChange={(e) => set({ steps: e.target.value })} className={textareaClass} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="df-expected">Expected result</Label>
            <textarea id="df-expected" rows={3} value={form.expected} onChange={(e) => set({ expected: e.target.value })} className={textareaClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="df-actual">Actual result</Label>
            <textarea id="df-actual" rows={3} value={form.actual} onChange={(e) => set({ actual: e.target.value })} className={textareaClass} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="df-sev">Severity</Label>
            <select id="df-sev" value={form.severity} onChange={(e) => set({ severity: e.target.value })} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-accent focus-visible:outline-none">
              <option value="">Choose…</option>
              {["Critical", "Major", "Minor", "Trivial"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="df-pri">Priority</Label>
            <select id="df-pri" value={form.priority} onChange={(e) => set({ priority: e.target.value })} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-accent focus-visible:outline-none">
              <option value="">Choose…</option>
              {["P1", "P2", "P3", "P4"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={submit}>Review my report</Button>
        {issues && issues.length > 0 && (
          <Alert tone="error" title="A few things to tighten first">
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Panel>

      {submitted[ex.id] && (
        <Panel className="animate-slide-up space-y-4">
          <h3 className="text-sm font-semibold">Model report</h3>
          <dl className="grid gap-3 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="text-muted">Title</dt>
            <dd className="font-medium">{ex.model.title}</dd>
            <dt className="text-muted">Environment</dt>
            <dd>{ex.model.environment}</dd>
            <dt className="text-muted">Steps</dt>
            <dd>
              <ol className="list-decimal space-y-0.5 pl-5">
                {ex.model.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </dd>
            <dt className="text-muted">Expected</dt>
            <dd>{ex.model.expected}</dd>
            <dt className="text-muted">Actual</dt>
            <dd>{ex.model.actual}</dd>
            <dt className="text-muted">Severity / priority</dt>
            <dd>
              <Badge tone="danger">{ex.model.severity}</Badge> <Badge tone="warning">{ex.model.priority}</Badge>
              <p className="mt-1.5 text-muted">{ex.model.rationale}</p>
            </dd>
          </dl>
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium">Grade your report honestly</p>
            <Checklist
              items={DEFECT_QUALITY_CHECKLIST}
              checked={checked}
              onToggle={(i) => setQuality((q) => ({ ...q, [ex.id]: checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i] }))}
            />
            <Button
              onClick={() => {
                const ratio = checked.length / DEFECT_QUALITY_CHECKLIST.length;
                markPracticeDone("defect-report", ex.id, ratio);
                recordAttempt(ratio >= 0.67);
                setSaved(ex.id);
              }}
            >
              Save my self-review
            </Button>
            {saved === ex.id && (
              <Verdict ok={checked.length >= 4} xp={checked.length * 5} attempt={checked.length}>
                {checked.length} of {DEFECT_QUALITY_CHECKLIST.length} quality checks met.{" "}
                {checked.length >= 4 ? "Developers will love working with your reports." : "Pick the unticked checks and rewrite those parts — it's the fastest way to improve."}
              </Verdict>
            )}
            {saved === ex.id && <NextButton ids={DEFECT_EXERCISES.map((e) => e.id)} activeId={activeId} onSelect={select} />}
          </div>
        </Panel>
      )}
    </LabShell>
  );
}
