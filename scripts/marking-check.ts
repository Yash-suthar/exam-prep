import {
  answerableOptions,
  clampOptionsCount,
  formatNegative,
  isSkipOption,
  markingSummary,
  optionLabelsFor,
  optionRangeLabel,
  skipOptionLabel,
} from "../lib/marking";
import { computeExamScore } from "../lib/scoring";

let failures = 0;
function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${label}${ok ? "" : ` got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
}

eq("one option", optionLabelsFor(1), ["A"]);
eq("two options", optionLabelsFor(2), ["A", "B"]);
eq("three options", optionLabelsFor(3), ["A", "B", "C"]);
eq("five options", optionLabelsFor(5), ["A", "B", "C", "D", "E"]);
eq("count clamps low", clampOptionsCount(0), 1);
eq("count clamps high", clampOptionsCount(9), 5);

eq("skip label is the last bubble", skipOptionLabel(5, true), "E");
eq("skip label with four options", skipOptionLabel(4, true), "D");
eq("no skip when disabled", skipOptionLabel(5, false), null);
eq("no skip on a single-option paper", skipOptionLabel(1, true), null);

eq("answerable excludes the skip bubble", answerableOptions(5, true), ["A", "B", "C", "D"]);
eq("answerable keeps everything when off", answerableOptions(5, false), [
  "A",
  "B",
  "C",
  "D",
  "E",
]);

eq("E counts as skip", isSkipOption("E", 5, true), true);
eq("D is a real answer", isSkipOption("D", 5, true), false);
eq("E is a real answer when skip is off", isSkipOption("E", 5, false), false);
eq("null is not a skip", isSkipOption(null, 5, true), false);

eq("zero negative reads plainly", formatNegative(0), "no negative marking");
eq("negative formats", formatNegative(0.25), "−0.25 per wrong answer");

// Scoring: a paper with no negative marking never loses marks.
eq(
  "no negative marking keeps the score",
  computeExamScore({ correctCount: 8, wrongCount: 12, marksPerQuestion: 2, negativeMarking: 0 }),
  16,
);
eq(
  "one-third negative",
  computeExamScore({ correctCount: 10, wrongCount: 3, marksPerQuestion: 2, negativeMarking: 0.33 }),
  20 - 0.99,
);
eq(
  "SSC style half mark",
  computeExamScore({ correctCount: 15, wrongCount: 3, marksPerQuestion: 2, negativeMarking: 0.5 }),
  28.5,
);

const summary = markingSummary({
  totalQuestions: 20,
  marksPerQuestion: 2,
  negativeMarking: 0,
  optionsCount: 5,
  skipOptionEnabled: true,
});
eq("summary names the skip bubble", summary.includes("E = not attempted"), true);
eq("summary reports no negative", summary.includes("no negative marking"), true);
eq("range reads first to last", optionRangeLabel(5), "A–E");
eq("range for four options", optionRangeLabel(4), "A–D");
eq("range for a single option", optionRangeLabel(1), "A");
eq("summary uses the range", summary.includes("options A–E"), true);

console.log(failures === 0 ? "\nALL MARKING CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
