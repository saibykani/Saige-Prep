"use client";

import { CircleCheck, CircleDashed, CircleDot, Clock, Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface TopicRow {
  slug: string;
  title: string;
  href: string;
  written: boolean;
  duration?: number;
  level?: string;
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-raised"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-success transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Completion across a set of lesson slugs, from this browser's progress data. */
export function CompletionBar({ slugs, label = "Completed" }: { slugs: string[]; label?: string }) {
  const lessons = useStore((d) => d.lessons);
  const done = slugs.filter((s) => lessons[s]?.status === "completed").length;
  return <ProgressBar value={slugs.length ? done / slugs.length : 0} label={`${label} · ${done}/${slugs.length}`} />;
}

export function TopicList({ topics }: { topics: TopicRow[] }) {
  const lessons = useStore((d) => d.lessons);
  return (
    <ol className="divide-y divide-border">
      {topics.map((topic, i) => {
        const status = lessons[topic.slug]?.status;
        const Icon = !topic.written ? Lock : status === "completed" ? CircleCheck : status === "in-progress" ? CircleDot : CircleDashed;
        return (
          <li key={topic.slug}>
            <Link
              href={topic.href}
              className={cn(
                "-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-raised",
                !topic.written && "opacity-60",
              )}
            >
              <span className="w-6 text-right font-mono text-xs text-subtle">{i + 1}</span>
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  status === "completed" ? "text-success" : status === "in-progress" ? "text-accent" : "text-subtle",
                )}
                aria-label={!topic.written ? "Not written yet" : status ?? "Not started"}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{topic.title}</span>
              {topic.written ? (
                <span className="hidden items-center gap-3 text-xs text-muted sm:flex">
                  {topic.level && <span className="capitalize">{topic.level}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden />
                    {topic.duration} min
                  </span>
                </span>
              ) : (
                <Badge>Not written yet</Badge>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** "Continue" link to the most recently viewed, not-yet-completed lesson among the given ones. */
export function ContinueLearning({ topics }: { topics: TopicRow[] }) {
  const lessons = useStore((d) => d.lessons);
  const candidates = topics
    .filter((t) => t.written && lessons[t.slug]?.status === "in-progress")
    .sort((a, b) => (lessons[b.slug]?.lastViewedAt ?? "").localeCompare(lessons[a.slug]?.lastViewedAt ?? ""));
  const next = candidates[0] ?? topics.find((t) => t.written && !lessons[t.slug]);
  if (!next) return null;
  return (
    <Link
      href={next.href}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-strong"
    >
      {candidates[0] ? "Continue" : "Start"}: {next.title}
    </Link>
  );
}
