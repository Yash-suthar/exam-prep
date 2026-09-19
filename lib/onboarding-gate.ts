import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function requireReadyStudent(userId: string, role: string) {
  if (role === "ADMIN") return;
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile?.onboardedAt) {
    redirect("/onboarding");
  }
  const goal = await prisma.goal.findFirst({
    where: { userId, isActive: true },
  });
  if (!goal) {
    redirect("/goals/setup");
  }
}
