/* ============================================================================
   012 · js/jira-motion.js — ЖИВА ДОШКА HERO
   ----------------------------------------------------------------------------
   Хореографія живе в CSS (@keyframes у jira.css, §3). Цей файл робить рівно
   чотири речі, яких CSS не вміє:

     1. ВИМІРЮЄ зсуви між слотами дошки — ОДИН раз, не на кадр (§11.2 п.3);
     2. вмикає цикл, додаючи клас `.is-playing` ПІСЛЯ вимірювання;
     3. дає людині паузу (WCAG 2.2.2: усе, що рухається довше 5 с, мусить
        мати видимий спосіб це спинити);
     4. спиняє цикл, коли дошка поза екраном або вкладка прихована.

   ⚠ У ЦЬОМУ ФАЙЛІ НЕМАЄ ЖОДНОГО ЧИСЛА, ЯКОГО НЕМАЄ В ТОКЕНАХ, і він НЕ ЧИТАЄ
   складених токенів. getComputedStyle() для незареєстрованого custom property
   повертає невирахуваний рядок `calc(5200 * calc(1 * 1 * 1ms + 0.00002ms))`,
   parseFloat від нього = NaN, помічник тихо бере fallback — і рух лишається
   живим при prefers-reduced-motion, а на скріншоті цього не видно взагалі.
   Тому єдині ворота тут — `AIA.motion.on()`, який читає сире `--motion`.

   ⚠ СТАН СПОКОЮ = ФІНАЛЬНИЙ КАДР. Клас `.is-playing` у вихідному HTML
   ВІДСУТНІЙ — його ставить цей файл. Лабораторія агента №2 заміряла три
   способи на 31 видимому знаку: «ховає CSS» і «атрибут у HTML, JS його
   знімає» дають 0 знаків без JS, «спокій = фінальний кадр» дає 31.
   ========================================================================== */
(function (global) {
  "use strict";

  var hero = document.getElementById("jiraHero");
  if (!hero) return;

  var card   = hero.querySelector("[data-fly]");
  var ghosts = hero.querySelectorAll("[data-slot]");
  var cursor = hero.querySelector(".jira-cursor");
  var btn    = document.getElementById("heroPause");
  var M      = (global.AIA && global.AIA.motion) || null;

  /* ---------- 0. Вимірювання ----------------------------------------------
     offsetLeft / offsetTop, а НЕ getBoundingClientRect: вони дають РОЗКЛАДКОВУ
     позицію й не бачать transform. Інакше повторний замір під час циклу
     повернув би зсунуту картку й зсуви почали б накопичуватись.
     У картки й усіх слотів один offsetParent — .jira-hero__object. */
  function measure() {
    if (!card) return false;
    var h = card.offsetHeight;
    if (!h) return false;                      /* дошка ще не розкладена */
    hero.style.setProperty("--jira-card-h", h + "px");

    for (var i = 0; i < ghosts.length; i++) {
      var g = ghosts[i], n = g.getAttribute("data-slot");
      hero.style.setProperty("--jira-fly-x" + n, (g.offsetLeft - card.offsetLeft) + "px");
      hero.style.setProperty("--jira-fly-y" + n, (g.offsetTop  - card.offsetTop)  + "px");
    }
    if (cursor) {
      /* Курсор «бере» картку за її верхню третину — там, де людина й бере
         картку мишею. Числа — частки самої картки, не пікселі з голови. */
      hero.style.setProperty("--jira-cur-x", Math.round(card.offsetLeft + card.offsetWidth * 0.55) + "px");
      hero.style.setProperty("--jira-cur-y", Math.round(card.offsetTop + h * 0.3) + "px");
    }
    return true;
  }

  /* ---------- 1. Ворота циклу ---------------------------------------------
     Три незалежні причини спинити цикл, і вони не затирають одна одну:
       userPaused — людина натиснула кнопку;
       offscreen  — дошки немає на екрані;
       hidden     — вкладка прихована.
     Усі три пишуть ОДИН системний токен --loop-state, той самий, що читають
     CSS-цикли системи й пресет data-motion="calm". */
  var userPaused = false, offscreen = false;

  /* ⚠ ВИПРАВЛЕНО ВАЛІДАТОРОМ (D-01). Було:
         hero.style.setProperty("--loop-state", stop ? "paused" : "running");
     Інлайн-стиль на #jiraHero сильніший за будь-яке правило каскаду, тож
     рядок "running" ЗАТИРАВ системний пресет `[data-motion="calm"]`
     (`css/tokens.css` 707: --loop-state: paused). Заміряно власним Chrome:
     із data-motion="calm" від завантаження сторінки картка далі їздила
     по колу (transform ішов -231px → 0 → -231px). Це дефект D-11 задачі 010
     в новій формі: «цикл не чує пресета спокою».
     Стало: ворота пишуть ТІЛЬКИ "paused"; коли причини спиняти немає —
     властивість ЗНІМАЄТЬСЯ, і значення знову бере каскад. */
  function applyState() {
    var stop = userPaused || offscreen || document.hidden;
    if (stop) hero.style.setProperty("--loop-state", "paused");
    else hero.style.removeProperty("--loop-state");
    if (btn) {
      btn.setAttribute("aria-pressed", userPaused ? "true" : "false");
      var lbl = btn.querySelector("[data-pause-label]");
      if (lbl) lbl.textContent = userPaused ? btn.getAttribute("data-label-play")
                                            : btn.getAttribute("data-label-pause");
    }
  }

  /* ---------- 2. Старт ----------------------------------------------------- */
  function start() {
    if (!M || !M.on()) {
      /* reduce або немає системи руху — лишаємо фінальний кадр. Нічого не
         ховаємо й нічого не вмикаємо: кадр уже правильний. */
      if (btn) btn.hidden = true;
      return;
    }
    if (!measure()) { requestAnimationFrame(start); return; }
    hero.classList.add("is-playing");
    applyState();
  }

  /* Шрифти міняють висоту картки, а з нею — усі зсуви. Переміряти треба
     ПІСЛЯ їхнього приходу, інакше картка пролітає повз слот. */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); });

  var t = null;
  function remeasure() { clearTimeout(t); t = setTimeout(measure, 120); }
  global.addEventListener("resize", remeasure);
  global.addEventListener("orientationchange", remeasure);

  /* Пресет руху або щільність можуть перемкнутись за життя сторінки
     (перемикач макета, зміна системної настройки) — тоді ворота треба
     перечитати, бо `calm` і `reduce` — різні стани. */
  if (M && M.onPreset) M.onPreset(function () {
    if (!M.on()) { hero.classList.remove("is-playing"); if (btn) btn.hidden = true; return; }
    if (!hero.classList.contains("is-playing")) { if (btn) btn.hidden = false; start(); }
  });

  if (btn) btn.addEventListener("click", function () { userPaused = !userPaused; applyState(); });

  document.addEventListener("visibilitychange", function () {
    applyState();
    if (!document.hidden) measure();       /* у прихованій вкладці розкладка
                                              могла змінитись «наосліп» */
  });

  if ("IntersectionObserver" in global) {
    new IntersectionObserver(function (es) {
      offscreen = !es[0].isIntersecting;
      applyState();
    }, { threshold: 0 }).observe(hero);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  /* Для тестів: дозволяє переміряти й дізнатись стан без доступу до замикання. */
  global.AIA = global.AIA || {};
  global.AIA.heroBoard = {
    measure: measure,
    state: function () {
      return { playing: hero.classList.contains("is-playing"),
               loop: getComputedStyle(hero).getPropertyValue("--loop-state").trim(),
               userPaused: userPaused, offscreen: offscreen };
    }
  };
})(window);
