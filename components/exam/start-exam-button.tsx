"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startOrResumeAttempt } from "@/app/actions/exam";
import { Button } from "@/components/ui/button";

export function StartExamButton({
  examId,
  label = "Start exam",
}: {
  examId: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      disabled={busy}
      onClick={async () => {
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
      {busy ? "Opening…" : label}
    </Button>
  );
}
