import { ConsistencyGrid } from "@/components/goals/consistency-grid";
import { GoalHero } from "@/components/goals/goal-hero";
import { MomentumGauge } from "@/components/goals/momentum-gauge";
import { ProjectionChart } from "@/components/goals/projection-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { loadGoalContext } from "@/lib/goal-context";
import { goalSubtitle, goalTitle } from "@/lib/goal-labels";
import { computeMomentum } from "@/lib/momentum";
import { projectScore } from "@/lib/projection";
import { requireUser } from "@/lib/session";

export default async function GoalProgressPage() {
  const user = await requireUser();
  const context = await loadGoalContext(user.id);

  if (!context) {
    return (
      <EmptyState
        title="No active goal"
        description="Progress charts need a goal to track."
        actionHref="/goals/setup"
        actionLabel="Create a goal"
      />
    );
  }

  const { goal, attempts, coverage, readiness, verdict, days, streak, totalMinutes, accuracy } =
    context;

  const maxScore = attempts[0]
    ? attempts[0].exam.totalQuestions * attempts[0].exam.marksPerQuestion
    : 1;
  const stats = computeMomentum({
    logs: goal.dailyLogs,
    recentScores: attempts
      .map((attempt) => attempt.score)
      .filter((score): score is number => score != null)
      .slice(-5),
    maxScore,
  });
  const points = attempts.map((attempt) => ({
    at: attempt.submittedAt ?? attempt.startedAt,
    percent:
      ((attempt.score ?? 0) /
        Math.max(attempt.exam.totalQuestions * attempt.exam.marksPerQuestion, 1)) *
      100,
  }));
  const projection = projectScore({ points, targetDate: goal.targetDate });
  const hours = Math.round((totalMinutes / 60) * 10) / 10;

  const bySubject = new Map<string, { total: number; mastered: number }>();
  for (const topic of goal.topics) {
    const row = bySubject.get(topic.subject) ?? { total: 0, mastered: 0 };
    row.total += 1;
    if (topic.status === "MASTERED") row.mastered += 1;
    bySubject.set(topic.subject, row);
  }

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
        active="/goals/progress"
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Hours logged" value={`${hours}h`} />
        <Stat label="Mocks sat" value={String(attempts.length)} />
        <Stat label="Accuracy" value={attempts.length ? `${accuracy}%` : "—"} />
        <Stat label="Best streak" value={`${stats.best}d`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Momentum</CardTitle>
        </CardHeader>
        <CardContent>
          <MomentumGauge value={stats.momentum} streak={streak} best={stats.best} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consistency grid</CardTitle>
        </CardHeader>
        <CardContent>
          {goal.dailyLogs.length === 0 ? (
            <EmptyState
              title="No days logged yet"
              description="Tick a task or log study minutes and the first cell lights up."
            />
          ) : (
            <ConsistencyGrid
              tasks={goal.tasks}
              logs={goal.dailyLogs.map((log) => ({
                date: log.date.toISOString(),
                status: log.status,
                taskResults: (log.taskResults as Record<string, boolean> | null) ?? {},
              }))}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bySubject.size === 0 ? (
            <p className="text-sm text-muted-foreground">
              Load a syllabus to see subject-wise coverage.
            </p>
          ) : (
            [...bySubject.entries()].map(([subject, row]) => {
              const percent = Math.round((row.mastered / row.total) * 100);
              return (
                <div key={subject}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{subject}</span>
                    <span className="text-muted-foreground">
                      {row.mastered}/{row.total}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score trend</CardTitle>
        </CardHeader>
        <CardContent>
          {points.length === 0 ? (
            <EmptyState
              title="No mock scores yet"
              description="Sit a paper and the projection line starts here."
              actionHref="/exams"
              actionLabel="Open mocks"
            />
          ) : (
            <ProjectionChart
              points={points.map((point) => ({
                label: point.at.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                }),
                percent: Math.round(point.percent),
              }))}
              label={projection.label}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent study sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {goal.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Use the timer on the Today tab and sessions collect here.
            </p>
          ) : (
            <ul className="space-y-2">
              {goal.sessions.slice(0, 10).map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {session.createdAt.toLocaleDateString("en-IN")}
                    {session.note ? ` · ${session.note}` : ""}
                  </span>
                  <span className="font-semibold">{session.minutes} min</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
