/* Зведення: скільки «зламаних» таблиць на сторінку × ширину + деталі.
   Запуск: node sum.mjs <tag> [--detail] [--width=1280] [--page=jira-ref-map] */
import fs from "node:fs";

const tag = process.argv[2] || "out";
const res = JSON.parse(fs.readFileSync(new URL(`./${tag}.json`, import.meta.url), "utf8"));
const detail = process.argv.includes("--detail");
const wArg = process.argv.find(a => a.startsWith("--width="));
const pArg = process.argv.find(a => a.startsWith("--page="));
const WIDTHS = [390, 768, 1024, 1280, 1440];

export function broken(t) {
  return t.cols.some(c => c.w !== null && c.w < 60 && c.cpl !== null && c.cpl <= 2.6);
}
export function badCols(t) {
  return t.cols.map((c, i) => ({ ...c, i })).filter(c => c.w !== null && c.w < 60 && c.cpl !== null && c.cpl <= 2.6);
}

const rows = [];
let tot = {};
for (const [page, byW] of Object.entries(res)) {
  const r = { page, n: byW[1280].tables.length };
  for (const w of WIDTHS) {
    const tabs = byW[w].tables;
    r[w] = tabs.filter(broken).length;
    r["ov" + w] = tabs.filter(t => t.overflow > 0.5).length;
    r["bo" + w] = byW[w].bodyOverflow;
    tot[w] = (tot[w] || 0) + r[w];
    tot["ov" + w] = (tot["ov" + w] || 0) + r["ov" + w];
  }
  rows.push(r);
}
console.log("ЗЛАМАНІ (колонка <60px і ≤2,6 знака/рядок)  |  у дужках: таблиць із горизонт. скролом");
console.log("page".padEnd(26) + WIDTHS.map(w => String(w).padStart(11)).join("") + "   n   bodyOverflow");
for (const r of rows) {
  console.log(r.page.padEnd(26) + WIDTHS.map(w => `${r[w]}(${r["ov" + w]})`.padStart(11)).join("") +
    String(r.n).padStart(4) + "   " + WIDTHS.map(w => r["bo" + w]).join("/"));
}
console.log("РАЗОМ".padEnd(26) + WIDTHS.map(w => `${tot[w]}(${tot["ov" + w]})`.padStart(11)).join(""));

if (detail) {
  const ws = wArg ? [Number(wArg.slice(8))] : WIDTHS;
  for (const w of ws) {
    console.log(`\n######## ${w} ########`);
    for (const [page, byW] of Object.entries(res)) {
      if (pArg && page !== pArg.slice(7)) continue;
      for (const t of byW[w].tables) {
        if (!broken(t)) continue;
        console.log(`${page} ${t.id} ncol=${t.ncol} nrow=${t.nrow} wrap=${t.wrapW} tbl=${t.tblW} ov=${t.overflow} h=${t.h} ws=${t.firstColWS} wrapmod=${/ds-tbl--wrap/.test(t.tblCls + t.wrapCls)} tok=${t.longestToken.n}`);
        console.log(`   heads: ${t.heads.join(" | ")}`);
        console.log(`   cols : ${t.cols.map((c, i) => `${i}:${c.w}px/${c.lines}ln/${c.cpl}cpl`).join("  ")}`);
        console.log(`   bad  : ${badCols(t).map(c => `c${c.i}="${c.t}"`).join(", ")}`);
      }
    }
  }
}
