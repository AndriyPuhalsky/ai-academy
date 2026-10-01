import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
await b.send("Browser.grantPermissions", { origin: D, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] });
for (const u of ["/", "/architect", "/claude-code", "/jira"]) {
  for (const w of [390, 768, 1280]) {
    const P = await b.page();
    await P.viewport(w, 900, w < 700);
    await P.goto(`${D}${u}`, 0); await P.eval("document.fonts.ready"); await sleep(2000);
    const pre = await P.eval(`(function(){
      var btns = Array.from(document.querySelectorAll("#donate [data-copy], #donate .ds-btn--copy, #donate button"));
      var ib = btns.filter(function(x){ return /UA\\d/.test(x.getAttribute("data-copy")||""); })[0] || btns.filter(function(x){return /Копіювати/.test(x.textContent);})[0];
      if (!ib) return JSON.stringify({err:"кнопки немає", n: btns.length});
      window.__ib = ib; var r = ib.getBoundingClientRect();
      return JSON.stringify({ label: ib.textContent.trim(), dataCopy: ib.getAttribute("data-copy"),
        x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2), visible: r.width>0 && r.top>=0,
        sect: Math.round(document.getElementById("donate").getBoundingClientRect().width),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth });
    })()`);
    const o = JSON.parse(pre);
    if (o.err) { console.log(`${u} @${w}: ${pre}`); await P.close(); continue; }
    // прокрутити кнопку у вʼюпорт і клікнути НАСПРАВДІ
    await P.eval(`window.__ib.scrollIntoView({block:"center"}),1`); await sleep(400);
    const pos = JSON.parse(await P.eval(`(function(){var r=window.__ib.getBoundingClientRect(); return JSON.stringify({x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)});})()`));
    await P.s("Input.dispatchMouseEvent", { type: "mousePressed", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
    await P.s("Input.dispatchMouseEvent", { type: "mouseReleased", x: pos.x, y: pos.y, button: "left", clickCount: 1 });
    await sleep(700);
    const clip = await P.eval(`navigator.clipboard.readText().then(function(t){return t;}).catch(function(e){return "ERR:"+e.message;})`);
    const after = await P.eval(`(function(){ return JSON.stringify({ label: window.__ib.textContent.trim(), aria: (document.getElementById("ariaLive")||{}).textContent }); })()`);
    console.log(`${u} @${w}: data-copy="${o.dataCopy}" → буфер="${clip}" збіг=${clip===o.dataCopy} | кнопка після кліку ${after} | скрол=${o.overflow}`);
    if (w === 1280 && u === "/claude-code") {
      const r = JSON.parse(await P.eval(`(function(){var e=document.getElementById("donate"); var b=e.getBoundingClientRect(); return JSON.stringify({x:Math.round(b.left+scrollX),y:Math.round(b.top+scrollY),w:Math.round(b.width),h:Math.round(b.height)});})()`));
      const img = await P.s("Page.captureScreenshot", { format:"png", clip:{...r, width:r.w, height:Math.min(r.h,1200), scale:1}, captureBeyondViewport:true });
      fs.writeFileSync(new URL("../shots/donate-terminal-1280.png", import.meta.url), Buffer.from(img.data,"base64"));
    }
    if (w === 1280 && u === "/jira") {
      const r = JSON.parse(await P.eval(`(function(){var e=document.getElementById("donate"); var b=e.getBoundingClientRect(); return JSON.stringify({x:Math.round(b.left+scrollX),y:Math.round(b.top+scrollY),w:Math.round(b.width),h:Math.round(b.height)});})()`));
      const img = await P.s("Page.captureScreenshot", { format:"png", clip:{...r, width:r.w, height:Math.min(r.h,1200), scale:1}, captureBeyondViewport:true });
      fs.writeFileSync(new URL("../shots/donate-jira-1280.png", import.meta.url), Buffer.from(img.data,"base64"));
    }
    await P.close();
  }
}
b.close();
