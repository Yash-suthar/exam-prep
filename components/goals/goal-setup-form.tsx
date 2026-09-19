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
import { syllabusTemplate } from "@/lib/syllabus-templates";
import { EXAM_GOALS, examLabel } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

type TaskDraft = {
  label: string;
  isAutoTracked: boolean;
  targetMinutes: number | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [step, setStep] = useState(1);
  const [type, setType] = useState<GoalType>(first?.track ?? "COMPETITIVE_EXAM");
  const [examTag, setExamTag] = useState(first?.id ?? "ssc");
  const [targetPercent, setTargetPercent] = useState("90");
  const [targetDate, setTargetDate] = useState("");
  const [targetRank, setTargetRank] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState("60");
  const [weeklyMocks, setWeeklyMocks] = useState("3");
  const [restDays, setRestDays] = useState<number[]>([]);
  const [seedSyllabus, setSeedSyllabus] = useState(true);
  const [tasks, setTasks] = useState<TaskDraft[]>(defaultTasks);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  const template = useMemo(() => syllabusTemplate(examTag), [examTag]);
  const topicCount = template.reduce((sum, subject) => sum + subject.topics.length, 0);

  function addCustom() {
    if (!custom.trim()) return;
    setTasks((prev) => [
      ...prev,
      { label: custom.trim(), isAutoTracked: false, targetMinutes: null },
    ]);
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
      dailyMinutesTarget: Number(dailyMinutes) || 60,
      weeklyMockTarget: Number(weeklyMocks) || 0,
      restDays,
      seedSyllabus,
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
        <p className="text-sm font-semibold text-primary">Goal setup · step {step} of 3</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          {step === 1 ? "What are you chasing?" : step === 2 ? "How hard, how often?" : "Your daily list"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === 1
            ? "School marks or a competitive exam. You can change this later without losing past days."
            : step === 2
              ? "Be honest. A target you can hit beats a target that looks impressive."
              : "Two or three items. Mocks tick themselves when you submit a paper."}
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            <TrackCard
              title="School track"
              hint="Target a board percentage"
              selected={type === "SCHOOL"}
              onClick={() => setType("SCHOOL")}
            />
            <TrackCard
              title="Exam track"
              hint="Rank, date, mocks"
              selected={type === "COMPETITIVE_EXAM"}
              onClick={() => setType("COMPETITIVE_EXAM")}
            />
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

          <div className="rounded-2xl border border-border bg-card p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={seedSyllabus}
                onChange={(event) => setSeedSyllabus(event.target.checked)}
              />
              <span>
                <span className="block text-sm font-semibold">
                  Load the standard {examLabel(examTag)} syllabus ({topicCount} topics)
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {template.map((subject) => subject.subject).join(" · ")}
                </span>
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
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
            )}
            <div className="space-y-1.5">
              <Label htmlFor="date">Exam date</Label>
              <Input
                id="date"
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minutes">Daily study target (minutes)</Label>
              <Input
                id="minutes"
                type="number"
                min={10}
                max={720}
                value={dailyMinutes}
                onChange={(event) => setDailyMinutes(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mocks">Mocks per week</Label>
              <Input
                id="mocks"
                type="number"
                min={0}
                max={21}
                value={weeklyMocks}
                onChange={(event) => setWeeklyMocks(event.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Planned rest days</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Rest days keep your streak alive. Leave empty if you study daily.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WEEKDAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setRestDays((prev) =>
                      prev.includes(index)
                        ? prev.filter((value) => value !== index)
                        : [...prev, index],
                    )
                  }
                  className={cn(
                    "min-h-10 rounded-full px-4 text-sm font-semibold",
                    restDays.includes(index)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
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
                  onClick={() =>
                    setTasks((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                  }
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
      ) : null}

      <div className="flex gap-2">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
            Back
          </Button>
        ) : null}
        {step < 3 ? (
          <Button type="button" className="flex-1" onClick={() => setStep((value) => value + 1)}>
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1"
            size="lg"
            onClick={submit}
            disabled={busy}
          >
            {busy ? "Saving…" : `Start ${examLabel(examTag)} goal`}
          </Button>
        )}
      </div>
    </div>
  );
}

function TrackCard({
  title,
  hint,
  selected,
  onClick,
}: {
  title: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-20 rounded-2xl border px-3 py-3 text-left",
        selected ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </button>
  );
}
