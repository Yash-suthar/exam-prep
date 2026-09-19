import { AttemptStatus } from "@prisma/client";
import { accuracyPercent, topicBreakdown, weakTopics } from "@/lib/analysis";
import { prisma } from "@/lib/prisma";

export async function studentProgress(userId: string) {
  const attempts = await prisma.examAttempt.findMany({
    where: { userId, status: { not: AttemptStatus.IN_PROGRESS } },
    include: {
      exam: { include: { questions: true } },
      answers: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  const scores = attempts.map((attempt) => attempt.score ?? 0);
  const correct = attempts.reduce((sum, attempt) => sum + (attempt.correctCount ?? 0), 0);
  const wrong = attempts.reduce((sum, attempt) => sum + (attempt.wrongCount ?? 0), 0);
  const latest = attempts[0];

  const latestReview = latest
    ? latest.exam.questions
        .slice()
        .sort((a, b) => a.questionNo - b.questionNo)
        .map((question) => ({
          questionNo: question.questionNo,
          selected:
            latest.answers.find((answer) => answer.questionNo === question.questionNo)
              ?.selectedOption ?? null,
          correct: question.correctOption,
          topic: question.topic,
        }))
    : [];

  return {
    mocksTaken: attempts.length,
    avgScore: scores.length
      ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10
      : 0,
    bestScore: scores.length ? Math.max(...scores) : 0,
    accuracy: accuracyPercent(correct, correct + wrong),
    lastScore: latest?.score ?? null,
    lastExamTitle: latest?.exam.title ?? null,
    lastExamId: latest?.examId ?? null,
    weak: weakTopics(topicBreakdown(latestReview)),
  };
}
