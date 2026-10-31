import { ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { TRACKS } from "@/content/curriculum";
import { getLessons, getTrackSummaries } from "@/content/loader";
import { CompletionBar } from "@/features/learning/track-client";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Learning Center" };

export default function LearningCenterPage() {
  const summaries = getTrackSummaries();
  const lessons = getLessons();
  const totals = summaries.reduce(
    (acc, s) => ({ topics: acc.topics + s.topics, written: acc.written + s.written, minutes: acc.minutes + s.minutes }),
    { topics: 0, written: 0, minutes: 0 },
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Learning Center"
        description="Every track, module and lesson. Start with Manual Testing — it is the foundation every other testing role builds on."
        eyebrow={
          <Badge tone="accent">
            <BookOpen className="h-3 w-3" aria-hidden />
            {totals.written} lessons · {Math.round(totals.minutes / 60)} hours of study
          </Badge>
        }
      />

      <div className="stagger grid gap-4 md:grid-cols-2">
        {summaries.map((track) => {
          const slugs = TRACKS.find((t) => t.slug === track.slug)!
            .modules.flatMap((m) => m.topics.map((t) => t.slug))
            .filter((s) => lessons.has(s));
          return (
            <Link
              key={track.slug}
              href={track.href}
              className="spotlight lift group flex flex-col gap-4 rounded-2xl border border-border bg-surface/90 p-5 hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold tracking-tight">{track.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{track.description}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted">
                <Badge>{track.modules} modules</Badge>
                <Badge>
                  {track.written}/{track.topics} lessons written
                </Badge>
                {track.minutes > 0 && <Badge>≈ {Math.round(track.minutes / 60)} h</Badge>}
                {track.slug === "manual-testing" && <Badge tone="success">Start here</Badge>}
              </div>
              {slugs.length > 0 && <CompletionBar slugs={slugs} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
