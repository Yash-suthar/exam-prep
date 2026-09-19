import Link from "next/link";
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Exams</h1>
          <p className="mt-2 text-muted-foreground">
            Publish a mock with a compact answer-key grid.
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
              <div className="flex items-center justify-between">
                <CardTitle>{exam.title}</CardTitle>
                {exam.isPublished ? (
                  <Badge tone="success">Published</Badge>
                ) : (
                  <Badge>Draft</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {exam._count.questions} questions · {exam._count.attempts} attempts · −
              {exam.negativeMarking}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
