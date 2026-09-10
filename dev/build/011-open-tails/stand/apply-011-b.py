#!/usr/bin/env python3
"""011, друга партія правок: таблиці (13a), діаграма-скролер = <pre> (для підказки скролу),
підказка про горизонтальний скрол (рядок 1) — CSS + JS. Запускати з кореня AIA."""
import re, sys

# ---------- css/components.css ----------
p = 'css/components.css'; s = open(p, encoding='utf-8').read()

# 13a: перша колонка таблиці переноситься, ідентифікатори в <code> — ні
old = '''.ds-tbl td:first-child { color: var(--c-text); font-family: var(--f-mono); font-size: var(--fs-small); white-space: nowrap; }
.ds-tbl__empty { padding: var(--s-8); text-align: center; color: var(--c-text-3); }
'''
new = '''.ds-tbl td:first-child { color: var(--c-text); font-family: var(--f-mono); font-size: var(--fs-small); }
/* ⚠ 011 · рядок 13a. Було `white-space: nowrap` на ВСІЙ першій клітинці — правило
   задумане для команд і ключів налаштувань, але коли в першій колонці стоїть
   речення, вона розпирається, а решта стискається до одного символа в рядок
   (заміряно 2026-09-09/10 на всіх 179 таблицях сайту, 1280 px: 7 таблиць
   зламані повністю — перша колонка 673–1020 px, друга 35–38 px). Тепер
   нерозривним лишається лише ідентифікатор у <code> (команда, прапорець, ключ —
   він не має ламатись на дефісі), а текст навколо нього переноситься як текст.
   Клітинки з одним <code> (72 таблиці) рендеряться піксель у піксель як раніше.
   Довга КОМАНДА з аргументами в одному <code> (три довідникові таблиці) — це
   вже не ідентифікатор: для неї модифікатор .ds-tbl--wrap нижче. */
.ds-tbl td:first-child code { white-space: nowrap; }
/* Перша колонка переноситься цілком, і <code> теж (між словами; усередині
   токена — лише коли інакше ніяк, overflow-wrap: anywhere з базового правила).
   Ставиться руками на таблиці, де перша колонка — довга команда з аргументами. */
.ds-tbl--wrap td:first-child code { white-space: normal; }
.ds-tbl__empty { padding: var(--s-8); text-align: center; color: var(--c-text-3); }
'''
assert old in s, '13a base'
s = s.replace(old, new, 1)

old = '''@media (max-width: 640px) {
  .ds-tbl td:first-child { white-space: normal; }
}
'''
new = '''@media (max-width: 640px) {
  /* 011 · рядок 13a: nowrap тепер лише на <code> у першій клітинці (секція 13),
     на вузькому екрані знімаємо і його — як і було для всієї клітинки. */
  .ds-tbl td:first-child code { white-space: normal; }
}
'''
assert old in s, '13a mobile'
s = s.replace(old, new, 1)

# діаграма: скролером стає <pre>, а не .ds-diag
old = '''.ds-diag { border: var(--bw) solid var(--c-line); border-radius: var(--r-inner); background: var(--c-surface); padding: var(--s-4); overflow-x: auto; min-width: 0; }'''
new = '''.ds-diag { border: var(--bw) solid var(--c-line); border-radius: var(--r-inner); background: var(--c-surface); padding: var(--s-4); min-width: 0; }
/* ⚠ 011 · рядок 1. Прокручується тепер САМ <pre> із діаграмою, а не картка .ds-diag.
   Три наслідки, усі корисні: підпис під схемою більше не їде вбік разом зі схемою;
   маска-підказка про скрол (секція 41) фарбує лише схему, а не рамку й тло картки;
   картка лишається звичайним блоком — рамка, кільце фокуса й радіус не масковані.
   Атрибути доступності скролера (tabindex / role / aria-labelledby) тепер ставить
   js/mermaid-init.js на <pre>, бо стрілки прокручують саме сфокусований елемент. */
.ds-diag > pre.mermaid { overflow-x: auto; overscroll-behavior-x: contain; }'''
assert old in s, 'diag base'
s = s.replace(old, new, 1)

old = '''.ds-diag > pre.mermaid { margin-inline: calc(var(--s-4) * -1); }
.ds-diag[data-scrollable] > pre.mermaid { margin-inline: 0; }'''
new = '''.ds-diag > pre.mermaid { margin-inline: calc(var(--s-4) * -1); }
.ds-diag > pre.mermaid[data-scrollable] { margin-inline: 0; }'''
assert old in s, 'diag band'
s = s.replace(old, new, 1)

old = '''.term > .term__body,
.ds-tbl__wrap,
.ds-diag,
.ds-code > .ds-code__pre,'''
new = '''.term > .term__body,
.ds-tbl__wrap,
.ds-diag > pre.mermaid,
.ds-code > .ds-code__pre,'''
assert old in s, 'overscroll list'
s = s.replace(old, new, 1)

# підказка про горизонтальний скрол — секція 41 у кінці файла
s = s.rstrip('\n') + '''


/* ============================================================================
   41. 011 · РЯДОК 1 · ПІДКАЗКА ПРО ГОРИЗОНТАЛЬНИЙ СКРОЛ — ОДИН ПАТЕРН НА ШІСТЬ СКРОЛЕРІВ
   ----------------------------------------------------------------------------
   У системі 009 не було жодного натяку, що діаграму, таблицю чи термінал можна
   потягнути вбік (QA 010, D-23: на 1440 скролять 59 діаграм зі 100, на 390 — 99).
   Рішення власника 2026-09-08 — робити без макета, одним патерном, на токенах.

   ПАТЕРН: край, за яким є ще вміст, ПЛАВНО ГАСНЕ (fade). Це не тінь і не гліф —
   вміст сам «розчиняється» в краю, і око читає це як «далі є ще». Робить це
   mask-image на самому скролері, тому фарбується лише ВМІСТ (текст, клітинки,
   схема), а не рамка чи тло: рамка й кільце фокуса лишаються цілими через
   тришарову маску (див. нижче). Кольорів тут немає взагалі — маска безбарвна,
   ширина згасання — токен простору.

   СТАН веде js/ui.js (initScrollFades): data-scroll-fade="right" | "left" | "both"
   виставляється зі scroll + ResizeObserver і знімається, коли прокручувати нікуди.
   Без JS маски немає — сторінка виглядає як досі (прогресивне поліпшення).

   ТРИ ШАРИ МАСКИ (порядок: верхній перший; кожен композитується з тим, що під ним):
     L1  градієнт у padding-box — власне згасання;
     L2  суцільний у padding-box, exclude (XOR) із L3 → лишається «кільце»:
         рамка + жолоб смуги прокрутки + усе поза боксом — непрозорі;
     L3  суцільний, no-clip + repeat — покриває все, включно з кільцем фокуса
         ПОЗА border-box (інакше маска його зрізала б, WCAG 2.4.7).
   Смуга прокрутки лежить між рамкою і padding-box, тому в градієнт не потрапляє
   (класична смуга Windows не «розмазується»). Підтримка: mask-composite без
   префікса — Chrome 120, Safari 15.4, Firefox 53; старіший Chrome відкидає
   лише mask-composite → шари складаються як add → усе непрозоре → просто без
   підказки, без шкоди.
   ========================================================================== */
[data-scroll-fade] {
  --fade-w: var(--s-10);
  mask-image:
    linear-gradient(to right, transparent, var(--c-text) var(--fade-w), var(--c-text) calc(100% - var(--fade-w)), transparent),
    linear-gradient(var(--c-text), var(--c-text)),
    linear-gradient(var(--c-text), var(--c-text));
  mask-clip: padding-box, padding-box, no-clip;
  mask-origin: padding-box, padding-box, border-box;
  mask-repeat: no-repeat, no-repeat, repeat;
  mask-size: 100% 100%, 100% 100%, auto;
  mask-composite: add, exclude, add;
}
[data-scroll-fade="right"] {
  mask-image:
    linear-gradient(to right, var(--c-text) calc(100% - var(--fade-w)), transparent),
    linear-gradient(var(--c-text), var(--c-text)),
    linear-gradient(var(--c-text), var(--c-text));
}
[data-scroll-fade="left"] {
  mask-image:
    linear-gradient(to right, transparent, var(--c-text) var(--fade-w)),
    linear-gradient(var(--c-text), var(--c-text)),
    linear-gradient(var(--c-text), var(--c-text));
}
'''
open(p, 'w', encoding='utf-8').write(s)

# ---------- js/mermaid-init.js: скролер = <pre> ----------
p = 'js/mermaid-init.js'; s = open(p, encoding='utf-8').read()
old = '''  function nameFor(box, i) {
    var cap = box.querySelector(".ds-diag__caption");'''
new = '''  /* 011 · рядок 1. Скролером став сам <pre class="mermaid"> (css/components.css,
     §14): підпис не їде разом зі схемою, а маска-підказка про скрол фарбує
     лише схему. Тому всі атрибути скролера — на <pre>; підпис шукаємо в картці. */
  function nameFor(box, i) {
    var card = box.closest(".ds-diag") || box;
    var cap = card.querySelector(".ds-diag__caption");'''
assert old in s, 'nameFor'
s = s.replace(old, new, 1)

old = '''  function syncScrollers() {
    var boxes = document.querySelectorAll(".ds-diag");'''
new = '''  function syncScrollers() {
    var boxes = document.querySelectorAll(".ds-diag > pre.mermaid");'''
assert old in s, 'syncScrollers'
s = s.replace(old, new, 1)

old = '''      Array.prototype.forEach.call(document.querySelectorAll(".ds-diag"), function (b) { ro.observe(b); });'''
new = '''      Array.prototype.forEach.call(document.querySelectorAll(".ds-diag > pre.mermaid"), function (b) { ro.observe(b); });'''
assert old in s, 'watchWidth'
s = s.replace(old, new, 1)

old = '''        var justDrawn = nodes[i].closest && nodes[i].closest(".ds-diag");
        if (justDrawn) showRoot(justDrawn);'''
new = '''        if (nodes[i].closest && nodes[i].closest(".ds-diag")) showRoot(nodes[i]);'''
assert old in s, 'justDrawn'
s = s.replace(old, new, 1)
open(p, 'w', encoding='utf-8').write(s)

# ---------- js/ui.js: стан підказки ----------
p = 'js/ui.js'; s = open(p, encoding='utf-8').read()
old = '''  /* ---------- Старт ---------- */

  function init() {
    initMenu();
    initCourses();
    initCopyButtons();
    typeHero();
  }
'''
new = '''  /* ---------- 5. Підказка про горизонтальний скрол (011, рядок 1) ----------
     Шість скролерів системи (перелік — css/components.css, §31 і §41): стан
     «є вміст праворуч / ліворуч» стає атрибутом data-scroll-fade, а вигляд
     (згасання краю маскою) живе в CSS. Тут — лише геометрія: scrollLeft проти
     scrollWidth − clientWidth, перерахунок на scroll (passive), на зміну розміру
     самого скролера (ResizeObserver: рендер Mermaid, підвантаження шрифту,
     зняття [hidden] з уроку) і два дешеві страхувальники — resize вікна й
     повернення на вкладку (RO у невидимій вкладці не доставляється, пастка
     проєкту). Нульова ширина = стан невідомий, атрибут не чіпаємо. */
  var FADE_SCROLLERS = ".ds-tbl__wrap, .ds-diag > pre.mermaid, .term > .term__body, " +
    ".ds-code > .ds-code__pre, .ds-prose > .ds-code__pre, .ds-prose > section > .ds-code__pre";

  function fadeState(el) {
    if (!el.clientWidth) return null;
    var max = el.scrollWidth - el.clientWidth;
    if (max <= 1) return "";
    var x = el.scrollLeft;
    var left = x > 1, right = x < max - 1;
    return left && right ? "both" : left ? "left" : right ? "right" : "";
  }
  function syncFade(el) {
    var st = fadeState(el);
    if (st === null) return;
    if (st) { if (el.getAttribute("data-scroll-fade") !== st) el.setAttribute("data-scroll-fade", st); }
    else if (el.hasAttribute("data-scroll-fade")) el.removeAttribute("data-scroll-fade");
  }
  var fadeBound = typeof WeakSet === "function" ? new WeakSet() : null;
  function bindFades(scope) {
    var list = (scope || document).querySelectorAll(FADE_SCROLLERS);
    Array.prototype.forEach.call(list, function (el) {
      if (fadeBound) { if (fadeBound.has(el)) { syncFade(el); return; } fadeBound.add(el); }
      else if (el.hasAttribute("data-fade-bound")) { syncFade(el); return; }
      else el.setAttribute("data-fade-bound", "");
      el.addEventListener("scroll", function () { syncFade(el); }, { passive: true });
      if ("ResizeObserver" in global) new ResizeObserver(function () { syncFade(el); }).observe(el);
      syncFade(el);
    });
  }
  var fadeTimer = null;
  function scheduleFades() {
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(function () { bindFades(document); }, 150);
  }
  function initScrollFades() {
    bindFades(document);
    global.addEventListener("resize", scheduleFades, { passive: true });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) scheduleFades(); });
    /* Термінал hero лендінга й будь-який скролер, що народжується після fetch
       конфіга, ловить страхувальник: RO на самому <pre> уже стоїть (елемент
       статичний, змінюється лише вміст), а нові вузли підбирає повторний bind. */
    document.addEventListener("cc:rendered", scheduleFades);
    document.addEventListener("aia:config-ready", scheduleFades);
  }

  /* ---------- Старт ---------- */

  function init() {
    initMenu();
    initCourses();
    initCopyButtons();
    typeHero();
    initScrollFades();
  }
'''
assert old in s, 'ui init'
s = s.replace(old, new, 1)
s = s.replace('''  AIA.chrome = AIA.chrome || {};
  AIA.chrome.initDropdown = initDropdown;''', '''  AIA.chrome = AIA.chrome || {};
  AIA.chrome.initDropdown = initDropdown;
  AIA.chrome.bindScrollFades = bindFades;''', 1)
open(p, 'w', encoding='utf-8').write(s)
print('applied')
