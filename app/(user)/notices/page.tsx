import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function NoticesPage() {
  await requireUser();
  const notices = await prisma.notice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  if (notices.length === 0) {
    return (
      <EmptyState
        title="No notices yet"
        description="Exam dates and apply links will be posted here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Notice board</h1>
        <p className="mt-2 text-muted-foreground">
          Pinned alerts stay at the top. Apply links open the official portal.
        </p>
      </div>
      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{notice.title}</CardTitle>
                {notice.isPinned ? <Badge tone="accent">Pinned</Badge> : null}
              </div>
              {notice.examDate ? (
                <p className="text-sm text-muted-foreground">
                  {notice.examDate.toDateString()}
                </p>
              ) : null}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{notice.description}</p>
              <a
                href={notice.applyLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-primary"
              >
                Apply now
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
