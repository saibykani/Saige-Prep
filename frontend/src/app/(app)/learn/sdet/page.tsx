import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

export const metadata: Metadata = { title: "SDET Engineering" };

export default function Page() {
  return <PlannedSection href="/learn/sdet" />;
}
