"use client";

import { Expand, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import type { HelpImage } from "./guide-data";

/**
 * A screenshot in a rounded browser frame. Clicking it opens a larger view in a native <dialog>
 * (Esc, the close button or a click on the backdrop closes it).
 */
export function Screenshot({ image, priority = false }: { image: HelpImage; priority?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const width = image.width ?? 1280;
  const height = image.height ?? 800;
  const phone = width < height;

  return (
    <figure className={phone ? "mx-auto max-w-[260px]" : undefined}>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group block w-full overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm transition-shadow hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-label={`Enlarge screenshot: ${image.alt}`}
      >
        <span className="flex items-center gap-1.5 border-b border-border bg-surface-raised px-3 py-2" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          {!phone && (
            <span className="ml-3 hidden min-w-0 flex-1 truncate rounded-md bg-background/80 px-2 py-0.5 font-mono text-[11px] text-subtle sm:block">
              {image.url}
            </span>
          )}
          <Expand className="ml-auto h-3.5 w-3.5 text-subtle transition-colors group-hover:text-foreground" />
        </span>
        <Image
          src={image.src}
          alt={image.alt}
          width={width}
          height={height}
          priority={priority}
          sizes={phone ? "260px" : "(min-width: 1280px) 720px, (min-width: 768px) 70vw, 100vw"}
          className="block h-auto w-full"
        />
      </button>
      {image.caption && <figcaption className="mt-2 text-xs leading-5 text-muted">{image.caption}</figcaption>}

      <dialog
        ref={dialogRef}
        aria-label={image.alt}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto max-h-[94vh] w-[min(96vw,1280px)] overflow-visible bg-transparent p-0 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
        style={phone ? { width: "min(96vw, 420px)" } : undefined}
      >
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-surface-raised px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-xs text-muted">{image.alt}</span>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              aria-label="Close enlarged screenshot"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="max-h-[calc(94vh-42px)] overflow-auto">
            <Image src={image.src} alt="" width={width} height={height} sizes="96vw" className="block h-auto w-full" />
          </div>
        </div>
      </dialog>
    </figure>
  );
}
