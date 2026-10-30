import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allTopics, findTrack } from "@/content/curriculum";
import { getQuestionBanks } from "@/content/loader";
import { MockTest } from "@/features/assessments/mock-test";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

type Props = { params: Promise<{ bank: string }> };

export function generateStaticParams() {
  const banks = getQuestionBanks();
  return banks.length ? banks.map((b) => ({ bank: b.bank })) : [{ bank: "jmeter" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bank } = await params;
  return { title: `${getQuestionBanks().find((b) => b.bank === bank)?.title ?? "Mock"} mock test` };
}

export default async function MockTestPage({ params }: Props) {
  const { bank: slug } = await params;
  const bank = getQuestionBanks().find((b) => b.bank === slug);
  if (!bank) notFound();
  const topicTitles = Object.fromEntries(allTopics().map((t) => [t.slug, t.title]));
  return <MockTest bank={bank.bank} title={bank.title} questions={bank.questions} topicTitles={topicTitles} backHref={findTrack(bank.track)?.href ?? "/learn"} />;
}
