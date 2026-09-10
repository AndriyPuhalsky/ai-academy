// Поза обсягом: чи встигає ранній замок до першого кадру ВМІСТУ уроку на десктопі.
import { browser, sleep, waitFor } from "./qcdp.mjs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const out = [];
const PROBE = `try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}
  window.__fcp=null; window.__atFcp=null; window.__gateAt=null;
  try{ new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ if(e.name==='first-contentful-paint'&&window.__fcp==null){ window.__fcp=Math.round(e.startTime);
    var m=document.getElementById('main');
    window.__atFcp = m ? { дітей: m.children.length, схованих: [].filter.call(m.children,function(c){return c.hidden}).length,
      замок: !!document.getElementById('aiaGate'),
      висотаВидимого: [].filter.call(m.children,function(c){return !c.hidden}).reduce(function(a,c){return a+Math.round(c.getBoundingClientRect().height)},0) } : '#main ще немає'; } }); }).observe({type:'paint',buffered:true}); }catch(e){}
  (function poll(){ if(document.getElementById&&document.getElementById('aiaGate')){ window.__gateAt=Math.round(performance.now()); return; } if(performance.now()<15000) setTimeout(poll,2); })();`;
for (const [w, h, pg] of [[1280, 900, "modules/architect-05"], [1280, 900, "modules/claude-code-08"], [390, 844, "modules/claude-code-08"], [1280, 900, "modules/module-05"]]) {
  for (let run = 0; run < 2; run++) {
    const P = await b.page();
    await P.inject(PROBE);
    await P.viewport(w, h, w < 700);
    await P.goto(`${BASE}/${pg}`);
    await waitFor(P, "!!document.getElementById('aiaGate')", 15000);
    await sleep(600);
    out.push({ w, h, pg, run, ...(await P.eval(`({ fcp: window.__fcp, gateAt: window.__gateAt, atFcp: window.__atFcp })`)) });
    await P.close();
  }
}
console.log(JSON.stringify(out, null, 1));
b.close();
