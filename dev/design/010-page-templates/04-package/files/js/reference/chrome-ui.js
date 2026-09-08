/* ============================================================================
   010 · СПІЛЬНИЙ ХРОМ · поведінка (канонічна версія Б1)
   ----------------------------------------------------------------------------
   Що це. Три речі, які на сайті стоять у ШЕСТИ місцях (десктоп + мобільне меню
   × три лендінги) і на 66 сторінках у шапці. У код їдуть у js/ui.js
   (initCourses / initMenu) і js/auth-ui.js (slotHtml). Тут вони зібрані в
   одному файлі, щоб Б2 і Б3 копіювали, а не переписували.

   ТРИ ПРАВИЛА, ЯКІ ТУТ ВТІЛЕНІ Й ЯКІ ЛЕГКО ЗЛАМАТИ
   1. Жоден клас, що приходить у DOM ТІЛЬКИ з JS, не є Tailwind-утилітою.
      Пастка 006 D-02: Tailwind CDN генерує такий клас через ~53 мс, і за цей
      час верстка стрибає на 64,8 px. Нижче кожен клас — компонентний (ds-*).
   2. Жодного числа тривалості рядком. Усе, що рухається, рухає CSS; те, що
      мусить знати час, питає AIA.motion (П-27).
   3. Дропдаун — це МЕНЮ, а не діалог: пастки фокуса тут немає й бути не може.
      Пастка фокуса є тільки в ds-dlg.
   ========================================================================== */
(function (global) {
  "use strict";

  var AIA = global.AIA = global.AIA || {};

  /* ==========================================================================
     1. Дропдаун «Курси» — повний клавіатурний контракт §6.3
     --------------------------------------------------------------------------
     Enter / Space / ↓ на тригері  → відкрити, фокус на ПЕРШИЙ пункт
     ↑ на тригері                  → відкрити, фокус на ОСТАННІЙ пункт
     ↓ / ↑ усередині меню          → наступний / попередній ІЗ ЗАВЕРНЕННЯМ
     Home / End                    → перший / останній
     Esc                           → закрити, фокус ПОВЕРТАЄТЬСЯ на тригер
     Tab усередині меню            → закрити й пустити фокус далі ПРИРОДНО
     клік поза / фокус за межі     → закрити без переміщення фокуса
     ========================================================================== */
  function initCourses(root) {
    var scope = root || document;
    var btn = scope.querySelector("#coursesBtn");
    var menu = scope.querySelector("#coursesMenu");
    if (!btn || !menu) return;
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
      var i = list.indexOf(document.activeElement);
      if (i < 0) i = delta > 0 ? -1 : 0;
      /* Завернення по колу: (i + delta + n) % n — без гілок «якщо кінець». */
      var n = list.length;
      list[(i + delta + n) % n].focus();
    }

    /* Тригер — <button>, тому Enter і Space вже дають click. Окремо
       обробляємо тільки стрілки, щоб не скролити сторінку. */
    btn.addEventListener("click", function () {
      if (isOpen()) close(false); else open(null);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open("first"); }
      else if (e.key === "ArrowUp") { e.preventDefault(); open("last"); }
      else if (e.key === "Escape") { close(true); }
    });

    menu.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown")      { e.preventDefault(); step(1); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); step(-1); }
      else if (e.key === "Home")      { e.preventDefault(); var f = items()[0]; if (f) f.focus(); }
      else if (e.key === "End")       { e.preventDefault(); var l = items(); if (l.length) l[l.length - 1].focus(); }
      else if (e.key === "Escape")    { e.preventDefault(); close(true); }
      else if (e.key === "Tab") {
        /* ⚠ ЗАМІРЯНО СПРАВЖНІМ НАТИСКАННЯМ 2026-09-07 (не синтетичною подією).
           Contract §6.3 вимагає двох речей одночасно: «закрити» і «не
           перехоплювати». Якщо просто не чіпати Tab, фокус іде на НАСТУПНИЙ
           ПУНКТ меню (заміряно: Базовий → AI Architect, меню лишається
           відкритим) — це поведінка списку, а не меню-кнопки.
           Якщо викликати preventDefault — це вже пастка фокуса, тобто діалог.
           Рішення без обох вад: закрити й повернути фокус на тригер, БЕЗ
           preventDefault. Браузер рахує наступний елемент від тригера, тому
           Tab виходить із групи вперед, а Shift+Tab — назад, як у патерні
           WAI-ARIA «menu button». */
        close(false);
        btn.focus();
      }
    });

    /* Клік по пункту закриває без повернення фокуса (людина йде за посиланням). */
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

  /* ==========================================================================
     2. Мобільне меню лендінга (≤640) — §6.4
     --------------------------------------------------------------------------
     Це НЕ шторка змісту уроку. Порогів два різні (640 vs 1024), шарів два
     різні (у потоці vs над шапкою), і блокування скролу тут НЕМАЄ.
     ========================================================================== */
  function initMenu(root) {
    var scope = root || document;
    var btn = scope.querySelector("#menuBtn");
    var panel = scope.querySelector("#mobileMenu");
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

  /* ==========================================================================
     3. Слот авторизації — ТРИ СТАНИ ОДНАКОВОЇ ШИРИНИ (CLS = 0)
     --------------------------------------------------------------------------
     Ширина слота фіксована токеном --hdr-slot-w, тому три стани збігаються
     ЗА КОНСТРУКЦІЄЮ — без заміру, без кеша в localStorage і без приватного
     режиму як окремого випадку (прод робив саме це).
     Розмітка нижче — канонічна: js/auth-ui.js має видавати рівно її.
     ========================================================================== */
  var SLOT = {
    /* «під час перевірки» — скелетон, і не раніше --delay-skeleton */
    checking: function (looksLoggedIn) {
      return looksLoggedIn
        ? '<span class="ds-skel ds-skel--avatar" data-delayed aria-hidden="true"></span>'
        : '<span class="ds-skel ds-skel--guest" data-delayed aria-hidden="true"></span>';
    },
    /* «гість». ⚠ ЗАМІРЯНО НА 390 px: слот на мобілці має ширину аватара
       (40 px), і кнопка зі словом «Увійти» в ньому стискалась до 40 px —
       напис вилазив за власну межу. Тому в кнопці ОДРАЗУ є і гліф, і слово:
       на десктопі видно слово, на ≤640 — гліф, а слово лишається в дереві
       доступності (.ds-btn__text, не sr-only з Tailwind: клас із JS Tailwind
       CDN генерує із затримкою, це дефект 006 D-02). */
    guest: function () {
      return '<button type="button" id="aiaLogin" class="ds-btn ds-btn--secondary ds-btn--sm ds-btn--auth">' +
               '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
               'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
               '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
               '<span class="ds-btn__text">Увійти</span></button>';
    },
    /* «залогінений»: аватар + імʼя. Сертифікати, вихід і зміна імені живуть
       в аркуші акаунта, який відкриває аватар (відступ названий у REPORT). */
    user: function (name) {
      var initial = (name || "?").trim().charAt(0).toUpperCase();
      return '<button type="button" id="aiaNameBtn" class="ds-btn ds-btn--quiet ds-btn--sm ds-btn--name" title="' +
               esc(name) + '">' + esc(name) + '</button>' +
             '<button type="button" id="aiaAvatar" class="ds-avatar" aria-haspopup="dialog" ' +
               'aria-label="Акаунт: ' + esc(name) + '">' + esc(initial) + '</button>';
    }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function setSlot(state, name) {
    var slot = document.getElementById("aiaAuth");
    if (!slot) return;
    if (state === "user") slot.innerHTML = SLOT.user(name || "Андрій Пухальський");
    else if (state === "guest") slot.innerHTML = SLOT.guest();
    else slot.innerHTML = SLOT.checking(state === "checking-user");
  }

  /* ==========================================================================
     4. Пілюля прогресу — резерв місця з ПЕРШОГО кадру
     --------------------------------------------------------------------------
     ⚠ Заборонено підставляти сюди будь-яку Tailwind-утиліту з JS: це рівно
     дефект 006 D-02. Підпис ховає власний клас .ds-pill__label зі статичного
     CSS, а ширину тримають --navprog-ch / --navprog-short-ch.
     Текст моноширинний (крок 0.6em), тому N символів — це рівно N ch.
     ========================================================================== */
  var PILL_LABEL = "Прогрес: ";

  function reservePill(chars) {
    var pill = document.getElementById("navProgress");
    if (!pill || !chars) return;
    pill.style.setProperty("--navprog-ch", String(chars));
    pill.style.setProperty("--navprog-short-ch", String(chars - PILL_LABEL.length));
    pill.setAttribute("data-reserved", "");
    pill.hidden = false;
  }

  function fillPill(done, total) {
    var pill = document.getElementById("navProgress");
    if (!pill) return;
    var text = PILL_LABEL + done + "/" + total;
    pill.style.setProperty("--navprog-ch", String(text.length));
    pill.style.setProperty("--navprog-short-ch", String(text.length - PILL_LABEL.length));
    pill.innerHTML = '<span class="ds-pill__label">' + esc(PILL_LABEL.trim()) + "</span>" +
                     '<span class="ds-num">' + done + "/" + total + "</span>";
    pill.removeAttribute("data-reserved");
    pill.classList.toggle("ds-pill--full", done === total);
    pill.classList.remove("ds-pill--unknown");
    pill.hidden = false;
  }

  /* ==========================================================================
     5. Старт
     ========================================================================== */
  function init() {
    initCourses(document);
    initMenu(document);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  AIA.chrome = {
    initCourses: initCourses,
    initMenu: initMenu,
    slotHtml: SLOT,
    setSlot: setSlot,
    reservePill: reservePill,
    fillPill: fillPill,
    esc: esc
  };
})(window);
