import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

export const metadata: Metadata = { title: "Specialist Testing" };

export default function Page() {
  return <PlannedSection href="/learn/specialist" />;
}
