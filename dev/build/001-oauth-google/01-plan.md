# 001 — Вхід і реєстрація через Google · План реалізації

- **Джерело:** `task.md` (ТЗ від 2026-08-23)
- **Дизайн:** `dev/design/001-oauth-google/SUMMARY.md`, обрано **варіант B** («Один явний клік»)
- **Платформа:** обидві (модалка `#aiaAuthModal` спільна для AI Академії та AI Architect)
- **Гілка:** `dev`. `main` не чіпати — правило №1 `dev/build/CLAUDE.md`
- **Статус:** у плані → в роботі (щойно бекендер і фронтендер стартують)
- **Автор плану:** `aia-build-pm`, 2026-08-23

---

## 0. Найважливіше в трьох рядках

1. **Джерело розмітки — `dev/design/001-oauth-google/04-variants/shared/` + `variant-b/variant.js`.**
   `03-build/` **застаріле** й переносити з нього нічого не можна (розділ 2.1).
2. `js/auth.js` розрізається на **два файли**: бекендер лишає собі `js/auth.js` (дані),
   фронтендер отримує **новий** `js/auth-ui.js` (розмітка й поведінка). Перетину файлів
   немає взагалі — контракт між ними в розділі 5.
3. Ім'я для сертифіката живе в **`public.profiles.full_name`**, і клієнту дозволено його
   писати **навіть після міграції 002** — вона це право свідомо зберігає. Окрема RPC не потрібна.

---

## 1. Відкриті питання до власника

1. ~~**[було блокуюче]** Провайдер Google вимкнений.~~ **ЗНЯТО 2026-08-24, поки писався
   цей план.** Власник підняв OAuth руками (журнал — `tg/CHANGELOG.md`, запис за
   2026-08-24). Перевірено мною незалежно від Dashboard:
   `GET /auth/v1/settings` → `"google": true`;
   `GET /auth/v1/authorize?provider=google&redirect_to=<dev-превʼю>` → `302` на
   `accounts.google.com/o/oauth2/v2/auth`, `response_type=code`, `scope=email profile`.
   Разом із цим власник виправив `Site URL` (був `http://localhost:8000` — це поламало б
   і OAuth, і листи скидання пароля) і додав чотири `Redirect URLs`, включно з dev-превʼю.
   **Наслідок для конвеєра: зовнішніх блокерів немає, критерій 25 перевіряється повністю.**

2. **[неблокуюче]** Порядок 001 і 002. Задача 001 вводить **перший у проєкті запис у
   `profiles` з клієнта** — рівно те, що міграція 002 узаконює (`grant update (full_name)`)
   і одночасно обмежує (`with check`). **Мій дефолт:** 002 застосувати **до** мержу 001 у
   `main`. Код працює в обох станах бази, тож на роботу конвеєра це не впливає — впливає
   тільки на те, чи поїде в прод відкрита дірка разом із новою фічею.

3. **[неблокуюче]** Валідатор рекомендував узяти з варіанта C одну річ: коли ім'я не
   проходить евристику `looksAuto()`, **міняти місцями кнопки** діалогу — головною робити
   «Виправити ім'я». У §8.2 `00-decisions.md` це питання **не вирішувалось**, і в коді
   `variant-b` кнопки не міняються. **Мій дефолт: НЕ міняти** — фронтендер робить рівно те,
   що в затвердженому варіанті B. Хоче власник інакше — це окремий рядок логіки, дешево
   додати пізніше.

4. **[неблокуюче]** `queryParams` до Google (`prompt: "select_account"`, `hd`, `login_hint`).
   Дизайн про це мовчить. **Мій дефолт: нічого не передавати** — стандартна поведінка Google
   (якщо в браузері один акаунт, вхід буде в один клік; якщо кілька — Google сам покаже вибір).

5. **[неблокуюче]** Копірайт для реального коду помилки `bad_oauth_state` /
   `bad_oauth_callback` (людина відкрила посилання входу двічі або протримала вкладку
   Google надто довго). Наш мапінг віднесе його до `other`, а текст `other` каже
   «Google не повернув причину помилки» — фактично неправда, причину повернув Supabase.
   Дизайн окремого тексту для цього не має. **Мій дефолт: лишити `other`** — стан рідкісний,
   дія («Спробувати ще раз») правильна, а вигадувати текст замість дизайну я не буду.

6. **[неблокуюче]** «М'який» другий дотик (`mode: "soft"`) вимагає памʼятати, що людина вже
   раз підтверджувала ім'я. У макеті це прапорець у демо-стані. Нової колонки в БД дизайн
   не передбачає. **Мій дефолт:** прапорець у `localStorage` під ключем
   `aia:nameConfirmed:<user.id>`, ставиться при будь-якому успішному підтвердженні імені.
   На іншому пристрої людина побачить повний діалог замість м'якого — це не поломка,
   а лише втрата послаблення.

> **Жодне з питань 2–6 конвеєр не спиняє** — у кожного стоїть дефолт, і виконавці йдуть
> за дефолтом, не чекаючи відповіді. Питання 1 знято власником 2026-08-24.
> **Блокуючих питань у цій задачі не лишилось.**

---

## 2. Що є зараз (перевірено в коді й у живих ендпоінтах)

### 2.1 Дизайн: який файл є джерелом правди

**Остаточне джерело розмітки, CSS і токенів:**

| Що беремо | Звідки саме |
| --------- | ----------- |
| Розмітка (білдери) | `04-variants/shared/base.js`, рядки **184–419** (`buildProviderButton`, `buildErrorPanel`, `buildModal`, `buildNameDialog`, `buildAccountSheet`) |
| Поведінка (стек, фокус, Escape, очікування, скелетон) | `04-variants/shared/base.js`, рядки **420–714** |
| Тексти | `04-variants/shared/base.js`, рядки **36–124** (обʼєкт `T`) |
| Іконки (інлайнові SVG) | `04-variants/shared/base.js`, рядки **130–155** (`SVG_G`, `SVG_CLOSE`, `SVG_ALERT`) |
| Токени | `04-variants/shared/tokens.css` |
| Компоненти | `04-variants/shared/base.css`, секції **D (449–557), E (558–830), F (831–916), G (917–977), H (978–1067), I (1068–1133), J (1134–1185)** + із K тільки `.sk-row`/`.sk--name`/`.sk--certs`/`.sk--out` і `.aia-submit[disabled]` |
| Логіка дотику варіанта B | `04-variants/variant-b/variant.js`, `onComplete` |

**`03-build/` (index.html, styles.css, tokens.css, motion.js) — НЕ ВИКОРИСТОВУВАТИ.**
Валідатор знайшов у ньому дві блокуючі поломки (модалка недосяжна на 320×560; фокус
потрапляє на невидиме поле) і десять інших; усі дванадцять виправлень (`FIX-1`…`FIX-12`)
живуть **тільки** в `04-variants/shared/`, а `03-build/` за рішенням валідатора «не
змінювався ні на байт». Це задокументовано у `04-variants/verdict.md`, розділ
«Що саме виправлено у спільній базі». `03-build/NOTES.md` можна читати як пояснення
дизайн-рішень, але шість його тверджень фактично неточні (там же, розділ «Фактичні
неточності») — числа брати з `verdict.md`, не з `NOTES.md`.

**Чого зі `shared/` НЕ переносити:**
- `base.css` секції **B (59–204)** — риштування макета, і **C (205–448)** — репліка сайту;
- із секції **K** — `.nban*` (це варіант A), `.confirm*` (варіант C), `.gfix*` (риштування),
  `.paper--tile` (відхилена альтернатива, §8.2 `00-decisions.md`);
- із `tokens.css` — `--rig-bg`, `--rig-bg-hover`, блок `[data-variant="a|b|c"]`,
  блок `.rm` (класовий дублікат reduced-motion; на сайті лишається тільки медіа-запит);
- із `base.js` — усе від рядка **715** («ДЕМО») і нижче, крім `renderSlot` (835–864),
  `openAuth` (876–888), `openNameDialog` (889–905), `wireNameDialog` (906–957),
  `openSheet` (958–980) — ці пʼять є частиною поведінки, а не риштування, і переносяться
  з викиданням посилань на `demo`, `stage`, `flash`, `api`.

### 2.2 Код сайту

| Місце | Що там зараз |
| ----- | ------------ |
| `js/auth.js:22` | `CONFIG_PATH = new URL("../config.json", import.meta.url)` — завжди кореневий конфіг, і зі сторінок `/modules/` теж. **Не «оптимізувати».** |
| `js/auth.js:25` | `CERT_URL = new URL("../certificate.html", import.meta.url)` |
| `js/auth.js:52–81` | `boot()`: fetch конфіга → `createClient` → `buildModuleMap()` → `refreshSession()` → `onAuthStateChange` → `buildModal()` → `renderAuthControl()` |
| `js/auth.js:123–150` | `renderAuthControl()` — створює `#aiaAuth` **із JS**, вставляє перед `#navProgress`. Ім'я бере з `user.user_metadata.full_name`, інакше `user.email` |
| `js/auth.js:154–189` | `buildModal()` — один `innerHTML`. Нуль `role="dialog"`, нуль `aria-modal`, нуль пастки фокуса, поля тільки з `placeholder` |
| `js/auth.js:187` | `document.addEventListener("keydown", …Escape…)` — глобальний, реєструється при кожній побудові модалки |
| `js/auth.js:209–217` | `openModal(note)` — `classList.remove("hidden")`, тобто поява стрибком; фокус у `#aiaEmail` через `setTimeout(50)` |
| `js/auth.js:234–277` | `submit()` — валідація + `signUp` / `signInWithPassword`, далі `location.reload()` |
| `js/auth.js:279–286` | `translateError(msg)` — 4 правила перекладу помилок Supabase |
| `js/auth.js:294–298` | публічний інтерфейс `window.AIAAuth = { open, signOut, user }` |
| `js/progress.js:31–37` | `needLogin()` → `AIAAuth.open("Щоб зберігати прогрес…")` |
| `js/progress.js:61–80` | `_complete()` → `sb.rpc("submit_quiz", { p_module, p_score })`. **Єдина точка неповернення.** |
| `js/module.js:284` | `AIAAuth.open("Увійди, щоб проходити курс по черзі.")` — гейт заблокованого модуля |
| `js/module.js:303–311` | `initComplete()` — слухач кліку по `#completeBtn`, одразу кличе `setCompleted()` |
| `js/module.js:224` | `BTN_BASE` — класи кнопки завершення (`hover:bg-clay-deep`) |
| `js/quiz.js` | **до сервера не звертається взагалі** — перевірено `grep`: нуль `rpc`, нуль `AIAProgress`. Точка неповернення справді `#completeBtn`, а не квіз |
| `js/certificate.js:45` | `AIAAuth.open()` без нотатки |
| `js/certificate.js:100–101` | `select("public_code, full_name, issued_at, course_id, courses(title, slug)")` з `certificates` |
| `js/certificate.js:187,192,266,283,289` | **пʼять** літералів `#BD5F40` — це PDF на кремовому тлі. **Не чіпати** (тверда межа з `task.md`) |
| `js/verify.js:40,63` | публічна перевірка: `rpc("verify_certificate")`, показ `row.full_name` |
| `css/custom.css:24–28` | `:focus-visible` — outline clay 2px, offset 3px, radius 6px. Дизайн його успадковує, не міняє |
| `css/custom.css:140–152` | наявний блок `prefers-reduced-motion` — покриває **лише** `scroll-behavior`, `.reveal`, `.caret` |
| `css/custom.css:253` | `.callout-sand` — ідіом, на який спирається панель помилки |

### 2.3 Числа, перевірені командами (не оцінки)

| Що | Скільки | Команда |
| -- | ------- | ------- |
| HTML-файлів сайту з `tailwind.config` | **38** | `grep -rl 'tailwind.config' --include='*.html' --exclude-dir=dev . \| wc -l` |
| З них містять `#BD5F40` | **38** | `grep -rl '#BD5F40' --include='*.html' --exclude-dir=dev . \| wc -l` |
| Файлів, що підключають `js/auth.js` | **37** | `grep -rl 'js/auth.js' --include='*.html' . \| wc -l` |
| Файлів з `id="navProgress"` | **37** | збігається з попереднім **побайтово** (`comm -3` порожній) |
| 38-й файл без auth | `verify.html` | публічна перевірка сертифіката, входу не потребує |
| `line-strong` у коді сайту | **0** | токена ще немає, треба заводити |
| `clay-deep` як клас у HTML | **75** вживань | усі — `hover:bg-clay-deep` |
| Модулів | `config.json` — **12** (`m01…m12`), `architect.config.json` — **22** (`a01…a22`), усі `status: "ready"` | |
| Згадок OAuth/Google у `js/` | **0** | пишеться з нуля |

### 2.4 Стан бази — і чого я перевірити не зміг

**Чесно й прямо: `mcp__supabase__*` у цій сесії агента недоступний** — інструментів
із таким префіксом у моєму наборі немає (перевірено викликом `list_tables` → «No such tool
available»). Кореневий `.mcp.json` прописаний правильно й `enabledMcpjsonServers` містить
`supabase`, тобто в **кореневій** сесії MCP працює, а в цій підсесії — ні. REST-обхід теж
не дав схеми: `GET /rest/v1/` віддає `401 Only the service_role API key can be used`.

Тому нижче — розділення на **перевірене** і **успадковане з чужої звірки**:

**Перевірено мною просто зараз, живим запитом:**
```
GET https://hpcyrnxschpxlrxudmqk.supabase.co/auth/v1/settings
→ external.google        = false     ← провайдер вимкнений
→ external.linkedin_oidc = false     ← і не потрібен (LinkedIn відкладено)
→ email                  = true
→ disable_signup         = false
→ mailer_autoconfirm     = true      ← ПІДТВЕРДЖЕННЯ ПОШТИ ВИМКНЕНЕ
```
Останній рядок важливий і раніше ніде не був зафіксований: `signUp()` віддає сесію
**одразу**, тому гілка `showError("Готово! Якщо прийшов лист — підтверди пошту…")`
(`js/auth.js:264`) сьогодні недосяжна. Не видаляти (вимикач у Dashboard може змінитись),
але й не будувати на ній сценаріїв тестування.

**Успадковано зі звірки кореневої сесії 2026-08-23** (`dev/build/002-rls-role-escalation/02-backend/findings.md`
+ розділ «Стан бекенду» кореневого `CLAUDE.md`) — **вважати достовірним, але бекендер
зобовʼязаний перепідтвердити пункти, позначені ⚠, через MCP:**

- `profiles` — 3 рядки. Політика `profiles_update`: `USING (id = auth.uid())`, **без**
  `WITH CHECK`. Гранти: `anon`/`authenticated` мають `UPDATE` на **всі** колонки.
  Тобто **прямий `UPDATE profiles.full_name` з клієнта працює вже сьогодні.**
- Тригери на `profiles`: **лише** `trg_notify_new_profile` на `INSERT` (перевірено
  `pg_trigger`). Тобто рядок `profiles` для нового користувача створює тригер на
  `auth.users` — `handle_new_user()`.
  ⚠ **Не перевірено:** що саме `handle_new_user()` кладе у `full_name` і чи він
  `SECURITY DEFINER` (це вирішує, чи виживе створення профілю після 002, яка забирає
  `INSERT` у `anon`/`authenticated`).
- `certificates` — **0 рядків**. Політик на `INSERT`/`UPDATE`/`DELETE` немає взагалі,
  тобто RLS ці команди з клієнта забороняє. Запис іде тільки через
  `maybe_issue_certificate()` (`SECURITY DEFINER`), яку викликає `submit_quiz`.
  ⚠ **Не перевірено:** чи `maybe_issue_certificate` бере ім'я з `profiles.full_name`
  чи з `auth.users.raw_user_meta_data`, і чи є тригери на самій `certificates`.
- `modules` — 34 рядки, колонки `id, course_id, code, number, slug, title, passing_score,
  sort_order`. `courses` — 2. `progress` — 35. `quiz_attempts` — 47. `payments` — 0
  (**не чіпати**).

### 2.5 Відповіді на два питання з розділу 4 `SUMMARY.md`

**(а) Чи оновлюється `certificates.full_name` після видачі?**

Відповідь із коду й політик, без доступу до тіла функції:

> **З клієнта — ні, і не може.** На `certificates` немає жодної політики на
> `UPDATE`, а при увімкненому RLS відсутність політики = заборона. Жоден файл у `js/`
> не робить `.update()`/`.upsert()` по `certificates` (перевірено `grep`). Отже
> `certificates.full_name` — **знімок на момент видачі**, рівно як припускав дизайн.
> Припущення дизайну підтверджене з безпечного боку.

Що лишається невідомим і **має перевірити бекендер першою дією**: чи
`maybe_issue_certificate` читає ім'я з `profiles.full_name`, чи з
`auth.users.raw_user_meta_data->>'full_name'`. Це вирішує **куди саме** діалог має писати.

> **Я знімаю цю невідомість архітектурно, а не здогадкою:** контракт вимагає писати
> **в обидва місця** (розділ 5.3). Тоді відповідь на питання перестає впливати на
> коректність. Плюс сам варіант B ставить збереження **перед** `submit_quiz`, тому
> на момент видачі обидва сховища вже правильні.
>
> Приємна обставина: `certificates` = **0 рядків**. Ризик «неправильне ім'я вже
> надруковане» ще не матеріалізувався — ми встигли.

**(б) Формат ознаки помилки в URL після OAuth-редіректу Supabase.**

**Перевірено живим ендпоінтом 2026-08-24, після того як власник увімкнув провайдера.**
Не з документації — реальними відповідями нашого проєкту:

```
GET /auth/v1/authorize?provider=google&redirect_to=<dev-превʼю>
→ 302 https://accounts.google.com/o/oauth2/v2/auth
     ?client_id=…&redirect_uri=https://hpcyrnxschpxlrxudmqk.supabase.co/auth/v1/callback
     &response_type=code&scope=email+profile&state=<uuid>&redirect_to=<dev-превʼю>

GET /auth/v1/callback?error=access_denied&error_description=User+denied+access
→ 303 https://ai-academia.com.ua/?error=invalid_request
                                 &error_code=bad_oauth_callback
                                 &error_description=OAuth+state+parameter+missing

GET /auth/v1/callback?error=…&state=<невалідний>
→ 303 https://ai-academia.com.ua/?error=invalid_request
                                 &error_code=bad_oauth_state
                                 &error_description=OAuth+state+parameter+is+invalid
```

**Три висновки, які тепер є фактами, а не припущеннями:**

1. **Ознака помилки приходить у `location.search`, не в `hash`.** Потік —
   authorization code (`response_type=code`), тобто query-параметри. Ключі рівно ті три,
   що очікував макет: **`error`, `error_code`, `error_description`**. Значення
   URL-енкоджені (`+` замість пробілу) — `URLSearchParams` розкодовує сам, додаткової
   обробки не треба.
2. **Оборонне читання `hash` усе одно лишаємо** (`base.js:660–675` без змін): вимикач
   потоку живе на боці Supabase і не в нашому коді, а ціна двох зайвих рядків нульова.
3. **Нова, неочікувана поведінка, яку треба знати QA:** якщо GoTrue **не зміг відновити
   `state`**, він губить разом із ним і `redirect_to` — і кидає людину на **`Site URL`**
   (`https://ai-academia.com.ua/`), а не на сторінку, з якої вона входила. Тобто помилка,
   що трапилась на dev-превʼю, може приземлити людину **на прод**. Це не наш баг і не
   баг конфігурації — так влаштований GoTrue. QA має це впізнавати, а не заводити дефект.

**Що лишається перевірити в браузері** (одне, і це вже завдання QA, не блокер):
дослівний `error_code` для випадку «людина натиснула "Скасувати" на екрані згоди Google»
— відтворити його `curl`-ом не можна, бо потрібен валідний `state` із живого раунд-тріпу.
Очікуємо `access_denied`, який мапінг 5.4 ловить першим регекспом. Якщо прийде інше —
**регекспи не чіпати, дописати ще один рядок**: дефолт `other` уже коректно ловить усе
інше, тож помилковий текст — максимум косметика (див. відкрите питання 5).

### 2.6 Міграція 002 і наша задача: перетину-конфлікту немає

Прочитав `dev/build/002-rls-role-escalation/02-backend/db/002-lock-profiles-role.sql`
рядок за рядком. Вона **свідомо лишає** те, що нам потрібно:

```sql
revoke insert, update on public.profiles from anon, authenticated;
grant  update (full_name) on public.profiles to authenticated;   -- рядок 44
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());          -- рядки 48–52
```

Коментар у самому файлі (рядки 42–43) називає це прямо: «повернути рівно те, що колись
знадобиться легальній фічі "зміни своє імʼя"». **Ця задача і є та фіча.**

**Висновок для контракту: окрема RPC не потрібна.** Прямий
`sb.from("profiles").update({ full_name }).eq("id", user.id)` працює і до, і після 002.

**Один наслідок, який треба врахувати:** після 002 у клієнта зникає `INSERT` на `profiles`.
Якщо `handle_new_user()` не `SECURITY DEFINER`, реєстрація зламається — але це ризик
самої 002, не нашої задачі. Бекендер перевіряє це через MCP і, якщо ризик реальний,
**пише про це у звіт, а міграцію 002 не редагує** (чужа задача).

---

## 3. Обсяг

### Входить

1. **Кнопка «Продовжити з Google»** у модалці `#aiaAuthModal` — офіційний світлий варіант,
   40 px, радіус 4, логотип інлайновим SVG на 12 px від лівого краю, підпис IBM Plex Sans
   Medium. Блок соц-входу структурно готовий до другої кнопки без переверстки.
2. **Повний OAuth-цикл:** ініціація, стан очікування, таймаут 8 с, читання ознаки помилки
   з URL після повернення, панель помилки над формою, очищення URL.
3. **Крок підтвердження імені (варіант B):** діалог перед кліком, який переводить курс
   у `n/n`; постійна поверхня редагування (ім'я в шапці = кнопка); м'який режим удруге.
4. **Доступність модалки:** `role="dialog"`, `aria-modal`, `aria-labelledby`,
   `aria-describedby`, пастка фокуса, повернення фокуса, `inert` на нижній шар,
   `visibility:hidden` замість `opacity:0` на згорнутому полі, приховані `<label>` на три
   поля, хрестик 44×44, підложка зі скролом.
5. **Скелетон слота авторизації** у шапці, CLS = 0, поява не раніше 150 мс.
6. **Мобільна поверхня акаунта** (<640 px): кружечок з ініціалом → аркуш із трьох рядків.
7. **Анімація відкриття** модалки: підложка й картка разом, 180 мс вхід / 130 мс вихід,
   повна повага до `prefers-reduced-motion`.
8. **Два токени палітри** в 38 HTML: `clay-deep` `#BD5F40` → `#C4674A`,
   новий `line-strong` `#736A5E`.
9. **Ім'я як дані:** читання й запис `profiles.full_name`, синхронізація
   `user_metadata.full_name`.

### Не входить

- **LinkedIn** — відкладено власником. Місце в блоці соц-входу лишається, кнопки немає.
- **Google Sans** — заборонено вбудовувати й фетчити. Критерій приймання: нуль запитів.
- **Будь-які зміни `submit_quiz`, `maybe_issue_certificate`, `module_unlocked`,
  `is_admin`, `handle_new_user`, `notify_new_profile`** — серверна перевірка порядку
  модулів лишається як є.
- **Літерали `#BD5F40` у `js/certificate.js`** (5 штук) — це PDF на кремовому тлі.
- **Застосування міграції 002** — чужа задача, тільки власник.
- **Нові залежності, build-крок, зміни `wrangler.toml` / `.assetsignore` / `.gitignore`.**
- **Редагування імені після видачі сертифіката** — неможливе за конструкцією, і так і має бути.
- **Зміни в `config.json` / `architect.config.json`** — тексти модалки лишаються
  захардкодженими в JS (свідомий виняток, поле 11 дизайн-брифа).
- **`verify.html`** — не підключає `auth.js`, слот і скрипт туди не додаємо
  (але токени в його `tailwind.config` правимо — він 38-й).
- **Рефакторинг `js/certificate.js`, `js/verify.js`, `js/quiz.js`, `js/contact.js`.**
- **`payments`** — не чіпати без власника.

---

## 4. Зовнішня інфраструктура — ЗРОБЛЕНО власником 2026-08-24

> Цей розділ писався як чек-лист «що потрібно від власника». Поки план дописувався,
> власник усе зробив руками через браузер (журнал — `tg/CHANGELOG.md`, запис за
> 2026-08-24). **Лишається як довідка: що саме налаштоване, і як це перевірити знову,
> якщо щось перестане працювати.**
>
> **Перевірено мною незалежно від Dashboard 2026-08-24:** `external.google = true`;
> `/auth/v1/authorize` віддає `302` на Google з нашим `client_id`. Тобто і провайдер,
> і allow-list редіректів справді робочі, а не «виглядають увімкненими».
>
> **Що власник виправив попутно і що варте окремої уваги:** `Site URL` був
> `http://localhost:8000`. Це прод-налаштування, і воно ламало б не тільки OAuth
> (усі fallback-редіректи йшли б людині на її ж локальний порт), а й **листи скидання
> пароля** — шаблон підставляє `{{ .SiteURL }}`. Тепер `https://ai-academia.com.ua`.
> Це був живий баг, який ця задача випадково витягла на світло.
>
> SQL-міграцій не застосовувалось. **Дірка `002-rls-role-escalation` лишається
> відкритою** — цей запис її не стосується.

### 4.1 Що саме налаштовано (довідка)

**Google Cloud** — проєкт `ai-academia-506420`, OAuth client типу Web
`Supabase Auth — ai-academia.com.ua`, статус застосунку **In production** (не `Testing`,
де вхід був би доступний лише списку тест-користувачів, а refresh-токени жили б 7 днів).
Скоупи — базові `email profile`, тому верифікація Google не потрібна.
- **Authorized redirect URI — рівно один:**
  `https://hpcyrnxschpxlrxudmqk.supabase.co/auth/v1/callback`
- **Authorized JavaScript origins — свідомо порожні.** Ми йдемо класичним
  server-side redirect flow через Supabase, а не через Google Identity Services / One Tap.
  Не «забули» — не потрібні.

**Supabase** → Authentication → Providers → Google: увімкнено, Client ID + Secret на місці.

**Supabase** → Authentication → URL Configuration:
- `Site URL` = `https://ai-academia.com.ua`
- `Redirect URLs` (чотири):
```
https://ai-academia.com.ua/**
https://ai-academy.andriy-puhalsky.workers.dev/**
https://dev-ai-academy.andriy-puhalsky.workers.dev/**
http://localhost:8000/**
```
Гілкові превʼю, крім `dev`, wildcard-ом не покриті свідомо.

**Чому allow-list критичний:** якщо `redirectTo` у ньому немає, GoTrue мовчки підставляє
`Site URL`, тобто **прод**. Людина, яка тестує на dev-превʼю, після Google опиниться на
`ai-academia.com.ua` — і це виглядатиме як баг коду, яким не є. Той самий ефект дає
втрачений `state` (див. 2.5, пункт 3).

**Перевірка, що ввімкнулось** (одна команда, без ключів у виводі):
```bash
curl -s https://hpcyrnxschpxlrxudmqk.supabase.co/auth/v1/settings \
  -H "apikey: $(python3 -c "import json;print(json.load(open('config.json'))['supabase']['anonKey'])")" \
  | python3 -c "import sys,json;print('google =', json.load(sys.stdin)['external']['google'])"
```

### 4.2 Попередження: тестові входи — це справжні рядки в проді

dev-превʼю працює з **продовою** базою. Кожен тестовий вхід через Google створює
справжній рядок у `auth.users` + `profiles`, а тригер `trg_notify_new_profile`
**надішле власнику повідомлення в Telegram**. Це не поломка — це очікувано, але власник
має знати заздалегідь, щоб не полював на «невідомих реєстрацій».

---

## 5. КОНТРАКТ ДАНИХ

> Це закон для обох виконавців. Усе, що тут написано, — узгоджене; усе, чого тут немає,
> кожен вирішує у своїй зоні і фіксує у своєму звіті.

### 5.1 Розділ файлів — головне рішення плану

`js/auth.js` сьогодні змішує дані й вигляд, і саме тому обидва агенти хотіли б його
переписувати. **Ріжемо файл навпіл:**

```
js/auth.js      ← БЕКЕНДЕР. Supabase, сесія, OAuth, ім'я як дані, публічний API.
                  Нуль HTML-рядків. Нуль CSS-класів.
js/auth-ui.js   ← ФРОНТЕНДЕР. НОВИЙ файл. Уся розмітка, стилі, фокус, рух, стани.
                  Нуль звернень до Supabase. Нуль `window.sb`.
```

**Порядок підключення в кожному з 37 HTML** (фронтендер додає перший рядок):
```html
<script src="js/auth-ui.js"></script>              <!-- класичний, виконується одразу -->
<script type="module" src="js/auth.js"></script>   <!-- модуль, відкладений за специфікацією -->
```
Класичний скрипт без `defer` виконується **до** будь-якого `type="module"`, тому на
момент старту `boot()` обʼєкт `window.AIAAuthUI` гарантовано існує. Порядок не «на удачу» —
це вимога специфікації HTML, і на неї спираємось свідомо.

**Регістр:** файл називається рівно `js/auth-ui.js`, нижнім регістром, дефіс, не підкреслення.
Cloudflare чутливий до регістру, macOS ні — це вже раз клало прод.

### 5.2 Інтерфейс `window.AIAAuthUI` — реалізує ФРОНТЕНДЕР, викликає БЕКЕНДЕР

Чистий вигляд. Ніяких мережевих запитів. Ніякого `window.sb`.

```js
window.AIAAuthUI = {

  /* Викликається бекендером один раз із boot(), одразу після createClient.
     handlers — див. 5.3. certUrl — абсолютний URL сторінки сертифікатів. */
  init({ handlers, certUrl }): void,

  /* Слот у шапці. Викликає себе сам на DOMContentLoaded (скелетон),
     потім бекендер кличе з реальним станом. */
  renderSlot({
    status: "guest" | "user",
    name:   string | null,     // готове до показу ім'я (бекендер уже застосував ланцюжок 5.5)
    email:  string | null
  }): void,

  /* Модалка входу. Замінює нинішній openModal(note). */
  openAuthModal({
    note?:   string,                       // a2: модалку відкрила система
    tab?:    "login" | "register",         // дефолт "login"
    panel?:  ErrorKind,                    // панель помилки після редіректу, див. 5.4
    opener?: Element                       // куди повернути фокус; дефолт document.activeElement
  }): void,
  closeAuthModal(): void,

  /* Помилка у формі email (рядок під полями, #aiaError). */
  showFormError(text: string): void,
  hideFormError(): void,

  /* Панель помилки OAuth над формою (#aiaPanelSlot). Модалка має бути відкрита. */
  showOAuthPanel(kind: ErrorKind): void,

  /* Діалог «Ім'я для сертифіката». ЄДИНА поверхня, три режими.
     Ніколи нічого не зберігає сам — тільки повертає результат. */
  openNameDialog({
    mode:    "permanent" | "last" | "soft",
    value:   string,                       // поточне ім'я (може бути "")
    opener?: Element
  }): Promise<{
    action: "saved" | "confirmed" | "cancelled",
    name:   string                         // очищене, ≤100 символів; при "cancelled" — вхідне
  }>,

  /* Мобільний аркуш акаунта (<640px). */
  openAccountSheet({ name: string, email: string | null, opener?: Element }): void
};
```

**Що UI робить сам і про що бекендер не думає:**
- поява/зникання, `prefers-reduced-motion`, пастка фокуса, `Escape` (один слухач на
  `document`, стек діалогів), `inert` на нижній шар, повернення фокуса на ініціатора;
- скелетон: показати не раніше **150 мс**, крос-фейд **180 мс** у реальний контрол;
- стан очікування Google: `aria-busy`, смуга процесу, `inert` на блок email,
  `#aiaSubmit.disabled`, **таймаут 8000 мс** → сам показує панель `timeout`
  і сам знімає стан очікування;
- захист від подвійного кліку: повторний клік по `#aiaGoogle`, поки він `disabled`,
  ігнорується;
- валідація **форми** (порожньо, формат email, довжина пароля й імені) і її тексти;
- евристика `looksAuto()` для попередження «схоже на автоматичне ім'я»;
- `localStorage`-прапорець `aia:nameConfirmed:<userId>` для вибору `last` vs `soft`
  (питання 5 розділу 1).

**Що UI НЕ робить ніколи:** не звертається до Supabase, не читає й не пише
`profiles`, не парсить URL після редіректу, не перекладає помилки сервера,
не робить `location.reload()`.

### 5.3 `handlers` — реалізує БЕКЕНДЕР, викликає ФРОНТЕНДЕР

```js
{
  /* Кнопка «Продовжити з Google». UI уже перевів себе в стан очікування.
     Успіх = браузер іде на Google (проміс може не встигнути резолвнутись). */
  signInWithGoogle(): Promise<{ ok: true } | { ok: false, panel: "open" }>,

  /* Таб «Вхід». UI уже перевірив формат полів. */
  signInWithPassword({ email: string, password: string })
    : Promise<{ ok: true } | { ok: false, message: string }>,

  /* Таб «Реєстрація». */
  signUp({ email: string, password: string, name: string })
    : Promise<{ ok: true, session: boolean } | { ok: false, message: string }>,

  /* Зберегти ім'я для сертифіката. Викликається з діалогу після "saved"/"confirmed". */
  saveName(name: string): Promise<{ ok: true, name: string } | { ok: false, message: string }>,

  /* Вихід. Бекендер сам робить location.reload(). */
  signOut(): Promise<void>
}
```

`message` — **готовий український рядок для показу**. UI його не інтерпретує й не
доповнює: вставляє в `#aiaError` як є.

При `{ ok: true }` від `signInWithPassword` / `signUp` (із сесією) бекендер сам робить
`location.reload()` — UI нічого не закриває й нічого не малює.

### 5.4 Помилки OAuth: коди → панель → текст

`ErrorKind = "cancelled" | "open" | "conflict" | "other" | "timeout"`

**Розпізнавання (бекендер, `js/auth.js`).** Перенести `readOAuthError` із
`base.js:660–675` без змін логіки: читати **і `location.search`, і `location.hash`**,
брати `error_code` або `error`, склеювати з `error_description` у нижньому регістрі:

| Регексп по `code + " " + description` | ErrorKind |
| ------------------------------------- | --------- |
| `/access_denied\|denied\|cancel/` | `cancelled` |
| `/identity\|already\|exists\|conflict/` | `conflict` |
| будь-що інше, але ознака помилки є | `other` |
| ознаки помилки немає | `null` (нічого не показуємо) |

Ще два види не з URL: `open` — `signInWithOAuth()` повернув `error`;
`timeout` — UI сам, через 8 с без навігації.

**Тексти панелі (фронтендер, дослівно з `base.js:66–98`).** Змінювати не можна —
це затверджена копірайтинг-частина дизайну:

| kind | Заголовок | Причина | Кнопка / поруч |
| ---- | --------- | ------- | -------------- |
| `cancelled` | Вхід через Google скасовано | Ти закрив вікно Google або натиснув «Скасувати». | Спробувати ще раз · або увійди поштою нижче |
| `open` | Не вдалося відкрити Google | Схоже, немає зʼєднання або вікно заблокував браузер. | Спробувати ще раз · або увійди поштою нижче |
| `conflict` | На цю пошту вже є акаунт із паролем | Це той самий акаунт — просто інший спосіб входу. Увійди паролем нижче. | — (кнопки немає) |
| `other` | Не вдалося увійти через Google | Google не повернув причину помилки. | Спробувати ще раз · або увійди поштою нижче |
| `timeout` | Google не відповів | Минуло 8 секунд, а вікно входу так і не відкрилось. | Спробувати ще раз · або увійди поштою нижче |

Поведінка панелі `conflict`: UI перемикає таб на «Вхід» і ставить фокус у `#aiaPass`
(`base.js:644–653`). **Без підстановки email** — у макеті це демо-значення, на сайті ми
пошту користувача з URL не знаємо й вигадувати не будемо.

**Помилки email-входу (бекендер, `translateError`).** Наявні чотири правила
(`js/auth.js:279–286`) зберегти дослівно й додати п'яте:

| Що прийшло від Supabase | Що бачить людина |
| ----------------------- | ---------------- |
| `Invalid login credentials` | Невірний email або пароль. |
| `already registered` / `already exists` | Такий email уже зареєстровано — увійди. |
| `at least 6` / `password should be` | Пароль має містити щонайменше 6 символів. |
| `Email not confirmed` | Спершу підтверди email (перевір пошту). |
| **нове:** `over_email_send_rate_limit` / `rate limit` / `429` | Забагато спроб. Зачекай хвилину і спробуй ще раз. |
| будь-що інше | текст помилки як є (поточна поведінка) |

### 5.5 Ім'я: три сховища, одне джерело правди

| Сховище | Тип | Хто читає | Хто пише | Після 002 |
| ------- | --- | --------- | -------- | --------- |
| **`public.profiles.full_name`** | `text`, nullable | наш новий код; **імовірно** `maybe_issue_certificate` | клієнт: `update … where id = auth.uid()` | **дозволено явно** — `grant update (full_name) to authenticated` + `with check` |
| `auth.users.raw_user_meta_data->>'full_name'` (= `user.user_metadata.full_name`) | `text`, nullable | нинішній `renderAuthControl` | `signUp(options.data)`, Google при першому вході, `sb.auth.updateUser` | не зачеплено |
| `public.certificates.full_name` | `text` | `js/certificate.js`, `js/verify.js` | **тільки** `maybe_issue_certificate` у мить видачі | не зачеплено; клієнту запис заборонено RLS |

**Рішення: джерело правди — `profiles.full_name`.** Причина не теоретична:
Supabase за замовчуванням **звʼязує акаунти з однаковою поштою**, і при звʼязуванні
`user_metadata.full_name` може бути **перезаписаний іменем з Google**. Тобто людина, яка
зареєструвалась поштою як «Олена Ковальчук», після входу через Google може стати
«olena p» у метаданих — а `profiles` при цьому не змінюється (тригер лише на `INSERT`).
Якщо ми лишимо метадані джерелом правди, ми **самі створимо** ту проблему, яку задача має
закрити.

**Ланцюжок читання** (бекендер, одна функція `currentName()`):
```
profiles.full_name  →  user_metadata.full_name  →  user_metadata.name  →  user.email  →  "Студент"
```
Перше непорожнє після `trim()`. `"Студент"` — тільки для прев'ю в діалозі
(`T.name.fallback`); у шапці показуємо email, як зараз.

**Запис** — два кроки, порядок жорсткий:

```js
// 1. ГОЛОВНИЙ. Помилка тут = помилка для користувача.
const { data, error } = await sb
  .from("profiles")
  .update({ full_name: clean })
  .eq("id", user.id)
  .select("full_name")
  .maybeSingle();

// 2. ДОДАТКОВИЙ, best-effort. Помилка тут = тільки console.warn.
await sb.auth.updateUser({ data: { full_name: clean } });
```

**Обробка результату кроку 1 — три випадки, не два:**

| Результат | Що це означає | Що робимо |
| --------- | ------------- | --------- |
| `error !== null` | мережа / RLS / грант | `{ ok:false, message: "Не вдалося зберегти імʼя. Перевір зʼєднання і спробуй ще раз." }` |
| `error === null`, `data === null` | **UPDATE зачепив 0 рядків** — рядка в `profiles` немає | `{ ok:false, message: "Не вдалося зберегти імʼя. Онови сторінку і спробуй ще раз." }` + `console.error("[AIA auth] profiles row missing for", user.id)` |
| `error === null`, `data.full_name === clean` | збережено | `{ ok:true, name: clean }` |

**Мовчазний успіх при 0 рядків заборонений.** Це головна пастка цієї частини: PostgREST
на `UPDATE` без збігів повертає `error: null`, і наївний код відрапортує «збережено»,
а в PDF поїде старе ім'я.

**Очищення імені** — та сама функція `sanitizeName()`, що вже є в `js/auth.js:43–48`
(прибрати ` -`, ``, `<`, `>`; `trim`; `slice(0, 100)`). Не переписувати.
Порожній результат після очищення — не зберігати, повернути
`{ ok:false, message: "Вкажи імʼя — воно зʼявиться у сертифікаті." }`.

### 5.6 Ініціація OAuth

```js
async function signInWithGoogle() {
  const back = location.origin + location.pathname;   // без query, без hash
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: back }
  });
  if (error) { console.error("[AIA auth] oauth:", error.message); return { ok:false, panel:"open" }; }
  return { ok: true };   // далі браузер сам іде на Google
}
```
`redirectTo` **обовʼязково без `search` і без `hash`** — інакше після повернення в URL
змішаються старі параметри з новими `code`/`error`, і очищення URL стане неоднозначним.
Побічний ефект: людина, яка входила зі сторінки модуля з якорем `#lesson-3`, повернеться
на початок сторінки. Прийнятно.

### 5.7 Повернення з Google: ЖОРСТКИЙ порядок у `boot()`

Це місце, де найлегше зламати вхід так, що поломки не буде видно.

```js
async function boot() {
  // 1. ЧИТАЄМО URL ПЕРШИМ РЯДКОМ — синхронно, до createClient.
  //    supabase-js із detectSessionInUrl сам вичищає auth-параметри асинхронно,
  //    і якщо прочитати пізніше — їх уже може не бути.
  const oauthPanel = readOAuthError();          // ErrorKind | null
  const hadAuthParams = oauthPanel !== null || hasAuthCode();

  // 2. …конфіг, createClient, buildModuleMap — як зараз…

  // 3. Сесія. САМЕ ТУТ supabase-js обмінює ?code= на сесію (PKCE).
  await refreshSession();

  // 4. І ТІЛЬКИ ТЕПЕР чистимо URL.
  if (hadAuthParams) cleanUrl();

  // 5. …onAuthStateChange, AIAAuthUI.init(...), renderSlot(...)…

  // 6. Якщо повернулись із помилкою — модалку відкриваємо самі.
  if (oauthPanel) AIAAuthUI.openAuthModal({ panel: oauthPanel });
}
```

**Чому пункт 4 не можна робити раніше:** `history.replaceState` до обміну коду зітре
`?code=…`, `supabase-js` не встигне його обміняти, і вхід **тихо не відбудеться** —
без помилки, без панелі, просто «нічого не сталось».

**`cleanUrl()` — не `location.pathname` навпростець.** У макеті стоїть
`history.replaceState(null, "", location.pathname)` (`base.js:676–679`) — для пісочниці
цього досить, для сайту ні: воно зітре чужі параметри й будь-який якір. Правильна форма:

```js
function cleanUrl() {
  const AUTH_KEYS = ["code","state","error","error_code","error_description",
                     "access_token","refresh_token","expires_in","expires_at",
                     "token_type","provider_token","provider_refresh_token","type"];
  const url = new URL(location.href);
  let touched = false;
  AUTH_KEYS.forEach(k => { if (url.searchParams.has(k)) { url.searchParams.delete(k); touched = true; } });
  // hash може бути і якорем сторінки, і носієм implicit-потоку
  if (url.hash && AUTH_KEYS.some(k => new RegExp("[#&]" + k + "=").test(url.hash))) {
    url.hash = ""; touched = true;
  }
  if (touched) history.replaceState(null, "", url.pathname + url.search + url.hash);
}
```
Так якір `#lesson-3` на сторінці модуля виживає, а `?code=` зникає.

### 5.8 Гарантований дотик: точна умова спрацювання

Тригер — **клік по `#completeBtn`**, і тільки коли всі чотири умови істинні одночасно:

```js
function isFinalClick() {
  const cfg = window.AIA_CONFIG;                       // з js/config.js
  if (!window.AIA_USER) return false;                  // 1. є сесія
  if (!cfg || !cfg.modules || !cfg.modules.length) return false;
  if (!window.AIAProgress.isHydrated()) return false;  // 2. прогрес підвантажено
  if (window.AIAProgress.isCompleted(currentId)) return false;  // 3. це не «зняти позначку»
  const done = window.AIAProgress.completedSet();
  // 4. після цього кліку курс стане n/n
  return cfg.modules.every(m => m.id === currentId || done.has(m.id));
}
```

`currentId` — уже є в `js/module.js:13` (`document.body.getAttribute("data-module")`).
`cfg.modules` — 12 для Академії, 22 для Architect, усі `status: "ready"` (перевірено).
Умова 4 сформульована через «усі інші пройдені», а не через `size + 1 === total` —
так вона правильна навіть якщо людина зняла позначку з середини курсу.

**Новий `initComplete()`** (`js/module.js`, замість рядків 303–311):
```js
btn.addEventListener("click", function () {
  if (window.AIAProgress.isCompleted(currentId)) {          // зняти позначку
    window.AIAProgress.setCompleted(currentId, false);
    return;
  }
  if (!isFinalClick()) {                                    // звичайний модуль
    window.AIAProgress.setCompleted(currentId, true);
    return;
  }
  window.AIAAuth.confirmCertificateName({ opener: btn }).then(function (ok) {
    if (ok) window.AIAProgress.setCompleted(currentId, true);
  });
});
```

`window.AIAAuth.confirmCertificateName({ opener })` — **нова публічна функція бекендера**:
```
Promise<boolean>   // true = ім'я підтверджено, можна кликати submit_quiz
                   // false = скасовано (Escape / «Скасувати») → submit_quiz НЕ викликається
```
Усередині: вибрати режим (`soft`, якщо стоїть прапорець `aia:nameConfirmed:<id>`, інакше
`last`) → `AIAAuthUI.openNameDialog(...)` → на `"saved"`/`"confirmed"` викликати
`saveName()` → якщо збереження впало, **повернути `false`** і лишити діалог з помилкою.

**`js/module.js` не знає ні про Supabase, ні про UI** — тільки про `AIAAuth`. Це
дозволяє бекендеру правити його самому, не чіпаючи фронтендерську зону.

### 5.9 Стани, які контракт передає з даних у вигляд

| Стан | Ознака в даних | Що показує UI |
| ---- | -------------- | ------------- |
| сесія ще не відома | `boot()` не завершився | слот існує (min-height 34px), порожній; після **150 мс** — скелетон |
| гість | `AIA_USER === null` | кнопка «Увійти» (75×32) |
| залогінений, ≥640 | `AIA_USER`, `name` | ім'я-кнопка (пунктир) · «Сертифікати» · «Вийти» |
| залогінений, <640 | те саме | кружечок з ініціалом → аркуш із 3 рядків |
| імені немає | `name === null` | у шапці — email; у прев'ю діалогу — «Студент» + пояснення |
| модалку відкрила людина | `openAuthModal()` без `note` | стан a1: нотатки немає |
| модалку відкрила система | `openAuthModal({ note })` | стан a2: рядок-пояснення над соц-блоком |
| очікування Google | UI-стан | смуга процесу, `aria-busy`, форма email `inert`, кнопка Google лишається яскравою |
| повернення з помилкою | `readOAuthError() !== null` | модалка відкривається сама, панель над формою, URL очищено |
| помилка форми | `{ ok:false, message }` | рядок у `#aiaError`, `role="alert"` |
| немає мережі | `fetch`/`rpc` кинув | панель `open` для Google; для форми — текст помилки як є |
| `prefers-reduced-motion` | медіа-запит | усе зʼявляється миттєво, нічого не ламається |

### 5.10 Ключі конфігів

**Нових немає. Змін немає.** `config.json` і `architect.config.json` у цій задачі
не редагуються взагалі. `config.json → supabase.url` / `supabase.anonKey` читаються
як зараз, `js/auth.js:22` не змінюється.

---

## 6. Нарізка робіт

### 6.1 Бекенд (`aia-build-backend`)

Зона запису: `js/auth.js`, `js/module.js`, `dev/build/001-oauth-google/02-backend/`.
**Не чіпати:** `js/auth-ui.js`, `css/custom.css`, будь-який HTML.

| # | Файл | Що зробити | Навіщо |
| - | ---- | ---------- | ------ |
| Б0 | — | **Перше, до коду:** через MCP звірити з живою базою чотири речі: (1) тіло `maybe_issue_certificate` — звідки бере ім'я; (2) тіло `handle_new_user` — що кладе у `full_name` і чи `SECURITY DEFINER`; (3) тригери на `certificates` (`pg_trigger`); (4) колонки `profiles`. Результат — у звіт. Якщо MCP не працює — **позначити як неперевірене**, не гадати | без цього невідомо, куди пише діалог; контракт 5.5 робить код правильним у будь-якому разі, але звіт має містити факт |
| Б1 | `js/auth.js` | Викинути `buildModal`, `setTab`, `openModal`, `closeModal`, `showError`, `hideError`, `renderAuthControl`, глобальний слухач `Escape` (рядок 187) і константу `mode`. Лишити `sanitizeName`, `escapeHtml`, `translateError`, `EMAIL_RE`/`MAX_*`/`MIN_*` | розділ 5.1 |
| Б2 | `js/auth.js` | Додати `currentName()` — ланцюжок читання 5.5; читати `profiles.full_name` одним запитом усередині `refreshSession()` і класти в `window.AIA_NAME` | одне джерело правди |
| Б3 | `js/auth.js` | Додати `saveName(name)` рівно за 5.5, з **трьома** гілками результату (включно з `data === null`) | мовчазна втрата імені — головна пастка |
| Б4 | `js/auth.js` | Додати `signInWithGoogle()` за 5.6 | |
| Б5 | `js/auth.js` | Додати `readOAuthError()` (порт `base.js:660–675`), `hasAuthCode()`, `cleanUrl()` за 5.7 | |
| Б6 | `js/auth.js` | Перебудувати `boot()` у **жорсткий порядок 5.7**. `AIAAuthUI.init({ handlers, certUrl })` — після `createClient`, до `refreshSession()` | пункт 4 після пункту 3 — інакше тихо ламається вхід |
| Б7 | `js/auth.js` | Обгорнути `signInWithPassword` / `signUp` у `handlers` за 5.3, повертаючи `{ ok, message }`. Валідацію полів **не дублювати** — вона переїхала в UI; лишити тільки переклад помилок сервера | |
| Б8 | `js/auth.js` | Додати `translateError` п'яте правило (rate limit, 5.4) | Google-вхід легко дає 429 при тестуванні |
| Б9 | `js/auth.js` | Розширити `window.AIAAuth`: `open(note)` (сумісність — проксі на `AIAAuthUI.openAuthModal({ note })`), `signOut()`, `user()`, **нове** `name()`, **нове** `editName(opener)`, **нове** `confirmCertificateName({opener})` | `js/progress.js:33`, `js/module.js:284`, `js/certificate.js:45` викликають `AIAAuth.open()` і **не мають зламатись** |
| Б10 | `js/auth.js` | `onAuthStateChange`: на `USER_UPDATED` **не** робити `location.reload()`, тільки перечитати ім'я й перемалювати слот | інакше після збереження імені сторінка перезавантажиться посеред діалогу |
| Б11 | `js/module.js` | Замінити `initComplete()` за 5.8, додати `isFinalClick()` | гарантований дотик |
| Б12 | `02-backend/report.md` | Звіт: результати Б0; дослівні URL після редіректу (коли провайдер увімкнуть); що не звірено | |

**Міграцій БД ця задача не потребує** — `profiles.full_name` уже пишеться, і 002 це право
зберігає. Якщо Б0 покаже інше (напр. `maybe_issue_certificate` читає щось третє) —
бекендер **не імпровізує**, а пише в звіт і зупиняється на цьому пункті.

### 6.2 Фронтенд (`aia-build-frontend`)

Зона запису: **новий** `js/auth-ui.js`, `css/custom.css`, HTML у корені й `modules/`,
`dev/build/001-oauth-google/03-frontend/`.
**Не чіпати:** `js/auth.js`, `js/module.js`, `js/progress.js`, `js/certificate.js`, `tg/`.

| # | Файл | Що зробити | Навіщо |
| - | ---- | ---------- | ------ |
| Ф1 | `css/custom.css` | Додати в кінець файла блок `:root` — порт `shared/tokens.css` секцій 1–7, **без** `--rig-*`, `[data-variant]`, `.rm`. Значення не змінювати | єдине місце значень |
| Ф2 | `css/custom.css` | Додати **окремий** `@media (prefers-reduced-motion: reduce)` з обнуленням 16 токенів (`tokens.css:245–266`). Класовий дублікат `.rm` (`tokens.css:268–287`) **не переносити**. Наявний блок `custom.css:140–152` **не чіпати** | він покриває лише `.reveal`/`.caret`/`scroll-behavior` і нове не підхопить |
| Ф3 | `css/custom.css` | Порт `shared/base.css` секцій **D, E, F, G, H, I, J** + із K тільки `.sk-row`, `.sk--name`, `.sk--certs`, `.sk--out`, `.aia-submit[disabled]`. Секції A/B/C і `.nban*`/`.confirm*`/`.gfix*`/`.paper--tile` — **не переносити** | 2.1 |
| Ф4 | `css/custom.css` | **`.aia-scrim`: `position: absolute` → `position: fixed`.** Це прямо написано в шапці секції E макета | у пісочниці підложка жила в сцені, на сайті має накривати вікно |
| Ф5 | `css/custom.css` | **Перевести всі `@container page (...)` на `@media (...)`** — рівно **7 місць** у портованих секціях: `base.css:490, 508, 529, 530, 826, 901, 1055`. Із них рядок 901 (`.gcompare-grid`) не переноситься взагалі, тож конверсій **6**. Брейкпойнти зберегти: 640 / 639.98 / 420 | на сайті немає контейнера з `container-type` — правила просто ніколи не спрацюють, і мобілка мовчки поламається |
| Ф6 | `css/custom.css` | Продублювати `.sr-only` (`base.css:51–55`) у новий блок | Tailwind CDN дає `sr-only`, але залежати від його MutationObserver для динамічної розмітки не варто; правила ідентичні, тому порядок каскаду не важить |
| Ф7 | `js/auth-ui.js` | **Новий файл.** Порт `shared/base.js`: тексти `T` (36–124), SVG (130–155), білдери (184–419), поведінка (420–714), плюс адаптовані `renderSlot` (835–864), `openAuth` (876–888), `openNameDialog` (889–905), `wireNameDialog` (906–957), `openSheet` (958–980). Викинути `demo`, `stage`, `flash`, `api`, `VAR`, `PAPER`, усе від рядка 715 крім названого. Обгорнути в IIFE, експортувати `window.AIAAuthUI` за 5.2 | |
| Ф8 | `js/auth-ui.js` | `openDialog` у макеті монтує в `stage`. На сайті — **у `document.body`**, підложка `fixed` | |
| Ф9 | `js/auth-ui.js` | `openNameDialog` перетворити на **Promise** за 5.2: `wireNameDialog` резолвить `{action, name}` замість виклику `onDone` | контракт із бекендером |
| Ф10 | `js/auth-ui.js` | Логіка `last` vs `soft`: прапорець `localStorage["aia:nameConfirmed:" + userId]`; ставити при `saved`/`confirmed`. `userId` UI отримує в `renderSlot`/`init` | питання 5 розділу 1 |
| Ф11 | `js/auth-ui.js` | Самостійний старт скелетона: на `DOMContentLoaded` знайти `#aiaAuth`, через 150 мс показати скелетон за `guessLoggedIn()` (`base.js:687–699` — читає `localStorage` ключ `sb-*-auth-token`, **без хардкоду** імені проєкту) | шапка порожня 2–3 с на кожному холодному старті |
| Ф12 | `js/auth-ui.js` | Валідація форми + її тексти (перенести межі з `js/auth.js:34–39`: email ≤254, пароль 6…128, ім'я 2…100) | UI валідує форму, бекенд перекладає сервер |
| Ф13 | **37 HTML** | Перед `<span id="navProgress">` вставити `<div id="aiaAuth" class="slot"></div>` | слот має існувати з першого кадру, інакше CLS ≠ 0 |
| Ф14 | **37 HTML** | Перед рядком `<script type="module" src="…js/auth.js">` вставити `<script src="…js/auth-ui.js"></script>`. Відносний шлях: `js/auth-ui.js` у корені, `../js/auth-ui.js` у `modules/` | 5.1 |
| Ф15 | **38 HTML** | У `tailwind.config`: `"clay-deep": "#BD5F40"` → `"#C4674A"`; додати `"line-strong": "#736A5E"` після рядка `line:` | AA: hover головної кнопки давав 4.31, тепер 4.76; `line` на `surface` = 1.40 при потрібних 3:1 |
| Ф16 | `03-frontend/report.md` | Звіт: де відступив від макета і чому; список 6 конверсій container→media; підтвердження регістру шляхів | |

**Ф13–Ф15 робити скриптом, не руками.** 37 і 38 однакових правок руками — гарантована
дірка в одному файлі. Після кожної — перевірка `grep -c`, числа в розділі 9.

### 6.3 Порядок і залежності

```
       Б0 (звірка бази через MCP)
        │
   ┌────┴─────────────────────────┐
   ▼                              ▼
Б1…Б12  (js/auth.js, js/module.js)   Ф1…Ф16 (auth-ui.js, css, HTML)
   │                              │
   │        ПАРАЛЕЛЬНО. Перетину файлів немає.
   │                              │
   │                        push у dev  ◄── ПЕРШИМ
   └──────────── push у dev  ◄── ДРУГИМ
                    │
                    ▼
                  QA на dev-превʼю
```

**Правило порядку push (єдина синхронізація між агентами):**

**Фронтендер пушить першим.** Його зміни адитивні: новий `js/auth-ui.js` існує, старий
`js/auth.js` його просто не викликає, сайт працює як раніше (єдина видима зміна —
токени й CSS-блок, які нікому не заважають).

**Бекендер пушить другим.** Його `js/auth.js` **не працює без** `js/auth-ui.js`, бо
всю розмітку викидає. Якщо бекендер закінчив раніше — **комітить локально й чекає**,
поки `js/auth-ui.js` зʼявиться в `origin/dev`. Перевірка однією командою:
```bash
git fetch origin dev && git cat-file -e origin/dev:js/auth-ui.js && echo "можна пушити"
```

Перед кожним push — `git pull --rebase origin dev`. Файли різні, конфліктів бути не має;
якщо конфлікт усе-таки виник — це означає, що хтось вийшов за свою зону: зупинитись і
написати власнику, а не «розрулити».

**Формат комітів:** `001 feat: …` / `001 fix: …` (правило №4 `dev/build/CLAUDE.md`).

**QA не стартує, поки в `origin/dev` немає обох половин.**

### 6.4 Як перевіряти панелі помилок, не ганяючи живий Google

Провайдер увімкнений, тож наскрізний шлях доступний. Але **окремі стани зручніше
перевіряти підставленим URL, ніж відтворювати вручну** — і в цьому немає нічого
«несправжнього»: код читає URL, а не Google.

- `?error=access_denied&error_description=user+denied` → панель «Вхід через Google
  скасовано» + URL очищено. Повний тест логіки 5.7.
- `?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+state+parameter+is+invalid`
  → панель `other`. Це **реальний** рядок нашого GoTrue (2.5), не вигаданий.
- `?utm_source=test&error=access_denied#lesson-2` → панель є, `utm_source` і якір **вижили**.
- `#error=access_denied&error_code=403` → те саме, але через `hash`: перевіряє, що
  оборонне читання не викинули.
- Панель `open` — DevTools → Network → Offline, потім клік по кнопці Google.
- Таймаут 8 с — штучно: у консолі `AIAAuthUI` перевести кнопку в стан очікування й не
  давати навігації (або тимчасово підняти лічильник у коді, з поверненням назад).

---

## 7. Стани і крайні випадки

**Обовʼязкові до перевірки (дефолт майстерні):**
порожньо · завантаження · помилка · дуже довгий український текст · один елемент проти
двадцяти · 320 / 390 / 768 / 1440 · залогінений vs ні · подвійний клік · відсутня мережа ·
`prefers-reduced-motion` · клавіатура й видимий фокус.

**Специфічні для цієї задачі:**

1. **320×560 (iPhone SE) з найважчим змістом** — модалка з нотаткою + панель помилки +
   таб «Реєстрація». Це стан, на якому макет уже раз зламався (`Б1` у `verdict.md`):
   картка виходила за екран на 68 px, верх недосяжний. Перевіряти, що хрестик і кнопка
   сабміту досяжні скролом.
2. **Довге українське ім'я** «Костянтин-Володимир Гнатюк-Верхогляденко» (46 символів)
   у трьох місцях: шапка (обрізається `text-overflow: ellipsis`, `max-width: 12rem`),
   прев'ю паперу (переноситься на два рядки, картка росте), аркуш акаунта.
3. **Порожнє ім'я** — у прев'ю «Студент» + рядок «Поле порожнє — у PDF надрукується
   "Студент"».
4. **Ім'я схоже на автоматичне** (`looksAuto`): містить `@` · одне слово · увесь нижній
   регістр · коротше 4 символів. Показує попередження, **нічого не блокує**.
5. **Двошаровий стек:** аркуш акаунта → діалог імені. `Escape` закриває **тільки
   верхній**; нижній на цей час `inert`; після закриття фокус повертається на кружечок.
6. **`Escape` у гарантованому дотику = скасувати завершення модуля.** На сервер
   **нічого не йде**, лічильник лишається `11/12`, фокус повертається на `#completeBtn`.
7. **Підложка діалогу імені в режимі `last`/`soft` не закриває** (`dismissible: false`).
   У режимі `permanent` — закриває.
8. **Подвійний клік по кнопці Google** — другий ігнорується (`disabled`).
9. **Подвійний клік по `#completeBtn`** поки відкритий діалог — діалог модальний, клік
   недосяжний.
10. **Таб під час очікування Google** — форма email `inert`, `#aiaSubmit` `disabled`,
    `Tab` не виводить фокус за межі картки (`FIX-5` + `FIX-12`).
11. **Згорнуте поле імені (таб «Вхід»)** — `visibility: hidden`, не `opacity: 0`.
    `Tab` **не має** зупинятись на невидимому полі (WCAG 2.4.7, рівень **A**).
12. **Повернення з Google на сторінку модуля** — `redirectTo` без якоря, сторінка
    відкривається згори; гейт заблокованого модуля не блимає.
13. **Збереження імені впало** (вимкнути мережу перед «Зберегти й завершити») —
    діалог **лишається відкритим** із текстом помилки, `submit_quiz` **не викликається**.
14. **Профілю немає в `profiles`** — `UPDATE` зачепив 0 рядків: показати помилку,
    а не «збережено».
15. **Приватний режим / `localStorage` недоступний** — `guessLoggedIn()` кидає, ловимо,
    вважаємо гостем; прапорець `nameConfirmed` не читається — показуємо `last`, не `soft`.
16. **Дуже повільна мережа** — скелетон зʼявляється на 150 мс і живе, поки не буде
    відповіді; при швидкій сесії (<150 мс) **не зʼявляється взагалі**.
17. **Друга платформа (AI Architect)** — усе те саме на `architect.html` і
    `modules/architect-*.html`, курс на 22 модулі, дотик на `a22`.
18. **`js/auth.js` читає кореневий `config.json` і зі сторінок `/modules/`** — вхід
    спільний. Після роботи це має лишитись правдою.

---

## 8. Критерії приймання

Нумеровані, перевірювані в браузері на dev-превʼю. **1–7 перенесені з §5 `SUMMARY.md`
дослівно**, решта — мої.

### Перенесені з дизайну

1. **Нуль мережевих запитів по Google Sans.** DevTools → Network → фільтр `font`:
   у списку тільки `fonts.googleapis.com` / `fonts.gstatic.com` по **Literata**,
   **IBM Plex Sans**, **IBM Plex Mono**. Пошук по `Network` рядка `Google Sans` /
   `googlesans` — **нуль збігів**.
2. **Кнопка Google:** висота рівно **40 px**, логотип на **12–13 px** від лівого краю
   (виміряти `getBoundingClientRect`), логотип не перефарбований (чотири фірмові кольори
   на місці), підпис — рівно «Продовжити з Google», **в один рядок на 320 px**.
3. **Клавіатура:** `Tab` не виходить за межі картки (пройти 14 разів); фокус видимий
   на кожному кроці; **жодної зупинки на невидимому елементі**; у двошаровому стеку
   `Escape` закриває **тільки верхній**.
4. **320×560:** уся картка досяжна скролом, хрестик ✕ і кнопка сабміту не зрізані.
5. **`prefers-reduced-motion: reduce`** (DevTools → Rendering → Emulate CSS media):
   руху немає, нічого не ламається, усе зʼявляється миттєво й повністю.
6. **Шапка при завантаженні не стрибає.** `PerformanceObserver({type:'layout-shift'})`
   на холодному старті → внесок слота авторизації = **0**.
7. **Контраст:** увесь текст модалки ≥ **4.5:1**, кожна межа, що ідентифікує контрол,
   ≥ **3:1** на своїй підложці; **жодного `faint` (#7A7164) у новому тексті**.

### Додані планом

8. **Токени в 38 файлах:** `grep -rl '#C4674A' --include='*.html' --exclude-dir=dev . | wc -l`
   → **38**; `grep -rl '#BD5F40' --include='*.html' --exclude-dir=dev . | wc -l` → **0**;
   `grep -rl 'line-strong' --include='*.html' --exclude-dir=dev . | wc -l` → **38**.
9. **`#BD5F40` у `js/certificate.js` лишився недоторканим:**
   `grep -c '#BD5F40' js/certificate.js` → **5**.
10. **Скрипт і слот у 37 файлах:** `grep -rl 'js/auth-ui.js' --include='*.html' . | wc -l`
    → **37**; `grep -rl 'id="aiaAuth"' --include='*.html' . | wc -l` → **37**.
    Регістр: `ls js/` показує рівно `auth-ui.js`, нижнім регістром.
11. **Консоль чиста.** На `index.html`, `architect.html`, `modules/module-12.html`,
    `modules/architect-22.html`, `certificate.html`, `verify.html` — нуль необроблених
    винятків і нуль `404` у Network.
12. **`verify.html` не зламано:** сторінка відкривається, `?code=<будь-що>` віддає
    свій звичайний результат (слот авторизації там і не має зʼявлятись).
    **Це не формальність, а перевірка реального збігу імен:** `js/verify.js:79` читає
    `?code=` як **код сертифіката**, а PKCE-потік Supabase повертає `?code=` як
    **код авторизації**. Колізії немає **тільки тому**, що `verify.html` єдиний із 38
    файлів не підключає `js/auth.js` (перевірено `comm`). Наслідок-правило: **ніколи не
    додавати `js/auth.js` на `verify.html`** і не використовувати параметр `code` на
    сторінках, де auth підключений.
13. **Панель помилки після редіректу — без живого Google.** Відкрити
    `https://dev-ai-academy.andriy-puhalsky.workers.dev/?error=access_denied&error_description=user+denied`
    → модалка **відкривається сама**, показує панель «Вхід через Google скасовано»
    (іконка + заголовок + причина + «Спробувати ще раз»), а **адресний рядок після
    завантаження не містить `error`** (`location.search` порожній).
14. **Очищення URL не зʼїдає чуже.** Відкрити
    `…/modules/module-03.html?utm_source=test&error=access_denied#lesson-2` →
    після завантаження в URL лишились `?utm_source=test` **і** `#lesson-2`,
    `error` зник.
15. **Кнопка Google без мережі** (DevTools → Offline) дає панель `open`
    («Не вдалося відкрити Google»), а не мовчазне нічого і не зависання назавжди.
16. **Ім'я в шапці — кнопка.** На ≥640 px ім'я має пунктирне підкреслення, доступне
    з клавіатури, має `aria-label`, і клік відкриває діалог у режимі `permanent`.
17. **Збереження імені реально доїжджає до бази.** Змінити ім'я → перезавантажити
    сторінку → у шапці **нове** ім'я. (Перевіряє, що читання йде з `profiles`,
    а не з кешу метаданих.)
18. **Помилка збереження не видає себе за успіх.** DevTools → Network → Offline →
    «Зберегти» → діалог лишився відкритим із текстом помилки; після `Online` і повтору —
    зберігається.
19. **Гарантований дотик спрацьовує рівно там, де треба.** На акаунті з 5/12 клік по
    «Позначити завершеним» діалогу **не відкриває**; на акаунті з 11/12 — відкриває.
    (Тест «11/12» вимагає окремого дозволу власника — див. розділ 10.)
20. **`Escape` у дотику нічого не надсилає на сервер.** Network під час `Escape`:
    **жодного** запиту до `/rest/v1/rpc/submit_quiz`; лічильник у шапці лишився `11/12`;
    фокус повернувся на `#completeBtn`.
21. **Мобільна поверхня.** На 390 px у шапці — кружечок з ініціалом (36×36); клік
    відкриває аркуш із трьох рядків (ім'я · Сертифікати · Вийти); «Сертифікати» веде
    на `certificate.html`; `Escape` і клік по підложці закривають; фокус повертається
    на кружечок.
22. **Сумісність наявних викликів.** `window.AIAAuth.open("текст")` з консолі відкриває
    модалку з нотаткою; гейт заблокованого модуля (`js/module.js:284`) і
    `js/certificate.js:45` працюють як раніше.
23. **Вхід поштою не зламано.** Реєстрація + вхід існуючим тестовим акаунтом працюють;
    неправильний пароль дає «Невірний email або пароль.» у `#aiaError`.
24. **Обидві платформи.** Усі перевірки вище повторені на `architect.html` і
    `modules/architect-22.html`.
25. **Наскрізний Google-вхід** (провайдер увімкнений з 2026-08-24, блокера немає):
    клік по «Продовжити з Google» на dev-превʼю → екран Google → повернення на **ту саму
    сторінку** `dev-ai-academy.andriy-puhalsky.workers.dev`, а не на прод → у шапці ім'я
    з Google ≤3 с → адресний рядок **без `code` і без `state`** → консоль чиста.
26. **Скасування на екрані Google.** Натиснути «Скасувати» / повернутись назад →
    людина повертається на сторінку входу → модалка **відкривається сама** з панеллю
    «Вхід через Google скасовано» → URL очищено. **Дослівний `error_code` записати у
    звіт** — це остання невідома з розділу 2.5.
27. **Вхід через Google на сторінці модуля.** Увійти з `modules/module-03.html` →
    повернення саме туди, гейт заблокованого модуля не блимає, прогрес підвантажився.

---

## 9. Команди перевірки (копіювати як є)

```bash
cd /Users/ander1.sage/Downloads/AIA

# Токени — має бути 38 / 0 / 38
grep -rl '#C4674A'    --include='*.html' --exclude-dir=dev . | wc -l
grep -rl '#BD5F40'    --include='*.html' --exclude-dir=dev . | wc -l
grep -rl 'line-strong' --include='*.html' --exclude-dir=dev . | wc -l

# PDF-літерали недоторкані — має бути 5
grep -c '#BD5F40' js/certificate.js

# Слот і скрипт — має бути 37 / 37, і множини мають збігатися
grep -rl 'id="aiaAuth"'   --include='*.html' . | wc -l
grep -rl 'js/auth-ui.js'  --include='*.html' . | wc -l
comm -3 <(grep -rl 'js/auth-ui.js' --include='*.html' . | sort) \
        <(grep -rl 'js/auth.js'    --include='*.html' . | sort)   # має бути порожньо

# Регістр шляхів — рівно один файл, нижнім регістром
ls -1 js/ | grep -i 'auth'

# Container queries не проїхали в css/custom.css — має бути 0
grep -c '@container' css/custom.css

# Розділення зон: у css/custom.css і js/auth-ui.js немає Supabase
grep -c 'window.sb\|supabase' js/auth-ui.js        # має бути 0
# у js/auth.js немає розмітки
grep -c '<div\|<button\|<input' js/auth.js         # має бути 0

# Провайдер Google — увімкнули чи ні
curl -s https://hpcyrnxschpxlrxudmqk.supabase.co/auth/v1/settings \
  -H "apikey: $(python3 -c "import json;print(json.load(open('config.json'))['supabase']['anonKey'])")" \
  | python3 -c "import sys,json;print('google =', json.load(sys.stdin)['external']['google'])"

# Локальний перегляд
python3 -m http.server 8000
```

---

## 10. Ризики

| # | Ризик | Ціна | Як перевірити заздалегідь |
| - | ----- | ---- | ------------------------- |
| Р1 | **`cleanUrl()` спрацює до обміну `?code=`** на сесію → вхід тихо не відбувається, помилки немає | найдорожчий баг задачі: виглядає як «Google не працює», а причина в одному рядку порядку | код-рівнева перевірка: `cleanUrl()` викликається **після** `await refreshSession()`. Критерій 25 + критерій 14 |
| Р2 | **Приземлення на прод замість превʼю.** Allow-list налаштований (перевірено), але GoTrue кидає на `Site URL` = прод у двох випадках: `redirectTo` поза allow-list **або втрачений `state`** (2.5, пункт 3) | QA «перевіряє» прод, думаючи що дивиться превʼю; можлива плутанина з реальними акаунтами | після кожного повернення від Google **дивитись на домен в адресному рядку**, не тільки на вміст сторінки. Критерій 25 сформульований саме так |
| Р3 | **Регістр шляхів.** `js/Auth-UI.js` локально працює, на Cloudflare 404 → сайт без входу взагалі | уже клало прод один раз (папка `CSS/`) | `ls -1 js/ \| grep -i auth` + після push перевірити на превʼю: `curl -s -o /dev/null -w '%{http_code}' https://dev-ai-academy.andriy-puhalsky.workers.dev/js/auth-ui.js` → **200** |
| Р4 | **38 однакових правок** зроблені руками, в одному файлі пропущено | одна сторінка з іншою палітрою; знайдеться нескоро | тільки скриптом; після — три `grep -c` з розділу 9 |
| Р5 | **`@container` не переведено на `@media`** | правила ніколи не спрацюють: на мобілці не зникнуть «Сертифікати»/«Вийти» й не зʼявиться кружечок; на десктопі не зʼявиться ім'я | `grep -c '@container' css/custom.css` → **0**; візуально на 390 і 1440 |
| Р6 | **`.aia-scrim` лишилась `position: absolute`** | підложка накриє не вікно, а найближчий позиціонований предок; модалка поїде в потік сторінки | `grep -A3 '\.aia-scrim {' css/custom.css` → `position: fixed` |
| Р7 | **Сценарій `conflict` може не існувати.** `mailer_autoconfirm: true`, тому Supabase, найімовірніше, **звʼяже** Google-ідентичність з наявним email-акаунтом замість помилки | панель `conflict` — мертвий код; гірше — при звʼязуванні `user_metadata.full_name` перезапишеться іменем з Google | контракт 5.5 уже це нейтралізує: джерело правди — `profiles`, а не метадані. Бекендер перевіряє поведінку живим тестом і пише у звіт. Панель `conflict` **лишаємо** (коштує нуль) |
| Р8 | **`UPDATE profiles` зачепив 0 рядків** → «збережено», а в PDF старе ім'я | точно та проблема, яку задача мала закрити | контракт 5.5, три гілки результату; критерій 18 |
| Р9 | **Міграція 002 забирає `INSERT` на `profiles`.** Якщо `handle_new_user()` не `SECURITY DEFINER` — після 002 зламається створення профілю для **будь-якої** нової реєстрації | реєстрація мовчки перестане працювати в проді | завдання Б0, пункт 2. Це ризик 002, не 001, але виявити його маємо ми — ми перші, хто торкається `profiles` |
| Р10 | **QA-тести пишуть у ПРОДОВУ базу.** Кожен тестовий вхід = справжній `auth.users` + `profiles` + повідомлення власнику в Telegram. Завершення курсу = **справжній сертифікат із публічним кодом** | сертифікат неможливо відкликати; `certificates` сьогодні **0 рядків** — псувати цю чистоту дорого | **Тверде правило для QA: критерій 19 у частині «11/12» і критерій 20 виконуються ТІЛЬКИ з окремого дозволу власника, на призначеному тестовому акаунті, і сертифікат НЕ генерувати.** Решту критеріїв (діалог відкривається, `Escape` скасовує) можна перевірити, не доводячи до `submit_quiz` |
| Р11 | **Rate limit Google/Supabase** при повторюваних тестах (429) | тест виглядає як баг | п'яте правило `translateError` (Б8); у звіті QA розрізняти 429 і справжню помилку |
| Р12 | **Tailwind CDN не згенерує клас, ужитий тільки в динамічній розмітці** | `sr-only` зникне → приховані мітки стануть видимими | Ф6: продублювати `.sr-only` у `css/custom.css`. Візуально: у модалці не має бути видимих слів «Ім'я та прізвище» над полем |
| Р13 | **Бекендер запушив раніше за фронтендера** → на превʼю сайт без входу взагалі | зламане превʼю, плутанина у QA | правило порядку push у 6.3 + однорядкова перевірка `git cat-file -e origin/dev:js/auth-ui.js` |
| Р14 | **`onAuthStateChange` на `USER_UPDATED` робить `location.reload()`** після `sb.auth.updateUser` | сторінка перезавантажиться посеред збереження імені; у варіанті B — просто перед `submit_quiz` | Б10; критерій 17 |
| Р15 | **`js/auth.js:22` «оптимізують» на відносний шлях** до конфіга | вхід перестане бути спільним для двох курсів | рядок 22 не змінювати; критерій 24 |
| Р16 | **Дизайн узятий із `03-build/`** замість `04-variants/shared/` | повернуться дві блокуючі поломки, які валідатор уже полагодив | розділ 2.1; критерії 3 і 4 ловлять обидві |
| Р17 | **Збіг імені параметра `code`.** `js/verify.js:79` читає `?code=` як код сертифіката; PKCE Supabase повертає `?code=` як код авторизації | якби `auth.js` стояв на `verify.html`, `cleanUrl()` зʼїдав би код сертифіката, а `detectSessionInUrl` намагався б обміняти його на сесію | сьогодні колізії **немає**: `verify.html` — єдиний із 38 файлів без `js/auth.js`. Правило: не додавати туди auth і не заводити параметр `code` на сторінках з auth. Критерій 12 |

---

## 11. Що передати далі

### Бекендеру (`aia-build-backend`)

- **Твоя перша дія — Б0, звірка бази через MCP.** Чотири питання, усі в 6.1. Головне з
  них: **звідки `maybe_issue_certificate` бере ім'я.** Не звірив — так і напиши, гадати
  заборонено. Контракт 5.5 (писати в обидва сховища) робить код правильним у будь-якому
  разі, але звіт має містити **факт**, а не мою обережність.
- **Найнебезпечніше місце у твоїй частині — не OAuth, а порядок у `boot()`** (5.7).
  Помилка тут не падає, не логується і виглядає як «Google не працює».
- **Друге найнебезпечніше — `UPDATE`, що зачепив 0 рядків** (5.5). PostgREST віддасть
  `error: null`. Три гілки, не дві.
- **Не чіпай:** `js/auth.js:22` (шлях до конфіга), `submit_quiz` і все серверне навколо
  порядку модулів, пʼять літералів `#BD5F40` у `js/certificate.js`, міграцію 002.
- **Міграцій ця задача не потребує.** Якщо Б0 покаже, що потребує — не пиши SQL «про
  всяк випадок»: опиши в звіті й зупинись.
- Памʼятай: MCP дивиться в **прод**. Читати вільно, `apply_migration` / `execute_sql`
  з DDL — ніколи.

### Фронтендеру (`aia-build-frontend`)

- **Джерело — `04-variants/shared/` + `variant-b/`. `03-build/` не відкривати як
  джерело коду взагалі** (розділ 2.1). Якщо десь побачиш `03-build/styles.css` —
  це застаріле; у ньому дві блокуючі поломки доступності.
- **Три речі, які макет не міг знати, а ти маєш зробити:**
  `position: absolute` → `fixed` (Ф4) · `@container` → `@media`, шість місць (Ф5) ·
  монтувати діалоги в `document.body`, не в сцену (Ф8).
- **Ф13–Ф15 — тільки скриптом.** 37 і 38 правок руками = гарантована дірка.
  Після кожної — `grep -c` з розділу 9.
- Ти **столяр**: жодного власного візуального рішення. Питання 3 розділу 1 (міняти
  місцями кнопки при підозрілому імені) — **дефолт «ні»**, роби рівно як у варіанті B.
- **Зона:** `js/auth.js` — не твій. Потрібна там зміна — пиши у звіт, не правь.
- Регістр: `js/auth-ui.js`, нижнім регістром, дефіс.
- **Пушиш першим.** Твоя половина адитивна й нічого не ламає.

### Тестувальнику (`aia-build-qa`)

**Зовнішніх блокерів немає.** Провайдер Google увімкнений власником 2026-08-24 і
перевірений незалежно (`external.google = true`, `/authorize` → `302` на Google).
Наскрізний вхід (критерії 25–27) перевіряється повністю.

**Де зламається найімовірніше — у цьому порядку:**

1. **320×560 з найважчим змістом** — модалка з нотаткою + панель помилки + таб
   «Реєстрація». Це стан, на якому макет уже раз зламався. Хрестик і кнопка сабміту.
2. **Клавіатура під час очікування Google** — `Tab` не має виводити фокус за межі
   картки, `#aiaSubmit` має бути `disabled`, форма email `inert`. Тут уже ловився баг.
3. **Згорнуте поле імені на табі «Вхід»** — четверте натискання `Tab` не має
   зупинятись на невидимому полі. Це WCAG рівня **A**, не AA.
4. **`@container`, що не перевели на `@media`** — на 390 px мають зникнути
   «Сертифікати»/«Вийти» і зʼявитись кружечок; на 1440 — навпаки. Якщо на мобілці
   видно всі три контроли — конверсію пропустили.
5. **Очищення URL** — критерії 13 і 14. Другий важливіший: перевір, що `?utm_source=`
   і `#lesson-2` **вижили**.
6. **Один із 37/38 файлів пропустили** — прогнати `grep`-и з розділу 9 самому,
   не вірити звітам.
7. **Токен `clay-deep`** — навести на головну кнопку в модалці й на «Позначити
   завершеним»: hover має бути `#C4674A`, а не `#BD5F40`.
8. **Домен в адресному рядку після повернення від Google** — не вміст сторінки, саме
   домен. Приземлення на `ai-academia.com.ua` замість превʼю має бути **тільки** у
   випадку помилки з втраченим `state`; успішний вхід має лишитись на превʼю.

**Тверді обмеження на тести, що пишуть у базу** (превʼю працює з **продом**):
- будь-який тест, що доводить курс до `n/n`, — **тільки з окремого дозволу власника**,
  на призначеному тестовому акаунті. Сертифікат **не генерувати**: `certificates`
  сьогодні містить **0 рядків**, і кожен виданий код публічно перевіряється назавжди;
- усі створені рядки (email тестових акаунтів, коди модулів) — переліком у звіті;
- памʼятай: кожна нова реєстрація **надсилає власнику повідомлення в Telegram**.

**Що НЕ вважається дефектом:**
- **приземлення на прод (`ai-academia.com.ua`) після помилки з втраченим `state`** —
  так влаштований GoTrue: разом зі `state` він губить і `redirect_to`, тож падає на
  `Site URL`. Перевірено мною живим ендпоінтом, деталі в 2.5, пункт 3. **Але** якщо
  на прод кидає **успішний** вхід із превʼю — це вже дефект;
- панель `conflict` не вдалось відтворити — див. ризик Р7;
- текст «Google не повернув причину помилки» при `error_code=bad_oauth_state` —
  свідомий дефолт, відкрите питання 5;
- «Готово! Якщо прийшов лист — підтверди пошту» не показується — `mailer_autoconfirm`
  увімкнений, ця гілка сьогодні недосяжна.

**Максимум 3 кола фіксів.** Далі — до власника, а не четверте коло.
