import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getStudentContext } from "@/lib/audience";
import { formatDay } from "@/lib/dates";
import { visibleNotices } from "@/lib/notices";
import { requireUser } from "@/lib/session";

export default async function NoticesPage() {
  const user = await requireUser();
  const { audience } = await getStudentContext(user.id);
  const notices = await visibleNotices(audience);

  if (notices.length === 0) {
    return (
      <EmptyState
        title="No notices yet"
        description="Exam dates and apply links that match your profile will land here."
      />
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Notice board</h1>
        <p className="mt-2 text-muted-foreground">
          Pinned alerts stay at the top. Only notices in your window and audience are shown.
        </p>
      </div>
      <div className="grid gap-4">
        {notices.map((notice) => (
          <Link key={notice.id} href={`/notices/${notice.id}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{notice.title}</CardTitle>
                  {notice.isPinned ? <Badge tone="accent">Pinned</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {notice.examDate ? formatDay(notice.examDate) : formatDay(notice.createdAt)}
                </p>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{notice.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
