import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TRACKS } from "@/content/curriculum";
import { getLessons, getRoles } from "@/content/loader";
import { StudyPlanner } from "@/features/planner/study-planner";
import type { PlannerLesson, PlannerRole } from "@/features/planner/plan";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Study Planner" };

export default function Page() {
  const all = getLessons();
  const lessons: PlannerLesson[] = [];
  for (const track of TRACKS) {
    for (const topic of track.modules.flatMap((m) => m.topics)) {
      const lesson = all.get(topic.slug);
      if (lesson) lessons.push({ slug: topic.slug, title: lesson.title, href: `${track.href}/${topic.slug}`, minutes: lesson.duration });
    }
  }
  const roles: PlannerRole[] = getRoles()
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      stages: [
        { title: r.roadmap.beginner.title, topics: r.roadmap.beginner.topics },
        { title: r.roadmap.intermediate.title, topics: r.roadmap.intermediate.topics },
        { title: r.roadmap.advanced.title, topics: r.roadmap.advanced.topics },
      ],
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Study Planner"
        description="Pick a target role and your weekly time. The planner lays out that role's roadmap lessons week by week; tick them off as you go."
      />
      <StudyPlanner roles={roles} lessons={lessons} />
    </div>
  );
}
