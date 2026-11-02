"use client";

import { BookOpen, Clock, Layers } from "lucide-react";
import { useState } from "react";
import { CourseCard } from "@/components/ui/course-card";
import { EmptyState } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { formatMinutes, TRACK_CATEGORIES, trackCategory } from "@/lib/visual-themes";
import { CompletionBar } from "./track-client";

export interface TrackCardData {
  slug: string;
  title: string;
  href: string;
  description: string;
  modules: number;
  topics: number;
  written: number;
  minutes: number;
  level: string | null;
  /** Written lesson slugs, for completion from the learner store. */
  slugs: string[];
}

/** Track cards with a client-side category chip filter (no request-time reads). */
export function TrackCatalogue({ tracks }: { tracks: TrackCardData[] }) {
  const [category, setCategory] = useState<string>("all");
  const chips = [
    { id: "all", label: "All tracks", count: tracks.length },
    ...TRACK_CATEGORIES.map((c) => ({ ...c, count: tracks.filter((t) => trackCategory(t.slug) === c.id).length })).filter((c) => c.count > 0),
  ];
  const shown = category === "all" ? tracks : tracks.filter((t) => trackCategory(t.slug) === category);

  return (
    <div className="space-y-5">
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="group" aria-label="Filter tracks by category">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "chip inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-4 text-sm font-medium text-muted shadow-soft hover:border-border-strong hover:text-foreground",
              )}
            >
              {c.label}
              <span className="rounded-full bg-black/10 px-1.5 text-[11px] tabular-nums dark:bg-white/10">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" role="status">
        {shown.length} track{shown.length === 1 ? "" : "s"} shown
      </p>

      {shown.length === 0 ? (
        <EmptyState icon={BookOpen} title="No tracks in this category" description="Pick another category." />
      ) : (
        <div key={category} className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((track) => (
            <CourseCard
              key={track.slug}
              href={track.href}
              title={track.title}
              description={track.description}
              themeKey={track.slug}
              level={track.level}
              featured={track.slug === "manual-testing"}
              cta={track.slug === "manual-testing" ? "Start here" : "Start learning"}
              meta={[
                <>
                  <Layers className="h-3.5 w-3.5" aria-hidden /> {track.modules} modules
                </>,
                <>
                  <BookOpen className="h-3.5 w-3.5" aria-hidden /> {track.written}/{track.topics} lessons written
                </>,
                ...(track.minutes > 0
                  ? [
                      <>
                        <Clock className="h-3.5 w-3.5" aria-hidden /> {formatMinutes(track.minutes)}
                      </>,
                    ]
                  : []),
              ]}
              progress={track.slugs.length > 0 ? <CompletionBar slugs={track.slugs} /> : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
