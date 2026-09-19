"use server";

import { DayStatus, GoalType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { dayStart } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function createGoal(input: {
  type: GoalType;
  examTag?: string | null;
  targetPercent?: number | null;
  targetDate?: string | null;
  targetRank?: number | null;
  tasks: { label: string; isAutoTracked?: boolean; targetMinutes?: number | null }[];
}) {
  const user = await requireUser();
  await prisma.goal.updateMany({
    where: { userId: user.id, isActive: true },
    data: { isActive: false },
  });
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: input.type,
      examTag: input.examTag ?? null,
      targetPercent: input.targetPercent ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      targetRank: input.targetRank ?? null,
      isActive: true,
      tasks: {
        create: input.tasks
          .filter((task) => task.label.trim())
          .map((task) => ({
            label: task.label.trim(),
            isAutoTracked: Boolean(task.isAutoTracked),
            targetMinutes: task.targetMinutes ?? null,
          })),
      },
    },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true as const, goalId: goal.id };
}

export async function recordTaskResult(
  goalId: string,
  taskId: string,
  done: boolean,
  date = dayStart(),
) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { tasks: true },
  });
  if (!goal) return { ok: false as const, error: "Goal not found." };

  const existing = await prisma.dailyLog.findUnique({
    where: { goalId_date: { goalId, date } },
  });
  const results = {
    ...((existing?.taskResults as Record<string, boolean> | null) ?? {}),
    [taskId]: done,
  };

  const completed = goal.tasks.filter((task) => results[task.id]).length;
  let status: DayStatus = "NONE";
  if (completed === goal.tasks.length && goal.tasks.length > 0) status = "COMPLETE";
  else if (completed > 0) status = "PARTIAL";

  await prisma.dailyLog.upsert({
    where: { goalId_date: { goalId, date } },
    update: { taskResults: results, status },
    create: { goalId, date, taskResults: results, status },
  });
  return { ok: true as const };
}

export async function toggleTodayTask(goalId: string, taskId: string, done: boolean) {
  const user = await requireUser();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
    include: { tasks: true },
  });
  if (!goal) return { ok: false as const, error: "Goal not found." };

  const result = await recordTaskResult(goalId, taskId, done);
  if (!result.ok) return result;
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function markAutoTrackedMock(userId: string) {
  const goal = await prisma.goal.findFirst({
    where: { userId, isActive: true },
    include: { tasks: true },
  });
  if (!goal) return;
  const mockTask = goal.tasks.find((task) => task.isAutoTracked);
  if (!mockTask) return;
  await recordTaskResult(goal.id, mockTask.id, true);
}
