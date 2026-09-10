// К11: атрибут знімається при розблокуванні. Чистий гість + hydrate(усі коди) → aia:progress.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const P = await b.page();
await P.inject(`try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}` + CONSOLE_PROBE);
await P.viewport(1280, 900);
await P.goto(`${BASE}/modules/architect-05`);
await waitFor(P, "!!document.getElementById('aiaGate') && !!window.AIAProgress", 15000);
await sleep(1500);
const before = await P.eval(`({ attr: document.documentElement.getAttribute('data-aia-gate'), gate: !!document.getElementById('aiaGate'),
  hidden: [].filter.call(document.getElementById('main').children, function(c){return c.hidden}).length,
  hydrated: window.AIAProgress.isHydrated(), footerTop: Math.round(document.querySelector('footer').getBoundingClientRect().top),
  snavH: Math.round(document.getElementById('moduleSidebar').getBoundingClientRect().height) })`);
// Імітуємо, що прогрес прийшов і всі попередні модулі пройдені (нічого не пишемо в базу)
const sim = await P.eval(`(function(){
  var codes = window.AIA_MODULE_MAP ? Object.keys(window.AIA_MODULE_MAP) : [];
  if (!codes.length) return { err: 'AIA_MODULE_MAP порожній' };
  window.AIAProgress.hydrate(codes);
  document.dispatchEvent(new CustomEvent('aia:progress'));
  return { codes: codes.length };
})()`);
await sleep(900);
const after = await P.eval(`({ attr: document.documentElement.getAttribute('data-aia-gate'), hasAttr: document.documentElement.hasAttribute('data-aia-gate'),
  gate: !!document.getElementById('aiaGate'), hidden: [].filter.call(document.getElementById('main').children, function(c){return c.hidden}).length,
  snavMinH: getComputedStyle(document.getElementById('moduleSidebar')).minHeight,
  footerTop: Math.round(document.querySelector('footer').getBoundingClientRect().top),
  errors: window.__log.errors })`);
console.log(JSON.stringify({ before, sim, after }, null, 1));
await P.close(); b.close();
