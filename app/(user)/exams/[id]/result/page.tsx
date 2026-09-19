import { notFound } from "next/navigation";
import { ResultView } from "@/components/exam/result-view";
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
    }));

  return (
    <ResultView
      examTitle={attempt.exam.title}
      score={attempt.score}
      maxScore={attempt.exam.totalQuestions * attempt.exam.marksPerQuestion}
      correctCount={attempt.correctCount ?? 0}
      wrongCount={attempt.wrongCount ?? 0}
      unattempted={attempt.unattempted ?? 0}
      review={review}
    />
  );
}
