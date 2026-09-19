import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireUser();
  const [{ edit }, profile, goal] = await Promise.all([
    searchParams,
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.goal.findFirst({ where: { userId: user.id, isActive: true } }),
  ]);

  return (
    <OnboardingWizard
      name={user.name ?? "there"}
      email={user.email ?? ""}
      initial={{
        educationLevel: profile?.educationLevel ?? null,
        standard: profile?.standard ?? null,
        examGoals: profile?.examGoals ?? [],
      }}
      hasGoal={Boolean(goal)}
      editing={edit === "1"}
    />
  );
}
