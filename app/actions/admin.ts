"use server";

import { AccessModel, EducationLevel, ItemType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { autoGrantItemToMatchingUsers } from "@/lib/auto-grant";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

type TargetingInput = {
  targetEducationLevels?: EducationLevel[];
  targetStandards?: string[];
  targetExamGoals?: string[];
  accessModel?: AccessModel;
  trialDurationDays?: number | null;
};

function targetingData(input: TargetingInput) {
  const accessModel = input.accessModel ?? "PAID";
  return {
    targetEducationLevels: input.targetEducationLevels ?? [],
    targetStandards: input.targetStandards ?? [],
    targetExamGoals: input.targetExamGoals ?? [],
    accessModel,
    trialDurationDays: accessModel === "FREE_TRIAL" ? input.trialDurationDays ?? 7 : null,
    isFree: accessModel === "FREE",
  };
}

function queueGrant(
  itemType: ItemType,
  itemId: string,
  input: TargetingInput & { accessModel?: AccessModel },
) {
  const accessModel = input.accessModel ?? "PAID";
  after(async () => {
    await autoGrantItemToMatchingUsers({
      itemType,
      itemId,
      accessModel,
      trialDurationDays: input.trialDurationDays,
      target: {
        targetEducationLevels: input.targetEducationLevels ?? [],
        targetStandards: input.targetStandards ?? [],
        targetExamGoals: input.targetExamGoals ?? [],
      },
    });
  });
}

function refreshCatalog() {
  revalidatePath("/admin/content");
  revalidatePath("/books");
  revalidatePath("/materials");
  revalidatePath("/papers");
  revalidatePath("/library");
  revalidatePath("/dashboard");
}

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
  attachments?: string[];
  visibleFrom?: string | null;
  visibleUntil?: string | null;
  targetEducationLevels?: EducationLevel[];
  targetStandards?: string[];
  targetExamGoals?: string[];
}) {
  await requireAdmin();
  const data = {
    title: input.title,
    description: input.description,
    applyLink: input.applyLink,
    examDate: input.examDate ? new Date(input.examDate) : null,
    isPinned: input.isPinned,
    attachments: input.attachments ?? [],
    visibleFrom: input.visibleFrom ? new Date(input.visibleFrom) : null,
    visibleUntil: input.visibleUntil ? new Date(input.visibleUntil) : null,
    targetEducationLevels: input.targetEducationLevels ?? [],
    targetStandards: input.targetStandards ?? [],
    targetExamGoals: input.targetExamGoals ?? [],
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
  topics?: (string | null)[];
} & TargetingInput) {
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
    rawPaperFileUrl: input.rawPaperFileUrl,
    isPublished: input.isPublished,
    price: (input.accessModel ?? (input.isFree ? "FREE" : "PAID")) === "FREE" ? 0 : input.price,
    ...targetingData({
      ...input,
      accessModel: input.accessModel ?? (input.isFree ? "FREE" : "PAID"),
    }),
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
      topic: input.topics?.[index] ?? null,
    })),
  });
  queueGrant("EXAM", exam.id, {
    ...input,
    accessModel: input.accessModel ?? (input.isFree ? "FREE" : "PAID"),
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

export async function saveCategoryTemplate(input: {
  categoryType: ItemType;
  cardLayout: string;
  visibleFields: string[];
  accentColor?: string | null;
  icon?: string | null;
}) {
  await requireAdmin();
  await prisma.categoryTemplate.upsert({
    where: { categoryType: input.categoryType },
    update: {
      cardLayout: input.cardLayout,
      visibleFields: input.visibleFields,
      accentColor: input.accentColor ?? null,
      icon: input.icon ?? null,
    },
    create: {
      categoryType: input.categoryType,
      cardLayout: input.cardLayout,
      visibleFields: input.visibleFields,
      accentColor: input.accentColor ?? null,
      icon: input.icon ?? null,
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/books");
  revalidatePath("/materials");
  revalidatePath("/papers");
  revalidatePath("/exams");
  revalidatePath("/notices");
  return { ok: true as const };
}

export async function saveSubject(name: string) {
  await requireAdmin();
  const subject = await prisma.subject.create({ data: { name: name.trim() } });
  refreshCatalog();
  revalidatePath("/admin/exams");
  return { ok: true as const, id: subject.id };
}

export async function saveBook(input: {
  id?: string;
  title: string;
  subjectId: string;
  fileUrl: string;
  price: number;
  coverImage?: string | null;
} & TargetingInput) {
  await requireAdmin();
  const target = targetingData(input);
  const data = {
    title: input.title,
    subjectId: input.subjectId,
    fileUrl: input.fileUrl,
    price: target.isFree ? 0 : input.price,
    coverImage: input.coverImage ?? null,
    ...target,
  };
  const book = input.id
    ? await prisma.book.update({ where: { id: input.id }, data })
    : await prisma.book.create({ data });
  queueGrant("BOOK", book.id, input);
  refreshCatalog();
  return { ok: true as const, id: book.id };
}

export async function deleteBook(id: string) {
  await requireAdmin();
  await prisma.accessGrant.deleteMany({ where: { itemType: "BOOK", itemId: id } });
  await prisma.book.delete({ where: { id } });
  refreshCatalog();
  return { ok: true as const };
}

export async function saveMaterial(input: {
  id?: string;
  title: string;
  fileUrl: string;
  price: number;
  tags: string[];
} & TargetingInput) {
  await requireAdmin();
  const target = targetingData(input);
  const data = {
    title: input.title,
    fileUrl: input.fileUrl,
    price: target.isFree ? 0 : input.price,
    tags: input.tags,
    ...target,
  };
  const material = input.id
    ? await prisma.studyMaterial.update({ where: { id: input.id }, data })
    : await prisma.studyMaterial.create({ data });
  queueGrant("MATERIAL", material.id, input);
  refreshCatalog();
  return { ok: true as const, id: material.id };
}

export async function deleteMaterial(id: string) {
  await requireAdmin();
  await prisma.accessGrant.deleteMany({ where: { itemType: "MATERIAL", itemId: id } });
  await prisma.studyMaterial.delete({ where: { id } });
  refreshCatalog();
  return { ok: true as const };
}

export async function savePaper(input: {
  id?: string;
  title: string;
  subjectId: string;
  year?: number | null;
  fileUrl: string;
  price: number;
} & TargetingInput) {
  await requireAdmin();
  const target = targetingData(input);
  const data = {
    title: input.title,
    subjectId: input.subjectId,
    year: input.year ?? null,
    fileUrl: input.fileUrl,
    price: target.isFree ? 0 : input.price,
    ...target,
  };
  const paper = input.id
    ? await prisma.paper.update({ where: { id: input.id }, data })
    : await prisma.paper.create({ data });
  queueGrant("PAPER", paper.id, input);
  refreshCatalog();
  return { ok: true as const, id: paper.id };
}

export async function deletePaper(id: string) {
  await requireAdmin();
  await prisma.accessGrant.deleteMany({ where: { itemType: "PAPER", itemId: id } });
  await prisma.paper.delete({ where: { id } });
  refreshCatalog();
  return { ok: true as const };
}

export async function deleteExam(id: string) {
  await requireAdmin();
  const attempts = await prisma.examAttempt.findMany({
    where: { examId: id },
    select: { id: true },
  });
  await prisma.examAnswer.deleteMany({
    where: { attemptId: { in: attempts.map((attempt) => attempt.id) } },
  });
  await prisma.examAttempt.deleteMany({ where: { examId: id } });
  await prisma.examQuestion.deleteMany({ where: { examId: id } });
  await prisma.accessGrant.deleteMany({ where: { itemType: "EXAM", itemId: id } });
  await prisma.exam.delete({ where: { id } });
  revalidatePath("/admin/exams");
  revalidatePath("/exams");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function setExamPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await prisma.exam.update({ where: { id }, data: { isPublished } });
  revalidatePath("/admin/exams");
  revalidatePath("/exams");
  return { ok: true as const };
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { ok: false as const, error: "You cannot change your own role." };
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true as const };
}
