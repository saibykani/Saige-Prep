"use client";

import { Bookmark, BookmarkCheck, CircleCheck, CircleDashed, NotebookPen, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QuestionCard } from "@/components/assessments/question-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import type { ChoiceQuestion } from "@/content/schema";
import { scoreAttempt, type Responses } from "@/lib/scoring";
import { actions, useStore } from "@/lib/store";

/** Records that the lesson was opened (drives "recently viewed" and streaks). */
export function LessonTracker({ slug }: { slug: string }) {
  useEffect(() => {
    actions.viewLesson(slug);
  }, [slug]);
  return null;
}

export function BookmarkButton({
  id,
  kind,
  title,
  href,
}: {
  id: string;
  kind: "lesson" | "role" | "question" | "project" | "tool" | "interview";
  title: string;
  href: string;
}) {
  const bookmarked = useStore((d) => d.bookmarks.some((b) => b.id === id));
  const { notify } = useToast();
  return (
    <Button
      variant="secondary"
      size="sm"
      aria-pressed={bookmarked}
      onClick={() => {
        actions.toggleBookmark({ id, kind, title, href });
        notify(bookmarked ? "Bookmark removed" : "Bookmarked", "success");
      }}
    >
      {bookmarked ? <BookmarkCheck className="h-4 w-4 text-accent" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}

export function CompleteButton({ slug }: { slug: string }) {
  const status = useStore((d) => d.lessons[slug]?.status);
  const done = status === "completed";
  const { notify } = useToast();
  return (
    <Button
      variant={done ? "secondary" : "primary"}
      size="sm"
      aria-pressed={done}
      onClick={() => {
        actions.setLessonCompleted(slug, !done);
        notify(done ? "Marked as not completed" : "Lesson completed — nice work!", "success");
      }}
    >
      {done ? <CircleCheck className="h-4 w-4 text-success" aria-hidden /> : <CircleDashed className="h-4 w-4" aria-hidden />}
      {done ? "Completed" : "Mark as complete"}
    </Button>
  );
}

export function LessonQuiz({ slug, questions }: { slug: string; questions: ChoiceQuestion[] }) {
  const [responses, setResponses] = useState<Responses>({});
  const [submitted, setSubmitted] = useState(false);
  const lastScore = useStore((d) => d.lessons[slug]?.quizScore);
  const result = useMemo(() => (submitted ? scoreAttempt(questions, responses) : null), [submitted, questions, responses]);
  const answered = questions.filter((q) => (responses[q.id] ?? []).length > 0).length;

  function submit() {
    const r = scoreAttempt(questions, responses);
    actions.recordLessonQuiz(
      slug,
      r.accuracy,
      r.results.filter((x) => !x.correct).map((x) => x.questionId),
      r.results.filter((x) => x.correct).map((x) => x.questionId),
    );
    setSubmitted(true);
  }

  return (
    <Card id="quiz">
      <CardHeader>
        <CardTitle>Check your understanding</CardTitle>
        <CardDescription>
          {questions.length} questions. Wrong answers are added to your revision list.
          {lastScore !== undefined && ` Last attempt: ${Math.round(lastScore * 100)}%.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            selected={responses[q.id] ?? []}
            onChange={(selected) => setResponses((r) => ({ ...r, [q.id]: selected }))}
            reveal={submitted}
          />
        ))}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {!submitted ? (
            <>
              <Button onClick={submit} disabled={answered === 0}>
                Check answers
              </Button>
              <span className="text-sm text-muted">
                {answered} of {questions.length} answered
              </span>
            </>
          ) : (
            <>
              <p className="text-sm" role="status">
                You scored <strong>{result?.correct}</strong> of {questions.length} ({Math.round((result?.accuracy ?? 0) * 100)}%).
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setResponses({});
                  setSubmitted(false);
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Try again
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Quick note attached to this lesson; full editor lives on /notes. */
export function LessonNotes({ slug, title }: { slug: string; title: string }) {
  const existing = useStore((d) => d.notes.find((n) => n.lessonSlug === slug));
  const [draft, setDraft] = useState<string | null>(null);
  const { notify } = useToast();
  const value = draft ?? existing?.body ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-accent" aria-hidden />
          Your notes
        </CardTitle>
        <CardDescription>Saved in this browser. Markdown is supported.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label htmlFor={`note-${slug}`} className="sr-only">
          Notes for {title}
        </label>
        <textarea
          id={`note-${slug}`}
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          placeholder="Key points, questions to revisit, examples from your own work…"
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-6 placeholder:text-subtle focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={draft === null || draft === (existing?.body ?? "")}
            onClick={() => {
              actions.saveNote({ id: existing?.id, title: `Notes: ${title}`, body: value, lessonSlug: slug });
              setDraft(null);
              notify("Note saved", "success");
            }}
          >
            Save note
          </Button>
          <Link href="/notes" className="text-xs text-muted hover:text-foreground">
            All notes →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
