import { Clock, Code, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { HubHero } from "@/components/layout/hub-hero";
import { CourseCard } from "@/components/ui/course-card";
import { getProjects } from "@/content/loader";
import { courseHref } from "@/content/routes";
import { ProjectDoneBadge } from "@/features/projects/project-done";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Real-World Projects" };

export default function Page() {
  const projects = getProjects();
  const hours = projects.reduce((n, p) => n + p.hours, 0);
  const starters = projects.filter((p) => p.sourceDir).length;
  return (
    <div className="animate-fade-in">
      <HubHero
        tone="moss"
        title="Real-World Projects"
        subtitle="Guided portfolio projects that prove you can do the job: build them, push them to GitHub and talk through them in interviews."
        stats={[
          { value: projects.length, label: "projects" },
          { value: hours, label: "hours of building" },
          { value: starters, label: "with starter code" },
        ]}
        actions={[
          { href: courseHref("testing", "automation"), label: "Learn automation first", primary: true },
          { href: "/interviews", label: "Practise talking about them" },
        ]}
      />
      <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <CourseCard
            key={p.slug}
            href={`/projects/${p.slug}`}
            title={p.title}
            description={p.summary}
            themeKey={p.slug}
            kind="project"
            level={p.level.charAt(0).toUpperCase() + p.level.slice(1)}
            cta="Start project"
            meta={[
              <>
                <Clock className="h-3.5 w-3.5" aria-hidden /> ~{p.hours} h
              </>,
              <>
                <Wrench className="h-3.5 w-3.5" aria-hidden /> {p.skills.slice(0, 3).join(" · ")}
              </>,
              ...(p.sourceDir
                ? [
                    <>
                      <Code className="h-3.5 w-3.5" aria-hidden /> Starter code
                    </>,
                  ]
                : []),
            ]}
            badges={<ProjectDoneBadge slug={p.slug} />}
          />
        ))}
      </div>
    </div>
  );
}
