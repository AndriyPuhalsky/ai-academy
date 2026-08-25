---
name: live-auth-config-facts
description: Live Supabase Auth facts not documented in CLAUDE.md — mailer_autoconfirm is ON, so signUp returns a session immediately
metadata:
  type: project
---

Факти про живий Auth, зняті `GET /auth/v1/settings` з anon-ключем (2026-08-23).
У кореневому `CLAUDE.md` їх немає.

- **`mailer_autoconfirm: true`** — підтвердження пошти **вимкнене**. `signUp()` віддає
  сесію одразу, тож гілка «Готово! Якщо прийшов лист — підтверди пошту…»
  (`js/auth.js:264`) сьогодні недосяжна. Наслідок для планів: не будувати на ній
  сценаріїв тестування; і очікувати, що Supabase **звʼязуватиме** OAuth-ідентичність
  з наявним email-акаунтом замість помилки «пошта зайнята» (бо пошта вже підтверджена).
- `disable_signup: false`, `email: true`. **Google увімкнено 2026-08-24** (до того `false`);
  решта провайдерів `false`. **Перевіряти щоразу**, не покладатись на цей запис.
- **Формат помилки OAuth — перевірено живим `/auth/v1/callback`:** параметри в
  `location.search` (потік `response_type=code`, `scope=email profile`), ключі
  `error` / `error_code` / `error_description`, реальні значення —
  `bad_oauth_state`, `bad_oauth_callback`.
- **Пастка GoTrue:** втративши `state`, він губить і `redirect_to` і редіректить на
  **`Site URL`**. Тобто помилка, що трапилась на dev-превʼю, приземляє людину на **прод**.
  Не баг конфігурації — так влаштований GoTrue.
- `Site URL` = `https://ai-academia.com.ua` (до 2026-08-24 був `http://localhost:8000` —
  це ламало б і OAuth, і листи скидання пароля, які підставляють `{{ .SiteURL }}`).
- `saml_enabled: false`, `passkeys_enabled: false`, `anonymous_users: false`.

**Why:** ці перемикачі змінюють поведінку входу сильніше за код, а в жодному файлі
репозиторію не зафіксовані — їх видно тільки живим запитом.
**How to apply:** перевіряти на початку будь-якої auth-дотичної задачі однією командою:
```
curl -s https://hpcyrnxschpxlrxudmqk.supabase.co/auth/v1/settings \
  -H "apikey: $(python3 -c "import json;print(json.load(open('config.json'))['supabase']['anonKey'])")"
```
Це єдине джерело фактів про Auth, доступне без MCP — див. [[mcp-unavailable-in-pm-subagent]].

Окремо: **allow-list редіректів** (Dashboard → Authentication → URL Configuration) через
`/auth/v1/settings` **не видно**. Але його можна перевірити без Dashboard, і це варто
робити перед будь-яким auth-тестом:
```
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  'https://hpcyrnxschpxlrxudmqk.supabase.co/auth/v1/authorize?provider=google&redirect_to=<URL-енкоджений>'
```
`302` на `accounts.google.com` = провайдер живий. Сам allow-list енфорситься не тут,
а на зворотному шляху (`/auth/v1/callback`), тому остаточна перевірка — дивитись на
**домен в адресному рядку** після повернення.
