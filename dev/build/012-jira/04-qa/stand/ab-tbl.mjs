import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334); const P = await b.page();

const M = `(function(){
  function pad(cs){ return (parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0); }
  return Array.from(document.querySelectorAll("table.ds-tbl")).map(function(t,i){
    var wr = t.closest(".ds-tbl__wrap") || t.parentElement;
    var cols = [];
    var n = Math.max.apply(null, Array.from(t.rows).map(function(r){return r.cells.length;}));
    for (var c=0;c<n;c++) cols.push(1e9);
    Array.from(t.rows).forEach(function(r){ Array.from(r.cells).forEach(function(cell,c){
      if (c>=n) return; var w = cell.getBoundingClientRect().width - pad(getComputedStyle(cell));
      if (w<cols[c]) cols[c]=w; }); });
    var sec = (function(e){ while(e&&e!==document.body){ if(e.id) return "#"+e.id; e=e.parentElement; } return ""; })(t);
    return { i:i, sec:sec, ncol:n, wrapW: Math.round(wr.clientWidth), tblW: Math.round(t.scrollWidth),
      ov: Math.round(wr.scrollWidth-wr.clientWidth), minCol: Math.round(Math.min.apply(null,cols)*10)/10 };
  });
})()`;

const KILL_ANYWHERE = `(function(){
  var st = document.createElement('style'); st.id='qa-ab';
  st.textContent = '.ds-tbl th, .ds-tbl td { overflow-wrap: normal !important; }';
  document.head.appendChild(st); return 1;
})()`;
const RESTORE = `(function(){ var s=document.getElementById('qa-ab'); if(s) s.remove(); return 1; })()`;

const out = {};
for (const page of ["jira-ref-jql","jira-ref-automation","jira-ref-map","claude-code-ref-commands","claude-code-ref-settings","claude-code-ref-hooks"]) {
  out[page] = {};
  for (const w of [390, 768, 1280]) {
    await P.viewport(w, 900, w < 700);
    await P.goto(`${D}/${page}`, 0);
    await P.eval("document.fonts.ready"); await sleep(500);
    const base = await P.eval(M);
    await P.eval(KILL_ANYWHERE); await sleep(300);
    const ab = await P.eval(M);
    await P.eval(RESTORE);
    out[page][w] = { base, ab };
  }
  process.stderr.write(page+" ok\n");
}
await P.close(); b.close();
const fs = await import("node:fs");
fs.writeFileSync("ab-tbl.out.json", JSON.stringify(out));
// звіт
for (const page of Object.keys(out)) {
  for (const w of [390,768,1280]) {
    const { base, ab } = out[page][w];
    const bBad = base.filter(t => t.minCol < 60).length;
    const aBad = ab.filter(t => t.minCol < 60).length;
    const bOv = base.filter(t => t.ov > 1).length;
    const aOv = ab.filter(t => t.ov > 1).length;
    console.log(`${page} @${w}: таблиць ${base.length} · колонка<60px: ${bBad} → ${aBad} (без overflow-wrap:anywhere) · із горизонт. скролом: ${bOv} → ${aOv}`);
  }
}
