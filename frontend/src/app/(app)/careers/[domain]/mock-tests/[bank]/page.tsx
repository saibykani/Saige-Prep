import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allTopics, domainOfCourse, findTrack } from "@/content/curriculum";
import { ROLE_DOMAIN } from "@/content/routes";
import { getQuestionBanks } from "@/content/loader";
import { MockTest } from "@/features/assessments/mock-test";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

type Props = { params: Promise<{ domain: string; bank: string }> };

export function generateStaticParams() {
  const banks = getQuestionBanks();
  return banks.length ? banks.map((b) => ({ domain: domainOfCourse(b.track) ?? ROLE_DOMAIN, bank: b.bank })) : [{ domain: ROLE_DOMAIN, bank: "jmeter" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bank } = await params;
  return { title: `${getQuestionBanks().find((b) => b.bank === bank)?.title ?? "Mock"} mock test` };
}

export default async function MockTestPage({ params }: Props) {
  const { domain, bank: slug } = await params;
  const bank = getQuestionBanks().find((b) => b.bank === slug);
  if (!bank || (domainOfCourse(bank.track) ?? ROLE_DOMAIN) !== domain) notFound();
  const topicTitles = Object.fromEntries(allTopics().map((t) => [t.slug, t.title]));
  return <MockTest bank={bank.bank} title={bank.title} questions={bank.questions} topicTitles={topicTitles} backHref={findTrack(bank.track)?.href ?? "/learn"} />;
}
