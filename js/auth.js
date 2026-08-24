/* ============================================================
   AI Академія — ШАР ДАНИХ авторизації (Supabase).
   Підключається як <script type="module" src="js/auth.js">.

   Розмітки тут немає жодного рядка — увесь вигляд живе в
   js/auth-ui.js (класичний скрипт, вантажиться ПЕРЕД цим файлом).
   Контракт між файлами — dev/build/001-oauth-google/01-plan.md, розділ 5.

   Робить:
   • створює клієнт window.sb (ключі бере з config.json → "supabase");
   • тримає поточного користувача у window.AIA_USER, ім'я — у window.AIA_NAME;
   • будує карту модулів window.AIA_MODULE_MAP { code: uuid };
   • підвантажує прогрес користувача у window.AIAProgress.hydrate();
   • веде вхід поштою і вхід через Google (OAuth), читає ознаку помилки з URL;
   • читає й пише ім'я для сертифіката (public.profiles.full_name).

   Публічний інтерфейс:
     window.AIAAuth.open(note) · .signOut() · .user() · .name()
                   .editName(opener) · .confirmCertificateName({ opener })
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
let profileName = null;      // кеш public.profiles.full_name (null = порожньо)
let profileLoadedFor = null; // для якого user.id кеш актуальний
let uiWarned = false;

/* ---------- Межі й гігієна вводу ----------
   Валідація ФОРМИ (порожньо / формат / довжина) переїхала в js/auth-ui.js —
   тут лишились тільки ті межі, якими користується сам шар даних:
   нормалізація email перед запитом і очищення імені перед записом у базу.
   Справжній захист — на сервері (Supabase + RLS), це лише гігієна. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;   // практична межа довжини email
const MIN_NAME = 2;
const MAX_NAME = 100;

// Очищаємо ім'я: прибираємо керівні символи й кутові дужки, тримаємо в межах довжини.
// УВАГА: діапазон керівних символів записаний ЕСКЕЙПАМИ (\u0000-\u001F), а не
// літеральними байтами — інакше git починає вважати файл бінарним.
function sanitizeName(value) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F<>]/g, "")
    .trim()
    .slice(0, MAX_NAME);
}

function normalizeEmail(value) {
  return String(value == null ? "" : value).trim().slice(0, MAX_EMAIL);
}

/* ---------- Міст до шару вигляду ---------- */

// js/auth-ui.js — класичний скрипт без defer, тому за специфікацією HTML він
// виконується ДО будь-якого type="module". Якщо його все-таки немає (404 через
// регістр шляху, помилка деплою) — кажемо про це голосно один раз, а не мовчимо.
function ui() {
  const u = window.AIAAuthUI;
  if (!u) {
    if (!uiWarned) {
      uiWarned = true;
      console.error("[AIA auth] js/auth-ui.js не завантажився — інтерфейс входу недоступний.");
    }
    return null;
  }
  return u;
}

/* ---------- Старт ---------- */

async function boot() {
  // 1. ЧИТАЄМО URL ПЕРШИМ. supabase-js із detectSessionInUrl вичищає auth-параметри
  //    сам і асинхронно — прочитати пізніше означає не прочитати взагалі.
  const oauthPanel = readOAuthError();
  const hadAuthParams = oauthPanel !== null || hasAuthCode();

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

  // 2. Клієнт.
  sb = createClient(s.url, s.anonKey);
  window.sb = sb;

  // 3. Одразу після createClient, до refreshSession — віддаємо шару вигляду handlers.
  const u = ui();
  if (u) u.init({ handlers: handlers, certUrl: CERT_URL });

  await buildModuleMap();

  // 4. Сесія. САМЕ ТУТ supabase-js обмінює ?code= на сесію (PKCE).
  await refreshSession();

  // 5. І ТІЛЬКИ ТЕПЕР чистимо URL. Раніше — зітремо ?code= до обміну,
  //    і вхід тихо не відбудеться: без помилки, без панелі, просто «нічого».
  if (hadAuthParams) cleanUrl();

  sb.auth.onAuthStateChange((event, session) => {
    const user = session ? session.user : null;
    window.AIA_USER = user;
    const id = user ? user.id : null;

    // USER_UPDATED (наслідок sb.auth.updateUser після збереження імені) НЕ має
    // перезавантажувати сторінку — інакше вона перезавантажиться посеред діалогу,
    // просто перед submit_quiz. Тільки перечитуємо ім'я й перемальовуємо слот.
    if (id !== profileLoadedFor) {
      loadProfileName(user).then(renderSlot);
    } else {
      renderSlot();
    }
    document.dispatchEvent(new CustomEvent("aia:auth", { detail: user }));
  });

  renderSlot();

  // 6. Повернулись із помилкою — модалку відкриваємо самі.
  if (oauthPanel && u) u.openAuthModal({ panel: oauthPanel });
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
  // Ім'я і прогрес незалежні — тягнемо паралельно, щоб не подовжувати холодний старт.
  await Promise.all([loadProfileName(user), hydrateProgress(user)]);
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

/* ---------- Ім'я для сертифіката ----------
   Джерело правди — public.profiles.full_name: саме звідти
   maybe_issue_certificate() бере ім'я у мить видачі
   (звірено з живою базою 2026-08-24: coalesce(full_name, email, 'Студент')).
   Метадані auth.users при зв'язуванні Google-акаунта може перезаписати
   сам Supabase, тому покладатись на них не можна. */

async function loadProfileName(user) {
  profileName = null;
  profileLoadedFor = user ? user.id : null;
  if (user) {
    try {
      const { data, error } = await sb
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      const v = data && data.full_name ? String(data.full_name).trim() : "";
      profileName = v || null;
    } catch (e) {
      // Не фатально: currentName() впаде на метадані. Але мовчати не можна.
      console.warn("[AIA auth] profiles.full_name:", e.message || e);
      profileName = null;
    }
  }
  window.AIA_NAME = currentName();
  return profileName;
}

// Ланцюжок читання: profiles.full_name → user_metadata.full_name →
// user_metadata.name → user.email. Перше непорожнє після trim().
// Далі («Студент») — це вже підказка інтерфейсу, не дані.
function currentName() {
  const user = window.AIA_USER;
  if (!user) return null;
  const meta = user.user_metadata || {};
  const chain = [profileName, meta.full_name, meta.name, user.email];
  for (let i = 0; i < chain.length; i++) {
    const v = chain[i] == null ? "" : String(chain[i]).trim();
    if (v) return v;
  }
  return null;
}

// ГОЛОВНА пастка цієї частини: PostgREST на UPDATE без збігів повертає
// error: null і порожній результат. Наївний код відрапортує «збережено»,
// а в PDF поїде старе ім'я. Тому гілок ТРИ, а не дві.
async function saveName(name) {
  if (!sb) return { ok: false, message: "Сервіс ще не готовий. Онови сторінку і спробуй ще раз." };
  const user = window.AIA_USER;
  if (!user) return { ok: false, message: "Спершу увійди." };

  const clean = sanitizeName(name);
  if (!clean) return { ok: false, message: "Вкажи ім'я — воно з'явиться у сертифікаті." };
  if (clean.length < MIN_NAME) return { ok: false, message: "Ім'я надто коротке." };

  let data = null;
  let error = null;
  try {
    const res = await sb
      .from("profiles")
      .update({ full_name: clean })
      .eq("id", user.id)
      .select("full_name")
      .maybeSingle();
    data = res.data;
    error = res.error;
  } catch (e) {
    error = e;
  }

  if (error) {
    console.error("[AIA auth] saveName:", error.message || error);
    return { ok: false, message: "Не вдалося зберегти ім'я. Перевір з'єднання і спробуй ще раз." };
  }
  if (!data) {
    console.error("[AIA auth] profiles row missing for", user.id);
    return { ok: false, message: "Не вдалося зберегти ім'я. Онови сторінку і спробуй ще раз." };
  }

  profileName = (data.full_name && String(data.full_name).trim()) || clean;
  profileLoadedFor = user.id;
  window.AIA_NAME = currentName();
  renderSlot();

  // Другий крок — best-effort. Метадані потрібні лише для того, щоб інші
  // (майбутні) читачі бачили те саме ім'я; помилка тут користувача не стосується.
  try {
    const r = await sb.auth.updateUser({ data: { full_name: clean } });
    if (r && r.error) console.warn("[AIA auth] updateUser:", r.error.message);
  } catch (e) {
    console.warn("[AIA auth] updateUser:", e.message || e);
  }

  return { ok: true, name: profileName };
}

/* ---------- Прапорець «ім'я вже підтверджували» ----------
   Окремої колонки в базі дизайн не передбачає, тому це localStorage.
   На іншому пристрої людина побачить повний діалог замість м'якого —
   це не поломка, а лише втрата послаблення. */

function nameFlagKey() {
  const user = window.AIA_USER;
  return user ? "aia:nameConfirmed:" + user.id : null;
}

function nameConfirmed() {
  try {
    const k = nameFlagKey();
    return !!(k && localStorage.getItem(k));
  } catch (e) {
    return false;   // приватний режим: вважаємо, що не підтверджували
  }
}

function markNameConfirmed() {
  try {
    const k = nameFlagKey();
    if (k) localStorage.setItem(k, "1");
  } catch (e) {
    /* приватний режим — просто лишаємось без послаблення, це не помилка */
  }
}

/* ---------- Слот у шапці ---------- */

function renderSlot() {
  const u = ui();
  if (!u || typeof u.renderSlot !== "function") return;
  const user = window.AIA_USER;
  u.renderSlot({
    status: user ? "user" : "guest",
    name: user ? currentName() : null,
    email: user ? (user.email || null) : null,
    userId: user ? user.id : null
  });
}

/* ---------- Діалог імені ---------- */

// Головний шлях: віддаємо діалогу onSave, і він зберігає, ПОКИ ЩЕ ВІДКРИТИЙ —
// при невдачі людина лишається в тому самому діалозі з текстом помилки
// (критерій приймання 18). Якщо версія auth-ui.js onSave не викликала —
// зберігаємо самі й відкриваємо діалог знову вже з помилкою.
async function runNameDialog(mode, opener) {
  const u = ui();
  if (!u || typeof u.openNameDialog !== "function") return false;

  const user = window.AIA_USER;
  let value = currentName() || "";
  let errorText = "";

  for (;;) {
    let savedInside = false;
    let res;
    try {
      res = await u.openNameDialog({
        mode: mode,
        value: value,
        opener: opener,
        userId: user ? user.id : undefined,
        error: errorText || undefined,
        onSave: function (clean) {
          return saveName(clean).then(function (r) {
            if (r.ok) savedInside = true;
            return r;
          });
        }
      });
    } catch (e) {
      console.error("[AIA auth] openNameDialog:", (e && e.message) || e);
      return false;
    }
    if (!res || res.action === "cancelled") return false;
    if (savedInside) { markNameConfirmed(); return true; }

    value = res.name == null ? value : res.name;
    const saved = await saveName(value);
    if (saved.ok) { markNameConfirmed(); return true; }
    errorText = saved.message;
  }
}

// Гарантований дотик перед завершенням останнього модуля.
// true  → ім'я підтверджено, можна кликати submit_quiz
// false → скасовано, на сервер НІЧОГО не йде
async function confirmCertificateName(opts) {
  const opener = opts && opts.opener;
  const u = ui();
  // Інтерфейсу немає (auth-ui.js не завантажився) — не блокуємо людині прогрес
  // через нашу поломку: поводимось, як до цієї задачі.
  if (!u || typeof u.openNameDialog !== "function") return true;
  if (!window.AIA_USER) return true;   // без сесії submit_quiz і так відмовить
  return runNameDialog(nameConfirmed() ? "soft" : "last", opener);
}

function editName(opener) {
  return runNameDialog("permanent", opener);
}

/* ---------- OAuth ---------- */

async function signInWithGoogle() {
  if (!sb) return { ok: false, panel: "open" };
  // redirectTo обов'язково без search і без hash: інакше після повернення
  // старі параметри змішаються з новими code/error і очищення URL стане
  // неоднозначним. Ціна — втрачений якір на сторінці модуля, це прийнятно.
  const back = location.origin + location.pathname;
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: back }
    });
    if (error) throw error;
    return { ok: true };   // далі браузер сам іде на Google
  } catch (e) {
    console.error("[AIA auth] oauth:", (e && e.message) || e);
    return { ok: false, panel: "open" };
  }
}

// Ознака помилки приходить у location.search (потік — authorization code).
// Читання hash лишаємо оборонно: вимикач потоку живе на боці Supabase.
function readOAuthError() {
  let out = null;
  ["search", "hash"].forEach(function (part) {
    const raw = location[part] || "";
    if (!raw) return;
    const p = new URLSearchParams(raw.replace(/^[#?]/, ""));
    const code = p.get("error_code") || p.get("error");
    if (!code) return;
    const d = (p.get("error_description") || "").toLowerCase();
    const probe = (code + " " + d).toLowerCase();
    if (/access_denied|denied|cancel/.test(probe)) out = "cancelled";
    else if (/identity|already|exists|conflict/.test(probe)) out = "conflict";
    else out = "other";
  });
  return out;
}

function hasAuthCode() {
  try {
    const q = new URLSearchParams(location.search);
    if (q.has("code") || q.has("access_token")) return true;
    const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    return h.has("code") || h.has("access_token");
  } catch (e) {
    return false;
  }
}

// Прибираємо ЛИШЕ auth-параметри. Не location.pathname навпростець:
// так на сторінці модуля виживають і ?utm_source=, і якір #lesson-3.
function cleanUrl() {
  const AUTH_KEYS = ["code", "state", "error", "error_code", "error_description",
    "access_token", "refresh_token", "expires_in", "expires_at",
    "token_type", "provider_token", "provider_refresh_token", "type"];
  try {
    const url = new URL(location.href);
    let touched = false;
    AUTH_KEYS.forEach(function (k) {
      if (url.searchParams.has(k)) { url.searchParams.delete(k); touched = true; }
    });
    // hash може бути і якорем сторінки, і носієм implicit-потоку
    if (url.hash && AUTH_KEYS.some(function (k) { return new RegExp("[#&]" + k + "=").test(url.hash); })) {
      url.hash = "";
      touched = true;
    }
    if (touched) history.replaceState(null, "", url.pathname + url.search + url.hash);
  } catch (e) {
    console.warn("[AIA auth] cleanUrl:", e.message || e);
  }
}

/* ---------- Вхід поштою ---------- */

async function signInWithPassword(payload) {
  if (!sb) return { ok: false, message: "Сервіс ще не готовий. Онови сторінку і спробуй ще раз." };
  const email = normalizeEmail(payload && payload.email);
  const password = (payload && payload.password) || "";
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Схоже, email введено некоректно." };

  try {
    const { error } = await sb.auth.signInWithPassword({ email: email, password: password });
    if (error) throw error;
    location.reload();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: translateError(e && e.message, e) };
  }
}

async function signUp(payload) {
  if (!sb) return { ok: false, message: "Сервіс ще не готовий. Онови сторінку і спробуй ще раз." };
  const email = normalizeEmail(payload && payload.email);
  const password = (payload && payload.password) || "";
  const name = sanitizeName(payload && payload.name);
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Схоже, email введено некоректно." };
  if (!name || name.length < MIN_NAME) {
    return { ok: false, message: "Вкажи ім'я — воно з'явиться у сертифікаті." };
  }

  try {
    const { data, error } = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
    // Тригер on_auth_user_created → handle_new_user() (SECURITY DEFINER) сам
    // покладе це ім'я у public.profiles.full_name.
    if (data && data.session) { location.reload(); return { ok: true, session: true }; }
    return { ok: true, session: false };
  } catch (e) {
    return { ok: false, message: translateError(e && e.message, e) };
  }
}

async function signOut() {
  try {
    if (sb) await sb.auth.signOut();
  } catch (e) {
    console.warn("[AIA auth] signOut:", e.message || e);
  }
  location.reload();
}

function translateError(msg, err) {
  const status = err && (err.status || err.statusCode);
  const code = (err && err.code) || "";
  const probe = String(code) + " " + String(msg || "");
  // Перевіряємо ПЕРШИМ: при 429 тіло відповіді може взагалі не мати тексту.
  if (status === 429 || /over_email_send_rate_limit|over_request_rate_limit|rate limit|too many requests/i.test(probe)) {
    return "Забагато спроб. Зачекай хвилину і спробуй ще раз.";
  }
  if (!msg) return "Щось пішло не так. Спробуй ще раз.";
  if (/Invalid login credentials/i.test(msg)) return "Невірний email або пароль.";
  if (/already registered|already exists/i.test(msg)) return "Такий email уже зареєстровано — увійди.";
  if (/at least 6|password should be/i.test(msg)) return "Пароль має містити щонайменше 6 символів.";
  if (/Email not confirmed/i.test(msg)) return "Спершу підтверди email (перевір пошту).";
  return msg;
}

/* ---------- Контракт із шаром вигляду (розділ 5.3 плану) ---------- */

const handlers = {
  signInWithGoogle: signInWithGoogle,
  signInWithPassword: signInWithPassword,
  signUp: signUp,
  saveName: saveName,
  signOut: signOut
};

/* ---------- Публічний інтерфейс ---------- */

window.AIAAuth = {
  // Сумісність: js/progress.js, js/module.js і js/certificate.js кличуть open()
  open: function (note) {
    const u = ui();
    if (u) u.openAuthModal(note ? { note: note } : {});
  },
  signOut: signOut,
  user: function () { return window.AIA_USER || null; },
  name: function () { return currentName(); },
  editName: editName,
  confirmCertificateName: confirmCertificateName
};

boot();
