import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjects } from "@/content/loader";
import { ProjectDoneToggle } from "@/features/projects/project-done";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

type Props = { params: Promise<{ slug: string }> };

const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: getProjects().find((p) => p.slug === slug)?.title ?? "Project" };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjects().find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={
          <Link href="/projects" className="text-xs text-muted hover:text-accent">
            ← All projects
          </Link>
        }
        title={project.title}
        description={project.summary}
        actions={<ProjectDoneToggle slug={project.slug} />}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>At a glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p>
              Level: <span className="capitalize text-foreground">{project.level}</span>
            </p>
            <p>
              Estimated effort: <span className="text-foreground">about {project.hours} hours</span>
            </p>
            {project.sourceDir && (
              <p>
                Starter code: <code className="text-accent">{project.sourceDir}</code>
              </p>
            )}
            {project.verified && (
              <p>
                Verified: <code className="text-accent">{project.verified.command}</code> ({project.verified.result},{" "}
                {project.verified.date})
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Skills you will show</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {project.skills.map((s) => (
              <Badge key={s} tone="accent">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>Roles this project supports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {project.roles.map((r) => (
              <Link key={r} href={`/roadmaps/${r}`} className="lift">
                <Badge>{titleCase(r)}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
