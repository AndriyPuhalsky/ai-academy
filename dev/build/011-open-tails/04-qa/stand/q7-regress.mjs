// Регресійний мінімум: три лендінги, урок кожного курсу, /roadmap, /verify, /certificate.
// Консоль, горизонтальний скрол, CLS (критерій 7 рішення 1), prefers-reduced-motion.
import { browser, sleep, waitFor, CLS_PROBE, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = [];
const PAGES = [
  ["index", false], ["architect", false], ["claude-code", false],
  ["roadmap", false], ["verify", false], ["certificate", false],
  ["modules/module-05", true], ["modules/architect-08", true], ["modules/claude-code-10", true],
];
for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  for (const [pg, lesson] of PAGES) {
    const P = await b.page(lesson ? { blocked: ["*supabase*"] } : {});
    await P.inject(CLS_PROBE + CONSOLE_PROBE + (lesson ? `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}` : `try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}`));
    await P.viewport(w, h, w < 700);
    await P.goto(`${BASE}/${pg}`);
    await waitFor(P, "document.fonts.status==='loaded'", 12000);
    await sleep(2000);
    const r = await P.eval(`({ pageX: document.documentElement.scrollWidth - window.innerWidth,
      cls: +window.__cls.value.toFixed(4),
      clsTop: window.__cls.entries.slice().sort(function(a,c){return c.v-a.v;}).slice(0,2).map(function(e){return e.v+' ['+e.src.join(',')+']';}),
      errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections,
      title: document.title.slice(0,40) })`);
    const bad = P.browserLog.filter((e) => e.level === "error").map((e) => e.text.slice(0, 100));
    out.push({ w, h, pg, ...r, browserErrors: bad });
    if (w === 390 && ["index", "claude-code", "roadmap"].includes(pg)) {
      const sh = await P.s("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(`${S}/REG-${pg.replace(/\//g, "_")}-390.png`, Buffer.from(sh.data, "base64"));
    }
    await P.close();
  }
}
// prefers-reduced-motion на лендінгу й уроці
for (const [pg, lesson] of [["claude-code", false], ["modules/claude-code-10", true], ["index", false]]) {
  const P = await b.page(lesson ? { blocked: ["*supabase*"] } : {});
  await P.inject(CLS_PROBE + CONSOLE_PROBE + (lesson ? `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}` : ""));
  await P.viewport(1440, 900);
  await P.s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "document.fonts.status==='loaded'", 12000);
  await sleep(2000);
  out.push({ w: 1440, h: 900, pg: pg + " [reduce]", ...(await P.eval(`(function(){
    var els=[].slice.call(document.querySelectorAll('[data-page-in], [data-reveal], .ds-h1, h1, h2, .cc-row'));
    var invisible=els.filter(function(e){ var cs=getComputedStyle(e); return parseFloat(cs.opacity)<0.99 || cs.visibility==='hidden'; });
    var anim=els.filter(function(e){ var cs=getComputedStyle(e); return cs.transitionDuration!=='0s' && parseFloat(cs.transitionDuration)>0.05; });
    return { перевірено: els.length, невидимих: invisible.length,
      зразокНевидимих: invisible.slice(0,3).map(function(e){return (e.className||e.tagName).toString().slice(0,26)+':'+getComputedStyle(e).opacity;}),
      зПереходом: anim.length, cls: +window.__cls.value.toFixed(4), pageX: document.documentElement.scrollWidth-window.innerWidth,
      errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections }; })()`)) });
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
