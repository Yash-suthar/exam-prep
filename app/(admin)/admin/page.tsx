import Link from "next/link";
import { BookOpen, ClipboardList, LayoutDashboard, Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [users, exams, books, notices, monthRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.exam.count(),
    prisma.book.count(),
    prisma.notice.count(),
    prisma.purchase.aggregate({
      where: { status: "SUCCESS", createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ]);

  const tiles = [
    {
      href: "/admin/users",
      title: "Users",
      value: String(users),
      hint: "Suspend, grant access, change role",
      icon: Users,
      action: "Manage users",
    },
    {
      href: "/admin/content",
      title: "Catalog",
      value: String(books),
      hint: "CRUD books, notes, and papers",
      icon: BookOpen,
      action: "Add or edit content",
    },
    {
      href: "/admin/exams",
      title: "Exams",
      value: String(exams),
      hint: "Build, publish, or delete mocks",
      icon: ClipboardList,
      action: "Open exam builder",
    },
    {
      href: "/admin/notices",
      title: "Notices",
      value: String(notices),
      hint: "Pin, target, schedule, attach files",
      icon: Megaphone,
      action: "Write a notice",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-primary">Admin console</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Manage MeritPath</h1>
        <p className="mt-2 text-muted-foreground">
          This is not the student app. Create and edit everything from the tiles below.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Card key={tile.href}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{tile.title}</p>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-3xl">{tile.value}</CardTitle>
                <p className="text-sm text-muted-foreground">{tile.hint}</p>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={tile.href}>{tile.action}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            This month
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Demo revenue {formatInr(monthRevenue._sum.amount ?? 0)}. Student view is optional — use it only to preview
          what a learner sees.
        </CardContent>
      </Card>
    </div>
  );
}
