/* Знімки «до/після» конкретних таблиць.
   ⚠ Дві пастки, через які перші спроби дали порожні PNG:
   1) captureBeyondViewport на сторінці 46 000 px переразкладає документ, і clip
      у координатах документа їде;
   2) clip у віконних координатах на далеко прокрученій сторінці теж дає
      порожнє зображення.
   Робочий спосіб: підігнати висоту вікна під таблицю, прокрутити так, щоб
   таблиця стала під липкою шапкою, і зняти ВСЕ вікно без clip. */
import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";

const OUT = new URL("../shots-fix1/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });

const JOBS = [
  { page: "jira-ref-map", sec: "#m-menus", w: 1280, name: "map-m-menus-1280", rows: 4 },
  { page: "jira-ref-jql", sec: "#f-core", w: 768, name: "jql-f-core-768", rows: 4 },
  { page: "jira-ref-automation", sec: "#triggers", w: 1280, name: "automation-triggers-1280", rows: 4 },
  { page: "jira-ref-map", sec: "#m-views", w: 390, name: "map-m-views-390", rows: 5 },
  { page: "claude-code-ref-commands", sec: "#g12", w: 1280, name: "cc-commands-g12-1280", rows: 2 }
];

const b = await browser(9335);
for (const [port, tag] of [[8303, "before"], [8302, "after"]]) {
  for (const j of JOBS) {
    const P = await b.page();
    await P.viewport(j.w, 1000, j.w < 700);
    await P.goto(`http://127.0.0.1:${port}/${j.page}.html`, 0);
    await P.eval(`document.fonts.ready`);
    await sleep(1100);
    const need = await P.eval(`(function(){
      var w = document.querySelector(${JSON.stringify(j.sec)} + " .ds-tbl__wrap");
      if (!w) return null;
      var t = w.querySelector("table");
      var top = w.getBoundingClientRect().top;
      var r = ${j.rows};
      var bottom = (t.rows[r] ? t.rows[r].getBoundingClientRect().bottom : w.getBoundingClientRect().bottom);
      return Math.min(Math.ceil(bottom - top) + 110, 1400);
    })()`);
    if (!need) { console.log(`!! ${j.name}: не знайдено ${j.sec}`); await P.close(); continue; }
    await P.viewport(j.w, need, j.w < 700);
    await sleep(400);
    await P.eval(`(function(){
      document.documentElement.style.scrollBehavior = "auto";
      var w = document.querySelector(${JSON.stringify(j.sec)} + " .ds-tbl__wrap");
      window.scrollTo(0, w.getBoundingClientRect().top + window.scrollY - 72);
      return 1; })()`);
    await sleep(900);
    const r = await P.s("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(new URL(`./${j.name}-${tag}.png`, OUT), Buffer.from(r.data, "base64"));
    console.log(`${tag} ${j.name}: ${j.w}×${need}`);
    await P.close();
  }
}
b.close();
