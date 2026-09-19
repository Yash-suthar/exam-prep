export type TopicRow = {
  topic: string;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  accuracy: number;
};

export type ReviewInput = {
  questionNo: number;
  selected: string | null;
  correct: string;
  topic: string | null;
};

export function topicBreakdown(review: ReviewInput[]): TopicRow[] {
  const buckets = new Map<string, TopicRow>();

  for (const row of review) {
    const topic = row.topic?.trim() || "General";
    const bucket = buckets.get(topic) ?? {
      topic,
      correct: 0,
      wrong: 0,
      skipped: 0,
      total: 0,
      accuracy: 0,
    };
    bucket.total += 1;
    if (!row.selected) bucket.skipped += 1;
    else if (row.selected === row.correct) bucket.correct += 1;
    else bucket.wrong += 1;
    buckets.set(topic, bucket);
  }

  return [...buckets.values()]
    .map((bucket) => ({
      ...bucket,
      accuracy: bucket.total === 0 ? 0 : Math.round((bucket.correct / bucket.total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

export function weakTopics(rows: TopicRow[], limit = 3) {
  return rows
    .filter((row) => row.total >= 2 && row.accuracy < 60)
    .slice(0, limit);
}

export function accuracyPercent(correct: number, attempted: number) {
  if (attempted <= 0) return 0;
  return Math.round((correct / attempted) * 100);
}
