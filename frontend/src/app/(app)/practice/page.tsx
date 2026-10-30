import type { Metadata } from "next";
import { PracticeHub } from "@/features/practice/practice-hub";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Practice Lab" };

export default function Page() {
  return <PracticeHub />;
}
