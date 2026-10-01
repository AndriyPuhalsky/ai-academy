// Регресія: геометрія ВСІХ таблиць на сторінках поза шістьма довідниками.
// Превʼю (після фіксу) проти локальної копії bcdde13~1 (до фіксу), той самий код метрики.
import { browser, sleep } from "./cdp.mjs";
const AFTER = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const BEFORE = "http://127.0.0.1:8305";
const PAGES = [
  ["modules/jira-15", ".html"], ["modules/claude-code-07", ".html"], ["modules/claude-code-22", ".html"],
  ["modules/module-01", ".html"], ["modules/architect-09", ".html"],
  ["jira", ".html"], ["index", ".html"], ["claude-code", ".html"], ["roadmap", ".html"], ["verify", ".html"]
];
const WIDTHS = [390, 1280];
const UNGATE = `
(function add(){ var r=document.documentElement; if(!r){setTimeout(add,0);return;}
  setInterval(function(){ var g=document.getElementById('aiaGate'); if(g) g.remove();
    var m=document.getElementById('main'); if(m) Array.prototype.forEach.call(m.children,function(c){ if(c.hasAttribute&&c.hasAttribute('hidden')) c.removeAttribute('hidden'); });
    if(r.getAttribute('data-aia-gate')) r.removeAttribute('data-aia-gate'); }, 40);
})();`;
const M = `(function(){
  function sec(el){var n=el;while(n&&n!==document.body){if(n.id)return "#"+n.id;n=n.parentElement;}return "";}
  var out=[],per={};
  Array.from(document.querySelectorAll("table")).forEach(function(t){
    var s=sec(t); per[s]=(per[s]||0)+1;
    var sc=t.closest(".ds-tbl__wrap")||t.closest(".win__main")||t.parentElement;
    var cols=[];var rows=Array.from(t.rows);
    var n=Math.max.apply(null,rows.map(function(r){return r.cells.length;}).concat([0]));
    for(var i=0;i<n;i++)cols.push(1e9);
    rows.forEach(function(r){Array.from(r.cells).forEach(function(c,i){ if(i<n){var w=c.getBoundingClientRect().width; if(w<cols[i])cols[i]=w;}});});
    out.push({k:s+"#"+per[s], cls:t.className, h:Math.round(t.getBoundingClientRect().height),
      w:Math.round(t.scrollWidth), ov:Math.round(sc.scrollWidth-sc.clientWidth),
      cols:cols.map(function(c){return c>1e8?null:Math.round(c);})});
  });
  return {doc: document.documentElement.scrollWidth-document.documentElement.clientWidth, t:out};
})()`;
const b = await browser(9336); const P = await b.page();
await P.inject(UNGATE);
let diffs = 0, checked = 0;
for (const [p, ext] of PAGES) {
  for (const w of WIDTHS) {
    const r = {};
    for (const [tag, base] of [["after", AFTER], ["before", BEFORE]]) {
      await P.viewport(w, 900, w < 700);
      await P.goto(`${base}/${p}${base === AFTER ? "" : ext}`, 0);
      await P.eval(`document.fonts.ready`); await sleep(1400);
      await P.eval(`window.AIA && window.AIA.winScrollers && window.AIA.winScrollers.sync(), 1`);
      await sleep(300);
      r[tag] = await P.eval(M);
    }
    const a = r.after, bb = r.before;
    const msgs = [];
    if (a.t.length !== bb.t.length) msgs.push(`кількість таблиць ${bb.t.length}→${a.t.length}`);
    if (a.doc !== bb.doc) msgs.push(`скрол body ${bb.doc}→${a.doc}`);
    const n = Math.min(a.t.length, bb.t.length);
    for (let i = 0; i < n; i++) {
      checked++;
      const x = a.t[i], y = bb.t[i];
      if (x.cls !== y.cls) msgs.push(`${x.k} клас "${y.cls}"→"${x.cls}"`);
      if (Math.abs(x.h - y.h) > 1 || Math.abs(x.w - y.w) > 1 || Math.abs(x.ov - y.ov) > 1)
        msgs.push(`${x.k} h ${y.h}→${x.h} w ${y.w}→${x.w} ov ${y.ov}→${x.ov}`);
      else if (JSON.stringify(x.cols) !== JSON.stringify(y.cols)) msgs.push(`${x.k} колонки ${JSON.stringify(y.cols)}→${JSON.stringify(x.cols)}`);
    }
    diffs += msgs.length;
    console.log(`${p} @${w}: таблиць ${a.t.length}, розбіжностей ${msgs.length}${msgs.length ? " :: " + msgs.slice(0, 4).join(" | ") : ""}`);
  }
}
console.log(`\nПідсумок: звірено ${checked} таблице-замірів, розбіжностей ${diffs}`);
await P.close(); b.close();
