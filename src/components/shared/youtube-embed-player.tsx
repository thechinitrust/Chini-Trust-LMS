"use client";

interface YouTubeEmbedPlayerProps {
  youtubeVideoId: string;
  title: string;
  onComplete?: () => void;
}

/**
 * Thin wrapper around the YouTube iframe embed. Videos are never uploaded to
 * or stored by this app — only the YouTube video ID is persisted (see
 * Lesson.video in src/lib/types.ts). `rel=0`/`modestbranding=1` keep the
 * player focused on this lesson instead of surfacing unrelated videos.
 *
 * TODO(supabase): once lesson progress is backed by a real `progress` table,
 * load the YouTube IFrame Player API here and call onComplete when
 * getCurrentTime() / getDuration() crosses ~90% watched, instead of relying
 * on the manual "Mark complete" button alone.
 */
export function YouTubeEmbedPlayer({ youtubeVideoId, title }: YouTubeEmbedPlayerProps) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-black/5 bg-black shadow-soft-lg dark:border-white/10">
      <iframe
        className="size-full"
        src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
