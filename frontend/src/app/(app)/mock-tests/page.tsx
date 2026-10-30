import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { getQuestionBanks } from "@/content/loader";
import { MockHub } from "@/features/assessments/mock-hub";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Mock Tests" };

export default function Page() {
  const banks = getQuestionBanks().map((b) => ({ bank: b.bank, title: b.title, count: b.questions.length }));
  return (
    <div className="animate-fade-in">
      <PageHeader title="Mock Tests" description="Timed assessments scored in your browser, with topic-wise results." />
      <MockHub banks={banks} />
    </div>
  );
}
