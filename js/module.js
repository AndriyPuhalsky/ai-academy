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

  function initDrawer() {
    var btn = $("#sidebarBtn");
    var aside = $("#moduleSidebar");
    var overlay = $("#sidebarOverlay");
    if (!btn || !aside || !overlay) return;

    function setOpen(open) {
      aside.classList.toggle("is-open", open);
      overlay.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    }

    btn.addEventListener("click", function () {
      setOpen(!aside.classList.contains("is-open"));
    });
    overlay.addEventListener("click", function () { setOpen(false); });
    aside.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Уроки поточної сторінки ---------- */

  function lessonsHtml() {
    return $all("[data-lesson]").map(function (sec) {
      return '<a class="snav-lesson" href="#' + esc(sec.id) + '">' +
        esc(sec.getAttribute("data-lesson")) + "</a>";
    }).join("");
  }

  var spy = null;

  function initScrollspy() {
    var links = $all(".snav-lesson");
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

    var html =
      '<a class="snav-home" href="../index.html">← На головну</a>' +
      '<div class="snav-progressbar" role="img" aria-label="Прогрес курсу: ' + share + '%">' +
        '<span style="width:' + share + '%"></span>' +
      "</div>" +
      '<p class="snav-count">' + doneCount + " з " + total + " модулів завершено</p>";

    tracks.forEach(function (t) {
      var own = modules.filter(function (m) { return m.track === t.id; });
      if (!own.length) return;

      html += '<p class="snav-track">Трек ' + (ROMAN[t.order - 1] || t.order) + " · " + esc(t.title) + "</p>";

      own.forEach(function (m) {
        var isCurrent = m.id === currentId;
        var isDone = done.has(m.id);
        var isReady = m.status === "ready";
        var isUnlocked = unlocked ? unlocked.has(m.id) : true;
        var no = String(m.number).padStart(2, "0");

        var inner =
          '<span class="no">' + no + "</span>" +
          '<span class="t">' + esc(m.title) +
            (isDone ? ' <span class="snav-check" aria-label="завершено">✓</span>' : "") +
          "</span>";

        if (isCurrent) {
          html += '<span class="snav-item is-current" aria-current="page">' + inner + "</span>";
          html += '<div class="snav-lessons">' + lessonsHtml() + "</div>";
        } else if (isReady && isUnlocked) {
          // Сторінки модулів лежать поруч у /modules, а слаги в config —
          // відносно кореня, тому додаємо "../"
          html += '<a class="snav-item" href="../' + esc(m.slug) + '">' + inner + "</a>";
        } else if (isReady) {
          html += '<span class="snav-item is-soon" aria-disabled="true">' + inner + '<span class="soon">🔒</span></span>';
        } else {
          html += '<span class="snav-item is-soon">' + inner + '<span class="soon">скоро</span></span>';
        }
      });
    });

    nav.innerHTML = html;
    initScrollspy();
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

    // Ліва картка: попередній модуль або повернення на головну
    if (!prev) {
      html += '<a class="mnav" href="../index.html">' +
        '<span class="mnav-label">← Назад</span>' +
        '<span class="mnav-title">Огляд курсу</span></a>';
    } else if (prev.status === "ready") {
      html += '<a class="mnav" href="../' + esc(prev.slug) + '">' +
        '<span class="mnav-label">← Модуль ' + prev.number + "</span>" +
        '<span class="mnav-title">' + esc(prev.title) + "</span></a>";
    } else {
      html += '<span class="mnav is-soon">' +
        '<span class="mnav-label">← Модуль ' + prev.number + " · скоро</span>" +
        '<span class="mnav-title">' + esc(prev.title) + "</span></span>";
    }

    // Права картка: наступний модуль (або фінал курсу)
    var currentDone = completedSet().has(currentId);
    if (!next) {
      html += '<a class="mnav mnav-next" href="../certificate.html">' +
        '<span class="mnav-label">Готово! →</span>' +
        '<span class="mnav-title">Ти пройшов(-ла) весь курс! Отримати сертифікат 🎓</span></a>';
    } else if (next.status === "ready" && currentDone) {
      html += '<a class="mnav mnav-next" href="../' + esc(next.slug) + '">' +
        '<span class="mnav-label">Далі: Модуль ' + next.number + " →</span>" +
        '<span class="mnav-title">' + esc(next.title) + "</span></a>";
    } else if (next.status === "ready") {
      html += '<span class="mnav mnav-next is-soon" aria-disabled="true">' +
        '<span class="mnav-label">🔒 Заверши цей модуль</span>' +
        '<span class="mnav-title">Далі: Модуль ' + next.number + " — " + esc(next.title) + "</span></span>";
    } else {
      html += '<span class="mnav mnav-next is-soon">' +
        '<span class="mnav-label">Далі · скоро</span>' +
        '<span class="mnav-title">Модуль ' + next.number + " — " + esc(next.title) + "</span></span>";
    }

    box.innerHTML = html;
  }

  /* ---------- Кнопка «Позначити завершеним» ---------- */

  var BTN_BASE = "mt-4 shrink-0 rounded-lg px-5 py-2.5 font-medium transition sm:mt-0 ";

  function refreshComplete() {
    var btn = $("#completeBtn");
    if (!btn || !window.AIAProgress || !currentId) return;

    var done = window.AIAProgress.isCompleted(currentId);
    var title = $("#completeTitle");

    if (done) {
      btn.className = BTN_BASE + "border border-clay/60 text-clay hover:border-line hover:text-muted";
      btn.textContent = "✓ Завершено · натисни, щоб скинути";
      if (title) title.textContent = "Модуль пройдено!";
    } else {
      btn.className = BTN_BASE + "bg-clay text-ink hover:bg-clay-deep";
      btn.textContent = "Позначити завершеним";
      if (title) title.textContent = "Модуль позаду?";
    }
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
      action = '<button type="button" id="aiaGateLogin" class="mt-5 inline-flex rounded-lg bg-clay px-5 py-2.5 font-medium text-ink transition hover:bg-clay-deep">Увійти / зареєструватися</button>';
    } else if (prev) {
      msg = "Спершу заверши Модуль " + prev.number + " — «" + esc(prev.title) + "».";
      action = '<a href="../' + esc(prev.slug) + '" class="mt-5 inline-flex rounded-lg bg-clay px-5 py-2.5 font-medium text-ink transition hover:bg-clay-deep">Перейти до Модуля ' + prev.number + " →</a>";
    } else {
      msg = "Цей модуль поки заблоковано.";
      action = '<a href="../index.html" class="mt-5 inline-flex rounded-lg border border-line px-5 py-2.5 transition hover:border-clay/60">На головну</a>';
    }

    var wrap = document.createElement("div");
    wrap.id = "aiaGate";
    wrap.className = "mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-8 text-center";
    wrap.innerHTML =
      '<p class="font-display text-2xl">🔒 Модуль заблоковано</p>' +
      '<p class="mt-3 text-muted">' + msg + "</p>" + action;
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
      Array.prototype.forEach.call(main.children, function (ch) {
        if (ch !== gate) ch.style.display = "none";
      });
    } else {
      if (gate) gate.remove();
      Array.prototype.forEach.call(main.children, function (ch) { ch.style.display = ""; });
    }
  }

  function applyGate(cfg) {
    // Не блокуємо, доки прогрес не підвантажено з сервера (щоб не блимало)
    if (!currentId || !window.AIAProgress || !window.AIAProgress.isHydrated || !window.AIAProgress.isHydrated()) return;
    var unlocked = unlockedCodes(cfg.modules || []);
    setMainLocked(!unlocked.has(currentId), cfg);
  }

  function initComplete() {
    var btn = $("#completeBtn");
    if (!btn || !window.AIAProgress || !currentId) return;
    btn.addEventListener("click", function () {
      var done = window.AIAProgress.isCompleted(currentId);
      window.AIAProgress.setCompleted(currentId, !done);
      // подія aia:progress оновить кнопку, сайдбар і лічильник у шапці
    });
  }

  /* ---------- Старт ---------- */

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
