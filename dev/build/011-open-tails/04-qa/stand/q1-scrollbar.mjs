// Рішення 1 — смуга прокрутки на шести скролерах системи. Критерії 1,2,3,5,6,8,9,12.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const SEL = ".ds-tbl__wrap, .ds-diag > pre.mermaid, .term > .term__body, .ds-code > .ds-code__pre, .ds-prose > .ds-code__pre, .ds-prose > section > .ds-code__pre";
const b = await browser();
const out = {};

const MEASURE = `(function(){
  var els = [].slice.call(document.querySelectorAll(${JSON.stringify(SEL)}));
  var rows = els.map(function(e){
    var cs = getComputedStyle(e);
    var bt = parseFloat(cs.borderTopWidth)||0, bb = parseFloat(cs.borderBottomWidth)||0;
    var bl = parseFloat(cs.borderLeftWidth)||0, br = parseFloat(cs.borderRightWidth)||0;
    return { cls: (e.className||'').toString().slice(0,28) || e.tagName,
      hscroll: e.scrollWidth - e.clientWidth > 1,
      vscroll: e.scrollHeight - e.clientHeight > 1,
      hbar: Math.round(e.offsetHeight - bt - bb - e.clientHeight),
      vbar: Math.round(e.offsetWidth - bl - br - e.clientWidth),
      sbColor: cs.scrollbarColor, sbWidth: cs.scrollbarWidth };
  });
  var bad = rows.filter(function(r){ return (r.hscroll ? r.hbar !== 12 : r.hbar !== 0); });
  var badV = rows.filter(function(r){ return (r.vscroll ? r.vbar !== 12 : r.vbar !== 0); });
  var colors = {}; rows.forEach(function(r){ colors[r.sbColor] = (colors[r.sbColor]||0)+1; });
  return { total: rows.length, hscrollers: rows.filter(function(r){return r.hscroll}).length,
    vscrollers: rows.filter(function(r){return r.vscroll}).length,
    badH: bad.map(function(r){return {cls:r.cls, hscroll:r.hscroll, hbar:r.hbar}}),
    badV: badV.map(function(r){return {cls:r.cls, vscroll:r.vscroll, vbar:r.vbar}}),
    sbColors: colors,
    pageHScroll: document.documentElement.scrollWidth - window.innerWidth,
    innerWidth: window.innerWidth };
})()`;

const PAGES = [
  [1280, "claude-code-ref-hooks", true],
  [1280, "claude-code-ref-settings", true],
  [1024, "claude-code-ref-settings", true],
  [1280, "claude-code-ref-commands", true],
  [1280, "modules/claude-code-10", true],
  [390,  "modules/claude-code-10", true],
  [390,  "modules/module-05", true],
  [390,  "modules/architect-08", true],
  [1280, "modules/module-05", true],
  [1280, "modules/architect-08", true],
  [1280, "claude-code", false],
  [390,  "claude-code", false],
  [1280, "index", false],
  [390,  "architect", false],
  [1440, "roadmap", false],
  [390,  "verify", false],
];

for (const [w, pg, lesson] of PAGES) {
  const P = await b.page({ blocked: lesson ? ["*supabase*"] : [] });
  await P.inject(CONSOLE_PROBE + (lesson ? `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}` : `try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}`));
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')}) && document.fonts.status==='loaded';})()", 20000);
  await sleep(600);
  const r = await P.eval(MEASURE);
  const log = await P.eval(`({errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections})`);
  const net = P.net.filter((x) => x.status >= 400 || x.status === 0).map((x) => x.status + " " + (x.url || "").slice(-70));
  const blog = P.browserLog.filter((e) => e.level === "error").map((e) => e.src + ": " + e.text.slice(0, 120));
  out[`${w}:${pg}`] = { ...r, log, net, blog };
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
