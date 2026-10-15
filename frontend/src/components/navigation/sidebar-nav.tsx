"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { activeNavItem, NAV_GROUPS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = activeNavItem(pathname);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex flex-col gap-4">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => isAdmin || !item.adminOnly);
        if (items.length === 0) return null;
        const isCollapsed = collapsed[group.id] ?? false;
        const listId = `nav-group-${group.id}`;
        return (
          <div key={group.id}>
            <button
              type="button"
              aria-expanded={!isCollapsed}
              aria-controls={listId}
              onClick={() => setCollapsed((state) => ({ ...state, [group.id]: !isCollapsed }))}
              className="flex w-full items-center justify-between rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-subtle transition-colors hover:text-muted"
            >
              {group.label}
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform duration-150", isCollapsed && "-rotate-90")}
                aria-hidden
              />
            </button>
            <ul id={listId} hidden={isCollapsed} className="mt-1 space-y-0.5">
              {items.map((item) => {
                const isActive = active?.href === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-accent-soft text-foreground"
                          : "text-muted hover:bg-surface-raised hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4 shrink-0", isActive ? "text-accent" : "text-subtle group-hover:text-muted")}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
