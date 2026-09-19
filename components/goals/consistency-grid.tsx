"use client";

import { DayStatus } from "@prisma/client";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { addUtcDays, dayStart, formatDay } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Log = {
  date: string;
  status: DayStatus;
  taskResults: Record<string, boolean>;
};

export function ConsistencyGrid({
  logs,
  tasks,
}: {
  logs: Log[];
  tasks: { id: string; label: string }[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const today = dayStart();
  const start = addUtcDays(today, -111);
  const byDay = useMemo(() => {
    const map = new Map(logs.map((log) => [log.date.slice(0, 10), log]));
    return map;
  }, [logs]);

  const cells = Array.from({ length: 112 }, (_, index) => {
    const date = addUtcDays(start, index);
    const key = date.toISOString().slice(0, 10);
    return { date, key, log: byDay.get(key) ?? null };
  });

  const picked = selected ? cells.find((cell) => cell.key === selected) : null;

  return (
    <div>
      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="grid w-max grid-flow-col grid-rows-7 gap-1.5 p-1">
          {cells.map((cell, index) => (
            <motion.button
              key={cell.key}
              type="button"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.min(index * 0.004, 0.4) }}
              onClick={() => setSelected(cell.key)}
              title={formatDay(cell.date)}
              className={cn(
                "h-3.5 w-3.5 rounded-[3px] sm:h-4 sm:w-4",
                cell.log?.status === "COMPLETE" && "bg-emerald-500",
                cell.log?.status === "PARTIAL" && "bg-amber-400",
                (!cell.log || cell.log.status === "NONE") && "bg-muted",
                cell.log?.status === "MISSED_EXAM" && "bg-muted ring-2 ring-red-500",
              )}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend swatch="bg-emerald-500" label="All tasks" />
        <Legend swatch="bg-amber-400" label="Partial" />
        <Legend swatch="bg-muted" label="Nothing logged" />
        {logs.some((log) => log.status === "MISSED_EXAM") ? (
          <Legend swatch="bg-muted ring-2 ring-red-500" label="Missed mock" />
        ) : null}
      </div>

      {picked ? (
        <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border border-border bg-card p-5 shadow-2xl md:static md:mt-4 md:rounded-2xl md:shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">{formatDay(picked.date)}</p>
            <button type="button" className="text-sm font-semibold text-primary" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks on this goal.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {tasks.map((task) => (
                <li key={task.id} className="flex justify-between gap-3">
                  <span>{task.label}</span>
                  <span className="text-muted-foreground">
                    {picked.log?.taskResults[task.id] ? "Done" : "Not logged"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-[3px]", swatch)} />
      {label}
    </span>
  );
}
