import { AttemptStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getInProgressExam(userId: string) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { userId, status: AttemptStatus.IN_PROGRESS },
    include: { exam: { select: { id: true, title: true } } },
    orderBy: { startedAt: "desc" },
  });
  if (!attempt) return null;
  return { examId: attempt.exam.id, title: attempt.exam.title };
}
