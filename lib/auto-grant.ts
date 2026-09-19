import { AccessModel, ItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { matchesAudience, type Audience, type Targetable } from "@/lib/targeting";

export async function autoGrantForUser(userId: string, audience: Audience) {
  const [books, materials, papers, exams] = await Promise.all([
    prisma.book.findMany(),
    prisma.studyMaterial.findMany(),
    prisma.paper.findMany(),
    prisma.exam.findMany({ where: { isPublished: true } }),
  ]);

  const items: { type: ItemType; id: string; model: AccessModel; days: number | null; match: boolean }[] =
    [
      ...books.map((item) => ({
        type: "BOOK" as const,
        id: item.id,
        model: item.accessModel,
        days: item.trialDurationDays,
        match: matchesAudience(item, audience),
      })),
      ...materials.map((item) => ({
        type: "MATERIAL" as const,
        id: item.id,
        model: item.accessModel,
        days: item.trialDurationDays,
        match: matchesAudience(item, audience),
      })),
      ...papers.map((item) => ({
        type: "PAPER" as const,
        id: item.id,
        model: item.accessModel,
        days: item.trialDurationDays,
        match: matchesAudience(item, audience),
      })),
      ...exams.map((item) => ({
        type: "EXAM" as const,
        id: item.id,
        model: item.accessModel,
        days: item.trialDurationDays,
        match: matchesAudience(item, audience),
      })),
    ];

  for (const item of items) {
    if (!item.match) continue;
    if (item.model !== "FREE" && item.model !== "FREE_TRIAL") continue;
    const existing = await prisma.accessGrant.findFirst({
      where: { userId, itemType: item.type, itemId: item.id },
    });
    if (existing) continue;
    const expiresAt =
      item.model === "FREE_TRIAL" && item.days
        ? new Date(Date.now() + item.days * 86_400_000)
        : null;
    await prisma.accessGrant.create({
      data: {
        userId,
        itemType: item.type,
        itemId: item.id,
        grantedBy: "system-auto-grant",
        expiresAt,
      },
    });
  }
}

export async function autoGrantItemToMatchingUsers(input: {
  itemType: ItemType;
  itemId: string;
  accessModel: AccessModel;
  trialDurationDays?: number | null;
  target: Targetable;
}) {
  if (input.accessModel !== "FREE" && input.accessModel !== "FREE_TRIAL") return;
  const profiles = await prisma.userProfile.findMany();
  const expiresAt =
    input.accessModel === "FREE_TRIAL" && input.trialDurationDays
      ? new Date(Date.now() + input.trialDurationDays * 86_400_000)
      : null;

  for (const profile of profiles) {
    const audience: Audience = {
      educationLevel: profile.educationLevel,
      standard: profile.standard,
      examGoals: profile.examGoals,
    };
    if (!matchesAudience(input.target, audience)) continue;
    const existing = await prisma.accessGrant.findFirst({
      where: { userId: profile.userId, itemType: input.itemType, itemId: input.itemId },
    });
    if (existing) continue;
    await prisma.accessGrant.create({
      data: {
        userId: profile.userId,
        itemType: input.itemType,
        itemId: input.itemId,
        grantedBy: "system-auto-grant",
        expiresAt,
      },
    });
  }
}

