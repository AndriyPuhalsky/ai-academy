/* ============================================================
   AI Академія — модалка «Написати нам».
   Підключається як <script type="module" src="js/contact.js">.

   Надсилає POST на Supabase Edge Function "contact" (окремий деплой,
   див. tg/contact_index.ts + tg/contact_messages.sql). Захист від спаму —
   Cloudflare Turnstile + honeypot-поле + серверний rate-limit по IP;
   перевірки тут — лише клієнтська зручність, не безпека.
   ============================================================ */

// Той самий трюк, що й у js/auth.js: шлях рахуємо відносно самого файла,
// тож config.json завжди кореневий, незалежно від сторінки.
const CONFIG_PATH = new URL("../config.json", import.meta.url).href;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NAME = 2;
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_TELEGRAM = 100;
const MIN_MESSAGE = 5;
const MAX_MESSAGE = 2000;
// Страховка, якщо переходу закриття не сталося взагалі (наприклад, елемент
// зняли зі сторінки): рівна тій, що в js/auth-ui.js.
const CLOSE_FALLBACK = 400;

const ERROR_MESSAGES = {
  invalid_name: "Вкажи ім'я та прізвище (щонайменше 2 символи).",
  invalid_email: "Схоже, email введено некоректно.",
  invalid_message: "Розкажи трохи більше — опис надто короткий.",
  turnstile_failed: "Не вдалося підтвердити, що ти не бот. Спробуй ще раз.",
  rate_limited: "Забагато спроб поспіль. Спробуй, будь ласка, за кілька хвилин.",
  bad_request: "Щось пішло не так. Онови сторінку і спробуй ще раз.",
  server_error: "Тимчасова помилка на сервері. Спробуй ще раз трохи пізніше.",
};

let cfg = null;
let modalEl = null;
let turnstileWidgetId = null;
let turnstileLoadingPromise = null;
// 006 · П-02 · Куди повернути фокус після закриття. Модалка живе на
// чотирьох сторінках (index, architect, claude-code, roadmap), і на
// кожній її відкриває свій #contactTrigger — тому запам'ятовуємо
// реальний activeElement, а не шукаємо кнопку по id.
let lastFocused = null;

function isPlaceholder(v) {
  return !v || /ТВІЙ|YOUR_/.test(v);
}

/* ---------- Старт ---------- */

async function boot() {
  try {
    cfg = await fetch(CONFIG_PATH, { cache: "no-store" }).then((r) => r.json());
  } catch (e) {
    console.error("[AIA contact] не вдалося прочитати config.json:", e);
    return;
  }
  const trigger = document.getElementById("contactTrigger");
  if (trigger) trigger.addEventListener("click", openModal);

  // Задача 003: роадмапу потрібні чотири точки виклику модалки (футер,
  // кінцівка, порожня «В роботі», панель помилки), а не одна. Публічний
  // доступ замість дублювання id — наявне звʼязування #contactTrigger
  // лишається як було, тобто решта сторінок працює без змін.
  window.AIAContact = { open: openModal };
}

/* ---------- Turnstile: підвантажуємо лише коли модалку відкрито ---------- */

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  if (turnstileLoadingPromise) return turnstileLoadingPromise;
  turnstileLoadingPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(s);
  });
  return turnstileLoadingPromise;
}

async function renderTurnstile() {
  const holder = modalEl.querySelector("#contactTurnstile");
  const siteKey = cfg && cfg.contact && cfg.contact.turnstileSiteKey;
  if (isPlaceholder(siteKey)) { holder.hidden = true; return; }

  holder.hidden = false;
  try {
    await loadTurnstileScript();
    holder.innerHTML = "";
    turnstileWidgetId = window.turnstile.render(holder, { sitekey: siteKey, theme: "dark" });
  } catch (e) {
    console.error("[AIA contact] Turnstile недоступний:", e);
    holder.hidden = true;
  }
}

function resetTurnstile() {
  if (window.turnstile && turnstileWidgetId != null) {
    try { window.turnstile.reset(turnstileWidgetId); } catch (e) { /* ignore */ }
  }
}

function turnstileToken() {
  if (!window.turnstile || turnstileWidgetId == null) return "";
  try { return window.turnstile.getResponse(turnstileWidgetId) || ""; } catch (e) { return ""; }
}

function hasTurnstile() {
  return !isPlaceholder(cfg && cfg.contact && cfg.contact.turnstileSiteKey);
}

/* ---------- Модальне вікно ---------- */

/* Задача 004 п.4 · блокування прокрутки фону, поки модалка відкрита.
   Лічильник — у data-aia-lock на <html>, спільний із js/auth-ui.js:
   дві незалежні модалки не мають знімати блокування одна одній.
   Стилі — html.ds-lock у css/components.css.
   ⚠ 010 · КЛАС `ds-lock` ЖИВЕ В ТРЬОХ ФАЙЛАХ І МІНЯЄТЬСЯ ЛИШЕ РАЗОМ.
   Замок ведуть js/module.js (шторка змісту), js/contact.js (модалка
   «Написати нам») і js/auth-ui.js (діалоги входу). Лічильник спільний —
   data-aia-lock на <html>. Якщо один із трьох знімає іншу назву класу,
   ніж вішає сусід, послідовність «шторка → модалка → закрити шторку →
   закрити модалку» лишає клас на <html> НАЗАВЖДИ, і скрол сторінки
   заморожений без жодної помилки в консолі.
   ⚠ `--ds-lock-sbw` — ширина смуги прокрутки, яку `overflow: hidden`
   забирає. Правило-споживач у css/components.css поки ВІДСУТНЄ (у пакеті
   є лише `html.ds-lock { overflow: hidden }`) — потрібні два рядки, див.
   03-frontend/report-d.md, розділ «Потрібні правила в спільних файлах». */
function lockScroll() {
  const root = document.documentElement;
  const n = (parseInt(root.getAttribute("data-aia-lock"), 10) || 0) + 1;
  root.setAttribute("data-aia-lock", String(n));
  if (n > 1) return;
  const sbw = window.innerWidth - root.clientWidth;
  root.style.setProperty("--ds-lock-sbw", (sbw > 0 ? sbw : 0) + "px");
  root.classList.add("ds-lock");
}
function unlockScroll() {
  const root = document.documentElement;
  const n = (parseInt(root.getAttribute("data-aia-lock"), 10) || 0) - 1;
  if (n > 0) { root.setAttribute("data-aia-lock", String(n)); return; }
  root.removeAttribute("data-aia-lock");
  root.classList.remove("ds-lock");
  root.style.removeProperty("--ds-lock-sbw");
}

/* 006 · П-02 · Пастка фокуса. Скопійована з js/auth-ui.js (focusables/trap,
   FIX-12 задачі 001): список фокусовних має збігатися з тим, куди браузер
   справді пускає Tab, тому inert-піддерева й visibility:hidden відсіюємо.
   Відмінність від еталона одна: там кілька діалогів у стеку, тут стек не
   потрібен — картка завжди одна, modalEl.firstElementChild. */
function focusables(root) {
  return Array.prototype.filter.call(
    root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    (el) => {
      if (el.closest("[inert]")) return false;
      if (el.checkVisibility) return el.checkVisibility({ visibilityProperty: true });
      return el.offsetParent !== null || el === document.activeElement;
    }
  );
}

function trap(e) {
  if (e.key !== "Tab" || !modalEl) return;
  // ⚠ Не firstElementChild: перший нащадок тепер .ds-dlg__scrim.
  const card = modalEl.querySelector(".ds-dlg__card");
  const list = focusables(card);
  if (!list.length) { e.preventDefault(); modalEl.focus(); return; }
  const first = list[0], last = list[list.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === modalEl)) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

/* ---------- Розмітка модалки ----------
   010 · етап 8. Було: рядок Tailwind-утиліт (`fixed inset-0 z-[60] hidden …`)
   плюс девʼять утиліт на кожному полі. Стало — ds-dlg / ds-fld / ds-btn зі
   СТАТИЧНОГО css/components.css. Це закриває давній хвіст «модалка перші
   ~50 мс нестилізована»: клас, який приходить у DOM лише з JS, Tailwind CDN
   генерує вже ПІСЛЯ вставки (006 D-02, заміряно 53 мс), а компонентні класи
   готові з першого кадру.

   ⚠ Мітки полів лишаються ЗОРОВО ПРИХОВАНИМИ (sr-only), а не видимими
   ds-fld__label. Причина: у пакеті 010 кадру цієї модалки немає, а видимі
   мітки — це зміна вигляду, а не міграція. Placeholder-и й порядок полів
   збережені дослівно; WCAG 3.3.2 закриває саме sr-only-мітка (той самий
   прийом, що в js/auth-ui.js, FIX-4 задачі 001).

   ⚠ Вертикальний ритм — інлайновим grid із токена --s-3, бо Tailwind-утиліт
   у JS бути не має (див. вище), а нових правил у components.css цей файл не
   заводить. У grid-контейнері .ds-btn розтягується на всю колонку сам —
   тому повноширинна кнопка «Надіслати» не потребує w-full.

   ⚠⚠ П-31 У НАЙЧИСТІШОМУ ВИГЛЯДІ: інлайновий `display:grid` перемагає
   `[hidden][hidden] { display: none }` (інлайн б'є будь-яке правило без
   !important). Спіймано живцем: блок «Дякуємо! Повідомлення надіслано»
   висів у щойно відкритій модалці. Тому сітка живе на ВНУТРІШНЬОМУ вузлі,
   а атрибут hidden — на зовнішньому. Не зливати їх в один div. */
const STACK = ' style="display:grid;gap:var(--s-3)"';

function buildModal() {
  if (modalEl) return;
  modalEl = document.createElement("div");
  modalEl.id = "aiaContactModal";
  modalEl.className = "ds-dlg";
  modalEl.hidden = true;
  modalEl.setAttribute("data-open", "false");
  // 006 · П-02 · Роль і назва діалогу. tabindex="-1" потрібен, щоб пастка
  // Tab мала куди повернути фокус, якщо всередині картки не лишилось
  // жодного фокусовного елемента.
  modalEl.setAttribute("role", "dialog");
  modalEl.setAttribute("aria-modal", "true");
  modalEl.setAttribute("aria-labelledby", "ctTitle");
  modalEl.setAttribute("tabindex", "-1");

  const field = (id, type, label, ph, attrs, max) =>
    '<div class="ds-fld">' +
      '<label class="sr-only" for="' + id + '">' + label + "</label>" +
      '<input id="' + id + '" class="ds-fld__input" type="' + type + '" placeholder="' + ph +
        '" maxlength="' + max + '" ' + attrs + " />" +
    "</div>";

  modalEl.innerHTML =
    '<div class="ds-dlg__scrim"></div>' +
    '<div class="ds-dlg__card">' +
      '<div class="ds-dlg__head">' +
        '<h2 id="ctTitle" class="ds-h3">Написати нам</h2>' +
        '<button type="button" id="ctClose" class="ds-btn ds-btn--quiet ds-btn--sm ds-btn--icon" aria-label="Закрити">✕</button>' +
      "</div>" +
      '<div id="ctFormWrap"><div' + STACK + ">" +
        field("ctName", "text", "Ім'я та прізвище", "Ім'я та прізвище", 'autocomplete="name"', MAX_NAME) +
        field("ctEmail", "email", "Email", "Email",
              'autocomplete="email" inputmode="email" autocapitalize="off" autocorrect="off" spellcheck="false"', MAX_EMAIL) +
        field("ctTelegram", "text", "Telegram (необовʼязково)", "Telegram (необов'язково)",
              'autocomplete="off"', MAX_TELEGRAM) +
        '<div class="ds-fld">' +
          '<label class="sr-only" for="ctMessage">Питання чи ідея</label>' +
          '<textarea id="ctMessage" class="ds-fld__input" rows="4" placeholder="Опиши питання чи ідею" maxlength="' + MAX_MESSAGE + '"></textarea>' +
          '<span id="ctCounter" class="ds-fld__count" style="text-align:right" aria-hidden="true">0/' + MAX_MESSAGE + "</span>" +
        "</div>" +
        // Honeypot: приховане поле-пастка для ботів. Справжній відвідувач його не бачить
        // і не заповнює; якщо воно непорожнє на сервері — тихо ігноруємо запит.
        '<input type="text" id="ctHp" name="company" autocomplete="off" tabindex="-1" aria-hidden="true" hidden />' +
        /* ⚠ Turnstile — чужий віджет ФІКСОВАНОЇ ширини 300 px. На 320 px він
           разом із паддінгом картки (2×24) розпирав аркуш до 350 px, і той
           вилазив за екран на 25 px праворуч і 5 ліворуч (заміряно; кнопка
           «Закрити» опинялась за краєм). overflow-x робить цей вузол
           скрол-контейнером, а отже його внесок у min-content дорівнює нулю —
           аркуш лишається рівно 320 px, а віджет прокручується в собі.
           На 360 px і ширше ефекту немає: там він і так уміщається. */
        '<div id="contactTurnstile" style="overflow-x:auto" hidden></div>' +
        '<p id="ctError" class="ds-fld__error" role="alert" hidden></p>' +
        '<button type="button" id="ctSubmit" class="ds-btn ds-btn--primary">Надіслати</button>' +
      "</div></div>" +
      '<div id="ctDone" hidden><div' + STACK + ">" +
        "<p>Дякуємо! Повідомлення надіслано — відповімо найближчим часом.</p>" +
        '<button type="button" id="ctDoneClose" class="ds-btn ds-btn--secondary">Закрити</button>' +
      "</div></div>" +
    "</div>";
  document.body.appendChild(modalEl);

  modalEl.querySelector("#ctClose").addEventListener("click", closeModal);
  modalEl.querySelector("#ctDoneClose").addEventListener("click", closeModal);
  // Клік по підложці. Було `e.target === modalEl`; тепер підложка — окремий
  // елемент .ds-dlg__scrim, а сам modalEl лишається прокруткою діалога, тому
  // перевіряємо обидва.
  modalEl.addEventListener("mousedown", (e) => {
    if (e.target === modalEl || e.target.classList.contains("ds-dlg__scrim")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (modalEl.hidden) return;
    if (e.key === "Escape") { closeModal(); return; }
    trap(e);
  });

  const msgEl = modalEl.querySelector("#ctMessage");
  const counterEl = modalEl.querySelector("#ctCounter");
  msgEl.addEventListener("input", () => {
    counterEl.textContent = msgEl.value.length + "/" + MAX_MESSAGE;
  });

  modalEl.querySelector("#ctSubmit").addEventListener("click", submit);
}

function resetForm() {
  const q = (s) => modalEl.querySelector(s);
  q("#ctName").value = "";
  q("#ctEmail").value = "";
  q("#ctTelegram").value = "";
  q("#ctMessage").value = "";
  q("#ctHp").value = "";
  q("#ctCounter").textContent = "0/" + MAX_MESSAGE;
  hideError();
  q("#ctFormWrap").hidden = false;
  q("#ctDone").hidden = true;
}

function openModal() {
  // Запам'ятовуємо ДО показу: після focus() на #ctName activeElement уже інший.
  lastFocused = document.activeElement;
  buildModal();
  resetForm();
  if (modalEl.hidden) lockScroll();
  modalEl.hidden = false;
  /* ⚠ П-10. НЕ requestAnimationFrame. Заміряно 2026-09-07 у живому Chrome:
     у вкладці, яка не рендериться (фон, оклюзія, згорнуте вікно), rAF не
     викликається ЖОДНОГО разу — тобто `hidden = false` спрацьовує, а
     перемикання data-open ні, і людина, повернувшись у вкладку, бачить
     порожній затемнений екран. Примусовий reflow дає той самий «наступний
     кадр» для старту переходу, але виконується синхронно й від рендера не
     залежить. Той самий прийом стоїть у js/motion.js (M2) і в .term. */
  void modalEl.offsetWidth;
  modalEl.setAttribute("data-open", "true");
  renderTurnstile();
  setTimeout(() => modalEl.querySelector("#ctName").focus(), 50);
}

function closeModal() {
  if (!modalEl) return;
  // Захист від подвійного зняття: Escape і клік по підложці можуть
  // прилетіти на вже закриту модалку.
  if (modalEl.hidden) return;
  modalEl.setAttribute("data-open", "false");
  unlockScroll();
  /* Ховаємо ПІСЛЯ виходу, інакше зникнення буде різким. transitionend
     приходить навіть при --motion: 0 — епсилон 0.00002ms у tokens.css
     існує саме для цього (нульова тривалість подій не породжує).
     setTimeout — страховка, якщо переходу не сталося взагалі. */
  const card = modalEl.querySelector(".ds-dlg__card");
  const done = (e) => {
    /* ⚠ Слухач висить на .ds-dlg, а transitionend СПЛИВАЄ: перехід
       border-color будь-якого поля чи кнопки всередині картки долетів би
       сюди й сховав діалог за 50 мс замість 180 (спіймано живцем). Тому
       фільтр за ціллю і властивістю, а не «будь-який transitionend». */
    if (e && (e.target !== card || e.propertyName !== "opacity")) return;
    if (modalEl.getAttribute("data-open") === "true") return;   // встигли відкрити знову
    modalEl.hidden = true;
    modalEl.removeEventListener("transitionend", done);
  };
  modalEl.addEventListener("transitionend", done);
  setTimeout(done, CLOSE_FALLBACK);
  // Повертаємо фокус туди, звідки відкривали (зазвичай #contactTrigger).
  // Обнуляємо одразу — повторний Escape по вже закритій модалці до сюди
  // не доходить (гілка вище), але подвійне повернення все одно зайве.
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  lastFocused = null;
}

function showError(msg) {
  const el = modalEl.querySelector("#ctError");
  el.textContent = msg;
  el.hidden = false;
  const live = document.getElementById("ariaLive");
  if (live) live.textContent = msg;
}
function hideError() {
  const el = modalEl.querySelector("#ctError");
  el.textContent = "";
  el.hidden = true;
}

async function submit() {
  const btn = modalEl.querySelector("#ctSubmit");
  if (btn.disabled) return; // захист від повторного кліку
  hideError();

  const full_name = modalEl.querySelector("#ctName").value.trim().slice(0, MAX_NAME);
  const email = modalEl.querySelector("#ctEmail").value.trim().slice(0, MAX_EMAIL);
  const telegram = modalEl.querySelector("#ctTelegram").value.trim().slice(0, MAX_TELEGRAM);
  const message = modalEl.querySelector("#ctMessage").value.trim().slice(0, MAX_MESSAGE);
  const hp = modalEl.querySelector("#ctHp").value;

  // --- перевірки вводу (справжній захист — на сервері) ---
  if (!full_name || full_name.length < MIN_NAME) { showError("Вкажи ім'я та прізвище."); return; }
  if (!email) { showError("Вкажи email."); return; }
  if (!EMAIL_RE.test(email)) { showError("Схоже, email введено некоректно."); return; }
  if (!message || message.length < MIN_MESSAGE) { showError("Розкажи трохи більше в описі."); return; }

  const needsTurnstile = hasTurnstile();
  const token = needsTurnstile ? turnstileToken() : "";
  if (needsTurnstile && !token) { showError("Підтверди, що ти не бот — постав галочку вище."); return; }

  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = "Надсилаємо…";
  try {
    const s = (cfg && cfg.supabase) || {};
    const res = await fetch(s.url + "/functions/v1/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": s.anonKey || "",
        "Authorization": "Bearer " + (s.anonKey || ""),
      },
      body: JSON.stringify({ full_name, email, telegram, message, turnstileToken: token, hp }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      resetTurnstile();
      showError(ERROR_MESSAGES[data.error] || "Не вдалося надіслати. Спробуй ще раз.");
      return;
    }
    modalEl.querySelector("#ctFormWrap").hidden = true;
    modalEl.querySelector("#ctDone").hidden = false;
    const live = document.getElementById("ariaLive");
    if (live) live.textContent = "Повідомлення надіслано";
  } catch (e) {
    resetTurnstile();
    showError("Немає з'єднання. Перевір інтернет і спробуй ще раз.");
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

boot();
