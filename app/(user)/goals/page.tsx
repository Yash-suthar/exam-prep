import Link from "next/link";
import { GoalHero } from "@/components/goals/goal-hero";
import { MilestoneList } from "@/components/goals/milestone-list";
import { StudyTimer } from "@/components/goals/study-timer";
import { TodayChecklist } from "@/components/goals/today-checklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { dayStart } from "@/lib/dates";
import { focusDeckForUser } from "@/lib/focus-deck";
import { loadGoalContext } from "@/lib/goal-context";
import { isRestDay, pacePerDay, revisionQueue } from "@/lib/goal-plan";
import { requireUser } from "@/lib/session";
import { goalTitle, goalSubtitle } from "@/lib/goal-labels";

export default async function GoalTodayPage() {
  const user = await requireUser();
  const context = await loadGoalContext(user.id);

  if (!context) {
    return (
      <EmptyState
        title="No active goal"
        description="Pick a board percentage or a competitive exam. You get a syllabus, a daily plan, and a readiness score."
        actionHref="/goals/setup"
        actionLabel="Create a goal"
      />
    );
  }

  const { goal, coverage, week, streak, readiness, verdict, days } = context;
  const focus = await focusDeckForUser(user.id);
  const today = dayStart();
  const todayLog = goal.dailyLogs.find((log) => log.date.getTime() === today.getTime());
  const results = (todayLog?.taskResults as Record<string, boolean> | null) ?? {};
  const restToday = isRestDay(today, goal.restDays);
  const minutesToday = todayLog?.minutes ?? 0;
  const pace = pacePerDay(coverage.total - coverage.mastered, days);
  const revision = revisionQueue(goal.topics);
  const nextTopics = goal.topics.filter((topic) => topic.status === "NOT_STARTED").slice(0, 3);

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
        active="/goals"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today&apos;s plan</CardTitle>
          {restToday ? <Badge tone="accent">Planned rest day</Badge> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">
                {minutesToday} / {goal.dailyMinutesTarget} minutes
              </p>
              <p className="text-xs text-muted-foreground">
                {minutesToday >= goal.dailyMinutesTarget
                  ? "Target met. Anything more is a bonus."
                  : `${goal.dailyMinutesTarget - minutesToday} minutes to go today.`}
              </p>
            </div>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, Math.round((minutesToday / Math.max(goal.dailyMinutesTarget, 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
          <TodayChecklist goalId={goal.id} tasks={goal.tasks} results={results} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study timer</CardTitle>
        </CardHeader>
        <CardContent>
          <StudyTimer
            goalId={goal.id}
            topics={goal.topics.map((topic) => ({
              id: topic.id,
              subject: topic.subject,
              name: topic.name,
            }))}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Bar
              label="Study minutes"
              value={week.minutes}
              target={week.minutesTarget}
              percent={week.minutesPercent}
              unit="min"
            />
            <Bar
              label="Mocks sat"
              value={week.mocks}
              target={week.mockTarget}
              percent={week.mockPercent}
              unit=""
            />
            <p className="text-xs text-muted-foreground">
              {pace
                ? `To finish the syllabus by your exam date: ${pace}.`
                : "Set an exam date in Settings to see a required pace."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What to study next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {focus ? (
              <Link
                href={focus.href}
                className="block rounded-2xl border border-amber-300/60 bg-amber-500/10 p-3"
              >
                <p className="text-sm font-semibold">{focus.title}</p>
                <p className="text-xs text-muted-foreground">{focus.hint}</p>
              </Link>
            ) : null}
            {revision.length > 0 ? (
              <div className="rounded-2xl border border-sky-300/60 bg-sky-500/10 p-3">
                <p className="text-sm font-semibold">Due for revision</p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {revision.map((entry) => (
                    <li key={entry.topic.id}>
                      {entry.topic.name} · {entry.staleDays > 900 ? "never revised" : `${entry.staleDays} days ago`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {nextTopics.length > 0 ? (
              <div className="rounded-2xl border border-border p-3">
                <p className="text-sm font-semibold">Not started</p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {nextTopics.map((topic) => (
                    <li key={topic.id}>
                      {topic.subject} · {topic.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!focus && revision.length === 0 && nextTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Syllabus is clean and no weak topics from recent mocks. Sit a harder paper.
              </p>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/goals/syllabus">Open syllabus</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <MilestoneList
            goalId={goal.id}
            milestones={goal.milestones.map((milestone) => ({
              id: milestone.id,
              title: milestone.title,
              dueDate: milestone.dueDate?.toISOString() ?? null,
              isDone: milestone.isDone,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Bar({
  label,
  value,
  target,
  percent,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  percent: number;
  unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value} / {target} {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
