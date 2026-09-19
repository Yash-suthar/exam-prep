import { prisma } from "@/lib/prisma";
import { matchesAudience, type Audience } from "@/lib/targeting";

export async function visibleNotices(audience: Audience, take?: number) {
  const now = new Date();
  const notices = await prisma.notice.findMany({
    where: {
      AND: [
        { OR: [{ visibleFrom: null }, { visibleFrom: { lte: now } }] },
        { OR: [{ visibleUntil: null }, { visibleUntil: { gte: now } }] },
      ],
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
  const matched = notices.filter((notice) => matchesAudience(notice, audience));
  return take ? matched.slice(0, take) : matched;
}
