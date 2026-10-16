import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "SDET Engineering" };

export default function Page() {
  return <PlannedSection href="/learn/sdet" />;
}
