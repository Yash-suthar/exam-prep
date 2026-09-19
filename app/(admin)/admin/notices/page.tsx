import { NoticeForm } from "@/components/admin/notice-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminNoticesPage() {
  await requireAdmin();
  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Notice board</h1>
        <p className="mt-2 text-muted-foreground">
          Pin important dates and keep apply links current.
        </p>
      </div>
      <NoticeForm />
      <div className="grid gap-3">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{notice.title}</CardTitle>
                {notice.isPinned ? <Badge tone="accent">Pinned</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {notice.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
