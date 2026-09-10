// Рішення 6 — резерв висоти сайдбара під раннім замком гостя. Критерії 1–10.
import { browser, sleep, waitFor, CLS_PROBE, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const TAG = process.env.TAG || "after";
const b = await browser();
const out = [];
const PROBE = `try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}` + CLS_PROBE + CONSOLE_PROBE + `
  window.__fcp=null; window.__gateAt=null; window.__cfgAt=null; window.__authAt=null;
  window.__footerAtGate=null; window.__snavAtGate=null; window.__gateAttrAtGate=null;
  try{ new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ if(e.name==='first-contentful-paint'&&window.__fcp==null) window.__fcp=Math.round(e.startTime); }); }).observe({type:'paint',buffered:true}); }catch(e){}
  document.addEventListener('aia:auth', function(){ if(window.__authAt==null) window.__authAt=Math.round(performance.now()); });
  document.addEventListener('aia:config-ready', function(){ if(window.__cfgAt==null) window.__cfgAt=Math.round(performance.now()); });
  (function poll(){
    var g = document.getElementById && document.getElementById('aiaGate');
    if (g) { window.__gateAt = Math.round(performance.now());
      var f = document.querySelector('footer'); var s = document.getElementById('moduleSidebar');
      window.__footerAtGate = f ? Math.round(f.getBoundingClientRect().top) : null;
      window.__snavAtGate = s ? Math.round(s.getBoundingClientRect().height) : null;
      window.__gateAttrAtGate = document.documentElement.getAttribute('data-aia-gate');
      return; }
    if (performance.now() < 15000) setTimeout(poll, 2);
  })();`;

const CASES = [
  { w: 1280, h: 900, pg: "modules/architect-05", note: "К1,2" },
  { w: 1280, h: 900, pg: "modules/module-05", note: "К2" },
  { w: 1280, h: 900, pg: "modules/claude-code-08", note: "К2" },
  { w: 1440, h: 900, pg: "modules/claude-code-08", note: "К3" },
  { w: 1920, h: 1080, pg: "modules/claude-code-08", note: "К3" },
  { w: 1280, h: 1300, pg: "modules/module-05", note: "К5 високе вікно" },
  { w: 1280, h: 700, pg: "modules/architect-05", note: "К6 низьке вікно" },
  { w: 390, h: 844, pg: "modules/claude-code-08", note: "К7 мобілка" },
  { w: 768, h: 1024, pg: "modules/claude-code-08", note: "К8 планшет" },
  { w: 1280, h: 900, pg: "modules/module-01", note: "К10 перший модуль" },
  { w: 1280, h: 900, pg: "modules/claude-code-01", note: "К10 перший модуль" },
];
for (const c of CASES) {
  const P = await b.page();
  await P.inject(PROBE);
  await P.viewport(c.w, c.h, c.w < 700);
  await P.goto(`${BASE}/${c.pg}`);
  await waitFor(P, "window.__authAt != null", 15000);
  await waitFor(P, "window.__cfgAt != null", 8000);
  await sleep(1200);
  const r = await P.eval(`(function(){
    var f=document.querySelector('footer'); var s=document.getElementById('moduleSidebar');
    var cs = s ? getComputedStyle(s) : null;
    return { cls: +window.__cls.value.toFixed(4),
      entries: window.__cls.entries.map(function(e){ return e.t+'ms v='+e.v+' ['+e.src.join(',')+']'; }),
      footerSrc: window.__cls.entries.filter(function(e){ return e.src.join(',').indexOf('FOOTER')>=0; }).length,
      fcp: window.__fcp, gateAt: window.__gateAt, cfgAt: window.__cfgAt, authAt: window.__authAt,
      footerAtGate: window.__footerAtGate, footerNow: f?Math.round(f.getBoundingClientRect().top):null,
      snavAtGate: window.__snavAtGate, snavNow: s?Math.round(s.getBoundingClientRect().height):null,
      snavMinHeight: cs?cs.minHeight:null, snavMaxHeight: cs?cs.maxHeight:null, snavDisplay: cs?cs.display:null,
      gateAttr: document.documentElement.getAttribute('data-aia-gate'), gateAttrAtGate: window.__gateAttrAtGate,
      gate: !!document.getElementById('aiaGate'), innerH: window.innerHeight, innerW: window.innerWidth,
      snavListH: (function(){ var l=document.querySelector('#moduleSidebar .ds-snav__list, #moduleSidebar ol, #moduleSidebar ul'); return l?Math.round(l.getBoundingClientRect().height):null; })(),
      errors: window.__log.errors, rej: window.__log.rejections };
  })()`);
  out.push({ ...c, ...r });
  if (c.w === 1280 && c.h === 900 && c.pg === "modules/architect-05") {
    const sh = await P.s("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`${S}/D6-${TAG}-architect05-1280x900.png`, Buffer.from(sh.data, "base64"));
  }
  await P.close();
}
// К9: «схожий на залогіненого» — атрибут не має ставитись
for (const [w, h, pg] of [[1280, 900, "modules/module-05"], [1280, 900, "modules/architect-05"], [1440, 900, "modules/architect-05"]]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CLS_PROBE + CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(w, h);
  await P.goto(`${BASE}/${pg}`);
  await sleep(3000);
  out.push({ w, h, pg, note: "К9 схожий на залогіненого", ...(await P.eval(`(function(){
    var f=document.querySelector('footer'); var s=document.getElementById('moduleSidebar'); var cs=s?getComputedStyle(s):null;
    return { cls:+window.__cls.value.toFixed(4), gateAttr: document.documentElement.getAttribute('data-aia-gate'),
      hasAttr: document.documentElement.hasAttribute('data-aia-gate'), gate: !!document.getElementById('aiaGate'),
      footerNow: f?Math.round(f.getBoundingClientRect().top):null, snavNow: s?Math.round(s.getBoundingClientRect().height):null,
      snavMinHeight: cs?cs.minHeight:null, innerH: window.innerHeight, errors: window.__log.errors };
  })()`)) });
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
