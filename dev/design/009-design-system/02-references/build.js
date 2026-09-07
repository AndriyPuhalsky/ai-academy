// Збирає index.html з data.json. Запуск: node build.js (з цієї папки).
const fs = require('fs');
const path = require('path');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const md = s => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\n/g, '<br>');
const feasClass = f => /^легко/.test(f) ? 'f-easy' : /^середньо/.test(f) ? 'f-mid' : /^важко/.test(f) ? 'f-hard' : 'f-no';

const shot = s => `<figure><a href="shots/${esc(s.src)}" target="_blank"><img loading="lazy" src="shots/${esc(s.src)}" alt="${esc(s.cap)}"></a><figcaption>${md(s.cap)}</figcaption></figure>`;

const refCard = r => `
<article class="ref" id="${esc(r.id)}">
  <header>
    <div class="rid">${esc(r.id.toUpperCase())}</div>
    <div class="rhead">
      <h3>${esc(r.name)}</h3>
      <div class="rmeta"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url.replace(/^https?:\/\//, ''))}</a>
        <span class="chip">${esc(r.cls)}</span><span class="chip ${/^темн/.test(r.theme) ? 'chip-dark' : 'chip-light'}">${esc(r.theme)}</span></div>
    </div>
    <div class="feas ${feasClass(r.feas)}">${esc(r.feas)}</div>
  </header>
  ${r.nums && r.nums.length ? `<table class="nums"><tbody>${r.nums.map(n => `<tr><th>${md(n[0])}</th><td>${md(n[1])}</td></tr>`).join('')}</tbody></table>` : ''}
  <div class="body">
    <p><span class="lbl">Чому преміальний</span>${md(r.why)}</p>
    ${r.motion ? `<p><span class="lbl lbl-m">Рух</span>${md(r.motion)}</p>` : ''}
    <p class="take"><span class="lbl lbl-t">Беремо</span>${md(r.take)}</p>
  </div>
  ${r.shots && r.shots.length ? `<div class="shots">${r.shots.map(shot).join('')}</div>` : ''}
</article>`;

const section = s => `
<section class="sec" id="${esc(s.id)}">
  <h2><span class="secnum">${esc(s.num || '')}</span>${esc(s.title)}</h2>
  ${s.intro ? `<p class="intro">${md(s.intro)}</p>` : ''}
  ${s.html || ''}
  ${(s.refs || []).map(refCard).join('')}
</section>`;

const html = `<!doctype html>
<html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(D.meta.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prata&family=Onest:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{
 --n0:#0d0c0b;--n1:#141312;--n2:#1B1916;--n3:#211E1A;--n4:#2A2621;--n6:#3A342E;--n7:#494844;
 --n9:#7c7b74;--n10:#9A9184;--n11:#B5B3AD;--n12:#F0EEE6;
 --ok:#3dd68c;--warn:#ffca16;--err:#ff9592;--info:#70b8ff;--acc:#ff801f;
 --f-d:'Prata',Georgia,serif;--f-s:'Onest',system-ui,sans-serif;--f-m:'JetBrains Mono',ui-monospace,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--n1);color:var(--n12);font:16px/1.7 var(--f-s);-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:56px 32px 120px}
h1{font:400 46px/1.15 var(--f-d);margin:0 0 12px;letter-spacing:-.01em}
.lede{color:var(--n11);font-size:18px;max-width:80ch;margin:0 0 22px}
.facts{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:34px}
.fact{font:500 12px/1 var(--f-m);letter-spacing:.02em;color:var(--n11);background:var(--n2);border:1px solid var(--n6);border-radius:999px;padding:8px 13px}
nav.toc{background:var(--n2);border:1px solid var(--n6);border-radius:16px;padding:20px 24px;margin-bottom:56px}
nav.toc b{display:block;font:500 11px/1 var(--f-m);letter-spacing:.18em;text-transform:uppercase;color:var(--n10);margin-bottom:12px}
nav.toc ol{margin:0;padding-left:20px;columns:2;column-gap:36px}
nav.toc li{margin-bottom:5px}
a{color:var(--info);text-decoration:none;border-bottom:1px solid rgba(112,184,255,.28)}
a:hover{border-bottom-color:var(--info)}
nav.toc a{color:var(--n12);border:0}
nav.toc a:hover{color:var(--acc)}
.sec{margin-bottom:76px;scroll-margin-top:24px}
.sec h2{font:400 30px/1.2 var(--f-d);margin:0 0 10px;padding-bottom:14px;border-bottom:1px solid var(--n6);display:flex;align-items:baseline;gap:14px}
.secnum{font:500 12px/1 var(--f-m);color:var(--acc);letter-spacing:.1em}
.intro{color:var(--n11);max-width:88ch;margin:0 0 26px}
.ref{background:var(--n2);border:1px solid var(--n6);border-radius:16px;padding:22px 24px 24px;margin-bottom:20px}
.ref>header{display:flex;gap:16px;align-items:flex-start;margin-bottom:14px}
.rid{font:500 11px/1.6 var(--f-m);color:var(--acc);border:1px solid rgba(255,128,31,.35);border-radius:6px;padding:2px 7px;flex:none}
.rhead{flex:1 1 auto;min-width:0}
.rhead h3{font:600 19px/1.3 var(--f-s);margin:0 0 4px}
.rmeta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13px}
.rmeta a{font-family:var(--f-m);font-size:12px;color:var(--n10);border-bottom-color:var(--n7)}
.chip{font:500 11px/1 var(--f-m);color:var(--n11);background:var(--n3);border:1px solid var(--n6);border-radius:999px;padding:5px 9px}
.chip-dark{color:var(--n12);border-color:var(--n7)}
.chip-light{color:var(--warn);border-style:dashed;border-color:rgba(255,202,22,.4)}
.feas{flex:none;font:500 12px/1.35 var(--f-m);border-radius:8px;padding:6px 10px;max-width:270px;border:1px solid}
.f-easy{color:var(--ok);border-color:rgba(61,214,140,.4)}
.f-mid{color:var(--warn);border-color:rgba(255,202,22,.4)}
.f-hard{color:var(--err);border-color:rgba(255,149,146,.4)}
.f-no{color:var(--n10);border-color:var(--n6);border-style:dashed}
.ref .body p{margin:0 0 9px;color:var(--n11);max-width:96ch}
.lbl{display:inline-block;font:500 10px/1 var(--f-m);letter-spacing:.14em;text-transform:uppercase;color:var(--n10);border:1px solid var(--n6);border-radius:4px;padding:4px 6px;margin-right:9px;vertical-align:1px}
.lbl-m{color:var(--info);border-color:rgba(112,184,255,.35)}
.lbl-t{color:var(--ok);border-color:rgba(61,214,140,.35)}
.take{color:var(--n12)!important}
table.nums{width:100%;border-collapse:collapse;margin:0 0 16px;font-family:var(--f-m);font-size:12.5px}
table.nums th{text-align:left;font-weight:400;color:var(--n10);padding:6px 14px 6px 0;white-space:nowrap;vertical-align:top;width:1%}
table.nums td{padding:6px 0;color:var(--n12)}
table.nums tr+tr th,table.nums tr+tr td{border-top:1px solid var(--n4)}
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-top:16px}
figure{margin:0}
figure img{width:100%;display:block;border:1px solid var(--n6);border-radius:10px;background:var(--n0)}
figcaption{font:400 12px/1.5 var(--f-m);color:var(--n10);margin-top:7px}
table.data{width:100%;border-collapse:collapse;font-size:13px;margin:0 0 24px}
table.data th,table.data td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--n4);vertical-align:top}
table.data thead th{font:500 11px/1.3 var(--f-m);letter-spacing:.08em;text-transform:uppercase;color:var(--n10);border-bottom:1px solid var(--n6)}
table.data td.m,table.data th.m{font-family:var(--f-m);font-size:12px}
.g-ok{color:var(--ok)}.g-bad{color:var(--err)}.g-warn{color:var(--warn)}
.note{background:var(--n3);border-left:2px solid var(--acc);border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 22px;color:var(--n11)}
.note b{color:var(--n12)}
.quote{background:var(--n0);border:1px solid var(--n4);border-radius:10px;padding:14px 16px;font:400 13px/1.65 var(--f-m);color:var(--n11);white-space:pre-wrap;margin:0 0 18px}
.sw{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid rgba(255,255,255,.14);vertical-align:-2px;margin-right:6px}
footer{margin-top:80px;padding-top:24px;border-top:1px solid var(--n6);color:var(--n10);font-size:13px}
@media (max-width:760px){.wrap{padding:32px 18px 80px}h1{font-size:32px}nav.toc ol{columns:1}.ref>header{flex-wrap:wrap}.feas{max-width:none}}
</style></head><body><div class="wrap">
<h1>${esc(D.meta.title)}</h1>
<p class="lede">${md(D.meta.lede)}</p>
<div class="facts">${D.meta.facts.map(f => `<span class="fact">${esc(f)}</span>`).join('')}</div>
<nav class="toc"><b>Зміст</b><ol>${D.sections.map(s => `<li><a href="#${esc(s.id)}">${esc(s.title)}</a></li>`).join('')}</ol></nav>
${D.sections.map(section).join('')}
<footer>${md(D.meta.footer)}</footer>
</div></body></html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html: ' + (html.length / 1024).toFixed(1) + ' KB, секцій ' + D.sections.length +
  ', референсів ' + D.sections.reduce((n, s) => n + (s.refs ? s.refs.length : 0), 0));
