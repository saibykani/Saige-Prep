import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TRACKS } from "@/content/curriculum";
import { getLessons, getTrackSummaries } from "@/content/loader";
import { ProgressDashboard, type TrackInfo } from "@/features/progress/progress-dashboard";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Progress & Analytics" };

export default function Page() {
  const lessons = getLessons();
  const summaries = getTrackSummaries();
  const tracks: TrackInfo[] = summaries.map((s) => {
    const track = TRACKS.find((t) => t.slug === s.slug);
    const slugs = (track?.modules.flatMap((m) => m.topics) ?? []).map((t) => t.slug).filter((slug) => lessons.has(slug));
    return { slug: s.slug, title: s.title, href: s.href, topics: s.topics, lessonSlugs: slugs };
  });
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Progress & Analytics"
        description="Everything here is computed from your own activity in this browser. Nothing is estimated or filled in."
      />
      <ProgressDashboard tracks={tracks} />
    </div>
  );
}
