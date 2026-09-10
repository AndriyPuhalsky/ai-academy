// Гостьовий стан /certificate: текст, кнопка входу в акценті курсу, доступність (крит. 1, 13).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
async function shot(P, p) { const r = await P.s("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(p, Buffer.from(r.data, "base64")); }
for (const q of ["?from=claude-code", ""]) {
  const P = await b.page();
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/certificate${q}`);
  await waitFor(P, "document.getElementById('certList') ? document.getElementById('certList').textContent.trim().length>0 : document.getElementById('main').textContent.length>300", 15000);
  await sleep(1500);
  out[q || "(без)"] = await P.eval(`(function(){
    var m=document.getElementById('main');
    var btns=[].map.call(m.querySelectorAll('a,button'), function(e){ var cs=getComputedStyle(e);
      return { t: e.textContent.replace(/\\s+/g,' ').trim().slice(0,40), href: e.getAttribute('href'), bg: cs.backgroundColor, color: cs.color }; });
    return { text: m.textContent.replace(/\\s+/g,' ').trim().slice(0,320), btns: btns,
      accent: getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() };
  })()`);
  await shot(P, `${S}/D4-guest${q ? "-terminal" : "-academy"}.png`);
  // 13: skip-link працює, порядок табуляції шапки
  const tabs = [];
  await P.eval(`document.body.focus(); if(document.activeElement && document.activeElement.blur) document.activeElement.blur();`);
  for (let i = 0; i < 7; i++) {
    await key(P, "Tab", "Tab", 9); await sleep(90);
    tabs.push(await P.eval(`(function(){var a=document.activeElement;var cs=getComputedStyle(a);return {tag:a.tagName, id:a.id||null, cls:(a.className||'').toString().slice(0,22), txt:(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,24), ring: cs.boxShadow.slice(0,60)};})()`));
  }
  out[(q || "(без)") + ":tab"] = tabs;
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
