// Screenshots of every screen, desktop and phone, into screens/. Run with the app on :3000.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.env.BASE ?? "http://localhost:3000";
const pages = ["/login", "/app", "/app/teams/t-mkt", "/app/wellbeing", "/app/people", "/pulse/demo"];
mkdirSync("screens", { recursive: true });
const b = await chromium.launch();
for (const [tag, vp] of [["desk", { width: 1440, height: 1000 }], ["phone", { width: 400, height: 860 }]]) {
  const p = await b.newPage({ viewport: vp });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const path of pages) {
    await p.goto(base + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(900);
    const name = path.replace(/\//g, "_").replace(/^_/, "") || "root";
    await p.screenshot({ path: `screens/${tag}-${name}.png`, fullPage: true });
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(tag, path, over > 0 ? `overflow ${over}px` : "ok");
  }
  console.log(tag, "errors:", errors.length ? errors.slice(0, 5) : "none");
}
await b.close();
