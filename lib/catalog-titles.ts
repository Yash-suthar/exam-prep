import { ItemType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { itemTypeLabel } from "@/lib/utils";

export async function resolveItemTitle(itemType: ItemType, itemId: string) {
  switch (itemType) {
    case "BOOK":
      return (await prisma.book.findUnique({ where: { id: itemId } }))?.title;
    case "MATERIAL":
      return (await prisma.studyMaterial.findUnique({ where: { id: itemId } }))?.title;
    case "PAPER":
      return (await prisma.paper.findUnique({ where: { id: itemId } }))?.title;
    case "EXAM":
      return (await prisma.exam.findUnique({ where: { id: itemId } }))?.title;
    case "PLAN":
      return (await prisma.plan.findUnique({ where: { id: itemId } }))?.name;
    default:
      return null;
  }
}

export function invoiceNumber(purchaseId: string) {
  return `MP-${purchaseId.slice(-8).toUpperCase()}`;
}

export function purchaseLabel(itemType: ItemType, title?: string | null) {
  return title ?? itemTypeLabel(itemType);
}
