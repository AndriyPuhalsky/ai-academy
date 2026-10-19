// Знімок блока: підганяємо висоту вікна під блок, скролимо під липку шапку,
// знімаємо все вікно БЕЗ clip (clip на далеко прокрученій сторінці дає порожній PNG).
import { browser, sleep } from "./cdp.mjs";
const D = process.env.QA_BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const EXT = process.env.QA_EXT || "";
const [page, sec, width, out] = process.argv.slice(2);
const b = await browser(9336); const P = await b.page();
await P.viewport(Number(width), 900, Number(width) < 700);
await P.goto(`${D}/${page}${EXT}`, 0);
await P.eval(`document.fonts.ready`); await sleep(600);
const h = await P.eval(`(function(){
  document.documentElement.style.scrollBehavior='auto';
  var s=document.querySelector("${sec}");
  var el = s.querySelector('.ds-tbl__wrap') || s;
  return Math.min(1600, Math.ceil(el.getBoundingClientRect().height) + 170);
})()`);
await P.viewport(Number(width), h, Number(width) < 700);
await sleep(400);
await P.eval(`(function(){
  var s=document.querySelector("${sec}");
  var el = s.querySelector('.ds-tbl__wrap') || s;
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100);
  return 1; })()`);
await sleep(500);
await P.shot(new URL(`../shots/${out}`, import.meta.url).pathname);
console.log(out, "h=" + h);
await P.close(); b.close();
