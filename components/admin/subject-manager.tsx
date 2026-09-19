"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSubject, saveSubject } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubjectManager({
  subjects,
}: {
  subjects: { id: string; name: string; books: number; papers: number; exams: number }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    const result = await saveSubject({ name });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setName("");
    toast.success("Subject created.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New subject name"
        />
        <Button type="button" onClick={create} disabled={busy || name.trim().length < 2}>
          {busy ? "Saving…" : "Add subject"}
        </Button>
      </div>
      <div className="space-y-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-2xl border border-border bg-card p-4">
            {editing === subject.id ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={draft} onChange={(event) => setDraft(event.target.value)} />
                <Button
                  type="button"
                  onClick={async () => {
                    const result = await saveSubject({ id: subject.id, name: draft });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    setEditing(null);
                    toast.success("Subject renamed.");
                    router.refresh();
                  }}
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {subject.books} books · {subject.papers} papers · {subject.exams} exams
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(subject.id);
                      setDraft(subject.name);
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      const result = await deleteSubject(subject.id);
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success("Subject deleted.");
                      router.refresh();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
