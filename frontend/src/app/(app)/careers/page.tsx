import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { allDomains } from "@/content/curriculum";
import { getTrackSummaries } from "@/content/loader";
import { careersHref } from "@/content/routes";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  const summaries = getTrackSummaries();
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Careers"
        description="Domains you can prepare for. Every count below is computed from the content on disk."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {allDomains().map((domain) => {
          const courses = summaries.filter((s) => domain.courses.some((c) => c.slug === s.slug));
          const written = courses.reduce((n, c) => n + c.written, 0);
          return (
            <Link key={domain.slug} href={careersHref(domain.slug)} className="block">
              <Card className="h-full transition-colors hover:border-accent">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{domain.title}</CardTitle>
                    <Badge tone="neutral">{domain.kind === "it" ? "IT" : "Non-IT"}</Badge>
                  </div>
                  <CardDescription>{domain.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted">
                    {courses.length} course{courses.length === 1 ? "" : "s"} · {written} lessons written
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        <Link href="/careers/non-it" className="block">
          <Card className="h-full border-dashed transition-colors hover:border-accent">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Non-IT careers</CardTitle>
                <Badge tone="warning">Not built yet</Badge>
              </div>
              <CardDescription>Overview pages for careers outside IT are planned. Nothing is published yet.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
