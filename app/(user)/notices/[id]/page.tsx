import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStudentContext } from "@/lib/audience";
import { formatDay } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { matchesAudience } from "@/lib/targeting";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const [{ audience }, notice] = await Promise.all([
    getStudentContext(user.id),
    prisma.notice.findUnique({ where: { id } }),
  ]);
  if (!notice || !matchesAudience(notice, audience)) notFound();

  const now = new Date();
  if (notice.visibleFrom && notice.visibleFrom > now) notFound();
  if (notice.visibleUntil && notice.visibleUntil < now) notFound();

  return (
    <article className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center gap-2">
        {notice.isPinned ? <Badge tone="accent">Pinned</Badge> : null}
        {notice.examDate ? <Badge>{formatDay(notice.examDate)}</Badge> : null}
      </div>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{notice.title}</h1>
      <p className="whitespace-pre-wrap text-muted-foreground">{notice.description}</p>
      {notice.attachments.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-display text-xl">Attachments</h2>
          {notice.attachments.map((file) => {
            const isImage = /\.(png|jpe?g|gif|webp)$/i.test(file);
            const isPdf = /\.pdf($|\?)/i.test(file);
            return (
              <div key={file} className="rounded-2xl border border-border bg-card p-3">
                {isImage ? (
                  <img src={file} alt="" className="max-h-80 w-full rounded-xl object-contain" />
                ) : isPdf ? (
                  <iframe src={file} title={file} className="h-80 w-full rounded-xl" />
                ) : null}
                <a href={file} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-primary">
                  Download attachment
                </a>
              </div>
            );
          })}
        </div>
      ) : null}
      {notice.applyLink ? (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href={notice.applyLink} target="_blank" rel="noreferrer">
            Apply now
          </a>
        </Button>
      ) : null}
    </article>
  );
}
