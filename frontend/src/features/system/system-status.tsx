"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, Database, Server, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { ApiError, apiFetch } from "@/lib/api";
import type { HealthResponse, ReadinessResponse } from "@/types/api";

async function fetchReadiness(): Promise<ReadinessResponse> {
  try {
    return await apiFetch<ReadinessResponse>("/backend/ready");
  } catch (error) {
    // 503 still carries a structured body describing which check failed.
    if (error instanceof ApiError && error.status === 503 && error.details) return error.details as ReadinessResponse;
    throw error;
  }
}

function Row({ icon: Icon, label, ok, detail }: { icon: typeof Server; label: string; ok: boolean; detail: string }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-subtle" aria-hidden />
      <span className="flex-1 text-sm text-foreground">{label}</span>
      <span className={`flex items-center gap-1.5 text-xs ${ok ? "text-success" : "text-danger"}`}>
        {ok ? <CircleCheck className="h-3.5 w-3.5" aria-hidden /> : <CircleAlert className="h-3.5 w-3.5" aria-hidden />}
        {detail}
      </span>
    </li>
  );
}

export function SystemStatus() {
  const health = useQuery({ queryKey: ["system", "health"], queryFn: () => apiFetch<HealthResponse>("/backend/health") });
  const ready = useQuery({ queryKey: ["system", "ready"], queryFn: fetchReadiness });
  const mongo = ready.data?.checks.find((check) => check.name === "mongodb");

  return (
    <Card>
      <CardHeader>
        <CardTitle>System status</CardTitle>
        <CardDescription>Live checks against the backend.</CardDescription>
      </CardHeader>
      <CardContent>
        {health.isPending || ready.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : (
          <ul className="divide-y divide-border" aria-label="System checks">
            <Row
              icon={Server}
              label="API server"
              ok={health.isSuccess}
              detail={health.isSuccess ? `v${health.data.version}` : "Unreachable"}
            />
            <Row
              icon={Database}
              label="Database"
              ok={!!mongo?.ok}
              detail={mongo?.ok ? "Connected" : ready.isError ? "Unknown" : "Unavailable"}
            />
            <Row
              icon={Sparkles}
              label="AI assistance (optional)"
              ok
              detail={ready.data?.ai_enabled ? "Enabled" : "Off — curated mode"}
            />
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
