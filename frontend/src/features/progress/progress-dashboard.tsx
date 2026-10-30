"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { accuracyByTopic, accuracyOverTime, activityByDay, dayKey, rubricAverages, shiftDay, streaks } from "./stats";

export interface TrackInfo {
  slug: string;
  title: string;
  href: string;
  topics: number;
  lessonSlugs: string[];
}

const RUBRIC_LABELS: Record<string, string> = {
  correctness: "Correctness",
  depth: "Depth",
  problemSolving: "Problem solving",
  communication: "Communication",
};
const HEATMAP_WEEKS = 18;

const noop = () => () => {};
/** Today's local day key, read on the client only (null during server render). */
function useToday(): string | null {
  return useSyncExternalStore(
    noop,
    () => dayKey(new Date()),
    () => null,
  );
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-4 text-sm text-muted">{children}</p>;
}

function Bar({ value, label, detail }: { value: number; label: ReactNode; detail: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-sm">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 text-muted">{detail}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="lift">
      <CardContent className="py-4">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-accent">{value}</p>
      </CardContent>
    </Card>
  );
}

export function ProgressDashboard({ tracks }: { tracks: TrackInfo[] }) {
  const lessons = useStore((d) => d.lessons);
  const assessments = useStore((d) => d.assessments);
  const interviews = useStore((d) => d.interviews);
  const practice = useStore((d) => d.practice);
  const activity = useStore((d) => d.activity);
  const today = useToday();

  const days = useMemo(() => activityByDay(activity), [activity]);
  const streak = today ? streaks(days, today) : { current: 0, longest: 0 };
  const timeline = useMemo(() => accuracyOverTime(assessments), [assessments]);
  const topics = useMemo(() => accuracyByTopic(assessments), [assessments]);
  const rubric = useMemo(() => rubricAverages(interviews), [interviews]);

  const completedCount = Object.values(lessons).filter((l) => l.status === "completed").length;
  // Practice keys are "<lab>:<exercise>"; "project:" keys belong to Projects, not labs.
  const labCounts = new Map<string, { count: number; last: string }>();
  for (const [key, p] of Object.entries(practice)) {
    const lab = key.split(":")[0];
    if (lab === "project") continue;
    const e = labCounts.get(lab) ?? { count: 0, last: "" };
    labCounts.set(lab, { count: e.count + 1, last: p.completedAt > e.last ? p.completedAt : e.last });
  }
  const practiceEntries = [...labCounts.entries()].sort((a, b) => b[1].last.localeCompare(a[1].last));
  const exercisesDone = practiceEntries.reduce((sum, [, e]) => sum + e.count, 0);

  // Heatmap: columns are weeks (Sunday first), ending with the current week.
  const heatmap: { key: string; count: number; future: boolean }[][] = [];
  if (today) {
    const [y, m, d] = today.split("-").map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    const start = shiftDay(today, -(weekday + (HEATMAP_WEEKS - 1) * 7));
    for (let w = 0; w < HEATMAP_WEEKS; w++) {
      const col = [];
      for (let i = 0; i < 7; i++) {
        const key = shiftDay(start, w * 7 + i);
        col.push({ key, count: days.get(key) ?? 0, future: key > today });
      }
      heatmap.push(col);
    }
  }
  const maxDay = Math.max(1, ...heatmap.flat().map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 animate-slide-up">
        <Stat label="Lessons completed" value={String(completedCount)} />
        <Stat label="Mock tests taken" value={String(assessments.length)} />
        <Stat label="Interviews done" value={String(interviews.length)} />
        <Stat label="Current streak" value={`${streak.current} day${streak.current === 1 ? "" : "s"}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>
            Last {HEATMAP_WEEKS} weeks · longest streak {streak.longest} day{streak.longest === 1 ? "" : "s"} · {activity.length} recorded
            actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <Empty>No activity yet. Open a lesson, take a quiz or finish a lab and it will show up here.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-1" role="img" aria-label={`Activity heatmap, ${days.size} active days`}>
                {heatmap.map((col, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    {col.map((c) => (
                      <div
                        key={c.key}
                        title={c.future ? undefined : `${c.key}: ${c.count} action${c.count === 1 ? "" : "s"}`}
                        className={`size-3 rounded-sm ${c.future ? "opacity-0" : c.count ? "bg-accent" : "bg-surface-raised"}`}
                        style={c.count ? { opacity: 0.3 + 0.7 * (c.count / maxDay) } : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lessons by track</CardTitle>
          <CardDescription>Completed out of written lessons. Topics without a lesson yet are not counted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tracks.map((t) => {
            const done = t.lessonSlugs.filter((s) => lessons[s]?.status === "completed").length;
            return (
              <Bar
                key={t.slug}
                value={t.lessonSlugs.length ? done / t.lessonSlugs.length : 0}
                label={
                  <Link href={t.href} className="hover:text-accent">
                    {t.title}
                  </Link>
                }
                detail={t.lessonSlugs.length ? `${done}/${t.lessonSlugs.length}` : "no lessons yet"}
              />
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mock test accuracy over time</CardTitle>
            <CardDescription>Share of questions answered correctly per attempt.</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <Empty>
                No mock tests yet. <Link href="/mock-tests" className="text-accent">Take one</Link> to see your trend.
              </Empty>
            ) : (
              <AccuracyChart points={timeline} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy by topic</CardTitle>
            <CardDescription>Across all mock test attempts, weakest first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topics.length === 0 ? (
              <Empty>Topic accuracy appears after your first mock test.</Empty>
            ) : (
              topics.slice(0, 10).map((t) => (
                <Bar key={t.topic} value={t.correct / t.total} label={t.topic} detail={`${t.correct}/${t.total} · ${pct(t.correct / t.total)}`} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview self-ratings</CardTitle>
            <CardDescription>Average of your own rubric scores (1 to 4).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rubric.length === 0 ? (
              <Empty>
                No rated interview answers yet. <Link href="/interviews" className="text-accent">Try a mock interview</Link>.
              </Empty>
            ) : (
              rubric.map((r) => (
                <Bar
                  key={r.dimension}
                  value={r.average / 4}
                  label={RUBRIC_LABELS[r.dimension] ?? r.dimension}
                  detail={`${r.average.toFixed(1)} / 4 · ${r.count} rated`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice lab exercises</CardTitle>
            <CardDescription>
              {exercisesDone} exercise{exercisesDone === 1 ? "" : "s"} completed across {practiceEntries.length} lab
              {practiceEntries.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {practiceEntries.length === 0 ? (
              <Empty>
                No labs completed yet. <Link href="/practice" className="text-accent">Open the Practice Lab</Link>.
              </Empty>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {practiceEntries.map(([lab, e]) => (
                  <li key={lab} className="flex justify-between gap-2 py-2">
                    <span className="min-w-0 truncate">{lab.replace(/-/g, " ")}</span>
                    <span className="shrink-0 text-muted">
                      {e.count} done · last {e.last.slice(0, 10)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccuracyChart({ points }: { points: { id: string; title: string; at: string; accuracy: number }[] }) {
  const w = 320;
  const h = 140;
  const pad = 16;
  const x = (i: number) => (points.length === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (points.length - 1));
  const y = (v: number) => h - pad - v * (h - 2 * pad);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.accuracy)}`).join(" ");
  const last = points[points.length - 1];
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`Accuracy over ${points.length} attempts, latest ${pct(last.accuracy)}`}>
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line x1={pad} x2={w - pad} y1={y(g)} y2={y(g)} className="stroke-border" strokeDasharray="2 3" />
            <text x={0} y={y(g) + 3} className="fill-muted" fontSize="8">
              {pct(g)}
            </text>
          </g>
        ))}
        <path d={path} fill="none" className="stroke-accent" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={p.id} cx={x(i)} cy={y(p.accuracy)} r="3" className="fill-accent">
            <title>{`${p.title} · ${p.at.slice(0, 10)} · ${pct(p.accuracy)}`}</title>
          </circle>
        ))}
      </svg>
      <p className="mt-2 text-xs text-muted">
        {points.length} attempt{points.length === 1 ? "" : "s"} · latest {pct(last.accuracy)} ({last.title})
      </p>
    </div>
  );
}
