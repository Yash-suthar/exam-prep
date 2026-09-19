"use client";

import { EducationLevel } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { deleteNotice, saveNotice } from "@/app/actions/admin";
import { TargetingFields, type TargetingValue } from "@/components/admin/targeting-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NoticeDraft = {
  id?: string;
  title: string;
  description: string;
  applyLink: string;
  examDate?: string | null;
  isPinned: boolean;
  attachments: string[];
  visibleFrom?: string | null;
  visibleUntil?: string | null;
  targeting: TargetingValue;
};

const empty: NoticeDraft = {
  title: "",
  description: "",
  applyLink: "",
  examDate: "",
  isPinned: false,
  attachments: [],
  visibleFrom: "",
  visibleUntil: "",
  targeting: {
    targetEducationLevels: [],
    targetStandards: [],
    targetExamGoals: [],
  },
};

export function NoticeForm({ initial }: { initial?: NoticeDraft }) {
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<NoticeDraft>(initial ?? empty);
  const [attachment, setAttachment] = useState("");

  return (
    <form
      className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        await saveNotice({
          id: draft.id,
          title: draft.title,
          description: draft.description,
          applyLink: draft.applyLink,
          examDate: draft.examDate || null,
          isPinned: draft.isPinned,
          attachments: draft.attachments,
          visibleFrom: draft.visibleFrom || null,
          visibleUntil: draft.visibleUntil || null,
          targetEducationLevels: draft.targeting.targetEducationLevels,
          targetStandards: draft.targeting.targetStandards,
          targetExamGoals: draft.targeting.targetExamGoals,
        });
        setBusy(false);
        toast.success(draft.id ? "Notice updated." : "Notice published.");
        if (!draft.id) setDraft(empty);
      }}
    >
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor={`title-${draft.id ?? "new"}`}>Title</Label>
        <Input
          id={`title-${draft.id ?? "new"}`}
          value={draft.title}
          onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor={`description-${draft.id ?? "new"}`}>Description</Label>
        <textarea
          id={`description-${draft.id ?? "new"}`}
          required
          value={draft.description}
          onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
          className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Apply link</Label>
        <Input
          value={draft.applyLink}
          onChange={(event) => setDraft((prev) => ({ ...prev, applyLink: event.target.value }))}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Exam date</Label>
        <Input
          type="date"
          value={draft.examDate ?? ""}
          onChange={(event) => setDraft((prev) => ({ ...prev, examDate: event.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Visible from</Label>
        <Input
          type="datetime-local"
          value={draft.visibleFrom ?? ""}
          onChange={(event) => setDraft((prev) => ({ ...prev, visibleFrom: event.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Visible until</Label>
        <Input
          type="datetime-local"
          value={draft.visibleUntil ?? ""}
          onChange={(event) => setDraft((prev) => ({ ...prev, visibleUntil: event.target.value }))}
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label>Attachments (PDF / image URL)</Label>
        <div className="flex gap-2">
          <Input value={attachment} onChange={(event) => setAttachment(event.target.value)} />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!attachment.trim()) return;
              setDraft((prev) => ({ ...prev, attachments: [...prev.attachments, attachment.trim()] }));
              setAttachment("");
            }}
          >
            Add
          </Button>
        </div>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {draft.attachments.map((file) => (
            <p key={file}>{file}</p>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.isPinned}
          onChange={(event) => setDraft((prev) => ({ ...prev, isPinned: event.target.checked }))}
        />
        Pin to top
      </label>
      <TargetingFields
        value={draft.targeting}
        onChange={(targeting) => setDraft((prev) => ({ ...prev, targeting }))}
      />
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : draft.id ? "Update notice" : "Add notice"}
        </Button>
        {draft.id ? (
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await deleteNotice(draft.id as string);
              setBusy(false);
              toast.success("Notice removed.");
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function noticeToDraft(notice: {
  id: string;
  title: string;
  description: string;
  applyLink: string;
  examDate: Date | null;
  isPinned: boolean;
  attachments: string[];
  visibleFrom: Date | null;
  visibleUntil: Date | null;
  targetEducationLevels: EducationLevel[];
  targetStandards: string[];
  targetExamGoals: string[];
}): NoticeDraft {
  const toLocal = (date: Date | null) =>
    date ? new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "";
  return {
    id: notice.id,
    title: notice.title,
    description: notice.description,
    applyLink: notice.applyLink,
    examDate: notice.examDate ? notice.examDate.toISOString().slice(0, 10) : "",
    isPinned: notice.isPinned,
    attachments: notice.attachments,
    visibleFrom: toLocal(notice.visibleFrom),
    visibleUntil: toLocal(notice.visibleUntil),
    targeting: {
      targetEducationLevels: notice.targetEducationLevels,
      targetStandards: notice.targetStandards,
      targetExamGoals: notice.targetExamGoals,
    },
  };
}
