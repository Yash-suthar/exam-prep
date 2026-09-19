"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AnalyticsCharts({
  buckets,
  hardest,
}: {
  buckets: number[];
  hardest: { questionNo: number; wrongRate: number }[];
}) {
  const distribution = buckets.map((count, index) => ({
    band: `${index * 20}-${index * 20 + 19}%`,
    count,
  }));

  return (
    <div className="space-y-8">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="band" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Question list</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {hardest.map((row) => (
            <p key={row.questionNo} className="text-sm text-muted-foreground">
              Q{row.questionNo}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
