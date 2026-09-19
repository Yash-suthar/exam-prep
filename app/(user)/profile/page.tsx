import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentContext } from "@/lib/audience";
import { formatInr, itemTypeLabel } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { educationLabel, examLabel } from "@/lib/taxonomy";

export default async function ProfilePage() {
  const user = await requireUser();
  const [{ profile, goal }, purchases] = await Promise.all([
    getStudentContext(user.id),
    prisma.purchase.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          {user.name} · {user.email} · {user.role}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Onboarding</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/onboarding?edit=1">Edit</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">You are </span>
            {profile ? educationLabel(profile.educationLevel) : "not set"}
            {profile?.standard ? ` · ${profile.standard}` : ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile?.examGoals.length
              ? profile.examGoals.map((goalTag) => (
                  <Badge key={goalTag}>{examLabel(goalTag)}</Badge>
                ))
              : <span className="text-muted-foreground">No exam tags yet</span>}
          </div>
          <p className="text-muted-foreground">
            Active goal:{" "}
            {goal
              ? goal.type === "SCHOOL"
                ? `${goal.targetPercent ?? 90}%`
                : examLabel(goal.examTag ?? "ssc")
              : "none"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase history</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <EmptyState
              title="No invoices yet"
              description="Demo checkout will appear here after you unlock a paid title."
              actionHref="/books"
              actionLabel="Browse books"
            />
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{itemTypeLabel(purchase.itemType)}</p>
                    <p className="text-xs text-muted-foreground">
                      {purchase.createdAt.toDateString()}
                      {purchase.expiresAt
                        ? ` · expires ${purchase.expiresAt.toDateString()}`
                        : " · lifetime"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{formatInr(purchase.amount)}</span>
                    <Badge tone="success">{purchase.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
