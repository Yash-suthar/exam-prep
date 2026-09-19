import { ItemType, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function paymentsAreDemo() {
  return !process.env.RAZORPAY_KEY_ID || !process.env.STRIPE_SECRET_KEY;
}

type PurchaseInput = {
  userId: string;
  itemType: ItemType;
  itemId: string;
};

async function resolvePrice(itemType: ItemType, itemId: string) {
  if (itemType === "BOOK") {
    const item = await prisma.book.findUnique({ where: { id: itemId } });
    return item ? { amount: item.price, expiresAt: null as Date | null } : null;
  }
  if (itemType === "MATERIAL") {
    const item = await prisma.studyMaterial.findUnique({ where: { id: itemId } });
    return item ? { amount: item.price, expiresAt: null } : null;
  }
  if (itemType === "PAPER") {
    const item = await prisma.paper.findUnique({ where: { id: itemId } });
    return item ? { amount: item.price, expiresAt: null } : null;
  }
  if (itemType === "EXAM") {
    const item = await prisma.exam.findUnique({ where: { id: itemId } });
    return item ? { amount: item.price, expiresAt: null } : null;
  }
  const plan = await prisma.plan.findUnique({ where: { id: itemId } });
  if (!plan) return null;
  return {
    amount: plan.price,
    expiresAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
  };
}

export async function completeDemoPurchase({
  userId,
  itemType,
  itemId,
}: PurchaseInput) {
  const priced = await resolvePrice(itemType, itemId);
  if (!priced) {
    throw new Error("Item not found.");
  }

  return prisma.purchase.create({
    data: {
      userId,
      itemType,
      itemId,
      amount: priced.amount,
      status: PaymentStatus.SUCCESS,
      expiresAt: priced.expiresAt,
    },
  });
}
