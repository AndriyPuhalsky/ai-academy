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

   ЧИМ ЦЕЙ ФАЙЛ ВІДРІЗНЯЄТЬСЯ ВІД МАКЕТА (dev/design/012-jira/.../_base/)
   ---------------------------------------------------------------------
   · прибрана гілка `?demo=1` («ПІДМОСТКИ МАКЕТА»): у проді статуси справжні;
   · карта перемальовується на `aia:progress` — прогрес приїжджає з Supabase
     ПІСЛЯ конфіга, і без цього учень із десятьма пройденими уроками бачив би
     карту без жодної позначки (Ф-5, критерій 20);
   · у кінці fill() кидається `aia:config-ready` — його слухають js/ui.js
     (перерахунок згасання краю скролерів) і js/navprogress.js (пілюля);
   · заповнюється `#footerMeta` (версія · «оновлено …») — формат дослівно з
     js/config.js:324–331, щоб чотири блоки платформи були підписані однаково;
   · `#contactTrigger` переїжджає в кінець списку футера, а підписи кнопки
     паузи hero беруться з конфіга (`hero.pause` / `hero.play`), лишаючи
     значення в `data-label-*` розмітки фолбеком для стану без конфіга;
   · нав-пункти, чия ціль `#…` після рендера в документі відсутня,
     відкидаються (Ф-9): `cfg.nav` містить «Автор», а секцію автора рендерер
     прибирає, бо поля порожні — пункт вів у нікуди і в шапці, і в шторці.
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
  /* Дослівно js/config.js:36–44 — інакше дата у футері цього лендінга
     виглядала б інакше, ніж на трьох інших. */
  function formatDate(iso) {
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString("uk-UA", {
        day: "numeric", month: "long", year: "numeric"
      });
    } catch (e) {
      return iso || "";
    }
  }

  var cfg = null;

  /* 🔴 ВИПРАВЛЕННЯ ПРОТИ МАКЕТА (дефект, якого не бачив ні валідатор, ні план).
     `_base/jira-render.js:93` читав `window.AIA_PROGRESS.done` і називав це
     «контрактом із js/progress.js». Такого глобаля в проєкті НЕМАЄ ВЗАГАЛІ
     (`grep -rn AIA_PROGRESS js/ *.html modules/` — 0 вживань поза самим
     макетом): js/progress.js віддає `window.AIAProgress` із МЕТОДОМ
     `completedSet()`, що повертає `Set` кодів. Тобто в макеті `done` був
     порожнім масивом завжди — карта не показала б ні «пройдено», ні «почати
     звідси» ні до, ні після гідратації, і це виглядало б як «дизайн так
     задумав», а не як баг. Форма helper-а — дослівно
     js/claude-code-render.js:68–72, щоб обидва рендерери падали в один і той
     самий порожній Set, коли прогресу ще немає. */
  function completedSet() {
    if (window.AIAProgress && typeof window.AIAProgress.completedSet === "function") {
      try { return window.AIAProgress.completedSet(); } catch (e) { /* нижче — порожньо */ }
    }
    return { size: 0, has: function () { return false; } };
  }

  /* ==========================================================================
     КАРТА ПРОГРАМИ — ШЛЯХ ІЗ 22 УРОКІВ + ІСПИТ
     --------------------------------------------------------------------------
     Три стани рядка малюються ЗАВЖДИ, незалежно від того, що в конфізі
     (референс Exercism: 16 закритих вузлів із 19 не виглядають пусткою, якщо
     стан кодується ФОРМОЮ).

     ⚠ Функція ІДЕМПОТЕНТНА й викликається двічі: один раз після конфіга і ще
     раз на кожному `aia:progress`. Тому вона спершу чистить контейнер — інакше
     після гідратації прогресу під картою виросла б її друга копія.
     ========================================================================== */
  function renderMap() {
    var map = $("#jiraMap");
    if (!map || !cfg) return;

    var lessons = (cfg.modules || []).filter(function (m) { return m.kind !== "exam"; });
    var done = completedSet();

    var startId = null;
    for (var i = 0; i < lessons.length; i++) {
      if (lessons[i].status === "ready" && !done.has(lessons[i].id)) { startId = lessons[i].id; break; }
    }

    map.textContent = "";
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
        var isDone  = done.has(m.id);
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

    /* Іспит — окремим вузлом ПОЗА фазами й візуально інший за рядок уроку.
       Точкою входу він бути не може, тому в розрахунку startId його немає (той
       самий поділ, що в js/claude-code-render.js:394–397). Власного стану
       «пройдено» макет для нього не малює — і тут нічого не домальовується. */
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
  }

  /* ==========================================================================
     НАВІГАЦІЯ · Ф-9
     --------------------------------------------------------------------------
     Викликається ПІСЛЯ того, як секції з порожніми полями прибрані: пункт, чия
     ціль `#id` у документі відсутня, у меню не ставиться взагалі. Працює в
     обидва боки — коли блок автора опублікують, пункт вернеться сам, без
     правки конфіга.
     ========================================================================== */
  function renderNav() {
    var hosts = [$("#jiraNav"), $("#jiraNavMobile")];
    (cfg.nav || []).forEach(function (it) {
      if (!it || !it.href) return;
      if (it.href.charAt(0) === "#" && it.href.length > 1 && !$(it.href)) return;
      hosts.forEach(function (host) {
        if (!host) return;
        var a = el("a", "ds-nav__link", it.label);
        a.href = it.href;
        host.appendChild(a);
      });
    });
  }

  function fill(data) {
    cfg = data;

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

    /* --- кнопка паузи hero: підписи з конфіга, розмітка — фолбек ---
       Значення лягають у ті самі `data-label-*`, які читає js/jira-motion.js,
       тому логіка руху про конфіг нічого не знає. Видимий підпис перечитується
       з `aria-pressed`: якщо людина встигла натиснути паузу до приходу конфіга,
       кнопка не має раптово сказати «спинити показ». */
    var h = cfg.hero || {};
    var pauseBtn = $("#heroPause");
    if (pauseBtn) {
      if (h.pause) pauseBtn.setAttribute("data-label-pause", h.pause);
      if (h.play)  pauseBtn.setAttribute("data-label-play", h.play);
      var pl = pauseBtn.querySelector("[data-pause-label]");
      if (pl) {
        pl.textContent = pauseBtn.getAttribute(
          pauseBtn.getAttribute("aria-pressed") === "true" ? "data-label-play" : "data-label-pause");
      }
    }

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

    renderMap();

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

    /* --- донати: блок «Підтримка» як на index.html (012 · слово власника
       2026-10-01 «однаковий на всіх чотирьох лендінгах», скасовує Р9). Картка —
       дзеркало donationCard із js/config.js: значення в .ds-code (прокручується
       вбік), кнопка «Копіювати» з data-copy (клік ловить initCopyButtons() у
       js/ui.js; для IBAN — лише номер із copyValue), банка — «Відкрити ↗».
       Колір дає data-course="jira". ⚠ Правити разом з js/config.js і
       js/claude-code-render.js. Розмітка будується через DOM, без innerHTML. */
    var don = cfg.donations || {};
    if (!don.enabled) {
      var ds = $("#donate"); if (ds) ds.remove();
    } else (don.methods || []).filter(function (m) { return m.enabled !== false; }).forEach(function (m) {
      var isLink = (m.type === "link") || (!m.type && /^https?:\/\//.test(m.value));
      var card = el("div", "ds-card ds-donate");
      card.setAttribute("data-reveal", "");
      var head = el("div", "ds-fld__row");
      head.appendChild(el("h3", "ds-h4", m.label));
      if (m.note) head.appendChild(el("span", "ds-small", m.note));
      card.appendChild(head);
      if (isLink) {
        var a = el("a", "ds-btn ds-btn--secondary", "Відкрити ↗");
        a.href = m.value; a.target = "_blank"; a.rel = "noopener noreferrer";
        card.appendChild(a);
      } else {
        var code = el("div", "ds-code");
        code.appendChild(el("pre", "ds-code__pre", m.value));
        card.appendChild(code);
        var btn = el("button", "ds-btn ds-btn--secondary ds-btn--sm ds-btn--copy", "Копіювати");
        btn.type = "button";
        btn.setAttribute("data-copy", m.copyValue != null ? m.copyValue : m.value);
        card.appendChild(btn);
      }
      $("#donateList").appendChild(card);
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

    /* Кнопка «Написати нам» стоїть у розмітці (js/contact.js звʼязує її по id
       одразу при завантаженні, тому створювати її тут не можна). Після того як
       рядки конфіга дописані, її <li> переїжджає в КІНЕЦЬ списку: appendChild
       наявного вузла — це переміщення, а не копія. Порожній `footer.contact`
       прибирає рядок цілком, як у js/claude-code-render.js:601–605. */
    var contact = $("#contactTrigger");
    if (contact) {
      var cli = contact.closest("li");
      if ((cfg.footer || {}).contact) { if (cli) $("#ftrLinks").appendChild(cli); }
      else if (cli) { cli.remove(); } else { contact.remove(); }
    }

    /* Формат той самий, що renderFooterMeta() у js/config.js, — інакше чотири
       блоки платформи були б підписані по-різному. */
    var meta = $("#footerMeta");
    if (meta) {
      var s = cfg.site || {}, parts = [];
      if (s.version) parts.push("v" + s.version);
      if (s.updated) parts.push("оновлено " + formatDate(s.updated));
      meta.textContent = parts.join(" · ");
    }

    renderNav();

    document.documentElement.setAttribute("data-config-ready", "");
    /* ⚠ КОНТРАКТ СИСТЕМИ 009: AIA.motion.bind() у кінці КОЖНОГО асинхронного
       render(). Вузли [data-reveal], створені щойно, інакше не потраплять під
       спостерігач появи — а він єдиний власник появи в системі. */
    if (window.AIA && window.AIA.motion) window.AIA.motion.bind(document);
    /* Подію кидає саме цей файл: js/config.js на лендінгу НЕ підключений, бо
       він малював би [data-site] / [data-link] і другу карту. Слухачі —
       js/ui.js:370 (згасання краю скролерів) і js/navprogress.js (пілюля). */
    document.dispatchEvent(new CustomEvent("aia:config-ready", { detail: cfg }));
  }

  fetch(CFG)
    .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); })
    .then(fill)
    .catch(function () {
      var e = document.getElementById("configError");
      if (e) e.hidden = false;
      /* Сторінка лишається читабельною: hero стоїть у розмітці, а секції з
         даними тримають резерв висоти — сторінка не стрибає (§12.2). */
      if (window.AIA && window.AIA.motion) window.AIA.motion.bind(document);
    });

  /* Прогрес приїжджає з Supabase ПІСЛЯ конфіга (звичайний випадок у
     залогіненого) — тоді карту треба перемалювати. Зворотний порядок
     (прогрес гідрувався раніше за конфіг) закриває виклик renderMap() у
     fill(): він читає AIAProgress.completedSet() у момент виклику. */
  document.addEventListener("aia:progress", renderMap);
})();
