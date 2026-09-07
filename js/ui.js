/* ============================================================
   AI Академія — поведінка спільного хрому:
   1) друк hero-заголовка (фішка сайту: жива демонстрація того, як
      LLM генерує текст) — clip-path + steps(), НУЛЬ записів у DOM;
   2) мобільне меню лендінга (.ds-nav__drawer) і випадайка «Курси»
      з повним клавіатурним контрактом §6.3;
   3) копіювання реквізитів у буфер обміну.

   010 · що змінилось проти попередньої редакції:
   · власного IntersectionObserver для `.reveal` тут БІЛЬШЕ НЕМАЄ.
     Єдиний власник появи — AIA.motion ([data-reveal] + motion.bind()).
     Двох спостерігачів на сторінці бути не має: другий не знає про
     --motion і не гаситься пресетом data-motion="calm" (пастка П-27);
   · випадайка більше не перемикає клас `hidden` і не має власного
     z-index: стан тримає aria-expanded, вигляд — .ds-nav__menu;
   · initDropdown винесений у AIA.chrome — тим самим механізмом
     js/auth-ui.js відкриває аркуш акаунта (рішення власника Р-1);
   · reduced-motion питається в AIA.motion, а не в matchMedia:
     matchMedia бачить лише системну настройку й не знає ні про
     пресет data-motion, ні про --motion (пастка П-27);
   · [ЕТАП 8] друк заголовка більше не вставляє символи в DOM —
     див. коментар до typeHero(). Разом зі streamHero() пішли
     tokenize(), delay() і власний motionOn(): останній існував рівно
     для тієї гілки, а typeHero() питає AIA.motion.cps() напряму.
   ============================================================ */
(function (global) {
  "use strict";

  var AIA = global.AIA = global.AIA || {};

  /* ---------- 1. M10 · друк заголовка hero ----------
     010 · було: токенізатор «під BPE» + await-цикл, який дописував шматки
     в textContent. Ціна — ~30 записів у DOM на рядок, зірване виділення
     тексту мишею й стільки ж перечитувань скрінрідером; каретка малювалась
     класами .caret / .is-gone з css/custom.css, який зникає на етапі 9.

     Стало — той самий механізм, що вже несе всі 101 термінал сайту:
     clip-path: inset() + steps(N) на .ds-hero__type (components.css, D2).
     Записів у DOM НУЛЬ, текст лежить у розмітці з першого кадру.

     ⚠ П-05 · швидкість --p-term-speed-cps — ЄДИНИЙ токен руху, на який ДІЛЯТЬ,
     тому вона свідомо не множиться на --motion. Гілку вимкнення бере саме
     перевірка cps: AIA.motion.cps() віддає Infinity, коли рух вимкнено
     (системна настройка, пресет data-motion або html.rm), і тоді текст просто
     стоїть на місці, а каретка гаситься атрибутом data-gone.
     ⚠ Кількість кроків steps() = довжина рядка в символах, тривалість = n / cps.
     Обидва — через custom properties, бо @keyframes не бачить JS-змінних. */
  function typeHero() {
    var parts = Array.prototype.slice.call(document.querySelectorAll("[data-stream]"));
    var caret = document.getElementById("heroCaret");
    if (!parts.length) return;
    var M = AIA.motion;
    var cps = (M && M.cps) ? M.cps() : Infinity;
    if (!isFinite(cps) || cps <= 0) {
      parts.forEach(function (el) { el.classList.remove("is-typing"); });
      if (caret) caret.setAttribute("data-gone", "");
      return;
    }
    var pause = M.dur("state");          /* пауза між рядками — токен, не число */
    var acc = 0;
    parts.forEach(function (el) {
      var n = (el.textContent || "").length;
      el.style.setProperty("--hero-steps", n);
      el.style.setProperty("--hero-type-dur", (n / cps) + "s");
      el.style.setProperty("--hero-type-delay", acc + "s");
      el.classList.remove("is-typing");
      void el.offsetWidth;               /* рестарт анімації без таймера */
      el.classList.add("is-typing");
      acc += n / cps + pause;
    });
    if (caret) caret.removeAttribute("data-gone");
  }

  /* ---------- 2. Мобільне меню лендінга (≤640) ----------
     Це НЕ шторка змісту уроку: поріг 640 (не 1024), у потоці під шапкою
     (не над нею), без підложки й без блокування скролу. Стан тримає
     data-open, бо вигляд дає .ds-nav__drawer[data-open="true"], а клас
     `hidden` після зняття інлайнової теми більше не є контрактом. */

  function initMenu() {
    var btn = document.getElementById("menuBtn");
    var panel = document.getElementById("mobileMenu");
    if (!btn || !panel) return;

    function isOpen() { return panel.getAttribute("data-open") === "true"; }
    function set(open) {
      panel.setAttribute("data-open", open ? "true" : "false");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    btn.addEventListener("click", function () { set(!isOpen()); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !isOpen()) return;
      set(false);
      btn.focus();
    });

    /* Вікно поїхало вище порога — меню не має лишатись «відкритим» у стані,
       якого на цій ширині не існує. Слухач один, роботи на кадр нуль. */
    if (global.matchMedia) {
      var mq = global.matchMedia("(min-width: 640px)");
      var onChange = function (e) { if (e.matches) set(false); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ---------- 3. Випадайка-меню (§6.3) ----------
     Один механізм на два місця: «Курси» в шапці лендінга й аркуш акаунта,
     який відкриває аватар (js/auth-ui.js). Повний контракт:

       Enter / Space / ↓ на тригері  → відкрити, фокус на ПЕРШИЙ пункт
       ↑ на тригері                  → відкрити, фокус на ОСТАННІЙ пункт
       ↓ / ↑ усередині меню          → наступний / попередній ІЗ ЗАВЕРНЕННЯМ
       Home / End                    → перший / останній
       Esc                           → закрити, фокус ПОВЕРТАЄТЬСЯ на тригер
       Tab усередині меню            → закрити й пустити фокус далі ПРИРОДНО
       клік поза / фокус за межі     → закрити без переміщення фокуса

     ⚠ Це МЕНЮ, а не діалог: пастки фокуса тут немає й бути не може.
     ⚠ Закрите .ds-nav__menu має visibility: hidden — інакше його пункти
       лишаються в порядку табуляції як три «невидимі» зупинки (П-35). */

  function initDropdown(btn, menu) {
    if (!btn || !menu || btn.hasAttribute("data-menu-bound")) return;
    btn.setAttribute("data-menu-bound", "");
    var group = btn.closest(".ds-nav__group") || menu.parentNode;

    function items() {
      return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
    }
    function isOpen() { return btn.getAttribute("aria-expanded") === "true"; }

    function open(where) {
      btn.setAttribute("aria-expanded", "true");
      var list = items();
      if (!list.length) return;
      if (where === "last") list[list.length - 1].focus();
      else if (where === "first") list[0].focus();
    }
    function close(focusBack) {
      if (!isOpen()) return;
      btn.setAttribute("aria-expanded", "false");
      if (focusBack) btn.focus();
    }
    function step(delta) {
      var list = items();
      if (!list.length) return;
      var i = list.indexOf(document.activeElement);
      if (i < 0) i = delta > 0 ? -1 : 0;
      var n = list.length;
      list[(i + delta + n) % n].focus();   /* завернення по колу, без гілок */
    }

    /* Тригер — <button>, тому Enter і Space вже дають click. Окремо
       обробляємо лише стрілки, щоб не скролити сторінку. */
    btn.addEventListener("click", function () {
      if (isOpen()) close(false); else open(null);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open("first"); }
      else if (e.key === "ArrowUp") { e.preventDefault(); open("last"); }
      else if (e.key === "Escape") { close(true); }
    });

    menu.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown")    { e.preventDefault(); step(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
      else if (e.key === "Home")    { e.preventDefault(); var f = items()[0]; if (f) f.focus(); }
      else if (e.key === "End")     { e.preventDefault(); var l = items(); if (l.length) l[l.length - 1].focus(); }
      else if (e.key === "Escape")  { e.preventDefault(); close(true); }
      else if (e.key === "Tab") {
        /* Контракт вимагає двох речей одночасно: «закрити» і «не
           перехоплювати». Не чіпати Tab — фокус піде на НАСТУПНИЙ ПУНКТ
           меню (поведінка списку, а не меню-кнопки); preventDefault —
           це вже пастка фокуса, тобто діалог. Рішення без обох вад:
           закрити й повернути фокус на тригер БЕЗ preventDefault, тоді
           браузер рахує наступний елемент від тригера. */
        close(false);
        btn.focus();
      }
    });

    /* Клік по пункту закриває без повернення фокуса (людина йде далі). */
    menu.addEventListener("click", function (e) {
      if (e.target.closest('[role="menuitem"]')) close(false);
    });

    /* Фокус пішов за межі групи — Tab уперед, Shift+Tab назад, клік деінде. */
    group.addEventListener("focusout", function (e) {
      if (!isOpen()) return;
      var to = e.relatedTarget;
      if (to && group.contains(to)) return;
      close(false);
    });

    document.addEventListener("pointerdown", function (e) {
      if (!isOpen()) return;
      if (group.contains(e.target)) return;
      close(false);
    });
  }

  function initCourses() {
    initDropdown(document.getElementById("coursesBtn"),
                 document.getElementById("coursesMenu"));
  }

  /* ---------- 4. Копіювання реквізитів ---------- */

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value).then(
        function () { return true; },
        function () { return legacyCopy(value); }
      );
    }
    return Promise.resolve(legacyCopy(value));
  }

  function legacyCopy(value) {
    try {
      var ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e) {
      return false;
    }
  }

  function initCopyButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy]");
      if (!btn) return;

      copyText(btn.getAttribute("data-copy")).then(function (ok) {
        var original = btn.textContent;
        btn.textContent = ok ? "Скопійовано" : "Не вдалося";
        /* ⚠ Не Tailwind-утиліта: клас, що приходить у DOM лише з JS, CDN
           генерує через ~53 мс (006 D-02). Гліф ✓ малює
           .ds-btn--copy[data-copied]::after зі статичного CSS. */
        if (ok) btn.setAttribute("data-copied", "");

        var live = document.getElementById("ariaLive");
        if (live) live.textContent = ok ? "Скопійовано в буфер обміну" : "Не вдалося скопіювати";

        setTimeout(function () {
          btn.textContent = original;
          btn.removeAttribute("data-copied");
        }, 1800);
      });
    });
  }

  /* ---------- Старт ---------- */

  function init() {
    initMenu();
    initCourses();
    initCopyButtons();
    typeHero();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  AIA.chrome = AIA.chrome || {};
  AIA.chrome.initDropdown = initDropdown;
})(window);


/* ============================================================
   ПОВЕДІНКА КОМПОНЕНТА «ТЕРМІНАЛ»
   ------------------------------------------------------------
   Тут НЕМАЄ анімації: рух лендінга живе в частині A, а на сторінках
   уроків руху в терміналі немає взагалі.

   Дві поведінки:
     1. .term__copy — копіює ТІЛЬКИ введений текст (без префіксів
        `$` / `>` і без виводу). Копіювати сесію разом із кроками
        інструментів безглуздо, тому кнопка є лише в .term--cmd.
     2. .term__more — розгортає стан 8 «довгий вивід». Без анімації
        свідомо: анімувати height у блоці на 243 рядки = layout
        thrashing без жодної користі.

   ⚠ Слухач делегований на document, тому працює і для блоків, які
   з'являться пізніше (рядки термінала народжуються після fetch конфіга).

   Переїхало сюди з js/claude-code-motion.js 2026-09-04: той файл тягне
   GSAP і потрібен лише лендінгу, а ця поведінка потрібна ще й усім
   23 сторінкам модулів. ui.js підключений і там, і там.
   Вимога до розмітки: #ariaLive на сторінці (є і на лендінгу, і в уроках).
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
