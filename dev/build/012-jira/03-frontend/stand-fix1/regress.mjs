/* Регресія решти сайту: додані правила components.css не мають нічого змінити
   там, де нових класів немає. Порівнюємо геометрію ВСІХ таблиць сторінки
   побайтово (ширини колонок, висота, переповнення) між 8303 (HEAD) і 8302 (фікс).
   Запуск: node regress.mjs */
import { browser, sleep, waitFor } from "./cdp.mjs";

const PAGES = [
  { u: "modules/jira-10", lesson: true }, { u: "modules/jira-15", lesson: true },
  { u: "modules/claude-code-07", lesson: true }, { u: "modules/module-05", lesson: true },
  { u: "modules/architect-09", lesson: true },
  { u: "jira", lesson: false }, { u: "roadmap", lesson: false },
  { u: "index", lesson: false }, { u: "claude-code", lesson: false },
  { u: "architect", lesson: false }, { u: "verify", lesson: false }
];
const WIDTHS = [390, 1280];

const PERSIST_UNGATE = `
(function add(){
  var r = document.documentElement;
  if (!r) { setTimeout(add, 0); return; }
  var run = function(){
    var g = document.getElementById('aiaGate'); if (g) g.remove();
    var m = document.getElementById('main');
    if (m) Array.prototype.forEach.call(m.children, function(c){ if (c.hasAttribute && c.hasAttribute('hidden')) c.removeAttribute('hidden'); });
    if (r.getAttribute('data-aia-gate')) r.removeAttribute('data-aia-gate');
  };
  setInterval(run, 40);
})();`;

const SNAP = `(function(){
  function geo(t){
    var wrap = t.closest(".ds-tbl__wrap") || t.closest(".win__main") || t.parentElement;
    var cells = Array.from(t.rows[0] ? t.rows[0].cells : []);
    return [t.className, Math.round(t.getBoundingClientRect().height*10)/10,
      Math.round(t.scrollWidth*10)/10, Math.round((wrap.scrollWidth - wrap.clientWidth)*10)/10,
      cells.map(function(c){ return Math.round(c.getBoundingClientRect().width*10)/10; }).join(",")].join("|");
  }
  return Array.from(document.querySelectorAll("table")).map(geo);
})()`;

const b = await browser(9335);
let diffs = 0, checked = 0;
for (const pg of PAGES) {
  const res = {};
  for (const [port, tag] of [[8303, "base"], [8302, "fix"]]) {
    const P = await b.page();
    if (pg.lesson) await P.inject(PERSIST_UNGATE);
    res[tag] = {};
    for (const w of WIDTHS) {
      await P.viewport(w, 900, w < 700);
      if (w === WIDTHS[0]) await P.goto(`http://127.0.0.1:${port}/${pg.u}.html`, 0);
      await P.eval(`document.fonts.ready`);
      if (pg.lesson) await waitFor(P, `!document.getElementById('aiaGate')`, 10000, 150);
      await sleep(900);
      await P.eval(`window.dispatchEvent(new Event('resize')), 1`);
      await sleep(400);
      res[tag][w] = await P.eval(SNAP);
    }
    await P.close();
  }
  for (const w of WIDTHS) {
    const a = res.base[w], c = res.fix[w];
    checked += a.length;
    if (JSON.stringify(a) !== JSON.stringify(c)) {
      diffs++;
      console.log(`✗ ${pg.u} @${w}: таблиць ${a.length}/${c.length}`);
      for (let i = 0; i < Math.max(a.length, c.length); i++)
        if (a[i] !== c[i]) console.log(`    [${i}] база ${a[i]}\n        фікс ${c[i]}`);
    } else {
      console.log(`✓ ${pg.u} @${w}: ${a.length} таблиць — геометрія збігається`);
    }
  }
}
b.close();
console.log(`\nрозбіжностей сторінко-ширин: ${diffs}; порівняно замірів таблиць: ${checked}`);
