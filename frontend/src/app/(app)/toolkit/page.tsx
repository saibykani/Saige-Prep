import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

export const metadata: Metadata = { title: "QA Toolkit" };

export default function Page() {
  return <PlannedSection href="/toolkit" />;
}
