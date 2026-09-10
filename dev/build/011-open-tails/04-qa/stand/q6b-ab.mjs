// A/B: база b3cb15e (8322) проти робочого дерева (8321) — чи саме резерв закриває зсув.
import { browser, sleep, waitFor, CLS_PROBE, CONSOLE_PROBE } from "./qcdp.mjs";
const b = await browser();
const PROBE = `try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}` + CLS_PROBE + CONSOLE_PROBE + `
  window.__gateAt=null; window.__cfgAt=null; window.__authAt=null; window.__footerAtGate=null; window.__snavAtGate=null;
  document.addEventListener('aia:auth', function(){ if(window.__authAt==null) window.__authAt=Math.round(performance.now()); });
  document.addEventListener('aia:config-ready', function(){ if(window.__cfgAt==null) window.__cfgAt=Math.round(performance.now()); });
  (function poll(){ var g=document.getElementById&&document.getElementById('aiaGate');
    if(g){ window.__gateAt=Math.round(performance.now());
      var f=document.querySelector('footer'); var s=document.getElementById('moduleSidebar');
      window.__footerAtGate=f?Math.round(f.getBoundingClientRect().top):null;
      window.__snavAtGate=s?Math.round(s.getBoundingClientRect().height):null; return; }
    if(performance.now()<15000) setTimeout(poll,2); })();`;
const out = [];
for (const [tag, base] of [["БАЗА b3cb15e", "http://127.0.0.1:8322"], ["ПІСЛЯ (дерево)", "http://127.0.0.1:8321"]]) {
  for (const [w, h, pg, mode] of [
    [1280, 900, "modules/architect-05.html", "гість"],
    [1280, 900, "modules/module-05.html", "гість"],
    [1280, 900, "modules/claude-code-08.html", "гість"],
    [1440, 900, "modules/claude-code-08.html", "гість"],
    [390, 844, "modules/claude-code-08.html", "гість"],
    [768, 1024, "modules/claude-code-08.html", "гість"],
    [1280, 900, "modules/module-05.html", "залогінений-подібний"],
    [1280, 900, "modules/architect-05.html", "залогінений-подібний"],
    [1440, 900, "modules/architect-05.html", "залогінений-подібний"],
  ]) {
    const logged = mode !== "гість";
    const P = await b.page(logged ? { blocked: ["*supabase*"] } : {});
    await P.inject(PROBE + (logged ? `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}` : ""));
    await P.viewport(w, h, w < 700);
    await P.goto(`${base}/${pg}`);
    if (!logged) { await waitFor(P, "window.__authAt != null", 15000); await waitFor(P, "window.__cfgAt != null", 8000); }
    await sleep(2200);
    const r = await P.eval(`(function(){ var f=document.querySelector('footer'); var s=document.getElementById('moduleSidebar'); var cs=s?getComputedStyle(s):null;
      return { cls:+window.__cls.value.toFixed(4),
        footerShifts: window.__cls.entries.filter(function(e){return e.src.join(',').indexOf('FOOTER')>=0;}).map(function(e){return e.t+'ms v='+e.v;}),
        gateAt: window.__gateAt, footerAtGate: window.__footerAtGate, snavAtGate: window.__snavAtGate,
        footerNow: f?Math.round(f.getBoundingClientRect().top):null, snavNow: s?Math.round(s.getBoundingClientRect().height):null,
        minH: cs?cs.minHeight:null, attr: document.documentElement.getAttribute('data-aia-gate'), errors: window.__log.errors.length };
    })()`);
    out.push({ tag, w, h, pg, mode, ...r });
    await P.close();
  }
}
console.log(JSON.stringify(out, null, 1));
b.close();
