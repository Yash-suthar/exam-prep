import Link from "next/link";
import { RecommendationRow } from "@/components/catalog/recommendation-row";
import { TodayChecklist } from "@/components/goals/today-checklist";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentContext } from "@/lib/audience";
import { dayStart, formatDay } from "@/lib/dates";
import { visibleNotices } from "@/lib/notices";
import { recommendedCatalog } from "@/lib/recommendations";
import { requireUser } from "@/lib/session";
import { examLabel } from "@/lib/taxonomy";

export default async function DashboardPage() {
  const user = await requireUser();
  const { profile, goal, audience, activeGoalTag } = await getStudentContext(user.id);
  const [notices, recs] = await Promise.all([
    visibleNotices(audience, 2),
    recommendedCatalog(user.id, audience, activeGoalTag, 6),
  ]);
  const today = dayStart();
  const todayLog = goal?.dailyLogs.find((log) => log.date.getTime() === today.getTime());
  const results = (todayLog?.taskResults as Record<string, boolean> | null) ?? {};

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="text-sm font-semibold text-primary">Good to see you, {(user.name ?? "there").split(" ")[0]}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Continue preparing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {profile?.examGoals?.length
            ? `Personalised for ${profile.examGoals.map(examLabel).join(", ")}`
            : "Finish onboarding tags to sharpen recommendations."}
        </p>
      </div>

      <section className="max-h-40 overflow-hidden">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl">Notices</h2>
          <Link href="/notices" className="text-sm font-semibold text-primary">
            Show all →
          </Link>
        </div>
        {notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notices for your profile right now.</p>
        ) : (
          <div className="grid gap-2">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notices/${notice.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{notice.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {notice.examDate ? formatDay(notice.examDate) : formatDay(notice.createdAt)}
                  </p>
                </div>
                {notice.isPinned ? <Badge tone="accent">Pinned</Badge> : null}
              </Link>
            ))}
          </div>
        )}
      </section>

      {goal ? (
        <Card>
          <CardHeader>
            <CardTitle>Today on {examLabel(goal.examTag ?? "boards")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TodayChecklist goalId={goal.id} tasks={goal.tasks} results={results} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Set a goal to unlock today’s list"
          description="School percentage or a competitive exam — two minutes, then the home page has a checklist."
          actionHref="/goals/setup"
          actionLabel="Create a goal"
        />
      )}

      <RecommendationRow title="Books" href="/books" items={recs.books} />
      <RecommendationRow title="Study materials" href="/materials" items={recs.materials} />
      <RecommendationRow title="Previous papers" href="/papers" items={recs.papers} />
      <RecommendationRow title="Mocks" href="/exams" items={recs.exams} />
    </div>
  );
}
