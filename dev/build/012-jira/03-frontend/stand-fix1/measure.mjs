/* Замір таблиць шести довідників. Метрика QA кола 1 (D-01):
   «зламана» = є колонка з minW < 60 px, у якій текст стоїть по ≤ 2,6 знака в рядок.
   Запуск: node measure.mjs [tag] [--css=<шлях до інжектованого css>]
   Сервер — локальний 8302 (свій порт фронтендера), Chrome — 9335, кеш вимкнено. */
import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";

const ORIGIN = process.env.ORIGIN || "http://127.0.0.1:8302";
const WIDTHS = [390, 768, 1024, 1280, 1440];
const PAGES = [
  "jira-ref-map", "jira-ref-jql", "jira-ref-automation",
  "claude-code-ref-commands", "claude-code-ref-hooks", "claude-code-ref-settings"
];

const tag = (process.argv[2] || "out").replace(/[^\w.-]/g, "");
const cssArg = process.argv.find(a => a.startsWith("--css="));
const extraCss = cssArg ? fs.readFileSync(cssArg.slice(6), "utf8") : "";

export const MEASURE = `(function(){
  function sec(el){ var n = el; while (n && n !== document.body) { if (n.id) return "#" + n.id; n = n.parentElement; } return ""; }
  function pad(cs){ return (parseFloat(cs.paddingLeft)||0) + (parseFloat(cs.paddingRight)||0); }
  /* ⚠ Пастка метрики, упійману на "У -p" з інлайновим code: такий code має
     інший кегль, тому його rect на ТОМУ Ж рядку стоїть на 0,5 px вище. Через
     Math.round(top) такий рядок рахувався за два (cpl 1,5 замість 4) — хибний
     «зламаний». Тому рядки групуються з допуском: новий рядок = зсув > 6 px. */
  function lines(cell){
    var r = document.createRange();
    try { r.selectNodeContents(cell); } catch(e){ return 0; }
    var tops = Array.from(r.getClientRects())
      .filter(function(x){ return x.height>2 && x.width>0; })
      .map(function(x){ return x.top; }).sort(function(a,b){ return a-b; });
    var n = 0, last = -1e9;
    tops.forEach(function(t){ if (t - last > 6) { n++; last = t; } });
    return n;
  }
  var out = [], perSec = {};
  Array.from(document.querySelectorAll("table.ds-tbl")).forEach(function(t){
    var wrap = t.closest(".ds-tbl__wrap");
    var scroller = wrap || t.parentElement;
    var s = sec(t); perSec[s] = (perSec[s]||0) + 1;
    var headCells = Array.from(t.querySelectorAll("thead tr:first-child th, thead tr:first-child td"));
    if (!headCells.length) headCells = Array.from(t.querySelectorAll("tr:first-child th, tr:first-child td"));
    var heads = headCells.map(function(c){ return c.textContent.trim().replace(/\\s+/g," ").slice(0,22); });
    var rows = Array.from(t.rows);
    var ncol = Math.max.apply(null, rows.map(function(r){ return r.cells.length; }).concat([0]));
    var cols = [];
    for (var i=0;i<ncol;i++) cols.push({ i: i, minW: 1e9, maxLines: 0, worstChars: 1e9, worstText: "" });
    rows.forEach(function(r){
      Array.from(r.cells).forEach(function(c, i){
        if (i >= ncol) return;
        var cs = getComputedStyle(c);
        var cw = c.getBoundingClientRect().width - pad(cs);
        if (cw < cols[i].minW) cols[i].minW = cw;
        var txt = c.textContent.trim(); if (!txt) return;
        var L = lines(c);
        if (L > cols[i].maxLines) cols[i].maxLines = L;
        if (L >= 2) {
          var cpl = txt.replace(/\\s/g,"").length / L;
          if (cpl < cols[i].worstChars) { cols[i].worstChars = cpl; cols[i].worstText = txt.slice(0,40); }
        }
      });
    });
    cols.forEach(function(c){ if (c.minW > 1e8) c.minW = null; if (c.worstChars > 1e8) c.worstChars = null; });
    var scs = getComputedStyle(scroller);
    out.push({
      sec: s, nInSec: perSec[s], id: s + "#" + perSec[s],
      tblCls: t.className, wrapCls: scroller.className,
      heads: heads, ncol: ncol, nrow: rows.length,
      wrapW: Math.round(scroller.clientWidth*10)/10,
      tblW: Math.round(t.scrollWidth*10)/10,
      overflow: Math.round((scroller.scrollWidth - scroller.clientWidth)*10)/10,
      overflowX: scs.overflowX,
      fade: scroller.getAttribute("data-scroll-fade"),
      tabindex: scroller.getAttribute("tabindex"),
      h: Math.round(t.getBoundingClientRect().height*10)/10,
      firstColWS: (function(){ var c = t.querySelector("tbody tr td:first-child") || t.querySelector("tr td:first-child"); return c ? getComputedStyle(c).whiteSpace : null; })(),
      cellWrap: (function(){ var c = t.querySelector("tbody tr td:nth-child(2)") || t.querySelector("td"); return c ? getComputedStyle(c).overflowWrap : null; })(),
      cols: cols.map(function(c){ return { w: c.minW===null?null:Math.round(c.minW*10)/10, lines: c.maxLines, cpl: c.worstChars===null?null:Math.round(c.worstChars*10)/10, t: c.worstText }; }),
      longestToken: (function(){ var best=0, s=""; Array.from(t.querySelectorAll("td,th")).forEach(function(c){ c.textContent.trim().split(/\\s+/).forEach(function(w){ if (w.length>best){best=w.length;s=w;} }); }); return { n: best, s: s.slice(0,40) }; })()
    });
  });
  return {
    doc: { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth },
    bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    artW: (function(){ var a=document.querySelector('article.ds-prose'); return a? Math.round(a.clientWidth*10)/10 : null; })(),
    tables: out
  };
})()`;

const b = await browser(9335);
const P = await b.page();
if (extraCss) {
  await P.inject(`(function add(){
    var r = document.documentElement; if (!r) { setTimeout(add, 0); return; }
    var go = function(){ if (document.getElementById('__fixcss')) return;
      var st = document.createElement('style'); st.id='__fixcss';
      st.textContent = ${JSON.stringify(extraCss)};
      (document.head || r).appendChild(st); };
    go(); document.addEventListener('DOMContentLoaded', go); setTimeout(go, 50); setTimeout(go, 400);
  })();`);
}
const res = {};
for (const id of PAGES) {
  res[id] = {};
  for (const w of WIDTHS) {
    await P.viewport(w, 900, w < 700);
    if (w === WIDTHS[0]) { await P.goto(`${ORIGIN}/${id}.html`, 0); }
    await P.eval(`document.fonts.ready`);
    await sleep(450);
    await P.eval(`window.dispatchEvent(new Event('resize')), 1`);
    await sleep(350);
    await P.eval(`document.fonts.ready`);
    res[id][w] = await P.eval(MEASURE);
  }
  process.stderr.write(`${id}: ${res[id][1280].tables.length} таблиць, css=${!!extraCss}\n`);
}
await P.close();
b.close();
fs.writeFileSync(new URL(`./${tag}.json`, import.meta.url), JSON.stringify(res));
console.log("written", tag);
