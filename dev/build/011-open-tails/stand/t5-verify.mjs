// Перевірка правок 011 на робочому дереві (порт 8311).
import { browser, sleep, waitFor, CLS_PROBE } from "./cdp.mjs";
const BASE = process.env.BASE || "http://127.0.0.1:8311";
const S = process.env.S;
const b = await browser();
const out = {};

// 1) роадмап: три курси
out.roadmap = {};
for (const q of ["", "?from=architect", "?from=claude-code", "?from=xyz"]) {
  const P = await b.page();
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/roadmap.html${q}`);
  await waitFor(P, "document.documentElement.classList.contains('rm-ready')", 8000);
  out.roadmap[q || "(none)"] = await P.eval(`({ back: document.getElementById('backLabel').textContent, href: document.getElementById('backLink').getAttribute('href'), brand: document.querySelector('[data-brand]').textContent, course: document.documentElement.getAttribute('data-course'), accent: getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim(), nsBack: (document.querySelector('[data-brand-back]')||{getAttribute:function(){return '(noscript)'}}).getAttribute('href') })`);
  await P.close();
}

// 2) Mermaid на живих сторінках: усі svg, тема, без сміття в body, без помилок консолі
out.mermaid = {};
for (const pg of ["modules/architect-08.html", "modules/claude-code-10.html", "modules/module-01.html", "modules/claude-code-23.html"]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.viewport(1280, 900);
  await P.inject("window.__errs=[];window.addEventListener('error',function(e){window.__errs.push(String(e.message))});var _ce=console.error;console.error=function(){window.__errs.push([].map.call(arguments,String).join(' ').slice(0,160));_ce.apply(console,arguments)};");
  await P.goto(`${BASE}/${pg}`);
  const ok = await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return p.length && [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')});})()", 20000);
  await sleep(300);
  out.mermaid[pg] = await P.eval(`(function(){ var p=document.querySelectorAll('pre.mermaid'); var s=document.querySelectorAll('pre.mermaid > svg');
    var fills=[].map.call(document.querySelectorAll('pre.mermaid svg .node rect, pre.mermaid svg .actor'),function(r){return getComputedStyle(r).fill;}).slice(0,3);
    return { ok: ${ok}, pre:p.length, svg:s.length, errRole:[].filter.call(s,function(x){return x.getAttribute('aria-roledescription')==='error'}).length,
      failed: document.querySelectorAll('[data-mermaid-failed]').length, fallbacks: document.querySelectorAll('.ds-diag__fallback').length,
      ids:[].map.call(s,function(x){return x.id}).slice(0,4), stray: document.querySelectorAll('body > div[id^="d"], body > div[id^="aia-mmd"]').length, fills: fills,
      errs: window.__errs.slice(0,5), scrollable: document.querySelectorAll('.ds-diag[data-scrollable]').length }; })()`);
  await P.close();
}

// 3) зламана діаграма (проба)
{
  const P = await b.page();
  await P.viewport(1280, 900);
  await P.goto(`${BASE}/dev/build/011-open-tails/_probe-broken-diagram.html`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')});})()", 15000);
  await sleep(300);
  out.probe = await P.eval(`(function(){ var r={}; ['ok1','broken','ok2'].forEach(function(k){ var d=document.querySelector('[data-testid='+k+']'); var pre=d.querySelector('pre.mermaid');
    r[k]={ svg: !!pre.querySelector('svg'), fallback: !!d.querySelector('.ds-diag__fallback'), fbText: (d.querySelector('.ds-diag__fallback')||{}).textContent||'', preText: pre.textContent.trim().slice(0,60), failed: pre.hasAttribute('data-mermaid-failed'), ws: getComputedStyle(pre).whiteSpace }; });
    r.stray = document.querySelectorAll('body > div[id^="d"], body > div[id^="aia-mmd"], body > svg').length; r.bodyLast = document.body.lastElementChild.tagName + '#' + document.body.lastElementChild.id; return r; })()`);
  await P.shot(`${S}/shots/t5-broken-probe.png`, true);
  await P.close();
}

// 4) гість на заблокованому уроці: коли стає замок, CLS, і чи цілі діаграми після зняття
out.gate = [];
for (let i = 0; i < 2; i++) {
  const P = await b.page({ noCache: true });
  await P.viewport(390, 844, true);
  await P.inject(CLS_PROBE + `
    window.__gate = null; window.__auth = null; window.__cfg = null;
    document.addEventListener('aia:auth', function(){ if(window.__auth==null) window.__auth = Math.round(performance.now()); });
    document.addEventListener('aia:config-ready', function(){ if(window.__cfg==null) window.__cfg = Math.round(performance.now()); });
    (function poll(){ if (document.getElementById && document.getElementById('aiaGate')) { if(!window.__gate) window.__gate = Math.round(performance.now()); return; } setTimeout(poll, 5); })();`);
  await P.goto(`${BASE}/modules/claude-code-08.html`);
  await waitFor(P, "window.__auth != null", 10000);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return p.length && [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')});})()", 15000);
  await sleep(500);
  const before = await P.eval(`({ cls: +window.__cls.value.toFixed(4), entries: window.__cls.entries.slice(0,6), gateAt: window.__gate, cfgAt: window.__cfg, authAt: window.__auth, gate: !!document.getElementById('aiaGate'), hiddenKids: [].filter.call(document.getElementById('main').children, function(c){return c.hidden}).length, footerTop: Math.round(document.querySelector('footer').getBoundingClientRect().top) })`);
  // імітуємо розблокування: прибираємо гейт і знімаємо hidden (без входу) → чи цілі діаграми
  await P.eval(`(function(){ var g=document.getElementById('aiaGate'); if(g) g.remove(); [].forEach.call(document.getElementById('main').children,function(c){c.hidden=false}); })()`);
  await sleep(600);
  const after = await P.eval(`(function(){ var r=[]; document.querySelectorAll('.ds-diag').forEach(function(box){ var svg=box.querySelector('svg'); var nodes=svg?svg.querySelectorAll('g.node'):[]; var ws=[].map.call(nodes,function(n){return Math.round(n.getBoundingClientRect().width)});
      r.push({ svgW: svg?Math.round(svg.getBoundingClientRect().width):null, nodes: nodes.length, minNodeW: ws.length?Math.min.apply(null,ws):null, scrollable: box.hasAttribute('data-scrollable'), sl: box.scrollLeft, labelsOverlap: (function(){ var ls=[].map.call(svg?svg.querySelectorAll('.nodeLabel'):[],function(l){return l.getBoundingClientRect()}); var o=0; for(var i=0;i<ls.length;i++)for(var j=i+1;j<ls.length;j++){ if(ls[i].width&&ls[j].width&&ls[i].left<ls[j].right&&ls[j].left<ls[i].right&&ls[i].top<ls[j].bottom&&ls[j].top<ls[i].bottom)o++; } return o; })() }); }); return r; })()`);
  out.gate.push({ before, after });
  if (i === 0) await P.shot(`${S}/shots/t5-gate-unhidden-diagrams.png`, true);
  await P.close();
}

// 5) D-26: корінь ширший за колонку — початок видно; D-19: центрування
out.d26 = {}; out.d19 = {};
{
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.viewport(390, 844, true);
  for (const pg of ["modules/claude-code-06.html", "modules/claude-code-12.html", "modules/claude-code-14.html", "modules/claude-code-18.html", "modules/claude-code-19.html", "modules/claude-code-21.html"]) {
    await P.goto(`${BASE}/${pg}`);
    await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');var s=document.querySelectorAll('pre.mermaid svg');return p.length===s.length;})()", 20000);
    await sleep(400);
    out.d26[pg] = await P.eval(`(function(){ var res=[]; document.querySelectorAll('.ds-diag').forEach(function(box,i){ var svg=box.querySelector('svg'); var nodes=svg?svg.querySelectorAll('g.node, .actor'):[]; var top=null,best=null;
      [].forEach.call(nodes,function(n){var r=n.getBoundingClientRect(); if(!r.width&&!r.height)return; if(top===null||r.top<top-1){top=r.top;best=r;} else if(r.top<=top+1&&best&&r.left<best.left){best=r;}});
      var br=box.getBoundingClientRect(); res.push({ i:i, rootLeft: best?Math.round(best.left-br.left):null, rootW: best?Math.round(best.width):null, sl: Math.round(box.scrollLeft), cw: box.clientWidth, scrollable: box.hasAttribute('data-scrollable') }); }); return res; })()`);
  }
  for (const [w, pg] of [[768, "modules/architect-03.html"], [768, "modules/architect-20.html"], [1440, "modules/claude-code-08.html"]]) {
    await P.viewport(w, 900, false);
    await P.goto(`${BASE}/${pg}`);
    await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');var s=document.querySelectorAll('pre.mermaid svg');return p.length===s.length;})()", 20000);
    await sleep(400);
    out.d19[w + ":" + pg] = await P.eval(`(function(){ var box=document.querySelector('.ds-diag'); var svg=box.querySelector('svg'); var pre=box.querySelector('pre.mermaid'); var br=box.getBoundingClientRect(), sr=svg.getBoundingClientRect(), pr=pre.getBoundingClientRect();
      return { cw: box.clientWidth, sw: box.scrollWidth, svgW: Math.round(sr.width), svgLeft: Math.round(sr.left-br.left), svgRight: Math.round(br.right-sr.right), preLeft: Math.round(pr.left-br.left), preW: Math.round(pr.width), scrollable: box.hasAttribute('data-scrollable') }; })()`);
  }
  await P.close();
}

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
  // спроба прокрутити під замком
  await P.eval("window.scrollBy(0, 300)");
  await sleep(100);
  const locked = await P.eval("({ y: Math.round(scrollY) })");
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
