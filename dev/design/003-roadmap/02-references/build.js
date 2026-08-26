// Генератор сторінки референсів 003-roadmap. Дані — data.js (зібрав агент №2).
// Запуск: node build.js  →  index.html
const fs = require('fs');
const path = require('path');
const { groups, anti } = require('./data.js');

const refs = groups.flatMap(g => g.refs);

// --- Слоти руху: словник із 01-spec.md §5 ---------------------------------
const SLOTS = {
  M1:  ['Вхід на сторінку з футера', 'Page transition, 250–450 мс'],
  M2:  ['Заголовок hero', 'Line-by-line reveal, ≤1.2 с'],
  M3:  ['Лічильники hero', 'Number ticker, 600–900 мс'],
  M4:  ['Вісь часу', 'Scroll-driven scrub'],
  M5:  ['Поява картки «Зроблено»', 'Scroll reveal + stagger, 350–500 мс'],
  M6:  ['Поява картки «Попереду»', 'Reveal з невизначеності, 500–800 мс'],
  M7:  ['«В роботі»', 'Єдиний безкінечний рух на сторінці'],
  M8:  ['Заголовок секції', 'Pin (sticky) на час секції'],
  M9:  ['Hover/focus картки', 'Hover + press feedback, 150 мс'],
  M10: ['Точка входу у футері', 'Мікрожест ≤4 px, 150 мс'],
  M11: ['Кінцівка', 'Entrance із затримкою'],
  M12: ['Перехід стану пункту', 'Continuity transition, 300–500 мс'],
};
const SLOT_ORDER = Object.keys(SLOTS);

// --- Осі ------------------------------------------------------------------
const AXES = {
  A: ['Геометрія часу', 'вертикальний шлях ↔ горизонтальна стрічка ↔ нелінійна композиція'],
  B: ['Інтенсивність', 'стримана чесність ↔ максимальний вау — ГОЛОВНА вісь рішення'],
  C: ['Жанр', 'changelog · редакційне · лабораторний журнал · портфоліо'],
  D: ['Щільність', 'щільно ↔ одна картка на екран'],
  E: ['Як показано майбутнє', 'розмиття · пунктир/каркас · менша щільність'],
};

// Порядок значень осі B — зліва (чесність) направо (вау)
const B_SCALE = [
  'нуль руху (крайня ліва точка осі)',
  'крайня стриманість',
  'стримана чесність',
  'посередині осі',
  'ближче до вау',
  'максимальний вау',
];
const bPos = v => { const i = B_SCALE.indexOf(v); return i < 0 ? null : i; };

const FEAS = { 'легко': 'ok', 'середньо': 'mid', 'важко': 'hard' };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// why / take / dont / motion — авторський HTML агента (<b>, <code>), не екрануємо.

// --- Покриття слотів ------------------------------------------------------
const coverage = {};
for (const s of SLOT_ORDER) coverage[s] = [];
for (const r of refs) for (const s of (r.slots || [])) if (coverage[s]) coverage[s].push(r.n);

// --- Карта осі B ----------------------------------------------------------
const bBuckets = B_SCALE.map(() => []);
const bUnknown = [];
for (const r of refs) {
  const p = bPos(r.axes && r.axes.B);
  if (p === null) bUnknown.push(r); else bBuckets[p].push(r);
}

const refCard = (r, gid) => `
<article class="ref" id="${esc(r.n.toLowerCase())}">
  <header class="ref-head">
    <span class="ref-n">${esc(r.n)}</span>
    <div class="ref-title">
      <h3>${esc(r.name)}</h3>
      <p class="ref-cls">${esc(r.cls || '')}</p>
    </div>
    <a class="ref-url" href="${esc(r.url)}" target="_blank" rel="noopener">відкрити ↗</a>
  </header>

  <div class="shots">
    ${(r.shots || []).map(([f, cap]) => `
    <figure>
      <img src="shots/${esc(f)}" alt="${esc(cap)}" loading="lazy" data-full="shots/${esc(f)}">
      <figcaption>${esc(cap)}</figcaption>
    </figure>`).join('')}
  </div>

  <div class="ref-body">
    <div class="block">
      <h4>Чому тут</h4>
      <p>${r.why}</p>
    </div>

    <div class="block">
      <h4>Розбір руху</h4>
      <table class="motion">
        ${(r.motion || []).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`).join('')}
      </table>
    </div>

    <div class="two">
      <div class="block take">
        <h4>Що беремо</h4>
        <p>${r.take || '—'}</p>
      </div>
      <div class="block dont">
        <h4>Що НЕ беремо</h4>
        <p>${r.dont || '—'}</p>
      </div>
    </div>

    ${r.dark ? `<div class="block"><h4>Наша темна тема / кирилиця</h4><p>${r.dark}</p></div>` : ''}

    <div class="meta">
      <div class="chips">
        ${(r.slots || []).map(s => `<span class="chip slot" title="${esc((SLOTS[s] || ['',''])[0])}">${esc(s)}</span>`).join('')}
        ${Object.entries(r.axes || {}).filter(([, v]) => v && v !== '—')
          .map(([k, v]) => `<span class="chip axis"><b>${esc(k)}</b> ${esc(v)}</span>`).join('')}
      </div>
      <span class="feas ${FEAS[r.feas] || ''}" title="${esc(r.feasWhy || '')}">реалізовність: ${esc(r.feas || '—')}${r.feasWhy ? ' — ' + esc(r.feasWhy) : ''}</span>
    </div>
  </div>
</article>`;

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>003 · Референси до роадмапу</title>
<style>
:root{
  --bg:#141312; --panel:#1E1B18; --panel2:#221E1A; --line:#3A342E;
  --ivory:#F0EEE6; --muted:#CFC9BF; --faint:#8B8276; --clay:#D97757; --sand:#E8DCC3;
  --serif:'Iowan Old Style',Georgia,'Times New Roman',serif;
  --mono:ui-monospace,SFMono-Regular,'SF Mono',Menlo,monospace;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--muted);
  font:16px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px}
h1,h2,h3{font-family:var(--serif);color:var(--ivory);font-weight:600;line-height:1.2;margin:0}
a{color:var(--clay)}
code{font:0.86em var(--mono);background:#00000055;border:1px solid var(--line);
  border-radius:4px;padding:1px 5px;color:var(--sand)}
b,strong{color:var(--ivory);font-weight:600}

/* --- шапка --- */
.top{border-bottom:1px solid var(--line);padding:64px 0 40px;background:
  radial-gradient(120% 90% at 50% 0%, #2A231D 0%, var(--bg) 62%)}
.kicker{font:600 12px/1 var(--mono);letter-spacing:.18em;text-transform:uppercase;
  color:var(--clay);margin-bottom:18px}
h1{font-size:clamp(30px,5vw,46px)}
.lede{max-width:70ch;margin-top:16px;font-size:18px;color:var(--muted)}
.stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
.stat{border:1px solid var(--line);background:var(--panel);border-radius:8px;
  padding:9px 14px;font:13px/1.3 var(--mono);color:var(--sand)}
.stat b{color:var(--ivory)}

/* --- панелі --- */
section{padding:52px 0;border-bottom:1px solid var(--line)}
h2{font-size:26px;margin-bottom:6px}
.sub{color:var(--faint);font-size:14px;margin:0 0 26px}
.note{background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--clay);
  border-radius:6px;padding:18px 22px;margin:18px 0}
.note h3{font-size:17px;margin-bottom:8px}
.note p{margin:0 0 10px}
.note p:last-child{margin-bottom:0}
.note ol,.note ul{margin:8px 0 0;padding-left:22px}
.note li{margin-bottom:8px}
.note li::marker{color:var(--clay)}

/* --- карта осі B --- */
.axis-map{background:var(--panel);border:1px solid var(--line);border-radius:10px;
  padding:22px;margin-top:20px;overflow-x:auto}
.axis-track{display:grid;grid-template-columns:repeat(6,minmax(150px,1fr));gap:12px;min-width:900px}
.axis-col{border-top:2px solid var(--line);padding-top:12px}
.axis-col:first-child{border-color:var(--sand)}
.axis-col:last-child{border-color:var(--clay)}
.axis-lbl{font:600 11px/1.35 var(--mono);text-transform:uppercase;letter-spacing:.08em;
  color:var(--faint);min-height:32px;margin-bottom:10px}
.axis-col:first-child .axis-lbl,.axis-col:last-child .axis-lbl{color:var(--sand)}
.axis-items{display:flex;flex-wrap:wrap;gap:5px}
.pill{display:inline-block;font:11px/1 var(--mono);border:1px solid var(--line);
  border-radius:5px;padding:5px 7px;color:var(--muted);text-decoration:none;background:var(--panel2)}
.pill:hover{border-color:var(--clay);color:var(--ivory)}
.axis-ends{display:flex;justify-content:space-between;font:12px var(--mono);
  color:var(--faint);margin-top:14px;min-width:900px}

/* --- покриття слотів --- */
.cov{width:100%;border-collapse:collapse;margin-top:18px;font-size:14px}
.cov th,.cov td{border-bottom:1px solid var(--line);padding:9px 10px;text-align:left;vertical-align:top}
.cov th{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--faint)}
.cov td:first-child{font:600 13px var(--mono);color:var(--clay);white-space:nowrap}
.cov .n{color:var(--ivory);font:600 13px var(--mono);white-space:nowrap}
.cov .gap{color:#E2725B}
.cov .hint{color:var(--faint);font-size:13px}

/* --- групи --- */
.group{padding-top:52px}
.group-head{border-left:3px solid var(--clay);padding-left:18px;margin-bottom:30px}
.group-head h2{font-size:28px}
.group-head p{max-width:80ch;margin:10px 0 0;color:var(--muted)}

/* --- картка референсу --- */
.ref{background:var(--panel);border:1px solid var(--line);border-radius:12px;
  padding:24px;margin-bottom:22px}
.ref-head{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap}
.ref-n{font:600 13px var(--mono);color:var(--clay);border:1px solid var(--line);
  border-radius:6px;padding:5px 9px;background:var(--bg)}
.ref-title{flex:1;min-width:240px}
.ref-title h3{font-size:20px}
.ref-cls{margin:4px 0 0;font:12px var(--mono);color:var(--faint)}
.ref-url{font:13px var(--mono);text-decoration:none;border:1px solid var(--line);
  border-radius:6px;padding:7px 12px;background:var(--bg)}
.ref-url:hover{border-color:var(--clay)}
.shots{display:grid;gap:14px;margin:20px 0;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
figure{margin:0}
.shots img{width:100%;display:block;border:1px solid var(--line);border-radius:8px;
  background:#000;cursor:zoom-in}
.shots img:hover{border-color:var(--clay)}
figcaption{font-size:12.5px;color:var(--faint);margin-top:7px;line-height:1.45}
.ref-body>.block,.two{margin-top:18px}
.block h4{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.1em;
  color:var(--faint);margin:0 0 8px}
.block p{margin:0}
.two{display:grid;gap:16px;grid-template-columns:1fr 1fr}
.take,.dont{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:14px 16px}
.take{border-left:3px solid #6E9E6E}
.dont{border-left:3px solid #B4553F}
.motion{width:100%;border-collapse:collapse;font-size:14.5px}
.motion th{text-align:left;width:170px;padding:6px 12px 6px 0;color:var(--sand);
  font:600 13px var(--mono);vertical-align:top;border-bottom:1px solid var(--line)}
.motion td{padding:6px 0;border-bottom:1px solid var(--line);vertical-align:top}
.motion tr:last-child th,.motion tr:last-child td{border-bottom:0}
.meta{margin-top:20px;padding-top:16px;border-top:1px solid var(--line);
  display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font:11px/1 var(--mono);border-radius:5px;padding:5px 8px;border:1px solid var(--line)}
.chip.slot{color:var(--clay);background:#D9775715}
.chip.axis{color:var(--faint)}
.chip.axis b{color:var(--sand);font-weight:600}
.feas{font:12px var(--mono);color:var(--faint)}
.feas.ok{color:#7FA97F}.feas.mid{color:var(--sand)}.feas.hard{color:#D98C77}

/* --- антиреференси --- */
.anti-grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(330px,1fr))}
.anti{background:var(--panel);border:1px solid var(--line);border-left:3px solid #B4553F;
  border-radius:10px;padding:20px}
.anti h3{font-size:18px;margin-bottom:4px}
.anti .n{font:600 12px var(--mono);color:#D98C77}
.anti img{width:100%;border:1px solid var(--line);border-radius:8px;margin:14px 0;
  display:block;cursor:zoom-in;background:#000}
.anti h4{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.1em;
  color:var(--faint);margin:14px 0 6px}
.anti p{margin:0}
footer{padding:44px 0 72px;color:var(--faint);font-size:14px}

/* --- лайтбокс --- */
#lb{position:fixed;inset:0;background:#0A0908F2;display:none;align-items:center;
  justify-content:center;z-index:50;padding:24px;cursor:zoom-out}
#lb.on{display:flex}
#lb img{max-width:100%;max-height:100%;border:1px solid var(--line);border-radius:8px}
@media (max-width:720px){.two{grid-template-columns:1fr}.motion th{width:120px}}
</style>

<div class="top"><div class="wrap">
  <p class="kicker">Задача 003 · Роадмап розробки · агент №2</p>
  <h1>Референси: анімована сторінка роадмапу</h1>
  <p class="lede">Матеріал для одного рішення — <b>який напрям беремо</b>. Не читати підряд:
  прогорнути, зупинитись там, де щось зачепило, і назвати номери. Макет ще не будується.</p>
  <div class="stats">
    <span class="stat"><b>${refs.length}</b> референсів</span>
    <span class="stat"><b>${groups.length}</b> напрямків</span>
    <span class="stat"><b>${anti.length}</b> антиреференсів</span>
    <span class="stat"><b>${refs.reduce((a, r) => a + (r.shots || []).length, 0)}</b> скріншотів</span>
    <span class="stat">слоти руху: <b>${SLOT_ORDER.filter(s => coverage[s].length).length}/${SLOT_ORDER.length}</b> покрито</span>
  </div>
</div></div>

<div class="wrap">

<section>
  <h2>Як користуватись цією сторінкою</h2>
  <p class="sub">Три хвилини читання, далі — дивитись картинки.</p>

  <div class="note">
    <h3>Що ти вирішуєш</h3>
    <p><b>Головне — точка на осі «стримана чесність ↔ максимальний вау».</b> У брифі ти обрав
    усі чотири відчуття одразу (живий · чесний · вау · долучитись), і вони конфліктують:
    «вау» тягне в ефектність, «чесність» — у стриманість. Це відкрите питання №1 у специфікації,
    і відповідати на нього текстом незручно. Тому нижче є <b>карта осі</b>: усі 37 робіт
    розкладені від «нуль руху» до «максимальний вау». Ткни в ті, що подобаються — цим
    питання й закриється.</p>
    <p><b>Друге — напрям (A–G).</b> Сім груп, це сім різних способів розповісти той самий
    роадмап. Можна взяти один, можна сказати «структура з A, рух з C».</p>
    <p><b>Третє — антиреференси.</b> Ти їх не називав, тому вони зібрані окремо: сім
    публічних роадмапів і патернів, які показують, як робити НЕ треба. Якщо якийсь із них
    насправді подобається — це важливіше за всі 37 вище, скажи одразу.</p>
  </div>

  <div class="note">
    <h3>Чого тут свідомо немає</h3>
    <p>Немає нашого макета — його малює наступний агент, і тільки після твого вибору.
    Немає й «переможця»: рекомендація на цьому етапі підмінила б твоє рішення чужим смаком.</p>
  </div>

  <div class="note">
    <h3>Словник, щоб не спотикатись</h3>
    <p><b>Слот руху (M1–M12)</b> — конкретне місце сторінки, де щось рухається; список
    зафіксовано в специфікації, і кожен референс підписаний тим, який слот він закриває.
    <b>Осі (A–E)</b> — п'ять вимірів, за якими роботи відрізняються. Головна — B.</p>
    <ul>
      ${Object.entries(AXES).map(([k, [t, d]]) => `<li><b>${k} · ${esc(t)}</b> — ${esc(d)}</li>`).join('')}
    </ul>
  </div>
</section>

<section>
  <h2>Карта осі B — головне рішення</h2>
  <p class="sub">Зліва — сторінка переконує змістом і майже не рухається. Справа — рух є
  окремим враженням. Клікни номер, щоб перейти до розбору.</p>
  <div class="axis-map">
    <div class="axis-track">
      ${B_SCALE.map((label, i) => `
      <div class="axis-col">
        <div class="axis-lbl">${esc(label.replace(/ \(.*\)$/, ''))}</div>
        <div class="axis-items">${bBuckets[i].map(r => `<a class="pill" href="#${esc(r.n.toLowerCase())}" title="${esc(r.name)}">${esc(r.n)}</a>`).join('')}</div>
      </div>`).join('')}
    </div>
    <div class="axis-ends"><span>← чесність, спокій, довіра</span><span>вау, ефект, «хочеться доскролити» →</span></div>
  </div>
  ${bUnknown.length ? `<p class="sub" style="margin-top:14px">Поза шкалою (мікропатерни й
  готові цеглини, які самі по собі не задають інтенсивності): ${bUnknown.map(r => `<a class="pill" href="#${esc(r.n.toLowerCase())}">${esc(r.n)}</a>`).join(' ')}</p>` : ''}
</section>

<section>
  <h2>Покриття слотів руху</h2>
  <p class="sub">Специфікація вимагала 2–3 різні за характером референси на кожен слот.
  Слот без референсів — це діра, яку інакше закриє вигадка, тому вона показана явно.</p>
  <table class="cov">
    <tr><th>Слот</th><th>Що це</th><th>Референси</th></tr>
    ${SLOT_ORDER.map(s => {
      const list = coverage[s];
      const [name, hint] = SLOTS[s];
      return `<tr>
        <td>${s}</td>
        <td>${esc(name)}<br><span class="hint">${esc(hint)}</span></td>
        <td class="${list.length ? 'n' : 'gap'}">${list.length
          ? list.map(n => `<a class="pill" href="#${n.toLowerCase()}">${n}</a>`).join(' ')
          : '— не закрито'}</td>
      </tr>`;
    }).join('')}
  </table>
</section>

${groups.map(g => `
<section class="group" id="g-${esc(g.id)}">
  <div class="group-head">
    <h2>${esc(g.title)}</h2>
    <p>${g.lead}</p>
  </div>
  ${g.refs.map(r => refCard(r, g.id)).join('')}
</section>`).join('')}

<section>
  <h2>Антиреференси — як робити НЕ треба</h2>
  <p class="sub">Власник антиреференсів не називав, тому вони зібрані окремо. Якщо щось із
  цього насправді подобається — це важливіша інформація, ніж будь-що вище.</p>
  <div class="anti-grid">
    ${anti.map(a => `
    <div class="anti" id="${esc(a.n.toLowerCase())}">
      <span class="n">${esc(a.n)}</span>
      <h3>${esc(a.name)}</h3>
      <a class="ref-url" href="${esc(a.url)}" target="_blank" rel="noopener">відкрити ↗</a>
      ${a.shot ? `<img src="shots/${esc(a.shot)}" alt="${esc(a.name)}" loading="lazy">` : ''}
      <h4>Що там</h4><p>${a.what}</p>
      <h4>Чому нам не підходить</h4><p>${a.why}</p>
    </div>`).join('')}
  </div>
</section>

<footer>
  <p>Задача 003 · <code>dev/design/003-roadmap/02-references/</code> · дані — <code>data.js</code>,
  генератор — <code>build.js</code> (<code>node build.js</code> перебудовує цю сторінку).</p>
  <p>Далі за конвеєром: вибір напряму власником → агент №3 будує живий макет → агент №4 робить варіанти.</p>
</footer>
</div>

<div id="lb"><img alt=""></div>
<script>
(function(){
  var lb = document.getElementById('lb'), img = lb.querySelector('img');
  document.addEventListener('click', function(e){
    var t = e.target;
    if (t.tagName === 'IMG' && t.closest('.shots, .anti')) { img.src = t.src; lb.classList.add('on'); }
    else if (lb.classList.contains('on')) { lb.classList.remove('on'); img.removeAttribute('src'); }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') { lb.classList.remove('on'); img.removeAttribute('src'); }
  });
})();
</script>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
console.log('index.html: ' + refs.length + ' референсів, ' + anti.length + ' антиреференсів, ' +
  refs.reduce((a, r) => a + (r.shots || []).length, 0) + ' скріншотів, ' +
  SLOT_ORDER.filter(s => coverage[s].length).length + '/' + SLOT_ORDER.length + ' слотів покрито');
const gaps = SLOT_ORDER.filter(s => !coverage[s].length);
if (gaps.length) console.log('НЕ ЗАКРИТІ СЛОТИ: ' + gaps.join(', '));
