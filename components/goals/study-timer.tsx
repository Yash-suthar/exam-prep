"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { logStudySession } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [15, 25, 45];

export function StudyTimer({
  goalId,
  topics,
}: {
  goalId: string;
  topics: { id: string; subject: string; name: string }[];
}) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [topicId, setTopicId] = useState("");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

  async function save(value: number) {
    if (value < 1) {
      toast.error("Log at least a minute.");
      return;
    }
    setBusy(true);
    const result = await logStudySession({
      goalId,
      minutes: value,
      topicId: topicId || null,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setRunning(false);
    setSeconds(0);
    setManual("");
    toast.success(`${value} min logged.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-display text-4xl font-semibold tabular-nums">{display}</p>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => setRunning((value) => !value)}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="ml-1.5">{running ? "Pause" : "Start"}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setRunning(false);
              setSeconds(0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || minutes < 1}
            onClick={() => save(minutes)}
          >
            Log {minutes} min
          </Button>
        </div>
      </div>

      {topics.length > 0 ? (
        <select
          className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
          value={topicId}
          onChange={(event) => setTopicId(event.target.value)}
        >
          <option value="">No topic — general study</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.subject} · {topic.name}
            </option>
          ))}
        </select>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => save(preset)}
          >
            +{preset} min
          </Button>
        ))}
        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            max={600}
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            placeholder="Minutes"
            className="w-28"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !manual}
            onClick={() => save(Number(manual))}
          >
            Log
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Logging a topic moves it to Learning and refreshes its revision date.
      </p>
    </div>
  );
}
