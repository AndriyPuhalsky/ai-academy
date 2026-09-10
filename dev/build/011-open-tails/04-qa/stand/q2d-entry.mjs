// Рішення 2, критерій 3: вхід 003 живий, сторінка НЕ темніє цілком (M1 не грає).
import { browser, sleep, waitFor } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const P = await b.page();
await P.inject(`
  window.__frames = [];
  (function tick(){
    try {
      var m = document.getElementById('main');
      if (m) {
        var cs = getComputedStyle(m);
        var t = document.querySelector('.rm-hero__title, h1');
        var line = document.querySelector('.rm-hero__title span, h1 span');
        window.__frames.push({ t: Math.round(performance.now()), mainOpacity: cs.opacity, mainTransform: cs.transform,
          bodyOpacity: getComputedStyle(document.body).opacity,
          titleOpacity: t ? getComputedStyle(t).opacity : null,
          lineTransform: line ? getComputedStyle(line).transform : null });
      }
    } catch(e){}
    if (window.__frames.length < 40) requestAnimationFrame(tick);
  })();`);
await P.viewport(1280, 900);
await P.goto(`${BASE}/roadmap`);
await sleep(1800);
const r = await P.eval(`({ n: window.__frames.length, first: window.__frames.slice(0,3), some: window.__frames.filter(function(f,i){return i%6===0;}).slice(0,7),
  distinctMainOpacity: Array.from(new Set(window.__frames.map(function(f){return f.mainOpacity;}))),
  distinctBodyOpacity: Array.from(new Set(window.__frames.map(function(f){return f.bodyOpacity;}))),
  distinctMainTransform: Array.from(new Set(window.__frames.map(function(f){return f.mainTransform;}))),
  distinctLineTransform: Array.from(new Set(window.__frames.map(function(f){return f.lineTransform;}))).slice(0,6) })`);
console.log(JSON.stringify(r, null, 1));
await P.close();
b.close();
