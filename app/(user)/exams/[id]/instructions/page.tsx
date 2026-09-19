import { notFound, redirect } from "next/navigation";
import { AttemptStatus } from "@prisma/client";
import { StartPaperButton } from "@/components/exam/start-paper-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function InstructionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: { subject: true },
  });
  if (!exam || !exam.isPublished) notFound();

  const allowed = await hasAccess(user.id, "EXAM", exam.id);
  if (!allowed) redirect("/exams");

  const inProgress = await prisma.examAttempt.findFirst({
    where: {
      userId: user.id,
      examId: exam.id,
      status: AttemptStatus.IN_PROGRESS,
    },
  });

  const maxScore = exam.totalQuestions * exam.marksPerQuestion;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Exam hall instructions
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          {exam.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {exam.subject?.name ?? "General"} · Read this the way you would on
          the NTA / SSC screen. The clock starts only after you enter the paper.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Questions" value={String(exam.totalQuestions)} />
        <Stat label="Duration" value={`${exam.durationMinutes} min`} />
        <Stat label="Max marks" value={String(maxScore)} />
        <Stat label="Negative" value={`−${exam.negativeMarking}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Before you start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            This mock uses a lock-once OMR. Filling a bubble is final, the same
            way a pen mark is final on a government sheet.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Read the question paper PDF on the left (or full-screen on a phone).</li>
            <li>
              Fill one bubble per question. Marks per correct answer:{" "}
              <strong className="text-foreground">{exam.marksPerQuestion}</strong>.
              Wrong answer deducts{" "}
              <strong className="text-foreground">{exam.negativeMarking}</strong>.
              Unanswered questions score 0.
            </li>
            <li>
              Use <strong className="text-foreground">Mark for review</strong> if
              you want to come back. Marking does not lock an answer.
            </li>
            <li>
              Palette colours match the real hall: grey not visited, red visited
              and blank, green answered, violet marked.
            </li>
            <li>
              Submit before time ends. At 0:00 the server auto-submits and
              scores from the answer key — the browser never decides your marks.
            </li>
          </ol>
          {inProgress ? (
            <Badge tone="warning">You already have this paper open. Resume to keep the same clock.</Badge>
          ) : (
            <Badge>New attempt — timer starts on the next screen</Badge>
          )}
        </CardContent>
      </Card>

      <StartPaperButton
        examId={exam.id}
        resume={Boolean(inProgress)}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
