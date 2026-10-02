// ============================================================
//  AI Академія — Edge Function "telegram"
//  Розташування (CLI): supabase/functions/telegram/index.ts
//  Або вставити цей код у вебредактор Edge Functions у Dashboard.
//
//  Робить три речі:
//   1) Приймає оновлення від Telegram-бота: /start, /id, /menu, /stats, /export,
//      /messages, /certs, кнопки постійної клавіатури («📊 Статистика»,
//      «⬇️ Експорт», «✉️ Повідомлення», «🎓 Сертифікати») та натискання
//      inline-кнопок (callback_query).
//      «✉️ Повідомлення» показує останні звернення з форми «Написати нам»
//      (таблиця contact_messages, наповнює окрема функція "contact" —
//      див. tg/contact_index.ts + tg/contact_messages.sql).
//      «🎓 Сертифікати» (013) віддає CSV: рядок на кожного зареєстрованого,
//      колонка на кожен курс; у клітинці — сертифікат, прогрес або «—».
//   2) Приймає Database Webhook на вставку:
//        • profiles     → «нова реєстрація»;
//        • certificates → «новий сертифікат» (013; тригер
//          trg_notify_new_certificate, див. dev/build/013-tg-certificates/).
//   3) 015 · на ту саму вставку в profiles надсилає САМІЙ ЛЮДИНІ лист
//      «Вітаємо в AI Академії» через HTTP API Resend. Окремого тригера й нової
//      міграції не треба: вебхук реєстрації вже несе email і full_name.
//      Лист і повідомлення адміну йдуть через Promise.allSettled — збій одного
//      не має забирати з собою друге.
//
//  ВАЖЛИВО:
//   • Деплоїти з вимкненим "Verify JWT" (Telegram не шле Supabase-токен).
//   • Секрети (Edge Functions → Secrets):
//       TELEGRAM_BOT_TOKEN     — токен від @BotFather
//       ADMIN_CHAT_ID          — твій особистий chat_id (дізнатись: /id боту)
//       WEBHOOK_SECRET         — будь-який випадковий рядок (для DB-вебхука).
//                                Те саме значення має лежати в базі: у тілі
//                                notify_new_profile() (реєстрації) і в Supabase
//                                Vault під іменем telegram_webhook_secret
//                                (сертифікати, 013).
//       TELEGRAM_SECRET_TOKEN  — будь-який випадковий рядок. Без нього ADMIN_CHAT_ID
//                                у тілі запиту НІЧИМ не підтверджений: URL функції
//                                вираховується з публічного project ref (config.json),
//                                тож будь-хто може надіслати підроблений апдейт напряму.
//       RESEND_API_KEY         — 015 · ключ Resend із правом «Sending access».
//                                Без нього лист «Вітаємо» просто не йде (рядок
//                                у лог), а решта функції працює як раніше.
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
// 015 · лист «Вітаємо». Відправник той самий, що й у листах Supabase Auth
// (SMTP Resend), — один «від кого» в усій пошті краще проходить фільтри
// й виглядає для людини як одне джерело.
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = "AI Академія <no-reply@ai-academia.com.ua>";

// Підписи кнопок постійної клавіатури (мають точно збігатися при маршрутизації).
const BTN_STATS = "📊 Статистика";
const BTN_EXPORT = "⬇️ Експорт";
const BTN_MESSAGES = "✉️ Повідомлення";
const BTN_CERTS = "🎓 Сертифікати";

// Постійна клавіатура під полем вводу — щоб не шукати слеш-команди.
const ADMIN_MENU = {
  keyboard: [
    [{ text: BTN_STATS }, { text: BTN_EXPORT }],
    [{ text: BTN_MESSAGES }, { text: BTN_CERTS }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

// Канонічний домен сайту. Потрібен для посилання на публічну перевірку
// сертифіката: у PDF воно будується від location.href (js/certificate.js),
// а боту брати звідкись адресу нема, тож вона тут літералом.
// Форма БЕЗ «.html»: Cloudflare Workers віддає 307 з /verify.html на /verify
// (перевірено на проді 2026-10-01), а канонічна адреса дає 200 без переходу.
const SITE_URL = "https://ai-academia.com.ua";

// Назви курсів «як на сайті» — у базі в першого курсу title «AI Essentials»,
// такої назви на сайті немає. Ключ — courses.slug. П'ятий курс, якого тут
// ще нема, з'явиться колонкою сам: фолбек — courses.title.
const COURSE_NAMES: Record<string, string> = {
  "ai-essentials": "AI Академія",
  "ai-architect": "AI Architect",
  "claude-code": "AI Термінал",
  "jira": "Jira з нуля",
};

function courseLabel(c: { slug?: string; title?: string }): string {
  return COURSE_NAMES[String(c?.slug ?? "")] ?? String(c?.title ?? c?.slug ?? "—");
}

function verifyUrl(code: string): string {
  return SITE_URL + "/verify?code=" + encodeURIComponent(code);
}

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

// ---- Дати в київському часі (013) ----
// Edge Functions живуть в UTC, а адмін читає звіт у Києві: о 00:30 за Києвом
// UTC-дата ще «вчорашня», тож без timeZone і назва файла, і дата видачі
// сертифіката були б зсунуті на добу.
function kyivDate(iso: string | number | Date, style: "dots" | "iso"): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d.getTime())) return typeof iso === "string" ? iso.slice(0, 10) : "";
  try {
    // uk-UA → «01.10.2026»; en-CA → «2026-10-01».
    return new Intl.DateTimeFormat(style === "dots" ? "uk-UA" : "en-CA", {
      timeZone: "Europe/Kyiv", day: "2-digit", month: "2-digit", year: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

// ---- Читання таблиці сторінками (013) ----
// PostgREST обрізає відповідь на межі «Max rows» (у Supabase типово 1000) і
// робить це МОВЧКИ — звіт показав би неправильні числа без жодної помилки.
// Тому читаємо сторінками до кінця, із запобіжником: якщо даних більше, ніж
// очікуємо, краще сказати про це адміну, ніж надіслати неправду.
const PAGE_SIZE = 1000;
const MAX_PAGES = 100;

async function selectAll(
  sb: ReturnType<typeof admin>,
  table: string,
  columns: string,
  eq?: [string, string],
): Promise<any[]> {
  const out: any[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE_SIZE;
    // Фільтр — ДО order/range: у supabase-js .eq() живе на filter-будівельнику,
    // а .order()/.range() вертають transform-будівельник, у якого .eq() вже нема.
    let q = sb.from(table).select(columns);
    if (eq) q = q.eq(eq[0], eq[1]);
    const { data, error } = await q
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) return out;
  }
  throw new Error(`${table}: понад ${MAX_PAGES * PAGE_SIZE} рядків — звіт був би обрізаний, тому не надсилаю`);
}

// ---- Таблиця «учні × курси» (013) ----
// Колонки — курси в порядку сайту (courses.sort_order), клітинка:
//   є сертифікат → «✅ ДД.ММ.РРРР» · є прогрес → «пройдено/усього» · інакше «—».
function certsCsv(d: {
  courses: any[]; modules: any[]; profiles: any[]; certs: any[]; progress: any[];
}): string {
  const courses = [...d.courses].sort(
    (a, b) => (Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)) ||
              String(a.slug ?? "").localeCompare(String(b.slug ?? "")),
  );

  const courseOfModule = new Map<string, string>();   // module_id → course_id
  const totalOfCourse = new Map<string, number>();    // course_id → модулів у курсі
  for (const m of d.modules) {
    courseOfModule.set(m.id, m.course_id);
    totalOfCourse.set(m.course_id, (totalOfCourse.get(m.course_id) ?? 0) + 1);
  }

  const doneOf = new Map<string, number>();           // «user|course» → завершено
  for (const p of d.progress) {
    if (p.status !== "completed") continue;
    const cid = courseOfModule.get(p.module_id);
    if (!cid) continue;                               // модуль зник — курс невідомий
    const k = p.user_id + "|" + cid;
    doneOf.set(k, (doneOf.get(k) ?? 0) + 1);
  }

  const certOf = new Map<string, string>();           // «user|course» → issued_at
  for (const c of d.certs) certOf.set(c.user_id + "|" + c.course_id, c.issued_at);

  // Найновіші реєстрації — зверху. Однаковий created_at розрулюємо за id,
  // щоб порядок рядків не стрибав між двома викликами.
  const when = (v: unknown) => { const t = Date.parse(String(v ?? "")); return isNaN(t) ? 0 : t; };
  const people = [...d.profiles].sort(
    (a, b) => (when(b.created_at) - when(a.created_at)) || String(a.id).localeCompare(String(b.id)),
  );

  const lines = [["Учень", ...courses.map(courseLabel)].map(csvCell).join(",")];
  for (const p of people) {
    const name = String(p.full_name ?? "").trim();
    const row: string[] = [name || String(p.email ?? "").trim() || "—"];
    for (const c of courses) {
      const k = p.id + "|" + c.id;
      const issued = certOf.get(k);
      if (issued) { row.push("✅ " + kyivDate(issued, "dots")); continue; }
      const done = doneOf.get(k) ?? 0;
      row.push(done > 0 ? `${done}/${totalOfCourse.get(c.id) ?? 0}` : "—");
    }
    lines.push(row.map(csvCell).join(","));
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

function fmtDateTime(iso: string): string {
  try { return new Date(iso).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" }); }
  catch { return iso; }
}

// Останні звернення з форми «Написати нам» (наповнює функція "contact", див. tg/contact_index.ts).
async function actionMessages(chatId: string | number) {
  const { data, error } = await admin()
    .from("contact_messages")
    .select("full_name, email, telegram, message, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) { await sendMessage(chatId, "Помилка: " + escapeHtml(error.message)); return; }
  const rows = data ?? [];
  if (!rows.length) { await sendMessage(chatId, "Повідомлень поки немає."); return; }

  const items = rows.map((r: any) => {
    const short = r.message.length > 200 ? r.message.slice(0, 200) + "…" : r.message;
    return (
      `🕐 ${fmtDateTime(r.created_at)}\n` +
      `Ім'я: ${escapeHtml(r.full_name)}\n` +
      `Email: ${escapeHtml(r.email)}\n` +
      `Telegram: ${r.telegram ? escapeHtml(r.telegram) : "—"}\n` +
      `${escapeHtml(short)}`
    );
  });
  const text = `✉️ <b>Останні звернення (${rows.length})</b>\n\n` + items.join("\n\n———\n\n");
  await sendMessage(chatId, text.length > 4000 ? text.slice(0, 4000) + "…" : text);
}

// 013 · «🎓 Сертифікати» — CSV «учні × курси».
// Читаємо напряму таблиці сервісним ключем (як actionMessages робить із
// contact_messages): service_role обходить RLS, нової RPC заводити не треба,
// а отже й нового публічного ендпоінта з іменами всіх учнів не з'являється.
async function actionCerts(chatId: string | number) {
  const sb = admin();
  let csv: string;
  try {
    const [courses, modules, profiles, certs, progress] = await Promise.all([
      selectAll(sb, "courses", "id, slug, title, sort_order"),
      selectAll(sb, "modules", "id, course_id"),
      selectAll(sb, "profiles", "id, full_name, email, created_at"),
      selectAll(sb, "certificates", "user_id, course_id, issued_at"),
      selectAll(sb, "progress", "user_id, module_id, status", ["status", "completed"]),
    ]);
    if (!profiles.length) { await sendMessage(chatId, "Зареєстрованих поки немає."); return; }
    if (!courses.length) { await sendMessage(chatId, "У базі немає жодного курсу."); return; }
    csv = certsCsv({ courses, modules, profiles, certs, progress });
  } catch (e) {
    // Помилку показуємо, а не глитаємо: порожній або неповний звіт виглядав би
    // як «сертифікатів немає», і це гірше за видиму помилку.
    await sendMessage(chatId, "Помилка: " + escapeHtml(e instanceof Error ? e.message : String(e)));
    return;
  }
  await sendCsv(chatId, `certificates_${kyivDate(new Date(), "iso")}.csv`, csv);
}

// 013 · сповіщення про новий сертифікат (Database Webhook на INSERT у certificates).
// Текст гендерно-нейтральний: статі учня база не знає.
async function notifyNewCertificate(rec: any) {
  let name = String(rec?.full_name ?? "").trim();   // знімок імені на момент видачі
  let course = "";
  try {
    const sb = admin();
    if (!name && rec?.user_id) {
      const { data } = await sb.from("profiles").select("full_name").eq("id", rec.user_id).maybeSingle();
      name = String(data?.full_name ?? "").trim();
    }
    if (rec?.course_id) {
      const { data } = await sb.from("courses").select("slug, title").eq("id", rec.course_id).maybeSingle();
      if (data) course = courseLabel(data);
    }
  } catch (e) {
    // Не тихо (лог функції лишає причину) і не замість повідомлення: сповіщення
    // про виданий сертифікат важливіше за назву курсу в ньому.
    console.error("[013 certificate notify] не вдалося дочитати деталі:", e);
  }
  const code = String(rec?.public_code ?? "").trim();
  const lines = [
    `🎓 <b>Новий сертифікат</b>`,
    `${escapeHtml(name || "Студент")} — курс «${escapeHtml(course || "невідомий")}»`,
  ];
  if (code) lines.push(escapeHtml(verifyUrl(code)));
  await sendMessage(ADMIN, lines.join("\n"));
}

// 015 · лист «Вітаємо» САМІЙ людині, що зареєструвалась (HTTP API Resend).
// Тексти — dev/build/015-password-reset/01-plan.md §4.3. Три обмеження тексту
// не випадкові:
//   • курси поіменно не перелічуємо — перелік застаріє з наступним релізом,
//     а бот деплоїться окремо від сайту;
//   • про «Забули пароль?» не згадуємо — бот їде в прод раніше за код сайту,
//     обіцяти кнопку, якої там ще немає, не можна;
//   • рядок «Якщо акаунт створював не ти» обов'язковий: підтвердження пошти
//     вимкнене (mailer_autoconfirm), тож адресу міг вписати хто завгодно.
// У листі немає нічого таємного — ні пароля, ні посилання для входу, ні коду.
async function sendWelcomeEmail(r: any): Promise<void> {
  // Жодного винятку назовні: цю функцію кличуть поруч зі сповіщенням адміну,
  // і впасти вона права не має. Але й мовчати не має — причина йде в лог.
  if (!RESEND_KEY) {
    console.warn("[015 welcome] RESEND_API_KEY не заданий — лист не надсилаю.");
    return;
  }
  const email = String(r?.email ?? "").trim();
  if (!email) {
    // Адресу в лог не пишемо ніколи — ні тут, ні нижче: логи функції читає не лише власник.
    console.warn("[015 welcome] у записі вебхука немає email — лист не надсилаю.");
    return;
  }

  const name = String(r?.full_name ?? "").trim();
  const helloText = name ? `Привіт, ${name}!` : "Привіт!";
  const helloHtml = name ? `Привіт, ${escapeHtml(name)}!` : "Привіт!";

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1A1A1A;max-width:560px">
  <p style="font-size:20px;font-weight:600;margin:0 0 16px">${helloHtml}</p>
  <p style="margin:0 0 16px">Акаунт в AI Академії створено. Тепер прогрес зберігається сам, а за пройдений курс ти отримаєш іменний сертифікат із публічним кодом перевірки.</p>
  <p style="margin:0 0 8px"><strong>Як це працює:</strong></p>
  <ul style="margin:0 0 16px;padding-left:20px">
    <li style="margin:0 0 6px">Уроки проходяться по черзі — наступний відкривається після тесту до попереднього.</li>
    <li style="margin:0 0 6px">Тест можна перескладати скільки завгодно разів.</li>
    <li style="margin:0 0 6px">Ім'я для сертифіката змінюється в меню акаунта — доки сертифікат ще не виданий.</li>
  </ul>
  <p style="margin:0 0 24px">
    <a href="${SITE_URL}"
       style="display:inline-block;padding:12px 22px;background:#1A1A1A;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600">Перейти до навчання</a>
  </p>
  <p style="margin:0 0 16px">Усі курси безкоштовні, реклами немає. Щось не працює або є питання — напиши нам через форму «Написати нам» на сайті.</p>
  <p style="margin:0 0 16px">Якщо акаунт створював не ти — просто видали цей лист і нічого не роби.</p>
  <p style="margin:28px 0 0;color:#777777;font-size:14px">AI Академія — безкоштовні курси про штучний інтелект українською.<br>
    <a href="${SITE_URL}" style="color:#777777">ai-academia.com.ua</a>
  </p>
</div>`;

  const text = `${helloText}

Акаунт в AI Академії створено. Тепер прогрес зберігається сам, а за пройдений курс
ти отримаєш іменний сертифікат із публічним кодом перевірки.

Як це працює:
- Уроки проходяться по черзі — наступний відкривається після тесту до попереднього.
- Тест можна перескладати скільки завгодно разів.
- Ім'я для сертифіката змінюється в меню акаунта — доки сертифікат ще не виданий.

Перейти до навчання: ${SITE_URL}

Усі курси безкоштовні, реклами немає. Щось не працює або є питання — напиши нам
через форму «Написати нам» на сайті.

Якщо акаунт створював не ти — просто видали цей лист і нічого не роби.

AI Академія — безкоштовні курси про штучний інтелект українською.
ai-academia.com.ua`;

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${RESEND_KEY}`,
    "Content-Type": "application/json",
  };
  // Ключі ідемпотентності живуть у Resend 24 години: повторна доставка того
  // самого вебхука не дасть людині другого листа. Якщо id у записі немає,
  // заголовок просто не ставимо — адресу в нього класти не можна.
  const id = String(r?.id ?? "").trim();
  if (id) headers["Idempotency-Key"] = `welcome-${id}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [email],
        subject: "Вітаємо в AI Академії — акаунт створено",
        html,
        text,
      }),
    });
    if (!res.ok) {
      // Тіло відповіді Resend може містити адресу — вирізаємо перед логом.
      const detail = (await res.text()).slice(0, 200).replace(/[^\s@]+@[^\s@]+/g, "…");
      console.error(`[015 welcome] Resend відповів ${res.status}: ${detail}`);
    }
  } catch (e) {
    console.error(
      "[015 welcome] запит до Resend не вдався:",
      (e instanceof Error ? e.message : String(e)).replace(/[^\s@]+@[^\s@]+/g, "…"),
    );
  }
}

Deno.serve(async (req) => {
  let body: any;
  try { body = await req.json(); } catch { return new Response("ok"); }

  // --- 1) Database Webhook: нова реєстрація ---
  if (body && body.type && body.record && body.table) {
    if (WEBHOOK_SECRET && req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
      return new Response("forbidden", { status: 403 });
    }
    if (body.table === "profiles" && body.type === "INSERT") {
      const r = body.record;
      // 015 · умова «&& ADMIN» ПЕРЕЇХАЛА з гілки всередину, до самого
      // повідомлення: лист «Вітаємо» людині не має залежати від того, чи
      // налаштований чат адміна. Якби умова лишилась на гілці, без
      // ADMIN_CHAT_ID лист тихо не пішов би.
      // Promise.allSettled, а не await поспіль: впалий Resend не повинен
      // забирати з собою сповіщення адміну, і навпаки.
      const results = await Promise.allSettled([
        ADMIN
          ? sendMessage(
              ADMIN,
              `🟢 <b>Нова реєстрація</b>\n` +
              `Ім'я: ${escapeHtml(r.full_name || "—")}\n` +
              `Email: ${escapeHtml(r.email || "—")}`,
            )
          : Promise.resolve(),
        sendWelcomeEmail(r),
      ]);
      // allSettled ковтає відмови мовчки, а до 015 впалий sendMessage віддавав
      // 500 і лишав слід у логах Supabase. Щоб не втратити цей слід — пишемо самі.
      const names = ["telegram", "welcome-email"];
      results.forEach((x, i) => {
        if (x.status !== "rejected") return;
        const m = x.reason instanceof Error ? x.reason.message : String(x.reason);
        console.error(`[015 profiles] ${names[i]}: ${m.replace(/[^\s@]+@[^\s@]+/g, "…")}`);
      });
    } else if (body.table === "certificates" && body.type === "INSERT" && ADMIN) {
      // maybe_issue_certificate вставляє з «on conflict do nothing», тож один
      // сертифікат = один INSERT = одне сповіщення.
      await notifyNewCertificate(body.record);
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
          `Слеш-команди теж працюють: /stats, /export, /messages, /certs.`,
          ADMIN_MENU,
        );
      } else {
        await sendMessage(
          chatId,
          `Привіт! Твій chat_id: <code>${chatId}</code>\n\n` +
          `Додай його у секрет <b>ADMIN_CHAT_ID</b>, щоб користуватись адмін-командами:\n` +
          `/export — CSV усіх користувачів\n/stats — коротка статистика\n/messages — звернення з форми «Написати нам»\n/certs — CSV «учні × курси»: сертифікати й прогрес`,
        );
      }
    } else if (text === "/stats" || text === BTN_STATS) {
      if (!isAdmin(chatId)) { await sendMessage(chatId, "🔒 Лише для адміна."); return new Response("ok"); }
      await actionStats(chatId);
    } else if (text === "/export" || text === BTN_EXPORT) {
      if (!isAdmin(chatId)) { await sendMessage(chatId, "🔒 Лише для адміна."); return new Response("ok"); }
      await actionExport(chatId);
    } else if (text === "/messages" || text === BTN_MESSAGES) {
      if (!isAdmin(chatId)) { await sendMessage(chatId, "🔒 Лише для адміна."); return new Response("ok"); }
      await actionMessages(chatId);
    } else if (text === "/certs" || text === BTN_CERTS) {
      if (!isAdmin(chatId)) { await sendMessage(chatId, "🔒 Лише для адміна."); return new Response("ok"); }
      await actionCerts(chatId);
    } else {
      await sendMessage(
        chatId,
        "Не знаю такої команди. Скористайся кнопками нижче або /stats, /export, /messages, /certs.",
        isAdmin(chatId) ? ADMIN_MENU : undefined,
      );
    }
  }

  return new Response("ok");
});
