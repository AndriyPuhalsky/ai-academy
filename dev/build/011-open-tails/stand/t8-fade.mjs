// Підказка скролу: стани атрибутів на всіх скролерах сторінки + знімки чотирьох типів.
import { browser, sleep, waitFor } from "./cdp.mjs";
const BASE = process.env.BASE || "http://127.0.0.1:8311";
const S = process.env.S;
const b = await browser();
const out = {};
const SEL = ".ds-tbl__wrap, .ds-diag > pre.mermaid, .term > .term__body, .ds-code > .ds-code__pre, .ds-prose > .ds-code__pre, .ds-prose > section > .ds-code__pre";
for (const [w, pg] of [[390, "modules/claude-code-10.html"], [1280, "modules/claude-code-10.html"], [1280, "claude-code-ref-hooks.html"], [390, "modules/architect-08.html"], [1280, "claude-code.html"]]) {
  const P = await b.page({ blocked: ["*supabase*"] });
  await P.inject("try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}");
  await P.viewport(w, 900, w < 700);
  await P.goto(`${BASE}/${pg}`);
  await waitFor(P, "(function(){var p=document.querySelectorAll('pre.mermaid');return [].every.call(p,function(x){return x.hasAttribute('data-processed')||x.hasAttribute('data-mermaid-failed')}) && document.fonts.status==='loaded';})()", 20000);
  await sleep(700);
  const st = await P.eval(`(function(){ var r={total:0, scrollable:0, states:{}, mismatch:[]}; document.querySelectorAll(${JSON.stringify(SEL)}).forEach(function(el,i){ r.total++; var max=el.scrollWidth-el.clientWidth; var a=el.getAttribute('data-scroll-fade'); if(max>1) r.scrollable++; r.states[a||'-']=(r.states[a||'-']||0)+1;
      var want = max<=1 ? null : (el.scrollLeft>1 ? (el.scrollLeft<max-1?'both':'left') : 'right'); if ((a||null)!==want && el.clientWidth) r.mismatch.push({i:i, cls:el.className.slice(0,20), a:a, want:want, max:max, sl:el.scrollLeft});
      var m=getComputedStyle(el).maskImage; if(i===0) r.maskSample = m.slice(0,80); }); return r; })()`);
  out[w + ":" + pg] = st;
  // знімки: перший скролер кожного типу, стан 0 і після прокрутки в середину
  const types = [".ds-tbl__wrap", ".ds-diag > pre.mermaid", ".term > .term__body", ".ds-code > .ds-code__pre"];
  for (const t of types) {
    const info = await P.eval(`(function(){ var els=[].filter.call(document.querySelectorAll(${JSON.stringify(t)}), function(e){return e.scrollWidth-e.clientWidth>1}); var el=els[0]; if(!el) return null; el.scrollIntoView({block:'center'}); var r=el.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), n: els.length }; })()`);
    if (!info) continue;
    await sleep(150);
    const tag = t.replace(/[^a-z]/g, "").slice(0, 10);
    await P.shot(`${S}/shots/t8-${w}-${pg.replace(/[\/.]/g, "_")}-${tag}-start.png`);
    await P.eval(`(function(){ var els=[].filter.call(document.querySelectorAll(${JSON.stringify(t)}), function(e){return e.scrollWidth-e.clientWidth>1}); var el=els[0]; el.scrollLeft = Math.round((el.scrollWidth-el.clientWidth)/2); })()`);
    await sleep(200);
    await P.shot(`${S}/shots/t8-${w}-${pg.replace(/[\/.]/g, "_")}-${tag}-mid.png`);
    await P.eval(`(function(){ var els=[].filter.call(document.querySelectorAll(${JSON.stringify(t)}), function(e){return e.scrollWidth-e.clientWidth>1}); var el=els[0]; el.scrollLeft = el.scrollWidth; })()`);
    await sleep(200);
    await P.shot(`${S}/shots/t8-${w}-${pg.replace(/[\/.]/g, "_")}-${tag}-end.png`);
    // повернути на початок
    await P.eval(`(function(){ var els=[].filter.call(document.querySelectorAll(${JSON.stringify(t)}), function(e){return e.scrollWidth-e.clientWidth>1}); els[0].scrollLeft=0; })()`);
  }
  // фокус на діаграмі: кільце видно?
  const ring = await P.eval(`(function(){ var el=document.querySelector('.ds-diag > pre.mermaid[tabindex]'); if(!el) return null; el.focus(); return { active: document.activeElement===el, role: el.getAttribute('role'), name: el.getAttribute('aria-labelledby'), fade: el.getAttribute('data-scroll-fade') }; })()`);
  out[w + ":" + pg].ring = ring;
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
