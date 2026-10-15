import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

export const metadata: Metadata = { title: "Real-World Projects" };

export default function Page() {
  return <PlannedSection href="/projects" />;
}
