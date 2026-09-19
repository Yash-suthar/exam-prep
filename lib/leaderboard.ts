import { GoalType } from "@prisma/client";
import { computeMomentum } from "@/lib/momentum";
import { prisma } from "@/lib/prisma";

export type LeaderboardRow = {
  userId: string;
  name: string;
  rank: number;
  momentum: number;
  avg: number;
  composite: number;
};

export async function goalLeaderboard(input: {
  userId: string;
  type: GoalType;
  examTag?: string | null;
}) {
  const peers = await prisma.goal.findMany({
    where: {
      isActive: true,
      type: input.type,
      ...(input.examTag ? { examTag: input.examTag } : {}),
    },
    include: {
      user: { select: { id: true, name: true } },
      dailyLogs: { orderBy: { date: "asc" } },
    },
  });

  const rows: Omit<LeaderboardRow, "rank">[] = [];

  for (const goal of peers) {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId: goal.userId,
        status: { not: "IN_PROGRESS" },
        score: { not: null },
      },
      include: { exam: true },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });
    const recentScores = attempts
      .map((attempt) => attempt.score)
      .filter((score): score is number => score != null);
    const maxScore = attempts[0]
      ? attempts[0].exam.totalQuestions * attempts[0].exam.marksPerQuestion
      : 1;
    const stats = computeMomentum({
      logs: goal.dailyLogs,
      recentScores,
      maxScore,
    });
    const composite = Math.round(stats.momentum * 0.6 + (stats.avg / Math.max(maxScore, 1)) * 40);
    rows.push({
      userId: goal.userId,
      name: goal.user.name,
      momentum: stats.momentum,
      avg: Math.round(stats.avg * 10) / 10,
      composite,
    });
  }

  const ranked = rows
    .sort((a, b) => b.composite - a.composite || b.momentum - a.momentum)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const me = ranked.find((row) => row.userId === input.userId) ?? null;
  const top = ranked.slice(0, 10);
  const around =
    me == null
      ? []
      : ranked.filter((row) => Math.abs(row.rank - me.rank) <= 2 && row.userId !== me.userId);

  return { me, top, around, total: ranked.length };
}
