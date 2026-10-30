"use client";

import { CircleCheck, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { actions, useStore } from "@/lib/store";

export const projectKey = (slug: string) => `project:${slug}`;

export function ProjectDoneBadge({ slug }: { slug: string }) {
  const done = useStore((d) => Boolean(d.practice[projectKey(slug)]));
  return done ? <Badge tone="success">Done</Badge> : null;
}

export function ProjectDoneToggle({ slug }: { slug: string }) {
  const done = useStore((d) => Boolean(d.practice[projectKey(slug)]));
  return (
    <Button
      variant={done ? "secondary" : "primary"}
      onClick={() => (done ? actions.resetPractice(projectKey(slug)) : actions.completePractice(projectKey(slug)))}
    >
      {done ? <CircleCheck className="h-4 w-4 text-success" /> : <CircleDashed className="h-4 w-4" />}
      {done ? "Done (undo)" : "Mark as done"}
    </Button>
  );
}
