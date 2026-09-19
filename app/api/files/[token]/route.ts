import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { hasAccess } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { verifySignedFileToken } from "@/lib/pdf-signing";
import { auth } from "@/lib/auth";

async function resolveStoredPath(itemType: string, itemId: string) {
  if (itemType === "BOOK") {
    return (await prisma.book.findUnique({ where: { id: itemId } }))?.fileUrl;
  }
  if (itemType === "MATERIAL") {
    return (await prisma.studyMaterial.findUnique({ where: { id: itemId } }))
      ?.fileUrl;
  }
  if (itemType === "PAPER") {
    return (await prisma.paper.findUnique({ where: { id: itemId } }))?.fileUrl;
  }
  if (itemType === "EXAM") {
    return (await prisma.exam.findUnique({ where: { id: itemId } }))
      ?.rawPaperFileUrl;
  }
  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await context.params;
  const payload = verifySignedFileToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Link expired" }, { status: 403 });
  }
  if (payload.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allowed = await hasAccess(
    session.user.id,
    payload.itemType,
    payload.itemId,
  );
  if (!allowed) {
    return NextResponse.json({ error: "No access" }, { status: 403 });
  }

  const stored = await resolveStoredPath(payload.itemType, payload.itemId);
  if (!stored) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const absolute = path.isAbsolute(stored)
    ? stored
    : path.join(/* turbopackIgnore: true */ process.cwd(), "uploads", path.basename(stored));

  try {
    const bytes = await readFile(absolute);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=paper.pdf",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
