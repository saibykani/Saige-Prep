import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";
import { AdminGate } from "@/features/auth/admin-gate";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Admin" };

export default function Page() {
  return (
    <AdminGate>
      <PlannedSection href="/admin" />
    </AdminGate>
  );
}
