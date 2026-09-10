// КОЛО 2 · форма згасання на --tall у станах right і both: «після» проти «до» (правила зняті
// через CSSOM) проти «маскаOff». Смуга 150 px від правого краю; профіль по колонках рахує r2-profile.py.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const DROP_NEW = `(function(){var n=0;for(var i=0;i<document.styleSheets.length;i++){var ss=document.styleSheets[i],r;try{r=ss.cssRules}catch(e){continue}for(var j=r.length-1;j>=0;j--){var t=r[j].selectorText||'';if(t.indexOf('.ds-tbl__wrap--tall[data-scroll-fade')===0){ss.deleteRule(j);n++}}}return n})()`;
const MASK_OFF = `(function(){var st=document.createElement('style');st.textContent='.ds-tbl__wrap{mask-image:none !important;-webkit-mask-image:none !important;}';document.head.appendChild(st);return 1;})()`;
const b = await browser();
const out = [];
for (const [w, h] of [[390, 844], [1024, 800]]) {
  for (const variant of ["після", "до", "маскаOff"]) {
    const P = await b.page({ blocked: ["*supabase*"] });
    await P.inject(CONSOLE_PROBE);
    await P.viewport(w, h, w < 700);
    await P.goto(`${BASE}/claude-code-ref-settings`);
    await waitFor(P, "document.fonts.status==='loaded'", 15000); await sleep(600);
    const dropped = variant === "до" ? await P.eval(DROP_NEW) : (variant === "маскаOff" ? await P.eval(MASK_OFF) : 0);
    await sleep(250);
    for (const st of ["right", "both"]) {
      const g = await P.eval(`(function(){ var el=document.querySelectorAll('.ds-tbl__wrap--tall')[0];
        var max=el.scrollWidth-el.clientWidth; el.scrollTop=0;
        el.scrollLeft = ${JSON.stringify(st)}==='right' ? 0 : Math.round(max/2);
        var r=el.getBoundingClientRect(); window.scrollTo(0, Math.round(r.top+window.scrollY-40)); return 1; })()`);
      await sleep(400);
      const q = await P.eval(`(function(){ var el=document.querySelectorAll('.ds-tbl__wrap--tall')[0]; var r=el.getBoundingClientRect();
        return { px:Math.round(r.left+window.scrollX), py:Math.round(r.top+window.scrollY), w:Math.round(r.width), h:Math.round(r.height),
          fade: el.getAttribute('data-scroll-fade'), mask: getComputedStyle(el).maskImage.replace(/\\s+/g,' ').slice(0,160) }; })()`);
      const sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: q.px + q.w - 150, y: q.py, width: 150, height: Math.min(q.h, 380), scale: 1 } });
      fs.writeFileSync(`${S}/r2-shape-${w}-${st}-${variant}.png`, Buffer.from(sh.data, "base64"));
      out.push({ w, state: st, variant, dropped, fade: q.fade, mask: q.mask });
    }
    await P.close();
  }
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2h.out.json", JSON.stringify(out, null, 1));
console.log("ok");
b.close();
