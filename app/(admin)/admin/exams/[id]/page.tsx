import { notFound } from "next/navigation";
import { ExamBuilder } from "@/components/admin/exam-builder";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [exam, subjects] = await Promise.all([
    prisma.exam.findUnique({
      where: { id },
      include: { questions: { orderBy: { questionNo: "asc" } } },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!exam) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Edit exam</h1>
        <p className="mt-2 text-muted-foreground">Update the paper, marking, or answer key.</p>
      </div>
      <ExamBuilder
        subjects={subjects}
        samplePaperUrl={exam.rawPaperFileUrl}
        initial={{
          id: exam.id,
          title: exam.title,
          subjectId: exam.subjectId,
          durationMinutes: exam.durationMinutes,
          price: exam.price,
          isFree: exam.isFree,
          totalQuestions: exam.totalQuestions,
          optionsCount: exam.optionsCount,
          marksPerQuestion: exam.marksPerQuestion,
          negativeMarking: exam.negativeMarking,
          rawPaperFileUrl: exam.rawPaperFileUrl,
          isPublished: exam.isPublished,
          answerKey: exam.questions.map((question) => question.correctOption),
          topics: exam.questions.map((question) => question.topic),
          accessModel: exam.accessModel,
          trialDurationDays: exam.trialDurationDays,
          targetEducationLevels: exam.targetEducationLevels,
          targetStandards: exam.targetStandards,
          targetExamGoals: exam.targetExamGoals,
        }}
      />
    </div>
  );
}
