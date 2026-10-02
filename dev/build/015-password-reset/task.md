# 015 — «Забули пароль?» і лист «Вітаємо» після реєстрації

## Блок 1 — заповнює власник

- **Статус:** у плані
- **Заведено:** 2026-10-02
- **Платформа:** усі (вхід спільний — `js/auth.js` + `js/auth-ui.js` на всіх сторінках з модалкою)
- **Дизайн:** не потрібен — рішення власника 2026-10-02: складаємо з наявних компонентів
  дизайн-системи 009 (`ds-dlg`, `ds-fld`, `ds-btn`, `ds-note`). Композиція, яку описує ПМ у
  `01-plan.md`, і є «макетом» для фронтендера.

### ТЗ (слова власника)
«Мені хочеться як юзер мати змогу відновити пароль, якщо раптом я його забув.»
«А можемо додати ще листи, що реєстрація пройшла успішно?»

### Рішення власника 2026-10-02 (не переоткривати)
1. Поштовий сервіс — **Resend** (безкоштовно 3 000 листів/міс, 100/день).
2. Дизайн-бриф не потрібен.
3. Реліз **окремо від Jira (012)**; код сайту — **в окремій гілці** `password-reset` від
   `origin/main` («так буде простіше»).
4. Лист «Вітаємо» після реєстрації — **так**.
5. **Строго конвеєр: ПМ → бекендер → фронтендер → QA**, послідовно.
6. **Бекендер робить усе через Chrome** (Resend, Cloudflare DNS, налаштування Supabase Auth,
   деплой Edge Function). Власник дав доступ і дозвіл до хостингу.
7. Власник «лише чекає готову задачу» — його час беремо тільки там, де інакше не можна (нижче).

### Чого точно НЕ робити
- Не чіпати `mailer_autoconfirm` («Confirm email» у Supabase) — підтвердження пошти при реєстрації
  лишається вимкненим.
- Не змінювати базу: ця задача **без SQL-міграцій** (лист «Вітаємо» висить на наявному тригері
  `notify_new_profile()`).
- Версії платформ, `site.updated`, `sitemap.xml` не чіпати — нових адрес немає, а зміна дат дала б
  конфлікт із невипущеним релізом 012 на `dev`.
- `main` — лише мерж кореневою сесією після прямого «так» власника.

---

## Межі, які не знімає жоден дозвіл (робить власник)
1. **Акаунт Resend** створює й входить сам (агенти акаунтів не створюють).
2. **API-ключ Resend** — створює й **сам вставляє** у два поля: пароль SMTP у Supabase і секрет
   `RESEND_API_KEY` в Edge Functions. Агенти ключа не бачать і не вводять. Робиться на старті
   разом із кореневою сесією.
3. **Паролі**: тестовий акаунт і новий пароль у діалозі вводить власник.
4. **Мерж у `main`** — тільки після його «так».

## Git — уся команда працює в окремій гілці (слово власника 2026-10-02)
- Гілка **`password-reset`** від `origin/main`, робоче дерево — **worktree
  `/Users/ander1.sage/Downloads/AIA-015`**. Тут ВСЕ: код сайту, ця папка задачі, звіти,
  `tg/telegram_index.ts`, `tg/CHANGELOG.md`. Превʼю Cloudflare:
  `https://password-reset-ai-academy.andriy-puhalsky.workers.dev`.
- Основне дерево `/Users/ander1.sage/Downloads/AIA` стоїть на `dev` з невипущеним 012 — **його не
  чіпати**: жодних правок, комітів і `checkout` там. Git — лише
  `git -C /Users/ander1.sage/Downloads/AIA-015 …`.
- Першим комітом гілки службові файли взято з `dev` (`tg/telegram_index.ts` — задеплоєна версія
  бота з 013, на `main` вона на 221 рядок старша; `tg/CHANGELOG.md`, `dev/build/README.md`,
  `dev/build/JOURNAL.md`, `CLAUDE.md`). Тому правки в гілці = «`dev` + своє», і пізніший мерж гілки
  в `dev` пройде без конфліктів. Сайт від цього не змінюється: `dev/`, `tg/`, `CLAUDE.md` у
  `.assetsignore`.
- ⚠ Upstream гілки знятий навмисно (при створенні вона підхопила `origin/main`): голий `git push`
  не працює — і це запобіжник. Пушить коренева сесія: `git push -u origin password-reset`.
- Агенти комітять свою зону `git commit -- <шляхи>`; `push` робить коренева сесія.

---

## Знахідки кореневої сесії (звірено наживо 2026-10-02) — вхід для ПМ
- 🔴 **Блокер обох задач — пошта.** У Supabase → Authentication → Emails → SMTP Settings
  «Enable custom SMTP» **вимкнений**. Документація Supabase (`docs/guides/auth/auth-smtp`):
  «Unless you configure a custom SMTP server for your project, Supabase Auth will refuse to deliver
  messages to addresses that are not part of the project's team» і «Currently this value is set to
  2 messages per hour». На вкладці Templates: «Set up custom SMTP to edit templates». У домену
  `ai-academia.com.ua` немає MX/TXT (`dig` 2026-10-02).
- `GET /auth/v1/settings`: `"mailer_autoconfirm": true`, `"email": true`, `"google": true`.
- Redirect URLs: `https://ai-academia.com.ua/**`, `https://ai-academy.andriy-puhalsky.workers.dev/**`,
  `https://dev-ai-academy.andriy-puhalsky.workers.dev/**`, `http://localhost:8000/**`.
  Превʼю гілки `password-reset` у списку **немає** — додати тимчасово.
- Email OTP expiration — **3600 с** (посилання з листа діє 1 годину).
- Шаблону «Welcome» у Supabase Auth немає (є: Confirm sign up, Invite user, Magic link, Change email,
  Reset password, Reauthentication + сповіщення безпеки, серед них **Password changed**).
  Тригер `notify_new_profile()` на кожну нову реєстрацію (пошта й Google) уже шле в Edge Function
  `telegram` запис з `email` і `full_name` — `tg/telegram_index.ts:383-390`. Лист «Вітаємо» —
  туди, через Resend HTTP API (`POST https://api.resend.com/emails`, заголовок `Idempotency-Key`
  підтримується, ключі живуть 24 год).
- `supabase-js@2` з `esm.sh` (на 2026-10-02 — 2.117.2): типовий `flowType: 'implicit'`; при
  `implicit` `resetPasswordForEmail` не шле `code_challenge`. Подію `PASSWORD_RECOVERY`
  `_initialize()` шле через `setTimeout(0)` — раніше, ніж `boot()` підписується на
  `onAuthStateChange` (після `await Promise.all(...)`), тож **на подію покладатись не можна**:
  ознаку відновлення читати з URL першим рядком `boot()`, як уже читається помилка OAuth.
- Прострочене/використане посилання повертає `error=access_denied&error_code=otp_expired&
  error_description=Email link is invalid or has expired`. Нинішній `readOAuthError()`
  (`js/auth.js:502-517`) віднесе це до `"other"` і покаже «Не вдалося увійти через Google» — хибно.
- Resend SMTP для Supabase (доки Resend): Host `smtp.resend.com`, Port `465`, Username `resend`,
  Password = API-ключ. Після ввімкнення власного SMTP Supabase сам ставить ліміт 30 листів/год.
- `js/auth.js` і `js/auth-ui.js` на `dev` і `main` **побайтово однакові**; `ds-note--ok`,
  `ds-btn--quiet`, `ds-fld__label`, `ds-fld__error`, `ds-dlg__card` є в `css/components.css` на `main`.

## Технічна чернетка кореневої сесії (підказка ПМ, не закон — ПМ звіряє з кодом)
**Шаблон листа Reset password:** посилання не `{{ .ConfirmationURL }}`, а
`{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery`; клієнт обмінює токен сам через
`sb.auth.verifyOtp({ token_hash, type: "recovery" })`. Чому: працює на будь-якому пристрої (попросив
на ноутбуці — відкрив на телефоні), не «зʼїдається» сканером посилань у пошті (GET сторінки токен не
витрачає), не залежить від того, чи колись типовим у незафіксованому `supabase-js@2` стане `pkce`.
`{{ .RedirectTo }}` повертає людину на ту саму сторінку, з якої вона просила лист. Запасний шлях —
стандартний формат `#access_token=…&type=recovery` теж обробляти.

**`js/auth.js` (бекендер):** `readRecovery()` першим рядком `boot()` · `verifyOtp` **до**
`Promise.all([buildModuleMap(), refreshSession()])`, щоб імʼя й прогрес підтягнулись уже з новою
сесією · після `cleanUrl()`: сесія є → діалог нового пароля; ознака була, сесії немає → панель
`link-expired` · `readOAuthError()` першою гілкою `/otp_expired|email link/` → `"link-expired"` ·
`token_hash` в `AUTH_KEYS` · `requestPasswordReset({ email })` з `redirectTo: location.origin +
location.pathname` (як `signInWithGoogle`), відповідь однакова, є акаунт чи ні ·
`updatePassword(password)` через `sb.auth.updateUser({ password })` без reload (`USER_UPDATED` уже
обробляється без перезавантаження) · `translateError()`: «should be different» → «Новий пароль має
відрізнятися від старого.», `Auth session missing` → «Посилання вже не діє — надішли лист ще раз.»,
`Email address not authorized` → «Не вдалося надіслати лист. Напиши нам — допоможемо.» (429 уже
покритий) · `handlers` + обидві функції.

**`js/auth-ui.js` (фронтендер):** «Забули пароль?» (`ds-btn--quiet ds-btn--sm`) під полем пароля,
лише на вкладці «Вхід» · вигляд «Відновлення пароля» в тій самій модалці (`setView`): ховає Google,
«або», перемикач вкладок, імʼя й пароль; лід; підказка «Входив через Google? Тоді пароль не
потрібен…»; кнопка «Надіслати посилання»; «← Назад до входу»; успіх — `ds-note--ok`
`role="status"` «Якщо акаунт із цією адресою існує, лист уже в дорозі…» · `buildErrorPanel()` бере
`actId` (типово `retry-google`), для `link-expired` — «Надіслати новий лист» (`open-reset`) ·
`openPasswordDialog({ onSave })` за зразком `openNameDialog`: «Новий пароль», `type="password"
autocomplete="new-password" maxlength="128"`, перевірка 6–128, «Зберегти пароль» / «Скасувати»,
успіх «Пароль змінено. Ти вже в акаунті.» · `openAuthModal({ view: "reset" })` ·
`AIAAuthUI.openPasswordDialog`. **Жодної Tailwind-утиліти в JS, жодного альфа-модифікатора,
`components.css` не чіпати.**

**Лист «Вітаємо» (`tg/telegram_index.ts`, бекендер):** `sendWelcomeEmail(r)` · `Idempotency-Key:
welcome-<profiles.id>` · від `AI Академія <no-reply@ai-academia.com.ua>` · html + text, імʼя через
наявний `escapeHtml` · Telegram і лист через `Promise.allSettled` (збій одного не скасовує інше;
`&& ADMIN` — лише для Telegram) · без `RESEND_API_KEY` — тихий пропуск, у лог без email · курси
поіменно не перелічувати (після релізу Jira застаріє) і про «Забули пароль?» не згадувати (щоб
деплой бота не чекав мержу сайту) · 13 наявних учнів листа не отримають — лише нові реєстрації ·
перед деплоєм — звірити задеплоєний код функції `telegram` з `dev`-файлом до правки; `verify_jwt`
лишається вимкненим.

---

## Блок 2 — заповнює PM-агент (`01-plan.md`), тут лише посилання

- **План:** `01-plan.md`
- **Що піде в бекенд:** `02-backend/report.md`
- **Що піде у фронтенд:** `03-frontend/report.md`
- **Вердикт тестування:** `04-qa/report.md`
