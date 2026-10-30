import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiLab } from "@/features/practice/api-lab";
import { CodeLab } from "@/features/practice/code-lab";
import { DefectReportLab, RequirementsLab } from "@/features/practice/manual-labs";
import { PerformanceLab } from "@/features/practice/performance-lab";
import { SqlLab } from "@/features/practice/sql-lab";
import { TestDesignLab } from "@/features/practice/test-design-lab";
import { PRACTICE } from "@/lib/registry";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

const LABS = {
  "test-design": TestDesignLab,
  requirements: RequirementsLab,
  "defect-report": DefectReportLab,
  code: CodeLab,
  api: ApiLab,
  sql: SqlLab,
  performance: PerformanceLab,
} as const;

type Props = { params: Promise<{ lab: string }> };

export function generateStaticParams() {
  return PRACTICE.map((p) => ({ lab: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lab } = await params;
  return { title: PRACTICE.find((p) => p.slug === lab)?.title ?? "Practice" };
}

export default async function LabPage({ params }: Props) {
  const { lab } = await params;
  const Lab = LABS[lab as keyof typeof LABS];
  if (!Lab) notFound();
  return <Lab />;
}
