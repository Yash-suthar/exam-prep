import { GoalHero } from "@/components/goals/goal-hero";
import { SyllabusBoard } from "@/components/goals/syllabus-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { loadGoalContext } from "@/lib/goal-context";
import { goalSubtitle, goalTitle } from "@/lib/goal-labels";
import { requireUser } from "@/lib/session";

export default async function GoalSyllabusPage() {
  const user = await requireUser();
  const context = await loadGoalContext(user.id);

  if (!context) {
    return (
      <EmptyState
        title="No active goal"
        description="Create a goal and MeritPath loads the standard syllabus for that exam."
        actionHref="/goals/setup"
        actionLabel="Create a goal"
      />
    );
  }

  const { goal, coverage, readiness, verdict, days, streak } = context;

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
        active="/goals/syllabus"
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Syllabus — {coverage.mastered} mastered, {coverage.touched} started, {coverage.total} total
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tap a status chip to move a topic through Not started → Learning → Revising → Mastered.
          </p>
        </CardHeader>
        <CardContent>
          <SyllabusBoard
            goalId={goal.id}
            examTag={goal.examTag}
            topics={goal.topics.map((topic) => ({
              id: topic.id,
              subject: topic.subject,
              name: topic.name,
              status: topic.status,
              lastRevisedAt: topic.lastRevisedAt?.toISOString() ?? null,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
