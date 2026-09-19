"use server";

import { ItemType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function toggleUserSuspended(userId: string, suspended: boolean) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { ok: false as const, error: "You cannot suspend your own account." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { suspended },
  });
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: suspended ? "USER_SUSPENDED" : "USER_REINSTATED",
      targetUserId: userId,
    },
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true as const };
}

export async function grantAccess(input: {
  userId: string;
  itemType: ItemType;
  itemId: string;
  expiresAt?: string | null;
}) {
  const admin = await requireAdmin();
  await prisma.accessGrant.create({
    data: {
      userId: input.userId,
      itemType: input.itemType,
      itemId: input.itemId,
      grantedBy: admin.id,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "ACCESS_GRANTED",
      itemType: input.itemType,
      itemId: input.itemId,
      targetUserId: input.userId,
    },
  });
  revalidatePath(`/admin/users/${input.userId}`);
  return { ok: true as const };
}

export async function revokeAccess(grantId: string, userId: string) {
  const admin = await requireAdmin();
  const grant = await prisma.accessGrant.delete({ where: { id: grantId } });
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "ACCESS_REVOKED",
      itemType: grant.itemType,
      itemId: grant.itemId,
      targetUserId: userId,
    },
  });
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true as const };
}

export async function saveNotice(input: {
  id?: string;
  title: string;
  description: string;
  applyLink: string;
  examDate?: string | null;
  isPinned: boolean;
}) {
  await requireAdmin();
  const data = {
    title: input.title,
    description: input.description,
    applyLink: input.applyLink,
    examDate: input.examDate ? new Date(input.examDate) : null,
    isPinned: input.isPinned,
  };

  if (input.id) {
    await prisma.notice.update({ where: { id: input.id }, data });
  } else {
    await prisma.notice.create({ data });
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function deleteNotice(id: string) {
  await requireAdmin();
  await prisma.notice.delete({ where: { id } });
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  return { ok: true as const };
}

export async function publishExam(input: {
  id?: string;
  title: string;
  subjectId?: string | null;
  durationMinutes: number;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
  optionsCount: number;
  price: number;
  isFree: boolean;
  rawPaperFileUrl: string;
  answerKey: string[];
  isPublished: boolean;
}) {
  const admin = await requireAdmin();
  if (input.answerKey.length !== input.totalQuestions) {
    return { ok: false as const, error: "Answer key length must match total questions." };
  }

  const data = {
    title: input.title,
    subjectId: input.subjectId || null,
    durationMinutes: input.durationMinutes,
    totalQuestions: input.totalQuestions,
    marksPerQuestion: input.marksPerQuestion,
    negativeMarking: input.negativeMarking,
    optionsCount: input.optionsCount,
    price: input.price,
    isFree: input.isFree,
    rawPaperFileUrl: input.rawPaperFileUrl,
    isPublished: input.isPublished,
  };

  const exam = input.id
    ? await prisma.exam.update({ where: { id: input.id }, data })
    : await prisma.exam.create({ data });

  await prisma.examQuestion.deleteMany({ where: { examId: exam.id } });
  await prisma.examQuestion.createMany({
    data: input.answerKey.map((correctOption, index) => ({
      examId: exam.id,
      questionNo: index + 1,
      correctOption,
    })),
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: input.id ? "EXAM_UPDATED" : "EXAM_CREATED",
      itemType: "EXAM",
      itemId: exam.id,
    },
  });

  revalidatePath("/admin/exams");
  revalidatePath("/exams");
  return { ok: true as const, examId: exam.id };
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { ok: false as const, error: "You cannot change your own role." };
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { ok: true as const };
}
