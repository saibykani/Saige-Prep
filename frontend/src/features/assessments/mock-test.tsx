"use client";

import { ArrowLeft, ArrowRight, Clock, Flag, RotateCcw, Timer, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QuestionCard } from "@/components/assessments/question-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Confetti } from "@/features/practice/practice-ui";
import type { ChoiceQuestion } from "@/content/schema";
import { scoreAttempt, shuffle, type Responses, type ScoreResult } from "@/lib/scoring";
import { actions, newId, now, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Config {
  count: number;
  minutes: number;
  negative: number;
}

interface Session {
  id: string;
  questions: ChoiceQuestion[];
  responses: Responses;
  flagged: string[];
  index: number;
  startedAt: string;
  endsAt: number | null;
  config: Config;
}

const draftKey = (bank: string) => `saige-prep:mock-draft:${bank}`;

function loadDraft(bank: string): Session | null {
  try {
    const raw = window.localStorage.getItem(draftKey(bank));
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
function saveDraft(bank: string, s: Session | null) {
  try {
    if (s) window.localStorage.setItem(draftKey(bank), JSON.stringify(s));
    else window.localStorage.removeItem(draftKey(bank));
  } catch {
    /* storage blocked: the test still works in memory */
  }
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function MockTest({ bank, title, questions, topicTitles, backHref }: { bank: string; title: string; questions: ChoiceQuestion[]; topicTitles: Record<string, string>; backHref: string }) {
  const [config, setConfig] = useState<Config>({ count: Math.min(20, questions.length), minutes: 25, negative: 0 });
  const [session, setSession] = useState<Session | null>(() => (typeof window === "undefined" ? null : loadDraft(bank)));
  const [result, setResult] = useState<{ score: ScoreResult; session: Session } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [tick, setTick] = useState(() => Date.now());
  const history = useStore((d) => d.assessments);
  const attempts = history.filter((a) => a.banks.includes(bank));

  useEffect(() => {
    if (!session) return;
    saveDraft(bank, session);
  }, [bank, session]);

  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!session?.endsAt) return;
    const endsAt = session.endsAt;
    const t = setInterval(() => {
      const nowMs = Date.now();
      setTick(nowMs);
      // Auto-submit when time runs out.
      if (nowMs >= endsAt && sessionRef.current) submit(sessionRef.current);
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.endsAt]);

  const remaining = session?.endsAt ? Math.max(0, Math.round((session.endsAt - tick) / 1000)) : null;

  function start() {
    const picked = shuffle(questions).slice(0, config.count).map((q) => q);
    setSession({
      id: newId(),
      questions: picked,
      responses: {},
      flagged: [],
      index: 0,
      startedAt: now(),
      endsAt: config.minutes ? Date.now() + config.minutes * 60_000 : null,
      config,
    });
    setResult(null);
  }

  function submit(current: Session) {
    const score = scoreAttempt(current.questions, current.responses, { negativeMarking: current.config.negative });
    actions.saveAssessment({
      id: current.id,
      title,
      banks: [bank],
      startedAt: current.startedAt,
      submittedAt: now(),
      durationSeconds: Math.round((Date.now() - new Date(current.startedAt).getTime()) / 1000),
      timeLimitSeconds: current.config.minutes ? current.config.minutes * 60 : null,
      negativeMarking: current.config.negative,
      score: score.score,
      maxScore: score.maxScore,
      results: score.results.map((r) => ({ ...r, flagged: current.flagged.includes(r.questionId) })),
    });
    saveDraft(bank, null);
    setSession(null);
    setConfirm(false);
    setResult({ score, session: current });
  }


  /* ---------------------------------- results ---------------------------------- */
  if (result) {
    const { score, session: s } = result;
    const pct = Math.round((score.score / score.maxScore) * 100);
    return (
      <div className="animate-fade-in space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 text-center">
          {pct >= 70 && <Confetti pieces={24} />}
          <Trophy className={cn("animate-pop mx-auto h-10 w-10", pct >= 70 ? "text-warning" : "text-subtle")} aria-hidden />
          <p className="mt-3 text-4xl font-semibold tracking-tight">{pct}%</p>
          <p className="mt-1 text-sm text-muted">
            {score.score} / {score.maxScore} points · {score.correct} correct · {score.wrong} wrong · {score.unanswered} unanswered
            {s.config.negative ? ` · −${s.config.negative} per wrong answer` : ""}
          </p>
          <p className="mt-3 text-sm">{pct >= 80 ? "Excellent — you're interview-ready on these topics." : pct >= 60 ? "Solid. Revise your weakest topics below and try again." : "Good start. Work through the lessons for the weak topics, then retake."}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={start}>
              <RotateCcw className="h-4 w-4" aria-hidden /> New attempt
            </Button>
            <Button variant="secondary" onClick={() => setResult(null)}>
              Back to setup
            </Button>
          </div>
        </div>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 font-semibold">Score by topic (weakest first)</h2>
          <ul className="space-y-2.5">
            {score.byTopic.map((t) => {
              const p = Math.round((t.correct / t.total) * 100);
              return (
                <li key={t.topic}>
                  <div className="mb-1 flex justify-between text-sm">
                    <Link href={`/learn/${bank}/${t.topic}`} className="hover:text-accent">
                      {topicTitles[t.topic] ?? t.topic}
                    </Link>
                    <span className="text-muted">
                      {t.correct}/{t.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                    <div className={cn("h-full rounded-full transition-[width] duration-700", p >= 70 ? "bg-success" : p >= 40 ? "bg-warning" : "bg-danger")} style={{ width: `${p}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold">Review every question</h2>
          {s.questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-border bg-surface p-5">
              <QuestionCard question={q} index={i} total={s.questions.length} selected={s.responses[q.id] ?? []} reveal />
            </div>
          ))}
        </section>
      </div>
    );
  }

  /* ----------------------------------- runner ---------------------------------- */
  if (session) {
    const q = session.questions[session.index];
    const answered = session.questions.filter((x) => (session.responses[x.id] ?? []).length > 0).length;
    const update = (patch: Partial<Session>) => setSession({ ...session, ...patch });
    return (
      <div className="animate-fade-in space-y-5">
        <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <span className="text-sm font-medium">{title}</span>
          <Badge>
            {answered}/{session.questions.length} answered
          </Badge>
          {remaining !== null && (
            <span className={cn("ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm", remaining < 60 ? "animate-pulse bg-danger-soft text-danger" : "bg-surface-raised")} role="timer" aria-live="off">
              <Clock className="h-4 w-4" aria-hidden /> {fmt(remaining)}
            </span>
          )}
          <Button size="sm" onClick={() => setConfirm(true)} className={remaining === null ? "ml-auto" : ""}>
            Submit
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div key={q.id} className="animate-slide-up space-y-4 rounded-xl border border-border bg-surface p-5">
            <QuestionCard
              question={q}
              index={session.index}
              total={session.questions.length}
              selected={session.responses[q.id] ?? []}
              onChange={(sel) => update({ responses: { ...session.responses, [q.id]: sel } })}
              flagged={session.flagged.includes(q.id)}
              onToggleFlag={() => update({ flagged: session.flagged.includes(q.id) ? session.flagged.filter((f) => f !== q.id) : [...session.flagged, q.id] })}
            />
            <div className="flex justify-between border-t border-border pt-4">
              <Button variant="secondary" size="sm" disabled={session.index === 0} onClick={() => update({ index: session.index - 1 })}>
                <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
              </Button>
              {session.index < session.questions.length - 1 ? (
                <Button size="sm" onClick={() => update({ index: session.index + 1 })}>
                  Next <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              ) : (
                <Button size="sm" onClick={() => setConfirm(true)}>
                  Finish
                </Button>
              )}
            </div>
          </div>
          <nav aria-label="Questions" className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">Questions</p>
            <ol className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
              {session.questions.map((x, i) => {
                const done = (session.responses[x.id] ?? []).length > 0;
                const flagged = session.flagged.includes(x.id);
                return (
                  <li key={x.id}>
                    <button
                      type="button"
                      onClick={() => update({ index: i })}
                      aria-label={`Question ${i + 1}${done ? ", answered" : ""}${flagged ? ", flagged" : ""}`}
                      aria-current={i === session.index ? "step" : undefined}
                      className={cn(
                        "relative flex h-9 w-full items-center justify-center rounded-md border font-mono text-xs transition-all",
                        i === session.index && "ring-2 ring-accent",
                        done ? "border-accent/40 bg-accent-soft" : "border-border text-muted",
                      )}
                    >
                      {i + 1}
                      {flagged && <Flag className="absolute -right-1 -top-1 h-3 w-3 text-warning" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-xs text-muted">Answers are autosaved — you can refresh or come back later.</p>
          </nav>
        </div>

        <ConfirmDialog
          open={confirm}
          title="Submit your test?"
          description={`${answered} of ${session.questions.length} answered${session.flagged.length ? `, ${session.flagged.length} flagged for review` : ""}. You can't change answers after submitting.`}
          confirmLabel="Submit"
          onConfirm={() => submit(session)}
          onCancel={() => setConfirm(false)}
        />
      </div>
    );
  }

  /* ----------------------------------- setup ----------------------------------- */
  const counts = [10, 20, 30, questions.length].filter((n, i, a) => n <= questions.length && a.indexOf(n) === i);
  return (
    <div className="animate-fade-in space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </Link>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{title} mock test</h1>
        <p className="mt-1 text-sm text-muted">
          {questions.length} questions in the bank, beginner to advanced, each with an explanation and a pointer to the lesson that covers it. Scored in your browser — practice, not an official exam.
        </p>
      </header>
      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5">
        {(
          [
            ["Questions", counts.map((n) => ({ v: n, l: n === questions.length ? `All ${n}` : String(n) })), "count"],
            ["Time limit", [{ v: 0, l: "No timer" }, { v: 15, l: "15 min" }, { v: 25, l: "25 min" }, { v: 45, l: "45 min" }, { v: 60, l: "60 min" }], "minutes"],
            ["Negative marking", [{ v: 0, l: "Off" }, { v: 0.25, l: "−0.25" }, { v: 0.5, l: "−0.5" }], "negative"],
          ] as const
        ).map(([label, opts, key]) => (
          <div key={key} role="radiogroup" aria-label={label} className="space-y-2">
            <p className="text-sm font-medium">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {opts.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  role="radio"
                  aria-checked={config[key] === o.v}
                  onClick={() => setConfig({ ...config, [key]: o.v })}
                  className={cn("rounded-lg border px-3 py-1.5 text-sm transition-all active:scale-95", config[key] === o.v ? "border-accent bg-accent-soft" : "border-border text-muted hover:text-foreground")}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={start} className="w-full justify-center sm:w-auto" disabled={questions.length === 0}>
          <Timer className="h-4 w-4" aria-hidden /> Start test
        </Button>
      </section>

      {attempts.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 font-semibold">Your attempts</h2>
          <ul className="divide-y divide-border">
            {attempts.slice(0, 10).map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-muted">{new Date(a.submittedAt).toLocaleString()}</span>
                <span className="font-medium">
                  {Math.round((a.score / a.maxScore) * 100)}% <span className="text-muted">({a.results.length} q)</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
