// QA коло 2 · D-01: матриця таблиць шести довідників на 5 ширинах.
// Виправлено хибнопозитив кола 1: lines() групує rect-и з допуском у пів рядка
// (інлайновий <code> стоїть на ~0,5 px вище за сусідній текст того ж рядка).
import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";

const D = process.env.QA_BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const WIDTHS = [390, 768, 1024, 1280, 1440];
const PAGES = [
  "jira-ref-jql", "jira-ref-automation", "jira-ref-map",
  "claude-code-ref-commands", "claude-code-ref-settings", "claude-code-ref-hooks"
];

const MEASURE = `(function(){
  function sec(el){ var n=el; while(n && n!==document.body){ if(n.id) return "#"+n.id; n=n.parentElement; } return ""; }
  function pad(cs){ return (parseFloat(cs.paddingLeft)||0)+(parseFloat(cs.paddingRight)||0); }
  // ВИПРАВЛЕНО: групування з допуском 0,5 рядка замість Math.round(top)
  function clusterTops(rects, tol){
    var tops = rects.map(function(r){ return r.top; }).sort(function(a,b){ return a-b; });
    var n = 0, cur = -1e9;
    tops.forEach(function(t){ if (t - cur > tol) { n++; cur = t; } });
    return n;
  }
  function lineTol(el){
    var lh = parseFloat(getComputedStyle(el).lineHeight);
    if (!isFinite(lh)) lh = parseFloat(getComputedStyle(el).fontSize) * 1.5;
    return Math.max(4, lh * 0.5);
  }
  function lines(cell){
    var r = document.createRange();
    try { r.selectNodeContents(cell); } catch(e){ return 0; }
    var rects = Array.from(r.getClientRects()).filter(function(x){ return x.height>2 && x.width>0; });
    if (!rects.length) return 0;
    return clusterTops(rects, lineTol(cell));
  }
  // розриви всередині токена: слово, чиї rect-и лежать на >1 рядку
  function tokenSplits(cell){
    var tol = lineTol(cell), bad = 0, worst = "";
    var w = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    var tn;
    while ((tn = w.nextNode())) {
      var s = tn.nodeValue; if (!s || !/\\S/.test(s)) continue;
      var re = /[^\\s]+/g, m;
      while ((m = re.exec(s))) {
        if (m[0].length < 2) continue;
        var r = document.createRange();
        r.setStart(tn, m.index); r.setEnd(tn, m.index + m[0].length);
        var rects = Array.from(r.getClientRects()).filter(function(x){ return x.height>2 && x.width>0; });
        if (!rects.length) continue;
        if (clusterTops(rects, tol) > 1) { bad++; if (m[0].length > worst.length) worst = m[0]; }
      }
    }
    return { n: bad, worst: worst.slice(0,40) };
  }
  var out = [], perSec = {};
  Array.from(document.querySelectorAll("table.ds-tbl")).forEach(function(t){
    var wrap = t.closest(".ds-tbl__wrap"); var scroller = wrap || t.parentElement;
    var s = sec(t); perSec[s] = (perSec[s]||0)+1;
    var rows = Array.from(t.rows);
    var ncol = Math.max.apply(null, rows.map(function(r){ return r.cells.length; }).concat([0]));
    var cols = []; for (var i=0;i<ncol;i++) cols.push({ minW:1e9, maxLines:0, worstChars:1e9, worstText:"" });
    var splits = 0, splitWorst = "";
    rows.forEach(function(r){
      Array.from(r.cells).forEach(function(c,i){
        if (i>=ncol) return;
        var cs = getComputedStyle(c);
        var cw = c.getBoundingClientRect().width - pad(cs);
        if (cw < cols[i].minW) cols[i].minW = cw;
        var txt = c.textContent.trim(); if (!txt) return;
        var L = lines(c);
        if (L > cols[i].maxLines) cols[i].maxLines = L;
        if (L >= 2) { var cpl = txt.replace(/\\s/g,"").length / L;
          if (cpl < cols[i].worstChars) { cols[i].worstChars = cpl; cols[i].worstText = txt.slice(0,40); } }
        var ts = tokenSplits(c); splits += ts.n; if (ts.worst.length > splitWorst.length) splitWorst = ts.worst;
      });
    });
    cols.forEach(function(c){ if (c.minW>1e8) c.minW=null; if (c.worstChars>1e8) c.worstChars=null; });
    var heads = Array.from(t.querySelectorAll("thead tr:first-child th, thead tr:first-child td"))
      .map(function(c){ return c.textContent.trim().replace(/\\s+/g," ").slice(0,20); });
    out.push({
      sec:s, nInSec:perSec[s], cls:t.className, heads:heads, ncol:ncol, nrow:rows.length,
      wrapW: Math.round(scroller.clientWidth*10)/10,
      tblW: Math.round(t.scrollWidth*10)/10,
      overflow: Math.round((scroller.scrollWidth - scroller.clientWidth)*10)/10,
      bar: Math.round((scroller.offsetHeight - scroller.clientHeight)*10)/10,
      fade: scroller.getAttribute("data-scroll-fade"),
      tabindex: scroller.getAttribute("tabindex"),
      role: scroller.getAttribute("role"),
      aria: (scroller.getAttribute("aria-label")||"").slice(0,30),
      overflowX: getComputedStyle(scroller).overflowX,
      splits: splits, splitWorst: splitWorst,
      cols: cols.map(function(c){ return { w: c.minW===null?null:Math.round(c.minW*10)/10, lines:c.maxLines,
        cpl: c.worstChars===null?null:Math.round(c.worstChars*10)/10, t:c.worstText }; })
    });
  });
  return { doc:{ sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth },
    bodySw: document.body.scrollWidth, tables: out };
})()`;

const b = await browser(9336);
const P = await b.page();
const res = {};
for (const id of PAGES) {
  res[id] = {};
  await P.viewport(WIDTHS[0], 900, true);
  await P.goto(`${D}/${id}${process.env.QA_EXT || ""}`, 0);
  for (const w of WIDTHS) {
    await P.viewport(w, 900, w < 700);
    await sleep(500);
    await P.eval(`document.fonts.ready`);
    await sleep(250);
    res[id][w] = await P.eval(MEASURE);
  }
  process.stderr.write(`${id}: ${res[id][1280].tables.length} таблиць\n`);
}
await P.close(); b.close();
fs.writeFileSync(new URL(process.env.QA_OUT || "./r2-tables.out.json", import.meta.url), JSON.stringify(res));
console.log("written");
