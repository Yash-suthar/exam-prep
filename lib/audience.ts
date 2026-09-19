import { prisma } from "@/lib/prisma";
import type { Audience } from "@/lib/targeting";

export async function getStudentContext(userId: string) {
  const [profile, goal, settings] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.goal.findFirst({
      where: { userId, isActive: true },
      include: { tasks: true, dailyLogs: { orderBy: { date: "asc" } } },
    }),
    prisma.userSettings.findUnique({ where: { userId } }),
  ]);

  const audience: Audience = {
    educationLevel: profile?.educationLevel,
    standard: profile?.standard,
    examGoals: profile?.examGoals ?? [],
  };

  const activeGoalTag =
    goal?.examTag ?? (goal?.type === "SCHOOL" ? "boards" : null);

  return { profile, goal, settings, audience, activeGoalTag };
}
