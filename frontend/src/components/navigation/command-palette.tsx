"use client";

import { CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Kbd } from "@/components/ui/feedback";
import { searchNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Global search (Ctrl/Cmd+K). Phase 1 searches sections; Phase 2 extends it to
 * lessons, roles, questions and projects via the backend search API.
 */
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
  const results = searchNav(query, isAdmin);

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
      className="mx-auto mt-[12vh] w-[min(94vw,560px)] rounded-xl border border-border bg-surface p-0 text-foreground shadow-2xl shadow-black/60 backdrop:bg-black/70"
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
                } else if (event.key === "Enter" && results[index]) {
                  event.preventDefault();
                  go(results[index].href);
                }
              }}
              placeholder="Search sections…"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[index] ? `${listId}-${index}` : undefined}
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle focus-visible:outline-none"
            />
            <Kbd>Esc</Kbd>
          </div>
          <ul id={listId} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
            {results.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted">No sections match “{query}”.</li>
            )}
            {results.map((item, i) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.href}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === index}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => go(item.href)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                    i === index ? "bg-surface-raised" : "",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="truncate text-xs text-muted">{item.description}</p>
                  </div>
                  {i === index && <CornerDownLeft className="h-3.5 w-3.5 text-subtle" aria-hidden />}
                </li>
              );
            })}
          </ul>
          <p className="border-t border-border px-4 py-2 text-[11px] text-subtle">
            Searches sections today. Lesson, role and question search arrives with the curriculum (Phase 2).
          </p>
        </div>
      )}
    </dialog>
  );
}
