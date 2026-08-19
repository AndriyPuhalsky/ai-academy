// ============================================================
//  AI Академія — Edge Function "contact"
//  Розташування (CLI): supabase/functions/contact/index.ts
//  Або вставити цей код у вебредактор Edge Functions у Dashboard.
//
//  Приймає POST від форми «Написати нам» (js/contact.js). Перевіряє на
//  сервері (клієнтська перевірка — лише зручність, не захист):
//   • honeypot-поле (боти часто заповнюють приховані поля)
//   • Cloudflare Turnstile (чи це людина)
//   • rate-limit по IP (не більше RATE_LIMIT_MAX запитів за RATE_LIMIT_WINDOW_MIN хв)
//   • формат/довжину полів
//  Далі пише запис у contact_messages і шле сповіщення адміну в Telegram —
//  той самий бот, що й tg/telegram_index.ts (там же кнопка «✉️ Повідомлення»
//  показує історію звернень з цієї таблиці).
//
//  ВАЖЛИВО:
//   • Спершу виконай tg/contact_messages.sql у Supabase SQL Editor —
//     без таблиці функція впаде на вставці.
//   • Деплоїти з вимкненим "Verify JWT" (форму заповнюють анонімні
//     відвідувачі сайту, Supabase-сесії в них немає).
//   • Секрети (Edge Functions → Secrets):
//       TELEGRAM_BOT_TOKEN     — той самий токен, що й у функції "telegram"
//       ADMIN_CHAT_ID          — той самий chat_id
//       TURNSTILE_SECRET_KEY   — Cloudflare Dashboard → Turnstile → сайт → Secret key
//                                (якщо не задати — перевірку Turnstile пропускаємо,
//                                 як і з іншими необов'язковими секретами в проєкті)
//     SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY додаються автоматично.
//   • Публічний Site key Turnstile — у config.json → "contact.turnstileSiteKey"
//     (це не секрет, можна комітити; секретний ключ — лише в секретах вище).
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const ADMIN = Deno.env.get("ADMIN_CHAT_ID") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TURNSTILE_SECRET = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";

// Джерела, яким дозволено звертатись до цієї публічної форми.
const ALLOWED_ORIGINS = [
  "https://ai-academia.com.ua",
  "https://ai-academy.andriy-puhalsky.workers.dev",
  "https://dev-ai-academy.andriy-puhalsky.workers.dev",
];

// Хости, яким Cloudflare Turnstile підтверджує проходження виклику. Без цієї
// перевірки будь-хто міг би вставити наш публічний site key на СВОЄМУ сайті,
// нафармити валідні токени й реплеїти їх сюди в обхід капчі.
const ALLOWED_TURNSTILE_HOSTNAMES = new Set([
  "ai-academia.com.ua",
  "ai-academy.andriy-puhalsky.workers.dev",
  "dev-ai-academy.andriy-puhalsky.workers.dev",
  "localhost",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NAME = 2;
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_TELEGRAM = 100;
const MIN_MESSAGE = 5;
const MAX_MESSAGE = 2000;
const RATE_LIMIT_WINDOW_MIN = 10;
const RATE_LIMIT_MAX = 3;

function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin) || origin.startsWith("http://localhost:");
}

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    "Vary": "Origin",
  };
}

function json(status: number, body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

async function sendMessage(chatId: string | number, text: string) {
  if (!TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
}

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip");
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true; // не налаштовано — не блокуємо (як WEBHOOK_SECRET у функції "telegram")
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.set("secret", TURNSTILE_SECRET);
    form.set("response", token);
    if (ip) form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    return data.success === true && ALLOWED_TURNSTILE_HOSTNAMES.has(data.hostname);
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" }, origin);

  let body: any;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: "bad_request" }, origin); }

  // Honeypot: приховане поле, яке справжній відвідувач ніколи не заповнить.
  // Мовчки повертаємо "успіх", щоб бот не зрозумів, що його впіймали.
  if (body.hp) return json(200, { ok: true }, origin);

  const full_name = String(body.full_name ?? "").trim().slice(0, MAX_NAME);
  const email = String(body.email ?? "").trim().slice(0, MAX_EMAIL);
  const telegram = String(body.telegram ?? "").trim().slice(0, MAX_TELEGRAM);
  const message = String(body.message ?? "").trim().slice(0, MAX_MESSAGE);
  const turnstileTokenValue = String(body.turnstileToken ?? "");

  if (!full_name || full_name.length < MIN_NAME) return json(422, { ok: false, error: "invalid_name" }, origin);
  if (!email || !EMAIL_RE.test(email)) return json(422, { ok: false, error: "invalid_email" }, origin);
  if (!message || message.length < MIN_MESSAGE) return json(422, { ok: false, error: "invalid_message" }, origin);

  const ip = clientIp(req);

  const humanVerified = await verifyTurnstile(turnstileTokenValue, ip);
  if (!humanVerified) return json(403, { ok: false, error: "turnstile_failed" }, origin);

  const db = admin();

  if (ip) {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60_000).toISOString();
    const { count } = await db
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_MAX) return json(429, { ok: false, error: "rate_limited" }, origin);
  }

  const { error: insertError } = await db.from("contact_messages").insert({
    full_name, email, telegram: telegram || null, message, ip,
  });
  if (insertError) return json(500, { ok: false, error: "server_error" }, origin);

  if (ADMIN) {
    await sendMessage(
      ADMIN,
      `✉️ <b>Нове повідомлення з сайту</b>\n` +
      `Ім'я: ${escapeHtml(full_name)}\n` +
      `Email: ${escapeHtml(email)}\n` +
      `Telegram: ${telegram ? escapeHtml(telegram) : "—"}\n\n` +
      `${escapeHtml(message)}`,
    );
  }

  return json(200, { ok: true }, origin);
});
