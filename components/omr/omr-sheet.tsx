"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { optionLabels } from "@/lib/utils";
import { useExamStore } from "@/lib/exam-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function OmrSheet({
  totalQuestions,
  optionsCount,
  onLock,
}: {
  totalQuestions: number;
  optionsCount: number;
  onLock: (questionNo: number, option: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const answers = useExamStore((state) => state.answers);
  const currentQuestion = useExamStore((state) => state.currentQuestion);
  const lockLocal = useExamStore((state) => state.lockLocal);
  const setCurrent = useExamStore((state) => state.setCurrent);
  const options = optionLabels(optionsCount);
  const [pending, setPending] = useState<{
    questionNo: number;
    option: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    setError(null);
    const result = await onLock(pending.questionNo, pending.option);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not lock this answer.");
      return;
    }
    lockLocal(pending.questionNo, pending.option);
    setPending(null);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap gap-1">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNo = index + 1;
          const answered = Boolean(answers[questionNo]);
          return (
            <button
              key={questionNo}
              type="button"
              onClick={() => setCurrent(questionNo)}
              className={cn(
                "h-7 min-w-7 rounded-md px-1.5 text-xs font-semibold",
                answered && "bg-emerald-600 text-white",
                !answered && "bg-muted text-muted-foreground",
                currentQuestion === questionNo && "ring-2 ring-primary",
              )}
            >
              {questionNo}
            </button>
          );
        })}
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
            >
              <span className="text-sm font-semibold">{questionNo}</span>
              <div className="flex gap-2">
                {options.map((option) => {
                  const filled = selected === option;
                  const locked = Boolean(selected);
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        setCurrent(questionNo);
                        setError(null);
                        setPending({ questionNo, option });
                      }}
                      className={cn(
                        "relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold",
                        filled
                          ? "border-ink text-white"
                          : "border-foreground/40 text-foreground",
                        locked && !filled && "opacity-40",
                      )}
                    >
                      {filled ? (
                        <motion.span
                          className="absolute inset-0 rounded-full bg-ink"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        />
                      ) : null}
                      <span className="relative z-10">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={Boolean(pending)} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogTitle>Lock this answer?</DialogTitle>
          <DialogDescription>
            Question {pending?.questionNo}, option {pending?.option}. Once filled,
            this bubble cannot be changed — just like a real OMR sheet.
          </DialogDescription>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirm} disabled={busy}>
              {busy ? "Locking…" : "Fill and lock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
