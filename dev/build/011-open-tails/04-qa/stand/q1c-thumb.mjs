// Рішення 1, критерії 2,3,5,6,11 — повторно, з гарантією що НИЖНІЙ край блока у вʼюпорті.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function clipShot(P, path, x, y, w, h) {
  const r = await P.s("Page.captureScreenshot", { format: "png", clip: { x, y, width: w, height: h, scale: 1 } });
  fs.writeFileSync(path, Buffer.from(r.data, "base64"));
}
// Ставить нижній край елемента на 60 px вище низу вʼюпорта; повертає rect.
const PLACE = (varName) => `(function(){
  var el = window.${varName}; var r = el.getBoundingClientRect();
  window.scrollBy(0, r.bottom - (window.innerHeight - 60));
  r = el.getBoundingClientRect();
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
           bottom: Math.round(r.bottom), inView: r.bottom < window.innerHeight && r.bottom > 0,
           bg: getComputedStyle(el).backgroundColor, max: el.scrollWidth - el.clientWidth };
})()`;

async function bandShots(P, tag, varName) {
  const r = await P.eval(PLACE(varName));
  if (!r.inView) return { ...r, skipped: true };
  const y = r.bottom - 13, h = 13, x = r.x, w = r.w;
  await P.eval(`window.${varName}.scrollLeft = 0`); await sleep(300);
  await clipShot(P, `${S}/D1-${tag}-scroll0.png`, x, y, w, h);
  await P.eval(`window.${varName}.scrollLeft = Math.round((window.${varName}.scrollWidth-window.${varName}.clientWidth)/2)`); await sleep(350);
  await clipShot(P, `${S}/D1-${tag}-scrollmid.png`, x, y, w, h);
  await clipShot(P, `${S}/D1-${tag}-mid-context.png`, x, Math.max(0, r.bottom - 120), w, Math.min(120, r.bottom));
  await P.eval(`window.${varName}.scrollLeft = window.${varName}.scrollWidth`); await sleep(350);
  await clipShot(P, `${S}/D1-${tag}-scrollmax.png`, x, y, w, h);
  await P.eval(`window.${varName}.scrollLeft = 0`);
  return r;
}

// A) ref-hooks 1280 — беремо скролер, що вміщається у вʼюпорт
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/claude-code-ref-hooks`);
  await waitFor(P, "document.fonts.status==='loaded'", 8000); await sleep(400);
  const pick = await P.eval(`(function(){
    var els=[].filter.call(document.querySelectorAll('.ds-tbl__wrap, .ds-code > .ds-code__pre, .ds-prose > .ds-code__pre, .ds-prose > section > .ds-code__pre'), function(e){ return e.scrollWidth-e.clientWidth>1 && e.getBoundingClientRect().height < 700; });
    window.__a = els[0]; return { n: els.length, cls: els[0] ? els[0].className : null, h: els[0]? Math.round(els[0].getBoundingClientRect().height):0 };
  })()`);
  out.hooksPick = pick;
  out.hooks1280 = await bandShots(P, "hooks-1280", "__a");
  await P.close();
}
// B) ref-settings 1024 — блок з обома смугами: кут + вертикальна смуга
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1024, 800);
  await P.goto(`${BASE}/claude-code-ref-settings`);
  await waitFor(P, "document.fonts.status==='loaded'", 8000); await sleep(400);
  const found = await P.eval(`(function(){
    var els=[].filter.call(document.querySelectorAll('.ds-tbl__wrap'), function(e){ return e.scrollWidth-e.clientWidth>1 && e.scrollHeight-e.clientHeight>1; });
    window.__b = els[0]; return { n: els.length, cls: els[0]?els[0].className:null };
  })()`);
  out.settings1024 = found;
  if (found.n) {
    const r = await P.eval(PLACE("__b"));
    out.settings1024rect = r;
    if (r.inView) {
      await clipShot(P, `${S}/D1-settings-1024-corner.png`, r.x + r.w - 44, r.bottom - 44, 44, 44);
      await clipShot(P, `${S}/D1-settings-1024-block.png`, r.x, r.y < 0 ? 0 : r.y, r.w, Math.min(r.h, r.bottom));
    }
  }
  await P.close();
}
// C) 390 урок — смуга у спокої через 5 с
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(390, 844, true);
  await P.goto(`${BASE}/modules/claude-code-10`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')})&&document.fonts.status==='loaded';})()", 20000);
  const pick = await P.eval(`(function(){
    var els=[].filter.call(document.querySelectorAll('.term > .term__body'), function(e){return e.scrollWidth-e.clientWidth>1 && e.getBoundingClientRect().height<700;});
    window.__c = els[0]; return { n: els.length, cls: els[0]?els[0].className:null };
  })()`);
  const r = await P.eval(PLACE("__c"));
  await sleep(5200);
  if (r.inView) await clipShot(P, `${S}/D1-cc10-390-rest-5s.png`, r.x, Math.max(0, r.bottom - 100), r.w, Math.min(100, r.bottom));
  out.rest390 = { ...pick, ...r };
  // той самий блок: три позиції
  out.rest390bands = await bandShots(P, "cc10-390", "__c");
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
