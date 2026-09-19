import { EducationLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { matchesAudience, type Audience } from "@/lib/targeting";

function toLocalInput(date: Date | null) {
  if (!date) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function noticeToDraft(notice: {
  id: string;
  title: string;
  description: string;
  applyLink: string;
  examDate: Date | null;
  isPinned: boolean;
  attachments: string[];
  visibleFrom: Date | null;
  visibleUntil: Date | null;
  targetEducationLevels: EducationLevel[];
  targetStandards: string[];
  targetExamGoals: string[];
}) {
  return {
    id: notice.id,
    title: notice.title,
    description: notice.description,
    applyLink: notice.applyLink,
    examDate: notice.examDate ? notice.examDate.toISOString().slice(0, 10) : "",
    isPinned: notice.isPinned,
    attachments: notice.attachments,
    visibleFrom: toLocalInput(notice.visibleFrom),
    visibleUntil: toLocalInput(notice.visibleUntil),
    targeting: {
      targetEducationLevels: notice.targetEducationLevels,
      targetStandards: notice.targetStandards,
      targetExamGoals: notice.targetExamGoals,
    },
  };
}

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
