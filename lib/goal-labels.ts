import { GoalType } from "@prisma/client";
import { examLabel } from "@/lib/taxonomy";

type GoalLike = {
  type: GoalType;
  examTag: string | null;
  targetPercent: number | null;
  targetRank: number | null;
  targetDate: Date | null;
  dailyMinutesTarget: number;
  weeklyMockTarget: number;
};

export function goalTitle(goal: GoalLike) {
  if (goal.type === "SCHOOL") {
    return `${goal.targetPercent ?? 90}% in ${examLabel(goal.examTag ?? "boards")}`;
  }
  return examLabel(goal.examTag ?? "ssc");
}

export function goalSubtitle(goal: GoalLike) {
  const parts: string[] = [];
  if (goal.targetDate) {
    parts.push(`Exam ${goal.targetDate.toLocaleDateString("en-IN")}`);
  }
  if (goal.targetRank) parts.push(`Target rank ${goal.targetRank}`);
  parts.push(`${goal.dailyMinutesTarget} min/day`);
  parts.push(`${goal.weeklyMockTarget} mocks/week`);
  return parts.join(" · ");
}
