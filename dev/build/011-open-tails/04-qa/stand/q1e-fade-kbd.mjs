// Рішення 1, критерії 4 (гасіння), 10 (клавіатура), 11 (контраст на трьох фонах), 12 (консоль).
import { browser, sleep, waitFor, CONSOLE_PROBE, contrast } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const SEL = ".ds-tbl__wrap, .ds-diag > pre.mermaid, .term > .term__body, .ds-code > .ds-code__pre, .ds-prose > .ds-code__pre, .ds-prose > section > .ds-code__pre";
const b = await browser();
const out = {};
async function key(P, k, code, vk) {
  for (const type of ["keyDown", "keyUp"])
    await P.s("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
}
async function clipShot(P, path, x, y, w, h) {
  const r = await P.s("Page.captureScreenshot", { format: "png", clip: { x, y, width: w, height: h, scale: 1 } });
  fs.writeFileSync(path, Buffer.from(r.data, "base64"));
}
for (const [w, pg] of [[390, "modules/claude-code-10"], [1280, "claude-code-ref-hooks"]]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')})&&document.fonts.status==='loaded';})()", 20000);
  await sleep(600);
  // 4) гасіння: початок → середина → кінець на першому скролері
  const fade = await P.eval(`(function(){
    var el=[].filter.call(document.querySelectorAll(${JSON.stringify(SEL)}), function(e){return e.scrollWidth-e.clientWidth>1})[0];
    window.__f=el; var res=[]; var max=el.scrollWidth-el.clientWidth;
    el.scrollLeft=0; res.push(el.getAttribute('data-scroll-fade'));
    return { first: res[0], max: max, cls: el.className.slice(0,30) };
  })()`);
  await sleep(250);
  await P.eval(`window.__f.scrollLeft = Math.round((window.__f.scrollWidth-window.__f.clientWidth)/2)`); await sleep(300);
  const midFade = await P.eval(`window.__f.getAttribute('data-scroll-fade')`);
  await P.eval(`window.__f.scrollLeft = window.__f.scrollWidth`); await sleep(300);
  const endFade = await P.eval(`window.__f.getAttribute('data-scroll-fade')`);
  await P.eval(`window.__f.scrollLeft = 0`); await sleep(250);
  const backFade = await P.eval(`window.__f.getAttribute('data-scroll-fade')`);
  // 10) клавіатура: фокус на обгортці таблиці + стрілки
  const kb0 = await P.eval(`(function(){
    var el=document.querySelector('.ds-tbl__wrap[tabindex], .ds-tbl__wrap[role="region"]');
    if(!el) return null; el.scrollIntoView({block:'center'}); el.focus();
    return { tabindex: el.getAttribute('tabindex'), role: el.getAttribute('role'), label: el.getAttribute('aria-label')||el.getAttribute('aria-labelledby'),
             active: document.activeElement===el, outline: getComputedStyle(el, ':focus-visible').outlineWidth, sl: el.scrollLeft, max: el.scrollWidth-el.clientWidth };
  })()`);
  let kb1 = null;
  if (kb0 && kb0.active) {
    await key(P, "ArrowRight", "ArrowRight", 39); await key(P, "ArrowRight", "ArrowRight", 39); await key(P, "ArrowRight", "ArrowRight", 39);
    await sleep(300);
    kb1 = await P.eval(`(function(){ var el=document.activeElement; return { sl: Math.round(el.scrollLeft), tag: el.tagName, cls: (el.className||'').slice(0,24), outlineNow: getComputedStyle(el).outlineWidth + ' ' + getComputedStyle(el).outlineStyle }; })()`);
    const r = await P.eval(`(function(){var el=document.activeElement; var r=el.getBoundingClientRect(); return {x:Math.round(r.left+window.scrollX-6),y:Math.round(r.top+window.scrollY-6),w:Math.round(r.width+12),h:Math.round(Math.min(r.height,300)+12)};})()`);
    await clipShot(P, `${S}/D1-focus-${w}-${pg.replace(/\//g, "_")}.png`, Math.max(0, r.x), Math.max(0, r.y), r.w, r.h);
  }
  // 11) фони трьох типів контейнерів
  const bgs = await P.eval(`(function(){
    function bg(sel){ var e=document.querySelector(sel); if(!e) return null;
      var n=e, c='rgba(0, 0, 0, 0)';
      while(n && n!==document.documentElement){ var v=getComputedStyle(n).backgroundColor; if(v && v!=='rgba(0, 0, 0, 0)'){ c=v; break; } n=n.parentNode; }
      return { sel: sel, bg: c, from: n===document.documentElement?'html':(n.className||n.tagName).toString().slice(0,24) }; }
    return [bg('.ds-tbl__wrap'), bg('.term > .term__body'), bg('.ds-diag > pre.mermaid'), bg('.ds-code > .ds-code__pre')].filter(Boolean);
  })()`);
  const log = await P.eval(`({errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections})`);
  out[`${w}:${pg}`] = { fade: { start: fade.first, mid: midFade, end: endFade, back: backFade, cls: fade.cls, max: fade.max }, kb0, kb1, bgs, log };
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
