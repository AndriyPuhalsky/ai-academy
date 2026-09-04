/* ============================================================
   AI Академія / AI Architect — ВИГЛЯД авторизації.

   Підключається як звичайний <script src="js/auth-ui.js"></script>
   ПЕРЕД <script type="module" src="js/auth.js">. Класичний скрипт без
   defer виконується до будь-якого модуля (вимога специфікації HTML),
   тому на момент старту js/auth.js обʼєкт window.AIAAuthUI уже існує.

   Тут живе ЛИШЕ вигляд: розмітка, класи, фокус, рух, стани.
   Нуль мережевих запитів, нуль звернень до бази, нуль знання про сесію.
   Дані приходять ззовні — через init({ handlers, certUrl }) і renderSlot().

   Джерело розмітки й поведінки — затверджений макет:
     dev/design/001-oauth-google/04-variants/shared/base.js  (варіант B)
   Стилі — css/custom.css, секція «001 — вхід через Google».

   Публічний інтерфейс — унизу файла (window.AIAAuthUI).
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
     0. Тексти. Свідомий виняток із правила config.json
        (поле 11 дизайн-брифа): тексти модалки лишаються в коді.
        Панель помилки OAuth — затверджена копірайтинг-частина
        дизайну, змінювати не можна.
     ========================================================== */

  var T = {
    titleLogin: "Вхід",
    titleRegister: "Реєстрація",
    tabLogin: "Вхід",
    tabRegister: "Реєстрація",
    submitLogin: "Увійти",
    submitRegister: "Зареєструватися",
    or: "або",
    close: "Закрити",

    // Офіційний рядок Google для локалі uk (data-text="continue_with").
    // Це НЕ наш переклад — це те, що віддає сам Google.
    google: "Продовжити з Google",
    googleAria: "Продовжити з Google",
    googleStatus: "Відкриваємо Google…",

    notes: {
      progress: "Щоб зберігати прогрес і отримати сертифікат, увійди або зареєструйся.",
      module: "Увійди, щоб проходити курс по черзі."
    },

    namePh: "Ім'я",
    nameLabel: "Ім'я та прізвище",
    passLabel: "Пароль",
    nameHint: "Це ім'я з'явиться у твоєму сертифікаті — вкажи його повністю.",
    emailPh: "Email",
    passPh: "Пароль (мін. 6 символів)",

    // Панель помилки після повернення від провайдера (прийом R03):
    // заголовок + причина + що робити, а не одне речення.
    err: {
      cancelled: {
        title: "Вхід через Google скасовано",
        why: "Ти закрив вікно Google або натиснув «Скасувати».",
        act: "Спробувати ще раз",
        alt: "або увійди поштою нижче"
      },
      open: {
        title: "Не вдалося відкрити Google",
        why: "Схоже, немає з'єднання або вікно заблокував браузер.",
        act: "Спробувати ще раз",
        alt: "або увійди поштою нижче"
      },
      conflict: {
        title: "На цю пошту вже є акаунт із паролем",
        why: "Це той самий акаунт — просто інший спосіб входу. Увійди паролем нижче.",
        act: "",
        alt: ""
      },
      other: {
        title: "Не вдалося увійти через Google",
        why: "Google не повернув причину помилки.",
        act: "Спробувати ще раз",
        alt: "або увійди поштою нижче"
      },
      timeout: {
        title: "Google не відповів",
        why: "Минуло 8 секунд, а вікно входу так і не відкрилось.",
        act: "Спробувати ще раз",
        alt: "або увійди поштою нижче"
      }
    },

    name: {
      title: "Ім'я для сертифіката",
      eyebrow: "Останній крок",
      descPermanent: "Це ім'я побачить кожен, хто відкриє твій сертифікат або перевірить його код.",
      descLast: "Це останній модуль курсу. Після нього ми випишемо сертифікат на це ім'я — змінити його потім не вийде.",
      srPrefix: "У сертифікаті буде надруковано: ",
      quiet: "цей сертифікат вручається",
      after: "за успішне завершення курсу",
      fallback: "Студент",
      fallbackWhy: "Поле порожнє — у PDF надрукується «Студент».",
      caption: "Саме так ім'я буде надруковано у PDF.",
      captionStrong: "Це не змінити після видачі сертифіката.",
      label: "Ім'я та прізвище",
      suspicious: "Схоже на автоматичне ім'я з Google — перевір його.",
      save: "Зберегти",
      saveAndFinish: "Зберегти й завершити модуль",
      confirm: "Так, усе вірно",
      edit: "Виправити ім'я",
      editSoft: "Змінити ім'я",
      cancel: "Скасувати"
    },

    sheet: {
      nameRow: "Ім'я для сертифіката",
      nameMeta: "змінити",
      certs: "Сертифікати",
      out: "Вийти",
      open: "Мій акаунт"
    },

    // Слот у шапці — рядки, що вже були на сайті (js/auth.js), збережені дослівно.
    slot: {
      login: "Увійти",
      certs: "Сертифікати",
      out: "Вийти",
      editName: "Змінити ім'я для сертифіката"
    },

    // Валідація форми переїхала з js/auth.js сюди (контракт 5.2).
    // Тексти збережені дослівно — поведінка сайту не змінюється.
    form: {
      emailEmpty: "Вкажи email.",
      emailBad: "Схоже, email введено некоректно.",
      passEmpty: "Вкажи пароль.",
      passShort: "Пароль має містити щонайменше 6 символів.",
      passLong: "Пароль задовгий (максимум 128 символів).",
      nameEmpty: "Вкажи ім'я — воно з'явиться у сертифікаті.",
      nameShort: "Ім'я надто коротке.",
      wait: "Зачекай…",
      checkMail: "Готово! Якщо прийшов лист — підтверди пошту, тоді увійди.",
      generic: "Щось пішло не так. Спробуй ще раз."
    }
  };

  /* ==========================================================
     1. Іконки — інлайнові SVG, нуль зовнішніх запитів
     ========================================================== */

  // Офіційний логотип Google. Стандартний кольоровий градієнт,
  // пропорції збережені, нічого не перефарбовано.
  var SVG_G =
    '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
      '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
      '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
      '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
    '</svg>';

  var SVG_CLOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">' +
      '<path d="M5 5l14 14M19 5L5 19"/></svg>';

  var SVG_ALERT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M12 3.6 2.6 20h18.8L12 3.6z"/><path d="M12 10v4"/><path d="M12 17.2v.1"/></svg>';

  /* ==========================================================
     2. Дрібні утиліти й межі вводу
     ========================================================== */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MAX_EMAIL = 254;
  var MIN_PASS = 6;
  var MAX_PASS = 128;
  var MIN_NAME = 2;
  var MAX_NAME = 100;

  var SKELETON_DELAY = 150;   // --delay-skeleton
  var CROSS_MS = 180;         // --dur-cross
  var OAUTH_TIMEOUT = 8000;   // --timeout-oauth
  var NAME_DEBOUNCE = 120;    // --debounce-name
  var CLOSE_FALLBACK = 400;   // страховка, якщо анімації немає

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initial(name) {
    var t = String(name || "").trim();
    return t ? t.charAt(0).toUpperCase() : "?";
  }

  // Та сама очистка імені, що була в js/auth.js: керівні символи й кутові
  // дужки геть, trim, не довше 100 символів.
  function sanitizeName(value) {
    return String(value == null ? "" : value)
      .replace(/[\u0000-\u001F\u007F<>]/g, "")
      .trim()
      .slice(0, MAX_NAME);
  }

  // Евристика «ім'я схоже на автоматичне» (§5.8 спеки). Перевірювана,
  // без вгадування: @ · одне слово · увесь нижній регістр · <4 символів.
  function looksAuto(name) {
    var v = String(name || "").trim();
    if (!v) return false;
    if (v.indexOf("@") > -1) return true;
    if (v.split(/\s+/).length < 2) return true;
    if (v === v.toLowerCase()) return true;
    if (v.length < 4) return true;
    return false;
  }

  function reducedMotion() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) { return false; }
  }

  function isNarrow() {
    return window.innerWidth < 640;
  }

  /* ==========================================================
     3. БІЛДЕРИ РОЗМІТКИ (порт макета, один рядок HTML кожен)
     ========================================================== */

  /**
   * Кнопка провайдера. theme: "light" | "dark".
   * Геометрія, кольори й паддінги — з guidelines Google.
   * Логотип не перефарбовується.
   */
  function buildProviderButton(id, theme, label) {
    return (
      '<button type="button" id="' + id + '" class="gbtn gbtn--' + theme + '">' +
        '<span class="gbtn__logo">' + SVG_G + "</span>" +
        '<span class="gbtn__label">' + esc(label) + "</span>" +
      "</button>"
    );
  }

  /**
   * Панель помилки після повернення від провайдера.
   * Іконка + заголовок + причина + що робити + кнопка дії.
   */
  function buildErrorPanel(kind) {
    var e = T.err[kind] || T.err.other;
    var act = e.act
      ? '<div class="aia-panel__do">' +
          '<button type="button" class="aia-panel__act" data-act="retry-google">' + esc(e.act) + "</button>" +
          (e.alt ? '<span class="aia-panel__alt">' + esc(e.alt) + "</span>" : "") +
        "</div>"
      : "";
    return (
      '<div class="aia-panel" id="aiaOauthPanel" role="alert">' +
        '<span class="aia-panel__icon">' + SVG_ALERT + "</span>" +
        "<div>" +
          '<p class="aia-panel__title">' + esc(e.title) + "</p>" +
          '<p class="aia-panel__why">' + esc(e.why) + "</p>" +
          act +
        "</div>" +
      "</div>"
    );
  }

  /**
   * Модалка входу. Порядок блоків — R01 (Cal.com): провайдер → «або» →
   * форма → повноширинний сабміт унизу. Соц-блок вище табів, тому
   * питання «показувати на обох табах» знімається структурно.
   */
  function buildModal(o) {
    o = o || {};
    var note = o.note || "";
    var tab = o.tab === "register" ? "register" : "login";
    var describedBy = note ? ' aria-describedby="aiaModalNote"' : "";

    return (
      '<div class="aia-scrim" id="aiaAuthModal">' +
        '<div class="aia-card" role="dialog" aria-modal="true" aria-labelledby="aiaModalTitle"' + describedBy + ' tabindex="-1">' +

          // смуга процесу (ефект 9), схована в спокої
          '<div class="aia-card__bar" id="aiaBar" hidden><span></span></div>' +

          '<div class="aia-head">' +
            '<h2 class="aia-title" id="aiaModalTitle">' + esc(tab === "register" ? T.titleRegister : T.titleLogin) + "</h2>" +
            '<button type="button" class="aia-close" id="aiaClose" aria-label="' + esc(T.close) + '">' + SVG_CLOSE + "</button>" +
          "</div>" +

          '<p class="aia-note" id="aiaModalNote"' + (note ? "" : " hidden") + ">" + esc(note) + "</p>" +

          '<div class="aia-social" id="aiaSocial">' +
            buildProviderButton("aiaGoogle", "light", T.google) +
          "</div>" +

          // статус очікування — ОКРЕМИЙ елемент; текст на кнопці
          // Google не змінюється ніколи
          '<p class="aia-status" id="aiaGoogleStatus" role="status" aria-live="polite" hidden>' +
            '<span class="aia-status__dot" aria-hidden="true"></span>' +
            "<span>" + esc(T.googleStatus) + "</span>" +
          "</p>" +

          '<div class="aia-dim" id="aiaEmailPath">' +
            '<div class="aia-or"><span>' + esc(T.or) + "</span></div>" +

            '<div id="aiaPanelSlot"></div>' +

            '<div class="aia-tabs" id="aiaTabs" data-tab="' + tab + '" role="tablist" aria-label="Спосіб входу поштою">' +
              '<span class="aia-tabs__pill" aria-hidden="true"></span>' +
              '<button type="button" role="tab" id="aiaTabLogin" data-tab="login" aria-selected="' + (tab === "login") + '" aria-controls="aiaForm" tabindex="' + (tab === "login" ? "0" : "-1") + '">' + esc(T.tabLogin) + "</button>" +
              '<button type="button" role="tab" id="aiaTabRegister" data-tab="register" aria-selected="' + (tab === "register") + '" aria-controls="aiaForm" tabindex="' + (tab === "register" ? "0" : "-1") + '">' + esc(T.tabRegister) + "</button>" +
            "</div>" +

            '<div class="aia-stack" id="aiaForm" role="tabpanel" aria-labelledby="aiaTab' + (tab === "register" ? "Register" : "Login") + '">' +
              '<div class="aia-collapse' + (tab === "register" ? " is-open" : "") + '" id="aiaNameWrap">' +
                "<div>" +
                  /* FIX-4 · поля отримали візуально приховані мітки: placeholder
                     зникає, щойно людина почала друкувати (WCAG 3.3.2). */
                  '<label class="sr-only" for="aiaName">' + esc(T.nameLabel) + "</label>" +
                  '<input id="aiaName" class="aia-input" type="text" placeholder="' + esc(T.namePh) + '" autocomplete="name" maxlength="100" aria-describedby="aiaNameHint" />' +
                  '<p class="aia-hint" id="aiaNameHint">' + esc(T.nameHint) + "</p>" +
                "</div>" +
              "</div>" +
              '<label class="sr-only" for="aiaEmail">' + esc(T.emailPh) + "</label>" +
              '<input id="aiaEmail" class="aia-input" type="email" placeholder="' + esc(T.emailPh) + '" autocomplete="email" inputmode="email" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="254" />' +
              '<label class="sr-only" for="aiaPass">' + esc(T.passLabel) + "</label>" +
              '<input id="aiaPass" class="aia-input" type="password" placeholder="' + esc(T.passPh) + '" autocomplete="' + (tab === "register" ? "new-password" : "current-password") + '" maxlength="128" />' +
              '<p class="aia-error" id="aiaError" role="alert" hidden></p>' +
              '<button type="button" class="aia-submit" id="aiaSubmit">' + esc(tab === "register" ? T.submitRegister : T.submitLogin) + "</button>" +
            "</div>" +
          "</div>" +

        "</div>" +
      "</div>"
    );
  }

  /**
   * Діалог «Ім'я для сертифіката».
   * ОДНА поверхня, ДВА входи:
   *   mode "permanent" — постійне редагування (з шапки / з аркуша);
   *   mode "last"      — гарантований дотик перед завершенням курсу;
   *   mode "soft"      — той самий дотик удруге, без режиму редагування.
   */
  function buildNameDialog(o) {
    o = o || {};
    var mode = o.mode || "permanent";
    var value = o.value || "";
    var editing = mode === "permanent" || o.editing === true;
    var suspicious = mode !== "permanent" && looksAuto(value);
    var shown = value.trim() || T.name.fallback;

    var head =
      '<div class="aia-head">' +
        "<div>" +
          (mode === "permanent" ? "" : '<p class="aia-eyebrow">' + esc(T.name.eyebrow) + "</p>") +
          '<h2 class="aia-title" id="aiaNameTitle">' + esc(T.name.title) + "</h2>" +
        "</div>" +
        (mode === "permanent"
          ? '<button type="button" class="aia-close" id="aiaNameClose" aria-label="' + esc(T.close) + '">' + SVG_CLOSE + "</button>"
          : "") +
      "</div>";

    var desc =
      '<p class="aia-note" id="aiaNameDesc">' +
        esc(mode === "permanent" ? T.name.descPermanent : T.name.descLast) +
      "</p>";

    var warn = suspicious
      ? '<p class="paper-warn">' + SVG_ALERT + "<span>" + esc(T.name.suspicious) + "</span></p>"
      : "";

    // СМУЖКА ПАПЕРУ — буквальний фрагмент того, що зробить js/certificate.js:
    // ті самі кольори, та сама Literata, той самий порядок рядків.
    var paper =
      '<div class="paper" id="aiaPaper">' +
        '<p class="paper__quiet" aria-hidden="true">' + esc(T.name.quiet) + "</p>" +
        '<p class="paper__name"><span class="sr-only">' + esc(T.name.srPrefix) + "</span>" +
          '<span id="aiaPaperName">' + esc(shown) + "</span></p>" +
        '<div class="paper__rule" aria-hidden="true"></div>' +
        '<p class="paper__after" aria-hidden="true">' + esc(T.name.after) + "</p>" +
      "</div>";

    var caption =
      '<p class="aia-warnline" id="aiaPaperCaption">' +
        (value.trim() ? "" : esc(T.name.fallbackWhy) + " ") +
        esc(T.name.caption) + " <b>" + esc(T.name.captionStrong) + "</b>" +
      "</p>";

    var field = editing
      ? '<div style="margin-top:var(--s-4)">' +
          '<label class="aia-label" for="aiaNameInput">' + esc(T.name.label) + "</label>" +
          '<input id="aiaNameInput" class="aia-input" type="text" maxlength="100" autocomplete="name" value="' + esc(value) + '" />' +
        "</div>"
      : "";

    // Місце під повідомлення про невдале збереження (порожнє, поки все добре).
    var errline = '<p class="aia-error" id="aiaNameError" role="alert" hidden></p>';

    var actions;
    if (mode === "permanent") {
      actions =
        '<div class="aia-actions aia-actions--row">' +
          '<button type="button" class="aia-submit" data-act="save">' + esc(T.name.save) + "</button>" +
          '<button type="button" class="aia-text-btn" data-act="cancel">' + esc(T.name.cancel) + "</button>" +
        "</div>";
    } else if (editing) {
      actions =
        '<div class="aia-actions aia-actions--row">' +
          '<button type="button" class="aia-submit" data-act="save-finish">' + esc(T.name.saveAndFinish) + "</button>" +
          '<button type="button" class="aia-text-btn" data-act="cancel">' + esc(T.name.cancel) + "</button>" +
        "</div>";
    } else {
      actions =
        '<div class="aia-actions aia-actions--row">' +
          '<button type="button" class="aia-submit" data-act="confirm">' + esc(T.name.confirm) + "</button>" +
          '<button type="button" class="aia-text-btn" data-act="edit">' +
            esc(mode === "soft" ? T.name.editSoft : T.name.edit) + "</button>" +
        "</div>";
    }

    return (
      '<div class="aia-scrim" id="aiaNameModal" data-mode="' + mode + '">' +
        '<div class="aia-card aia-card--paper" role="dialog" aria-modal="true" aria-labelledby="aiaNameTitle" aria-describedby="aiaNameDesc" tabindex="-1">' +
          head + desc + warn + paper + caption + field + errline + actions +
        "</div>" +
      "</div>"
    );
  }

  /**
   * Мобільний аркуш акаунта. Рівно три рядки — межа обсягу.
   * Рядок «ім'я» нічого не редагує сам: відкриває той самий діалог,
   * що й на десктопі.
   */
  function buildAccountSheet(o) {
    o = o || {};
    var name = o.name || T.name.fallback;
    var mail = o.email || "";
    var certs = o.certUrl || "#";
    return (
      '<div class="aia-scrim is-sheet" id="aiaSheet">' +
        '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="aiaSheetWho" tabindex="-1">' +
          '<div class="sheet__who">' +
            '<span class="sheet__avatar" aria-hidden="true">' + esc(initial(name)) + "</span>" +
            '<div class="sheet__names">' +
              '<p class="sheet__name" id="aiaSheetWho">' + esc(name) + "</p>" +
              (mail ? '<p class="sheet__mail">' + esc(mail) + "</p>" : "") +
            "</div>" +
          "</div>" +
          '<button type="button" class="sheet__row" data-act="name">' +
            "<span>" + esc(T.sheet.nameRow) + '</span><span class="meta">' + esc(T.sheet.nameMeta) + "</span>" +
          "</button>" +
          '<a class="sheet__row" href="' + esc(certs) + '" data-act="certs"><span>' + esc(T.sheet.certs) + "</span><span class=\"meta\">↗</span></a>" +
          '<button type="button" class="sheet__row sheet__row--out" data-act="out">' + esc(T.sheet.out) + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  /* ==========================================================
     4. ПОВЕДІНКА: стек діалогів, фокус, Escape
        Один слухач на document — не плодимо новий на кожен діалог
        (наявна вада старого js/auth.js).
     ========================================================== */

  var stack = [];   // [{ el, opener, onClose, dismissible }]

  /* ---------- Задача 004 п.4 · блокування прокрутки фону ----------
     Лічильник живе в атрибуті <html>, а не в замиканні: модалку
     «Написати нам» відкриває інший файл (js/contact.js), і два
     незалежні лічильники знімали б блокування один одному.
     Стилі — html.aia-scroll-lock у css/custom.css. */
  function lockScroll() {
    var root = document.documentElement;
    var n = (parseInt(root.getAttribute("data-aia-lock"), 10) || 0) + 1;
    root.setAttribute("data-aia-lock", String(n));
    if (n > 1) return;
    var sbw = window.innerWidth - root.clientWidth;
    root.style.setProperty("--aia-sbw", (sbw > 0 ? sbw : 0) + "px");
    root.classList.add("aia-scroll-lock");
  }
  function unlockScroll() {
    var root = document.documentElement;
    var n = (parseInt(root.getAttribute("data-aia-lock"), 10) || 0) - 1;
    if (n > 0) { root.setAttribute("data-aia-lock", String(n)); return; }
    root.removeAttribute("data-aia-lock");
    root.classList.remove("aia-scroll-lock");
    root.style.removeProperty("--aia-sbw");
  }

  /* FIX-12 · список фокусовних має збігатися з тим, куди браузер справді
     пускає Tab: без inert-піддерев і без visibility:hidden. Інакше під час
     «Відкриваємо Google…» Tab виносив фокус за межі картки. */
  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (el) {
        if (el.closest("[inert]")) return false;
        // Свідомо БЕЗ opacityProperty: під час 180-мс появи картки її
        // computed opacity ще 0, і список став би порожнім на перші кадри.
        if (el.checkVisibility) {
          return el.checkVisibility({ visibilityProperty: true });
        }
        return el.offsetParent !== null || el === document.activeElement;
      }
    );
  }

  function trap(e) {
    if (e.key !== "Tab" || !stack.length) return;
    var card = stack[stack.length - 1].el.firstElementChild;
    var list = focusables(card);
    if (!list.length) { e.preventDefault(); card.focus(); return; }
    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === card)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && stack.length) {
      e.stopPropagation();
      closeTop("escape");   // Escape закриває ТІЛЬКИ верхній діалог
      return;
    }
    trap(e);
  });

  function openDialog(html, opts) {
    opts = opts || {};
    var host = opts.host || document.body;

    // нижній діалог на час життя верхнього стає недосяжним
    if (stack.length) {
      var below = stack[stack.length - 1].el;
      below.setAttribute("inert", "");
      below.setAttribute("aria-hidden", "true");
    }

    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    var el = wrap.firstElementChild;
    host.appendChild(el);

    var entry = {
      el: el,
      opener: opts.opener || document.activeElement,
      onClose: opts.onClose || null,
      dismissible: opts.dismissible !== false   // дотик перед видачею: підложка не закриває
    };
    stack.push(entry);
    lockScroll();

    // Фокус на КОНТЕЙНЕР картки, не в email і не на кнопку Google:
    // скрін-рідер читає назву діалогу, клавіатура не відправляє
    // випадковим Enter на редірект, на мобілці не вискакує клавіатура.
    var card = el.firstElementChild;
    card.focus();

    el.addEventListener("mousedown", function (ev) {
      if (ev.target === el && entry.dismissible) closeTop("scrim");
    });

    return el;
  }

  function closeTop(reason) {
    if (!stack.length) return;
    var entry = stack.pop();
    var el = entry.el;

    el.classList.add("is-leaving");
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      /* 004 п.4 · знімаємо блокування тільки коли підложки вже немає на
         екрані, інакше фон почав би їхати під видимою модалкою. */
      unlockScroll();
      if (el.parentNode) el.parentNode.removeChild(el);
      if (stack.length) {
        var below = stack[stack.length - 1].el;
        below.removeAttribute("inert");
        below.removeAttribute("aria-hidden");
        below.firstElementChild.focus();
      } else {
        // Повернення фокуса на елемент-ініціатор. Якщо його вже
        // немає в DOM — на заголовок сторінки.
        var back = entry.opener;
        if (back && back !== document.body && document.contains(back)) back.focus();
        else {
          var h1 = document.querySelector("h1");
          if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus(); }
        }
      }
      if (entry.onClose) entry.onClose(reason);
    }
    el.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, CLOSE_FALLBACK);   // страховка, якщо анімації немає
  }

  function closeEl(el, reason) {
    // закриваємо конкретний діалог, навіть якщо він не верхній
    var idx = -1;
    for (var i = 0; i < stack.length; i++) if (stack[i].el === el) idx = i;
    if (idx === -1) return;
    while (stack.length > idx) closeTop(reason);
  }

  /* ==========================================================
     5. Модалка входу: підключення поведінки
     ========================================================== */

  var handlers = {};
  var certUrl = "certificate.html";
  var userId = null;
  var authEl = null;         // відкрита модалка входу, якщо є
  var oauthTimer = null;

  function callHandler(name, arg) {
    var fn = handlers && handlers[name];
    if (typeof fn !== "function") {
      console.warn("[AIA auth-ui] немає обробника " + name + " — чекаю на js/auth.js");
      return Promise.reject(new Error("no handler: " + name));
    }
    try { return Promise.resolve(fn(arg)); }
    catch (e) { return Promise.reject(e); }
  }

  function wireModal(el) {
    var card = el.firstElementChild;
    var q = function (s) { return el.querySelector(s); };

    q("#aiaClose").addEventListener("click", function () { closeEl(el, "close"); });

    // --- Таби: APG (стрілки + roving tabindex) ---
    var tabs = q("#aiaTabs");
    var tabBtns = tabs.querySelectorAll('[role="tab"]');
    function setTab(t) {
      tabs.setAttribute("data-tab", t);
      Array.prototype.forEach.call(tabBtns, function (b) {
        var on = b.getAttribute("data-tab") === t;
        b.setAttribute("aria-selected", String(on));
        b.setAttribute("tabindex", on ? "0" : "-1");
      });
      q("#aiaModalTitle").textContent = t === "register" ? T.titleRegister : T.titleLogin;
      q("#aiaSubmit").textContent = t === "register" ? T.submitRegister : T.submitLogin;
      q("#aiaNameWrap").classList.toggle("is-open", t === "register");
      q("#aiaPass").setAttribute("autocomplete", t === "register" ? "new-password" : "current-password");
      q("#aiaForm").setAttribute("aria-labelledby", t === "register" ? "aiaTabRegister" : "aiaTabLogin");
      hideInlineError();
    }
    Array.prototype.forEach.call(tabBtns, function (b, i) {
      b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var next = tabBtns[(i + (e.key === "ArrowRight" ? 1 : tabBtns.length - 1)) % tabBtns.length];
        setTab(next.getAttribute("data-tab"));
        next.focus();
      });
    });
    el.__setTab = setTab;

    function hideInlineError() {
      var e = q("#aiaError");
      e.textContent = ""; e.hidden = true;
    }
    function showInlineError(text) {
      var e = q("#aiaError");
      e.textContent = text;
      e.hidden = false;
    }
    el.__showError = showInlineError;
    el.__hideError = hideInlineError;

    // --- Очікування редіректу ---
    var gbtn = q("#aiaGoogle");
    function startWaiting(silent) {
      if (gbtn.disabled) return;               // подвійний клік ігнорується
      gbtn.disabled = true;
      gbtn.setAttribute("aria-busy", "true");
      card.classList.add("is-busy");
      // FIX-5 · pointer-events блокує тільки мишу. Без inert приглушена
      // форма лишалась повністю прохідною табом, а #aiaSubmit — активним.
      q("#aiaEmailPath").setAttribute("inert", "");
      q("#aiaSubmit").disabled = true;
      q("#aiaBar").hidden = false;
      q("#aiaGoogleStatus").hidden = false;
      hideInlineError();
      var panel = q("#aiaOauthPanel");
      if (panel) panel.remove();

      clearTimeout(oauthTimer);
      oauthTimer = setTimeout(function () { stopWaiting("timeout"); }, OAUTH_TIMEOUT);

      if (silent === true) return;             // сценарій «показати стан», без запиту
      callHandler("signInWithGoogle").then(function (res) {
        // Успіх = браузер іде на Google. Стан очікування лишаємо як є:
        // його зніме або навігація, або таймаут 8 с.
        if (res && res.ok === false) stopWaiting(res.panel || "open");
      }, function (e) {
        console.error("[AIA auth-ui] signInWithGoogle:", e);
        stopWaiting("open");
      });
    }
    function stopWaiting(kind) {
      clearTimeout(oauthTimer);
      gbtn.disabled = false;
      gbtn.removeAttribute("aria-busy");
      card.classList.remove("is-busy");
      q("#aiaEmailPath").removeAttribute("inert");   // FIX-5
      q("#aiaSubmit").disabled = false;
      q("#aiaBar").hidden = true;
      q("#aiaGoogleStatus").hidden = true;
      if (kind) showPanel(el, kind);
    }
    gbtn.addEventListener("click", function () { startWaiting(); });
    el.__startWaiting = startWaiting;
    el.__stopWaiting = stopWaiting;

    // Кнопка «Спробувати ще раз» усередині панелі помилки
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act='retry-google']");
      if (b) startWaiting();
    });

    // --- Форма email ---
    q("#aiaSubmit").addEventListener("click", function () { submitForm(el); });
    ["#aiaName", "#aiaEmail", "#aiaPass"].forEach(function (sel) {
      q(sel).addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); submitForm(el); }
      });
    });
  }

  function submitForm(el) {
    var q = function (s) { return el.querySelector(s); };
    var btn = q("#aiaSubmit");
    if (btn.disabled) return;                 // подвійний клік / подвійний Enter
    el.__hideError();

    var tab = q("#aiaTabs").getAttribute("data-tab");
    var email = q("#aiaEmail").value.trim().slice(0, MAX_EMAIL);
    var pass = q("#aiaPass").value;           // пароль НЕ обрізаємо
    var name = sanitizeName(q("#aiaName").value);

    if (!email) { el.__showError(T.form.emailEmpty); return; }
    if (!EMAIL_RE.test(email)) { el.__showError(T.form.emailBad); return; }
    if (!pass) { el.__showError(T.form.passEmpty); return; }
    if (pass.length < MIN_PASS) { el.__showError(T.form.passShort); return; }
    if (pass.length > MAX_PASS) { el.__showError(T.form.passLong); return; }
    if (tab === "register") {
      if (!name) { el.__showError(T.form.nameEmpty); return; }
      if (name.length < MIN_NAME) { el.__showError(T.form.nameShort); return; }
    }

    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = T.form.wait;

    var done = function () { btn.disabled = false; btn.textContent = original; };

    callHandler(
      tab === "register" ? "signUp" : "signInWithPassword",
      tab === "register" ? { email: email, password: pass, name: name }
                         : { email: email, password: pass }
    ).then(function (res) {
      res = res || {};
      if (res.ok) {
        // Із сесією бекендер сам робить location.reload() — UI мовчить.
        if (tab === "register" && res.session === false) {
          el.__showError(T.form.checkMail);
          el.__setTab("login");
        }
        done();
        return;
      }
      el.__showError(res.message || T.form.generic);
      done();
    }, function (e) {
      console.error("[AIA auth-ui] submit:", e);
      el.__showError(T.form.generic);
      done();
    });
  }

  function showPanel(el, kind) {
    var slot = el.querySelector("#aiaPanelSlot");
    if (!slot) return;
    slot.innerHTML = buildErrorPanel(kind);
    if (kind === "conflict") {
      // Пошту користувача з URL ми не знаємо й не вигадуємо:
      // просто перемикаємо на «Вхід» і ставимо фокус у пароль.
      el.__setTab("login");
      setTimeout(function () {
        var p = el.querySelector("#aiaPass");
        if (p) p.focus();
      }, 0);
    }
  }

  /* ==========================================================
     6. Діалог «Ім'я для сертифіката»
     ========================================================== */

  var NAME_FLAG = "aia:nameConfirmed:";

  function wasNameConfirmed(id) {
    try {
      return !!localStorage.getItem(NAME_FLAG + (id || userId || "unknown"));
    } catch (e) { return false; }   // приватний режим → показуємо повний діалог
  }

  function markNameConfirmed(id) {
    try {
      localStorage.setItem(NAME_FLAG + (id || userId || "unknown"), "1");
    } catch (e) { /* приватний режим — просто не памʼятаємо */ }
  }

  function showNameError(text) {
    var top = stack.length ? stack[stack.length - 1].el : null;
    if (!top) return;
    var e = top.querySelector("#aiaNameError");
    if (!e) return;
    e.textContent = text || T.form.generic;
    e.hidden = false;
  }

  function hideNameError(el) {
    var e = el.querySelector("#aiaNameError");
    if (e) { e.textContent = ""; e.hidden = true; }
  }

  /**
   * Єдина поверхня редагування імені. Нічого не зберігає сама:
   * повертає Promise<{ action, name }>.
   *
   * o.onSave(name) — НЕОБОВʼЯЗКОВИЙ: якщо переданий, UI викликає його,
   * поки діалог ще відкритий, і при { ok:false } лишає діалог на місці
   * з текстом помилки (критерій приймання 18). Без нього діалог просто
   * закривається й резолвиться — зберігати має той, хто викликав.
   */
  function openNameDialog(o) {
    o = o || {};
    if (o.userId) userId = o.userId;

    var mode = o.mode;
    if (mode !== "permanent" && mode !== "last" && mode !== "soft") {
      // "auto" (або нічого) — вирішуємо за прапорцем localStorage
      mode = wasNameConfirmed(o.userId) ? "soft" : "last";
    }
    var value = o.value == null ? "" : String(o.value);

    return new Promise(function (resolve) {
      var settled = false;

      var el = openDialog(buildNameDialog({ mode: mode, value: value }), {
        opener: o.opener,
        dismissible: mode === "permanent",   // дотик перед видачею: підложка не закриває
        onClose: function () {
          // Escape / «Скасувати» / ✕ = скасувати. На сервер нічого не йде.
          if (!settled) { settled = true; resolve({ action: "cancelled", name: value }); }
        }
      });

      // o.error — повідомлення від попередньої невдалої спроби збереження:
      // діалог відкривається одразу з ним (шлях «закрити → зберегти → відкрити
      // знову», яким користується js/auth.js).
      if (o.error) {
        var e0 = el.querySelector("#aiaNameError");
        if (e0) { e0.textContent = o.error; e0.hidden = false; }
      }

      wireNameDialog(el, mode, value, o, function (action, name, savedHere) {
        if (settled) return;
        settled = true;
        // Прапорець ставимо ЛИШЕ коли самі бачили успішне збереження.
        // Інакше це робить той, хто зберігає (js/auth.js), — інакше ми
        // послабили б діалог після невдалого запису.
        if (savedHere) markNameConfirmed(o.userId);
        closeEl(el, "done");
        resolve({ action: action, name: name });
      });
    });
  }

  function wireNameDialog(el, mode, value, o, finish) {
    var q = function (s) { return el.querySelector(s); };

    var closeBtn = q("#aiaNameClose");
    if (closeBtn) closeBtn.addEventListener("click", function () { closeEl(el, "close"); });

    var input = q("#aiaNameInput");
    if (input) {
      var t = null;
      input.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(function () {
          var v = input.value.trim();
          q("#aiaPaperName").textContent = v || T.name.fallback;
          var cap = q("#aiaPaperCaption");
          cap.innerHTML = (v ? "" : esc(T.name.fallbackWhy) + " ") +
            esc(T.name.caption) + " <b>" + esc(T.name.captionStrong) + "</b>";
        }, NAME_DEBOUNCE);
      });
    }

    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b || b.disabled) return;
      var act = b.getAttribute("data-act");

      if (act === "cancel") { closeEl(el, "cancel"); return; }

      if (act === "edit") {
        // той самий діалог перемикається в режим редагування
        var card = el.firstElementChild;
        var wrap = document.createElement("div");
        wrap.innerHTML = buildNameDialog({ mode: mode, value: value, editing: true });
        el.replaceChild(wrap.firstElementChild.firstElementChild, card);
        wireNameDialog(el, mode, value, o, finish);
        el.firstElementChild.focus();
        var i = el.querySelector("#aiaNameInput");
        if (i) { i.focus(); i.select(); }
        return;
      }

      if (act === "save" || act === "save-finish" || act === "confirm") {
        var field = el.querySelector("#aiaNameInput");
        var clean = field ? sanitizeName(field.value) : sanitizeName(value);
        var action = act === "confirm" ? "confirmed" : "saved";

        if (typeof o.onSave !== "function") { finish(action, clean, false); return; }

        // Зберігаємо, поки діалог ще відкритий: якщо впаде — лишаємось тут.
        hideNameError(el);
        var buttons = el.querySelectorAll("[data-act]");
        var label = b.textContent;
        Array.prototype.forEach.call(buttons, function (x) { x.disabled = true; });
        b.textContent = T.form.wait;

        var release = function () {
          Array.prototype.forEach.call(buttons, function (x) { x.disabled = false; });
          b.textContent = label;
        };

        Promise.resolve(o.onSave(clean)).then(function (res) {
          res = res || {};
          if (res.ok) { finish(action, res.name || clean, true); return; }
          release();
          showNameError(res.message || T.form.generic);
        }, function (err) {
          console.error("[AIA auth-ui] onSave:", err);
          release();
          showNameError(T.form.generic);
        });
      }
    });
  }

  /* ==========================================================
     7. Мобільний аркуш акаунта
     ========================================================== */

  function openAccountSheet(o) {
    o = o || {};
    var el = openDialog(
      buildAccountSheet({ name: o.name, email: o.email, certUrl: certUrl }),
      { opener: o.opener }
    );
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "name") {
        // НЕ редагуємо тут: відкриваємо той самий діалог, що й на десктопі
        editNameFrom(b, o.name);
        return;
      }
      if (act === "out") { closeEl(el, "act"); doSignOut(); return; }
      if (act === "certs") { closeEl(el, "act"); return; }   // посилання спрацює саме
    });
    return el;
  }

  /* ==========================================================
     8. Слот авторизації в шапці + скелетон
        Слот існує в HTML з першого кадру (min-height 34px) → CLS = 0.
     ========================================================== */

  var slotHandled = false;   // renderSlot уже викликали ззовні
  var slotState = null;

  function guessLoggedIn() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) return true;
      }
    } catch (e) { /* приватний режим — вважаємо гостем */ }
    return false;   // ключа немає → гість (частіший випадок)
  }

  /* --- FIX-1 (дефект D-1): ширина скелетона = ширина майбутнього контрола ---
     Плитка імені в макеті — 100px «на око», а ім'я в кожного своє, тому
     підміна розсувала шапку (QA: група 439 → 468 px, внесок CLS 0.00054).
     Порахувати ширину тексту наперед не можна — її знає тільки браузер і
     тільки після рендера. Тому міряємо реальний слот один раз і кладемо
     число в localStorage: наступне завантаження ставить плитці рівно ту
     ширину, якої слоту забракне. Ключ у localStorage вже і так є (без
     сесії залогінений скелетон не показується взагалі), тож кеш існує
     завжди, окрім найпершого рендера після цього деплою. */
  var SLOT_W_KEY = "aia:slotW";

  function cachedSlotWidth() {
    try {
      var v = parseFloat(localStorage.getItem(SLOT_W_KEY));
      // Верхня межа: max-width імені 12rem + дві плитки + два gap = 392px.
      return (isFinite(v) && v > 200 && v <= 392) ? v : 0;
    } catch (e) { return 0; }   // приватний режим — просто без кеша
  }

  function rememberSlotWidth(slot) {
    if (!slot || isNarrow()) return;   // <640px скелетон і контрол — той самий кружечок
    var save = function () {
      try {
        if (isNarrow()) return;
        var w = slot.getBoundingClientRect().width;
        if (w > 200) localStorage.setItem(SLOT_W_KEY, String(Math.round(w * 100) / 100));
      } catch (e) { /* приватний режим або зникла нода — не наша біда */ }
    };
    // Міряти до завантаження шрифту не можна: моноширинний фолбек дасть
    // іншу ширину, і кеш зафіксує хибне число.
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
      document.fonts.ready.then(save, save);
    } else {
      save();
    }
  }

  function skeletonHtml(isUser, narrow) {
    if (!isUser) return '<span class="sk sk--guest" aria-hidden="true"></span>';
    if (narrow) return '<span class="sk sk--avatar" aria-hidden="true"></span>';
    // FIX-10 · скелетон повторює СТРУКТУРУ контрола, а не одну плиту:
    // ширина імені в цей момент ще нікому не відома.
    // FIX-1 · але сумарна ширина — відома з попереднього візиту. Плитці
    // імені лишається різниця; сусідні дві й обидва gap беремо з токенів,
    // щоб число не роз'їхалось із CSS, якщо токен колись зміниться.
    var w = cachedSlotWidth();
    var nameStyle = w
      ? ' style="--sk-name-w: calc(' + w + 'px - var(--sk-certs-w) - var(--sk-out-w) - var(--s-3) * 2)"'
      : "";
    return '<span class="sk-row" aria-hidden="true">' +
             '<span class="sk sk--name"' + nameStyle + "></span>" +
             '<span class="sk sk--certs"></span>' +
             '<span class="sk sk--out"></span>' +
           "</span>";
  }

  function slotEl() { return document.getElementById("aiaAuth"); }

  function startSkeleton() {
    var slot = slotEl();
    if (!slot || slotHandled || slot.firstElementChild) return;
    slot.innerHTML = skeletonHtml(guessLoggedIn(), isNarrow());
  }

  function doSignOut() {
    callHandler("signOut").then(null, function (e) {
      console.error("[AIA auth-ui] signOut:", e);
    });
  }

  function editNameFrom(opener, name) {
    openNameDialog({
      mode: "permanent",
      value: name || (slotState && slotState.name) || "",
      opener: opener,
      onSave: function (clean) { return callHandler("saveName", clean); }
    }).then(function (res) {
      if (res.action === "cancelled") return;
      // Оновлюємо шапку одразу: бекендер може перемалювати ще раз — це не заважає.
      if (slotState) {
        slotState.name = res.name;
        renderSlot(slotState);
      }
    });
  }

  function swapSlot(slot, html, after) {
    var sk = slot.querySelector(".sk, .sk-row");
    var ms = reducedMotion() ? 0 : CROSS_MS;
    if (sk && ms) {
      Array.prototype.forEach.call(slot.querySelectorAll(".sk"), function (n) {
        n.classList.add("is-leaving");
      });
      setTimeout(function () { slot.innerHTML = html; after(); }, ms);
    } else {
      slot.innerHTML = html;
      after();
    }
  }

  function renderSlot(o) {
    o = o || {};
    slotHandled = true;
    slotState = o;
    if (o.userId) userId = o.userId;

    var slot = slotEl();
    if (!slot) return;

    if (o.status === "user") {
      var name = o.name || o.email || T.name.fallback;
      var editable = o.name || "";
      var html =
        '<div class="slot__real" style="display:contents">' +
          '<button type="button" class="slot__name" id="aiaNameBtn" aria-label="' + esc(T.slot.editName) + '" title="' + esc(name) + '">' + esc(name) + "</button>" +
          '<a class="slot__link" href="' + esc(certUrl) + '">' + esc(T.slot.certs) + "</a>" +
          '<button type="button" class="slot__out" id="aiaLogout">' + esc(T.slot.out) + "</button>" +
          '<button type="button" class="slot__avatar" id="aiaAvatar" aria-label="' + esc(T.sheet.open) + '" aria-haspopup="dialog">' + esc(initial(name)) + "</button>" +
        "</div>";

      swapSlot(slot, html, function () {
        rememberSlotWidth(slot);   // FIX-1 · замір для скелетона наступного завантаження
        var nb = document.getElementById("aiaNameBtn");
        if (nb) nb.addEventListener("click", function () { editNameFrom(nb, editable); });
        var out = document.getElementById("aiaLogout");
        if (out) out.addEventListener("click", doSignOut);
        var av = document.getElementById("aiaAvatar");
        if (av) av.addEventListener("click", function () {
          openAccountSheet({ name: name, email: o.email, opener: av });
        });
      });
      return;
    }

    swapSlot(slot,
      '<button type="button" class="slot__login slot__real" id="aiaLogin">' + esc(T.slot.login) + "</button>",
      function () {
        var b = document.getElementById("aiaLogin");
        if (b) b.addEventListener("click", function () { openAuthModal({ opener: b }); });
      });
  }

  /* ==========================================================
     9. Публічні входи в модалку
     ========================================================== */

  function openAuthModal(o) {
    o = o || {};

    // Якщо модалка вже відкрита — не громадимо другу, а оновлюємо наявну.
    if (authEl && document.contains(authEl)) {
      if (o.tab) authEl.__setTab(o.tab);
      if (o.note) {
        var n = authEl.querySelector("#aiaModalNote");
        n.textContent = o.note; n.hidden = false;
        authEl.firstElementChild.setAttribute("aria-describedby", "aiaModalNote");
      }
      if (o.panel) showPanel(authEl, o.panel);
      authEl.firstElementChild.focus();
      return authEl;
    }

    var el = openDialog(buildModal({ note: o.note, tab: o.tab }), {
      opener: o.opener || document.getElementById("aiaLogin"),
      onClose: function () { authEl = null; }
    });
    authEl = el;
    wireModal(el);
    if (o.panel) showPanel(el, o.panel);
    if (o.waiting) el.__startWaiting(true);
    return el;
  }

  function closeAuthModal() {
    if (authEl && document.contains(authEl)) closeEl(authEl, "api");
    authEl = null;
  }

  function showFormError(text) {
    if (authEl && authEl.__showError) authEl.__showError(text || T.form.generic);
  }

  function hideFormError() {
    if (authEl && authEl.__hideError) authEl.__hideError();
  }

  function showOAuthPanel(kind) {
    if (!authEl || !document.contains(authEl)) openAuthModal({ panel: kind });
    else showPanel(authEl, kind);
  }

  /* ==========================================================
     10. Старт: скелетон сам по собі, не чекаючи бекендера
     ========================================================== */

  function boot() {
    setTimeout(startSkeleton, SKELETON_DELAY);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* ==========================================================
     11. Публічний інтерфейс (контракт 01-plan.md §5.2)
     ========================================================== */

  window.AIAAuthUI = {
    init: function (o) {
      o = o || {};
      if (o.handlers) handlers = o.handlers;
      if (o.certUrl) certUrl = o.certUrl;
      if (o.userId) userId = o.userId;
    },

    renderSlot: renderSlot,

    openAuthModal: openAuthModal,
    closeAuthModal: closeAuthModal,

    showFormError: showFormError,
    hideFormError: hideFormError,
    showOAuthPanel: showOAuthPanel,

    openNameDialog: openNameDialog,
    openAccountSheet: openAccountSheet,

    // Поза контрактом, але потрібне бекендеру для вибору режиму діалогу
    // (last vs soft) і для повідомлення про невдале збереження.
    wasNameConfirmed: wasNameConfirmed,
    markNameConfirmed: markNameConfirmed,
    showNameError: showNameError,

    // Тексти нотаток — щоб виклики з js/progress.js і js/module.js
    // не тримали копії тих самих рядків.
    texts: T
  };
})();
