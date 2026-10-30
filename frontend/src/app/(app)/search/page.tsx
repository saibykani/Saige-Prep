import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/feedback";
import { SearchView } from "@/features/search/search-view";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    // useSearchParams is request-time data, so it sits behind Suspense.
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SearchView />
    </Suspense>
  );
}
