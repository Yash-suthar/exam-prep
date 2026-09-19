"use client";

import { paletteStatus, useExamStore } from "@/lib/exam-store";
import { cn } from "@/lib/utils";

export function QuestionPalette({ totalQuestions }: { totalQuestions: number }) {
  const answers = useExamStore((state) => state.answers);
  const marked = useExamStore((state) => state.marked);
  const visited = useExamStore((state) => state.visited);
  const currentQuestion = useExamStore((state) => state.currentQuestion);
  const setCurrent = useExamStore((state) => state.setCurrent);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNo = index + 1;
          const status = paletteStatus(questionNo, answers, marked, visited);
          return (
            <button
              key={questionNo}
              type="button"
              onClick={() => setCurrent(questionNo)}
              className={cn(
                "relative h-8 min-w-8 rounded-md px-1.5 text-xs font-bold",
                status === "not-visited" && "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
                status === "not-answered" && "bg-red-500 text-white",
                status === "answered" && "bg-emerald-600 text-white",
                status === "marked" && "bg-violet-600 text-white",
                status === "answered-marked" && "bg-violet-600 text-white",
                currentQuestion === questionNo && "ring-2 ring-ink ring-offset-2 ring-offset-card",
              )}
            >
              {questionNo}
              {status === "answered-marked" ? (
                <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-emerald-400" />
              ) : null}
            </button>
          );
        })}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <Legend swatch="bg-slate-200 dark:bg-slate-700" label="Not visited" />
        <Legend swatch="bg-red-500" label="Not answered" />
        <Legend swatch="bg-emerald-600" label="Answered" />
        <Legend swatch="bg-violet-600" label="Marked" />
      </ul>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-sm", swatch)} />
      {label}
    </li>
  );
}
