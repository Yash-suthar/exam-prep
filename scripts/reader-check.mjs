import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://127.0.0.1:43147";
let failures = 0;
const step = (label, ok, extra = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await context.newPage();
page.on("pageerror", (e) => console.log("  [pageerror]", e.message.slice(0, 160)));

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', "student@meritpath.in");
await page.fill('input[name="password"]', "MeritPath@Student1");
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 });

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
const arithmetic = await prisma.book.findFirst({
  where: { title: { contains: "Arithmetic for SSC" } },
});

// The reported item: an owned book must open a readable PDF.
await page.goto(`${BASE}/books`, { waitUntil: "networkidle" });
const open = page.locator(`a[href="/read/book/${arithmetic.id}"]`).first();
step("owned book shows a Read action", (await open.count()) > 0);
step(
  "the Read action is a real link, not a no-op",
  (await open.getAttribute("href")) === `/read/book/${arithmetic.id}`,
);

await open.click();
await page.waitForURL(/\/read\/book\//, { timeout: 20000 });
step("Read opens the reader route", /\/read\/book\//.test(page.url()), page.url());

await page.waitForSelector("canvas", { timeout: 30000 });
await page.waitForTimeout(2500);
const box = await page.locator("canvas").first().boundingBox();
step("PDF renders a page", Boolean(box && box.width > 200 && box.height > 200),
  box ? `${Math.round(box.width)}x${Math.round(box.height)}` : "no canvas");

// A page that paints nothing is the bug we are guarding against.
const ink = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  const { data } = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  let dark = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) dark += 1;
  }
  return +((dark / (data.length / 4)) * 100).toFixed(2);
});
step("first page actually has content on it", ink > 1, `${ink}% ink`);

const text = await page.textContent("body");
step("reader shows the item title", /Arithmetic for SSC/.test(text ?? ""));
step("page count is detected", /Page 1 \/ [1-9]/.test(text ?? ""));

await page.screenshot({ path: "/tmp/meritpath-shots/reader.png", fullPage: false });

// Paging works.
await page.getByRole("button", { name: "Next page" }).click();
await page.waitForTimeout(1200);
step("next page works", /Page 2 \//.test(await page.textContent("body")));

await page.getByRole("button", { name: "Zoom in" }).click();
await page.waitForTimeout(600);
step("zoom in works", Boolean(await page.locator("canvas").first().boundingBox()));

// A locked item must not be readable by URL.
const student = await prisma.user.findUnique({ where: { email: "student@meritpath.in" } });
const owned = await prisma.accessGrant.findMany({
  where: { userId: student.id, itemType: "BOOK" },
  select: { itemId: true },
});
const purchased = await prisma.purchase.findMany({
  where: { userId: student.id, itemType: "BOOK" },
  select: { itemId: true },
});
const ownedIds = new Set([...owned, ...purchased].map((r) => r.itemId));
const locked = (await prisma.book.findMany()).find((b) => !ownedIds.has(b.id) && !b.isFree);

// Every catalog item must point at its own file.
const books = await prisma.book.findMany({ select: { title: true, fileUrl: true } });
const materials = await prisma.studyMaterial.findMany({ select: { title: true, fileUrl: true } });
const papers = await prisma.paper.findMany({ select: { title: true, fileUrl: true } });
const all = [...books, ...materials, ...papers];
const unique = new Set(all.map((i) => i.fileUrl));
step("every item has its own PDF", unique.size === all.length, `${unique.size} files / ${all.length} items`);
step("no item still points at the mock paper",
  !all.some((i) => i.fileUrl === "uploads/ssc-cgl-tier1.pdf"));
await prisma.$disconnect();

if (locked) {
  const res = await page.goto(`${BASE}/read/book/${locked.id}`, { waitUntil: "networkidle" });
  step("locked item redirects away from the reader",
    !page.url().includes("/read/"), page.url());
  void res;
}

await browser.close();
console.log(failures === 0 ? "\nREADER OK" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
