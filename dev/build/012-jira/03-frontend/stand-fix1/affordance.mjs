/* Критерій 2 і 3: ознака прокрутки, досяжність з клавіатури, скрол <body>.
   Запуск: node affordance.mjs  (ORIGIN= для бази) */
import { browser, sleep } from "./cdp.mjs";

const ORIGIN = process.env.ORIGIN || "http://127.0.0.1:8302";
const PAGES = ["jira-ref-map", "jira-ref-jql", "jira-ref-automation",
  "claude-code-ref-commands", "claude-code-ref-hooks", "claude-code-ref-settings"];
const W12 = [390, 768, 1023, 1024, 1025, 1100, 1152, 1200, 1280, 1366, 1440, 1920];

const CHECK = `(function(){
  var wraps = Array.from(document.querySelectorAll(".ds-tbl__wrap"));
  var ov = 0, noFade = [], noTab = [], noRegion = [], noBar = [], arrowFail = [];
  wraps.forEach(function(w, i){
    var over = w.scrollWidth - w.clientWidth;
    if (over <= 0.5) return;
    ov++;
    if (!w.getAttribute("data-scroll-fade")) noFade.push(i);
    if (w.getAttribute("tabindex") !== "0") noTab.push(i);
    if (w.getAttribute("role") !== "region" || !w.getAttribute("aria-label")) noRegion.push(i);
    // §41.1: постійна смуга — перевіряємо, що скролбар має ненульову товщину
    var bar = w.offsetHeight - w.clientHeight;
    if (bar < 6) noBar.push({ i: i, bar: bar });
  });
  return { wraps: wraps.length, overflowing: ov, noFade: noFade, noTab: noTab,
    noRegion: noRegion, noBar: noBar,
    body: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    wider: Array.from(document.querySelectorAll("body *")).filter(function(e){
      return e.getBoundingClientRect().right > document.documentElement.clientWidth + 1;
    }).length };
})()`;

const b = await browser(9335);
const P = await b.page();
for (const id of PAGES) {
  const line = [];
  for (const w of W12) {
    await P.viewport(w, 900, w < 700);
    if (w === W12[0]) await P.goto(`${ORIGIN}/${id}.html`, 0);
    await P.eval(`document.fonts.ready`);
    await sleep(400);
    await P.eval(`window.dispatchEvent(new Event('resize')), 1`);
    await sleep(300);
    const r = await P.eval(CHECK);
    const bad = [];
    if (r.noFade.length) bad.push(`без fade: ${r.noFade.length}`);
    if (r.noTab.length) bad.push(`без tabindex: ${r.noTab.length}`);
    if (r.noRegion.length) bad.push(`без role/label: ${r.noRegion.length}`);
    if (r.noBar.length) bad.push(`без смуги: ${r.noBar.length} ${JSON.stringify(r.noBar.slice(0,3))}`);
    line.push(`${w}: скролять ${r.overflowing}/${r.wraps}, body=${r.body}, ширших за вʼюпорт=${r.wider}${bad.length ? "  ⚠ " + bad.join(", ") : ""}`);
  }
  console.log(`### ${id}\n   ` + line.join("\n   "));
}

// клавіатура: Tab доходить до скролера і ArrowRight прокручує (390)
await P.viewport(390, 900, true);
await P.goto(`${ORIGIN}/jira-ref-map.html`, 0);
await P.eval(`document.fonts.ready`); await sleep(600);
const kb = await P.eval(`(function(){
  var w = Array.from(document.querySelectorAll(".ds-tbl__wrap")).find(function(x){ return x.scrollWidth - x.clientWidth > 10; });
  if (!w) return "скролерів немає";
  w.focus();
  var focused = document.activeElement === w;
  var before = w.scrollLeft;
  w.scrollLeft = 80;                        // імітація ArrowRight на сфокусованому скролері
  var after = w.scrollLeft;
  var fade = w.getAttribute("data-scroll-fade");
  w.scrollLeft = before;
  return { focusable: focused, outline: getComputedStyle(w, ":focus-visible").outlineWidth,
    scrolled: after - before, fadeAfterScroll: fade, tabindex: w.getAttribute("tabindex") };
})()`);
console.log("\nклавіатура на 390 (перший скролер jira-ref-map):", JSON.stringify(kb));
await P.close(); b.close();
