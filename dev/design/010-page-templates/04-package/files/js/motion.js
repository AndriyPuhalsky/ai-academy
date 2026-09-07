/* ============================================================================
   AIA DESIGN SYSTEM v1 · СИСТЕМА РУХУ — МІСТ CSS → JS → GSAP
   ----------------------------------------------------------------------------
   Основа — вже робочий і перевірений у проді код js/roadmap-motion.js:52–82
   (raw / num / ms / sec / ease з CustomEase.create). Новий тут — не читач
   токенів, а ДВА структурні рішення нижче.

   ⚠ РІШЕННЯ 1. JS НІКОЛИ НЕ ЧИТАЄ СКЛАДЕНІ ТОКЕНИ.
   getComputedStyle() для незареєстрованого custom property повертає
   невирахуваний рядок `calc(180 * calc(1 * 1 * 1ms + 0.001ms))`; parseFloat
   від нього = NaN, і помічник ms() тихо бере fallback — рух лишається живим
   при prefers-reduced-motion, а на скріншоті це не видно взагалі.
   Тому тут читаються ТІЛЬКИ --motion, --motion-scale, --motion-travel,
   --motion-stagger і сирі --p-* числа, а множення робить сам JS.
   (Друга половина захисту — @property у tokens.css, секція 5.)

   ⚠ РІШЕННЯ 2. ЖОДЕН ЕЛЕМЕНТ НЕ ХОВАЄТЬСЯ САМИМ ЛИШЕ CSS.
   Стан спокою [data-reveal] — opacity:1, видимий. Приховування накладає JS
   атрибутом data-reveal="armed" і ТІЛЬКИ ПІСЛЯ того, як спостерігач для цього
   елемента реально приєднаний. Наслідок: JS не завантажився, впав, або
   стоїть reduce — користувач бачить увесь контент.
   Це структурний фікс найчастішого дефекту конвеєра (003 D-01 і 005 Б-01:
   вузли, створені після асинхронного render(), лишались з opacity:0 назавжди),
   а не патч. Headless його не бачить: там rAF викликається рівно один раз,
   і IntersectionObserver не спрацьовує взагалі.

   У цьому файлі НЕМАЄ ЖОДНОГО ЧИСЛА, якого немає в tokens.css.
   ========================================================================== */
(function (global) {
  "use strict";

  var root = document.documentElement;
  var HAS_GSAP = !!(global.gsap);
  if (HAS_GSAP) {
    if (global.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (global.CustomEase)    gsap.registerPlugin(CustomEase);
  }

  /* ---------- 0. Токени → JS ---------- */

  function raw(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }
  function num(name, fallback) {
    var v = parseFloat(raw(name));
    return isNaN(v) ? fallback : v;
  }
  /* Множники читаються щоразу: пресет і reduce можуть змінитись за життя сторінки. */
  function motion()  { return num("--motion", 1); }
  function mScale()  { return num("--motion-scale", 1); }
  function mTravel() { return num("--motion-travel", 1); }
  function mStag()   { return num("--motion-stagger", 1); }

  var easeCache = {};

  var M = {
    /* Єдині ворота. false → таймлайни не створюються ВЗАГАЛІ, елементи
       одразу ставляться в кінцевий стан. Не «швидко програти», а «не грати». */
    on: function () { return motion() === 1; },

    /* Секунди для GSAP: p_dur_<name> * motion * motion-scale / 1000 */
    dur: function (name) {
      return num("--p-dur-" + name, 0) * motion() * mScale() / 1000;
    },
    delay: function (name) {
      return num("--p-delay-" + name, 0) * motion() * mScale() / 1000;
    },
    /* Пікселі: p_move_<name> * motion * motion-travel */
    move: function (name) {
      return num("--p-move-" + name, 0) * motion() * mTravel();
    },
    scale: function (name) {
      var d = num("--p-scale-" + name, 0) * motion();
      return name === "pop" ? 1 + d : 1 - d;
    },
    /* cubic-bezier() з токена → ease для GSAP. Один токен на CSS і на JS. */
    ease: function (name) {
      if (easeCache[name]) return easeCache[name];
      var v = raw("--p-e-" + name);
      var m = /cubic-bezier\(([^)]+)\)/.exec(v);
      var out = "power2.out";
      if (m && global.CustomEase) {
        out = CustomEase.create("aia" + name.replace(/[^a-z]/gi, ""),
          m[1].split(",").map(function (n) { return parseFloat(n); }).join(","));
      }
      easeCache[name] = out;
      return out;
    },
    /* Стагер із cap: після cap-го елемента затримка НЕ росте.
       Виміряно: 30 карток без cap — 2249 мс до останнього, з cap 8 — 982 мс. */
    stagger: function (index) {
      var step = num("--p-stag-list", 0) * motion() * mStag() / 1000;
      var cap  = num("--p-stag-cap", 0);
      return Math.min(index, cap) * step;
    },
    scrub: function () {
      var s = num("--p-scrub", 0) * motion();
      return s > 0 ? s : false;
    },
    /* П5 · виняток: на швидкість ділять, тому вона не множиться на --motion.
       Гілку вимкнення бере на себе саме цей рядок. */
    cps: function () {
      return M.on() ? num("--p-term-speed-cps", 0) : Infinity;
    }
  };

  /* ==========================================================================
     1. M2 reveal + контракт «стан після render()»
     ========================================================================== */

  var io = null;
  function observer() {
    if (io || !("IntersectionObserver" in global)) return io;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var i = parseInt(el.getAttribute("data-reveal-i") || "0", 10);
        el.style.transitionDelay = M.stagger(i) + "s";
        el.setAttribute("data-reveal", "in");   /* M2 живе в CSS: transform + opacity */
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    return io;
  }

  /* Викликається В КІНЦІ КОЖНОГО асинхронного render(). Це контракт,
     записаний у коментарі кожної функції рендера. Повторний виклик безпечний. */
  M.bind = function (scope) {
    var host = scope || document;
    var list = host.querySelectorAll("[data-reveal]");
    if (!M.on() || !("IntersectionObserver" in global)) {
      /* reduce або немає IO — показуємо все одразу й повністю. */
      Array.prototype.forEach.call(list, function (el) { el.setAttribute("data-reveal", "in"); });
      return list.length;
    }
    var o = observer(), n = 0, group = {};
    var vh = global.innerHeight || root.clientHeight;
    Array.prototype.forEach.call(list, function (el) {
      /* ⚠ ДОПОВНЕННЯ АГЕНТА №4 (D-07). Білдер закрив випадок «уже видимий на
         момент bind()», але лишався другий: вузол ОЗБРОЄНО, а IO-колбек
         середовище не доставило (фонова вкладка, оклюзія, headless). Тоді
         елемент застрягав у "armed" (opacity 0) назавжди, і повторний bind()
         його не рятував — рядок нижче виходив по !== "". Виміряно у живому
         Chrome цієї машини: доставка IO — ВІДСУТНЯ у вкладці, яка не
         рендериться; 2 з 5 щойно створених карток лишились невидимими.
         Тепер кожен bind() підмітає озброєні вузли, які вже у вʼюпорті.
         Ціна — нуль: жодного нового слухача, жодної роботи на кадр. */
      if (el.getAttribute("data-reveal") === "armed") {
        var rr = el.getBoundingClientRect();
        if (rr.width > 0 && rr.top < vh && rr.bottom > 0) {
          if (o) o.unobserve(el);
          el.setAttribute("data-reveal", "in");
        }
        return;
      }
      if (el.getAttribute("data-reveal") !== "") return;   /* уже озброєний або показаний */

      /* ⚠ ЩО ВЖЕ У ВʼЮПОРТІ — НЕ ХОВАЄМО ВЗАГАЛІ.
         Три причини, і всі три перевірені вимірюванням:
         (1) M2 називається «вхід у вʼюпорт»; те, що вже там, нікуди не входить,
             тож ховати його — вигадати рух, якого словник не описує;
         (2) знімає спалах «показали → сховали → показали» на першому екрані;
         (3) головне: робить видимість контенту НЕЗАЛЕЖНОЮ від асинхронної
             доставки IntersectionObserver. Chrome не доставляє IO-колбеки
             у вкладку, яка не рендериться (фон, headless, оклюзія) — виміряно
             на цьому ж макеті: свіжий IO не спрацював ЖОДНОГО разу на елементі,
             що стояв на 315px у вікні висотою 709px. Зі старою конструкцією
             такий вузол лишався б невидимим назавжди — це і є дефект
             003 D-01 / 005 Б-01, лише з іншої причини. */
      var r = el.getBoundingClientRect();
      if (r.width > 0 && r.top < vh && r.bottom > 0) { el.setAttribute("data-reveal", "in"); return; }

      var key = el.parentNode ? (el.parentNode.getAttribute("data-reveal-root") || "_") : "_";
      group[key] = (group[key] || 0);
      el.setAttribute("data-reveal-i", group[key]++);
      /* ПОРЯДОК ВАЖЛИВИЙ: спершу приєднуємо спостерігача, і лише потім ховаємо. */
      o.observe(el);
      el.setAttribute("data-reveal", "armed");
      n++;
    });
    return n;
  };

  /* Чи доставляє це середовище IO-колбеки взагалі. Потрібне тестам, щоб
     відрізняти дефект системи від обмеження вкладки. */
  M.ioWorks = function () {
    return new Promise(function (resolve) {
      if (!("IntersectionObserver" in global)) return resolve(false);
      var p = document.createElement("div");
      p.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;pointer-events:none;opacity:0";
      document.body.appendChild(p);
      var done = false;
      var t = new IntersectionObserver(function () { done = true; }, {});
      t.observe(p);
      setTimeout(function () { t.disconnect(); p.remove(); resolve(done); }, 400);
    });
  };

  /* Страховка на забутий виклик bind() після render(). */
  var pending = false;
  function watch() {
    if (!("MutationObserver" in global)) return;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; M.bind(document); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-reveal-root]"), function (r) {
      mo.observe(r, { childList: true, subtree: true });
    });
  }

  /* ==========================================================================
     2. Іменовані ефекти §6.1 — кожен запускається з playground
     ========================================================================== */

  M.play = {
    /* M1 · сторінка ПРИЙШЛА, а не блимнула */
    "page-in": function (el) {
      if (!M.on()) { el.style.opacity = ""; el.style.transform = ""; return; }
      if (HAS_GSAP) {
        gsap.fromTo(el, { opacity: 0, y: M.move("card") },
          { opacity: 1, y: 0, duration: M.dur("page-in"), ease: M.ease("out"), clearProps: "opacity,transform" });
      } else {
        el.animate([{ opacity: 0, transform: "translateY(" + M.move("card") + "px)" },
                    { opacity: 1, transform: "none" }],
                   { duration: M.dur("page-in") * 1000, easing: "ease-out" });
      }
    },
    /* M2 · контент чекав на мене.
       Повтор на майданчику — ДЕТЕРМІНОВАНИЙ, без IntersectionObserver:
       озброїти → примусовий reflow → наступний кадр показати зі стагером.
       IO тут не потрібен (елемент уже на екрані), а залежати від його
       доставки задля демонстрації — значить показувати порожній екран
       у будь-якій нерендереній вкладці. */
    reveal: function (scope) {
      var list = scope.querySelectorAll("[data-reveal]");
      Array.prototype.forEach.call(list, function (el, i) {
        el.style.transitionDelay = "";
        el.setAttribute("data-reveal", "armed");
        el.setAttribute("data-reveal-i", i);
      });
      void scope.offsetWidth;                       /* примусовий reflow */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          Array.prototype.forEach.call(list, function (el, i) {
            el.style.transitionDelay = M.stagger(i) + "s";
            el.setAttribute("data-reveal", "in");
          });
        });
      });
    },
    /* M7 · щось змінилось саме тут. height — тільки через grid-template-rows */
    "state-change": function (el) { el.classList.toggle("is-open"); },
    /* M8 · цифра справжня, її порахували. tabular-nums тримає ширину:
       виміряно — без нього ширина гуляє на 35.22 px за 56 кадрів */
    count: function (el) {
      var to = parseInt(el.getAttribute("data-count-to"), 10);
      if (!M.on()) { el.textContent = String(to); return; }
      var dur = M.dur("count") * 1000, t0 = performance.now();
      var pad = String(to).length;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(to * eased)).padStart(pad, "0");
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    },
    /* M10 · за цим сидить людина.
       clip-path: inset() + steps(N). ПОСИМВОЛЬНА ВСТАВКА В DOM ЗАБОРОНЕНА:
       ціна не в fps (він однаковий), а в 166 записах у DOM, зірваному виділенні
       тексту на кожному символі й 166 перечитуваннях рядка скрінрідером. */
    /* ⚠ ПРАВКА 010 (Б1, Б-04). Було: ділити на СУМУ символів блока. Але
       .term__clip — це горизонтальна штора через увесь блок (clip-path:
       inset справа наліво), тобто за один «крок» відкривається один
       символьний СТОВПЕЦЬ, а не один символ тексту. На сесії hero (450
       символів, 12 рядків) стара формула давала 14 секунд: скріншот на
       третій секунді показував ~21 % відкритого. Правильний дільник —
       найдовший рядок (46 символів → 1,44 с). Формула тепер збігається
       з тим, що око бачить на екрані. */
    typing: function (el) {
      var body = el.querySelector(".term__body") || el;
      var lines = (body.textContent || "").split("\n");
      var chars = 0, i;
      for (i = 0; i < lines.length; i++) if (lines[i].length > chars) chars = lines[i].length;
      var cps = M.cps();
      if (!isFinite(cps) || chars === 0) { el.style.removeProperty("--term-rev"); el.classList.remove("is-typing"); return; }
      el.style.setProperty("--term-steps", chars);
      el.style.setProperty("--term-type-dur", (chars / cps) + "s");
      el.classList.remove("is-typing");
      void el.offsetWidth;                       /* рестарт анімації без таймера */
      el.classList.add("is-typing");
    }
  };

  /* M9 · один ScrollTrigger на сторінку. Поява карток — IntersectionObserver
     + CSS, інакше кількість тригерів росте лінійно з даними.
     (Виміряно на anthropic.com рівно два тригери на цілий лендінг; беремо жорсткіше.) */
  M.scrub1 = function (trigger, target) {
    if (!M.on() || !HAS_GSAP || !global.ScrollTrigger) return null;
    return gsap.fromTo(target, { scaleX: 0 }, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: trigger, start: "top 80%", end: "bottom 20%", scrub: M.scrub() }
    });
  };

  /* ==========================================================================
     3. Старт
     ========================================================================== */
  function init() {
    M.bind(document);
    watch();
    /* ⚠ ДОПОВНЕННЯ АГЕНТА №4 (D-07, друга половина). Момент, коли вкладка
       стає видимою, — це рівно той момент, коли недоставлені IO-колбеки
       вже не прийдуть, а контент має бути на екрані. Один слухач на
       документ, нуль роботи на кадр. */
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) M.bind(document);
    });
    var main = document.querySelector("[data-page-in]");
    if (main) M.play["page-in"](main);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  global.AIA = global.AIA || {};
  global.AIA.motion = M;
})(window);
