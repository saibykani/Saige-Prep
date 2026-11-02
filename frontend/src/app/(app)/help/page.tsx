import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { HelpGuide } from "@/features/help/help-guide";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Help & User Guide" };

export default function HelpPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Help & User Guide"
        description="Step-by-step walkthroughs of every part of Saige-Prep, with screenshots, plus a study routine and answers to common questions."
      />
      <HelpGuide />
    </div>
  );
}
