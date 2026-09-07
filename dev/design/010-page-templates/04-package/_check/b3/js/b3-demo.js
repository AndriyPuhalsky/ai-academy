/* ============================================================================
   МАКЕТНИЙ СКРИПТ · У КОД САЙТУ НЕ ЇДЕ
   ----------------------------------------------------------------------------
   Робить рівно три речі, і всі три потрібні лише для показу:
     1. панель перемикання станів (?state=… і кнопки внизу);
     2. перемикач руху html.rm — щоб reduced-motion можна було подивитись
        не лізучи в налаштування системи (той самий механізм, що в tokens.css);
     3. живий лічильник символів у полі коду verify — це ЄДИНА частина файлу,
        логіку якої треба перенести в js/verify.js (див. REPORT.md).
   Жодного числа тривалості тут немає: усе, що рухається, рухається CSS-ом.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 1. Стани ---------- */
  var Q = new URLSearchParams(location.search);
  var wanted = Q.get("state");

  /* ?rm=1 — вимкнути рух ДО того, як стартують таймлайни. Потрібне рівно
     для роадмапа: gsap.matchMedia() і motionOn() читаються всередині start(),
     а він викликається на подію rm:rendered, тобто після парсингу. Кнопка
     внизу сторінки перемикає той самий клас, але вже після старту. */
  if (Q.get("rm") === "1") document.documentElement.classList.add("rm");

  function setState(name) {
    var groups = document.querySelectorAll("[data-state-group]");
    Array.prototype.forEach.call(groups, function (g) {
      var list = g.querySelectorAll("[data-state]");
      var found = false;
      Array.prototype.forEach.call(list, function (n) {
        var on = n.getAttribute("data-state") === name;
        n.hidden = !on;
        if (on) found = true;
      });
      /* Невідомий стан → показуємо перший, а не порожній екран. */
      if (!found && list.length) list[0].hidden = false;
    });
    document.querySelectorAll("[data-state-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-state-btn") === name));
    });
    if (window.AIA && window.AIA.motion) window.AIA.motion.bind(document);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-state-btn]");
    if (b) { setState(b.getAttribute("data-state-btn")); return; }

    var rm = e.target.closest("[data-toggle-rm]");
    if (rm) {
      var on = document.documentElement.classList.toggle("rm");
      rm.setAttribute("aria-pressed", String(on));
      rm.querySelector("[data-toggle-label]").textContent = on ? "рух вимкнено" : "рух увімкнено";
      return;
    }

    var dlgOpen = e.target.closest("[data-dlg-open]");
    if (dlgOpen) {
      var d = document.getElementById(dlgOpen.getAttribute("data-dlg-open"));
      if (d) openDlg(d, dlgOpen);
      return;
    }
    var dlgClose = e.target.closest("[data-dlg-close]");
    if (dlgClose) { closeDlg(dlgClose.closest(".ds-dlg")); return; }
    if (e.target.classList && e.target.classList.contains("ds-dlg__scrim")) {
      closeDlg(e.target.closest(".ds-dlg"));
    }
  });

  /* ---------- 2. Діалог: Esc, пастка фокуса, блокування скролу ---------- */
  var lockCount = 0, returnTo = null;

  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null || n === document.activeElement; });
  }
  function openDlg(d, trigger) {
    returnTo = trigger || document.activeElement;
    d.hidden = false;
    lockCount++; document.documentElement.classList.add("ds-lock");
    /* ⚠ НЕ requestAnimationFrame. Заміряно 2026-09-07 у живому Chrome:
       у вкладці, яка не рендериться (фон, оклюзія), rAF не викликається
       ЖОДНОГО разу, тож `hidden=false` спрацьовує, а перемикання data-open —
       ні: діалог опиняється в DOM із opacity 0 і людина бачить порожній
       затемнений екран. Примусовий reflow дає той самий «наступний кадр»
       для старту переходу, але виконується синхронно й від рендера не
       залежить. Той самий прийом уже стоїть у motion.js (M2 reveal) і
       в .term (рестарт друку). */
    void d.offsetWidth;
    d.setAttribute("data-open", "true");
    var f = focusables(d);
    if (f.length) f[0].focus();
  }
  function closeDlg(d) {
    if (!d) return;
    d.setAttribute("data-open", "false");
    lockCount = Math.max(0, lockCount - 1);
    if (!lockCount) document.documentElement.classList.remove("ds-lock");
    /* Ховаємо після виходу. transitionend приходить навіть при --motion:0 —
       епсилон 0.00002ms у tokens.css саме для цього (нуль подій не породжує). */
    var done = function () { d.hidden = true; d.removeEventListener("transitionend", done); };
    d.addEventListener("transitionend", done);
    setTimeout(done, 500);
    if (returnTo && returnTo.focus) returnTo.focus();
  }
  document.addEventListener("keydown", function (e) {
    var open = document.querySelector('.ds-dlg:not([hidden])');
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); closeDlg(open); return; }
    if (e.key !== "Tab") return;
    var f = focusables(open);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- 3. Лічильник символів коду (переноситься в js/verify.js) ----------
     Код сертифіката — 12 символів [0-9a-f]. Лічильник каже про коротке
     введення ДО натискання кнопки, а не після відповіді бази. */
  var CODE_LEN = 12;
  var input = document.getElementById("verifyInput");
  var count = document.getElementById("verifyCount");
  if (input && count) {
    var upd = function () {
      var n = input.value.replace(/\s+/g, "").length;
      count.textContent = n + " / " + CODE_LEN;
      count.setAttribute("data-state", n === 0 ? "short" : n < CODE_LEN ? "short" : n === CODE_LEN ? "full" : "over");
    };
    input.addEventListener("input", upd);
    upd();
  }

  if (wanted) setState(wanted);
})();
