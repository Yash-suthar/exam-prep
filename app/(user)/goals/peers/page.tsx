import { GoalHero } from "@/components/goals/goal-hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { loadGoalContext } from "@/lib/goal-context";
import { goalSubtitle, goalTitle } from "@/lib/goal-labels";
import { goalLeaderboard } from "@/lib/leaderboard";
import { requireUser } from "@/lib/session";
import { examLabel } from "@/lib/taxonomy";

export default async function GoalPeersPage() {
  const user = await requireUser();
  const context = await loadGoalContext(user.id);

  if (!context) {
    return (
      <EmptyState
        title="No active goal"
        description="Peers are grouped by the exam you are chasing."
        actionHref="/goals/setup"
        actionLabel="Create a goal"
      />
    );
  }

  const { goal, coverage, readiness, verdict, days, streak } = context;
  const board = await goalLeaderboard({
    userId: user.id,
    type: goal.type,
    examTag: goal.examTag,
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
        active="/goals/peers"
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Everyone chasing {examLabel(goal.examTag ?? "boards")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranked on momentum and recent mock scores, not on who paid more.
          </p>
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
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Around you
                  </p>
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
    </div>
  );
}
