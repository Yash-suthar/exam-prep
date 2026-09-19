import Link from "next/link";
import { GoalHero } from "@/components/goals/goal-hero";
import { GoalSettingsForm } from "@/components/goals/goal-settings-form";
import { GoalSwitcher } from "@/components/goals/goal-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { loadGoalContext } from "@/lib/goal-context";
import { goalSubtitle, goalTitle } from "@/lib/goal-labels";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function GoalSettingsPage() {
  const user = await requireUser();
  const context = await loadGoalContext(user.id);

  if (!context) {
    return (
      <EmptyState
        title="No active goal"
        description="Create one, or reactivate an archived goal from the setup screen."
        actionHref="/goals/setup"
        actionLabel="Create a goal"
      />
    );
  }

  const { goal, coverage, readiness, verdict, days, streak } = context;
  const others = await prisma.goal.findMany({
    where: { userId: user.id, isActive: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 pb-16">
      <GoalHero
        title={goalTitle(goal)}
        subtitle={goalSubtitle(goal)}
        readiness={readiness}
        verdict={verdict}
        days={days}
        streak={streak}
        coveragePercent={coverage.percent}
        active="/goals/settings"
      />

      <Card>
        <CardHeader>
          <CardTitle>Targets and routine</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalSettingsForm
            goalId={goal.id}
            type={goal.type}
            targetPercent={goal.targetPercent}
            targetDate={goal.targetDate?.toISOString().slice(0, 10) ?? null}
            targetRank={goal.targetRank}
            dailyMinutesTarget={goal.dailyMinutesTarget}
            weeklyMockTarget={goal.weeklyMockTarget}
            restDays={goal.restDays}
            tasks={goal.tasks}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Other goals</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/goals/setup">New goal</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <GoalSwitcher
            goals={others.map((item) => ({
              id: item.id,
              title: goalTitle(item),
              subtitle: item.archivedAt
                ? `Archived ${item.archivedAt.toLocaleDateString("en-IN")}`
                : goalSubtitle(item),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
