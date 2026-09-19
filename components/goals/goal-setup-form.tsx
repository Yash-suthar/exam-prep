"use client";

import { GoalType } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXAM_GOALS, examLabel } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

type TaskDraft = {
  label: string;
  isAutoTracked: boolean;
  targetMinutes: number | null;
};

const defaultTasks: TaskDraft[] = [
  { label: "1 mock test", isAutoTracked: true, targetMinutes: null },
  { label: "Read for 45 minutes", isAutoTracked: false, targetMinutes: 45 },
];

export function GoalSetupForm({ examGoals }: { examGoals: string[] }) {
  const router = useRouter();
  const options = useMemo(() => {
    const selected = EXAM_GOALS.filter((goal) => examGoals.includes(goal.id));
    return selected.length > 0 ? selected : EXAM_GOALS;
  }, [examGoals]);

  const first = options[0];
  const [type, setType] = useState<GoalType>(first?.track ?? "COMPETITIVE_EXAM");
  const [examTag, setExamTag] = useState(first?.id ?? "ssc");
  const [targetPercent, setTargetPercent] = useState("90");
  const [targetDate, setTargetDate] = useState("");
  const [targetRank, setTargetRank] = useState("");
  const [tasks, setTasks] = useState<TaskDraft[]>(defaultTasks);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  function addCustom() {
    if (!custom.trim()) return;
    setTasks((prev) => [...prev, { label: custom.trim(), isAutoTracked: false, targetMinutes: null }]);
    setCustom("");
  }

  async function submit() {
    setBusy(true);
    const result = await createGoal({
      type,
      examTag: type === "COMPETITIVE_EXAM" ? examTag : examTag || "boards",
      targetPercent: type === "SCHOOL" ? Number(targetPercent) || null : null,
      targetDate: targetDate || null,
      targetRank: targetRank ? Number(targetRank) : null,
      tasks,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not save this goal.");
      return;
    }
    toast.success("Goal is live.");
    router.push("/goals");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Goal setup</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">What are you chasing?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          School marks or a competitive exam. You can change this later without losing past days.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("SCHOOL")}
          className={cn(
            "min-h-20 rounded-2xl border px-3 py-3 text-left",
            type === "SCHOOL" ? "border-primary bg-primary/10" : "border-border bg-card",
          )}
        >
          <p className="font-semibold">School track</p>
          <p className="mt-1 text-xs text-muted-foreground">Target a board percentage</p>
        </button>
        <button
          type="button"
          onClick={() => setType("COMPETITIVE_EXAM")}
          className={cn(
            "min-h-20 rounded-2xl border px-3 py-3 text-left",
            type === "COMPETITIVE_EXAM" ? "border-primary bg-primary/10" : "border-border bg-card",
          )}
        >
          <p className="font-semibold">Exam track</p>
          <p className="mt-1 text-xs text-muted-foreground">Rank, date, mocks</p>
        </button>
      </div>

      <div className="space-y-1.5">
        <Label>Primary exam</Label>
        <div className="flex flex-wrap gap-2">
          {options.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => {
                setExamTag(goal.id);
                setType(goal.track);
              }}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-semibold",
                examTag === goal.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card",
              )}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      {type === "SCHOOL" ? (
        <div className="space-y-1.5">
          <Label htmlFor="percent">Target percentage</Label>
          <Input
            id="percent"
            type="number"
            min={1}
            max={100}
            value={targetPercent}
            onChange={(event) => setTargetPercent(event.target.value)}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="date">Exam date (optional)</Label>
            <Input
              id="date"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rank">Target rank / score (optional)</Label>
            <Input
              id="rank"
              type="number"
              min={1}
              value={targetRank}
              onChange={(event) => setTargetRank(event.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <Label>Daily checklist</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Mock tests lock themselves when you submit a paper. Reading stays an honesty toggle.
        </p>
        <div className="mt-3 space-y-2">
          {tasks.map((task, index) => (
            <div
              key={`${task.label}-${index}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{task.label}</p>
                <p className="text-xs text-muted-foreground">
                  {task.isAutoTracked ? "Auto from mocks" : "Tap to confirm"}
                  {task.targetMinutes ? ` · ${task.targetMinutes} min` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTasks((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            placeholder="Add your own task"
          />
          <Button type="button" variant="outline" onClick={addCustom}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button type="button" className="w-full" size="lg" onClick={submit} disabled={busy}>
        {busy ? "Saving…" : `Start ${examLabel(examTag)} goal`}
      </Button>
    </div>
  );
}
