/** Accepts a raw YouTube video ID or a full YouTube URL and returns the ID. */
export function extractYouTubeId(input: string): string {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (urlMatch) return urlMatch[1];
  return trimmed;
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.max(0, totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
