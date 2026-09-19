"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type ResetRequestState } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ResetRequestState = {};

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  if (state.sent) {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-sm">
          If that email has an account, a reset link is ready. This installation has no
          mail provider, so the link appears here instead of your inbox.
        </p>
        {state.resetPath ? (
          <Link
            href={state.resetPath}
            className="block break-all rounded-xl border border-primary/40 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary"
          >
            {state.resetPath}
          </Link>
        ) : null}
        <p className="text-xs text-muted-foreground">The link works once and expires in 30 minutes.</p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Checking…" : "Send reset link"}
      </Button>
    </form>
  );
}
