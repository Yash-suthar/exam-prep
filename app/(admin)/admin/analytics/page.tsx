import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: {
      attempts: true,
      questions: true,
    },
  });

  if (exams.length === 0) {
    return (
      <EmptyState
        title="No exam analytics yet"
        description="Publish a mock and wait for a submission."
        actionHref="/admin/exams/new"
        actionLabel="Create exam"
      />
    );
  }

  const selected = exams[0];
  const submitted = selected.attempts.filter(
    (attempt) => attempt.status !== "IN_PROGRESS" && attempt.score != null,
  );
  const average =
    submitted.length === 0
      ? 0
      : submitted.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) /
        submitted.length;

  const buckets = [0, 0, 0, 0, 0];
  for (const attempt of submitted) {
    const max = selected.totalQuestions * selected.marksPerQuestion;
    const ratio = max === 0 ? 0 : (attempt.score ?? 0) / max;
    const index = Math.min(4, Math.floor(ratio * 5));
    buckets[index] += 1;
  }

  const hardest = selected.questions.map((question) => {
    let wrong = 0;
    let total = 0;
    for (const attempt of submitted) {
      total += 1;
    }
    return {
      questionNo: question.questionNo,
      wrongRate: total === 0 ? 0 : Math.round((wrong / total) * 100),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Exam analytics</h1>
        <p className="mt-2 text-muted-foreground">{selected.title}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{submitted.length}</CardTitle>
            <p className="text-sm text-muted-foreground">Submitted attempts</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{average.toFixed(1)}</CardTitle>
            <p className="text-sm text-muted-foreground">Average score</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{selected.totalQuestions}</CardTitle>
            <p className="text-sm text-muted-foreground">Questions</p>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Score distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsCharts
            buckets={buckets}
            hardest={hardest.slice(0, 8)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
