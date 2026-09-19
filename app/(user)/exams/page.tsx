import Link from "next/link";
import { AttemptStatus } from "@prisma/client";
import { BuyButton } from "@/components/catalog/buy-button";
import { StartExamButton } from "@/components/exam/start-exam-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { hasAccess } from "@/lib/access-control";
import { markingSummary } from "@/lib/marking";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ExamsPage() {
  const user = await requireUser();
  const [exams, attempts] = await Promise.all([
    prisma.exam.findMany({
      where: { isPublished: true },
      include: { subject: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.examAttempt.findMany({
      where: { userId: user.id },
      include: { exam: true },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const rows = await Promise.all(
    exams.map(async (exam) => ({
      exam,
      allowed: await hasAccess(user.id, "EXAM", exam.id),
      inProgress: attempts.find(
        (attempt) =>
          attempt.examId === exam.id && attempt.status === AttemptStatus.IN_PROGRESS,
      ),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Mock exams</h1>
        <p className="mt-2 text-muted-foreground">
          Read the hall instructions first. The clock starts only after you agree.
          A second in-progress attempt is never created.
        </p>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No exams published"
          description="The admin exam builder can publish a mock in four steps."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(({ exam, allowed, inProgress }) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{exam.title}</CardTitle>
                  {exam.isFree ? <Badge tone="success">Free</Badge> : <Badge>Paid</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {exam.subject?.name ?? "General"} · {exam.durationMinutes} min ·{" "}
                  {markingSummary(exam)}
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {allowed ? (
                  <StartExamButton
                    examId={exam.id}
                    resume={Boolean(inProgress)}
                    label={inProgress ? "Resume exam" : "Read instructions"}
                  />
                ) : (
                  <BuyButton
                    itemType="EXAM"
                    itemId={exam.id}
                    price={exam.price}
                    locked
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <section>
        <h2 className="mb-3 font-display text-2xl">Past attempts</h2>
        {attempts.filter((attempt) => attempt.status !== "IN_PROGRESS").length === 0 ? (
          <EmptyState
            title="No submitted attempts"
            description="Take the free SSC mock to see scoring and review."
            actionHref="/exams"
            actionLabel="Open mocks"
          />
        ) : (
          <div className="grid gap-3">
            {attempts
              .filter((attempt) => attempt.status !== "IN_PROGRESS")
              .map((attempt) => (
                <Card key={attempt.id}>
                  <CardHeader>
                    <CardTitle>{attempt.exam.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Score {attempt.score} · {attempt.correctCount} correct ·{" "}
                      {attempt.wrongCount} wrong · {attempt.status === "AUTO_SUBMITTED" ? "auto-submitted" : "submitted"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/exams/${attempt.examId}/result`}
                      className="text-sm font-semibold text-primary"
                    >
                      Review paper
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
