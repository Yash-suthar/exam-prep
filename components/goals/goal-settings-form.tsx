"use client";

import { GoalType } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  addGoalTask,
  archiveGoal,
  removeGoalTask,
  updateGoalTargets,
} from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Task = {
  id: string;
  label: string;
  isAutoTracked: boolean;
  targetMinutes: number | null;
};

export function GoalSettingsForm({
  goalId,
  type,
  targetPercent,
  targetDate,
  targetRank,
  dailyMinutesTarget,
  weeklyMockTarget,
  restDays,
  tasks,
}: {
  goalId: string;
  type: GoalType;
  targetPercent: number | null;
  targetDate: string | null;
  targetRank: number | null;
  dailyMinutesTarget: number;
  weeklyMockTarget: number;
  restDays: number[];
  tasks: Task[];
}) {
  const router = useRouter();
  const [percent, setPercent] = useState(String(targetPercent ?? ""));
  const [date, setDate] = useState(targetDate ?? "");
  const [rank, setRank] = useState(String(targetRank ?? ""));
  const [minutes, setMinutes] = useState(String(dailyMinutesTarget));
  const [mocks, setMocks] = useState(String(weeklyMockTarget));
  const [rest, setRest] = useState<number[]>(restDays);
  const [taskList, setTaskList] = useState(tasks);
  const [newTask, setNewTask] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {type === "SCHOOL" ? (
          <Field label="Target percentage">
            <Input
              type="number"
              min={1}
              max={100}
              value={percent}
              onChange={(event) => setPercent(event.target.value)}
            />
          </Field>
        ) : (
          <Field label="Target rank / score">
            <Input
              type="number"
              min={1}
              value={rank}
              onChange={(event) => setRank(event.target.value)}
            />
          </Field>
        )}
        <Field label="Exam date">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field label="Daily study target (minutes)">
          <Input
            type="number"
            min={10}
            max={720}
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
          />
        </Field>
        <Field label="Mocks per week">
          <Input
            type="number"
            min={0}
            max={21}
            value={mocks}
            onChange={(event) => setMocks(event.target.value)}
          />
        </Field>
      </div>

      <div>
        <Label>Planned rest days</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Rest days do not break your streak. Pick the days you know you cannot study.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEEKDAYS.map((day, index) => (
            <button
              key={day}
              type="button"
              onClick={() =>
                setRest((prev) =>
                  prev.includes(index)
                    ? prev.filter((value) => value !== index)
                    : [...prev, index],
                )
              }
              className={cn(
                "min-h-10 rounded-full px-4 text-sm font-semibold",
                rest.includes(index)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const result = await updateGoalTargets({
            goalId,
            targetPercent: type === "SCHOOL" ? Number(percent) || null : null,
            targetDate: date || null,
            targetRank: type === "SCHOOL" ? null : Number(rank) || null,
            dailyMinutesTarget: Number(minutes) || 60,
            weeklyMockTarget: Number(mocks) || 0,
            restDays: rest,
          });
          setBusy(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Goal updated.");
          router.refresh();
        }}
      >
        {busy ? "Saving…" : "Save targets"}
      </Button>

      <div>
        <Label>Daily checklist</Label>
        <div className="mt-3 space-y-2">
          {taskList.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">{task.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {task.isAutoTracked ? "Auto-checked after a mock" : "Honesty toggle"}
                  {task.targetMinutes ? ` · ${task.targetMinutes} min` : ""}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                onClick={async () => {
                  const previous = taskList;
                  setTaskList((prev) => prev.filter((item) => item.id !== task.id));
                  const result = await removeGoalTask(task.id);
                  if (!result.ok) {
                    setTaskList(previous);
                    toast.error(result.error);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="Revise 20 formulae"
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy || !newTask.trim()}
            onClick={async () => {
              setBusy(true);
              const result = await addGoalTask({ goalId, label: newTask });
              setBusy(false);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              setNewTask("");
              toast.success("Task added.");
              router.refresh();
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border p-4">
        <p className="text-sm font-semibold">Archive this goal</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Past days, syllabus, and sessions stay saved. You can reactivate it any time.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const result = await archiveGoal(goalId);
            setBusy(false);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Goal archived.");
            router.push("/goals/setup");
          }}
        >
          Archive goal
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
