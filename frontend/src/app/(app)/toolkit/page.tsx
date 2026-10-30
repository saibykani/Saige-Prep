import type { Metadata } from "next";
import { ToolkitHub } from "@/features/toolkit/toolkit-hub";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "QA Toolkit" };

export default function Page() {
  return <ToolkitHub />;
}
