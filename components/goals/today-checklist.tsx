"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleTodayTask } from "@/app/actions/goals";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function TodayChecklist({
  goalId,
  tasks,
  results,
}: {
  goalId: string;
  tasks: { id: string; label: string; isAutoTracked: boolean; targetMinutes: number | null }[];
  results: Record<string, boolean>;
}) {
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState(results);

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No daily tasks yet. Add them when you set a new goal.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const done = Boolean(local[task.id]);
        return (
          <label
            key={task.id}
            className={cn(
              "flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3",
              done ? "border-primary/40 bg-primary/5" : "border-border bg-card",
            )}
          >
            <div>
              <p className="text-sm font-semibold">{task.label}</p>
              <p className="text-xs text-muted-foreground">
                {task.isAutoTracked ? "Auto-checked after a mock" : "Honesty toggle — no proof needed"}
                {task.targetMinutes ? ` · ${task.targetMinutes} min` : ""}
              </p>
            </div>
            <Switch
              checked={done}
              disabled={pending}
              onCheckedChange={(value) => {
                setLocal((prev) => ({ ...prev, [task.id]: value }));
                startTransition(async () => {
                  const result = await toggleTodayTask(goalId, task.id, value);
                  if (!result.ok) {
                    setLocal((prev) => ({ ...prev, [task.id]: !value }));
                    toast.error(result.error);
                  }
                });
              }}
            />
          </label>
        );
      })}
    </div>
  );
}
