import { chromium } from "playwright";
const base = process.env.BASE ?? "http://localhost:3100"; const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
await p.goto(base); await p.evaluate(() => localStorage.setItem("gn-prefs", JSON.stringify({ state: { lang: "en", role: "state", stage: "lms" }, version: 0 })));
const read = async () => { await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); const strip = await p.locator("section >> text=Volunteers trained").first().locator("xpath=preceding-sibling::p").innerText(); const sess = await p.locator("text=Sessions conducted").first().locator("xpath=preceding-sibling::p").innerText().catch(() => "?"); return { trained: strip, sessions: sess }; };
console.log("before", await read());
await p.goto(base + "/admin/attendance", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await p.selectOption('main select[aria-label="Class"]', "CL-B1");
for (const day of ["1", "2"]) { await p.selectOption('main select[aria-label="Day"]', day); await p.click("button:has-text('Mark all unrecorded Present')"); await p.waitForTimeout(900); }
console.log("after", await read());
console.log("errors", errs); await b.close();
