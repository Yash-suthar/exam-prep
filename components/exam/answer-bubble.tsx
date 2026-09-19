"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnswerBubble({
  option,
  filled,
  locked,
  size = "md",
  variant = "answer",
  onClick,
}: {
  option: string;
  filled: boolean;
  locked: boolean;
  size?: "md" | "lg";
  variant?: "answer" | "skip";
  onClick: () => void;
}) {
  const skip = variant === "skip";
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      title={skip ? "Not attempting — scores zero, no negative marking" : undefined}
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 font-bold",
        size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs",
        skip && "border-dashed",
        filled
          ? skip
            ? "border-slate-500 text-white"
            : "border-ink text-white"
          : skip
            ? "border-slate-400 text-muted-foreground"
            : "border-foreground/40 text-foreground",
        locked && !filled && "opacity-40",
      )}
    >
      {filled ? (
        <motion.span
          className={cn("absolute inset-0 rounded-full", skip ? "bg-slate-500" : "bg-ink")}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        />
      ) : null}
      <span className="relative z-10">{option}</span>
    </button>
  );
}
