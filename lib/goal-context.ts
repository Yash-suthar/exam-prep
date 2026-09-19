import { accuracyPercent } from "@/lib/analysis";
import {
  daysLeft,
  readinessScore,
  readinessVerdict,
  streakWithRestDays,
  syllabusCoverage,
  weeklyProgress,
} from "@/lib/goal-plan";
import { prisma } from "@/lib/prisma";

export async function loadGoalContext(userId: string) {
  const goal = await prisma.goal.findFirst({
    where: { userId, isActive: true },
    include: {
      tasks: { orderBy: { id: "asc" } },
      dailyLogs: { orderBy: { date: "asc" } },
      topics: { orderBy: [{ subject: "asc" }, { name: "asc" }] },
      milestones: { orderBy: [{ isDone: "asc" }, { dueDate: "asc" }] },
      sessions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!goal) return null;

  const attempts = await prisma.examAttempt.findMany({
    where: { userId, status: { not: "IN_PROGRESS" }, score: { not: null } },
    include: { exam: true },
    orderBy: { submittedAt: "asc" },
  });

  const correct = attempts.reduce((sum, a) => sum + (a.correctCount ?? 0), 0);
  const wrong = attempts.reduce((sum, a) => sum + (a.wrongCount ?? 0), 0);
  const accuracy = accuracyPercent(correct, correct + wrong);

  const coverage = syllabusCoverage(goal.topics);
  const week = weeklyProgress({
    logs: goal.dailyLogs,
    mockDates: attempts.map((a) => a.submittedAt ?? a.startedAt),
    dailyMinutesTarget: goal.dailyMinutesTarget,
    weeklyMockTarget: goal.weeklyMockTarget,
    restDays: goal.restDays,
  });
  const streak = streakWithRestDays(goal.dailyLogs, goal.restDays);
  const readiness = readinessScore({
    coveragePercent: coverage.percent,
    accuracy,
    weeklyMinutesPercent: week.minutesPercent,
    streak,
  });

  return {
    goal,
    attempts,
    accuracy,
    coverage,
    week,
    streak,
    readiness,
    verdict: readinessVerdict(readiness, daysLeft(goal.targetDate)),
    days: daysLeft(goal.targetDate),
    totalMinutes: goal.dailyLogs.reduce((sum, log) => sum + log.minutes, 0),
  };
}

export type GoalContext = NonNullable<Awaited<ReturnType<typeof loadGoalContext>>>;
