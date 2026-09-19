"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveNotice } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NoticeForm() {
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setBusy(true);
        await saveNotice({
          title: String(form.get("title") ?? ""),
          description: String(form.get("description") ?? ""),
          applyLink: String(form.get("applyLink") ?? ""),
          examDate: String(form.get("examDate") || "") || null,
          isPinned: form.get("isPinned") === "on",
        });
        setBusy(false);
        toast.success("Notice published.");
        event.currentTarget.reset();
      }}
    >
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="applyLink">Apply link</Label>
        <Input id="applyLink" name="applyLink" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="examDate">Exam date</Label>
        <Input id="examDate" name="examDate" type="date" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPinned" />
        Pin to top
      </label>
      <div className="md:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add notice"}
        </Button>
      </div>
    </form>
  );
}
