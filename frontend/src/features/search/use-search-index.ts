"use client";

import { useQuery } from "@tanstack/react-query";
import type { SearchDoc } from "@/lib/search";

/** Loads the static search index once per session. */
export function useSearchIndex() {
  return useQuery({
    queryKey: ["search-index"],
    queryFn: async () => {
      const res = await fetch("/search-index.json");
      if (!res.ok) throw new Error("Search index unavailable");
      return (await res.json()) as SearchDoc[];
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
