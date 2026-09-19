import Link from "next/link";
import { AttemptStatus } from "@prisma/client";
import { StartExamButton } from "@/components/exam/start-exam-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  const [purchases, attempts, notices, exams] = await Promise.all([
    prisma.purchase.count({ where: { userId: user.id, status: "SUCCESS" } }),
    prisma.examAttempt.findMany({
      where: { userId: user.id, status: { not: AttemptStatus.IN_PROGRESS } },
      include: { exam: true },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
    prisma.notice.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.exam.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const scores = attempts
    .map((attempt) => attempt.score)
    .filter((score): score is number => score != null);
  const avg =
    scores.length === 0
      ? 0
      : Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) /
        10;

  const examCards = await Promise.all(
    exams.map(async (exam) => ({
      exam,
      allowed: await hasAccess(user.id, "EXAM", exam.id),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-primary">Good to see you, {user.name}</p>
        <h1 className="mt-1 font-display text-4xl font-semibold">Continue preparing</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Purchases & grants" value={String(purchases)} />
        <Stat title="Exams submitted" value={String(attempts.length)} />
        <Stat title="Average score" value={String(avg)} />
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">Recommended mocks</h2>
          <Link href="/exams" className="text-sm font-semibold text-primary">
            All exams
          </Link>
        </div>
        {examCards.length === 0 ? (
          <EmptyState
            title="No published exams yet"
            description="An admin can publish a mock from the exam builder."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {examCards.map(({ exam, allowed }) => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle>{exam.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {exam.totalQuestions} Q · {exam.durationMinutes} min · −
                    {exam.negativeMarking}
                  </p>
                </CardHeader>
                <CardContent>
                  {allowed ? (
                    <StartExamButton examId={exam.id} />
                  ) : (
                    <Link href="/exams" className="text-sm font-semibold text-primary">
                      Unlock from catalog
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl">Upcoming notices</h2>
        {notices.length === 0 ? (
          <EmptyState
            title="Notice board is quiet"
            description="Official dates and apply links will show up here."
            actionHref="/notices"
            actionLabel="Open notice board"
          />
        ) : (
          <div className="grid gap-3">
            {notices.map((notice) => (
              <Card key={notice.id}>
                <CardHeader>
                  <CardTitle>{notice.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{notice.description}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
