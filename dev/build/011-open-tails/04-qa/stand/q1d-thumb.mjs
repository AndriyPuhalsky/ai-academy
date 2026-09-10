// Те саме, але clip у КООРДИНАТАХ СТОРІНКИ (scrollX/scrollY додано) — інакше Chrome ріже не там.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function clipShot(P, path, x, y, w, h) {
  const r = await P.s("Page.captureScreenshot", { format: "png", clip: { x, y, width: w, height: h, scale: 1 }, captureBeyondViewport: false });
  fs.writeFileSync(path, Buffer.from(r.data, "base64"));
}
const RECT = (v) => `(function(){ var el=window.${v}; var r=el.getBoundingClientRect();
  return { vx: Math.round(r.left), vy: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
    vbottom: Math.round(r.bottom), px: Math.round(r.left + window.scrollX), py: Math.round(r.top + window.scrollY),
    pbottom: Math.round(r.bottom + window.scrollY), sx: Math.round(window.scrollX), sy: Math.round(window.scrollY),
    max: el.scrollWidth - el.clientWidth, sl: Math.round(el.scrollLeft) }; })()`;
const PLACE = (v) => `(function(){ var el=window.${v}; var r=el.getBoundingClientRect(); window.scrollBy(0, r.bottom - (window.innerHeight - 60)); return 1; })()`;

async function bands(P, tag, v) {
  await P.eval(PLACE(v)); await sleep(250);
  const positions = [["scroll0", "0"], ["scrollmid", "Math.round((el.scrollWidth-el.clientWidth)/2)"], ["scrollmax", "el.scrollWidth"]];
  const res = [];
  for (const [name, expr] of positions) {
    await P.eval(`(function(){var el=window.${v}; el.scrollLeft = ${expr};})()`);
    await sleep(400);
    const r = await P.eval(RECT(v));
    await clipShot(P, `${S}/D1-${tag}-${name}.png`, r.px, r.pbottom - 13, r.w, 13);
    if (name === "scrollmid") await clipShot(P, `${S}/D1-${tag}-mid-context.png`, r.px, r.pbottom - 130, r.w, 130);
    res.push({ name, ...r });
  }
  await P.eval(`window.${v}.scrollLeft = 0`);
  return res;
}
// A) hooks 1280
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE); await P.viewport(1280, 900);
  await P.goto(`${BASE}/claude-code-ref-hooks`);
  await waitFor(P, "document.fonts.status==='loaded'", 8000); await sleep(400);
  await P.eval(`window.__a=[].filter.call(document.querySelectorAll('.ds-tbl__wrap'), function(e){return e.scrollWidth-e.clientWidth>1 && e.getBoundingClientRect().height<700;})[0]`);
  out.hooks1280 = await bands(P, "hooks-1280", "__a");
  await P.close();
}
// B) settings 1024, обидві смуги + кут
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE); await P.viewport(1024, 800);
  await P.goto(`${BASE}/claude-code-ref-settings`);
  await waitFor(P, "document.fonts.status==='loaded'", 8000); await sleep(400);
  await P.eval(`window.__b=[].filter.call(document.querySelectorAll('.ds-tbl__wrap'), function(e){return e.scrollWidth-e.clientWidth>1 && e.scrollHeight-e.clientHeight>1;})[0]`);
  await P.eval(PLACE("__b")); await sleep(300);
  const r = await P.eval(RECT("__b"));
  out.settings1024 = r;
  await clipShot(P, `${S}/D1-settings-1024-corner.png`, r.px + r.w - 44, r.pbottom - 44, 44, 44);
  await clipShot(P, `${S}/D1-settings-1024-block.png`, r.px, r.py, r.w, r.h);
  await P.close();
}
// C) 390 урок, спокій 5 с + три позиції
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(390, 844, true);
  await P.goto(`${BASE}/modules/claude-code-10`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')})&&document.fonts.status==='loaded';})()", 20000);
  await P.eval(`window.__c=[].filter.call(document.querySelectorAll('.term > .term__body'), function(e){return e.scrollWidth-e.clientWidth>1 && e.getBoundingClientRect().height<700;})[0]`);
  await P.eval(PLACE("__c"));
  await sleep(5200);
  const r0 = await P.eval(RECT("__c"));
  await clipShot(P, `${S}/D1-cc10-390-rest-5s.png`, r0.px, r0.pbottom - 110, r0.w, 110);
  out.rest390 = r0;
  out.rest390bands = await bands(P, "cc10-390", "__c");
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
