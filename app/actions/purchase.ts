"use server";

import { ItemType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { hasAccess } from "@/lib/access-control";
import { completeDemoPurchase, paymentsAreDemo } from "@/lib/payments";
import { requireUser } from "@/lib/session";

const itemTypes = new Set<string>(Object.values(ItemType));

export async function buyItem(itemType: ItemType, itemId: string) {
  const user = await requireUser();
  if (!itemTypes.has(itemType)) {
    return { ok: false as const, error: "Unknown item type." };
  }

  const already = await hasAccess(user.id, itemType, itemId);
  if (already) {
    return { ok: true as const, alreadyOwned: true };
  }

  if (!paymentsAreDemo() && process.env.RAZORPAY_KEY_ID) {
    return {
      ok: false as const,
      error: "Live checkout is not wired in this slice. Use demo mode locally.",
    };
  }

  await completeDemoPurchase({
    userId: user.id,
    itemType,
    itemId,
  });

  revalidatePath("/library");
  revalidatePath("/books");
  revalidatePath("/materials");
  revalidatePath("/papers");
  revalidatePath("/exams");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { ok: true as const, alreadyOwned: false, demo: true };
}
