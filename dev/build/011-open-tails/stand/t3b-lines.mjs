// Таблиці: справжня кількість рядків у ПЕРШІЙ клітинці кожного ряду (через Range.getClientRects), ширини колонок, скрол.
import { browser, sleep, waitFor } from "./cdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE; const ROOT = process.env.ROOT;
const b = await browser();
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html") && !f.includes(".local."))
  .concat(fs.readdirSync(ROOT + "/modules").filter((f) => f.endsWith(".html")).map((f) => "modules/" + f));
const widths = (process.env.WIDTHS || "1280,768,390").split(",").map(Number);
const out = {};
const P = await b.page({ blocked: ["*supabase*"] });
await P.inject("try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}");
for (const w of widths) {
  await P.viewport(w, 900, w < 700);
  for (const pg of pages) {
    await P.goto(`${BASE}/${pg}`);
    if (!(await P.eval("document.querySelectorAll('.ds-tbl').length"))) continue;
    await waitFor(P, "document.fonts.status === 'loaded'", 5000); await sleep(80);
    out[w + ":" + pg] = await P.eval(`(function(){
      function lines(td){ var r=document.createRange(); r.selectNodeContents(td); var tops=[]; [].forEach.call(r.getClientRects(),function(x){ if(!x.width||!x.height) return; if(!tops.some(function(t){return Math.abs(t-x.top)<3})) tops.push(x.top); }); return tops.length; }
      var out=[]; document.querySelectorAll('.ds-tbl').forEach(function(t,i){
        var wrap=t.closest('.ds-tbl__wrap')||t.parentNode; var row=t.querySelector('tbody tr')||t.querySelector('tr'); var cells=row?row.children:[];
        var widths=[].map.call(cells,function(c){return Math.round(c.getBoundingClientRect().width);});
        var c1=[].map.call(t.querySelectorAll('tbody tr > :first-child'), lines);
        var h=[]; var n=t; while(n && n!==document.body){ if(n.id){h.push(n.id);break;} n=n.previousElementSibling||n.parentNode; }
        out.push({ anchor:h[0]||'', tw:Math.round(t.getBoundingClientRect().width), ww:wrap.clientWidth, sw:wrap.scrollWidth, cols:widths, c1:c1, th:Math.round(t.getBoundingClientRect().height) });
      }); return out; })()`);
  }
}
await P.close(); b.close(); console.log(JSON.stringify(out));
