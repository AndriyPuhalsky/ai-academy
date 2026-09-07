/* ============================================================================
   010 · Б2 · УРОК: ЕТАЛОННА РЕАЛІЗАЦІЯ JS ПІД МОВУ 009
   ----------------------------------------------------------------------------
   Це НЕ новий двигун. Це три живі файли проду, переписані рівно настільки,
   наскільки цього вимагає нова мова, — щоб фронтенд-сесія бачила ДІФФ, а не
   опис діффа:
       js/module.js  → сайдбар, prev/next, замок, кнопка завершення, шторка
       js/quiz.js    → квіз
       js/ui.js      → .term__copy / .term__more (фрагмент)

   Логіка прогресу, розблокування й submit_quiz НЕ чіпається (§3.2): тут вона
   замінена локальною заглушкою `Progress`, щоб макет жив без Supabase.

   ЩО ТУТ ВИПРАВЛЕНО ПОРІВНЯНО З ПРОДОМ — чотири мовчазні розбіжності
   контракту (§16 критерій 33) плюс дві пастки:

   1. П-23 · aria-current. Прод ставить `aria-current="page"` (єдине правильне
      значення за WAI-ARIA), а `_base/components.css:527` селектує
      `[aria-current="true"]`. Значення в JS НЕ міняємо — виправлено селектор
      (components-010.css, блок Б2-21).
   2. П-24 · data-key. `_base:557` малює літеру варіанта через
      `content: attr(data-key)`, а прод атрибута не ставить: 57 сторінок
      лишились би без «А/Б/В/Г». Ставимо (рядок ~КВІЗ/варіанти).
   3. П-26 · подвоєння гліфів. Прод дописує "✓ " / "✗ " У САМ ТЕКСТ варіанта
      (js/quiz.js:126,131), а система малює ті самі гліфи псевдоелементом
      `--ok::after` / `--bad::after`. Разом вийшло б «✓ Відповідь ✓».
      Дописування прибрано, псевдоелемент лишається.
   4. П-27 · prefers-reduced-motion. Прод читає `matchMedia` напряму, тому
      пресет `data-motion="calm"` і клас `html.rm` для нього не існують.
      Тут єдине джерело правди — `AIA.motion.on()`.

   Плюс: жодного хекса (прод має #3A342E і #D97757 у quiz.js) і жодної
   тривалості рядком (прод має "opacity .35s ease, transform .35s ease").
   ========================================================================== */
(function (global) {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var motion = (global.AIA && global.AIA.motion) || { on: function () { return true; } };

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ------------------------------------------------------------------------
     БЛОКУВАННЯ СКРОЛУ — той самий лічильник, що в діалогах (§6.4).
     html.ds-lock, а не body.style.overflow: прод ставить інлайновий стиль,
     і два одночасні замки (шторка + модалка) гасять один одного.
     ---------------------------------------------------------------------- */
  var locks = 0;
  function lock(on) {
    locks = Math.max(0, locks + (on ? 1 : -1));
    root.classList.toggle("ds-lock", locks > 0);
  }

  /* ========================================================================
     1. ДАНІ УРОКУ (у проді — config.json + progress.js)
     ======================================================================== */
  var CFG = null;
  /* Читається ЩОРАЗУ, а не один раз: у проді атрибут статичний, але в макеті
     панель станів перемикає модуль на льоту, і кешоване значення дало б
     «перший/останній модуль», у якого сайдбар лишився на п'ятому. */
  function cur() { return doc.body.getAttribute("data-module"); }
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  var Progress = {
    done: new Set(),
    isCompleted: function (id) { return this.done.has(id); },
    setCompleted: function (id, on) {
      if (on) this.done.add(id); else this.done.delete(id);
      doc.dispatchEvent(new CustomEvent("aia:progress"));
    },
    completedSet: function () { return this.done; },
    unlockedSet: function (mods) {
      var d = this.done, byNo = {}, set = new Set();
      mods.forEach(function (m) { byNo[m.number] = m; });
      mods.forEach(function (m) {
        var ok = m.number <= 1 || d.has(m.id);
        if (!ok) { var p = byNo[m.number - 1]; if (p && d.has(p.id)) ok = true; }
        if (ok) set.add(m.id);
      });
      return set;
    }
  };
  global.AIADemoProgress = Progress;   /* демо-панель макета */

  /* ========================================================================
     2. САЙДБАР
     ======================================================================== */
  function lessonsHtml() {
    return $all("[data-lesson]").map(function (sec) {
      return '<a class="ds-snav__lesson" href="#' + esc(sec.id) + '">' +
             esc(sec.getAttribute("data-lesson")) + "</a>";
    }).join("");
  }

  var spy = null;
  function initScrollspy() {
    var links = $all(".ds-snav__lesson");
    var sections = $all("[data-lesson]");
    if (!links.length || !sections.length || !("IntersectionObserver" in global)) return;
    if (spy) spy.disconnect();
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-active"); });
        var a = byId[e.target.id];
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  function renderSidebar() {
    var nav = $("#sidebarNav");
    if (!nav || !CFG) return;

    var modules = CFG.modules.slice().sort(function (a, b) { return a.number - b.number; });
    var tracks  = CFG.tracks.slice().sort(function (a, b) { return a.order - b.order; });
    var done = Progress.completedSet();
    var unlocked = Progress.unlockedSet(modules);
    var total = modules.length;
    var doneCount = modules.filter(function (m) { return done.has(m.id); }).length;
    var share = total ? Math.round(doneCount / total * 100) : 0;
    var trackWord = (CFG.site && CFG.site.trackWord != null) ? CFG.site.trackWord : "Трек ";

    var html =
      '<a class="ds-snav__home" href="#" data-demo-home>← На головну</a>' +
      /* ⚠ .ds-prog__bar малює `transform: scaleX(var(--prog-v))`, а НЕ width
         (_base §5: анімуємо тільки transform). Прод ставив width — тут це
         була б мовчазна поломка: смуга лишилась би на нулі назавжди. */
      '<span class="ds-prog" role="img" aria-label="Прогрес курсу: ' + share + '%">' +
        '<span class="ds-prog__bar" style="--prog-v:' + (share / 100) + '"></span>' +
      "</span>" +
      '<p class="ds-snav__count">' + doneCount + " з " + total + " модулів завершено</p>";

    tracks.forEach(function (t) {
      var own = modules.filter(function (m) { return m.track === t.id; });
      if (!own.length) return;
      html += '<p class="ds-snav__track">' + esc(trackWord) +
              (ROMAN[t.order - 1] || t.order) + " · " + esc(t.title) + "</p>";

      own.forEach(function (m) {
        var isCurrent = m.id === cur();
        var isDone = done.has(m.id);
        var isReady = m.status === "ready";
        var isUnlocked = unlocked.has(m.id);
        var no = String(m.number).padStart(2, "0");
        var inner =
          '<span class="ds-snav__no">' + no + "</span>" +
          '<span class="ds-snav__t">' + esc(m.title) +
            /* ⚠ Гліф «завершено» малює ТІЛЬКИ .ds-snav__item--done::after
               (_base §9). Прод додає ще й власний <span>✓</span> у текст —
               разом вийшло б два ✓ в одному рядку (побачено на першому ж
               кадрі макета). Це той самий клас дефекту, що П-26 у квізі.
               Слово для скрінрідера лишається — гліф із ::after читається
               ненадійно. */
            (isDone ? ' <span class="sr-only">— завершено</span>' : "") +
          "</span>";

        if (isCurrent) {
          /* П-23: значення `page`, а не `true`. Селектор виправлений у CSS. */
          html += '<span class="ds-snav__item" aria-current="page">' + inner + "</span>" +
                  '<div class="ds-snav__lessons">' + lessonsHtml() + "</div>";
        } else if (isReady && isUnlocked) {
          html += '<a class="ds-snav__item' + (isDone ? " ds-snav__item--done" : "") +
                  '" href="#" data-demo-mod="' + esc(m.id) + '">' + inner + "</a>";
        } else if (isReady) {
          html += '<span class="ds-snav__item is-soon" aria-disabled="true">' + inner +
                  '<span class="ds-snav__soon">замок</span></span>';
        } else {
          html += '<span class="ds-snav__item is-soon">' + inner +
                  '<span class="ds-snav__soon">скоро</span></span>';
        }
      });
    });

    /* ⚠ ЗНАХІДКА, НЕ МІГРАЦІЯ. `js/module.js` малює сайдбар СТРОГО по tracks[],
       а модуль `c23` («Фінальний іспит») має в claude-code.config.json
       track: null і kind: "exam" — тобто в сайдбар він не потрапляє ЖОДНОГО
       разу. Наслідки живі вже сьогодні:
         · на сторінці іспиту в сайдбарі не підсвічено НІЧОГО — людина не
           бачить, де вона (а це головна робота сайдбара, §7.3.1);
         · лічильник каже «23 з 23», а в списку 22 рядки.
       Блок нижче показує «безтрекові» модулі окремою групою в кінці.
       ⚠ ЦЕ ВІДСТУП ВІД «ПЕРЕНЕСТИ МОВУ, НЕ МІНЯТИ ПРОДУКТ». Відкат — зняти
       цей блок цілком, більше нічого не зачіпається. */
    var orphans = modules.filter(function (m) {
      return !tracks.some(function (t) { return t.id === m.track; });
    });
    if (orphans.length) {
      html += '<p class="ds-snav__track">' +
              (orphans[0].kind === "exam" ? "Іспит" : "Поза треками") + "</p>";
      orphans.forEach(function (m) {
        var no = String(m.number).padStart(2, "0");
        var inner = '<span class="ds-snav__no">' + no + '</span><span class="ds-snav__t">' +
                    esc(m.title) + (done.has(m.id) ? ' <span class="sr-only">— завершено</span>' : "") + "</span>";
        if (m.id === cur()) {
          html += '<span class="ds-snav__item" aria-current="page">' + inner + "</span>" +
                  '<div class="ds-snav__lessons">' + lessonsHtml() + "</div>";
        } else if (unlocked.has(m.id)) {
          html += '<a class="ds-snav__item' + (done.has(m.id) ? " ds-snav__item--done" : "") +
                  '" href="#" data-demo-mod="' + esc(m.id) + '">' + inner + "</a>";
        } else {
          html += '<span class="ds-snav__item is-soon" aria-disabled="true">' + inner +
                  '<span class="ds-snav__soon">замок</span></span>';
        }
      });
    }

    nav.innerHTML = html;
    initScrollspy();
    /* Контракт §12 П-10: bind() у КІНЦІ кожного асинхронного render(). */
    if (global.AIA && global.AIA.motion) global.AIA.motion.bind(nav);
  }

  /* ========================================================================
     3. PREV / NEXT — сім живих форм
     ======================================================================== */
  function renderModuleNav() {
    var box = $("#moduleNav");
    if (!box || !CFG) return;
    var modules = CFG.modules.slice().sort(function (a, b) { return a.number - b.number; });
    var idx = modules.findIndex(function (m) { return m.id === cur(); });
    if (idx === -1) return;
    var prev = modules[idx - 1], next = modules[idx + 1];
    var currentDone = Progress.isCompleted(cur());
    var html = "";

    if (!prev) {
      html += item("a", "", "← Назад", "Огляд курсу");
    } else if (prev.status === "ready") {
      html += item("a", "", "← Модуль " + prev.number, prev.title);
    } else {
      html += item("span", " is-soon", "← Модуль " + prev.number + " · скоро", prev.title);
    }

    if (!next) {
      html += item("a", " ds-mnav--next ds-mnav__item--final", "Готово! →",
                   "Ти пройшов(-ла) весь курс! Отримати сертифікат 🎓");
    } else if (next.status === "ready" && currentDone) {
      html += item("a", " ds-mnav--next", "Далі: Модуль " + next.number + " →", next.title);
    } else if (next.status === "ready") {
      html += item("span", " ds-mnav--next is-soon", "🔒 Заверши цей модуль",
                   "Далі: Модуль " + next.number + " — " + next.title);
    } else {
      html += item("span", " ds-mnav--next is-soon", "Далі · скоро",
                   "Модуль " + next.number + " — " + next.title);
    }
    box.innerHTML = html;
    /* Контракт §12 П-10: bind() у КІНЦІ кожного асинхронного render().
       Це ЄДИНІ два вузли уроку з M2 — див. REPORT, розділ «Рух». */
    if (global.AIA && global.AIA.motion) global.AIA.motion.bind(box);

    function item(tag, mod, label, title) {
      var attrs = tag === "a" ? ' href="#" data-demo-nav' : ' aria-disabled="true"';
      return "<" + tag + ' class="ds-mnav__item' + mod + '"' + attrs + ' data-reveal="">' +
               '<span class="ds-mnav__label">' + esc(label) + "</span>" +
               '<span class="ds-mnav__title">' + esc(title) + "</span>" +
             "</" + tag + ">";
    }
  }

  /* ========================================================================
     4. КНОПКА «ПОЗНАЧИТИ ЗАВЕРШЕНИМ»
     Прод збирає className рядком із Tailwind-утиліт (BTN_BASE, module.js:238)
     — це рівно П-08. Тут два стани = два модифікатори компонента.
     ======================================================================== */
  function refreshComplete() {
    var btn = $("#completeBtn"), title = $("#completeTitle");
    if (!btn) return;
    var done = Progress.isCompleted(cur());
    btn.className = "ds-btn " + (done ? "ds-btn--secondary" : "ds-btn--primary");
    btn.textContent = done ? "✓ Завершено · натисни, щоб скинути" : "Позначити завершеним";
    if (title) title.textContent = done ? "Модуль пройдено!" : "Модуль позаду?";
  }

  /* ========================================================================
     5. ЕКРАН-ЗАМОК (§10 «Заблокований модуль»)
     Прод будує його з дев'яти Tailwind-утиліт у рядку JS (module.js:280+).
     Роль повністю закриває .ds-empty з _base §18 — нового класу не заводимо.
     ======================================================================== */
  function buildGate() {
    var modules = CFG.modules;
    var self = modules.filter(function (m) { return m.id === cur(); })[0];
    var prev = self ? modules.filter(function (m) { return m.number === self.number - 1; })[0] : null;
    var loggedIn = !!global.AIA_USER;
    var msg, action;
    if (!loggedIn) {
      msg = "Цей модуль відкриється після входу та проходження попередніх по черзі.";
      action = '<button type="button" class="ds-btn ds-btn--primary" data-demo-login>Увійти / зареєструватися</button>';
    } else if (prev) {
      msg = "Спершу заверши Модуль " + prev.number + " — «" + esc(prev.title) + "».";
      action = '<a class="ds-btn ds-btn--primary" href="#" data-demo-nav>Перейти до Модуля ' + prev.number + " →</a>";
    } else {
      msg = "Цей модуль поки заблоковано.";
      action = '<a class="ds-btn ds-btn--secondary" href="#" data-demo-home>На головну</a>';
    }
    var wrap = doc.createElement("div");
    wrap.id = "aiaGate";
    wrap.className = "ds-empty ds-empty--gate";
    wrap.innerHTML =
      '<p class="ds-h3">🔒 Модуль заблоковано</p>' +
      '<p class="ds-small">' + msg + "</p>" + action;
    return wrap;
  }

  function setMainLocked(locked) {
    var main = $("#main");
    if (!main || (locked && !CFG)) return;   /* до приходу даних будувати нема з чого */
    var gate = $("#aiaGate");
    if (locked) {
      if (!gate) { gate = buildGate(); main.insertBefore(gate, main.firstChild); }
      Array.prototype.forEach.call(main.children, function (ch) {
        if (ch !== gate) ch.hidden = true;
      });
    } else {
      if (gate) gate.remove();
      Array.prototype.forEach.call(main.children, function (ch) { ch.hidden = false; });
    }
  }
  global.AIADemoLock = setMainLocked;

  /* ========================================================================
     6. ШТОРКА ЗМІСТУ (≤1024)
     ======================================================================== */
  function initDrawer() {
    var btn = $("#sidebarBtn"), aside = $("#moduleSidebar"), scrim = $("#sidebarOverlay");
    if (!btn || !aside || !scrim) return;
    var open = false;
    function set(v) {
      if (v === open) return;
      open = v;
      aside.classList.toggle("is-open", v);
      scrim.classList.toggle("is-open", v);
      btn.setAttribute("aria-expanded", String(v));
      lock(v);
      if (!v) btn.focus();
    }
    btn.addEventListener("click", function () { set(!open); });
    scrim.addEventListener("click", function () { set(false); });
    aside.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    /* Перехід через 1024 лишав би замок скролу назавжди. */
    if (global.matchMedia) {
      global.matchMedia("(min-width: 1024px)").addEventListener("change", function (m) {
        if (m.matches) set(false);
      });
    }
  }

  /* ========================================================================
     7. КВІЗ
     ======================================================================== */
  function quizHtml(host, data) {
    var questions = shuffle((data.questions || []).slice());
    var total = questions.length, answered = 0, correct = 0;
    var KEYS = ["А", "Б", "В", "Г", "Д", "Е"];   /* П-24 · українські літери */

    host.innerHTML = "";
    host.className = "ds-quiz";

    var status = el("p", "ds-quiz__status", "Обирай відповіді — пояснення з'являтимуться одразу.");
    host.appendChild(status);

    var prog = doc.createElement("span");
    prog.className = "ds-prog";
    prog.setAttribute("role", "progressbar");
    prog.setAttribute("aria-label", "Прогрес квіза");
    prog.setAttribute("aria-valuemin", "0");
    prog.setAttribute("aria-valuemax", "100");
    prog.setAttribute("aria-valuenow", "0");
    var fill = doc.createElement("span");
    /* Прод: background:#D97757 + "transition:width .4s ease" рядком у JS.
       Тут — компонент .ds-prog__bar із _base, і жодного числа в скрипті. */
    fill.className = "ds-prog__bar";
    fill.style.setProperty("--prog-v", "0");
    prog.appendChild(fill);
    host.appendChild(prog);

    questions.forEach(function (q, qi) {
      var opts = (q.options || []).map(function (t, i) { return { text: t, ok: i === q.answer }; });
      shuffle(opts);
      var answerIndex = opts.findIndex(function (o) { return o.ok; });

      var card = doc.createElement("div");
      card.className = "ds-quiz__card";
      card.appendChild(el("p", "ds-quiz__num", "Питання " + (qi + 1) + " з " + total));
      card.appendChild(el("p", "ds-quiz__q", q.q));

      var box = doc.createElement("div");
      box.className = "ds-quiz__opts";
      box.setAttribute("role", "group");
      box.setAttribute("aria-label", "Варіанти відповіді");

      /* Три рівні, а не два: зовнішній тримає grid-template-rows 0fr→1fr,
         СЕРЕДНІЙ (без класу) — overflow:hidden, і лише внутрішній має
         падінги й кант. Якщо падінги повісити на елемент із height:0,
         вони все одно намалюються — на екрані лишиться порожня смуга
         у 24 px під кожним питанням (побачено на першому кадрі). */
      var reveal = doc.createElement("div");
      reveal.className = "ds-quiz__reveal";
      var clip = doc.createElement("div");
      var explain = doc.createElement("div");
      explain.className = "ds-quiz__explain";
      clip.appendChild(explain);
      reveal.appendChild(clip);

      opts.forEach(function (o, oi) {
        var b = doc.createElement("button");
        b.type = "button";
        b.className = "ds-quiz__opt";
        /* П-24: без цього атрибута `content: attr(data-key)` малює порожнечу
           на 57 сторінках, і варіанти лишаються без «А/Б/В/Г». */
        b.setAttribute("data-key", KEYS[oi] || String(oi + 1));
        b.setAttribute("aria-pressed", "false");
        b.textContent = o.text;

        b.addEventListener("click", function () {
          if (card.classList.contains("is-answered")) return;
          card.classList.add("is-answered");
          var ok = oi === answerIndex;
          answered++; if (ok) correct++;

          $all(".ds-quiz__opt", box).forEach(function (x, xi) {
            x.setAttribute("data-locked", "1");
            x.setAttribute("aria-disabled", "true");
            /* П-26: гліф малює ТІЛЬКИ псевдоелемент (_base §10).
               Прод дописував "✓ " у textContent — вийшло б «✓ Текст ✓». */
            if (xi === answerIndex) x.classList.add("ds-quiz__opt--ok");
            if (xi === oi && !ok)   x.classList.add("ds-quiz__opt--bad");
          });
          b.setAttribute("aria-pressed", "true");

          explain.className = "ds-quiz__explain " +
            (ok ? "ds-quiz__explain--ok" : "ds-quiz__explain--bad");
          explain.innerHTML =
            '<span class="ds-quiz__verdict">' + (ok ? "Правильно!" : "Не зовсім.") + "</span>" +
            esc(q.explain || "");
          /* M7 · розкриття через grid-template-rows 0fr→1fr (клас is-answered).
             Жодного inline-переходу рядком: тривалість — --dur-state. */

          status.textContent = "Відповіли: " + answered + " з " + total + " · Правильно: " + correct;
          var pct = total ? Math.round(answered / total * 100) : 0;
          fill.style.setProperty("--prog-v", String(answered / total));
          prog.setAttribute("aria-valuenow", String(pct));
          if (answered === total) summary();
        });
        box.appendChild(b);
      });

      card.appendChild(box);
      card.appendChild(reveal);
      host.appendChild(card);
    });

    function summary() {
      var share = Math.round(correct / total * 100);
      var box = doc.createElement("div");
      box.className = "ds-quiz__summary";
      box.appendChild(el("p", "ds-quiz__score", "Результат: " + correct + " з " + total + " (" + share + "%)"));
      box.appendChild(el("p", "", message(correct, total)));
      var again = doc.createElement("button");
      again.type = "button";
      again.className = "ds-btn ds-btn--secondary ds-quiz__restart";
      again.textContent = "Пройти квіз ще раз";
      again.addEventListener("click", function () {
        quizHtml(host, data);
        /* П-27: поведінка скролу теж іде через ворота --motion, а не matchMedia. */
        host.scrollIntoView({ behavior: motion.on() ? "smooth" : "auto", block: "start" });
      });
      box.appendChild(again);
      host.appendChild(box);
      var live = $("#ariaLive");
      if (live) live.textContent = "Квіз завершено: " + correct + " з " + total;
    }

    function message(c, t) {
      var s = t ? c / t : 0;
      if (s === 1)     return "Бездоганно! Ти впевнено володієш матеріалом модуля.";
      if (s >= 0.75)   return "Дуже добре! Базу закладено міцно — дрібниці легко освіжити.";
      if (s >= 0.5)    return "Непогано. Переглянь пояснення до помилок і відповідні уроки.";
      return "Варто пройти модуль ще раз — і квіз обов'язково підкориться.";
    }
    function el(tag, cls, text) {
      var n = doc.createElement(tag);
      if (cls) n.className = cls;
      n.textContent = text;
      return n;
    }
    function shuffle(a) {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
  }

  /* ========================================================================
     8. .term — копіювання й «показати все» (фрагмент js/ui.js, без змін логіки)
     ======================================================================== */
  doc.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var copy = e.target.closest(".term__copy");
    if (copy) {
      var block = copy.closest(".term");
      var ins = block ? block.querySelectorAll(".term__body .term__in") : [];
      var text = Array.prototype.map.call(ins, function (x) { return x.textContent; }).join("\n");
      var ok = copy.getAttribute("data-ok") || "Скопійовано";
      var fail = copy.getAttribute("data-fail") || "Не вдалося скопіювати";
      var label = copy.textContent;
      var live = $("#ariaLive");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copy.textContent = ok;
          if (live) live.textContent = ok;
          setTimeout(function () { copy.textContent = label; }, 1600);
        }).catch(function () { if (live) live.textContent = fail; });
      } else if (live) { live.textContent = fail; }
      return;
    }
    var more = e.target.closest(".term__more");
    if (more) {
      var term = more.closest(".term");
      var open = term.classList.toggle("is-open");
      more.setAttribute("aria-expanded", open ? "true" : "false");
      var l = more.getAttribute(open ? "data-label-open" : "data-label-closed");
      if (l) more.textContent = l;
    }
  });

  /* ========================================================================
     9. СТАРТ
     ======================================================================== */
  function boot(cfg) {
    CFG = cfg;
    var brand = $('[data-site="name"]');
    if (brand) brand.textContent = cfg.site.name;
    var mark = $('[data-site="shortName"]');
    if (mark) mark.textContent = cfg.site.shortName;
    $all('[data-site="disclaimer"]').forEach(function (n) { n.textContent = cfg.site.disclaimer || ""; });

    renderSidebar();
    renderModuleNav();
    refreshComplete();
    pill();
    /* Панель станів макета чекає саме на цю подію: до приходу даних курсу
       екран-замок будувати нема з чого. */
    doc.dispatchEvent(new CustomEvent("aia:demo-ready"));
  }

  /* Пілюля прогресу — ширина резервується ВЛАСНИМИ властивостями, а не
     Tailwind-утилітою з JS (§6.5, дефект 006 D-02: клас sm:not-sr-only
     генерувався ~53 мс, і пілюля стрибала на 64,8 px). */
  function pill() {
    var p = $("#navProgress");
    if (!p || !CFG) return;
    var total = CFG.modules.length;
    var d = CFG.modules.filter(function (m) { return Progress.isCompleted(m.id); }).length;
    var label = "Прогрес: ";
    var text = label + d + "/" + total;
    p.style.setProperty("--navprog-ch", String(text.length));
    p.style.setProperty("--navprog-short-ch", String(text.length - label.length));
    p.innerHTML = '<span class="ds-pill__label">' + label + "</span>" + d + "/" + total;
    p.classList.toggle("ds-pill--full", d === total);
    p.classList.toggle("ds-pill--unknown", d === 0);
    p.hidden = false;
  }

  doc.addEventListener("aia:progress", function () {
    renderSidebar(); renderModuleNav(); refreshComplete(); pill();
  });

  function start() {
    initDrawer();
    var btn = $("#completeBtn");
    if (btn) btn.addEventListener("click", function () {
      Progress.setCompleted(cur(), !Progress.isCompleted(cur()));
    });
    $all("[data-quiz]").forEach(function (host) {
      var src = doc.getElementById(host.getAttribute("data-quiz"));
      if (!src) return;
      try { quizHtml(host, JSON.parse(src.textContent)); }
      catch (err) {
        host.innerHTML = '<p class="ds-quiz__status">Не вдалося завантажити квіз — перевір формат JSON.</p>';
      }
    });
    fetch("js/course-terminal.json")
      .then(function (r) { return r.json(); })
      .then(boot)
      .catch(function () {
        var ce = $("#configError");
        if (ce) ce.hidden = false;
      });
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start);
  else start();
})(window);
