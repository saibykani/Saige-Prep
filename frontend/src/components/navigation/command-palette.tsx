"use client";

import { BookOpen, Briefcase, CornerDownLeft, FlaskConical, FolderGit2, LayoutGrid, MessagesSquare, Search, Wrench, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Kbd } from "@/components/ui/feedback";
import { useSearchIndex } from "@/features/search/use-search-index";
import { searchNav } from "@/lib/navigation";
import { KIND_LABEL, searchDocs, type SearchDoc, type SearchKind } from "@/lib/search";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<SearchKind, LucideIcon> = {
  lesson: BookOpen,
  role: Briefcase,
  interview: MessagesSquare,
  project: FolderGit2,
  tool: Wrench,
  practice: FlaskConical,
  section: LayoutGrid,
};

/** Global search (Ctrl/Cmd+K) over lessons, roles, interview questions, practice, projects, tools and sections. */
export function CommandPalette({
  open,
  onOpenChange,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listId = useId();
  const { data: docs, isPending } = useSearchIndex();

  const results: SearchDoc[] = useMemo(() => {
    if (docs) return searchDocs(docs, query, {}, 12);
    // Index not loaded yet: fall back to navigation sections.
    return searchNav(query, isAdmin).map((item) => ({
      id: item.href,
      kind: "section" as const,
      title: item.label,
      text: item.description,
      href: item.href,
      tags: [],
    }));
  }, [docs, query, isAdmin]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  function close() {
    setQuery("");
    setIndex(0);
    onOpenChange(false);
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
      className="mx-auto mt-[12vh] w-[min(94vw,620px)] rounded-xl border border-border bg-surface p-0 text-foreground shadow-2xl shadow-black/60 backdrop:bg-overlay"
    >
      {open && (
        <div>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-subtle" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setIndex((i) => Math.min(i + 1, results.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setIndex((i) => Math.max(i - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  if (results[index]) go(results[index].href);
                  else if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              placeholder="Search lessons, roles, interview questions, tools…"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[index] ? `${listId}-${index}` : undefined}
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle focus-visible:outline-none"
            />
            <Kbd>Esc</Kbd>
          </div>
          <ul id={listId} role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
            {results.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted">
                {isPending ? "Loading search index…" : <>Nothing matches “{query}”.</>}
              </li>
            )}
            {results.map((item, i) => {
              const Icon = KIND_ICON[item.kind];
              return (
                <li
                  key={item.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === index}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => go(item.href)}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2", i === index && "bg-surface-raised")}
                >
                  <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{item.title}</p>
                    <p className="truncate text-xs text-muted">
                      {KIND_LABEL[item.kind]} · {item.text}
                    </p>
                  </div>
                  {i === index && <CornerDownLeft className="h-3.5 w-3.5 text-subtle" aria-hidden />}
                </li>
              );
            })}
          </ul>
          {query.trim() && (
            <button
              type="button"
              onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
              className="w-full border-t border-border px-4 py-2.5 text-left text-xs text-muted hover:bg-surface-raised hover:text-foreground"
            >
              See all results with filters →
            </button>
          )}
        </div>
      )}
    </dialog>
  );
}
