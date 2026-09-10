// КОЛО 2 · кільце фокуса САМЕ на .ds-tbl__wrap--tall (елемент, якому фікс змінив маску).
// Справжній Tab; знімок рамки з полем 8 px; далі — пікселі (кільце = box-shadow 2+4 px, rgb(139,166,235) ≈ 165).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
for (const [w, h] of [[390, 844], [1024, 800]]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(w, h, w < 700);
  await P.goto(`${BASE}/claude-code-ref-settings`);
  await waitFor(P, "document.fonts.status==='loaded'", 15000); await sleep(700);
  const prep = await P.eval(`(function(){
    var FOC='a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    var all=[].filter.call(document.querySelectorAll(FOC), function(e){var r=e.getBoundingClientRect();return r.width>0||r.height>0;});
    var idx=-1;
    all.forEach(function(e,i){ if(idx>=0) return; if(e.classList.contains('ds-tbl__wrap--tall')){ idx=i; window.__t=e; } });
    if(idx<0) return {found:false};
    window.__t.scrollIntoView({block:'start'}); window.scrollBy(0,-60);
    if(idx>0) all[idx-1].focus();
    return {found:true, idx:idx, prev: all[idx-1] ? all[idx-1].tagName : '-'};
  })()`);
  await sleep(250); await key(P, "Tab", "Tab", 9); await sleep(400);
  const st = await P.eval(`(function(){ var a=document.activeElement; var cs=getComputedStyle(a); var r=a.getBoundingClientRect();
    return { isTall: a===window.__t, cls: (a.className||'').slice(0,32), boxShadow: cs.boxShadow, fade: a.getAttribute('data-scroll-fade'),
      role: a.getAttribute('role'), tabindex: a.getAttribute('tabindex'), label: a.getAttribute('aria-label'),
      px: Math.round(r.left+window.scrollX), py: Math.round(r.top+window.scrollY), w: Math.round(r.width), h: Math.round(r.height),
      sl: Math.round(a.scrollLeft), stMax: a.scrollHeight-a.clientHeight }; })()`);
  if (st.isTall) {
    const hh = Math.min(st.h, 300) + 16;
    const sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: st.px - 8, y: st.py - 8, width: st.w + 16, height: hh, scale: 1 } });
    fs.writeFileSync(`${S}/r2-ring-tall-${w}.png`, Buffer.from(sh.data, "base64"));
    // стрілки: ← → всередині --tall
    for (let i = 0; i < 5; i++) await key(P, "ArrowRight", "ArrowRight", 39);
    await sleep(300);
    st.afterArrows = await P.eval(`({ sl: Math.round(document.activeElement.scrollLeft), max: document.activeElement.scrollWidth-document.activeElement.clientWidth, fade: document.activeElement.getAttribute('data-scroll-fade') })`);
    for (let i = 0; i < 3; i++) await key(P, "ArrowDown", "ArrowDown", 40);
    await sleep(300);
    st.afterDown = await P.eval(`({ stop: Math.round(document.activeElement.scrollTop) })`);
  }
  out[w] = { prep, st, log: await P.eval(`({errors: window.__log.errors, rej: window.__log.rejections})`) };
  await P.close();
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2d.out.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close();
