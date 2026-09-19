export function computeExamScore(input: {
  correctCount: number;
  wrongCount: number;
  marksPerQuestion: number;
  negativeMarking: number;
}) {
  return (
    input.correctCount * input.marksPerQuestion -
    input.wrongCount * input.negativeMarking
  );
}
