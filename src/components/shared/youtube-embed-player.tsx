"use client";

import * as React from "react";

interface YouTubeEmbedPlayerProps {
  youtubeVideoId: string;
  title: string;
  /** Resume playback from here (seconds). */
  initialSeconds?: number;
  /** Fired roughly every 10s while playing, with current position + duration. */
  onProgress?: (watchedSeconds: number, durationSeconds: number) => void;
  /** Fired once, the first time playback crosses ~90% watched. */
  onComplete?: () => void;
}

interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiPromise;
}

/**
 * Loads the real YouTube IFrame Player API (not a bare iframe) so we can
 * resume playback position and detect ~90%-watched for auto-complete.
 * Videos are never uploaded to or stored by this app — only the video ID is
 * persisted (see Lesson.video in src/lib/types.ts).
 */
export function YouTubeEmbedPlayer({
  youtubeVideoId,
  title,
  initialSeconds = 0,
  onProgress,
  onComplete,
}: YouTubeEmbedPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<YTPlayer | null>(null);
  const completedRef = React.useRef(false);
  const intervalRef = React.useRef<number | null>(null);
  const callbacksRef = React.useRef({ onProgress, onComplete });
  callbacksRef.current = { onProgress, onComplete };

  React.useEffect(() => {
    let cancelled = false;
    completedRef.current = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: youtubeVideoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: (e) => {
            e.target.getIframe().title = title;
            if (initialSeconds > 0) e.target.seekTo(initialSeconds, true);
          },
          onStateChange: (e) => {
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (e.data !== window.YT!.PlayerState.PLAYING) return;

            intervalRef.current = window.setInterval(() => {
              const player = playerRef.current;
              if (!player) return;
              const current = Math.floor(player.getCurrentTime());
              const duration = Math.floor(player.getDuration());
              if (!duration) return;
              callbacksRef.current.onProgress?.(current, duration);
              if (!completedRef.current && current / duration >= 0.9) {
                completedRef.current = true;
                callbacksRef.current.onComplete?.();
              }
            }, 10000);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
    // Re-create the player only when the video itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeVideoId]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-black/5 bg-black shadow-soft-lg dark:border-white/10">
      <div ref={containerRef} className="size-full" />
    </div>
  );
}
