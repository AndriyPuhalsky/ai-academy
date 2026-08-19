# Журнал інфра-змін (CHANGELOG)

Цей файл — reverse-chronological журнал подій для бекенд-інфраструктури проєкту AIA:
SQL-міграції в Supabase, деплої/оновлення Edge Functions (`tg/telegram_index.ts`,
`tg/contact_index.ts` тощо), зміни секретів/конфігурації Supabase та Cloudflare, версії.
Це доповнення до наративного розділу "## Стан бекенду" в кореневому `CLAUDE.md` — там
опис поточного стану, тут — хронологія, як до нього дійшли.

Нові записи додаються **зверху** (найновіші перші), під заголовком з датою у форматі
`РРРР-ММ-ДД`.

## 2026-08-19
- **Змін інфраструктури не вносилось** (жодної SQL-міграції, деплою Edge Function чи
  зміни секретів) — сесія проєктна. Нижче лише результати перевірок і зафіксовані плани.
- Перевірено обсяг публікації статики: `wrangler.toml` має `[assets] directory = "."`,
  тому в публічний доступ іде **весь корінь репозиторію**. Підтверджено curl-ом на
  dev-URL: `CLAUDE.md`, `tg/CHANGELOG.md`, `tg/GOING_LIVE.md`, `tg/contact_messages.sql`,
  `tg/telegram_index.ts`, `wrangler.toml` — усі віддають 200. Секретів у них немає
  (вони в Supabase Secrets), але карта інфраструктури читається зовні.
  **Заплановано:** `.assetsignore` у корені (`tg/`, `*.md`, `*.sql`, `dev/`, `.claude/`)
  з перевіркою тим самим curl-ом на dev перед merge у `main`. Ще не зроблено.
- Уточнення до запису 2026-08-18 про RLS: там звірялись політики виду `using (...)`,
  а `USING` керує SELECT/UPDATE/DELETE. Для INSERT працює окрема умова `with check`,
  і вона **ще не звірена** — тобто питання, чи можна писати в `progress`/`certificates`
  прямим REST-запитом з публічним anon-ключем в обхід `submit_quiz`, лишається
  відкритим. **Заплановано:** знімок реальних політик і сигнатур RPC з Dashboard у
  `dev/schema-snapshot.local.md` (приватний, у `.gitignore`); заодно перевірити, чи
  `submit_quiz` рахує «попередній модуль» у межах курсу, а не глобально.
- Спроєктовано третю платформу (курс «Python Basic» з AI-ментором): план у приватному
  `dev/python-course-plan.local.md`, короткий запис у `dev/ideas.local.md`. Стан — ідея,
  не почато. Майбутні інфра-наслідки, коли дійде до реалізації: рядок у `courses` + 8
  рядків у `modules` (коди `p01…p08`), нові таблиці під AI-шар (`learning_profiles`,
  `study_plans`, `homework_reviews`, `exam_items`, `exam_attempts`,
  `capstone_submissions`), нові RPC для серверної перевірки екзамену. Нової Edge
  Function не потрібно — LLM викликається з браузера ключем самого учня.
- Додано таблицю `contact_messages` + RLS-політика `contact_messages: admin read`
  (`using (is_admin())`) — міграція `tg/contact_messages.sql`. INSERT-політики немає навмисно:
  записи вставляє лише Edge Function через service_role-ключ (в обхід Turnstile/honeypot/
  rate-limit було б небезпечно).
- Задеплоєно нову Edge Function "contact" (`tg/contact_index.ts`) — приймає форму
  «Написати нам», з опційною перевіркою Cloudflare Turnstile (пропускається, якщо
  `TURNSTILE_SECRET_KEY` не задано).
- Оновлено Edge Function "telegram" (`tg/telegram_index.ts`) — додано кнопку
  «✉️ Повідомлення» / команду `/messages`: показує останні звернення з таблиці
  `contact_messages`.
- Підключено Cloudflare Turnstile: `TURNSTILE_SECRET_KEY` додано в секрети функції
  "contact", публічний Site key вписано в `config.json` → `contact.turnstileSiteKey`.
  Додано перевірку `data.hostname` у відповіді `siteverify` (без неї публічний site key
  можна було б вставити на чужому сайті й реплеїти токени в обхід капчі).
- Наскрізно перевірено локально (localhost): Turnstile проходить, POST доходить до
  Edge Function, запис падає в `contact_messages`, тестовий рядок після перевірки видалено.

## 2026-08-18
- RLS перевірено вручну через Dashboard → Database → Policies: ключові таблиці
  (`profiles`, `certificates`, `progress`, `payments`, `enrollments`, `quiz_attempts`) мають
  політики виду `using ((id = auth.uid()) OR is_admin())` — безпечно, попри те, що в списку
  роль показана як "public".
- `TELEGRAM_SECRET_TOKEN` задеплоєно й активовано: `setWebhook` викликано з `secret_token`,
  `getWebhookInfo` підтвердив коректний URL без помилок.
