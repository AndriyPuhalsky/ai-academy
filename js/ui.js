/* ============================================================
   AI Академія — поведінка інтерфейсу головної сторінки:
   1) стрімінг hero-заголовка «токен за токеном» (фішка сайту:
      жива демонстрація того, як LLM генерує текст);
   2) мобільне меню + випадаючий список «Курси» в десктопній шапці;
   3) плавна поява блоків при скролі;
   4) копіювання реквізитів у буфер обміну.
   Усе поважає prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Стрімінг заголовка ---------- */

  // Грубе наближення BPE-токенізації: ріжемо слова на шматки
  // по 2–4 символи, щоб поява виглядала як справжня генерація.
  function tokenize(text) {
    var out = [];
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { out.push(part); return; }
      var i = 0;
      while (i < part.length) {
        var len = Math.min(part.length - i, 2 + Math.floor(Math.random() * 3));
        out.push(part.slice(i, i + len));
        i += len;
      }
    });
    return out;
  }

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  async function streamHero() {
    var parts = Array.prototype.slice.call(document.querySelectorAll("[data-stream]"));
    var caret = document.getElementById("heroCaret");
    if (!parts.length) return;

    // Зменшений рух: показуємо текст одразу, без анімації
    if (prefersReduced) {
      parts.forEach(function (el) { el.classList.add("is-done"); });
      if (caret) caret.remove();
      return;
    }

    for (var p = 0; p < parts.length; p++) {
      var el = parts[p];
      var full = el.textContent;
      el.textContent = "";
      el.classList.add("is-streaming");

      var tokens = tokenize(full);
      for (var t = 0; t < tokens.length; t++) {
        el.textContent += tokens[t];
        await delay(34 + Math.random() * 58);
      }

      el.classList.add("is-done");
      if (p < parts.length - 1) await delay(260); // пауза між рядками
    }

    // Даємо каретці поблимати і м'яко прибираємо
    if (caret) {
      setTimeout(function () { caret.classList.add("is-gone"); }, 2400);
      setTimeout(function () { caret.remove(); }, 3200);
    }
  }

  /* ---------- 2. Мобільне меню ---------- */

  function initMenu() {
    var btn = document.getElementById("menuBtn");
    var panel = document.getElementById("mobileMenu");
    if (!btn || !panel) return;

    function close() {
      panel.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", function () {
      var isOpen = !panel.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(isOpen));
    });

    // Закриваємо після переходу за посиланням і по Escape
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- 2bis. Випадаючий список «Курси» (десктопна шапка) ----------
     Задача 005 / handoff 2026-09-03. Свідомо той самий механізм, що в
     initMenu вище: кнопка з aria-expanded + клас `hidden` на панелі +
     Escape. Другого способу відкривати меню на сторінці бути не має.

     Три відмінності від мобільного меню, і кожна має причину:
       · закриття по кліку ПОЗА панеллю — випадайка накриває контент,
         мобільне меню штовхає його вниз, тому там це не потрібне;
       · Escape повертає фокус на кнопку (WCAG 2.4.3): інакше після
         закриття Tab продовжив би з кінця документа;
       · на мобілці панель не потрібна взагалі — там ті самі три курси
         лежать розгорнутим списком у #mobileMenu, тому кнопка схована
         класом `hidden sm:flex` і цей код для неї просто не спрацьовує.

     Руху в розкритті немає — тому й вимикати за prefers-reduced-motion
     нічого. Це свідомо: панель на 3 рядки, будь-яка анімація тут була б
     затримкою, а не сенсом. */

  function initCourses() {
    var btn = document.getElementById("coursesBtn");
    var panel = document.getElementById("coursesMenu");
    if (!btn || !panel) return;

    function isOpen() { return !panel.classList.contains("hidden"); }

    function close(focusBack) {
      if (!isOpen()) return;
      panel.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
      if (focusBack) btn.focus();
    }

    btn.addEventListener("click", function () {
      var open = !panel.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(open));
    });

    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) close(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close(true);
    });

    document.addEventListener("click", function (e) {
      if (!isOpen()) return;
      if (e.target.closest("#coursesMenu") || e.target.closest("#coursesBtn")) return;
      close(false);
    });

    // Фокус пішов з панелі й з кнопки (Tab уперед) — панель закривається.
    document.addEventListener("focusin", function (e) {
      if (!isOpen()) return;
      if (e.target.closest("#coursesMenu") || e.target === btn) return;
      close(false);
    });
  }

  /* ---------- 3. Поява блоків при скролі ---------- */

  var observer = null;

  function bindReveals() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal:not(.is-bound)"));
    if (!els.length) return;

    // Без підтримки IntersectionObserver або зі зменшеним рухом —
    // просто показуємо все одразу.
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible", "is-bound"); });
      return;
    }

    observer = observer || new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    els.forEach(function (el) {
      el.classList.add("is-bound");
      observer.observe(el);
    });
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
        btn.textContent = ok ? "Скопійовано ✓" : "Не вдалося";
        if (ok) btn.classList.add("text-clay", "border-clay/60");

        var live = document.getElementById("ariaLive");
        if (live) live.textContent = ok ? "Скопійовано в буфер обміну" : "Не вдалося скопіювати";

        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("text-clay", "border-clay/60");
        }, 1800);
      });
    });
  }

  /* ---------- Старт ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initCourses();
    initCopyButtons();
    bindReveals();   // статичні блоки
    streamHero();
  });

  // Динамічні блоки (картки модулів, донати) з'являються після
  // завантаження config.json — підв'язуємо їх до спостерігача теж.
  document.addEventListener("aia:config-ready", bindReveals);
  document.addEventListener("aia:config-failed", bindReveals);
})();


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
