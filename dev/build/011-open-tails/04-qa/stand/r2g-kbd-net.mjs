// КОЛО 2 · (а) клавіатура на скролері-діаграмі /modules/claude-code-10 @390 — числа кола 1 (q1f: sl 738 → 938);
//           (б) мережа БЕЗ власного блокування: чи справді єдиний loadingFailed кола 1 — це блок *supabase*.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
{ // (а)
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(390, 900, true);
  await P.goto(`${BASE}/modules/claude-code-10`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')})&&document.fonts.status==='loaded';})()", 25000);
  await sleep(800);
  const prep = await P.eval(`(function(){
    var FOC='a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    var all=[].filter.call(document.querySelectorAll(FOC), function(e){var r=e.getBoundingClientRect();return r.width>0||r.height>0;});
    var idx=-1; all.forEach(function(e,i){ if(idx<0 && e.matches('.ds-tbl__wrap, .ds-diag > pre.mermaid, .ds-diag pre, .term > .term__body') && e.scrollWidth-e.clientWidth>1){ idx=i; window.__t=e; } });
    if(idx<0) return {found:false, n: all.length};
    window.__t.scrollIntoView({block:'center'}); if(idx>0) all[idx-1].focus();
    return {found:true, idx:idx, n:all.length, cls:(window.__t.className||'').toString().slice(0,24), tag: window.__t.tagName, max: window.__t.scrollWidth-window.__t.clientWidth, sl0: Math.round(window.__t.scrollLeft)};
  })()`);
  await sleep(200); await key(P, "Tab", "Tab", 9); await sleep(300);
  const afterTab = await P.eval(`(function(){var a=document.activeElement;var cs=getComputedStyle(a);var r=a.getBoundingClientRect();
    return { isTarget: a===window.__t, tag:a.tagName, cls:(a.className||'').toString().slice(0,24), boxShadow: cs.boxShadow,
      sl: Math.round(a.scrollLeft), fade: a.getAttribute('data-scroll-fade'),
      px: Math.round(r.left+window.scrollX), py: Math.round(r.top+window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };})()`);
  let arrows = null;
  if (afterTab.isTarget) {
    const sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, afterTab.px - 8), y: afterTab.py - 8, width: afterTab.w + 16, height: Math.min(afterTab.h, 260) + 16, scale: 1 } });
    fs.writeFileSync(`${S}/r2-ring-cc10-390.png`, Buffer.from(sh.data, "base64"));
    for (let i = 0; i < 5; i++) await key(P, "ArrowRight", "ArrowRight", 39);
    await sleep(300);
    arrows = await P.eval(`({ sl: Math.round(document.activeElement.scrollLeft), fade: document.activeElement.getAttribute('data-scroll-fade') })`);
  }
  out.kbd = { prep, afterTab, arrows, log: await P.eval(`({errors: window.__log.errors, rej: window.__log.rejections})`) };
  await P.close();
}
for (const [w, pg] of [[390, "claude-code-ref-settings"], [1280, "claude-code-ref-hooks"]]) { // (б) без блокування
  const P = await b.page({});
  await P.inject(CONSOLE_PROBE);
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "document.fonts.status==='loaded'", 15000); await sleep(2000);
  out[`net:${w}:${pg}`] = {
    requests: P.net.length,
    bad: P.net.filter(x => x.status >= 400 || x.status === 0).map(x => x.status + " " + (x.err || "") + " " + x.url.slice(0, 90)),
    statuses: P.net.reduce((a, x) => (a[x.status] = (a[x.status] || 0) + 1, a), {}),
    log: await P.eval(`({errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections})`),
    blogErrors: P.browserLog.filter(x => x.level === "error").map(x => x.text.slice(0, 140))
  };
  await P.close();
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2g.out.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close();
