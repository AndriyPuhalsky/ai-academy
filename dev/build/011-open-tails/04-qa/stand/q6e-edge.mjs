// Межа резерву: 1023 (шторка) проти 1024 (у потоці) — і дуже високе вікно.
import { browser, sleep, waitFor, CLS_PROBE, CONSOLE_PROBE } from "./qcdp.mjs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const out = [];
const PROBE = `try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}` + CLS_PROBE + CONSOLE_PROBE + `
  window.__gateAt=null; window.__footerAtGate=null; window.__snavAtGate=null; window.__cfgAt=null;
  document.addEventListener('aia:config-ready', function(){ if(window.__cfgAt==null) window.__cfgAt=Math.round(performance.now()); });
  (function poll(){ var g=document.getElementById&&document.getElementById('aiaGate');
    if(g){ window.__gateAt=Math.round(performance.now()); var f=document.querySelector('footer'); var s=document.getElementById('moduleSidebar');
      window.__footerAtGate=f?Math.round(f.getBoundingClientRect().top):null; window.__snavAtGate=s?Math.round(s.getBoundingClientRect().height):null; return; }
    if(performance.now()<15000) setTimeout(poll,2); })();`;
for (const [w, h, pg] of [[1023, 900, "modules/architect-05"], [1024, 900, "modules/architect-05"], [1280, 2000, "modules/module-05"], [1280, 701, "modules/architect-05"], [1280, 700, "modules/architect-05"]]) {
  const P = await b.page();
  await P.inject(PROBE);
  await P.viewport(w, h, false);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "window.__cfgAt != null", 15000);
  await sleep(1500);
  out.push({ w, h, pg, ...(await P.eval(`(function(){ var f=document.querySelector('footer'); var s=document.getElementById('moduleSidebar'); var cs=getComputedStyle(s);
    return { cls:+window.__cls.value.toFixed(4), attr: document.documentElement.getAttribute('data-aia-gate'),
      minH: cs.minHeight, maxH: cs.maxHeight, position: cs.position, transform: cs.transform.slice(0,26),
      footerAtGate: window.__footerAtGate, footerNow: Math.round(f.getBoundingClientRect().top),
      snavAtGate: window.__snavAtGate, snavNow: Math.round(s.getBoundingClientRect().height),
      footerShifts: window.__cls.entries.filter(function(e){return e.src.join(',').indexOf('FOOTER')>=0;}).map(function(e){return e.v;}),
      errors: window.__log.errors.length }; })()`)) });
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
