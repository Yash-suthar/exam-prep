import { SubjectManager } from "@/components/admin/subject-manager";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminSubjectsPage() {
  await requireAdmin();
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { books: true, papers: true, exams: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Subjects</h1>
        <p className="mt-2 text-muted-foreground">
          Add Physics, TAT, or anything else. New names appear in exam, book, and paper forms.
        </p>
      </div>
      <SubjectManager
        subjects={subjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
          books: subject._count.books,
          papers: subject._count.papers,
          exams: subject._count.exams,
        }))}
      />
    </div>
  );
}
