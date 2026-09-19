import { ContentManager } from "@/components/admin/content-manager";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminContentPage() {
  await requireAdmin();
  const [subjects, books, materials, papers] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.book.findMany({ include: { subject: true }, orderBy: { createdAt: "desc" } }),
    prisma.studyMaterial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.paper.findMany({ include: { subject: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Content</h1>
        <p className="mt-2 text-muted-foreground">
          Create, edit, or delete books, notes, and papers. Free and trial items auto-grant to matching students.
        </p>
      </div>
      <ContentManager
        subjects={subjects}
        books={books.map((book) => ({
          id: book.id,
          title: book.title,
          subjectId: book.subjectId,
          fileUrl: book.fileUrl,
          price: book.price,
          accessModel: book.accessModel,
          trialDurationDays: book.trialDurationDays,
          targetEducationLevels: book.targetEducationLevels,
          targetStandards: book.targetStandards,
          targetExamGoals: book.targetExamGoals,
          subjectName: book.subject.name,
        }))}
        materials={materials.map((material) => ({
          id: material.id,
          title: material.title,
          fileUrl: material.fileUrl,
          price: material.price,
          tags: material.tags,
          accessModel: material.accessModel,
          trialDurationDays: material.trialDurationDays,
          targetEducationLevels: material.targetEducationLevels,
          targetStandards: material.targetStandards,
          targetExamGoals: material.targetExamGoals,
        }))}
        papers={papers.map((paper) => ({
          id: paper.id,
          title: paper.title,
          subjectId: paper.subjectId,
          year: paper.year,
          fileUrl: paper.fileUrl,
          price: paper.price,
          accessModel: paper.accessModel,
          trialDurationDays: paper.trialDurationDays,
          targetEducationLevels: paper.targetEducationLevels,
          targetStandards: paper.targetStandards,
          targetExamGoals: paper.targetExamGoals,
          subjectName: paper.subject.name,
        }))}
      />
    </div>
  );
}
