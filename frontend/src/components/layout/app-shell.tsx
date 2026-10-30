"use client";

import { LogOut, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { CommandPalette } from "@/components/navigation/command-palette";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, Kbd, Spinner } from "@/components/ui/feedback";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api";
import { isGuest } from "@/lib/auth-mode";

const subscribeNoop = () => () => {};

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2">
      <BrandMark />
      <span className="text-sm font-semibold tracking-tight">Saige-Prep</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, error, isPending, refetch } = useCurrentUser();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const unauthorized = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (unauthorized) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [unauthorized, pathname, router]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Private pages render in the browser only; the prerendered shell is this loading state.
  if (!mounted || isPending || unauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading Saige-Prep" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
        <Alert tone="error" title="Saige-Prep could not load your session">
          {error?.message ?? "Unknown error"}
        </Alert>
        <Button variant="secondary" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-14 items-center border-b border-border px-3">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav isAdmin={isAdmin} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-fade-in relative flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-background">
            <div className="flex h-14 items-center justify-between border-b border-border px-3">
              <Brand />
              <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SidebarNav isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border px-3 py-3">
              <ThemeToggle showLabels className="w-full justify-between" />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" aria-hidden />
          </Button>
          <div className="hidden min-w-0 flex-1 sm:block">
            <Breadcrumbs />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-full max-w-64 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-subtle transition-colors hover:border-border-strong hover:text-muted sm:w-56"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="flex-1 text-left">Search…</span>
              <Kbd>Ctrl K</Kbd>
            </button>
            <ThemeToggle className="hidden sm:inline-flex" />
            <span className="hidden text-sm text-muted md:inline" data-testid="current-user">
              {user.display_name}
            </span>
            {isGuest(user) ? (
              <Badge tone="accent" title="Login is turned off; the portal opens directly">
                Open access
              </Badge>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
                loading={logout.isPending}
                onClick={() => logout.mutate()}
              >
                {!logout.isPending && <LogOut className="h-4 w-4" aria-hidden />}
              </Button>
            )}
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} isAdmin={isAdmin} />
    </div>
  );
}
