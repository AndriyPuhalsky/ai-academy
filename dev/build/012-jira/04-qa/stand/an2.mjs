import fs from "node:fs";
const R = JSON.parse(fs.readFileSync("./tables.out.json"));
const W = [768,1024,1280,1440];
for (const w of W) {
  console.log(`\n############ ШИРИНА ${w} ############`);
  for (const pg of Object.keys(R)) {
    const d = R[pg][w];
    d.tables.forEach((t) => {
      const narrow = t.cols.map((c,i)=>({c,i})).filter(x => x.c.w !== null && x.c.w < 60);
      const sliver = t.cols.map((c,i)=>({c,i})).filter(x => x.c.cpl !== null && x.c.cpl <= 2.6);
      if (!narrow.length && !sliver.length) return;
      const minW = Math.min(...t.cols.filter(c=>c.w!==null).map(c=>c.w));
      console.log(`${pg} ${t.sec}#${t.nInSec} ${t.isWin?"WIN":"tbl"} ncol=${t.ncol} nrow=${t.nrow} wrap=${t.wrapW} tbl=${t.tblW} ov=${t.overflow} mod=${t.hasWrapMod} ws=${t.firstColNowrap} fade=${t.fade} tab=${t.tabindex} code=${t.codeCells} tok=${t.longestToken.n}:"${t.longestToken.s}"`);
      console.log(`   heads: ${t.heads.join(" | ")}`);
      console.log(`   cols : ${t.cols.map((c,i)=>`${i}:${c.w}px/${c.lines}ln/${c.cpl}cpl`).join("  ")}`);
      if (sliver.length) console.log(`   ⚠ sliver: ${sliver.map(x=>`c${x.i}="${x.c.t}"`).join(", ")}`);
    });
  }
}
