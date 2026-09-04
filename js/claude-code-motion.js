/* ============================================================
   005 · РУХ І ПОВЕДІНКА ЛЕНДІНГА «AI ТЕРМІНАЛ»
   ------------------------------------------------------------
   Один файл, дві частини:
     A. хореографія лендінга — dev/design/005-ai-terminal/04-variants/
        _base/motion.js (перенесено дослівно);
     Б. поведінка компонента «термінал» — _base/term.js (перенесено
        дослівно): кнопка «копіювати» і розгортання довгого виводу.

   Обраний варіант руху — B «Робота». Його 04-variants/variant-b/
   variant.css задає рівно ті самі числа, що базові токени (звірено
   токен у токен, 21 значення), тому окремого файла значень немає:
   усі токени руху живуть у css/custom.css (компонент) і
   css/claude-code.css (сторінка).

   GSAP 3.13.0 з CDN, рівно три файли: ядро + ScrollTrigger +
   CustomEase — точно так само, як у roadmap.html:174–176.
   Ліцензія перевірена в задачі 003: усе GSAP безкоштовне для
   комерційного використання з 30.04.2025, атрибуції не вимагає.

   ЖОДНОГО ЧИСЛА ТРИВАЛОСТІ ТУТ НЕМАЄ. Усі значення читаються з
   CSS-токенів (прийом js/roadmap-motion.js:57–92) — саме тому
   @media (prefers-reduced-motion) керує і CSS, і GSAP одночасно.

   ЩО ТУТ СВІДОМО НЕ РОБИТЬСЯ:
     · посимвольна вставка в DOM (js/ui.js) — заборонено полем 11
       брифа: ламає копіювання, пошук і скрін-рідер;
     · SplitText — обгортки рядків у нас уже є, плагін зайвий;
     · анімація width/height — layout кожен кадр;
     · ScrollTrigger на кожен рядок — на всю сторінку його рівно ОДИН.
   ============================================================ */

/* ============================================================
   ЧАСТИНА A · ХОРЕОГРАФІЯ ЛЕНДІНГА
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- читання токенів ---------- */
  function raw(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  function num(name, fb) { var v = parseFloat(raw(name)); return isNaN(v) ? fb : v; }
  function ms(name, fb) {
    var v = raw(name);
    if (!v) return fb;
    if (v.indexOf("ms") > -1) return parseFloat(v);
    if (v.indexOf("s") > -1) return parseFloat(v) * 1000;
    return parseFloat(v) || fb;
  }
  function sec(name, fb) { return ms(name, fb) / 1000; }

  var easeCache = {};
  function ease(name, fb) {
    if (easeCache[name]) return easeCache[name];
    var m = /cubic-bezier\(([^)]+)\)/.exec(raw(name));
    var out = fb || "power2.out";
    if (m && window.CustomEase) {
      out = CustomEase.create("cc" + name.replace(/[^a-z]/gi, ""), m[1].split(",").map(parseFloat).join(","));
    }
    easeCache[name] = out;
    return out;
  }

  function T() {
    return {
      cps:        num("--speed-term-cps", 32),
      start:      sec("--delay-term-start", 300),
      think:      sec("--delay-term-think", 250),
      line:       sec("--dur-term-line", 260),
      diff:       sec("--dur-term-diff", 300),
      pop:        sec("--dur-term-pop", 320),
      popDelay:   sec("--delay-term-pop", 150),
      stagStep:   sec("--stag-term-step", 220),
      stagLine:   sec("--stag-term-line", 130),
      move:       num("--move-term-step", 4),
      scale:      num("--scale-term-pop", 0.98),
      scrub:      num("--scrub-spine", 0.8),
      eOut:       ease("--e-out", "power3.out"),
      ePop:       ease("--e-pop", "back.out(1.7)")
    };
  }

  /* ============================================================
     M8 / M10 / M11 · поява при скролі.
     IntersectionObserver + CSS, без ScrollTrigger: інакше кількість
     тригерів росла б лінійно з кількістю модулів (їх 22).
     ============================================================ */
  /* ⚠ ВИПРАВЛЕНО ВАЛІДАТОРОМ (дефект того ж класу, що D-01 у задачі 003).
     Було: спостерігач створювався РІВНО ОДИН РАЗ на DOMContentLoaded (~208 мс),
     а `.cc-rows` народжуються пізніше — у renderMap() після fetch конфіга.
     Наслідок: жоден із 22 рядків карти ніколи не отримував `is-in`, а
     `.js .cc-row { opacity: 0 }` лишав їх невидимими НАЗАВЖДИ. Карта програми
     — головний артефакт сторінки — була порожня.
     Стало: спостерігач один і живе весь час сторінки; observeReveals()
     ідемпотентна (позначає вузли `data-cc-seen`) і викликається ще й після
     кожного рендера. Урок 003 дослівно: стан появи не має жити поза DOM. */
  var revealIO = null;

  function observeReveals() {
    var targets = document.querySelectorAll(".cc-in, .cc-rows, .term--enter");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          revealIO.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    }
    Array.prototype.forEach.call(targets, function (el) {
      if (el.dataset.ccSeen === "1" || el.classList.contains("is-in")) return;
      el.dataset.ccSeen = "1";
      revealIO.observe(el);
    });
  }

  /* ============================================================
     M1–M7 · СЕСІЯ В HERO
     ============================================================ */
  var heroTl = null;

  function heroParts() {
    var term = document.querySelector(".term--hero");
    if (!term) return null;
    var body = term.querySelector(".term__body");
    if (!body) return null;
    return {
      term: term,
      typed: Array.prototype.slice.call(body.querySelectorAll(".term__line--type")),
      steps: Array.prototype.slice.call(body.querySelectorAll(".term__line--step")),
      diffs: Array.prototype.slice.call(body.querySelectorAll(".term__line--diff")),
      pops:  Array.prototype.slice.call(body.querySelectorAll(".term__line--pop"))
    };
  }

  /* Кожен рядок відкривається кліпом по вже наявному в DOM тексту.
     Змінна --rev веде і кліп, і каретку — одна анімація, два наслідки,
     нуль синхронізації (рецепт 1c з lab/typing-techniques.html). */
  function reveal(tl, line, at, dur, easing, withCaret, chars) {
    var o = { v: 0 };
    tl.to(o, {
      v: 100,
      duration: dur,
      ease: chars ? "steps(" + chars + ")" : easing,
      onStart: function () {
        if (withCaret) line.classList.add("has-caret");
      },
      onUpdate: function () { line.style.setProperty("--rev", o.v + "%"); },
      onComplete: function () { line.style.setProperty("--rev", "100%"); }
    }, at);
  }

  function armHero(p) {
    p.term.classList.add("is-armed");
    p.typed.concat(p.diffs).forEach(function (l) {
      l.style.removeProperty("--rev");
      l.classList.remove("has-caret", "is-blinking");
    });
    p.steps.concat(p.pops).forEach(function (l) { l.removeAttribute("style"); });
  }

  function buildHero() {
    var p = heroParts();
    if (!p) return null;
    var t = T();
    armHero(p);

    var tl = gsap.timeline({ paused: true });
    var cursor = t.start;

    /* M1 · друк промпту + M2 · каретка */
    p.typed.forEach(function (line, i) {
      var chars = line.textContent.length;
      var dur = chars / t.cps;
      reveal(tl, line, cursor, dur, "none", true, chars);
      tl.call(function () {
        if (i > 0) p.typed[i - 1].classList.remove("has-caret", "is-blinking");
      }, null, cursor);
      cursor += dur + 0.05;
    });

    /* M3 · пауза «машина думає»: каретка блимає, більше нічого не рухається */
    var last = p.typed[p.typed.length - 1];
    if (last) {
      tl.call(function () { last.classList.add("is-blinking"); }, null, cursor);
      cursor += t.think;
      tl.call(function () { last.classList.remove("has-caret", "is-blinking"); }, null, cursor);
    }

    /* M4 · ⏺-кроки: каскад, поява зліва на --move-term-step */
    p.steps.forEach(function (line, i) {
      tl.fromTo(line,
        { opacity: 0, x: -t.move },
        { opacity: 1, x: 0, duration: t.line, ease: t.eOut },
        cursor + i * t.stagStep);
    });
    cursor += Math.max(0, p.steps.length - 1) * t.stagStep + (p.steps.length ? t.line : 0);

    /* M5 · диф: рядки відкриваються зліва направо, зверху вниз */
    p.diffs.forEach(function (line, i) {
      reveal(tl, line, cursor + i * t.stagLine, t.diff, t.eOut, false, 0);
    });
    cursor += Math.max(0, p.diffs.length - 1) * t.stagLine + (p.diffs.length ? t.diff : 0) + t.popDelay;

    /* M6 · Pop in діалогу дозволу — єдиний перескок на сторінці */
    tl.fromTo(p.pops,
      { opacity: 0, scale: t.scale, transformOrigin: "left center" },
      { opacity: 1, scale: 1, duration: t.pop, ease: t.ePop, stagger: t.pop / 4 },
      cursor);

    tl.call(function () { p.term.classList.remove("is-armed"); });
    return tl;
  }

  function playHero() {
    if (!window.gsap) return;         /* GSAP не приїхав — фінальний кадр і так на екрані */
    if (heroTl) heroTl.kill();
    heroTl = buildHero();
    if (heroTl) heroTl.play(0);
  }

  /* ---------- M14 · «показати ще раз» ---------- */
  function bindReplay() {
    var btn = document.getElementById("heroReplay");
    if (!btn) return;
    btn.addEventListener("click", playHero);
  }

  /* ============================================================
     M9 · заповнення осі під скрол. ОДИН ScrollTrigger на сторінку.
     ============================================================ */
  function buildSpine() {
    var lit = document.querySelector(".cc-path__lit");
    var path = document.querySelector(".cc-path");
    var exam = document.getElementById("ccExam");
    if (!lit || !path || !window.gsap || !window.ScrollTrigger) return;
    var t = T();
    if (!t.scrub) { gsap.set(lit, { scaleY: 1 }); return; }
    gsap.to(lit, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: path,
        start: "top top+=25%",
        endTrigger: exam || path,
        end: "center center",
        scrub: t.scrub
      }
    });
  }

  /* ============================================================
     СТАРТ
     ============================================================ */
  function boot() {
    bindReplay();

    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger, CustomEase);

    var mm = gsap.matchMedia();

    /* Гілка reduced-motion: жодного таймлайну. Фінальний кадр сесії
       вже в DOM з першого рендера, бо клас is-armed ставить лише
       код нижче. Кнопка «показати ще раз» ховається — показувати
       нічого. Вісь намальована повністю. */
    mm.add("(prefers-reduced-motion: reduce)", function () {
      var replay = document.getElementById("heroReplay");
      if (replay) replay.hidden = true;
      var lit = document.querySelector(".cc-path__lit");
      if (lit) gsap.set(lit, { scaleY: 1 });
      var term = document.querySelector(".term--hero");
      if (term) term.classList.remove("is-armed");
    });

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      playHero();
      buildSpine();
      return function () { if (heroTl) { heroTl.kill(); heroTl = null; } };
    });
  }

  /* Рендер асинхронний (fetch конфіга), тому хореографія чекає на
     подію, а не на DOMContentLoaded. Якщо конфіг не приїхав —
     рухати нічого, і це правильна поведінка. */
  /* Поява блоків (M8 / M10 / M11) не залежить від конфіга й потрібна
     також на сторінках уроків, де рендера немає взагалі. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeReveals, { once: true });
  } else {
    observeReveals();
  }

  /* Вузли, створені рендером, теж мусять потрапити під спостереження. */
  document.addEventListener("cc:map-rendered", observeReveals);
  document.addEventListener("cc:rendered", observeReveals);

  document.addEventListener("cc:rendered", boot, { once: true });
  /* Перерендер сесії при зміні широкий ⇄ вузький варіант. */
  document.addEventListener("cc:hero-rendered", function () {
    if (!heroTl) return;
    playHero();
  });
})();


/* ============================================================
   ЧАСТИНА Б · ПОВЕДІНКА КОМПОНЕНТА «ТЕРМІНАЛ»
   ------------------------------------------------------------
   Тут НЕМАЄ анімації: рух лендінга живе в частині A, а на сторінках
   уроків руху в терміналі немає взагалі.

   Дві поведінки:
     1. .term__copy — копіює ТІЛЬКИ введений текст (без префіксів
        `$` / `>` і без виводу). Копіювати сесію разом із кроками
        інструментів безглуздо, тому кнопка є лише в .term--cmd.
     2. .term__more — розгортає стан 8 «довгий вивід». Без анімації
        свідомо: анімувати height у блоці на 243 рядки = layout
        thrashing без жодної користі.

   ⚠ Слухач делегований на document, тому працює і для блоків, які
   з'являться пізніше. Коли з'являться 23 сторінки модулів, цей файл
   доведеться підключати й там — АБО перенести частину Б в js/ui.js,
   який на тих сторінках уже є. Друге дешевше, але це окреме рішення:
   зараз частина Б лишається тут, бо жодної сторінки модуля ще немає.
   ============================================================ */
(function () {
  "use strict";

  function announce(msg) {
    var live = document.getElementById("ariaLive");
    if (!live) return;
    live.textContent = "";
    window.setTimeout(function () { live.textContent = msg; }, 30);
  }

  document.addEventListener("click", function (e) {
    /* ---------- копіювання ---------- */
    var copy = e.target.closest ? e.target.closest(".term__copy") : null;
    if (copy) {
      var block = copy.closest(".term");
      var ins = block ? block.querySelectorAll(".term__body .term__in") : [];
      var text = Array.prototype.map.call(ins, function (el) { return el.textContent; }).join("\n");
      var ok = copy.getAttribute("data-ok") || "Скопійовано";
      var fail = copy.getAttribute("data-fail") || "Не вдалося скопіювати";
      var label = copy.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copy.textContent = ok;
          announce(ok);
          window.setTimeout(function () { copy.textContent = label; }, 1600);
        }).catch(function () { announce(fail); });
      } else {
        announce(fail);
      }
      return;
    }

    /* ---------- «показати все» ---------- */
    var more = e.target.closest ? e.target.closest(".term__more") : null;
    if (more) {
      var term = more.closest(".term");
      var open = term.classList.toggle("is-open");
      more.setAttribute("aria-expanded", open ? "true" : "false");
      var l = more.getAttribute(open ? "data-label-open" : "data-label-closed");
      if (l) more.textContent = l;
    }
  });
})();
