import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:43147";
const OUT = process.env.SHOT_DIR ?? "/tmp/meritpath-shots";

const browser = await chromium.launch();

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 });
  await page.waitForLoadState("networkidle");
}

const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await context.newPage();

await login(page, "admin@meritpath.in", "MeritPath@Admin1");
await page.goto(`${BASE}/admin/exams/new`, { waitUntil: "networkidle" });
await page.locator("main").getByRole("button", { name: /^2\. Marking$/ }).click();
await page.locator("main").getByRole("button", { name: /^5 · ABCDE$/ }).click();
await page.locator("main").getByRole("button", { name: "None", exact: true }).click();
await page.getByText(/means .not attempted./i).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/marking-step.png`, fullPage: true });
console.log("saved marking-step.png");

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
const skipExam = await prisma.exam.findFirst({ where: { skipOptionEnabled: true } });
await prisma.$disconnect();

const student = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const sp = await student.newPage();
await login(sp, "student@meritpath.in", "MeritPath@Student1");
await sp.goto(`${BASE}/exams/${skipExam.id}/instructions`, { waitUntil: "networkidle" });
await sp.waitForTimeout(600);
await sp.screenshot({ path: `${OUT}/skip-instructions.png`, fullPage: true });
console.log("saved skip-instructions.png");

await sp.locator('input[type="checkbox"]').first().check();
await sp.locator("main").getByRole("button", { name: /I am ready/i }).click();
await sp.waitForURL("**/attempt", { timeout: 25000 });
await sp.waitForTimeout(3500);
await sp.screenshot({ path: `${OUT}/skip-omr.png` });
console.log("saved skip-omr.png");

await browser.close();
