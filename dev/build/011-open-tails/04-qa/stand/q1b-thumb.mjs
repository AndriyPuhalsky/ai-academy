// Рішення 1, критерії 2,3,5,6,11: позиція повзунка, маска, кут, колір — пікселями.
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

// 1) ref-hooks 1280: перший горизонтальний скролер, три позиції
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/claude-code-ref-hooks`);
  await waitFor(P, "document.fonts.status==='loaded'", 8000);
  await sleep(400);
  const info = await P.eval(`(function(){
    var el = [].filter.call(document.querySelectorAll('.ds-tbl__wrap'), function(e){return e.scrollWidth-e.clientWidth>1})[0];
    window.__el = el; el.scrollIntoView({block:'center'}); el.scrollLeft = 0;
    var r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), bottom: Math.round(r.bottom), top: Math.round(r.top),
             bg: getComputedStyle(el).backgroundColor, max: el.scrollWidth-el.clientWidth };
  })()`);
  await sleep(300);
  const band = { x: info.left, y: info.bottom - 13, w: info.right - info.left, h: 13 };
  await clipShot(P, `${S}/D1-hooks-1280-scroll0.png`, band.x, band.y, band.w, band.h);
  await P.eval(`window.__el.scrollLeft = Math.round((window.__el.scrollWidth-window.__el.clientWidth)/2)`);
  await sleep(350);
  await clipShot(P, `${S}/D1-hooks-1280-scrollmid.png`, band.x, band.y, band.w, band.h);
  await P.eval(`window.__el.scrollLeft = window.__el.scrollWidth`);
  await sleep(350);
  await clipShot(P, `${S}/D1-hooks-1280-scrollmax.png`, band.x, band.y, band.w, band.h);
  // повний знімок блока в середині прокрутки — маска + повзунок
  await P.eval(`window.__el.scrollLeft = Math.round((window.__el.scrollWidth-window.__el.clientWidth)/2)`);
  await sleep(300);
  const full = await P.eval(`(function(){var r=window.__el.getBoundingClientRect();return {x:Math.round(r.left),y:Math.round(Math.max(0,r.bottom-160)),w:Math.round(r.width),h:Math.round(Math.min(160,r.bottom))};})()`);
  await clipShot(P, `${S}/D1-hooks-1280-mask-and-bar.png`, full.x, full.y, full.w, full.h);
  out.hooks1280 = { ...info, band };
  await P.close();
}

// 2) ref-settings 1024: чи є блок з ОБОМА смугами (кут)
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1024, 800);
  await P.goto(`${BASE}/claude-code-ref-settings`);
  await waitFor(P, "document.fonts.status==='loaded'", 8000);
  await sleep(400);
  const both = await P.eval(`(function(){
    var res=[]; document.querySelectorAll('.ds-tbl__wrap').forEach(function(e,i){
      var h=e.scrollWidth-e.clientWidth>1, v=e.scrollHeight-e.clientHeight>1;
      if(h&&v){ var r=e.getBoundingClientRect(); res.push({i:i, cls:e.className, x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height), bottom:Math.round(r.bottom), right:Math.round(r.right)}); }
    });
    if(res.length){ var el=document.querySelectorAll('.ds-tbl__wrap')[res[0].i]; el.scrollIntoView({block:'center'}); window.__el2=el; }
    return res;
  })()`);
  out.settings1024both = both;
  if (both.length) {
    await sleep(300);
    const r = await P.eval(`(function(){var r=window.__el2.getBoundingClientRect();return {x:Math.round(r.right-40),y:Math.round(r.bottom-40),w:40,h:40};})()`);
    await clipShot(P, `${S}/D1-settings-1024-corner.png`, r.x, r.y, r.w, r.h);
    const full = await P.eval(`(function(){var r=window.__el2.getBoundingClientRect();return {x:Math.round(r.left),y:Math.round(Math.max(0,r.top)),w:Math.round(r.width),h:Math.round(Math.min(r.height,700))};})()`);
    await clipShot(P, `${S}/D1-settings-1024-tall.png`, full.x, full.y, full.w, full.h);
  }
  // липка шапка таблиці --tall ще працює?
  out.settingsSticky = await P.eval(`(function(){var el=document.querySelector('.ds-tbl__wrap--tall'); if(!el) return null; var th=el.querySelector('thead th'); return { pos: getComputedStyle(th).position, top: getComputedStyle(th).top, z: getComputedStyle(th).zIndex }; })()`);
  await P.close();
}

// 3) 390 урок: смуга видима у спокої через 5 с без жодного дотику
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(390, 844, true);
  await P.goto(`${BASE}/modules/claude-code-10`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')})&&document.fonts.status==='loaded';})()", 20000);
  const pos = await P.eval(`(function(){
    var el=[].filter.call(document.querySelectorAll('.term > .term__body'), function(e){return e.scrollWidth-e.clientWidth>1})[0]
        || [].filter.call(document.querySelectorAll('.ds-tbl__wrap'), function(e){return e.scrollWidth-e.clientWidth>1})[0];
    el.scrollIntoView({block:'center'}); window.__el3=el; var r=el.getBoundingClientRect();
    return {x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height), bottom:Math.round(r.bottom), cls:el.className, bg:getComputedStyle(el).backgroundColor};
  })()`);
  await sleep(5200); // 5 секунд без жодного дотику
  await clipShot(P, `${S}/D1-cc10-390-rest-5s.png`, pos.x, Math.max(0, pos.bottom - 90), pos.w, Math.min(90, pos.bottom));
  out.rest390 = pos;
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
