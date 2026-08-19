# Журнал інфра-змін (CHANGELOG)

Цей файл — reverse-chronological журнал подій для бекенд-інфраструктури проєкту AIA:
SQL-міграції в Supabase, деплої/оновлення Edge Functions (`tg/telegram_index.ts`,
`tg/contact_index.ts` тощо), зміни секретів/конфігурації Supabase та Cloudflare, версії.
Це доповнення до наративного розділу "## Стан бекенду" в кореневому `CLAUDE.md` — там
опис поточного стану, тут — хронологія, як до нього дійшли.

Нові записи додаються **зверху** (найновіші перші), під заголовком з датою у форматі
`РРРР-ММ-ДД`.

## 2026-08-19
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
