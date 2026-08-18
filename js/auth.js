/* ============================================================
   AI Академія — авторизація через Supabase.
   Підключається як <script type="module" src="js/auth.js">.

   Робить:
   • створює клієнт window.sb (ключі бере з config.json → "supabase");
   • тримає поточного користувача у window.AIA_USER;
   • будує карту модулів window.AIA_MODULE_MAP { code: uuid };
   • підвантажує прогрес користувача у window.AIAProgress.hydrate();
   • малює в шапці кнопку «Увійти» / ім'я + «Вийти»;
   • показує модальне вікно входу та реєстрації.

   Публічний інтерфейс: window.AIAAuth.open(note), .signOut(), .user().
   ============================================================ */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Креди Supabase читаємо ЗАВЖДИ з кореневого config.json. Шлях рахуємо відносно
// САМОГО цього файла (import.meta.url), тому він однаковий і для головної, і для
// сторінок у /modules. Завдяки цьому вхід — спільний для обох курсів (та сама
// сесія, той самий проєкт). Раніше різні data-config давали «різні проєкти» і
// повторний вхід на сторінках Architect.
const CONFIG_PATH = new URL("../config.json", import.meta.url).href;
// Сторінка «Мої сертифікати» — шлях відносно цього файла, тож однаковий
// і для головної, і для сторінок у /modules.
const CERT_URL = new URL("../certificate.html", import.meta.url).href;
let sb = null;
let mode = "login";
let modalEl = null;

/* ---------- Перевірки вводу (UX + базова гігієна) ----------
   Справжній захист — на сервері (Supabase: автентифікація, підтвердження
   пошти, обмеження частоти). Це лише клієнтська валідація: швидкий зрозумілий
   фідбек і відсів очевидно некоректного вводу до мережевого запиту. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;   // практична межа довжини email
const MIN_PASS = 6;      // мінімум від Supabase
const MAX_PASS = 128;    // розумна стеля (хешування й так обмежене)
const MIN_NAME = 2;
const MAX_NAME = 100;

// Очищаємо ім'я: прибираємо керівні символи й кутові дужки, тримаємо в межах довжини.
// (При виводі ім'я й так екранується через escapeHtml — це додатковий шар.)
function sanitizeName(value) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F<>]/g, "")
    .trim()
    .slice(0, MAX_NAME);
}

/* ---------- Старт ---------- */

async function boot() {
  let cfg;
  try {
    cfg = await fetch(CONFIG_PATH, { cache: "no-store" }).then((r) => r.json());
  } catch (e) {
    console.error("[AIA auth] не вдалося прочитати config.json:", e);
    return;
  }

  const s = cfg.supabase || {};
  if (!s.url || !s.anonKey || /ТВІЙ|YOUR_/.test(s.url + s.anonKey)) {
    console.warn("[AIA auth] заповни секцію \"supabase\" у config.json (url + anonKey).");
    return;
  }

  sb = createClient(s.url, s.anonKey);
  window.sb = sb;

  await buildModuleMap();
  await refreshSession();

  sb.auth.onAuthStateChange((_event, session) => {
    window.AIA_USER = session ? session.user : null;
    renderAuthControl();
    document.dispatchEvent(new CustomEvent("aia:auth", { detail: window.AIA_USER }));
  });

  buildModal();
  renderAuthControl();
}

async function buildModuleMap() {
  try {
    const { data, error } = await sb.from("modules").select("id, code");
    if (error) throw error;
    const map = {};
    (data || []).forEach((m) => { map[m.code] = m.id; });
    window.AIA_MODULE_MAP = map;
  } catch (e) {
    console.error("[AIA auth] modules:", e.message || e);
    window.AIA_MODULE_MAP = {};
  }
}

async function refreshSession() {
  const { data } = await sb.auth.getSession();
  const user = data && data.session ? data.session.user : null;
  window.AIA_USER = user;
  await hydrateProgress(user);
  document.dispatchEvent(new CustomEvent("aia:auth", { detail: user }));
}

async function hydrateProgress(user) {
  if (!window.AIAProgress) return;
  if (!user) { window.AIAProgress.hydrate([]); return; }
  try {
    const { data, error } = await sb
      .from("progress")
      .select("status, modules(code)")
      .eq("status", "completed");
    if (error) throw error;
    const codes = (data || []).map((r) => r.modules && r.modules.code).filter(Boolean);
    window.AIAProgress.hydrate(codes);
  } catch (e) {
    console.error("[AIA auth] progress:", e.message || e);
    window.AIAProgress.hydrate([]);
  }
}

/* ---------- Кнопка у шапці ---------- */

function renderAuthControl() {
  const anchor = document.getElementById("navProgress");
  let slot = document.getElementById("aiaAuth");
  if (!slot) {
    slot = document.createElement("div");
    slot.id = "aiaAuth";
    slot.className = "flex items-center gap-3";
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(slot, anchor);
    else { const h = document.querySelector("header"); if (h) h.appendChild(slot); }
  }

  const user = window.AIA_USER;
  if (user) {
    const name = (user.user_metadata && user.user_metadata.full_name) || user.email;
    slot.innerHTML =
      '<span class="hidden max-w-[12rem] truncate font-mono text-xs text-sand sm:inline">' + escapeHtml(name) + "</span>" +
      '<a href="' + CERT_URL + '" class="hidden rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-clay/60 hover:text-sand sm:inline-block">Сертифікати</a>' +
      '<button type="button" id="aiaLogout" class="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-clay/60 hover:text-sand">Вийти</button>';
    slot.querySelector("#aiaLogout").addEventListener("click", async () => {
      await sb.auth.signOut();
      location.reload();
    });
  } else {
    slot.innerHTML =
      '<button type="button" id="aiaLogin" class="rounded-lg bg-clay px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-clay-deep">Увійти</button>';
    slot.querySelector("#aiaLogin").addEventListener("click", () => openModal());
  }
}

/* ---------- Модальне вікно ---------- */

function buildModal() {
  if (modalEl) return;
  modalEl = document.createElement("div");
  modalEl.id = "aiaAuthModal";
  modalEl.className = "fixed inset-0 z-[60] hidden items-center justify-center bg-ink/80 p-4 backdrop-blur";
  modalEl.innerHTML =
    '<div class="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl">' +
      '<div class="mb-1 flex items-center justify-between">' +
        '<h2 class="font-display text-xl" id="aiaModalTitle">Вхід</h2>' +
        '<button type="button" id="aiaClose" class="text-faint transition hover:text-sand" aria-label="Закрити">✕</button>' +
      "</div>" +
      '<p id="aiaModalNote" class="mb-4 hidden text-sm text-muted"></p>' +
      '<div class="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-line p-1 text-sm">' +
        '<button type="button" data-tab="login" class="rounded-md px-3 py-1.5 transition">Вхід</button>' +
        '<button type="button" data-tab="register" class="rounded-md px-3 py-1.5 transition">Реєстрація</button>' +
      "</div>" +
      '<div class="space-y-3">' +
        '<input id="aiaName" type="text" placeholder="Ім\'я" autocomplete="name" maxlength="100" class="hidden w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory outline-none transition focus:border-clay/60" />' +
        '<p id="aiaNameHint" class="hidden -mt-1 text-xs text-faint">Це ім\'я з\'явиться у твоєму сертифікаті — вкажи його повністю.</p>' +
        '<input id="aiaEmail" type="email" placeholder="Email" autocomplete="email" inputmode="email" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="254" class="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory outline-none transition focus:border-clay/60" />' +
        '<input id="aiaPass" type="password" placeholder="Пароль (мін. 6 символів)" autocomplete="current-password" maxlength="128" class="w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory outline-none transition focus:border-clay/60" />' +
        '<p id="aiaError" class="hidden text-sm text-clay"></p>' +
        '<button type="button" id="aiaSubmit" class="w-full rounded-lg bg-clay px-4 py-2.5 font-medium text-ink transition hover:bg-clay-deep">Увійти</button>' +
      "</div>" +
    "</div>";
  document.body.appendChild(modalEl);

  modalEl.querySelector("#aiaClose").addEventListener("click", closeModal);
  modalEl.addEventListener("click", (e) => { if (e.target === modalEl) closeModal(); });
  modalEl.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => setTab(b.getAttribute("data-tab"))));
  modalEl.querySelector("#aiaSubmit").addEventListener("click", submit);
  modalEl.querySelector("#aiaPass").addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  setTab("login");
}

function setTab(t) {
  mode = t;
  const q = (s) => modalEl.querySelector(s);
  q("#aiaName").classList.toggle("hidden", t !== "register");
  q("#aiaNameHint").classList.toggle("hidden", t !== "register");
  q("#aiaModalTitle").textContent = t === "register" ? "Реєстрація" : "Вхід";
  q("#aiaSubmit").textContent = t === "register" ? "Зареєструватися" : "Увійти";
  q("#aiaPass").setAttribute("autocomplete", t === "register" ? "new-password" : "current-password");
  modalEl.querySelectorAll("[data-tab]").forEach((b) => {
    const active = b.getAttribute("data-tab") === t;
    b.classList.toggle("bg-clay", active);
    b.classList.toggle("text-ink", active);
    b.classList.toggle("font-medium", active);
    b.classList.toggle("text-muted", !active);
  });
  hideError();
}

function openModal(note) {
  buildModal();
  const noteEl = modalEl.querySelector("#aiaModalNote");
  noteEl.textContent = note || "";
  noteEl.classList.toggle("hidden", !note);
  modalEl.classList.remove("hidden");
  modalEl.classList.add("flex");
  setTimeout(() => modalEl.querySelector("#aiaEmail").focus(), 50);
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.add("hidden");
  modalEl.classList.remove("flex");
}

function showError(msg) {
  const el = modalEl.querySelector("#aiaError");
  el.textContent = msg; el.classList.remove("hidden");
}
function hideError() {
  const el = modalEl.querySelector("#aiaError");
  el.textContent = ""; el.classList.add("hidden");
}

async function submit() {
  const btn = modalEl.querySelector("#aiaSubmit");
  if (btn.disabled) return;            // захист від повторного кліку / подвійного Enter
  hideError();

  const email = modalEl.querySelector("#aiaEmail").value.trim().slice(0, MAX_EMAIL);
  const pass = modalEl.querySelector("#aiaPass").value;          // пароль НЕ обрізаємо
  const name = sanitizeName(modalEl.querySelector("#aiaName").value);

  // --- перевірки вводу ---
  if (!email) { showError("Вкажи email."); return; }
  if (!EMAIL_RE.test(email)) { showError("Схоже, email введено некоректно."); return; }
  if (!pass) { showError("Вкажи пароль."); return; }
  if (pass.length < MIN_PASS) { showError("Пароль має містити щонайменше 6 символів."); return; }
  if (pass.length > MAX_PASS) { showError("Пароль задовгий (максимум 128 символів)."); return; }
  if (mode === "register") {
    if (!name) { showError("Вкажи ім'я — воно з'явиться у сертифікаті."); return; }
    if (name.length < MIN_NAME) { showError("Ім'я надто коротке."); return; }
  }

  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = "Зачекай…";
  try {
    if (mode === "register") {
      const { data, error } = await sb.auth.signUp({
        email, password: pass, options: { data: { full_name: name } }
      });
      if (error) throw error;
      if (data.session) { location.reload(); return; }
      showError("Готово! Якщо прийшов лист — підтверди пошту, тоді увійди.");
      setTab("login");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      location.reload(); return;
    }
  } catch (e) {
    showError(translateError(e && e.message));
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

function translateError(msg) {
  if (!msg) return "Щось пішло не так. Спробуй ще раз.";
  if (/Invalid login credentials/i.test(msg)) return "Невірний email або пароль.";
  if (/already registered|already exists/i.test(msg)) return "Такий email уже зареєстровано — увійди.";
  if (/at least 6|password should be/i.test(msg)) return "Пароль має містити щонайменше 6 символів.";
  if (/Email not confirmed/i.test(msg)) return "Спершу підтверди email (перевір пошту).";
  return msg;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Публічний інтерфейс ---------- */
window.AIAAuth = {
  open: openModal,
  signOut: async () => { await sb.auth.signOut(); location.reload(); },
  user: () => window.AIA_USER || null
};

boot();
