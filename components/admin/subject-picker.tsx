"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveSubject } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubjectPicker({
  subjects,
  value,
  onChange,
}: {
  subjects: { id: string; name: string }[];
  value: string;
  onChange: (id: string, next?: { id: string; name: string }[]) => void;
}) {
  const [list, setList] = useState(subjects);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-2">
      <select
        className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value, list)}
      >
        {list.length === 0 ? <option value="">No subjects yet</option> : null}
        {list.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
      {adding ? (
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Organic Chemistry"
          />
          <Button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const result = await saveSubject({ name });
              setBusy(false);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              const next = [...list, { id: result.id, name: result.name }];
              setList(next);
              onChange(result.id, next);
              setName("");
              setAdding(false);
              toast.success("Subject added.");
            }}
          >
            {busy ? "Adding…" : "Save"}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          className="text-sm font-semibold text-primary"
          onClick={() => setAdding(true)}
        >
          + Add new subject
        </button>
      )}
    </div>
  );
}
