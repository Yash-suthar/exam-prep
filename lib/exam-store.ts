import { create } from "zustand";

type ExamStore = {
  answers: Record<number, string>;
  marked: Record<number, boolean>;
  visited: Record<number, boolean>;
  currentQuestion: number;
  hydrate: (input: {
    answers: Record<number, string>;
    marked?: Record<number, boolean>;
  }) => void;
  lockLocal: (questionNo: number, option: string) => void;
  toggleMarkLocal: (questionNo: number) => void;
  setCurrent: (questionNo: number) => void;
};

export const useExamStore = create<ExamStore>((set) => ({
  answers: {},
  marked: {},
  visited: { 1: true },
  currentQuestion: 1,
  hydrate: ({ answers, marked }) =>
    set({
      answers,
      marked: marked ?? {},
      visited: {
        1: true,
        ...Object.fromEntries(Object.keys(answers).map((key) => [Number(key), true])),
      },
    }),
  lockLocal: (questionNo, option) =>
    set((state) => ({
      answers: { ...state.answers, [questionNo]: option },
      visited: { ...state.visited, [questionNo]: true },
      currentQuestion: questionNo,
    })),
  toggleMarkLocal: (questionNo) =>
    set((state) => ({
      marked: { ...state.marked, [questionNo]: !state.marked[questionNo] },
      visited: { ...state.visited, [questionNo]: true },
    })),
  setCurrent: (questionNo) =>
    set((state) => ({
      currentQuestion: questionNo,
      visited: { ...state.visited, [questionNo]: true },
    })),
}));

export type PaletteStatus =
  | "not-visited"
  | "not-answered"
  | "answered"
  | "marked"
  | "answered-marked";

export function paletteStatus(
  questionNo: number,
  answers: Record<number, string>,
  marked: Record<number, boolean>,
  visited: Record<number, boolean>,
): PaletteStatus {
  const answered = Boolean(answers[questionNo]);
  const isMarked = Boolean(marked[questionNo]);
  if (answered && isMarked) return "answered-marked";
  if (isMarked) return "marked";
  if (answered) return "answered";
  if (visited[questionNo]) return "not-answered";
  return "not-visited";
}
