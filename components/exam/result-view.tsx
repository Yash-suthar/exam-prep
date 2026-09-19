"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ReviewRow = {
  questionNo: number;
  selected: string | null;
  correct: string;
};

export function ResultView({
  examTitle,
  score,
  maxScore,
  correctCount,
  wrongCount,
  unattempted,
  review,
}: {
  examTitle: string;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  unattempted: number;
  review: ReviewRow[];
}) {
  const [filter, setFilter] = useState<"all" | "wrong" | "unattempted">("all");
  const percent = maxScore === 0 ? 0 : Math.max(0, Math.round((score / maxScore) * 100));
  const high = percent >= 70;

  const rows = useMemo(() => {
    if (filter === "wrong") {
      return review.filter(
        (row) => row.selected && row.selected !== row.correct,
      );
    }
    if (filter === "unattempted") {
      return review.filter((row) => !row.selected);
    }
    return review;
  }, [filter, review]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-8">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                className="fill-none stroke-muted"
                strokeWidth="10"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                className="fill-none stroke-primary"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 52 * (1 - percent / 100),
                }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute text-center">
              <p className="font-display text-3xl font-semibold">{score}</p>
              <p className="text-xs text-muted-foreground">/ {maxScore}</p>
            </div>
          </div>
          {high ? (
            <p className="mt-3 text-sm font-semibold text-primary">
              Strong paper. Keep this pace.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Review the misses and retake when you are ready.
            </p>
          )}
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Result
          </p>
          <h1 className="font-display text-3xl font-semibold">{examTitle}</h1>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Correct" value={correctCount} tone="success" />
            <Stat label="Wrong" value={wrongCount} tone="warning" />
            <Stat label="Unattempted" value={unattempted} />
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/exams">Back to exams</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {(["all", "wrong", "unattempted"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "All" : value === "wrong" ? "Wrong only" : "Unattempted"}
            </Button>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border">
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Nothing in this filter.
            </p>
          ) : (
            rows.map((row) => {
              const status = !row.selected
                ? "skipped"
                : row.selected === row.correct
                  ? "correct"
                  : "wrong";
              return (
                <div
                  key={row.questionNo}
                  className="grid grid-cols-[4rem_1fr_1fr] gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <span className="text-sm font-semibold">Q{row.questionNo}</span>
                  <span className="text-sm">
                    Your answer:{" "}
                    <strong>{row.selected ?? "—"}</strong>
                  </span>
                  <span className="flex items-center justify-end gap-2 text-sm">
                    Correct: <strong>{row.correct}</strong>
                    <Badge
                      tone={
                        status === "correct"
                          ? "success"
                          : status === "wrong"
                            ? "warning"
                            : "locked"
                      }
                    >
                      {status}
                    </Badge>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4",
        tone === "success" && "border-emerald-200",
        tone === "warning" && "border-amber-200",
      )}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
