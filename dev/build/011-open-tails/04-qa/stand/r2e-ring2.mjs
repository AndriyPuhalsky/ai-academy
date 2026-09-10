// КОЛО 2 · контроль до знімка кільця: у r2d верхній край елемента опинявся ПІД липкою шапкою
// сторінки, і кільце там читалось приглушеним. Тут елемент відводиться на 200 px нижче краю
// вʼюпорта. Варіанти «після» (як задеплоєно) і «до» (два нові правила знято через CSSOM).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const DROP_NEW = `(function(){var n=0;for(var i=0;i<document.styleSheets.length;i++){var ss=document.styleSheets[i],r;try{r=ss.cssRules}catch(e){continue}for(var j=r.length-1;j>=0;j--){var t=r[j].selectorText||'';if(t.indexOf('.ds-tbl__wrap--tall[data-scroll-fade')===0){ss.deleteRule(j);n++}}}return n})()`;
const b = await browser();
const out = {};
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
for (const w of [390, 1024]) {
  for (const variant of ["після", "до"]) {
    const P = await b.page({ blocked: ["*supabase*"] });
    await P.inject(CONSOLE_PROBE);
    await P.viewport(w, w < 700 ? 844 : 800, w < 700);
    await P.goto(`${BASE}/claude-code-ref-settings`);
    await waitFor(P, "document.fonts.status==='loaded'", 15000); await sleep(700);
    const dropped = variant === "до" ? await P.eval(DROP_NEW) : 0;
    await P.eval(`(function(){
      var FOC='a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
      var all=[].filter.call(document.querySelectorAll(FOC), function(e){var r=e.getBoundingClientRect();return r.width>0||r.height>0;});
      var idx=-1; all.forEach(function(e,i){ if(idx<0 && e.classList.contains('ds-tbl__wrap--tall')){ idx=i; window.__t=e; } });
      window.__t.scrollIntoView({block:'start'}); if(idx>0) all[idx-1].focus(); return idx; })()`);
    await sleep(250); await key(P, "Tab", "Tab", 9); await sleep(350);
    // відвести елемент на 200 px нижче краю вʼюпорта (з-під липкої шапки)
    const g = await P.eval(`(function(){ var a=document.activeElement; var r=a.getBoundingClientRect();
      window.scrollBy(0, Math.round(r.top - 200)); var r2=a.getBoundingClientRect();
      var hdr=document.querySelector('header, .ds-hdr'); var hr=hdr?hdr.getBoundingClientRect():null;
      return { isTall: a.classList.contains('ds-tbl__wrap--tall'), boxShadow: getComputedStyle(a).boxShadow,
        vpTop: Math.round(r2.top), hdrBottom: hr?Math.round(hr.bottom):null,
        px: Math.round(r2.left+window.scrollX), py: Math.round(r2.top+window.scrollY), w: Math.round(r2.width), h: Math.round(r2.height),
        fade: a.getAttribute('data-scroll-fade') }; })()`);
    await sleep(200);
    const sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: g.px - 8, y: g.py - 8, width: g.w + 16, height: Math.min(g.h, 260) + 16, scale: 1 } });
    fs.writeFileSync(`${S}/r2-ring2-${w}-${variant}.png`, Buffer.from(sh.data, "base64"));
    out[`${w}:${variant}`] = { dropped, ...g };
    await P.close();
  }
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2e.out.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close();
