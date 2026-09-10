import { browser, sleep } from "./qcdp.mjs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const P = await b.page();
await P.inject(`
  window.__f = []; window.__dcl = null;
  document.addEventListener('DOMContentLoaded', function(){ window.__dcl = Math.round(performance.now()); });
  (function tick(){
    try {
      var ls = document.querySelectorAll('.rm-hl__in');
      if (ls.length) {
        var m = document.getElementById('main');
        window.__f.push({ t: Math.round(performance.now()),
          y: [].map.call(ls, function(e){ var m2=new DOMMatrixReadOnly(getComputedStyle(e).transform); return Math.round(m2.m42); }),
          op: [].map.call(ls, function(e){ return getComputedStyle(e).opacity; })[0],
          mainOp: m ? getComputedStyle(m).opacity : null });
      }
    } catch(e){}
    if (window.__f.length < 90) requestAnimationFrame(tick);
  })();`);
await P.viewport(1280, 900);
await P.goto(`${BASE}/roadmap`);
await sleep(2500);
console.log(JSON.stringify(await P.eval(`({ dcl: window.__dcl, n: window.__f.length,
  head: window.__f.slice(0,4), mid: window.__f.filter(function(f,i){return i%10===0}).slice(0,8), tail: window.__f.slice(-2),
  distinctMain: Array.from(new Set(window.__f.map(function(f){return f.mainOp}))) })`), null, 1));
await P.close(); b.close();
