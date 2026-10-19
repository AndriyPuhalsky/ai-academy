import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const UG = `(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`;
const b = await browser(9334);
async function clipShot(P, sel, name, maxH = 1400) {
  const r = JSON.parse(await P.eval(`(function(){ var e=document.querySelector('${sel}'); if(!e) return "null"; e.scrollIntoView({block:'start'}); var b=e.getBoundingClientRect();
    return JSON.stringify({x:Math.max(0,Math.round(b.left+scrollX-6)), y:Math.round(b.top+scrollY-6), w:Math.round(b.width+12), h:Math.min(Math.round(b.height+12), ${maxH})}); })()`));
  if (!r) { console.log("  немає", sel); return; }
  const img = await P.s("Page.captureScreenshot", { format: "png", clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 }, captureBeyondViewport: true });
  fs.writeFileSync(new URL("../shots/" + name, import.meta.url), Buffer.from(img.data, "base64"));
  console.log("  " + name, JSON.stringify(r));
}
// довідники: зламані таблиці
for (const [page, w, sel, name] of [
  ["jira-ref-jql", 768, "#f-core", "D-tbl-jql-f-core-768.png"],
  ["jira-ref-automation", 1280, "#triggers", "D-tbl-automation-triggers-1280b.png"],
  ["jira-ref-map", 768, "#m-views", "D-tbl-map-m-views-768.png"],
  ["jira-ref-map", 1440, "#m-settings", "D-tbl-map-m-settings-1440.png"],
]) {
  const P = await b.page(); await P.viewport(w, 1000, w < 700);
  await P.goto(`${D}/${page}`, 0); await P.eval("document.fonts.ready"); await sleep(900);
  await clipShot(P, sel, name);
  await P.close();
}
// вікна уроків для доказу перенесення
for (const [u, w, sel, name] of [
  ["/modules/jira-05", 1280, "figure.win", "win-jira05-1280.png"],
  ["/modules/jira-15", 390, "figure.win", "win-jira15-390.png"],
]) {
  const P = await b.page(); await P.inject(UG); await P.viewport(w, 1000, w < 700);
  await P.goto(`${D}${u}`, 0); await P.eval("document.fonts.ready"); await sleep(1600);
  await P.eval(`window.AIA&&window.AIA.winScrollers&&window.AIA.winScrollers.sync(),1`); await sleep(300);
  await clipShot(P, sel, name);
  await P.close();
}
// галерея макета — те саме вікно
{
  const P = await b.page(); await P.viewport(1280, 1000, false);
  await P.goto("http://127.0.0.1:8304/dev/design/012-jira/04-variants/_base/gallery.html", 0);
  await P.eval("document.fonts.ready"); await sleep(1500);
  await clipShot(P, "figure.win", "win-gallery-1280.png");
  await P.close();
}
// три живі лендінги
for (const [u, name] of [["/", "live-index-1280.png"], ["/architect", "live-architect-1280.png"], ["/claude-code", "live-terminal-1280.png"]]) {
  const P = await b.page(); await P.viewport(1280, 800, false);
  await P.goto(`${D}${u}`, 0); await P.eval("document.fonts.ready"); await sleep(2000);
  await P.shot(new URL("../shots/" + name, import.meta.url).pathname, false);
  await P.close(); console.log("  " + name);
}
b.close();
