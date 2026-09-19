"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function saveConfirmBeforeLocking(confirmBeforeLocking: boolean) {
  const user = await requireUser();
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { confirmBeforeLocking },
    create: { userId: user.id, confirmBeforeLocking },
  });
  revalidatePath("/exams");
  return { ok: true as const };
}
