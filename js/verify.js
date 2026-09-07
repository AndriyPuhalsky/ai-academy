/* ============================================================
   AI Академія — публічна перевірка сертифіката.
   Працює без входу: створює власний клієнт Supabase (anon) і
   викликає RPC verify_certificate(p_code). Код можна передати
   через ?code=... в URL або ввести вручну.

   010 · етап 8. Три зміни, усі — з пакета дизайн-системи 009:
   1. Розмітка результату — ds-card / ds-badge / ds-note замість
      45 Tailwind-утиліт. ⚠ Жодної Tailwind-утиліти в цьому файлі:
      клас, що приходить у DOM лише з JS, CDN генерує через ~53 мс
      (006 D-02, зсув 64,8 px). Відступи всередині карток задані
      інлайновими style із ТОКЕНІВ (--s-*), не числами.
   2. П4-38 · підказка про кириличні двійники тепер показується в
      ОБОХ гілках. Було: тільки на знайденому сертифікаті, тобто в
      картці «не знайдено» людина бачила вже виправлений код і
      жодного пояснення, чому він інакший, ніж вона набирала. Це
      єдина сторінка сайту для сторонніх людей.
   3. Живий лічильник «n / 12» і помилка біля порожнього поля —
      два рядки чеклиста етапу 1, які чекали саме цього файла.
      Кнопка свідомо НЕ disabled: заблокована кнопка не пояснює,
      чого від людини хочуть, і не читається як помилка.
   ============================================================ */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONFIG_PATH = document.documentElement.getAttribute("data-config") || "config.json";
const CODE_LEN = 12;
let sb = null;
let lastCode = "";   // для кнопки «Спробувати ще раз» у картці помилки мережі

function esc(v) {
  return String(v == null ? "" : v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }); }
  catch (e) { return iso || ""; }
}

async function getClient() {
  if (sb) return sb;
  const cfg = await fetch(CONFIG_PATH, { cache: "no-store" }).then((r) => r.json());
  const s = cfg.supabase || {};
  if (!s.url || !s.anonKey) throw new Error("supabase не налаштовано в config.json");
  sb = createClient(s.url, s.anonKey);
  return sb;
}

function show(html) {
  const out = document.getElementById("verifyResult");
  if (out) out.innerHTML = html;
}

/* ---------- Розмітка результату ----------
   Вертикальний ритм — інлайновими style із токенів (--s-1 = 4px,
   --s-5 = 20px, --s-6 = 24px). Це не «магічні числа»: та сама шкала,
   з якої Tailwind бере mt-1 / mt-5 / mt-6 у статичній розмітці. Класи
   утиліт тут не можна (див. шапку файла), а нового CSS цей файл не
   заводить — правити css/components.css не його зона. */
const MT = (n) => ' style="margin-top:var(--s-' + n + ')"';

function validCard(row, code) {
  return (
    '<div class="ds-card">' +
      '<p class="ds-badge ds-badge--done" data-glyph="✓">Сертифікат дійсний</p>' +
      '<p class="ds-eyebrow"' + MT(6) + '>Виданий на імʼя</p>' +
      '<p class="ds-h2"' + MT(1) + '>' + esc(row.full_name) + '</p>' +
      '<p class="ds-eyebrow"' + MT(5) + '>Курс</p>' +
      '<p class="ds-h4"' + MT(1) + '>«' + esc(row.course_title) + '»</p>' +
      '<p class="ds-small"' + MT(6) + '>Видано ' + esc(fmtDate(row.issued_at)) + '</p>' +
      '<p class="ds-small"' + MT(1) + '>Код <code class="ds-code--inline">' + esc(code) + '</code></p>' +
    '</div>'
  );
}

function invalidCard(code) {
  return (
    '<div class="ds-card">' +
      '<p class="ds-badge ds-badge--soon" data-glyph="○">Сертифікат не знайдено</p>' +
      '<p' + MT(5) + '>Коду <code class="ds-code--inline">' + esc(code) + '</code> у базі немає. ' +
        'Перевір, чи всі ' + CODE_LEN + ' символів переписані правильно — найчастіше плутають ' +
        '<code class="ds-code--inline">0</code> і <code class="ds-code--inline">o</code>, ' +
        '<code class="ds-code--inline">1</code> і <code class="ds-code--inline">l</code>.</p>' +
    '</div>'
  );
}

function loadingCard() {
  return (
    '<div class="ds-card">' +
      '<span class="ds-skel ds-skel--name" style="display:block" aria-hidden="true"></span>' +
      '<p class="ds-small"' + MT(4) + '>Перевіряємо…</p>' +
    '</div>'
  );
}

function netErrorCard() {
  return (
    '<div class="ds-note ds-note--err" role="alert">' +
      '<span class="ds-note__glyph" aria-hidden="true">✕</span>' +
      '<p class="ds-note__title">Не вдалося перевірити</p>' +
      '<p>Сервер перевірки зараз недоступний. Це не означає, що сертифікат ' +
        'недійсний — спробуй за хвилину.</p>' +
      '<p><button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="retry">' +
        'Спробувати ще раз</button></p>' +
    '</div>'
  );
}

/* ---------- Нормалізація коду ----------
   Код сертифіката — 12 символів [0-9a-f] (див. міграцію 005-1: substr від
   gen_random_uuid без дефісів). Людина переписує його з паперу або копіює
   з PDF, тому в поле приїжджають три речі, яких у базі не буває: пробіли,
   верхній регістр і кириличні двійники латинських літер. Реально «рятують»
   лише а/с/е — решта в hex не зустрічається, але лишена для повноти:
   з нею результат такий самий, як зараз (не знайдено), тільки чесніший.
   Валідацію формату свідомо НЕ додаємо: 006 не міняє поведінку «не знайдено». */
const HOMOGLYPHS = {
  "а": "a",  // U+0430
  "с": "c",  // U+0441
  "е": "e",  // U+0435
  "і": "i",  // U+0456
  "о": "o",  // U+043E
  "р": "p",  // U+0440
  "х": "x",  // U+0445
  "у": "y",  // U+0443
  "ѕ": "s",  // U+0455
  "ј": "j"  // U+0458
};
// Регулярка збирається з ключів мапи — щоб два списки не розійшлись.
const HOMOGLYPH_RE = new RegExp("[" + Object.keys(HOMOGLYPHS).join("") + "]", "g");

function normalizeCode(raw) {
  return String(raw)
    .replace(/\s+/g, "")                                   // 1. пробіли всередині
    .toLowerCase()                                          // 2. регістр (і кирилиця теж)
    .replace(HOMOGLYPH_RE, (ch) => HOMOGLYPHS[ch] || ch);   // 3. кирилиця → латиниця
}

/* Чи були в коді САМЕ кириличні двійники. Окремо від norm !== raw, бо
   нормалізація знімає ще пробіли й регістр, а врізка нижче каже про
   кирилицю — і на «ABC» замість «abc» це була б неправда. */
function hasHomoglyph(raw) {
  const src = String(raw).toLowerCase();
  for (let i = 0; i < src.length; i++) if (HOMOGLYPHS[src.charAt(i)]) return true;
  return false;
}

/* Виправлений код із позначенням саме тих знакомісць, де стояла кирилиця.
   Позначка — накресленням (<b>), а не кольором: правило «стан ніколи не
   кодується лише кольором». Зміну регістру НЕ позначаємо: врізка про
   кирилицю, і жирне «A→a» читалось би як ще один підмінений символ.
   Прохід посимвольний, тому в екзотичних випадках він міг би розійтися
   зі строковим normalizeCode() (контекстні правила toLowerCase) — тоді
   мовчки віддаємо простий варіант, а не брехливий. */
function markFixed(raw, norm) {
  const src = String(raw).replace(/\s+/g, "");
  let out = "", plain = "";
  for (let i = 0; i < src.length; i++) {
    const low = src.charAt(i).toLowerCase();
    const swap = HOMOGLYPHS[low];
    plain += swap || low;
    out += swap ? "<b>" + esc(swap) + "</b>" : esc(low);
  }
  return plain === norm ? out : esc(norm);
}

/* Підказка про кирилицю. Два тексти, бо в двох гілках людині потрібне
   різне: у «знайдено» — що саме ми виправили, у «не знайдено» — що робити
   далі (копіювати з PDF, а не переписувати з паперу). */
function fixedNote(raw, norm, found) {
  const marked = markFixed(raw, norm);
  const tail = found
    ? 'Так буває, коли код переписують з паперу: кирилична ' +
      '<code class="ds-code--inline">с</code> і латинська ' +
      '<code class="ds-code--inline">c</code> виглядають однаково.'
    : 'Якщо код точно правильний, спробуй скопіювати його з PDF, ' +
      'а не переписувати з паперу.';
  return (
    '<div class="ds-note ds-note--info">' +
      '<span class="ds-note__glyph" aria-hidden="true">i</span>' +
      '<p>У коді були кириличні літери — ми виправили їх на латиницю: ' +
        '<code class="ds-code--inline">' + marked + '</code>. ' + tail + '</p>' +
    '</div>'
  );
}

/* ---------- Поле: лічильник і помилка ---------- */

function fieldEls() {
  return {
    field: document.getElementById("verifyField"),
    input: document.getElementById("verifyInput"),
    count: document.getElementById("verifyCount"),
    error: document.getElementById("verifyFieldError"),
    live: document.getElementById("ariaLive")
  };
}

/* Лічильник каже про коротке введення ДО натискання кнопки, а не після
   відповіді бази: сьогодні «не знайдено» показують і на обрізаний код,
   і на чужий, і людина не може їх розрізнити. */
function updateCount() {
  const { input, count } = fieldEls();
  if (!input || !count) return;
  const n = input.value.replace(/\s+/g, "").length;
  count.textContent = n + " / " + CODE_LEN;
  count.setAttribute("data-state", n < CODE_LEN ? "short" : n === CODE_LEN ? "full" : "over");
}

function setFieldError(on) {
  const { field, input, error, live } = fieldEls();
  if (field) field.classList.toggle("ds-fld--error", on);
  if (error) error.hidden = !on;
  if (input) {
    if (on) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }
  if (on) {
    if (input) input.focus();
    if (live) live.textContent = "Поле порожнє: введи код сертифіката.";
  }
}

/* ---------- Перевірка ---------- */

async function verify(code) {
  const raw = (code || "").trim();
  if (!raw) { setFieldError(true); return; }
  setFieldError(false);

  const norm = normalizeCode(raw);
  const changed = norm !== raw;          // пробіли, регістр, кирилиця
  const fixed = changed && hasHomoglyph(raw);   // тільки кирилиця → врізка
  lastCode = raw;
  show(loadingCard());

  try {
    const client = await getClient();
    const { data, error } = await client.rpc("verify_certificate", { p_code: norm });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    // Підказка йде ВСЕРЕДИНУ #verifyResult, щоб її підхопив role="status".
    if (row) {
      show(validCard(row, norm) + (fixed ? fixedNote(raw, norm, true) : ""));
      if (changed) {
        // Поле показує саме той код, який пішов у базу.
        const input = document.getElementById("verifyInput");
        if (input) { input.value = norm; updateCount(); }
      }
    } else {
      // П4-38: у картці «не знайдено» показуємо саме той код, який пішов у
      // базу, — і поруч пояснення, ЧОМУ він інакший, ніж людина набирала.
      show(invalidCard(norm) + (fixed ? fixedNote(raw, norm, false) : ""));
    }
  } catch (e) {
    console.error("[AIA verify]", e.message || e);
    show(netErrorCard());
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("verifyInput");
  const btn = document.getElementById("verifyBtn");
  const result = document.getElementById("verifyResult");

  if (btn) btn.addEventListener("click", function () { verify(input ? input.value : ""); });
  if (input) {
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") verify(input.value); });
    // Друк одразу знімає помилку порожнього поля — інакше вона висить,
    // поки людина не натисне кнопку вдруге.
    input.addEventListener("input", function () { updateCount(); setFieldError(false); });
    updateCount();
  }
  // «Спробувати ще раз» у картці помилки мережі. Слухач на контейнері, бо
  // сама кнопка живе лише в цьому одному стані й перестворюється щоразу.
  if (result) result.addEventListener("click", function (e) {
    const b = e.target.closest("[data-act='retry']");
    if (b) verify(lastCode || (input ? input.value : ""));
  });

  const code = new URLSearchParams(location.search).get("code");
  if (code) {
    if (input) { input.value = code; updateCount(); }
    verify(code);
  }
});
