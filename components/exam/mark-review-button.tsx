"use client";

import { Flag } from "lucide-react";
import { toast } from "sonner";
import { toggleMarkForReview } from "@/app/actions/exam";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/lib/exam-store";

export function MarkReviewButton({
  attemptId,
  questionNo,
}: {
  attemptId: string;
  questionNo: number;
}) {
  const marked = useExamStore((state) => state.marked[questionNo]);
  const toggleMarkLocal = useExamStore((state) => state.toggleMarkLocal);

  return (
    <Button
      type="button"
      size="sm"
      variant={marked ? "default" : "outline"}
      onClick={async () => {
        toggleMarkLocal(questionNo);
        const result = await toggleMarkForReview({ attemptId, questionNo });
        if (!result.ok) {
          toggleMarkLocal(questionNo);
          toast.error(result.error);
        }
      }}
    >
      <Flag className="mr-1.5 h-3.5 w-3.5" />
      {marked ? "Marked" : "Mark for review"}
    </Button>
  );
}
