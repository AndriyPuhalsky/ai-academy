import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334); const P = await b.page();
await P.viewport(1280, 900, false);
await P.goto(`${D}/jira`, 0); await P.eval("document.fonts.ready"); await sleep(1500);
console.log(await P.eval(`(function(){
  return JSON.stringify(Array.from(document.querySelectorAll("#jiraHero *")).filter(function(n){
    return typeof n.className==="string" && /cursor|fly|trail/.test(n.className); }).map(function(n){
    var r=n.getBoundingClientRect(); return {cls:n.className, tag:n.tagName, w:Math.round(r.width), h:Math.round(r.height)}; }));
})()`));
// пауза й кадри
const phases = [10, 16, 20, 24, 28, 40, 44, 50, 56, 70];
await P.eval(`(function(){ window.__as = document.getAnimations(); window.__as.forEach(function(a){a.pause();}); window.__dur = 5200; return 1; })()`);
const geo = [];
for (const p of phases) {
  await P.eval(`(function(){ window.__as.forEach(function(a){ a.currentTime = window.__dur*${p}/100; }); return 1; })()`);
  await sleep(120);
  geo.push(JSON.parse(await P.eval(`(function(){
    var cur = document.querySelector("#jiraHero .jira-cursor, #jiraHero [class*='cursor']");
    var fly = document.querySelector("#jiraHero .jira-fly, #jiraHero [class*='fly']");
    var c=cur.getBoundingClientRect(), f=fly.getBoundingClientRect();
    return JSON.stringify({ p:${p}, cur:[Math.round(c.left),Math.round(c.top),Math.round(c.width),Math.round(c.height)],
      fly:[Math.round(f.left),Math.round(f.top),Math.round(f.width),Math.round(f.height)],
      inside: c.left>=f.left-20 && c.left<=f.right+20 && c.top>=f.top-20 && c.top<=f.bottom+20 });
  })()`)));
  const r = JSON.parse(await P.eval(`(function(){ var w=document.querySelector("#jiraHero .win"); var b=w.getBoundingClientRect();
    return JSON.stringify({x:Math.round(b.left+scrollX),y:Math.round(b.top+scrollY),w:Math.round(b.width),h:Math.round(b.height)}); })()`));
  const img = await P.s("Page.captureScreenshot", { format: "png", clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  fs.writeFileSync(new URL(`../shots/hero-phase-${p}.png`, import.meta.url), Buffer.from(img.data, "base64"));
}
console.table(geo.map(g=>({p:g.p, curL:g.cur[0], curT:g.cur[1], flyL:g.fly[0], flyT:g.fly[1], flyW:g.fly[2], курсорНаКартці:g.inside})));
await P.close(); b.close();
