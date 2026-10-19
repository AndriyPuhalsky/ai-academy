/* ============================================================================
   012 · js/navprogress.js — ПІЛЮЛЯ ПРОГРЕСУ В ШАПЦІ (#navProgress)
   ----------------------------------------------------------------------------
   Підключається ТІЛЬКИ з jira.html (рішення власника 2026-10-01, П-4).
   Чому окремим файлом, а не правкою js/config.js чи js/claude-code-render.js:
   ці два файли читають ще й [data-site], [data-link], карту фаз і сесію
   термінала — підключити будь-який із них до лендінга Jira означало б другий
   рендер і другий `aia:config-ready`. А третя інлайн-копія в HTML прямо
   заборонена `task.md` («чого НЕ робити»). Отже — четверте місце, але вперше
   окремим файлом, який можна перевикористати.

   ДЖЕРЕЛО КОДУ. Шість функцій нижче — js/config.js:356–445 ≡
   js/claude-code-render.js:97–204, разом із коментарями-причинами. Дублювання
   в проєкті вже свідоме (контракт К1 задачі 005); тут воно хоч би зведене до
   одного файла замість третьої копії в розмітці.

   ЧИМ ВІДРІЗНЯЄТЬСЯ ВІД ДВОХ ПОПЕРЕДНИКІВ
     · конфіг не fetch-ить сам — чекає `aia:config-ready` (його кидає
       js/jira-render.js у кінці fill(), з `detail` = конфіг). Отже рівно один
       мережевий запит на сторінку;
     · `reserve()` виконується СИНХРОННО при завантаженні файла: резерв ширини
       має потрапити в ПЕРШЕ малювання, інакше він сам стане зсувом
       (js/config.js:435). Тому тег стоїть у тілі сторінки, після шапки, і
       НЕ має ні `defer`, ні `async`.

   ⚠ КЛЮЧ КЕША СПІЛЬНИЙ З УРОКАМИ КУРСУ. І тут, і на 23 сторінках уроків
   `data-config` закінчується на `jira.config.json`, тому `.split("/").pop()`
   дає той самий рядок, і резерв працює вже з першого візиту на лендінг, якщо
   людина була на уроці. У сховище йде НЕ прогрес, а лише ДОВЖИНА тексту в
   символах — скільки саме уроків пройдено, там не осідає.
   ========================================================================== */
(function (global) {
  "use strict";

  var CONFIG_URL = document.documentElement.getAttribute("data-config") || "jira.config.json";
  var NAVPROG_KEY = "aia:navProgress:" + CONFIG_URL.split("/").pop();
  var NAVPROG_MAX_WAIT = 8000;   // страховка, якщо гідратації не буде взагалі

  /* 006 · П-08 · Слово «Прогрес:» на екранах вужчих за 640 px ховається
     візуально, а не hidden sm:inline: геометрія однакова (обидва дають нульову
     ширину до 640), але hidden вилучив би слово з дерева доступності —
     скрінрідер прочитав би голе «3/23». Носій — .ds-pill__label зі статичного
     css/components.css. Довжина рівно 9 символів; на ній стоїть арифметика
     резерву. */
  var NAVPROG_LABEL = "Прогрес: ";

  var cfg = null;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function pill() { return document.getElementById("navProgress"); }
  function navProgressText(doneCount, total) { return NAVPROG_LABEL + doneCount + "/" + total; }

  function readNavProgressChars() {
    try {
      var v = parseInt(localStorage.getItem(NAVPROG_KEY), 10);
      return (v >= 12 && v <= 24) ? v : 0;   // 12 = «Прогрес: 1/9», 24 — з великим запасом
    } catch (e) { return 0; }                // приватний режим — просто без кеша
  }
  function rememberNavProgress(chars) {
    try { localStorage.setItem(NAVPROG_KEY, String(chars)); } catch (e) { /* приватний режим */ }
  }
  function forgetNavProgress() {
    try { localStorage.removeItem(NAVPROG_KEY); } catch (e) { /* приватний режим */ }
  }

  /* Двійник guessLoggedIn() із js/auth-ui.js: там він приватний, а цей файл
     виконується РАНІШЕ за auth-ui.js, тож позичити його нізвідки. Обидва
     питають одне: чи лежить у сховищі ключ сесії supabase-js. */
  function hasAuthToken() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        if (/^sb-.*-auth-token$/.test(localStorage.key(i))) return true;
      }
    } catch (e) { return false; }
    return false;
  }

  function progressHydrated() {
    return !!(global.AIAProgress && global.AIAProgress.isHydrated && global.AIAProgress.isHydrated());
  }

  /* Множина кодів завершених модулів. AIAProgress.completedSet() — контракт
     js/progress.js; коди модулів глобально унікальні (несуча конструкція
     проєкту: js/auth.js будує AIA_MODULE_MAP без фільтра за курсом). */
  function completedSet() {
    if (global.AIAProgress && typeof global.AIAProgress.completedSet === "function") {
      try { return global.AIAProgress.completedSet(); } catch (e) { /* нижче — порожньо */ }
    }
    return { size: 0, has: function () { return false; } };
  }

  function reserve() {
    var p = pill();
    if (!p || !p.hidden) return;
    var chars = readNavProgressChars();
    if (!chars || !hasAuthToken()) return;   // гість або перший візит — місця не тримаємо
    p.style.setProperty("--navprog-ch", String(chars));
    // Другий резерв — для < 640 px, де видно лише числа: повна довжина
    // мінус «Прогрес: ». CSS вибирає потрібну змінну за брейкпоінтом.
    p.style.setProperty("--navprog-short-ch", String(chars - NAVPROG_LABEL.length));
    p.setAttribute("data-reserved", "");
    p.hidden = false;
    // Якщо прогрес не приїде взагалі (js/auth.js не піднявся, CDN Supabase
    // недоступний) — резерв не має лишитись невидимою дірою назавжди.
    setTimeout(function () {
      if (!progressHydrated() && p.hasAttribute("data-reserved")) {
        p.removeAttribute("data-reserved");
        p.hidden = true;
      }
    }, NAVPROG_MAX_WAIT);
  }

  function update() {
    var p = pill();
    var total = ((cfg && cfg.modules) || []).length;
    if (!p || !total) return;
    // Рахуємо лише модулі ЦЬОГО курсу (перетин зі списком конфіга), а не всі
    // завершені id — інакше прогрес іншого курсу домішувався б (напр. 26/23).
    var done = completedSet();
    var doneCount = cfg.modules.filter(function (m) { return done.has(m.id); }).length;
    if (doneCount > 0) {
      var text = navProgressText(doneCount, total);
      // Резерв і заповнення міряються ОДНАКОВО: --navprog-ch ставиться і тут, і
      // в reserve(), тому обидва стани — той самий бокс тієї самої ширини, і
      // CLS = 0 навіть якщо кеш резерву був порожній.
      p.removeAttribute("data-reserved");
      p.hidden = false;
      p.style.setProperty("--navprog-ch", String(text.length));
      p.style.setProperty("--navprog-short-ch", String(text.length - NAVPROG_LABEL.length));
      // innerHTML, а не textContent: слово-мітка живе в окремому span, який до
      // 640 px схований візуально. 006 · D-02: клас зі СТАТИЧНОГО CSS, а не
      // пара утиліт sr-only/sm:not-sr-only — клас, що приходить у DOM лише з
      // JS, Tailwind CDN генерує вже ПІСЛЯ вставки (53 мс), і шапка зсувалась
      // на 64,8 px.
      p.innerHTML = '<span class="ds-pill__label">' + NAVPROG_LABEL.trim() + "</span>" +
        '<span class="ds-num">' + esc(doneCount + "/" + total) + "</span>";
      p.classList.remove("ds-pill--unknown");
      p.classList.toggle("ds-pill--full", doneCount === total);
      rememberNavProgress(text.length);
    } else if (progressHydrated()) {
      // Нуль означає «нічого не пройдено» тільки ПІСЛЯ гідратації: до неї кеш
      // прогресу порожній у всіх, і згортати зарезервоване місце ще зарано.
      p.removeAttribute("data-reserved");
      p.hidden = true;
      forgetNavProgress();
    }
  }

  /* Синхронно, ще під час парсингу сторінки. */
  reserve();

  /* Два порядки, і кожен закритий своїм слухачем: конфіг приїхав після
     прогресу — спрацює цей; прогрес приїхав після конфіга — наступний. */
  document.addEventListener("aia:config-ready", function (e) {
    if (e && e.detail) cfg = e.detail;
    update();
  });
  document.addEventListener("aia:progress", update);

  global.AIA = global.AIA || {};
  global.AIA.navProgress = { reserve: reserve, update: update };
})(window);
