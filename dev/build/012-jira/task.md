# 012 — Jira з нуля: четвертий курс (Jira Cloud Free для новачків не з ІТ)

## Блок 1 — заповнює власник

- **Статус:** **в роботі — програма й контент-каркас до дизайну** (з 2026-09-17, вечір).
  Заборона «код не чіпати до `дизайн готовий`» звужена до `css/`, `js/`, `jira.html` і 13 точок
  спільного коду (розділ Б); тексти, `jira.config.json`, сторінки уроків і довідників — дозволені.
  **Хвиля 1 авторів завершена 2026-09-17:** `modules/jira-01…03.html` + `01-authoring/reports/`, чекер
  0 ✗; далі — рецензент ×3, дозняття екранів, вхідні від власника, передача брифа в дизайн
- **Заведено:** 2026-09-17
- **Платформа:** новий четвертий блок **«Jira з нуля»** (окремий конфіг `jira.config.json`,
  слаг `jira`, коди модулів `j01…j23`, слот акценту `data-course="jira"`)
- **Дизайн:** `dev/design/012-jira/SUMMARY.md` — **ще немає**; потік А, три речі: акцент +
  монограма сертифіката, компонент «вікно застосунку» (6 станів), лендінг `jira.html`
- **Програма — `00-research/program.md` (джерело правди з 2026-09-17)**, поруч `facts-free-plan.md`,
  `glossary.md`, `inventory.md`, `screens/` (20 знімків sandbox); контракт авторингу —
  `01-authoring/lesson-contract.md` + `facts-map.md` + `check-lessons.py` + `cross-findings.md`;
  `jira.config.json` у корені (status `draft`). `dev/jira-course-plan.local.md` — історичний ескіз
  і приватні дані sandbox (адреса, стан, доступи) — у git не потрапляє

### ТЗ

Зробити четвертий курс за зразком «AI Термінал» (005): **Jira Cloud на безкоштовному плані
для людини з нуля і не з ІТ** — маркетинг, бухгалтерія, будівництво, HR, особисті справи, до
10 людей. 22 уроки + фінальний іспит + три довідники поза прогресом (JQL · автоматизація ·
карта інтерфейсу з глосарієм EN→UA і лімітами Free), лендінг з власним характером, сертифікат
за наявною схемою. Людина після курсу сама заводить сайт, налаштовує спейс своєї команди,
workflow, автоматизацію і service desk. **Головна вимога — стійкість до змін Jira:** курс на
поняттях, що не змінюються роками, схематичні «вікна» замість скріншотів, усе летюче — в одному
довіднику, щоб підтримка коштувала годину на сезонний реліз Atlassian.

### Чого точно НЕ робити

- **Не починати код до `дизайн готовий`.** Правило проєкту: змінюється те, що бачить користувач →
  спершу макет. Паралельно з дизайном дозволені лише тексти: програма, контракт уроку, чернетка
  міграції як файл у `02-backend/db/`.
- **Жодних скріншотів Jira** — ні в уроках, ні в довідниках, ні «тимчасово». Вікна — HTML із токенів.
- **Не копіювати look and feel Atlassian** і не брати Atlassian-синій за акцент (trademark
  guidelines забороняють відтворення їхнього вигляду; назви — fair use).
- **Не називати в уроках чисел лімітів** (10 користувачів, 150 кроків автоматизації тощо) —
  лише в довіднику 3 з датою перевірки. Модель лімітів автоматизації змінюється (runs → steps,
  білінг з 2026-12-03).
- **Не робити третю копію `#navProgress`** (`js/claude-code-render.js:109-204` уже дублює
  `js/config.js:336-415`) — PM вирішує, як перевикористати.
- **Не рефакторити «реєстр курсів»** (чотири паралельні таблиці: `css/tokens.css` `[data-course]`,
  `js/certificate.js` `BRANDS`, `certificate.html` `MAP`, `js/roadmap-render.js` `COURSES` + 8
  ручних пунктів меню) — дописати п'ятий рядок усюди; рефакторинг — окрема ідея після релізу.
- **Не залежати від сторонніх Marketplace-застосунків** у жодному уроці (Smart Checklist — лише
  приклад у j17).
- **Не чіпати** `js/module.js`, `js/progress.js`, `js/quiz.js`, `js/auth.js`, `js/verify.js`,
  `verify.html`, `js/tw-theme.js`, `tg/telegram_index.ts`, `.assetsignore`, `wrangler.toml`,
  `is_admin()`, `maybe_issue_certificate`, `admin_user_report` — вони курс-агностичні.
- Агенти **не реєструють акаунтів і не вводять паролів** (межа інструменту): sandbox-сайт Jira
  Free і тестовий акаунт AIA заводить власник, агент продовжує в його Chrome-сесії.

### Рішення власника 2026-09-17

1. **Візуалізація — схематичні «вікна застосунку», нуль скріншотів.** Компонент product-agnostic
   (робочий префікс `win`, остаточне ім'я — за реєстром §7.0 системи 009, рішення дизайн-сесії),
   шість станів: `board` · `list` · `item` · `form` · `settings` · `portal`; мітки ① ② ③
   (`aria-hidden`) + легенда `<ol>`; датований заголовок («Jira Cloud · … · звірено РРРР-ММ-ДД»);
   в уроках без руху, рух — лише hero лендінга.
2. **Сюжет — одна невелика фірма з відділами** (робоча назва — кав'ярня-пекарня «Кориця», ~8 людей):
   маркетинг · бухгалтерія (JSM) · ремонт другої точки · найм · сайт (Scrum) · справи власника.
3. **Назва «Jira з нуля», слаг `jira`:** `jira.html`, `jira.config.json`, `modules/jira-01…23.html`,
   `jira-ref-{jql,automation,map}.html`, коди `j01…j23`, `data-course="jira"`. URL потім не міняти.
4. **Лендінг власний, як у Термінала** (bespoke: `css/jira.css`, `js/jira-render.js`,
   `js/jira-motion.js`), не шаблон `js/config.js`.
5. **Спочатку дизайн.** Обидві задачі 012 заведені одного дня, як у 005; build чекає.
6. **Термінологія:** поточна + колишня в дужках при першій згадці — work item (issue), space (project),
   work type (issue type); у JQL / smart values — старі слова. **Англійський UI** (української мови
   інтерфейсу в Jira Cloud немає), українські пояснення.
7. **Позиціонування:** блок «курс від Atlassian Community Champion» на лендінгу (посилання й текст
   дасть власник); дисклеймер у конфізі: «Незалежний освітній матеріал. Не створений, не
   спонсорований і не схвалений Atlassian. Jira, Atlassian, Confluence — торгові марки
   Atlassian Pty Ltd.»
8. **j22 «Jira + Claude Code через MCP» — у програмі:** Rovo MCP Server доступний на Free
   (500 викликів/год, `https://mcp.atlassian.com/v2/mcp`), місток до `claude-code-18`.
   Rovo-функції в UI на Free немає — не описувати як доступне.
9. **Автоперевірка домашок через REST API — не в v1.** Сертифікат за квізами, як у трьох курсах.
10. **Порядок робіт (2026-09-17, вечір): програма → контент і каркас → дизайн з повним входом →
    білд як чисте перенесення.** Скасовує п. 5. Причина — урок 005: дизайн ішов раніше за програму,
    білд знаходив компоненти, яких макет не мав. До дизайну готові: `program.md`, контракт,
    `jira.config.json`, уроки `j01`–`j03`, `inventory.md`; решта 19 уроків і довідники пишуться
    паралельно з дизайном за тим самим контрактом (вікна — тимчасова семантична розмітка; імена
    класів фіксує дизайн, білд робить sed-пас).
11. **Сюжет «Кориця» і 8 ролей — запропоновані сесією, власник править** (розділ 3 програми, одна
    правка). **j13 і j16 — оглядово.** Числа лімітів в уроках — лише 10 користувачів і 3 агенти.
12. **Sandbox:** живий сайт Jira Cloud Free власника (адреса — лише в `.local.md`); JSM і
    Confluence ще не додані; наповнення під сюжет через Atlassian MCP — після одноразового
    дозволу власника; конектор `claude.ai Atlassian` у папці `AIA` вимкнений — вмикає власник
    через `/mcp`.

---

## Вхід для PM — що не можна упустити (звірено з репозиторієм 2026-09-17)

### А. Нові файли
| Файл | Зразок / зауваження |
|---|---|
| `jira.config.json` | форма `claude-code.config.json` (16 ключів: `_`, `site`, `announcement`, `links`, `nav`, `hero`, `audience`, `outcomes`, `map`, `tracks`, `modules`, `references`, `lessonShape`, `certificate`, `donations`, `footer`); `tracks[]` **без `count`**; `modules[]` з `id/number/track/slug/title/status/durationMin`, іспит `kind:"exam"` + `text`/`meta`; `site.home = "jira.html"`, `site.trackWord`, `site.disclaimer`; `announcement.enabled: false` (бюджет hero 653 px) |
| `jira.html` | `<html lang="uk" data-config="jira.config.json" data-course="jira" data-density="landing" data-lit>`; порядок CSS `tokens → components → jira → Tailwind` |
| `css/jira.css`, `js/jira-render.js`, `js/jira-motion.js` | за `css/claude-code.css` (сторінковий префікс свій, не `cc-`; пастка колізії `--rail-w`, `css/tokens.css:106`), `js/claude-code-render.js`, `js/claude-code-motion.js`; рух через `AIA.motion` (`js/motion.js` — єдиний власник спостерігача появи; чіпляти **після** рендера, не на `DOMContentLoaded`) |
| `modules/jira-01…23.html` | база — `modules/claude-code-01.html`; у кожному файлі змінюються рівно 4 речі: `<body data-module="jNN">`, `<title>` + `description`, вміст `<article>`, `#quizData`. `<html … data-config="../jira.config.json" data-course="jira" data-density="lesson" data-lit>`. Порядок скриптів обов'язковий: `motion → progress → ui → config → module → quiz → mermaid@10.9.1 → mermaid-theme → mermaid-init → auth-ui → auth (module)` |
| `jira-ref-jql.html`, `jira-ref-automation.html`, `jira-ref-map.html` | еталон `claude-code-ref-commands.html`: `.ds-ref` грід, `<details id="refToc" class="ds-ref__toc" open>`, `data-own-title`, без `module.js`/`quiz.js`, пошуку немає свідомо (`Cmd+F` + зміст + зрізи); таблиці лише в `.ds-tbl__wrap[tabindex="0" role="region" aria-label]`; **перша колонка `.ds-tbl` має `white-space: nowrap`** — туди лише ідентифікатори, не речення (дефект 2026-09-09) |
| `02-backend/db/012-1-course-jira.sql` | за `005-ai-terminal/02-backend/db/005-1-course-ai-terminal.sql`: (1) `insert into courses (slug='jira', title='Jira з нуля', is_paid=false, price_uah, description, sort_order=4)` — **`is_paid=false` обов'язково**, тригер зарахування нових профілів фільтрує за ним; (2) `insert into modules (course_id, code, number, slug, title, passing_score, sort_order)` для `j01…j23`, `passing_score` 70 / іспит 85, `sort_order` 0, `title` = точно з конфіга (інакше потрібна `012-2`, як `005-2`); (3) `do $$` перевірка **глобальної** унікальності кодів (`UNIQUE(course_id, code)` у БД не глобальний, а `js/auth.js:174-186` будує `AIA_MODULE_MAP` без фільтра за курсом); (4) backfill `enrollments` для всіх `profiles`; (5) 8 контрольних `select`; (6) блок відкату із запобіжником. `maybe_issue_certificate` / `admin_user_report` **не перевизначати**. Застосовує власник; запис у `tg/CHANGELOG.md` за форматом 2026-09-03 |
| `01-authoring/check-lessons.py` | копія `005-ai-terminal/01-authoring/check-lessons.py`, **параметризована** (`--prefix j`, `--config ../jira.config.json`, `--pattern modules/jira-*.html`, `ROOT` відносний — зараз абсолютний `/Users/ander1.sage/Downloads/AIA`); замість перевірок `.term` (2–5 блоків, заборона `term--enter`/`term--hero`) — перевірки вікна: 1–5 на урок (іспит 0), `role="group"` + `aria-labelledby`, мітки ↔ легенда, дата у заголовку, жодного `<img>` усередині; `.term` дозволений для JQL |
| `01-authoring/lesson-contract.md` | адаптація контракту 005 (`005-ai-terminal/01-authoring/lesson-contract.md`, 9 розділів): §0.1 принципи стійкості (з `dev/jira-course-plan.local.md`), §4 → розмітка вікна (з `dev/design/012-jira/SUMMARY.md`), `term` лишається для JQL/smart values, §5 Mermaid `stateDiagram` для workflow, §6 квіз без змін, §7 джерела: живі докси Atlassian через WebFetch (посилання на **розділи** `support.atlassian.com/jira-software-cloud/docs/`, `jira-cloud-administration/docs/`, `cloud-automation/docs/`, `jira-service-management-cloud/docs/`, `developer.atlassian.com/cloud/jira/platform/` — slug-и застарівають) + sandbox-сайт через Chrome MCP + `00-research/screens/*.md`; **пам'ять моделі джерелом не є** |
| `00-research/program.md`, `facts-free-plan.md`, `glossary.md`, `screens/*.md` | з `dev/jira-course-plan.local.md`; `screens/` — текстові описи ~10 екранів sandbox (аналог `screens/*.txt` у 005), знімає коренева сесія в Chrome власника |
| `maintenance.md` | протокол після релізу: після кожного сезонного релізу Atlassian (весна/травень · літо/серпень · осінь/жовтень–листопад) — довідник 3, ~10 вікон, термінологія, дати в заголовках; sandbox тримати живим (деактивація за неактивність); стежити «Atlassian Projects» на Free і ліміти автоматизації після 2026-12-03 |

### Б. Правки спільного коду — 13 точок
| Файл:рядки | Що |
|---|---|
| `css/tokens.css:179-192` | 4 примітиви `--p-accent-jira-500 / -600 / -edge / -quiet` (значення з дизайну; `-edge` ≥ 4.5:1 на `#F9F3E7`, ≥ 3:1 як межа) |
| `css/tokens.css:690-696` | новий блок `[data-course="jira"]` — **рівно 5 імен** (`--c-accent`, `-hover`, `-quiet`, `-edge`, `--c-on-accent`); шосте = дефект, тест T5 |
| `css/components.css` | секція компонента «вікно» (єдине місце; його вантажать уроки й довідники); L3-токени `--<comp>-*` |
| `js/certificate.js:42-58` | `BRANDS["jira"]` — 7 полів (`brand`, `brandCaps`, `mono`, `home`, `program`, `accent`, `accentDeep`), акцент **хекс-літералами** (аркуш офскрин, `data-course` не діє); ключ = `courses.slug` |
| `certificate.html:59-67` і `:69-74` | запис у `MAP` (ключ = `?from=`) + гілка детекту referrer (порядок перевірок критичний — `claude-code` першим, зафіксовано коментарем; `jira` додати поруч, не в кінець) |
| `js/roadmap-render.js:248-252` і `:254-256` | рядок у `COURSES` (`course`, `brand`, `home`, `back`) + гілка referrer у тому ж порядку, що в `certificate.html` |
| `roadmap.json` | `copy.backJira`; `platformLabels` — додати `jira` **і відсутній `terminal`** (латентний `undefined` у `roadmap-render.js:500` — закрити по дорозі); `pageTitle` (`:7`) і `lead` (`:12`) «три платформи» → «чотири»; новий пункт `{"state":"progress"→"done", "platform":"both", …}` |
| `roadmap.html:12, 17-18` | `<title>` + `og:title`/`og:description` |
| `index.html:80-82, 113-116` · `architect.html:74-76, 106-108` · `claude-code.html:86-88, 117-119` · `jira.html` | дропдаун «Курси» — **8 місць** (4 файли × десктоп + `#mobileMenu`); `aria-current="page"` у своєму; текст пункту — рішення власника (handoff `dev/design/handoff/2026-09-03-nav-courses-dropdown.md`) |
| `sitemap.xml` | +27 `<url>` (лендінг, 23 уроки, 3 довідники) канонічно **без `.html`** (`https://ai-academia.com.ua/jira`, `…/modules/jira-01`, `…/jira-ref-jql`); `lastmod` = дата релізу у **всіх** 92; `/certificate` не включати |
| `dev/build/007-quiz-distractors/check-quiz.py:30-36` | кортеж `("jira-", …)` у `COURSES`; `EXAM` → підтримати два іспити (`claude-code-23.html`, `jira-23.html`) |
| `CLAUDE.md`, `tg/CHANGELOG.md`, `dev/ideas.local.md`, `dev/build/README.md`, `dev/build/JOURNAL.md` | записи за форматом 2026-09-03 (міграція) / 2026-09-05 (реліз: «Нове в роздачі сайту», версії, sitemap) |

### В. Конвеєр реалізації
1. **PM** (`aia-build-pm`) → `01-plan.md` + контракт даних (конфіг, коди, `BRANDS`, `MAP`, `COURSES`,
   sitemap, критерії приймання, як у 005 — 63 критерії).
2. **Бекендер ∥ фронтендер.** Бекендер: міграція, `BRANDS`, `MAP`, `COURSES`, `roadmap.json`,
   `check-quiz.py`. Фронтендер: слот акценту, компонент у `components.css` **точно за макетом**
   (столяр, не дизайнер), `jira.html` + `css/jira.css` + рендерер + motion, `modules/jira-01.html`
   як база-скелет, каркаси трьох довідників, дропдаун ×8, `sitemap.xml`.
3. **Авторинг** (`aia-content-author`, один агент = одна сторінка): хвилі **j01–j03 еталон → показ
   власнику →** j04–j08 → j09–j13 → j14–j17 → j18–j23 + 3 довідники. Кожен факт — з джерелом
   (URL + дата) або з sandbox; звіт агента: джерела, що описано словами замість екрана, чого не
   знайшов підтвердження, знахідки для сусідів (`cross-findings.md`).
4. **Рецензент** (`aia-content-reviewer`) — **обов'язково на всіх 26 сторінках** (у 005 не
   запускався, довелось робити 008: 26/26 «готово з зауваженнями», ~60 фактичних правок).
   Власник-Champion сам вичитує j01–j04 і довідник 3.
5. **Квіз-редактор** (`aia-quiz-editor`) партіями по 5–6; `check-quiz.py --verify`.
6. **QA** (`aia-build-qa`), 2–3 кола на dev-превʼю, метод «власний Chrome по CDP»
   (`dev/build/.claude/agent-memory/aia-build-qa/method_cdp_own_chrome.md`): 1440/768/390,
   reduced-motion, CLS, замок гостя (`#aiaGate` — ширини нульові до відповіді Supabase),
   копіювання JQL байт-у-байт, повний прохід j01→j23→сертифікат тестовим акаунтом (заводить
   власник; слід у БД прибирає власник каскадом з `auth.users`, як `005-4`), PDF в акценті `jira`
   і QR, `/verify` з кодом, регресія трьох живих курсів.
7. **Реліз:** версія курсу `1.0.0`, трьом іншим патч (дропдаун); `site.updated` ×4; `roadmap.json`
   `meta.updated` + пункт `done`; `sitemap.xml` `lastmod` ×92; `tg/CHANGELOG.md`; `CLAUDE.md`.
   Мерж `git merge --no-ff dev` **лише після явного «так» власника**; перевірка прода за протоколом
   2026-09-05/08: версії з живого домену, усі адреси sitemap → 200 (`curl -sL`, без `-L` Workers
   віддає 307), приватне → 404, регістрові пастки → 404, хеші файлів = репозиторій.

### Г. Передумови від власника (до авторингу, не до дизайну)
- sandbox-сайт Jira Cloud Free (+ JSM Free, + Confluence Free), логін у Chrome, назва сайту;
- назва фірми-сюжету і ~8 людей з ролями («Кориця»?);
- посилання на профіль Champion і текст блоку «автор»;
- монограма сертифіката (`AIJ`? `JZN`?) — або віддати дизайну;
- глибина j13 (Scrum/Kanban) і j16 (Confluence) — оглядово чи практикум;
- текст пункту в дропдауні «Курси»;
- **(з 2026-09-17, вечір)** додати на sandbox **JSM Free** і **Confluence Free**, запросити 2–3
  тестові адреси; поставити мову акаунта **English** до створення спейсів сюжету; увімкнути
  конектор `claude.ai Atlassian` (`/mcp`) і дати разовий дозвіл «в sandbox пиши вільно» — або
  наповнити сюжет самому за розділом «Траєкторія учня» програми.

---

## Блок 2 — заповнює PM-агент (`01-plan.md`), тут лише посилання

- **План:** `01-plan.md` — ще немає
- **Що піде в бекенд:** `02-backend/report.md` — ще немає
- **Що піде у фронтенд:** `03-frontend/report.md` — ще немає
- **Вердикт тестування:** `04-qa/report.md` — ще немає
