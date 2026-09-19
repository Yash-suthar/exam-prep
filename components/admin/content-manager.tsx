"use client";

import { AccessModel, EducationLevel } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteBook,
  deleteMaterial,
  deletePaper,
  saveBook,
  saveMaterial,
  savePaper,
} from "@/app/actions/admin";
import { FileField } from "@/components/admin/file-field";
import { SubjectPicker } from "@/components/admin/subject-picker";
import { TargetingFields, type TargetingValue } from "@/components/admin/targeting-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInr } from "@/lib/utils";

type BookRow = {
  id: string;
  title: string;
  subjectId: string;
  fileUrl: string;
  price: number;
  accessModel: AccessModel;
  trialDurationDays: number | null;
  targetEducationLevels: EducationLevel[];
  targetStandards: string[];
  targetExamGoals: string[];
  subjectName: string;
};

type MaterialRow = {
  id: string;
  title: string;
  fileUrl: string;
  price: number;
  tags: string[];
  accessModel: AccessModel;
  trialDurationDays: number | null;
  targetEducationLevels: EducationLevel[];
  targetStandards: string[];
  targetExamGoals: string[];
};

type PaperRow = {
  id: string;
  title: string;
  subjectId: string;
  year: number | null;
  fileUrl: string;
  price: number;
  accessModel: AccessModel;
  trialDurationDays: number | null;
  targetEducationLevels: EducationLevel[];
  targetStandards: string[];
  targetExamGoals: string[];
  subjectName: string;
};

const emptyTarget: TargetingValue = {
  targetEducationLevels: [],
  targetStandards: [],
  targetExamGoals: [],
};

export function ContentManager({
  subjects,
  books,
  materials,
  papers,
}: {
  subjects: { id: string; name: string }[];
  books: BookRow[];
  materials: MaterialRow[];
  papers: PaperRow[];
}) {
  const [tab, setTab] = useState<"BOOK" | "MATERIAL" | "PAPER">("BOOK");
  const [editing, setEditing] = useState<string | "new" | null>("new");
  const [subjectList, setSubjectList] = useState(subjects);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Need a subject that is not in the list? Add it under the subject field, or open{" "}
        <a href="/admin/subjects" className="font-semibold text-primary">
          Subjects
        </a>
        .
      </p>

      <div className="flex flex-wrap gap-2">
        {(["BOOK", "MATERIAL", "PAPER"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value);
              setEditing("new");
            }}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold ${
              tab === value ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {value === "BOOK" ? "Books" : value === "MATERIAL" ? "Materials" : "Papers"}
          </button>
        ))}
      </div>

      <Button type="button" onClick={() => setEditing("new")}>
        New {tab === "BOOK" ? "book" : tab === "MATERIAL" ? "material" : "paper"}
      </Button>

      {editing === "new" ? (
        <ItemForm
          kind={tab}
          subjects={subjectList}
          onSubjectsChange={setSubjectList}
          onDone={() => toast.success("Saved.")}
        />
      ) : null}

      <div className="space-y-3">
        {tab === "BOOK"
          ? books.map((book) => (
              <Row
                key={book.id}
                title={book.title}
                meta={`${book.subjectName} · ${book.accessModel}`}
                price={book.price}
                accessModel={book.accessModel}
                open={editing === book.id}
                onEdit={() => setEditing(editing === book.id ? null : book.id)}
                onDelete={async () => {
                  await deleteBook(book.id);
                  toast.success("Book removed.");
                }}
              >
                <ItemForm kind="BOOK" subjects={subjectList} onSubjectsChange={setSubjectList} book={book} onDone={() => toast.success("Book updated.")} />
              </Row>
            ))
          : null}
        {tab === "MATERIAL"
          ? materials.map((material) => (
              <Row
                key={material.id}
                title={material.title}
                meta={material.tags.join(", ") || "Notes"}
                price={material.price}
                accessModel={material.accessModel}
                open={editing === material.id}
                onEdit={() => setEditing(editing === material.id ? null : material.id)}
                onDelete={async () => {
                  await deleteMaterial(material.id);
                  toast.success("Material removed.");
                }}
              >
                <ItemForm kind="MATERIAL" subjects={subjectList} onSubjectsChange={setSubjectList} material={material} onDone={() => toast.success("Material updated.")} />
              </Row>
            ))
          : null}
        {tab === "PAPER"
          ? papers.map((paper) => (
              <Row
                key={paper.id}
                title={paper.title}
                meta={`${paper.subjectName}${paper.year ? ` · ${paper.year}` : ""}`}
                price={paper.price}
                accessModel={paper.accessModel}
                open={editing === paper.id}
                onEdit={() => setEditing(editing === paper.id ? null : paper.id)}
                onDelete={async () => {
                  await deletePaper(paper.id);
                  toast.success("Paper removed.");
                }}
              >
                <ItemForm kind="PAPER" subjects={subjectList} onSubjectsChange={setSubjectList} paper={paper} onDone={() => toast.success("Paper updated.")} />
              </Row>
            ))
          : null}
      </div>
    </div>
  );
}

function Row({
  title,
  meta,
  price,
  accessModel,
  open,
  onEdit,
  onDelete,
  children,
}: {
  title: string;
  meta: string;
  price: number;
  accessModel: AccessModel;
  open: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {accessModel === "FREE" ? <Badge tone="success">Free</Badge> : <Badge>{formatInr(price)}</Badge>}
          <Button type="button" size="sm" variant="outline" onClick={onEdit}>
            {open ? "Close" : "Edit"}
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
      {open ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

function ItemForm({
  kind,
  subjects,
  onSubjectsChange,
  book,
  material,
  paper,
  onDone,
}: {
  kind: "BOOK" | "MATERIAL" | "PAPER";
  subjects: { id: string; name: string }[];
  onSubjectsChange?: (subjects: { id: string; name: string }[]) => void;
  book?: BookRow;
  material?: MaterialRow;
  paper?: PaperRow;
  onDone: () => void;
}) {
  const current = book ?? material ?? paper;
  const [title, setTitle] = useState(current?.title ?? "");
  const [subjectId, setSubjectId] = useState(book?.subjectId ?? paper?.subjectId ?? subjects[0]?.id ?? "");
  const [fileUrl, setFileUrl] = useState(current?.fileUrl ?? "");
  const [price, setPrice] = useState(String(current?.price ?? 99));
  const [tags, setTags] = useState(material?.tags.join(", ") ?? "");
  const [year, setYear] = useState(String(paper?.year ?? ""));
  const [accessModel, setAccessModel] = useState<AccessModel>(current?.accessModel ?? "PAID");
  const [trialDays, setTrialDays] = useState(String(current?.trialDurationDays ?? 7));
  const [targeting, setTargeting] = useState<TargetingValue>(
    current
      ? {
          targetEducationLevels: current.targetEducationLevels,
          targetStandards: current.targetStandards,
          targetExamGoals: current.targetExamGoals,
        }
      : emptyTarget,
  );
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const payload = {
      title,
      fileUrl,
      price: Number(price) || 0,
      accessModel,
      trialDurationDays: Number(trialDays) || 7,
      ...targeting,
    };
    if (kind === "BOOK") {
      await saveBook({ ...payload, id: book?.id, subjectId });
    } else if (kind === "MATERIAL") {
      await saveMaterial({
        ...payload,
        id: material?.id,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
    } else {
      await savePaper({
        ...payload,
        id: paper?.id,
        subjectId,
        year: year ? Number(year) : null,
      });
    }
    setBusy(false);
    onDone();
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-background p-4 md:grid-cols-2">
      <Field label="Title">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      {kind !== "MATERIAL" ? (
        <Field label="Subject">
          <SubjectPicker
            subjects={subjects}
            value={subjectId}
            onChange={(id, next) => {
              setSubjectId(id);
              if (next) onSubjectsChange?.(next);
            }}
          />
        </Field>
      ) : (
        <Field label="Tags">
          <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="ssc, quant" />
        </Field>
      )}
      <Field label="File">
        <FileField value={fileUrl} onChange={setFileUrl} />
      </Field>
      {kind === "PAPER" ? (
        <Field label="Year">
          <Input value={year} onChange={(event) => setYear(event.target.value)} />
        </Field>
      ) : null}
      <Field label="Access">
        <select
          className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
          value={accessModel}
          onChange={(event) => setAccessModel(event.target.value as AccessModel)}
        >
          <option value="PAID">Paid</option>
          <option value="FREE">Free (auto-grant)</option>
          <option value="FREE_TRIAL">Free trial</option>
        </select>
      </Field>
      <Field label="Price">
        <Input
          type="number"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          disabled={accessModel === "FREE"}
        />
      </Field>
      {accessModel === "FREE_TRIAL" ? (
        <Field label="Trial days">
          <Input type="number" value={trialDays} onChange={(event) => setTrialDays(event.target.value)} />
        </Field>
      ) : null}
      <TargetingFields value={targeting} onChange={setTargeting} />
      <div className="md:col-span-2">
        <Button type="button" onClick={submit} disabled={busy || !title || !fileUrl}>
          {busy ? "Saving…" : current ? "Update item" : "Create item"}
        </Button>
        {!fileUrl ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Upload a PDF first so students have something to open.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
