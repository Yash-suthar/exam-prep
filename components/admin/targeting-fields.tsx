"use client";

import { EducationLevel } from "@prisma/client";
import { EDUCATION_LEVELS, EXAM_GOALS, STANDARDS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export type TargetingValue = {
  targetEducationLevels: EducationLevel[];
  targetStandards: string[];
  targetExamGoals: string[];
};

export function TargetingFields({
  value,
  onChange,
}: {
  value: TargetingValue;
  onChange: (value: TargetingValue) => void;
}) {
  function toggle<K extends keyof TargetingValue>(key: K, item: TargetingValue[K][number]) {
    const list = value[key] as string[];
    const next = list.includes(item as string)
      ? list.filter((entry) => entry !== item)
      : [...list, item];
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Target education</legend>
        <div className="flex flex-wrap gap-2">
          {EDUCATION_LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => toggle("targetEducationLevels", level.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                value.targetEducationLevels.includes(level.id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {level.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Target class</legend>
        <div className="flex flex-wrap gap-2">
          {STANDARDS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggle("targetStandards", item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                value.targetStandards.includes(item)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Target exams</legend>
        <div className="flex flex-wrap gap-2">
          {EXAM_GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggle("targetExamGoals", goal.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                value.targetExamGoals.includes(goal.id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
