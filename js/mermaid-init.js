/* ============================================================================
   010 · Б2 · MERMAID: 357 ХЕКСІВ У КОНТЕНТІ → ТРИ classDef ІЗ ТОКЕНІВ (§8.3.6)
   ----------------------------------------------------------------------------
   Замінює js/mermaid-init.js проду (13 власних хексів у themeVariables).
   Тему бере з AIA.mermaidTheme (модуль системи, _base/mermaid-theme.js),
   а сюди додає те, чого в системі немає: домішування `classDef` у КОЖНУ
   діаграму перед запуском.

   ⚠ ЗНАХІДКА, ЯКОЇ НЕМАЄ В §8.3.6. Спека пропонує
       classDef hl fill:<--c-accent-quiet>,stroke:<--c-accent-edge>,…
   але `--c-accent-quiet` — це `rgba(118, 146, 220, 0.14)`, а в синтаксисі
   Mermaid КОМА розділяє оголошення всередині classDef. Тобто рядок
   розпадеться на чотири сміттєві оголошення, і діаграма або лишиться без
   заливки, або впаде в fallback. Перевірено на живій діаграмі уроку c05.

   Рішення без жодного літерала: rgba компонується на фон сторінки й дає
   ТОЧНО той самий піксель, але у формі #RRGGBB — без ком.
   ========================================================================== */
(function (global) {
  "use strict";
  var root = document.documentElement;

  function tok(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  function parse(css) {
    var m = /^#([0-9a-f]{6})$/i.exec(css);
    if (m) {
      var n = parseInt(m[1], 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255, 1];
    }
    m = /rgba?\(([^)]+)\)/.exec(css);
    if (!m) return null;
    var p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }

  /* rgba над непрозорою підкладкою → #RRGGBB. Ком у результаті немає. */
  function flat(name, overName) {
    var c = parse(tok(name)), b = parse(tok(overName || "--c-bg"));
    if (!c) return "#000000";
    if (!b) b = [0, 0, 0, 1];
    var out = [0, 1, 2].map(function (i) {
      return Math.round(c[i] * c[3] + b[i] * (1 - c[3]));
    });
    return "#" + out.map(function (v) {
      return ("0" + Math.max(0, Math.min(255, v)).toString(16)).slice(-2);
    }).join("");
  }

  /* Три класи покривають усі шість форм `style …`, які є в 56 уроках
     (105 + 15 + 4 + 3 → hl · 1 + 1 → mute · 1 → bad). */
  function classDefs() {
    return [
      "classDef hl fill:" + flat("--c-accent-quiet") + ",stroke:" + tok("--c-accent") +
        ",color:" + tok("--c-text") + ",stroke-width:2px",
      "classDef mute fill:" + tok("--c-surface") + ",stroke:" + tok("--c-line-strong") +
        ",color:" + tok("--c-text-2"),
      "classDef bad fill:" + flat("--c-err-quiet") + ",stroke:" + tok("--c-err-edge") +
        ",color:" + tok("--c-text") + ",stroke-width:2px"
    ].join("\n");
  }

  function fallback(n) {
    var box = n.closest(".ds-diag");
    if (box && !box.querySelector(".ds-diag__fallback")) {
      var p = document.createElement("p");
      p.className = "ds-diag__fallback";
      p.textContent = "Діаграму не вдалося намалювати — нижче її текстовий опис.";
      box.insertBefore(p, box.firstChild);
    }
  }

  /* ==========================================================================
     010 · КОЛО ФІКСІВ · D-05, друга половина: ДОСТУПНІСТЬ СКРОЛ-КОНТЕЙНЕРА
     --------------------------------------------------------------------------
     З useMaxWidth: false широка діаграма більше не стискається — вона
     прокручується. Область, яку можна прокрутити мишею, мусить прокручуватись
     і з клавіатури (WCAG 2.1.1), тому .ds-diag зі скролом отримує рівно той
     самий набір атрибутів, що вже стоїть на 111 обгортках таблиць:
     tabindex="0" + role="region" + доступне імʼя.

     Імʼя беремо з ВЛАСНОГО підпису діаграми (aria-labelledby на .ds-diag__caption),
     а не вигадуємо текст: підпис має 100 зі 100 діаграм сайту (перевірено
     розбором розмітки, не оцінкою). Гілка з aria-label лишається на випадок
     нової діаграми без підпису; "Діаграма" — UI-рядок цього файлу, як і текст
     фолбека вище, у config.json він не живе, бо не є контентом сторінки.

     ⚠ ЧОМУ ЦЕ ПЕРЕРАХОВУЄТЬСЯ, А НЕ СТАВИТЬСЯ РАЗ. Ширина .ds-diag міняється
     в чотирьох випадках, і в трьох із них діаграма вже намальована:
     після рендера · після resize вікна · коли заблокований урок ПЕРЕСТАЄ бути
     [hidden] (до того clientWidth = 0 і скролу «немає») · при поверненні на
     вкладку. Зупинка Tab на контейнері, який більше не скролить, — такий самий
     дефект, як її відсутність на тому, що скролить.
     ========================================================================== */
  var DIAG_NAME = "Діаграма";

  function nameFor(box, i) {
    var cap = box.querySelector(".ds-diag__caption");
    if (cap) {
      if (!cap.id) cap.id = "aia-diag-cap-" + i;
      box.setAttribute("aria-labelledby", cap.id);
      box.removeAttribute("aria-label");
    } else {
      box.setAttribute("aria-label", DIAG_NAME);
      box.removeAttribute("aria-labelledby");
    }
  }

  /* ⚠ 010 · КОЛО 2 · D-14. Коли діаграма ширша за контейнер, вона притискається
     до ЛІВОГО краю (`margin-inline: auto` на переобмеженому боксі дає нуль), а
     Mermaid ставить корінь графа ПОСЕРЕДИНІ. Тому перше, що бачив учень, —
     середина схеми: на claude-code-23 два вузли з семи, на claude-code-10 —
     чотири з тринадцяти; на мобільній ширині корінь був за межею у 6 із 8
     заміряних діаграм. До 010 діаграма вміщалась цілком (хай і дрібно), тож
     це регресія переходу на натуральний розмір.

     Напрямок графа розрізняти НЕ треба — вистачає одного правила: показати
     ВЕРХНІЙ вузол, а серед однаково верхніх — найлівіший. Що це дає:
       flowchart TD/TB  → корінь один, стоїть по центру → прокрутка до центру;
       flowchart LR/RL  → корінь угорі ліворуч          → прокрутка ≈ 0;
       sequenceDiagram  → учасники в один ряд угорі, беремо найлівішого → 0.
     Тобто там, де початок і так видно, прокрутки не відбувається взагалі.

     Робимо РІВНО ОДИН раз — у мить, коли контейнер щойно став прокрутним, і
     лише якщо його ще не гортали (scrollLeft === 0). Інакше resize вікна
     скидав би позицію, яку обрав користувач.
     Присвоєння scrollLeft миттєве: `scroll-behavior: smooth` у системі немає
     (перевірено), тож руху на екрані не виникає — це важливо для «зменшити рух». */
  function showRoot(box) {
    if (box.scrollLeft) return;                     /* користувач уже гортав */
    var svg = box.querySelector("svg");
    if (!svg) return;
    var nodes = svg.querySelectorAll("g.node, .actor");
    if (!nodes.length) return;

    var boxRect = box.getBoundingClientRect();
    var top = null, best = null;
    Array.prototype.forEach.call(nodes, function (n) {
      var r = n.getBoundingClientRect();
      if (!r.width && !r.height) return;            /* невидимі не рахуємо */
      if (top === null || r.top < top - 1) { top = r.top; best = r; }
      else if (r.top <= top + 1 && best && r.left < best.left) { best = r; }
    });
    if (!best) return;

    var centerInContent = best.left + best.width / 2 - boxRect.left + box.scrollLeft;
    var target = centerInContent - box.clientWidth / 2;
    var max = box.scrollWidth - box.clientWidth;
    box.scrollLeft = Math.max(0, Math.min(target, max));
  }

  function syncScrollers() {
    var boxes = document.querySelectorAll(".ds-diag");
    Array.prototype.forEach.call(boxes, function (box, i) {
      /* Нульова ширина = стан невідомий (елемент схований). Нічого не
         вирішуємо: ані вішаємо, ані знімаємо. */
      if (!box.clientWidth) return;
      var scrolls = box.scrollWidth - box.clientWidth > 1;
      var marked = box.hasAttribute("data-scrollable");
      if (scrolls === marked) return;
      if (scrolls) {
        box.setAttribute("data-scrollable", "");
        box.setAttribute("tabindex", "0");
        box.setAttribute("role", "region");
        nameFor(box, i);
        showRoot(box);            /* D-14: показати початок схеми, а не середину */
      } else {
        box.removeAttribute("data-scrollable");
        box.removeAttribute("tabindex");
        box.removeAttribute("role");
        box.removeAttribute("aria-label");
        box.removeAttribute("aria-labelledby");
      }
    });
  }

  var syncPending = false;
  function scheduleSync() {
    if (syncPending) return;
    syncPending = true;
    setTimeout(function () { syncPending = false; syncScrollers(); }, 150);
  }

  var watched = false;
  function watchWidth() {
    if (watched) return;          /* run() публічний (AIA.mermaidRun) — слухачі один раз */
    watched = true;
    /* ResizeObserver ловить і resize вікна, і зняття [hidden] з уроку — але
       він, як і rAF та IntersectionObserver, не доставляється у вкладці, яка
       не рендериться (пастка, що в цьому проєкті стріляла вже чотири рази).
       Тому поруч стоять два дешевих страхувальники: подія resize і момент,
       коли вкладка стає видимою. */
    if ("ResizeObserver" in global) {
      var ro = new ResizeObserver(scheduleSync);
      Array.prototype.forEach.call(document.querySelectorAll(".ds-diag"), function (b) { ro.observe(b); });
    }
    global.addEventListener("resize", scheduleSync, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) scheduleSync();
    });
  }

  /* ⚠ 010 · КОЛО ФІКСІВ · D-16. Джерело діаграми читається з innerHTML,
     а НЕ з textContent — і це не стиль, а виправлення видимого дефекту.

     У розмітці уроків <br/> усередині підпису вузла записаний
     НЕ екранованим:  A["1. Термінал<br/>навчитись відкривати"]
     Браузер парсить його як СПРАВЖНІЙ елемент <br> усередині <pre>
     (в architect-02 їх шість), а textContent теги викидає — тож Mermaid
     отримував уже склеєний рядок «1. Терміналнавчитись відкривати»,
     і два рядки підпису зливались в одне слово. Зачеплено 58 входжень
     у 19 діаграмах, усі в AI Architect. У проді те саме — не регресія 010.

     ⚠ Хибний слід, на який пішли три звіти поспіль: винними називали
     securityLevel: "strict" і htmlLabels. Перевірено емпірично —
     6 комбінацій (strict / antiscript / loose × htmlLabels true / false)
     дають ДВА рядки в усіх шести, висота вузла 46–48 px проти 31.
     Тобто Mermaid тут ні до чого: джерело псувалось ДО нього.

     ⚠ Просто взяти innerHTML не можна: там сутності — `-->` приходить
     як `--&gt;`, і Mermaid на такому джерелі падає з Parse error. Тому
     реальні <br> спершу повертаємо в екрановану форму, а потім декодуємо
     сутності через <textarea> (його .value робить це за нас) — на виході
     текст із літеральним <br/>, який Mermaid розуміє. */
  function sourceOf(node) {
    var box = document.createElement("textarea");
    box.innerHTML = node.innerHTML.replace(/<br\s*\/?>/gi, "&lt;br/&gt;");
    return box.value.replace(/\s+$/, "");
  }

  function run() {
    if (!global.mermaid || !global.AIA || !global.AIA.mermaidTheme) return;
    var defs = classDefs();
    var nodes = document.querySelectorAll("pre.mermaid:not([data-mermaid-ready])");
    if (!nodes.length) return;
    Array.prototype.forEach.call(nodes, function (n) {
      var src = sourceOf(n);
      /* ⚠ 010 · Ф-Б. classDef розуміють ЛИШЕ flowchart/graph. sequenceDiagram
         на ньому падає з `Parse error … got 'INVALID'`, і в проді через це
         не малювались шість діаграм на п'яти сторінках AI Architect
         (architect-03, -04, -08 ×2, -10, -12). Дописуємо вибірково.
         Порядок усередині діаграми значення не має — Mermaid збирає граф
         цілком перед відмальовкою. */
      if (/^\s*(flowchart|graph)\b/.test(src)) src += "\n" + defs + "\n";
      n.textContent = src;
      n.setAttribute("data-mermaid-ready", "1");
    });
    mermaid.initialize(global.AIA.mermaidTheme.config());
    /* ⚠ 010 · Ф-Б. Повузлово, а не одним викликом на весь список: у спільного
       .catch() немає способу дізнатись, ЯКА діаграма впала, тому одне падіння
       вішало напис «не вдалося намалювати» на всі здорові діаграми сторінки
       (заміряно на architect-08: 2 падіння → 3 написи при 3 діаграмах). */
    /* ⚠⚠ 010 · D-01. Виклики ПОСЛІДОВНІ, а не паралельні — і це не стиль, а
       виправлення критичного дефекту, який внесла попередня редакція цього
       блока (коміт 8535f0e).

       Механізм: id елемента Mermaid будує як `mermaid-${Date.now()}` (у 10.9.1
       генератор створюється НА КОЖЕН виклик run(), а deterministicIds у нас не
       заданий). Роздільна здатність — 1 мілісекунда. Паралельний forEach без
       await доводив сусідні виклики до цього рядка з різницею 1–2 мс
       (заміряно), тож id збігались, і Mermaid домальовував другий граф у вже
       наявний <svg>. Наслідок на екрані: ДВІ-ТРИ ДІАГРАМИ ОДНА ПОВЕРХ ОДНОЇ,
       вузли налазять один на одного. Стріляло імовірнісно — саме тому
       локальна перевірка після 8535f0e його не спіймала, а власник побачив.
       Зачеплено було 79 зі 100 діаграм (37 сторінок із двома й більше).

       Послідовний прохід дає між id 86–131 мс замість 1–2 — запас у 50–100
       разів, і при цьому ЗБЕРІГАЄ повузловий fallback, заради якого зміну
       й робили.

       ⛔ Не «оптимізувати» назад і не «спрощувати» через deterministicIds:
       true — при повузлових викликах воно дає всім діаграмам id `mermaid-0`,
       тобто зливає їх ЗАВЖДИ, а не іноді. Перевірено на живій сторінці. */
    (async function () {
      for (var i = 0; i < nodes.length; i++) {
        try {
          await mermaid.run({ nodes: [nodes[i]] });
        } catch (e) {
          fallback(nodes[i]);
          console.error("[AIA] mermaid:", e);
        }
        syncScrollers();   /* ширина відома одразу після відмальовки */
        /* ⚠ D-14, друга половина. showRoot() усередині syncScrollers спрацьовує
           лише в мить, коли контейнер ЩОЙНО став прокрутним, — а .ds-diag часто
           прокрутний ще ДО рендера: невідмальований <pre> з довгими рядками
           джерела сам ширший за колонку. Тоді перехід стану вже стався (на
           тексті), showRoot відпрацював на порожньому боксі й вийшов, а після
           появи <svg> стан не змінюється — і другу діаграму сторінки більше
           ніхто не прокручував. Заміряно: #0 отримувала правильні 739/319/372,
           #1 лишалась на 0 при потрібних 479/614/30. Тому після кожної
           відмальовки додатково наводимо саме цей бокс. */
        var justDrawn = nodes[i].closest && nodes[i].closest(".ds-diag");
        if (justDrawn) showRoot(justDrawn);
      }
      watchWidth();
    })();
  }

  /* ⚠ 010 · Ф-Б. Запуск ПІСЛЯ завантаження вебшрифта, а не на DOMContentLoaded:
     Mermaid міряє ширину міток тим шрифтом, який доступний у мить відмальовки,
     і на фолбеку вони виходять вужчими за вміст. Заміряно на module-01:
     23 з 39 міток були обрізані, найгірше — на 9 px («Штучний інтелек…»). */
  function start() {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    else run();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  global.AIA = global.AIA || {};
  global.AIA.mermaidRun = run;
})(window);
