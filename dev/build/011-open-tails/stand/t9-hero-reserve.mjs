// Резерв hero (конфіг ЗАБЛОКОВАНО → вузли лишаються порожніми) проти фактичних висот з бази.
import { browser, sleep, waitFor, CLS_PROBE } from "./cdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "http://127.0.0.1:8311";
const base = JSON.parse(fs.readFileSync(process.env.BASEFILE || "base-hero.json", "utf8"));
const b = await browser();
const out = { reserve: [], cls: [] };
const P = await b.page({ blocked: ["*claude-code.config.json*", "*supabase*"] });
for (const r0 of base) {
  const w = r0.w;
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/claude-code.html`);
  await waitFor(P, "document.fonts.status === 'loaded'", 6000);
  await sleep(120);
  const r = await P.eval(`(function(){ function q(s){return document.querySelector(s)} function h(s){ return +q(s).getBoundingClientRect().height.toFixed(1); }
    return { w: innerWidth, col: +q('.cc-hero__body .cc-grid__body').getBoundingClientRect().width.toFixed(1), title: h('.cc-hero__title'), lead: h('.cc-hero__lead'), cta: h('.cc-hero__cta'), expl: h('.cc-hero__explain'), stats: h('.cc-hero__stats'), body: h('.cc-hero__body'), empty: q('#heroLead').textContent.length===0 }; })()`);
  out.reserve.push({ w, col: r.col, empty: r.empty,
    dTitle: +(r.title - r0.title).toFixed(1), dLead: +(r.lead - r0.leadH).toFixed(1), dCta: +(r.cta - r0.cta).toFixed(1), dExpl: +(r.expl - r0.explH).toFixed(1), dStats: +(r.stats - r0.statsH).toFixed(1), dBody: +(r.body - r0.body).toFixed(1) });
}
await P.close();
// CLS після правки: пʼять канонічних + чотири проміжні ширини, 2 прогони
for (const w of [320, 390, 600, 768, 1024, 1100, 1180, 1440, 1920]) {
  for (let i = 0; i < 2; i++) {
    const Q = await b.page();
    await Q.viewport(w, 900, w < 700);
    await Q.inject(CLS_PROBE);
    await Q.goto(`${BASE}/claude-code.html`, 3000);
    out.cls.push({ w, run: i, cls: await Q.eval("+window.__cls.value.toFixed(4)"), entries: await Q.eval("window.__cls.entries.slice(0,4)") });
    await Q.close();
  }
}
console.log(JSON.stringify(out));
b.close();
