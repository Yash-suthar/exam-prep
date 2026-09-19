import { DayStatus } from "@prisma/client";

export function computeMomentum(input: {
  logs: { date: Date; status: DayStatus }[];
  recentScores: number[];
  maxScore: number;
}) {
  const sorted = [...input.logs].sort((a, b) => a.date.getTime() - b.date.getTime());
  let streak = 0;
  let best = 0;
  let run = 0;
  for (const log of sorted) {
    if (log.status === "COMPLETE" || log.status === "PARTIAL") {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const status = sorted[index].status;
    if (status === "COMPLETE" || status === "PARTIAL") streak += 1;
    else break;
  }

  const window = sorted.slice(-28);
  const consistency =
    window.length === 0
      ? 0
      : window.filter((log) => log.status === "COMPLETE" || log.status === "PARTIAL").length /
        Math.max(window.length, 1);

  const avg =
    input.recentScores.length === 0
      ? 0
      : input.recentScores.reduce((sum, score) => sum + score, 0) / input.recentScores.length;
  const scoreRatio = input.maxScore === 0 ? 0 : avg / input.maxScore;

  const momentum = Math.round(
    Math.min(100, streak * 4 + consistency * 40 + scoreRatio * 30),
  );

  return { streak, best, consistency, momentum, avg };
}
