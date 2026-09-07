/* ============================================================================
   005 → 010 · РУХ ЛЕНДІНГА «AI ТЕРМІНАЛ»
   ----------------------------------------------------------------------------
   Переписаний на дизайн-систему 009 (задача 010, етап 5). Що змінилось проти
   редакції 005 і чому — вголос, бо це найпомітніша зміна поведінки етапу:

   1. ⚠ ХОРЕОГРАФІЯ СЕСІЇ M1–M7 (друк промпту → блимання каретки → каскад
      ⏺-кроків → диф → pop-in діалогу дозволу) ЗНЯТА. Замість неї — той самий
      механізм, що вже несе всі 101 термінал сайту: одна горизонтальна штора
      clip-path + steps() по всьому блоку (.term__clip, components.css §12).
      Причина не косметична: уся та хореографія трималась на девʼяти іменах,
      яких у системі 009 немає взагалі — .term__line--type / --step / --diff /
      --pop, .has-caret, .is-blinking, .is-armed, .term--enter і власному
      @property --rev. Усі девʼять живуть у css/custom.css, який видаляється
      на етапі 9. Тобто вибір був не «лишити чи прибрати», а «прибрати зараз
      чи отримати мовчазну поломку в чужій зоні». Плюс каретка малювалась
      псевдоелементом ::after ВСЕРЕДИНІ .term — те, що П-13 прямо забороняє
      (Chrome бере псевдоелементи в буфер копіювання, а тест їх не бачить).

   2. ⚠ ВЛАСНОГО IntersectionObserver ТУТ БІЛЬШЕ НЕМАЄ. Поява секцій — це
      [data-reveal] + єдиний спостерігач AIA.motion. Два спостерігачі на
      сторінці — це другий, який нічого не знає про --motion і не гаситься ні
      пресетом data-motion="calm", ні класом html.rm (П-27).

   3. ⚠ ЖОДНОГО СКЛАДЕНОГО ТОКЕНА ТУТ НЕ ЧИТАЄТЬСЯ. Було 15 імен через T() з
      fallback-числами — рівно та конструкція, яку описує П-06: перейменував
      токен у CSS, забув у JS, і сторінка анімується старими зашитими числами,
      і це виглядає нормально. Тепер усі числа приходять із AIA.motion, який
      множить сирі --p-* на --motion сам. Через це prefers-reduced-motion,
      пресет data-motion і клас html.rm працюють однаково — і в CSS, і в GSAP.

   4. gsap.matchMedia() бачить ЛИШЕ системну настройку, тому першою умовою
      стоїть AIA.motion.on(), а не matchMedia (П-27).

   БЮДЖЕТ РУХУ (критерій приймання 17): рівно ОДИН ScrollTrigger на сторінку —
   заповнення осі. Безкінечних циклів нуль: термінал друкується один раз і
   зупиняється, каретки в нього немає.

   Частина Б (кнопка «копіювати» і розгортання довгого виводу) переїхала
   в js/ui.js 2026-09-04 — шукати там блок «ПОВЕДІНКА КОМПОНЕНТА ТЕРМІНАЛ».
   ========================================================================== */
(function (global) {
  "use strict";

  function motion() { return global.AIA && global.AIA.motion; }

  /* Чи вже відпрацював build(). Потрібен рівно для одного випадку: перший
     renderHeroTerminal() кидає cc:hero-rendered ще ДО cc:rendered, і без
     цього прапорця друк стартував би двічі — один раз зарано, другий раз
     із рестартом посеред першого. */
  var booted = false;

  /* --------------------------------------------------------------------------
     M10 · друк сесії. clip-path + steps(N), НУЛЬ записів у DOM.

     ⚠ П-37, і саме тут її видно найкраще. `.term__clip` — це горизонтальна
     штора через УВЕСЬ блок, тобто за один «крок» відкривається один символьний
     СТОВПЕЦЬ, а не один символ тексту. Дільник — НАЙДОВШИЙ РЯДОК, а не сума
     всіх: сесія hero має ~450 символів у 12 рядках, і на сумі штора тривала б
     14 секунд. Найдовший рядок — 46 символів → 46 / 32 cps ≈ 1,44 с.
     Формула живе в AIA.motion.play.typing() (виправлена в пакеті 010); тут
     лишається лише виклик, щоб дільник був один на весь сайт.
     -------------------------------------------------------------------------- */
  function typeHero() {
    var M = motion();
    var term = document.querySelector(".term--hero");
    if (!term || !M || !M.play || !M.play.typing) return;
    M.play.typing(term);
  }

  /* --------------------------------------------------------------------------
     M9 · «сторінка слухається руки». Вісь заповнюється зверху вниз рівно на
     стільки, на скільки прогорнуто. ease: "none" обовʼязковий — інакше
     положення лінії не збігається з положенням пальця.
     -------------------------------------------------------------------------- */
  function buildSpine() {
    var M = motion();
    var lit = document.querySelector(".cc-path__lit");
    var path = document.querySelector(".cc-path");
    var exam = document.getElementById("ccExam");
    if (!lit || !path || !global.gsap || !global.ScrollTrigger) return;
    var scrub = M ? M.scrub() : 0;
    /* Рух вимкнено — вісь просто намальована повністю, тригера не існує. */
    if (!scrub) { gsap.set(lit, { scaleY: 1 }); return; }
    gsap.to(lit, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: path,
        start: "top top+=25%",
        endTrigger: exam || path,
        end: "center center",
        scrub: scrub
      }
    });
  }

  function build() {
    var M = motion();
    var replay = document.getElementById("heroReplay");
    booted = true;

    /* Єдині ворота руху. AIA.motion.on() бачить і системну настройку, і
       --motion, і пресет data-motion, і html.rm — на відміну від matchMedia. */
    if (!M || !M.on()) {
      var lit = document.querySelector(".cc-path__lit");
      if (lit && global.gsap) gsap.set(lit, { scaleY: 1 });
      else if (lit) lit.style.transform = "scaleY(1)";
      /* Показувати «ще раз» нічого: сесія й так уся на екрані. */
      if (replay) replay.hidden = true;
      return;
    }

    if (replay) replay.hidden = false;

    if (global.gsap) {
      gsap.registerPlugin(ScrollTrigger, CustomEase);
      buildSpine();
    }

    /* Друк запускається, коли термінал реально видно. */
    var term = document.querySelector(".term--hero");
    if (!term) return;

    var played = false;
    function play() { if (played) return; played = true; typeHero(); }

    if ("IntersectionObserver" in global) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        play();
      }, { rootMargin: "0px 0px -8% 0px" });
      io.observe(term);
      /* ⚠ Страховка на середовище, яке не доставляє IO-колбеки (фонова
         вкладка, оклюзія, headless — у цьому проєкті ловилось уже чотири
         рази: 003 D-01, 005 Б-01, 009 IO, 010). Якщо термінал уже у
         вʼюпорті — друкуємо без спостерігача. */
      var r = term.getBoundingClientRect();
      if (r.width > 0 && r.top < (global.innerHeight || 0) && r.bottom > 0) {
        io.disconnect();
        play();
      }
    } else {
      play();
    }

    /* M14 · «показати ще раз». Друк можна перезапускати скільки завгодно:
       typing() сам знімає й повертає клас із примусовим reflow. */
    if (replay) replay.addEventListener("click", typeHero);
  }

  /* Рендер асинхронний (fetch конфіга), тому хореографія чекає на подію, а не
     на DOMContentLoaded: до приходу конфіга ні осі, ні тексту сесії ще немає.
     Порядок міняти не можна — cc-render.js кидає cc:rendered ПІСЛЯ того, як
     DOM готовий і AIA.motion.bind() відпрацював. */
  document.addEventListener("cc:rendered", build, { once: true });

  /* Перемикання широкий ⇄ вузький варіант сесії — це зміна ВМІСТУ <pre>,
     тобто нові кроки й нова тривалість штори. Друкуємо ще раз. */
  document.addEventListener("cc:hero-rendered", function () {
    var M = motion();
    if (booted && M && M.on()) typeHero();
  });
})(window);
