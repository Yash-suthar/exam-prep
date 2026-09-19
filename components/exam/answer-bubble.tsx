"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnswerBubble({
  option,
  filled,
  locked,
  size = "md",
  onClick,
}: {
  option: string;
  filled: boolean;
  locked: boolean;
  size?: "md" | "lg";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 font-bold",
        size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs",
        filled ? "border-ink text-white" : "border-foreground/40 text-foreground",
        locked && !filled && "opacity-40",
      )}
    >
      {filled ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-ink"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        />
      ) : null}
      <span className="relative z-10">{option}</span>
    </button>
  );
}
