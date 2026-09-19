import { AccessModel, ItemType } from "@prisma/client";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { scoreAudience, type Audience, type Targetable } from "@/lib/targeting";

export type RecItem = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  isFree: boolean;
  accessModel: AccessModel;
  itemType: ItemType;
  locked: boolean;
  inGoalPath: boolean;
  href?: string;
};

type Rankable = Targetable & {
  id: string;
  title: string;
  price: number;
  isFree: boolean;
  accessModel: AccessModel;
  createdAt?: Date;
};

function rank(items: Rankable[], audience: Audience, activeGoal?: string | null) {
  return [...items]
    .map((item) => {
      const audienceScore = scoreAudience(item, audience, activeGoal);
      const accessBoost =
        item.accessModel === "FREE" ? 3 : item.accessModel === "FREE_TRIAL" ? 2 : 0;
      const recency = item.createdAt ? Math.min(2, item.createdAt.getTime() / 1e15) : 0;
      return { item, score: audienceScore + accessBoost + recency };
    })
    .sort((a, b) => b.score - a.score || (b.item.createdAt?.getTime() ?? 0) - (a.item.createdAt?.getTime() ?? 0))
    .map((entry) => entry.item);
}

async function toCards(
  userId: string,
  items: Rankable[],
  itemType: ItemType,
  subtitles: Map<string, string>,
  activeGoal?: string | null,
  hrefFor?: (id: string, allowed: boolean) => string | undefined,
): Promise<RecItem[]> {
  return Promise.all(
    items.map(async (item) => {
      const allowed = await hasAccess(userId, itemType, item.id);
      return {
        id: item.id,
        title: item.title,
        subtitle: subtitles.get(item.id) ?? itemType,
        price: item.price,
        isFree: item.isFree || item.accessModel === "FREE",
        accessModel: item.accessModel,
        itemType,
        locked: !allowed,
        inGoalPath: Boolean(activeGoal && item.targetExamGoals.includes(activeGoal)),
        href: hrefFor?.(item.id, allowed),
      };
    }),
  );
}

export async function recommendedCatalog(
  userId: string,
  audience: Audience,
  activeGoal?: string | null,
  take = 6,
) {
  const [books, materials, papers, exams] = await Promise.all([
    prisma.book.findMany({ include: { subject: true } }),
    prisma.studyMaterial.findMany(),
    prisma.paper.findMany({ include: { subject: true } }),
    prisma.exam.findMany({ where: { isPublished: true }, include: { subject: true } }),
  ]);

  const rankedBooks = rank(books, audience, activeGoal).slice(0, take);
  const rankedMaterials = rank(materials, audience, activeGoal).slice(0, take);
  const rankedPapers = rank(papers, audience, activeGoal).slice(0, take);
  const rankedExams = rank(exams, audience, activeGoal).slice(0, take);

  const [bookCards, materialCards, paperCards, examCards] = await Promise.all([
    toCards(
      userId,
      rankedBooks,
      "BOOK",
      new Map(books.map((item) => [item.id, item.subject.name])),
      activeGoal,
      (_, allowed) => (allowed ? "/library" : undefined),
    ),
    toCards(
      userId,
      rankedMaterials,
      "MATERIAL",
      new Map(
        materials.map((item) => [item.id, item.tags.length ? item.tags.join(" · ") : "Notes"]),
      ),
      activeGoal,
      (_, allowed) => (allowed ? "/library" : undefined),
    ),
    toCards(
      userId,
      rankedPapers,
      "PAPER",
      new Map(
        papers.map((item) => [
          item.id,
          `${item.subject.name}${item.year ? ` · ${item.year}` : ""}`,
        ]),
      ),
      activeGoal,
      (_, allowed) => (allowed ? "/library" : undefined),
    ),
    toCards(
      userId,
      rankedExams,
      "EXAM",
      new Map(exams.map((item) => [item.id, item.subject?.name ?? "Mock exam"])),
      activeGoal,
      (id, allowed) => (allowed ? `/exams/${id}/instructions` : "/exams"),
    ),
  ]);

  return {
    books: bookCards,
    materials: materialCards,
    papers: paperCards,
    exams: examCards,
  };
}
