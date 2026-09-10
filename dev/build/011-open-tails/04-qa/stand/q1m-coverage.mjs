// Покриття всіх шести селекторів §41.1 + перевірка пастки scrollbar-width.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const SELS = [".ds-tbl__wrap", ".ds-diag > pre.mermaid", ".term > .term__body", ".ds-code > .ds-code__pre", ".ds-prose > .ds-code__pre", ".ds-prose > section > .ds-code__pre"];
const acc = {}; SELS.forEach((s) => (acc[s] = { знайдено: 0, зіСкролом: 0, смуга12: 0, іншаСмуга: [], sbWidth: {}, sbColor: {} }));
for (const [w, pg] of [[390, "modules/claude-code-10"], [1280, "claude-code-ref-hooks"], [1024, "claude-code-ref-settings"], [390, "modules/module-05"], [390, "modules/architect-08"], [1280, "claude-code-ref-commands"], [390, "claude-code"], [1280, "index"]]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')})&&document.fonts.status==='loaded';})()", 20000);
  await sleep(500);
  const r = await P.eval(`(function(){ var sels=${JSON.stringify(SELS)}; var o={};
    sels.forEach(function(s){ var els=[].slice.call(document.querySelectorAll(s)); o[s]=els.map(function(e){ var cs=getComputedStyle(e);
      var bt=parseFloat(cs.borderTopWidth)||0, bb=parseFloat(cs.borderBottomWidth)||0;
      return { scroll: e.scrollWidth-e.clientWidth>1, bar: Math.round(e.offsetHeight-bt-bb-e.clientHeight), sw: cs.scrollbarWidth, sc: cs.scrollbarColor }; }); });
    return o; })()`);
  for (const s of SELS) for (const e of r[s]) {
    acc[s].знайдено++; if (e.scroll) { acc[s].зіСкролом++; if (e.bar === 12) acc[s].смуга12++; else acc[s].іншаСмуга.push(`${w}:${pg}=${e.bar}`); }
    acc[s].sbWidth[e.sw] = (acc[s].sbWidth[e.sw] || 0) + 1; acc[s].sbColor[e.sc] = (acc[s].sbColor[e.sc] || 0) + 1;
  }
  await P.close();
}
console.log(JSON.stringify(acc, null, 1));
b.close();
