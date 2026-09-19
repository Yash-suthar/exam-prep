"use server";

import { EducationLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { autoGrantForUser } from "@/lib/auto-grant";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function saveOnboarding(input: {
  educationLevel: EducationLevel;
  standard?: string | null;
  examGoals: string[];
}) {
  const user = await requireUser();
  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      educationLevel: input.educationLevel,
      standard: input.standard ?? null,
      examGoals: input.examGoals,
      onboardedAt: new Date(),
    },
    create: {
      userId: user.id,
      educationLevel: input.educationLevel,
      standard: input.standard ?? null,
      examGoals: input.examGoals,
      onboardedAt: new Date(),
    },
  });
  after(async () => {
    await autoGrantForUser(user.id, {
      educationLevel: profile.educationLevel,
      standard: profile.standard,
      examGoals: profile.examGoals,
    });
  });
  revalidatePath("/dashboard");
  revalidatePath("/goals");
  revalidatePath("/profile");
  return { ok: true as const };
}
