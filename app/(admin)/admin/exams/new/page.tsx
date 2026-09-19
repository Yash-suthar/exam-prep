import { ExamBuilder } from "@/components/admin/exam-builder";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function NewExamPage() {
  await requireAdmin();
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  const sample = await prisma.exam.findFirst({
    where: { rawPaperFileUrl: { not: "" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Exam builder</h1>
        <p className="mt-2 text-muted-foreground">
          Four steps: paper details, marking scheme, answer key, publish.
        </p>
      </div>
      <ExamBuilder
        subjects={subjects}
        samplePaperUrl={sample?.rawPaperFileUrl ?? "uploads/ssc-cgl-tier1.pdf"}
      />
    </div>
  );
}
