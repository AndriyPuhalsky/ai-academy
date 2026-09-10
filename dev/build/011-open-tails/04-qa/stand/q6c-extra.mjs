// К5 (висота списку), К11 (зняття атрибута), К12 (нічого не зламано поруч) + причина +12 px.
import { browser, sleep, waitFor, CLS_PROBE, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const BASE = process.env.BASE || "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const S = process.env.S || "/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/shots";
const b = await browser();
const out = {};
async function key(P, k, code, vk) { for (const t of ["keyDown", "keyUp"]) await P.s("Input.dispatchKeyEvent", { type: t, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); }

// К5: фактична висота вмісту сайдбара на високому вікні
{
  const P = await b.page();
  await P.inject(`try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}` + CLS_PROBE + CONSOLE_PROBE);
  await P.viewport(1280, 1300);
  await P.goto(`${BASE}/modules/module-05`);
  await waitFor(P, "document.querySelectorAll('#moduleSidebar a, #moduleSidebar li').length > 3", 15000);
  await sleep(1500);
  out.k5 = await P.eval(`(function(){ var s=document.getElementById('moduleSidebar'); var cs=getComputedStyle(s);
    var kids=[].slice.call(s.children); var contentH = kids.reduce(function(a,e){ var r=e.getBoundingClientRect(); return a + r.height; }, 0);
    return { boxH: Math.round(s.getBoundingClientRect().height), scrollH: s.scrollHeight, clientH: s.clientHeight,
      contentH: Math.round(contentH), minH: cs.minHeight, maxH: cs.maxHeight, overflowY: cs.overflowY,
      порожнєПоле: Math.round(s.getBoundingClientRect().height - contentH),
      посилань: s.querySelectorAll('a').length, cls: +window.__cls.value.toFixed(4) }; })()`);
  const sh = await P.s("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${S}/D6-module05-1280x1300.png`, Buffer.from(sh.data, "base64"));
  await P.close();
}
// Причина +12 px: A/B через CSSOM — повертаємо успадкований scrollbar-color, ::-webkit-* вимикається
{
  for (const off of [false, true]) {
    const P = await b.page({ blocked: ["*supabase*"] });
    await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}` + (off ? `
      document.addEventListener('DOMContentLoaded', function(){
        var st=document.createElement('style');
        st.textContent='.ds-tbl__wrap,.ds-diag > pre.mermaid,.term > .term__body,.ds-code > .ds-code__pre,.ds-prose > .ds-code__pre,.ds-prose > section > .ds-code__pre{scrollbar-color: var(--c-line) transparent !important;}';
        document.head.appendChild(st); });` : ""));
    await P.viewport(1280, 900);
    await P.goto(`${BASE}/modules/module-05`);
    await sleep(2600);
    out[off ? "смугаВимкнена" : "смугаУвімкнена"] = await P.eval(`(function(){
      var sc=[].filter.call(document.querySelectorAll('.ds-tbl__wrap, .ds-diag > pre.mermaid, .term > .term__body, .ds-code > .ds-code__pre, .ds-prose > .ds-code__pre, .ds-prose > section > .ds-code__pre'), function(e){return e.scrollWidth-e.clientWidth>1;});
      return { скролерів: sc.length, смуги: sc.map(function(e){ var cs=getComputedStyle(e); return Math.round(e.offsetHeight-(parseFloat(cs.borderTopWidth)||0)-(parseFloat(cs.borderBottomWidth)||0)-e.clientHeight); }),
        footerTop: Math.round(document.querySelector('footer').getBoundingClientRect().top),
        docH: document.documentElement.scrollHeight }; })()`);
    await P.close();
  }
}
// К11: зняття атрибута на розблокуванні (реальне виконання гілки else) — без бази, лише подія
{
  const P = await b.page();
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/modules/architect-05`);
  await waitFor(P, "!!document.getElementById('aiaGate')", 15000);
  await sleep(1200);
  const before = await P.eval(`({ attr: document.documentElement.getAttribute('data-aia-gate'), gate: !!document.getElementById('aiaGate'),
    hidden: [].filter.call(document.getElementById('main').children, function(c){return c.hidden}).length })`);
  // Імітуємо, що прогрес прийшов і модуль відкритий: подія, яку слухає js/module.js
  const after = await P.eval(`(function(){
    try {
      var codes = (window.AIA_MODULE_MAP ? Object.keys(window.AIA_MODULE_MAP) : []);
      document.dispatchEvent(new CustomEvent('aia:progress', { detail: { completed: codes, all: true } }));
    } catch(e) { return { err: String(e) }; }
    return null; })()`);
  await sleep(900);
  const now = await P.eval(`({ attr: document.documentElement.getAttribute('data-aia-gate'), gate: !!document.getElementById('aiaGate'),
    hidden: [].filter.call(document.getElementById('main').children, function(c){return c.hidden}).length })`);
  out.k11 = { before, dispatch: after, after: now };
  await P.close();
}
// К12: сайдбар прокручується, sticky, шторка на 390, Tab, друк
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/modules/architect-05`);
  await sleep(2500);
  out.k12desktop = await P.eval(`(function(){ var s=document.getElementById('moduleSidebar'); var cs=getComputedStyle(s);
    var beforeTop = Math.round(s.getBoundingClientRect().top);
    s.scrollTop = 200; var scrolled = s.scrollTop;
    window.scrollTo(0, 1200);
    var afterTop = Math.round(s.getBoundingClientRect().top);
    window.scrollTo(0,0);
    return { position: cs.position, top: cs.top, overflowY: cs.overflowY, scrollHeight: s.scrollHeight, clientHeight: s.clientHeight,
      внутрішняПрокрутка: scrolled, stickyTopДо: beforeTop, stickyTopПісля: afterTop, zIndex: cs.zIndex }; })()`);
  // Tab через сайдбар
  await P.eval(`(function(){ var a=document.querySelector('#moduleSidebar a'); if(a) a.focus(); })()`);
  const tabs = [];
  for (let i = 0; i < 4; i++) { await key(P, "Tab", "Tab", 9); await sleep(70); tabs.push(await P.eval(`(function(){var a=document.activeElement;return {tag:a.tagName, inSidebar: !!a.closest('#moduleSidebar'), txt:(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26), ring: getComputedStyle(a).boxShadow.slice(0,40)};})()`)); }
  out.k12tab = tabs;
  // друк
  await P.s("Emulation.setEmulatedMedia", { media: "print" });
  await sleep(300);
  out.k12print = await P.eval(`(function(){ var s=document.getElementById('moduleSidebar'); var cs=getComputedStyle(s); return { display: cs.display, visibility: cs.visibility }; })()`);
  await P.s("Emulation.setEmulatedMedia", { media: "" });
  await P.close();
}
// К12: шторка на 390
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject(CONSOLE_PROBE + `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}`);
  await P.viewport(390, 844, true);
  await P.goto(`${BASE}/modules/architect-05`);
  await sleep(2500);
  const st0 = await P.eval(`(function(){ var s=document.getElementById('moduleSidebar'); var btn=document.getElementById('sidebarBtn');
    return { expanded: btn && btn.getAttribute('aria-expanded'), transform: getComputedStyle(s).transform, visibility: getComputedStyle(s).visibility, minH: getComputedStyle(s).minHeight }; })()`);
  await P.eval(`document.getElementById('sidebarBtn').click()`); await sleep(600);
  const st1 = await P.eval(`(function(){ var s=document.getElementById('moduleSidebar'); var btn=document.getElementById('sidebarBtn');
    return { expanded: btn.getAttribute('aria-expanded'), transform: getComputedStyle(s).transform, visibility: getComputedStyle(s).visibility, left: Math.round(s.getBoundingClientRect().left) }; })()`);
  await P.eval(`document.getElementById('sidebarBtn').click()`); await sleep(600);
  const st2 = await P.eval(`(function(){ var s=document.getElementById('moduleSidebar'); var btn=document.getElementById('sidebarBtn');
    return { expanded: btn.getAttribute('aria-expanded'), transform: getComputedStyle(s).transform, visibility: getComputedStyle(s).visibility }; })()`);
  out.k12drawer = { закрита: st0, відкрита: st1, зновуЗакрита: st2, errors: await P.eval(`window.__log.errors`) };
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
