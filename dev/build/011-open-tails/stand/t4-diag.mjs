// Діаграми: стан після рендеру (svg є?), скрол, позиція кореня (D-26), центрування (D-19).
import { browser, sleep, waitFor } from "./cdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "http://127.0.0.1:8312";
const ROOT = process.env.ROOT || "/Users/ander1.sage/Downloads/AIA";
const b = await browser();
const only = process.env.PAGES ? process.env.PAGES.split(",") : null;
const pages = only || fs.readdirSync(ROOT).filter((f) => f.endsWith(".html") && !f.includes(".local."))
  .concat(fs.readdirSync(ROOT + "/modules").filter((f) => f.endsWith(".html")).map((f) => "modules/" + f));
const widths = (process.env.WIDTHS || "390,768,1440").split(",").map(Number);
const out = {};
const P = await b.page({ blocked: ["*supabase*"] });
for (const w of widths) {
  await P.viewport(w, 900, w < 700);
  for (const pg of pages) {
    await P.goto(`${BASE}/${pg}`);
    const n = await P.eval("document.querySelectorAll('pre.mermaid').length");
    if (!n) continue;
    const ok = await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');var s=document.querySelectorAll('pre.mermaid svg');return p.length===s.length && document.fonts.status==='loaded';})()", 20000);
    await sleep(400);
    out[w + ":" + pg] = await P.eval(`(function(){
      var res=[]; document.querySelectorAll('.ds-diag').forEach(function(box,i){
        var svg=box.querySelector('svg'); var pre=box.querySelector('pre.mermaid');
        var nodes=svg?svg.querySelectorAll('g.node, .actor'):[]; var top=null,best=null;
        [].forEach.call(nodes,function(n){var r=n.getBoundingClientRect(); if(!r.width&&!r.height)return; if(top===null||r.top<top-1){top=r.top;best=r;} else if(r.top<=top+1&&best&&r.left<best.left){best=r;}});
        var br=box.getBoundingClientRect(); var sr=svg?svg.getBoundingClientRect():null; var pr=pre.getBoundingClientRect();
        res.push({ i:i, svg:!!svg, err:svg?(svg.getAttribute('aria-roledescription')||''):'', sw:box.scrollWidth, cw:box.clientWidth, sl:Math.round(box.scrollLeft),
          svgW: sr?Math.round(sr.width):null, svgLeft: sr?Math.round(sr.left-br.left):null, preW: Math.round(pr.width),
          rootLeft: best?Math.round(best.left-br.left):null, rootW: best?Math.round(best.width):null, scrollable: box.hasAttribute('data-scrollable'), tabindex: box.getAttribute('tabindex') });
      }); return { ok: ${ok}, d: res }; })()`);
  }
}
await P.close(); b.close();
console.log(JSON.stringify(out));
