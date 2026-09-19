"use client";

import { useState } from "react";
import { useExamStore } from "@/lib/exam-store";

export function useAnswerLock({
  onLock,
  confirmBeforeLocking,
}: {
  onLock: (questionNo: number, option: string) => Promise<{ ok: boolean; error?: string }>;
  confirmBeforeLocking: boolean;
}) {
  const answers = useExamStore((state) => state.answers);
  const currentQuestion = useExamStore((state) => state.currentQuestion);
  const lockLocal = useExamStore((state) => state.lockLocal);
  const setCurrent = useExamStore((state) => state.setCurrent);
  const [pending, setPending] = useState<{ questionNo: number; option: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit(questionNo: number, option: string) {
    setBusy(true);
    setError(null);
    const result = await onLock(questionNo, option);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not lock this answer.");
      return false;
    }
    lockLocal(questionNo, option);
    setPending(null);
    return true;
  }

  async function requestLock(questionNo: number, option: string) {
    if (answers[questionNo]) return;
    setCurrent(questionNo);
    setError(null);
    if (confirmBeforeLocking) {
      setPending({ questionNo, option });
      return;
    }
    await commit(questionNo, option);
  }

  async function confirmPending() {
    if (!pending) return;
    await commit(pending.questionNo, pending.option);
  }

  return {
    answers,
    currentQuestion,
    setCurrent,
    pending,
    setPending,
    busy,
    error,
    requestLock,
    confirmPending,
  };
}
