import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ItemType } from "@prisma/client";
import { DocumentReader } from "@/components/reader/document-reader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasAccess } from "@/lib/access-control";
import { itemTypeFromSegment } from "@/lib/reader-links";
import { createSignedFileToken, signedFilePath } from "@/lib/pdf-signing";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { itemTypeLabel } from "@/lib/utils";

async function loadItem(itemType: ItemType, id: string) {
  if (itemType === "BOOK") {
    const book = await prisma.book.findUnique({
      where: { id },
      include: { subject: true },
    });
    return book
      ? { title: book.title, subtitle: book.subject.name, fileUrl: book.fileUrl, backHref: "/books" }
      : null;
  }
  if (itemType === "MATERIAL") {
    const material = await prisma.studyMaterial.findUnique({ where: { id } });
    return material
      ? {
          title: material.title,
          subtitle: material.tags.join(" · ") || "Study material",
          fileUrl: material.fileUrl,
          backHref: "/materials",
        }
      : null;
  }
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: { subject: true },
  });
  return paper
    ? {
        title: paper.title,
        subtitle: `${paper.subject.name}${paper.year ? ` · ${paper.year}` : ""}`,
        fileUrl: paper.fileUrl,
        backHref: "/papers",
      }
    : null;
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const user = await requireUser();
  const { type, id } = await params;
  const itemType = itemTypeFromSegment(type);
  if (!itemType) notFound();

  const item = await loadItem(itemType, id);
  if (!item) notFound();

  const allowed = await hasAccess(user.id, itemType, id);
  if (!allowed) redirect(item.backHref);

  const token = createSignedFileToken({ userId: user.id, itemType, itemId: id });

  return (
    <div className="space-y-4 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {itemTypeLabel(itemType)}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
            {item.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success">In your library</Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={item.backHref}>Back</Link>
          </Button>
        </div>
      </div>

      {item.fileUrl ? (
        <DocumentReader fileUrl={signedFilePath(token)} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold">No file attached yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            An admin can upload the PDF from the content manager.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        This file is served through a short-lived signed link tied to your account.
        Downloading and printing are disabled.
      </p>
    </div>
  );
}
