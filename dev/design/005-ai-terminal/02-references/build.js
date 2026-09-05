// Генератор сторінки добірки 005. Дані — data.js. Запуск: node build.js → index.html
const fs = require('fs');
const { meta, axis, refs, slotB, anti } = require('./data.js');

const SLOTS = {
  A:['A · Термінал як герой сторінки','консоль/лог/сесія, показані спокійно, а не агресивно','мінімум 6'],
  B:['B · Прийоми друку без JS-вставки','як друкувати так, щоб текст лишався текстом','мінімум 5'],
  C:['C · Карта довгої програми','15–25 кроків так, щоб довжина читалась як цінність','мінімум 6'],
  D:['D · Тепла типографіка поруч із моноширинним','серіф + mono без «двох різних сайтів»','мінімум 5'],
  E:['E · Онбординг для тих, хто боїться','вчити страшної теми без зверхності','мінімум 4'],
  F:['F · Scroll-driven, який не паралакс','рух, що будує сенс, а не прикрашає','мінімум 4'],
};
const AX = Object.fromEntries(axis.map(a=>[a.key,a]));
const e = s => String(s==null?'':s);
const tbl = rows => `<table class="kv">${rows.map(([k,v])=>`<tr><th>${e(k)}</th><td>${e(v)}</td></tr>`).join('')}</table>`;
const shots = (a,cls='') => !a||!a.length ? '' :
  `<div class="shots ${cls}">${a.map(([f,c])=>`<figure><a href="shots/${f}" target="_blank"><img loading="lazy" src="shots/${f}" alt=""></a><figcaption>${e(c)}</figcaption></figure>`).join('')}</div>`;
const chips = a => (a||[]).map(s=>`<span class="chip chip--${s}">${s}</span>`).join('');

const axisBar = r => {
  const order = ['zero','accent','partner','hero','over'];
  const i = order.indexOf(r.axis);
  return `<div class="axisbar" title="${e(r.axisPct)}">${order.map((k,j)=>
    `<span class="ab ${j===i?'ab--on':''}">${AX[k].label.split(' ·')[0]}</span>`).join('')}
    <em>${e(r.axisPct)}</em></div>`;
};

const refCard = r => `
<article class="ref" id="${r.n}">
  <header>
    <div class="n">${r.n}</div>
    <div>
      <h3>${e(r.name)} ${chips(r.slots)}</h3>
      <div class="url"><a href="${r.url}" target="_blank">${e(r.url)}</a> · <span class="cls">${r.cls}</span></div>
    </div>
  </header>
  ${axisBar(r)}
  ${shots(r.shots)}
  <p class="why"><b>Чому преміальний:</b> ${r.why}</p>
  <div class="motion"><h4>Рух</h4>${tbl(r.motion)}</div>
  <p class="take"><b>Що звідси беремо:</b> ${r.take}</p>
  <p class="dont"><b>Чого не беремо:</b> ${r.dont}</p>
  <p class="feas"><b>Реалізовність:</b> <span class="f f--${r.feas.split(' ')[0]}">${r.feas}</span> — ${r.feasWhy}</p>
</article>`;

const bCard = b => `
<article class="ref ref--b" id="${b.n}">
  <header><div class="n n--b">${b.n}</div><div>
    <h3>${e(b.name)}</h3>
    <div class="url">${b.url.startsWith('http')?`<a href="${b.url}" target="_blank">${e(b.url)}</a>`:`<a href="${b.url}" target="_blank">${e(b.url)}</a> <em>(локально, через http.server)</em>`} · <span class="cls">${b.cls}</span></div>
  </div></header>
  ${shots(b.shots)}
  <p><b>Що це:</b> ${b.what}</p>
  ${b.table?`<table class="wide"><thead><tr><th>Прийом</th><th>Що виміряно</th><th>Вердикт</th></tr></thead><tbody>${b.table.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>`:''}
  ${b.proof?`<p class="proof">${b.proof}</p>`:''}
  ${b.traps?`<div class="traps"><h4>Пастки, знайдені виміром</h4>${b.traps.map(t=>`<p><b>${t[0]}.</b> ${t[1]}</p>`).join('')}</div>`:''}
  ${b.numbers?`<p><b>Числа:</b> ${b.numbers}</p>`:''}
  ${b.verdict?`<p class="take"><b>Вердикт для нас:</b> ${b.verdict}</p>`:''}
  ${b.gift?`<p class="proof">${b.gift}</p>`:''}
</article>`;

const antiCard = a => `
<article class="ref ref--x" id="${a.n}">
  <header><div class="n n--x">${a.n}</div><div>
    <h3>${e(a.name)}</h3>
    <div class="url"><a href="${a.url}" target="_blank">${e(a.url)}</a> · <span class="lie">${e(a.lie)}</span></div>
  </div></header>
  ${axisBar(a)}
  ${shots(a.shots)}
  <p><b>Як виглядає:</b> ${a.looks}</p>
  <p class="dont"><b>Чому це те, чого ми не робимо:</b> ${a.why}</p>
  <p><b>Перевірка:</b> ${a.test}</p>
  <p class="take"><b>Урок:</b> ${a.lesson}</p>
</article>`;

const bySlot = k => refs.filter(r=>r.slots.includes(k));
const cover = Object.entries(SLOTS).map(([k,v])=>{
  const n = k==='B' ? slotB.length : bySlot(k).length;
  const min = +v[2].replace(/\D/g,'');
  return `<tr><th>${v[0]}</th><td>${v[1]}</td><td>${v[2]}</td><td class="${n>=min?'ok':'warn'}">${n}${n>=min?' ✓':' ⚠'}</td></tr>`;
}).join('');

const axisMap = axis.map(a=>{
  const list = [...refs,...anti].filter(r=>r.axis===a.key);
  return `<div class="acol"><h4>${e(a.label)}<span>${a.range}</span></h4>
   ${list.length?list.map(r=>`<a href="#${r.n}" class="pill ${r.lie?'pill--x':''}">${r.n} · ${e(r.name)}<em>${e(r.axisPct)}</em></a>`).join(''):'<p class="empty">—</p>'}</div>`;
}).join('');

const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>005 · AI Термінал — референси</title>
<style>
:root{--bg:#141312;--panel:#1b1917;--raised:#272320;--line:#332e2a;--text:#CFC9BF;--sand:#E8DCC3;--clay:#D97757;--muted:#A8A095;--ok:#7FA87F;--err:#C97070;--r:8px}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:1080px;margin:0 auto;padding:48px 24px 120px}
h1{font-size:34px;line-height:1.2;color:var(--sand);margin:0 0 8px;font-weight:600;letter-spacing:-.01em}
h2{font-size:24px;color:var(--sand);margin:64px 0 6px;font-weight:600;border-top:1px solid var(--line);padding-top:28px}
h2 small{display:block;font-size:14px;color:var(--muted);font-weight:400;margin-top:4px}
h3{font-size:18px;color:var(--sand);margin:0 0 4px;font-weight:600}
h4{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:18px 0 6px}
p{margin:10px 0;max-width:74ch}
a{color:var(--clay)} a:hover{color:var(--sand)}
code{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:.88em;background:#000;padding:1px 5px;border-radius:4px;color:var(--sand)}
.lede{font-size:17px;color:var(--muted);max-width:74ch}
.meta{font-family:ui-monospace,monospace;font-size:13px;color:var(--muted);margin:14px 0 0}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:14px}
.kv th{text-align:left;color:var(--muted);font-weight:500;width:150px;vertical-align:top;padding:5px 12px 5px 0;border-bottom:1px solid var(--line)}
.kv td{padding:5px 0;border-bottom:1px solid var(--line);vertical-align:top}
table.wide th{text-align:left;color:var(--muted);font-weight:500;padding:6px 12px 6px 0;border-bottom:1px solid var(--line)}
table.wide td{padding:8px 12px 8px 0;border-bottom:1px solid var(--line);vertical-align:top}
.cover th{text-align:left;padding:7px 14px 7px 0;border-bottom:1px solid var(--line);color:var(--sand);font-weight:600;white-space:nowrap}
.cover td{padding:7px 14px 7px 0;border-bottom:1px solid var(--line);color:var(--muted)}
.ok{color:var(--ok);font-weight:600}.warn{color:var(--clay);font-weight:600}
.axismap{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:18px 0 8px}
.acol{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:12px}
.acol h4{margin:0 0 8px;color:var(--sand);text-transform:none;letter-spacing:0;font-size:13px}
.acol h4 span{display:block;font-family:ui-monospace,monospace;color:var(--muted);font-weight:400}
.pill{display:block;background:var(--raised);border-radius:6px;padding:6px 8px;margin:0 0 6px;font-size:12px;text-decoration:none;color:var(--sand);line-height:1.35}
.pill em{display:block;font-style:normal;color:var(--muted);font-family:ui-monospace,monospace;font-size:11px}
.pill--x{background:#2a1c18;color:var(--clay)}
.empty{color:#4a4440;margin:0}
.ref{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:22px 24px;margin:22px 0}
.ref--b{border-color:#2f3a2f}.ref--x{border-color:#4a2a24;background:#191413}
.ref header{display:flex;gap:16px;align-items:flex-start;margin-bottom:12px}
.n{font-family:ui-monospace,monospace;font-size:15px;color:var(--clay);background:#000;border-radius:6px;padding:6px 10px;flex:0 0 auto}
.n--b{color:var(--ok)}.n--x{color:var(--err)}
.url{font-size:13px;color:var(--muted);font-family:ui-monospace,monospace;word-break:break-all}
.cls{font-family:-apple-system,sans-serif}
.lie{color:var(--err);font-family:-apple-system,sans-serif}
.chip{display:inline-block;font-size:11px;font-family:ui-monospace,monospace;background:var(--raised);color:var(--sand);border-radius:4px;padding:2px 6px;margin-left:4px;vertical-align:middle}
.axisbar{display:flex;align-items:center;gap:4px;margin:6px 0 14px;flex-wrap:wrap}
.ab{font-size:11px;font-family:ui-monospace,monospace;color:#5a534d;background:#000;border-radius:4px;padding:3px 8px}
.ab--on{background:var(--clay);color:#141312;font-weight:600}
.axisbar em{font-style:normal;font-family:ui-monospace,monospace;font-size:12px;color:var(--sand);margin-left:6px}
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin:14px 0}
figure{margin:0}
figure img{width:100%;display:block;border-radius:6px;border:1px solid var(--line)}
figcaption{font-size:12px;color:var(--muted);margin-top:6px;line-height:1.45}
.why,.take,.dont,.proof{border-left:2px solid var(--line);padding-left:14px}
.take{border-color:var(--ok)}.dont{border-color:var(--err)}.proof{border-color:var(--clay);background:#1f1a17;padding:12px 14px;border-radius:0 6px 6px 0}
.traps{background:#1f1a17;border-radius:6px;padding:4px 16px 12px;margin:14px 0}
.f{font-family:ui-monospace,monospace;font-size:13px;padding:2px 8px;border-radius:4px;background:#000}
.f--легко{color:var(--ok)}.f--середньо{color:var(--sand)}.f--важко{color:var(--clay)}.f--не{color:var(--err)}
@media(max-width:900px){.axismap{grid-template-columns:1fr 1fr}}
</style></head><body><div class="wrap">

<h1>005 · AI Термінал — референси</h1>
<p class="lede">Добірка для лендінга третього блоку. <b>Компонент «термінал» тут не обговорюється</b> — він схвалений
власником у потоці Б; єдине, що для нього зібрано, — слот B, механіка друку.</p>
<p class="meta">Зібрано ${meta.date} · переглянуто кандидатів ${meta.viewed} · відібрано ${meta.picked} + ${meta.slotB} по слоту B + ${meta.anti} антиприклади<br>
Оцінено візуально: ${meta.visual}<br>
Не відкрились (домен заблокований розширенням): ${meta.blocked.join(', ')}</p>

<h2>Головне: де кожен референс на осі §5.6<small>Вісь — частка площі першого екрана під терміналом. Тицяй у назву, щоб перейти до розбору.</small></h2>
<div class="axismap">${axisMap}</div>
<p class="dont"><b>Знахідка, яку валідатор мусить урахувати (X3):</b> у Ghostty термінал займає <b>22%</b> площі — формально «Акцент», — але на екрані більше <i>немає нічого</i>, тож за роллю це абсолютний «Герой». Частку площі не можна міряти у відриві від того, що ще є в кадрі.</p>

<h2>Покриття слотів §10.3</h2>
<table class="cover">${cover}</table>
<p class="dont"><b>Чесно про слот A:</b> позитивних живих прикладів знайдено 5, а не 6. Причина сама по собі є висновком: у 2026 році <b>компанії, чий продукт — це термінал (Warp, Zed), прибрали термінал з першого екрана</b>. Разом із двома антиприкладами (X1, X3) слот розглянуто на 7 кандидатах — але видавати антиприклади за позитивні не буду.</p>

<h2>Топ-референси</h2>
${refs.map(refCard).join('')}

<h2>Слот B · прийоми друку<small>Обслуговує потік Б і потрібен, навіть якщо весь лендінг буде відхилений.</small></h2>
${slotB.map(bCard).join('')}

<h2>Антиреференси<small>Виглядають професійно й привабливо — і саме тому небезпечні. Жодного зелено-чорного.</small></h2>
${anti.map(antiCard).join('')}

</div></body></html>`;

fs.writeFileSync('index.html', html);
console.log('index.html', (html.length/1024).toFixed(0)+'kb', '·', refs.length+slotB.length+anti.length, 'карток');
