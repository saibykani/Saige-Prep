import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";

export const metadata: Metadata = { title: "Bookmarks" };

export default function Page() {
  return <PlannedSection href="/bookmarks" />;
}
