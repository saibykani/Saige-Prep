import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { findTrack, TRACKS } from "@/content/curriculum";
import { getLessons, getQuestionBanks } from "@/content/loader";
import { CompletionBar, ContinueLearning, TopicList, type TopicRow } from "@/features/learning/track-client";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

type Props = { params: Promise<{ track: string }> };

export function generateStaticParams() {
  return TRACKS.map((track) => ({ track: track.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track } = await params;
  return { title: findTrack(track)?.title ?? "Track" };
}

export default async function TrackPage({ params }: Props) {
  const { track: trackSlug } = await params;
  const track = findTrack(trackSlug);
  if (!track) notFound();
  const lessons = getLessons();

  const rows = (topics: { slug: string; title: string }[]): TopicRow[] =>
    topics.map((t) => {
      const lesson = lessons.get(t.slug);
      return {
        slug: t.slug,
        title: t.title,
        href: `${track.href}/${t.slug}`,
        written: Boolean(lesson),
        duration: lesson?.duration,
        level: lesson?.level,
      };
    });
  const allRows = rows(track.modules.flatMap((m) => m.topics));
  const writtenSlugs = allRows.filter((r) => r.written).map((r) => r.slug);

  return (
    <div className="animate-fade-in">
      {(() => {
        const family = TRACKS.filter((t) => t.slug === (track.parent ?? track.slug) || t.parent === (track.parent ?? track.slug));
        if (family.length < 2) return null;
        return (
          <nav aria-label="Track sections" className="mb-6 inline-flex rounded-xl border border-border bg-surface p-1">
            {family.map((t) => (
              <Link
                key={t.slug}
                href={t.href}
                aria-current={t.slug === track.slug ? "page" : undefined}
                className={
                  t.slug === track.slug
                    ? "rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-[#0d0b1a]"
                    : "rounded-lg px-4 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
                }
              >
                {t.parent ? t.title : `${t.title} overview`}
              </Link>
            ))}
          </nav>
        );
      })()}
      <PageHeader title={track.title} description={track.description} actions={
          <>
            {getQuestionBanks().some((b) => b.bank === track.slug) && (
              <Link
                href={`/mock-tests/${track.slug}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 text-sm font-medium transition-colors hover:border-accent"
              >
                ⏱ Take the mock test
              </Link>
            )}
            <ContinueLearning topics={allRows} />
          </>
        }
      />
      {writtenSlugs.length > 0 && (
        <div className="mb-8 max-w-md">
          <CompletionBar slugs={writtenSlugs} label="Track progress" />
        </div>
      )}
      <div className="space-y-5">
        {track.modules.map((module) => {
          const moduleRows = rows(module.topics);
          return (
            <Card key={module.slug} id={module.slug}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{module.title}</CardTitle>
                  <Badge tone={module.path === "core" ? "accent" : "neutral"}>
                    {module.path === "core" ? "Core path" : "Optional specialisation"}
                  </Badge>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <TopicList topics={moduleRows} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
