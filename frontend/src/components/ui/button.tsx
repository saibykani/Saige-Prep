import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "shimmer bg-accent text-accent-foreground shadow-soft hover:bg-accent-strong hover:shadow-card hover:shadow-accent/25 disabled:bg-accent/50 disabled:shadow-none",
  secondary: "bg-surface-raised text-foreground border border-border hover:border-border-strong hover:bg-surface-hover",
  ghost: "text-muted hover:text-foreground hover:bg-surface-raised",
  danger: "bg-danger-soft text-danger border border-danger/30 hover:bg-danger/20",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  icon: "h-9 w-9 justify-center",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center rounded-lg font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:active:scale-100",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
