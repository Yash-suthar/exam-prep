"use client";

import { AccessModel, EducationLevel } from "@prisma/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { publishExam } from "@/app/actions/admin";
import { FileField } from "@/components/admin/file-field";
import { SubjectPicker } from "@/components/admin/subject-picker";
import { TargetingFields, type TargetingValue } from "@/components/admin/targeting-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NEGATIVE_PRESETS,
  answerableOptions,
  markingSummary,
  optionLabelsFor,
} from "@/lib/marking";
import { cn } from "@/lib/utils";

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
  skipOptionEnabled: boolean;
  answerKey: string[];
  topics: (string | null)[];
  accessModel: AccessModel;
  trialDurationDays: number | null;
  targetEducationLevels: EducationLevel[];
  targetStandards: string[];
  targetExamGoals: string[];
};

const STEPS = ["Paper", "Marking", "Answer key", "Audience", "Publish"];

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
  const [subjectList, setSubjectList] = useState(subjects);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? "");
  const [paperUrl, setPaperUrl] = useState(initial?.rawPaperFileUrl ?? "");
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 20);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [accessModel, setAccessModel] = useState<AccessModel>(
    initial?.accessModel ?? (initial?.isFree ? "FREE" : "FREE"),
  );
  const [trialDays, setTrialDays] = useState(String(initial?.trialDurationDays ?? 7));
  const [totalQuestions, setTotalQuestions] = useState(initial?.totalQuestions ?? 20);
  const [optionsCount, setOptionsCount] = useState(initial?.optionsCount ?? 4);
  const [skipOption, setSkipOption] = useState(initial?.skipOptionEnabled ?? false);
  const [marksPerQuestion, setMarksPerQuestion] = useState(initial?.marksPerQuestion ?? 2);
  const [negativeMarking, setNegativeMarking] = useState(initial?.negativeMarking ?? 0.5);
  const [answerKey, setAnswerKey] = useState<string[]>(
    initial?.answerKey ?? Array.from({ length: initial?.totalQuestions ?? 20 }, () => "A"),
  );
  const [topics, setTopics] = useState<string[]>(
    initial?.topics?.map((topic) => topic ?? "") ??
      Array.from({ length: initial?.totalQuestions ?? 20 }, () => ""),
  );
  const [bulkKey, setBulkKey] = useState("");
  const [targeting, setTargeting] = useState<TargetingValue>({
    targetEducationLevels: initial?.targetEducationLevels ?? [],
    targetStandards: initial?.targetStandards ?? [],
    targetExamGoals: initial?.targetExamGoals ?? [],
  });
  const [busy, setBusy] = useState(false);

  const options = useMemo(
    () => answerableOptions(optionsCount, skipOption),
    [optionsCount, skipOption],
  );
  const isFree = accessModel === "FREE";

  function resizeKey(count: number) {
    const size = Math.max(1, Math.min(300, count));
    setTotalQuestions(size);
    setAnswerKey((current) =>
      Array.from({ length: size }, (_, index) => current[index] ?? options[0] ?? "A"),
    );
    setTopics((current) => Array.from({ length: size }, (_, index) => current[index] ?? ""));
  }

  function applyBulkKey() {
    const letters = bulkKey
      .toUpperCase()
      .split("")
      .filter((character) => options.includes(character));
    if (letters.length === 0) {
      toast.error(`Paste a key using ${options.join(", ")} — for example ${options.join("")}.`);
      return;
    }
    setAnswerKey((current) => current.map((value, index) => letters[index] ?? value));
    toast.success(`${Math.min(letters.length, totalQuestions)} answers filled.`);
  }

  async function save(publish: boolean) {
    if (!paperUrl) {
      toast.error("Upload the question paper PDF first.");
      setStep(1);
      return;
    }
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
      skipOptionEnabled: skipOption,
      price: isFree ? 0 : price,
      isFree,
      rawPaperFileUrl: paperUrl,
      answerKey,
      topics: topics.map((topic) => topic.trim() || null),
      isPublished: publish,
      accessModel,
      trialDurationDays: Number(trialDays) || 7,
      ...targeting,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(publish ? "Exam published." : "Saved as draft.");
    router.push("/admin/exams");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 text-sm font-semibold">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index + 1)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 ${
              step === index + 1 ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="SSC CGL Tier-1 Mock — Set B"
            />
          </Field>
          <Field label="Subject">
            <SubjectPicker
              subjects={subjectList}
              value={subjectId}
              onChange={(id, next) => {
                setSubjectId(id);
                if (next) setSubjectList(next);
              }}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Question paper PDF">
              <FileField
                value={paperUrl}
                onChange={setPaperUrl}
                accept="application/pdf"
                hint="Students read this PDF beside the OMR sheet."
              />
            </Field>
            {samplePaperUrl && paperUrl !== samplePaperUrl ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => setPaperUrl(samplePaperUrl)}
              >
                Use the sample paper instead
              </Button>
            ) : null}
          </div>
          <Field label="Duration (minutes)">
            <Input
              type="number"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
            />
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Total questions">
              <Input
                type="number"
                min={1}
                value={totalQuestions}
                onChange={(event) => resizeKey(Number(event.target.value))}
              />
            </Field>
            <Field label="Marks per correct answer">
              <Input
                type="number"
                step="0.25"
                min={0.25}
                value={marksPerQuestion}
                onChange={(event) => setMarksPerQuestion(Number(event.target.value))}
              />
            </Field>
          </div>

          <div>
            <Label>Options per question</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Anything from a single box to A–E. Government papers vary by tier.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setOptionsCount(count);
                    if (count < 2) setSkipOption(false);
                    const allowed = answerableOptions(count, count >= 2 && skipOption);
                    setAnswerKey((current) =>
                      current.map((value) => (allowed.includes(value) ? value : allowed[0] ?? "A")),
                    );
                  }}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-semibold",
                    optionsCount === count
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count} · {optionLabelsFor(count).join("")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Negative marking</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Pick a common scheme or type any value. Zero means no deduction.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {NEGATIVE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  title={preset.hint}
                  onClick={() => setNegativeMarking(preset.value)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-semibold",
                    negativeMarking === preset.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <Input
                type="number"
                step="0.01"
                min={0}
                value={negativeMarking}
                onChange={(event) =>
                  setNegativeMarking(Math.max(0, Number(event.target.value) || 0))
                }
                className="w-32"
                aria-label="Custom negative marking"
              />
            </div>
          </div>

          {optionsCount >= 2 ? (
            <label className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={skipOption}
                onChange={(event) => {
                  const on = event.target.checked;
                  setSkipOption(on);
                  const allowed = answerableOptions(optionsCount, on);
                  setAnswerKey((current) =>
                    current.map((value) => (allowed.includes(value) ? value : allowed[0] ?? "A")),
                  );
                }}
              />
              <span>
                <span className="block text-sm font-semibold">
                  Last option ({optionLabelsFor(optionsCount).at(-1)}) means “not attempted”
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  The student can lock {optionLabelsFor(optionsCount).at(-1)} to declare a skip. It
                  scores zero and never attracts negative marking, so the answer key only uses{" "}
                  {answerableOptions(optionsCount, true).join(", ")}.
                </span>
              </span>
            </label>
          ) : null}

          <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
            <p className="font-semibold">
              {markingSummary({
                totalQuestions,
                marksPerQuestion,
                negativeMarking,
                optionsCount,
                skipOptionEnabled: skipOption,
              })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {negativeMarking > 0
                ? `A wrong answer costs ${negativeMarking}. Leaving a question blank costs nothing.`
                : "Nothing is deducted for a wrong answer on this paper."}
            </p>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <Label>Paste the whole key</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Input
                value={bulkKey}
                onChange={(event) => setBulkKey(event.target.value)}
                placeholder={`${options.join("")} …`}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={applyBulkKey}>
                Fill {totalQuestions} answers
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Valid answers on this paper: {options.join(", ")}.
              {skipOption
                ? ` ${optionLabelsFor(optionsCount).at(-1)} is the "not attempted" bubble, so it is never a correct answer.`
                : ""}{" "}
              Topic per question is optional but powers topic analysis and weak-area drills.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {answerKey.map((value, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-2"
              >
                <span className="w-9 shrink-0 text-xs font-bold">Q{index + 1}</span>
                <select
                  className="h-9 w-16 shrink-0 rounded-lg border border-border bg-background text-sm"
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
                <Input
                  value={topics[index] ?? ""}
                  onChange={(event) =>
                    setTopics((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    )
                  }
                  placeholder="Topic"
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Access">
            <select
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              value={accessModel}
              onChange={(event) => setAccessModel(event.target.value as AccessModel)}
            >
              <option value="FREE">Free (auto-grant to matching students)</option>
              <option value="PAID">Paid</option>
              <option value="FREE_TRIAL">Free trial</option>
            </select>
          </Field>
          <Field label="Price">
            <Input
              type="number"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              disabled={isFree}
            />
          </Field>
          {accessModel === "FREE_TRIAL" ? (
            <Field label="Trial days">
              <Input
                type="number"
                value={trialDays}
                onChange={(event) => setTrialDays(event.target.value)}
              />
            </Field>
          ) : null}
          <TargetingFields value={targeting} onChange={setTargeting} />
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5 text-sm">
          <p>
            <strong>{title || "Untitled exam"}</strong> · {durationMinutes} min ·{" "}
            {isFree ? "Free" : `₹${price}`}
          </p>
          <p className="text-muted-foreground">
            {markingSummary({
              totalQuestions,
              marksPerQuestion,
              negativeMarking,
              optionsCount,
              skipOptionEnabled: skipOption,
            })}
          </p>
          <p className="text-muted-foreground">
            Paper: {paperUrl || "not uploaded yet"}
          </p>
          <p className="text-muted-foreground">
            Topics tagged: {topics.filter((topic) => topic.trim()).length}/{totalQuestions}
          </p>
          <p className="text-muted-foreground">
            Audience:{" "}
            {targeting.targetExamGoals.length ||
            targeting.targetEducationLevels.length ||
            targeting.targetStandards.length
              ? [
                  ...targeting.targetExamGoals,
                  ...targeting.targetStandards,
                  ...targeting.targetEducationLevels,
                ].join(", ")
              : "everyone"}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep((value) => value - 1)}
        >
          Back
        </Button>
        {step < STEPS.length ? (
          <Button type="button" onClick={() => setStep((value) => value + 1)}>
            Continue
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => save(false)}
              disabled={busy || !title}
            >
              Save draft
            </Button>
            <Button type="button" onClick={() => save(true)} disabled={busy || !title}>
              {busy ? "Saving…" : initial?.id ? "Save and publish" : "Publish exam"}
            </Button>
          </div>
        )}
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
