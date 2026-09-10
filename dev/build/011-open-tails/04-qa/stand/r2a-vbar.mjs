// КОЛО 2 · D-01: чи видно ВЕРТИКАЛЬНИЙ повзунок у .ds-tbl__wrap--tall після фікса d7ec232.
// Обидві таблиці /claude-code-ref-settings, ширини 390/640/1024 + контроль 1280,
// стани data-scroll-fade: right (scrollLeft=0), both (середина), left (кінець).
// A/B: маска як є проти mask-image:none. Знімок правого жолоба + широкої смуги краю.
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = [];
for (const [w, h] of [[390, 844], [640, 900], [1024, 800], [1280, 800]]) {
  for (const maskOff of [false, true]) {
    const P = await b.page({ blocked: ["*supabase*"] });
    await P.inject(CONSOLE_PROBE);
    await P.viewport(w, h, w < 700);
    await P.goto(`${BASE}/claude-code-ref-settings`);
    await waitFor(P, "document.fonts.status==='loaded'", 15000);
    await sleep(600);
    if (maskOff) await P.eval(`(function(){var st=document.createElement('style');st.textContent='.ds-tbl__wrap{mask-image:none !important;-webkit-mask-image:none !important;}';document.head.appendChild(st);})()`);
    await sleep(250);
    const n = await P.eval(`document.querySelectorAll('.ds-tbl__wrap--tall').length`);
    for (let i = 0; i < n; i++) {
      for (const st of ["right", "both", "left"]) {
        const r = await P.eval(`(function(){
          var el = document.querySelectorAll('.ds-tbl__wrap--tall')[${i}];
          var max = el.scrollWidth - el.clientWidth;
          el.scrollTop = 0;
          el.scrollLeft = ${JSON.stringify(st)} === 'right' ? 0 : (${JSON.stringify(st)} === 'both' ? Math.round(max/2) : max);
          var r0 = el.getBoundingClientRect();
          window.scrollTo(0, Math.round(r0.top + window.scrollY - 40));
          return { max: max, vscroll: el.scrollHeight - el.clientHeight };
        })()`);
        await sleep(350);
        const g = await P.eval(`(function(){
          var el = document.querySelectorAll('.ds-tbl__wrap--tall')[${i}];
          var r = el.getBoundingClientRect(); var cs = getComputedStyle(el);
          return { px: Math.round(r.left + window.scrollX), py: Math.round(r.top + window.scrollY),
            w: Math.round(r.width), h: Math.round(r.height),
            fade: el.getAttribute('data-scroll-fade'), sl: Math.round(el.scrollLeft),
            hscroll: el.scrollWidth - el.clientWidth, vscroll: el.scrollHeight - el.clientHeight,
            vbar: el.offsetWidth - (parseFloat(cs.borderLeftWidth)||0) - (parseFloat(cs.borderRightWidth)||0) - el.clientWidth,
            hbar: el.offsetHeight - (parseFloat(cs.borderTopWidth)||0) - (parseFloat(cs.borderBottomWidth)||0) - el.clientHeight,
            mask: (cs.maskImage||'').replace(/\s+/g,' ').slice(0,220) };
        })()`);
        const tag = `${w}-t${i}-${st}-${maskOff ? "off" : "on"}`;
        const hh = Math.min(g.h, 380);
        let sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: g.px + g.w - 20, y: g.py, width: 20, height: hh, scale: 1 } });
        fs.writeFileSync(`${S}/r2-vbar-${tag}.png`, Buffer.from(sh.data, "base64"));
        sh = await P.s("Page.captureScreenshot", { format: "png", clip: { x: g.px + g.w - 150, y: g.py, width: 150, height: hh, scale: 1 } });
        fs.writeFileSync(`${S}/r2-edge-${tag}.png`, Buffer.from(sh.data, "base64"));
        out.push({ w, table: i, state: st, mask: maskOff ? "off" : "on", ...g, expectMax: r.max, shotH: hh });
      }
    }
    const log = await P.eval(`({errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections})`);
    out.push({ w, mask: maskOff ? "off" : "on", console: log, net4xx: P.net.filter(x => x.status >= 400 || x.status === 0).map(x => x.status + " " + x.url.slice(0, 80)) });
    await P.close();
  }
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2a.out.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.filter(x => x.state), null, 1).slice(0, 4000));
b.close();
