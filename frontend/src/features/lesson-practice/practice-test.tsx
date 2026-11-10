"use client";

import { Award, RotateCcw } from "lucide-react";
import { useState } from "react";
import { QuestionCard } from "@/components/assessments/question-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MarkedQuestion } from "@/content/schema";
import type { Responses } from "@/lib/scoring";
import { actions, useStore } from "@/lib/store";
import { band, scoreMarked, shouldSave } from "./marks";

const LEVELS = ["beginner", "intermediate", "advanced"] as const;

/** Marked practice test for one lesson: answer everything, submit, see marks per level and every explanation. */
export function PracticeTest({ slug, questions }: { slug: string; questions: MarkedQuestion[] }) {
  const key = `lesson-test:${slug}`;
  const best = useStore((d) => d.practice[key]?.score);
  const [responses, setResponses] = useState<Responses>({});
  const [submitted, setSubmitted] = useState(false);
  // Beginner questions first, so the test ramps up.
  const ordered = [...questions].sort((a, b) => LEVELS.indexOf(a.difficulty) - LEVELS.indexOf(b.difficulty));
  const total = questions.reduce((n, q) => n + q.marks, 0);
  const answered = questions.filter((q) => (responses[q.id] ?? []).length > 0).length;
  const score = scoreMarked(questions, responses);
  const verdict = band(score.percent);

  function submit() {
    setSubmitted(true);
    if (shouldSave(best, score.percent)) actions.completePractice(key, score.percent);
    document.getElementById(`${slug}-test-result`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Badge tone="accent">
          <Award className="h-3 w-3" aria-hidden /> {total} marks
        </Badge>
        <span>{questions.length} questions, beginner to advanced. Each question is all-or-nothing.</span>
        {best !== undefined && <Badge tone="success">Best so far: {best}%</Badge>}
      </div>

      {submitted && (
        <div id={`${slug}-test-result`} role="status" className="scroll-mt-24 rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-bold tracking-tight">
              {score.earned}
              <span className="text-lg text-muted"> / {score.total} marks</span>
            </p>
            <Badge tone={verdict.tone}>
              {score.percent}% · {verdict.label}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted">{verdict.advice}</p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            {LEVELS.filter((l) => score.byLevel[l].total > 0).map((l) => (
              <div key={l} className="rounded-lg border border-border bg-surface px-3 py-2">
                <dt className="text-xs capitalize text-muted">{l}</dt>
                <dd className="text-sm font-semibold">
                  {score.byLevel[l].earned} / {score.byLevel[l].total} marks
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <ol className="space-y-6">
        {ordered.map((q, i) => (
          <li key={q.id} className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-xs font-medium text-accent">
              {q.marks} mark{q.marks === 1 ? "" : "s"} · <span className="capitalize">{q.difficulty}</span>
            </p>
            <QuestionCard
              question={q}
              index={i}
              total={ordered.length}
              selected={responses[q.id] ?? []}
              onChange={(s) => setResponses((r) => ({ ...r, [q.id]: s }))}
              reveal={submitted}
            />
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        {!submitted ? (
          <>
            <Button onClick={submit} disabled={answered === 0}>
              Submit for marking
            </Button>
            <span className="text-sm text-muted">
              {answered} of {questions.length} answered
              {answered < questions.length && answered > 0 ? " (unanswered questions score 0)" : ""}
            </span>
          </>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              setResponses({});
              setSubmitted(false);
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Retake the test
          </Button>
        )}
      </div>
    </div>
  );
}
