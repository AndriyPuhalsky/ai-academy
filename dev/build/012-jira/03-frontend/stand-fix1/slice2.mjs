/* Уточнений другий критерій D-01: РОЗРІВ УСЕРЕДИНІ ТОКЕНА.
   Перша версія (slice.mjs) рахувала будь-яке слово на двох рядках і тому
   зачисляла в дефект законні переноси після дефіса чи слеша
   («company-managed», «support.atlassian.com/…»). Тут рахується лише розрив,
   що падає МІЖ ДВОМА БУКВО-ЦИФРАМИ: саме це дає «proje/ct» і «Su/mma/ry».
   Метод: слово → <span>, Range по символах, шукаємо індекси, де змінюється
   top рядка; далі дивимось символи ліворуч і праворуч від розриву.
   Запуск: node slice2.mjs <tag> [--css=file] */
import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";

const ORIGIN = process.env.ORIGIN || "http://127.0.0.1:8302";
const WIDTHS = [390, 768, 1024, 1280, 1440];
const PAGES = ["jira-ref-map", "jira-ref-jql", "jira-ref-automation",
  "claude-code-ref-commands", "claude-code-ref-hooks", "claude-code-ref-settings"];

const tag = (process.argv[2] || "slice2").replace(/[^\w.-]/g, "");
const cssArg = process.argv.find(a => a.startsWith("--css="));
const extraCss = cssArg ? fs.readFileSync(cssArg.slice(6), "utf8") : "";

const SLICE = `(function(){
  function sec(el){ var n = el; while (n && n !== document.body) { if (n.id) return "#" + n.id; n = n.parentElement; } return ""; }
  var WORD = /[0-9A-Za-z\\u0400-\\u04FF]/;
  var out = [], perSec = {};
  Array.from(document.querySelectorAll("table.ds-tbl")).forEach(function(t){
    var s = sec(t); perSec[s] = (perSec[s]||0) + 1;
    var saved = t.innerHTML;
    var marks = [];
    Array.from(t.querySelectorAll("th,td")).forEach(function(c){
      var colIdx = Array.prototype.indexOf.call(c.parentElement.cells, c);
      var walker = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, null);
      var nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function(tn){
        var parts = tn.nodeValue.split(/(\\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function(p){
          if (!p) return;
          if (/^\\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          var sp = document.createElement("span"); sp.textContent = p;
          frag.appendChild(sp); marks.push({ sp: sp, w: p, col: colIdx });
        });
        tn.parentNode.replaceChild(frag, tn);
      });
    });
    void t.offsetHeight;
    var cut = [];
    /* допуск 6 px: інлайновий <code> має інший кегль і на тому ж рядку стоїть
       на 0,5 px вище — без допуску це читалось як другий рядок */
    function nlines(rects){
      var tops = rects.filter(function(r){ return r.width>0.5 && r.height>2; })
        .map(function(r){ return r.top; }).sort(function(a,b){ return a-b; });
      var n = 0, last = -1e9;
      tops.forEach(function(t){ if (t - last > 6) { n++; last = t; } });
      return n;
    }
    marks.forEach(function(m){
      if (nlines(Array.from(m.sp.getClientRects())) < 2) return;
      // точні місця розриву: top i-го символа
      var tn = m.sp.firstChild; if (!tn || tn.nodeType !== 3) return;
      var txt = m.w, prevTop = null, breaks = [];
      var rg = document.createRange();
      for (var i = 0; i < txt.length; i++) {
        rg.setStart(tn, i); rg.setEnd(tn, i + 1);
        var rs = Array.from(rg.getClientRects()).filter(function(r){ return r.height>2; });
        if (!rs.length) continue;
        var top = rs[0].top;
        if (prevTop !== null && Math.abs(top - prevTop) > 6) breaks.push(i);
        prevTop = top;
      }
      var mid = breaks.filter(function(i){ return WORD.test(txt[i-1]||"") && WORD.test(txt[i]||""); });
      if (mid.length) cut.push({ w: txt, col: m.col, n: txt.length, at: mid,
        shown: txt.slice(0, mid[0]) + "/" + txt.slice(mid[0]) });
    });
    t.innerHTML = saved;
    out.push({ id: s + "#" + perSec[s], nCut: cut.length,
      worst: cut.slice().sort(function(a,b){ return b.n - a.n; }).slice(0,3).map(function(x){ return x.shown.slice(0,44); }),
      cols: Array.from(new Set(cut.map(function(x){ return x.col; }))).sort() });
  });
  return out;
})()`;

const b = await browser(9335);
const P = await b.page();
if (extraCss) await P.inject(`(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;}
  var go=function(){ if(document.getElementById('__fixcss'))return; var st=document.createElement('style'); st.id='__fixcss'; st.textContent=${JSON.stringify(extraCss)}; (document.head||r).appendChild(st); };
  go(); document.addEventListener('DOMContentLoaded', go); setTimeout(go,50); setTimeout(go,400);})();`);
const res = {};
for (const id of PAGES) {
  res[id] = {};
  for (const w of WIDTHS) {
    await P.viewport(w, 900, w < 700);
    if (w === WIDTHS[0]) await P.goto(`${ORIGIN}/${id}.html`, 0);
    await P.eval(`document.fonts.ready`);
    await sleep(450);
    res[id][w] = await P.eval(SLICE);
  }
  process.stderr.write(`${id} ok\n`);
}
await P.close(); b.close();
fs.writeFileSync(new URL(`./${tag}.json`, import.meta.url), JSON.stringify(res));

let g = {};
console.log("РОЗРИВ УСЕРЕДИНІ ТОКЕНА — слів / таблиць, де таке є");
console.log("page".padEnd(26) + WIDTHS.map(w => String(w).padStart(13)).join(""));
for (const [p, byW] of Object.entries(res)) {
  console.log(p.padEnd(26) + WIDTHS.map(w => {
    const a = byW[w], cells = a.reduce((s, t) => s + t.nCut, 0), tabs = a.filter(t => t.nCut > 0).length;
    g[w] = (g[w] || 0) + cells; g["t" + w] = (g["t" + w] || 0) + tabs;
    return `${cells}/${tabs}`.padStart(13);
  }).join(""));
}
console.log("РАЗОМ".padEnd(26) + WIDTHS.map(w => `${g[w]}/${g["t" + w]}`.padStart(13)).join(""));
