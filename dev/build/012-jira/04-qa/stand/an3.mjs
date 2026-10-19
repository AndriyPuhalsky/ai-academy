import fs from "node:fs";
const W = [390,768,1024,1280,1440];
function load(f){ return JSON.parse(fs.readFileSync(f)); }
function rows(R){
  const o = [];
  for (const pg in R) for (const w of W) {
    const d = R[pg][w];
    d.tables.forEach((t,i) => {
      const cols = t.cols.map((c,ci)=>({...c, ci}));
      const narrow = cols.filter(c => c.w !== null && c.w < 60);
      const unread = cols.filter(c => c.w !== null && c.w < 60 && c.cpl !== null && c.cpl <= 2.6);
      o.push({ pg, w, i, sec:t.sec, n:t.nInSec, isWin:t.isWin, ncol:t.ncol, nrow:t.nrow,
        wrapW:t.wrapW, tblW:t.tblW, ov:t.overflow, fade:t.fade, tab:t.tabindex, mod:t.hasWrapMod,
        narrow:narrow.length, unread:unread.length,
        minCol: Math.min(...cols.filter(c=>c.w!==null).map(c=>c.w)),
        detail: unread.map(c=>`c${c.ci}(${c.w}px, ${c.cpl} зн./рядок, "${c.t}")`).join("; "),
        heads: t.heads });
    });
  }
  return o;
}
const J = rows(load("tables.out.json")), B = rows(load("base.out.json"));
function tbl(rs, title){
  console.log(`\n### ${title}`);
  console.log("сторінка".padEnd(26), W.map(x=>String(x).padStart(10)).join(""), "  таблиць");
  const pages = [...new Set(rs.map(r=>r.pg))];
  for (const pg of pages) {
    const tot = rs.filter(r=>r.pg===pg && r.w===1280).length;
    if (!tot) { console.log(pg.padEnd(26), "— таблиць немає"); continue; }
    const cells = W.map(w => {
      const s = rs.filter(r=>r.pg===pg && r.w===w);
      const u = s.filter(r=>r.unread>0).length;
      return `${u}`.padStart(10);
    });
    console.log(pg.padEnd(26), cells.join(""), "  "+tot);
  }
}
tbl(J, "JIRA — таблиць із нечитабельною колонкою (<60px і ≤2,6 знака на рядок)");
tbl(B, "БАЗОВА ЛІНІЯ (живі курси) — те саме");
console.log("\n### Горизонтальний скрол: чи є взагалі");
for (const [nm, rs] of [["JIRA", J], ["БАЗА", B]]) {
  for (const w of W) {
    const s = rs.filter(r=>r.w===w);
    console.log(`${nm} @${w}: таблиць ${s.length}, із overflow>1px: ${s.filter(r=>r.ov>1).length}, із них data-scroll-fade: ${s.filter(r=>r.ov>1&&r.fade).length}, із tabindex: ${s.filter(r=>r.ov>1&&r.tab!==null).length}`);
  }
}
fs.writeFileSync("an3.json", JSON.stringify({J,B}));
