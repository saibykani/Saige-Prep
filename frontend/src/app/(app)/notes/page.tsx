import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

export const metadata: Metadata = { title: "Notes" };

export default function Page() {
  return <PlannedSection href="/notes" />;
}
