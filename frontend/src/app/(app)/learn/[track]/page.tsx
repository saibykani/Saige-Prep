import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { findTrack, TRACKS } from "@/content/curriculum";
import { getLessons } from "@/content/loader";
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
      <PageHeader title={track.title} description={track.description} actions={<ContinueLearning topics={allRows} />} />
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
