"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteNotice, saveNotice } from "@/app/actions/admin";
import { FileField } from "@/components/admin/file-field";
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
        <Label>Attachments</Label>
        <FileField
          value={attachment}
          onChange={setAttachment}
          hint="Upload the official notification PDF, then press Attach."
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!attachment.trim()}
          onClick={() => {
            setDraft((prev) => ({
              ...prev,
              attachments: [...new Set([...prev.attachments, attachment.trim()])],
            }));
            setAttachment("");
          }}
        >
          Attach
        </Button>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {draft.attachments.map((file) => (
            <li key={file} className="flex items-center justify-between gap-2">
              <span className="truncate">{file}</span>
              <button
                type="button"
                className="font-semibold text-destructive"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    attachments: prev.attachments.filter((item) => item !== file),
                  }))
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
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
