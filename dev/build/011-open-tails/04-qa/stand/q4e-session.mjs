// Крит. 11 (гілка sessionStorage, без реального OAuth) і крит. 13 (skip-link справді працює).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const out = {};
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
const READ = `({ title: document.title, name: (document.getElementById('certBrandName')||{}).textContent,
  course: document.documentElement.getAttribute('data-course'), referrer: document.referrer,
  sess: (function(){try{return sessionStorage.getItem('aia:certFrom')}catch(e){return 'НЕДОСТУПНО'}})() })`;
{
  const P = await b.page();
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/certificate?from=claude-code`);
  await sleep(1500);
  out["1 крок: ?from=claude-code"] = await P.eval(READ);
  await P.eval(`location.href='/verify'`); await sleep(1600);
  out["2 крок: пішли на /verify"] = await P.eval(`({ url: location.pathname, sess: (function(){try{return sessionStorage.getItem('aia:certFrom')}catch(e){return null}})() })`);
  await P.eval(`location.href='/certificate?code=abc'`); await sleep(2200);
  out["3 крок: повернення з ?code= (referrer /verify)"] = await P.eval(READ);
  const log = await P.eval(`({errors: window.__log.errors.slice(0,3), rej: window.__log.rejections.slice(0,3)})`);
  out["3 крок: повернення з ?code= (referrer /verify)"].log = log;
  await P.close();
}
// skip-link
{
  const P = await b.page();
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/certificate?from=claude-code`);
  await sleep(1500);
  await key(P, "Tab", "Tab", 9); await sleep(150);
  const onSkip = await P.eval(`({ cls: (document.activeElement.className||'').toString(), txt: document.activeElement.textContent.trim(),
    transform: getComputedStyle(document.activeElement).transform, rect: Math.round(document.activeElement.getBoundingClientRect().top) })`);
  await key(P, "Enter", "Enter", 13); await sleep(500);
  const after = await P.eval(`({ hash: location.hash, scrollY: Math.round(window.scrollY),
    active: document.activeElement.id || document.activeElement.tagName,
    mainTop: Math.round(document.getElementById('main').getBoundingClientRect().top) })`);
  out.skip = { onSkip, after };
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
