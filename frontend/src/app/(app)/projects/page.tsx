import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjects } from "@/content/loader";
import { ProjectDoneBadge } from "@/features/projects/project-done";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Real-World Projects" };

export default function Page() {
  const projects = getProjects();
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Real-World Projects"
        description="Guided portfolio projects that prove you can do the job: build them, push them to GitHub and talk through them in interviews."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.slug} href={`/projects/${p.slug}`} className="lift block">
            <Card className="h-full transition-colors hover:border-accent">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent" className="capitalize">
                    {p.level}
                  </Badge>
                  <Badge>~{p.hours} h</Badge>
                  {p.sourceDir && <Badge>Starter code</Badge>}
                  <ProjectDoneBadge slug={p.slug} />
                </div>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.skills.join(" · ")}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
