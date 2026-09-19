import { notFound, redirect } from "next/navigation";
import { AttemptStatus } from "@prisma/client";
import { ExamRoom } from "@/components/exam/exam-room";
import { hasAccess } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import { createSignedFileToken, signedFilePath } from "@/lib/pdf-signing";
import { prisma } from "@/lib/prisma";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || !exam.isPublished) notFound();

  const allowed = await hasAccess(session.user.id, "EXAM", exam.id);
  if (!allowed) redirect("/exams");

  const attempt = await prisma.examAttempt.findFirst({
    where: {
      userId: session.user.id,
      examId: exam.id,
      status: AttemptStatus.IN_PROGRESS,
    },
    include: { answers: true },
  });

  if (!attempt) {
    redirect("/exams");
  }

  const token = createSignedFileToken({
    userId: session.user.id,
    itemType: "EXAM",
    itemId: exam.id,
  });

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-full px-3 py-3 md:px-6">
      <ExamRoom
        exam={{
          id: exam.id,
          title: exam.title,
          totalQuestions: exam.totalQuestions,
          optionsCount: exam.optionsCount,
          skipOptionEnabled: exam.skipOptionEnabled,
          durationMinutes: exam.durationMinutes,
          marksPerQuestion: exam.marksPerQuestion,
          negativeMarking: exam.negativeMarking,
        }}
        attempt={{
          id: attempt.id,
          startedAt: attempt.startedAt.toISOString(),
          answers: attempt.answers,
        }}
        paperUrl={signedFilePath(token)}
        confirmBeforeLocking={settings?.confirmBeforeLocking ?? true}
      />
    </div>
  );
}
