import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
for (const [w,h,name] of [[1280,653,"hero-1280x653.png"],[1440,900,"hero-1440.png"],[768,900,"hero-768.png"],[390,844,"hero-390.png"],[1024,900,"hero-1024.png"]]) {
  const P = await b.page();
  await P.viewport(w,h,w<700);
  await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(2000);
  await P.shot(new URL("../shots/"+name, import.meta.url).pathname, false);
  if (w===1280) {
    console.log(await P.eval(`(function(){
      var h1=document.querySelector("h1");
      var sp=Array.from(h1.querySelectorAll("span"));
      return JSON.stringify({
        h1text: h1.textContent.trim(),
        spans: sp.map(function(s){ var r=document.createRange(); r.selectNodeContents(s);
          var tops=new Set(Array.from(r.getClientRects()).filter(function(x){return x.height>2;}).map(function(x){return Math.round(x.top);}));
          return {t:s.textContent.trim(), lines: tops.size, disp: getComputedStyle(s).display, w: Math.round(s.getBoundingClientRect().width)}; }),
        h1rect: (function(r){return [Math.round(r.top),Math.round(r.height),Math.round(r.width)];})(h1.getBoundingClientRect()),
        fs: getComputedStyle(h1).fontSize, lh: getComputedStyle(h1).lineHeight
      });})()`));
  }
  await P.close();
}
b.close(); console.log("shots ok");
