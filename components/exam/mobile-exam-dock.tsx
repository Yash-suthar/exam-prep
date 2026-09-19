"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useState } from "react";
import { optionLabelsFor, skipOptionLabel } from "@/lib/marking";
import { AnswerBubble } from "@/components/exam/answer-bubble";
import { OmrSheet } from "@/components/omr/omr-sheet";
import { useAnswerLock } from "@/components/exam/use-answer-lock";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExamStore } from "@/lib/exam-store";
import { cn } from "@/lib/utils";

export function MobileExamDock({
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
  onSubmit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const answers = useExamStore((state) => state.answers);
  const currentQuestion = useExamStore((state) => state.currentQuestion);
  const setCurrent = useExamStore((state) => state.setCurrent);
  const lock = useAnswerLock({ onLock, confirmBeforeLocking });
  const options = optionLabelsFor(optionsCount);
  const skip = skipOptionLabel(optionsCount, skipOptionEnabled);
  const selected = answers[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  function onPointerDown(event: React.PointerEvent) {
    setDragStart(event.clientY);
  }

  function onPointerUp(event: React.PointerEvent) {
    if (dragStart == null) return;
    const delta = dragStart - event.clientY;
    if (delta > 40) setExpanded(true);
    if (delta < -40) setExpanded(false);
    setDragStart(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="fixed right-3 top-20 z-30 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg"
      >
        Answered {answeredCount}/{totalQuestions}
      </button>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card shadow-[0_-8px_30px_rgba(0,0,0,0.12)]",
          expanded ? "top-12 overflow-auto" : "h-[4.6rem]",
        )}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <button
          type="button"
          className="mx-auto mt-1 flex h-5 w-full items-center justify-center text-muted-foreground"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </button>

        {expanded ? (
          <div className="px-4 pb-8">
            <OmrSheet
              attemptId={attemptId}
              totalQuestions={totalQuestions}
              optionsCount={optionsCount}
              skipOptionEnabled={skipOptionEnabled}
              onLock={onLock}
              confirmBeforeLocking={confirmBeforeLocking}
              onSubmit={onSubmit}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 pb-3">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setCurrent(Math.max(1, currentQuestion - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <p className="text-xs font-semibold">
                Q{currentQuestion} of {totalQuestions}
              </p>
              <div className="flex gap-2">
                {options.map((option) => (
                  <AnswerBubble
                    key={option}
                    option={option}
                    size="lg"
                    variant={option === skip ? "skip" : "answer"}
                    filled={selected === option}
                    locked={Boolean(selected)}
                    onClick={() => lock.requestLock(currentQuestion, option)}
                  />
                ))}
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setCurrent(Math.min(totalQuestions, currentQuestion + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={Boolean(lock.pending)} onOpenChange={(open) => !open && lock.setPending(null)}>
        <DialogContent>
          <DialogTitle>
            {lock.pending?.option === skip ? "Mark as not attempted?" : "Lock this answer?"}
          </DialogTitle>
          <DialogDescription>
            {lock.pending?.option === skip
              ? `Question ${lock.pending?.questionNo} will be recorded as not attempted. It scores zero with no negative marking, and cannot be changed.`
              : `Lock option ${lock.pending?.option} for Question ${lock.pending?.questionNo}? This cannot be changed.`}
          </DialogDescription>
          {lock.error ? <p className="mt-3 text-sm text-destructive">{lock.error}</p> : null}
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => lock.setPending(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={lock.confirmPending} disabled={lock.busy}>
              {lock.busy ? "Locking…" : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
