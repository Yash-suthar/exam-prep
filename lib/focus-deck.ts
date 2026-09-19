import { prisma } from "@/lib/prisma";

export type FocusCard = {
  topic: string;
  wrongCount: number;
  title: string;
  hint: string;
  href: string;
};

export async function focusDeckForUser(userId: string): Promise<FocusCard | null> {
  const attempts = await prisma.examAttempt.findMany({
    where: { userId, status: { not: "IN_PROGRESS" } },
    include: {
      answers: true,
      exam: { include: { questions: true, subject: true } },
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  const wrongByTopic = new Map<string, number>();
  for (const attempt of attempts) {
    const key = new Map(
      attempt.exam.questions.map((question) => [question.questionNo, question]),
    );
    for (const answer of attempt.answers) {
      const question = key.get(answer.questionNo);
      if (!question || !answer.selectedOption) continue;
      if (answer.selectedOption === question.correctOption) continue;
      const topic = question.topic || attempt.exam.subject?.name || "Mixed practice";
      wrongByTopic.set(topic, (wrongByTopic.get(topic) ?? 0) + 1);
    }
  }

  const ranked = [...wrongByTopic.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return null;
  const [topic, wrongCount] = ranked[0];
  const needle = topic.toLowerCase();

  const material = await prisma.studyMaterial.findFirst({
    where: {
      OR: [
        { title: { contains: topic, mode: "insensitive" } },
        { tags: { hasSome: [needle] } },
      ],
    },
  });
  const book = material
    ? null
    : await prisma.book.findFirst({
        where: { title: { contains: topic, mode: "insensitive" } },
      });

  return {
    topic,
    wrongCount,
    title: `You're weak in ${topic}`,
    hint: `${wrongCount} recent misses · 8-min drill from related notes`,
    href: material ? "/materials" : book ? "/books" : "/exams",
  };
}
