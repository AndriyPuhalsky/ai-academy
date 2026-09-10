import { browser, sleep, waitFor, CLS_PROBE } from "./cdp.mjs";
const BASE = process.env.BASE || "http://127.0.0.1:8311";
const S = process.env.S;
const b = await browser();
const out = {};

// (a) мобільне меню лендінга у прокрученому стані
for (const pageName of ["claude-code.html", "index.html"]) {
  const P = await b.page();
  await P.viewport(390, 844, true);
  await P.goto(`${BASE}/${pageName}`, 800);
  const r = await P.eval(`(function(){
    window.scrollTo(0, 900);
    var before = { y: scrollY, docH: document.documentElement.scrollHeight };
    document.getElementById('menuBtn').click();
    var m = document.getElementById('mobileMenu'); var rc = m.getBoundingClientRect();
    var hdr = document.querySelector('.ds-hdr').getBoundingClientRect();
    return { before: before, afterY: scrollY, docH: document.documentElement.scrollHeight,
      menu: { top: Math.round(rc.top), bottom: Math.round(rc.bottom), h: Math.round(rc.height), display: getComputedStyle(m).display, pos: getComputedStyle(m).position },
      hdr: { top: Math.round(hdr.top), bottom: Math.round(hdr.bottom) }, lock: document.documentElement.className, vh: innerHeight };
  })()`);
  out["menu@" + pageName] = r;
  await P.shot(`${S}/shots/t1-menu-scrolled-${pageName}.png`);
  await P.close();
}

// (b) гість на заблокованому уроці: CLS і час появи замка
out.gate = [];
for (let i = 0; i < 2; i++) {
  const P = await b.page({ noCache: true });
  await P.viewport(390, 844, true);
  await P.inject(CLS_PROBE + `
    window.__gate = null; window.__auth = null;
    document.addEventListener('aia:auth', function(){ if(window.__auth==null) window.__auth = Math.round(performance.now()); });
    new MutationObserver(function(){ if (!window.__gate && document.getElementById('aiaGate')) window.__gate = Math.round(performance.now()); }).observe(document.documentElement, {childList:true, subtree:true});`);
  await P.goto(`${BASE}/modules/claude-code-08.html`);
  await waitFor(P, "window.__gate != null", 8000);
  await sleep(1500);
  out.gate.push(await P.eval(`({ cls: +window.__cls.value.toFixed(4), entries: window.__cls.entries.slice(0,8), gateAt: window.__gate, authAt: window.__auth, footerTop: Math.round(document.querySelector('footer').getBoundingClientRect().top), vh: innerHeight })`));
  await P.close();
}

// (c) висоти вузлів hero лендінга Термінала по ширинах (після гідратації)
out.hero = [];
const widths = [320, 360, 390, 414, 600, 640, 700, 768, 820, 900, 1024, 1100, 1180, 1280, 1366, 1440, 1600, 1920];
const P = await b.page();
for (const w of widths) {
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/claude-code.html`);
  await waitFor(P, "document.getElementById('heroLead').textContent.length > 0 && document.fonts.status === 'loaded'", 8000);
  await sleep(300);
  const r = await P.eval(`(function(){
    function h(sel){ var e=document.querySelector(sel); var r=e.getBoundingClientRect(); return { h:+r.height.toFixed(1), w:+r.width.toFixed(1) }; }
    var lead=document.getElementById('heroLead'); var cs=getComputedStyle(lead);
    var body=document.querySelector('.cc-hero__body');
    return { w: innerWidth, title: h('.cc-hero__title'), lead: h('.cc-hero__lead'), cta: h('.cc-hero__cta'), explain: h('.cc-hero__explain'), stats: h('.cc-hero__stats'),
      body: h('.cc-hero__body'), leadFs: cs.fontSize, leadLh: cs.lineHeight, leadLines: Math.round(lead.getBoundingClientRect().height / parseFloat(cs.lineHeight)),
      explLines: Math.round(document.querySelector('.cc-hero__explain').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('.cc-hero__explain')).lineHeight)),
      ctaBtns: [].map.call(document.querySelectorAll('.cc-hero__cta a'), function(a){ return Math.round(a.getBoundingClientRect().width); }) };
  })()`);
  out.hero.push(r);
}
await P.close();

// (d) базовий CLS лендінга Термінала на пʼяти ширинах (1 прогін, без кешу)
out.clsLanding = [];
for (const w of [320, 390, 768, 1024, 1440]) {
  const Q = await b.page({ noCache: true });
  await Q.viewport(w, 900, w < 700);
  await Q.inject(CLS_PROBE);
  await Q.goto(`${BASE}/claude-code.html`, 3500);
  out.clsLanding.push({ w, cls: await Q.eval("+window.__cls.value.toFixed(4)"), entries: await Q.eval("window.__cls.entries.slice(0,6)") });
  await Q.close();
}

console.log(JSON.stringify(out, null, 1));
b.close();
