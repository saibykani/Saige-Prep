import { Clock, MessagesSquare, Users } from "lucide-react";
import type { Metadata } from "next";
import { HubHero } from "@/components/layout/hub-hero";
import { CourseCard } from "@/components/ui/course-card";
import { getInterviewTracks } from "@/content/loader";
import { InterviewTrackProgress } from "@/features/interviews/interview-progress";
import { formatMinutes, levelRange } from "@/lib/visual-themes";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Interview Prep" };

export default function Page() {
  const tracks = getInterviewTracks();
  const questions = tracks.reduce((n, t) => n + t.questions.length, 0);
  const roles = new Set(tracks.flatMap((t) => t.roles)).size;
  return (
    <div className="animate-fade-in">
      <HubHero
        tone="indigo"
        title="Interview Prep"
        subtitle="15, 30 or 60-minute mock interviews with model answers, follow-ups and a self-evaluation rubric."
        stats={[
          { value: tracks.length, label: "interview tracks" },
          { value: questions, label: "questions" },
          { value: roles, label: "roles covered" },
        ]}
        actions={[
          { href: "/roadmaps", label: "Pick your target role", primary: true },
          { href: "/learn", label: "Brush up on lessons" },
        ]}
      />
      <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tracks.map((t) => (
          <CourseCard
            key={t.track}
            href={`/interviews/${t.track}`}
            title={t.title}
            description={t.description}
            themeKey={t.track}
            kind="interview"
            level={levelRange(t.questions.map((q) => q.difficulty))}
            cta="Start interview"
            meta={[
              <>
                <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> {t.questions.length} questions
              </>,
              <>
                <Users className="h-3.5 w-3.5" aria-hidden /> {t.roles.length} roles
              </>,
              <>
                <Clock className="h-3.5 w-3.5" aria-hidden /> {formatMinutes(t.questions.reduce((n, q) => n + q.minutes, 0))} of material
              </>,
            ]}
            progress={<InterviewTrackProgress track={t.track} questionIds={t.questions.map((q) => q.id)} />}
          />
        ))}
      </div>
    </div>
  );
}
