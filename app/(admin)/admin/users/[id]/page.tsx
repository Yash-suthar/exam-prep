import { notFound } from "next/navigation";
import { GrantForm } from "@/components/admin/grant-form";
import { RevokeGrantButton } from "@/components/admin/revoke-grant-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { itemTypeLabel } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      purchases: { orderBy: { createdAt: "desc" } },
      accessGrants: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) notFound();

  const [books, materials, papers, exams, plans] = await Promise.all([
    prisma.book.findMany(),
    prisma.studyMaterial.findMany(),
    prisma.paper.findMany(),
    prisma.exam.findMany(),
    prisma.plan.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">{user.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {user.email} · {user.role}
          {user.suspended ? " · suspended" : ""}
        </p>
      </div>
      <GrantForm
        userId={user.id}
        suspended={user.suspended}
        role={user.role}
        items={{ books, materials, papers, exams, plans }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Purchases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {user.purchases.length === 0 ? (
            <p className="text-muted-foreground">None yet.</p>
          ) : (
            user.purchases.map((purchase) => (
              <p key={purchase.id}>
                {itemTypeLabel(purchase.itemType)} · {purchase.status}
              </p>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Manual grants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {user.accessGrants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grants.</p>
          ) : (
            user.accessGrants.map((grant) => (
              <div key={grant.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {itemTypeLabel(grant.itemType)} · {grant.itemId}
                </span>
                <div className="flex items-center gap-2">
                  <Badge>{grant.expiresAt ? "expiring" : "lifetime"}</Badge>
                  <RevokeGrantButton grantId={grant.id} userId={user.id} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
