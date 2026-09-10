// Дрібна сітка ширин для hero лендінга Термінала: висоти/рядки після гідратації.
import { browser, sleep, waitFor } from "./cdp.mjs";
const BASE = process.env.BASE || "http://127.0.0.1:8312";
const b = await browser();
const P = await b.page();
const rows = [];
const widths = [];
for (let w = 320; w <= 1920; w += (w < 700 ? 10 : 16)) widths.push(w);
for (const w of widths) {
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/claude-code.html`);
  await waitFor(P, "document.getElementById('heroLead').textContent.length > 0 && document.fonts.status === 'loaded'", 8000);
  await sleep(120);
  rows.push(await P.eval(`(function(){
    function q(s){ return document.querySelector(s); }
    function lines(el){ var cs=getComputedStyle(el); return +(el.getBoundingClientRect().height / parseFloat(cs.lineHeight)).toFixed(2); }
    var col = q('.cc-hero__body .cc-grid__body').getBoundingClientRect().width;
    var stats = q('.cc-hero__stats'); var scs = getComputedStyle(stats);
    return { w: innerWidth, col: +col.toFixed(1),
      title: +q('.cc-hero__title').getBoundingClientRect().height.toFixed(1),
      lead: lines(q('.cc-hero__lead')), leadH: +q('.cc-hero__lead').getBoundingClientRect().height.toFixed(1), leadW: +q('.cc-hero__lead').getBoundingClientRect().width.toFixed(1),
      cta: +q('.cc-hero__cta').getBoundingClientRect().height.toFixed(1),
      expl: lines(q('.cc-hero__explain')), explH: +q('.cc-hero__explain').getBoundingClientRect().height.toFixed(1),
      stats: +((stats.getBoundingClientRect().height - parseFloat(scs.paddingTop) - parseFloat(scs.borderTopWidth)) / parseFloat(scs.lineHeight)).toFixed(2), statsH: +stats.getBoundingClientRect().height.toFixed(1), statsLh: scs.lineHeight,
      foot: +q('.cc-desk__foot').getBoundingClientRect().height.toFixed(1),
      body: +q('.cc-hero__body').getBoundingClientRect().height.toFixed(1) };
  })()`));
}
await P.close(); b.close();
console.log(JSON.stringify(rows));
