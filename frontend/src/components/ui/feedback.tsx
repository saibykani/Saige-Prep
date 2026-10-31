import { CircleAlert, CircleCheck, Info, LoaderCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-md bg-surface-raised", className)} />;
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-muted">
      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </span>
  );
}

const alertTones = {
  info: { icon: Info, className: "border-border bg-surface-raised text-muted" },
  success: { icon: CircleCheck, className: "border-success/25 bg-success-soft text-success" },
  error: { icon: CircleAlert, className: "border-danger/25 bg-danger-soft text-danger" },
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof alertTones;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClass } = alertTones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm", toneClass, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-foreground/80">{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center",
        className,
      )}
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-1 max-w-md text-sm text-muted">{description}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-muted">
      {children}
    </kbd>
  );
}
