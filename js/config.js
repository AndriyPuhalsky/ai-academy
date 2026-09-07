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

  /* Контракт системи руху (П-10): вузли, створені ПІСЛЯ асинхронного fetch,
     інакше лишаються невидимими назавжди — так уже було тричі (003 D-01,
     005 Б-01, 009 D-04). Тому кожен render() закінчується цим викликом. */
  function bindMotion(root) {
    if (window.AIA && window.AIA.motion && root) window.AIA.motion.bind(root);
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

    // Жодної Tailwind-утиліти: клас, що приходить у DOM лише з JS, CDN
    // генерує через ~53 мс (006 D-02). Тільки компонентні класи.
    box.innerHTML =
      '<div class="ds-note ds-note--accent">' +
        '<span class="ds-note__glyph" aria-hidden="true">i</span>' +
        // ⚠ .ds-note — сітка `auto 1fr`, тому третій прямий нащадок падає в
        // ДРУГИЙ рядок. Кнопка закриття мусить лишитись у рядку тексту, тож
        // вона живе всередині __body. Значення — з токенів, не числа.
        '<p class="ds-note__body" style="display:flex;align-items:baseline;justify-content:space-between;gap:var(--s-4)">' +
          '<span>' + esc(a.text) + '</span>' +
          '<button type="button" data-dismiss class="ds-btn ds-btn--quiet ds-btn--sm ds-btn--icon" aria-label="Закрити оголошення">✕</button>' +
        '</p>' +
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
      // Римські номери заслужені: кожен трек спирається на попередній.
      return (
        '<div class="ds-row ds-row--track" data-reveal>' +
          '<span class="ds-row__n">' + (ROMAN[t.order - 1] || t.order) + '</span>' +
          '<span class="ds-row__main">' +
            '<span class="ds-row__title">' + esc(t.title) + '</span>' +
            '<span class="ds-row__desc">' + esc(t.subtitle) + '</span>' +
          '</span>' +
          '<span class="ds-row__side"><span class="ds-row__meta">' +
            count + " " + plural(count, ["модуль", "модулі", "модулів"]) +
          '</span></span>' +
        '</div>'
      );
    }).join("");
    bindMotion(grid);
  }

  /* ---------- Програма курсу ---------- */

  /* ⚠ Стан НІКОЛИ не кодується лише кольором і лише формою: слово лишається
     завжди, гліф і форма додаються (правило 3 системи, П-25). «Доступний» —
     стан за замовчуванням, тому гліфа не отримує: його кодує акцентна межа. */
  function badgeFor(module, done) {
    if (done) return '<span class="js-badge ds-badge ds-badge--done" data-glyph="✓">Пройдено</span>';
    if (module.status === "ready") return '<span class="js-badge ds-badge ds-badge--ready">Доступний</span>';
    return '<span class="js-badge ds-badge ds-badge--soon" data-glyph="○">Скоро</span>';
  }

  /* ⚠ Тут був рядок ДЕВʼЯТИ Tailwind-утиліт (`group grid grid-cols-[auto,1fr]
     gap-x-4 rounded-xl border border-line bg-surface px-5 py-5 transition
     hover:border-clay з альфою 50 …`). Дві причини прибрати:
     1. клас, що приходить у DOM лише з JS, Tailwind CDN генерує через ~53 мс
        (006 D-02, зсув 64,8 px);
     2. `hover:border-clay` з альфою 50 після переходу теми на var() став би
        rgba(0,0,0,0) — повністю прозорим, без помилки в консолі. */
  function moduleCard(m, done) {
    var isReady = m.status === "ready";
    var num = String(m.number).padStart(2, "0");
    var meta =
      esc(m.level) + " · " +
      m.lessons + " " + plural(m.lessons, ["урок", "уроки", "уроків"]) +
      " · ≈ " + m.durationMin + " хв";

    var inner =
      '<span class="ds-row__n">' + num + '</span>' +
      '<span class="ds-row__main">' +
        '<span class="ds-row__title">' + esc(m.title) + '</span>' +
        '<span class="ds-row__desc">' + esc(m.description) + '</span>' +
        '<span class="ds-row__meta">' + meta + '</span>' +
      '</span>' +
      '<span class="ds-row__side">' + badgeFor(m, done) +
        (isReady ? '<span class="ds-row__go" aria-hidden="true">→</span>' : "") +
      '</span>';

    if (isReady) {
      return (
        '<li data-reveal>' +
          '<a class="ds-row" href="' + esc(m.slug) + '" data-module-id="' + esc(m.id) + '">' +
            inner +
          '</a>' +
        '</li>'
      );
    }

    // Модулі зі статусом "soon" — видимі, але неклікабельні. Приглушеність
    // формою (пунктирний кант), а не тихішим кольором.
    return (
      '<li data-reveal>' +
        '<div class="ds-row ds-row--locked" data-module-id="' + esc(m.id) + '" aria-disabled="true">' +
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
        '<section>' +
          '<p class="ds-eyebrow text-accent">' + esc(trackWord) + (ROMAN[t.order - 1] || t.order) + '</p>' +
          '<h3 class="ds-h3">' + esc(t.title) + '</h3>' +
          '<ol class="ds-plain">' + own.map(function (m) { return moduleCard(m, done.has(m.id)); }).join("") + '</ol>' +
        '</section>'
      );
    }).join("");
    bindMotion(list);
  }

  /* ---------- Донати ---------- */

  function donationCard(method) {
    var label = esc(method.label);
    var note = method.note ? '<span class="ds-small">' + esc(method.note) + '</span>' : "";
    var head =
      '<div class="ds-fld__row">' +
        '<h3 class="ds-h4">' + label + '</h3>' + note +
      '</div>';

    var body;
    if (method.type === "link") {
      body =
        '<a class="ds-btn ds-btn--secondary" href="' + esc(method.value) + '" ' +
           'target="_blank" rel="noopener noreferrer">Відкрити ↗</a>';
    } else {
      // type === "copy": показуємо значення повністю (перенесення рядків)
      var copyValue = method.copyValue != null ? method.copyValue : method.value;
      body =
        '<div class="ds-code"><pre class="ds-code__pre">' + esc(method.value) + '</pre></div>' +
        '<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm ds-btn--copy" ' +
                'data-copy="' + esc(copyValue) + '">Копіювати</button>';
    }

    return '<div class="ds-card ds-donate" data-reveal>' + head + body + '</div>';
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
    bindMotion($("#donationGrid"));
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

  /* 006 · П-08 · Слово «Прогрес:» на екранах вужчих за 640 px ховається у
     .navprog-label (css/custom.css, база = sr-only): на 390 px воно розпихало
     шапку так, що назва курсу переносилась у два рядки. Ховаємо саме
     візуально, а не hidden sm:inline: геометрія однакова (обидва дають
     нульову ширину до 640), але hidden вилучив би слово з дерева
     доступності — скрінрідер прочитав би голе «3/12».
     Довжина рівно 9 символів; на ній стоїть арифметика резерву. */
  var NAVPROG_LABEL = "Прогрес: ";

  function navProgressText(doneCount, total) {
    return NAVPROG_LABEL + doneCount + "/" + total;
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
    // Другий резерв — для < 640 px, де видно лише числа: повна довжина
    // мінус «Прогрес: ». CSS вибирає потрібну змінну за брейкпоінтом.
    pill.style.setProperty("--navprog-short-ch", String(chars - NAVPROG_LABEL.length));
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
      // Резерв і заповнення міряються ОДНАКОВО: --navprog-ch ставиться і тут,
      // і в reserveNavProgress(), тому обидва стани — той самий бокс тієї
      // самої ширини, і CLS = 0 навіть якщо кеш резерву був порожній.
      pill.style.setProperty("--navprog-ch", String(text.length));
      pill.style.setProperty("--navprog-short-ch", String(text.length - NAVPROG_LABEL.length));
      // innerHTML, а не textContent: слово-мітка живе в окремому span, який
      // до 640 px схований візуально. У кеш і далі йде довжина ПОВНОГО тексту
      // (13/14) — діапазон валідації readNavProgressChars() не змінюється.
      // 006 · D-02: власний клас зі СТАТИЧНОГО CSS (.ds-pill__label), а не пара
      // утиліт sr-only/sm:not-sr-only. Клас, який приходить у DOM лише з JS,
      // Tailwind CDN генерує вже ПІСЛЯ вставки (QA: 53 мс), і пілюля весь цей
      // час була вужчою — шапка зсувалась на 64,8 px.
      // ⚠ Дубль цього рядка — js/claude-code-render.js: там і досі
      // .navprog-label із css/custom.css. Синхронізувати на етапі 5 (Ф-В).
      pill.innerHTML = '<span class="ds-pill__label">' + NAVPROG_LABEL.trim() + "</span>" +
        '<span class="ds-num">' + esc(doneCount + "/" + total) + "</span>";
      pill.classList.remove("ds-pill--unknown");
      pill.classList.toggle("ds-pill--full", doneCount === total);
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
        badge.className = "js-badge ds-badge ds-badge--done";
        badge.setAttribute("data-glyph", "✓");
        badge.textContent = "Пройдено";
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
