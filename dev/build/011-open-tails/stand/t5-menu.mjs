// Секція 6 t5-verify.mjs окремо: мобільне меню (прокручений стан, замок, компенсація, низький екран). Перезнято 2026-09-10.
import { browser, sleep, waitFor, CLS_PROBE } from "./cdp.mjs";
const BASE = process.env.BASE || "http://127.0.0.1:8311";
const S = process.env.S;
const b = await browser();
const out = {};

// 6) мобільне меню: прокручений стан, спокій, низький екран
out.menu = {};
for (const pg of ["claude-code.html", "index.html", "architect.html"]) {
  const P = await b.page();
  await P.viewport(390, 844, true);
  await P.goto(`${BASE}/${pg}`, 700);
  const rest = await P.eval(`(function(){ var hero=document.querySelector('main').getBoundingClientRect().top; document.getElementById('menuBtn').click(); var m=document.getElementById('mobileMenu').getBoundingClientRect(); var hero2=document.querySelector('main').getBoundingClientRect().top;
    var r={ heroBefore: Math.round(hero), heroAfter: Math.round(hero2), menuTop: Math.round(m.top), menuBottom: Math.round(m.bottom), lock: document.documentElement.classList.contains('ds-lock'), counter: document.documentElement.getAttribute('data-aia-lock') };
    document.getElementById('menuBtn').click(); r.lockAfterClose = document.documentElement.classList.contains('ds-lock'); r.counterAfter = document.documentElement.getAttribute('data-aia-lock'); return r; })()`);
  await P.eval("window.scrollTo(0, 900)");
  await sleep(150);
  const scrolled = await P.eval(`(function(){ var y0=scrollY; document.getElementById('menuBtn').click(); var m=document.getElementById('mobileMenu').getBoundingClientRect(); var h=document.querySelector('.ds-hdr').getBoundingClientRect();
    return { y0:y0, y1: Math.round(scrollY), menuTop: Math.round(m.top), menuBottom: Math.round(m.bottom), hdrBottom: Math.round(h.bottom), visible: m.top >= 0 && m.top < innerHeight, lock: document.documentElement.classList.contains('ds-lock'), pos: getComputedStyle(document.getElementById('mobileMenu')).position }; })()`);
  await P.shot(`${S}/shots/t5-menu-scrolled-${pg}.png`);
  // спроба прокрутити під замком — СПРАВЖНІМ колесом (programmatic scrollBy під overflow:hidden усе одно прокручує, тому попередній замір нічого не доводив)
  await P.s("Input.dispatchMouseEvent", { type: "mouseWheel", x: 195, y: 600, deltaX: 0, deltaY: 300 });
  await sleep(250);
  const locked = await P.eval("({ y: Math.round(scrollY), lock: document.documentElement.classList.contains('ds-lock'), overflow: getComputedStyle(document.documentElement).overflow })");
  // закриваємо → відкат прокрутки
  const closed = await P.eval(`(function(){ document.getElementById('menuBtn').click(); return { y: Math.round(scrollY), lock: document.documentElement.classList.contains('ds-lock'), open: document.getElementById('mobileMenu').getAttribute('data-open') }; })()`);
  out.menu[pg] = { rest, scrolled, lockedScrollAttempt: locked, closed };
  await P.close();
}
{
  const P = await b.page();
  await P.viewport(640, 360, true);
  await P.goto(`${BASE}/index.html`, 700);
  out.menuShort = await P.eval(`(function(){ document.getElementById('menuBtn').click(); var m=document.getElementById('mobileMenu'); var r=m.getBoundingClientRect(); var cs=getComputedStyle(m);
    return { vh: innerHeight, top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), maxH: cs.maxHeight, scrollH: m.scrollHeight, clientH: m.clientHeight, canScroll: m.scrollHeight > m.clientHeight + 1 }; })()`);
  await P.shot(`${S}/shots/t5-menu-short-640x360.png`);
  await P.close();
}

console.log(JSON.stringify(out, null, 1));
b.close();
