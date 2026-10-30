import { ArrowLeft, ArrowRight, Clock, ExternalLink, FileWarning, GraduationCap, ListChecks, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/learning/markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { allTopics, findTrack, TRACKS } from "@/content/curriculum";
import { getLesson, getLessons } from "@/content/loader";
import { BookmarkButton, CompleteButton, LessonNotes, LessonQuiz, LessonTracker } from "@/features/learning/lesson-client";
import { headingsOf } from "@/lib/markdown-utils";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

type Props = { params: Promise<{ track: string; lesson: string }> };

export function generateStaticParams() {
  return TRACKS.flatMap((track) =>
    track.modules.flatMap((m) => m.topics.map((topic) => ({ track: track.slug, lesson: topic.slug }))),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lesson } = await params;
  const found = getLesson(lesson);
  const topic = allTopics().find((t) => t.slug === lesson);
  return { title: found?.title ?? topic?.title ?? "Lesson", description: found?.summary };
}

export default async function LessonPage({ params }: Props) {
  const { track: trackSlug, lesson: lessonSlug } = await params;
  const track = findTrack(trackSlug);
  const ordered = allTopics().filter((t) => t.track.slug === trackSlug);
  const index = ordered.findIndex((t) => t.slug === lessonSlug);
  if (!track || index === -1) notFound();
  const topic = ordered[index];
  const lesson = getLesson(lessonSlug);
  const lessons = getLessons();
  const prev = ordered[index - 1];
  const next = ordered[index + 1];

  if (!lesson) {
    return (
      <div className="animate-fade-in space-y-6">
        <Link href={track.href} className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {track.title}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{topic.title}</h1>
        <EmptyState
          icon={FileWarning}
          title="This lesson has not been written yet"
          description={`It is part of ${topic.module.title}. Rather than show placeholder text, Saige-Prep lists it honestly until the full lesson is ready.`}
          action={
            next && (
              <Link href={`${track.href}/${next.slug}`} className="text-sm text-accent hover:underline">
                Next topic: {next.title} →
              </Link>
            )
          }
        />
      </div>
    );
  }

  const toc = headingsOf(lesson.body);
  const relatedTopics = lesson.related
    .map((slug) => allTopics().find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const href = `${track.href}/${lesson.slug}`;

  return (
    <article className="animate-fade-in">
      <LessonTracker slug={lesson.slug} />
      <header className="mb-8 space-y-4">
        <Link href={`${track.href}#${topic.module.slug}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {topic.module.title}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted">{lesson.summary}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent" className="capitalize">
            <GraduationCap className="h-3 w-3" aria-hidden />
            {lesson.level}
          </Badge>
          <Badge>
            <Clock className="h-3 w-3" aria-hidden />
            {lesson.duration} min
          </Badge>
          {lesson.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <CompleteButton slug={lesson.slug} />
          <BookmarkButton id={`lesson:${lesson.slug}`} kind="lesson" title={lesson.title} href={href} />
          <a href="#quiz" className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-muted hover:bg-surface-raised hover:text-foreground">
            Jump to quiz ↓
          </a>
        </div>
      </header>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" aria-hidden />
                  Learning objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-foreground/90 marker:text-subtle">
                  {lesson.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-accent" aria-hidden />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.prerequisites.length ? (
                  <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-foreground/90 marker:text-subtle">
                    {lesson.prerequisites.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">None — a good starting point.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Markdown source={lesson.body} />

          <section aria-labelledby="practice-heading" className="space-y-3">
            <h2 id="practice-heading" className="border-b border-border pb-2 text-xl font-semibold tracking-tight">
              Practice tasks
            </h2>
            <ol className="list-decimal space-y-2 pl-6 text-[15px] leading-7 marker:text-subtle">
              {lesson.practice.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ol>
          </section>

          <LessonQuiz slug={lesson.slug} questions={lesson.quiz} />

          <section aria-labelledby="interview-heading" className="space-y-3">
            <h2 id="interview-heading" className="border-b border-border pb-2 text-xl font-semibold tracking-tight">
              Interview questions
            </h2>
            <p className="text-sm text-muted">Answer out loud first, then open the model answer.</p>
            <div className="space-y-2">
              {lesson.interview.map((item) => (
                <details key={item.q} className="group rounded-lg border border-border bg-surface px-4 py-3 open:bg-surface-raised">
                  <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                    <span className="mr-2 text-accent group-open:rotate-90">›</span>
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-foreground/85">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="takeaways-heading" className="rounded-xl border border-success/25 bg-success-soft/40 p-5">
            <h2 id="takeaways-heading" className="mb-3 font-semibold">
              Key takeaways
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 marker:text-success">
              {lesson.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section aria-labelledby="refs-heading">
              <h2 id="refs-heading" className="mb-3 font-semibold">
                References
              </h2>
              <ul className="space-y-2 text-sm">
                {lesson.references.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-accent hover:underline">
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            {relatedTopics.length > 0 && (
              <section aria-labelledby="related-heading">
                <h2 id="related-heading" className="mb-3 font-semibold">
                  Related lessons
                </h2>
                <ul className="space-y-2 text-sm">
                  {relatedTopics.map((t) => (
                    <li key={t.slug}>
                      <Link href={`${t.track.href}/${t.slug}`} className="text-foreground/90 hover:text-accent">
                        {t.title}
                        {!lessons.has(t.slug) && <span className="ml-2 text-xs text-subtle">(coming)</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <LessonNotes slug={lesson.slug} title={lesson.title} />

          <nav aria-label="Lesson navigation" className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
            {prev ? (
              <Link href={`${track.href}/${prev.slug}`} className="group flex flex-col rounded-lg border border-border px-4 py-3 hover:border-border-strong">
                <span className="flex items-center gap-1 text-xs text-muted">
                  <ArrowLeft className="h-3 w-3" aria-hidden /> Previous
                </span>
                <span className="text-sm group-hover:text-accent">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`${track.href}/${next.slug}`} className="group flex flex-col rounded-lg border border-border px-4 py-3 text-right hover:border-border-strong">
                <span className="flex items-center justify-end gap-1 text-xs text-muted">
                  Next <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
                <span className="text-sm group-hover:text-accent">{next.title}</span>
              </Link>
            )}
          </nav>
        </div>

        {toc.length > 0 && (
          <aside className="hidden xl:block">
            <nav aria-label="On this page" className="sticky top-20 space-y-2 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">On this page</p>
              <ul className="space-y-1.5 border-l border-border">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-accent hover:text-foreground">
                      {h.text}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#quiz" className="-ml-px block border-l border-transparent pl-3 text-muted hover:border-accent hover:text-foreground">
                    Quiz
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        )}
      </div>
    </article>
  );
}
