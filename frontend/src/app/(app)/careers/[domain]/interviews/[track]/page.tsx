import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { domainOfInterviewTrack } from "@/content/curriculum";
import { getInterviewTracks } from "@/content/loader";
import { InterviewRunner } from "@/features/interviews/interview-runner";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

type Props = { params: Promise<{ domain: string; track: string }> };

export function generateStaticParams() {
  return getInterviewTracks().map((t) => ({ domain: domainOfInterviewTrack(t.track), track: t.track }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track } = await params;
  return { title: `${getInterviewTracks().find((t) => t.track === track)?.title ?? "Interview"} interview` };
}

export default async function InterviewTrackPage({ params }: Props) {
  const { domain, track: slug } = await params;
  const track = getInterviewTracks().find((t) => t.track === slug);
  if (!track || domainOfInterviewTrack(track.track) !== domain) notFound();
  return (
    <div className="animate-fade-in">
      <PageHeader title={`${track.title} interview`} description={track.description} />
      <InterviewRunner track={track.track} title={track.title} questions={track.questions} />
    </div>
  );
}
