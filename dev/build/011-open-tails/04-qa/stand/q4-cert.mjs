// Рішення 4 — бренд /certificate за точкою входу. Критерії 1–8, 12, 13 (9–11 потребують акаунта).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function shot(P, p) { const r = await P.s("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(p, Buffer.from(r.data, "base64")); }
const READ = `(function(){
  var q=function(id){return document.getElementById(id);};
  var cs=getComputedStyle(document.documentElement);
  return { title: document.title,
    mono: q('certBrandMark') && q('certBrandMark').textContent,
    name: q('certBrandName') && q('certBrandName').textContent,
    brandHref: q('certBrandLink') && q('certBrandLink').getAttribute('href'),
    courseHref: q('certCourseLink') && q('certCourseLink').getAttribute('href'),
    course: document.documentElement.getAttribute('data-course'),
    accent: cs.getPropertyValue('--c-accent').trim(),
    tokenTerminal: cs.getPropertyValue('--p-accent-terminal-500').trim(),
    tokenArchitect: cs.getPropertyValue('--p-accent-architect-500').trim(),
    tokenAcademy: cs.getPropertyValue('--p-accent-academy-500').trim(),
    AIA_CERT: window.AIA_CERT || null,
    sess: (function(){ try { return sessionStorage.getItem('aia:certFrom'); } catch(e){ return 'НЕДОСТУПНО'; } })(),
    bodyHead: (document.getElementById('main')||document.body).textContent.replace(/\\s+/g,' ').trim().slice(0,150),
    skip: !!document.querySelector('.ds-skip'), ariaLive: !!document.getElementById('ariaLive'),
    referrer: document.referrer };
})()`;

// 1,5,6,8: прямі входи
for (const q of ["?from=claude-code", "?from=architect", "", "?from=неіснуючий"]) {
  const P = await b.page();
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/certificate${q}`);
  await waitFor(P, "document.readyState==='complete'", 12000);
  await sleep(1600);
  const r = await P.eval(READ);
  const log = await P.eval(`({errors: window.__log.errors, warns: window.__log.warns.filter(function(t){return t.indexOf('cdn.tailwindcss.com')<0}), rej: window.__log.rejections})`);
  out[`прямий:${q || "(без параметра)"}`] = { ...r, log };
  if (q === "?from=claude-code") await shot(P, `${S}/D4-cert-terminal-1280.png`);
  if (q === "") await shot(P, `${S}/D4-cert-academy-1280.png`);
  await P.close();
}
// 2,3,4: за referrer (справжня JS-навігація з відповідної сторінки)
for (const [from, label] of [["claude-code", "лендінг Термінала"], ["modules/architect-05", "урок Architect"], ["modules/module-05", "урок Академії"], ["modules/claude-code-08", "урок Термінала"]]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/${from}`);
  await sleep(900);
  await P.eval(`location.href = '/certificate'`);
  await sleep(2200);
  out[`referrer:${label}`] = await P.eval(READ);
  await P.close();
}
// 2-біс: справжній клік по футерному посиланню лендінга Термінала
{
  const P = await b.page();
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/claude-code`);
  await sleep(1200);
  const found = await P.eval(`(function(){
    var a=[].filter.call(document.querySelectorAll('a[href]'), function(e){ return /certificate/.test(e.getAttribute('href')||''); });
    if(!a.length) return {n:0};
    a[0].scrollIntoView({block:'center'});
    window.__link=a[0];
    return { n:a.length, text: a[0].textContent.replace(/\\s+/g,' ').trim(), href: a[0].getAttribute('href') };
  })()`);
  if (found.n) { await P.eval(`window.__link.click()`); await sleep(2200); out["клік у футері /claude-code"] = { link: found, ...(await P.eval(READ)) }; }
  else out["клік у футері /claude-code"] = found;
  await P.close();
}
// 12: сховище недоступне (імітація приватного вікна)
{
  const P = await b.page();
  await P.inject(`try{ Object.defineProperty(window,'sessionStorage',{ get: function(){ throw new DOMException('denied'); } }); }catch(e){}` + CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/certificate?from=claude-code`);
  await sleep(1800);
  const r = await P.eval(READ);
  const log = await P.eval(`({errors: window.__log.errors, rej: window.__log.rejections})`);
  out["сховище недоступне"] = { ...r, log };
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
