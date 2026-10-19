/* Підбір min-width для ОДНІЄЇ таблиці: прогін кількох значень на одному завантаженні.
   Запуск: node sweep1.mjs <page> <#sec> <базовий css> <rem,rem,...> */
import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const ORIGIN = "http://127.0.0.1:8302";
const [page, sec, base, list] = process.argv.slice(2);
const vals = list.split(",");
const baseCss = fs.readFileSync(base, "utf8");
const WIDTHS = [390, 768, 1024, 1280, 1440];

const b = await browser(9335);
const P = await b.page();
await P.inject(`(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;}
  var go=function(){ if(document.getElementById('__fixcss'))return; var st=document.createElement('style'); st.id='__fixcss'; st.textContent=${JSON.stringify(baseCss)}; (document.head||r).appendChild(st); };
  go(); document.addEventListener('DOMContentLoaded', go); setTimeout(go,50); setTimeout(go,400);})();`);
const MEAS = `(function(){
  var t = document.querySelector(${JSON.stringify(sec)} + " table.ds-tbl");
  if (!t) return null;
  var wrap = t.closest(".ds-tbl__wrap");
  var rows = Array.from(t.rows);
  var ncol = Math.max.apply(null, rows.map(function(r){ return r.cells.length; }));
  function lines(c){ var r=document.createRange(); r.selectNodeContents(c); var ys={};
    Array.from(r.getClientRects()).filter(function(x){return x.height>2&&x.width>0;}).forEach(function(x){ys[Math.round(x.top)]=1;}); return Object.keys(ys).length; }
  var cols = [];
  for (var i=0;i<ncol;i++) cols.push({ w: 1e9, ln: 0 });
  rows.forEach(function(r){ Array.from(r.cells).forEach(function(c,i){ if(i>=ncol) return;
    var cs=getComputedStyle(c); var w=c.getBoundingClientRect().width-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);
    if(w<cols[i].w) cols[i].w=Math.round(w*10)/10; var L=lines(c); if(L>cols[i].ln) cols[i].ln=L; }); });
  return { h: Math.round(t.getBoundingClientRect().height), tbl: Math.round(t.scrollWidth),
    wrap: Math.round(wrap.clientWidth), ov: Math.round(wrap.scrollWidth-wrap.clientWidth),
    cols: cols };
})()`;
await P.viewport(1280, 900);
await P.goto(`${ORIGIN}/${page}.html`, 0);
await P.eval(`document.fonts.ready`); await sleep(600);
for (const v of ["base", ...vals]) {
  await P.eval(`(function(){ var s=document.getElementById('__sw'); if(!s){s=document.createElement('style'); s.id='__sw'; document.head.appendChild(s);}
    s.textContent = ${JSON.stringify(v)} === "base" ? "" : (${JSON.stringify(sec)} + " table.ds-tbl{min-width:" + ${JSON.stringify(v)} + "}"); return 1; })()`);
  const line = [];
  for (const w of WIDTHS) {
    await P.viewport(w, 900, w < 700);
    await sleep(250);
    const m = await P.eval(MEAS);
    line.push(`${w}: h=${m.h} tbl=${m.tbl} ov=${m.ov} [${m.cols.map(c => `${c.w}/${c.ln}`).join(" ")}]`);
  }
  console.log(`--- ${v} ---\n   ` + line.join("\n   "));
}
await P.close(); b.close();
