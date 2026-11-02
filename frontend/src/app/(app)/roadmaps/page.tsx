import { Map as MapIcon } from "lucide-react";
import type { Metadata } from "next";
import { HubHero } from "@/components/layout/hub-hero";
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
      <HubHero
        tone="plum"
        title="Testing Role Roadmaps"
        subtitle="Beginner-to-advanced paths for every major testing role. Each roadmap separates essential skills from role-specific and optional ones — roles really do differ."
        stats={[
          { value: roles.length, label: `of ${total} roles mapped` },
          { value: new Set(roles.map((r) => r.category)).size, label: "role families" },
          { value: cards.filter((c) => !c.codingRequired).length, label: "need no coding" },
        ]}
        actions={[
          { href: "/planner", label: "Build a study plan", primary: true },
          { href: "/learn", label: "Browse the Learning Center" },
        ]}
      />
      {cards.length === 0 ? (
        <EmptyState icon={MapIcon} title="Role roadmaps are being written" description="They will appear here as soon as they pass content validation." />
      ) : (
        <RoleCatalogue roles={cards} categories={ROLE_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))} />
      )}
    </div>
  );
}
