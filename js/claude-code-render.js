/* ============================================================
   005 · РЕНДЕР ЛЕНДІНГА «AI ТЕРМІНАЛ» З КОНФІГА
   ------------------------------------------------------------
   Перенесено з dev/design/005-ai-terminal/04-variants/_base/render.js.
   Аналог js/roadmap-render.js із задачі 003: власний рендерер, бо
   js/config.js малює фази картками в #tracksGrid і обслуговує два
   живі курси — його чіпати не можна, а карта програми тут має власну
   розмітку («рейка фаз + зміст книги»).

   У HTML немає жодного рядка тексту, який бачить користувач, — крім
   випадайки «Курси» в шапці: вона за рішенням власника (handoff
   2026-09-03) жорстко в розмітці, бо однакова на трьох лендінгах.

   ⚠ Форма даних — ПЛОСКА: tracks[] і modules[] окремо, модуль
   посилається на фазу полем `track`, лічильник модулів у фазі
   рахується фільтром, а не зберігається полем.

   Чотири відмінності від макета, усі зумовлені живим оточенням:
     1. шлях до конфіга береться з data-config на <html> (конвенція
        сайту), а не з літерала;
     2. [data-link] обробляється точно як у js/config.js:81–95 —
        порожнє посилання ВИДАЛЯЄ пункт, а не лишає href="#";
     3. футер показує «vX.Y.Z · оновлено 4 вересня 2026», як
        renderFooterMeta() у js/config.js, а не заглушку макета;
     4. прогрес долітає ПІСЛЯ рендера (config.json локальний, Supabase
        мережевий), тому доданий точковий апдейт по події aia:progress —
        той самий прийом, що refreshProgressUI() у js/config.js:418.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG_URL = window.CC_CONFIG_URL ||
    document.documentElement.getAttribute("data-config") || "claude-code.config.json";
  var NARROW = window.matchMedia("(max-width: 640px)");
  var cfg = null;

  /* ---------- дрібні помічники ---------- */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function setText(sel, value) { var el = $(sel); if (el) el.textContent = value; }
  function plural(n, forms) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
    return forms[2];
  }
  function pad2(n) { return n < 10 ? "0" + n : String(n); }
  function formatDate(iso) {
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString("uk-UA", {
        day: "numeric", month: "long", year: "numeric"
      });
    } catch (e) {
      return iso || "";
    }
  }

  /* ---------- прогрес ----------
     window.AIAProgress.completedSet() віддає множину КОДІВ модулів
     ('c01'…'c23'), а `id` у конфізі — той самий код. Збіг не випадковий:
     js/auth.js будує AIA_MODULE_MAP запитом без фільтра за курсом, тому
     коди модулів глобально унікальні (несуча конструкція проєкту). */
  function completedSet() {
    if (window.AIAProgress && typeof window.AIAProgress.completedSet === "function") {
      try { return window.AIAProgress.completedSet(); } catch (e) { /* нижче — порожньо */ }
    }
    return { size: 0, has: function () { return false; } };
  }

  /* ============================================================
     ПІЛЮЛЯ ПРОГРЕСУ В ШАПЦІ (#navProgress)
     ------------------------------------------------------------
     Шість функцій нижче скопійовані ДОСЛІВНО з js/config.js:336–415
     (разом із коментарями). Дублювання свідоме — рішення PM у плані
     005, контракт К1: підключити сюди js/config.js не можна, бо він
     сам малює [data-site] / [data-link] і карту фаз, які на цій
     сторінці вже обслуговує цей рендерер — вийшов би подвійний рендер
     і другий aia:config-ready.

     Ключ кеша спільний зі сторінками уроків курсу: і тут, і там
     data-config закінчується на "claude-code.config.json", тому
     .split("/").pop() дає той самий рядок. Резерв ширини працює вже
     з першого візиту на лендінг, якщо людина була на уроці.

     total = cfg.modules.length = 23, разом з іспитом c23: сторінки
     уроків рахують так само, і два різні числа в одній шапці на
     сусідніх сторінках були б дефектом.
     ============================================================ */

  // Кеш — окремий на кожен курс: у config.json 12 модулів, в architect 22.
  // Значення — не сам прогрес, а лише ДОВЖИНА тексту в символах (13 або 14),
  // тобто в localStorage не осідає, скільки саме модулів людина пройшла.
  var NAVPROG_KEY = "aia:navProgress:" + CONFIG_URL.split("/").pop();
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
    var pill = document.getElementById("navProgress");
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

  function updateNavProgress(conf) {
    var pill = document.getElementById("navProgress");
    var total = ((conf && conf.modules) || []).length;
    if (!pill || !total) return;
    // Рахуємо лише модулі ЦЬОГО курсу (перетин зі списком конфіга),
    // а не всі завершені id — інакше прогрес іншого курсу домішувався б (напр. 19/12).
    var done = completedSet();
    var doneCount = conf.modules.filter(function (m) { return done.has(m.id); }).length;
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

  /* ============================================================
     БЛОК ТЕРМІНАЛА: рядки сесії з даних
     ------------------------------------------------------------
     ПРАВИЛА, ЯКІ ТУТ ЗАШИТІ (їх ламати не можна):
       · `.term__line` — inline-block, а рядки склеюються "\n",
         який лишається в потоці <pre> ПОЗА обгортками;
       · маркер (`⏺`, `└─`, `❯`) — окремий елемент фіксованої
         ширини, а пробіл після нього — СПРАВЖНІЙ символ у потоці:
         тому скопійований текст збігається з видимим;
       · `⏺` і `└─` — aria-hidden (декор), `❯`, `$`, `>`, `+`, `−` — ні.
     ============================================================ */
  function sessionLine(it) {
    var mark, body;

    switch (it.t) {
      case "gap":
        return "";

      case "in":
        if (it.p === "$") {
          body = '<span class="term__meta">$</span> <span class="term__in">' + esc(it.s) + "</span>";
        } else {
          body = '<span class="term__in">' + esc((it.p ? it.p + " " : "") + it.s) + "</span>";
        }
        return '<span class="term__line term__line--type"><span class="term__clip">' + body + "</span></span>";

      case "tool":
        mark = '<span class="term__mark term__mark--tool" aria-hidden="true">' + esc(it.m) + "</span>";
        return '<span class="term__line term__line--step">' + mark + ' <span class="term__tool">' +
          esc(it.s) + "</span>" + esc(it.arg || "") + "</span>";

      case "res":
        mark = '<span class="term__mark term__mark--lg term__mark--meta" aria-hidden="true">' + esc(it.m) + "</span>";
        return '<span class="term__line term__line--step">  ' + mark +
          ' <span class="term__meta">' + esc(it.s) + "</span></span>";

      case "frame":
        /* Рамка дифу декоративна, ім'я файлу — ні. Тому aria-hidden
           стоїть на рисках, а не на всьому рядку. */
        return '<span class="term__line term__line--diff"><span class="term__clip"><span class="term__meta">' +
          '<span aria-hidden="true">' + esc(it.left) + "</span>" + esc(it.s) +
          '<span aria-hidden="true">' + esc(it.right) + "</span></span></span></span>";

      case "add":
      case "del":
        return '<span class="term__line term__line--diff"><span class="term__clip"><span class="term__' +
          (it.t === "add" ? "add" : "del") + '">' + esc(it.s) + "</span></span></span>";

      case "ask":
        return '<span class="term__line term__line--pop"><span class="term__in">' + esc(it.s) + "</span></span>";

      case "pick":
        mark = '<span class="term__mark term__mark--pick">' + esc(it.m) + "</span>";
        return '<span class="term__line term__line--pop term__line--pick">  ' + mark +
          ' <span class="term__pick">' + esc(it.s) + "</span></span>";
    }
    return "";
  }

  function sessionHTML(list) {
    return list.map(sessionLine).join("\n");
  }

  function renderHeroTerminal() {
    var pre = $("#heroBody");
    if (!pre) return;
    var data = NARROW.matches ? cfg.hero.sessionNarrow : cfg.hero.session;
    pre.innerHTML = sessionHTML(data);
    setText("#heroChrome", cfg.hero.chrome);
    var obj = document.querySelector(".cc-hero__object");
    if (obj) obj.classList.remove("is-reserved");
    document.dispatchEvent(new CustomEvent("cc:hero-rendered"));
  }

  /* ============================================================
     КАРТА ПРОГРАМИ
     ============================================================ */
  function rowBadge(m, isDone, isSoon, isStart) {
    if (isStart) return '<span class="cc-row__start">' + esc(cfg.map.startLabel) + "</span>";
    if (isDone)  return '<span class="badge badge-done">пройдено</span>';
    if (isSoon)  return '<span class="badge badge-soon">скоро</span>';
    return "";
  }

  function renderMap() {
    var host = $("#ccMap");
    if (!host) return;

    var done = completedSet();
    var modules = cfg.modules.filter(function (m) { return m.kind !== "exam"; });
    var exam = cfg.modules.filter(function (m) { return m.kind === "exam"; })[0];
    var startId = null;
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].status === "ready" && !done.has(modules[i].id)) { startId = modules[i].id; break; }
    }

    var tracks = cfg.tracks.slice().sort(function (a, b) { return a.order - b.order; });
    var html = "";

    tracks.forEach(function (tr) {
      var rows = modules.filter(function (m) { return m.track === tr.id; });
      var count = rows.length;

      html += '<li class="cc-phase cc-grid">' +
        '<span class="cc-node cc-phase__node" aria-hidden="true"></span>' +
        '<div class="cc-grid__rail">' +
          '<span class="cc-phase__num" aria-hidden="true">' + pad2(tr.order) + "</span>" +
          '<span class="cc-phase__count">' + count + " " + plural(count, cfg.map.moduleWord) + "</span>" +
        "</div>" +
        '<div class="cc-grid__body">' +
          '<h3 class="cc-phase__title">' + esc(tr.title) + "</h3>" +
          (tr.subtitle ? '<p class="cc-phase__sub">' + esc(tr.subtitle) + "</p>" : "") +
          '<ol class="cc-rows">';

      rows.forEach(function (m, idx) {
        var isDone = done.has(m.id);
        var isSoon = m.status === "soon";
        var isStart = m.id === startId;
        var cls = "cc-row" + (isDone ? " cc-row--done" : "") + (isSoon ? " cc-row--soon" : "");
        var tag = isSoon ? "span" : "a";
        var href = isSoon ? "" : ' href="' + esc(m.slug) + '"';
        var mark = rowBadge(m, isDone, isSoon, isStart);

        html += '<li class="' + cls + '" style="--i:' + idx + '" data-module-id="' + esc(m.id) + '">' +
          "<" + tag + ' class="cc-row__link"' + href + ">" +
            '<span class="cc-row__name">' + esc(m.title) + "</span>" +
            '<span class="cc-row__leader" aria-hidden="true"></span>' +
            '<span class="cc-row__badge">' + mark + "</span>" +
            '<span class="cc-row__num">' + pad2(m.number) + "</span>" +
          "</" + tag + "></li>";
      });

      html += "</ol></div></li>";
    });

    host.innerHTML = html;
    host.classList.remove("cc-map__reserve");

    /* Іспит — окремий вузол ПОЗА фазами. Інша геометрія: без leader,
       без номера, з видимим кінцем осі (рішення власника). */
    var examHost = $("#ccExam");
    if (examHost && exam) {
      examHost.innerHTML =
        '<span class="cc-node cc-exam__node" aria-hidden="true"></span>' +
        '<div class="cc-grid__rail"></div>' +
        '<div class="cc-grid__body">' +
          '<div class="cc-exam__box">' +
            '<h3 class="cc-exam__title">' + esc(exam.title) + "</h3>" +
            '<p class="cc-exam__text">' + esc(exam.text) + "</p>" +
            '<p class="cc-exam__meta">' + esc(exam.meta) + "</p>" +
          "</div></div>";
    }
    document.dispatchEvent(new CustomEvent("cc:map-rendered"));
  }

  /* Точкове оновлення карти без повного перерендеру — прогрес приходить
     через два мережеві кроки (config → Supabase) і майже завжди ПІЗНІШЕ
     за перший малюнок. Повний перерендер тут був би видимим: рядки мають
     `opacity: 0` до появи, тобто карта блимнула б у вже прокрученій
     сторінці. Той самий прийом і з тієї ж причини — js/config.js:418. */
  function refreshProgress() {
    if (!cfg) return;
    var done = completedSet();
    var modules = cfg.modules.filter(function (m) { return m.kind !== "exam"; });
    var startId = null;
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].status === "ready" && !done.has(modules[i].id)) { startId = modules[i].id; break; }
    }
    modules.forEach(function (m) {
      var li = document.querySelector('.cc-row[data-module-id="' + m.id + '"]');
      if (!li) return;
      var isDone = done.has(m.id);
      var isSoon = m.status === "soon";
      li.classList.toggle("cc-row--done", isDone);
      var badge = li.querySelector(".cc-row__badge");
      if (badge) badge.innerHTML = rowBadge(m, isDone, isSoon, m.id === startId);
    });
    updateNavProgress(cfg);
  }

  /* ============================================================
     РЕШТА СЕКЦІЙ
     ============================================================ */
  function listHTML(items, sign) {
    return items.map(function (t) {
      return '<li class="cc-list__item">' +
        '<span class="cc-list__sign">' + sign + "</span>" +
        '<span class="cc-list__text">' + esc(t) + "</span></li>";
    }).join("");
  }

  function navHTML(items, cls) {
    return items.map(function (n) {
      return '<a href="' + esc(n.href) + '" class="' + cls + '">' + esc(n.label) + "</a>";
    }).join("");
  }

  function renderRest() {
    var s = cfg.site, h = cfg.hero;

    document.title = s.tagline ? s.name + " — " + s.tagline : s.name;
    $$("[data-site]").forEach(function (el) {
      var v = s[el.getAttribute("data-site")];
      if (v) el.textContent = v;
    });

    /* Точно як js/config.js: порожнє посилання видаляє пункт,
       щоб не вести в нікуди. */
    $$("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      var val = (cfg.links || {})[key];
      if (!val) {
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

    /* Якірні пункти шапки. Випадайка «Курси» поруч — у розмітці. */
    var navDesk = $("#ccNav");
    if (navDesk && cfg.nav) navDesk.innerHTML = navHTML(cfg.nav, "transition hover:text-ivory");
    var navMob = $("#ccNavMobile");
    if (navMob && cfg.nav) {
      navMob.innerHTML = navHTML(cfg.nav,
        "rounded-lg px-3 py-2.5 text-muted transition hover:bg-surface hover:text-ivory");
    }

    /* hero */
    var title = $("#heroTitle");
    if (title) title.innerHTML = h.title.map(function (l) { return "<span>" + esc(l) + "</span>"; }).join("");
    setText("#heroLead", h.lead);
    setText("#heroExplainText", h.explain);
    setText("#heroStats", s.statsNote);
    setText("#heroHint", h.hint);
    var cta = $("#ctaStart");
    if (cta) { cta.textContent = h.cta.label; cta.setAttribute("href", h.cta.href); }
    var cta2 = $("#ctaMap");
    if (cta2) { cta2.textContent = h.ctaSecondary.label; cta2.setAttribute("href", h.ctaSecondary.href); }
    setText("#heroReplayLabel", h.replay);

    /* для кого */
    var a = cfg.audience;
    setText("#audTitle", a.title);
    setText("#audLead", a.lead);
    setText("#audForTitle", a.forTitle);
    setText("#audNotTitle", a.notTitle);
    var forList = $("#audFor"), notList = $("#audNot");
    if (forList) forList.innerHTML = listHTML(a.for, "+");
    if (notList) notList.innerHTML = listHTML(a.not, "−");

    /* чого навчишся */
    var o = cfg.outcomes;
    setText("#outTitle", o.title);
    setText("#outLead", o.lead);
    var outHost = $("#outList");
    if (outHost) {
      outHost.innerHTML = o.items.map(function (it) {
        return '<li class="cc-out__item">' + esc(it.text) +
          '<span class="cc-out__hint">' + esc(it.hint) + "</span></li>";
      }).join("");
    }

    /* карта */
    setText("#mapTitle", cfg.map.title);
    setText("#mapLead", cfg.map.lead);

    /* довідники */
    var r = cfg.references;
    setText("#refTitle", r.title);
    setText("#refLead", r.lead);
    var refHost = $("#refList");
    if (refHost) {
      refHost.innerHTML = r.items.map(function (it) {
        return "<li><a class=\"cc-ref\" href=\"" + esc(it.slug) + "\">" +
          '<span class="cc-ref__title">' + esc(it.title) + "</span>" +
          '<span class="cc-ref__sub">' + esc(it.subtitle) + "</span></a></li>";
      }).join("");
    }

    /* як влаштований урок */
    var ls = cfg.lessonShape;
    setText("#shapeTitle", ls.title);
    setText("#shapeLead", ls.lead);
    setText("#shapeNote", ls.note);
    var stepHost = $("#shapeSteps");
    if (stepHost) {
      stepHost.innerHTML = ls.steps.map(function (st, i) {
        return '<li class="cc-step"><span class="cc-step__num">' + pad2(i + 1) + "</span>" +
          '<span><span class="cc-step__name">' + esc(st.name) + "</span>" +
          '<span class="cc-step__desc">' + esc(st.desc) + "</span></span></li>";
      }).join("");
    }

    /* сертифікат */
    var c = cfg.certificate;
    setText("#certTitle", c.title);
    setText("#certLead", c.lead);
    setText("#certNote", c.note);
    setText("#certKind", c.paper.kind);
    setText("#certName", c.paper.name);
    setText("#certCourse", c.paper.course);
    setText("#certCode", c.paper.code);

    /* донати. Реквізити-посилання (банка monobank) робимо посиланням,
       а не текстом: URL, який не клікається, — це робота для користувача.
       `note` малюємо третім рядком, бо в кореневому config.json воно є
       й на двох живих курсах показується. */
    var d = cfg.donations;
    var donateSec = $("#donate");
    if (donateSec && !d.enabled) {
      donateSec.remove();
      $$('a[href="#donate"]').forEach(function (el) { el.remove(); });
    } else if (donateSec) {
      setText("#donateTitle", d.title);
      setText("#donateLead", d.lead);
      var dHost = $("#donateGrid");
      if (dHost) {
        dHost.innerHTML = d.methods.map(function (m) {
          var value = /^https?:\/\//.test(m.value)
            ? '<a class="cc-donate__link" href="' + esc(m.value) +
              '" target="_blank" rel="noopener noreferrer">' + esc(m.value) + "</a>"
            : esc(m.value);
          return '<li class="cc-donate__card"><span class="cc-donate__label">' + esc(m.label) + "</span>" +
            '<span class="cc-donate__value">' + value + "</span>" +
            (m.note ? '<span class="cc-donate__note">' + esc(m.note) + "</span>" : "") +
            "</li>";
        }).join("");
      }
    }

    /* футер */
    var f = cfg.footer;
    setText("#footProject", f.project);
    setText("#footSources", f.sources);
    setText("#footMade", f.made);
    setText("#footTop", f.top);
    var fl = $("#footLinks");
    if (fl) {
      fl.innerHTML = f.links.map(function (l) {
        return '<li><a href="' + esc(l.href) + '" class="text-muted transition hover:text-sand">' +
          esc(l.label) + "</a></li>";
      }).join("");
    }
    var contact = $("#contactTrigger");
    if (contact) {
      if (f.contact) contact.textContent = f.contact;
      else { var cp = contact.closest("p"); if (cp) cp.remove(); else contact.remove(); }
    }
    var fs = $("#footSourceLinks");
    if (fs) {
      fs.innerHTML = f.sourceLinks.map(function (l) {
        var href = cfg.links[l.key];
        if (!href) return "";
        return '<li><a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" ' +
          'class="text-muted transition hover:text-sand">' + esc(l.label) + " ↗</a></li>";
      }).join("");
    }
    /* Формат той самий, що renderFooterMeta() у js/config.js — інакше
       три блоки платформи підписані б по-різному. */
    var meta = $("#footerMeta");
    if (meta) {
      var parts = [];
      if (s.version) parts.push("v" + s.version);
      if (s.updated) parts.push("оновлено " + formatDate(s.updated));
      meta.textContent = parts.join(" · ");
    }

    /* оголошення */
    var ann = $("#announcement");
    if (ann && cfg.announcement && cfg.announcement.enabled && cfg.announcement.text) {
      ann.hidden = false;
      ann.innerHTML = '<div class="mx-auto max-w-content px-5 py-3 text-sm text-sand sm:px-8">' +
        esc(cfg.announcement.text) + "</div>";
    }
  }

  /* ---------- старт ---------- */

  // Синхронно, ще під час парсингу сторінки: резерв місця під пілюлю прогресу
  // має потрапити в перше малювання, інакше він сам стане зсувом (js/config.js:435).
  reserveNavProgress();

  fetch(CONFIG_URL, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      cfg = data;
      renderRest();
      renderHeroTerminal();
      renderMap();
      // Прогрес міг гідруватись ДО приходу конфіга — тоді події aia:progress
      // вже не буде, і пілюлю нікому заповнити. Другий виклик закриває саме
      // цей порядок; зворотний порядок закриває слухач унизу файла.
      updateNavProgress(cfg);
      document.dispatchEvent(new CustomEvent("cc:rendered"));
      /* Перемикання широкого / вузького варіанта сесії — це зміна
         ВМІСТУ, а не стилю, тому вимагає перерендеру. */
      var onChange = function () { renderHeroTerminal(); };
      if (NARROW.addEventListener) NARROW.addEventListener("change", onChange);
      else NARROW.addListener(onChange);
    })
    .catch(function (err) {
      var box = document.getElementById("configError");
      if (box) box.hidden = false;
      console.error("[claude-code] конфіг не завантажився:", err);
    });

  document.addEventListener("aia:progress", refreshProgress);
})();
