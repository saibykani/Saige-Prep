"use client";

import { LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore, ViewTransition, type ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { CommandPalette } from "@/components/navigation/command-palette";
import { MobileDrawer } from "@/components/navigation/mobile-drawer";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, Kbd, Spinner } from "@/components/ui/feedback";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCurrentUser, useLogout } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api";
import { isGuest } from "@/lib/auth-mode";
import { useSpotlight } from "@/lib/use-spotlight";

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

  useSpotlight();

  const closeDrawer = useCallback(() => setMobileOpen(false), []);

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
    <div className="relative flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <aside className="glass sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 lg:flex">
        <div className="flex h-14 items-center border-b border-border px-3">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav isAdmin={isAdmin} />
        </div>
      </aside>

      <MobileDrawer
        open={mobileOpen}
        onClose={closeDrawer}
        brand={<Brand />}
        footer={<ThemeToggle showLabels className="w-full justify-between" />}
      >
        <SidebarNav isAdmin={isAdmin} onNavigate={closeDrawer} />
      </MobileDrawer>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 glass border-b border-border/70 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
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
              className="flex h-9 w-full max-w-64 items-center gap-2 rounded-lg border border-border bg-surface/70 px-3 text-sm text-subtle transition-[color,border-color,box-shadow] duration-200 hover:border-border-strong hover:text-muted hover:shadow-card sm:w-56"
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
              <Badge tone="accent" className="shrink-0 whitespace-nowrap" title="Login is turned off; the portal opens directly">
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
          <ViewTransition default="page">{children}</ViewTransition>
        </main>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} isAdmin={isAdmin} />
    </div>
  );
}
