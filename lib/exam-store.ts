import { create } from "zustand";

type ExamStore = {
  answers: Record<number, string>;
  currentQuestion: number;
  hydrate: (answers: Record<number, string>) => void;
  lockLocal: (questionNo: number, option: string) => void;
  setCurrent: (questionNo: number) => void;
};

export const useExamStore = create<ExamStore>((set) => ({
  answers: {},
  currentQuestion: 1,
  hydrate: (answers) => set({ answers }),
  lockLocal: (questionNo, option) =>
    set((state) => ({
      answers: { ...state.answers, [questionNo]: option },
      currentQuestion: questionNo,
    })),
  setCurrent: (questionNo) => set({ currentQuestion: questionNo }),
}));
