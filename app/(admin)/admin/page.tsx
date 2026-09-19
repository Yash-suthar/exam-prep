import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [users, exams, purchases, monthRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.exam.count({ where: { isPublished: true } }),
    prisma.purchase.findMany({
      where: { status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: true },
    }),
    prisma.purchase.aggregate({
      where: { status: "SUCCESS", createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Admin overview</h1>
        <p className="mt-2 text-muted-foreground">
          Users, published mocks, and this month&apos;s demo revenue.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Users" value={String(users)} />
        <Metric title="Published exams" value={String(exams)} />
        <Metric
          title="Revenue this month"
          value={formatInr(monthRevenue._sum.amount ?? 0)}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent purchases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchases yet.</p>
          ) : (
            purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex justify-between text-sm"
              >
                <span>
                  {purchase.user.name} · {purchase.itemType}
                </span>
                <span className="font-semibold">{formatInr(purchase.amount)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
