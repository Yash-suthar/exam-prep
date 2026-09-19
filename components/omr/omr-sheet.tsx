"use client";

import { optionLabelsFor, skipOptionLabel } from "@/lib/marking";
import { AnswerBubble } from "@/components/exam/answer-bubble";
import { MarkReviewButton } from "@/components/exam/mark-review-button";
import { QuestionPalette } from "@/components/exam/question-palette";
import { useAnswerLock } from "@/components/exam/use-answer-lock";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function OmrSheet({
  attemptId,
  totalQuestions,
  optionsCount,
  skipOptionEnabled = false,
  onLock,
  confirmBeforeLocking,
  onSubmit,
}: {
  attemptId: string;
  totalQuestions: number;
  optionsCount: number;
  skipOptionEnabled?: boolean;
  onLock: (questionNo: number, option: string) => Promise<{ ok: boolean; error?: string }>;
  confirmBeforeLocking: boolean;
  onSubmit?: () => void;
}) {
  const {
    answers,
    currentQuestion,
    setCurrent,
    pending,
    setPending,
    busy,
    error,
    requestLock,
    confirmPending,
  } = useAnswerLock({ onLock, confirmBeforeLocking });
  const options = optionLabelsFor(optionsCount);
  const skip = skipOptionLabel(optionsCount, skipOptionEnabled);

  return (
    <div className="flex h-full flex-col">
      <QuestionPalette totalQuestions={totalQuestions} />
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Now on Q{currentQuestion}
        </p>
        <MarkReviewButton attemptId={attemptId} questionNo={currentQuestion} />
      </div>
      <div className="grid gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNo = index + 1;
          const selected = answers[questionNo];
          return (
            <div
              key={questionNo}
              className={cn(
                "grid grid-cols-[2.5rem_1fr] items-center gap-2 rounded-xl px-2 py-1.5",
                currentQuestion === questionNo && "bg-primary/5",
              )}
              onClick={() => setCurrent(questionNo)}
            >
              <span className="text-sm font-semibold">{questionNo}</span>
              <div className="flex gap-2">
                {options.map((option) => (
                  <AnswerBubble
                    key={option}
                    option={option}
                    variant={option === skip ? "skip" : "answer"}
                    filled={selected === option}
                    locked={Boolean(selected)}
                    onClick={() => requestLock(questionNo, option)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {skip ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Bubble {skip} is the “not attempted” mark. It locks the question, scores zero,
          and never costs you negative marks.
        </p>
      ) : null}

      {onSubmit ? (
        <Button type="button" className="mt-6 w-full" onClick={onSubmit}>
          Submit exam
        </Button>
      ) : null}

      <Dialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogTitle>
            {pending?.option === skip ? "Mark as not attempted?" : "Lock this answer?"}
          </DialogTitle>
          <DialogDescription>
            {pending?.option === skip
              ? `Question ${pending?.questionNo} will be recorded as not attempted. It scores zero with no negative marking, and cannot be changed.`
              : `Lock option ${pending?.option} for Question ${pending?.questionNo}? This cannot be changed.`}
          </DialogDescription>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmPending} disabled={busy}>
              {busy ? "Locking…" : "Fill and lock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
