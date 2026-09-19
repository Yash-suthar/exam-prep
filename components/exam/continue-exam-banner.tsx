import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ContinueExamBanner({
  exam,
}: {
  exam: { examId: string; title: string };
}) {
  return (
    <div className="border-b border-amber-300/60 bg-amber-100/80 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <p className="text-sm font-medium">
          You have an exam in progress: {exam.title}
        </p>
        <Button asChild size="sm">
          <Link href={`/exams/${exam.examId}/attempt`}>Continue exam</Link>
        </Button>
      </div>
    </div>
  );
}
