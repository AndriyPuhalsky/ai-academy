// Де саме .ds-tbl__wrap--tall має ОБИДВІ смуги (там маска гасить вертикальну).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const out = [];
const P = await b.page({ blocked: ["*supabase*"] });
await P.inject(CONSOLE_PROBE);
for (const w of [390, 500, 640, 768, 900, 1024, 1100, 1152, 1200, 1280, 1440]) {
  await P.viewport(w, 800, w < 700);
  await P.goto(`${BASE}/claude-code-ref-settings`);
  await waitFor(P, "document.fonts.status==='loaded'", 12000); await sleep(350);
  out.push({ w, ...(await P.eval(`(function(){
    var t=[].slice.call(document.querySelectorAll('.ds-tbl__wrap--tall'));
    return { tall: t.length, обидві: t.filter(function(e){return e.scrollWidth-e.clientWidth>1 && e.scrollHeight-e.clientHeight>1;}).length,
      лишеВерт: t.filter(function(e){return e.scrollWidth-e.clientWidth<=1 && e.scrollHeight-e.clientHeight>1;}).length,
      fade: t.map(function(e){return e.getAttribute('data-scroll-fade');}) }; })()`)) });
}
console.log(JSON.stringify(out));
await P.close(); b.close();
