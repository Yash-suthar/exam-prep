"use client";

import { useActionState, useState } from "react";
import { continueWithGoogle, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GoogleAuthForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(continueWithGoogle, {} as AuthFormState);

  return (
    <div className="mt-4">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen((value) => !value)}
      >
        Continue with Google
      </Button>
      {open ? (
        <form action={formAction} className="mt-4 space-y-3 rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">
            Demo Google signup — enter the name and email on the Google account. Real Google OAuth
            starts automatically when client keys are configured.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="google-name">Name on Google</Label>
            <Input id="google-name" name="name" required minLength={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="google-email">Google email</Label>
            <Input id="google-email" name="email" type="email" required />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Connecting…" : "Continue"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
