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
  if (isPlaceholder(siteKey)) { holder.classList.add("hidden"); return; }

  holder.classList.remove("hidden");
  try {
    await loadTurnstileScript();
    holder.innerHTML = "";
    turnstileWidgetId = window.turnstile.render(holder, { sitekey: siteKey, theme: "dark" });
  } catch (e) {
    console.error("[AIA contact] Turnstile недоступний:", e);
    holder.classList.add("hidden");
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
   Стилі — html.aia-scroll-lock у css/custom.css. */
function lockScroll() {
  const root = document.documentElement;
  const n = (parseInt(root.getAttribute("data-aia-lock"), 10) || 0) + 1;
  root.setAttribute("data-aia-lock", String(n));
  if (n > 1) return;
  const sbw = window.innerWidth - root.clientWidth;
  root.style.setProperty("--aia-sbw", (sbw > 0 ? sbw : 0) + "px");
  root.classList.add("aia-scroll-lock");
}
function unlockScroll() {
  const root = document.documentElement;
  const n = (parseInt(root.getAttribute("data-aia-lock"), 10) || 0) - 1;
  if (n > 0) { root.setAttribute("data-aia-lock", String(n)); return; }
  root.removeAttribute("data-aia-lock");
  root.classList.remove("aia-scroll-lock");
  root.style.removeProperty("--aia-sbw");
}

function buildModal() {
  if (modalEl) return;
  modalEl = document.createElement("div");
  modalEl.id = "aiaContactModal";
  modalEl.className = "fixed inset-0 z-[60] hidden items-center justify-center bg-ink/80 p-4 backdrop-blur";
  modalEl.innerHTML =
    '<div class="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">' +
      '<div class="mb-4 flex items-center justify-between">' +
        '<h2 class="font-display text-xl">Написати нам</h2>' +
        '<button type="button" id="ctClose" class="text-faint transition hover:text-sand" aria-label="Закрити">✕</button>' +
      "</div>" +
      '<div id="ctFormWrap" class="space-y-3">' +
        '<input id="ctName" type="text" placeholder="Ім\'я та прізвище" autocomplete="name" maxlength="' + MAX_NAME + '" class="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory outline-none transition focus:border-clay/60" />' +
        '<input id="ctEmail" type="email" placeholder="Email" autocomplete="email" inputmode="email" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="' + MAX_EMAIL + '" class="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory outline-none transition focus:border-clay/60" />' +
        '<input id="ctTelegram" type="text" placeholder="Telegram (необов\'язково)" autocomplete="off" maxlength="' + MAX_TELEGRAM + '" class="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory outline-none transition focus:border-clay/60" />' +
        "<div>" +
          '<textarea id="ctMessage" rows="4" placeholder="Опиши питання чи ідею" maxlength="' + MAX_MESSAGE + '" class="w-full resize-none rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory outline-none transition focus:border-clay/60"></textarea>' +
          '<p id="ctCounter" class="mt-1 text-right text-xs text-faint">0/' + MAX_MESSAGE + '</p>' +
        "</div>" +
        // Honeypot: приховане поле-пастка для ботів. Справжній відвідувач його не бачить
        // і не заповнює; якщо воно непорожнє на сервері — тихо ігноруємо запит.
        '<input type="text" id="ctHp" name="company" autocomplete="off" tabindex="-1" aria-hidden="true" class="hidden" />' +
        '<div id="contactTurnstile" class="hidden"></div>' +
        '<p id="ctError" class="hidden text-sm text-clay"></p>' +
        '<button type="button" id="ctSubmit" class="w-full rounded-lg bg-clay px-4 py-2.5 font-medium text-ink transition hover:bg-clay-deep">Надіслати</button>' +
      "</div>" +
      '<div id="ctDone" class="hidden">' +
        '<p class="text-ivory">Дякуємо! Повідомлення надіслано — відповімо найближчим часом.</p>' +
        '<button type="button" id="ctDoneClose" class="mt-4 w-full rounded-lg border border-line px-4 py-2.5 text-sm text-muted transition hover:border-clay/60 hover:text-sand">Закрити</button>' +
      "</div>" +
    "</div>";
  document.body.appendChild(modalEl);

  modalEl.querySelector("#ctClose").addEventListener("click", closeModal);
  modalEl.querySelector("#ctDoneClose").addEventListener("click", closeModal);
  modalEl.addEventListener("click", (e) => { if (e.target === modalEl) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalEl.classList.contains("hidden")) closeModal();
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
  q("#ctFormWrap").classList.remove("hidden");
  q("#ctDone").classList.add("hidden");
}

function openModal() {
  buildModal();
  resetForm();
  if (modalEl.classList.contains("hidden")) lockScroll();
  modalEl.classList.remove("hidden");
  modalEl.classList.add("flex");
  renderTurnstile();
  setTimeout(() => modalEl.querySelector("#ctName").focus(), 50);
}

function closeModal() {
  if (!modalEl) return;
  // Захист від подвійного зняття: Escape і клік по підложці можуть
  // прилетіти на вже закриту модалку.
  if (modalEl.classList.contains("hidden")) return;
  modalEl.classList.add("hidden");
  modalEl.classList.remove("flex");
  unlockScroll();
}

function showError(msg) {
  const el = modalEl.querySelector("#ctError");
  el.textContent = msg;
  el.classList.remove("hidden");
  const live = document.getElementById("ariaLive");
  if (live) live.textContent = msg;
}
function hideError() {
  const el = modalEl.querySelector("#ctError");
  el.textContent = "";
  el.classList.add("hidden");
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
    modalEl.querySelector("#ctFormWrap").classList.add("hidden");
    modalEl.querySelector("#ctDone").classList.remove("hidden");
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
