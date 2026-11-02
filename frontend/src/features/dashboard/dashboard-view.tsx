"use client";

import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleDashed,
  Clock,
  PlayCircle,
  FlaskConical,
  GraduationCap,
  History,
  MessagesSquare,
  Timer,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { CinematicHero } from "./cinematic-hero";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { CourseThumb } from "@/components/ui/course-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CountUp } from "@/components/ui/count-up";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { useCurrentUser } from "@/features/auth/hooks";
import { isGuest } from "@/lib/auth-mode";
import { useStore, type ActivityKind, type StoreData } from "@/lib/store";
import { cn } from "@/lib/utils";

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

export interface LessonRef {
  title: string;
  href: string;
  track: string;
  trackTitle: string;
  duration: number;
  level: string;
}

/** Horizontal, scroll-snapping row of the learner's real in-progress lessons (most recent first). */
function ContinueLearningRow({ lessons, index }: { lessons: StoreData["lessons"]; index: Record<string, LessonRef> }) {
  const items = Object.entries(lessons)
    .filter(([slug, p]) => p.status === "in-progress" && index[slug])
    .sort(([, a], [, b]) => b.lastViewedAt.localeCompare(a.lastViewedAt))
    .slice(0, 10)
    .map(([slug]) => ({ slug, ...index[slug] }));

  return (
    <Reveal as="section" className="mb-8" aria-labelledby="continue-learning">
      <SectionHeading
        id="continue-learning"
        title="Continue learning"
        description={items.length ? "Lessons you have opened but not marked complete, most recent first." : undefined}
      />
      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border-strong bg-surface/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Nothing in progress yet</p>
            <p className="text-sm text-muted">Lessons you open will line up here so you can pick up where you left off.</p>
          </div>
          <Link
            href="/learn/manual-testing"
            className="ripple press-fx inline-flex h-10 shrink-0 items-center gap-2 overflow-hidden rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            Open your first lesson <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <ul className="snap-row -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          {items.map((item, i) => (
            <li key={item.slug} className={cn("w-[78%] max-w-[300px] shrink-0 sm:w-[280px]", i === 0 && "featured-ring rounded-2xl")}>
              <Link href={item.href} className="course-card group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                <CourseThumb themeKey={item.track} size="sm">
                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-[#1f1147]">
                    {item.level}
                  </span>
                </CourseThumb>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="text-xs font-medium text-accent">{item.trackTitle}</p>
                  <p className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</p>
                  <div className="mt-auto flex items-center justify-between pt-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden /> {item.duration} min
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none">
                      <PlayCircle className="h-4 w-4 text-accent" aria-hidden /> Resume
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  );
}

export function DashboardView({
  lessonIndex,
  content,
}: {
  lessonIndex: Record<string, LessonRef>;
  content: { tracks: number; lessons: number; hours: number };
}) {
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
    { label: "Lessons completed", value: completedLessons, icon: GraduationCap },
    { label: "Practice exercises", value: practiceDone, icon: FlaskConical },
    { label: "Mock tests taken", value: data.assessments.length, icon: Timer },
    { label: "Interviews done", value: data.interviews.length, icon: MessagesSquare },
  ];
  const stepPct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="animate-fade-in">
      <CinematicHero
        title={`${greeting()}${user && !isGuest(user) ? `, ${user.display_name}` : ""}`}
        readiness={{ done: doneCount, total: steps.length }}
        nextStep={steps.find((s) => !s.done)}
        activity={data.activity}
        content={content}
      />

      <div className="stagger mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="spotlight lift group overflow-hidden">
            <CardContent className="flex items-start justify-between gap-3 pt-5 sm:pt-5">
              <div>
                <p className="text-3xl font-semibold tracking-tight">
                  <CountUp value={value} />
                </p>
                <p className="text-sm text-muted">{label}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transform-none">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <ContinueLearningRow lessons={data.lessons} index={lessonIndex} />

      <Reveal className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="spotlight">
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>
                {doneCount === steps.length
                  ? "All done. Keep going with your study plan."
                  : `${doneCount} of ${steps.length} done. Each step ticks itself off as you complete it.`}
              </CardDescription>
              <ProgressMeter className="mt-2" value={stepPct / 100} label="Next steps completed" showLabel={false} />
            </CardHeader>
            <CardContent>
              <ol className="divide-y divide-border">
                {steps.map((step) => (
                  <li key={step.label}>
                    <Link
                      href={step.href}
                      className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-raised"
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
                      <ArrowRight className="h-4 w-4 text-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transform-none" aria-hidden />
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

        <Card className="spotlight self-start">
          <CardHeader>
            <CardTitle>Jump back in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_LINKS.map(({ href, label, detail, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="lift group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-accent"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
                  <Icon className="h-[18px] w-[18px] text-accent" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted">{detail}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
