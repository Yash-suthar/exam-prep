export const MAX_OPTIONS = 5;
export const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export const NEGATIVE_PRESETS = [
  { value: 0, label: "None", hint: "No deduction for a wrong answer" },
  { value: 0.25, label: "0.25", hint: "SSC CHSL, many state papers" },
  { value: 0.33, label: "0.33", hint: "One-third — UPSC style" },
  { value: 0.5, label: "0.5", hint: "SSC CGL Tier-1" },
  { value: 1, label: "1", hint: "JEE Main, NEET" },
];

export function optionLabelsFor(count: number) {
  return OPTION_LABELS.slice(0, clampOptionsCount(count));
}

export function clampOptionsCount(count: number) {
  if (!Number.isFinite(count)) return 4;
  return Math.max(1, Math.min(MAX_OPTIONS, Math.round(count)));
}

/**
 * Some government papers add a final bubble that means "I am not attempting
 * this question". It locks the row but never attracts negative marking.
 */
export function skipOptionLabel(optionsCount: number, skipOptionEnabled: boolean) {
  if (!skipOptionEnabled) return null;
  const labels = optionLabelsFor(optionsCount);
  if (labels.length < 2) return null;
  return labels[labels.length - 1];
}

export function isSkipOption(
  option: string | null | undefined,
  optionsCount: number,
  skipOptionEnabled: boolean,
) {
  if (!option) return false;
  return option === skipOptionLabel(optionsCount, skipOptionEnabled);
}

/** Options a student can be scored on — excludes the "not attempted" bubble. */
export function answerableOptions(optionsCount: number, skipOptionEnabled: boolean) {
  const labels = optionLabelsFor(optionsCount);
  const skip = skipOptionLabel(optionsCount, skipOptionEnabled);
  return skip ? labels.filter((label) => label !== skip) : labels;
}

export function formatNegative(value: number) {
  if (value <= 0) return "no negative marking";
  return `−${value} per wrong answer`;
}

export function optionRangeLabel(optionsCount: number) {
  const labels = optionLabelsFor(optionsCount);
  if (labels.length === 1) return labels[0];
  return `${labels[0]}–${labels[labels.length - 1]}`;
}

export function markingSummary(exam: {
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
  optionsCount: number;
  skipOptionEnabled: boolean;
}) {
  const skip = skipOptionLabel(exam.optionsCount, exam.skipOptionEnabled);
  const parts = [
    `${exam.totalQuestions} questions`,
    `options ${optionRangeLabel(exam.optionsCount)}`,
    `+${exam.marksPerQuestion} correct`,
    formatNegative(exam.negativeMarking),
    `max ${exam.totalQuestions * exam.marksPerQuestion}`,
  ];
  if (skip) parts.push(`${skip} = not attempted`);
  return parts.join(" · ");
}
