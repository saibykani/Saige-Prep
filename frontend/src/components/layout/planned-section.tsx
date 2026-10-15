import { CircleDashed } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { findNavItem } from "@/lib/navigation";

/**
 * Honest page for a section whose implementation phase has not landed yet.
 * It states what is planned instead of showing fake content.
 */
export function PlannedSection({ href }: { href: string }) {
  const item = findNavItem(href);
  if (!item) notFound();
  const Icon = item.icon;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow={<Badge tone="warning">Planned · Phase {item.phase}</Badge>}
        title={item.label}
        description={item.description}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <EmptyState
          icon={Icon}
          title={`${item.label} is not built yet`}
          description={
            <>
              This section is scheduled for Phase {item.phase}. Nothing here is simulated: content and data will
              appear once that phase is implemented and tested.
            </>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>What this section will include</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {item.planned.map((entry) => (
                <li key={entry} className="flex gap-2 text-sm text-muted">
                  <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden />
                  {entry}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
