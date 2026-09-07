/* ============================================================================
   010 · T1b — ХОРЕОГРАФІЯ · РІВНО ОДИН ScrollTrigger на всю сторінку
   ----------------------------------------------------------------------------
   Бюджет §9, який перевіряє валідатор:
     ScrollTrigger  — 0 на 64 сторінках, 1 тут, 1 на roadmap.html
     безкінечні цикли — ≤2 на лендінг (тут 0: hero-термінал друкується один
                        раз і зупиняється, каретки в нього немає)
     посимвольна вставка в DOM — 0
   Поява секцій — [data-reveal] + IntersectionObserver усередині AIA.motion,
   а НЕ ще один тригер на секцію: інакше кількість тригерів росла б лінійно
   з кількістю модулів (22 фази × … ). На anthropic.com виміряно два тригери
   на цілий лендінг — беремо жорсткіше.

   ⚠ П-01. Тут НЕ читається жоден складений токен. Усі числа приходять із
   AIA.motion, який множить сирі --p-* на --motion сам. Через це
   prefers-reduced-motion, пресет data-motion="calm" і клас html.rm працюють
   однаково — і на CSS, і на GSAP.
   ⚠ П-27. gsap.matchMedia() бачить ЛИШЕ системну настройку. Тому перша ж
   умова нижче — AIA.motion.on(), а не тільки matchMedia.
   ========================================================================== */
(function (global) {
  "use strict";

  var M = global.AIA && global.AIA.motion;

  function build() {
    if (!M || !M.on()) return;                 /* єдині ворота руху */
    if (!global.gsap || !global.ScrollTrigger) return;

    var lit = document.querySelector(".cc-path__lit");
    var path = document.querySelector(".cc-path");
    if (!lit || !path) return;

    /* M9 · «сторінка слухається руки». Вісь заповнюється зверху вниз рівно
       на стільки, на скільки прогорнуто вісь. ease: "none" обовʼязковий —
       інакше положення лінії не збігається з положенням пальця. */
    gsap.fromTo(lit,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: path,
          start: "top center",
          end: "bottom center",
          scrub: M.scrub()                      /* 0.8 — виміряне число 003 */
        }
      });

    /* M10 · «за цим сидить людина». Друк — clip-path + steps(), нуль записів
       у DOM. Запускається один раз, коли термінал реально видно. */
    var term = document.getElementById("heroTerm");
    if (term) {
      var played = false;
      var io = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting || played) return;
        played = true;
        io.disconnect();
        typeHero(term);
      }, { rootMargin: "0px 0px -8% 0px" });
      io.observe(term);
      /* Страховка на середовище, яке не доставляє IO-колбеки (фонова
         вкладка, оклюзія, headless — виміряно в цьому проєкті тричі):
         якщо термінал уже у вʼюпорті, друкуємо без спостерігача. */
      var r = term.getBoundingClientRect();
      if (r.width > 0 && r.top < (global.innerHeight || 0) && r.bottom > 0) {
        played = true; io.disconnect(); typeHero(term);
      }
    }

    var replay = document.getElementById("heroReplay");
    if (replay && term) replay.addEventListener("click", function () { typeHero(term); });
  }

  /* --------------------------------------------------------------------------
     M10 · друк. ⚠ ДЕФЕКТ БАЗИ, ЗНАЙДЕНИЙ ОЧИМА 2026-09-07 — і причина, чому
     тут власна функція замість AIA.motion.play.typing().

     `.term__clip` робить `clip-path: inset(0 X% 0 0)` — тобто ГОРИЗОНТАЛЬНУ
     штору через УВЕСЬ блок, а не друк рядок за рядком. Тривалість же
     motion.js рахує як `увесь_текст / cps`. Для однорядкового термінала це
     збігається; для сесії hero (≈450 символів) дає 14 СЕКУНД шторки —
     заміряно, видно на скріншоті: через 3 с відкрито ~21 % ширини.
     Правильний дільник для штори — НАЙДОВШИЙ РЯДОК, а не сума всіх:
     46 символів / 32 cps = 1,44 с.
     У REPORT.md це винесено як правку, потрібну самій системі.
     -------------------------------------------------------------------------- */
  function typeHero(term) {
    var body = term.querySelector(".term__body") || term;
    var cps = M.cps();
    var longest = (body.textContent || "").split("\n").reduce(function (n, l) {
      return Math.max(n, l.length);
    }, 0);
    if (!isFinite(cps) || cps <= 0 || longest === 0) {
      term.classList.remove("is-typing");
      term.style.removeProperty("--term-rev");
      return;
    }
    term.style.setProperty("--term-steps", longest);
    term.style.setProperty("--term-type-dur", (longest / cps) + "s");
    term.classList.remove("is-typing");
    void term.offsetWidth;                 /* рестарт анімації без таймера */
    term.classList.add("is-typing");
  }

  /* Порядок обовʼязковий: cc-render.js кидає подію ПІСЛЯ того, як DOM готовий
     і AIA.motion.bind() відпрацював. Слухати DOMContentLoaded тут не можна —
     осі ще не існує. */
  document.addEventListener("cc:rendered", build);
})(window);
