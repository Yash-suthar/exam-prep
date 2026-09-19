"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveConfirmBeforeLocking } from "@/app/actions/settings";
import { Switch } from "@/components/ui/switch";

export function LockSetting({ initial }: { initial: boolean }) {
  const [value, setValue] = useState(initial);

  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
      <div>
        <p className="text-sm font-semibold">Confirm before locking a bubble</p>
        <p className="text-xs text-muted-foreground">
          Same as the hall switch. Turn off only if you want ink on the first tap.
        </p>
      </div>
      <Switch
        checked={value}
        onCheckedChange={async (next) => {
          setValue(next);
          const result = await saveConfirmBeforeLocking(next);
          if (!result.ok) {
            setValue(!next);
            toast.error("Could not save that setting.");
          }
        }}
      />
    </label>
  );
}
