import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Users</h1>
        <p className="mt-2 text-muted-foreground">
          Search, open a profile, then grant or revoke a single title.
        </p>
      </div>
      <form>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="h-10 w-full max-w-md rounded-xl border border-border bg-card px-3 text-sm"
        />
      </form>
      <Card>
        <CardHeader>
          <CardTitle>{users.length} accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-muted"
            >
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{user.role}</Badge>
                {user.suspended ? <Badge tone="warning">Suspended</Badge> : null}
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
