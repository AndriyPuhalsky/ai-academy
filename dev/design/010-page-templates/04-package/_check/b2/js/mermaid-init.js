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

  function run() {
    if (!global.mermaid || !global.AIA || !global.AIA.mermaidTheme) return;
    var defs = classDefs();
    var nodes = document.querySelectorAll("pre.mermaid:not([data-mermaid-ready])");
    if (!nodes.length) return;
    Array.prototype.forEach.call(nodes, function (n) {
      /* Дописуємо в КІНЕЦЬ: classDef має бути оголошений до `class X hl`?
         Ні — Mermaid збирає весь граф перед відмальовкою, тож порядок
         усередині діаграми не має значення. Перевірено на c05 і m05. */
      n.textContent = n.textContent.replace(/\s+$/, "") + "\n" + defs + "\n";
      n.setAttribute("data-mermaid-ready", "1");
    });
    mermaid.initialize(global.AIA.mermaidTheme.config());
    mermaid.run({ nodes: nodes }).catch(function (e) {
      /* Діаграма, яка не намалювалась, не має лишати порожню коробку:
         показуємо запасний рядок компонента (_base §14). */
      Array.prototype.forEach.call(nodes, function (n) {
        var box = n.closest(".ds-diag");
        if (box && !box.querySelector(".ds-diag__fallback")) {
          var p = document.createElement("p");
          p.className = "ds-diag__fallback";
          p.textContent = "Діаграму не вдалося намалювати — нижче її текстовий опис.";
          box.insertBefore(p, box.firstChild);
        }
      });
      console.error("[AIA] mermaid:", e);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  global.AIA = global.AIA || {};
  global.AIA.mermaidRun = run;
})(window);
