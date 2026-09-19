import { ItemType, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function hasAccess(
  userId: string,
  itemType: ItemType,
  itemId: string,
) {
  const now = new Date();

  if (itemType === "BOOK") {
    const book = await prisma.book.findUnique({ where: { id: itemId } });
    if (book?.isFree) return true;
  }
  if (itemType === "MATERIAL") {
    const material = await prisma.studyMaterial.findUnique({
      where: { id: itemId },
    });
    if (material?.isFree) return true;
  }
  if (itemType === "PAPER") {
    const paper = await prisma.paper.findUnique({ where: { id: itemId } });
    if (paper?.isFree) return true;
  }
  if (itemType === "EXAM") {
    const exam = await prisma.exam.findUnique({ where: { id: itemId } });
    if (exam?.isFree) return true;
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      itemType,
      itemId,
      status: PaymentStatus.SUCCESS,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
  if (purchase) return true;

  const grant = await prisma.accessGrant.findFirst({
    where: {
      userId,
      itemType,
      itemId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
  if (grant) return true;

  const fullAccessPlans = await prisma.plan.findMany({
    where: { includesAll: true },
    select: { id: true },
  });
  const planIds = fullAccessPlans.map((plan) => plan.id);
  if (planIds.length === 0) return false;

  const planPurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      itemType: ItemType.PLAN,
      itemId: { in: planIds },
      status: PaymentStatus.SUCCESS,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });

  return Boolean(planPurchase);
}

export async function requireAccess(
  userId: string,
  itemType: ItemType,
  itemId: string,
) {
  const allowed = await hasAccess(userId, itemType, itemId);
  if (!allowed) {
    throw new Error("You do not have access to this content.");
  }
}
