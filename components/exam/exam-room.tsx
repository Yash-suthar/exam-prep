"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { lockAnswer, submitAttempt } from "@/app/actions/exam";
import { saveConfirmBeforeLocking } from "@/app/actions/settings";
import { MobileExamDock } from "@/components/exam/mobile-exam-dock";
import { OmrSheet } from "@/components/omr/omr-sheet";
import { ExamTimer } from "@/components/exam/exam-timer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExamStore } from "@/lib/exam-store";

const PdfViewer = dynamic(
  () => import("@/components/pdf-viewer/pdf-viewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[28rem] w-full rounded-2xl" />,
  },
);

type ExamRoomProps = {
  exam: {
    id: string;
    title: string;
    totalQuestions: number;
    optionsCount: number;
    skipOptionEnabled: boolean;
    durationMinutes: number;
    marksPerQuestion: number;
    negativeMarking: number;
  };
  attempt: {
    id: string;
    startedAt: string;
    answers: { questionNo: number; selectedOption: string | null; markedForReview: boolean }[];
  };
  paperUrl: string;
  confirmBeforeLocking: boolean;
};

export function ExamRoom({ exam, attempt, paperUrl, confirmBeforeLocking }: ExamRoomProps) {
  const router = useRouter();
  const hydrate = useExamStore((state) => state.hydrate);
  const answers = useExamStore((state) => state.answers);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmLock, setConfirmLock] = useState(confirmBeforeLocking);

  useEffect(() => {
    const mapped: Record<number, string> = {};
    const marked: Record<number, boolean> = {};
    for (const answer of attempt.answers) {
      if (answer.selectedOption) mapped[answer.questionNo] = answer.selectedOption;
      if (answer.markedForReview) marked[answer.questionNo] = true;
    }
    hydrate({ answers: mapped, marked });
  }, [attempt.answers, hydrate]);

  const endsAt = useMemo(
    () =>
      new Date(
        new Date(attempt.startedAt).getTime() + exam.durationMinutes * 60_000,
      ).toISOString(),
    [attempt.startedAt, exam.durationMinutes],
  );

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = exam.totalQuestions - answeredCount;

  const finish = useCallback(
    async (auto = false) => {
      if (submitting) return;
      setSubmitting(true);
      const result = await submitAttempt(attempt.id, auto);
      if (!result.ok) {
        setSubmitting(false);
        toast.error(result.error);
        return;
      }
      toast.success(auto ? "Time up — paper submitted." : "Exam submitted.");
      router.push(`/exams/${exam.id}/result`);
    },
    [attempt.id, exam.id, router, submitting],
  );

  async function onLock(questionNo: number, option: string) {
    return lockAnswer({
      attemptId: attempt.id,
      questionNo,
      selectedOption: option,
    });
  }

  const remainingMs = new Date(endsAt).getTime() - Date.now();

  return (
    <div className="flex min-h-[calc(100dvh-1rem)] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Live exam</p>
          <h1 className="font-display text-xl font-semibold sm:text-2xl">{exam.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <Switch
              checked={confirmLock}
              onCheckedChange={async (value) => {
                setConfirmLock(value);
                await saveConfirmBeforeLocking(value);
              }}
            />
            Confirm before locking
          </label>
          <ExamTimer endsAt={endsAt} onExpire={() => finish(true)} />
          <Button type="button" className="hidden lg:inline-flex" onClick={() => setSubmitOpen(true)}>
            Submit exam
          </Button>
        </div>
      </div>

      <div className="hidden min-h-0 flex-1 gap-4 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <PdfViewer fileUrl={paperUrl} />
        <aside className="overflow-auto rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-semibold">OMR answer sheet</p>
          <OmrSheet
            attemptId={attempt.id}
            totalQuestions={exam.totalQuestions}
            optionsCount={exam.optionsCount}
            skipOptionEnabled={exam.skipOptionEnabled}
            onLock={onLock}
            confirmBeforeLocking={confirmLock}
          />
        </aside>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="min-h-[70dvh] flex-1 pb-24">
          <PdfViewer fileUrl={paperUrl} />
        </div>
        <MobileExamDock
          attemptId={attempt.id}
          totalQuestions={exam.totalQuestions}
          optionsCount={exam.optionsCount}
          skipOptionEnabled={exam.skipOptionEnabled}
          onLock={onLock}
          confirmBeforeLocking={confirmLock}
          onSubmit={() => setSubmitOpen(true)}
        />
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogTitle>Submit this paper?</DialogTitle>
          <DialogDescription>
            Answered {answeredCount} · Unanswered {unansweredCount} · Time left{" "}
            {Math.max(0, Math.ceil(remainingMs / 60000))} min.{" "}
            {exam.negativeMarking > 0
              ? `Negative marking is ${exam.negativeMarking} per wrong answer.`
              : "This paper has no negative marking."}
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setSubmitOpen(false)}>
              Keep attempting
            </Button>
            <Button type="button" onClick={() => finish(false)} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
