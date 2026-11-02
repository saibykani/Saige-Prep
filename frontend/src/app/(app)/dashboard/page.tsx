import type { Metadata } from "next";
import { TRACKS } from "@/content/curriculum";
import { getLessons } from "@/content/loader";
import { DashboardView, type LessonRef } from "@/features/dashboard/dashboard-view";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  const lessons = getLessons();
  const index: Record<string, LessonRef> = {};
  for (const track of TRACKS) {
    for (const topic of track.modules.flatMap((m) => m.topics)) {
      const lesson = lessons.get(topic.slug);
      if (!lesson) continue;
      index[topic.slug] = {
        title: lesson.title,
        href: `${track.href}/${topic.slug}`,
        track: track.slug,
        trackTitle: track.title,
        duration: lesson.duration,
        level: lesson.level,
      };
    }
  }
  const minutes = Object.values(index).reduce((n, l) => n + l.duration, 0);
  return (
    <DashboardView
      lessonIndex={index}
      content={{ tracks: TRACKS.length, lessons: Object.keys(index).length, hours: Math.round(minutes / 60) }}
    />
  );
}
