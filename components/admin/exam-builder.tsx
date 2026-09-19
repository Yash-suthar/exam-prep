"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { publishExam } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { optionLabels } from "@/lib/utils";

type Subject = { id: string; name: string };

type ExamDraft = {
  id: string;
  title: string;
  subjectId: string | null;
  durationMinutes: number;
  price: number;
  isFree: boolean;
  totalQuestions: number;
  optionsCount: number;
  marksPerQuestion: number;
  negativeMarking: number;
  rawPaperFileUrl: string;
  isPublished: boolean;
  answerKey: string[];
};

export function ExamBuilder({
  subjects,
  samplePaperUrl,
  initial,
}: {
  subjects: Subject[];
  samplePaperUrl: string;
  initial?: ExamDraft;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? "");
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 20);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [isFree, setIsFree] = useState(initial?.isFree ?? true);
  const [totalQuestions, setTotalQuestions] = useState(initial?.totalQuestions ?? 20);
  const [optionsCount, setOptionsCount] = useState(initial?.optionsCount ?? 4);
  const [marksPerQuestion, setMarksPerQuestion] = useState(initial?.marksPerQuestion ?? 2);
  const [negativeMarking, setNegativeMarking] = useState(initial?.negativeMarking ?? 0.5);
  const [answerKey, setAnswerKey] = useState<string[]>(
    initial?.answerKey ?? Array.from({ length: initial?.totalQuestions ?? 20 }, () => "A"),
  );
  const [busy, setBusy] = useState(false);

  const options = useMemo(() => optionLabels(optionsCount), [optionsCount]);

  function resizeKey(count: number) {
    setTotalQuestions(count);
    setAnswerKey((current) =>
      Array.from({ length: count }, (_, index) => current[index] ?? "A"),
    );
  }

  async function onPublish() {
    setBusy(true);
    const result = await publishExam({
      id: initial?.id,
      title,
      subjectId,
      durationMinutes,
      totalQuestions,
      marksPerQuestion,
      negativeMarking,
      optionsCount,
      price: isFree ? 0 : price,
      isFree,
      rawPaperFileUrl: samplePaperUrl,
      answerKey,
      isPublished: initial?.isPublished ?? true,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(initial?.id ? "Exam updated." : "Exam published.");
    router.push("/admin/exams");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-sm font-semibold">
        {[1, 2, 3, 4].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStep(value)}
            className={`rounded-full px-3 py-1 ${step === value ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            Step {value}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label="Subject">
            <select
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Duration (minutes)">
            <Input
              type="number"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
            />
          </Field>
          <Field label="Price">
            <Input
              type="number"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              disabled={isFree}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(event) => setIsFree(event.target.checked)}
            />
            Free exam
          </label>
          <p className="text-sm text-muted-foreground md:col-span-2">
            This first slice reuses the seeded question-paper PDF so you can publish
            immediately. Upload wiring can replace the file path later.
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Total questions">
            <Input
              type="number"
              value={totalQuestions}
              onChange={(event) => resizeKey(Number(event.target.value))}
            />
          </Field>
          <Field label="Options">
            <select
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              value={optionsCount}
              onChange={(event) => setOptionsCount(Number(event.target.value))}
            >
              <option value={4}>A–D</option>
              <option value={5}>A–E</option>
            </select>
          </Field>
          <Field label="Marks per question">
            <Input
              type="number"
              value={marksPerQuestion}
              onChange={(event) => setMarksPerQuestion(Number(event.target.value))}
            />
          </Field>
          <Field label="Negative marking">
            <Input
              type="number"
              step="0.25"
              value={negativeMarking}
              onChange={(event) => setNegativeMarking(Number(event.target.value))}
            />
          </Field>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {answerKey.map((value, index) => (
            <label key={index} className="rounded-xl border border-border p-2 text-xs">
              Q{index + 1}
              <select
                className="mt-1 h-8 w-full rounded-lg border border-border bg-card"
                value={value}
                onChange={(event) =>
                  setAnswerKey((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
              >
                {options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="rounded-2xl border border-border bg-card p-5 text-sm">
          <p>
            <strong>{title || "Untitled exam"}</strong> · {totalQuestions} questions ·{" "}
            {durationMinutes} min · {isFree ? "Free" : `₹${price}`}
          </p>
          <p className="mt-2 text-muted-foreground">
            +{marksPerQuestion} correct / −{negativeMarking} wrong · options{" "}
            {options.join(", ")}
          </p>
        </div>
      ) : null}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep((value) => value - 1)}
        >
          Back
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={() => setStep((value) => value + 1)}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={onPublish} disabled={busy || !title}>
            {busy ? "Saving…" : initial?.id ? "Save exam" : "Publish exam"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
