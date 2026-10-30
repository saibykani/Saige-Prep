"use client";

import Link from "next/link";
import { useState } from "react";
import { RUBRIC_DIMENSIONS, type InterviewQuestion } from "@/content/schema";
import { actions, newId, now, useStore, type InterviewSession } from "@/lib/store";

type Answer = InterviewSession["answers"][number];

const LENGTHS = [15, 30, 60] as const;
const RUBRIC_LABELS: Record<(typeof RUBRIC_DIMENSIONS)[number], string> = {
  correctness: "Correctness",
  depth: "Depth",
  problemSolving: "Problem solving",
  communication: "Communication",
};
const btn = "inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors";
const primary = `${btn} bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-40`;
const secondary = `${btn} border border-border bg-surface-raised hover:border-accent`;

/** Shuffles, then fills the time budget; always keeps at least one question. */
function pickQuestions(all: InterviewQuestion[], minutes: number) {
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  const out: InterviewQuestion[] = [];
  let used = 0;
  for (const q of shuffled) {
    if (out.length && used + q.minutes > minutes) continue;
    out.push(q);
    used += q.minutes;
  }
  return out;
}

export function InterviewRunner({
  track,
  title,
  questions,
}: {
  track: string;
  title: string;
  questions: InterviewQuestion[];
}) {
  const interviews = useStore((d) => d.interviews);
  const past = interviews.filter((s) => s.track === track);
  const [session, setSession] = useState<{
    id: string;
    minutes: number;
    startedAt: string;
    qs: InterviewQuestion[];
  } | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [hit, setHit] = useState<number[]>([]);
  const [rubric, setRubric] = useState<Record<string, number>>({});
  const [shownAt, setShownAt] = useState(0);
  const [done, setDone] = useState(false);

  function resetQuestion() {
    setDraft("");
    setRevealed(false);
    setHit([]);
    setRubric({});
    // Only ever called from event handlers, never during render.
    // eslint-disable-next-line react-hooks/purity
    setShownAt(Date.now());
  }

  function start(minutes: number) {
    setSession({ id: newId(), minutes, startedAt: now(), qs: pickQuestions(questions, minutes) });
    setIndex(0);
    setAnswers([]);
    setDone(false);
    resetQuestion();
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="mb-4 text-sm text-muted">
            Pick a length. Answer each question in your own words, typed or out loud. Then reveal the model answer and
            score yourself honestly against its key points and the rubric. No machine grades you here.
          </p>
          <div className="flex flex-wrap gap-3">
            {LENGTHS.map((m) => (
              <button key={m} type="button" className={primary} onClick={() => start(m)}>
                {m}-minute interview
              </button>
            ))}
          </div>
        </div>
        {past.length > 0 && (
          <div>
            <h2 className="mb-2 font-semibold">Past sessions</h2>
            <ul className="space-y-1 text-sm text-muted">
              {past.slice(0, 10).map((s) => (
                <li key={s.id}>
                  {new Date(s.finishedAt).toLocaleString()} · {s.minutes} min · {s.answers.length} questions · avg{" "}
                  {average(s.answers).toFixed(1)}/4
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (done) {
    return (
      <div className="animate-slide-up space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Interview complete 🎉</h2>
        <p className="text-muted">
          {answers.length} questions · self-rated average {average(answers).toFixed(1)} / 4
        </p>
        {RUBRIC_DIMENSIONS.map((d) => (
          <div key={d} className="flex items-center gap-3 text-sm">
            <span className="w-32">{RUBRIC_LABELS[d]}</span>
            <div className="h-2 flex-1 rounded-full bg-surface-raised">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${(avgDim(answers, d) / 4) * 100}%` }} />
            </div>
            <span className="w-10 text-right">{avgDim(answers, d).toFixed(1)}</span>
          </div>
        ))}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" className={primary} onClick={() => setSession(null)}>
            Back to {title}
          </button>
          <Link href="/interviews" className={secondary}>
            All tracks
          </Link>
        </div>
      </div>
    );
  }

  const q = session.qs[index];
  const last = index === session.qs.length - 1;
  const rubricDone = RUBRIC_DIMENSIONS.every((d) => rubric[d]);

  function next(current: NonNullable<typeof session>) {
    const all = [
      ...answers,
      {
        questionId: q.id,
        answer: draft,
        keyPointsHit: hit,
        rubric,
        seconds: Math.round((Date.now() - shownAt) / 1000),
      },
    ];
    setAnswers(all);
    if (last) {
      actions.saveInterview({
        id: current.id,
        track,
        minutes: current.minutes,
        startedAt: current.startedAt,
        finishedAt: now(),
        answers: all,
      });
      setDone(true);
    } else {
      setIndex(index + 1);
      resetQuestion();
    }
  }

  return (
    <div key={q.id} className="animate-slide-up space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <span>
          Question {index + 1} of {session.qs.length}
        </span>
        <span>· {q.kind}</span>
        <span>· {q.difficulty}</span>
        <span>· ~{q.minutes} min</span>
      </div>
      <h2 className="text-lg font-semibold">{q.question}</h2>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        aria-label="Your answer"
        placeholder="Your answer (optional: you can answer out loud instead)"
        className="w-full rounded-lg border border-border bg-surface p-3 text-sm"
        disabled={revealed}
      />
      {!revealed ? (
        <button type="button" className={primary} onClick={() => setRevealed(true)}>
          Reveal model answer
        </button>
      ) : (
        <div className="space-y-4">
          <Section title="Model answer">
            <p className="text-sm whitespace-pre-line">{q.modelAnswer}</p>
          </Section>
          <Section title="Did you cover these key points?">
            {q.keyPoints.map((k, i) => (
              <label key={k} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={hit.includes(i)}
                  onChange={(e) => setHit(e.target.checked ? [...hit, i] : hit.filter((x) => x !== i))}
                />
                {k}
              </label>
            ))}
          </Section>
          <Section title="Likely follow-ups">
            <ul className="list-disc pl-5 text-sm">
              {q.followUps.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Section>
          <Section title="Red flags interviewers notice">
            <ul className="list-disc pl-5 text-sm">
              {q.redFlags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Section>
          <Section title="Rate yourself (1 = weak, 4 = strong)">
            {RUBRIC_DIMENSIONS.map((d) => (
              <div key={d} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="w-32">{RUBRIC_LABELS[d]}</span>
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={rubric[d] === n}
                    aria-label={`${RUBRIC_LABELS[d]} ${n}`}
                    onClick={() => setRubric({ ...rubric, [d]: n })}
                    className={`h-8 w-8 rounded-md border transition-colors ${
                      rubric[d] === n ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            ))}
          </Section>
          <button type="button" className={primary} disabled={!rubricDone} onClick={() => next(session)}>
            {last ? "Finish interview" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-accent">{title}</h3>
      {children}
    </div>
  );
}

function avgDim(answers: Answer[], d: string) {
  return answers.length ? answers.reduce((s, a) => s + (a.rubric[d] ?? 0), 0) / answers.length : 0;
}

function average(answers: Answer[]) {
  return RUBRIC_DIMENSIONS.reduce((s, d) => s + avgDim(answers, d), 0) / RUBRIC_DIMENSIONS.length;
}
