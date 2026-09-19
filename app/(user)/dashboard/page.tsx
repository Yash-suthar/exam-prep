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
import { studentProgress } from "@/lib/student-progress";
import { examLabel } from "@/lib/taxonomy";

export default async function DashboardPage() {
  const user = await requireUser();
  const { profile, goal, audience, activeGoalTag } = await getStudentContext(user.id);
  const [notices, recs, progress] = await Promise.all([
    visibleNotices(audience, 2),
    recommendedCatalog(user.id, audience, activeGoalTag, 6),
    studentProgress(user.id),
  ]);
  const today = dayStart();
  const todayLog = goal?.dailyLogs.find((log) => log.date.getTime() === today.getTime());
  const results = (todayLog?.taskResults as Record<string, boolean> | null) ?? {};
  const firstName = (user.name ?? "there").split(" ")[0];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="text-sm font-semibold text-primary">Good to see you, {firstName}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Today in the hall
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {profile?.examGoals?.length
            ? `Personalised for ${profile.examGoals.map(examLabel).join(", ")}`
            : "Finish onboarding tags to sharpen recommendations."}
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Mocks sat" value={String(progress.mocksTaken)} hint="Submitted papers" />
        <StatCard
          label="Average score"
          value={progress.mocksTaken ? String(progress.avgScore) : "—"}
          hint={progress.bestScore ? `Best ${progress.bestScore}` : "Sit the free SSC set"}
        />
        <StatCard
          label="Accuracy"
          value={progress.mocksTaken ? `${progress.accuracy}%` : "—"}
          hint="Correct / attempted"
        />
        <StatCard
          label="Last paper"
          value={progress.lastScore != null ? String(progress.lastScore) : "—"}
          hint={progress.lastExamTitle ?? "No attempt yet"}
          href={progress.lastExamId ? `/exams/${progress.lastExamId}/result` : undefined}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl">Notices for you</h2>
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
                    {notice.examDate ? `Exam ${formatDay(notice.examDate)}` : formatDay(notice.createdAt)}
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

      {progress.weak.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Fix these before the next mock</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {progress.weak.map((topic) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
              >
                <span className="font-semibold">{topic.topic}</span>
                <span className="text-muted-foreground">{topic.accuracy}% on the last paper</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <RecommendationRow title="Books" href="/books" items={recs.books} />
      <RecommendationRow title="Study materials" href="/materials" items={recs.materials} />
      <RecommendationRow title="Previous papers" href="/papers" items={recs.papers} />
      <RecommendationRow title="Mocks" href="/exams" items={recs.exams} />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
