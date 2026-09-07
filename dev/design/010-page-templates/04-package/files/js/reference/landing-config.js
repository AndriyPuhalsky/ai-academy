/* ============================================================================
   010 · T1a — ЛЕНДІНГ КЛАСИЧНИЙ (index.html + architect.html)
   ----------------------------------------------------------------------------
   Дзеркало js/config.js проду, переписане на дизайн-систему 009.
   Що змінилось проти проду — три речі, і всі три через пастки:

   1. ЖОДНОГО TAILWIND-КЛАСУ З JS. Прод вставляв 9 утиліт на рядок модуля
      (`rounded-xl border border-line hover:border-clay/50 …`). Tailwind CDN
      бачить такий клас лише після вставки в DOM і генерує його через ~53 мс
      (006 D-02, зсув 64,8 px). Тут кожен клас — компонентний: ds-row,
      ds-badge, ds-card, ds-btn. Утиліти лишились ТІЛЬКИ на статичних
      контейнерах у HTML.
   2. ДРУК ЗАГОЛОВКА БЕЗ ПОСИМВОЛЬНОЇ ВСТАВКИ. Прод дописував токени в
      textContent у циклі. Тут — clip-path + steps(), той самий механізм,
      що вже працює в .term. Записів у DOM нуль, виділення тексту не рветься,
      скрінрідер читає рядок один раз.
   3. AIA.motion.bind(root) — В КІНЦІ КОЖНОГО render(). Це контракт системи
      (П-10): вузли, створені після асинхронного fetch, інакше лишаться
      невидимими назавжди. Так уже було тричі: 003 D-01, 005 Б-01, 009 D-04.

   ЖОДНОГО ЧИСЛА ТРИВАЛОСТІ РЯДКОМ (П-27): усе через AIA.motion.
   ========================================================================== */
(function (global) {
  "use strict";

  var M = (global.AIA && global.AIA.motion) || null;
  var C = (global.AIA && global.AIA.chrome) || null;
  var esc = (C && C.esc) || function (s) { return String(s == null ? "" : s); };
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function plural(n, f) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return f[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return f[1];
    return f[2];
  }
  function formatDate(iso) {
    var m = ["січня", "лютого", "березня", "квітня", "травня", "червня",
             "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
    var p = String(iso).split("-");
    return p.length === 3 ? (Number(p[2]) + " " + m[Number(p[1]) - 1] + " " + p[0]) : iso;
  }

  /* ---------- 1. Текстові поля сайту ---------- */
  function renderSite(cfg) {
    var site = cfg.site || {};
    $all("[data-site]").forEach(function (el) {
      var k = el.getAttribute("data-site");
      if (site[k] != null && site[k] !== "") el.textContent = site[k];
    });
    document.title = site.name + " — " + (site.tagline || "");
  }

  /* ---------- 2. Посилання. ⚠ П-11 ----------
     js/config.js ВИДАЛЯЄ <li> з порожнім data-link, а в проді links.github і
     links.telegram — порожні рядки в УСІХ ТРЬОХ конфігах. Тобто живий
     користувач бачить у колонці «Проєкт» 2 рядки на Академії й 3 на
     Architect, а не 4. Верстка тримає список ЗМІННОЇ довжини. */
  function renderLinks(cfg) {
    var links = cfg.links || {};
    $all("[data-link]").forEach(function (el) {
      var url = links[el.getAttribute("data-link")];
      if (url) { el.href = url; return; }
      var li = el.closest("li");
      (li || el).remove();
    });
  }

  /* ---------- 3. Hero ---------- */
  function renderHero(cfg) {
    var modules = cfg.modules || [], tracks = cfg.tracks || [], site = cfg.site || {};
    var stats = $("#heroStats");
    if (stats && modules.length) {
      var totalMin = modules.reduce(function (s, m) { return s + (m.durationMin || 0); }, 0);
      var hours = Math.max(1, Math.round(totalMin / 60));
      /* M8 · «цифру справді порахували». Три числа, три rAF-и, нуль циклів. */
      stats.innerHTML =
        num(modules.length) + " " + plural(modules.length, ["модуль", "модулі", "модулів"]) +
        "  ·  " + num(tracks.length) + " " + plural(tracks.length, ["трек", "треки", "треків"]) +
        "  ·  ≈ " + num(hours) + " " + plural(hours, ["година", "години", "годин"]) + " практики" +
        "  ·  " + esc(site.statsNote || "безкоштовно назавжди");
      if (M) $all("[data-count-to]", stats).forEach(function (el) { M.play.count(el); });
    }

    var firstReady = modules.filter(function (m) { return m.status === "ready"; })
                            .sort(function (a, b) { return a.number - b.number; })[0];
    var cta = $("#ctaStart");
    if (cta && firstReady) {
      cta.href = firstReady.slug;
      cta.textContent = "Почати: Модуль " + firstReady.number;
    }
  }
  function num(n) { return '<span class="ds-num" data-count-to="' + n + '">' + n + "</span>"; }

  /* ---------- 4. Треки ---------- */
  function renderTracks(cfg) {
    var grid = $("#tracksGrid");
    if (!grid) return;
    var tracks = (cfg.tracks || []).slice().sort(function (a, b) { return a.order - b.order; });
    var modules = cfg.modules || [];

    grid.innerHTML = tracks.map(function (t) {
      var count = modules.filter(function (m) { return m.track === t.id; }).length;
      /* Римські номери ЗАСЛУЖЕНІ: «Кожен трек спирається на попередній» —
         це справді послідовність, а не декоративна нумерація. */
      return (
        '<div class="ds-row ds-row--track" data-reveal="">' +
          '<span class="ds-row__n">' + (ROMAN[t.order - 1] || t.order) + "</span>" +
          '<span class="ds-row__main">' +
            '<span class="ds-row__title">' + esc(t.title) + "</span>" +
            '<span class="ds-row__desc">' + esc(t.subtitle) + "</span>" +
          "</span>" +
          '<span class="ds-row__side"><span class="ds-row__meta">' +
            count + " " + plural(count, ["модуль", "модулі", "модулів"]) +
          "</span></span>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------- 5. Програма ---------- */
  function badge(m, done) {
    /* ⚠ П-25 · слово лишається ЗАВЖДИ. Гліф і форма — додатково, а не
       замість: стан ніколи не кодується лише кольором. */
    if (done)                  return '<span class="ds-badge ds-badge--done" data-glyph="✓">Пройдено</span>';
    /* «Доступний» — стан за замовчуванням, тому гліфа НЕ отримує: його
       кодує форма (акцентна межа + тихий тінт). Гліф лишається за
       винятками — ✓ пройдено, ○ скоро. Так «→ Доступний» не читається
       як «перейди», а асиметрія несе сенс. */
    if (m.status === "ready")  return '<span class="ds-badge ds-badge--ready">Доступний</span>';
    return '<span class="ds-badge ds-badge--soon" data-glyph="○">Скоро</span>';
  }

  function moduleRow(m, done) {
    var ready = m.status === "ready";
    var n = String(m.number).padStart(2, "0");
    var meta = [
      m.level,
      m.lessons ? m.lessons + " " + plural(m.lessons, ["урок", "уроки", "уроків"]) : null,
      m.durationMin ? "≈ " + m.durationMin + " хв" : null
    ].filter(Boolean).map(esc).join(" · ");

    var inner =
      '<span class="ds-row__n">' + n + "</span>" +
      '<span class="ds-row__main">' +
        '<span class="ds-row__title">' + esc(m.title) + "</span>" +
        (m.description ? '<span class="ds-row__desc">' + esc(m.description) + "</span>" : "") +
        '<span class="ds-row__meta">' + meta + "</span>" +
      "</span>" +
      '<span class="ds-row__side">' + badge(m, done) +
        (ready ? '<span class="ds-row__go" aria-hidden="true">→</span>' : "") +
      "</span>";

    return ready
      ? '<li data-reveal=""><a class="ds-row" href="' + esc(m.slug) + '" data-module-id="' + esc(m.id) + '">' + inner + "</a></li>"
      : '<li data-reveal=""><div class="ds-row ds-row--locked" data-module-id="' + esc(m.id) + '" aria-disabled="true">' + inner + "</div></li>";
  }

  function renderSyllabus(cfg) {
    var list = $("#syllabusList");
    if (!list) return;
    var tracks = (cfg.tracks || []).slice().sort(function (a, b) { return a.order - b.order; });
    var modules = cfg.modules || [];
    var done = doneSet();
    var word = (cfg.site && cfg.site.trackWord != null) ? cfg.site.trackWord : "Трек ";
    var cnt = $("#syllabusCount");
    if (cnt) cnt.textContent = modules.length + " " + plural(modules.length, ["модуль", "модулі", "модулів"]);

    list.innerHTML = tracks.map(function (t) {
      var own = modules.filter(function (m) { return m.track === t.id; })
                       .sort(function (a, b) { return a.number - b.number; });
      if (!own.length) return "";
      return (
        '<section class="ds-meta">' +
          '<div class="ds-meta__rail">' +
            '<p class="ds-eyebrow text-accent">' + esc(word) + (ROMAN[t.order - 1] || t.order) + "</p>" +
            '<p class="ds-eyebrow">' + own.length + " " + plural(own.length, ["модуль", "модулі", "модулів"]) + "</p>" +
          "</div>" +
          '<div class="ds-meta__body">' +
            '<h3 class="ds-h3">' + esc(t.title) + "</h3>" +
            '<ol class="ds-plain" data-reveal-root="">' + own.map(function (m) { return moduleRow(m, done.has(m.id)); }).join("") + "</ol>" +
          "</div>" +
        "</section>"
      );
    }).join("");
  }

  /* Прогрес у макеті — локальний, без Supabase. У коді джерело те саме,
     що й було: window.AIAProgress. */
  function doneSet() {
    var s = new Set();
    try {
      var raw = JSON.parse(localStorage.getItem("b1:done") || "[]");
      raw.forEach(function (id) { s.add(id); });
    } catch (e) { /* приватний режим */ }
    return s;
  }

  /* ---------- 6. Донати ---------- */
  function donationCard(m) {
    var head =
      '<div class="ds-fld__row">' +
        '<h3 class="ds-h4">' + esc(m.label) + "</h3>" +
        (m.note ? '<span class="ds-small">' + esc(m.note) + "</span>" : "") +
      "</div>";
    var body;
    if (m.type === "link") {
      body = '<a class="ds-btn ds-btn--secondary" href="' + esc(m.value) +
             '" target="_blank" rel="noopener noreferrer">Відкрити ↗</a>';
    } else {
      var copy = m.copyValue != null ? m.copyValue : m.value;
      body =
        '<div class="ds-code"><pre class="ds-code__pre">' + esc(m.value) + "</pre></div>" +
        '<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm ds-btn--copy" data-copy="' + esc(copy) + '">Копіювати</button>';
    }
    return '<div class="ds-card ds-donate" data-reveal="">' + head + body + "</div>";
  }

  function renderDonations(cfg) {
    var d = cfg.donations, section = $("#donate");
    if (!section) return;
    /* architect.config.json має donations.enabled = false — порожня секція
       НЕ малюється, і посилання на неї теж зникають (так робить прод). */
    if (!d || !d.enabled) {
      section.remove();
      $all('a[href="#donate"]').forEach(function (a) { (a.closest("li") || a).remove(); });
      return;
    }
    if (d.title) $("#donateTitle").textContent = d.title;
    if (d.subtitle) $("#donateSubtitle").textContent = d.subtitle;
    var methods = (d.methods || []).filter(function (m) { return m.enabled !== false; });
    $("#donationGrid").innerHTML = methods.map(donationCard).join("");
    $("#donateCount").textContent = methods.length + " " + plural(methods.length, ["спосіб", "способи", "способів"]);
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
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(ok, ok);
      else ok();
    });
  }

  /* ---------- 7. Футер ---------- */
  function renderFooterMeta(cfg) {
    var el = $("#footerMeta"), site = cfg.site || {};
    if (!el) return;
    var p = [];
    if (site.version) p.push("v" + site.version);
    if (site.updated) p.push("оновлено " + formatDate(site.updated));
    el.textContent = p.join(" · ");
  }

  /* ---------- 8. M10 · друк заголовка ---------- */
  function typeHero() {
    var parts = $all("[data-stream]");
    var caret = $("#heroCaret");
    if (!parts.length) return;
    var cps = M ? M.cps() : Infinity;
    /* ⚠ П5 · швидкість — єдиний токен, на який ДІЛЯТЬ, тому вона не
       множиться на --motion. Гілку вимкнення бере саме цей рядок:
       cps === Infinity означає «рух вимкнено» → текст просто стоїть. */
    if (!isFinite(cps) || cps <= 0) {
      parts.forEach(function (el) { el.classList.remove("is-typing"); });
      return;
    }
    var pause = M.dur("state");          /* пауза між рядками — токен, не число */
    var acc = 0;
    parts.forEach(function (el) {
      var n = (el.textContent || "").length;
      el.style.setProperty("--hero-steps", n);
      el.style.setProperty("--hero-type-dur", (n / cps) + "s");
      el.style.setProperty("--hero-type-delay", acc + "s");
      el.classList.remove("is-typing");
      void el.offsetWidth;               /* рестарт анімації без таймера */
      el.classList.add("is-typing");
      acc += n / cps + pause;
    });
    if (caret) caret.removeAttribute("data-gone");
  }

  /* ---------- 9. Демонстрація хрому (у коді це auth-ui.js + progress.js) ---------- */
  function demoChrome(cfg) {
    if (!C) return;
    var total = (cfg.modules || []).length;
    var done = doneSet().size;
    /* Резерв місця пілюлі — з ПЕРШОГО кадру, ще до приходу чисел. */
    C.reservePill(("Прогрес: " + done + "/" + total).length);
    C.setSlot("checking");
    /* Дві мережеві ходки проду (config.json → Supabase) імітуються однією
       затримкою, взятою з ТОКЕНА, а не з числа. */
    var wait = M ? (M.dur("page-in") + M.delay("skeleton")) * 1000 : 0;
    setTimeout(function () {
      C.setSlot(localStorage.getItem("b1:user") ? "user" : "guest",
                "Андрій Пухальський");
      C.fillPill(done, total);
      bindSlotDemo();
    }, wait);
  }
  function bindSlotDemo() {
    var login = $("#aiaLogin");
    if (login) login.addEventListener("click", function () {
      try { localStorage.setItem("b1:user", "1"); } catch (e) {}
      location.reload();
    });
    var av = $("#aiaAvatar");
    if (av) av.addEventListener("click", function () {
      try { localStorage.removeItem("b1:user"); } catch (e) {}
      location.reload();
    });
  }

  /* ---------- 10. Старт ---------- */
  function boot() {
    var path = document.documentElement.getAttribute("data-config");
    fetch(path, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (cfg) {
        renderSite(cfg);
        renderLinks(cfg);
        renderHero(cfg);
        renderTracks(cfg);
        renderSyllabus(cfg);
        renderDonations(cfg);
        renderFooterMeta(cfg);
        initCopy();
        demoChrome(cfg);
        typeHero();
        /* ⚠ КОНТРАКТ СИСТЕМИ. Без цього рядка все, що намальовано вище,
           лишається невидимим назавжди при будь-якому збої доставки IO. */
        if (M) M.bind(document);
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
