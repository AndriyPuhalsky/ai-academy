/* ============================================================
   001 — Вхід через Google · СПІЛЬНИЙ ДВИГУН ВАРІАНТІВ A / B / C
   ------------------------------------------------------------
   Походження: 03-build/motion.js агента №3 + виправлення
   валідації (FIX-N) + точки розширення для варіантів.
   Варіант підключається файлом variant.js, який ДО цього файла
   кладе window.AIA_VARIANT.
   ============================================================
   ------------------------------------------------------------
   Три речі в одному файлі, свідомо:

   1. БІЛДЕРИ — buildModal / buildNameDialog / buildAccountSheet.
      Кожен повертає ОДИН рядок HTML і нічого більше: без
      <template>, без зовнішніх файлів, іконки — інлайнові SVG.
      Саме в такому вигляді розмітка переїжджає в js/auth.js.

   2. ПОВЕДІНКА — стек діалогів, пастка фокуса, один слухач
      Escape, скелетон слота, очікування редіректу, читання
      й очищення URL після повернення від Google.

   3. РЕЖИСЕР МАКЕТА — репліка сайту й перемикання станів.
      Це риштування, у код сайту воно не їде. Позначено
      коментарем ДЕМО.
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
     0. Тексти. На сайті вони лишаються захардкодженими в
        js/auth.js (виняток із правила config.json — поле 11
        брифа), тому тут теж не виносяться нікуди.
     ========================================================== */

  var VAR = window.AIA_VARIANT || { id: "b", title: "варіант", subtitle: "", scenes: function () { return {}; } };
  var PAPER = "bleed";   // "bleed" | "tile" — підпитання власнику, перемикач у риштуванні

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

  var SVG_BURGER =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';

  /* ==========================================================
     2. Дрібні утиліти
     ========================================================== */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initial(name) {
    var t = String(name || "").trim();
    return t ? t.charAt(0).toUpperCase() : "?";
  }

  // Евристика «ім'я схоже на автоматичне» (§5.8). Перевірювана,
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

  /* ==========================================================
     3. БІЛДЕРИ РОЗМІТКИ
        Кожен повертає один рядок. Саме це переїжджає в auth.js.
     ========================================================== */

  /**
   * Кнопка провайдера. theme: "light" | "dark".
   * Геометрія, кольори й паддінги — з guidelines Google
   * (звірено 2026-08-22). Логотип не перефарбовується.
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
   * Стоїть над формою email, під розділювачем.
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
   * Модалка входу. Порядок блоків — R01 (Cal.com), головний
   * референс власника: провайдер → «або» → форма → повноширинний
   * сабміт унизу. Соц-блок стоїть ВИЩЕ табів, тому питання
   * «показувати на обох табах» знімається структурно.
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
                  /* FIX-4 · у 03-build жодне з трьох полів не мало ні <label>,
                     ні aria-label — тільки placeholder, який зникає, щойно
                     людина почала друкувати (WCAG 3.3.2 Labels or Instructions).
                     Мітки додано візуально прихованими: вигляд не змінився. */
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
   * ОДНА поверхня, ДВА входи (§5.7 + §5.8):
   *   mode "permanent" — постійне редагування (з шапки / з аркуша);
   *   mode "last"      — гарантований дотик перед завершенням;
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

    // СМУЖКА ПАПЕРУ — естетичний ризик макета.
    // Кольори, гарнітура й порядок рядків — з js/certificate.js.
    var paper =
      '<div class="paper' + (PAPER === "tile" ? " paper--tile" : "") + '" id="aiaPaper">' +
        '<p class="paper__quiet" aria-hidden="true">' + esc(T.name.quiet) + "</p>" +
        '<p class="paper__name"><span class="sr-only">' + esc(T.name.srPrefix) + "</span>" +
          '<span id="aiaPaperName">' + esc(shown) + "</span></p>" +
        '<div class="paper__rule" aria-hidden="true"></div>' +
        '<p class="paper__after" aria-hidden="true">' + esc(T.name.after) + "</p>" +
      "</div>";

    var caption =
      '<p class="aia-warnline" id="aiaPaperCaption">' +
        esc(T.name.caption) + " <b>" + esc(T.name.captionStrong) + "</b>" +
      "</p>";

    var field = editing
      ? '<div style="margin-top:var(--s-4)">' +
          '<label class="aia-label" for="aiaNameInput">' + esc(T.name.label) + "</label>" +
          '<input id="aiaNameInput" class="aia-input" type="text" maxlength="100" autocomplete="name" value="' + esc(value) + '" />' +
        "</div>"
      : "";

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
          head + desc + warn + paper + caption + field + actions +
        "</div>" +
      "</div>"
    );
  }

  /**
   * Мобільний аркуш акаунта. Рівно три рядки — межа обсягу.
   * Рядок «ім'я» НЕ редагує тут, він відкриває той самий діалог,
   * що й на десктопі: нова точка входу, а не нова поверхня.
   */
  function buildAccountSheet(o) {
    o = o || {};
    var name = o.name || T.name.fallback;
    var mail = o.email || "";
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
          '<a class="sheet__row" href="#" data-act="certs"><span>' + esc(T.sheet.certs) + "</span><span class=\"meta\">↗</span></a>" +
          '<button type="button" class="sheet__row sheet__row--out" data-act="out">' + esc(T.sheet.out) + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  /* ==========================================================
     4. ПОВЕДІНКА: стек діалогів, фокус, Escape
        Один слухач на document — не плодимо новий на кожен
        діалог (наявна вада js/auth.js:187).
     ========================================================== */

  var stack = [];   // [{ el, opener, onClose }]

  /* FIX-12 · знайдено валідатором уже на виправленій базі.
     Стара версія рахувала фокусовними елементи всередині inert-піддерева
     й елементи з visibility:hidden / opacity:0. Через це під час
     «Відкриваємо Google…» останнім у списку вважався #aiaSubmit, який
     насправді недосяжний, — і Tab з ✕ виносив фокус ЗА межі картки.
     Тепер список збігається з тим, куди браузер справді пускає Tab. */
  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (el) {
        if (el.closest("[inert]")) return false;
        // Свідомо БЕЗ opacityProperty: під час 180-мс появи картки її
        // computed opacity ще 0, і з цією опцією список став би порожнім
        // на перші два кадри. visibility нам достатньо — саме нею
        // згортається акордеон імені (FIX-1).
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
    setTimeout(finish, 400);   // страховка, якщо анімації немає (reduced-motion)
  }

  function closeAll() { while (stack.length) closeTop("all"); }

  // ДЕМО: миттєво прибрати діалоги без анімації й без повернення фокуса —
  // інакше при перемиканні сцен фокус стрибає на <h1> і малює рамку.
  function wipeDialogs() {
    while (stack.length) {
      var e = stack.pop();
      if (e.el.parentNode) e.el.parentNode.removeChild(e.el);
    }
  }

  /* ==========================================================
     5. Модалка входу: підключення поведінки
     ========================================================== */

  var oauthTimer = null;
  var oauthTimeoutMs = null;   // ДЕМО: щоб можна було прискорити 8 с

  function wireModal(el, ctx) {
    ctx = ctx || {};
    var card = el.firstElementChild;
    var q = function (s) { return el.querySelector(s); };

    q("#aiaClose").addEventListener("click", function () { closeTop("close"); });

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

    // --- Очікування редіректу ---
    var gbtn = q("#aiaGoogle");
    function startWaiting() {
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
      var panel = q("#aiaOauthPanel");
      if (panel) panel.remove();

      clearTimeout(oauthTimer);
      oauthTimer = setTimeout(function () { stopWaiting("timeout"); },
        oauthTimeoutMs != null ? oauthTimeoutMs : 8000);
      if (ctx.onWait) ctx.onWait();
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
    gbtn.addEventListener("click", startWaiting);
    el.__startWaiting = startWaiting;
    el.__stopWaiting = stopWaiting;

    // Кнопка «Спробувати ще раз» усередині панелі помилки
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act='retry-google']");
      if (b) startWaiting();
    });
  }

  function showPanel(el, kind) {
    var slot = el.querySelector("#aiaPanelSlot");
    slot.innerHTML = buildErrorPanel(kind);
    if (kind === "conflict") {
      el.__setTab("login");
      el.querySelector("#aiaEmail").value = "olena@example.com";
      setTimeout(function () { el.querySelector("#aiaPass").focus(); }, 0);
    }
  }

  /* ==========================================================
     6. Повернення від провайдера: читання й ОЧИЩЕННЯ URL
        Сценарії A і C приходять після повного перезавантаження,
        коли модалки вже немає. Тому сторінка відкриває її сама.
     ========================================================== */

  function readOAuthError() {
    var out = null;
    ["search", "hash"].forEach(function (part) {
      var raw = location[part] || "";
      if (!raw) return;
      var p = new URLSearchParams(raw.replace(/^[#?]/, ""));
      var code = p.get("error_code") || p.get("error");
      if (!code) return;
      var d = (p.get("error_description") || "").toLowerCase();
      if (/access_denied|denied|cancel/.test(code + " " + d)) out = "cancelled";
      else if (/identity|already|exists|conflict/.test(code + " " + d)) out = "conflict";
      else out = "other";
    });
    return out;
  }

  function cleanUrl() {
    // F5 не має повторювати помилку
    history.replaceState(null, "", location.pathname);
  }

  /* ==========================================================
     7. Скелетон слота авторизації
        Слот існує з першого кадру (min-height 34px), тому CLS = 0.
        Форму вгадуємо синхронно; ключ сесії НЕ хардкодимо.
     ========================================================== */

  function guessLoggedIn() {
    try {
      if (window.sb && window.sb.auth && window.sb.auth.storageKey) {
        return !!localStorage.getItem(window.sb.auth.storageKey);
      }
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) return true;
      }
    } catch (e) { /* приватний режим — вважаємо гостем */ }
    return false;   // ключа немає → гість (частіший випадок)
  }

  function skeletonHtml(isUser, narrow) {
    if (!isUser) return '<span class="sk sk--guest" aria-hidden="true"></span>';
    if (narrow) return '<span class="sk sk--avatar" aria-hidden="true"></span>';
    // FIX-10 · було однією плитою 307×34 (число R07). Вимір у браузері
    // показав, що реальний контрол — 250px: ширина залежить від довжини
    // імені, якої в мить скелетона ще ніхто не знає. Тепер скелетон
    // повторює СТРУКТУРУ контрола, і похибка лишається лише на плитці
    // імені, а не розтягує весь блок.
    return '<span class="sk-row" aria-hidden="true">' +
             '<span class="sk sk--name"></span>' +
             '<span class="sk sk--certs"></span>' +
             '<span class="sk sk--out"></span>' +
           "</span>";
  }

  /* ==========================================================
     ДЕМО. Усе нижче — риштування макета. У код сайту не їде.
     ========================================================== */

  var demo = {
    page: "home",
    width: 1280,
    session: "guest",
    rm: false,
    modProgress: 11,        // 11/12 → наступний клік дає n/n
    name: "olena p",        // навмисно «підозріле» ім'я з Google
    email: "olena@example.com",
    scene: "a1",
    nameTouched: false
  };

  var stage, scroll, railEl, noteEl;

  function stageWidthClass() {
    return demo.width;
  }

  function siteHtml() {
    var narrow = demo.width < 640;
    var slot = '<div class="slot" id="aiaAuth"></div>';

    var isMod = demo.page === "module";
    var left = isMod
      ? '<div class="site__logo" style="gap:var(--s-3)">' +
          '<button type="button" class="site__burger" aria-label="Зміст курсу">' + SVG_BURGER + "</button>" +
          '<a class="site__logo" href="#"><span class="site__mark">AIA</span>' +
            '<span class="site__name">AI Академія</span></a>' +
          '<span class="site__crumb" aria-hidden="true">/</span>' +
          '<span class="site__crumbtxt">Модуль 12</span>' +
        "</div>"
      : '<a class="site__logo" href="#">' +
          '<span class="site__mark">AIA</span>' +
          '<span class="site__name">AI Академія</span>' +
        "</a>";

    var mid = isMod
      ? ""
      : '<nav class="site__nav" aria-label="Головна навігація">' +
          '<a href="#">Треки</a><a href="#">Програма</a><a href="#">Підтримка</a>' +
          '<a href="#" class="is-cross">AI Architect →</a>' +
        "</nav>";

    var right =
      '<div class="site__right">' +
        (isMod || demo.session === "user"
          ? '<span class="site__progress" id="navProgress">' +
              (isMod ? demo.modProgress : 0) + "/12 модулів</span>"
          : "") +
        slot +
        (isMod
          ? '<a class="site__toprog" href="#">До програми</a>'
          : '<button type="button" class="site__burger" aria-label="Меню">' + SVG_BURGER + "</button>") +
      "</div>";

    var header =
      '<header class="site__header">' +
        '<div class="site__headerin' + (isMod ? " is-wide" : "") + '">' + left + mid + right + "</div>" +
      "</header>";

    var body;
    if (demo.page === "home") {
      body =
        '<section class="site__hero">' +
          '<div class="site__glow" aria-hidden="true"></div>' +
          '<div class="site__wrap">' +
            '<p class="site__eyebrow">// українською · без оплат і реєстрацій</p>' +
            '<h1 class="site__h1">Зрозумій, як думає ШІ.<br />Навчись ним керувати.</h1>' +
            '<p class="site__lead">Відкрита освітня платформа: від базових понять ШІ до промпт-інжинірингу, Claude API, MCP та агентних систем.</p>' +
            '<div class="site__cta">' +
              '<a class="btn-primary" href="#">Переглянути програму</a>' +
              '<a class="btn-ghost" href="#">Підтримати проєкт</a>' +
            "</div>" +
            '<p class="site__hint"><span>↑</span> Цей заголовок з\'явився частинами — токен за токеном. Саме так мовна модель генерує будь-який текст.</p>' +
          "</div>" +
        "</section>";
    } else {
      var done = demo.modProgress >= 12;
      var pct = Math.round(demo.modProgress / 12 * 100);
      var nav = "";
      [["10", "Безпека та надійність", false],
       ["11", "Етика й відповідальність", false],
       ["12", "Реальні кейси та фінальний проєкт", true]].forEach(function (m) {
        nav += '<a class="snav__item' + (m[2] ? " is-current" : "") + '" href="#">' +
               '<span class="no">' + m[0] + "</span><span>" + m[1] + "</span>" +
               (m[2] ? "" : '<span class="check">✓</span>') + "</a>";
      });
      var side =
        '<aside class="snav" aria-label="Зміст курсу">' +
          '<a class="snav__home" href="#">← AI Академія</a>' +
          '<div class="snav__bar"><span style="width:' + pct + '%"></span></div>' +
          '<p class="snav__count">' + demo.modProgress + " з 12 завершено</p>" +
          '<p class="snav__track">Трек IV · Агенти та продакшн</p>' + nav +
        "</aside>";
      body =
        '<div class="modwrap">' + side +
        '<div class="mod">' +
          '<p class="mod__crumb">Трек IV · Агенти та продакшн</p>' +
          '<h1 class="mod__h1">Реальні кейси та фінальний проєкт</h1>' +
          '<p class="mod__p">Підтримка клієнтів, аналіз документів, асистент розробника, генерація контенту — і власний фінальний челендж.</p>' +
          '<p class="mod__p">Тепер твоя черга. Обери задачу зі свого життя чи роботи — реальну, із живими користувачами — і спроєктуй рішення на папері: один-два аркуші плюс стартовий eval-набір.</p>' +
          '<div class="mod__complete">' +
            "<div>" +
              '<p class="mod__completetitle">Фінальний модуль позаду?</p>' +
              '<p class="mod__completesub">Познач його завершеним — і прогрес-бар курсу на головній нарешті покаже стовідсотковий результат.</p>' +
            "</div>" +
            '<button type="button" id="completeBtn" class="mod__completebtn' + (done ? " is-done" : "") + '">' +
              (done ? "✓ Завершено" : "Позначити завершеним") +
            "</button>" +
          "</div>" +
        "</div></div>";
    }

    return '<div class="site">' + header + body + "</div>";
  }

  function renderSlot(mode) {
    var slot = document.getElementById("aiaAuth");
    if (!slot) return;
    var narrow = demo.width < 640;

    if (mode === "skeleton") {
      slot.innerHTML = skeletonHtml(demo.session === "user", narrow);
      return;
    }
    if (demo.session === "user") {
      slot.innerHTML =
        '<div class="slot__real" style="display:contents">' +
          '<button type="button" class="slot__name" id="aiaNameBtn" aria-label="Змінити ім\'я для сертифіката" title="' + esc(demo.name) + '">' + esc(demo.name) + "</button>" +
          '<a class="slot__link" href="#">Сертифікати</a>' +
          '<button type="button" class="slot__out">Вийти</button>' +
          '<button type="button" class="slot__avatar" id="aiaAvatar" aria-label="' + esc(T.sheet.open) + '" aria-haspopup="dialog">' + esc(initial(demo.name)) + "</button>" +
        "</div>";
      var nb = document.getElementById("aiaNameBtn");
      if (nb) nb.addEventListener("click", function () { openNameDialog("permanent", nb); });
      var av = document.getElementById("aiaAvatar");
      if (av) av.addEventListener("click", function () { openSheet(av); });
    } else {
      slot.innerHTML =
        '<button type="button" class="slot__login slot__real" id="aiaLogin">Увійти</button>';
      document.getElementById("aiaLogin").addEventListener("click", function (e) {
        openAuth({ opener: e.currentTarget });
      });
    }
  }

  function renderSite(slotMode) {
    scroll.innerHTML = siteHtml();
    renderSlot(slotMode || "real");
    var cb = document.getElementById("completeBtn");
    if (cb) cb.addEventListener("click", onComplete);
    // Точка розширення для варіанта: A дописує сюди банер на сторінці
    // модуля. B і C нічого не дописують — їхній дотик живе в діалозі.
    if (VAR.afterRender) VAR.afterRender(api);
  }

  /* --- відкриття модалки входу --- */
  function openAuth(o) {
    o = o || {};
    var el = openDialog(buildModal({ note: o.note, tab: o.tab }), {
      host: stage,
      opener: o.opener || document.getElementById("aiaLogin")
    });
    wireModal(el);
    if (o.panel) showPanel(el, o.panel);
    if (o.waiting) el.__startWaiting();
    return el;
  }

  /* --- діалог імені --- */
  function openNameDialog(mode, opener, onDone) {
    var el = openDialog(buildNameDialog({ mode: mode, value: demo.name }), {
      host: stage,
      opener: opener,
      dismissible: mode === "permanent",   // дотик перед видачею: підложка не закриває
      onClose: function (reason) {
        if (mode !== "permanent" && reason !== "done") {
          // Escape = скасувати завершення модуля. На сервер нічого не йде.
          flash("Escape у гарантованому дотику <b>скасував завершення модуля</b>. " +
                "submit_quiz не викликано, лічильник лишився " + demo.modProgress + "/12.");
        }
      }
    });
    wireNameDialog(el, mode, onDone);
    return el;
  }

  function wireNameDialog(el, mode, onDone) {
    var q = function (s) { return el.querySelector(s); };
    var closeBtn = q("#aiaNameClose");
    if (closeBtn) closeBtn.addEventListener("click", function () { closeTop("close"); });

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
        }, 120);
      });
    }

    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");

      if (act === "cancel") { closeTop("cancel"); return; }

      if (act === "edit") {
        // той самий діалог перемикається в режим редагування
        var card = el.firstElementChild;
        var wrap = document.createElement("div");
        wrap.innerHTML = buildNameDialog({ mode: mode, value: demo.name, editing: true });
        el.replaceChild(wrap.firstElementChild.firstElementChild, card);
        wireNameDialog(el, mode, onDone);
        el.firstElementChild.focus();
        var i = el.querySelector("#aiaNameInput");
        if (i) { i.focus(); i.select(); }
        return;
      }

      if (act === "save" || act === "save-finish" || act === "confirm") {
        var i2 = el.querySelector("#aiaNameInput");
        if (i2) demo.name = i2.value.trim().slice(0, 100) || demo.name;
        demo.nameTouched = true;
        closeTop("done");
        if (onDone) onDone();
        else renderSlot("real");
      }
    });
  }

  /* --- мобільний аркуш --- */
  function openSheet(opener) {
    var el = openDialog(buildAccountSheet({ name: demo.name, email: demo.email }), {
      host: stage, opener: opener
    });
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "certs") e.preventDefault();
      if (act === "name") {
        // НЕ редагуємо тут: відкриваємо той самий діалог, що й на десктопі
        openNameDialog("permanent", b, function () { renderSlot("real"); });
        return;
      }
      if (act === "out" || act === "certs") closeTop("act");
    });
  }

  /* --- гарантований дотик перед завершенням останнього модуля ---
     Сам механізм живе у variant.js: у цьому й полягає вісь варіантів.
     База лишає за собою тільки те, що для всіх трьох однакове:
     хто гість — той спершу входить; повторний клік знімає позначку;
     дотик спрацьовує рівно тоді, коли клік переводить курс у n/n. */
  function onComplete(e) {
    var btn = e.currentTarget;
    if (demo.session !== "user") {
      openAuth({ note: T.notes.module, opener: btn });
      return;
    }
    if (demo.modProgress >= 12) {          // зняти позначку — дотику немає
      demo.modProgress = 11;
      renderSite();
      return;
    }
    if (demo.modProgress === 11) {
      VAR.onComplete(api, btn);
      return;
    }
    demo.modProgress++;
    renderSite();
  }

  function finishModule(msg) {
    demo.modProgress = 12;
    renderSite();
    if (msg) flash(msg);
  }

  /* --- скелетон: програвання --- */
  function playSkeleton(resolveMs) {
    renderSite("empty");
    var slot = document.getElementById("aiaAuth");
    slot.innerHTML = "";
    var shown = false;
    var tShow = setTimeout(function () { shown = true; renderSlot("skeleton"); }, 150);
    setTimeout(function () {
      clearTimeout(tShow);
      var sk = slot.querySelector(".sk");
      if (shown && sk) {
        sk.classList.add("is-leaving");
        setTimeout(function () { renderSlot("real"); }, 180);
      } else {
        renderSlot("real");
      }
    }, resolveMs);
  }

  /* --- підказка над сценою --- */
  function flash(html) {
    noteEl.innerHTML = html;
  }
  function setNote(html, actions) {
    noteEl.innerHTML = html + (actions || "");
  }

  /* ==========================================================
     Сцени
     ========================================================== */

  var BASE_SCENES = {
    a1: {
      group: "Модалка входу", label: "Спокій",
      page: "home", width: 1280, session: "guest",
      note: "Базовий кадр. Порядок блоків — R01 (Cal.com): <b>кнопка провайдера → хайрлайн «або» → форма → повноширинна головна кнопка внизу</b>. " +
            "Соц-блок стоїть <b>вище</b> табів. У модалці рівно <b>два</b> повноширинні кольорові контроли.<br>" +
            "<b>Виправлено проти 03-build:</b> логотип Google повернувся на офіційні 12&nbsp;px від лівого краю (був на 79); " +
            "поля отримали приховані мітки; згорнуте поле імені більше не ловить фокус.",
      actions: [
        ["Дублювати кнопку в #aiaSocial", function () {
          var s2 = stage.querySelector("#aiaSocial");
          if (!s2) return;
          var wrap = document.createElement("div");
          wrap.innerHTML = buildProviderButton("aiaLinkedIn", "light", "Продовжити з LinkedIn");
          s2.appendChild(wrap.firstElementChild);
          flash("Друга дитина додана наживо. Змінилась <b>тільки висота картки</b>: ширина, відступи й порядок решти не зрушили (критерій 4).");
        }],
        ["Показати реєстрацію", function () {
          var el = stage.querySelector("#aiaAuthModal");
          if (el) el.__setTab("register");
        }],
        ["Пройти табом", function () {
          var el = stage.querySelector("#aiaAuthModal");
          if (el) el.firstElementChild.focus();
          flash("Фокус — на контейнері картки. Далі тисни <b>Tab</b>: ✕ → Google → таб → Email → Пароль → Увійти. " +
                "Зупинки на невидимому полі імені більше немає.");
        }]
      ],
      run: function () { renderSite(); openAuth({}); }
    },

    a2: {
      group: "Модалка входу", label: "Спокій з нотаткою",
      page: "home", width: 1280, session: "guest",
      note: "Найдовша з трьох нотаток сайту (<code>js/progress.js:33</code>). Для більшості учнів це <b>перший</b> показ модалки взагалі.",
      run: function () { renderSite(); openAuth({ note: T.notes.progress }); }
    },

    a3: {
      group: "Модалка входу", label: "Реєстрація (акордеон імені)",
      page: "home", width: 1280, session: "guest",
      note: "Ефект 5: <code>grid-template-rows: 0fr → 1fr</code>, 200 мс.<br>" +
            "<b>Виправлено:</b> у 03-build згорнутий стан був не 0, а 12&nbsp;px (padding на боксі з overflow), " +
            "і поле лишалось у таб-порядку з <code>opacity:0</code> — Tab приводив у нікуди. Тепер <code>visibility:hidden</code>.",
      actions: [["Перемкнути таб туди-сюди", function () {
        var el = stage.querySelector("#aiaAuthModal"); if (!el) return;
        var t = el.querySelector("#aiaTabs").getAttribute("data-tab");
        el.__setTab(t === "register" ? "login" : "register");
      }]],
      run: function () { renderSite(); openAuth({ tab: "register" }); }
    },

    a4: {
      group: "Модалка входу", label: "Очікування редіректу",
      page: "home", width: 1280, session: "guest",
      note: "Ефекти 9 + 10. Смуга 2&nbsp;px <b>clay</b> по верхній межі; решта діалогу гасне до 0.45. " +
            "<b>Текст на кнопці не змінився</b>. Статус — окремий <code>role=\"status\"</code>.<br>" +
            "<b>Виправлено:</b> приглушений блок тепер <code>inert</code>, а «Увійти» — <code>disabled</code>. " +
            "У 03-build туди можна було зайти табом і натиснути Enter.",
      run: function () { renderSite(); openAuth({ waiting: true }); }
    },

    a5: {
      group: "Модалка входу", label: "Таймаут 8 с",
      page: "home", width: 1280, session: "guest",
      note: "Найгірший реальний стан — «вічно крутиться». Через 8 с смуга зупиняється, <code>aria-busy</code> знімається, кнопка знову активна, з'являється панель.",
      actions: [
        ["Прискорити до 1 с і запустити", function () {
          oauthTimeoutMs = 1000;
          var el = stage.querySelector("#aiaAuthModal");
          if (el) el.__startWaiting();
        }],
        ["Реальні 8 с", function () {
          oauthTimeoutMs = null;
          var el = stage.querySelector("#aiaAuthModal");
          if (el) el.__startWaiting();
        }]
      ],
      run: function () { renderSite(); openAuth({}); oauthTimeoutMs = 1000; }
    },

    a6: {
      group: "Модалка входу", label: "Помилка після повернення (A)",
      page: "home", width: 1280, session: "guest",
      note: "",
      run: function () {
        renderSite();
        var fake = "#error=access_denied&error_description=User+denied+access";
        history.replaceState(null, "", location.pathname + fake);
        var before = location.href;
        var kind = readOAuthError();
        cleanUrl();
        openAuth({ panel: kind, tab: "login" });
        setNote(
          "Приходить <b>після повного перезавантаження</b>, коли модалки вже немає. Сторінка <b>сама</b> відкриває її за ознакою в URL і одразу URL чистить.<br>" +
          "URL до: <code>" + esc(before.split("/").pop()) + "</code> → після: <code>" + esc(location.href.split("/").pop() || "/") + "</code> — F5 помилку не повторить (критерій 16).<br>" +
          "<b>Виправлено:</b> панель отримала ліву смугу <code>sand</code> і сильнішу межу (3.72:1 замість 2.47) — рідний ідіом <code>.callout-sand</code> із css/custom.css."
        );
      }
    },

    a7: {
      group: "Модалка входу", label: "Конфлікт ідентичностей (C)",
      page: "home", width: 1280, session: "guest",
      note: "Тупик перетворено на один крок: таб «Вхід» активний, email уже заповнений, фокус — у полі пароля. Кнопки дії в панелі немає навмисно.",
      run: function () {
        renderSite();
        history.replaceState(null, "", location.pathname + "#error=identity_already_exists");
        var kind = readOAuthError();
        cleanUrl();
        openAuth({ panel: kind, tab: "login" });
      }
    },

    a8: {
      group: "Модалка входу", label: "Помилка B (не відкрилось)",
      page: "home", width: 1280, session: "guest",
      note: "Єдиний сценарій без перезавантаження — сторінка ще наша, тому панель просто з'являється в уже відкритій модалці (ефект 11, 140 мс).",
      run: function () {
        renderSite();
        var el = openAuth({});
        setTimeout(function () { showPanel(el, "open"); }, 250);
      }
    },

    a9: {
      group: "Модалка входу", label: "320×560 — короткий екран",
      page: "home", width: 320, session: "guest",
      note: "Кадр, якого в 03-build не було, і саме він ловив блокуючу помилку. Найважчий реальний зміст (нотатка + панель конфлікту + таб «Реєстрація») " +
            "на екрані заввишки 560&nbsp;px — це iPhone SE.<br>" +
            "<b>Було:</b> картка виходила за підложку на 68&nbsp;px згори й знизу, заголовок і ✕ зрізані, «Зареєструватися» недосяжна, скролу немає.<br>" +
            "<b>Стало:</b> підложка скролиться, картка притискається до верху, коли місця бракує. Прокрути сцену.",
      run: function () {
        stage.style.height = "560px";
        renderSite();
        var el = openAuth({ note: T.notes.progress, tab: "register" });
        var wrap = document.createElement("div");
        wrap.innerHTML = buildErrorPanel("conflict");
        el.querySelector("#aiaPanelSlot").appendChild(wrap.firstElementChild);
      }
    },

    b1: {
      group: "Шапка", label: "Скелетон: гість",
      page: "home", width: 1280, session: "guest",
      note: "Слот <code>#aiaAuth</code> існує з першого кадру, <code>min-height: 34px</code>. Виміряно валідатором: скелетон гостя <b>75×34</b>, реальна кнопка <b>75×34</b> — збіг піксель у піксель, CLS 0.",
      actions: [["Програти ще раз", function () { playSkeleton(2600); }]],
      run: function () { playSkeleton(2600); }
    },

    b2: {
      group: "Шапка", label: "Скелетон: залогінений",
      page: "home", width: 1280, session: "user",
      note: "<b>Виправлено:</b> у 03-build це була одна плита 307&nbsp;px, тоді як реальний контрол виміряно на <b>250</b> — скелетон обіцяв на 23% ширше. " +
            "Причина не в помилці виміру, а в тому, що ширина залежить від довжини імені, якої в мить скелетона ще ніхто не знає. " +
            "Тепер скелетон повторює <b>структуру</b>: плитка імені + «Сертифікати» + «Вийти».",
      actions: [
        ["Програти ще раз", function () { playSkeleton(2600); }],
        ["Довге ім'я", function () { demo.name = "Костянтин-Володимир Гнатюк"; playSkeleton(2200); }],
        ["Коротке ім'я", function () { demo.name = "olena p"; playSkeleton(2200); }]
      ],
      run: function () { playSkeleton(2600); }
    },

    b3: {
      group: "Шапка", label: "Скелетон → контрол",
      page: "home", width: 1280, session: "user",
      note: "Crossfade 180 мс. Виміряно валідатором приладом (<code>PerformanceObserver: layout-shift</code>): підміна дає <b>CLS = 0</b>, жодного зсуву сусідів (критерій 25).",
      actions: [
        ["Гість", function () { demo.session = "guest"; playSkeleton(1800); }],
        ["Залогінений", function () { demo.session = "user"; playSkeleton(1800); }]
      ],
      run: function () { playSkeleton(1800); }
    },

    b4: {
      group: "Шапка", label: "Швидка сесія (80 мс)",
      page: "home", width: 1280, session: "user",
      note: "Поріг 150 мс. Швидше — <b>скелетон не показується взагалі</b>, жодного блимання (критерій 26).",
      actions: [
        ["80 мс — скелетона немає", function () { playSkeleton(80); }],
        ["400 мс — скелетон є", function () { playSkeleton(400); }]
      ],
      run: function () { playSkeleton(80); }
    },

    d1: {
      group: "Мобілка", label: "Аркуш акаунта (390 px)",
      page: "home", width: 390, session: "user",
      note: "Сьогодні на &lt;640 залогінений бачить у шапці <b>лише «Вийти»</b>. Три елементи згорнуто в кружечок 36×36 → аркуш знизу. " +
            "Рух — крива Vaul (R05), 400 мс, підложка й аркуш однією тривалістю.<br>" +
            "Перевірено валідатором: <b>Escape закриває тільки верхній шар</b>, нижній на цей час має <code>inert</code>, фокус повертається на кружечок.",
      run: function () {
        renderSite();
        var av = document.getElementById("aiaAvatar");
        if (av) openSheet(av);
      }
    },

    d2: {
      group: "Мобілка", label: "Модалка на 320 px",
      page: "home", width: 320, session: "guest",
      note: "Ширина контенту картки = 240&nbsp;px. Перевіряно валідатором у браузері: кнопка <b>236&nbsp;px</b>, підпис <b>148.6&nbsp;px</b>, <b>один рядок</b>, запас +37 (критерій 2).",
      run: function () { renderSite(); openAuth({ note: T.notes.progress }); }
    },

    g1: {
      group: "Окремо", label: "Кнопка Google: до / після фіксу",
      page: "home", width: 1280, session: "guest",
      note: "",
      run: function () { renderGoogleFix(); }
    },

    e2: {
      group: "Окремо", label: "prefers-reduced-motion",
      page: "home", width: 1280, session: "guest", rm: true,
      note: "Окремий кадр. Усі ефекти вимкнено: модалка з'являється миттєво й повністю, плашка таба перестрибує, shimmer стає статичною плиткою, смуга процесу — статичною <b>clay</b> на 40%. " +
            "Нічого не зникає й не ламається.<br>" +
            "<b>Виправлено:</b> дододано обнулення <code>--g-transition</code> (218 мс переходу кольору кнопки Google лишались живими).",
      actions: [
        ["Відкрити модалку", function () { openAuth({ note: T.notes.progress }); }],
        ["Запустити очікування", function () {
          var el = stage.querySelector("#aiaAuthModal");
          if (el) { oauthTimeoutMs = 3000; el.__startWaiting(); }
        }],
        ["Скелетон", function () { wipeDialogs(); playSkeleton(1600); }],
        ["Дотик з іменем", function () {
          wipeDialogs();
          demo.page = "module"; demo.session = "user"; demo.modProgress = 11;
          stage.setAttribute("data-w", demo.width);
          renderSite();
          var cb = document.getElementById("completeBtn");
          if (cb) cb.click();
        }]
      ],
      run: function () { renderSite(); openAuth({ note: T.notes.progress }); }
    }
  };

  var SCENES = {};

  function renderGoogleFix() {
    renderSite();
    var host = scroll.querySelector(".site");
    var b = '<div class="site__wrap">';
    b += '<p class="site__eyebrow">// критерії 8, 10, 11 · виправлення валідатора</p>';
    b += '<h1 class="site__h1" style="font-size:30px">Кнопка Google на справжньому <code style="font-family:var(--f-mono);font-size:0.7em;color:var(--c-sand)">bg-surface</code></h1>';
    b += '<div class="gcompare-grid" style="margin-top:var(--s-8)">';

    b += '<div class="aia-card" style="animation:none"><div class="gfix">' +
           '<div class="gfix__row">' +
             '<p class="gcompare__label">Було в 03-build — логотип на 79 px</p>' +
             '<button type="button" class="gbtn gbtn--light gbtn--legacy">' +
               '<span class="gbtn__logo">' + SVG_G + '</span>' +
               '<span class="gbtn__label">' + esc(T.google) + '</span>' +
             '</button>' +
             '<p class="gcompare__num"><span class="gcompare__warn">justify-content: center + gap</span> — оголошені паддінги 12/10/12 не працюють, логотип пливе до середини. Офіційний віджет так не виглядає.</p>' +
           '</div>' +
           '<div class="gfix__row">' +
             '<p class="gcompare__label">Стало — логотип на 12 px, як у Google</p>' +
             buildProviderButton("gfixNew", "light", T.google) +
             '<p class="gcompare__num">Логотип закріплений на <b>12 px</b> зліва, підпис центрується в просторі, що лишився — саме така поведінка офіційного віджета при <code>data-width</code> (звірено зі знімком <code>r00-google-official-widths-240-400.png</code>).</p>' +
           '</div>' +
         '</div></div>';

    b += '<div class="aia-card" style="animation:none"><div class="gfix">' +
           '<div class="gfix__row">' +
             '<p class="gcompare__label">Light — обрано (§7.2)</p>' +
             buildProviderButton("cmpLight", "light", T.google) +
             '<p class="gcompare__num">заливка <b>#FFFFFF</b> · обведення <b>#747775</b> 1 px inside · текст <b>#1F1F1F</b><br>до surface: <b>17.14:1</b> · обведення <b>3.79:1</b> ✓</p>' +
           '</div>' +
           '<div class="gfix__row">' +
             '<p class="gcompare__label">Dark — не обрано</p>' +
             buildProviderButton("cmpDark", "dark", T.google) +
             '<p class="gcompare__num">заливка <b>#131314</b> · обведення <b>#8E918F</b> · текст <b>#E3E3E3</b><br><span class="gcompare__warn">заливка до surface: 1.08:1 — плитка невидима</span>, тримається лише на обведенні (5.38:1), тому воно <b>незнімне</b> (критерій 11).</p>' +
           '</div>' +
         '</div></div>';

    b += "</div></div>";
    host.insertAdjacentHTML("beforeend", b);
    setNote(
      "Геометрія обох: висота <b>40 px</b> (не масштабуємо до 44 — §7.2), радіус <b>4 px</b>, паддінги <b>12 / 10 / 12</b>, логотип <b>18×18</b>, підпис <b>14/20, ls 0.25 px</b>, " +
      "офіційний рядок <code>continue_with</code> для локалі uk.<br>" +
      "Перевірено валідатором у Network: зовнішніх запитів рівно два домени — <code>fonts.googleapis.com</code> і <code>fonts.gstatic.com</code>, і тільки по Literata + IBM Plex. " +
      "<b>Жодного запиту по Google Sans — нуль</b> (§7.4)."
    );
  }

  /* ==========================================================
     Риштування: панель, перемикачі
     ========================================================== */

  function applyRm() {
    document.documentElement.classList.toggle("rm", demo.rm);
  }

  function buildRail() {
    var groups = [];
    Object.keys(SCENES).forEach(function (id) {
      var s = SCENES[id];
      var g = groups.filter(function (x) { return x.name === s.group; })[0];
      if (!g) { g = { name: s.group, items: [] }; groups.push(g); }
      g.items.push({ id: id, label: s.label });
    });

    var h = '<p class="rig__brand">001 · варіант ' + esc(VAR.id.toUpperCase()) + ' — ' + esc(VAR.title) + '</p>' +
            '<p class="rig__sub">' + VAR.subtitle + '</p>' +
            '<div class="rig__group"><p class="rig__grouptitle">інші варіанти</p>' +
              '<a class="rig__btn" href="../">← усі три поруч</a>' +
            '</div>';
    groups.forEach(function (g) {
      h += '<div class="rig__group"><p class="rig__grouptitle">' + esc(g.name) + "</p>";
      g.items.forEach(function (it) {
        h += '<button type="button" class="rig__btn" data-scene="' + it.id + '"><i>' + it.id + "</i>" + esc(it.label) + "</button>";
      });
      h += "</div>";
    });
    railEl.innerHTML = h;
    railEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-scene]");
      if (b) go(b.getAttribute("data-scene"));
    });
  }

  function go(id) {
    var s = SCENES[id];
    if (!s) return;
    demo.scene = id;
    wipeDialogs();
    clearTimeout(oauthTimer);
    oauthTimeoutMs = null;

    if (s.page) demo.page = s.page;
    if (s.width) demo.width = s.width;
    if (s.session) demo.session = s.session;
    demo.rm = s.rm === true;
    applyRm();
    stage.style.height = "";          // сцена a9 підміняє висоту — скидаємо
    stage.setAttribute("data-w", stageWidthClass());
    syncToolbar();

    Array.prototype.forEach.call(railEl.querySelectorAll("[data-scene]"), function (b) {
      b.setAttribute("aria-current", String(b.getAttribute("data-scene") === id));
    });

    var acts = "";
    if (s.actions) {
      acts = '<div class="rig__actions">' + s.actions.map(function (a, i) {
        return '<button type="button" data-sceneact="' + i + '">' + esc(a[0]) + "</button>";
      }).join("") + "</div>";
    }
    setNote(s.note || "", acts);

    s.run();
  }

  function syncToolbar() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-set]"), function (b) {
      var kv = b.getAttribute("data-set").split(":");
      var on = kv[0] === "paper" ? (PAPER === kv[1]) : (String(demo[kv[0]]) === kv[1]);
      b.setAttribute("aria-pressed", String(on));
    });
    stage.setAttribute("data-w", demo.width);
  }

  /* ==========================================================
     Вимір ширини підпису — критерій 2. Друкуємо в консоль,
     щоб число можна було перезняти, а не вірити на слово.
     ========================================================== */

  function measure() {
    var c = document.createElement("canvas").getContext("2d");
    try { c.letterSpacing = "0.25px"; } catch (e) {}
    c.font = '500 14px "IBM Plex Sans", system-ui, sans-serif';
    var rows = [
      "Продовжити з Google",
      "Вхід через Google",
      "Продовжити з LinkedIn",
      "Продовжити через Google",
      "Зареєструватися через Google"
    ];
    var out = rows.map(function (s) {
      var w = c.measureText(s).width;
      if (!("letterSpacing" in c)) w += s.length * 0.25;   // фолбек
      var btn = 1 + 12 + 18 + 10 + w + 12 + 1;
      return {
        "підпис": s,
        "текст, px": Math.round(w * 10) / 10,
        "мін. кнопка, px": Math.round(btn * 10) / 10,
        "запас на 320 (240 px)": Math.round((240 - btn) * 10) / 10,
        "запас на 390 (310 px)": Math.round((310 - btn) * 10) / 10
      };
    });
    if (console.table) { console.log("[001] вимір підпису — IBM Plex Sans 500 · 14px · ls 0.25px"); console.table(out); }
    else console.log("[001] вимір підпису", out);
  }

  /* ==========================================================
     Старт
     ========================================================== */

  document.addEventListener("DOMContentLoaded", function () {
    stage  = document.getElementById("stage");
    scroll = document.getElementById("stageScroll");
    railEl = document.getElementById("rail");
    noteEl = document.getElementById("note");

    document.documentElement.setAttribute("data-variant", VAR.id);

    // Сцени: спільні (модалка, шапка, мобілка, кнопка Google, reduced-motion)
    // + група «Ім'я для сертифіката», яку дає саме цей варіант. Саме ця
    // група і є віссю, по якій A / B / C відрізняються.
    var vs = VAR.scenes ? VAR.scenes(api) : {};
    Object.keys(BASE_SCENES).forEach(function (k) { SCENES[k] = BASE_SCENES[k]; });
    Object.keys(vs).forEach(function (k) { SCENES[k] = vs[k]; });
    // група імені має стояти третьою, як у 03-build — сортуємо за префіксом
    var ordered = {};
    ["a", "b", "c", "d", "g", "e"].forEach(function (pref) {
      Object.keys(SCENES).forEach(function (k) { if (k.charAt(0) === pref) ordered[k] = SCENES[k]; });
    });
    SCENES = ordered;
    api.SCENES = SCENES;

    buildRail();

    document.getElementById("toolbar").addEventListener("click", function (e) {
      var b = e.target.closest("[data-set]");
      if (!b) return;
      var kv = b.getAttribute("data-set").split(":");
      var v = kv[1];
      if (kv[0] === "paper") { PAPER = v; }
      else { demo[kv[0]] = (v === "true") ? true : (v === "false") ? false : (isNaN(+v) ? v : +v); }
      if (kv[0] === "rm") applyRm();
      syncToolbar();
      wipeDialogs();
      if (SCENES[demo.scene]) SCENES[demo.scene].run();
    });

    noteEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-sceneact]");
      if (!b) return;
      var s = SCENES[demo.scene];
      if (s && s.actions) s.actions[+b.getAttribute("data-sceneact")][1]();
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    else setTimeout(measure, 800);

    go("a1");
  });

  /* ==========================================================
     API для variant.js — усе, що потрібно, щоб описати свою
     версію гарантованого дотику, не чіпаючи двигун.
     ========================================================== */
  var api = {
    T: T,
    demo: demo,
    SVG_ALERT: SVG_ALERT,
    esc: esc,
    looksAuto: looksAuto,
    openDialog: openDialog,
    closeTop: closeTop,
    buildNameDialog: buildNameDialog,
    wireNameDialog: wireNameDialog,
    openNameDialog: openNameDialog,
    renderSite: function (m) { return renderSite(m); },
    renderSlot: function (m) { return renderSlot(m); },
    finishModule: finishModule,
    flash: flash,
    setNote: setNote,
    paper: function () { return PAPER; },
    stage: function () { return stage; },
    go: function (id) { return go(id); }
  };

  // Публічний інтерфейс — щоб валідатор міг смикати стани з консолі
  window.AIA001 = {
    go: go,
    api: api,
    buildModal: buildModal,
    buildNameDialog: buildNameDialog,
    buildAccountSheet: buildAccountSheet,
    buildProviderButton: buildProviderButton,
    buildErrorPanel: buildErrorPanel,
    demo: demo
  };
})();
