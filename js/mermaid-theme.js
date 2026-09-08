/* ============================================================================
   AIA DESIGN SYSTEM v1 · ТЕМА MERMAID З ТОКЕНІВ
   ----------------------------------------------------------------------------
   js/mermaid-init.js у проді тримає 13 власних хексів у themeVariables, з них
   ТРИ поза палітрою взагалі (#1B1916, #57504A, #171513) і один (#CFC9BF), який
   є в CSS, але не в tailwind.config. Тобто діаграми — четверта незалежна копія
   палітри проєкту.

   Тут жодного власного хекса немає: усі значення читаються з живих токенів
   через getComputedStyle. Змінюється токен — змінюються 248 діаграм.

   Д7 · Підміну живого js/mermaid-init.js робить задача 010: у js/ ця сесія
   не пише. Це готовий модуль системи, а не правка коду сайту.
   ========================================================================== */
(function (global) {
  "use strict";
  var root = document.documentElement;
  function t(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  function themeVariables() {
    return {
      darkMode: true,
      background:        t("--c-bg"),
      primaryColor:      t("--c-raised"),      /* заливка вузла */
      primaryTextColor:  t("--c-text"),
      primaryBorderColor:t("--c-line-strong"), /* межа вузла ідентифікує його → ≥3:1 */
      secondaryColor:    t("--c-surface"),
      tertiaryColor:     t("--c-sunken"),
      lineColor:         t("--c-line-strong"),
      textColor:         t("--c-text-2"),
      mainBkg:           t("--c-raised"),
      nodeBorder:        t("--c-line-strong"),
      clusterBkg:        t("--c-surface"),
      clusterBorder:     t("--c-line"),
      titleColor:        t("--c-text"),
      edgeLabelBackground: t("--c-bg"),
      fontFamily:        t("--f-sans"),
      fontSize:          t("--fs-ui"),
      /* Акцент курсу доїжджає й сюди: діаграма на сторінці AI Термінала
         підсвічується лазуром, на Академії — шафраном. Один атрибут
         data-course на <html> міняє все. */
      actorBkg:          t("--c-accent-quiet"),
      actorBorder:       t("--c-accent-edge"),
      actorTextColor:    t("--c-text"),
      noteBkgColor:      t("--c-accent-quiet"),
      noteBorderColor:   t("--c-accent-edge"),
      noteTextColor:     t("--c-text")
    };
  }

  function config() {
    return {
      startOnLoad: false,
      theme: "base",
      themeVariables: themeVariables(),
      /* Рух діаграм підпорядкований тим самим воротам, що й решта системи. */
      /* ⚠ 010 · КОЛО ФІКСІВ · D-05. useMaxWidth: false — рішення власника
         (варіанти «нижня межа масштабу» і «переверстати вісім найширших»
         відхилені). Було true (і це ще й дефолт Mermaid): Mermaid ставив
         SVG `width="100%"` + `style="max-width:<натуральна>px"`, тому широка
         діаграма НЕ скролила, а пропорційно зменшувалась разом із текстом.
         Заміряно на 100 діаграмах × 66 сторінок: на 320 px 83 зі 100 були
         дрібніші за 50 %, найгірша (claude-code-23#0, viewBox 2596)
         давала k = 0,095 — ефективний кегль 1,33 px. Скрол не спрацьовував
         ЖОДНОГО разу: scrollWidth − clientWidth = 0 у 200 із 200 замірів.
         З false Mermaid ставить width/height у натуральних px — підпис
         завжди 14 px (--fs-ui), а горизонтальний скрол бере на себе
         .ds-diag (overflow-x: auto, overscroll-behavior-x: contain).
         Ключ живе ОКРЕМО для кожного типу діаграми: на сайті реально
         вживаються flowchart-v2 (94) і sequence (6) — звірено за
         aria-roledescription кожного намальованого SVG. */
      flowchart: { curve: "basis", useMaxWidth: false },
      sequence: { useMaxWidth: false },
      securityLevel: "strict"
    };
  }

  global.AIA = global.AIA || {};
  global.AIA.mermaidTheme = { themeVariables: themeVariables, config: config };
})(window);
