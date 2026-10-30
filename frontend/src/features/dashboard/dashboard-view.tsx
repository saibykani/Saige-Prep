"use client";

import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleDashed,
  FlaskConical,
  History,
  MessagesSquare,
  Timer,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { useCurrentUser } from "@/features/auth/hooks";
import { isGuest } from "@/lib/auth-mode";
import { useStore, type ActivityKind } from "@/lib/store";

interface NextStep {
  label: string;
  detail: string;
  href: string;
  done: boolean;
}

const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  "lesson-viewed": "Viewed lesson",
  "lesson-completed": "Completed lesson",
  quiz: "Answered a lesson quiz",
  assessment: "Finished a mock test",
  interview: "Finished a mock interview",
  practice: "Completed a practice exercise",
  task: "Ticked off a plan task",
};

const QUICK_LINKS: { href: string; label: string; detail: string; icon: LucideIcon }[] = [
  { href: "/learn", label: "Learning Center", detail: "Every track and lesson", icon: BookOpen },
  { href: "/practice", label: "Practice Lab", detail: "SQL, API, test design and more", icon: FlaskConical },
  { href: "/mock-tests", label: "Mock Tests", detail: "Timed, with topic-wise results", icon: Timer },
  { href: "/interviews", label: "Interview Prep", detail: "15, 30 or 60-minute interviews", icon: MessagesSquare },
];

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Turns a lesson slug like "jmeter-thread-groups" into "Jmeter thread groups". */
function prettyRef(ref: string) {
  const text = ref.replace(/^project:/, "").replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function DashboardView() {
  const { data: user } = useCurrentUser();
  const data = useStore((d) => d);

  const completedLessons = Object.values(data.lessons).filter((l) => l.status === "completed").length;
  const practiceDone = Object.keys(data.practice).filter((k) => !k.startsWith("project:")).length;
  const steps: NextStep[] = [
    {
      label: "Pick a target role",
      detail: "Choose from 80 testing role roadmaps, then build a study plan for it.",
      href: data.profile.targetRole ? "/planner" : "/roadmaps",
      done: Boolean(data.profile.targetRole) || data.plan.tasks.length > 0,
    },
    {
      label: "Complete your first lesson",
      detail: "Start with Manual Testing fundamentals.",
      href: "/learn/manual-testing",
      done: completedLessons > 0,
    },
    {
      label: "Solve a practice exercise",
      detail: "Hands-on SQL, API, test design and performance labs.",
      href: "/practice",
      done: practiceDone > 0,
    },
    {
      label: "Take a baseline mock test",
      detail: "Find your strong and weak topics.",
      href: "/mock-tests",
      done: data.assessments.length > 0,
    },
    {
      label: "Try a mock interview",
      detail: "Answer, compare with a model answer and rate yourself.",
      href: "/interviews",
      done: data.interviews.length > 0,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const recent = [...data.activity].reverse().slice(0, 8);

  const stats = [
    { label: "Lessons completed", value: completedLessons },
    { label: "Practice exercises", value: practiceDone },
    { label: "Mock tests taken", value: data.assessments.length },
    { label: "Interviews done", value: data.interviews.length },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${greeting()}${user && !isGuest(user) ? `, ${user.display_name}` : ""}`}
        description="Learn. Practice. Test. Get Hired. Your progress here is based only on what you actually complete."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-5">
              <p className="text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>
                {doneCount === steps.length
                  ? "All done. Keep going with your study plan."
                  : `${doneCount} of ${steps.length} done. Each step ticks itself off as you complete it.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="divide-y divide-border">
                {steps.map((step) => (
                  <li key={step.label}>
                    <Link
                      href={step.href}
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-raised"
                    >
                      {step.done ? (
                        <CircleCheck className="h-5 w-5 shrink-0 text-success" aria-label="Done" />
                      ) : (
                        <CircleDashed className="h-5 w-5 shrink-0 text-subtle" aria-label="Not started" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${step.done ? "text-muted line-through decoration-subtle" : "text-foreground"}`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted">{step.detail}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-subtle" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {recent.length === 0 ? (
            <EmptyState
              icon={History}
              title="No learning activity yet"
              description="Lessons, quizzes, tests and interviews you complete will appear here. Nothing is pre-filled."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>
                  Saved in this browser. <Link href="/progress" className="text-accent hover:underline">See full progress</Link>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border text-sm">
                  {recent.map((a) => (
                    <li key={`${a.at}-${a.ref}`} className="flex flex-wrap justify-between gap-2 py-2.5">
                      <span>
                        {ACTIVITY_LABELS[a.kind]}
                        {a.kind.startsWith("lesson") && <span className="text-muted">: {prettyRef(a.ref)}</span>}
                      </span>
                      <span className="text-muted">{new Date(a.at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Jump back in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_LINKS.map(({ href, label, detail, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="lift flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-accent"
              >
                <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted">{detail}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
