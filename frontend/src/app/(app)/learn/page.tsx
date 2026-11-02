import type { Metadata } from "next";
import { HubHero } from "@/components/layout/hub-hero";
import { TRACKS } from "@/content/curriculum";
import { getLessons, getTrackSummaries } from "@/content/loader";
import { TrackCatalogue, type TrackCardData } from "@/features/learning/track-catalogue";
import { levelRange } from "@/lib/visual-themes";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Learning Center" };

export default function LearningCenterPage() {
  const summaries = getTrackSummaries();
  const lessons = getLessons();
  const totals = summaries.reduce(
    (acc, s) => ({ written: acc.written + s.written, minutes: acc.minutes + s.minutes, modules: acc.modules + s.modules }),
    { written: 0, minutes: 0, modules: 0 },
  );

  const tracks: TrackCardData[] = summaries.map((track) => {
    const slugs = TRACKS.find((t) => t.slug === track.slug)!
      .modules.flatMap((m) => m.topics.map((t) => t.slug))
      .filter((s) => lessons.has(s));
    return { ...track, slugs, level: levelRange(slugs.map((s) => lessons.get(s)!.level)) };
  });

  return (
    <div className="animate-fade-in">
      <HubHero
        tone="violet"
        title="Learning Center"
        subtitle="Every track, module and lesson. Start with Manual Testing — it is the foundation every other testing role builds on."
        stats={[
          { value: summaries.length, label: "tracks" },
          { value: totals.written, label: "lessons" },
          { value: Math.round(totals.minutes / 60), label: "hours of study" },
        ]}
        actions={[
          { href: "/learn/manual-testing", label: "Start with Manual Testing", primary: true },
          { href: "/roadmaps", label: "Find your role path" },
        ]}
      />
      <TrackCatalogue tracks={tracks} />
    </div>
  );
}
