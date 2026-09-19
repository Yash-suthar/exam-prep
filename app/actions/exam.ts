"use server";

import { AttemptStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { computeExamScore } from "@/lib/scoring";
import { requireUser } from "@/lib/session";

const OPTIONS = new Set(["A", "B", "C", "D", "E"]);

export async function startOrResumeAttempt(examId: string) {
  const user = await requireUser();
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || !exam.isPublished) {
    return { ok: false as const, error: "Exam not found." };
  }

  const allowed = await hasAccess(user.id, "EXAM", examId);
  if (!allowed) {
    return { ok: false as const, error: "Purchase or unlock this exam first." };
  }

  const existing = await prisma.examAttempt.findFirst({
    where: {
      userId: user.id,
      examId,
      status: AttemptStatus.IN_PROGRESS,
    },
    include: { answers: true },
  });

  if (existing) {
    return { ok: true as const, attemptId: existing.id, resumed: true };
  }

  const attempt = await prisma.examAttempt.create({
    data: {
      userId: user.id,
      examId,
      status: AttemptStatus.IN_PROGRESS,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/exams");
  return { ok: true as const, attemptId: attempt.id, resumed: false };
}

export async function lockAnswer(input: {
  attemptId: string;
  questionNo: number;
  selectedOption: string;
}) {
  const user = await requireUser();
  const limited = rateLimit(`answer:${user.id}`, 40, 10_000);
  if (!limited.ok) {
    return { ok: false as const, error: "You are answering too quickly. Wait a moment." };
  }

  if (!OPTIONS.has(input.selectedOption)) {
    return { ok: false as const, error: "Invalid option." };
  }

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: input.attemptId },
    include: { exam: true },
  });

  if (!attempt || attempt.userId !== user.id) {
    return { ok: false as const, error: "Attempt not found." };
  }
  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    return { ok: false as const, error: "This attempt is already submitted." };
  }
  if (
    input.questionNo < 1 ||
    input.questionNo > attempt.exam.totalQuestions
  ) {
    return { ok: false as const, error: "Invalid question number." };
  }

  const endsAt =
    attempt.startedAt.getTime() + attempt.exam.durationMinutes * 60_000;
  if (Date.now() >= endsAt) {
    await finalizeAttempt(attempt.id, AttemptStatus.AUTO_SUBMITTED);
    return { ok: false as const, error: "Time is up. The exam was auto-submitted." };
  }

  try {
    await prisma.examAnswer.create({
      data: {
        attemptId: attempt.id,
        questionNo: input.questionNo,
        selectedOption: input.selectedOption,
      },
    });
  } catch {
    return { ok: false as const, error: "This bubble is already locked." };
  }

  return { ok: true as const };
}

export async function submitAttempt(attemptId: string, auto = false) {
  const user = await requireUser();
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt || attempt.userId !== user.id) {
    return { ok: false as const, error: "Attempt not found." };
  }
  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    return { ok: true as const, attemptId };
  }

  await finalizeAttempt(
    attemptId,
    auto ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.SUBMITTED,
  );

  revalidatePath(`/exams/${attempt.examId}/result`);
  revalidatePath("/exams");
  revalidatePath("/dashboard");
  return { ok: true as const, attemptId };
}

async function finalizeAttempt(attemptId: string, status: AttemptStatus) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { include: { questions: true } },
      answers: true,
    },
  });
  if (!attempt || attempt.status !== AttemptStatus.IN_PROGRESS) return;

  const key = new Map(
    attempt.exam.questions.map((question) => [
      question.questionNo,
      question.correctOption,
    ]),
  );
  const chosen = new Map(
    attempt.answers.map((answer) => [answer.questionNo, answer.selectedOption]),
  );

  let correctCount = 0;
  let wrongCount = 0;
  let unattempted = 0;

  for (let questionNo = 1; questionNo <= attempt.exam.totalQuestions; questionNo += 1) {
    const selected = chosen.get(questionNo);
    if (!selected) {
      unattempted += 1;
      continue;
    }
    if (selected === key.get(questionNo)) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }
  }

  const score = computeExamScore({
    correctCount,
    wrongCount,
    marksPerQuestion: attempt.exam.marksPerQuestion,
    negativeMarking: attempt.exam.negativeMarking,
  });

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status,
      submittedAt: new Date(),
      score,
      correctCount,
      wrongCount,
      unattempted,
    },
  });
}
