// Рішення 2 (критерії 3–6) і 3 (критерії 1–9): роадмап.
import { browser, sleep, waitFor, CONSOLE_PROBE, CLS_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function shot(P, path, full = false) { const r = await P.s("Page.captureScreenshot", { format: "png", captureBeyondViewport: full }); fs.writeFileSync(path, Buffer.from(r.data, "base64")); }

const CHECK = `(function(){
  function txt(s){ var e=document.querySelector(s); return e ? e.textContent.trim() : null; }
  // підписи «Усі платформи»: скільки й у скільки рядків
  var labels = [].filter.call(document.querySelectorAll('*'), function(e){
    return e.children.length===0 && e.textContent.trim()==='Усі платформи'; });
  var lines = labels.map(function(e){
    var r=document.createRange(); r.selectNodeContents(e);
    var rects=r.getClientRects();
    var b=e.getBoundingClientRect();
    return { rects: rects.length, h: Math.round(b.height), w: Math.round(b.width) };
  });
  var counters = [].map.call(document.querySelectorAll('.rm-stat__num, [data-count], .rm-hero__num'), function(e){ return e.textContent.trim(); });
  return {
    eyebrow: txt('.rm-hero__eyebrow') || txt('[class*=eyebrow]'),
    lead: (txt('.rm-hero__lead') || txt('[class*=lead]') || '').slice(0,80),
    title: document.title,
    updated: (document.body.textContent.match(/оновлено[^·\\n]{0,30}/)||[''])[0].trim(),
    labelsN: labels.length, labelLines: lines,
    counters: counters,
    backLabel: txt('#backLabel'),
    accent: getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim(),
    course: document.documentElement.getAttribute('data-course'),
    mainOpacity: getComputedStyle(document.getElementById('main')).opacity,
    mainPageIn: document.getElementById('main').hasAttribute('data-page-in'),
    trailNodes: document.querySelectorAll('#trail *').length,
    pageX: document.documentElement.scrollWidth - window.innerWidth,
    entriesVisible: [].filter.call(document.querySelectorAll('.rm-entry, .rm-row'), function(e){ return getComputedStyle(e).opacity !== '0'; }).length,
    entriesTotal: document.querySelectorAll('.rm-entry, .rm-row').length
  };
})()`;

for (const w of [1440, 1024, 390]) {
  const P = await b.page();
  await P.inject(CONSOLE_PROBE + CLS_PROBE);
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/roadmap`);
  await waitFor(P, "document.fonts.status==='loaded' && document.querySelectorAll('.rm-entry, .rm-row').length>0", 15000);
  await sleep(2500);
  const r = await P.eval(CHECK);
  const log = await P.eval(`({errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections, cls: +window.__cls.value.toFixed(4)})`);
  await shot(P, `${S}/D2-roadmap-${w}.png`);
  out[`roadmap:${w}`] = { ...r, log };
  await P.close();
}
// ?from= регресія
for (const q of ["", "?from=claude-code", "?from=architect", "?from=невідомий"]) {
  const P = await b.page();
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/roadmap${q}`);
  await waitFor(P, "document.querySelectorAll('.rm-entry, .rm-row').length>0", 15000);
  await sleep(900);
  out[`from:${q || "(без)"}`] = await P.eval(`({ back: (document.querySelector('#backLabel')||{}).textContent, course: document.documentElement.getAttribute('data-course'), accent: getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim(), brand: (document.querySelector('.ds-ftr__brand, footer .ds-ftr__name, footer')||{}).textContent.replace(/\\s+/g,' ').slice(0,80) })`);
  await P.close();
}
// prefers-reduced-motion
{
  const P = await b.page();
  await P.inject(CONSOLE_PROBE + CLS_PROBE);
  await P.viewport(1280, 900);
  await P.s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await P.goto(`${BASE}/roadmap`);
  await waitFor(P, "document.querySelectorAll('.rm-entry, .rm-row').length>0", 15000);
  await sleep(1500);
  out.reduced = await P.eval(`(function(){
    var all=[].slice.call(document.querySelectorAll('.rm-entry, .rm-row, .rm-hero__title, h1, h2'));
    var hidden=all.filter(function(e){ var cs=getComputedStyle(e); return parseFloat(cs.opacity)<0.99 || cs.visibility==='hidden'; });
    return { total: all.length, hidden: hidden.length, hiddenSample: hidden.slice(0,3).map(function(e){return (e.className||e.tagName).toString().slice(0,30)+':'+getComputedStyle(e).opacity}),
      counters: [].map.call(document.querySelectorAll('.rm-stat__num, [data-count], .rm-hero__num'), function(e){return e.textContent.trim();}),
      trailNodes: document.querySelectorAll('#trail *').length,
      trailDash: (function(){var p=document.querySelector('#trail path, #trail polyline'); return p?getComputedStyle(p).strokeDasharray+'|'+getComputedStyle(p).strokeDashoffset:null;})(),
      cls: +window.__cls.value.toFixed(4) };
  })()`);
  await shot(P, `${S}/D2-roadmap-reduced-1280.png`);
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
