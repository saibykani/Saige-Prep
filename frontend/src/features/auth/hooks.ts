"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { authRequired, GUEST_USER } from "@/lib/auth-mode";
import type { SessionResponse, User } from "@/types/api";

export const sessionKey = ["auth", "me"] as const;

export function useCurrentUser() {
  const required = authRequired();
  return useQuery({
    queryKey: sessionKey,
    queryFn: () => apiFetch<User>("/api/auth/me"),
    // Open mode: no session lookup; everyone browses as a guest.
    enabled: required,
    initialData: required ? undefined : GUEST_USER,
    // Fixed timestamp + "static" so the guest query never reads the clock during prerendering.
    initialDataUpdatedAt: required ? undefined : 0,
    retry: (count, error) => !(error instanceof ApiError && error.status === 401) && count < 2,
    staleTime: required ? 5 * 60 * 1000 : "static",
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiFetch<SessionResponse>("/api/auth/login", { json: credentials }),
    onSuccess: (session) => queryClient.setQueryData(sessionKey, session.user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => apiFetch<void>("/api/auth/logout", { method: "POST" }),
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}

/** Only allow same-site relative paths as post-login destinations (prevents open redirects). */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/dashboard";
  if (next.startsWith("/login")) return "/dashboard";
  return next;
}
