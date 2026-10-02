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
   • веде ВІДНОВЛЕННЯ ПАРОЛЯ (015): просить лист, читає ознаку повернення з
     листа, обмінює token_hash на сесію й відкриває діалог нового пароля;
   • читає й пише ім'я для сертифіката (public.profiles.full_name).

   Контракт із шаром вигляду доповнено двома обробниками (015, 01-plan.md §3.1):
     handlers.requestPasswordReset({ email }) → { ok } | { ok:false, message }
     handlers.updatePassword(password)        → { ok } | { ok:false, message }
   і одним викликом у зворотний бік: window.AIAAuthUI.openPasswordDialog({ onSave }).

   Публічний інтерфейс (015 його НЕ розширює — зовнішніх споживачів у
   відновлення немає):
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
let metaSyncedFor = null;    // для якого user.id уже вирівнювали метадані
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
// 015 · межі пароля. Ті самі числа перевіряє форма в js/auth-ui.js — ця копія
// потрібна тому, що updatePassword() кличуть не лише з форми, і покладатись на
// чужу валідацію шар даних не має права.
const MIN_PASS = 6;
const MAX_PASS = 128;

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

// Опис помилки для консолі БЕЗ чутливого. Друкувати сирий об'єкт помилки
// supabase-js не можна: в AuthApiError лежить і тіло відповіді. Тому беремо
// лише name/status і текст, з якого вирізано все, схоже на токен, код чи
// довгий ідентифікатор (сегмент JWT, PKCE-код, uuid — усе це 20+ символів
// суцільної латиниці з цифрами).
function safeErrorText(e) {
  const name = (e && e.name) || "Error";
  const status = e && e.status != null ? " " + e.status : "";
  const msg = String((e && e.message) || "")
    // 015 \u00b7 \u0430\u0434\u0440\u0435\u0441\u0430 \u043f\u043e\u0448\u0442\u0438 \u0442\u0435\u0436 \u043d\u0435 \u043c\u0430\u0454 \u043f\u043e\u0442\u0440\u0430\u043f\u043b\u044f\u0442\u0438 \u0432 \u043a\u043e\u043d\u0441\u043e\u043b\u044c: \u0443 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044f\u0445 GoTrue
    // \u043d\u0430 /recover \u0456 /user \u0432\u043e\u043d\u0430 \u0442\u0440\u0430\u043f\u043b\u044f\u0454\u0442\u044c\u0441\u044f \u0412 \u0422\u0415\u041a\u0421\u0422\u0406 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f, \u0430 \u043f\u0456\u0434
    // \u043f\u0440\u0430\u0432\u0438\u043b\u043e \u00ab20+ \u0441\u0438\u043c\u0432\u043e\u043b\u0456\u0432 \u043f\u043e\u0441\u043f\u0456\u043b\u044c\u00bb \u043a\u043e\u0440\u043e\u0442\u043a\u0430 \u0430\u0434\u0440\u0435\u0441\u0430 \u043d\u0435 \u043f\u0456\u0434\u043f\u0430\u0434\u0430\u0454.
    .replace(/[^\s@]+@[^\s@]+/g, "\u2026")
    .replace(/[A-Za-z0-9_-]{20,}/g, "\u2026")
    .slice(0, 120);
  return name + status + (msg ? ": " + msg : "");
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
  let oauthPanel = readOAuthError();
  // 015 · ознаку повернення з листа читаємо ТУТ, а не слухаємо подію
  // PASSWORD_RECOVERY: supabase-js шле її з _initialize() через setTimeout(0),
  // а підписка onAuthStateChange нижче стається аж після двох мережевих кроків —
  // подію ми гарантовано пропустимо.
  const recovery = readRecovery();
  const hadCode = hasAuthCode();
  const hadAuthParams = oauthPanel !== null || hadCode || recovery !== null;
  // Ознака «на Google людину відправили саме ми» — ставиться в signInWithGoogle
  // перед редіректом, читається тут рівно один раз (див. takeOAuthStarted).
  const cameFromGoogle = takeOAuthStarted();

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
  if (u) ensureLinkExpiredText(u);

  // 3b. 015 · обмін token_hash з листа на сесію — ОБОВ'ЯЗКОВО до кроку 4.
  //     Якщо обміняти після refreshSession(), ім'я в шапці й прогрес на сторінці
  //     уроку завантажаться від гостя, і людина побачить порожню шапку з
  //     відкритим діалогом пароля.
  //     kind === "implicit" тут нічого не потребує: сесію з #access_token
  //     підхопить сам supabase-js (detectSessionInUrl увімкнений типово).
  if (recovery && recovery.kind === "token") {
    try {
      const { error } = await sb.auth.verifyOtp({
        token_hash: recovery.tokenHash,
        type: "recovery"
      });
      if (error) throw error;
    } catch (e) {
      // Не ковтаємо: прострочене чи вже використане посилання — звичайна
      // ситуація, але причину має бути видно. Через safeErrorText, бо сирий
      // AuthApiError несе тіло відповіді.
      console.warn("[AIA auth] verifyOtp:", safeErrorText(e));
    }
  }

  // 4. Сесія. САМЕ ТУТ supabase-js обмінює ?code= на сесію (PKCE).
  //    011 · рядок 8: мапа модулів і сесія незалежні (мапу читає лише запис
  //    прогресу, тобто клік, який завжди пізніший), тому тягнемо їх паралельно —
  //    aia:auth і hydrate() приходять на один мережевий крок раніше, і гейт
  //    заблокованого уроку для залогіненого стає швидше.
  await Promise.all([buildModuleMap(), refreshSession()]);

  // 4b. Був ?code=, а сесії після обміну так і немає — вхід провалився мовчки.
  //     ЧОМУ НЕ ЧЕРЕЗ ПОМИЛКУ getSession(): supabase-js ковтає помилку обміну
  //     всередині _initialize() і назовні віддає error === null (перевірено на
  //     auth-js 2.112.4, 2026-08-24). Ба більше — якщо в сховищі немає
  //     code-verifier, обміну не буде взагалі, навіть без запиту в мережу.
  //     Тому єдина надійна ознака — СТАН: код у URL був, користувача немає.
  if (hadCode && !window.AIA_USER) {
    console.warn("[AIA auth] повернення з ?code= не дало сесії — вхід не відбувся.");
    // Панель показуємо лише тому, хто справді йшов через нашу кнопку. Сторонній
    // ?code= у посиланні (промо-мітка, чужий редірект) не має лякати гостя
    // помилкою входу, якого він не починав.
    if (!oauthPanel && cameFromGoogle) oauthPanel = "other";
  }

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
  if (oauthPanel && u) {
    u.openAuthModal({ panel: oauthPanel });
  } else if (recovery && u) {
    // 015 · ознака відновлення була. Два результати, і третього немає:
    //   сесія є   → людина підтвердила володіння поштою, просимо новий пароль;
    //   сесії нема → посилання протерміноване/використане/підроблене.
    if (window.AIA_USER) runPasswordDialog();
    else u.openAuthModal({ panel: "link-expired" });
  }
}

async function buildModuleMap() {
  try {
    const { data, error } = await sb.from("modules").select("id, code");
    if (error) throw error;
    const map = {};
    (data || []).forEach((m) => { map[m.code] = m.id; });
    window.AIA_MODULE_MAP = map;
  } catch (e) {
    console.error("[AIA auth] modules:", safeErrorText(e));
    window.AIA_MODULE_MAP = {};
  }
}

async function refreshSession() {
  const { data, error } = await sb.auth.getSession();
  // Помилку читання сесії не ковтаємо: без неї «людина лишилась гостем» і
  // «зламався порядок у boot()» виглядають однаково. У вивід іде ТІЛЬКИ
  // знеособлений опис — сирий об'єкт помилки supabase-js містить тіло
  // відповіді, а там можуть бути токени.
  if (error) console.warn("[AIA auth] getSession:", safeErrorText(error));
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
    console.error("[AIA auth] progress:", safeErrorText(e));
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
      syncMetaName(user, profileName);
    } catch (e) {
      // Не фатально: currentName() впаде на метадані. Але мовчати не можна.
      console.warn("[AIA auth] profiles.full_name:", safeErrorText(e));
      profileName = null;
    }
  }
  window.AIA_NAME = currentName();
  return profileName;
}

/* Самолікування розходження profiles.full_name ↔ user_metadata.full_name.
   Напрямок ЛИШЕ один: profiles → метадані. Джерело правди — profiles
   (саме звідти maybe_issue_certificate бере ім'я у мить видачі), метадані
   лише наздоганяють, щоб інші читачі бачили те саме.

   Три запобіжники, і кожен потрібен:
   • порожнє ім'я не пишемо ніколи — для currentName() метадані можуть бути
     єдиним джерелом, і порожній запис прибрав би ім'я з шапки;
   • один раз на user.id за завантаження сторінки — updateUser породжує
     USER_UPDATED → ще один aia:auth, і без прапорця це був би цикл;
   • best-effort: нічого не чекаємо, нічого не показуємо людині, profileName
     і window.AIA_NAME з відповіді не переписуємо. */
function syncMetaName(user, name) {
  if (!sb || !user || !name) return;
  if (metaSyncedFor === user.id) return;
  const meta = user.user_metadata || {};
  if (String(meta.full_name || "").trim() === name) return;
  metaSyncedFor = user.id; // ставиться ДО виклику, не після відповіді
  try {
    Promise.resolve(sb.auth.updateUser({ data: { full_name: name } }))
      .then((r) => {
        if (r && r.error) console.warn("[AIA auth] updateUser (sync):", safeErrorText(r.error));
      })
      .catch((e) => console.warn("[AIA auth] updateUser (sync):", safeErrorText(e)));
  } catch (e) {
    console.warn("[AIA auth] updateUser (sync):", safeErrorText(e));
  }
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
    console.error("[AIA auth] saveName:", safeErrorText(error));
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
    if (r && r.error) console.warn("[AIA auth] updateUser:", safeErrorText(r.error));
  } catch (e) {
    console.warn("[AIA auth] updateUser:", safeErrorText(e));
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

// Ознака «ми самі відправили людину на Google». Переживає редірект у тій самій
// вкладці й читається рівно один раз. Саме sessionStorage, а не localStorage:
// інша вкладка й наступний сеанс про цей потік знати не мають.
// Потрібна вона рівно для одного рішення в boot(): чи показувати панель
// помилки, коли повернення з ?code= не дало сесії.
const OAUTH_FLAG = "aia:oauth-started";

function markOAuthStarted() {
  // Сховище може бути недоступним (приватний режим, заблоковані куки) — тоді
  // ознаки просто не буде, і boot() обмежиться рядком у консолі без панелі.
  // Це не проглинута помилка, а свідома деградація: вхід від цього не ламається.
  try { sessionStorage.setItem(OAUTH_FLAG, "1"); } catch (e) { /* сховище недоступне */ }
}

function takeOAuthStarted() {
  try {
    const had = sessionStorage.getItem(OAUTH_FLAG) === "1";
    sessionStorage.removeItem(OAUTH_FLAG);
    return had;
  } catch (e) {
    return false;   // те саме: немає сховища — немає ознаки
  }
}

async function signInWithGoogle() {
  if (!sb) return { ok: false, panel: "open" };
  // redirectTo обов'язково без search і без hash: інакше після повернення
  // старі параметри змішаються з новими code/error і очищення URL стане
  // неоднозначним. Ціна — втрачений якір на сторінці модуля, це прийнятно.
  const back = location.origin + location.pathname;
  // Ставимо ДО виклику: редірект відбувається всередині signInWithOAuth, після
  // нього наш код може вже не виконатись.
  markOAuthStarted();
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: back }
    });
    if (error) throw error;
    return { ok: true };   // далі браузер сам іде на Google
  } catch (e) {
    takeOAuthStarted();   // редіректу не буде — знімаємо ознаку, щоб не висіла
    console.error("[AIA auth] oauth:", safeErrorText(e));
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
    // 015 · ЦЯ ГІЛКА МАЄ СТОЯТИ ПЕРШОЮ. GoTrue повертає прострочене посилання
    // як error=access_denied&error_code=otp_expired, тобто наступна перевірка
    // зловила б його раніше й показала «Вхід через Google скасовано» — хибну
    // причину, після якої людина не знає, що робити.
    if (/otp_expired|email link is invalid|email link has expired/.test(probe)) out = "link-expired";
    else if (/access_denied|denied|cancel/.test(probe)) out = "cancelled";
    else if (/identity|already|exists|conflict/.test(probe)) out = "conflict";
    else out = "other";
  });
  return out;
}

/* ---------- Відновлення пароля (015) ---------- */

// Ознака «людина прийшла з листа». Три стани, інших немає:
//   { kind: "token", tokenHash } — лист із шаблону (посилання несе token_hash);
//   { kind: "implicit" }         — запас на випадок, якщо шаблон колись
//                                  повернуть до {{ .ConfirmationURL }};
//   null                         — звичайне завантаження сторінки.
// Дивимось і в search, і в hash: формат залежить від шаблону листа, а він
// живе не в коді, а в Dashboard, тож покладатись на одне місце не можна.
function readRecovery() {
  try {
    const parts = [location.search, location.hash];
    for (let i = 0; i < parts.length; i++) {
      const raw = parts[i] || "";
      if (!raw) continue;
      const p = new URLSearchParams(raw.replace(/^[#?]/, ""));
      if ((p.get("type") || "").toLowerCase() !== "recovery") continue;
      const tokenHash = p.get("token_hash");
      if (tokenHash) return { kind: "token", tokenHash: tokenHash };
      if (p.get("access_token")) return { kind: "implicit" };
    }
  } catch (e) {
    console.warn("[AIA auth] readRecovery:", (e && e.message) || e);
  }
  return null;
}

// Тонка обгортка над діалогом нового пароля: нічого не вирішує сама, лише
// зводить шар вигляду з обробником updatePassword.
// Якщо auth-ui.js старіший і методу ще немає — кажемо це в консоль і виходимо.
// Сторінка від цього не ламається: людина вже в сесії й може працювати далі.
async function runPasswordDialog(opener) {
  const u = ui();
  if (!u || typeof u.openPasswordDialog !== "function") {
    console.warn("[AIA auth] openPasswordDialog недоступний — онови js/auth-ui.js.");
    return false;
  }
  try {
    const res = await u.openPasswordDialog({
      opener: opener,
      onSave: function (password) { return updatePassword(password); }
    });
    return !!(res && res.action === "saved");
  } catch (e) {
    console.error("[AIA auth] openPasswordDialog:", safeErrorText(e));
    return false;
  }
}

// Запобіжник на час, поки шар вигляду ще не знає виду панелі "link-expired":
// buildErrorPanel() падає на T.err.other, а це «Не вдалося увійти через Google» —
// текст, який до відновлення пароля не має жодного стосунку.
// Нічого не перезаписує: щойно js/auth-ui.js оголосить свій рядок, цей код
// мовчки нічого не робить. Тексти — зона шару вигляду, це лише страховка.
function ensureLinkExpiredText(u) {
  try {
    const err = u && u.texts && u.texts.err;
    if (!err || err["link-expired"]) return;
    err["link-expired"] = {
      title: "Посилання вже не діє",
      why: "Воно діє одну годину й лише один раз. Схоже, час минув або ти вже ним скористався.",
      act: "Надіслати новий лист",
      actId: "open-reset",
      alt: "або увійди паролем нижче"
    };
  } catch (e) {
    /* тексти недоступні — панель просто буде загальною, вхід від цього не ламається */
  }
}

// Лист «Відновлення пароля». Повертає { ok: true } ОДНАКОВО — існує акаунт із
// такою адресою чи ні (так поводиться й сам Supabase: resetPasswordForEmail
// не розкриває наявність акаунта). Інакше форма стала б перевіркою
// «чи зареєстрований цей email».
async function requestPasswordReset(payload) {
  if (!sb) return { ok: false, message: "Сервіс ще не готовий. Онови сторінку і спробуй ще раз." };
  const email = normalizeEmail(payload && payload.email);
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Схоже, email введено некоректно." };

  // Без search і без hash — рівно як у signInWithGoogle: інакше після
  // повернення з листа старі параметри змішаються з token_hash і очищення
  // URL стане неоднозначним.
  const back = location.origin + location.pathname;
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: back });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.warn("[AIA auth] resetPasswordForEmail:", safeErrorText(e));
    return { ok: false, message: translateError(e && e.message, e) };
  }
}

// Новий пароль для вже відкритої сесії. БЕЗ location.reload(): updateUser
// породжує USER_UPDATED → onAuthStateChange вище сам перемалює шапку, а
// перезавантаження закрило б діалог просто перед екраном успіху.
async function updatePassword(password) {
  if (!sb) return { ok: false, message: "Сервіс ще не готовий. Онови сторінку і спробуй ще раз." };
  const value = String(password == null ? "" : password);
  if (value.length < MIN_PASS) return { ok: false, message: "Пароль має містити щонайменше 6 символів." };
  if (value.length > MAX_PASS) return { ok: false, message: "Пароль задовгий (максимум 128 символів)." };

  try {
    const { error } = await sb.auth.updateUser({ password: value });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.warn("[AIA auth] updatePassword:", safeErrorText(e));
    return { ok: false, message: translateError(e && e.message, e) };
  }
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
  // 015 · "token_hash" тут обов'язковий: без нього адреса після відновлення
  // лишилась би з робочим (а після verifyOtp — уже використаним) токеном,
  // який поїхав би далі в історію браузера, закладки й «поділитись».
  const AUTH_KEYS = ["code", "state", "error", "error_code", "error_description",
    "access_token", "refresh_token", "expires_in", "expires_at",
    "token_type", "provider_token", "provider_refresh_token", "type",
    "token_hash"];
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
    console.warn("[AIA auth] signOut:", safeErrorText(e));
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
  // D-02 (QA коло 1, 015) · обрив мережі. Метро, Wi-Fi без інтернету, вимкнений
  // модем — не рідкість, а англійське "Failed to fetch" під українським полем
  // читається як поломка сайту. Розпізнаємо ДВОМА незалежними ознаками, бо
  // текст у кожного браузера свій:
  //   • сам об'єкт помилки: auth-js обгортає будь-яке відхилення fetch у
  //     AuthRetryableFetchError зі status === 0 (виміряно на @supabase/auth-js
  //     2.117.2 — саму версію віддає esm.sh на "@supabase/supabase-js@2" —
  //     lib/fetch.js, _handleRequest → catch). Саме status === 0 тут несучий:
  //     той самий клас прилітає й на HTTP 500/502/503/504/520-530, але там
  //     інтернет у людини є, і текст про нього був би брехнею;
  //   • текст: Chrome "Failed to fetch", Firefox "NetworkError when attempting
  //     to fetch resource.", Safari рівно "Load failed", undici "fetch failed".
  // err.status читаємо НАПРЯМУ, а не через status вище: там `err.status ||
  // err.statusCode`, і для нуля це дає undefined (0 — хибне значення).
  if ((err && err.name === "AuthRetryableFetchError" && err.status === 0) ||
      /failed to fetch|networkerror when attempting to fetch|network request failed/i.test(probe) ||
      /^\s*(load failed|fetch failed)\s*\.?\s*$/i.test(String(msg || ""))) {
    return "Немає зв'язку. Перевір інтернет і спробуй ще раз.";
  }
  // 015 · відновлення пароля. Перевіряємо по code + message (а не лише по msg):
  // у частини відповідей GoTrue текст порожній, а код є.
  if (/same_password|should be different/i.test(probe)) {
    return "Новий пароль має відрізнятися від старого.";
  }
  if (/Auth session missing|session_not_found/i.test(probe)) {
    return "Посилання вже не діє — надішли лист ще раз.";
  }
  if (/otp_expired|Email link is invalid or has expired|Token has expired/i.test(probe)) {
    return "Посилання вже не діє — надішли лист ще раз.";
  }
  if (/email_address_not_authorized|Email address .* not authorized/i.test(probe)) {
    return "Не вдалося надіслати лист. Напиши нам — допоможемо.";
  }
  if (!msg) return "Щось пішло не так. Спробуй ще раз.";
  if (/Invalid login credentials/i.test(msg)) return "Невірний email або пароль.";
  if (/already registered|already exists/i.test(msg)) return "Такий email уже зареєстровано — увійди.";
  if (/at least 6|password should be/i.test(msg)) return "Пароль має містити щонайменше 6 символів.";
  if (/Email not confirmed/i.test(msg)) return "Спершу підтверди email (перевір пошту).";
  // D-02 · тут стояло `return msg` — і будь-який невпізнаний текст Supabase
  // їхав під поле англійською. Контракт функції: на вхід сире повідомлення
  // провайдера, на вихід — ГОТОВИЙ український текст, тож неперекладене
  // замінюємо загальним. Сирий текст не губимо: лишаємо в консолі через
  // safeErrorText, тобто без адреси пошти й без токенів. Логуємо лише ТУТ,
  // у єдиній гілці «не впізнали»: впізнані ситуації або вже залоговані на
  // місці виклику, або штатні.
  console.warn("[AIA auth] немає перекладу для помилки:", safeErrorText(err || { message: msg }));
  return "Щось пішло не так. Спробуй ще раз.";
}

/* ---------- Контракт із шаром вигляду (розділ 5.3 плану) ---------- */

const handlers = {
  signInWithGoogle: signInWithGoogle,
  signInWithPassword: signInWithPassword,
  signUp: signUp,
  saveName: saveName,
  signOut: signOut,
  // 015 · 01-plan.md §3.1. Обидва повертають { ok: true } або
  // { ok: false, message } з ГОТОВИМ українським текстом — шар вигляду
  // показує message як є й нічого не перекладає.
  requestPasswordReset: requestPasswordReset,
  updatePassword: updatePassword
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
