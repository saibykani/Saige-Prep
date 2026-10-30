import { ArrowLeft, Briefcase, CircleAlert, Code, FlaskConical, GraduationCap, ShieldAlert, Target, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/feedback";
import { allTopics } from "@/content/curriculum";
import { getLessons, getRoles } from "@/content/loader";
import { ALL_ROLE_SLUGS, ROLE_CATALOG } from "@/content/role-catalog";
import { ROLE_CATEGORIES } from "@/content/schema";
import { BookmarkButton } from "@/features/learning/lesson-client";
import { CompletionBar } from "@/features/learning/track-client";
import { SetTargetRole } from "@/features/roadmaps/role-catalogue";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

type Props = { params: Promise<{ role: string }> };

export function generateStaticParams() {
  return ALL_ROLE_SLUGS.map((role) => ({ role }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params;
  return { title: getRoles().find((r) => r.slug === role)?.title ?? "Role roadmap" };
}

function titleOf(slug: string) {
  for (const list of Object.values(ROLE_CATALOG)) {
    const hit = list.find(([s]) => s === slug);
    if (hit) return hit[1];
  }
  return slug;
}

export default async function RolePage({ params }: Props) {
  const { role: slug } = await params;
  if (!ALL_ROLE_SLUGS.includes(slug)) notFound();
  const role = getRoles().find((r) => r.slug === slug);
  const lessons = getLessons();
  const topics = allTopics();

  if (!role) {
    return (
      <div className="space-y-6">
        <Link href="/roadmaps" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All roles
        </Link>
        <PageHeader title={titleOf(slug)} />
        <Alert title="This roadmap has not been written yet">It will appear once it passes content validation.</Alert>
      </div>
    );
  }

  const category = ROLE_CATEGORIES.find((c) => c.id === role.category)?.label;
  const stages = [
    { key: "beginner", label: "Beginner", stage: role.roadmap.beginner },
    { key: "intermediate", label: "Intermediate", stage: role.roadmap.intermediate },
    { key: "advanced", label: "Advanced", stage: role.roadmap.advanced },
  ] as const;
  const roadmapSlugs = [...new Set(stages.flatMap((s) => s.stage.topics))].filter((s) => lessons.has(s));

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <Link href="/roadmaps" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All roles
        </Link>
        <PageHeader
          title={role.title}
          eyebrow={<Badge tone="accent">{category}</Badge>}
          description={role.overview}
          actions={
            <>
              <SetTargetRole slug={role.slug} title={role.title} />
              <BookmarkButton id={`role:${role.slug}`} kind="role" title={role.title} href={`/roadmaps/${role.slug}`} />
            </>
          }
        />
        {roadmapSlugs.length > 0 && (
          <div className="max-w-md">
            <CompletionBar slugs={roadmapSlugs} label="Roadmap lessons completed" />
          </div>
        )}
      </div>

      {role.boundaries && (
        <Alert tone="error" title="Ethical and legal boundaries">
          {role.boundaries}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-success" aria-hidden /> Essential skills
            </CardTitle>
            <CardDescription>Needed to be hired into this role.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {role.skills.essential.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-accent" aria-hidden /> Role-specific skills
            </CardTitle>
            <CardDescription>What distinguishes this role.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {role.skills.roleSpecific.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted" aria-hidden /> Optional skills
            </CardTitle>
            <CardDescription>Nice to have, not required.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-muted">
              {role.skills.optional.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-subtle">
              {role.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-subtle">
              {role.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="flex items-start gap-2 rounded-lg bg-surface-raised p-3 text-sm">
              <Code className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <p>
                <span className="font-medium">Coding: </span>
                {role.codingRequirements}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="roadmap-heading">
        <h2 id="roadmap-heading" className="mb-4 text-xl font-semibold tracking-tight">
          Beginner-to-advanced roadmap
        </h2>
        <ol className="grid gap-4 lg:grid-cols-3">
          {stages.map(({ key, label, stage }, i) => (
            <li key={key} className="relative rounded-xl border border-border bg-surface p-5">
              <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <h3 className="font-semibold">
                {label}: {stage.title}
              </h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-subtle">
                {stage.goals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
              {stage.topics.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-border pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Study</p>
                  {stage.topics.map((slug) => {
                    const t = topics.find((x) => x.slug === slug);
                    if (!t) return null;
                    return (
                      <Link key={slug} href={`${t.track.href}/${slug}`} className="block text-sm text-accent hover:underline">
                        {t.title}
                        {!lessons.has(slug) && <span className="ml-1 text-xs text-subtle">(coming)</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-accent" aria-hidden /> Tools and technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {role.tools.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-accent" aria-hidden /> Practical exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-subtle">
              {role.exercises.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample portfolio project: {role.sampleProject.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-foreground/90">{role.sampleProject.description}</p>
        </CardContent>
      </Card>

      <section aria-labelledby="iq-heading" className="space-y-3">
        <h2 id="iq-heading" className="text-xl font-semibold tracking-tight">
          Role-specific interview questions
        </h2>
        {role.interviewQuestions.map((item) => (
          <details key={item.q} className="rounded-lg border border-border bg-surface px-4 py-3 open:bg-surface-raised">
            <summary className="cursor-pointer text-sm font-medium">{item.q}</summary>
            <p className="mt-3 text-sm leading-6 text-foreground/85">{item.a}</p>
          </details>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" aria-hidden /> Common interview mistakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-subtle">
              {role.commonMistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-success" aria-hidden /> Readiness criteria
            </CardTitle>
            <CardDescription>Self-check before applying. Meeting them is not a guarantee of employment.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-subtle">
              {role.readinessCriteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {role.nextRoles.length > 0 && (
        <section aria-labelledby="next-heading">
          <h2 id="next-heading" className="mb-3 font-semibold">
            Suggested next career steps
          </h2>
          <div className="flex flex-wrap gap-2">
            {role.nextRoles.map((next) => (
              <Link key={next} href={`/roadmaps/${next}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent hover:text-accent">
                {titleOf(next)} →
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
