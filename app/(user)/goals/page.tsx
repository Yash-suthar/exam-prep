import Link from "next/link";
import { ConsistencyGrid } from "@/components/goals/consistency-grid";
import { MomentumGauge } from "@/components/goals/momentum-gauge";
import { ProjectionChart } from "@/components/goals/projection-chart";
import { TodayChecklist } from "@/components/goals/today-checklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentContext } from "@/lib/audience";
import { dayStart } from "@/lib/dates";
import { focusDeckForUser } from "@/lib/focus-deck";
import { goalLeaderboard } from "@/lib/leaderboard";
import { computeMomentum } from "@/lib/momentum";
import { prisma } from "@/lib/prisma";
import { projectScore } from "@/lib/projection";
import { requireUser } from "@/lib/session";
import { examLabel } from "@/lib/taxonomy";

export default async function GoalsPage() {
  const user = await requireUser();
  const { goal } = await getStudentContext(user.id);
  if (!goal) {
    return (
      <EmptyState
        title="No active goal"
        description="Set a school percentage or a competitive exam so the consistency grid has something to track."
        actionHref="/goals/setup"
        actionLabel="Create a goal"
      />
    );
  }

  const [attempts, focus, board] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { userId: user.id, status: { not: "IN_PROGRESS" }, score: { not: null } },
      include: { exam: true },
      orderBy: { submittedAt: "asc" },
    }),
    focusDeckForUser(user.id),
    goalLeaderboard({ userId: user.id, type: goal.type, examTag: goal.examTag }),
  ]);

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
    percent: ((attempt.score ?? 0) / Math.max(attempt.exam.totalQuestions * attempt.exam.marksPerQuestion, 1)) * 100,
  }));
  const projection = projectScore({ points, targetDate: goal.targetDate });
  const today = dayStart();
  const todayLog = goal.dailyLogs.find((log) => log.date.getTime() === today.getTime());
  const results = (todayLog?.taskResults as Record<string, boolean> | null) ?? {};

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Active goal</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
            {goal.type === "SCHOOL"
              ? `${goal.targetPercent ?? 90}% in ${examLabel(goal.examTag ?? "boards")}`
              : examLabel(goal.examTag ?? "ssc")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {goal.targetDate
              ? `Target ${goal.targetDate.toLocaleDateString("en-IN")}`
              : "No exam date set"}
            {goal.targetRank ? ` · Rank ${goal.targetRank}` : ""}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/goals/setup">Change goal</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent>
          <TodayChecklist goalId={goal.id} tasks={goal.tasks} results={results} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Momentum</CardTitle>
        </CardHeader>
        <CardContent>
          <MomentumGauge value={stats.momentum} streak={stats.streak} best={stats.best} />
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
              description="Tick a task today and the first cell lights up."
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
          <CardTitle>Focus deck</CardTitle>
        </CardHeader>
        <CardContent>
          {focus ? (
            <Link href={focus.href} className="block rounded-2xl border border-border bg-muted/40 p-4">
              <p className="font-display text-xl font-semibold">{focus.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{focus.hint}</p>
            </Link>
          ) : (
            <EmptyState
              title="No weak topics yet"
              description="Submit a mock with topic tags and we'll build an 8-minute drill."
              actionHref="/exams"
              actionLabel="Take a mock"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectionChart
            points={points.map((point) => ({
              label: point.at.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
              percent: Math.round(point.percent),
            }))}
            label={projection.label}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goal leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {board.total < 2 ? (
            <EmptyState
              title="No peers on this goal yet"
              description="When others pick the same exam, you'll see ranks around you — not just a flat top 10."
            />
          ) : (
            <>
              {board.me ? (
                <div className="rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-primary">Your rank</p>
                  <p className="font-display text-2xl font-semibold">
                    #{board.me.rank} of {board.total}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Momentum {board.me.momentum} · recent mock {board.me.avg}
                  </p>
                </div>
              ) : null}
              <ol className="space-y-2">
                {board.top.map((row) => (
                  <li
                    key={row.userId}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                  >
                    <span className="text-sm font-semibold">
                      #{row.rank} {row.name}
                      {row.userId === user.id ? <Badge className="ml-2">You</Badge> : null}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.composite} pts</span>
                  </li>
                ))}
              </ol>
              {board.around.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Around you</p>
                  <ol className="space-y-2">
                    {board.around.map((row) => (
                      <li key={row.userId} className="flex justify-between text-sm">
                        <span>
                          #{row.rank} {row.name}
                        </span>
                        <span className="text-muted-foreground">{row.composite}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Study pods</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Shared streaks and a synced focus timer for the same goal — coming next. The
            leaderboard already groups you with people on {examLabel(goal.examTag ?? "boards")}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
