// Критерій 10 (продовження): кільце фокуса = box-shadow. Чи не гасить його маска §41 на краях.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
async function clipShot(P, path, x, y, w, h) { const r = await P.s("Page.captureScreenshot", { format: "png", clip: { x, y, width: w, height: h, scale: 1 } }); fs.writeFileSync(path, Buffer.from(r.data, "base64")); }
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/claude-code-ref-hooks`);
  await waitFor(P, "document.fonts.status==='loaded'", 12000); await sleep(600);
  const prep = await P.eval(`(function(){
    var FOC='a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    var all=[].filter.call(document.querySelectorAll(FOC), function(e){var r=e.getBoundingClientRect();return r.width>0||r.height>0;});
    var idx=-1;
    all.forEach(function(e,i){ if(idx>=0) return; if(e.matches('.ds-tbl__wrap') && e.scrollWidth-e.clientWidth>1 && e.getBoundingClientRect().height<600){ idx=i; window.__t=e; } });
    if(idx<0) return {found:false};
    window.__t.scrollIntoView({block:'center'});
    all[idx-1].focus();
    return {found:true, idx:idx, h: Math.round(window.__t.getBoundingClientRect().height)};
  })()`);
  out.prep = prep;
  if (prep.found) {
    await sleep(200); await key(P, "Tab", "Tab", 9); await sleep(350);
    const st = await P.eval(`(function(){var a=document.activeElement;var cs=getComputedStyle(a);
      var r=a.getBoundingClientRect();
      return { isTarget:a===window.__t, boxShadow: cs.boxShadow, mask: (cs.maskImage||'').slice(0,90), fade: a.getAttribute('data-scroll-fade'),
        px: Math.round(r.left+window.scrollX), py: Math.round(r.top+window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };})()`);
    out.focus = st;
    if (st.isTarget) {
      await clipShot(P, `${S}/D1-focus-ring-left.png`, st.px - 10, st.py - 10, 60, st.h + 20);
      await clipShot(P, `${S}/D1-focus-ring-right.png`, st.px + st.w - 50, st.py - 10, 60, st.h + 20);
      await clipShot(P, `${S}/D1-focus-ring-full.png`, st.px - 10, st.py - 10, st.w + 20, st.h + 20);
    }
  }
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
