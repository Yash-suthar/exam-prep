import { redirect } from "next/navigation";
import { GoalSetupForm } from "@/components/goals/goal-setup-form";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function GoalSetupPage() {
  const user = await requireUser();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile?.onboardedAt) redirect("/onboarding");

  return <GoalSetupForm examGoals={profile.examGoals} />;
}
