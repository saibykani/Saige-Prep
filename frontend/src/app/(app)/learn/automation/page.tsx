import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

export const metadata: Metadata = { title: "Automation Testing" };

export default function Page() {
  return <PlannedSection href="/learn/automation" />;
}
