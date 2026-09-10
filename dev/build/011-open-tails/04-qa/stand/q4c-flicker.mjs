// Рішення 4, критерій 7: «немає перемигання» бренду на повільній мережі й із заблокованими CDN.
import { browser, sleep, waitFor } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
const PROBE = `
  window.__fcp=null; window.__seen=[]; window.__firstPaintText=null;
  try{ new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ if(e.name==='first-contentful-paint'&&window.__fcp==null){ window.__fcp=Math.round(e.startTime);
    var n=document.getElementById('certBrandName'); window.__firstPaintText = n? n.textContent : '(вузла ще немає)'; } }); }).observe({type:'paint',buffered:true}); }catch(e){}
  (function tick(){ try{ var n=document.getElementById('certBrandName');
    if(n){ var t=n.textContent+'|'+document.title; if(window.__seen[window.__seen.length-1] !== t) window.__seen.push(Math.round(performance.now())+' '+t); } }catch(e){}
    if(window.__seen.length<20 && performance.now()<20000) requestAnimationFrame(tick); })();`;

for (const mode of ["slow3g", "blockcdn"]) {
  const P = await b.page({ blocked: mode === "blockcdn" ? ["*cdnjs.cloudflare.com*", "*cdn.jsdelivr.net*", "*cdn.tailwindcss.com*"] : [] });
  await P.inject(PROBE);
  await P.viewport(1280, 900);
  if (mode === "slow3g") await P.s("Network.emulateNetworkConditions", { offline: false, latency: 2000, downloadThroughput: 50 * 1024, uploadThroughput: 50 * 1024, connectionType: "cellular3g" });
  await P.goto(`${BASE}/certificate?from=claude-code`);
  await sleep(mode === "slow3g" ? 9000 : 3000);
  out[mode] = await P.eval(`({ fcp: window.__fcp, firstPaintText: window.__firstPaintText, seen: window.__seen,
    title: document.title, name: (document.getElementById('certBrandName')||{}).textContent })`);
  const r = await P.s("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${S}/D4-flicker-${mode}.png`, Buffer.from(r.data, "base64"));
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
