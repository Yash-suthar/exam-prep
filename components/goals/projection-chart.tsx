"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ProjectionChart({
  points,
  label,
}: {
  points: { label: string; percent: number }[];
  label: string | null;
}) {
  if (points.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sit two mocks and this line starts estimating your pace.
      </p>
    );
  }

  return (
    <div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="percent" stroke="var(--primary)" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {label ? <p className="mt-3 text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );
}
