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

async function verify(code) {
  code = (code || "").trim();
  if (!code) { show('<p class="text-muted">Введи код сертифіката.</p>'); return; }
  show('<p class="text-muted">Перевіряємо…</p>');
  try {
    const client = await getClient();
    const { data, error } = await client.rpc("verify_certificate", { p_code: code });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    show(row ? validCard(row) : invalidCard(code));
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
