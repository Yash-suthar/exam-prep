import { notFound } from "next/navigation";
import { ResultView } from "@/components/exam/result-view";
import { accuracyPercent, topicBreakdown } from "@/lib/analysis";
import { formatDuration, rankAndPercentile } from "@/lib/rank";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const attempt = await prisma.examAttempt.findFirst({
    where: {
      userId: user.id,
      examId: id,
      status: { not: "IN_PROGRESS" },
    },
    include: {
      exam: { include: { questions: true } },
      answers: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  if (!attempt || attempt.score == null) {
    notFound();
  }

  const peerScores = (
    await prisma.examAttempt.findMany({
      where: { examId: id, status: { not: "IN_PROGRESS" }, score: { not: null } },
      select: { score: true },
    })
  ).map((row) => row.score ?? 0);

  const standing = rankAndPercentile(peerScores, attempt.score);
  const chosen = new Map(
    attempt.answers.map((answer) => [answer.questionNo, answer.selectedOption]),
  );
  const review = attempt.exam.questions
    .slice()
    .sort((a, b) => a.questionNo - b.questionNo)
    .map((question) => ({
      questionNo: question.questionNo,
      selected: chosen.get(question.questionNo) ?? null,
      correct: question.correctOption,
      topic: question.topic,
    }));

  return (
    <ResultView
      examTitle={attempt.exam.title}
      examId={attempt.exam.id}
      score={attempt.score}
      maxScore={attempt.exam.totalQuestions * attempt.exam.marksPerQuestion}
      correctCount={attempt.correctCount ?? 0}
      wrongCount={attempt.wrongCount ?? 0}
      unattempted={attempt.unattempted ?? 0}
      accuracy={accuracyPercent(
        attempt.correctCount ?? 0,
        (attempt.correctCount ?? 0) + (attempt.wrongCount ?? 0),
      )}
      durationLabel={formatDuration(attempt.startedAt, attempt.submittedAt)}
      rank={standing.rank}
      outOf={standing.outOf}
      percentile={standing.percentile}
      review={review}
      topics={topicBreakdown(review)}
    />
  );
}
