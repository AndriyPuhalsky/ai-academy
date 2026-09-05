/* ============================================================
   005 · РЕНДЕР ЛЕНДІНГА З КОНФІГА
   ------------------------------------------------------------
   У HTML немає жодного рядка тексту, який бачить користувач
   (критерій А-14). Усе, що нижче, — з claude-code.config.json.

   У коді сайту цей файл стане js/claude-code-render.js — аналог
   js/roadmap-render.js із задачі 003. js/config.js не чіпається:
   він малює фази картками в #tracksGrid і обслуговує два живі
   курси; карта програми має власний рендерер із власною розміткою.

   ⚠ Форма даних — ПЛОСКА: tracks[] і modules[] окремо, модуль
   посилається на фазу полем `track`, лічильник модулів у фазі
   рахується фільтром, а не зберігається полем.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG_URL = "claude-code.config.json";
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

  /* ---------- прогрес ----------
     На сайті це window.AIAProgress.completedSet(). У макеті його немає,
     тому стан залогіненого імітується параметром ?progress=N —
     щоб валідатор міг подивитись обидва стани карти (критерій А-8). */
  function completedSet() {
    if (window.AIAProgress && typeof window.AIAProgress.completedSet === "function") {
      try { return window.AIAProgress.completedSet(); } catch (e) { /* далі — макетний шлях */ }
    }
    var m = /[?&]progress=(\d+)/.exec(window.location.search);
    var out = { size: 0, has: function () { return false; } };
    if (!m) return out;
    var n = parseInt(m[1], 10);
    var set = new Set();
    (cfg.modules || []).forEach(function (mod) {
      if (mod.kind !== "exam" && mod.number <= n) set.add(mod.id);
    });
    return set;
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
        var mark = isDone
          ? '<span class="badge badge-done">пройдено</span>'
          : (isSoon ? '<span class="badge badge-soon">скоро</span>' : "");
        if (isStart) mark = '<span class="cc-row__start">' + esc(cfg.map.startLabel) + "</span>";

        html += '<li class="' + cls + '" style="--i:' + idx + '">' +
          "<" + tag + ' class="cc-row__link"' + href + ">" +
            '<span class="cc-row__name">' + esc(m.title) + "</span>" +
            '<span class="cc-row__leader" aria-hidden="true"></span>' +
            (mark ? '<span class="cc-row__badge">' + mark + "</span>" : "") +
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

  /* ============================================================
     РЕШТА СЕКЦІЙ
     ============================================================ */
  function listHTML(items, mod, sign) {
    return items.map(function (t) {
      return '<li class="cc-list__item">' +
        '<span class="cc-list__sign">' + sign + "</span>" +
        '<span class="cc-list__text">' + esc(t) + "</span></li>";
    }).join("");
  }

  function renderRest() {
    var s = cfg.site, h = cfg.hero;

    document.title = s.name + " — " + s.tagline;
    $$("[data-site]").forEach(function (el) { el.textContent = s[el.getAttribute("data-site")] || ""; });
    $$("[data-link]").forEach(function (el) {
      var v = cfg.links[el.getAttribute("data-link")];
      if (v) el.setAttribute("href", v);
    });

    /* навігація в шапці */
    var navHost = document.querySelector(".cc-shell__nav");
    if (navHost && cfg.nav) {
      navHost.innerHTML = cfg.nav.map(function (n) {
        return '<a href="' + esc(n.href) + '">' + esc(n.label) + "</a>";
      }).join("");
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
    if (forList) forList.innerHTML = listHTML(a.for, "for", "+");
    if (notList) notList.innerHTML = listHTML(a.not, "not", "−");

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

    /* донати */
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
          return '<li class="cc-donate__card"><span class="cc-donate__label">' + esc(m.label) + "</span>" +
            '<span class="cc-donate__value">' + esc(m.value) + "</span></li>";
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
        return '<li><a href="' + esc(l.href) + '">' + esc(l.label) + "</a></li>";
      }).join("");
    }
    var fs = $("#footSourceLinks");
    if (fs) {
      fs.innerHTML = f.sourceLinks.map(function (l) {
        return '<li><a href="' + esc(cfg.links[l.key] || "#") + '">' + esc(l.label) + "</a></li>";
      }).join("");
    }
    /* Версії — явна заглушка, помітна оком. */
    var meta = $("#footerMeta");
    if (meta) {
      meta.innerHTML = s.name + ' · <span class="cc-stub">' + esc(s.version) +
        '</span> · <span class="cc-stub">' + esc(s.updated) + "</span>";
    }

    /* оголошення */
    var ann = $("#announcement");
    if (ann && cfg.announcement && cfg.announcement.enabled) {
      ann.hidden = false;
      ann.innerHTML = '<div class="cc-wrap" style="padding-block:var(--s-3)">' + esc(cfg.announcement.text) + "</div>";
    }
  }

  /* ---------- старт ---------- */
  fetch(CONFIG_URL, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      cfg = data;
      renderRest();
      renderHeroTerminal();
      renderMap();
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
})();
