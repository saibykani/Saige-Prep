"use client";

import type { ReactNode } from "react";
import { Alert } from "@/components/ui/feedback";
import { useCurrentUser } from "./hooks";

/** UI-level gate only. Every privileged backend endpoint enforces the admin role itself. */
export function AdminGate({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();
  if (user?.role !== "admin") {
    return (
      <Alert tone="error" title="Administrator access required">
        This area is restricted to the owner account.
      </Alert>
    );
  }
  return <>{children}</>;
}
