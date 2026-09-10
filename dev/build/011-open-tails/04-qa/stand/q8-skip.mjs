// Чи це платформна норма: skip-link на трьох сторінках — куди їде фокус після Enter.
import { browser, sleep } from "./qcdp.mjs";
const BASE = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser();
const out = {};
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }
for (const pg of ["index", "verify", "certificate", "roadmap"]) {
  const P = await b.page();
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/${pg}`);
  await sleep(1600);
  await key(P, "Tab", "Tab", 9); await sleep(150);
  const skip = await P.eval(`({ cls:(document.activeElement.className||'').toString().slice(0,12), href: document.activeElement.getAttribute('href') })`);
  await key(P, "Enter", "Enter", 13); await sleep(400);
  await key(P, "Tab", "Tab", 9); await sleep(200);
  out[pg] = { skip, післяEnterІTab: await P.eval(`({ tag: document.activeElement.tagName, id: document.activeElement.id||null, txt: (document.activeElement.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26), inMain: !!document.activeElement.closest('#main'), mainTabindex: (document.getElementById('main')||{}).getAttribute && document.getElementById('main').getAttribute('tabindex') })`) };
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
