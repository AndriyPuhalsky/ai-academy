/* ============================================================================
   012 · js/jira-win.js — СКРОЛЕРИ ВІКНА (дельта до js/ui.js, D-04)
   ----------------------------------------------------------------------------
   ⚠ ЧОМУ ЦЕ НЕ «ОДИН РЯДОК».

   NOTES білдера §8 обіцяли білду дописати в `js/ui.js` рівно один рядок:
       FADE_SCROLLERS += ", .win__main, .win__cols, .win__tabs"
   і посилались на замір «5 скролерів, усі фокусовані». Замір правдивий, але
   знятий на `gallery.html`, у якої Є ВЛАСНИЙ інлайновий скрипт макета — саме
   він додає `tabindex` і `role`. Продовий `syncFade()` (js/ui.js, ~338)
   ставить ТІЛЬКИ `data-scroll-fade`; `tabindex` у проєкті дотепер приходив
   із РОЗМІТКИ (`<div class="ds-tbl__wrap" tabindex="0" role="region"
   aria-label="Таблиця: …">` — так його пишуть автори контенту).

   Розмітка вікон заморожена (К-29), автори її не напишуть. Отже з одним
   дописаним рядком людина з клавіатурою НЕ МОЖЕ прокрутити дошку на 9
   колонок узагалі. Заміряно на `lesson.html` при 390 px:
   overflowing 1 · withTabindex 0 · withFade 0.

   Тому дельта — ось цей блок. Він повторює контракт продового `syncFade()`
   і додає три атрибути, і лише ПОКИ елемент справді переповнений:
   зник скрол — зникла й зупинка табуляції (інакше курс отримав би ~56 зайвих
   табів на 23 сторінки).

   ⚠ ЧОМУ ЦЕ ОКРЕМИЙ ФАЙЛ, А НЕ ДОПИС У js/ui.js.
   Рішення власника 2026-10-01 (принцип І-0 «ізоляція — лише додавати»): код,
   який виконувався б на сторінках трьох інших курсів, у спільні файли не
   йде. `js/ui.js` підключений до всіх 69 сторінок сайту, а скролери вікна
   потрібні рівно на 23 сторінках Jira (22 уроки + лендінг), де є `.win`.
   Побічна вигода: зникає найдорожчий ризик задачі — дельта оголошує `init`,
   `state`, `bind`, `sync`, `schedule`, `t`, `bound`, і два з цих імен
   (`init`, `t`) уже є в ПЕРШОМУ IIFE js/ui.js; вставка всередину мовчки
   перезаписала б `init()`, який запускає меню, випадайку «Курси», кнопки
   копіювання, hero й згасання краю на всіх 69 сторінках.

   `FADE_SCROLLERS` у js/ui.js НЕ розширюється: у цього файла власний `SEL` і
   власний `sync`, тому два механізми не бʼються за ті самі вузли.
   ========================================================================== */
(function (global) {
  "use strict";

  var SEL = ".win__main, .win__cols, .win__tabs";

  function label(el) {
    var win = el.closest ? el.closest(".win") : null;
    var t = win && win.querySelector(".win__title");
    var name = t ? t.textContent.trim().replace(/\s+/g, " ") : "";
    return name ? "Прокручувана частина вікна: " + name : "Прокручувана частина вікна";
  }

  function state(el) {
    if (!el.clientWidth) return null;              /* ширина невідома — не чіпаємо */
    var max = el.scrollWidth - el.clientWidth;
    if (max <= 1) return "";
    var x = el.scrollLeft, l = x > 1, r = x < max - 1;
    return l && r ? "both" : l ? "left" : r ? "right" : "";
  }

  function sync(el) {
    var st = state(el);
    if (st === null) return;
    if (st) {
      if (el.getAttribute("data-scroll-fade") !== st) el.setAttribute("data-scroll-fade", st);
      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "region");
        el.setAttribute("aria-label", label(el));
      }
    } else {
      if (el.hasAttribute("data-scroll-fade")) el.removeAttribute("data-scroll-fade");
      if (el.hasAttribute("tabindex")) {
        el.removeAttribute("tabindex");
        el.removeAttribute("role");
        el.removeAttribute("aria-label");
      }
    }
  }

  var bound = typeof WeakSet === "function" ? new WeakSet() : null;

  function bind(scope) {
    var list = (scope || document).querySelectorAll(SEL);
    Array.prototype.forEach.call(list, function (el) {
      if (bound) { if (bound.has(el)) { sync(el); return; } bound.add(el); }
      else if (el.hasAttribute("data-win-fade-bound")) { sync(el); return; }
      else el.setAttribute("data-win-fade-bound", "");
      el.addEventListener("scroll", function () { sync(el); }, { passive: true });
      if ("ResizeObserver" in global) new ResizeObserver(function () { sync(el); }).observe(el);
      sync(el);
    });
  }

  var t = null;
  function schedule() { clearTimeout(t); t = setTimeout(function () { bind(document); }, 150); }

  function init() {
    bind(document);
    global.addEventListener("resize", schedule, { passive: true });
    /* ResizeObserver у прихованій вкладці не доставляється — пастка проєкту. */
    document.addEventListener("visibilitychange", function () { if (!document.hidden) schedule(); });
    /* Шрифти міняють ширину рядка вкладок — переміряти після їхнього приходу. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    /* Замок гостя знімає [hidden] з дітей <main> ПІЗНІШЕ за load (пастка 011). */
    document.addEventListener("aia:config-ready", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  global.AIA = global.AIA || {};
  global.AIA.winScrollers = { sync: function () { bind(document); }, SEL: SEL };
})(window);
