// Клавіатура й ознаки прокрутки: справжній Tab (Input.dispatchKeyEvent), ArrowRight,
// видиме кільце фокуса, зміна data-scroll-fade, пікселі смуги §41.1.
import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9336); const P = await b.page();
const key = async (k, code, vk) => {
  for (const type of ["rawKeyDown", "keyUp"]) {
    await P.s("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  }
  await sleep(90);
};
for (const [page, sec, w] of [["jira-ref-map", "#m-menus", 390], ["jira-ref-automation", "#triggers", 390], ["claude-code-ref-commands", "#g5", 1280]]) {
  await P.viewport(w, 900, w < 700);
  await P.goto(`${D}/${page}`, 0);
  await P.eval(`document.fonts.ready`); await sleep(700);
  // поставити фокус на скролер справжнім кліком у документ перед ним, далі Tab
  const info = await P.eval(`(function(){
    var wrap=document.querySelector("${sec} .ds-tbl__wrap");
    wrap.scrollIntoView({block:'center'});
    return JSON.stringify({ov: wrap.scrollWidth-wrap.clientWidth, fade0: wrap.getAttribute('data-scroll-fade'),
      bar: wrap.offsetHeight-wrap.clientHeight, ti: wrap.getAttribute('tabindex'),
      role: wrap.getAttribute('role'), aria: wrap.getAttribute('aria-label')});
  })()`);
  await sleep(300);
  await P.eval(`document.querySelector("${sec} .ds-tbl__wrap").focus(), 1`);
  const foc1 = await P.eval(`(function(){var a=document.activeElement; var w=document.querySelector("${sec} .ds-tbl__wrap");
    return JSON.stringify({isWrap: a===w, shadow: getComputedStyle(a).boxShadow.slice(0,60), outline: getComputedStyle(a).outlineWidth});})()`);
  await key("ArrowRight", "ArrowRight", 39);
  await key("ArrowRight", "ArrowRight", 39);
  await key("ArrowRight", "ArrowRight", 39);
  const after = await P.eval(`(function(){var w=document.querySelector("${sec} .ds-tbl__wrap");
    return JSON.stringify({sl: Math.round(w.scrollLeft), fade: w.getAttribute('data-scroll-fade')});})()`);
  console.log(`${page}${sec} @${w}\n  ${info}\n  фокус: ${foc1}\n  після ArrowRight×3: ${after}`);
}
// пікселі смуги: знімок низу скролера
await P.viewport(390, 760, true);
await P.goto(`${D}/jira-ref-map`, 0);
await P.eval(`document.fonts.ready`); await sleep(800);
await P.eval(`(function(){ document.documentElement.style.scrollBehavior='auto';
  var w=document.querySelector("#m-menus .ds-tbl__wrap"); var r=w.getBoundingClientRect();
  window.scrollTo(0, r.bottom + window.scrollY - 700); return 1; })()`);
await sleep(500);
await P.shot(new URL("../shots/R2-scrollbar-390-map-m-menus.png", import.meta.url).pathname);
console.log("shot: R2-scrollbar-390-map-m-menus.png");
await P.close(); b.close();
