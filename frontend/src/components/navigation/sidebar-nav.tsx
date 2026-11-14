"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { activeChain, NAV_GROUPS, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Open = Record<string, boolean>;

function NavLink({
  item,
  pathname,
  chain,
  nested,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  chain: Set<string>;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  const exact = pathname === item.href;
  const inBranch = chain.has(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      // "page" only on the page itself; "true" marks the section a deeper page belongs to.
      aria-current={exact ? "page" : inBranch ? "true" : undefined}
      className={cn(
        "nav-link group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors duration-200",
        nested && "py-1",
        inBranch ? "bg-accent-soft text-foreground" : "text-muted hover:bg-surface-raised hover:text-foreground",
      )}
    >
      {!nested && (
        <Icon
          className={cn("h-4 w-4 shrink-0", inBranch ? "text-accent" : "text-subtle group-hover:text-muted")}
          aria-hidden
        />
      )}
      <span className="truncate">{item.label}</span>
      {item.status === "planned" && (
        <Badge tone="neutral" className="ml-auto shrink-0">
          Planned
        </Badge>
      )}
    </Link>
  );
}

export function SidebarNav({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const chain = activeChain(pathname);
  const [collapsedGroups, setCollapsedGroups] = useState<Open>({});
  // Per-item override of "expanded"; by default the branch holding the current page is open.
  const [expanded, setExpanded] = useState<Open>({});

  return (
    <nav aria-label="Main" className="flex flex-col gap-4">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => isAdmin || !item.adminOnly);
        if (items.length === 0) return null;
        const isCollapsed = collapsedGroups[group.id] ?? false;
        const listId = `nav-group-${group.id}`;
        return (
          <div key={group.id}>
            <button
              type="button"
              aria-expanded={!isCollapsed}
              aria-controls={listId}
              onClick={() => setCollapsedGroups((state) => ({ ...state, [group.id]: !isCollapsed }))}
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
                const children = item.children ?? [];
                const subId = `nav-sub-${item.href.replaceAll("/", "-").replace(/^-/, "")}`;
                const isOpen = expanded[item.href] ?? chain.has(item.href);
                return (
                  <li key={item.href}>
                    <div className="flex items-center gap-0.5">
                      <NavLink item={item} pathname={pathname} chain={chain} onNavigate={onNavigate} />
                      {children.length > 0 && (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={subId}
                          aria-label={`${isOpen ? "Hide" : "Show"} ${item.label} sections`}
                          onClick={() => setExpanded((state) => ({ ...state, [item.href]: !isOpen }))}
                          className="flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-raised hover:text-foreground"
                        >
                          <ChevronDown
                            className={cn("h-3.5 w-3.5 transition-transform duration-150", !isOpen && "-rotate-90")}
                            aria-hidden
                          />
                        </button>
                      )}
                    </div>
                    {children.length > 0 && (
                      <ul id={subId} hidden={!isOpen} className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                        {children.map((child) => (
                          <li key={child.href} className="flex items-center">
                            <NavLink item={child} pathname={pathname} chain={chain} nested onNavigate={onNavigate} />
                          </li>
                        ))}
                      </ul>
                    )}
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
