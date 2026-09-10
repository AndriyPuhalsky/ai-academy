// КОЛО 2 · (а) прохід по ширинах 360…1200: чи всюди видно вертикальний повзунок у --tall
//           (стан right, маска як задеплоєно); (б) чи їде повзунок при scrollTop = 0 / max.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = [];
for (const w of [360, 500, 700, 900, 1100, 1200]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(w, 800, w < 700);
  await P.goto(`${BASE}/claude-code-ref-settings`);
  await waitFor(P, "document.fonts.status==='loaded'", 15000); await sleep(600);
  const g = await P.eval(`(function(){ var el=document.querySelectorAll('.ds-tbl__wrap--tall')[0];
    el.scrollTop=0; el.scrollLeft=0; var r=el.getBoundingClientRect(); window.scrollTo(0, Math.round(r.top+window.scrollY-40));
    var r2=el.getBoundingClientRect(); var cs=getComputedStyle(el);
    return { px:Math.round(r2.left+window.scrollX), py:Math.round(r2.top+window.scrollY), w:Math.round(r2.width), h:Math.round(r2.height),
      fade: el.getAttribute('data-scroll-fade'), hscroll: el.scrollWidth-el.clientWidth, vscroll: el.scrollHeight-el.clientHeight,
      hasTallRule: (cs.maskImage||'').indexOf('12px')>0 }; })()`);
  await sleep(250);
  let sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: g.px + g.w - 20, y: g.py, width: 20, height: Math.min(g.h, 380), scale: 1 } });
  fs.writeFileSync(`${S}/r2-sweep-${w}-top.png`, Buffer.from(sh.data, "base64"));
  await P.eval(`(function(){var el=document.querySelectorAll('.ds-tbl__wrap--tall')[0]; el.scrollTop = el.scrollHeight;})()`);
  await sleep(400);
  sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: g.px + g.w - 20, y: g.py, width: 20, height: Math.min(g.h, 380), scale: 1 } });
  fs.writeFileSync(`${S}/r2-sweep-${w}-bottom.png`, Buffer.from(sh.data, "base64"));
  out.push({ w, ...g, log: await P.eval(`({e: window.__log.errors.length, r: window.__log.rejections.length})`) });
  await P.close();
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2i.out.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.map(x => ({ w: x.w, fade: x.fade, h: x.hscroll, v: x.vscroll, tallRule: x.hasTallRule, box: [x.w, x.h], log: x.log })), null, 1));
b.close();
