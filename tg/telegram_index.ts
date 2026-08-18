// ============================================================
//  AI Академія — Edge Function "telegram"
//  Розташування (CLI): supabase/functions/telegram/index.ts
//  Або вставити цей код у вебредактор Edge Functions у Dashboard.
//
//  Робить дві речі:
//   1) Приймає оновлення від Telegram-бота: /start, /id, /menu, /stats, /export,
//      кнопки постійної клавіатури («📊 Статистика», «⬇️ Експорт»)
//      та натискання inline-кнопок (callback_query).
//   2) Приймає Database Webhook на вставку в profiles → шле адміну
//      сповіщення «нова реєстрація».
//
//  ВАЖЛИВО:
//   • Деплоїти з вимкненим "Verify JWT" (Telegram не шле Supabase-токен).
//   • Секрети (Edge Functions → Secrets):
//       TELEGRAM_BOT_TOKEN     — токен від @BotFather
//       ADMIN_CHAT_ID          — твій особистий chat_id (дізнатись: /id боту)
//       WEBHOOK_SECRET         — будь-який випадковий рядок (для DB-вебхука)
//       TELEGRAM_SECRET_TOKEN  — будь-який випадковий рядок. Без нього ADMIN_CHAT_ID
//                                у тілі запиту НІЧИМ не підтверджений: URL функції
//                                вираховується з публічного project ref (config.json),
//                                тож будь-хто може надіслати підроблений апдейт напряму.
//     SUPABASE_URL і SUPABASE_SERVICE_ROLE_KEY додаються автоматично.
//
//   • Після деплою прив'яжи цей самий секрет до вебхука в Telegram:
//       curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL функції>&secret_token=<TELEGRAM_SECRET_TOKEN>"
//     Без цього виклику Telegram не надсилатиме заголовок і перевірка нижче
//     нічого не дасть — крок обов'язковий, а не опційний.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const ADMIN = Deno.env.get("ADMIN_CHAT_ID") ?? "";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TG_SECRET = Deno.env.get("TELEGRAM_SECRET_TOKEN") ?? "";

// Підписи кнопок постійної клавіатури (мають точно збігатися при маршрутизації).
const BTN_STATS = "📊 Статистика";
const BTN_EXPORT = "⬇️ Експорт";

// Постійна клавіатура під полем вводу — щоб не шукати слеш-команди.
const ADMIN_MENU = {
  keyboard: [[{ text: BTN_STATS }, { text: BTN_EXPORT }]],
  resize_keyboard: true,
  is_persistent: true,
};

// Inline-кнопка «Експорт» (з'являється під повідомленням статистики).
const EXPORT_INLINE = { inline_keyboard: [[{ text: "⬇️ Експорт CSV", callback_data: "export" }]] };

function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

async function sendMessage(chatId: string | number, text: string, replyMarkup?: unknown) {
  const payload: Record<string, unknown> = {
    chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true,
  };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Прибирає «годинник» на натиснутій inline-кнопці.
async function answerCallback(callbackId: string, text?: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text: text ?? "" }),
  });
}

async function sendCsv(chatId: string | number, filename: string, csv: string) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  // \uFEFF (BOM) — щоб Excel коректно показав кирилицю
  form.append("document", new Blob(["\uFEFF" + csv], { type: "text/csv" }), filename);
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendDocument`, { method: "POST", body: form });
}

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function toCsv(rows: any[]): string {
  const head = ["email", "ім'я", "роль", "зареєстрований", "пройдено", "усього", "сертифікат"];
  const lines = [head.join(",")];
  for (const r of rows) {
    lines.push([
      r.email, r.full_name, r.role,
      r.registered ? new Date(r.registered).toISOString().slice(0, 10) : "",
      r.completed, r.total, r.certificate ? "так" : "ні",
    ].map(csvCell).join(","));
  }
  return lines.join("\n");
}

const isAdmin = (chatId: string | number) => ADMIN && String(chatId) === String(ADMIN);

// Підтверджує, що запит справді від Telegram, а не підробка з вгаданим
// ADMIN_CHAT_ID: Telegram підписує вебхук секретним токеном, якщо його
// задано через setWebhook(secret_token=...) — див. коментар угорі файлу.
function isFromTelegram(req: Request): boolean {
  return !TG_SECRET || req.headers.get("x-telegram-bot-api-secret-token") === TG_SECRET;
}

// ---- Дії (спільні для команд, кнопок-клавіатури та inline-кнопок) ----

async function actionStats(chatId: string | number) {
  const { data, error } = await admin().rpc("admin_user_report");
  if (error) { await sendMessage(chatId, "Помилка: " + escapeHtml(error.message)); return; }
  const rows = data ?? [];
  const finished = rows.filter((d: any) => d.total > 0 && d.completed >= d.total).length;
  const certs = rows.filter((d: any) => d.certificate).length;
  await sendMessage(
    chatId,
    `📊 <b>Статистика</b>\n` +
    `Користувачів: ${rows.length}\n` +
    `Завершили курс: ${finished}\n` +
    `Сертифікатів: ${certs}`,
    EXPORT_INLINE,
  );
}

async function actionExport(chatId: string | number) {
  const { data, error } = await admin().rpc("admin_user_report");
  if (error) { await sendMessage(chatId, "Помилка: " + escapeHtml(error.message)); return; }
  const rows = data ?? [];
  if (!rows.length) { await sendMessage(chatId, "Користувачів поки немає."); return; }
  const today = new Date().toISOString().slice(0, 10);
  await sendCsv(chatId, `users_${today}.csv`, toCsv(rows));
}

Deno.serve(async (req) => {
  let body: any;
  try { body = await req.json(); } catch { return new Response("ok"); }

  // --- 1) Database Webhook: нова реєстрація ---
  if (body && body.type && body.record && body.table) {
    if (WEBHOOK_SECRET && req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
      return new Response("forbidden", { status: 403 });
    }
    if (body.table === "profiles" && body.type === "INSERT" && ADMIN) {
      const r = body.record;
      await sendMessage(
        ADMIN,
        `🟢 <b>Нова реєстрація</b>\n` +
        `Ім'я: ${escapeHtml(r.full_name || "—")}\n` +
        `Email: ${escapeHtml(r.email || "—")}`,
      );
    }
    return new Response("ok");
  }

  // --- 2) Натискання inline-кнопки (callback_query) ---
  const cq = body?.callback_query;
  if (cq) {
    if (!isFromTelegram(req)) return new Response("forbidden", { status: 403 });
    const chatId = cq.message?.chat?.id ?? cq.from?.id;
    await answerCallback(cq.id);
    if (!isAdmin(chatId)) { await sendMessage(chatId, "🔒 Лише для адміна."); return new Response("ok"); }
    if (cq.data === "stats") await actionStats(chatId);
    else if (cq.data === "export") await actionExport(chatId);
    return new Response("ok");
  }

  // --- 3) Текстове повідомлення / команда / кнопка клавіатури ---
  const msg = body?.message;
  if (msg && typeof msg.text === "string") {
    if (!isFromTelegram(req)) return new Response("forbidden", { status: 403 });
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text === "/start" || text === "/id" || text === "/menu") {
      if (isAdmin(chatId)) {
        await sendMessage(
          chatId,
          `Привіт, адміне! Користуйся кнопками нижче 👇\n` +
          `Слеш-команди теж працюють: /stats, /export.`,
          ADMIN_MENU,
        );
      } else {
        await sendMessage(
          chatId,
          `Привіт! Твій chat_id: <code>${chatId}</code>\n\n` +
          `Додай його у секрет <b>ADMIN_CHAT_ID</b>, щоб користуватись адмін-командами:\n` +
          `/export — CSV усіх користувачів\n/stats — коротка статистика`,
        );
      }
    } else if (text === "/stats" || text === BTN_STATS) {
      if (!isAdmin(chatId)) { await sendMessage(chatId, "🔒 Лише для адміна."); return new Response("ok"); }
      await actionStats(chatId);
    } else if (text === "/export" || text === BTN_EXPORT) {
      if (!isAdmin(chatId)) { await sendMessage(chatId, "🔒 Лише для адміна."); return new Response("ok"); }
      await actionExport(chatId);
    } else {
      await sendMessage(
        chatId,
        "Не знаю такої команди. Скористайся кнопками нижче або /stats, /export.",
        isAdmin(chatId) ? ADMIN_MENU : undefined,
      );
    }
  }

  return new Response("ok");
});
