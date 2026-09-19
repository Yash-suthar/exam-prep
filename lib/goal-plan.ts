import { DayStatus, TopicStatus } from "@prisma/client";
import { addUtcDays, dayStart } from "@/lib/dates";

export const TOPIC_WEIGHT: Record<TopicStatus, number> = {
  NOT_STARTED: 0,
  LEARNING: 0.4,
  REVISING: 0.75,
  MASTERED: 1,
};

export const TOPIC_LABEL: Record<TopicStatus, string> = {
  NOT_STARTED: "Not started",
  LEARNING: "Learning",
  REVISING: "Revising",
  MASTERED: "Mastered",
};

export function daysLeft(targetDate: Date | null) {
  if (!targetDate) return null;
  const diff = Math.ceil(
    (dayStart(targetDate).getTime() - dayStart().getTime()) / 86_400_000,
  );
  return diff;
}

export function syllabusCoverage(topics: { status: TopicStatus }[]) {
  if (topics.length === 0) {
    return { percent: 0, mastered: 0, touched: 0, total: 0 };
  }
  const weighted = topics.reduce((sum, topic) => sum + TOPIC_WEIGHT[topic.status], 0);
  return {
    percent: Math.round((weighted / topics.length) * 100),
    mastered: topics.filter((topic) => topic.status === "MASTERED").length,
    touched: topics.filter((topic) => topic.status !== "NOT_STARTED").length,
    total: topics.length,
  };
}

export function weekWindow(reference = new Date()) {
  const today = dayStart(reference);
  const weekday = today.getUTCDay();
  const offset = weekday === 0 ? 6 : weekday - 1;
  const start = addUtcDays(today, -offset);
  return { start, end: addUtcDays(start, 6) };
}

export function weeklyProgress(input: {
  logs: { date: Date; minutes: number; status: DayStatus }[];
  mockDates: Date[];
  dailyMinutesTarget: number;
  weeklyMockTarget: number;
  restDays: number[];
}) {
  const { start, end } = weekWindow();
  const inWeek = input.logs.filter(
    (log) => log.date >= start && log.date <= end,
  );
  const minutes = inWeek.reduce((sum, log) => sum + log.minutes, 0);
  const activeDays = 7 - input.restDays.length;
  const minutesTarget = Math.max(input.dailyMinutesTarget, 1) * Math.max(activeDays, 1);
  const mocks = input.mockDates.filter((date) => date >= start && date <= end).length;

  return {
    start,
    end,
    minutes,
    minutesTarget,
    minutesPercent: Math.min(100, Math.round((minutes / minutesTarget) * 100)),
    mocks,
    mockTarget: input.weeklyMockTarget,
    mockPercent: Math.min(
      100,
      Math.round((mocks / Math.max(input.weeklyMockTarget, 1)) * 100),
    ),
    daysLogged: inWeek.filter((log) => log.status !== "NONE").length,
  };
}

export function isRestDay(date: Date, restDays: number[]) {
  return restDays.includes(date.getUTCDay());
}

export function streakWithRestDays(
  logs: { date: Date; status: DayStatus }[],
  restDays: number[],
) {
  const byKey = new Map(
    logs.map((log) => [log.date.toISOString().slice(0, 10), log.status]),
  );
  let streak = 0;
  let cursor = dayStart();

  for (let step = 0; step < 400; step += 1) {
    const key = cursor.toISOString().slice(0, 10);
    const status = byKey.get(key);
    const rest = isRestDay(cursor, restDays);

    if (status === "COMPLETE" || status === "PARTIAL") {
      streak += 1;
    } else if (rest) {
      // planned rest keeps the chain alive without adding to it
    } else if (step === 0) {
      // today is still open
    } else {
      break;
    }
    cursor = addUtcDays(cursor, -1);
  }

  return streak;
}

export function readinessScore(input: {
  coveragePercent: number;
  accuracy: number;
  weeklyMinutesPercent: number;
  streak: number;
}) {
  const score = Math.round(
    input.coveragePercent * 0.4 +
      input.accuracy * 0.3 +
      input.weeklyMinutesPercent * 0.2 +
      Math.min(input.streak, 30) * (10 / 30),
  );
  return Math.max(0, Math.min(100, score));
}

export function readinessVerdict(score: number, days: number | null) {
  if (days != null && days <= 0) return "Exam day has passed. Set the next target.";
  if (score >= 80) return "On track. Hold the routine and keep sitting mocks.";
  if (score >= 60) return "Close. Push syllabus coverage and weekly minutes.";
  if (score >= 35) return "Behind plan. Pick one weak subject and finish it this week.";
  return "Early days. Log study time and finish a first pass of one subject.";
}

export function pacePerDay(topicsLeft: number, days: number | null) {
  if (!days || days <= 0 || topicsLeft <= 0) return null;
  const perDay = topicsLeft / days;
  if (perDay <= 1) {
    const daysPerTopic = Math.round(1 / perDay);
    return `1 topic every ${daysPerTopic} day${daysPerTopic > 1 ? "s" : ""}`;
  }
  return `${Math.ceil(perDay)} topics a day`;
}

export function revisionQueue<T extends { lastRevisedAt: Date | null; status: TopicStatus }>(
  topics: T[],
  limit = 5,
) {
  const now = Date.now();
  return topics
    .filter((topic) => topic.status === "REVISING" || topic.status === "MASTERED")
    .map((topic) => ({
      topic,
      staleDays: topic.lastRevisedAt
        ? Math.floor((now - topic.lastRevisedAt.getTime()) / 86_400_000)
        : 999,
    }))
    .filter((entry) => entry.staleDays >= 7)
    .sort((a, b) => b.staleDays - a.staleDays)
    .slice(0, limit);
}
