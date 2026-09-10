// Гість на заблокованому уроці після синхронного замка: коли зʼявляється, CLS, і що після «входу».
import { browser, sleep, waitFor, CLS_PROBE } from "./cdp.mjs";
const BASE = process.env.BASE || "http://127.0.0.1:8311";
const S = process.env.S;
const b = await browser();
const out = { guest: [], first: [], loggedLike: [] };
const probe = `try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}` + CLS_PROBE + `
  window.__gate = null; window.__auth = null; window.__cfg = null; window.__fcp = null;
  try { new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ if(e.name==='first-contentful-paint') window.__fcp=Math.round(e.startTime); }); }).observe({type:'paint', buffered:true}); } catch(e){}
  document.addEventListener('aia:auth', function(){ if(window.__auth==null) window.__auth = Math.round(performance.now()); });
  document.addEventListener('aia:config-ready', function(){ if(window.__cfg==null) window.__cfg = Math.round(performance.now()); });
  (function poll(){ if (document.getElementById && document.getElementById('aiaGate')) { if(!window.__gate) window.__gate = Math.round(performance.now()); return; } setTimeout(poll, 2); })();`;
for (const [w, pg, bucket] of [[390, "modules/claude-code-08.html", "guest"], [390, "modules/claude-code-08.html", "guest"], [1280, "modules/architect-05.html", "guest"], [390, "modules/claude-code-01.html", "first"], [390, "modules/module-01.html", "first"]]) {
  const P = await b.page();
  await P.viewport(w, 900, w < 700);
  await P.inject(probe);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "window.__auth != null", 12000);
  await sleep(800);
  const r = await P.eval(`({ cls: +window.__cls.value.toFixed(4), entries: window.__cls.entries.slice(0,5), fcp: window.__fcp, gateAt: window.__gate, cfgAt: window.__cfg, authAt: window.__auth, gate: !!document.getElementById('aiaGate'), hiddenKids: [].filter.call(document.getElementById('main').children, function(c){return c.hidden}).length, mainKids: document.getElementById('main').children.length, footerTop: Math.round(document.querySelector('footer').getBoundingClientRect().top), gateText: (document.getElementById('aiaGate')||{}).textContent })`);
  out[bucket].push({ w, pg, ...r });
  if (bucket === "guest" && w === 390) await P.shot(`${S}/shots/t10-guest-gate-390.png`);
  await P.close();
}
// «схожий на залогіненого» (є ключ у сховищі, Supabase заблокований → hydrate не прийде): замок НЕ має ставитись
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.viewport(390, 844, true);
  await P.inject(probe + "try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}");
  await P.goto(`${BASE}/modules/claude-code-08.html`, 2500);
  out.loggedLike.push(await P.eval(`({ gate: !!document.getElementById('aiaGate'), gateAt: window.__gate, hiddenKids: [].filter.call(document.getElementById('main').children, function(c){return c.hidden}).length, cls: +window.__cls.value.toFixed(4) })`));
  await P.close();
}
// OAuth-повернення (?code=) без ключа в сховищі: замок теж НЕ має ставитись синхронно
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.viewport(390, 844, true);
  await P.inject(probe);
  await P.goto(`${BASE}/modules/claude-code-08.html?code=abc`, 2500);
  out.oauthReturn = await P.eval(`({ gate: !!document.getElementById('aiaGate'), gateAt: window.__gate, hiddenKids: [].filter.call(document.getElementById('main').children, function(c){return c.hidden}).length })`);
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
