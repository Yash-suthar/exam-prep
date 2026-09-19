"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startOrResumeAttempt } from "@/app/actions/exam";
import { Button } from "@/components/ui/button";

export function StartExamButton({
  examId,
  resume = false,
  label,
}: {
  examId: string;
  resume?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const text = label ?? (resume ? "Resume exam" : "Read instructions");

  return (
    <Button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!resume) {
          router.push(`/exams/${examId}/instructions`);
          return;
        }
        setBusy(true);
        const result = await startOrResumeAttempt(examId);
        setBusy(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        router.push(`/exams/${examId}/attempt`);
      }}
    >
      {busy ? "Opening…" : text}
    </Button>
  );
}
