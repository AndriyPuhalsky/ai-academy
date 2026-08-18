/* ============================================================
   AI Академія — поведінка інтерфейсу головної сторінки:
   1) стрімінг hero-заголовка «токен за токеном» (фішка сайту:
      жива демонстрація того, як LLM генерує текст);
   2) мобільне меню;
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
    initCopyButtons();
    bindReveals();   // статичні блоки
    streamHero();
  });

  // Динамічні блоки (картки модулів, донати) з'являються після
  // завантаження config.json — підв'язуємо їх до спостерігача теж.
  document.addEventListener("aia:config-ready", bindReveals);
  document.addEventListener("aia:config-failed", bindReveals);
})();
