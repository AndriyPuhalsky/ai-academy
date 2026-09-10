import { browser, sleep, waitFor } from "./qcdp.mjs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const out = {};
for (const w of [1440, 1024, 390]) {
  const P = await b.page();
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/roadmap`);
  await waitFor(P, "document.querySelectorAll('.rm-row').length>0", 15000);
  await sleep(1000);
  out[w] = await P.eval(`(function(){
    var plats=[].slice.call(document.querySelectorAll('.rm-row__plat'));
    var info=plats.map(function(e){
      var tn=[].filter.call(e.childNodes,function(n){return n.nodeType===3 && n.textContent.trim();})[0];
      var lines=null, txt='';
      if(tn){ var r=document.createRange(); r.selectNodeContents(tn); lines=r.getClientRects().length; txt=tn.textContent.trim(); }
      var bb=e.getBoundingClientRect(); var cs=getComputedStyle(e);
      return { txt: txt, lines: lines, h: Math.round(bb.height), w: Math.round(bb.width), lh: cs.lineHeight, ws: cs.whiteSpace };
    });
    var byTxt={}; info.forEach(function(i){ byTxt[i.txt]=(byTxt[i.txt]||0)+1; });
    var both=info.filter(function(i){return i.txt==='Усі платформи';});
    var multiline=both.filter(function(i){return i.lines>1;});
    return { total: plats.length, byTxt: byTxt, bothN: both.length,
      bothLines: Array.from(new Set(both.map(function(i){return i.lines;}))),
      bothH: Array.from(new Set(both.map(function(i){return i.h;}))),
      bothW: Array.from(new Set(both.map(function(i){return i.w;}))),
      multiline: multiline.length, sample: both.slice(0,2) };
  })()`);
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
