"use client";

import { Bookmark, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { actions, useStore } from "@/lib/store";

const KIND_LABEL: Record<string, string> = {
  lesson: "Lesson",
  role: "Role",
  question: "Question",
  project: "Project",
  tool: "Tool",
  interview: "Interview",
};

export function BookmarksView() {
  const bookmarks = useStore((d) => d.bookmarks);
  return (
    <div className="animate-fade-in">
      <PageHeader title="Bookmarks" description="Lessons, roles, projects and tools you saved for later. Stored in this browser." />
      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Use the Bookmark button on any lesson, role roadmap or project to save it here."
          action={
            <Link href="/learn" className="text-sm text-accent hover:underline">
              Browse the Learning Center →
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {bookmarks.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-4 py-3">
              <Badge tone="accent">{KIND_LABEL[b.kind] ?? b.kind}</Badge>
              <Link href={b.href} className="min-w-0 flex-1 truncate text-sm hover:text-accent">
                {b.title}
              </Link>
              <span className="hidden text-xs text-subtle sm:inline">{new Date(b.addedAt).toLocaleDateString()}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove bookmark ${b.title}`}
                onClick={() => actions.toggleBookmark({ id: b.id, kind: b.kind, title: b.title, href: b.href })}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
