import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/dashboard-view";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardView />;
}
