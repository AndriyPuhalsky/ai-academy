/* ============================================================================
   010 · T1b — ЛЕНДІНГ «AI ТЕРМІНАЛ» · рендер
   ----------------------------------------------------------------------------
   Дзеркало js/claude-code-render.js проду на дизайн-системі 009.
   93 імені класів `cc-*` лишились; змінились значення токенів.

   ТРИ ПРАВИЛА `.term`, ЯКІ ТУТ ЗБЕРЕЖЕНІ ДОСЛІВНО (§8.4)
   1. Буфер копіювання БАЙТ У БАЙТ дорівнює видимому тексту: .term__line —
      inline-block, символи \n лишаються в потоці <pre> ПОЗА обгортками.
   2. Маркери ⏺ └─ ❯ — окремі елементи ФІКСОВАНОЇ ширини колонки (1ch / 2ch),
      а пробіл після маркера лишається СПРАВЖНІМ символом рядка.
   3. Друк — clip-path + steps(). НУЛЬ посимвольної вставки в DOM.

   Наприкінці render() — подія cc:rendered і AIA.motion.bind(document).
   Порядок міняти не можна: cc-motion.js слухає подію, яку кидає цей файл.
   ========================================================================== */
(function (global) {
  "use strict";

  var M = (global.AIA && global.AIA.motion) || null;
  var C = (global.AIA && global.AIA.chrome) || null;
  var esc = (C && C.esc) || function (s) { return String(s == null ? "" : s); };

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function set(id, text) { var el = document.getElementById(id); if (el && text != null) el.textContent = text; }
  function plural(n, f) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return f[0];
    if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return f[1];
    return f[2];
  }

  /* ---------- hero ---------- */
  function line(inner) { return '<span class="term__line">' + inner + "</span>\n"; }
  function mark(g, lg) { return '<span class="term__mark' + (lg ? " term__mark--lg" : "") + '">' + esc(g) + "</span>"; }

  function session(rows) {
    return rows.map(function (r) {
      switch (r.t) {
        case "gap":   return "\n";
        case "in":    return line(mark(r.p) + " " + '<span class="term__in">' + esc(r.s) + "</span>");
        case "tool":  return line(mark(r.m) + " " + '<span class="term__tool">' + esc(r.s) + "</span>" +
                                  (r.arg ? '<span class="term__meta">' + esc(r.arg) + "</span>" : ""));
        case "res":   return line(mark(r.m, true) + " " + '<span class="term__meta">' + esc(r.s) + "</span>");
        case "frame": return line('<span class="term__meta">' + esc((r.left || "") + r.s + (r.right || "")) + "</span>");
        case "add":   return line('<span class="term__add">' + esc(r.s) + "</span>");
        case "del":   return line('<span class="term__del">' + esc(r.s) + "</span>");
        case "ask":   return line(esc(r.s));
        case "pick":  return '<span class="term__line term__line--pick">' + mark(r.m) + " " +
                             '<span class="term__pick">' + esc(r.s) + "</span></span>\n";
        default:      return line(esc(r.s || ""));
      }
    }).join("").replace(/\n$/, "");
    /* ⚠ ОСТАННІЙ \n ПРИБИРАЄТЬСЯ СВІДОМО. Заміряно 2026-09-07:
       selection.toString() відкидає кінцевий перенос, а textContent його
       тримає — і тест «буфер байт у байт» падав на 1 символі з 347.
       Дефекту в розмітці не було, але критерій приймання 31 не терпить
       «майже дорівнює»: різницю прибрано в джерелі, а не в тесті. */
  }

  function renderHero(cfg) {
    var h = cfg.hero || {}, site = cfg.site || {};
    var title = $("#heroTitle");
    if (title) title.innerHTML = (h.title || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
    set("heroLead", h.lead);
    set("heroExplainText", h.explain);
    set("heroChrome", h.chrome);
    set("heroHint", h.hint);
    set("heroReplayLabel", h.replay);
    set("heroStats", site.statsNote);

    var cta = $("#ctaStart");
    if (cta && h.cta) { cta.href = h.cta.href; cta.textContent = h.cta.label; }
    var cta2 = $("#ctaMap");
    if (cta2 && h.ctaSecondary) { cta2.href = h.ctaSecondary.href; cta2.textContent = h.ctaSecondary.label; }

    /* Вузька сесія на ≤640: інший ТЕКСТ, не інший компонент. */
    var narrow = global.matchMedia && global.matchMedia("(max-width: 640px)").matches;
    var rows = (narrow && h.sessionNarrow) ? h.sessionNarrow : h.session;
    var body = $("#heroBody");
    if (body && rows) body.innerHTML = '<span class="term__clip">' + session(rows) + "</span>";

    var obj = $(".cc-hero__object");
    if (obj) obj.classList.remove("is-reserved");   /* резерв більше не потрібен */
  }

  /* ---------- для кого ---------- */
  function renderAudience(cfg) {
    var a = cfg.audience || {};
    set("audTitle", a.title); set("audLead", a.lead);
    set("audForTitle", a.forTitle); set("audNotTitle", a.notTitle);
    var item = function (sign, text) {
      return '<li class="cc-list__item"><span class="cc-list__sign" aria-hidden="true">' + sign +
             '</span><span class="cc-list__text">' + esc(text) + "</span></li>";
    };
    var f = $("#audFor"), n = $("#audNot");
    if (f) f.innerHTML = (a["for"] || []).map(function (t) { return item("+", t); }).join("");
    if (n) n.innerHTML = (a.not || []).map(function (t) { return item("−", t); }).join("");
  }

  /* ---------- чого навчишся ---------- */
  function renderOutcomes(cfg) {
    var o = cfg.outcomes || {};
    set("outTitle", o.title); set("outLead", o.lead);
    var el = $("#outList");
    if (el) el.innerHTML = (o.items || []).map(function (it) {
      return '<li class="cc-out__item" data-reveal="">' + esc(it.text) +
             '<span class="cc-out__hint">' + esc(it.hint) + "</span></li>";
    }).join("");
  }

  /* ---------- карта програми ---------- */
  function renderMap(cfg) {
    var m = cfg.map || {}, site = cfg.site || {};
    set("mapTitle", m.title); set("mapLead", m.lead);
    var phases = (cfg.tracks || []).slice().sort(function (a, b) { return a.order - b.order; });
    var mods = (cfg.modules || []).slice().sort(function (a, b) { return a.number - b.number; });
    var exam = mods[mods.length - 1];
    var lessons = mods.slice(0, -1);
    var word = m.moduleWord || ["модуль", "модулі", "модулів"];
    var first = lessons[0];

    var host = $("#ccMap");
    if (host) {
      host.innerHTML = phases.map(function (p) {
        var own = lessons.filter(function (x) { return x.track === p.id; });
        if (!own.length) return "";
        return (
          '<li class="cc-phase cc-grid" data-reveal="">' +
            '<span class="cc-node cc-phase__node" aria-hidden="true"></span>' +
            '<div class="cc-grid__rail">' +
              '<span class="cc-phase__num">' + String(p.order).padStart(2, "0") + "</span>" +
              '<span class="cc-phase__count">' + own.length + " " + plural(own.length, word) + "</span>" +
            "</div>" +
            '<div class="cc-grid__body">' +
              '<h3 class="cc-phase__title">' + esc(p.title) + "</h3>" +
              '<p class="cc-phase__sub">' + esc(p.subtitle) + "</p>" +
              '<ol class="cc-rows">' + own.map(function (x) { return row(x, x === first, m); }).join("") + "</ol>" +
            "</div>" +
          "</li>"
        );
      }).join("");
    }

    var box = $("#ccExam");
    if (box && exam) {
      box.innerHTML =
        '<span class="cc-node cc-exam__node" aria-hidden="true"></span>' +
        '<div class="cc-grid__rail"></div>' +
        '<div class="cc-grid__body" data-reveal="">' +
          '<a class="cc-exam__box" href="' + esc(exam.slug) + '">' +
            '<span class="cc-exam__head">' +
              '<span class="cc-exam__title">' + esc(exam.title) + "</span>" +
              '<span class="cc-exam__badge"></span>' +
            "</span>" +
            '<span class="cc-exam__text">Останній крок: 12 питань із 26 тем курсу. Після нього — сертифікат із кодом, який можна перевірити.</span>' +
            '<span class="cc-exam__meta">' + esc(site.statsNote || "") + "</span>" +
          "</a>" +
        "</div>";
    }
  }

  function row(x, isFirst, m) {
    var done = false;
    var cls = "cc-row" + (done ? " cc-row--done" : "") + (x.status === "ready" ? "" : " cc-row--soon");
    return (
      '<li class="' + cls + '">' +
        '<a class="cc-row__link" href="' + esc(x.slug) + '">' +
          '<span class="cc-row__name">' + esc(x.title) + "</span>" +
          '<span class="cc-row__leader" aria-hidden="true"></span>' +
          (isFirst ? '<span class="cc-row__start">' + esc(m.startLabel || "") + "</span>" : "") +
          '<span class="cc-row__badge"></span>' +
          '<span class="cc-row__num">' + String(x.number).padStart(2, "0") + "</span>" +
        "</a>" +
      "</li>"
    );
  }

  /* ---------- полиця довідників ---------- */
  function renderRefs(cfg) {
    var r = cfg.references || {};
    set("refTitle", r.title); set("refLead", r.lead);
    var el = $("#refList");
    if (el) el.innerHTML = (r.items || []).map(function (it) {
      return '<li data-reveal=""><a class="cc-ref" href="' + esc(it.slug) + '">' +
             '<span class="cc-ref__title">' + esc(it.title) + "</span>" +
             '<span class="cc-ref__sub">' + esc(it.subtitle) + "</span></a></li>";
    }).join("");
  }

  /* ---------- як влаштований урок ---------- */
  function renderShape(cfg) {
    var s = cfg.lessonShape || {};
    set("shapeTitle", s.title); set("shapeLead", s.lead); set("shapeNote", s.note);
    var el = $("#shapeSteps");
    /* Номери ЗАСЛУЖЕНІ: це справді послідовність із восьми кроків. */
    if (el) el.innerHTML = (s.steps || []).map(function (st, i) {
      return '<li class="cc-step"><span class="cc-step__num">' + String(i + 1).padStart(2, "0") + "</span>" +
             '<span><span class="cc-step__name">' + esc(st.name) + "</span>" +
             '<span class="cc-step__desc">' + esc(st.desc) + "</span></span></li>";
    }).join("");
  }

  /* ---------- сертифікат ---------- */
  function renderCert(cfg) {
    var c = cfg.certificate || {}, p = c.paper || {};
    set("certTitle", c.title); set("certLead", c.lead); set("certNote", c.note);
    set("certKind", p.kind); set("certName", p.name);
    set("certCourse", p.course); set("certCode", p.code);
  }

  /* ---------- донати ---------- */
  function renderDonations(cfg) {
    var d = cfg.donations, section = $("#donate");
    if (!section) return;
    if (!d || !d.enabled) { section.remove(); return; }
    set("donateTitle", d.title); set("donateLead", d.lead);
    var el = $("#donateGrid");
    if (!el) return;
    el.innerHTML = (d.methods || []).map(function (m) {
      var body = m.type === "link"
        ? '<a class="cc-btn cc-btn--quiet cc-donate__btn" href="' + esc(m.value) + '" target="_blank" rel="noopener noreferrer">Відкрити ↗</a>'
        : '<code class="cc-donate__value">' + esc(m.value) + "</code>" +
          '<button type="button" class="cc-btn cc-btn--quiet cc-donate__btn ds-btn--copy" data-copy="' +
          esc(m.copyValue != null ? m.copyValue : m.value) + '">Копіювати</button>';
      return '<li class="cc-donate__card" data-reveal="">' +
               '<span class="cc-donate__label">' + esc(m.label) + (m.note ? " · " + esc(m.note) : "") + "</span>" +
               body + "</li>";
    }).join("");
  }

  /* ---------- футер і посилання ---------- */
  function renderCommon(cfg) {
    var site = cfg.site || {}, links = cfg.links || {};
    $all("[data-site]").forEach(function (el) {
      var k = el.getAttribute("data-site");
      if (site[k] != null && site[k] !== "") el.textContent = site[k];
    });
    /* ⚠ П-11 · у проді links.github і links.telegram — порожні. */
    $all("[data-link]").forEach(function (el) {
      var u = links[el.getAttribute("data-link")];
      if (u) { el.href = u; return; }
      (el.closest("li") || el).remove();
    });
    var meta = $("#footerMeta");
    if (meta) meta.textContent = "v" + site.version + " · оновлено " + site.updated;
    document.title = site.name + " — " + site.tagline;
  }

  function initCopy() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-copy]");
      if (!b) return;
      var v = b.getAttribute("data-copy");
      var ok = function () {
        b.setAttribute("data-copied", "");
        var live = $("#ariaLive");
        if (live) live.textContent = "Скопійовано: " + v;
      };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(ok, ok); else ok();
    });
  }

  /* ---------- старт ---------- */
  function boot() {
    fetch(document.documentElement.getAttribute("data-config"), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (cfg) {
        renderCommon(cfg);
        renderHero(cfg);
        renderAudience(cfg);
        renderOutcomes(cfg);
        renderMap(cfg);
        renderRefs(cfg);
        renderShape(cfg);
        renderCert(cfg);
        renderDonations(cfg);
        initCopy();
        if (C) { C.reservePill(13); C.setSlot("checking"); }
        setTimeout(function () {
          if (!C) return;
          C.setSlot(localStorage.getItem("b1:user") ? "user" : "guest", "Андрій Пухальський");
          C.fillPill(0, (cfg.modules || []).length);
        }, M ? (M.dur("page-in") + M.delay("skeleton")) * 1000 : 0);

        /* ⚠ КОНТРАКТ СИСТЕМИ: bind() у кінці КОЖНОГО асинхронного render(). */
        if (M) M.bind(document);
        /* Порядок: спершу DOM готовий і озброєний, аж потім хореографія. */
        document.dispatchEvent(new CustomEvent("cc:rendered"));
      })
      .catch(function () {
        var box = document.getElementById("configError");
        if (box) box.hidden = false;
        if (M) M.bind(document);
      });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
