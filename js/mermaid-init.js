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

  function run() {
    if (!global.mermaid || !global.AIA || !global.AIA.mermaidTheme) return;
    var defs = classDefs();
    var nodes = document.querySelectorAll("pre.mermaid:not([data-mermaid-ready])");
    if (!nodes.length) return;
    Array.prototype.forEach.call(nodes, function (n) {
      var src = n.textContent.replace(/\s+$/, "");
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
      }
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
