// Чи видно ВЕРТИКАЛЬНИЙ повзунок у .ds-tbl__wrap--tall — і чи не гасить його маска §41.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
for (const [w, tag] of [[1024, "1024"], [1280, "1280"]]) {
  for (const maskOff of [false, true]) {
    const P = await b.page({ blocked: ["*supabase*"] });
    await P.inject(CONSOLE_PROBE);
    await P.viewport(w, 800);
    await P.goto(`${BASE}/claude-code-ref-settings`);
    await waitFor(P, "document.fonts.status==='loaded'", 12000); await sleep(500);
    if (maskOff) await P.eval(`(function(){ var st=document.createElement('style'); st.textContent='.ds-tbl__wrap{mask-image:none !important;-webkit-mask-image:none !important;}'; document.head.appendChild(st); })()`);
    await sleep(300);
    const r = await P.eval(`(function(){
      var el=[].filter.call(document.querySelectorAll('.ds-tbl__wrap--tall'), function(e){return e.scrollHeight-e.clientHeight>1;})[0];
      if(!el) return null; window.__v=el; var r0=el.getBoundingClientRect();
      window.scrollBy(0, r0.top - 40); el.scrollTop = 0;
      var r1=el.getBoundingClientRect(); var cs=getComputedStyle(el);
      return { px: Math.round(r1.left+window.scrollX), py: Math.round(r1.top+window.scrollY), w: Math.round(r1.width), h: Math.round(r1.height),
        hscroll: el.scrollWidth-el.clientWidth, vscroll: el.scrollHeight-el.clientHeight,
        fade: el.getAttribute('data-scroll-fade'), mask: (cs.maskImage||'').slice(0,150) }; })()`);
    if (!r) { out[`${tag}:${maskOff}`] = null; await P.close(); continue; }
    await sleep(300);
    const sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: r.px + r.w - 20, y: r.py, width: 20, height: Math.min(r.h, 400), scale: 1 } });
    fs.writeFileSync(`${S}/D1-vbar-${tag}-${maskOff ? "маскаВимкнена" : "маскаУвімкнена"}.png`, Buffer.from(sh.data, "base64"));
    out[`${tag}:${maskOff ? "маскаВимкнена" : "маскаУвімкнена"}`] = r;
    await P.close();
  }
}
console.log(JSON.stringify(out, null, 1));
b.close();
