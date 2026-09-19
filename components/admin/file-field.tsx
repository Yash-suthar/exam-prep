"use client";

import { Paperclip, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FileField({
  value,
  onChange,
  accept = "application/pdf,image/png,image/jpeg,image/webp",
  hint = "Drop a PDF here, or paste a path you already have.",
}: {
  value: string;
  onChange: (path: string) => void;
  accept?: string;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.path);
      toast.success(`${data.name} uploaded.`);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-dashed px-3 py-3 text-sm",
          dragging ? "border-primary bg-primary/5" : "border-border bg-card",
        )}
      >
        <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <Paperclip className="h-4 w-4 shrink-0" />
          <span className="truncate">{value || "No file chosen"}</span>
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          {busy ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = "";
        }}
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="uploads/paper.pdf"
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
