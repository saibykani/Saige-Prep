"use client";

import { ListChecks, Tags, Timer } from "lucide-react";
import { CourseCard } from "@/components/ui/course-card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { useStore } from "@/lib/store";

export interface BankSummary {
  bank: string;
  title: string;
  count: number;
  topics: number;
  level: string | null;
}

export function MockHub({ banks }: { banks: BankSummary[] }) {
  const attempts = useStore((d) => d.assessments);
  return (
    <div className="space-y-8">
      <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {banks.map((b) => {
          const mine = attempts.filter((a) => a.banks.includes(b.bank));
          const best = mine.reduce((m, a) => Math.max(m, a.maxScore ? a.score / a.maxScore : 0), 0);
          return (
            <CourseCard
              key={b.bank}
              href={`/mock-tests/${b.bank}`}
              title={b.title}
              themeKey={b.bank}
              kind="mock"
              level={b.level}
              cta="Start test"
              meta={[
                <>
                  <ListChecks className="h-3.5 w-3.5" aria-hidden /> {b.count} questions
                </>,
                <>
                  <Tags className="h-3.5 w-3.5" aria-hidden /> {b.topics} topics
                </>,
                <>
                  <Timer className="h-3.5 w-3.5" aria-hidden /> timed, with flags
                </>,
              ]}
              progress={
                mine.length ? (
                  <ProgressMeter value={best} label={`${mine.length} attempt${mine.length > 1 ? "s" : ""} · best ${Math.round(best * 100)}%`} />
                ) : (
                  <p className="text-xs text-muted">Not attempted yet</p>
                )
              }
            />
          );
        })}
      </div>
      <Reveal as="section">
        <SectionHeading title="Your attempts" />
        {attempts.length === 0 ? (
          <p className="text-sm text-muted">No attempts yet. Results are saved in this browser only.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            {attempts.slice(0, 20).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-medium">{a.title}</span>
                <span className="text-muted">
                  {a.score}/{a.maxScore} · {Math.round(a.durationSeconds / 60)} min ·{" "}
                  {new Date(a.submittedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </div>
  );
}
