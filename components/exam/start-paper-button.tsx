"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startOrResumeAttempt } from "@/app/actions/exam";
import { Button } from "@/components/ui/button";

export function StartPaperButton({
  examId,
  resume,
}: {
  examId: string;
  resume: boolean;
}) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(resume);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-4">
      {resume ? null : (
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-primary"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I have read the instructions. I understand answers lock once filled,
            negative marking applies, and the paper will auto-submit when time
            ends.
          </span>
        </label>
      )}
      <Button
        type="button"
        size="lg"
        disabled={!agreed || busy}
        onClick={async () => {
          setBusy(true);
          const result = await startOrResumeAttempt(examId);
          if (!result.ok) {
            setBusy(false);
            toast.error(result.error);
            return;
          }
          router.push(`/exams/${examId}/attempt`);
        }}
      >
        {busy ? "Opening hall…" : resume ? "Resume paper" : "I am ready — start the clock"}
      </Button>
    </div>
  );
}
