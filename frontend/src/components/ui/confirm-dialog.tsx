"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";

/** Accessible confirmation dialog built on the native <dialog> element (focus trap + Esc). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(92vw,420px)] rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/70"
    >
      {open && (
        <div className="space-y-4 p-6">
          <h2 id="confirm-title" className="text-base font-semibold">
            {title}
          </h2>
          <div className="text-sm text-muted">{description}</div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant={destructive ? "danger" : "primary"} loading={loading} onClick={onConfirm} autoFocus>
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
