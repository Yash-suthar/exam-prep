import { mkdir, writeFile } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { DayStatus, EducationLevel, PrismaClient, TopicStatus } from "@prisma/client";
import { defaultMilestones, syllabusTemplate } from "../lib/syllabus-templates";

const prisma = new PrismaClient();

const ANSWER_KEY = [
  "B",
  "C",
  "A",
  "D",
  "B",
  "A",
  "C",
  "D",
  "B",
  "A",
  "C",
  "B",
  "D",
  "A",
  "C",
  "B",
  "A",
  "D",
  "C",
  "B",
];

const TOPICS = [
  "Arithmetic",
  "Percentages",
  "Number series",
  "Vocabulary",
  "Polity",
  "Simple interest",
  "Odd one out",
  "Geography",
  "Time and work",
  "Spelling",
  "Averages",
  "Syllogism",
  "Economy",
  "Squares",
  "Rivers",
  "Percentages",
  "Vocabulary",
  "Polity",
  "LCM",
  "Biology",
];

const QUESTIONS = [
  "A train 120 m long passes a pole in 6 seconds. Its speed is:",
  "If 15% of x is 45, then x equals:",
  "The next number in 2, 6, 12, 20, 30 is:",
  "Choose the synonym of 'candid':",
  "Who is the ex-officio Chairman of the Rajya Sabha?",
  "Simple interest on Rs 4,000 at 5% for 3 years is:",
  "Find the odd one: 3, 5, 7, 9, 11",
  "The capital of Mizoram is:",
  "A can do a job in 10 days, B in 15. Together they finish in:",
  "Choose the correctly spelled word:",
  "The average of 12, 18, 24 is:",
  "If all roses are flowers, some flowers fade. Which follows?",
  "GST is a tax on:",
  "The square of 25 is:",
  "Which river is the longest in India?",
  "20% of 250 is:",
  "Opposite of 'scarce':",
  "The Constitution of India was adopted in:",
  "LCM of 12 and 18 is:",
  "Which organ purifies blood in the human body?",
];

function winAnsi(value: string) {
  return value.replace(/[^\x20-\x7E]/g, "-");
}

const OPTIONS = [
  ["60 km/h", "72 km/h", "80 km/h", "90 km/h"],
  ["200", "250", "300", "350"],
  ["36", "40", "42", "44"],
  ["secretive", "frank", "angry", "silent"],
  ["President", "Vice-President", "PM", "Speaker"],
  ["Rs 400", "Rs 500", "Rs 600", "Rs 800"],
  ["3", "5", "9", "11"],
  ["Imphal", "Aizawl", "Kohima", "Shillong"],
  ["5 days", "6 days", "8 days", "12 days"],
  ["accomodate", "accommodate", "acommodate", "acomodate"],
  ["16", "18", "20", "22"],
  ["All flowers fade", "Some roses fade", "No roses fade", "None follows"],
  ["income", "value addition", "imports only", "wealth"],
  ["525", "625", "675", "725"],
  ["Yamuna", "Ganga", "Godavari", "Narmada"],
  ["40", "45", "50", "55"],
  ["rare", "abundant", "tiny", "costly"],
  ["1947", "1949", "1950", "1952"],
  ["24", "36", "48", "54"],
  ["Lungs", "Kidneys", "Heart", "Liver"],
];

async function writePaperPdf(filePath: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
    const page = pdf.addPage([595, 842]);
    page.drawText("MeritPath Mock Paper", {
      x: 48,
      y: 800,
      size: 11,
      font: bold,
      color: rgb(0.05, 0.46, 0.43),
    });
    page.drawText("SSC CGL Tier-1 - General Ability (Set A)", {
      x: 48,
      y: 778,
      size: 16,
      font: bold,
    });
    page.drawText("Duration: 15 minutes    Maximum marks: 40    Negative marking: 0.50", {
      x: 48,
      y: 756,
      size: 10,
      font,
    });

    const start = pageIndex * 5;
    let y = 720;
    for (let index = start; index < start + 5; index += 1) {
      page.drawText(winAnsi(`Q.${index + 1}  ${QUESTIONS[index]}`), {
        x: 48,
        y,
        size: 12,
        font: bold,
      });
      y -= 28;
      OPTIONS[index].forEach((option, optionIndex) => {
        const label = ["A", "B", "C", "D"][optionIndex];
        page.drawText(winAnsi(`(${label})  ${option}`), {
          x: 64,
          y,
          size: 11,
          font,
        });
        y -= 20;
      });
      y -= 16;
    }
    page.drawText(`Page ${pageIndex + 1} of 4`, {
      x: 270,
      y: 36,
      size: 10,
      font,
    });
  }

  const bytes = await pdf.save();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes);
}

function utcDay(offset: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
}

async function writeLogs(
  goalId: string,
  taskIds: string[],
  pattern: DayStatus[],
) {
  for (let index = 0; index < pattern.length; index += 1) {
    const status = pattern[index];
    const results: Record<string, boolean> = {};
    if (status === "COMPLETE") {
      for (const id of taskIds) results[id] = true;
    } else if (status === "PARTIAL") {
      if (taskIds[0]) results[taskIds[0]] = true;
    } else if (status === "MISSED_EXAM") {
      if (taskIds[1]) results[taskIds[1]] = true;
    }
    const minutes =
      status === "COMPLETE" ? 75 + (index % 4) * 15 : status === "PARTIAL" ? 40 : 0;
    await prisma.dailyLog.create({
      data: {
        goalId,
        date: utcDay(pattern.length - 1 - index),
        status,
        taskResults: results,
        minutes,
      },
    });
  }
}

async function seedSyllabus(
  goalId: string,
  examTag: string,
  progress: { mastered: number; revising: number; learning: number },
) {
  const template = syllabusTemplate(examTag);
  const flat = template.flatMap((subject) =>
    subject.topics.map((name) => ({ goalId, subject: subject.subject, name })),
  );
  await prisma.syllabusTopic.createMany({ data: flat, skipDuplicates: true });

  const topics = await prisma.syllabusTopic.findMany({
    where: { goalId },
    orderBy: { name: "asc" },
  });

  let index = 0;
  const assign = async (count: number, status: TopicStatus, staleDays: number) => {
    for (let step = 0; step < count && index < topics.length; step += 1, index += 1) {
      await prisma.syllabusTopic.update({
        where: { id: topics[index].id },
        data: {
          status,
          lastRevisedAt: new Date(Date.now() - staleDays * 86_400_000),
        },
      });
    }
  };

  await assign(progress.mastered, "MASTERED", 12);
  await assign(progress.revising, "REVISING", 4);
  await assign(progress.learning, "LEARNING", 1);
}

async function seedMilestones(goalId: string, examTag: string, targetDate: Date | null) {
  const list = defaultMilestones(examTag, targetDate);
  for (let index = 0; index < list.length; index += 1) {
    await prisma.goalMilestone.create({
      data: {
        goalId,
        title: list[index].title,
        dueDate: list[index].dueDate,
        isDone: index === 0,
        completedAt: index === 0 ? new Date(Date.now() - 6 * 86_400_000) : null,
      },
    });
  }
}

async function seedSessions(goalId: string, days: number[], minutes: number[]) {
  const topics = await prisma.syllabusTopic.findMany({
    where: { goalId },
    take: 6,
  });
  for (let index = 0; index < days.length; index += 1) {
    await prisma.studySession.create({
      data: {
        goalId,
        minutes: minutes[index],
        topicId: topics[index % Math.max(topics.length, 1)]?.id ?? null,
        createdAt: new Date(Date.now() - days[index] * 86_400_000),
      },
    });
  }
}

async function main() {
  await prisma.examAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.accessGrant.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.syllabusTopic.deleteMany();
  await prisma.goalMilestone.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.goalTask.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.categoryTemplate.deleteMany();
  await prisma.book.deleteMany();
  await prisma.studyMaterial.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const paperRel = "uploads/ssc-cgl-tier1.pdf";
  await writePaperPdf(path.join(process.cwd(), paperRel));

  const passwordHash = await bcrypt.hash("MeritPath@Student1", 12);
  const adminHash = await bcrypt.hash("MeritPath@Admin1", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Ananya Rao",
      email: "admin@meritpath.in",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Yash Student",
      email: "student@meritpath.in",
      passwordHash,
      role: "USER",
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Shah",
      email: "priya@meritpath.in",
      passwordHash,
      role: "USER",
    },
  });

  const rohan = await prisma.user.create({
    data: {
      name: "Rohan Mehta",
      email: "rohan@meritpath.in",
      passwordHash,
      role: "USER",
    },
  });

  await prisma.userSettings.createMany({
    data: [
      { userId: student.id, confirmBeforeLocking: true },
      { userId: priya.id, confirmBeforeLocking: true },
      { userId: rohan.id, confirmBeforeLocking: false },
    ],
  });

  await prisma.userProfile.createMany({
    data: [
      {
        userId: student.id,
        educationLevel: "STUDENT",
        standard: "12th",
        examGoals: ["ssc", "jee"],
        onboardedAt: new Date(),
      },
      {
        userId: priya.id,
        educationLevel: "GRADUATE",
        standard: null,
        examGoals: ["ssc", "banking"],
        onboardedAt: new Date(),
      },
      {
        userId: rohan.id,
        educationLevel: "STUDENT",
        standard: "12th",
        examGoals: ["boards", "neet"],
        onboardedAt: new Date(),
      },
    ],
  });

  const [quant, reasoning, english, gs, biology] = await Promise.all([
    prisma.subject.create({ data: { name: "Quantitative Aptitude" } }),
    prisma.subject.create({ data: { name: "Reasoning" } }),
    prisma.subject.create({ data: { name: "English" } }),
    prisma.subject.create({ data: { name: "General Studies" } }),
    prisma.subject.create({ data: { name: "Biology" } }),
  ]);

  const targeting: Record<
    string,
    { targetEducationLevels: EducationLevel[]; targetStandards: string[]; targetExamGoals: string[] }
  > = {
    ssc: {
      targetEducationLevels: ["STUDENT", "GRADUATE"],
      targetStandards: ["12th", "College"],
      targetExamGoals: ["ssc"],
    },
    banking: {
      targetEducationLevels: ["GRADUATE", "WORKING_PROFESSIONAL"],
      targetStandards: [],
      targetExamGoals: ["banking"],
    },
    jee: {
      targetEducationLevels: ["STUDENT"],
      targetStandards: ["11th", "12th"],
      targetExamGoals: ["jee"],
    },
    neet: {
      targetEducationLevels: ["STUDENT"],
      targetStandards: ["11th", "12th"],
      targetExamGoals: ["neet"],
    },
    boards: {
      targetEducationLevels: ["STUDENT"],
      targetStandards: ["10th", "12th"],
      targetExamGoals: ["boards"],
    },
  };

  const quantBook = await prisma.book.create({
    data: {
      title: "Arithmetic for SSC — Class Notes",
      subjectId: quant.id,
      fileUrl: paperRel,
      price: 199,
      isFree: false,
      accessModel: "PAID",
      ...targeting.ssc,
    },
  });

  await prisma.book.createMany({
    data: [
      {
        title: "Puzzle Workbook",
        subjectId: reasoning.id,
        fileUrl: paperRel,
        price: 149,
        isFree: false,
        accessModel: "PAID",
        ...targeting.ssc,
      },
      {
        title: "Error Spotting Pack",
        subjectId: english.id,
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        accessModel: "FREE",
        ...targeting.ssc,
      },
      {
        title: "Polity Capsules",
        subjectId: gs.id,
        fileUrl: paperRel,
        price: 129,
        isFree: false,
        accessModel: "PAID",
        targetEducationLevels: ["GRADUATE"],
        targetStandards: [],
        targetExamGoals: ["ssc", "upsc"],
      },
      {
        title: "NCERT Physics 12 — Fast notes",
        subjectId: quant.id,
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        accessModel: "FREE",
        ...targeting.jee,
      },
      {
        title: "Organic Chemistry Drill",
        subjectId: biology.id,
        fileUrl: paperRel,
        price: 0,
        isFree: false,
        accessModel: "FREE_TRIAL",
        trialDurationDays: 7,
        ...targeting.neet,
      },
      {
        title: "Board Maths 12 — Target 90",
        subjectId: quant.id,
        fileUrl: paperRel,
        price: 179,
        isFree: false,
        accessModel: "PAID",
        ...targeting.boards,
      },
      {
        title: "Banking DI Workbook",
        subjectId: quant.id,
        fileUrl: paperRel,
        price: 159,
        isFree: false,
        accessModel: "PAID",
        ...targeting.banking,
      },
    ],
  });

  await prisma.studyMaterial.createMany({
    data: [
      {
        title: "Number System one-pager",
        fileUrl: paperRel,
        price: 49,
        isFree: false,
        tags: ["quant", "ssc", "arithmetic"],
        accessModel: "PAID",
        ...targeting.ssc,
      },
      {
        title: "Syllogism maps",
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        tags: ["reasoning", "syllogism"],
        accessModel: "FREE",
        ...targeting.ssc,
      },
      {
        title: "Current affairs — last 90 days",
        fileUrl: paperRel,
        price: 79,
        isFree: false,
        tags: ["gs", "banking"],
        accessModel: "PAID",
        ...targeting.banking,
      },
      {
        title: "Percentages speed sheet",
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        tags: ["percentages", "quant"],
        accessModel: "FREE",
        ...targeting.ssc,
      },
      {
        title: "Vocabulary — candid to scarce",
        fileUrl: paperRel,
        price: 0,
        isFree: false,
        tags: ["vocabulary", "english"],
        accessModel: "FREE_TRIAL",
        trialDurationDays: 5,
        ...targeting.ssc,
      },
      {
        title: "NEET Biology — kidneys & lungs",
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        tags: ["biology", "neet"],
        accessModel: "FREE",
        ...targeting.neet,
      },
      {
        title: "JEE kinematics flash",
        fileUrl: paperRel,
        price: 59,
        isFree: false,
        tags: ["jee", "physics"],
        accessModel: "PAID",
        ...targeting.jee,
      },
      {
        title: "Board chemistry reactions",
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        tags: ["boards", "chemistry"],
        accessModel: "FREE",
        ...targeting.boards,
      },
      {
        title: "Polity — Rajya Sabha notes",
        fileUrl: paperRel,
        price: 39,
        isFree: false,
        tags: ["polity", "gs"],
        accessModel: "PAID",
        targetEducationLevels: ["STUDENT", "GRADUATE"],
        targetStandards: ["12th"],
        targetExamGoals: ["ssc", "upsc"],
      },
    ],
  });

  await prisma.paper.createMany({
    data: [
      {
        title: "SSC CGL 2023 Tier-1 (Shift 2)",
        subjectId: quant.id,
        year: 2023,
        fileUrl: paperRel,
        price: 99,
        isFree: false,
        accessModel: "PAID",
        ...targeting.ssc,
      },
      {
        title: "IBPS PO Prelims 2022",
        subjectId: reasoning.id,
        year: 2022,
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        accessModel: "FREE",
        ...targeting.banking,
      },
      {
        title: "State PSC GS paper 2024",
        subjectId: gs.id,
        year: 2024,
        fileUrl: paperRel,
        price: 79,
        isFree: false,
        accessModel: "PAID",
        targetEducationLevels: ["GRADUATE"],
        targetStandards: [],
        targetExamGoals: ["state-psc"],
      },
      {
        title: "JEE Main 2024 January",
        subjectId: quant.id,
        year: 2024,
        fileUrl: paperRel,
        price: 89,
        isFree: false,
        accessModel: "PAID",
        ...targeting.jee,
      },
      {
        title: "NEET UG 2023",
        subjectId: biology.id,
        year: 2023,
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        accessModel: "FREE",
        ...targeting.neet,
      },
    ],
  });

  const plan = await prisma.plan.create({
    data: {
      name: "Full Access — 3 months",
      description: "Every book, paper, material, and mock published during the window.",
      price: 999,
      durationDays: 90,
      includesAll: true,
    },
  });

  await prisma.notice.createMany({
    data: [
      {
        title: "SSC CGL 2026 notification expected",
        description:
          "Keep documents ready. Application link will open on the SSC portal. Tier-1 stays OMR-style for this cycle.",
        examDate: new Date("2026-12-04"),
        applyLink: "https://ssc.gov.in",
        isPinned: true,
        attachments: [paperRel],
        targetExamGoals: ["ssc"],
        targetEducationLevels: ["STUDENT", "GRADUATE"],
        targetStandards: ["12th", "College"],
      },
      {
        title: "IBPS Clerk prelims window",
        description: "Sectional timing applies. Practise OMR locking before you sit.",
        examDate: new Date("2026-10-18"),
        applyLink: "https://www.ibps.in",
        isPinned: false,
        targetExamGoals: ["banking"],
        targetEducationLevels: ["GRADUATE", "WORKING_PROFESSIONAL"],
      },
      {
        title: "NEET UG city intimation",
        description: "Download the city slip the moment it drops. Biology mocks stay free this week.",
        examDate: new Date("2026-05-03"),
        applyLink: "https://neet.nta.nic.in",
        isPinned: false,
        targetExamGoals: ["neet"],
        targetStandards: ["12th"],
        targetEducationLevels: ["STUDENT"],
      },
      {
        title: "Class 12 board practical window",
        description: "Internal marks close this month. Keep the 90% goal checklist honest.",
        examDate: new Date("2026-02-12"),
        applyLink: "https://cbse.gov.in",
        isPinned: false,
        targetExamGoals: ["boards"],
        targetStandards: ["12th"],
        targetEducationLevels: ["STUDENT"],
      },
      {
        title: "UPSC prelims — expired listing",
        description: "This notice should stay hidden because the window closed.",
        examDate: new Date("2025-05-25"),
        applyLink: "https://upsc.gov.in",
        isPinned: false,
        visibleUntil: new Date("2025-06-01"),
        targetExamGoals: ["upsc"],
      },
    ],
  });

  await prisma.categoryTemplate.createMany({
    data: [
      {
        categoryType: "BOOK",
        cardLayout: "image-first",
        visibleFields: ["price", "subject", "free", "goal"],
        accentColor: "#0f766e",
        icon: "book",
      },
      {
        categoryType: "MATERIAL",
        cardLayout: "text-first",
        visibleFields: ["price", "free", "goal"],
        accentColor: "#c2410c",
        icon: "file",
      },
      {
        categoryType: "PAPER",
        cardLayout: "compact-list",
        visibleFields: ["price", "subject", "free"],
        accentColor: "#0f766e",
        icon: "scroll",
      },
      {
        categoryType: "EXAM",
        cardLayout: "image-first",
        visibleFields: ["price", "subject", "free", "goal"],
        accentColor: "#0f766e",
        icon: "timer",
      },
      {
        categoryType: "NOTICE",
        cardLayout: "text-first",
        visibleFields: ["subject"],
        accentColor: "#c2410c",
        icon: "megaphone",
      },
    ],
  });

  const exam = await prisma.exam.create({
    data: {
      title: "SSC CGL Tier-1 Mock — Set A",
      subjectId: quant.id,
      rawPaperFileUrl: paperRel,
      durationMinutes: 15,
      totalQuestions: 20,
      marksPerQuestion: 2,
      negativeMarking: 0.5,
      optionsCount: 4,
      price: 0,
      isFree: true,
      isPublished: true,
      accessModel: "FREE",
      ...targeting.ssc,
    },
  });

  await prisma.exam.create({
    data: {
      title: "Banking Prelims Speed Test",
      subjectId: reasoning.id,
      rawPaperFileUrl: paperRel,
      durationMinutes: 20,
      totalQuestions: 20,
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      optionsCount: 4,
      price: 149,
      isFree: false,
      isPublished: true,
      accessModel: "PAID",
      ...targeting.banking,
      questions: {
        create: ANSWER_KEY.map((correctOption, index) => ({
          questionNo: index + 1,
          correctOption,
          topic: TOPICS[index],
        })),
      },
    },
  });

  await prisma.examQuestion.createMany({
    data: ANSWER_KEY.map((correctOption, index) => ({
      examId: exam.id,
      questionNo: index + 1,
      correctOption,
      topic: TOPICS[index],
    })),
  });

  const yashGoal = await prisma.goal.create({
    data: {
      userId: student.id,
      type: "COMPETITIVE_EXAM",
      examTag: "ssc",
      targetDate: new Date("2026-12-04"),
      targetRank: 800,
      dailyMinutesTarget: 90,
      weeklyMockTarget: 3,
      restDays: [0],
      isActive: true,
      tasks: {
        create: [
          { label: "1 mock test", isAutoTracked: true },
          { label: "Read for 45 minutes", isAutoTracked: false, targetMinutes: 45 },
          { label: "Revise 20 formulae", isAutoTracked: false },
        ],
      },
    },
    include: { tasks: true },
  });

  const priyaGoal = await prisma.goal.create({
    data: {
      userId: priya.id,
      type: "COMPETITIVE_EXAM",
      examTag: "ssc",
      targetDate: new Date("2026-12-04"),
      targetRank: 400,
      dailyMinutesTarget: 120,
      weeklyMockTarget: 4,
      restDays: [],
      isActive: true,
      tasks: {
        create: [
          { label: "1 mock test", isAutoTracked: true },
          { label: "Read for 45 minutes", isAutoTracked: false, targetMinutes: 45 },
        ],
      },
    },
    include: { tasks: true },
  });

  const rohanGoal = await prisma.goal.create({
    data: {
      userId: rohan.id,
      type: "SCHOOL",
      examTag: "boards",
      targetPercent: 90,
      targetDate: new Date("2026-03-15"),
      dailyMinutesTarget: 60,
      weeklyMockTarget: 2,
      restDays: [0, 6],
      isActive: true,
      tasks: {
        create: [
          { label: "Read for 45 minutes", isAutoTracked: false, targetMinutes: 45 },
          { label: "Solve 10 board questions", isAutoTracked: false },
        ],
      },
    },
    include: { tasks: true },
  });

  await writeLogs(
    yashGoal.id,
    yashGoal.tasks.map((task) => task.id),
    [
      "COMPLETE",
      "COMPLETE",
      "PARTIAL",
      "COMPLETE",
      "NONE",
      "COMPLETE",
      "COMPLETE",
      "MISSED_EXAM",
      "PARTIAL",
      "COMPLETE",
      "COMPLETE",
      "COMPLETE",
      "PARTIAL",
      "COMPLETE",
      "COMPLETE",
      "NONE",
      "COMPLETE",
      "COMPLETE",
      "PARTIAL",
      "COMPLETE",
      "COMPLETE",
    ],
  );

  await writeLogs(
    priyaGoal.id,
    priyaGoal.tasks.map((task) => task.id),
    [
      "COMPLETE",
      "COMPLETE",
      "COMPLETE",
      "PARTIAL",
      "COMPLETE",
      "COMPLETE",
      "COMPLETE",
      "COMPLETE",
      "PARTIAL",
      "COMPLETE",
      "COMPLETE",
      "COMPLETE",
      "COMPLETE",
      "COMPLETE",
    ],
  );

  await writeLogs(
    rohanGoal.id,
    rohanGoal.tasks.map((task) => task.id),
    ["NONE", "PARTIAL", "COMPLETE", "NONE", "PARTIAL", "COMPLETE", "NONE", "PARTIAL"],
  );

  await seedSyllabus(yashGoal.id, "ssc", { mastered: 9, revising: 7, learning: 6 });
  await seedSyllabus(priyaGoal.id, "ssc", { mastered: 16, revising: 8, learning: 4 });
  await seedSyllabus(rohanGoal.id, "boards", { mastered: 3, revising: 2, learning: 4 });

  await seedMilestones(yashGoal.id, "ssc", new Date("2026-12-04"));
  await seedMilestones(priyaGoal.id, "ssc", new Date("2026-12-04"));
  await seedMilestones(rohanGoal.id, "boards", new Date("2026-03-15"));

  await seedSessions(yashGoal.id, [0, 1, 2, 3, 5, 6], [45, 90, 60, 120, 40, 75]);
  await seedSessions(priyaGoal.id, [0, 1, 2, 4], [120, 105, 130, 95]);
  await seedSessions(rohanGoal.id, [1, 3, 4], [35, 50, 45]);

  await prisma.purchase.create({
    data: {
      userId: student.id,
      itemType: "BOOK",
      itemId: quantBook.id,
      amount: 199,
      status: "SUCCESS",
    },
  });

  async function seedAttempt(
    userId: string,
    daysAgo: number,
    correctThrough: number,
    score: number,
    correctCount: number,
    wrongCount: number,
    unattempted: number,
  ) {
    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        examId: exam.id,
        status: "SUBMITTED",
        startedAt: new Date(Date.now() - (daysAgo * 86_400_000 + 40 * 60_000)),
        submittedAt: new Date(Date.now() - daysAgo * 86_400_000),
        score,
        correctCount,
        wrongCount,
        unattempted,
      },
    });
    await prisma.examAnswer.createMany({
      data: ANSWER_KEY.slice(0, correctThrough + wrongCount).map((correct, index) => ({
        attemptId: attempt.id,
        questionNo: index + 1,
        selectedOption: index < correctThrough ? correct : index % 2 === 0 ? "A" : "D",
      })),
    });
  }

  await seedAttempt(student.id, 18, 10, 18, 10, 6, 4);
  await seedAttempt(student.id, 10, 13, 24, 13, 4, 3);
  await seedAttempt(student.id, 3, 15, 27.5, 15, 3, 2);
  await seedAttempt(priya.id, 8, 12, 22, 12, 5, 3);
  await seedAttempt(priya.id, 5, 16, 30, 16, 2, 2);
  await seedAttempt(rohan.id, 6, 8, 14, 8, 7, 5);

  const freeBooks = await prisma.book.findMany();
  const freeMaterials = await prisma.studyMaterial.findMany();
  const freePapers = await prisma.paper.findMany();
  const freeExams = await prisma.exam.findMany({ where: { isPublished: true } });
  const profiles = await prisma.userProfile.findMany();

  function matches(
    item: {
      targetEducationLevels: EducationLevel[];
      targetStandards: string[];
      targetExamGoals: string[];
    },
    profile: { educationLevel: EducationLevel; standard: string | null; examGoals: string[] },
  ) {
    const empty =
      item.targetEducationLevels.length === 0 &&
      item.targetStandards.length === 0 &&
      item.targetExamGoals.length === 0;
    if (empty) return true;
    if (item.targetEducationLevels.includes(profile.educationLevel)) return true;
    if (profile.standard && item.targetStandards.includes(profile.standard)) return true;
    if (profile.examGoals.some((goal) => item.targetExamGoals.includes(goal))) return true;
    return false;
  }

  for (const profile of profiles) {
    const items = [
      ...freeBooks.map((item) => ({ type: "BOOK" as const, item })),
      ...freeMaterials.map((item) => ({ type: "MATERIAL" as const, item })),
      ...freePapers.map((item) => ({ type: "PAPER" as const, item })),
      ...freeExams.map((item) => ({ type: "EXAM" as const, item })),
    ];
    for (const entry of items) {
      if (entry.item.accessModel !== "FREE" && entry.item.accessModel !== "FREE_TRIAL") continue;
      if (!matches(entry.item, profile)) continue;
      const expiresAt =
        entry.item.accessModel === "FREE_TRIAL" && entry.item.trialDurationDays
          ? new Date(Date.now() + entry.item.trialDurationDays * 86_400_000)
          : null;
      await prisma.accessGrant.create({
        data: {
          userId: profile.userId,
          itemType: entry.type,
          itemId: entry.item.id,
          grantedBy: "system-auto-grant",
          expiresAt,
        },
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_READY",
      metadata: { planId: plan.id },
    },
  });

  console.log("Seeded MeritPath hall demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
