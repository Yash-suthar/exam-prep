import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:43147";
const stamp = Date.now();
const NEW_USER = `aarav${stamp}@meritpath.in`;
const PASSWORD = "MeritPath@New1";

let failures = 0;
function step(label, ok, extra = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);
}

const browser = await chromium.launch();

async function session(mobile = false) {
  const context = await browser.newContext(
    mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : {},
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => console.log("  [pageerror]", error.message.slice(0, 200)));
  return { context, page };
}

// The Next.js dev overlay injects a button named "Next", so every click on our
// own controls is scoped to the main element.
const ui = (page) => page.locator("main");

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page
    .waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 })
    .catch(() => {});
  await page.waitForLoadState("networkidle");
}

// ------------------------------------------------------------ new student
{
  const { context, page } = await session();

  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await page.fill('input[name="name"]', "Aarav Test");
  await page.fill('input[name="email"]', NEW_USER);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/onboarding", { timeout: 20000 });
  step("signup lands on onboarding", page.url().includes("/onboarding"));

  const next = () => ui(page).getByRole("button", { name: "Next" });
  await ui(page).getByRole("button", { name: /^Student/ }).click();
  await next().click();
  await page.waitForTimeout(400);

  await ui(page).getByRole("button", { name: "12th", exact: true }).click();
  await next().click();
  await page.waitForTimeout(400);

  await ui(page).getByRole("button", { name: "Government exams" }).click();
  await page.waitForTimeout(300);
  await ui(page).getByRole("button", { name: "SSC", exact: true }).click();
  await next().click();
  await page.waitForTimeout(400);

  const summary = await page.textContent("body");
  step(
    "confirm screen echoes the answers",
    /12th/.test(summary ?? "") && /SSC/.test(summary ?? ""),
  );

  await ui(page).getByRole("button", { name: /Set my goal/i }).click();
  await page.waitForURL("**/goals/setup", { timeout: 20000 });
  step("onboarding reaches goal setup", page.url().includes("/goals/setup"));

  step(
    "goal setup previews the syllabus",
    (await page.getByText(/Load the standard/i).count()) > 0,
  );

  await ui(page).getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(300);

  const target = new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10);
  await page.fill('input[type="date"]', target);
  await page.fill("#minutes", "75");
  await ui(page).getByRole("button", { name: "Sun", exact: true }).click();

  await ui(page).getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(300);

  await ui(page).getByRole("button", { name: /Start .* goal/i }).click();
  await page.waitForURL("**/goals", { timeout: 20000 });
  step("goal created and redirects to /goals", page.url().endsWith("/goals"));

  const body = await page.textContent("body");
  step("new goal has a loaded syllabus", !/No syllabus yet/.test(body ?? ""));
  step("readiness is shown", /Readiness/.test(body ?? ""));
  step("days left is computed", /Days left/.test(body ?? ""));

  await ui(page).getByRole("button", { name: "+25 min" }).click();
  await page.waitForTimeout(1800);
  await page.reload({ waitUntil: "networkidle" });
  const afterLog = await page.textContent("body");
  step(
    "timer logs minutes to today",
    /25 \/ 75 minutes/.test(afterLog ?? ""),
    "expected 25 / 75 minutes",
  );

  await page.goto(`${BASE}/goals/syllabus`, { waitUntil: "networkidle" });
  await ui(page).locator("button", { hasText: /^Not started$/ }).first().click();
  await page.waitForTimeout(1200);
  await page.reload({ waitUntil: "networkidle" });
  const learning = await ui(page).locator("button", { hasText: /^Learning$/ }).count();
  step("topic status persists after cycling", learning >= 1, `${learning} learning chips`);

  await page.fill('input[placeholder="Topic"]', "My custom topic");
  await page.locator('div:has(> input[placeholder="Topic"]) button').last().click();
  await page.waitForTimeout(2000);
  step("custom topic is added", /My custom topic/.test(await page.textContent("body")));

  await page.goto(`${BASE}/goals/settings`, { waitUntil: "networkidle" });
  await page.locator('input[type="number"]').nth(1).fill("100");
  await ui(page).getByRole("button", { name: /Save targets/i }).click();
  await page.waitForTimeout(1800);
  await page.goto(`${BASE}/goals`, { waitUntil: "networkidle" });
  step("daily target edit persists", /\/ 100 minutes/.test(await page.textContent("body")));

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  step("dashboard shows the goal strip", /Your goal/.test(await page.textContent("body")));

  await context.close();
}

// ------------------------------------------------------------ admin
{
  const { context, page } = await session();
  await login(page, "admin@meritpath.in", "MeritPath@Admin1");
  step("admin lands in console", page.url().includes("/admin"), page.url());

  await page.goto(`${BASE}/admin/exams/new`, { waitUntil: "networkidle" });
  await page.fill('input[placeholder="SSC CGL Tier-1 Mock — Set B"]', `E2E Mock ${stamp}`);

  await page.getByText("+ Add new subject").click();
  await page.fill('input[placeholder="e.g. Organic Chemistry"]', `E2E Subject ${stamp}`);
  await ui(page).getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForTimeout(1800);
  const selected = await page.locator("select").first().inputValue();
  const optionText = await page
    .locator("select")
    .first()
    .locator(`option[value="${selected}"]`)
    .textContent();
  step(
    "subject created inline and auto-selected",
    (optionText ?? "").includes(`E2E Subject ${stamp}`),
    optionText ?? "none",
  );

  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\ntrailer<</Root 1 0 R>>",
  );
  await page.setInputFiles('input[type="file"]', {
    name: "e2e-paper.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });
  await page.waitForTimeout(2500);
  const paperPath = await page.locator('input[placeholder="uploads/paper.pdf"]').inputValue();
  step("paper PDF uploads from the builder", paperPath.startsWith("uploads/"), paperPath);

  await ui(page).getByRole("button", { name: /^2\. Marking$/ }).click();
  await page.locator('input[type="number"]').first().fill("5");
  await page.waitForTimeout(400);

  // five options, E declares a skip, and no negative marking
  await ui(page).getByRole("button", { name: /^5 · ABCDE$/ }).click();
  await page.waitForTimeout(300);
  await ui(page).getByRole("button", { name: "None", exact: true }).click();
  await page.getByText(/means .not attempted./i).click();
  await page.waitForTimeout(400);

  const marking = await page.textContent("body");
  step(
    "marking summary reflects the custom scheme",
    /options A–E/.test(marking ?? "") &&
      /no negative marking/.test(marking ?? "") &&
      /E = not attempted/.test(marking ?? ""),
  );

  await ui(page).getByRole("button", { name: /^3\. Answer key$/ }).click();
  await page.fill('input[placeholder="ABCD …"]', "ABCDA");
  await ui(page).getByRole("button", { name: /Fill 5 answers/i }).click();
  await page.waitForTimeout(500);
  const keyOptions = await page.locator("select").nth(1).locator("option").allTextContents();
  step(
    "answer key drops the not-attempted bubble",
    keyOptions.join("") === "ABCD",
    keyOptions.join("") || "none",
  );
  await page.locator('input[placeholder="Topic"]').first().fill("Percentages");

  await ui(page).getByRole("button", { name: /^5\. Publish$/ }).click();
  step("review shows the uploaded paper", (await page.textContent("body")).includes(paperPath));

  await ui(page).getByRole("button", { name: /Publish exam/i }).click();
  await page.waitForURL("**/admin/exams", { timeout: 20000 });
  const list = await page.textContent("body");
  step("exam publishes and appears in the list", list.includes(`E2E Mock ${stamp}`));
  step(
    "list shows the custom marking scheme",
    /options A–E/.test(list) && /E = not attempted/.test(list),
  );

  await context.close();
}

// ------------------------------------------------------------ skip bubble
{
  const { context, page } = await session();
  await login(page, "student@meritpath.in", "MeritPath@Student1");

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const skipExam = await prisma.exam.findFirst({ where: { skipOptionEnabled: true } });
  await prisma.$disconnect();
  step("a skip-option paper exists", Boolean(skipExam));

  await page.goto(`${BASE}/exams/${skipExam.id}/instructions`, { waitUntil: "networkidle" });

  if (page.url().includes("/instructions")) {
    const text = await page.textContent("body");
    step(
      "instructions explain the not-attempted bubble",
      /not attempted/i.test(text ?? "") && /no negative marking/i.test(text ?? ""),
    );
    await page.locator('input[type="checkbox"]').first().check();
    await ui(page).getByRole("button", { name: /I am ready/i }).click();
    await page.waitForURL("**/attempt", { timeout: 25000 });
  }

  await page.waitForTimeout(2500);
  const bubbles = await page
    .locator('aside button:not([disabled])')
    .filter({ hasText: /^[A-E]$/ })
    .allTextContents();
  step(
    "OMR renders five bubbles including E",
    bubbles.slice(0, 5).join("") === "ABCDE",
    bubbles.slice(0, 5).join("") || "none",
  );
  step(
    "sheet explains the skip bubble",
    /is the .not attempted. mark/i.test(await page.textContent("body")),
  );

  await context.close();
}

// ------------------------------------------------------------ mobile exam
{
  const { context, page } = await session(true);
  await login(page, "student@meritpath.in", "MeritPath@Student1");

  await page.goto(`${BASE}/exams`, { waitUntil: "networkidle" });
  await ui(page).getByRole("button", { name: /Read instructions/i }).first().click();
  await page.waitForURL("**/instructions", { timeout: 20000 });
  step(
    "instructions screen appears before the clock",
    /Exam hall instructions/.test(await page.textContent("body")),
  );

  const ready = ui(page).getByRole("button", { name: /I am ready/i });
  step("start is gated behind the consent checkbox", await ready.isDisabled());

  await page.locator('input[type="checkbox"]').first().check();
  await ready.click();
  await page.waitForURL("**/attempt", { timeout: 25000 });
  step("exam hall opens on mobile", page.url().includes("/attempt"));

  await page.waitForTimeout(2500);
  step("mobile dock shows the answered counter", /Answered \d+\//.test(await page.textContent("body")));

  await context.close();
}

// ------------------------------------------------------------ password reset
{
  const { context, page } = await session();
  await page.goto(`${BASE}/forgot-password`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', NEW_USER);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1800);

  const link = page.locator('a[href^="/reset-password/"]');
  const hasLink = (await link.count()) > 0;
  step("reset request produces a one-time link", hasLink);

  if (hasLink) {
    await link.click();
    await page.waitForLoadState("networkidle");
    await page.fill("#password", "BrandNewPass1");
    await page.fill("#confirm", "BrandNewPass1");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1800);
    step("password is updated", /Password updated/.test(await page.textContent("body")));

    await login(page, NEW_USER, "BrandNewPass1");
    step("login works with the new password", !page.url().includes("/login"), page.url());
  }
  await context.close();
}

await browser.close();
console.log(failures === 0 ? "\nALL E2E CHECKS PASSED" : `\n${failures} E2E FAILURES`);
process.exit(failures === 0 ? 0 : 1);
