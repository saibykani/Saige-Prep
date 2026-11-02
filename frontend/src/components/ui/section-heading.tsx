import type { ReactNode } from "react";

/** Section title with an animated accent underline and optional trailing action. */
export function SectionHeading({ id, title, description, action }: { id?: string; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="section-title text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
