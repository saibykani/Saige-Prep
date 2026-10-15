"use client";

import { ArrowRight, CircleCheck, CircleDashed, History } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { useCurrentUser } from "@/features/auth/hooks";
import { SystemStatus } from "@/features/system/system-status";

interface NextStep {
  label: string;
  detail: string;
  href?: string;
  done: boolean;
  phase?: number;
}

const NEXT_STEPS: NextStep[] = [
  { label: "Secure your owner account", detail: "Signed in with a private, bootstrapped account.", done: true },
  {
    label: "Pick a target role",
    detail: "Choose from 70+ testing role roadmaps.",
    href: "/roadmaps",
    done: false,
    phase: 2,
  },
  {
    label: "Start the Manual Testing path",
    detail: "Fundamentals, test design techniques and documentation.",
    href: "/learn/manual-testing",
    done: false,
    phase: 2,
  },
  {
    label: "Take a baseline mock test",
    detail: "Find your strong and weak topics.",
    href: "/mock-tests",
    done: false,
    phase: 4,
  },
];

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView() {
  const { data: user } = useCurrentUser();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${greeting()}${user ? `, ${user.display_name}` : ""}`}
        description="Learn. Practice. Test. Get Hired. Your progress here is based only on what you actually complete."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>Your path through the platform as it is built out.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="divide-y divide-border">
                {NEXT_STEPS.map((step) => {
                  const content = (
                    <>
                      {step.done ? (
                        <CircleCheck className="h-5 w-5 shrink-0 text-success" aria-label="Done" />
                      ) : (
                        <CircleDashed className="h-5 w-5 shrink-0 text-subtle" aria-label="Not started" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${step.done ? "text-muted line-through decoration-subtle" : "text-foreground"}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted">{step.detail}</p>
                      </div>
                      {step.phase && <Badge tone="warning">Phase {step.phase}</Badge>}
                      {step.href && <ArrowRight className="h-4 w-4 text-subtle" aria-hidden />}
                    </>
                  );
                  return (
                    <li key={step.label}>
                      {step.href ? (
                        <Link href={step.href} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-surface-raised">
                          {content}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 py-3">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <EmptyState
            icon={History}
            title="No learning activity yet"
            description="Recently viewed lessons, quiz results and interview scores will appear here as you use the platform. Nothing is pre-filled."
          />
        </div>

        <SystemStatus />
      </div>
    </div>
  );
}
