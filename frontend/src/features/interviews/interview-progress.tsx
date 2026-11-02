"use client";

import { ProgressMeter } from "@/components/ui/progress-meter";
import { useStore } from "@/lib/store";

/** Share of a track's questions this learner has answered in any mock interview (local data). */
export function InterviewTrackProgress({ track, questionIds }: { track: string; questionIds: string[] }) {
  const sessions = useStore((d) => d.interviews);
  const mine = sessions.filter((s) => s.track === track);
  if (mine.length === 0) return <p className="text-xs text-muted">Not practised yet</p>;
  const answered = new Set(mine.flatMap((s) => s.answers.map((a) => a.questionId)));
  const covered = questionIds.filter((id) => answered.has(id)).length;
  return (
    <ProgressMeter
      value={questionIds.length ? covered / questionIds.length : 0}
      label={`${mine.length} session${mine.length > 1 ? "s" : ""} · ${covered}/${questionIds.length} questions`}
    />
  );
}
