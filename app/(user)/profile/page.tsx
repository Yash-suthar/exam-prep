import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatInr, itemTypeLabel } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await requireUser();
  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          {user.name} · {user.email} · {user.role}
        </p>
      </div>
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
                    <p className="text-sm font-semibold">
                      {itemTypeLabel(purchase.itemType)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {purchase.createdAt.toDateString()}
                      {purchase.expiresAt
                        ? ` · expires ${purchase.expiresAt.toDateString()}`
                        : " · lifetime"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatInr(purchase.amount)}
                    </span>
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
