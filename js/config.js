/* ============================================================
   AI Академія — завантаження config.json і рендер головної
   Принцип: увесь «адмінський» контент живе в config.json.
   Цей скрипт лише читає його і малює DOM. Жодних правок HTML
   для оновлення реквізитів чи додавання модулів не потрібно.
   ============================================================ */
(function () {
  "use strict";

  // На сторінках модулів шлях буде "../config.json" — задається
  // атрибутом data-config на <html>, тож скрипт спільний для всіх.
  var CONFIG_PATH = document.documentElement.getAttribute("data-config") || "config.json";

  /* ---------- Дрібні утиліти ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // Екранування для безпечної вставки текстів із config у innerHTML
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  // Українська плюралізація: plural(5, ["модуль", "модулі", "модулів"]) → "модулів"
  function plural(n, forms) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
    return forms[2];
  }

  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  function formatDate(iso) {
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString("uk-UA", {
        day: "numeric", month: "long", year: "numeric"
      });
    } catch (e) {
      return iso || "";
    }
  }

  function completedSet() {
    return window.AIAProgress ? window.AIAProgress.completedSet() : new Set();
  }

  /* ---------- Завантаження конфігурації ---------- */

  function loadConfig() {
    return fetch(CONFIG_PATH, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  /* ---------- Статичні підстановки ---------- */

  // Заповнює всі елементи з data-site="..." значеннями з config.site
  // і всі <a data-link="..."> посиланнями з config.links.
  function fillStatic(cfg) {
    var site = cfg.site || {};
    // На сторінках модулів <title> власний — не чіпаємо його.
    // Задача 003: на roadmap.html <title> приходить із roadmap.json, і два
    // асинхронні fetch інакше змагаються за document.title. Прапорець
    // data-own-title на <html> вимикає підстановку; сторінки без нього
    // поводяться точно так, як раніше.
    if (site.name && !document.body.hasAttribute("data-module") &&
        !document.documentElement.hasAttribute("data-own-title")) {
      document.title = site.tagline ? site.name + " — " + site.tagline : site.name;
    }

    $all("[data-site]").forEach(function (el) {
      var val = site[el.getAttribute("data-site")];
      if (val) el.textContent = val;
    });

    var links = cfg.links || {};
    $all("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      var val = links[key];
      if (!val) {
        // Посилання не задане в config — прибираємо пункт, щоб не вести в нікуди
        var li = el.closest("li");
        if (li) li.remove(); else el.remove();
        return;
      }
      if (key === "email") {
        el.href = "mailto:" + val;
      } else {
        el.href = val;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      }
    });
  }

  /* ---------- Оголошення ---------- */

  function renderAnnouncement(cfg) {
    var a = cfg.announcement;
    var box = $("#announcement");
    if (!box || !a || !a.enabled || !a.text) return;

    box.innerHTML =
      '<div class="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-2.5 sm:px-8">' +
        '<p class="font-mono text-xs text-sand sm:text-sm">' + esc(a.text) + '</p>' +
        '<button type="button" data-dismiss class="shrink-0 text-faint transition hover:text-sand" aria-label="Закрити оголошення">✕</button>' +
      '</div>';
    box.hidden = false;
    box.querySelector("[data-dismiss]").addEventListener("click", function () {
      box.remove();
    });
  }

  /* ---------- Hero: статистика та кнопка «Почати» ---------- */

  function renderHero(cfg) {
    var modules = cfg.modules || [];
    var tracks = cfg.tracks || [];
    var site = cfg.site || {};

    var stats = $("#heroStats");
    if (stats && modules.length) {
      var totalMin = modules.reduce(function (sum, m) { return sum + (m.durationMin || 0); }, 0);
      var hours = Math.max(1, Math.round(totalMin / 60));
      stats.textContent =
        modules.length + " " + plural(modules.length, ["модуль", "модулі", "модулів"]) +
        "  ·  " + tracks.length + " " + plural(tracks.length, ["трек", "треки", "треків"]) +
        "  ·  ≈ " + hours + " " + plural(hours, ["година", "години", "годин"]) + " практики" +
        "  ·  " + (site.statsNote || "безкоштовно назавжди");
    }

    // Кнопка веде на перший доступний модуль; якщо доступних ще немає —
    // лишається якорем на програму курсу.
    var firstReady = modules
      .filter(function (m) { return m.status === "ready"; })
      .sort(function (a, b) { return a.number - b.number; })[0];

    var cta = $("#ctaStart");
    if (cta && firstReady) {
      cta.href = firstReady.slug;
      cta.textContent = "Почати: Модуль " + firstReady.number;
    }
  }

  /* ---------- Треки ---------- */

  function renderTracks(cfg) {
    var grid = $("#tracksGrid");
    if (!grid) return;
    var tracks = (cfg.tracks || []).slice().sort(function (a, b) { return a.order - b.order; });
    var modules = cfg.modules || [];

    grid.innerHTML = tracks.map(function (t) {
      var count = modules.filter(function (m) { return m.track === t.id; }).length;
      return (
        '<div class="reveal bg-surface p-6">' +
          '<p class="mb-4 font-mono text-sm text-clay">' + (ROMAN[t.order - 1] || t.order) + '</p>' +
          '<h3 class="mb-2 font-display text-xl">' + esc(t.title) + '</h3>' +
          '<p class="mb-5 text-sm leading-relaxed text-muted">' + esc(t.subtitle) + '</p>' +
          '<p class="font-mono text-xs text-faint">' + count + " " + plural(count, ["модуль", "модулі", "модулів"]) + '</p>' +
        '</div>'
      );
    }).join("");
  }

  /* ---------- Програма курсу ---------- */

  function badgeFor(module, done) {
    if (done) return '<span class="js-badge badge badge-done">✓ Пройдено</span>';
    if (module.status === "ready") return '<span class="js-badge badge badge-ready">Доступний</span>';
    return '<span class="js-badge badge badge-soon">Скоро</span>';
  }

  function moduleCard(m, done) {
    var isReady = m.status === "ready";
    var num = String(m.number).padStart(2, "0");
    var meta =
      esc(m.level) + " · " +
      m.lessons + " " + plural(m.lessons, ["урок", "уроки", "уроків"]) +
      " · ≈ " + m.durationMin + " хв";

    var inner =
      '<span class="pt-1 font-mono text-sm text-faint">' + num + '</span>' +
      '<div>' +
        '<div class="flex flex-wrap items-center gap-3">' +
          '<h4 class="font-display text-lg">' + esc(m.title) + '</h4>' +
          badgeFor(m, done) +
        '</div>' +
        '<p class="mt-1.5 text-sm leading-relaxed text-muted">' + esc(m.description) + '</p>' +
        '<p class="mt-3 font-mono text-xs text-faint">' + meta + '</p>' +
      '</div>';

    if (isReady) {
      return (
        '<li class="reveal">' +
          '<a href="' + esc(m.slug) + '" data-module-id="' + esc(m.id) + '" ' +
             'class="group grid grid-cols-[auto,1fr] gap-x-4 rounded-xl border border-line bg-surface px-5 py-5 transition hover:border-clay/50 hover:bg-raised sm:grid-cols-[auto,1fr,auto] sm:gap-x-6 sm:px-6">' +
            inner +
            '<span class="hidden items-center text-clay opacity-0 transition group-hover:opacity-100 sm:flex" aria-hidden="true">→</span>' +
          '</a>' +
        '</li>'
      );
    }

    // Модулі зі статусом "soon" — видимі, але неклікабельні
    return (
      '<li class="reveal">' +
        '<div data-module-id="' + esc(m.id) + '" aria-disabled="true" ' +
             'class="grid grid-cols-[auto,1fr] gap-x-4 rounded-xl border border-line/70 bg-surface/60 px-5 py-5 sm:gap-x-6 sm:px-6">' +
          inner +
        '</div>' +
      '</li>'
    );
  }

  function renderSyllabus(cfg) {
    var list = $("#syllabusList");
    if (!list) return;

    var tracks = (cfg.tracks || []).slice().sort(function (a, b) { return a.order - b.order; });
    var modules = cfg.modules || [];
    var done = completedSet();
    var trackWord = (cfg.site && cfg.site.trackWord != null) ? cfg.site.trackWord : "Трек ";

    list.innerHTML = tracks.map(function (t) {
      var own = modules
        .filter(function (m) { return m.track === t.id; })
        .sort(function (a, b) { return a.number - b.number; });
      if (!own.length) return "";

      return (
        '<div>' +
          '<div class="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">' +
            '<span class="font-mono text-sm text-clay">' + esc(trackWord) + (ROMAN[t.order - 1] || t.order) + '</span>' +
            '<h3 class="font-display text-2xl">' + esc(t.title) + '</h3>' +
          '</div>' +
          '<ol class="space-y-3">' + own.map(function (m) { return moduleCard(m, done.has(m.id)); }).join("") + '</ol>' +
        '</div>'
      );
    }).join("");
  }

  /* ---------- Донати ---------- */

  function donationCard(method) {
    var label = esc(method.label);
    var note = method.note ? '<span class="text-xs text-faint">' + esc(method.note) + '</span>' : "";
    var head =
      '<div class="flex items-baseline justify-between gap-3">' +
        '<h3 class="font-medium">' + label + '</h3>' + note +
      '</div>';

    var body;
    if (method.type === "link") {
      body =
        '<a href="' + esc(method.value) + '" target="_blank" rel="noopener noreferrer" ' +
           'class="mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm transition hover:border-clay/60 hover:text-sand">' +
          'Відкрити ↗' +
        '</a>';
    } else {
      // type === "copy": показуємо значення повністю (перенесення рядків) і кнопку копіювання
      var copyValue = method.copyValue != null ? method.copyValue : method.value;
      body =
        '<div class="mt-auto flex flex-col gap-2">' +
          '<code class="min-w-0 whitespace-pre-wrap break-all rounded-lg border border-line bg-ink px-3 py-2 font-mono text-xs text-sand">' + esc(method.value) + '</code>' +
          '<button type="button" data-copy="' + esc(copyValue) + '" ' +
                  'class="w-fit shrink-0 rounded-lg border border-line px-3 py-2 text-sm transition hover:border-clay/60 hover:text-sand">' +
            'Копіювати' +
          '</button>' +
        '</div>';
    }

    return '<div class="reveal flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-5">' + head + body + '</div>';
  }

  function renderDonations(cfg) {
    var d = cfg.donations;
    var section = $("#donate");
    if (!section) return;

    // Розділ можна повністю вимкнути одним полем у config
    if (!d || !d.enabled) {
      section.remove();
      $all('a[href="#donate"]').forEach(function (a) { a.remove(); });
      return;
    }

    if (d.title) $("#donateTitle").textContent = d.title;
    if (d.subtitle) $("#donateSubtitle").textContent = d.subtitle;

    var methods = (d.methods || []).filter(function (m) { return m.enabled !== false; });
    $("#donationGrid").innerHTML = methods.map(donationCard).join("");
  }

  /* ---------- Футер і прогрес у шапці ---------- */

  function renderFooterMeta(cfg) {
    var el = $("#footerMeta");
    var site = cfg.site || {};
    if (!el) return;
    var parts = [];
    if (site.version) parts.push("v" + site.version);
    if (site.updated) parts.push("оновлено " + formatDate(site.updated));
    el.textContent = parts.join(" · ");
  }

  /* --- FIX-2 (знайдено при розборі D-1): пілюля прогресу не розсуває шапку ---
     Пілюля лежить у розмітці з hidden, а показується аж після гідратації
     прогресу — через два мережеві кроки (config.json → Supabase). QA бачив
     це як зсув групи DIV.flex у шапці 300 → 439 px (+139 = 12 gap + 127
     пілюля), внесок у CLS 0.00258 — більший, ніж давав слот авторизації.

     Тримаємо місце наперед, синхронно, ще до першого малювання: якщо в
     цьому браузері вже був прогрес на ЦЬОМУ курсі й лежить токен сесії —
     пілюля одразу стає в потік невидимою (data-reserved, visibility), а
     коли числа приїдуть, лише проявляється. Ширину резерву беремо з кеша:
     текст моноширинний (кожен гліф 0.6em), тому N символів — це рівно N ch,
     і резерв дорівнює боксу майбутньої пілюлі символ у символ. Кешуємо саме
     довжину, а не число модулів, бо «3/12» і «7/12» — однакова ширина, а
     різняться лише 13- і 14-символьні випадки («9/12» проти «10/12»).

     Гість місця не отримує: без токена й без кеша резерву немає взагалі,
     а хибний резерв знімається, щойно прогрес гідратовано нулем.

     Резерв — і тільки резерв — має min-width (секція L у css/custom.css).
     Видима пілюля лишається такою самою, як була: жодного нового правила
     на неї не діє, щоб на вузькому екрані шапка розкладалась як досі. --- */

  // Кеш — окремий на кожен курс: у config.json 12 модулів, в architect 22.
  // Значення — не сам прогрес, а лише ДОВЖИНА тексту в символах (13 або 14),
  // тобто в localStorage не осідає, скільки саме модулів людина пройшла.
  var NAVPROG_KEY = "aia:navProgress:" + CONFIG_PATH.split("/").pop();
  var NAVPROG_MAX_WAIT = 8000;   // страховка, якщо гідратації не буде взагалі

  function navProgressText(doneCount, total) {
    return "Прогрес: " + doneCount + "/" + total;
  }

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

  // Двійник guessLoggedIn() із js/auth-ui.js: там він приватний, а цей файл
  // виконується РАНІШЕ за auth-ui.js, тож позичити його нізвідки. Обидва
  // питають одне: чи лежить у сховищі ключ сесії supabase-js.
  function hasAuthToken() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        if (/^sb-.*-auth-token$/.test(localStorage.key(i))) return true;
      }
    } catch (e) { return false; }
    return false;
  }

  function progressHydrated() {
    return !!(window.AIAProgress && window.AIAProgress.isHydrated && window.AIAProgress.isHydrated());
  }

  function reserveNavProgress() {
    var pill = $("#navProgress");
    if (!pill || !pill.hidden) return;
    var chars = readNavProgressChars();
    if (!chars || !hasAuthToken()) return;   // гість або перший візит — місця не тримаємо
    pill.style.setProperty("--navprog-ch", String(chars));
    pill.setAttribute("data-reserved", "");
    pill.hidden = false;
    // Якщо прогрес не приїде взагалі (js/auth.js не піднявся, CDN Supabase
    // недоступний) — резерв не має лишитись невидимою дірою назавжди.
    setTimeout(function () {
      if (!progressHydrated() && pill.hasAttribute("data-reserved")) {
        pill.removeAttribute("data-reserved");
        pill.hidden = true;
      }
    }, NAVPROG_MAX_WAIT);
  }

  function updateNavProgress(cfg) {
    var pill = $("#navProgress");
    var total = (cfg.modules || []).length;
    if (!pill || !total) return;
    // Рахуємо лише модулі ЦЬОГО курсу (перетин зі списком конфіга),
    // а не всі завершені id — інакше прогрес іншого курсу домішувався б (напр. 19/12).
    var done = completedSet();
    var doneCount = (cfg.modules || []).filter(function (m) { return done.has(m.id); }).length;
    if (doneCount > 0) {
      var text = navProgressText(doneCount, total);
      // Знімаємо резерв і показуємо текст одним заходом: обидва стани — той
      // самий бокс тієї самої ширини, бо резервували рівно довжину тексту.
      pill.removeAttribute("data-reserved");
      pill.hidden = false;
      pill.textContent = text;
      rememberNavProgress(text.length);
    } else if (progressHydrated()) {
      // Нуль означає «нічого не пройдено» тільки ПІСЛЯ гідратації: до неї кеш
      // прогресу порожній у всіх, і згортати зарезервоване місце ще зарано.
      pill.removeAttribute("data-reserved");
      pill.hidden = true;
      forgetNavProgress();
    }
  }

  // Точкове оновлення бейджів без повного перерендеру
  // (викликається подією aia:progress зі сторінок модулів)
  function refreshProgressUI(cfg) {
    var done = completedSet();
    $all("[data-module-id]").forEach(function (card) {
      var badge = card.querySelector(".js-badge");
      if (badge && done.has(card.getAttribute("data-module-id"))) {
        badge.className = "js-badge badge badge-done";
        badge.textContent = "✓ Пройдено";
      }
    });
    updateNavProgress(cfg);
  }

  /* ---------- Старт ---------- */

  // Синхронно, ще під час парсингу сторінки: резерв місця під пілюлю прогресу
  // має потрапити в перше малювання, інакше він сам стане зсувом (FIX-2).
  reserveNavProgress();

  document.addEventListener("DOMContentLoaded", function () {
    loadConfig()
      .then(function (cfg) {
        window.AIA_CONFIG = cfg;
        fillStatic(cfg);
        renderAnnouncement(cfg);
        renderHero(cfg);
        renderTracks(cfg);
        renderSyllabus(cfg);
        renderDonations(cfg);
        renderFooterMeta(cfg);
        updateNavProgress(cfg);
        document.dispatchEvent(new CustomEvent("aia:config-ready", { detail: cfg }));
      })
      .catch(function (err) {
        console.error("[AIA] Не вдалося завантажити " + CONFIG_PATH + ":", err);
        var banner = $("#configError");
        if (banner) banner.hidden = false;
        document.dispatchEvent(new CustomEvent("aia:config-failed"));
      });
  });

  document.addEventListener("aia:progress", function () {
    if (window.AIA_CONFIG) refreshProgressUI(window.AIA_CONFIG);
  });
})();
