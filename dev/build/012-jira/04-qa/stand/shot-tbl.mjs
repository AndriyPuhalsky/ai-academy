import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const SHOTS = "../shots/";
const b = await browser(9334); const P = await b.page();

async function shotSec(page, w, sec, name, extraCss) {
  await P.viewport(w, 1000, w < 700);
  await P.goto(`${D}/${page}`, 0);
  await P.eval("document.fonts.ready"); await sleep(600);
  if (extraCss) await P.eval(`(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(extraCss)};document.head.appendChild(s);return 1;})()`);
  await sleep(400);
  const r = await P.eval(`(function(){
    var el = document.querySelector('${sec} .ds-tbl__wrap') || document.querySelector('${sec}');
    el.scrollIntoView({block:'start'});
    var b = el.getBoundingClientRect();
    return JSON.stringify({x: Math.max(0, b.left + window.scrollX - 8), y: Math.max(0, b.top + window.scrollY - 8), w: Math.min(b.width + 16, ${w}), h: Math.min(b.height + 16, 1400)});
  })()`);
  const c = JSON.parse(r);
  const img = await P.s("Page.captureScreenshot", { format: "png", clip: { x: c.x, y: c.y, width: c.w, height: c.h, scale: 1 }, captureBeyondViewport: true });
  fs.writeFileSync(new URL(SHOTS + name, import.meta.url), Buffer.from(img.data, "base64"));
  console.log(name, JSON.stringify(c));
}
await shotSec("jira-ref-map", 1280, "#m-menus", "D-tbl-map-m-menus-1280.png");
await shotSec("jira-ref-map", 1280, "#m-views", "D-tbl-map-m-views-1280.png");
await shotSec("jira-ref-automation", 1280, "#triggers", "D-tbl-automation-triggers-1280.png");
await shotSec("jira-ref-map", 390, "#m-views", "D-tbl-map-m-views-390.png");
// контроль: те саме з min-width на таблиці
await shotSec("jira-ref-map", 1280, "#m-menus", "D-tbl-map-m-menus-1280-FIX.png", "#m-menus .ds-tbl { min-width: 860px; }");
await shotSec("jira-ref-map", 1280, "#m-views", "D-tbl-map-m-views-1280-FIX.png", "#m-views .ds-tbl { min-width: 980px; }");
// контроль: nowrap на останній колонці
await shotSec("jira-ref-map", 1280, "#m-menus", "D-tbl-map-m-menus-1280-FIX2.png", "#m-menus .ds-tbl td:last-child, #m-menus .ds-tbl th:last-child { white-space: nowrap; }");
await P.close(); b.close();
