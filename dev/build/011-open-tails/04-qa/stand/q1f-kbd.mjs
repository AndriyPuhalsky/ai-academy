// Рішення 1, критерій 10: СПРАВЖНІЙ Tab на прокручувану обгортку + стрілки + кільце фокуса.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
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
for (const [w, pg] of [[1280, "claude-code-ref-hooks"], [390, "modules/claude-code-10"]]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "document.fonts.status==='loaded'", 12000); await sleep(700);
  const prep = await P.eval(`(function(){
    var FOC='a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    var all=[].filter.call(document.querySelectorAll(FOC), function(e){ var r=e.getBoundingClientRect(); return r.width>0||r.height>0; });
    var target=null, idx=-1;
    all.forEach(function(e,i){ if(target) return; if(e.matches('.ds-tbl__wrap, .ds-diag > pre.mermaid') && e.scrollWidth-e.clientWidth>1){ target=e; idx=i; } });
    if(!target) return { found:false, n: all.length };
    window.__t=target; target.scrollIntoView({block:'center'});
    if(idx>0) all[idx-1].focus();
    return { found:true, idx: idx, n: all.length, prevTag: idx>0?all[idx-1].tagName:'-', cls: target.className.slice(0,30), max: target.scrollWidth-target.clientWidth };
  })()`);
  if (!prep.found) { out[`${w}:${pg}`] = prep; await P.close(); continue; }
  await sleep(150);
  await key(P, "Tab", "Tab", 9);
  await sleep(250);
  const afterTab = await P.eval(`(function(){ var a=document.activeElement; var cs=getComputedStyle(a);
    return { isTarget: a===window.__t, tag: a.tagName, cls:(a.className||'').toString().slice(0,30),
      outline: cs.outlineWidth+' '+cs.outlineStyle+' '+cs.outlineColor, offset: cs.outlineOffset,
      sl: Math.round(a.scrollLeft), rect: (function(r){return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};})(a.getBoundingClientRect()) }; })()`);
  let arrows = null, shot = null;
  if (afterTab.isTarget) {
    const r = await P.eval(`(function(){var a=document.activeElement;var r=a.getBoundingClientRect();return {x:Math.round(r.left+window.scrollX-8),y:Math.round(r.top+window.scrollY-8),w:Math.round(r.width+16),h:Math.round(Math.min(r.height,260)+16)};})()`);
    await clipShot(P, `${S}/D1-focus-ring-${w}-${pg.replace(/\//g, "_")}.png`, Math.max(0, r.x), Math.max(0, r.y), r.w, r.h);
    shot = r;
    for (let i = 0; i < 5; i++) await key(P, "ArrowRight", "ArrowRight", 39);
    await sleep(400);
    arrows = await P.eval(`({ sl: Math.round(document.activeElement.scrollLeft), fade: document.activeElement.getAttribute('data-scroll-fade') })`);
  }
  out[`${w}:${pg}`] = { prep, afterTab, arrows, shot };
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
