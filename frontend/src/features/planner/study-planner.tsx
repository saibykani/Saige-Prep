"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { actions, useStore } from "@/lib/store";
import { generatePlan, type PlannerLesson, type PlannerRole } from "./plan";

const btn = "inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors";
const primary = `${btn} bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-40`;
const secondary = `${btn} border border-border bg-surface-raised hover:border-accent`;
const field = "h-10 w-full rounded-lg border border-border bg-surface-raised px-3 text-sm";

export function StudyPlanner({ roles, lessons }: { roles: PlannerRole[]; lessons: PlannerLesson[] }) {
  const profile = useStore((d) => d.profile);
  const plan = useStore((d) => d.plan);
  const lessonState = useStore((d) => d.lessons);
  const lessonMap = useMemo(() => new Map(lessons.map((l) => [l.slug, l])), [lessons]);

  const [roleSlug, setRoleSlug] = useState<string | null>(null);
  const [weeks, setWeeks] = useState(8);
  const [hours, setHours] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedRole = roleSlug ?? profile.targetRole ?? roles[0]?.slug ?? "";
  const selectedHours = hours ?? profile.weeklyHours;
  const role = roles.find((r) => r.slug === selectedRole);

  function generate() {
    if (!role) return;
    if (plan.tasks.length && !window.confirm("Replace your current plan with a new one?")) return;
    const completed = new Set(Object.entries(lessonState).filter(([, v]) => v.status === "completed").map(([k]) => k));
    const result = generatePlan(role, lessonMap, weeks, selectedHours, completed);
    actions.setProfile({ targetRole: role.slug, weeklyHours: selectedHours });
    actions.startPlan(result.tasks, weeks);
    const notes = [`${result.tasks.length} lessons planned for ${role.title}.`];
    if (result.overflow) notes.push(`${result.overflow} more did not fit; add weeks or hours to include them.`);
    if (result.unwritten) notes.push(`${result.unwritten} roadmap topics have no lesson written yet and were skipped.`);
    if (!result.tasks.length) notes.push("Nothing to schedule: every written lesson for this role is already complete or none exist yet.");
    setMessage(notes.join(" "));
  }

  const byWeek = new Map<number, typeof plan.tasks>();
  for (const t of plan.tasks) byWeek.set(t.week, [...(byWeek.get(t.week) ?? []), t]);
  const weekNumbers = [...byWeek.keys()].sort((a, b) => a - b);
  const done = plan.tasks.filter((t) => t.done).length;
  const planRole = roles.find((r) => r.slug === profile.targetRole);

  return (
    <div className="space-y-6">
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>Build a plan</CardTitle>
          <CardDescription>Only lessons that are actually written are scheduled. Completed lessons are skipped.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
            <label className="space-y-1 text-sm">
              <span className="text-muted">Target role</span>
              <select className={field} value={selectedRole} onChange={(e) => setRoleSlug(e.target.value)}>
                {roles.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted">Weeks</span>
              <input
                className={field}
                type="number"
                min={1}
                max={52}
                value={weeks}
                onChange={(e) => setWeeks(Math.min(52, Math.max(1, Number(e.target.value) || 1)))}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted">Hours / week</span>
              <input
                className={field}
                type="number"
                min={1}
                max={60}
                value={selectedHours}
                onChange={(e) => setHours(Math.min(60, Math.max(1, Number(e.target.value) || 1)))}
              />
            </label>
            <button type="button" className={primary} onClick={generate} disabled={!role}>
              Generate plan
            </button>
          </div>
          {message && (
            <p role="status" className="mt-4 text-sm text-muted">
              {message}
            </p>
          )}
        </CardContent>
      </Card>

      {plan.tasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted">
            No plan yet. Choose a role and generate one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                {planRole ? planRole.title : "Your plan"} · {done}/{plan.tasks.length} done
              </p>
              <div className="mt-2 h-2 w-56 max-w-full overflow-hidden rounded-full bg-surface-raised">
                <div className="h-full bg-accent" style={{ width: `${(done / plan.tasks.length) * 100}%` }} />
              </div>
            </div>
            <button
              type="button"
              className={secondary}
              onClick={() => {
                if (window.confirm("Delete the whole plan?")) {
                  actions.resetPlan();
                  setMessage(null);
                }
              }}
            >
              Reset plan
            </button>
          </div>
          {weekNumbers.map((w) => {
            const tasks = byWeek.get(w) ?? [];
            return (
              <Card key={w}>
                <CardHeader>
                  <CardTitle>Week {w}</CardTitle>
                  <CardDescription>
                    {tasks.filter((t) => t.done).length}/{tasks.length} done
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 py-2">
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--color-accent)]"
                          checked={t.done}
                          onChange={() => actions.toggleTask(t.id)}
                          aria-label={`Mark ${t.title} done`}
                        />
                        <span className={`min-w-0 flex-1 text-sm ${t.done ? "text-muted line-through" : ""}`}>
                          {t.href ? (
                            <Link href={t.href} className="hover:text-accent">
                              {t.title}
                            </Link>
                          ) : (
                            t.title
                          )}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-muted hover:text-foreground"
                          onClick={() => actions.removeTask(t.id)}
                          aria-label={`Remove ${t.title}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
