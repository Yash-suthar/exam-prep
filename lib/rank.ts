export function rankAndPercentile(scores: number[], score: number) {
  const ranked = scores.filter((value) => Number.isFinite(value)).sort((a, b) => b - a);
  if (ranked.length === 0) {
    return { rank: 1, outOf: 1, percentile: 100 };
  }
  const better = ranked.filter((value) => value > score).length;
  const rank = better + 1;
  const percentile = Math.max(
    0,
    Math.min(99.9, Math.round(((ranked.length - rank) / ranked.length) * 1000) / 10),
  );
  return { rank, outOf: ranked.length, percentile };
}

export function formatDuration(startedAt: Date, submittedAt: Date | null) {
  const end = submittedAt ?? new Date();
  const minutes = Math.max(1, Math.round((end.getTime() - startedAt.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
