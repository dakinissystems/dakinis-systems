export function formatTime(ms) {
  if (!ms || ms < 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function totalDurationMs(tracks) {
  return tracks.reduce((sum, t) => sum + (t.durationMs || 0), 0);
}
