// Критерій 9 рішення 1: колір смуги однаковий на трьох курсах (не залежить від акценту).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
for (const [pg, tag] of [["modules/module-05", "academy"], ["modules/architect-08", "architect"], ["modules/claude-code-10", "terminal"]]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(390, 844, true);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "document.fonts.status==='loaded'", 12000); await sleep(900);
  const r = await P.eval(`(function(){
    var el=[].filter.call(document.querySelectorAll('.ds-tbl__wrap, .term > .term__body, .ds-code > .ds-code__pre'), function(e){return e.scrollWidth-e.clientWidth>1 && e.getBoundingClientRect().height<600;})[0];
    if(!el) return null; window.__p=el; var r0=el.getBoundingClientRect();
    window.scrollBy(0, r0.bottom - (window.innerHeight - 60)); el.scrollLeft=0;
    var r1=el.getBoundingClientRect();
    return { course: document.documentElement.getAttribute('data-course'),
      accent: getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim(),
      lineStrong: getComputedStyle(document.documentElement).getPropertyValue('--c-line-strong').trim(),
      px: Math.round(r1.left+window.scrollX), pbottom: Math.round(r1.bottom+window.scrollY), w: Math.round(r1.width), cls: el.className.slice(0,24) };
  })()`);
  if (r) {
    await sleep(300);
    const sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: r.px, y: r.pbottom - 13, width: r.w, height: 13, scale: 1 } });
    fs.writeFileSync(`${S}/D1-platform-${tag}-390.png`, Buffer.from(sh.data, "base64"));
  }
  out[tag] = r;
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
