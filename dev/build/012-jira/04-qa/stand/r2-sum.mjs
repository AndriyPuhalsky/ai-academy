import fs from "node:fs";
const file = process.argv[2] || "./r2-tables.out.json";
const R = JSON.parse(fs.readFileSync(new URL(file, import.meta.url)));
const W = [390, 768, 1024, 1280, 1440];
const bad = (t) => t.cols.some(c => c.w !== null && c.w < 60) && t.cols.some(c => c.cpl !== null && c.cpl <= 2.6);
const badOld = (t) => t.cols.some(c => c.w !== null && c.w < 60 && c.cpl !== null && c.cpl <= 2.6);
console.log("page".padEnd(26) + W.map(w => String(w).padStart(7)).join("") + "   усього");
let tot = {};
for (const pg of Object.keys(R)) {
  const row = W.map(w => {
    const d = R[pg][w];
    const n = d.tables.filter(badOld).length;
    tot[w] = (tot[w] || 0) + n;
    return String(n).padStart(7);
  });
  console.log(pg.padEnd(26) + row.join("") + String(R[pg][1280].tables.length).padStart(9));
}
console.log("РАЗОМ".padEnd(26) + W.map(w => String(tot[w]).padStart(7)).join(""));

console.log("\n--- розриви всередині токена (сума по сторінці) ---");
console.log("page".padEnd(26) + W.map(w => String(w).padStart(8)).join(""));
let st = {};
for (const pg of Object.keys(R)) {
  const row = W.map(w => {
    const n = R[pg][w].tables.reduce((a, t) => a + t.splits, 0);
    st[w] = (st[w] || 0) + n; return String(n).padStart(8);
  });
  console.log(pg.padEnd(26) + row.join(""));
}
console.log("РАЗОМ".padEnd(26) + W.map(w => String(st[w]).padStart(8)).join(""));

console.log("\n--- горизонтальний скрол <body> (docSw - docCw) ---");
for (const pg of Object.keys(R)) {
  console.log(pg.padEnd(26) + W.map(w => {
    const d = R[pg][w]; return String(Math.round(d.doc.sw - d.doc.cw)).padStart(7);
  }).join(""));
}

console.log("\n--- прокручувані таблиці / з них без ознаки fade / без tabindex / без смуги 12px ---");
for (const w of W) {
  let sc = 0, nofade = 0, notab = 0, nobar = 0, norole = 0;
  const miss = [];
  for (const pg of Object.keys(R)) for (const t of R[pg][w].tables) {
    if (t.overflow > 1) {
      sc++;
      if (!t.fade) { nofade++; miss.push(`${pg}${t.sec}#${t.nInSec} fade=${t.fade}`); }
      if (t.tabindex !== "0") notab++;
      if (t.bar < 6) { nobar++; miss.push(`${pg}${t.sec}#${t.nInSec} bar=${t.bar}`); }
      if (t.role !== "region" || !t.aria) norole++;
    }
  }
  console.log(`@${w}: прокручуваних ${sc} · без fade ${nofade} · без tabindex=0 ${notab} · смуга<6px ${nobar} · без role/aria ${norole}`);
  if (miss.length) console.log("   " + miss.slice(0, 8).join(" | "));
}

console.log("\n--- найвужчі колонки (мін ширина по таблиці), 10 найгірших на кожній ширині ---");
for (const w of W) {
  const all = [];
  for (const pg of Object.keys(R)) for (const t of R[pg][w].tables) {
    const mn = Math.min(...t.cols.filter(c => c.w !== null).map(c => c.w));
    const c = t.cols.find(c => c.w === mn);
    all.push({ k: `${pg}${t.sec}#${t.nInSec}`, mn, cpl: c ? c.cpl : null, lines: c ? c.lines : null });
  }
  all.sort((a, b) => a.mn - b.mn);
  console.log(`@${w}: ` + all.slice(0, 10).map(a => `${a.k}=${a.mn}px/${a.cpl}cpl`).join("  "));
}
