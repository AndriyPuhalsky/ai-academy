import fs from "node:fs";
const R = JSON.parse(fs.readFileSync("./tables.out.json"));
const W = [390,768,1024,1280,1440];
let rows = [];
for (const pg of Object.keys(R)) {
  for (const w of W) {
    const d = R[pg][w];
    d.tables.forEach((t, idx) => {
      const narrow = t.cols.filter(c => c.w !== null && c.w < 60);
      const sliver = t.cols.filter(c => c.cpl !== null && c.cpl <= 2.6);
      rows.push({ pg, w, idx, sec: t.sec, n: t.nInSec, isWin: t.isWin, ncol: t.ncol,
        wrapW: t.wrapW, tblW: t.tblW, ov: t.overflow, fade: t.fade, tab: t.tabindex,
        mod: t.hasWrapMod, ws: t.firstColNowrap,
        minW: Math.min(...t.cols.filter(c=>c.w!==null).map(c=>c.w)),
        narrow: narrow.length, sliver: sliver.length,
        worst: sliver.length? sliver.map(c=>`c${t.cols.indexOf(c)}:${c.cpl}cpl/${c.w}px "${c.t}"`).join(" | ") : (narrow.length? narrow.map(c=>`c${t.cols.indexOf(c)}:${c.w}px`).join(" | "):""),
        heads: t.heads.join(" / ").slice(0,70), longest: t.longest, code: t.codeCells });
    });
  }
}
// summary: broken per page per width
const key = r => `${r.pg}|${r.idx}`;
const bad = rows.filter(r => r.sliver > 0 || r.narrow > 0);
console.log("TOTAL table-measurements:", rows.length, " broken:", bad.length);
const byPgW = {};
bad.forEach(r => { byPgW[r.pg] = byPgW[r.pg]||{}; byPgW[r.pg][r.w]=(byPgW[r.pg][r.w]||0)+1; });
console.log("\n=== зламані: сторінка × ширина ===");
console.log("page".padEnd(22), W.map(x=>String(x).padStart(6)).join(""));
for (const pg of Object.keys(R)) {
  const r = byPgW[pg];
  if (!r) continue;
  console.log(pg.padEnd(22), W.map(w=>String(r[w]||0).padStart(6)).join(""));
}
console.log("\n=== деталі (унікальні таблиці, найгірша ширина) ===");
const uniq = {};
bad.forEach(r => { const k = key(r); if (!uniq[k] || r.minW < uniq[k].minW) uniq[k] = r; });
Object.values(uniq).sort((a,b)=>a.minW-b.minW).forEach(r=>{
  console.log(`${r.pg} ${r.sec}#${r.n} ${r.isWin?"WIN":"ds-tbl"} ncol=${r.ncol} @${r.w} wrap=${r.wrapW} tbl=${r.tblW} ov=${r.ov} minW=${r.minW} mod=${r.mod} ws=${r.ws} fade=${r.fade} tab=${r.tab}`);
  console.log(`    heads: ${r.heads}`);
  console.log(`    worst: ${r.worst}`);
});
