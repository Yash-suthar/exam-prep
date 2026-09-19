"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { addMilestone, removeMilestone, toggleMilestone } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Milestone = {
  id: string;
  title: string;
  dueDate: string | null;
  isDone: boolean;
};

export function MilestoneList({
  goalId,
  milestones,
}: {
  goalId: string;
  milestones: Milestone[];
}) {
  const [items, setItems] = useState(milestones);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No milestones yet. Break the goal into three or four checkpoints.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((milestone) => {
            const overdue =
              !milestone.isDone &&
              milestone.dueDate != null &&
              new Date(milestone.dueDate) < new Date();
            return (
              <li
                key={milestone.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
                  milestone.isDone ? "border-emerald-200 bg-emerald-500/5" : "border-border bg-card",
                )}
              >
                <label className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 accent-emerald-600"
                    checked={milestone.isDone}
                    onChange={async (event) => {
                      const next = event.target.checked;
                      setItems((prev) =>
                        prev.map((item) =>
                          item.id === milestone.id ? { ...item, isDone: next } : item,
                        ),
                      );
                      const result = await toggleMilestone(milestone.id, next);
                      if (!result.ok) {
                        setItems((prev) =>
                          prev.map((item) =>
                            item.id === milestone.id ? { ...item, isDone: !next } : item,
                          ),
                        );
                        toast.error(result.error);
                      }
                    }}
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-sm font-medium",
                        milestone.isDone && "line-through opacity-60",
                      )}
                    >
                      {milestone.title}
                    </span>
                    {milestone.dueDate ? (
                      <span
                        className={cn(
                          "text-[11px]",
                          overdue ? "font-semibold text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {overdue ? "Overdue · " : "Due "}
                        {new Date(milestone.dueDate).toLocaleDateString("en-IN")}
                      </span>
                    ) : null}
                  </span>
                </label>
                <button
                  type="button"
                  className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted"
                  onClick={async () => {
                    const previous = items;
                    setItems((prev) => prev.filter((item) => item.id !== milestone.id));
                    const result = await removeMilestone(milestone.id);
                    if (!result.ok) {
                      setItems(previous);
                      toast.error(result.error);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Finish Polity first pass"
        />
        <Input
          type="date"
          value={due}
          onChange={(event) => setDue(event.target.value)}
          className="sm:w-44"
        />
        <Button
          type="button"
          disabled={busy || !title.trim()}
          onClick={async () => {
            setBusy(true);
            const result = await addMilestone({ goalId, title, dueDate: due || null });
            setBusy(false);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Milestone added.");
            setTitle("");
            setDue("");
            window.location.reload();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
