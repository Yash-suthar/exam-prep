import { mkdir, writeFile } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PrismaClient } from "@prisma/client";

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

async function main() {
  await prisma.examAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.accessGrant.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.auditLog.deleteMany();
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

  const [quant, reasoning, english, gs] = await Promise.all([
    prisma.subject.create({ data: { name: "Quantitative Aptitude" } }),
    prisma.subject.create({ data: { name: "Reasoning" } }),
    prisma.subject.create({ data: { name: "English" } }),
    prisma.subject.create({ data: { name: "General Studies" } }),
  ]);

  const quantBook = await prisma.book.create({
    data: {
      title: "Arithmetic for SSC — Class Notes",
      subjectId: quant.id,
      fileUrl: paperRel,
      price: 199,
      isFree: false,
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
      },
      {
        title: "Error Spotting Pack",
        subjectId: english.id,
        fileUrl: paperRel,
        price: 0,
        isFree: true,
      },
      {
        title: "Polity Capsules",
        subjectId: gs.id,
        fileUrl: paperRel,
        price: 129,
        isFree: false,
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
        tags: ["quant", "ssc"],
      },
      {
        title: "Syllogism maps",
        fileUrl: paperRel,
        price: 0,
        isFree: true,
        tags: ["reasoning"],
      },
      {
        title: "Current affairs — last 90 days",
        fileUrl: paperRel,
        price: 79,
        isFree: false,
        tags: ["gs", "banking"],
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
      },
      {
        title: "IBPS PO Prelims 2022",
        subjectId: reasoning.id,
        year: 2022,
        fileUrl: paperRel,
        price: 0,
        isFree: true,
      },
      {
        title: "State PSC GS paper 2024",
        subjectId: gs.id,
        year: 2024,
        fileUrl: paperRel,
        price: 79,
        isFree: false,
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
          "Keep documents ready. Application link will open on the SSC portal.",
        examDate: new Date("2026-12-04"),
        applyLink: "https://ssc.gov.in",
        isPinned: true,
      },
      {
        title: "IBPS Clerk prelims window",
        description: "Sectional timing applies. Practise OMR locking before you sit.",
        examDate: new Date("2026-10-18"),
        applyLink: "https://www.ibps.in",
        isPinned: false,
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
      questions: {
        create: ANSWER_KEY.map((correctOption, index) => ({
          questionNo: index + 1,
          correctOption,
        })),
      },
    },
  });

  await prisma.examQuestion.createMany({
    data: ANSWER_KEY.map((correctOption, index) => ({
      examId: exam.id,
      questionNo: index + 1,
      correctOption,
    })),
  });

  await prisma.purchase.create({
    data: {
      userId: student.id,
      itemType: "BOOK",
      itemId: quantBook.id,
      amount: 199,
      status: "SUCCESS",
    },
  });

  const priyaAttempt = await prisma.examAttempt.create({
    data: {
      userId: priya.id,
      examId: exam.id,
      status: "SUBMITTED",
      startedAt: new Date(Date.now() - 40 * 60 * 1000),
      submittedAt: new Date(Date.now() - 25 * 60 * 1000),
      score: 27.5,
      correctCount: 15,
      wrongCount: 3,
      unattempted: 2,
    },
  });

  await prisma.examAnswer.createMany({
    data: ANSWER_KEY.slice(0, 18).map((correct, index) => ({
      attemptId: priyaAttempt.id,
      questionNo: index + 1,
      selectedOption: index < 15 ? correct : index === 15 ? "A" : "D",
    })),
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_READY",
      metadata: { planId: plan.id },
    },
  });

  console.log("Seeded MeritPath demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
