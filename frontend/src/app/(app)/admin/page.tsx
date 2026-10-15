import type { Metadata } from "next";
import { PlannedSection } from "@/components/layout/planned-section";
import { AdminGate } from "@/features/auth/admin-gate";

export const metadata: Metadata = { title: "Admin" };

export default function Page() {
  return (
    <AdminGate>
      <PlannedSection href="/admin" />
    </AdminGate>
  );
}
