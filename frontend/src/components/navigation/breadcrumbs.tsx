"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { findNavItem } from "@/lib/navigation";

/** Acronyms that appear in URL slugs and should keep their capitals in labels. */
const ACRONYMS: Record<string, string> = {
  ...Object.fromEntries(
    ["ai", "ml", "llm", "llms", "rag", "api", "apis", "sql", "ui", "ux", "qa", "ci", "cd", "etl", "http", "rest", "json", "xml", "jwt", "sdet", "bdd", "tdd", "iot", "erp", "wcag", "owasp", "aws", "nist", "eu", "pom"].map((w) => [w, w.toUpperCase()]),
  ),
  ios: "iOS",
  mlops: "MLOps",
};

function titleCase(segment: string) {
  return segment
    .split("-")
    .map((w) => ACRONYMS[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function buildCrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    return { href, label: findNavItem(href)?.label ?? titleCase(decodeURIComponent(segment)) };
  });
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1 text-sm text-muted">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />}
              {last ? (
                <span aria-current="page" className="truncate text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="truncate hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
