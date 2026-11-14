import type { Metadata } from "next";
import { HubHero } from "@/components/layout/hub-hero";
import { domainOfCourse } from "@/content/curriculum";
import { getQuestionBanks } from "@/content/loader";
import { mockTestHref, ROLE_DOMAIN } from "@/content/routes";
import { MockHub } from "@/features/assessments/mock-hub";
import { levelRange } from "@/lib/visual-themes";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Mock Tests" };

export default function Page() {
  const all = getQuestionBanks();
  const banks = all.map((b) => ({
    bank: b.bank,
    href: mockTestHref(domainOfCourse(b.track) ?? ROLE_DOMAIN, b.bank),
    title: b.title,
    count: b.questions.length,
    topics: new Set(b.questions.map((q) => q.topic)).size,
    level: levelRange(b.questions.map((q) => q.difficulty)),
  }));
  const questions = banks.reduce((n, b) => n + b.count, 0);
  const topics = new Set(all.flatMap((b) => b.questions.map((q) => q.topic))).size;
  return (
    <div className="animate-fade-in">
      <HubHero
        tone="clay"
        title="Mock Tests"
        subtitle="Timed assessments scored in your browser, with topic-wise results. Find your weak spots before an interviewer does."
        stats={[
          { value: banks.length, label: "question banks" },
          { value: questions, label: "questions" },
          { value: topics, label: "topics covered" },
        ]}
        actions={[
          { href: "/progress", label: "See your results", primary: true },
          { href: "/learn", label: "Revise lessons first" },
        ]}
      />
      <MockHub banks={banks} />
    </div>
  );
}
