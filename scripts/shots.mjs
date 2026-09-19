import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:43147";
const OUT = process.env.SHOT_DIR ?? "/tmp/meritpath-shots";

const browser = await chromium.launch();

async function shot(page, path, file, full = true) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: full });
  console.log("saved", file);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25000 });
  await page.waitForLoadState("networkidle");
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await desktop.newPage();
await login(page, "student@meritpath.in", "MeritPath@Student1");
await shot(page, "/goals", "goal-today.png");
await shot(page, "/goals/syllabus", "goal-syllabus.png");
await shot(page, "/goals/progress", "goal-progress.png");
await shot(page, "/dashboard", "dashboard.png");
await shot(page, "/", "landing.png");

const admin = await desktop.newPage();
await login(admin, "admin@meritpath.in", "MeritPath@Admin1");
await shot(admin, "/admin/exams/new", "admin-exam-builder.png");

const mobileCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const mobile = await mobileCtx.newPage();
await login(mobile, "student@meritpath.in", "MeritPath@Student1");
await shot(mobile, "/goals", "goal-mobile.png");

await browser.close();
