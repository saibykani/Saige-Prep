import { Map as MapIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { getRoles } from "@/content/loader";
import { ROLE_CATALOG } from "@/content/role-catalog";
import { ROLE_CATEGORIES } from "@/content/schema";
import { RoleCatalogue } from "@/features/roadmaps/role-catalogue";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Role Roadmaps" };

export default function RoadmapsPage() {
  const roles = getRoles();
  const total = Object.values(ROLE_CATALOG).reduce((n, list) => n + list.length, 0);
  const cards = roles.map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    overview: r.overview,
    essential: r.skills.essential,
    codingRequired: !/^none|not required|no coding/i.test(r.codingRequirements.trim()),
  }));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Testing Role Roadmaps"
        description="Beginner-to-advanced paths for every major testing role. Each roadmap separates essential skills from role-specific and optional ones — roles really do differ."
        eyebrow={<Badge tone="accent">{roles.length} of {total} roles</Badge>}
      />
      {cards.length === 0 ? (
        <EmptyState icon={MapIcon} title="Role roadmaps are being written" description="They will appear here as soon as they pass content validation." />
      ) : (
        <RoleCatalogue roles={cards} categories={ROLE_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))} />
      )}
    </div>
  );
}
