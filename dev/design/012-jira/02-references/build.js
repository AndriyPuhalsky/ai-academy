// Збирає index.html з data.json. Запуск: node build.js (з цієї папки).
// Схема успадкована з 009/02-references і 010/02-references-mobile: дані окремо,
// збирач окремо — щоб падіння на складанні сторінки не забирало з собою виміри.
const fs = require('fs');
const path = require('path');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Усе екранується, далі повертається РІВНО білий список розмітки, якою я сам
// розмічаю дані (підсвітка оцінок і перенос рядка). Нічого стороннього тут не буває.
const md = s => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/&lt;span class="(g-ok|g-bad|g-warn)"&gt;/g, '<span class="$1">')
  .replace(/&lt;\/span&gt;/g, '</span>')
  .replace(/&lt;br&gt;/g, '<br>')
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
        <span class="chip">${esc(r.cls)}</span>${r.theme ? `<span class="chip ${/^темн/.test(r.theme) ? 'chip-dark' : 'chip-light'}">${esc(r.theme)}</span>` : ''}${r.verdict ? `<span class="chip chip-v chip-${esc(r.verdict)}">${r.verdict === 'take' ? 'беремо' : r.verdict === 'anti' ? 'антиреференс' : 'до відомості'}</span>` : ''}</div>
    </div>
    <div class="feas ${feasClass(r.feas)}">${esc(r.feas)}</div>
  </header>
  ${r.nums && r.nums.length ? `<table class="nums"><tbody>${r.nums.map(n => `<tr><th>${md(n[0])}</th><td>${md(n[1])}</td></tr>`).join('')}</tbody></table>` : ''}
  <div class="body">
    <p><span class="lbl">Чому преміальний</span>${md(r.why)}</p>
    ${r.motion ? `<p><span class="lbl lbl-m">Рух</span>${md(r.motion)}</p>` : ''}
    ${r.narrow ? `<p><span class="lbl lbl-n">350 / 768</span>${md(r.narrow)}</p>` : ''}
    <p class="take"><span class="lbl lbl-t">Беремо</span>${md(r.take)}</p>
  </div>
  ${r.shots && r.shots.length ? `<div class="shots">${r.shots.map(shot).join('')}</div>` : ''}
</article>`;

// Обгортка обовʼязкова: `display:block` + `overflow-x:auto` НА САМІЙ таблиці
// не створює робочого скролпорта — групи рядків вилазять за межі блока
// (перевірено на 390 px: документ розʼїхався до 648 px). Скролить лише обгортка.
const table = t => `<div class="tw" tabindex="0" role="group" aria-label="${esc(t.head[0] || 'таблиця')} — таблиця з горизонтальним скролом"><table class="data"><thead><tr>${t.head.map(h => `<th>${md(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row => `<tr>${row.map(c => `<td>${md(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

const block = b => b.t === 'p' ? `<p>${md(b.v)}</p>`
  : b.t === 'h3' ? `<h3 class="sub">${esc(b.v)}</h3>`
  : b.t === 'note' ? `<div class="note">${md(b.v)}</div>`
  : b.t === 'table' ? table(b.v)
  : b.t === 'shots' ? `<div class="shots">${b.v.map(shot).join('')}</div>`
  : b.t === 'ul' ? `<ul class="plain">${b.v.map(i => `<li>${md(i)}</li>`).join('')}</ul>`
  : '';

const section = s => `
<section class="sec" id="${esc(s.id)}">
  <h2><span class="secnum">${esc(s.num || '')}</span>${esc(s.title)}</h2>
  ${s.intro ? `<p class="intro">${md(s.intro)}</p>` : ''}
  ${(s.blocks || []).map(block).join('')}
  ${(s.refs || []).map(refCard).join('')}
</section>`;

const html = `<!doctype html>
<html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(D.meta.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Prata&family=Golos+Text:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{
 --n0:#0d0c0b;--n1:#141312;--n2:#1B1916;--n3:#211E1A;--n4:#2A2621;--n6:#3A342E;--n7:#494844;
 --n9:#7c7b74;--n10:#9A9184;--n11:#B5B3AD;--n12:#F0EEE6;
 --ok:#3dd68c;--warn:#ffca16;--err:#ff9592;--info:#70b8ff;--acc:#C57CB4;
 --f-d:'Prata',Georgia,serif;--f-s:'Golos Text',system-ui,sans-serif;--f-m:'JetBrains Mono',ui-monospace,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:24px}
body{margin:0;background:var(--n1);color:var(--n12);font:16px/1.7 var(--f-s);-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:56px 32px 120px}
h1{font:400 44px/1.15 var(--f-d);margin:0 0 12px;letter-spacing:-.01em}
.lede{color:var(--n11);font-size:18px;max-width:82ch;margin:0 0 22px}
.facts{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:34px}
.fact{font:500 12px/1 var(--f-m);letter-spacing:.02em;color:var(--n11);background:var(--n2);border:1px solid var(--n6);border-radius:999px;padding:8px 13px}
.fact b{color:var(--n12)}
nav.toc{background:var(--n2);border:1px solid var(--n6);border-radius:16px;padding:20px 24px;margin-bottom:56px}
nav.toc b{display:block;font:500 11px/1 var(--f-m);letter-spacing:.18em;text-transform:uppercase;color:var(--n10);margin-bottom:12px}
nav.toc ol{margin:0;padding-left:20px;columns:2;column-gap:36px}
nav.toc li{margin-bottom:5px}
a{color:var(--info);text-decoration:none;border-bottom:1px solid rgba(112,184,255,.28)}
a:hover{border-bottom-color:var(--info)}
nav.toc a{color:var(--n12);border:0}
nav.toc a:hover{color:var(--acc)}
.sec{margin-bottom:76px;scroll-margin-top:24px}
.sec h2{font:400 29px/1.25 var(--f-d);margin:0 0 10px;padding-bottom:14px;border-bottom:1px solid var(--n6);display:flex;align-items:baseline;gap:14px}
.secnum{font:500 12px/1 var(--f-m);color:var(--acc);letter-spacing:.1em;flex:none}
.intro{color:var(--n11);max-width:92ch;margin:0 0 26px}
h3.sub{font:600 17px/1.4 var(--f-s);color:var(--n12);margin:34px 0 10px;padding-left:12px;border-left:2px solid var(--acc)}
.sec p{max-width:98ch}
ul.plain{color:var(--n11);max-width:98ch;padding-left:22px}
ul.plain li{margin-bottom:7px}
.ref{background:var(--n2);border:1px solid var(--n6);border-radius:16px;padding:22px 24px 24px;margin-bottom:20px}
.ref>header{display:flex;gap:16px;align-items:flex-start;margin-bottom:14px}
.rid{font:500 11px/1.6 var(--f-m);color:var(--acc);border:1px solid rgba(197,124,180,.4);border-radius:6px;padding:2px 7px;flex:none}
.rhead{flex:1 1 auto;min-width:0}
.rhead h3{font:600 19px/1.3 var(--f-s);margin:0 0 4px}
.rmeta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13px}
.rmeta a{font-family:var(--f-m);font-size:12px;color:var(--n10);border-bottom-color:var(--n7)}
.chip{font:500 11px/1 var(--f-m);color:var(--n11);background:var(--n3);border:1px solid var(--n6);border-radius:999px;padding:5px 9px}
.chip-dark{color:var(--n12);border-color:var(--n7)}
.chip-light{color:var(--warn);border-style:dashed;border-color:rgba(255,202,22,.4)}
.chip-take{color:var(--ok);border-color:rgba(61,214,140,.45)}
.chip-anti{color:var(--err);border-color:rgba(255,149,146,.45)}
.chip-note{color:var(--n10);border-style:dashed}
.feas{flex:none;font:500 12px/1.35 var(--f-m);border-radius:8px;padding:6px 10px;max-width:280px;border:1px solid}
.f-easy{color:var(--ok);border-color:rgba(61,214,140,.4)}
.f-mid{color:var(--warn);border-color:rgba(255,202,22,.4)}
.f-hard{color:var(--err);border-color:rgba(255,149,146,.4)}
.f-no{color:var(--n10);border-color:var(--n6);border-style:dashed}
.ref .body p{margin:0 0 9px;color:var(--n11);max-width:98ch}
.lbl{display:inline-block;font:500 10px/1 var(--f-m);letter-spacing:.14em;text-transform:uppercase;color:var(--n10);border:1px solid var(--n6);border-radius:4px;padding:4px 6px;margin-right:9px;vertical-align:1px}
.lbl-m{color:var(--info);border-color:rgba(112,184,255,.35)}
.lbl-n{color:var(--warn);border-color:rgba(255,202,22,.35)}
.lbl-t{color:var(--ok);border-color:rgba(61,214,140,.35)}
.take{color:var(--n12)!important}
table.nums{width:100%;border-collapse:collapse;margin:0 0 16px;font-family:var(--f-m);font-size:12.5px}
table.nums th{text-align:left;font-weight:400;color:var(--n10);padding:6px 14px 6px 0;vertical-align:top;width:1%;white-space:nowrap}
table.nums td{padding:6px 0;color:var(--n12)}
table.nums tr+tr th,table.nums tr+tr td{border-top:1px solid var(--n4)}
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(236px,100%),1fr));gap:14px;margin-top:16px}
figure{margin:0}
figure img{width:100%;display:block;border:1px solid var(--n6);border-radius:10px;background:var(--n0)}
figcaption{font:400 12px/1.5 var(--f-m);color:var(--n10);margin-top:7px}
.tw{overflow-x:auto;overscroll-behavior-x:contain;margin:0 0 24px;border-radius:8px}
.tw:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
table.data{border-collapse:collapse;font-size:13.5px;min-width:min(100%,560px);width:100%}
table.data th,table.data td{text-align:left;padding:8px 11px;border-bottom:1px solid var(--n4);vertical-align:top}
table.data thead th{font:500 11px/1.3 var(--f-m);letter-spacing:.08em;text-transform:uppercase;color:var(--n10);border-bottom:1px solid var(--n6);white-space:nowrap}
table.data td:first-child{color:var(--n12)}
code{font-family:var(--f-m);font-size:.88em;color:var(--n12);background:var(--n3);border-radius:4px;padding:1px 5px;overflow-wrap:anywhere}
.g-ok{color:var(--ok)}.g-bad{color:var(--err)}.g-warn{color:var(--warn)}
.note{background:var(--n3);border-left:2px solid var(--acc);border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 22px;color:var(--n11);max-width:98ch}
.note b{color:var(--n12)}
footer{margin-top:80px;padding-top:24px;border-top:1px solid var(--n6);color:var(--n10);font-size:13px}
footer p{max-width:98ch}
/* ⚠ .feas має flex:none, тож на вузькому вона розпирала документ до 648 px
   при вʼюпорті 390 (саме той клас дефектів, про який ця добірка). Не max-width:none. */
@media (max-width:760px){.wrap{padding:32px 18px 80px}h1{font-size:31px}nav.toc ol{columns:1}
 .ref>header{flex-wrap:wrap}.feas{flex:1 1 100%;max-width:100%}.shots{grid-template-columns:1fr}
 .rid{order:-1}}
</style></head><body><div class="wrap">
<h1>${esc(D.meta.title)}</h1>
<p class="lede">${md(D.meta.lede)}</p>
<div class="facts">${D.meta.facts.map(f => `<span class="fact">${md(f)}</span>`).join('')}</div>
<nav class="toc"><b>Зміст</b><ol>${D.sections.map(s => `<li><a href="#${esc(s.id)}">${esc(s.title)}</a></li>`).join('')}</ol></nav>
${D.sections.map(section).join('')}
<footer>${D.meta.footer.map(f => `<p>${md(f)}</p>`).join('')}</footer>
</div></body></html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
const n = D.sections.reduce((s, x) => s + (x.refs || []).length, 0);
console.log(`index.html зібрано · секцій ${D.sections.length} · карток референсів ${n}`);
