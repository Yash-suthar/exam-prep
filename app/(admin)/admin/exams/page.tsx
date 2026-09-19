import Link from "next/link";
import { ExamActions } from "@/components/admin/exam-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminExamsPage() {
  await requireAdmin();
  const exams = await prisma.exam.findMany({
    include: { _count: { select: { attempts: true, questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Exams</h1>
          <p className="mt-2 text-muted-foreground">
            Build a mock, edit the key, publish it, or take it down.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/new">New exam</Link>
        </Button>
      </div>
      <div className="grid gap-4">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>{exam.title}</CardTitle>
                {exam.isPublished ? (
                  <Badge tone="success">Published</Badge>
                ) : (
                  <Badge>Draft</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {exam._count.questions} questions · {exam._count.attempts} attempts · −
                {exam.negativeMarking}
              </p>
              <ExamActions examId={exam.id} published={exam.isPublished} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
