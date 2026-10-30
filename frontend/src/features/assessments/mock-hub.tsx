"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export interface BankSummary {
  bank: string;
  title: string;
  count: number;
}

export function MockHub({ banks }: { banks: BankSummary[] }) {
  const attempts = useStore((d) => d.assessments);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {banks.map((b) => {
          const mine = attempts.filter((a) => a.banks.includes(b.bank));
          const best = mine.reduce((m, a) => Math.max(m, a.maxScore ? a.score / a.maxScore : 0), 0);
          return (
            <Link key={b.bank} href={`/mock-tests/${b.bank}`} className="lift block">
              <Card className="h-full transition-colors hover:border-accent">
                <CardHeader>
                  <CardTitle>{b.title}</CardTitle>
                  <CardDescription>{b.count} questions · timed, with flags and topic-wise review</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted">
                  {mine.length
                    ? `${mine.length} attempt${mine.length > 1 ? "s" : ""} · best ${Math.round(best * 100)}%`
                    : "Not attempted yet"}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Your attempts</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-muted">No attempts yet. Results are saved in this browser only.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
            {attempts.slice(0, 20).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-medium">{a.title}</span>
                <span className="text-muted">
                  {a.score}/{a.maxScore} · {Math.round(a.durationSeconds / 60)} min ·{" "}
                  {new Date(a.submittedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
