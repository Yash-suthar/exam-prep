"use client";

import { EducationLevel } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { saveOnboarding } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EDUCATION_LEVELS, EXAM_GOALS, STANDARDS, educationLabel, examLabel } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "meritpath-onboarding";

type Draft = {
  educationLevel: EducationLevel | null;
  standard: string | null;
  examGoals: string[];
  govOpen: boolean;
};

const emptyDraft: Draft = {
  educationLevel: null,
  standard: null,
  examGoals: [],
  govOpen: false,
};

export function OnboardingWizard({
  name,
  email,
  initial,
  hasGoal,
  editing,
}: {
  name: string;
  email: string;
  initial: { educationLevel: EducationLevel | null; standard: string | null; examGoals: string[] };
  hasGoal: boolean;
  editing: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [query, setQuery] = useState("");
  const [govQuery, setGovQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    ...emptyDraft,
    educationLevel: initial.educationLevel,
    standard: initial.standard,
    examGoals: initial.examGoals,
  });

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw || initial.educationLevel) return;
    try {
      const parsed = JSON.parse(raw) as Draft;
      setDraft({ ...emptyDraft, ...parsed });
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [initial.educationLevel]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const isStudent = draft.educationLevel === "STUDENT";
  const steps = useMemo(
    () => (isStudent ? ["who", "standard", "exams", "confirm"] : ["who", "exams", "confirm"]),
    [isStudent],
  );
  const current = steps[step] ?? "who";

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setQuery("");
    setGovQuery("");
  }

  function jumpTo(id: string) {
    const index = steps.indexOf(id);
    if (index >= 0) go(index);
  }

  const schoolGoals = EXAM_GOALS.filter((goal) => goal.group === "School" || goal.group === "Entrance");
  const govGoals = EXAM_GOALS.filter((goal) => goal.group === "Government" || goal.group === "Teaching" || goal.group === "MBA");
  const filteredSchool = schoolGoals.filter((goal) =>
    goal.label.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredGov = govGoals.filter((goal) =>
    goal.label.toLowerCase().includes(govQuery.toLowerCase()) ||
    goal.label.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredStandards = STANDARDS.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  async function finish() {
    if (!draft.educationLevel) return;
    setBusy(true);
    const result = await saveOnboarding({
      educationLevel: draft.educationLevel,
      standard: draft.educationLevel === "STUDENT" ? draft.standard : null,
      examGoals: draft.examGoals,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not save your profile.");
      return;
    }
    localStorage.removeItem(DRAFT_KEY);
    toast.success("Profile saved.");
    router.push(editing || hasGoal ? "/dashboard" : "/goals/setup");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">Hi {name.split(" ")[0]}</p>
        <div className="flex gap-1.5">
          {steps.map((id, index) => (
            <button
              key={id}
              type="button"
              onClick={() => go(index)}
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                index === step ? "bg-primary" : "bg-muted",
              )}
              aria-label={`Step ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ x: direction * 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -40, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {current === "who" ? (
            <Screen
              title="Who are you?"
              subtitle="One tap. This decides what we show first."
            >
              <div className="grid gap-3">
                {EDUCATION_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, educationLevel: level.id }))}
                    className={cn(
                      "min-h-20 rounded-2xl border px-4 py-4 text-left",
                      draft.educationLevel === level.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card",
                    )}
                  >
                    <p className="font-display text-xl font-semibold">{level.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{level.hint}</p>
                  </button>
                ))}
              </div>
            </Screen>
          ) : null}

          {current === "standard" ? (
            <Screen title="Which class?" subtitle="Search or pick from the list.">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search 6th–12th, diploma…"
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {filteredStandards.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, standard: item }))}
                    className={cn(
                      "min-h-14 rounded-2xl border px-3 py-3 text-sm font-semibold",
                      draft.standard === item
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Screen>
          ) : null}

          {current === "exams" ? (
            <Screen
              title="What are you preparing for?"
              subtitle="Multi-select is fine. Many people sit two exams in the same season."
            >
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search JEE, NEET, boards…"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {filteredSchool.map((goal) => (
                  <Chip
                    key={goal.id}
                    label={goal.label}
                    active={draft.examGoals.includes(goal.id)}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        examGoals: prev.examGoals.includes(goal.id)
                          ? prev.examGoals.filter((id) => id !== goal.id)
                          : [...prev.examGoals, goal.id],
                      }))
                    }
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, govOpen: !prev.govOpen }))}
                className="mt-5 text-sm font-semibold text-primary"
              >
                {draft.govOpen ? "Hide government exams" : "Government exams"}
              </button>
              {draft.govOpen ? (
                <div className="mt-3 space-y-3">
                  <Input
                    value={govQuery}
                    onChange={(event) => setGovQuery(event.target.value)}
                    placeholder="SSC, Banking, UPSC…"
                  />
                  <div className="flex flex-wrap gap-2">
                    {filteredGov.map((goal) => (
                      <Chip
                        key={goal.id}
                        label={goal.label}
                        active={draft.examGoals.includes(goal.id)}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            examGoals: prev.examGoals.includes(goal.id)
                              ? prev.examGoals.filter((id) => id !== goal.id)
                              : [...prev.examGoals, goal.id],
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </Screen>
          ) : null}

          {current === "confirm" ? (
            <Screen
              title="Here's what we'll personalize"
              subtitle={`${email} stays on the account. Tap a pencil to change an answer.`}
            >
              <SummaryRow
                label="You are"
                value={draft.educationLevel ? educationLabel(draft.educationLevel) : "Not set"}
                onEdit={() => jumpTo("who")}
              />
              {isStudent ? (
                <SummaryRow
                  label="Class"
                  value={draft.standard ?? "Skipped"}
                  onEdit={() => jumpTo("standard")}
                />
              ) : null}
              <SummaryRow
                label="Preparing for"
                value={
                  draft.examGoals.length
                    ? draft.examGoals.map(examLabel).join(", ")
                    : "We'll keep this open"
                }
                onEdit={() => jumpTo("exams")}
              />
            </Screen>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}>
          Back
        </Button>
        <div className="flex gap-2">
          {current === "exams" || (current === "standard" && !isStudent) ? (
            <Button type="button" variant="outline" onClick={() => go(step + 1)}>
              Skip for now
            </Button>
          ) : null}
          {current === "confirm" ? (
            <Button type="button" onClick={finish} disabled={busy || !draft.educationLevel}>
              {busy ? "Saving…" : hasGoal || editing ? "Save profile" : "Set my goal"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => go(step + 1)}
              disabled={current === "who" && !draft.educationLevel}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-4 text-sm font-semibold",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
      )}
    >
      {label}
    </button>
  );
}

function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </div>
      <button type="button" onClick={onEdit} className="rounded-full p-2 text-primary hover:bg-muted">
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
