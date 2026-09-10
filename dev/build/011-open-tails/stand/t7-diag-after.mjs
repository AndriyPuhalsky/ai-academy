// Після правок: діаграми на живих сторінках (кеш вимкнено, гейт обійдено фальшивим ключем сесії).
import { browser, sleep, waitFor } from "./cdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "http://127.0.0.1:8311";
const ROOT = process.env.ROOT || "/Users/ander1.sage/Downloads/AIA";
const b = await browser();
const only = process.env.PAGES ? process.env.PAGES.split(",") : null;
const pages = only || fs.readdirSync(ROOT).filter((f) => f.endsWith(".html") && !f.includes(".local."))
  .concat(fs.readdirSync(ROOT + "/modules").filter((f) => f.endsWith(".html")).map((f) => "modules/" + f));
const widths = (process.env.WIDTHS || "390,768,1440").split(",").map(Number);
const out = {};
const P = await b.page({ blocked: ["*supabase*"] });
// Гейт для «можливо залогіненого» чекає hydrate(), який із заблокованим Supabase не прийде ніколи.
await P.inject("try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}; window.__errs=[]; window.addEventListener('error',function(e){window.__errs.push(String(e.message))}); var _ce=console.error; console.error=function(){window.__errs.push([].map.call(arguments,String).join(' ').slice(0,160)); _ce.apply(console,arguments)};");
for (const w of widths) {
  await P.viewport(w, 900, w < 700);
  for (const pg of pages) {
    await P.goto(`${BASE}/${pg}`);
    const n = await P.eval("document.querySelectorAll('pre.mermaid').length");
    if (!n) continue;
    const ok = await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')}) && document.fonts.status==='loaded';})()", 20000);
    await sleep(400);
    out[w + ":" + pg] = await P.eval(`(function(){
      var res=[]; document.querySelectorAll('.ds-diag').forEach(function(card,i){
        var pre=card.querySelector('pre.mermaid'); var box=pre; var svg=box.querySelector('svg');
        var nodes=svg?svg.querySelectorAll('g.node, .actor'):[]; var top=null,best=null;
        [].forEach.call(nodes,function(n){var r=n.getBoundingClientRect(); if(!r.width&&!r.height)return; if(top===null||r.top<top-1){top=r.top;best=r;} else if(r.top<=top+1&&best&&r.left<best.left){best=r;}});
        var br=box.getBoundingClientRect(); var sr=svg?svg.getBoundingClientRect():null; var pr=pre.getBoundingClientRect(); var cr=card.getBoundingClientRect(); var cap=card.querySelector('.ds-diag__caption');
        res.push({ i:i, svg:!!svg, id: svg?svg.id:null, err:svg?(svg.getAttribute('aria-roledescription')||''):'', sw:box.scrollWidth, cw:box.clientWidth, sl:Math.round(box.scrollLeft),
          svgW: sr?Math.round(sr.width):null, svgLeft: sr?Math.round(sr.left-br.left):null, preW: Math.round(pr.width), preLeft: Math.round(pr.left-br.left),
          rootLeft: best?Math.round(best.left-br.left):null, rootW: best?Math.round(best.width):null, scrollable: box.hasAttribute('data-scrollable'), tabindex: box.getAttribute('tabindex'), role: box.getAttribute('role'), named: !!(box.getAttribute('aria-labelledby') && document.getElementById(box.getAttribute('aria-labelledby'))), cardScroll: card.scrollWidth-card.clientWidth, capLeft: cap?Math.round(cap.getBoundingClientRect().left-cr.left):null, fade: box.getAttribute('data-scroll-fade'), failed: pre.hasAttribute('data-mermaid-failed') });
      }); return { ok: ${ok}, gated: !!document.getElementById('aiaGate'), stray: document.querySelectorAll('body > div[id^="d"], body > div[id^="aia-mmd"]').length, errs: window.__errs.slice(0,3), d: res }; })()`);
  }
}
await P.close(); b.close();
console.log(JSON.stringify(out));
