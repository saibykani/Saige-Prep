"use client";

import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";
import type { Video } from "@/content/schema";

/**
 * Click-to-load YouTube player. Nothing is requested from YouTube until the learner presses play;
 * the player then loads from the privacy-enhanced youtube-nocookie.com domain.
 */
function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const start = video.start ? `&start=${video.start}` : "";
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}${video.start ? `&t=${video.start}s` : ""}`;

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative aspect-video">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0${start}`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-accent-ink p-4 text-center text-white"
            aria-label={`Play video: ${video.title}`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#14211f] shadow-lg transition-transform group-hover:scale-110 motion-reduce:transform-none">
              <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
            </span>
            <span className="line-clamp-2 max-w-[90%] text-sm font-semibold">{video.title}</span>
            <span className="text-xs text-white/80">Loads from YouTube when you press play</span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
        <span className="min-w-0 truncate text-muted">{video.channel}</span>
        <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-accent hover:underline">
          Watch on YouTube <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </figcaption>
    </figure>
  );
}

export function VideoList({ videos }: { videos: Video[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}
