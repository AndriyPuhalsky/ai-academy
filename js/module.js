/* ============================================================
   AI Академія — логіка сторінок модулів:
   1) сайдбар із програмою курсу (з config.json) і прогресом;
   2) перелік уроків поточного модуля + scrollspy;
   3) навігація «попередній / наступний модуль»;
   4) кнопка «Позначити завершеним» (AIAProgress → localStorage).
   Очікує, що js/config.js надішле подію aia:config-ready.
   Поточний модуль визначається атрибутом <body data-module="m01">.
   ============================================================ */
(function () {
  "use strict";

  var currentId = document.body.getAttribute("data-module");
  var cfgCache = null;

  /* Адреса лендінга СВОГО курсу. Донедавна вона була жорстко зашита на головну
     AI Академії — через що з уроку AI Architect «На головну» вело на чужий курс,
     і так само повело б з «AI Терміналу». Курсів стало три, тож адресу дає
     конфіг (site.home); fallback зберігає стару поведінку для config.json. */
  function homeHref(cfg) {
    var h = cfg && cfg.site && cfg.site.home;
    return "../" + (h || "index.html");
  }

  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function completedSet() {
    return window.AIAProgress ? window.AIAProgress.completedSet() : new Set();
  }

  // Множина кодів розблокованих модулів. Якщо в progress.js є unlockedSet —
  // беремо його; інакше рахуємо тут (захист від старої версії файлу).
  function unlockedCodes(modules) {
    if (window.AIAProgress && window.AIAProgress.unlockedSet) {
      return window.AIAProgress.unlockedSet(modules);
    }
    var done = completedSet();
    var byNumber = {};
    (modules || []).forEach(function (m) { byNumber[m.number] = m; });
    var set = new Set();
    (modules || []).forEach(function (m) {
      var ok = (m.number <= 1) || done.has(m.id);
      if (!ok) { var p = byNumber[m.number - 1]; if (p && done.has(p.id)) ok = true; }
      if (ok) set.add(m.id);
    });
    return set;
  }

  /* ---------- Мобільна «шторка» сайдбара ---------- */

  /* 010 · js-diff module.js:68 — замок скролу зі СПІЛЬНИМ лічильником.
     Було document.body.style.overflow: інлайновий стиль не знав про модалки,
     і два одночасні замки (шторка + «Написати нам») гасили один одного.
     ⚠ 010 · КЛАС `ds-lock` ЖИВЕ В ТРЬОХ ФАЙЛАХ І МІНЯЄТЬСЯ ЛИШЕ РАЗОМ.
     Замок ведуть js/module.js (шторка змісту), js/contact.js (модалка
     «Написати нам») і js/auth-ui.js (діалоги входу). Лічильник спільний —
     data-aia-lock на <html>. Якщо один із трьох знімає іншу назву класу,
     ніж вішає сусід, послідовність «шторка → модалка → закрити шторку →
     закрити модалку» лишає клас на <html> НАЗАВЖДИ, і скрол сторінки
     заморожений без жодної помилки в консолі.
     ⚠ `--ds-lock-sbw` — ширина смуги прокрутки, яку `overflow: hidden`
     забирає. Правило-споживач у css/components.css поки ВІДСУТНЄ (у пакеті
     є лише `html.ds-lock { overflow: hidden }`) — потрібні два рядки, див.
     03-frontend/report-d.md, розділ «Потрібні правила в спільних файлах». */
  function lockScroll(on) {
    var root = document.documentElement;
    var n = (parseInt(root.getAttribute("data-aia-lock"), 10) || 0) + (on ? 1 : -1);
    if (n > 0) {
      root.setAttribute("data-aia-lock", String(n));
      if (n > 1) return;
      var sbw = window.innerWidth - root.clientWidth;
      root.style.setProperty("--ds-lock-sbw", (sbw > 0 ? sbw : 0) + "px");
      root.classList.add("ds-lock");
      return;
    }
    root.removeAttribute("data-aia-lock");
    root.classList.remove("ds-lock");
    root.style.removeProperty("--ds-lock-sbw");
  }

  function initDrawer() {
    var btn = $("#sidebarBtn");
    var aside = $("#moduleSidebar");
    var overlay = $("#sidebarOverlay");
    if (!btn || !aside || !overlay) return;

    var open = false;

    /* refocus=false там, де фокус забирати не можна: клік по посиланню
       (він веде на якір уроку) і перехід через 1024 під час читання. */
    function setOpen(next, refocus) {
      if (next === open) return;
      open = next;
      aside.classList.toggle("is-open", open);
      overlay.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      lockScroll(open);
      if (!open && refocus !== false) btn.focus();
    }

    btn.addEventListener("click", function () { setOpen(!open, false); });
    overlay.addEventListener("click", function () { setOpen(false); });
    aside.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false, false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    /* 010 · js-diff module.js:62 — без цього замок скролу лишався назавжди:
       на ≥1024 шторка перетворюється на пристиковану колонку, а лічильник
       так і стоїть на одиниці. */
    if (window.matchMedia) {
      var mq = window.matchMedia("(min-width: 1024px)");
      var onWide = function (e) { if (e.matches) setOpen(false, false); };
      if (mq.addEventListener) mq.addEventListener("change", onWide);
      else if (mq.addListener) mq.addListener(onWide);
    }
  }

  /* ---------- Уроки поточної сторінки ---------- */

  function lessonsHtml() {
    return $all("[data-lesson]").map(function (sec) {
      return '<a class="ds-snav__lesson" href="#' + esc(sec.id) + '">' +
        esc(sec.getAttribute("data-lesson")) + "</a>";
    }).join("");
  }

  var spy = null;

  /* ⚠ 010 · js-diff module.js:104 — спостерігач НЕ ЧІПАТИ. Він висить на
     <section data-lesson>; будь-яка спроба зробити секцію display: contents
     дає 0×0 rect і вбиває скролспай на 57 сторінках. */
  function initScrollspy() {
    var links = $all(".ds-snav__lesson");
    var sections = $all("[data-lesson]");
    if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

    if (spy) spy.disconnect();

    var byId = {};
    links.forEach(function (link) {
      byId[link.getAttribute("href").slice(1)] = link;
    });

    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-active"); });
        var active = byId[entry.target.id];
        if (active) active.classList.add("is-active");
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ---------- Сайдбар: програма курсу з прогресом ---------- */

  function renderSidebar(cfg) {
    var nav = $("#sidebarNav");
    if (!nav) return;

    var modules = (cfg.modules || []).slice().sort(function (a, b) { return a.number - b.number; });
    var tracks = (cfg.tracks || []).slice().sort(function (a, b) { return a.order - b.order; });
    var done = completedSet();
    var unlocked = unlockedCodes(modules);
    var total = modules.length;
    var doneCount = modules.filter(function (m) { return done.has(m.id); }).length;
    var share = total ? Math.round((doneCount / total) * 100) : 0;

    /* ⚠ 010 · П-28 · js-diff module.js:138–140. `.ds-prog__bar` малює
       transform: scaleX(var(--prog-v)), а НЕ width. Прод ставив width —
       після міграції смуга лишилась би на нулі назавжди, без помилки. */
    var html =
      '<a class="ds-snav__home" href="' + homeHref(cfg) + '">← На головну</a>' +
      '<span class="ds-prog" role="img" aria-label="Прогрес курсу: ' + share + '%">' +
        '<span class="ds-prog__bar" style="--prog-v:' + (share / 100) + '"></span>' +
      "</span>" +
      '<p class="ds-snav__count">' + doneCount + " з " + total + " модулів завершено</p>";

    // Префікс уже містить пробіл — семантика та сама, що в js/config.js:227.
    var trackWord = (cfg.site && cfg.site.trackWord != null) ? cfg.site.trackWord : "Трек ";

    tracks.forEach(function (t) {
      var own = modules.filter(function (m) { return m.track === t.id; });
      if (!own.length) return;

      html += '<p class="ds-snav__track">' + esc(trackWord) + (ROMAN[t.order - 1] || t.order) +
              " · " + esc(t.title) + "</p>";

      own.forEach(function (m) { html += itemHtml(m, done, unlocked); });
    });

    /* 010 · js-diff module.js:118. Модулі з track: null (сьогодні це лише
       «Фінальний іспит» c23) не потрапляли в сайдбар ЖОДНОГО разу: на
       сторінці іспиту не підсвічувалось нічого, а лічильник казав «23 з 23»
       при 22 рядках. Відкат — зняти цей блок цілком, більше нічого не
       зачіпається. */
    var orphans = modules.filter(function (m) {
      return !tracks.some(function (t) { return t.id === m.track; });
    });
    if (orphans.length) {
      html += '<p class="ds-snav__track">' +
              (orphans[0].kind === "exam" ? "Іспит" : "Поза треками") + "</p>";
      orphans.forEach(function (m) { html += itemHtml(m, done, unlocked); });
    }

    nav.innerHTML = html;
    initScrollspy();
    /* Контракт руху: bind() у кінці кожного асинхронного render(). */
    if (window.AIA && window.AIA.motion) window.AIA.motion.bind(nav);
  }

  function itemHtml(m, done, unlocked) {
    var isCurrent = m.id === currentId;
    var isDone = done.has(m.id);
    var isReady = m.status === "ready";
    var isUnlocked = unlocked ? unlocked.has(m.id) : true;
    var no = String(m.number).padStart(2, "0");

    /* ⚠ 010 · js-diff module.js:160. Власний <span class="snav-check">✓</span>
       прибраний: гліф малює .ds-snav__item--done::after, і разом вийшло б
       два ✓ в рядку. Слово для скрінрідера лишається — гліф із ::after
       читається ненадійно. */
    var inner =
      '<span class="ds-snav__no">' + no + "</span>" +
      '<span class="ds-snav__t">' + esc(m.title) +
        (isDone ? ' <span class="sr-only">— завершено</span>' : "") +
      "</span>";
    var doneMod = isDone ? " ds-snav__item--done" : "";

    if (isCurrent) {
      /* ⚠ П-24: значення `page`, а не `true` — єдине правильне за WAI-ARIA.
         Селектор у components.css виправлений на [aria-current] без значення. */
      return '<span class="ds-snav__item' + doneMod + '" aria-current="page">' + inner + "</span>" +
             '<div class="ds-snav__lessons">' + lessonsHtml() + "</div>";
    }
    if (isReady && isUnlocked) {
      // Сторінки модулів лежать поруч у /modules, а слаги в config —
      // відносно кореня, тому додаємо "../"
      return '<a class="ds-snav__item' + doneMod + '" href="../' + esc(m.slug) + '">' + inner + "</a>";
    }
    if (isReady) {
      return '<span class="ds-snav__item is-soon" aria-disabled="true">' + inner +
             '<span class="ds-snav__soon">🔒</span></span>';
    }
    return '<span class="ds-snav__item is-soon">' + inner +
           '<span class="ds-snav__soon">скоро</span></span>';
  }

  /* ---------- Навігація «попередній / наступний» ---------- */

  function renderModuleNav(cfg) {
    var box = $("#moduleNav");
    if (!box) return;

    var modules = (cfg.modules || []).slice().sort(function (a, b) { return a.number - b.number; });
    var idx = modules.findIndex(function (m) { return m.id === currentId; });
    if (idx === -1) return;

    var prev = modules[idx - 1];
    var next = modules[idx + 1];
    var html = "";

    /* data-reveal — це ЄДИНІ вузли уроку з M2: вони народжуються після
       асинхронного render() і стоять за згином. Секції прози не анімуються. */
    function card(tag, href, mod, label, title) {
      var attrs = tag === "a" ? ' href="' + href + '"' : ' aria-disabled="true"';
      return "<" + tag + ' class="ds-mnav__item' + mod + '"' + attrs + ' data-reveal="">' +
               '<span class="ds-mnav__label">' + label + "</span>" +
               '<span class="ds-mnav__title">' + title + "</span>" +
             "</" + tag + ">";
    }

    // Ліва картка: попередній модуль або повернення на головну
    if (!prev) {
      html += card("a", homeHref(cfg), "", "← Назад", "Огляд курсу");
    } else if (prev.status === "ready") {
      html += card("a", "../" + esc(prev.slug), "",
                   "← Модуль " + prev.number, esc(prev.title));
    } else {
      html += card("span", "", " is-soon",
                   "← Модуль " + prev.number + " · скоро", esc(prev.title));
    }

    // Права картка: наступний модуль (або фінал курсу)
    var currentDone = completedSet().has(currentId);
    if (!next) {
      html += card("a", "../certificate.html", " ds-mnav--next ds-mnav__item--final",
                   "Готово! →", "Ти пройшов(-ла) весь курс! Отримати сертифікат 🎓");
    } else if (next.status === "ready" && currentDone) {
      html += card("a", "../" + esc(next.slug), " ds-mnav--next",
                   "Далі: Модуль " + next.number + " →", esc(next.title));
    } else if (next.status === "ready") {
      html += card("span", "", " ds-mnav--next is-soon",
                   "🔒 Заверши цей модуль",
                   "Далі: Модуль " + next.number + " — " + esc(next.title));
    } else {
      html += card("span", "", " ds-mnav--next is-soon",
                   "Далі · скоро",
                   "Модуль " + next.number + " — " + esc(next.title));
    }

    box.innerHTML = html;
    if (window.AIA && window.AIA.motion) window.AIA.motion.bind(box);
  }

  /* ---------- Кнопка «Позначити завершеним» ---------- */

  /* 010 · js-diff module.js:238. Було два рядки Tailwind-утиліт (П-08: клас із
     CDN приходить у DOM через ~53 мс). Стало два модифікатори компонента —
     і кнопка нарешті має заливку: bg-clay / text-ink у новій темі мертві. */
  function refreshComplete() {
    var btn = $("#completeBtn");
    if (!btn || !window.AIAProgress || !currentId) return;

    var done = window.AIAProgress.isCompleted(currentId);
    var title = $("#completeTitle");

    btn.className = "ds-btn " + (done ? "ds-btn--secondary" : "ds-btn--primary");
    btn.textContent = done ? "✓ Завершено · натисни, щоб скинути" : "Позначити завершеним";
    if (title) title.textContent = done ? "Модуль пройдено!" : "Модуль позаду?";
  }

  /* ---------- Блокування контенту заблокованого модуля ---------- */

  function buildGate(cfg) {
    var modules = cfg.modules || [];
    var cur = null, prev = null;
    modules.forEach(function (m) { if (m.id === currentId) cur = m; });
    if (cur) modules.forEach(function (m) { if (m.number === cur.number - 1) prev = m; });

    var loggedIn = !!window.AIA_USER;
    var msg, action;
    if (!loggedIn) {
      msg = "Цей модуль відкриється після входу та проходження попередніх по черзі.";
      action = '<button type="button" id="aiaGateLogin" class="ds-btn ds-btn--primary">Увійти / зареєструватися</button>';
    } else if (prev) {
      msg = "Спершу заверши Модуль " + prev.number + " — «" + esc(prev.title) + "».";
      action = '<a href="../' + esc(prev.slug) + '" class="ds-btn ds-btn--primary">Перейти до Модуля ' + prev.number + " →</a>";
    } else {
      msg = "Цей модуль поки заблоковано.";
      action = '<a href="' + homeHref(cfg) + '" class="ds-btn ds-btn--secondary">На головну</a>';
    }

    /* 010 · js-diff module.js:280+. Дев'ять Tailwind-утиліт у рядку JS
       замінені компонентом .ds-empty--gate — нового класу не заводимо. */
    var wrap = document.createElement("div");
    wrap.id = "aiaGate";
    wrap.className = "ds-empty ds-empty--gate";
    wrap.innerHTML =
      '<p class="ds-h3">🔒 Модуль заблоковано</p>' +
      '<p class="ds-small">' + msg + "</p>" + action;
    return wrap;
  }

  function setMainLocked(locked, cfg) {
    var main = $("#main");
    if (!main) return;
    var gate = $("#aiaGate");
    if (locked) {
      if (!gate) {
        gate = buildGate(cfg);
        main.insertBefore(gate, main.firstChild);
        var lg = gate.querySelector("#aiaGateLogin");
        if (lg) lg.addEventListener("click", function () {
          if (window.AIAAuth) window.AIAAuth.open("Увійди, щоб проходити курс по черзі.");
        });
      }
      /* П-31: hidden, а не інлайновий display. Атрибут програє будь-якій
         утиліті розкладки (у preflight це [hidden] = 0,1,0, і .grid теж),
         тому в components.css стоїть [hidden][hidden] = (0,2,0). Саме через
         це хвіст уроку (#moduleNav.ds-mnav) міг лишатись видимим під замком. */
      Array.prototype.forEach.call(main.children, function (ch) {
        if (ch !== gate) ch.hidden = true;
      });
    } else {
      if (gate) gate.remove();
      Array.prototype.forEach.call(main.children, function (ch) { ch.hidden = false; });
    }
  }

  /* 011 · рядок 8. Чи це напевно гість: сесії немає ні в памʼяті, ні в сховищі
     (supabase-js тримає її під ключем `sb-<ref>-auth-token` — та сама ознака,
     на яку спираються js/auth-ui.js і js/claude-code-render.js). Повернення з
     OAuth (?code= / #access_token=) — виняток: людина залогінена, а сесії в
     сховищі ще немає до обміну коду; там чекаємо hydrate(), як і раніше. */
  function guestForSure() {
    if (window.AIA_USER) return false;
    try {
      if (/[?&#](code|access_token|refresh_token)=/.test(location.search + location.hash)) return false;
      for (var i = 0; i < localStorage.length; i++) {
        if (/^sb-.*-auth-token$/.test(localStorage.key(i))) return false;
      }
    } catch (e) { return false; }   /* сховище недоступне → поводимось як раніше */
    return true;
  }

  function applyGate(cfg) {
    if (!currentId || !window.AIAProgress) return;
    /* Не блокуємо, доки прогрес не підвантажено з сервера (щоб не блимало) —
       для того, хто МОЖЕ бути залогінений. Для гостя рішення відоме синхронно:
       на сервері прогресу немає, unlockedSet рахується з порожнього кеша, і
       результат після hydrate([]) буде той самий. Чекати CDN supabase-js +
       запит modules + getSession (≈1,4–4 с) означало показати весь урок, а потім
       сховати його: футер стрибав у вʼюпорт (CLS 0,19–0,25 на 390, QA 010 коло 2).
       Тепер замок для гостя стає вже на aia:config-ready. Діаграми Mermaid при
       цьому малюються у схованих <pre> без шкоди — render() міряє мітки в
       тимчасовому контейнері в <body> (js/mermaid-init.js, рядок 4). */
    var hydrated = !!(window.AIAProgress.isHydrated && window.AIAProgress.isHydrated());
    if (!hydrated && !guestForSure()) return;
    var unlocked = unlockedCodes(cfg.modules || []);
    setMainLocked(!unlocked.has(currentId), cfg);
  }

  // Чи саме цей клік доводить курс до n/n. Умова сформульована через «усі інші
  // пройдені», а не через size + 1 === total: так вона лишається правильною,
  // навіть якщо людина зняла позначку з середини курсу.
  function isFinalClick() {
    var cfg = cfgCache || window.AIA_CONFIG;
    if (!window.AIA_USER) return false;                              // 1. є сесія
    if (!cfg || !cfg.modules || !cfg.modules.length) return false;
    if (!window.AIAProgress.isHydrated || !window.AIAProgress.isHydrated()) return false; // 2. прогрес підвантажено
    if (window.AIAProgress.isCompleted(currentId)) return false;     // 3. це не «зняти позначку»
    var done = window.AIAProgress.completedSet();
    return cfg.modules.every(function (m) {                          // 4. після цього кліку буде n/n
      return m.id === currentId || done.has(m.id);
    });
  }

  var completeBusy = false;   // діалог імені вже відкритий — другий клік ігноруємо

  function initComplete() {
    var btn = $("#completeBtn");
    if (!btn || !window.AIAProgress || !currentId) return;
    btn.addEventListener("click", function () {
      if (completeBusy) return;

      if (window.AIAProgress.isCompleted(currentId)) {       // зняти позначку
        window.AIAProgress.setCompleted(currentId, false);
        return;
      }
      if (!isFinalClick()) {                                 // звичайний модуль
        window.AIAProgress.setCompleted(currentId, true);
        return;
      }
      // Останній модуль курсу: перед submit_quiz (а отже, перед видачею
      // сертифіката) даємо людині підтвердити ім'я. Скасування = на сервер
      // нічого не йде, лічильник лишається n-1/n.
      if (!window.AIAAuth || typeof window.AIAAuth.confirmCertificateName !== "function") {
        window.AIAProgress.setCompleted(currentId, true);
        return;
      }
      completeBusy = true;
      window.AIAAuth.confirmCertificateName({ opener: btn })
        .then(function (ok) {
          if (ok) window.AIAProgress.setCompleted(currentId, true);
        })
        .catch(function (e) {
          console.error("[AIA] confirmCertificateName:", (e && e.message) || e);
        })
        .then(function () { completeBusy = false; });
      // подія aia:progress оновить кнопку, сайдбар і лічильник у шапці
    });
  }

  /* ---------- Старт ---------- */

  /* 011 · рядок 8, друга половина. Замок для гостя ставиться СИНХРОННО, ще під
     час розбору сторінки — до першого малювання, а не на aia:config-ready.
     Причина: aia:config-ready чекає DOMContentLoaded, а той — на mermaid.min.js
     із CDN (класичний <script> у кінці body блокує розбір): заміряно 1,2–1,5 с на
     холодному кеші. Стільки гість бачив увесь урок, перш ніж його ховав замок.
     Для гостя (guestForSure) на сервері прогресу немає, тож розблокований лише
     перший модуль; номер модуля читаємо з коду в <body data-module> — усі 57 кодів
     проєкту мають форму <префікс><дві цифри> (m01, a22, c23), а код глобально
     унікальний (несуча конструкція, див. кореневий CLAUDE.md). Незнайома форма
     коду → нічого не робимо, чекаємо конфіг. Помилка тут самовиправна: applyGate
     на aia:config-ready перерахує стан за справжнім списком модулів. */
  function numberFromCode(code) {
    var m = /^[a-z]+0*(\d+)$/i.exec(code || "");
    return m ? parseInt(m[1], 10) : NaN;
  }
  function earlyGuestGate() {
    if (!currentId || !guestForSure()) return;
    var n = numberFromCode(currentId);
    if (!(n > 1)) return;
    setMainLocked(true, { modules: [] });
  }
  earlyGuestGate();

  document.addEventListener("DOMContentLoaded", function () {
    initDrawer();
    initComplete();
    refreshComplete();
  });

  document.addEventListener("aia:config-ready", function (e) {
    cfgCache = e.detail;
    renderSidebar(cfgCache);
    renderModuleNav(cfgCache);
    refreshComplete();
    applyGate(cfgCache);
  });

  document.addEventListener("aia:progress", function () {
    refreshComplete();
    if (cfgCache) {
      renderSidebar(cfgCache);
      renderModuleNav(cfgCache);
      applyGate(cfgCache);
    }
  });

  // Захист: блокуємо перехід на заблокований модуль із сайдбара або навігації,
  // навіть якщо він раптом відрендериться як посилання.
  document.addEventListener("click", function (e) {
    var link = e.target.closest("#sidebarNav a[href], #moduleNav a[href]");
    if (!link || !cfgCache) return;
    var slug = (link.getAttribute("href") || "").replace(/^\.\.\//, "");
    var mod = (cfgCache.modules || []).filter(function (m) { return m.slug === slug; })[0];
    if (!mod) return; // це не модуль (напр. «На головну») — пропускаємо
    var unlocked = unlockedCodes(cfgCache.modules || []);
    if (!unlocked.has(mod.id)) {
      e.preventDefault();
      var live = document.getElementById("ariaLive");
      if (live) live.textContent = "Модуль заблоковано — спершу заверши попередній.";
    }
  });
})();
