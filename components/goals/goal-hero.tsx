import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/goals", label: "Today" },
  { href: "/goals/syllabus", label: "Syllabus" },
  { href: "/goals/progress", label: "Progress" },
  { href: "/goals/peers", label: "Peers" },
  { href: "/goals/settings", label: "Settings" },
];

export function GoalHero({
  title,
  subtitle,
  readiness,
  verdict,
  days,
  streak,
  coveragePercent,
  active,
}: {
  title: string;
  subtitle: string;
  readiness: number;
  verdict: string;
  days: number | null;
  streak: number;
  coveragePercent: number;
  active: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Active goal
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <p className="mt-3 max-w-md text-sm">{verdict}</p>
          </div>
          <ReadinessRing value={readiness} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric
            label="Days left"
            value={days == null ? "No date" : days > 0 ? String(days) : "Today"}
          />
          <Metric label="Streak" value={`${streak}d`} />
          <Metric label="Syllabus" value={`${coveragePercent}%`} />
          <Metric label="Readiness" value={`${readiness}/100`} />
        </div>
      </div>

      <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold leading-10",
              active === tab.href
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

function ReadinessRing({ value }: { value: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const tone =
    value >= 80 ? "stroke-emerald-500" : value >= 50 ? "stroke-primary" : "stroke-amber-500";

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r={radius} className="fill-none stroke-muted" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={cn("fill-none", tone)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-2xl font-semibold">{value}</p>
        <Badge tone={value >= 80 ? "success" : value >= 50 ? "accent" : "warning"}>
          Ready
        </Badge>
      </div>
    </div>
  );
}
