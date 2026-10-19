/* ============================================================================
   012 · js/jira-render.js — ЛЕНДІНГ ІЗ КОНФІГА
   ----------------------------------------------------------------------------
   Увесь текст сторінки живе в jira.config.json. Форма — така сама, як у
   claude-code.config.json, тому рендерер повторює прийоми js/config.js і
   js/claude-code-render.js, а не вигадує свої.

   ТРИ ПРАВИЛА, ЯКІ ТУТ ВИКОНУЮТЬСЯ БУКВАЛЬНО
   ------------------------------------------
   1. ЖОДНОЇ TAILWIND-УТИЛІТИ З JS. CDN генерує клас, що приходить із JS, із
      затримкою ≈53 мс — це вже давало зсув 64,8 px (дефект 006 D-02). Тут
      тільки семантичні класи, які вже є у файлах стилів.
   2. ПОРОЖНЄ ПОЛЕ = БЛОК ЗНИКАЄ. `author.text` і `author.link.href` сьогодні
      порожні → секції немає, і лендінг мусить лишатись цілим (К-20). Прецедент
      у проєкті вже є: js/config.js прибирає <li> із порожнім data-link.
   3. ТЕКСТ, ЯКИЙ МУСИТЬ ПЕРЕЖИТИ ВІДСУТНІСТЬ JS, СТОЇТЬ У РОЗМІТЦІ, а
      рендерер його лише ОНОВЛЮЄ. Це той самий прийом, що `data-site="name"`
      в 23 уроках курсу (там у розмітці лежить «Jira з нуля», і config.js
      переписує його з конфіга). Так зроблено з hero: заголовок, лід, CTA й
      сама дошка читаються, навіть якщо конфіг не доїхав.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = document.documentElement.getAttribute("data-config") || "jira.config.json";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function pick(obj, path) {
    return path.split(".").reduce(function (o, k) { return (o == null) ? o : o[k]; }, obj);
  }
  /* Бейдж системи: гліф приходить атрибутом (ds-badge::before { content:
     attr(data-glyph) }), текст — звичайним вузлом, тож скрінрідер читає слово,
     а не символ. */
  function badge(kind, glyph, text) {
    var b = el("span", "ds-badge ds-badge--" + kind, text);
    b.setAttribute("data-glyph", glyph);
    return b;
  }
  function plural(n, forms) {
    var a = n % 10, b = n % 100;
    return forms[(a === 1 && b !== 11) ? 0 : (a >= 2 && a <= 4 && (b < 10 || b >= 20)) ? 1 : 2];
  }

  function fill(cfg) {
    /* --- прості підстановки за шляхом --- */
    $$("[data-jira]").forEach(function (n) {
      var v = pick(cfg, n.getAttribute("data-jira"));
      if (typeof v === "string" && v) n.textContent = v;
    });
    $$("[data-jira-href]").forEach(function (n) {
      var v = pick(cfg, n.getAttribute("data-jira-href"));
      if (typeof v === "string" && v) n.setAttribute("href", v);
    });

    document.title = cfg.site.name + " — " + cfg.site.tagline;

    /* --- навігація --- */
    var nav = $("#jiraNav"), navM = $("#jiraNavMobile");
    (cfg.nav || []).forEach(function (it) {
      [nav, navM].forEach(function (host) {
        if (!host) return;
        var a = el("a", "ds-nav__link", it.label);
        a.href = it.href;
        host.appendChild(a);
      });
    });

    /* --- для кого / для кого ні --- */
    (cfg.audience.for || []).forEach(function (t) { $("#audFor").appendChild(el("li", null, t)); });
    (cfg.audience.not || []).forEach(function (t) { $("#audNot").appendChild(el("li", null, t)); });

    /* --- результати --- */
    (cfg.outcomes.items || []).forEach(function (it) {
      var li = el("li");
      li.appendChild(el("span", "jira-out__text", it.text));
      li.appendChild(el("span", "jira-out__hint", it.hint));
      $("#outList").appendChild(li);
    });

    /* --- карта програми ---
       Три стани рядка малюються ЗАВЖДИ, незалежно від того, що в конфізі:
       сьогодні всі 23 модулі мають status "draft", тобто вся карта — «Скоро».
       Саме так її й треба було проєктувати (референс Exercism: 16 закритих
       вузлів із 19 не виглядають пусткою, якщо стан кодується ФОРМОЮ). */
    var lessons = (cfg.modules || []).filter(function (m) { return m.kind !== "exam"; });
    var done = (window.AIA_PROGRESS && window.AIA_PROGRESS.done) || [];   /* контракт із js/progress.js */

    /* ПІДМОСТКИ МАКЕТА (адреса з `?demo=1`; у прод не йде). Сьогодні в конфізі
       всі 23 модулі мають status "draft", тобто карта цілком складається зі
       «Скоро» — і саме так її треба проєктувати за замовчуванням. Але всі ТРИ
       стани рядка мусять бути намальовані незалежно від конфіга (К-21), тому
       макет уміє показати їх поруч. */
    if (/[?&]demo=1/.test(location.search)) {
      lessons.forEach(function (m, i) { if (i > 2 && i < 12) m.status = "ready"; });
      done = ["j01", "j02", "j03"];   /* done ×3 · «почати звідси» ×1 · ready ×8 · soon ×10 */
    }
    var startId = null;
    for (var i = 0; i < lessons.length; i++) {
      if (lessons[i].status === "ready" && done.indexOf(lessons[i].id) < 0) { startId = lessons[i].id; break; }
    }

    var map = $("#jiraMap");
    (cfg.tracks || []).forEach(function (tr, ti) {
      var mine = lessons.filter(function (m) { return m.track === tr.id; });
      if (!mine.length) return;

      var ph = el("section", "jira-phase");
      var head = el("div", "jira-phase__head");
      head.appendChild(el("b", "jira-phase__n", String(ti + 1)));
      head.appendChild(el("h3", "jira-phase__t", tr.title));
      ph.appendChild(head);
      ph.appendChild(el("p", "jira-phase__s",
        tr.subtitle + " · " + mine.length + " " + plural(mine.length, cfg.map.moduleWord)));

      var ul = el("ol", "jira-phase__lessons ds-plain");
      mine.forEach(function (m) {
        var isDone  = done.indexOf(m.id) >= 0;
        var isStart = m.id === startId;
        var isSoon  = m.status !== "ready";
        var li = el("li");
        li.setAttribute("data-state", isDone ? "done" : isStart ? "start" : isSoon ? "soon" : "ready");

        var row = el(isSoon ? "div" : "a", "ds-row" + (isSoon ? " ds-row--locked" : ""));
        if (!isSoon) row.href = m.slug;
        row.appendChild(el("b", "ds-row__n", String(m.number)));

        var main = el("span", "ds-row__main");
        main.appendChild(el("span", "ds-row__title", m.title));
        if (isStart) main.appendChild(el("span", "ds-row__meta", cfg.map.startLabel));
        row.appendChild(main);

        var side = el("span", "ds-row__side");
        if (isDone)      side.appendChild(badge("done", "✓", "пройдено"));
        else if (isSoon) side.appendChild(badge("soon", "·", "Скоро"));
        else if (isStart) side.appendChild(badge("ready", "→", cfg.map.startLabel));
        if (!isSoon) side.appendChild(el("span", "ds-row__go", "→"));
        row.appendChild(side);

        li.appendChild(row);
        ul.appendChild(li);
      });
      ph.appendChild(ul);
      map.appendChild(ph);
    });

    /* Іспит — окремим вузлом ПОЗА фазами й візуально інший за урок уроку. */
    var exam = (cfg.modules || []).filter(function (m) { return m.kind === "exam"; })[0];
    if (exam) {
      var ex = el("div", "jira-exam");
      ex.appendChild(el("b", "jira-exam__t", exam.title));
      if (exam.text) ex.appendChild(el("span", "jira-exam__d", exam.text));
      if (exam.meta) ex.appendChild(el("span", "jira-exam__m", exam.meta));
      map.appendChild(ex);
    }
    map.style.minHeight = "0";    /* резерв віддав роботу — знімаємо його, щоб
                                     порожнього хвоста під картою не лишилось */

    /* --- полиця довідників --- */
    (cfg.references.items || []).forEach(function (r) {
      var li = el("li"), a = el("a");
      a.href = r.slug;
      a.appendChild(el("b", "jira-shelf__t", r.title));
      a.appendChild(el("span", "jira-shelf__s", r.subtitle));
      li.appendChild(a);
      $("#refList").appendChild(li);
    });

    /* --- блок автора: порожнє поле = блок зникає (К-20) --- */
    var au = cfg.author || {};
    var hasText = !!(au.text && au.text.trim());
    var hasLink = !!(au.link && au.link.href && au.link.href.trim());
    if (!hasText && !hasLink) {
      var sec = $("#author");
      if (sec) sec.remove();
    } else {
      if (hasText) $("#authorText").textContent = au.text;
      var al = $("#authorLink");
      if (hasLink) { al.href = au.link.href; al.textContent = au.link.label; } else { al.remove(); }
    }

    /* --- донати: конструкція «AI Термінала» (рішення власника 2026-10-01) ---
       Примітка йде В ПІДПИС через « · », а не окремим рядком: у 010 окремий
       рядок лишався неоформленим абзацом кеглем тіла тексту. Текст збережений
       дослівно, змінилась лише його позиція. */
    var don = cfg.donations || {};
    if (!don.enabled) {
      var ds = $("#donate"); if (ds) ds.remove();
    } else (don.methods || []).forEach(function (m) {
      var isLink = (m.type === "link") || (!m.type && /^https?:\/\//.test(m.value));
      var li = el("li", "jira-donate__card");
      li.setAttribute("data-reveal", "");
      li.appendChild(el("span", "jira-donate__label", m.label + (m.note ? " · " + m.note : "")));
      if (isLink) {
        var a = el("a", "ds-btn ds-btn--quiet jira-donate__btn", "Відкрити ↗");
        a.href = m.value; a.target = "_blank"; a.rel = "noopener noreferrer";
        li.appendChild(a);
      } else {
        li.appendChild(el("span", "jira-donate__value", m.value));
      }
      $("#donateList").appendChild(li);
    });

    /* --- футер --- */
    (cfg.footer.links || []).forEach(function (l) {
      var li = el("li"), a = el("a", null, l.label); a.href = l.href;
      li.appendChild(a); $("#ftrLinks").appendChild(li);
    });
    (cfg.footer.sourceLinks || []).forEach(function (l) {
      var href = cfg.links[l.key];
      if (!href) return;                       /* порожнє поле — рядка немає */
      var li = el("li"), a = el("a", null, l.label + " ↗");
      a.href = href; a.rel = "noopener"; a.target = "_blank";
      li.appendChild(a); $("#ftrSources").appendChild(li);
    });

    document.documentElement.setAttribute("data-config-ready", "");
    if (window.AIA && window.AIA.motion) window.AIA.motion.bind(document);
  }

  fetch(CFG)
    .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); })
    .then(fill)
    .catch(function () {
      var e = document.getElementById("configError");
      if (e) e.hidden = false;
      /* Сторінка лишається читабельною: hero стоїть у розмітці, а секції з
         даними тримають резерв висоти — сторінка не стрибає (§12.2). */
    });
})();
