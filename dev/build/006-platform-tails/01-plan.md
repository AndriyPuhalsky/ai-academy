# 006 — Платформні хвости, кнопка банки, роадмап · План реалізації

- **Джерело:** `task.md`, блок 1 — ТЗ від 2026-09-06 + пʼять рішень власника того ж дня
  (не переоткриваються) + `00-root-plan.md` (розвідка кореневої сесії).
- **Дизайн:** **не потрібен.** Багфікси, доступність, бекенд і складання з наявних
  компонентів — це прямо перелічені «не потрібен дизайн» випадки з кореневого `CLAUDE.md`.
  Єдина нова видима сутність — кнопка «Відкрити ↗» у донатах AI Терміналу, і вона є
  **дослівним перенесенням** наявного компонента з `js/config.js:261–266` (кнопка банки
  AI Академії), а не новим візуалом.
- **Платформа:** усі три. Спільні файли (`css/custom.css`, `js/auth.js`, `js/certificate.js`,
  `js/config.js`, `js/contact.js`, `certificate.html`, `verify.html`) зачіпають AI Академію,
  AI Architect і AI Термінал одночасно.
- **Гілка:** `dev`. **Мержу в `main` поки не буде** (рішення власника 2026-09-06): уся
  робота 006 лишається на `dev`; реліз (версії, `site.updated`, запис релізу в
  `tg/CHANGELOG.md`, дати `roadmap.json`) не робиться до окремого рішення. Мерж — лише
  після прямого «так» власника.
- **Написано:** 2026-09-06. Усі числа й `файл:рядок` нижче перевірені ґрепом у цей день,
  не взяті з памʼяті й не переписані з розвідки на віру.
- **Наступні задачі (контекст, не обсяг):** 007 (довжина варіантів квізів, `#quizData` у
  `modules/*.html`) стартує під час QA 006 і перетинається з 006 рівно на одному файлі —
  `modules/module-07.html`; 008 (рев'ю контенту AI Терміналу) — після 007.

---

## Відкриті питання до власника

**Блокуючих немає.** Роботу можна починати одразу; якщо власник мовчить, виконавці роблять
за дефолтом і фіксують це у звіті.

1. **[неблокуюче] Розмітка «Прогрес:» у пілюлі: `sr-only sm:not-sr-only` замість
   `hidden sm:inline`.** `00-root-plan.md` називає `hidden sm:inline`. Геометрія в обох
   варіантів однакова (обидва дають нульову ширину до 640 px), але `hidden` **вилучає слово
   з дерева доступності**: скрінрідер на телефоні прочитає голе «3/12» без жодного натяку,
   що це прогрес. Для задачі, половина якої — доступність, це крок назад.
   **Мій дефолт: `sr-only sm:not-sr-only`** — видно те саме, читається краще, резерв ширини
   рахується так само. Якщо власник хоче дослівно як у корінному плані — заміна одного класу
   на інший, критерії приймання не змінюються.
2. **[неблокуюче] Футер `roadmap.html` — теж піднімати цілі до 24 px?** Корінний план
   називає «три лендінги», але той самий 20-піксельний футер стоїть і на `roadmap.html`
   (`:137–140`, три посилання + `#contactTrigger`) — це четверта сторінка з `js/contact.js`.
   **Мій дефолт: так, включити** — інакше хвіст 004 закриється на 3/4 і повернеться окремою
   задачею. Ціна: футер роадмапу підросте на ті самі ~16 px, що й на двох лендінгах.
3. **[неблокуюче] Статичне посилання «Курс» у шапці `/certificate` (`certificate.html:45`,
   `index.html#syllabus`).** Сторінка одна на три курси, тож шапка course-agnostic за
   конструкцією. Вимогу «жодне посилання не веде випускника курсу X у програму курсу Y»
   закриваємо **на рівні картки сертифіката** (посилання «До програми курсу →» з мапи
   бренду). **Мій дефолт: шапку не чіпати** — вона лишається під парасольковим брендом
   AI Академії, як і решта сторінки (рішення власника 1 стосується PDF і посилань курсу,
   не шапки). Якщо власник хоче — це один рядок у зоні фронтендера.
4. **[неблокуюче] Що робити з `renderEmpty()` (`js/certificate.js:48–57`), коли сертифікатів
   нема взагалі.** Курсу в цьому стані не існує, вибрати бренд нема з чого.
   **Мій дефолт: лишити як є** — фолбек AI Академія, посилання `index.html#syllabus`.
5. **[неблокуюче] Дата релізу для `roadmap.json` (`meta.updated`, `meta.updatedLabel`).**
   Обидва поля правляться руками й мають збігатися між собою; дата мержу в `main` наперед
   невідома. **Мій дефолт: фронтендер ставить дату свого коміту (`2026-09-06`), а коренева
   сесія перед мержем звіряє й за потреби переставляє** — так само, як робиться з
   `site.updated` у трьох конфігах.

**Рішення кореневої сесії 2026-09-06 (за дефолтами PM; власнику показано у звіті):**
1 — `sr-only sm:not-sr-only`, прийнято. 2 — `roadmap.html` включити. 3 — шапку
`/certificate` не чіпати. 4 — `renderEmpty()` лишити. 5 — **знято рішенням власника:**
мержу поки не буде, тому `meta.updated` і `meta.updatedLabel` у `roadmap.json` **не
чіпати взагалі** — дата поновиться разом із релізом.

---

## Що є зараз (перевірено в коді 2026-09-06)

Розвідка кореневої сесії звірена рядок у рядок; розбіжності з нею позначені **⚠**.

### Бекендерська половина

| Що | Де насправді (2026-09-06) | Стан |
| --- | --- | --- |
| Дані сертифіката з бази | `js/certificate.js:101` — `select("public_code, full_name, issued_at, course_id, courses(title, slug)")` | `slug` уже приїжджає, нового запиту не треба |
| Медальйон | `js/certificate.js:150–158`: моно-кружечок `AIA` (`:154`), капс-рядок `AI АКАДЕМІЯ` (`:156`) | обидва літерали захардкоджені |
| Підпис видавця | `js/certificate.js:196` — `AI Академія` | захардкоджений |
| Шапка додатка | `js/certificate.js:286` — `AI АКАДЕМІЯ · ДОДАТОК` | захардкоджена |
| Фолбек назви курсу для імені файла | `js/certificate.js:342` — `|| "AI-Academy"`; ужиток — `doc.save("Сертифікат — " + course + ".pdf")` (`:384`) | ⚠ це **не** «фолбек бренду», а фолбек назви курсу у файлі PDF |
| Посилання «До програми курсу →» | `js/certificate.js:55` (`renderEmpty`) — `index.html#syllabus` | єдине; **на картці сертифіката посилання на курс немає взагалі** ⚠ (`certCard` `:59–77` має лише «Завантажити PDF» і «Сторінка перевірки ↗») |
| Подвійний `GET certificates` | `document.addEventListener("aia:auth", load)` — `js/certificate.js:399` ⚠ (у розвідці `:400–403`). На `DOMContentLoaded` `load()` **не** викликається (`:400–404`) | причина — два `dispatchEvent("aia:auth")`: `js/auth.js:163` і `:196` |
| Слухачі `aia:auth` в усьому репозиторії | рівно один: `js/certificate.js:399` | тобто зайвий запит існує тільки на `/certificate` |
| Читання імені | `loadProfileName()` `js/auth.js:223–243`; ланцюжок `currentName()` `:248–259`; best-effort `updateUser` після збереження — `:303–309` | розходження `profiles.full_name` ↔ `user_metadata.full_name` не лікується ніде |
| Нормалізація коду `/verify` | `js/verify.js:57–58` — `code = (code || "").trim()`, далі одразу `rpc("verify_certificate", { p_code: code })` (`:63`) | нормалізації немає взагалі |
| Формат коду | 12 hex-символів у нижньому регістрі: `005-1-course-ai-terminal.sql:283–285` (`replace(gen_random_uuid()::text,'-','')`, `substr(...,1,12)`) | тобто алфавіт `0-9a-f` |
| `tg/DEPLOY_CHECKLIST.md` | **не існує**; посилаються `tg/GOING_LIVE.md:3`, `:73`, `:85` | файла не було ніколи |
| Файли міграцій у репозиторії | `002-lock-profiles-role.sql`; `005-1-course-ai-terminal.sql`, `005-2-module-titles.sql`, `005-3-cleanup-qa-certificate.sql`, `005-4-cleanup-qa-account.sql`; окремо `tg/contact_messages.sql` | **базової схеми (courses/modules/profiles/progress/…) у репозиторії немає** — вона створювалась поза гітом |
| Живі `courses.slug` | у коді видно лише `claude-code` (`005-1:79–88`) та згадку старого `ai-essentials` (`005-1:298`, коментар про прибраний хардкод) | **слаг AI Architect із коду не виводиться** |

### Фронтендерська половина

| Що | Де насправді (2026-09-06) | Стан |
| --- | --- | --- |
| Донати AI Терміналу | `js/claude-code-render.js:517–528`: `var value = /^https?:\/\//.test(m.value) ? '<a class="cc-donate__link" …>' + esc(m.value) + '</a>' : esc(m.value)` | `type` не читається; підпис лінка = сам URL |
| Конфіг донатів AI Терміналу | `claude-code.config.json:571–592`: три методи, у жодного **немає** `id`, `enabled`, `type` | контракт кореневого `config.json` (`donations.methods[].type` = `link`/`copy`) не дотриманий |
| Еталон кнопки | `js/config.js:261–266` — `<a … class="mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm transition hover:border-clay/60 hover:text-sand">Відкрити ↗</a>` | працює в проді на `index.html` |
| CSS донатів AI Терміналу | `css/claude-code.css:707–736`: `.cc-donate__card`, `.cc-donate__label`, `.cc-donate__value` (`word-break:break-all`), `.cc-donate__link` (`:725–731`), `.cc-donate__note` | класу `.cc-donate__btn` немає |
| Токени для нового класу | `css/custom.css`: `--c-line: #3A342E` (`:700`), `--c-sand: #E8DCC3` (`:706`), `--c-muted: #A8A095` (`:707`), `--c-accent: #D97757` (`:720`), `--s-3: 12px` (`:795`), `--r-control: 8px` (`:805`), `--bw: 1px` (`:810`), `--e-out` (`:859`), `--dur-hover: 150ms` (`:874`) | усі доступні на сторінці AI Терміналу |
| Футерні цілі | `index.html:235–238` і `architect.html:221–224` — 4 і 5 елементів `class="text-muted transition hover:text-sand"` без `min-h`; `roadmap.html:137–140` — те саме ⚠ (у розвідці не згадано) | 20 px |
| Футер AI Терміналу | генерується: `js/claude-code-render.js:539–543` (`#footLinks`) і `:550–558` (`#footSourceLinks`); `#contactTrigger` уже має `inline-flex min-h-[24px] items-center` (`claude-code.html:328–329`) | 20 px у двох згенерованих списках |
| Пілюля прогресу | `js/config.js:339–341` (`navProgressText`), `:377–379` (резерв, `--navprog-ch`), `:401–407` (показ, `pill.textContent = text`, `rememberNavProgress(text.length)`); **дослівна копія** — `js/claude-code-render.js:100–102`, `:138–140`, `:162–168` | текст завжди повний |
| Резерв ширини | `css/custom.css:2080–2085`: `#navProgress[data-reserved] { visibility:hidden; min-width: calc(var(--navprog-ch,13) * 1ch + 1.5rem + 2px) }` | рахується від повного тексту |
| Розмітка пілюлі | `index.html:105`, `architect.html:101`, `claude-code.html:112`, `certificate.html:48`, 57 уроків (напр. `modules/module-01.html:79–80`) | `<span id="navProgress" hidden class="rounded-full border border-line px-3 py-1 font-mono text-xs text-sand"></span>` |
| Бренд у шапці лендінгу | `index.html:72–74` / `claude-code.html:80–82`: `<a href="#top" class="flex items-center gap-2.5">` + квадрат `shortName` + `<span class="font-display text-lg" data-site="name">` | на 390 px переноситься у два рядки (П-08, QA 005: 32 → 56 px) |
| Шапка уроку | `modules/*.html:58` — `<header class="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur">`, прямий нащадок `<body data-module="…">` (`:46`) | хук `body[data-module]` є в **57 із 57** файлів `modules/*.html` |
| Сайдбар уроку | `css/custom.css:333–372`; на `min-width:1024px` — `position:sticky; top:5rem; height:calc(100vh - 6rem)` | при висоті вікна < ~785 px налазить на напівпрозору шапку |
| Модалка «Написати нам» | `js/contact.js:133–182` (`buildModal`), `:137` (`className`), `:141` (`<h2>` без `id`), `:169–171` (слухач `keydown`, лише Escape), `:195–203` (`openModal`), `:205–214` (`closeModal`) | немає `role=dialog`, `aria-modal`, `aria-labelledby`, пастки Tab і повернення фокуса |
| Еталон пастки фокуса | `js/auth-ui.js:498–511` (`focusables`), `:513–525` (`trap`), `:527–534` (слухач) | працює в проді |
| Сторінки з `js/contact.js` | рівно 4: `index.html`, `architect.html`, `claude-code.html`, `roadmap.html` | один файл — усі чотири |
| `certificate.html` | `<main id="main">` уже є (`:53`), `#ariaLive` уже є (`:36`), `.skip-link` — **немає** | треба один рядок |
| `verify.html` | `<main class="…">` **без** `id` (`:46`), `#ariaLive` немає, `.skip-link` немає, жодного `aria-*`; `#verifyResult` (`:59`) наповнюється динамічно | найгірше озвучена сторінка проєкту, і саме її відкриває сторонній |
| Еталон skip-link | `index.html:57–58` (`<a href="#main" class="skip-link">Перейти до вмісту</a>` + `<div id="ariaLive" class="sr-only" aria-live="polite">`), стилі — `css/custom.css:8–24` | — |
| `modules/module-07.html` | кандидати на +3 px: `<table>` `:226` і `:386` ⚠ (таблиць **дві**, не одна), `.diagram` зі SVG `:149` і `:271` | корінь не названий; міряти наживо |
| `roadmap.json` | `a11y-improvements` — `:133–140`, `"state": "progress"`; `meta.updated` `:4` = `2026-09-04`, `meta.updatedLabel` `:5` = «оновлено 4 вересня 2026» | пункт 004 давно закритий |
| Версії | `config.json` 0.4.1 · `architect.config.json` 1.3.1 · `claude-code.config.json` 1.0.1, `site.updated` = `2026-09-05` у всіх трьох | піднімає коренева сесія перед мержем, не агенти |

### Три факти, які визначають форму рішень

1. **Tailwind CDN обробляє класи, додані з JS.** Доведено проданням: `js/config.js:201–213`
   вставляє `sm:grid-cols-…`, `hover:border-clay/50`, `js/claude-code-render.js:572` —
   `sm:px-8`. Тому і `sm:not-sr-only`, і `min-h-[24px]` з рендерів футера працюватимуть.
   Але **статичного вживання `sm:not-sr-only` в репозиторії немає жодного** — це перший
   раз, тож QA перевіряє його першим ділом (критерій 12).
2. **Текст пілюлі моноширинний**, тому `N символів = N ch`: у `css/custom.css:2070–2079`
   зафіксовано, що «Прогрес: 12/12» = 14ch + падінги = 126,8 px і це збіглося зі 127 px,
   які QA заміряв у браузері. Уся арифметика резерву стоїть на цьому.
3. **`js/config.js` і `js/claude-code-render.js` — дві дослівні копії одного механізму
   пілюлі.** Правка в одній без другої дає різну шапку на сусідніх курсах — це дефект.

---

## Обсяг

### Входить

- **П-10** — бренд сертифіката за курсом (PDF + посилання на курс).
- **П-12** — один `GET certificates` на завантаження `/certificate`.
- **П-11** — самолікування розходження `profiles.full_name` ↔ `user_metadata.full_name`.
- **Омогліфи `/verify`** — нормалізація коду перед RPC + підказка людині.
- **`tg/DEPLOY_CHECKLIST.md`** — текст пише бекендер, файл створює коренева сесія.
- **Кнопка банки** на `claude-code.html` (конфіг + рендер + клас).
- **Футерні цілі 24 px** — `index.html`, `architect.html`, згенерований футер AI Терміналу
  (+ `roadmap.html` за дефолтом питання 2).
- **П-08** — пілюля «3/12» до 640 px, синхронно у двох копіях, з точним резервом.
- **П-01** — непрозора шапка уроку на `min-width:1024px and max-height:820px`.
- **П-02** — `role=dialog`, `aria-modal`, `aria-labelledby`, пастка Tab, повернення фокуса.
- **П-09** — skip-link на `/certificate` і `/verify`; `#ariaLive`, `id="main"`, `role=status`
  на `/verify`.
- **`modules/module-07.html`** — +3 px на 390: заміряти й полагодити локально.
- **`roadmap.json`** — `a11y-improvements` → `done`; дати не чіпати (реліз відкладений).
- **Leaked password protection** — увімкнути в Supabase Dashboard (бекендер через Chrome,
  К12) + запис у `tg/CHANGELOG.md`.

### Не входить

- **Поріг квіза** (`p_score = 100`, поріг 70/85 у базі не працює) — рішення власника 4,
  окрема задача пізніше.
- **Довжина варіантів відповідей** — задача 007.
- **Три латентні пастки `js/roadmap-render.js`** (`dropped` сортує «Зроблено» у зворотному
  порядку; `sectionEmptyProgress` бере `byState.done[0]`; `gi >= 2` уже виправлена
  2026-09-04) — не лагодити по дорозі.
- **`currentName()` (`js/auth.js:248–259`) і подвійний `dispatchEvent("aia:auth")`
  (`js/auth.js:163`, `:196`)** — не чіпати; П-12 лікується на боці споживача.
- **Спільний `css/custom.css` для фіксу module-07** — фікс локальний у самому HTML.
- **`wrangler.toml`, `.assetsignore`, `.gitignore`, `dev/design/`** — поза зоною всіх.
- **Будь-яка зміна бази.** У 006 міграцій **не передбачено взагалі**; якщо бекендер вважає,
  що потрібна, — він її не пише, а виносить у звіт окремим рядком.
- **Версії, `site.updated`, дати `roadmap.json`, запис релізу в `tg/CHANGELOG.md`** —
  відкладено до окремого рішення власника про реліз (мержу поки не буде).
  `CLAUDE.md`, `README.md`, `JOURNAL.md` — зона кореневої сесії, після QA.

---

## Контракт даних

Це закон для обох виконавців. Усе, що нижче, узгоджено так, щоб бекендер і фронтендер
**не відкривали спільних файлів** і не чекали один одного.

### К1 · Мапа бренду курсу (`js/certificate.js`, зона бекендера)

Ключ — `courses.slug` із живої бази. Об'єкт:

| Поле | Тип | Може бути порожнім | Приклад (AI Термінал) | Де вживається |
| --- | --- | --- | --- | --- |
| `brand` | string | ні | `AI Термінал` | підпис видавця в PDF (`:196`), фолбек імені файла (`:342`) |
| `brandCaps` | string | ні | `AI ТЕРМІНАЛ` | капс-рядок медальйона (`:156`), шапка додатка (`:286`) |
| `mono` | string, 3 символи | ні | `AIT` | кружечок медальйона (`:154`) |
| `home` | relative URL | ні | `claude-code.html` | резерв, посилання на лендінг |
| `program` | relative URL з якорем | ні | `claude-code.html#map` | посилання «До програми курсу →» на картці |

Значення беруться з живих конфігів (звірено 2026-09-06):

| Курс | `site.name` | `site.shortName` | Лендінг | Якір програми |
| --- | --- | --- | --- | --- |
| AI Академія | `AI Академія` | `AIA` | `index.html` | `#syllabus` (`index.html:197`) |
| AI Architect | `AI Architect` | `AIA` | `architect.html` | `#syllabus` (`architect.html:192`) |
| AI Термінал | `AI Термінал` | `AIT` | `claude-code.html` | **`#map`** (`claude-code.html:239`) — `#syllabus` на цій сторінці немає |

`brandCaps` — верхній регістр `site.name`: `AI АКАДЕМІЯ` / `AI ARCHITECT` / `AI ТЕРМІНАЛ`.

**Ключі мапи бекендер звіряє з живою базою через Supabase MCP** (`select slug, title from
courses order by sort_order`). У PM-підсесії MCP недоступний, тому я їх **не вигадую**:
з коду виводиться лише `claude-code` (`005-1:79–88`); згадка `ai-essentials` у коментарі
(`005-1:298`) — історична й може бути неактуальною; слаг AI Architect із коду не виводиться
взагалі. Якщо MCP не піднявся — бекендер **позначає це у звіті** й бере слаги з Dashboard
через `mcp__claude-in-chrome` (тільки дивитись).

**Фолбек (обов'язковий):** невідомий або порожній `slug` → блок AI Академії +
`console.warn("[AIA cert] невідомий slug курсу:", slug)` **один раз на завантаження**.
Це страховка на випадок нового курсу: сертифікат має бути виданий і завантажений навіть
із чужим брендом, а не впасти.

**Точки підстановки — усі шість:**

| # | Місце | Було | Стало |
| --- | --- | --- | --- |
| 1 | `medallion()` `:154` | літерал `AIA` | `b.mono` |
| 2 | `medallion()` `:156` | `AI АКАДЕМІЯ` | `b.brandCaps` |
| 3 | `buildCertNode()` `:196` | `AI Академія` | `b.brand` |
| 4 | `buildTranscriptNode()` `:286` | `AI АКАДЕМІЯ · ДОДАТОК` | `b.brandCaps + " · ДОДАТОК"` |
| 5 | `downloadPdf()` `:342` | `|| "AI-Academy"` | `|| b.brand` (ім'я файла `Сертифікат — <курс>.pdf`, `:384`) |
| 6 | `certCard()` `:59–77` | посилання на курс немає | **додати** третім: `<a href="<b.program>" class="inline-flex items-center justify-center rounded-lg border border-line px-5 py-2.5 text-sm transition hover:border-clay/60">До програми курсу →</a>` |

`medallion()` стає `medallion(b)`; єдиний виклик — `buildCertNode()` `:183`.
`renderEmpty()` `:55` лишається як є (питання 4).
**Заборонено:** змінювати `verifyUrl()`, `fetchTranscript()`, `makeQr()`, розміри й
координати `verifyLinkAreas()`, `JPEG_QUALITY`, порядок сторінок PDF — усе це полагоджено
в колі 3 задачі 005 і регресія тут дорожча за фічу.

### К2 · Мемоїзація завантаження сертифікатів (П-12, `js/certificate.js`)

```
модульна змінна loadedFor = null            // user.id, для якого дані вже тягнули

load():
  uid = window.AIA_USER ? window.AIA_USER.id : null
  якщо uid === null      → loadedFor = null; renderLoggedOut(); вихід
  якщо uid === loadedFor → вихід БЕЗ мережевого запиту
  loadedFor = uid                            // ставиться ДО запиту, не після
  … наявний select …
  .catch(...)  → loadedFor = null            // щоб наступний aia:auth повторив спробу
```

- Ставити `loadedFor` **до** `.then` обов'язково: два `aia:auth` прилітають підряд, і
  прапорець, виставлений після відповіді, від подвоєння не рятує.
- Скидання при виході (`uid === null`) — обов'язкове, інакше вхід іншим акаунтом у тій
  самій вкладці покаже чужі дані з памʼяті.
- **Ручного перезавантаження після дій користувача на цій сторінці не існує** — сторінка
  нічого не пише, тож окремий `force` не потрібен.

### К3 · Самолікування імені (П-11, `js/auth.js`)

Місце: `loadProfileName()` (`:223–243`), **після** успішного читання `profiles.full_name`.

```
модульна змінна metaSyncedFor = null
умова: user && profileName && String(meta.full_name || "").trim() !== profileName
       && metaSyncedFor !== user.id
дія:   metaSyncedFor = user.id                        // ставиться до виклику
       sb.auth.updateUser({ data: { full_name: profileName } })
         помилка → console.warn("[AIA auth] updateUser (sync):", safeErrorText(e))
```

- **Best-effort:** результат не чекається жодним UI-шляхом, людині нічого не показується,
  `profileName` і `window.AIA_NAME` не переписуються з відповіді.
- **Ніколи не писати порожнє:** якщо `profiles.full_name` порожній — нічого не робимо
  (метадані можуть бути єдиним джерелом імені для `currentName()`).
- `currentName()` (`:248–259`) **не чіпати** — його читають слот шапки й діалог перед
  видачею сертифіката на трьох курсах.
- **Відомий побічний ефект, який треба тримати в голові:** `updateUser` дає подію
  `USER_UPDATED` → `onAuthStateChange` (`js/auth.js:150–164`) → ще один
  `dispatchEvent("aia:auth")`. Слухач у репозиторії рівно один — `js/certificate.js:399`,
  і після К2 він на цю подію мережею не ходить. Гілка «id не змінився → лише `renderSlot()`»
  (`:152–160`) уже написана саме під цей випадок, тож перезавантаження сторінки посеред
  діалогу не буде.

### К4 · Нормалізація коду `/verify` (`js/verify.js`)

Порядок операцій у `verify(code)` (`:57`), **до** `rpc`:

```
raw   = (code || "").trim()
norm  = raw.replace(/\s+/g, "")            // 1. прибрати пробіли всередині
           .toLowerCase()                   // 2. регістр
           .replace(/[…]/g, ch => MAP[ch])   // 3. кирилиця → латиниця
```

Мапа (після `toLowerCase`, тому лише нижній регістр):

| Кирилиця | Латиниця | | Кирилиця | Латиниця |
| --- | --- | --- | --- | --- |
| `а` U+0430 | `a` | | `р` U+0440 | `p` |
| `с` U+0441 | `c` | | `х` U+0445 | `x` |
| `е` U+0435 | `e` | | `у` U+0443 | `y` |
| `і` U+0456 | `i` | | `ѕ` U+0455 | `s` |
| `о` U+043E | `o` | | `ј` U+0458 | `j` |

Код — 12 hex-символів `[0-9a-f]` (`005-1:283–285`), тож із мапи реально «рятують» лише
`а`, `с`, `е`; решта не шкодить і лишається для повноти (нехай не знайде — так само, як
зараз). **Валідацію формату не додаємо**: 006 не міняє поведінку «не знайдено».

Стани й що бачить людина:

| Ситуація | RPC | Що показуємо |
| --- | --- | --- |
| `norm === raw`, знайдено | `p_code = norm` | `validCard(row)` — як зараз |
| `norm !== raw`, знайдено | `p_code = norm` | `validCard(row)` + під ним: `<p class="mt-3 text-sm text-muted">У коді були кириличні літери — ми виправили їх на латиницю: <span class="font-mono text-sand">…norm…</span></p>`; додатково `input.value = norm` |
| не знайдено (байдуже, чи міняли) | `p_code = norm` | `invalidCard(norm)` — у картці показуємо **нормалізований** код, не сирий |
| помилка мережі/RPC | — | як зараз: `console.error` + «Не вдалося перевірити. Спробуй пізніше.» |
| порожній рядок | не викликається | як зараз: «Введи код сертифіката.» |

Той самий шлях працює і для `?code=` з URL (`:79–83`) — нормалізація всередині `verify()`,
тож окремої гілки не треба. Підказка вставляється **всередину** `#verifyResult`, щоб її
підхопив `role="status"`, який ставить фронтендер (див. К8) — це єдина точка, де дві зони
логічно стикуються, і стикуються вони **через різні файли**: `js/verify.js` (бекенд) і
`verify.html` (фронтенд). Обидві половини працюють і поодинці.

### К5 · Кнопка банки на AI Терміналі (зона фронтендера)

**Конфіг** `claude-code.config.json:571–592` — додати `"type"` усім трьом методам (паритет
із контрактом `config.json`, де `type` є в кожного):

| `label` | `type` | `value` | `note` |
| --- | --- | --- | --- |
| `Банка monobank` | `"link"` | без змін | без змін |
| `ФОП Пухальський А.С.` | `"copy"` | без змін | без змін |
| `Tether (USDT)` | `"copy"` | без змін | без змін |

`id`, `enabled` і `copyValue` **не додаємо**: `js/claude-code-render.js` їх не читає, а
зайві ключі в конфізі — це обіцянка поведінки, якої немає.

**Рендер** `js/claude-code-render.js:517–528`:

```
isLink = (m.type === "link") || (!m.type && /^https?:\/\//.test(m.value))   // фолбек
isLink → '<a class="cc-donate__btn" href="' + esc(m.value) + '" target="_blank" rel="noopener noreferrer">Відкрити ↗</a>'
інакше → '<span class="cc-donate__value">' + esc(m.value) + '</span>'       // як зараз
```

Порядок усередині картки не змінюється: `label` → значення/кнопка → `note`.
`type: "copy"` **не** отримує кнопки копіювання — це поведінка `js/config.js`, і
переносити її сюди в межах 006 не треба (не входить в обсяг).

**Клас** `.cc-donate__btn` у `css/claude-code.css` — одразу після `.cc-donate__link`
(`:725–731`), тими самими токенами, що і решта файла:

```css
.cc-donate__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--s-3);
  padding: 8px 16px;                       /* = px-4 py-2 еталона */
  border: var(--bw) solid var(--c-line);
  border-radius: var(--r-control);
  font-size: 0.875rem;                     /* = text-sm */
  color: var(--c-muted);
  text-decoration: none;
  transition: border-color var(--dur-hover) var(--e-out),
              color var(--dur-hover) var(--e-out);
}
.cc-donate__btn:hover { border-color: var(--c-accent); color: var(--c-sand); }
```

`.cc-donate__link` **лишається у файлі** — його ще може використати фолбек-гілка, якщо в
конфізі колись зʼявиться посилання без `type`.

### К6 · Футерні цілі 24 px

Клас — рівно `inline-flex min-h-[24px] items-center` (прецедент — `claude-code.html:328`,
`#coursesBtn` в `index.html:87`), додається **до наявних класів**, нічого не замінюючи.

| Файл | Елементи | Кількість |
| --- | --- | --- |
| `index.html:235–238` | 3 `<a>` + `#contactTrigger` | 4 |
| `architect.html:220–224` | 4 `<a>` + `#contactTrigger` | 5 |
| `roadmap.html:137–140` (питання 2) | 3 `<a>` + `#contactTrigger` | 4 |
| `js/claude-code-render.js:539–543` | шаблон `<a>` у `#footLinks` | скільки в конфізі |
| `js/claude-code-render.js:550–558` | шаблон `<a>` у `#footSourceLinks` | скільки в конфізі |

Наслідок, який треба назвати вголос: висота футерного списку росте на ~4 px на рядок
(≈16 px на колонку). Це **очікувана** видима зміна, а не дефект — саме її 004 свідомо
відклала. Секцію `.rm-entry` не чіпаємо.

### К7 · Пілюля прогресу (П-08)

**Розмітка** (обидві копії — `js/config.js:401–407` і `js/claude-code-render.js:162–168`):

```
LABEL = "Прогрес: "                                  // єдина константа на файл
count = doneCount + "/" + total                      // "3/12"
pill.innerHTML = '<span class="sr-only sm:not-sr-only">' + LABEL + '</span>' + count
```

(за питанням 1; альтернатива власника — `class="hidden sm:inline"`, решта контракту
не змінюється). `pill.textContent = …` більше не використовується; значення — лише числа
й слеш, тож екранування не потрібне, але `esc()` не завадить.

`navProgressText(doneCount, total)` лишається — його результат далі годує
`rememberNavProgress(text.length)` (`:407` / `:168`), тобто **в localStorage і далі
кешується довжина ПОВНОГО тексту** (13 або 14). Ключ і діапазон валідації
(`v >= 12 && v <= 24`) **не змінюються** — інакше кеш, залишений поточною версією в
браузерах, читався б неправильно.

**Резерв ширини** — `reserveNavProgress()` (`js/config.js:377–379`,
`js/claude-code-render.js:138–140`) ставить **дві** змінні:

```
pill.style.setProperty("--navprog-ch", String(chars));                    // як зараз
pill.style.setProperty("--navprog-short-ch", String(chars - LABEL.length)); // LABEL.length = 9
```

**CSS** `css/custom.css:2080–2085` — правило стає двома, mobile-first:

```css
#navProgress[data-reserved] {
  visibility: hidden;
  min-width: calc(var(--navprog-short-ch, 4) * 1ch + 1.5rem + 2px);
}
@media (min-width: 640px) {
  #navProgress[data-reserved] {
    min-width: calc(var(--navprog-ch, 13) * 1ch + 1.5rem + 2px);
  }
}
```

Перевірка арифметики: «Прогрес: 3/12» = 13 симв. → `--navprog-ch: 13`,
`--navprog-short-ch: 4`; видимий текст на 390 px — «3/12» = 4 симв. Резерв = ширині
фінальної пілюлі на **обох** брейкпоінтах, тобто механізм 004 «без зсуву» лишається точним.
`1ch` тут коректний: увесь текст пілюлі у `font-mono` (`class="… font-mono text-xs …"`),
що вже доведено виміром 14ch = 126,8 px ≈ 127 px (`css/custom.css:2070–2079`).

**Обидві копії правляться в одному коміті.** Розбіжність між ними — дефект.

Наслідок за межами лендінгів, який треба знати: `js/config.js` підключений і на 34 уроках
двох старих курсів, і на трьох довідниках, і на `certificate.html`. Отже, до 640 px пілюля
скрізь показуватиме «3/12». Це бажано (там і так тісно) і не суперечить рішенню власника 3.

### К8 · Доступність (П-02, П-09)

**`js/contact.js` (модалка, 4 сторінки):**

| Що | Де | Як |
| --- | --- | --- |
| роль і назва | `:137–141` | на `modalEl`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="ctTitle"`, `tabindex="-1"`; на `<h2>` (`:141`) — `id="ctTitle"` |
| памʼять фокуса | `openModal()` `:195` | модульна `lastFocused = document.activeElement` **до** показу |
| повернення фокуса | `closeModal()` `:205–214` | після `unlockScroll()`: `lastFocused && lastFocused.focus()`, далі `lastFocused = null` |
| пастка Tab | слухач `:169–171` | додати гілку: якщо модалка відкрита (`!modalEl.classList.contains("hidden")`) і `e.key === "Tab"` → `trap(e)` |
| `trap()` / `focusables()` | новий приватний код у `js/contact.js` | скопіювати з `js/auth-ui.js:498–525`, замінивши `stack[stack.length-1].el.firstElementChild` на `modalEl.firstElementChild` (картка `<div class="w-full max-w-md …">`) |

Escape уже працює (`:170`) — не переписувати. `#ctHp` має `tabindex="-1"` (`:153`) і в
`focusables()` не потрапляє — так і треба. `#contactTurnstile` може бути порожнім — список
фокусовних порожнім бути не може (там завжди є «Надіслати» і «✕»), але гілку
`if (!list.length)` з еталона все одно копіюємо.

**`certificate.html`:** один рядок `<a href="#main" class="skip-link">Перейти до вмісту</a>`
першим у `<body>` (перед `#ariaLive`, `:36`). `id="main"` (`:53`) і `#ariaLive` уже є.

**`verify.html`:**

| Що | Де | Як |
| --- | --- | --- |
| skip-link | перед `<header>` (`:36`) | `<a href="#main" class="skip-link">Перейти до вмісту</a>` |
| `#ariaLive` | одразу після skip-link | `<div id="ariaLive" class="sr-only" aria-live="polite"></div>` |
| `id="main"` | `<main>` `:46` | додати до наявних класів |
| оголошення результату | `#verifyResult` `:59` | `role="status" aria-live="polite" aria-atomic="true"` |

Еталон — `index.html:57–58`; стилі `.skip-link` уже є (`css/custom.css:8–24`), нічого
додавати не треба. `#ariaLive` на `verify.html` лишається порожнім (його ніхто не годує) —
це свідомо: він там для однаковості каркаса сторінок, а озвучення дає `role="status"`.

### К9 · П-01, шапка уроку

Одне правило в `css/custom.css`, поруч із блоком `.module-sidebar` (`:333–372`), з
коментарем «чому 820»:

```css
@media (min-width: 1024px) and (max-height: 820px) {
  body[data-module] > header {
    background-color: #141312;   /* = ink, непрозорий */
    backdrop-filter: none;
  }
}
```

- `#141312` — саме `ink` із `tailwind.config` (`index.html:29`, `modules/*.html:27`).
- Хук `body[data-module]` є в **57 із 57** файлів `modules/*.html`; `<header>` — прямий
  нащадок `<body>` (`:58`), тому `>` коректний.
- **Чому не `max-height` на `aside`:** `height` уже фіксована формулою
  `calc(100vh - 6rem)` (`css/custom.css:363`), і будь-яке зменшення дає той самий мінус.
- Лендінгів і довідників правило не чіпає — у них немає `data-module`.

### К10 · `roadmap.json`

| Шлях | Було | Стало |
| --- | --- | --- |
| `items[] → id: "a11y-improvements" → state` (`:135`) | `"progress"` | `"done"` |
| `meta.updated` (`:4`) | `"2026-09-04"` | **без змін** — поновиться з релізом (рішення власника 2026-09-06) |
| `meta.updatedLabel` (`:5`) | `"оновлено 4 вересня 2026"` | **без змін** |

`visual-refresh` лишається `progress`. Порядок пунктів у файлі **не міняти** (від
найстарішого до найновішого — рішення власника 003). Дата `Q-3 2026` у пункті вже є, тож
нова квартальна група не зʼявляється й нічого не згортається.

### К11 · `tg/DEPLOY_CHECKLIST.md` (текст пише бекендер, файл створює коренева сесія)

Підагенти `.md` не створюють — межа харнесу. Бекендер віддає **готовий текст файла**
фінальним повідомленням, дослівно, без «(тут опишіть…)».

Структура — рівно ті розділи, на які посилається `tg/GOING_LIVE.md`:

1. **Що це і чим відрізняється від `GOING_LIVE.md`** — той про хостинг і домен, цей про
   Supabase, файли й smoke-тест.
2. **Передумови** — проєкт Supabase, `config.json` із `supabase.url` + `anonKey`, доступ
   до Dashboard, Telegram-бот. **Жодного ключа в тексті** (правило №3 майстерні).
3. **Історія застосованих міграцій** (за `tg/CHANGELOG.md`, з датами й одним рядком «що
   зробила»): `002-lock-profiles-role` (2026-08-24) → `005-1-course-ai-terminal` (2026-09-03)
   → `005-2-module-titles` (2026-09-05) → `005-4-cleanup-qa-account` (2026-09-05).
   Окремо `tg/contact_messages.sql` (таблиця звернень).
4. **Порядок для чистої бази** — і **чесна помітка**, що базової схеми
   (`courses`, `modules`, `profiles`, `progress`, `quiz_attempts`, `certificates`,
   `enrollments`, RPC `submit_quiz`, `maybe_issue_certificate`, `verify_certificate`)
   у репозиторії **немає жодним файлом**: вона створювалась поза гітом. Це не «забули
   описати» — це реальна діра, і чеклист має її називати, а не приховувати.
   `005-3` і `005-4` — **разові чистки слідів QA**, у чисту базу не застосовуються.
5. **Edge Functions** — `tg/telegram_index.ts`, `tg/contact_index.ts`: деплой,
   `setWebhook` із `secret_token`, перевірка `getWebhookInfo`. Назви секретів — так,
   значення — ні.
6. **Smoke-сценарій** (порядок фіксований, кожен крок = один перевірюваний факт):
   вхід → `/index`, `/architect`, `/claude-code` показують пілюлю прогресу →
   проходження одного квіза → сертифікат після останнього модуля курсу →
   `/verify` за кодом → бот `/stats` → сповіщення про нову реєстрацію.
7. **Відкат** — що робити, якщо крок не пройшов; для DDL — блок `rollback` із самого файла
   міграції.
8. **Куди писати після застосування** — `tg/CHANGELOG.md`, це вимога кореневого `CLAUDE.md`.

Правило репозиторію: **вигадані значення** в прикладах, жодного реального email, коду
сертифіката чи імені учня.

### К12 · Leaked password protection (Supabase Auth, зона бекендера)

Рішення власника 2026-09-06: «супабейзом завжди займається бекендер» — перемикач у
Dashboard не є дією власника. Це **конфігурація auth, не DDL**: файл міграції не потрібен,
правило «DDL лише файлом + разовий дозвіл власника» не змінюється.

- **Де:** Supabase Dashboard → проєкт `hpcyrnxschpxlrxudmqk` → Authentication → Passwords →
  перемикач leaked password protection → увімкнути → Save. Шлях — `mcp__claude-in-chrome`
  у вже відкритій вкладці Dashboard; **нічого іншого на тому екрані не чіпати** (мінімальна
  довжина, вимоги до символів — як були).
- **Перевірка:** після Save перечитати екран (перемикач у стані «увімкнено»); через MCP
  `get_advisors` (security) — попередження про leaked password protection має зникнути
  (якщо advisor кешує стан — так і написати, не чекати).
- **Запис у `tg/CHANGELOG.md`** (зона бекендера за `dev/build/CLAUDE.md`): дата, що
  ввімкнено, як перевірено. Секретів і ключів у записі немає.
- **Ефект:** при реєстрації та зміні пароля GoTrue звіряє пароль зі списком скомпрометованих
  (HaveIBeenPwned, k-anonymity) і відхиляє збіг; наявних акаунтів не зачіпає. Тексти помилок
  у `js/auth-ui.js` фронтендер не змінює — повідомлення GoTrue показується як є.
- **Порядок:** останнім кроком бекендера, після коміту коду — щоб дія поза репозиторієм не
  змішувалась із кодом у звіті.

---

## Нарізка робіт

### Файл → зона (перевірено: перетинів нема **жодного**)

| Файл | Бекендер | Фронтендер | Коренева сесія (після QA) |
| --- | --- | --- | --- |
| `js/certificate.js` | ✅ | — | — |
| `js/auth.js` | ✅ | — | — |
| `js/verify.js` | ✅ | — | — |
| текст `tg/DEPLOY_CHECKLIST.md` | ✅ (тільки текст у звіт) | — | ✅ створює файл |
| `claude-code.config.json` | — | ✅ (`type`) | `site.version` / `site.updated` — лише з релізом, відкладено |
| `js/claude-code-render.js` | — | ✅ | — |
| `css/claude-code.css` | — | ✅ | — |
| `js/config.js` | — | ✅ | — |
| `js/contact.js` | — | ✅ | — |
| `css/custom.css` | — | ✅ | — |
| `index.html`, `architect.html`, `roadmap.html` | — | ✅ | — |
| `certificate.html`, `verify.html` | — | ✅ | — |
| `modules/module-07.html` | — | ✅ | — |
| `roadmap.json` | — | ✅ (лише `state`) | дати — з релізом, відкладено |
| `tg/CHANGELOG.md` | ✅ (запис К12) | — | запис релізу — з релізом, відкладено |
| Supabase Dashboard → Auth → Passwords (К12, поза репозиторієм) | ✅ | — | — |
| `config.json`, `architect.config.json` | — | — | версії — з релізом, відкладено |
| `CLAUDE.md`, `README.md`, `JOURNAL.md` | — | — | ✅ |

**Обидва виконавці комітять і пушать самі**, у `dev`, атомарними комітами формату
`006 fix: …` / `006 feat: …`. Спільних файлів немає, тому конфлікту при мержі бути не може;
перед кожним комітом — `git status` і `git add` **тільки своїх** файлів (побачив чуже —
не комітити, сказати).

⚠ **`js/certificate.js` (бекендер) і `certificate.html` (фронтендер) — різні файли, але одна
сторінка.** Порядок не важливий: skip-link і мапа бренду одне одного не бачать.
`js/verify.js` (бекендер) і `verify.html` (фронтендер) — так само.

### Бекенд (`aia-build-backend`)

1. **Звірити слаги з живою базою.** `select slug, title from courses order by sort_order`
   через Supabase MCP. Не піднявся MCP — Dashboard через Chrome, **тільки читання**.
   Не вдалося жодним шляхом — так і написати у звіті, а мапу зібрати з фолбеком і
   `claude-code` (єдиний слаг, доведений кодом). Гадати заборонено.
2. **`js/certificate.js` — К1.** Мапа + `brandOf()` + шість підстановок (таблиця К1).
   `medallion()` → `medallion(b)`. Нічого з PDF-механіки 005 не чіпати.
3. **`js/certificate.js` — К2.** Мемоїзація `load()`.
4. **`js/certificate.js` — перевірка стабом.** Перед комітом прогнати `buildCertNode()` /
   `buildTranscriptNode()` з вигаданим об'єктом на кожен слаг (див. критерій 1) і
   переконатись, що бренд і посилання правильні. Реального сертифіката для цього не треба.
5. **`js/auth.js` — К3.** Самолікування імені. `currentName()` і два `dispatchEvent`
   не чіпати.
6. **`js/verify.js` — К4.** Нормалізація + підказка.
7. **Текст `tg/DEPLOY_CHECKLIST.md` — К11**, у фінальне повідомлення дослівно.
8. **К12 — leaked password protection.** Після коміту коду: Chrome → Dashboard →
   Authentication → Passwords → увімкнути → перевірити → запис у `tg/CHANGELOG.md`
   (окремий коміт `006 db: …`). Єдина дія 006 поза репозиторієм.
9. **Звіт** — фінальним повідомленням (`.md` не створювати): що зроблено, слаги з бази
   (або чому не вдалося), стан leaked password protection (увімкнено / не вдалося і чому),
   що НЕ робив і чому, ризики, що перевіряти QA найжорсткіше.

### Фронтенд (`aia-build-frontend`)

1. **К5 — кнопка банки:** `claude-code.config.json` (три `type`), рендер
   `js/claude-code-render.js:517–528`, клас `.cc-donate__btn` у `css/claude-code.css`.
2. **К6 — футерні цілі:** `index.html`, `architect.html`, `roadmap.html` (питання 2),
   два шаблони у `js/claude-code-render.js`.
3. **К7 — пілюля:** `js/config.js` + `js/claude-code-render.js` (**синхронно, один коміт**)
   + `css/custom.css:2080–2085`.
4. **К9 — П-01:** одне медіа-правило в `css/custom.css`.
5. **К8 — П-02:** `js/contact.js` (роль, назва, памʼять і повернення фокуса, `trap`).
6. **К8 — П-09:** `certificate.html` (skip-link), `verify.html` (skip-link, `#ariaLive`,
   `id="main"`, `role=status`).
7. **`modules/module-07.html` — спершу заміряти, потім лагодити.** Порядок обов'язковий:
   відкрити сторінку на 390 px, зібрати всі елементи з
   `getBoundingClientRect().right > innerWidth` **без** фільтра предків з `overflow-x`,
   назвати винуватця у звіті числом — і лише тоді правити, **локально в цьому HTML**
   (кандидати: дві таблиці `:226` і `:386`, дві `.diagram` зі SVG `:149`, `:271`).
   Спільний `css/custom.css` для цього не чіпати: у 005 уже було, що причину назвали
   неправильно на 5 сторінках із 14, і глобальне правило лікувало б не те.
8. **К10 — `roadmap.json`.** Одне поле — `state`; дати не чіпати. `js/roadmap-render.js`
   **не відкривати взагалі**.
9. **Звіт** — фінальним повідомленням: що зроблено, замір module-07 із числами, чи
   `sm:not-sr-only` справді згенерувався Tailwind CDN (перевірити в браузері, не на око),
   що НЕ робив і чому.

### Порядок і залежності

- **Бекенд і фронтенд — повністю паралельно.** Спільних файлів нуль, спільних станів нуль;
  контракт вище описує обидві половини `/verify` і `/certificate` так, що кожна працює
  окремо.
- **Усередині фронтенда послідовність одна:** замір `module-07` **до** його фіксу.
- **Усередині бекенда:** слаги з бази **до** написання мапи.
- **QA — після того, як обидва запушили в `dev`** і Cloudflare підняв превʼю (~1 хв).
  Власник **уже залогінений** тестовим акаунтом у Chrome (2026-09-06) — QA працює в тій
  самій сесії браузера, не реєструється й не вводить паролів. Без прогресу в акаунті частина
  критеріїв не перевіряється — QA спершу дивиться, який прогрес є, і пише це у звіт.
- **Коренева сесія — після зеленого QA:** `tg/DEPLOY_CHECKLIST.md` з тексту бекендера,
  `CLAUDE.md`, індекс, журнал, чистка сліду тестового акаунта (як `005-4`). **Версії,
  `site.updated`, запис релізу в CHANGELOG і дати роадмапу — відкладено** до окремого
  рішення власника про мерж.

---

## Стани і крайні випадки

**`/certificate`**
- гість → `renderLoggedOut()`, мережевого запиту немає, `loadedFor` порожній;
- вхід у вкладці без перезавантаження → рівно один `GET certificates`;
- вихід і вхід іншим акаунтом у тій самій вкладці → дані перечитуються (скидання `loadedFor`);
- помилка запиту → повідомлення як зараз **і** можливість повтору на наступному `aia:auth`;
- сертифікатів 0 → `renderEmpty()`, фолбек-бренд;
- сертифікатів 3 з трьох різних курсів → три картки, у кожної **свій** бренд і своє
  посилання на програму;
- `courses` = `null` (запис без курсу) → фолбек, без винятку в консолі;
- невідомий слаг → фолбек + один `console.warn`;
- дуже довге ім'я в сертифікаті → поведінка PDF не змінюється (ми не чіпаємо верстку аркуша).

**`/verify`**
- порожній рядок, лише пробіли → «Введи код сертифіката», без запиту;
- код із кириличними `а/с/е` → знайдено + підказка;
- код у ВЕРХНЬОМУ регістрі → знайдено, без підказки лише якщо інших змін не було
  (регістр — теж зміна, тож підказка зʼявиться: це чесно й не заважає);
- код із пробілом посередині (копіювання з PDF) → пробіл прибирається;
- сміття → `invalidCard` з нормалізованим кодом;
- офлайн → «Не вдалося перевірити. Спробуй пізніше.»;
- вхід через `?code=` в URL → той самий шлях;
- скрінрідер → результат оголошується через `role="status"`.

**Шапка й пілюля**
- гість → пілюлі немає, резерву немає (`hasAuthToken()`);
- перший візит із прогресом → резерву немає (кеша ще немає), пілюля зʼявляється після
  гідратації — як зараз;
- 390 px, «Прогрес: 23/23» → видно «23/23», назва курсу в один рядок;
- 640 px рівно → межа `sm`, показується повний текст;
- прогрес 0 після гідратації → пілюля ховається, кеш чиститься — як зараз;
- прогрес не приїхав узагалі → резерв знімається через `NAVPROG_MAX_WAIT` = 8 с;
- приватний режим (localStorage недоступний) → без резерву, без винятків.

**Модалка «Написати нам»**
- відкриття з футера → фокус на `#ctName`, Tab не виходить за межі картки;
- Esc → закриття + фокус назад на `#contactTrigger`;
- клік по підложці → те саме;
- подвійне закриття (Esc + клік) → захист уже є (`:207–209`), фокус повертається один раз;
- відкриття з чотирьох різних сторінок → однаково (файл один);
- `prefers-reduced-motion` → модалка анімацій не має, поведінка не змінюється.

**Уроки**
- 1440×653 → шапка непрозора, сайдбар за нею;
- 1440×900 → blur як був;
- 1024×820 рівно → правило вже діє (межа включна) — так і задумано;
- 768 і 390 → правило не діє (сайдбар — шторка, не sticky).

**Спільне**
- дуже довгий український текст: `AI Термінал` — найдовша назва курсу з трьох, саме на ній
  міряти шапку на 390;
- подвійний клік по «Завантажити PDF» → поведінка не змінюється (кнопка блокується
  на час, `:345`);
- `prefers-reduced-motion` → 006 не додає жодної анімації;
- клавіатура й видимий фокус → skip-link має бути **першим** у Tab на `/verify`
  і `/certificate`.

---

## Критерії приймання

Перевіряються на dev-превʼю `https://dev-ai-academy.andriy-puhalsky.workers.dev`
(автотестів у проєкті немає). Матриця ширин: **1440**, **768**, **390**; стани: **гість**
і **залогінений із прогресом** (вкладку дає власник). Кожен критерій сформульований так,
щоб два різні агенти дійшли однакового висновку.

### А. Бренд сертифіката (П-10)

1. У консолі на `/certificate` виклик
   `buildCertNode({courses:{title:"AI Термінал",slug:"claude-code"},full_name:"Тест Тестенко",public_code:"a1b2c3d4e5f6",issued_at:"2026-09-06"}, "")`
   повертає вузол, у якому: кружечок медальйона = `AIT`, капс-рядок = `AI ТЕРМІНАЛ`,
   підпис видавця = `AI Термінал`.
2. Той самий виклик зі слагом AI Академії дає `AIA` / `AI АКАДЕМІЯ` / `AI Академія`,
   зі слагом AI Architect — `AIA` / `AI ARCHITECT` / `AI Architect`.
3. `buildTranscriptNode(<той самий об'єкт>, [])` дає шапку `AI ТЕРМІНАЛ · ДОДАТОК`.
4. Виклик зі слагом `"неіснуючий"` дає бренд AI Академії і рівно один `console.warn`;
   винятку немає, вузол побудований.
5. Виклик з `courses: null` не кидає винятку.
6. Картка сертифіката (`certCard`) містить посилання «До програми курсу →», і його `href`
   для `claude-code` = `claude-code.html#map`, для AI Академії/Architect = `…#syllabus`.
7. Жодне посилання, побудоване з даних сертифіката курсу X, не веде на лендінг курсу Y.

### Б. Запити й дані (П-12, П-11)

8. Завантаження `/certificate` залогіненим дає рівно **один** запит
   `GET …/rest/v1/certificates?select=…` (вкладка Network, фільтр `certificates`).
9. Після виходу і повторного входу в тій самій вкладці запит зʼявляється **ще раз**
   (кеш не залипає).
10. Гість на `/certificate`: запитів до `certificates` — нуль, показано запрошення увійти.
11. Консоль на `/certificate` без необроблених винятків у всіх трьох станах (гість,
    залогінений, після виходу).

### В. Пілюля прогресу (П-08)

12. На 390 px пілюля показує рівно `3/12` (числа за акаунтом), слова «Прогрес:» не видно;
    у дереві доступності елемент читається як «Прогрес: 3/12» (за дефолтом питання 1;
    при варіанті `hidden` — просто «3/12»).
13. На 1440 px пілюля показує `Прогрес: 3/12`.
14. На 390 px назва курсу в шапці — **в один рядок**:
    `document.querySelector('header a[href="#top"]').getBoundingClientRect().height` ≤ 32.
15. Резерв дорівнює фінальній ширині: при повторному завантаженні (кеш уже є) ширина
    `#navProgress[data-reserved]` = ширині пілюлі після гідратації, ± 1 px, **окремо
    на 1440 і на 390**.
16. Те саме однаково на `/index`, `/architect` і `/claude-code` (дві копії коду не
    розʼїхались).
17. На сторінці уроку (`/modules/claude-code-01`) на 390 px пілюля теж показує лише числа,
    шапка 65 px, горизонтального скролу немає.
18. Гість: `#navProgress` прихований, `data-reserved` немає — на всіх трьох ширинах.

### Г. Кнопка банки

19. `/claude-code#donate`: картка «Банка monobank» має кнопку **«Відкрити ↗»**, а не
    текстовий URL.
20. У кнопки `href` = адреса банки з конфіга, `target="_blank"`,
    `rel="noopener noreferrer"`.
21. Картки «ФОП» і «Tether (USDT)» виглядають і поводяться **точно як до змін**
    (значення текстом, `note` на місці).
22. `label` і `note` банки не змінились.
23. На 390 / 768 / 1440 сітка донатів не ламається, кнопка не виїжджає за картку.
24. Клавіатурою: кнопка отримує видимий фокус і відкривається Enter.

### Ґ. Футерні цілі 24 px

25. У футерах `/index`, `/architect` і `/claude-code` **кожне** посилання й
    `#contactTrigger` мають `getBoundingClientRect().height` ≥ 24.
26. Те саме на `/roadmap` (за дефолтом питання 2).
27. Порядок, підписи й адреси футерних посилань не змінились на жодній сторінці.
28. Блок `.rm-entry` («План розвитку») виглядає як до змін.

### Д. Доступність (П-02, П-09)

29. `/verify`: перший Tab із адресного рядка дає видимий skip-link; Enter переносить фокус
    у `<main id="main">`.
30. `/verify`: `document.querySelectorAll('#verifyResult[role="status"]').length === 1`,
    атрибути `aria-live="polite"` і `aria-atomic="true"` присутні.
31. `/verify`: після перевірки коду результат оголошується (у дереві доступності зʼявляється
    live-регіон із текстом картки).
32. `/certificate`: перший Tab дає skip-link, `#main` існує, фокус переходить.
33. Модалка «Написати нам»:
    `document.querySelectorAll('[role="dialog"][aria-modal="true"]').length === 1` після
    відкриття.
34. Модалка: `aria-labelledby="ctTitle"` вказує на `<h2>` з текстом «Написати нам».
35. Модалка: Tab по колу не виходить за межі картки (обійти всі елементи двічі),
    Shift+Tab із першого елемента веде на останній.
36. Модалка: Esc закриває, фокус повертається **на `#contactTrigger`**, з якого відкривали.
37. Те саме працює на всіх чотирьох сторінках із `js/contact.js`.

### Е. Шапка уроку (П-01)

38. 1440×653 на `/modules/module-01`, `/modules/architect-01`, `/modules/claude-code-01`:
    прокрутка в самий низ — сайдбар **за** шапкою, текст «← На головну» крізь шапку не
    просвічує.
39. 1440×900 на тих самих трьох: шапка напівпрозора з blur, як була
    (`getComputedStyle(header).backdropFilter !== "none"`).
40. 390×844 і 768×1024: правило не діє, вигляд без змін.
41. Лендінги й довідники на 1440×653 не змінились (правило не зачепило сторінки без
    `data-module`).

### Є. `/verify` і омогліфи

42. Ввід `a1b2c3d4е5f6` (шоста літера — кирилична `е`) відправляє в payload RPC
    `p_code` **з латинською `e`** (перевірити тіло запиту у Network).
43. Ввід із пробілом усередині коду відправляє код без пробілу.
44. Ввід у верхньому регістрі відправляє нижній.
45. Якщо код було нормалізовано і сертифікат знайдено — під карткою видно підказку про
    кириличні літери з виправленим кодом.
46. Якщо нічого не змінилось — підказки немає.
47. Неіснуючий код → картка «Сертифікат не знайдено» з **нормалізованим** кодом; консоль
    без винятків.

### Ж. `module-07` і роадмап

48. `/modules/module-07` на 390 px **у розблокованому стані** (гостю `js/module.js` ховає
    вміст, і замір дає хибний нуль): `document.documentElement.scrollWidth === 390`;
    елементів із `right > innerWidth` — нуль **після відкидання тих, чий предок з
    `overflow-x: auto` їх підрізає** (фікс — обгортка таблиці, як на 9 сторінках 005;
    сирий обхід дає 11, як `claude-code-03` дає 5 — це не дефект).
49. Той самий урок на 768 і 1440: вигляд без змін, таблиці й діаграми на місці.
50. `/roadmap`: «Зробити курси зручнішими для всіх» у секції «Зроблено».
51. `/roadmap`: лічильники секцій перерахувались і збігаються з кількістю карток.
52. `/roadmap`: рядок «оновлено …» **не змінився** («оновлено 4 вересня 2026») — дати
    `roadmap.json` не чіпаються до релізу (рішення власника 2026-09-06); змінена дата —
    дефект.
53. `/roadmap`: жодна група кварталу не згорнулась і порядок пунктів не змінився.

### З. Регресії й гігієна

54. Консоль **без помилок і необроблених винятків** на: `/`, `/architect`, `/claude-code`,
    `/roadmap`, `/verify`, `/certificate`, `/modules/module-01`, `/modules/module-07`,
    `/modules/architect-01`, `/modules/claude-code-01` — у гостя і залогіненим.
55. Жоден `alert()` не спрацював за весь прогін (у коді їх три: `js/progress.js:77`,
    `js/certificate.js:339`, `:390`).
56. Вхід і вихід працюють як раніше; ім'я в шапці показується (К3 нічого не зламало).
57. Завантаження PDF **не перевіряється видачею нового сертифіката** (сертифікатів у базі 0,
    видавати заради тесту не треба) — бренд доведено критеріями 1–5 через стаб.
58. `git status` після роботи обох агентів: у дереві немає чужих незакомічених змін;
    `git diff --stat` не містить рядків `Bin`.
59. Регістр шляхів: жодного нового посилання з великою літерою (перевірити `grep` по
    доданих рядках; на превʼю — `/CSS/`, `/JS/` дають 404, як і раніше).
60. Leaked password protection (К12): **не ввімкнено** — функція лише від плану Pro, проєкт
    Free (звіт бекендера, запис `17436e9` у `tg/CHANGELOG.md`). Критерій закривається
    записом у CHANGELOG, не станом перемикача; рішення про Pro — власника. QA **не**
    заходить у Dashboard і **не** реєструється.

### Що QA **не** оформлює дефектом

- **Поріг квіза не є воротами** (`p_score = 100` завжди, поріг 70/85 у базі не працює) —
  рішення власника 4, окрема задача.
- **Правильна відповідь = найдовший варіант** — задача 007, іде паралельно.
- **Три пастки `js/roadmap-render.js`** (`dropped` сортує «Зроблено» у зворотному порядку;
  `sectionEmptyProgress` бере `byState.done[0]`; історія з `gi >= 2`) — свідомо не
  лагодяться.
- **Розсинхрон дат у футерах** (`site.updated` у трьох конфігах ≠ `meta.updated` у
  `roadmap.json`) — до релізу нормально, а реліз відкладений; вирівнює коренева сесія,
  коли власник вирішить мержити.
- **`/config.json` тягнеться двічі** на сторінках із `contact.js` (П-03 із 005) — поза
  обсягом 006.
- **Контраст неактивних пунктів сайдбара 2.40:1** (П-04 із 005) — поза обсягом.
- **Футер став вищим на ~16 px** — очікуваний наслідок К6, а не регресія.
- **Зміна `p_code` у payload** — це і є фікс К4, а не «клієнт підмінив ввід».

Знайдене поза обсягом іде в розділ «Знайдене поза обсягом» звіту, як у 005, — без
повернення в цикл фіксів.

---

## Ризики

| # | Ризик | Ціна | Як перевірити заздалегідь |
| --- | --- | --- | --- |
| Р-1 | **Слаги курсів у базі не такі, як думаємо.** З коду доведено лише `claude-code`; `ai-essentials` — згадка в коментарі, слаг AI Architect невідомий. | Випускники двох старих курсів мовчки отримують фолбек-бренд — тобто П-10 «закрито», але не працює для 2/3 курсів. | Перший крок бекендера: `select slug, title from courses` через MCP. Немає MCP — Dashboard очима. Не вдалося — **прямо написати у звіті**, а не підставити правдоподібне. |
| Р-2 | **`sm:not-sr-only` (або `sm:inline`) не згенерується Tailwind CDN**, бо клас приходить із JS і статичного вживання в репозиторії немає. | На 640+ px слово «Прогрес:» зникне назавжди — тихий дефект, який побачить лише той, хто дивиться на десктоп із прогресом. | Фронтендер перевіряє в браузері одразу після правки: `getComputedStyle(labelSpan).position` на 1440 має бути `static`, на 390 — `absolute`. Прецеденти динамічних `sm:`-класів є (`js/config.js:201`, `:213`), тож ризик малий, але перевірка коштує хвилину. |
| Р-3 | **Резерв ширини розʼїдеться з видимою пілюлею** (механізм 004 «без зсуву»). | Повертається CLS 0,00258, який 004 прибирала. | Критерій 15 — міряти на **обох** брейкпоінтах, не на одному. Арифметика: `--navprog-short-ch` = `--navprog-ch` − 9. |
| Р-4 | **Дві копії коду пілюлі розійдуться** (`js/config.js` vs `js/claude-code-render.js`). | Різна шапка на сусідніх курсах — класичний дефект «полагодили на одному лендінгу». | Критерій 16 + правило «обидві копії в одному коміті»; `grep -n 'sr-only sm:not-sr-only' js/config.js js/claude-code-render.js` має дати два входження. |
| Р-5 | **К3 додає ще один `aia:auth` за сесію** (через `USER_UPDATED`). | Теоретично — зайві перемальовування або зайвий запит. | Слухач у репозиторії рівно один (`js/certificate.js:399`) і після К2 мережею не ходить: критерій 8 ловить це прямо. |
| Р-6 | **К3 запише порожнє або чуже ім'я в метадані.** | Ім'я в шапці «зникне» до перезавантаження. | Умова К3 вимагає непорожній `profileName`; писати тільки `profiles → metadata`, ніколи навпаки. Критерій 56. |
| Р-7 | **Причину +3 px на `module-07` визначать неправильно.** У 005 це вже сталося: QA назвав таблиці, а на 5 сторінках із 14 розпирали нерозривні рядки в інлайновому `<code>`. | Фікс «не туди», дефект лишається, а в HTML зʼявляється мертве правило. | Порядок «замір → число у звіті → фікс» обов'язковий; обхід **без** фільтра предків з `overflow-x`. |
| Р-8 | **Правило П-01 зачепить не ті сторінки.** | Непрозора шапка там, де вона задумана прозорою. | Селектор прибитий до `body[data-module] > header`; критерії 40–41. `grep -l 'data-module=' modules/*.html \| wc -l` = 57 із 57 — перевірено 2026-09-06. |
| Р-9 | **Пастка фокуса в `js/contact.js` зламає модалку на одній із чотирьох сторінок** (напр. на `/roadmap`, де живе GSAP і свій скрол-лок). | Модалка перестане закриватись або зʼїсть фокус сторінки. | Критерій 37 — перевіряти на **всіх чотирьох**, а не на одній. |
| Р-10 | **Регістр шляхів** (macOS не чутлива, Cloudflare чутливий) — уже ламало прод. | Стилі або скрипт не вантажаться у проді при живому локальному вигляді. | 006 нових файлів не створює взагалі, але критерій 59 лишається. |
| Р-11 | **Превʼю пише в продову базу.** Окремої dev-бази немає (рішення власника 2026-08-23). | Тестові рядки в живих `profiles`/`progress`. | 006 сценаріїв із записом майже не має (сертифікат не видаємо, критерій 57). Слід тестового акаунта після QA прибирається як `005-4`: файл-чистку пише бекендер, застосування — за разовим дозволом власника. |
| Р-12 | **Палітра продубльована в 38 HTML** — якщо комусь захочеться «токен для непрозорої шапки». | 38 однакових правок і розсинхрон. | У К9 навмисно **літерал** `#141312` в одному CSS-правилі, а не новий токен. |
| Р-13 | **`tg/DEPLOY_CHECKLIST.md` опише неіснуючий порядок**, бо базової схеми в репозиторії немає. | Документ, яким не можна скористатись, — гірший за його відсутність. | К11 п. 4 вимагає назвати діру прямо. Бекендер звіряє список міграцій із `tg/CHANGELOG.md`, а не з памʼяті. |
| Р-14 | **007 стартує на `modules/*.html`, поки фронтендер ще править `module-07`.** | Конфлікт у гіті на єдиному спільному файлі двох задач. | 007 бере `module-07` в **останню** партію і стартує лише після того, як код 006 закомічений (порядок із `00-root-plan.md`). |

---

## Що передати далі

**Бекендеру.**
Головне в задачі — не мапа бренду, а **чесність про слаги**: усе інше в П-10 механічне,
а неправильний ключ мапи дасть тихий фолбек, який ніхто не помітить, поки випускник
AI Architect не завантажить PDF із чужим підписом. Спершу база, потім код. Друге за
важливістю — **не зачепити PDF-механіку 005**: `verifyLinkAreas()`, `JPEG_QUALITY`,
`makeQr()`, порядок сторінок полагоджені в третьому колі QA 005, і будь-яка «дрібна
причісування по дорозі» тут коштує дорожче за фічу. У К2 прапорець `loadedFor` ставиться
**до** мережевого запиту — інакше він від подвоєння не рятує взагалі. У К3 писати можна
тільки в напрямку `profiles → metadata` і тільки непорожнє. Звіт — фінальним
повідомленням, `.md` не створювати; текст `DEPLOY_CHECKLIST.md` — дослівно, разом із
чесним абзацом про відсутню базову схему. Leaked password protection (К12) — **останнім**
кроком, після коміту коду: це перемикач у Dashboard, не міграція, і він потребує запису в
CHANGELOG так само, як міграція.

**Фронтендеру.**
Дві речі, на яких тут найлегше спіткнутися. Перша — **дві дослівні копії коду пілюлі**
(`js/config.js` і `js/claude-code-render.js`): правка однієї без другої виглядає як
працююча, поки не відкриєш сусідній курс. Друга — **резерв ширини**: `--navprog-ch`
лишається повним, зʼявляється `--navprog-short-ch` = повний − 9, і CSS вибирає потрібний
за брейкпоінтом; якщо переплутати, повернеться CLS, який 004 прибирала. Із `module-07`
не поспішати: спершу замір із числами у звіт, потім фікс, і **тільки локально в тому
HTML** — у 005 причину горизонтального скролу назвали неправильно на 5 сторінках із 14.
`js/roadmap-render.js` не відкривати взагалі: у ньому три відомі пастки, і всі три свідомо
живі. Перевір у браузері, що `sm:not-sr-only` реально згенерувався — це перший такий клас
у проєкті.

**Тестувальнику.**
Найжорсткіше — три місця. **(1) Пілюля**: міряти резерв і фінальну ширину **на обох**
брейкпоінтах і на **всіх трьох** лендінгах; саме тут найімовірніше розʼїдуться дві копії
коду. **(2) Модалка «Написати нам»**: перевіряти на **чотирьох** сторінках
(`index`, `architect`, `claude-code`, `roadmap`), а не на одній — файл спільний, оточення
різні, і на `/roadmap` поруч живе GSAP. **(3) Омогліфи**: єдиний надійний доказ — тіло
запиту в Network (`p_code` латиницею), а не вигляд поля вводу. Бренд сертифіката
перевіряється **стабом у консолі**, сертифікат заради тесту не видавати: у `certificates`
немає політики DELETE, виданий рядок прибирається лише окремою міграцією. Тестова вкладка вже
залогінена власником — агенти не реєструються й не вводять паролів. І окремо: список
«що не оформлюється дефектом» вище — читати до початку прогону, щоб не витратити коло
на поріг квіза й довжину варіантів відповідей.
