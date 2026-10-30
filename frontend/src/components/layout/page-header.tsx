import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="hero-surface relative mb-8 flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-6 shadow-soft animate-fade-in sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-8">
      <div className="space-y-2.5">
        {eyebrow && <div>{eyebrow}</div>}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[32px] sm:leading-tight">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
