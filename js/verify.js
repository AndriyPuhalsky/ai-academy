/* ============================================================
   AI Академія — публічна перевірка сертифіката.
   Працює без входу: створює власний клієнт Supabase (anon) і
   викликає RPC verify_certificate(p_code). Код можна передати
   через ?code=... в URL або ввести вручну.
   ============================================================ */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONFIG_PATH = document.documentElement.getAttribute("data-config") || "config.json";
let sb = null;

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

function validCard(row) {
  return (
    '<div class="rounded-2xl border border-clay/50 bg-surface p-8 text-center">' +
      '<p class="font-display text-2xl text-clay">✓ Сертифікат дійсний</p>' +
      '<p class="mt-5 text-sm text-muted">Виданий на ім\'я</p>' +
      '<p class="mt-1 font-display text-3xl">' + esc(row.full_name) + '</p>' +
      '<p class="mt-4 text-sm text-muted">Курс</p>' +
      '<p class="mt-1 text-lg font-medium">«' + esc(row.course_title) + '»</p>' +
      '<p class="mt-4 font-mono text-xs text-faint">Видано: ' + esc(fmtDate(row.issued_at)) + '</p>' +
    '</div>'
  );
}

function invalidCard(code) {
  return (
    '<div class="rounded-2xl border border-line bg-surface p-8 text-center">' +
      '<p class="font-display text-2xl">Сертифікат не знайдено</p>' +
      '<p class="mt-3 text-muted">Код <span class="font-mono text-sand">' + esc(code) + '</span> недійсний або сертифікат не існує.</p>' +
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

function fixedNote(norm) {
  return '<p class="mt-3 text-sm text-muted">У коді були кириличні літери — ми виправили їх на латиницю: ' +
    '<span class="font-mono text-sand">' + esc(norm) + '</span></p>';
}

async function verify(code) {
  const raw = (code || "").trim();
  if (!raw) { show('<p class="text-muted">Введи код сертифіката.</p>'); return; }
  const norm = normalizeCode(raw);
  const fixed = norm !== raw;
  show('<p class="text-muted">Перевіряємо…</p>');
  try {
    const client = await getClient();
    const { data, error } = await client.rpc("verify_certificate", { p_code: norm });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      // Підказка йде ВСЕРЕДИНУ #verifyResult, щоб її підхопив role="status".
      show(validCard(row) + (fixed ? fixedNote(norm) : ""));
      if (fixed) {
        const input = document.getElementById("verifyInput");
        if (input) input.value = norm;
      }
    } else {
      // У картці «не знайдено» показуємо саме той код, який пішов у базу.
      show(invalidCard(norm));
    }
  } catch (e) {
    console.error("[AIA verify]", e.message || e);
    show('<p class="text-clay">Не вдалося перевірити. Спробуй пізніше.</p>');
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("verifyInput");
  const btn = document.getElementById("verifyBtn");
  if (btn) btn.addEventListener("click", function () { verify(input ? input.value : ""); });
  if (input) input.addEventListener("keydown", function (e) { if (e.key === "Enter") verify(input.value); });

  const code = new URLSearchParams(location.search).get("code");
  if (code) {
    if (input) input.value = code;
    verify(code);
  }
});
