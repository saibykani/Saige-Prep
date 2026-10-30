import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInterviewTracks } from "@/content/loader";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Interview Prep" };

export default function Page() {
  const tracks = getInterviewTracks();
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Interview Prep"
        description="15, 30 or 60-minute mock interviews with model answers, follow-ups and a self-evaluation rubric."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {tracks.map((t) => (
          <Link key={t.track} href={`/interviews/${t.track}`} className="lift block">
            <Card className="h-full transition-colors hover:border-accent">
              <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>
                  {t.questions.length} questions · {t.roles.length} roles
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
