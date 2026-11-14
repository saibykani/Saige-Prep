import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { allDomains, domainOfCourse, domainOfInterviewTrack, findDomain } from "@/content/curriculum";
import { getInterviewTracks, getQuestionBanks, getTrackSummaries } from "@/content/loader";
import { interviewHref, mockTestHref, ROLE_DOMAIN } from "@/content/routes";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

type Props = { params: Promise<{ domain: string }> };

export function generateStaticParams() {
  return allDomains().map((d) => ({ domain: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  return { title: findDomain(domain)?.title ?? "Domain" };
}

/** Minimal domain hub (the full hub is expansion step 9): courses, mock tests and interviews, all computed from content. */
export default async function DomainPage({ params }: Props) {
  const { domain: slug } = await params;
  const domain = findDomain(slug);
  if (!domain) notFound();

  const courses = getTrackSummaries().filter((s) => domain.courses.some((c) => c.slug === s.slug));
  const banks = getQuestionBanks().filter((b) => (domainOfCourse(b.track) ?? ROLE_DOMAIN) === slug);
  const interviews = getInterviewTracks().filter((t) => domainOfInterviewTrack(t.track) === slug);

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader title={domain.title} description={domain.summary} />
      <section aria-labelledby="courses-heading" className="space-y-3">
        <h2 id="courses-heading" className="text-lg font-semibold">
          Courses
        </h2>
        {courses.length === 0 ? (
          <p className="text-sm text-muted">No courses have been written for this domain yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((c) => (
              <Link key={c.slug} href={c.href} className="block">
                <Card className="h-full transition-colors hover:border-accent">
                  <CardHeader>
                    <CardTitle>{c.title}</CardTitle>
                    <CardDescription>{c.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted">
                      {c.modules} modules · {c.written} of {c.topics} lessons written
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
      {slug === ROLE_DOMAIN && (
        <section aria-labelledby="roles-heading" className="space-y-2">
          <h2 id="roles-heading" className="text-lg font-semibold">
            Roles
          </h2>
          <p className="text-sm text-muted">
            Role roadmaps for this domain are in the{" "}
            <Link href="/roadmaps" className="text-accent hover:underline">
              role catalogue
            </Link>
            .
          </p>
        </section>
      )}
      <section aria-labelledby="practice-heading" className="space-y-2">
        <h2 id="practice-heading" className="text-lg font-semibold">
          Practice and interviews
        </h2>
        {banks.length === 0 && interviews.length === 0 ? (
          <p className="text-sm text-muted">No mock tests or interview tracks for this domain yet.</p>
        ) : (
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {banks.map((b) => (
              <li key={b.bank}>
                <Link href={mockTestHref(slug, b.bank)} className="text-accent hover:underline">
                  {b.title} mock test
                </Link>{" "}
                <Badge tone="neutral">{b.questions.length} questions</Badge>
              </li>
            ))}
            {interviews.map((t) => (
              <li key={t.track}>
                <Link href={interviewHref(slug, t.track)} className="text-accent hover:underline">
                  {t.title} interview
                </Link>{" "}
                <Badge tone="neutral">{t.questions.length} questions</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
