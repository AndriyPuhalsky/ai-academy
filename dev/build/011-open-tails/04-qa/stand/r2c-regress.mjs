// КОЛО 2 · регресія решти пʼяти скролерів після d7ec232.
// Числа звіряються з колом 1 (q1.out.json, q1e.out.json, q1g.out.json).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
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
      hscroll: e.scrollWidth - e.clientWidth > 1, vscroll: e.scrollHeight - e.clientHeight > 1,
      hbar: Math.round(e.offsetHeight - bt - bb - e.clientHeight),
      vbar: Math.round(e.offsetWidth - bl - br - e.clientWidth),
      sbColor: cs.scrollbarColor };
  });
  var colors = {}; rows.forEach(function(r){ colors[r.sbColor] = (colors[r.sbColor]||0)+1; });
  return { total: rows.length, hscrollers: rows.filter(function(r){return r.hscroll}).length,
    vscrollers: rows.filter(function(r){return r.vscroll}).length,
    badH: rows.filter(function(r){ return (r.hscroll ? r.hbar !== 12 : r.hbar !== 0); }).map(function(r){return {cls:r.cls,hscroll:r.hscroll,hbar:r.hbar}}),
    badV: rows.filter(function(r){ return (r.vscroll ? r.vbar !== 12 : r.vbar !== 0); }).map(function(r){return {cls:r.cls,vscroll:r.vscroll,vbar:r.vbar}}),
    sbColors: colors, pageHScroll: document.documentElement.scrollWidth - window.innerWidth, innerWidth: window.innerWidth };
})()`;
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
const PAGES = [[1280, "claude-code-ref-hooks"], [390, "modules/claude-code-10"], [1280, "claude-code-ref-settings"], [1024, "claude-code-ref-settings"], [640, "claude-code-ref-settings"], [390, "claude-code-ref-settings"]];
for (const [w, pg] of PAGES) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')})&&document.fonts.status==='loaded';})()", 20000);
  await sleep(700);
  const m = await P.eval(MEASURE);
  // цикл гасіння на першому горизонтальному скролері (не --tall)
  const fade = await P.eval(`(function(){
    var el = [].filter.call(document.querySelectorAll(${JSON.stringify(SEL)}), function(e){ return e.scrollWidth-e.clientWidth>1 && !e.classList.contains('ds-tbl__wrap--tall'); })[0];
    if(!el) return null; window.__f = el; el.scrollLeft = 0;
    return { cls: el.className.slice(0,30), max: el.scrollWidth - el.clientWidth, start: el.getAttribute('data-scroll-fade') }; })()`);
  let cycle = null;
  if (fade) {
    await sleep(250);
    await P.eval(`window.__f.scrollLeft = Math.round((window.__f.scrollWidth-window.__f.clientWidth)/2)`); await sleep(300);
    const mid = await P.eval(`window.__f.getAttribute('data-scroll-fade')`);
    await P.eval(`window.__f.scrollLeft = window.__f.scrollWidth`); await sleep(300);
    const end = await P.eval(`window.__f.getAttribute('data-scroll-fade')`);
    await P.eval(`window.__f.scrollLeft = 0`); await sleep(250);
    const back = await P.eval(`window.__f.getAttribute('data-scroll-fade')`);
    cycle = { start: fade.start, mid, end, back, cls: fade.cls, max: fade.max,
      maskMid: await P.eval(`(function(){window.__f.scrollLeft=Math.round((window.__f.scrollWidth-window.__f.clientWidth)/2);return getComputedStyle(window.__f).maskImage.replace(/\\s+/g,' ').slice(0,120);})()`) };
    await P.eval(`window.__f.scrollLeft = 0`); await sleep(200);
  }
  // Tab + стрілки + кільце фокуса пікселями
  const prep = await P.eval(`(function(){
    var FOC='a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    var all=[].filter.call(document.querySelectorAll(FOC), function(e){var r=e.getBoundingClientRect();return r.width>0||r.height>0;});
    var idx=-1;
    all.forEach(function(e,i){ if(idx>=0) return; if(e.matches('.ds-tbl__wrap, .ds-diag > pre.mermaid') && e.scrollWidth-e.clientWidth>1 && e.getBoundingClientRect().height<600){ idx=i; window.__t=e; } });
    if(idx<0) return {found:false};
    window.__t.scrollIntoView({block:'center'}); if(idx>0) all[idx-1].focus();
    return {found:true, idx:idx, cls: window.__t.className.slice(0,32), tall: window.__t.classList.contains('ds-tbl__wrap--tall')};
  })()`);
  let ring = null, arrows = null;
  if (prep.found) {
    await sleep(200); await key(P, "Tab", "Tab", 9); await sleep(350);
    ring = await P.eval(`(function(){ var a=document.activeElement; var cs=getComputedStyle(a); var r=a.getBoundingClientRect();
      return { isTarget:a===window.__t, boxShadow: cs.boxShadow, fade: a.getAttribute('data-scroll-fade'),
        px: Math.round(r.left+window.scrollX), py: Math.round(r.top+window.scrollY), w: Math.round(r.width), h: Math.round(r.height), sl0: Math.round(a.scrollLeft) }; })()`);
    if (ring.isTarget) {
      const sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: ring.px - 8, y: ring.py - 8, width: ring.w + 16, height: Math.min(ring.h, 300) + 16, scale: 1 } });
      fs.writeFileSync(`${S}/r2-ring-${w}-${pg.replace(/\//g, "_")}.png`, Buffer.from(sh.data, "base64"));
      for (let i = 0; i < 5; i++) await key(P, "ArrowRight", "ArrowRight", 39);
      await sleep(350);
      arrows = await P.eval(`({ sl: Math.round(document.activeElement.scrollLeft), max: document.activeElement.scrollWidth - document.activeElement.clientWidth })`);
    }
  }
  const log = await P.eval(`({errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections})`);
  out[`${w}:${pg}`] = { measure: m, cycle, prep, ring, arrows, log,
    net: P.net.filter(x => x.status >= 400 || (x.status === 0 && !/supabase/.test(x.url))).map(x => x.status + " " + x.url.slice(0, 70)),
    blog: P.browserLog.filter(x => x.level === "error").map(x => x.text.slice(0, 120)) };
  await P.close();
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2c.out.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close();
