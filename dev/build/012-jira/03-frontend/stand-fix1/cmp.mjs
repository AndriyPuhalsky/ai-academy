/* Порівняння «до → після» по кожній таблиці. Шукаємо не покращення (їх видно
   у зведенні), а РЕГРЕСІЇ: таблиця, яка була без дефекту, дістала скрол або
   виросла; перша колонка дістала більше рядків.
   Запуск: node cmp.mjs <base> <after> <sliceBase> <sliceAfter> [width] */
import fs from "node:fs";
const J = f => JSON.parse(fs.readFileSync(new URL(`./${f}.json`, import.meta.url), "utf8"));
const [bTag, aTag, sbTag, saTag] = process.argv.slice(2, 6);
const WIDTHS = process.argv[6] ? [Number(process.argv[6])] : [390, 768, 1024, 1280, 1440];
const B = J(bTag), A = J(aTag), SB = J(sbTag), SA = J(saTag);
const broken = t => t.cols.some(c => c.w !== null && c.w < 60 && c.cpl !== null && c.cpl <= 2.6);

for (const w of WIDTHS) {
  const newScroll = [], grew = [], moreLines = [], lostOk = [], mainNarrow = [];
  for (const p of Object.keys(B)) {
    const bt = B[p][w].tables, at = A[p][w].tables;
    const sb = SB[p][w], sa = SA[p][w];
    for (let i = 0; i < bt.length; i++) {
      const b = bt[i], a = at[i];
      if (!a || b.id !== a.id) { console.log(`!! розсинхрон ${p} ${w} ${i}`); continue; }
      const bDefect = broken(b) || (sb[i] && sb[i].nCut > 0);
      if (a.overflow > 0.5 && b.overflow <= 0.5) newScroll.push({ p, id: a.id, ov: a.overflow, bDefect, nCutBefore: sb[i] ? sb[i].nCut : 0, brokenBefore: broken(b) });
      if (a.h > b.h + 1) grew.push({ p, id: a.id, from: b.h, to: a.h, d: +(a.h - b.h).toFixed(1) });
      const bl = b.cols[0] ? b.cols[0].lines : 0, al = a.cols[0] ? a.cols[0].lines : 0;
      if (al > bl) moreLines.push({ p, id: a.id, from: bl, to: al, w0: `${b.cols[0].w}→${a.cols[0].w}` });
      if (!bDefect && (broken(a) || (sa[i] && sa[i].nCut > 0))) lostOk.push({ p, id: a.id });
      // головна (найширша до фіксу) колонка не має худнути: саме в ній читають
      let mi = 0; b.cols.forEach((c, k) => { if ((c.w || 0) > (b.cols[mi].w || 0)) mi = k; });
      const bw = b.cols[mi].w, aw = a.cols[mi] ? a.cols[mi].w : null;
      if (bw && aw && aw < bw * 0.85) mainNarrow.push({ p, id: a.id, col: mi, from: bw, to: aw,
        pct: Math.round((1 - aw / bw) * 100), lnFrom: b.cols[mi].lines, lnTo: a.cols[mi].lines });
    }
  }
  console.log(`\n==== ${w} ====`);
  console.log(`новий горизонт. скрол: ${newScroll.length}` +
    `  (з них таблиць БЕЗ дефекту до фіксу: ${newScroll.filter(x => !x.bDefect).length})`);
  newScroll.filter(x => !x.bDefect).forEach(x => console.log(`   ⚠ ${x.p} ${x.id} +${x.ov}px — дефекту до фіксу не мала`));
  console.log(`вища, ніж була: ${grew.length}`);
  grew.sort((x, y) => y.d - x.d).slice(0, 8).forEach(x => console.log(`   ${x.p} ${x.id} ${x.from}→${x.to} (+${x.d})`));
  console.log(`перша колонка дістала більше рядків: ${moreLines.length}`);
  moreLines.sort((x, y) => (y.to - y.from) - (x.to - x.from)).slice(0, 8).forEach(x => console.log(`   ${x.p} ${x.id} ${x.from}→${x.to} рядків, w0 ${x.w0}`));
  console.log(`головна колонка схудла >15 %: ${mainNarrow.length}`);
  mainNarrow.sort((x, y) => y.pct - x.pct).slice(0, 10).forEach(x =>
    console.log(`   ▼ ${x.p} ${x.id} c${x.col} ${x.from}→${x.to}px (−${x.pct} %), рядків ${x.lnFrom}→${x.lnTo}`));
  console.log(`була чиста — стала з дефектом: ${lostOk.length}`);
  lostOk.forEach(x => console.log(`   ✗ ${x.p} ${x.id}`));
}
