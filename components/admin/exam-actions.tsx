"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteExam, setExamPublished } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function ExamActions({
  examId,
  published,
}: {
  examId: string;
  published: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm">
        <Link href={`/admin/exams/${examId}`}>Edit</Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={async () => {
          await setExamPublished(examId, !published);
          toast.success(published ? "Unpublished." : "Published.");
          router.refresh();
        }}
      >
        {published ? "Unpublish" : "Publish"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={async () => {
          await deleteExam(examId);
          toast.success("Exam deleted.");
          router.refresh();
        }}
      >
        Delete
      </Button>
    </div>
  );
}
