# 015 — «Забули пароль?» і лист «Вітаємо» після реєстрації · План реалізації

- **Джерело:** `task.md` (ТЗ власника від 2026-10-02 + сім його рішень)
- **Дизайн:** **не потрібен** — рішення власника 2026-10-02: складаємо з наявних компонентів
  дизайн-системи 009. **Розділ 5 цього плану і є «макетом» для фронтендера.**
- **Платформа:** усі чотири (вхід спільний: `js/auth-ui.js` + `js/auth.js` на 64 з 66 публічних HTML)
- **Гілка:** `password-reset`, worktree `/Users/ander1.sage/Downloads/AIA-015`.
  Превʼю: `https://password-reset-ai-academy.andriy-puhalsky.workers.dev`.
  **`main` — заборонений. `dev` і дерево `/Users/ander1.sage/Downloads/AIA` — не чіпати.**
- **Конвеєр:** СТРОГО послідовний (рішення власника): ПМ → бекендер → фронтендер → QA
- **Статус:** у плані → в роботі
- **Автор плану:** `aia-build-pm`, 2026-10-02

---

## 0. Найважливіше в пʼяти рядках

1. **Перетину файлів немає взагалі.** Бекендер пише `js/auth.js` + `tg/telegram_index.ts` +
   `tg/CHANGELOG.md`; фронтендер — тільки `js/auth-ui.js`. `css/components.css`, HTML і конфіги
   **не чіпає ніхто** (розділ 6).
2. **Посилання з листа несе не `{{ .ConfirmationURL }}`, а `token_hash`** — клієнт обмінює його
   сам через `sb.auth.verifyOtp({ token_hash, type: "recovery" })`. Чому — розділ 4.1.
3. **На подію `PASSWORD_RECOVERY` покладатись не можна** — `supabase-js` шле її через
   `setTimeout(0)` з `_initialize()`, тобто раніше, ніж `boot()` підписується на
   `onAuthStateChange` (`js/auth.js:153`). Ознаку відновлення читаємо **першим рядком `boot()`**,
   як уже читається помилка OAuth.
4. **Лист «Вітаємо» не чекає сайту**: він висить на наявному тригері `notify_new_profile()` і
   живе цілком у `tg/telegram_index.ts`. Тому в ньому **не згадуємо «Забули пароль?»** і **не
   перелічуємо курси поіменно** — бот деплоїться раніше за мерж сайту (слово власника в `task.md`).
5. **Без SQL-міграцій.** `mailer_autoconfirm`, версії, `site.updated`, `sitemap.xml` — не чіпати.

---

## 1. Відкриті питання до власника

Жодне не блокує старт бекендера. Дефолти проставлені — агенти йдуть за ними, доки власник
не скаже інакше.

1. **[неблокуюче] «Забули пароль?» чи «Забув пароль?».** Весь інтерфейс сайту — на «ти»
   (`T` у `js/auth-ui.js:31-146`: «Увійди», «Вкажи email», «Зачекай…»). Форма «Забули» —
   єдина множина/ввічлива форма в усьому наборі, але саме вона задана в ТЗ і саме вона
   найвпізнаваніша.
   **Мій дефолт:** лишаємо дослівно **«Забули пароль?»**, як у ТЗ. Зміна коштує одного рядка в `T`.
2. **[неблокуюче] DMARC-запис `_dmarc` для домену.** Resend вимагає лише MX + 2 TXT
   (розділ 7.2); DMARC не обовʼязковий, але без нього частина пошти може лягати в «Спам».
   Запис `_dmarc` діє **на весь домен**, а не лише на листи сайту.
   **Мій дефолт:** у межах 015 DMARC **не додаємо**. Якщо після фінального прогону листи
   стабільно падають у «Спам» — заводимо окремим рядком.
3. **[неблокуюче] Ліміт листів Supabase після ввімкнення власного SMTP.** Supabase сам ставить
   **30 листів/год** («a low rate-limit of 30 messages per hour is imposed» —
   `docs/guides/auth/auth-smtp`, звірено 2026-10-02). Resend Free дає 100/день.
   **Мій дефолт:** лишаємо 30/год, сторінку Rate Limits не чіпаємо (13 учнів — запас у рази).
4. **[неблокуюче] Акаунт, створений через Google, просить відновлення пароля.** Лист піде
   (користувач із такою адресою існує), людина задасть пароль — і далі зможе входити **обома**
   способами.
   **Мій дефолт:** так і лишаємо — це рятує людину, яка забула, яким способом заходила.
   У вигляді «Відновлення» поруч стоїть підказка про Google (розділ 3.2, рядок `T.reset.google`).
   Фактичну поведінку GoTrue для акаунта без пароля перевіряє **власник у фінальному прогоні**
   (розділ 9.2, пункт 7) — агенти акаунтів не створюють.
5. **[неблокуюче] 13 наявних учнів листа «Вітаємо» не отримають** — тригер спрацьовує лише на
   нові рядки `profiles`. **Мій дефолт:** заднім числом не розсилаємо.
6. **[неблокуюче] Адреса відправника.** **Мій дефолт:** `AI Академія <no-reply@ai-academia.com.ua>`
   і для Supabase SMTP, і для листа «Вітаємо» — один відправник в обох листах виглядає як одне
   джерело і краще проходить фільтри.

---

## 2. Що є зараз (перевірено в коді й наживо 2026-10-02)

### 2.1 Код сайту (гілка `password-reset`, worktree `AIA-015`)

| Факт | Де | Значення |
| --- | --- | --- |
| Шар даних авторизації | `js/auth.js` | 647 рядків, ES-модуль, вантажиться **після** `auth-ui.js` |
| Шар вигляду | `js/auth-ui.js` | 1325 рядків, класичний скрипт без `defer` |
| Старт шару даних | `js/auth.js:96-173` `boot()` | URL читається **першим** (рядки 97-104), `createClient` — 121, `ui.init({handlers, certUrl})` — 126, `await Promise.all([buildModuleMap(), refreshSession()])` — 133, `cleanUrl()` — 151, підписка `onAuthStateChange` — 153, панель помилки — 172 |
| Читання помилки OAuth | `js/auth.js:502-517` `readOAuthError()` | три гілки: `cancelled` / `conflict` / `other`. **`otp_expired` потрапляє в `cancelled`** (бо містить `access_denied`) → показало б «Вхід через Google скасовано». Хибно. |
| Очищення URL | `js/auth.js:532-551` `cleanUrl()` | `AUTH_KEYS` (рядки 533-535) вже містить `type`, **`token_hash` — ні** |
| Переклад помилок | `js/auth.js:606-620` `translateError(msg, err)` | 429 перевіряється **першим** (рядок 611) — не ламати цей порядок |
| Контракт із виглядом | `js/auth.js:624-630` `handlers` | 5 ключів: `signInWithGoogle`, `signInWithPassword`, `signUp`, `saveName`, `signOut` |
| Публічний інтерфейс даних | `js/auth.js:634-645` `window.AIAAuth` | `open`, `signOut`, `user`, `name`, `editName`, `confirmCertificateName` |
| Вхід паролем | `js/auth.js:555-569` | при успіху робить `location.reload()` |
| Тексти вигляду | `js/auth-ui.js:31-146` `T` | єдине місце рядків інтерфейсу входу; тон — на «ти» |
| Панель помилки | `js/auth-ui.js:251-270` `buildErrorPanel(kind)` | **кнопка жорстко `data-act="retry-google"`** (рядок 258) |
| Розмітка модалки | `js/auth-ui.js:285-376` `buildModal(o)` | один рядок HTML |
| Поведінка модалки | `js/auth-ui.js:689-821` `wireModal(el)` | `setTab`, `setNameWrap`, `startWaiting/stopWaiting`, слухач `[data-act='retry-google']` (809-812), Enter у трьох полях (816-820) |
| Відправка форми | `js/auth-ui.js:823-872` `submitForm(el)` | валідація 6–128 символів пароля (`MIN_PASS`/`MAX_PASS`, рядки 176-177) |
| Показ панелі | `js/auth-ui.js:874-887` `showPanel(el, kind)` | для `conflict` перемикає таб і ставить фокус у пароль |
| Зразок діалогу | `js/auth-ui.js:930-972` `openNameDialog(o)` | `Promise<{action,name}>`, `o.onSave` викликається **поки діалог відкритий** |
| Вхід у модалку | `js/auth-ui.js:1233-1258` `openAuthModal(o)` | приймає `{note, tab, panel, waiting, opener}`; якщо модалка вже відкрита — оновлює наявну |
| Публічний інтерфейс вигляду | `js/auth-ui.js:1296-1324` `window.AIAAuthUI` | `init`, `renderSlot`, `openAuthModal`, `closeAuthModal`, `showFormError`, `hideFormError`, `showOAuthPanel`, `openNameDialog`, `wasNameConfirmed`, `markNameConfirmed`, `showNameError`, `texts` |
| Де вантажиться вхід | 64 з 66 публічних HTML | **без нього:** `roadmap.html` і `verify.html` (у них немає ні `auth-ui.js`, ні `auth.js` — перевірено `grep` по всіх `*.html` і `modules/*.html`) |

### 2.2 Класи дизайн-системи, які реально існують (`css/components.css`)

Перевірено пошуком по файлу — **усе, з чого складається новий UI, уже є**, нових класів не потрібно:

`ds-dlg` `ds-dlg__scrim` `ds-dlg__card` `ds-dlg__head` `ds-dlg__bar` (481-531, 1575-1586) ·
`ds-btn` `--primary` `--secondary` `--ghost` `--quiet` `--sm` `--icon` (107-195) ·
`ds-fld` `ds-fld__label` `ds-fld__input` `ds-fld__hint` `ds-fld__error` (221-248) ·
`ds-note` `--ok` `--warn` `--err` `--info` `ds-note__glyph` `ds-note__title` (347-375 + оверайд 1081-1086) ·
`ds-small` `ds-lead` `ds-eyebrow` (76-95) · `ds-badge--info` (282-306) · `ds-tabs` `ds-tabs__pill` (1588-1590) ·
`ds-h3` (у `tokens.css`/типографіці, уже вживається в `buildModal`).

**Дві пастки компонентів, які треба знати до верстки:**
- `.ds-fld__error::before { content: "✕" }` (рядок 248) — текст помилки **не повинен** починатися
  з гліфа, інакше буде «✕ ✕ …».
- `.ds-note` у блоці 1081-1086 має `display: block`, а `.ds-note__glyph` — `float: left`.
  Тому `ds-note` безпечно ховати атрибутом `hidden` (інлайнового `display` у нього немає).

### 2.3 Бот і база

- `tg/telegram_index.ts` — **задеплоєна версія з 013** (у гілці вона та сама, що на `dev`;
  у `main` код на 221 рядок старший — див. `task.md`). 456 рядків.
- Гілка вебхука реєстрації — `tg/telegram_index.ts:383-390`: умова
  `body.table === "profiles" && body.type === "INSERT" && ADMIN` → одне `sendMessage` адміну з
  `r.full_name` і `r.email`. **Тобто в записі вебхука поля `email` і `full_name` уже є.**
- `escapeHtml` (рядки 95-97) екранує лише `& < >` — для текстових вузлів HTML цього достатньо.
- Секрети функції (рядки 44-49): `TELEGRAM_BOT_TOKEN`, `ADMIN_CHAT_ID`, `WEBHOOK_SECRET`,
  `TELEGRAM_SECRET_TOKEN` + автоматичні `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`.
  **`RESEND_API_KEY` — новий, вставляє власник.**
- `SITE_URL = "https://ai-academia.com.ua"` (рядок 72) — уже є, беремо його для посилань у листі.

### 2.4 Живі факти (перевірено 2026-10-02, джерела названі)

| Факт | Джерело | Значення |
| --- | --- | --- |
| Власний SMTP у Supabase | `task.md`, звірка кореневої сесії | **вимкнений** — це блокер обох фіч |
| Ліміт без власного SMTP | `supabase.com/docs/guides/auth/auth-smtp` | «Currently this value is set to 2 messages per hour» + «will refuse to deliver messages to addresses that are not part of the project's team» |
| Ліміт після ввімкнення | те саме джерело | «a low rate-limit of 30 messages per hour is imposed» |
| Інтервал між листами відновлення | `supabase.com/docs/guides/auth/rate-limits` | `/auth/v1/recover`: «Defaults to a 60 seconds window before a new request is allowed for the same user» |
| Антиперелік акаунтів | `supabase.com/docs/guides/auth/passwords` | «`resetPasswordForEmail()` doesn't reveal whether an account exists… the method still returns without an error» |
| Змінні шаблонів | `supabase.com/docs/guides/auth/auth-email-templates` | `{{ .ConfirmationURL }}`, `{{ .Token }}`, **`{{ .TokenHash }}`**, `{{ .SiteURL }}`, **`{{ .RedirectTo }}`**, `{{ .Data }}`, `{{ .Email }}` — усі три потрібні нам змінні існують |
| Шаблон «Password changed» | те саме джерело | існує як security notification; вмикається окремим перемикачем («Security emails are only sent… if the respective security notifications have been enabled at a project-level») |
| Підпис `verifyOtp` | `supabase.com/docs/guides/auth/passwords`, розділ PKCE | `supabase.auth.verifyOtp({ type, token_hash })` |
| Email OTP expiration | `task.md`, Dashboard | **3600 с** → «посилання діє одну годину» (цей рядок у листі й у текстах UI) |
| Resend SMTP | `resend.com/docs/send-with-smtp` | Host `smtp.resend.com`, Ports `25, 465, 587, 2465, 2587`, Username `resend`, Password = API-ключ |
| Resend HTTP API | `resend.com/docs/api-reference/emails/send-email` | `POST https://api.resend.com/emails`, `Authorization: Bearer …`, `Content-Type: application/json`, необовʼязковий `Idempotency-Key` (≤256 символів); тіло `from`, `to`, `subject`, `html`, `text`; успіх — `{ "id": "…" }` |
| Resend у Cloudflare | `resend.com/docs/knowledge-base/cloudflare` | MX `send` (priority 10), TXT `send` (SPF), TXT `resend._domainkey` (DKIM) — **DKIM обовʼязково `DNS Only`**, інакше Cloudflare Code 1004; імʼя писати **без домену** (`send`, не `send.ai-academia.com.ua`); верифікація — до 72 год, зазвичай швидше |
| `.html` → канонічна адреса | `curl` на прод 2026-10-02 | `GET /index.html?token_hash=abc&type=recovery` → **307**, `location: /?token_hash=abc&type=recovery`; те саме для `/modules/module-01.html`. **Параметри запиту редірект зберігає** — лист із `.html`-адресою не ламається |

---

## 3. Контракт даних і контракт між файлами

Це **закон** для бекендера й фронтендера. Фронтендер іде після бекендера, але працює **лише
з цього розділу** — заглядати в чужий файл по імена не можна.

### 3.1 Нові `handlers` (пише `js/auth.js`, викликає `js/auth-ui.js`)

Додаються **двома ключами** в наявний обʼєкт `handlers` (`js/auth.js:624-630`). Наявні пʼять
ключів лишаються як є.

```js
const handlers = {
  signInWithGoogle, signInWithPassword, signUp, saveName, signOut,
  requestPasswordReset,   // ← нове
  updatePassword          // ← нове
};
```

**`requestPasswordReset(payload) → Promise<Result>`**

| Що | Значення |
| --- | --- |
| `payload` | `{ email: string }` — рядок як його ввела людина, без очистки |
| Успіх | `{ ok: true }` |
| Невдача | `{ ok: false, message: string }` — **готовий український текст**, показувати як є |
| Антиперелік | `{ ok: true }` повертається **однаково**, існує акаунт чи ні. Шар вигляду про існування акаунта не дізнається ніколи |
| Побічні ефекти | жодних: ні `reload`, ні відкриття діалогів, ні запису в сховище |
| Усередині | `normalizeEmail` → `EMAIL_RE` → `sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname })` |
| `redirectTo` | **без `search` і без `hash`** — рівно як у `signInWithGoogle` (`js/auth.js:482`). Інакше після повернення старі параметри змішаються з новими і `cleanUrl()` стане неоднозначним |

Можливі `message` (усі з `translateError`, розділ 3.5):
`Схоже, email введено некоректно.` · `Забагато спроб. Зачекай хвилину і спробуй ще раз.` ·
`Не вдалося надіслати лист. Напиши нам — допоможемо.` · `Сервіс ще не готовий. Онови сторінку і спробуй ще раз.`

**`updatePassword(password) → Promise<Result>`**

| Що | Значення |
| --- | --- |
| Аргумент | `password: string` — **рядок, не обʼєкт**, не обрізаний |
| Успіх | `{ ok: true }` |
| Невдача | `{ ok: false, message: string }` |
| Побічні ефекти | **жодного `location.reload()`.** `sb.auth.updateUser` породжує `USER_UPDATED` → `onAuthStateChange` (`js/auth.js:153-167`) уже вміє перемалювати шапку без перезавантаження |
| Усередині | межі 6…128 → `sb.auth.updateUser({ password })` |

Можливі `message`: `Пароль має містити щонайменше 6 символів.` ·
`Пароль задовгий (максимум 128 символів).` · `Новий пароль має відрізнятися від старого.` ·
`Посилання вже не діє — надішли лист ще раз.` · `Забагато спроб. Зачекай хвилину і спробуй ще раз.` ·
`Сервіс ще не готовий. Онови сторінку і спробуй ще раз.`

### 3.2 Нові методи `window.AIAAuthUI` (пише `js/auth-ui.js`, викликає `js/auth.js`)

**`openAuthModal({ view })`** — наявний метод отримує **один новий ключ**.

| Ключ | Тип | Поведінка |
| --- | --- | --- |
| `view` | `"auth"` \| `"reset"` | `"reset"` → модалка відкривається одразу у вигляді «Відновлення пароля». Якщо модалка вже відкрита — перемикається наявна (гілка `js/auth-ui.js:1237-1247`), другої не створюється |

Наявні ключі (`note`, `tab`, `panel`, `waiting`, `opener`) працюють як раніше.
`{ view: "reset", panel: "link-expired" }` — **коректна комбінація**: спершу малюється панель,
потім вигляд.

**`openPasswordDialog(o) → Promise<{ action }>`** — новий метод, за зразком `openNameDialog`.

| Ключ `o` | Тип | Обовʼязковий | Значення |
| --- | --- | --- | --- |
| `onSave` | `(password: string) => Promise<{ok:true} \| {ok:false,message:string}>` | так | викликається, **поки діалог ще відкритий**; при `ok:false` діалог лишається на місці з текстом помилки в `#aiaPassError` |
| `opener` | `Element` | ні | куди повернути фокус; за замовчуванням `document.activeElement` |

Повертає `Promise`, який резолвиться **один раз**:
- `{ action: "saved" }` — `onSave` повернув `{ ok: true }`, людина побачила екран успіху й закрила його;
- `{ action: "cancelled" }` — Escape, ✕, «Скасувати» або клік по підложці.

`openPasswordDialog` **нічого не зберігає сама** і нічого не знає про Supabase.

**Новий вид панелі `link-expired`** — передається в наявний `openAuthModal({ panel })` і
в наявний `showOAuthPanel(kind)`. Малюється тим самим `buildErrorPanel`, але кнопка має
`data-act="open-reset"` (розділ 5.4).

### 3.3 Порядок у `boot()` — єдине місце, де порядок критичний

Поточний порядок (`js/auth.js:96-173`) зберігається; **вставки позначені `+`**:

```
 1. let oauthPanel = readOAuthError();
 1+. const recovery = readRecovery();            ← ДО fetch(config.json) і ДО createClient
 2. const hadCode = hasAuthCode();
 3. hadAuthParams = oauthPanel !== null || hadCode  →  + '|| recovery !== null'
 4. cameFromGoogle = takeOAuthStarted();
 5. fetch(CONFIG_PATH) → cfg
 6. sb = createClient(...)
 7. ui().init({ handlers, certUrl })               ← handlers уже з двома новими ключами
 7+. if (recovery && recovery.kind === "token")
        await sb.auth.verifyOtp({ token_hash: recovery.tokenHash, type: "recovery" })
     // kind === "implicit": сесію з #access_token підхопить сам supabase-js на кроці 8
 8. await Promise.all([buildModuleMap(), refreshSession()])
 9. (наявна гілка hadCode && !window.AIA_USER)
10. if (hadAuthParams) cleanUrl();                 ← AUTH_KEYS + 'token_hash'
11. sb.auth.onAuthStateChange(...)
12. renderSlot()
13. if (oauthPanel && u) u.openAuthModal({ panel: oauthPanel });
13+. else if (recovery && u) {
        if (window.AIA_USER) runPasswordDialog();              // сесія є → діалог нового пароля
        else u.openAuthModal({ panel: "link-expired" });       // ознака була, сесії немає
     }
```

**Чому `verifyOtp` саме на кроці 7+, а не пізніше:** `refreshSession()` (крок 8) тягне імʼя й
прогрес. Якщо обміняти токен після нього — імʼя в шапці й прогрес на сторінці уроку підтягнуться
від **гостя**, і людина побачить порожню шапку з відкритим діалогом пароля.

**Чому ознаку читаємо першим рядком, а не слухаємо `PASSWORD_RECOVERY`:** `supabase-js` шле цю
подію з `_initialize()` через `setTimeout(0)`, а `boot()` підписується на `onAuthStateChange`
аж після `await Promise.all(...)` (рядок 153) — тобто через щонайменше два мережеві кроки.
Подію ми гарантовано пропустимо.

### 3.4 Форма ознаки відновлення в URL

`readRecovery()` повертає один із трьох станів:

| Повертає | Коли | Приклад URL |
| --- | --- | --- |
| `{ kind: "token", tokenHash: "<рядок>" }` | у `location.search` **або** `location.hash` є `token_hash` і `type=recovery` | `/?token_hash=pkce_abc…&type=recovery` |
| `{ kind: "implicit" }` | у `location.hash` є `access_token` і `type=recovery` | `/#access_token=…&type=recovery` |
| `null` | інакше | — |

`"implicit"` — **запасний шлях**: якщо шаблон листа колись повернуть до `{{ .ConfirmationURL }}`,
код не зламається. Нічого робити не треба — сесію з hash підхопить сам `supabase-js`
(`detectSessionInUrl` увімкнений за замовчуванням).

### 3.5 Нові рядки `translateError()` (`js/auth.js:606-620`)

**Порядок гілок важливий.** Перевірка 429 (рядок 611) лишається **першою** — при 429 тіло
відповіді може взагалі не мати тексту. Нові гілки йдуть **після** 429 і **перед** `return msg`:

| Що ловимо (регулярний вираз по `code + " " + msg`) | Текст українською |
| --- | --- |
| `/same_password\|should be different/i` | `Новий пароль має відрізнятися від старого.` |
| `/Auth session missing\|session_not_found/i` | `Посилання вже не діє — надішли лист ще раз.` |
| `/otp_expired\|Email link is invalid or has expired\|Token has expired/i` | `Посилання вже не діє — надішли лист ще раз.` |
| `/email_address_not_authorized\|Email address .* not authorized/i` | `Не вдалося надіслати лист. Напиши нам — допоможемо.` |
| `/password should be\|at least 6/i` | **уже є** (рядок 617) — не дублювати |

### 3.6 Хто чим володіє (перетину немає)

| Файл | Бекендер | Фронтендер | QA |
| --- | --- | --- | --- |
| `js/auth.js` | **пише** | читає | читає |
| `js/auth-ui.js` | читає | **пише** | читає |
| `tg/telegram_index.ts`, `tg/CHANGELOG.md` | **пише** | — | читає |
| `dev/build/015-password-reset/02-backend/` | **пише** | — | читає |
| `dev/build/015-password-reset/03-frontend/` | — | **пише** | читає |
| `dev/build/015-password-reset/04-qa/` | — | — | **пише** |
| `css/components.css`, будь-який `*.html`, `*.config.json`, `sitemap.xml`, `wrangler.toml`, `.assetsignore` | **ніхто** | **ніхто** | **ніхто** |

Коміт — **тільки** `git -C /Users/ander1.sage/Downloads/AIA-015 commit -- <свої шляхи> -m "…"`.
`git add -A` заборонений (правило `dev/build/CLAUDE.md` §4). `push` робить коренева сесія.

---

## 4. Листи — тексти дослівно

Три листи. Усі прості: без зображень, без зовнішніх CSS, інлайнові стилі, одна кнопка-посилання
плюс текстова копія адреси поруч (бо частина поштових клієнтів ріже кнопки).

### 4.1 Supabase → Authentication → Emails → Templates → **Reset password**

**Чому посилання не `{{ .ConfirmationURL }}`:**
(а) `{{ .ConfirmationURL }}` веде на `/auth/v1/verify` і **витрачає токен GET-запитом** — сканери
посилань у пошті (Microsoft Safe Links та інші) вбивають його до того, як людина клацне; це прямо
описано в документації Supabase, розділ «Email prefetching»;
(б) `token_hash` працює на **будь-якому пристрої** — попросив на ноутбуці, відкрив на телефоні;
(в) не залежить від того, чи стане колись типовим `flowType: 'pkce'` у незафіксованому
`supabase-js@2` з `esm.sh`.

**Subject heading:**

```
Відновлення пароля — AI Академія
```

**Message body (HTML):**

```html
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1A1A1A;max-width:560px">
  <p style="font-size:20px;font-weight:600;margin:0 0 16px">Відновлення пароля</p>
  <p style="margin:0 0 16px">Ти попросив змінити пароль в AI Академії. Натисни кнопку — і задаси новий:</p>
  <p style="margin:0 0 24px">
    <a href="{{ if .RedirectTo }}{{ .RedirectTo }}{{ else }}{{ .SiteURL }}{{ end }}?token_hash={{ .TokenHash }}&amp;type=recovery"
       style="display:inline-block;padding:12px 22px;background:#1A1A1A;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600">Задати новий пароль</a>
  </p>
  <p style="margin:0 0 16px">Посилання діє <strong>одну годину</strong> і спрацює лише один раз.</p>
  <p style="margin:0 0 16px">Кнопка не відкривається? Скопіюй це посилання в адресний рядок браузера:<br>
    <span style="word-break:break-all;color:#555555;font-size:14px">{{ if .RedirectTo }}{{ .RedirectTo }}{{ else }}{{ .SiteURL }}{{ end }}?token_hash={{ .TokenHash }}&amp;type=recovery</span>
  </p>
  <p style="margin:0 0 16px">Якщо ти нічого не просив — просто видали цей лист. Пароль лишиться старим, і ніхто його не змінить.</p>
  <p style="margin:28px 0 0;color:#777777;font-size:14px">AI Академія — безкоштовні курси про штучний інтелект українською.<br>
    <a href="https://ai-academia.com.ua" style="color:#777777">ai-academia.com.ua</a>
  </p>
</div>
```

**Три речі, на яких тут легко спіткнутися:**
1. `&amp;` у `href` — це правильний запис амперсанда в HTML; у браузер піде `&`. Не «виправляти» на `&`.
2. `{{ if .RedirectTo }}…{{ else }}{{ .SiteURL }}{{ end }}` — запобіжник на випадок, якщо
   `resetPasswordForEmail` колись викличуть без `redirectTo` (тоді посилання веде на головну і
   все одно працює). Supabase Auth використовує Go Templates, умови підтримуються офіційно.
   Якщо редактор Dashboard з якоїсь причини відмовиться зберегти умову — лишити голий
   `{{ .RedirectTo }}` і **записати це у звіт**.
3. Адреса в листі може мати вигляд `…/modules/module-07.html?token_hash=…` — це нормально:
   Workers віддасть 307 на форму без `.html` і **збереже параметри** (перевірено `curl` 2026-10-02).

### 4.2 Supabase → Authentication → Emails → **Password changed** (security notification)

**Спершу ввімкнути перемикач** цього сповіщення — без нього шаблон не надсилається взагалі.

**Subject heading:**

```
Пароль до акаунта змінено — AI Академія
```

**Message body (HTML):**

```html
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1A1A1A;max-width:560px">
  <p style="font-size:20px;font-weight:600;margin:0 0 16px">Пароль змінено</p>
  <p style="margin:0 0 16px">Щойно для твого акаунта в AI Академії встановили новий пароль.</p>
  <p style="margin:0 0 16px"><strong>Це був ти?</strong> Тоді нічого робити не треба — просто входь новим паролем.</p>
  <p style="margin:0 0 16px"><strong>Це був не ти?</strong> Одразу віднови пароль на сайті («Увійти» → «Забули пароль?») і напиши нам через форму «Написати нам» — розберемось.</p>
  <p style="margin:0 0 24px">
    <a href="https://ai-academia.com.ua"
       style="display:inline-block;padding:12px 22px;background:#1A1A1A;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600">Відкрити AI Академію</a>
  </p>
  <p style="margin:28px 0 0;color:#777777;font-size:14px">AI Академія — безкоштовні курси про штучний інтелект українською.<br>
    <a href="https://ai-academia.com.ua" style="color:#777777">ai-academia.com.ua</a>
  </p>
</div>
```

Цей лист **можна** згадувати «Забули пароль?»: він живе в Supabase, а не в боті, і вмикається
тим самим деплоєм, що й сам шлях відновлення.

### 4.3 Лист «Вітаємо» — Edge Function `telegram` через Resend HTTP API

**Чому саме так, а не шаблоном Supabase:** шаблону «Welcome» у Supabase Auth **немає**
(є Confirm sign up, Invite, Magic link, Change email, Reset password, Reauthentication +
сповіщення безпеки). Тригер `notify_new_profile()` уже шле в цю функцію запис із `email` і
`full_name` на **кожну** реєстрацію — і поштою, і через Google. Нова SQL-міграція не потрібна.

**Subject:**

```
Вітаємо в AI Академії — акаунт створено
```

**HTML (`html`):** `{{HELLO}}` підставляється кодом — `Привіт, <імʼя>!` або просто `Привіт!`,
якщо `full_name` порожнє. Імʼя проганяється через наявний `escapeHtml`.

```html
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1A1A1A;max-width:560px">
  <p style="font-size:20px;font-weight:600;margin:0 0 16px">{{HELLO}}</p>
  <p style="margin:0 0 16px">Акаунт в AI Академії створено. Тепер прогрес зберігається сам, а за пройдений курс ти отримаєш іменний сертифікат із публічним кодом перевірки.</p>
  <p style="margin:0 0 8px"><strong>Як це працює:</strong></p>
  <ul style="margin:0 0 16px;padding-left:20px">
    <li style="margin:0 0 6px">Уроки проходяться по черзі — наступний відкривається після тесту до попереднього.</li>
    <li style="margin:0 0 6px">Тест можна перескладати скільки завгодно разів.</li>
    <li style="margin:0 0 6px">Імʼя для сертифіката змінюється в меню акаунта — доки сертифікат ще не виданий.</li>
  </ul>
  <p style="margin:0 0 24px">
    <a href="https://ai-academia.com.ua"
       style="display:inline-block;padding:12px 22px;background:#1A1A1A;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600">Перейти до навчання</a>
  </p>
  <p style="margin:0 0 16px">Усі курси безкоштовні, реклами немає. Щось не працює або є питання — напиши нам через форму «Написати нам» на сайті.</p>
  <p style="margin:0 0 16px">Якщо акаунт створював не ти — просто видали цей лист і нічого не роби.</p>
  <p style="margin:28px 0 0;color:#777777;font-size:14px">AI Академія — безкоштовні курси про штучний інтелект українською.<br>
    <a href="https://ai-academia.com.ua" style="color:#777777">ai-academia.com.ua</a>
  </p>
</div>
```

**Текстова версія (`text`):**

```
{{HELLO_TEXT}}

Акаунт в AI Академії створено. Тепер прогрес зберігається сам, а за пройдений курс
ти отримаєш іменний сертифікат із публічним кодом перевірки.

Як це працює:
- Уроки проходяться по черзі — наступний відкривається після тесту до попереднього.
- Тест можна перескладати скільки завгодно разів.
- Імʼя для сертифіката змінюється в меню акаунта — доки сертифікат ще не виданий.

Перейти до навчання: https://ai-academia.com.ua

Усі курси безкоштовні, реклами немає. Щось не працює або є питання — напиши нам
через форму «Написати нам» на сайті.

Якщо акаунт створював не ти — просто видали цей лист і нічого не роби.

AI Академія — безкоштовні курси про штучний інтелект українською.
ai-academia.com.ua
```

**Чотири обмеження тексту (всі — з `task.md`, не моя вигадка):**
1. **Курси поіменно не перелічуються** — після релізу Jira перелік застаріє, а бот деплоїться
   окремо від сайту.
2. **Про «Забули пароль?» не згадуємо** — бот їде в прод раніше, ніж код сайту; обіцяти
   неіснуючу кнопку не можна.
3. Рядок «Якщо акаунт створював не ти…» **обовʼязковий**: `mailer_autoconfirm: true`, тобто
   адресу ніхто не підтверджує, і людина могла зареєструвати чужу пошту (розділ 10, ризик Р-6).
4. У листі **немає нічого таємного** — ні пароля, ні посилання для входу, ні коду.

---

## 5. Композиція UI — це «макет» для фронтендера

Дизайн-брифу немає за рішенням власника. Нижче — точна розмітка, класи, `id`, `aria-*`, порядок
елементів і фокус. **Нуль Tailwind-утиліт у JS** (клас із JS Tailwind CDN генерує через ~53 мс —
006 D-02 дав зсув 64,8 px). **Нуль альфа-модифікаторів** (`bg-ink/85` на `var()`-кольорі дає
повністю прозоре). **`css/components.css` не чіпати.**

### 5.0 Пастка №1, через яку це треба прочитати до верстки

**`hidden` не ховає елемент, у якого є інлайновий `display`.** У `buildModal` інлайновий
`display` стоїть щонайменше на `#aiaSocial` (`display:grid`, рядок 318), на рядку «або»
(`display:grid`, рядок 295) і на `#aiaForm` (`display:grid`, рядок 342). Якщо на такий вузол
поставити `hidden`, він лишиться видимим — без жодної помилки в консолі.

Тому в `wireModal` зʼявляється **один хелпер**, і перемикання видимості йде **тільки через нього**:

```js
// on === true  → показати; on === false → сховати (і прибрати із зупинок табуляції)
// display      → яке значення display повернути при показі ("" = віддати CSS)
function show(node, on, display) {
  if (!node) return;
  node.hidden = !on;
  node.style.display = on ? (display || "") : "none";
}
```

Яке `display` передавати:

| Вузол | `display` при показі | Чому |
| --- | --- | --- |
| `#aiaSocial` | `"grid"` | інлайновий grid із `gap` — порожній рядок зламав би відступи |
| `#aiaOrRow` | `"grid"` | три колонки `1fr auto 1fr` інлайном |
| усі інші | `""` | значення бере свій `ds-*`-клас |

### 5.1 Що додається до `buildModal()` — дослівний перелік

Порядок блоків усередині `.ds-dlg__card` **не змінюється**. Додаються сім вузлів і три `id`
на наявні.

| № | Де | Що |
| --- | --- | --- |
| 1 | рядок «або» (нині без `id`) | **додати `id="aiaOrRow"`** |
| 2 | обгортка `.ds-fld` поля email | **додати `id="aiaEmailFld"`** |
| 3 | обгортка `.ds-fld` поля пароля | **додати `id="aiaPassWrap"`** |
| 4 | **після** `#aiaTabs`, **перед** `#aiaForm` | `<p class="ds-lead" id="aiaResetLead" hidden>…</p>` — лід виду «Відновлення» |
| 5 | усередині `#aiaForm`, **одразу після** `#aiaPassWrap` | рядок із посиланням «Забули пароль?» (розмітка нижче) |
| 6 | усередині `#aiaForm`, **після** рядка 5 | `<p class="ds-small" id="aiaResetHint" hidden>…</p>` — підказка про Google |
| 7 | усередині `#aiaForm`, **після** `#aiaSubmit` | кнопка `#aiaResetSubmit`, контейнер `#aiaResetOk`, кнопка `#aiaResetBack` (розмітка нижче) |
| 8 | корінь `#aiaAuthModal` | **додати `data-view="auth"`** — щоб QA міг перевірити стан одним селектором |

**Рядок «Забули пароль?» (пункт 5):**

```html
<p id="aiaForgotRow" style="margin:0">
  <button type="button" class="ds-btn ds-btn--quiet ds-btn--sm" id="aiaForgot">Забули пароль?</button>
</p>
```

Видимість: показується **лише** коли `data-tab="login"` **і** `data-view="auth"`.
На вкладці «Реєстрація» і у вигляді «Відновлення» — `show(row, false)`.
`ds-btn--quiet ds-btn--sm` дає висоту `--ctl-h-sm`; ціль по висоті — компонентна, окремих
правил доступності не треба.

**Хвіст форми (пункт 7):**

```html
<button type="button" class="ds-btn ds-btn--primary" id="aiaResetSubmit" hidden>Надіслати посилання</button>
<div id="aiaResetOk" role="status" aria-live="polite"></div>
<p id="aiaResetBackRow" style="margin:0" hidden>
  <button type="button" class="ds-btn ds-btn--quiet ds-btn--sm" id="aiaResetBack">← Назад до входу</button>
</p>
```

**`#aiaResetOk` завжди в DOM і завжди порожній** у вигляді «Вхід». Не можна зробити його
схованим `ds-note` і потім показати: жива область, яка зʼявилась уже з готовим вмістом,
скрінрідером не озвучується. Наповнюємо `innerHTML` у мить успіху — тоді озвучення спрацьовує.
Той самий прийом уже вживається для `#aiaPanelSlot`.

### 5.2 Вигляд «Відновлення пароля» — що ховається, що зʼявляється

`setView(v)` всередині `wireModal` (поруч із наявним `setTab`), експортується як `el.__setView`.

| Вузол | `view = "auth"` | `view = "reset"` |
| --- | --- | --- |
| `#aiaSocial` (кнопка Google) | показаний (`grid`) | **схований** |
| `#aiaGoogleStatus` | як є | схований |
| `#aiaOrRow` | показаний (`grid`) | **схований** |
| `#aiaPanelSlot` | як є | **як є** — панель `link-expired` лишається видимою |
| `#aiaTabs` | показаний | **схований** |
| `#aiaResetLead` | схований | **показаний** |
| `#aiaNameWrap` | за вкладкою | згорнутий (`setNameWrap(false)`) |
| `#aiaEmailFld` | показаний | показаний (значення поля переноситься — людина не передруковує) |
| `#aiaPassWrap` | показаний | **схований** |
| `#aiaForgotRow` | лише на вкладці «Вхід» | **схований** |
| `#aiaResetHint` | схований | **показаний** |
| `#aiaError` | як є | очищається при вході у вигляд |
| `#aiaSubmit` | показаний | **схований** |
| `#aiaResetSubmit` | схований | **показаний** |
| `#aiaResetOk` | порожній | **очищається при кожному вході у вигляд** і наповнюється лише після успіху |
| `#aiaResetBackRow` | схований | **показаний** |
| `#aiaModalTitle` | «Вхід» / «Реєстрація» | **«Відновлення пароля»** |
| `#aiaForm` `aria-labelledby` | `aiaTabLogin` / `aiaTabRegister` | **`aiaModalTitle`** |
| корінь `data-view` | `"auth"` | `"reset"` |

**Фокус:**
- вхід у вигляд «Відновлення» → фокус у `#aiaEmail` (не на кнопку: людина однаково має ввести адресу);
- `#aiaResetBack` → `setView("auth")` + `setTab("login")` + фокус назад на `#aiaForgot`;
- Escape закриває **всю модалку** (наявна поведінка `closeTop`), а не вигляд — свідомо: другий
  рівень «вкладеного Escape» люди не вгадують.

### 5.3 Успіх відправлення

При `{ ok: true }`:
1. `show(#aiaEmailFld, false)`, `show(#aiaResetHint, false)`, `show(#aiaResetSubmit, false)`,
   `show(#aiaResetLead, false)` — щоб не можна було відправити вдруге одним кліком;
2. `#aiaError` очищається;
3. `#aiaResetOk.innerHTML` = блок нижче;
4. фокус → `#aiaResetBack` (єдина дія, що лишилась).

```html
<div class="ds-note ds-note--ok">
  <span class="ds-note__glyph" aria-hidden="true">✓</span>
  <p class="ds-note__title">Перевір пошту</p>
  <p>Якщо акаунт із цією адресою існує, лист уже в дорозі. Посилання діє одну годину. Не бачиш листа — глянь у теку «Спам».</p>
</div>
```

Формулювання «якщо акаунт існує» — не ввічливість, а вимога: інакше форма стає перевіркою
«чи зареєстрований цей email». Supabase свідомо не розрізняє ці випадки, і інтерфейс теж не має.

### 5.4 Панель «Посилання вже не діє»

`buildErrorPanel(kind)` отримує **одну зміну**: `data-act` береться з опису помилки, а не
зашитий. Наявні чотири види лишають `retry-google` як типове значення.

```js
var act = e.act
  ? '<p style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--s-2)">' +
      '<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-act="' +
        esc(e.actId || "retry-google") + '">' + esc(e.act) + "</button>" +
      (e.alt ? '<span class="ds-small">' + esc(e.alt) + "</span>" : "") +
    "</p>"
  : "";
```

Слухач кліку в `wireModal` (нині рядки 809-812) розширюється до двох гілок:

```js
el.addEventListener("click", function (e) {
  var b = e.target.closest("[data-act]");
  if (!b) return;
  var a = b.getAttribute("data-act");
  if (a === "retry-google") startWaiting();
  else if (a === "open-reset") setView("reset");
});
```

У `showPanel(el, kind)` для `link-expired` **нічого не перемикати**: панель просто малюється,
людина сама вирішує — надіслати новий лист чи увійти паролем.

### 5.5 Діалог «Новий пароль»

Окремий діалог поверх наявного стека (`openDialog` / `closeEl`), за зразком `buildNameDialog`.
`dismissible: true` — людина вже в акаунті, замикати її в діалозі нема підстав.

```html
<div class="ds-dlg" id="aiaPassModal" hidden data-open="false">
  <div class="ds-dlg__scrim"></div>
  <div class="ds-dlg__card" role="dialog" aria-modal="true"
       aria-labelledby="aiaPassTitle" aria-describedby="aiaPassDesc" tabindex="-1">

    <div class="ds-dlg__head">
      <h2 class="ds-h3" id="aiaPassTitle">Новий пароль</h2>
      <button type="button" class="ds-btn ds-btn--quiet ds-btn--sm ds-btn--icon"
              id="aiaPassClose" aria-label="Закрити"><!-- SVG_CLOSE --></button>
    </div>

    <p class="ds-small" id="aiaPassDesc" style="margin-bottom:var(--s-4)">Придумай новий пароль — від 6 символів. Він почне діяти одразу.</p>

    <div class="ds-fld" id="aiaPassFld">
      <label class="ds-fld__label" for="aiaPassNew">Новий пароль</label>
      <input id="aiaPassNew" class="ds-fld__input" type="password"
             autocomplete="new-password" maxlength="128" aria-describedby="aiaPassHint" />
      <p class="ds-fld__hint" id="aiaPassHint">Мінімум 6 символів.</p>
    </div>

    <p class="ds-fld__error" id="aiaPassError" role="alert" style="margin-top:var(--s-2)" hidden></p>

    <div id="aiaPassStatus" role="status" aria-live="polite"></div>

    <div id="aiaPassActions" style="display:flex;flex-wrap:wrap;align-items:center;gap:var(--s-2);margin-top:var(--s-5)">
      <button type="button" class="ds-btn ds-btn--primary" data-act="save-pass">Зберегти пароль</button>
      <button type="button" class="ds-btn ds-btn--quiet" data-act="cancel">Скасувати</button>
    </div>

  </div>
</div>
```

**Поведінка:**
- `SVG_CLOSE` — наявна константа `js/auth-ui.js:166-168`, з обовʼязковими `width="16" height="16"`.
- Фокус при відкритті: **у `#aiaPassNew`** (виняток із правила «фокус на картку»: діалог має рівно
  одне поле, і людина прийшла сюди саме друкувати; клавіатура на мобілці тут доречна).
- Enter у полі = клік по «Зберегти пароль».
- Валідація **до** виклику `onSave`, тими самими межами й текстами, що й у `submitForm`:
  порожньо → `Вкажи пароль.` · `< 6` → `Пароль має містити щонайменше 6 символів.` ·
  `> 128` → `Пароль задовгий (максимум 128 символів).`
- Поки `onSave` у польоті: обидві кнопки `disabled`, напис основної → `Зачекай…` (`T.form.wait`).
  Повторний клік і повторний Enter ігноруються (`if (btn.disabled) return;` — як у `submitForm`).
- `{ ok: false }` → діалог **лишається**, текст у `#aiaPassError`, кнопки відпускаються,
  фокус у `#aiaPassNew`.
- `{ ok: true }` → `show(#aiaPassFld, false)`, `show(#aiaPassActions, false)`,
  `#aiaPassError` схований, `#aiaPassDesc` схований; `#aiaPassStatus.innerHTML` =

```html
<div class="ds-note ds-note--ok">
  <span class="ds-note__glyph" aria-hidden="true">✓</span>
  <p class="ds-note__title">Пароль змінено</p>
  <p>Ти вже в акаунті — більше нічого робити не треба. Наступного разу входь новим паролем.</p>
</div>
<p style="margin-top:var(--s-5)">
  <button type="button" class="ds-btn ds-btn--primary" data-act="pass-done">Готово</button>
</p>
```

  фокус → кнопка «Готово»; клік по ній закриває діалог і резолвить `{ action: "saved" }`.
- Escape / ✕ / «Скасувати» / клік по підложці **до** успіху → `{ action: "cancelled" }`.
  Після успіху вони теж закривають діалог, але результат уже зафіксований як `"saved"`
  (прапорець `settled`, як в `openNameDialog:941-971`).

### 5.6 Повний перелік нових рядків `T` (`js/auth-ui.js`)

Додаються в наявний обʼєкт `T`. **Жоден наявний рядок не змінюється.**

```js
reset: {
  link:   "Забули пароль?",
  title:  "Відновлення пароля",
  lead:   "Введи email, яким ти реєструвався — надішлемо посилання, щоб задати новий пароль.",
  google: "Входив через Google? Тоді пароль не потрібен — повернись і натисни «Продовжити з Google».",
  submit: "Надіслати посилання",
  wait:   "Надсилаємо…",
  back:   "← Назад до входу",
  okTitle:"Перевір пошту",
  okBody: "Якщо акаунт із цією адресою існує, лист уже в дорозі. Посилання діє одну годину. Не бачиш листа — глянь у теку «Спам»."
},

pass: {
  title:  "Новий пароль",
  desc:   "Придумай новий пароль — від 6 символів. Він почне діяти одразу.",
  label:  "Новий пароль",
  hint:   "Мінімум 6 символів.",
  save:   "Зберегти пароль",
  cancel: "Скасувати",
  okTitle:"Пароль змінено",
  okBody: "Ти вже в акаунті — більше нічого робити не треба. Наступного разу входь новим паролем.",
  done:   "Готово"
}
```

І новий вид у `T.err`:

```js
"link-expired": {
  title: "Посилання вже не діє",
  why:   "Воно діє одну годину й лише один раз. Схоже, час минув або ти вже ним скористався.",
  act:   "Надіслати новий лист",
  actId: "open-reset",
  alt:   "або увійди паролем нижче"
}
```

Наявним чотирьом видам (`cancelled`, `open`, `conflict`, `other`) `actId` **не дописуємо** —
`buildErrorPanel` підставить типове `retry-google`.

---

## 6. Межі, які не знімає жоден дозвіл

Вписано сюди, щоб жоден агент конвеєра на них не наступив.

1. **Акаунти агенти не створюють** — ні тестові, ні будь-які. Це межа інструменту, не дозволу
   (встановлено 2026-09-05). Тестовий акаунт заводить власник.
2. **API-ключ Resend і будь-які паролі агенти не бачать і не вводять.** У поле пароля SMTP у
   Supabase і в секрет `RESEND_API_KEY` значення вставляє **власник**. Агент може переконатись,
   що поле/секрет **непорожнє**, і на цьому все.
3. **Новий пароль у діалозі «Новий пароль» вводить власник.** QA цього не робить.
4. **Тестову реєстрацію робить власник** (пункт 1 — наслідок).
5. **Мерж у `main` — тільки коренева сесія після прямого «так» власника.** Жоден агент не
   виконує `git push origin main`, `git merge` у `main`, `git checkout main`.
6. **Без SQL-міграцій.** Жодного DDL, жодного `apply_migration`, жодного кліку «Run» у SQL Editor.
7. **`mailer_autoconfirm` («Confirm email») не чіпати.**
8. **Версії платформ, `site.updated`, `sitemap.xml`, `roadmap.json` не чіпати** — нових адрес
   немає, а зміна дат дала б конфлікт із невипущеним 012 на `dev`.
9. **`css/components.css` не чіпати** — нових класів задача не вимагає (розділ 2.2).
10. **`wrangler.toml`, `.assetsignore`, `.gitignore`, `dev/design/`** — поза зоною для всіх.
11. **Основне дерево `/Users/ander1.sage/Downloads/AIA` не чіпати** — там `dev` із невипущеним 012.
    Усі команди — `git -C /Users/ander1.sage/Downloads/AIA-015 …`, усі шляхи — абсолютні.
12. **Репозиторій публічний:** ні ключів, ні токенів, ні email учнів, ні значень DNS-секретів
    у звітах, коментарях коду й `tg/CHANGELOG.md`.
13. **`push` робить коренева сесія** — upstream гілки знятий навмисно.

---

## 7. Нарізка робіт

### 7.1 Бекендер (`aia-build-backend`) — крок 1 конвеєра

Зона: `js/auth.js` · `tg/telegram_index.ts` · `tg/CHANGELOG.md` ·
`dev/build/015-password-reset/02-backend/` · Chrome (Resend, Cloudflare, Supabase Dashboard).

#### Б-0. Спершу — перевірити стан (нічого не чекати)

Власник із кореневою сесією вставляє SMTP-пароль і `RESEND_API_KEY` **паралельно** з роботою ПМ.
Можливо, на старті їх ще немає. **Не чекати.**

- [ ] Supabase → Project Settings → Authentication → **SMTP Settings**: чи стоїть «Enable Custom SMTP»;
      якщо так — звірити Host / Port / Username / Sender email / Sender name з Б-3 (пароль **не чіпати**).
- [ ] Supabase → Edge Functions → **Secrets**: чи є імʼя `RESEND_API_KEY` (значення не відкривати).
- [ ] Resend → Domains: чи доданий `ai-academia.com.ua` і який статус.
- [ ] Записати знайдений стан у `02-backend/report.md` розділом «Стан на старті».
- [ ] **Якщо чогось немає — робити все, що від цього не залежить** (Б-5, Б-6 — код; Б-2 — DNS),
      а залежне помітити у звіті як «чекає на власника».

#### Б-1. Resend: домен і регіон

- [ ] Акаунт створює власник. Агент заходить у вже відкриту сесію Chrome.
- [ ] Domains → Add Domain → `ai-academia.com.ua`, **Region: EU (Ireland)** — вимога власника.
- [ ] Виписати три записи, які показав Resend (тип, імʼя, значення, пріоритет) —
      у `02-backend/report.md`. Довгий DKIM-ключ у звіт **не вставляти** цілком: вистачить
      «TXT `resend._domainkey`, значення з панелі Resend».

#### Б-2. Cloudflare DNS (зона `ai-academia.com.ua`)

Домен зараз **без MX і без TXT** (`dig`, 2026-10-02) — конфліктів не буде.

- [ ] `MX` · Name **`send`** · Mail server — зі сторінки Resend · Priority **10**.
- [ ] `TXT` · Name **`send`** · Content — SPF-рядок зі сторінки Resend.
- [ ] `TXT` · Name **`resend._domainkey`** · Content — DKIM зі сторінки Resend ·
      **Proxy status: `DNS only`**.
- [ ] ⚠ Імʼя писати **без домену**: `send`, а не `send.ai-academia.com.ua` — Cloudflare дописує
      зону сам. Інакше вийде `send.ai-academia.com.ua.ai-academia.com.ua`.
- [ ] ⚠ Якщо Cloudflare відмовляє з Code 1004 — це проксі на записі; вимкнути.
- [ ] DMARC (`_dmarc`) **не додавати** — відкрите питання 2.
- [ ] Resend → Verify DNS Records → дочекатись **`Verified`**. Якщо за 15 хв не позеленіло —
      не крутити далі, записати у звіт і йти до наступних кроків (Resend дає до 72 год).

#### Б-3. Supabase Auth через Dashboard

- [ ] Project Settings → Authentication → SMTP Settings → **Enable Custom SMTP**:
      Sender email `no-reply@ai-academia.com.ua` · Sender name `AI Академія` ·
      Host `smtp.resend.com` · Port `465` · Username `resend` · Password — **вставляє власник**.
- [ ] Authentication → URL Configuration → **Redirect URLs**: додати
      `https://password-reset-ai-academy.andriy-puhalsky.workers.dev/**`.
      **Тимчасово** — у чеклист мержу (розділ 10, Р-10). Наявні чотири адреси не чіпати.
- [ ] Authentication → URL Configuration → **Site URL** має лишитись `https://ai-academia.com.ua`.
- [ ] Authentication → Providers → **Email**: переконатись, що «Secure password change»
      (підтвердження старим паролем) **вимкнено** — інакше `updateUser({ password })` зажадає
      нонсу й діалог нового пароля зламається. **Якщо воно ввімкнене — не вимикати самому,
      записати у звіт і спитати власника.**
- [ ] «Confirm email» / `mailer_autoconfirm` **не чіпати**.
- [ ] Rate Limits — **не чіпати** (лишаємо 30/год, відкрите питання 3).
- [ ] Authentication → Emails → Templates → **Reset password**: тема й тіло з розділу 4.1.
- [ ] Authentication → Emails → **Password changed**: увімкнути сповіщення, тема й тіло з розділу 4.2.
- [ ] Перевірка без Dashboard: `GET <supabase-url>/auth/v1/settings` має й далі давати
      `"mailer_autoconfirm": true`, `"email": true`, `"google": true` (тобто нічого не зламали).

#### Б-4. Знімок «до» для Edge Function

- [ ] Edge Functions → `telegram` → скопіювати **задеплоєний** код у
      `02-backend/deployed-before-015.ts`.
- [ ] Звірити його з `tg/telegram_index.ts` у гілці **до правок** (має збігатись — це версія 013).
      Розбіжність = хтось деплоїв повз репозиторій → **зупинитись і написати у звіт**, не деплоїти.

#### Б-5. Код `js/auth.js`

- [ ] `readRecovery()` — нова функція за розділом 3.4; викликати **першим рядком** `boot()`
      (поруч із `readOAuthError()`).
- [ ] `hadAuthParams` → додати `|| recovery !== null`.
- [ ] `verifyOtp` — крок 7+ розділу 3.3, **до** `Promise.all([buildModuleMap(), refreshSession()])`.
      Помилку не ковтати: `console.warn("[AIA auth] verifyOtp:", safeErrorText(e))` — **через
      `safeErrorText`**, бо сирий `AuthApiError` несе тіло відповіді.
- [ ] `AUTH_KEYS` у `cleanUrl()` → додати `"token_hash"` (`type` там уже є).
- [ ] `readOAuthError()` — **нова перша гілка**:
      `if (/otp_expired|email link is invalid|email link has expired/.test(probe)) out = "link-expired";`
      і тільки потім наявні `access_denied|denied|cancel`. Без цього прострочене посилання
      показує «Вхід через Google скасовано».
- [ ] `requestPasswordReset` і `updatePassword` — за розділом 3.1.
- [ ] `handlers` → два нові ключі.
- [ ] `runPasswordDialog()` — тонка обгортка: бере `ui().openPasswordDialog({ onSave: updatePassword })`,
      нічого не вирішує сама; якщо `openPasswordDialog` немає (стара версія `auth-ui.js`) —
      `console.warn` і вихід, **не ламати сторінку**.
- [ ] Хвіст `boot()` — гілка 13+ розділу 3.3.
- [ ] `translateError` — чотири нові рядки з розділу 3.5, **після** перевірки 429.
- [ ] Шапку файла (коментар рядки 9-19) оновити: додати «відновлення пароля» в перелік
      і новий публічний інтерфейс.
- [ ] `window.AIAAuth` **не розширюємо** — зовнішніх споживачів у відновлення немає.
- [ ] Перевірка синтаксису без збірки: `node --check js/auth.js` не годиться для ES-модуля з
      `import` з URL — відкрити сторінку локально (`python3 -m http.server`) і подивитись консоль.

#### Б-6. Код `tg/telegram_index.ts`

- [ ] Нові константи поруч із рядками 44-49:
      `const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";`
      `const MAIL_FROM = "AI Академія <no-reply@ai-academia.com.ua>";`
- [ ] `sendWelcomeEmail(r)`:
      - немає `RESEND_KEY` → `console.warn` **без адреси** і тихий вихід (бот від цього не падає);
      - немає `r.email` → те саме;
      - `POST https://api.resend.com/emails`, заголовки `Authorization: Bearer …`,
        `Content-Type: application/json`, **`Idempotency-Key: welcome-<r.id>`**
        (ключі Resend живуть 24 год — захист від повтору вебхука);
      - тіло: `{ from: MAIL_FROM, to: [email], subject, html, text }` — тексти з розділу 4.3;
      - імʼя в HTML — через наявний `escapeHtml`; у `text` — як є;
      - при `!res.ok` — `console.error` зі **статусом** і першими 200 символами тіла,
        **прогнаними через `.replace(/[^\s@]+@[^\s@]+/g, "…")`**, щоб адреса не поїхала в лог.
- [ ] Гілка вебхука (нині рядок 383):
      `if (body.table === "profiles" && body.type === "INSERT") { … }` — **`&& ADMIN` знімається
      з умови гілки** й лишається тільки навколо Telegram-повідомлення. Інакше без
      `ADMIN_CHAT_ID` лист «Вітаємо» не піде.
- [ ] Усередині — `await Promise.allSettled([ <telegram>, sendWelcomeEmail(r) ])`:
      **збій одного не скасовує інше**. Текст Telegram-повідомлення не змінювати ні на символ.
- [ ] Гілку `certificates` (013) не чіпати.
- [ ] Шапку файла (коментарі рядки 1-41) доповнити: новий секрет `RESEND_API_KEY` і третя
      річ, яку робить функція.

#### Б-7. Деплой і журнал

- [ ] Edge Functions → `telegram` → вставити новий код → Deploy. **`verify_jwt` лишається
      вимкненим** (Telegram не шле Supabase-токен).
- [ ] Якщо деплой відхилить класифікатор дозволів — **не обходити**: записати у звіт,
      деплой зробить коренева сесія або власник (прецедент 013).
- [ ] `tg/CHANGELOG.md` — запис `## 2026-10-02` **зверху**: що увімкнено (SMTP + відправник),
      які шаблони змінені, який Redirect URL доданий тимчасово, що задеплоєно у функції,
      який секрет зʼявився (**лише імʼя**), які DNS-записи додані (**типи й імена, без значень**).
- [ ] `02-backend/report.md`: стан на старті, що зроблено, що лишилось власнику, чи піднявся
      домен у Resend, чи вдалося звірити схему (міграцій немає — писати «база не змінювалась»).
- [ ] Коміт:
      `git -C /Users/ander1.sage/Downloads/AIA-015 commit -- js/auth.js tg/telegram_index.ts tg/CHANGELOG.md dev/build/015-password-reset/02-backend -m "015 feat: відновлення пароля в шарі даних + лист «Вітаємо» в Edge Function"`

### 7.2 Фронтендер (`aia-build-frontend`) — крок 2 конвеєра

Зона: **тільки** `js/auth-ui.js` + `dev/build/015-password-reset/03-frontend/`.
Працює **з розділів 3 і 5 цього плану**, у `js/auth.js` не заглядає по імена.

- [ ] Ф-1. Прочитати розділ 5.0 (пастка `hidden` + інлайновий `display`) і додати хелпер `show`.
- [ ] Ф-2. `T` — нові блоки `reset`, `pass` і вид `err["link-expired"]` (розділ 5.6).
      Наявні рядки не чіпати.
- [ ] Ф-3. `buildErrorPanel` — `actId` із типовим `retry-google` (розділ 5.4).
- [ ] Ф-4. `buildModal` — сім вузлів і три `id` з таблиці 5.1 + `data-view="auth"` на корені.
- [ ] Ф-5. `wireModal` — `setView(v)` за таблицею 5.2, експорт `el.__setView`;
      у наявному `setTab` додати рядок, що ховає/показує `#aiaForgotRow`.
- [ ] Ф-6. `wireModal` — слухач кліку на `[data-act]` із двома гілками (`retry-google`, `open-reset`);
      кнопка `#aiaForgot` → `setView("reset")`; `#aiaResetBack` → назад.
- [ ] Ф-7. `submitReset(el)`: валідація email тими самими `T.form.emailEmpty` / `T.form.emailBad`,
      `callHandler("requestPasswordReset", { email })`, блокування кнопки на час запиту
      (`T.reset.wait`), успіх — розділ 5.3, невдача — текст у `#aiaError`.
- [ ] Ф-8. Enter: у вигляді `reset` Enter у `#aiaEmail` має кликати `submitReset`, **не**
      `submitForm`. Наявний слухач (рядки 816-820) розгалузити за `data-view`.
- [ ] Ф-9. `buildPasswordDialog()` + `wirePasswordDialog()` + `openPasswordDialog(o)` — розділ 5.5.
- [ ] Ф-10. `openAuthModal` — підтримка `o.view`: і для нової модалки, і для вже відкритої
      (гілка 1237-1247). Порядок усередині: спершу `panel`, потім `view`, потім фокус.
- [ ] Ф-11. `window.AIAAuthUI` — додати `openPasswordDialog`. Нічого не прибирати.
- [ ] Ф-12. Самоперевірка перед комітом (локально, `python3 -m http.server`, свій порт):
      консоль без помилок · `grep` по `js/auth-ui.js` на Tailwind-утиліти (`text-`, `bg-`, `px-`,
      `sm:`, `md:`) — **нуль нових** · жодного `/` у значеннях кольорів · `components.css` у
      `git status` **не зʼявляється**.
- [ ] Ф-13. `03-frontend/report.md` + коміт:
      `git -C /Users/ander1.sage/Downloads/AIA-015 commit -- js/auth-ui.js dev/build/015-password-reset/03-frontend -m "015 feat: вигляд відновлення пароля й діалог нового пароля"`

### 7.3 Порядок і залежності

Конвеєр **послідовний за рішенням власника** — паралелізм не застосовується, хоча перетину
файлів немає. Практичний наслідок:

```
ПМ (цей план)
   │
   ▼
бекендер ── Б-0 (стан) ─┬─ Б-1…Б-3 Chrome (залежить від власника: ключ, акаунт Resend)
                        └─ Б-5, Б-6 код (НЕ залежить ні від чого) ─→ Б-4, Б-7 деплой
   │  коміт + коренева сесія пушить → превʼю гілки
   ▼
фронтендер (бачить живі handlers на превʼю, але спирається на розділи 3 і 5)
   │  коміт + push
   ▼
QA на превʼю гілки (розділ 9.1)
   │  дефекти → назад авторові, максимум 3 кола
   ▼
фінальний прогін кореневої сесії з власником (розділ 9.2) → SUMMARY.md → рішення про мерж
```

**Що бекендер робить навіть без ключа Resend:** увесь код (Б-5, Б-6), знімок «до» (Б-4),
DNS-записи (Б-2, якщо домен уже доданий), шаблони листів (Б-3 — редагування шаблонів
стає доступним **лише після** ввімкнення власного SMTP: на вкладці Templates інакше висить
«Set up custom SMTP to edit templates»).

**Що блокує фронтендера:** нічого, крім послідовності. Контракт у розділі 3 повний.

**Що блокує QA:** превʼю гілки має містити **обидва** коміти.

---

## 8. Стани і крайні випадки

### 8.1 Стани інтерфейсу

| Стан | Що видно |
| --- | --- |
| Гість, вкладка «Вхід» | Google · «або» · таби · email · пароль · **«Забули пароль?»** · «Увійти» |
| Гість, вкладка «Реєстрація» | те саме + імʼя, **без** «Забули пароль?» |
| Вигляд «Відновлення», порожній | заголовок «Відновлення пароля» · лід · email · підказка про Google · «Надіслати посилання» · «← Назад до входу» |
| Вигляд «Відновлення», у польоті | кнопка `disabled`, напис «Надсилаємо…»; повторний клік/Enter ігнорується |
| Вигляд «Відновлення», успіх | `ds-note--ok` «Перевір пошту» · «← Назад до входу»; поля й кнопки відправки прибрані |
| Вигляд «Відновлення», помилка | текст у `#aiaError`, поля лишаються заповненими |
| Повернення з листа, сесія є | діалог «Новий пароль» поверх сторінки; шапка вже показує імʼя |
| Повернення з листа, сесії немає | модалка з панеллю «Посилання вже не діє» + кнопка «Надіслати новий лист» |
| Діалог «Новий пароль», у польоті | обидві кнопки `disabled`, «Зачекай…» |
| Діалог «Новий пароль», успіх | `ds-note--ok` «Пароль змінено» + «Готово» |
| Немає мережі | `translateError` без `msg` → «Щось пішло не так. Спробуй ще раз.» |
| `auth-ui.js` не завантажився | `js/auth.js` пише один `console.error` (наявний `ui()`), сторінка працює далі |
| `auth.js` не завантажився | `callHandler` пише `console.warn("немає обробника requestPasswordReset")`, модалка не падає |

### 8.2 Крайні випадки (перевіряються завжди)

- **Порожньо / завантаження / помилка** — усі три стани описані вище для кожної дії.
- **Дуже довгий український текст.** Найдовші рядки (пораховані, не оцінені):
  `T.reset.okBody` — **117 знаків**, `T.reset.google` — **89**,
  `T.err["link-expired"].why` — **82**. На 390 px вони дають 4–6 рядків
  у `ds-note` і `ds-small` — перевірити, що картка не виповзає за екран і не зʼявляється
  горизонтальний скрол.
- **Один елемент проти двадцяти** — не застосовується (списків немає).
- **Мобілка ≤640 / планшет 768 / десктоп 1440.** На ≤640 `.ds-dlg` переходить у
  `align-items: safe end` з `padding: 0` (`components.css:519-529`) — модалка стає аркушем
  знизу. Вигляд «Відновлення» коротший за «Вхід», тож ризик — не висота, а перенос кнопок у
  рядку дій діалогу пароля (`flex-wrap: wrap` уже стоїть).
- **Залогінений vs незалогінений.** «Забули пароль?» бачить лише гість — модалка входу
  залогіненому не показується взагалі. Якщо людина **вже залогінена** і відкриває посилання з
  листа — `verifyOtp` перемкне сесію на власника посилання (розділ 10, Р-3).
- **Подвійний клік і повторна відправка** — `if (btn.disabled) return;` в обох формах;
  після успіху відправки форма прибирається повністю.
- **Відсутня мережа** — `fetch` кидає, `translateError` без `msg` дає загальний текст.
- **`prefers-reduced-motion`** — поява діалогів уже на переході `data-open`; `tokens.css`
  гасить рух глобально (010). Нових анімацій задача не додає **взагалі**.
- **Клавіатура й видимий фокус** — порядок Tab у вигляді «Відновлення»: ✕ → email →
  «Надіслати посилання» → «← Назад до входу» (панель помилки, якщо є, стоїть перед полем).
  Пастка фокуса — наявна (`trap`, рядки 547-558); схованим вузлам `hidden` + `display:none`
  вимикає табуляцію (саме тому хелпер `show` ставить обидва).
- **Два діалоги одночасно.** Якщо людина відкрила модалку входу й прийшла з листа —
  `openPasswordDialog` ляже **поверх** (наявний стек `openDialog`: нижній отримує `inert` +
  `aria-hidden`). Escape закриває лише верхній. Перевірити, що після закриття верхнього фокус
  повертається в нижній (`closeTop`, рядки 640-644).

---

## 9. Критерії приймання

Кожен пункт — твердження, на яке два різні агенти дадуть однакову відповідь.

### 9.1 Перевіряє QA сам, на превʼю гілки `https://password-reset-ai-academy.andriy-puhalsky.workers.dev`

Chrome, ширини **1280** і **390**, вкладка активна (у фоні CLS і rAF не міряються).

**Вигляд і композиція**
1. На `/` кнопка «Увійти» відкриває модалку; під полем пароля видно кнопку **«Забули пароль?»**
   точно цим текстом.
2. Перемикання на вкладку «Реєстрація» ховає «Забули пароль?»; повернення на «Вхід» — повертає.
3. Клік по «Забули пароль?» дає `#aiaAuthModal[data-view="reset"]`; заголовок модалки —
   **«Відновлення пароля»**.
4. У вигляді «Відновлення» **не видно** жодного з: кнопки «Продовжити з Google», рядка «або»,
   перемикача «Вхід / Реєстрація», поля імені, поля пароля, кнопки «Увійти».
5. У вигляді «Відновлення» видно: лід, поле email, підказку «Входив через Google? …»,
   кнопку «Надіслати посилання», кнопку «← Назад до входу».
6. Текст, уведений у поле email на вкладці «Вхід», **зберігається** після переходу у вигляд
   «Відновлення» (не треба передруковувати).
7. «← Назад до входу» повертає `data-view="auth"`, вкладку «Вхід» і фокус на «Забули пароль?».

**Валідація й відправка**
8. Порожнє поле + «Надіслати посилання» → під полем зʼявляється «Вкажи email.»,
   мережевого запиту **немає** (вкладка Network порожня).
9. `не-пошта` + «Надіслати посилання» → «Схоже, email введено некоректно.», запиту немає.
10. **Один** клік із адресою `qa-no-such-user@example.com` → зелена панель «Перевір пошту»
    з текстом «Якщо акаунт із цією адресою існує…»; поле й кнопка відправки зникають; фокус —
    на «← Назад до входу». ⚠ **Правила тесту:** рівно одна відправка за коло, адреса —
    тільки `@example.com`, **ніколи** реальна адреса учня чи власника. Такого користувача
    в базі немає, отже лист не надсилається й у базу нічого не пишеться.
11. Друга спроба тієї самої адреси протягом 60 с (якщо виконується) → текст
    «Забагато спроб. Зачекай хвилину і спробуй ще раз.», а не мовчазна невдача.

**Повернення з листа**
12. `/?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`
    → модалка відкривається **сама** з панеллю **«Посилання вже не діє»** (а не «Вхід через
    Google скасовано»).
13. На тій самій панелі є кнопка **«Надіслати новий лист»**; клік по ній перемикає модалку у
    вигляд «Відновлення».
14. Після пункту 12 адресний рядок **чистий**: ні `error`, ні `error_code`, ні `error_description`.
15. `/?token_hash=bad&type=recovery` → модалка з панеллю «Посилання вже не діє»; адресний
    рядок чистий (немає ні `token_hash`, ні `type`).
16. Те саме на сторінці уроку: `/modules/module-01?token_hash=bad&type=recovery` → сторінка
    не лишається порожньою (шлагбаум `#aiaGate` знімається), панель видно.
17. У консолі після пунктів 12–16 **немає необроблених винятків**; допускається рівно один
    `warn` виду `[AIA auth] verifyOtp: AuthApiError 403: …` — **без токена в тексті**
    (довгі ідентифікатори мають бути замінені на `…` через `safeErrorText`).

**Доступність і геометрія**
18. Увесь шлях «Увійти → Забули пароль? → Надіслати → Назад» проходиться **лише з клавіатури**;
    на кожному кроці видно кільце фокуса.
19. Tab із останнього елемента вигляду «Відновлення» повертається на перший усередині картки
    (фокус із модалки не виходить).
20. Escape у вигляді «Відновлення» закриває **всю модалку**, і фокус повертається на кнопку,
    що її відкрила.
21. На 390 px у вигляді «Відновлення» і на панелі «Перевір пошту» **немає горизонтального
    скролу** (`document.documentElement.scrollWidth === document.documentElement.clientWidth`).
22. На 1280 px те саме.
23. З увімкненим `prefers-reduced-motion` модалка й вигляди зʼявляються без анімації і
    **без миготіння**.
24. `grep` по `js/auth-ui.js`: нових Tailwind-утиліт у рядках JS немає; `css/components.css`
    у `git diff` гілки **не змінений**.
25. У шапці нічого не змінилось: гість бачить «Увійти», залогінений — імʼя й аватар
    (регресії `renderSlot` немає).

### 9.2 Лишається на фінальний прогін кореневої сесії з власником

Агенти цього не роблять: потрібні реальна пошта, реальний пароль і нова реєстрація.

26. Власник просить відновлення на **свою** адресу → лист приходить (перевірити й теку «Спам»),
    відправник — `AI Академія <no-reply@ai-academia.com.ua>`, тема «Відновлення пароля — AI Академія».
27. Кнопка «Задати новий пароль» відкривається **на телефоні** й веде на ту саму сторінку,
    з якої просили лист.
28. Після відкриття посилання діалог **«Новий пароль»** зʼявляється сам; у шапці вже видно імʼя.
29. Власник вводить новий пароль → зелена панель «Пароль змінено»; приходить другий лист
    «Пароль до акаунта змінено — AI Академія».
30. Вихід → вхід **новим** паролем працює; вхід **старим** дає «Невірний email або пароль.»
31. Повторний клік по тому самому посиланню з листа → **«Посилання вже не діє»**.
32. Власник реєструє новий тестовий акаунт → приходить лист **«Вітаємо в AI Академії — акаунт
    створено»** з його імʼям **і** в Telegram приходить звичне «🟢 Нова реєстрація».
    **Обидва — не або-або.**
33. Повторна доставка того самого вебхука (якщо станеться) **не** дає другого листа
    (`Idempotency-Key`).
34. Після прогону власник видаляє тестовий акаунт (Authentication → Users), як у 005-4.

---

## 10. Ризики

| № | Ризик | Ціна | Як перевірити заздалегідь |
| --- | --- | --- | --- |
| Р-1 | **Прострочене посилання читається як «Google скасовано».** `readOAuthError` ловить `access_denied` **раніше**, ніж будь-що про `otp_expired` (`js/auth.js:512`) | людина бачить хибну причину й не знає, що робити | критерій 12; гілка `link-expired` має стояти **першою** в `readOAuthError` |
| Р-2 | **`hidden` не спрацював** через інлайновий `display` на `#aiaSocial` / `#aiaOrRow` | у вигляді «Відновлення» лишається кнопка Google — задача виглядає зламаною, помилок у консолі немає | розділ 5.0; критерій 4 перевіряє саме це |
| Р-3 | **Посилання з листа — це повний вхід в акаунт.** Хто відкрив лист, той у сесії, навіть якщо пароль не змінював (закрив діалог ✕) | стандартна поведінка Supabase, але власник має про неї знати: доступ до пошти = доступ до акаунта | не лагодиться кодом; зафіксовано тут і в `SUMMARY.md` |
| Р-4 | **Акаунт через Google просить відновлення** — чи дасть GoTrue поставити пароль акаунту без пароля | людина опиняється в сесії, але `updateUser` може відмовити | відкрите питання 4; перевіряє власник (пункт 9.2, за бажанням); текст відмови вже перекладений |
| Р-5 | **Лист не доходить або падає в «Спам»** — домен новий, DMARC немає | фіча виглядає непрацюючою | Р-2 чекліста Б-2 (`Verified` у Resend); критерій 26 **обовʼязково включає перевірку «Спаму»** |
| Р-6 | **Хтось реєструє чужу адресу** — `mailer_autoconfirm: true`, адреса не підтверджується; та людина отримає лист «Вітаємо» | скарга на небажаний лист | у листі немає нічого таємного + обовʼязковий рядок «Якщо акаунт створював не ти — просто видали цей лист» (розділ 4.3) |
| Р-7 | **Квота Resend спільна**: 100 листів/день на все (відновлення + «Вітаємо»), Supabase зверху ріже до 30/год | при сплеску листи мовчки не підуть | 13 учнів — запас у рази; якщо колись упремось, у `translateError` уже є гілка 429 |
| Р-8 | **Правка Edge Function ламає робоче сповіщення 013/реєстрацію** | адмін перестає бачити нові реєстрації й сертифікати | Б-4 (знімок «до» + звірка) · `Promise.allSettled` · критерій 32 вимагає **обидва** канали |
| Р-9 | **`&& ADMIN` лишили в умові гілки `profiles`** | без `ADMIN_CHAT_ID` лист «Вітаємо» тихо не піде | Б-6 явно каже винести умову; у звіті бекендера має бути рядок про це |
| Р-10 | **Тимчасовий Redirect URL превʼю гілки лишиться назавжди** | зайва дірка в allow-list; превʼю гілки після мержу зникне | записати в `SUMMARY.md` як пункт чеклиста мержу: прибрати `password-reset-…` і переконатись, що `ai-academia.com.ua/**` на місці |
| Р-11 | **«Secure password change» увімкнений** у налаштуваннях Email | `updateUser({password})` зажадає нонсу — діалог нового пароля не зможе зберегти | Б-3 перевіряє перемикач **до** написання коду; якщо ввімкнений — не вимикати самому, спитати власника |
| Р-12 | **Регістр шляхів.** Нових файлів задача не додає, але правило діє | — | нових посилань у HTML немає взагалі — ризик закритий конструктивно |
| Р-13 | **Коміт захопив чужі файли.** Кілька агентів в одному дереві | зіпсована історія (прецедент 010) | **тільки** `git commit -- <шляхи>`; `git add -A` заборонений; побачив «nothing to commit, working tree clean» — **нічого не переписувати**, написати у звіт |
| Р-14 | **Редактор шаблонів Supabase не прийме `{{ if }}`** | посилання в листі ламається | Б-3: якщо не зберігається — лишити голий `{{ .RedirectTo }}` і записати у звіт; `redirectTo` наш код передає завжди |

---

## 11. Що передати далі

**Бекендеру.** Три місця, де легко зробити правильно й отримати неправильне:
1. **Порядок у `boot()`.** `verifyOtp` **до** `Promise.all([buildModuleMap(), refreshSession()])`.
   Поставиш після — імʼя й прогрес завантажаться від гостя, і людина побачить порожню шапку
   з відкритим діалогом пароля. На подію `PASSWORD_RECOVERY` не підписуйся: вона приходить
   раніше за підписку.
2. **Перша гілка `readOAuthError`.** `otp_expired` містить `access_denied` — якщо не поставити
   `link-expired` **перед** наявною перевіркою, прострочене посилання буде казати «Вхід через
   Google скасовано». Це найтонша помилка в задачі, і вона не видно ні в консолі, ні в тестах.
3. **`&& ADMIN` у гілці вебхука `profiles`.** Умову треба **звузити до Telegram-повідомлення**,
   а не лишати на всій гілці. І `Promise.allSettled`, не `await` поспіль: інакше впалий Resend
   забере з собою сповіщення адміну.
   Додатково: у логи Edge Function **не писати адресу**; у `tg/CHANGELOG.md` — **імена** секретів
   і **типи** DNS-записів, без значень.

**Фронтендеру.** Чотири речі:
1. **Прочитай розділ 5.0 до першого рядка коду.** `hidden` на `#aiaSocial` не спрацює — там
   інлайновий `display:grid`. Це мовчазна помилка: кнопка Google лишиться у вигляді «Відновлення»,
   і консоль буде чиста.
2. **`#aiaResetOk` і `#aiaPassStatus` живуть у DOM завжди й порожні.** Не роби з них схованих
   `ds-note`: жива область, яка зʼявилась уже з готовим текстом, скрінрідером не озвучується.
3. **Enter у вигляді «Відновлення»** має кликати `submitReset`, а не `submitForm` — наявний
   слухач на трьох полях (рядки 816-820) треба розгалузити за `data-view`.
4. **Нуль Tailwind у JS, нуль альфа-модифікаторів, `components.css` не чіпати.**
   Усе, що потрібно, у системі вже є (розділ 2.2). Якщо здається, що класу бракує — це
   композиція сторінки: інлайновий стиль із токенів, як це вже зроблено для рядка «або».

**Тестувальнику.** Де зламається найімовірніше:
1. **Панель прострочення.** Пункти 12–17 — головна частина кола. Два URL задані дослівно, їх
   можна вставити в адресний рядок без жодного листа.
2. **Вигляд «Відновлення» на 390 px.** Текст «Перевір пошту» — 138 знаків; `ds-note` на вузькому
   екрані — найімовірніше місце горизонтального скролу.
3. **Сторінка уроку.** Шлагбаум `#aiaGate` ставить `hidden` на всіх дітей `main` **після**
   відповіді Supabase — тобто пізніше за `load`. Перевіряй пункт 16 саме на `/modules/module-01`,
   не тільки на головній, і дивись, що сторінка не лишилась порожньою.
4. **Жорстка межа:** база **одна й продова**. Акаунтів не створюй, паролів не вводь, реальних
   адрес у поле відновлення не став — тільки `qa-no-such-user@example.com`, **один раз за коло**.
   Усе, що потребує живого листа або пароля, — пункти 26–34, вони не твої.
5. **Звіт — із доказами:** крок → очікувано → фактично → знімок. Не лагодь те, що знайшов.
