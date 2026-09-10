// КОЛО 2 · дві перевірки на .ds-tbl__wrap--tall:
//  (A) стан data-scroll-fade="left" (прокручено вправо до кінця): А/Б «до фікса проти після» —
//      два нові правила §41 знімаються через CSSOM, як у method_ab_css_proof;
//  (B) кут між смугами (14×14 у правому нижньому куті) + кільце фокуса на самій --tall.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = [];
const DROP_NEW = `(function(){
  var n = 0;
  for (var i = 0; i < document.styleSheets.length; i++) {
    var ss = document.styleSheets[i]; var rules;
    try { rules = ss.cssRules; } catch(e) { continue; }
    for (var j = rules.length - 1; j >= 0; j--) {
      var t = rules[j].selectorText || '';
      if (t.indexOf('.ds-tbl__wrap--tall[data-scroll-fade') === 0) { ss.deleteRule(j); n++; }
    }
  }
  return n; })()`;
const MASK_OFF = `(function(){var st=document.createElement('style');st.textContent='.ds-tbl__wrap{mask-image:none !important;-webkit-mask-image:none !important;}';document.head.appendChild(st);return 1;})()`;
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
for (const [w, h] of [[390, 844], [640, 900], [1024, 800]]) {
  for (const variant of ["після", "до", "маскаOff"]) {
    const P = await b.page({ blocked: ["*supabase*"] });
    await P.inject(CONSOLE_PROBE);
    await P.viewport(w, h, w < 700);
    await P.goto(`${BASE}/claude-code-ref-settings`);
    await waitFor(P, "document.fonts.status==='loaded'", 15000);
    await sleep(600);
    let dropped = 0;
    if (variant === "до") dropped = await P.eval(DROP_NEW);
    if (variant === "маскаOff") dropped = await P.eval(MASK_OFF);
    await sleep(250);
    for (let i = 0; i < 2; i++) {
      // стан left: прокрутити вміст до правого кінця
      await P.eval(`(function(){ var el=document.querySelectorAll('.ds-tbl__wrap--tall')[${i}];
        el.scrollTop=0; el.scrollLeft = el.scrollWidth - el.clientWidth;
        var r=el.getBoundingClientRect(); window.scrollTo(0, Math.round(r.top+window.scrollY-40)); })()`);
      await sleep(400);
      const g = await P.eval(`(function(){ var el=document.querySelectorAll('.ds-tbl__wrap--tall')[${i}];
        var r=el.getBoundingClientRect(); var cs=getComputedStyle(el);
        return { px: Math.round(r.left+window.scrollX), py: Math.round(r.top+window.scrollY), w: Math.round(r.width), h: Math.round(r.height),
          fade: el.getAttribute('data-scroll-fade'), mask: (cs.maskImage||'').replace(/\\s+/g,' ').slice(0,200) }; })()`);
      const tag = `${w}-t${i}-left-${variant}`;
      let sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: g.px + g.w - 150, y: g.py, width: 150, height: Math.min(g.h, 380), scale: 1 } });
      fs.writeFileSync(`${S}/r2-leftstate-${tag}.png`, Buffer.from(sh.data, "base64"));
      // кут між смугами: 14×14 у правому нижньому куті боксу
      sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: g.px + g.w - 14, y: g.py + g.h - 14, width: 14, height: 14, scale: 1 } });
      fs.writeFileSync(`${S}/r2-corner-${tag}.png`, Buffer.from(sh.data, "base64"));
      out.push({ w, table: i, variant, dropped, fadeAttr: g.fade, maskImage: g.mask, box: [g.w, g.h] });
    }
    await P.close();
  }
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2b.out.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.map(x => ({ w: x.w, t: x.table, v: x.variant, dropped: x.dropped, fade: x.fadeAttr, mask: x.maskImage.slice(0, 120) })), null, 1));
b.close();
