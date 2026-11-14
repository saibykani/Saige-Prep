"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Off-canvas navigation for narrow screens, built on a native modal <dialog>: the browser traps
 * focus inside, makes the rest of the page inert, closes on Escape and restores focus to the
 * control that opened it. We add: initial focus on the close button, close on backdrop click,
 * and close when the viewport grows to the desktop layout (where the sidebar is always shown).
 */
export function MobileDrawer({
  open,
  onClose,
  brand,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  brand: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal?.();
      // showModal focuses the first focusable element (the brand link); start on the close button instead.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) {
      dialog.close?.();
      openerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (query.matches) onClose();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open, onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Navigation"
      // Escape (cancel) feeds the same state as the close button.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-0 h-full max-h-none w-72 max-w-[85vw] overflow-hidden border-r border-border bg-background p-0 text-foreground backdrop:bg-overlay lg:hidden"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
          {brand}
          <Button variant="ghost" size="icon" aria-label="Close navigation" data-autofocus onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-border px-3 py-3">{footer}</div>}
      </div>
    </dialog>
  );
}
