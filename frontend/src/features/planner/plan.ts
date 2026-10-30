/** Pure study-plan generation (no store, no clock), so it is unit-testable. */

export interface PlannerLesson {
  slug: string;
  title: string;
  href: string;
  minutes: number;
}

export interface PlannerRole {
  slug: string;
  title: string;
  /** Topic slugs in roadmap order: beginner, then intermediate, then advanced. */
  stages: { title: string; topics: string[] }[];
}

export interface GeneratedTask {
  title: string;
  href: string;
  week: number;
  source: "roadmap";
}

export interface GeneratedPlan {
  tasks: GeneratedTask[];
  /** Roadmap lessons that did not fit the time budget. */
  overflow: number;
  /** Roadmap topics with no written lesson yet (skipped honestly). */
  unwritten: number;
}

/**
 * Lays the role's roadmap lessons out week by week, filling each week up to
 * hoursPerWeek. A lesson longer than a whole week still gets a week of its own.
 * Already-completed lessons are skipped.
 */
export function generatePlan(
  role: PlannerRole,
  lessons: Map<string, PlannerLesson>,
  weeks: number,
  hoursPerWeek: number,
  completed: Set<string> = new Set(),
): GeneratedPlan {
  const seen = new Set<string>();
  const queue: PlannerLesson[] = [];
  let unwritten = 0;
  for (const stage of role.stages) {
    for (const slug of stage.topics) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      const lesson = lessons.get(slug);
      if (!lesson) unwritten++;
      else if (!completed.has(slug)) queue.push(lesson);
    }
  }

  const budget = Math.max(1, hoursPerWeek) * 60;
  const tasks: GeneratedTask[] = [];
  let week = 1;
  let used = 0;
  let i = 0;
  while (i < queue.length && week <= weeks) {
    const lesson = queue[i];
    if (used > 0 && used + lesson.minutes > budget) {
      week++;
      used = 0;
      continue;
    }
    tasks.push({ title: lesson.title, href: lesson.href, week, source: "roadmap" });
    used += lesson.minutes;
    i++;
  }
  return { tasks, overflow: queue.length - i, unwritten };
}
