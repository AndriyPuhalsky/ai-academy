import { browser, sleep, waitFor, CONSOLE_PROBE, CLS_PROBE } from "./qcdp.mjs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const out = {};
for (const w of [1440, 1024, 390]) {
  const P = await b.page();
  await P.inject(CONSOLE_PROBE + CLS_PROBE);
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/roadmap`);
  await waitFor(P, "document.querySelectorAll('.rm-entry, .rm-row').length>0", 15000);
  await sleep(1200);
  out[w] = await P.eval(`(function(){
    var hits=[].filter.call(document.querySelectorAll('*'), function(e){ return e.children.length===0 && /Усі платформи/.test(e.textContent); });
    var info = hits.map(function(e){
      var r=document.createRange(); r.selectNodeContents(e);
      var b=e.getBoundingClientRect(); var cs=getComputedStyle(e);
      return { cls:(e.className||e.tagName).toString().slice(0,26), rects:r.getClientRects().length,
        h:Math.round(b.height), w:Math.round(b.width), lh:cs.lineHeight, txt:e.textContent.trim().slice(0,24) };
    });
    var byLines={}; info.forEach(function(i){ byLines[i.rects]=(byLines[i.rects]||0)+1; });
    // з чого складається CLS
    return { n: hits.length, byLines: byLines, sample: info.slice(0,3),
      maxH: info.reduce(function(a,i){return Math.max(a,i.h)},0),
      cls: +window.__cls.value.toFixed(4), entries: window.__cls.entries.slice(0,6) };
  })()`);
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
