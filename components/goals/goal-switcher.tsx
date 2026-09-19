"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { activateGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";

export function GoalSwitcher({
  goals,
}: {
  goals: { id: string; title: string; subtitle: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No other goals. Archived goals show up here when you park one.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {goals.map((goal) => (
        <li
          key={goal.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{goal.title}</p>
            <p className="truncate text-xs text-muted-foreground">{goal.subtitle}</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const result = await activateGoal(goal.id);
              setBusy(false);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              toast.success("Switched goal.");
              router.push("/goals");
              router.refresh();
            }}
          >
            Make active
          </Button>
        </li>
      ))}
    </ul>
  );
}
