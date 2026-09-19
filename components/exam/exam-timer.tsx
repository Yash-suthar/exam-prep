"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ExamTimer({
  endsAt,
  onExpire,
}: {
  endsAt: string;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(
    () => new Date(endsAt).getTime() - Date.now(),
  );

  useEffect(() => {
    let expired = false;
    const tick = () => {
      const next = new Date(endsAt).getTime() - Date.now();
      setRemaining(next);
      if (next <= 0 && !expired) {
        expired = true;
        onExpire();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt, onExpire]);

  const urgent = remaining <= 5 * 60 * 1000;

  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2 text-center font-mono text-lg font-bold",
        urgent
          ? "animate-pulse bg-red-600 text-white"
          : "bg-ink text-white",
      )}
    >
      {formatRemaining(remaining)}
    </div>
  );
}
