"use server";

import { DayStatus, GoalType, TopicStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { dayStart } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { defaultMilestones, syllabusTemplate } from "@/lib/syllabus-templates";

function refreshGoal() {
  revalidatePath("/goals");
  revalidatePath("/goals/syllabus");
  revalidatePath("/goals/progress");
  revalidatePath("/goals/peers");
  revalidatePath("/goals/settings");
  revalidatePath("/dashboard");
}

async function ownedGoal(goalId: string) {
  const user = await requireUser();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });
  return goal ? { user, goal } : null;
}

export async function createGoal(input: {
  type: GoalType;
  examTag?: string | null;
  targetPercent?: number | null;
  targetDate?: string | null;
  targetRank?: number | null;
  dailyMinutesTarget?: number;
  weeklyMockTarget?: number;
  restDays?: number[];
  seedSyllabus?: boolean;
  tasks: { label: string; isAutoTracked?: boolean; targetMinutes?: number | null }[];
}) {
  const user = await requireUser();
  await prisma.goal.updateMany({
    where: { userId: user.id, isActive: true },
    data: { isActive: false },
  });

  const targetDate = input.targetDate ? new Date(input.targetDate) : null;
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      type: input.type,
      examTag: input.examTag ?? null,
      targetPercent: input.targetPercent ?? null,
      targetDate,
      targetRank: input.targetRank ?? null,
      dailyMinutesTarget: input.dailyMinutesTarget ?? 60,
      weeklyMockTarget: input.weeklyMockTarget ?? 3,
      restDays: input.restDays ?? [],
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

  if (input.seedSyllabus !== false) {
    const template = syllabusTemplate(input.examTag);
    await prisma.syllabusTopic.createMany({
      data: template.flatMap((subject) =>
        subject.topics.map((name) => ({
          goalId: goal.id,
          subject: subject.subject,
          name,
        })),
      ),
      skipDuplicates: true,
    });
    await prisma.goalMilestone.createMany({
      data: defaultMilestones(input.examTag, targetDate).map((milestone) => ({
        goalId: goal.id,
        title: milestone.title,
        dueDate: milestone.dueDate,
      })),
    });
  }

  refreshGoal();
  return { ok: true as const, goalId: goal.id };
}

export async function updateGoalTargets(input: {
  goalId: string;
  targetPercent?: number | null;
  targetDate?: string | null;
  targetRank?: number | null;
  dailyMinutesTarget?: number;
  weeklyMockTarget?: number;
  restDays?: number[];
}) {
  const owned = await ownedGoal(input.goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };

  await prisma.goal.update({
    where: { id: input.goalId },
    data: {
      targetPercent: input.targetPercent ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      targetRank: input.targetRank ?? null,
      ...(input.dailyMinutesTarget != null
        ? { dailyMinutesTarget: Math.max(10, input.dailyMinutesTarget) }
        : {}),
      ...(input.weeklyMockTarget != null
        ? { weeklyMockTarget: Math.max(0, input.weeklyMockTarget) }
        : {}),
      ...(input.restDays ? { restDays: input.restDays } : {}),
    },
  });
  refreshGoal();
  return { ok: true as const };
}

export async function addGoalTask(input: {
  goalId: string;
  label: string;
  targetMinutes?: number | null;
}) {
  const owned = await ownedGoal(input.goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };
  const label = input.label.trim();
  if (!label) return { ok: false as const, error: "Give the task a name." };

  await prisma.goalTask.create({
    data: {
      goalId: input.goalId,
      label,
      targetMinutes: input.targetMinutes ?? null,
    },
  });
  refreshGoal();
  return { ok: true as const };
}

export async function removeGoalTask(taskId: string) {
  const user = await requireUser();
  const task = await prisma.goalTask.findUnique({
    where: { id: taskId },
    include: { goal: true },
  });
  if (!task || task.goal.userId !== user.id) {
    return { ok: false as const, error: "Task not found." };
  }
  await prisma.goalTask.delete({ where: { id: taskId } });
  refreshGoal();
  return { ok: true as const };
}

export async function activateGoal(goalId: string) {
  const owned = await ownedGoal(goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };
  await prisma.goal.updateMany({
    where: { userId: owned.user.id, isActive: true },
    data: { isActive: false },
  });
  await prisma.goal.update({
    where: { id: goalId },
    data: { isActive: true, archivedAt: null },
  });
  refreshGoal();
  return { ok: true as const };
}

export async function archiveGoal(goalId: string) {
  const owned = await ownedGoal(goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };
  await prisma.goal.update({
    where: { id: goalId },
    data: { isActive: false, archivedAt: new Date() },
  });
  refreshGoal();
  return { ok: true as const };
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
  const owned = await ownedGoal(goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };

  const result = await recordTaskResult(goalId, taskId, done);
  if (!result.ok) return result;
  refreshGoal();
  return { ok: true as const };
}

export async function logStudySession(input: {
  goalId: string;
  minutes: number;
  topicId?: string | null;
  note?: string | null;
}) {
  const owned = await ownedGoal(input.goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };

  const minutes = Math.round(input.minutes);
  if (minutes < 1 || minutes > 600) {
    return { ok: false as const, error: "Log between 1 and 600 minutes." };
  }

  await prisma.studySession.create({
    data: {
      goalId: input.goalId,
      minutes,
      topicId: input.topicId || null,
      note: input.note?.trim() || null,
    },
  });

  if (input.topicId) {
    const topic = await prisma.syllabusTopic.findFirst({
      where: { id: input.topicId, goalId: input.goalId },
    });
    if (topic) {
      await prisma.syllabusTopic.update({
        where: { id: topic.id },
        data: {
          lastRevisedAt: new Date(),
          status: topic.status === "NOT_STARTED" ? "LEARNING" : topic.status,
        },
      });
    }
  }

  const date = dayStart();
  const existing = await prisma.dailyLog.findUnique({
    where: { goalId_date: { goalId: input.goalId, date } },
  });
  await prisma.dailyLog.upsert({
    where: { goalId_date: { goalId: input.goalId, date } },
    update: { minutes: (existing?.minutes ?? 0) + minutes },
    create: {
      goalId: input.goalId,
      date,
      minutes,
      status: "PARTIAL",
      taskResults: {},
    },
  });

  refreshGoal();
  return { ok: true as const, minutes };
}

export async function setTopicStatus(topicId: string, status: TopicStatus) {
  const user = await requireUser();
  const topic = await prisma.syllabusTopic.findUnique({
    where: { id: topicId },
    include: { goal: true },
  });
  if (!topic || topic.goal.userId !== user.id) {
    return { ok: false as const, error: "Topic not found." };
  }

  await prisma.syllabusTopic.update({
    where: { id: topicId },
    data: {
      status,
      lastRevisedAt:
        status === "REVISING" || status === "MASTERED" ? new Date() : topic.lastRevisedAt,
    },
  });
  refreshGoal();
  return { ok: true as const };
}

export async function addSyllabusTopic(input: {
  goalId: string;
  subject: string;
  name: string;
}) {
  const owned = await ownedGoal(input.goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };

  const subject = input.subject.trim() || "General";
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name the topic." };

  const clash = await prisma.syllabusTopic.findFirst({
    where: { goalId: input.goalId, subject, name },
  });
  if (clash) return { ok: false as const, error: "That topic is already on the list." };

  await prisma.syllabusTopic.create({
    data: { goalId: input.goalId, subject, name },
  });
  refreshGoal();
  return { ok: true as const };
}

export async function removeSyllabusTopic(topicId: string) {
  const user = await requireUser();
  const topic = await prisma.syllabusTopic.findUnique({
    where: { id: topicId },
    include: { goal: true },
  });
  if (!topic || topic.goal.userId !== user.id) {
    return { ok: false as const, error: "Topic not found." };
  }
  await prisma.syllabusTopic.delete({ where: { id: topicId } });
  refreshGoal();
  return { ok: true as const };
}

export async function importSyllabusTemplate(goalId: string, examTag: string) {
  const owned = await ownedGoal(goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };

  const template = syllabusTemplate(examTag);
  const created = await prisma.syllabusTopic.createMany({
    data: template.flatMap((subject) =>
      subject.topics.map((name) => ({
        goalId,
        subject: subject.subject,
        name,
      })),
    ),
    skipDuplicates: true,
  });
  refreshGoal();
  return { ok: true as const, added: created.count };
}

export async function addMilestone(input: {
  goalId: string;
  title: string;
  dueDate?: string | null;
}) {
  const owned = await ownedGoal(input.goalId);
  if (!owned) return { ok: false as const, error: "Goal not found." };
  const title = input.title.trim();
  if (!title) return { ok: false as const, error: "Name the milestone." };

  await prisma.goalMilestone.create({
    data: {
      goalId: input.goalId,
      title,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
  refreshGoal();
  return { ok: true as const };
}

export async function toggleMilestone(milestoneId: string, isDone: boolean) {
  const user = await requireUser();
  const milestone = await prisma.goalMilestone.findUnique({
    where: { id: milestoneId },
    include: { goal: true },
  });
  if (!milestone || milestone.goal.userId !== user.id) {
    return { ok: false as const, error: "Milestone not found." };
  }
  await prisma.goalMilestone.update({
    where: { id: milestoneId },
    data: { isDone, completedAt: isDone ? new Date() : null },
  });
  refreshGoal();
  return { ok: true as const };
}

export async function removeMilestone(milestoneId: string) {
  const user = await requireUser();
  const milestone = await prisma.goalMilestone.findUnique({
    where: { id: milestoneId },
    include: { goal: true },
  });
  if (!milestone || milestone.goal.userId !== user.id) {
    return { ok: false as const, error: "Milestone not found." };
  }
  await prisma.goalMilestone.delete({ where: { id: milestoneId } });
  refreshGoal();
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
