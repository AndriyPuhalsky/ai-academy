import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
for (const [u, sel, w, name] of [
  ["/jira", "#map", 1280, "map-jira-1280.png"],
  ["/claude-code", "#map", 1280, "map-terminal-1280.png"],
  ["/jira", "#map", 390, "map-jira-390.png"],
  ["/claude-code", "#map", 390, "map-terminal-390.png"],
  ["/jira", "#map", 768, "map-jira-768.png"],
]) {
  const P = await b.page(); await P.viewport(w, 1000, w<700);
  await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(2200);
  const r = JSON.parse(await P.eval(`(function(){ var e=document.querySelector("${sel}"); var b=e.getBoundingClientRect();
    return JSON.stringify({x:Math.max(0,Math.round(b.left+scrollX)), y:Math.round(b.top+scrollY), w:Math.round(b.width), h:Math.min(Math.round(b.height), 2400)}); })()`));
  const img = await P.s("Page.captureScreenshot", { format:"png", clip:{x:r.x,y:r.y,width:r.w,height:r.h,scale: r.w>900?0.72:1}, captureBeyondViewport:true });
  fs.writeFileSync(new URL("../shots/"+name, import.meta.url), Buffer.from(img.data,"base64"));
  console.log(name, JSON.stringify(r));
  await P.close();
}
b.close();
