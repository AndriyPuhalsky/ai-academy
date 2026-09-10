// Усі таблиці сайту на трьох ширинах: ширини колонок, рядки першої колонки, скрол обгортки.
// Supabase заблокований → гейт уроку ніколи не ставиться, усі ширини чесні.
import { browser, sleep, waitFor } from "./cdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "http://127.0.0.1:8312";
const ROOT = process.env.ROOT || "/Users/ander1.sage/Downloads/AIA";
const b = await browser();
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html") && !f.includes(".local.")).map((f) => f)
  .concat(fs.readdirSync(ROOT + "/modules").filter((f) => f.endsWith(".html")).map((f) => "modules/" + f));
const widths = (process.env.WIDTHS || "1280,768,390").split(",").map(Number);
const out = {};
const P = await b.page({ blocked: ["*supabase*"] });
if (process.env.TOKEN) await P.inject("try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}");
for (const w of widths) {
  await P.viewport(w, 900, w < 700);
  for (const pg of pages) {
    await P.goto(`${BASE}/${pg}`);
    const has = await P.eval("document.querySelectorAll('.ds-tbl').length");
    if (!has) continue;
    await waitFor(P, "document.fonts.status === 'loaded'", 5000);
    await sleep(80);
    const r = await P.eval(`(function(){
      var out=[]; document.querySelectorAll('.ds-tbl').forEach(function(t,i){
        var wrap=t.closest('.ds-tbl__wrap')||t.parentNode;
        var row=t.querySelector('tbody tr')||t.querySelector('tr'); var cells=row?row.children:[];
        var widths=[].map.call(cells,function(c){return Math.round(c.getBoundingClientRect().width);});
        var firstCells=[].map.call(t.querySelectorAll('tbody tr > :first-child'),function(c){ var cs=getComputedStyle(c); return Math.round(c.getBoundingClientRect().height/parseFloat(cs.lineHeight)*10)/10; });
        var h=[]; var n=t; while(n && n!==document.body){ if(n.id){h.push(n.id);break;} n=n.previousElementSibling||n.parentNode; }
        out.push({ i:i, anchor:h[0]||'', tw:Math.round(t.getBoundingClientRect().width), ww:wrap.clientWidth, sw:wrap.scrollWidth, cols:widths, th:Math.round(t.getBoundingClientRect().height), c1lines:firstCells });
      }); return out; })()`);
    out[w + ":" + pg] = r;
  }
}
await P.close(); b.close();
console.log(JSON.stringify(out));
