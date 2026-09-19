export function MomentumGauge({
  value,
  streak,
  best,
}: {
  value: number;
  streak: number;
  best: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (clamped / 100) * circ;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 128 128" className="h-28 w-28">
        <circle cx="64" cy="64" r={radius} className="fill-none stroke-muted" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          className="fill-none stroke-primary"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
        />
        <text x="64" y="70" textAnchor="middle" className="fill-foreground font-display text-2xl font-semibold">
          {clamped}
        </text>
      </svg>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Momentum</p>
        <p className="font-display text-2xl font-semibold">{clamped} / 100</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Streak {streak} · Best {best}
        </p>
      </div>
    </div>
  );
}
