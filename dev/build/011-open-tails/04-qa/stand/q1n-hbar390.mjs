// Чи видно ГОРИЗОНТАЛЬНУ смугу на тій самій --tall таблиці при 390 (щоб дефект був описаний точно).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const P = await b.page({ blocked: ["*supabase*"] });
await P.inject(CONSOLE_PROBE);
await P.viewport(390, 844, true);
await P.goto(`${BASE}/claude-code-ref-settings`);
await waitFor(P, "document.fonts.status==='loaded'", 12000); await sleep(500);
const r = await P.eval(`(function(){
  var el=[].filter.call(document.querySelectorAll('.ds-tbl__wrap--tall'), function(e){return e.scrollHeight-e.clientHeight>1;})[0];
  var r0=el.getBoundingClientRect(); window.scrollBy(0, r0.bottom-(window.innerHeight-60)); el.scrollLeft=0;
  var r1=el.getBoundingClientRect();
  return { px: Math.round(r1.left+window.scrollX), pbottom: Math.round(r1.bottom+window.scrollY), w: Math.round(r1.width), fade: el.getAttribute('data-scroll-fade') }; })()`);
await sleep(300);
const sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: r.px, y: r.pbottom - 14, width: r.w, height: 14, scale: 1 } });
fs.writeFileSync(`${S}/D1-tall-390-hbar.png`, Buffer.from(sh.data, "base64"));
console.log(JSON.stringify(r));
await P.close(); b.close();
