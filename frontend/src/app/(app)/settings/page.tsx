import type { Metadata } from "next";
import { SettingsView } from "@/features/settings/settings-view";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsView />;
}
