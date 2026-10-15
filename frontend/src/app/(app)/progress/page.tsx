import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

export const metadata: Metadata = { title: "Progress & Analytics" };

export default function Page() {
  return <PlannedSection href="/progress" />;
}
