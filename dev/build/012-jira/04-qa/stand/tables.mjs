import { browser, sleep, waitFor } from "./cdp.mjs";
import fs from "node:fs";

const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const WIDTHS = [390, 768, 1024, 1280, 1440];

const PAGES = [
  ...["jira-ref-jql", "jira-ref-automation", "jira-ref-map"].map(s => ({ url: `${D}/${s}`, id: s, lesson: false })),
  { url: `${D}/jira`, id: "jira", lesson: false },
  ...Array.from({ length: 23 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { url: `${D}/modules/jira-${n}`, id: `jira-${n}`, lesson: true };
  })
];

const UNGATE = `(function(){
  var g=document.getElementById('aiaGate'); if(g) g.remove();
  var m=document.getElementById('main');
  if(m) Array.prototype.forEach.call(m.children, function(c){ c.hidden=false; });
  document.documentElement.removeAttribute('data-aia-gate');
  if (window.AIA && window.AIA.winScrollers) window.AIA.winScrollers.sync();
  var a = document.querySelector('article.ds-prose');
  return a ? a.clientWidth : -1;
})()`;

async function ungate(P) {
  for (let i = 0; i < 25; i++) {
    const w = await P.eval(UNGATE);
    if (w > 0) return w;
    await sleep(200);
  }
  return 0;
}

const MEASURE = `(function(){
  function sec(el){
    var n = el;
    while (n && n !== document.body) {
      if (n.id) return "#" + n.id;
      n = n.parentElement;
    }
    return "";
  }
  function pad(cs){ return (parseFloat(cs.paddingLeft)||0) + (parseFloat(cs.paddingRight)||0); }
  function lines(cell){
    // кількість рядкових блоків усередині комірки
    var r = document.createRange();
    try { r.selectNodeContents(cell); } catch(e){ return 0; }
    var rects = Array.from(r.getClientRects()).filter(function(x){ return x.height>2 && x.width>0; });
    // згрупувати по y (рядки)
    var ys = {};
    rects.forEach(function(x){ ys[Math.round(x.top)] = 1; });
    return Object.keys(ys).length;
  }
  var out = [];
  var tables = Array.from(document.querySelectorAll("table"));
  var perSec = {};
  tables.forEach(function(t){
    var isWin = /win__table/.test(t.className);
    var wrap = isWin ? t.closest(".win__main") : t.closest(".ds-tbl__wrap");
    var scroller = wrap || t.parentElement;
    var s = sec(t);
    perSec[s] = (perSec[s]||0) + 1;
    var headCells = Array.from(t.querySelectorAll("thead tr:first-child th, thead tr:first-child td"));
    if (!headCells.length) headCells = Array.from(t.querySelectorAll("tr:first-child th, tr:first-child td"));
    var heads = headCells.map(function(c){ return c.textContent.trim().replace(/\\s+/g," ").slice(0,24); });
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
        var txt = c.textContent.trim();
        if (!txt) return;
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
      sec: s, nInSec: perSec[s], isWin: isWin, cls: t.className,
      heads: heads, ncol: ncol, nrow: rows.length,
      wrapW: Math.round(scroller.clientWidth*10)/10,
      tblW: Math.round(t.scrollWidth*10)/10,
      overflow: Math.round((scroller.scrollWidth - scroller.clientWidth)*10)/10,
      overflowY: Math.round((scroller.scrollHeight - scroller.clientHeight)*10)/10,
      scrollerCls: scroller.className,
      overflowX: scs.overflowX,
      fade: scroller.getAttribute("data-scroll-fade"),
      tabindex: scroller.getAttribute("tabindex"),
      tall: /--tall/.test(scroller.className),
      hasWrapMod: /ds-tbl--wrap/.test(t.className) || /ds-tbl--wrap/.test(scroller.className),
      firstColNowrap: (function(){ var c = t.querySelector("tbody tr td:first-child") || t.querySelector("tr td:first-child"); return c ? getComputedStyle(c).whiteSpace : null; })(),
      cols: cols.map(function(c){ return { w: c.minW===null?null:Math.round(c.minW*10)/10, lines: c.maxLines, cpl: c.worstChars===null?null:Math.round(c.worstChars*10)/10, t: c.worstText }; }),
      codeCells: t.querySelectorAll("td code, th code").length,
      longestToken: (function(){
        var best = 0, s = "";
        Array.from(t.querySelectorAll("td,th")).forEach(function(c){
          c.textContent.trim().split(/\\s+/).forEach(function(w){ if (w.length > best) { best = w.length; s = w; } });
        });
        return { n: best, s: s.slice(0,40) };
      })()
    });
  });
  return {
    doc: { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth },
    gate: !!document.getElementById('aiaGate'),
    artW: (function(){ var a=document.querySelector('article.ds-prose'); return a? a.clientWidth : null; })(),
    tables: out
  };
})()`;

const PERSIST_UNGATE = `
(function add(){
  var r = document.documentElement;
  if (!r) { setTimeout(add, 0); return; }
  var run = function(){
    var g = document.getElementById('aiaGate'); if (g) g.remove();
    var m = document.getElementById('main');
    if (m) Array.prototype.forEach.call(m.children, function(c){ if (c.hasAttribute && c.hasAttribute('hidden')) c.removeAttribute('hidden'); });
    if (r.getAttribute('data-aia-gate')) r.removeAttribute('data-aia-gate');
  };
  window.__ungateRun = run;
  setInterval(run, 40);
})();`;

const b = await browser(9334);
const P = await b.page();
await P.inject(PERSIST_UNGATE);
const res = {};
const errors = {};
for (const pg of PAGES) {
  res[pg.id] = {};
  errors[pg.id] = [];
  for (const w of WIDTHS) {
    await P.viewport(w, 900, w < 700);
    if (w === WIDTHS[0]) {
      await P.goto(pg.url, 0);
      await P.eval(`document.fonts.ready`);
      if (pg.lesson) {
        await waitFor(P, `!!document.getElementById('aiaGate') || !!window.AIA_USER`, 12000, 150);
        const aw = await ungate(P);
        if (!aw) errors[pg.id].push(`ungate failed @${w}`);
        await sleep(300);
        await P.eval(`window.AIA && window.AIA.winScrollers && window.AIA.winScrollers.sync(), 1`);
      }
      await sleep(400);
    } else {
      await sleep(500);
      if (pg.lesson) { const aw = await ungate(P); if (!aw) errors[pg.id].push(`ungate failed @${w}`); }
      await P.eval(`window.AIA && window.AIA.winScrollers && window.AIA.winScrollers.sync(), 1`);
      await sleep(400);
    }
    await P.eval(`document.fonts.ready`);
    res[pg.id][w] = await P.eval(MEASURE);
  }
  process.stderr.write(`${pg.id} done (${Object.keys(res[pg.id]).length} widths, ${res[pg.id][1280].tables.length} tables)\n`);
}
await P.close();
b.close();
fs.writeFileSync(new URL("./tables.out.json", import.meta.url), JSON.stringify(res));
fs.writeFileSync(new URL("./tables.err.json", import.meta.url), JSON.stringify(errors, null, 1));
console.log("written");
