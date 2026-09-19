export function projectScore(input: {
  points: { at: Date; percent: number }[];
  targetDate?: Date | null;
}) {
  const points = [...input.points].sort((a, b) => a.at.getTime() - b.at.getTime());
  if (points.length === 0) {
    return { current: null as number | null, projected: null as number | null, label: null as string | null };
  }

  const current = Math.round(points[points.length - 1].percent);
  if (points.length < 2 || !input.targetDate) {
    return { current, projected: null, label: "Need two mocks and a target date to estimate pace." };
  }

  const start = points[0].at.getTime();
  const xs = points.map((point) => (point.at.getTime() - start) / 86_400_000);
  const ys = points.map((point) => point.percent);
  const n = xs.length;
  const sumX = xs.reduce((sum, x) => sum + x, 0);
  const sumY = ys.reduce((sum, y) => sum + y, 0);
  const sumXY = xs.reduce((sum, x, index) => sum + x * ys[index], 0);
  const sumXX = xs.reduce((sum, x) => sum + x * x, 0);
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const daysOut = (input.targetDate.getTime() - start) / 86_400_000;
  const projected = Math.round(Math.min(100, Math.max(0, intercept + slope * daysOut)));
  const when = input.targetDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    current,
    projected,
    label: `At this pace, you'd be scoring ~${projected}% by ${when}. Rough estimate, not a guarantee.`,
  };
}
