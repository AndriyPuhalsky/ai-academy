/* ============================================================
   005 · ПОВЕДІНКА КОМПОНЕНТА «ТЕРМІНАЛ»
   ------------------------------------------------------------
   Їде разом із компонентом (у код — js/term.js або секцією в
   наявному js/ui.js). Тут НЕМАЄ анімації: рух лендінга живе в
   motion.js, а на сторінках уроків руху в терміналі немає взагалі.

   Дві поведінки:
     1. .term__copy — копіює ТІЛЬКИ введений текст (без префіксів
        `$` / `>` і без виводу). Копіювати сесію разом із кроками
        інструментів безглуздо, тому кнопка є лише в .term--cmd.
     2. .term__more — розгортає стан 8 «довгий вивід». Без анімації
        свідомо: анімувати height у блоці на 243 рядки = layout
        thrashing без жодної користі.
   ============================================================ */
(function () {
  "use strict";

  function announce(msg) {
    var live = document.getElementById("ariaLive");
    if (!live) return;
    live.textContent = "";
    window.setTimeout(function () { live.textContent = msg; }, 30);
  }

  document.addEventListener("click", function (e) {
    /* ---------- копіювання ---------- */
    var copy = e.target.closest ? e.target.closest(".term__copy") : null;
    if (copy) {
      var block = copy.closest(".term");
      var ins = block ? block.querySelectorAll(".term__body .term__in") : [];
      var text = Array.prototype.map.call(ins, function (el) { return el.textContent; }).join("\n");
      var ok = copy.getAttribute("data-ok") || "Скопійовано";
      var fail = copy.getAttribute("data-fail") || "Не вдалося скопіювати";
      var label = copy.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copy.textContent = ok;
          announce(ok);
          window.setTimeout(function () { copy.textContent = label; }, 1600);
        }).catch(function () { announce(fail); });
      } else {
        announce(fail);
      }
      return;
    }

    /* ---------- «показати все» ---------- */
    var more = e.target.closest ? e.target.closest(".term__more") : null;
    if (more) {
      var term = more.closest(".term");
      var open = term.classList.toggle("is-open");
      more.setAttribute("aria-expanded", open ? "true" : "false");
      var l = more.getAttribute(open ? "data-label-open" : "data-label-closed");
      if (l) more.textContent = l;
    }
  });
})();
