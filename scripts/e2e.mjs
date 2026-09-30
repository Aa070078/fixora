import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PRODUCT = "20w-usb-c-fast-charger";
const OUT = "output/playwright";
mkdirSync(OUT, { recursive: true });

const results = [];
const pass = (n, i = "") => results.push(`PASS  ${n}${i ? `  — ${i}` : ""}`);
const fail = (n, e) => results.push(`FAIL  ${n}  — ${String(e).slice(0, 500)}`);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
const page = await ctx.newPage();

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

async function errors() {
  const e = [...consoleErrors];
  consoleErrors.length = 0;
  return e;
}

// ---------- 1. Homepage + theme toggle ----------
try {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const errs = await errors();
  if (errs.length) throw new Error(`console: ${errs.join(" | ")}`);
  pass("Homepage loads clean");

  const beforeDark = await page.evaluate(() => document.documentElement.className.includes("dark"));
  const bg1 = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.locator('button[aria-label*="مظهر"]').click();
  await page.waitForTimeout(600);
  const afterDark = await page.evaluate(() => document.documentElement.className.includes("dark"));
  const bg2 = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if (afterDark === beforeDark || bg2 === bg1) throw new Error(`no visual change (dark ${beforeDark}→${afterDark})`);
  pass(`Theme toggle works (dark ${beforeDark}→${afterDark}, bg ${bg1}→${bg2})`);
  await page.locator('button[aria-label*="مظهر"]').click(); // back to light
} catch (e) {
  fail("Theme toggle", e);
}

// ---------- 2. Booking ----------
try {
  await page.goto(`${BASE}/book`, { waitUntil: "networkidle" });
  await page.getByLabel("اوصف جهازك").fill("Samsung A54 — مش متأكد من الموديل");
  await page.getByRole("button", { name: "متابعة" }).click();
  await page.getByRole("button", { name: /إصلاح الشاشة/ }).click();
  await page.getByLabel("اوصف المشكلة").fill("الشاشة اتكسرت في النص واللمس بيعلق في المنطقة دي.");
  await page.getByRole("button", { name: "متابعة" }).click();
  await page.getByRole("button", { name: "متابعة" }).click(); // photos skip
  await page.getByLabel("عنوان الشارع").fill("12 شارع النيل، شقة 5");
  await page.getByLabel("المدينة").fill("القاهرة");
  await page.getByRole("button", { name: "متابعة" }).click();
  await page.getByRole("button", { name: /اليوم/ }).first().click();
  await page.getByRole("button", { name: /12:00/ }).first().click();
  await page.getByRole("button", { name: "متابعة" }).click();
  await page.getByLabel("اسمك").fill("سارة إبراهيم");
  await page.getByLabel("رقم الموبايل").fill("+20 123 987 6543");
  await page.getByRole("button", { name: "متابعة" }).click();
  await page.getByRole("button", { name: "إرسال الطلب" }).click();
  await page.waitForURL(/\/track\/.+\?welcome=1/, { timeout: 15000 });
  if (!(await page.getByText("تم استلام طلبك!").count())) throw new Error("confirm not shown");
  pass("Booking → confirmation page");
  const e2 = await errors();
  if (e2.length) fail("Booking console", e2.join(" | "));
} catch (e) {
  fail("Booking", e);
}

// ---------- 3. Admin sign-in + the new request ----------
try {
  await page.goto(`${BASE}/signin`, { waitUntil: "networkidle" });
  await page.getByLabel("الإيميل").fill("admin@fixora.com");
  await page.getByLabel("كلمة السر").fill("Fixora@123");
  await page.getByRole("button", { name: "دخول" }).click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  if (!(await page.getByText("نظرة عامة").count())) throw new Error("dashboard missing");
  pass("Admin sign-in → dashboard");
  await page.goto(`${BASE}/admin/repairs?status=SUBMITTED`, { waitUntil: "networkidle" });
  const body = await page.locator("body").innerText();
  if (!body.includes("سارة إبراهيم")) throw new Error("new request not in SUBMITTED list");
  pass("Admin sees the new repair request");
  const e3 = await errors();
  if (e3.length) fail("Admin console", e3.join(" | "));
} catch (e) {
  fail("Admin sign-in / request list", e);
}

// ---------- 4. Add to cart (real product page) ----------
try {
  await page.goto(`${BASE}/shop/${PRODUCT}`, { waitUntil: "networkidle" });
  const pName = (await page.locator("h1").innerText()).slice(0, 60);
  await page.getByRole("button", { name: "أضف للسلة" }).click();
  await page.waitForTimeout(700);
  const badge = await page.locator('button[aria-label="سلة المشتريات"] span').innerText();
  if (badge.trim() !== "1") throw new Error(`badge=${badge}`);
  await page.getByRole("button", { name: "سلة المشتريات" }).click();
  await page.waitForTimeout(500);
  if (!(await page.getByText(pName.slice(0, 25)).count())) throw new Error("drawer missing item");
  const ls = await page.evaluate(() => JSON.parse(localStorage.getItem("fixora_cart_v1") ?? "[]"));
  if (!Array.isArray(ls) || ls.length !== 1 || ls[0].qty !== 1) throw new Error("localStorage cart wrong");
  pass(`Add-to-cart + drawer + localStorage (${pName})`);
  await page.screenshot({ path: `${OUT}/cart-drawer.png` });
} catch (e) {
  fail("Add to cart", e);
}

// ---------- 5. Checkout (order pipeline) ----------
try {
  await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });
  await page.getByLabel("الاسم").fill("يوسف طاهر");
  await page.getByLabel("رقم الموبايل").fill("+20 111 555 4444");
  await page.getByLabel("عنوان الشارع").fill("10 ش التحرير");
  await page.getByLabel("المدينة").fill("الجيزة");
  await page.getByRole("button", { name: /اتأكد الطلب/ }).click();
  await page.waitForURL(/\/order\//, { timeout: 15000 });
  if (!(await page.getByText("تم استلام طلبك!").count())) throw new Error("confirmation missing");
  const ref = page.url().split("/order/")[1];
  pass(`Checkout → order ${ref} created`);
  const e5 = await errors();
  if (e5.length) fail("Checkout console", e5.join(" | "));
  await page.evaluate(() => localStorage.removeItem("fixora_cart_v1"));
} catch (e) {
  fail("Checkout", e);
}

// ---------- 6. Technician (assign happens in admin, so sign in + verify job access) ----------
try {
  await page.goto(`${BASE}/signin`, { waitUntil: "networkidle" });
  await page.getByLabel("الإيميل").fill("omar@fixora.com");
  await page.getByLabel("كلمة السر").fill("Fixora@123");
  await page.getByRole("button", { name: "دخول" }).click();
  await page.waitForURL(/\/technician/, { timeout: 15000 });
  const card = page.locator('a[href^="/technician/jobs/"]').first();
  const n = await page.locator('a[href^="/technician/jobs/"]').count();
  if (n === 0) throw new Error(`technician has no assigned jobs (${n})`);
  const jobUrl = await card.getAttribute("href");
  await card.click();
  await page.waitForURL(/\/technician\/jobs\//, { timeout: 15000 });
  const body = await page.locator("body").innerText();
  if (!body.includes("بيانات المهمة")) throw new Error("job detail incomplete");
  pass(`Technician sign-in + opens assigned job (${jobUrl})`);
  await page.screenshot({ path: `${OUT}/tech-job.png` });
} catch (e) {
  fail("Technician", e);
}

// ---------- 7. Role guards ----------
try {
  // technician cannot reach /admin → redirected to /technician
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForURL(/\/technician/, { timeout: 10000 });
  pass("Guard: technician /admin → /technician");

  // signed-out cannot reach /admin → /signin
  await page.context().clearCookies();
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForURL(/\/signin/, { timeout: 10000 });
  pass("Guard: signed-out /admin → /signin");
} catch (e) {
  fail("Role guard", e);
}

const leftover = await errors();
if (leftover.length) results.push(`FAIL  Unhandled console errors: ${leftover.join(" | ")}`);

await browser.close();

console.log("\n==================== E2E REPORT ====================");
results.forEach((r) => console.log(r));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log("====================================================");
console.log(`SUMMARY: ${results.length - failed}/${results.length} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);