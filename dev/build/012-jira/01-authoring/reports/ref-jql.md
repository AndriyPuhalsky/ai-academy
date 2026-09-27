# Звіт: довідник «JQL: поля, оператори, функції» (`jira-ref-jql.html`)

**Дата:** 2026-09-27. **Автор:** `aia-content-author`. **Записано два файли:**
`/Users/ander1.sage/Downloads/AIA/jira-ref-jql.html` і цей звіт. Git не виконувався.

---

## 1. Файл і структура

**`/Users/ander1.sage/Downloads/AIA/jira-ref-jql.html`** — 169 582 байти (≈ 166 КБ), 2 743 рядки,
9 258 слів прози, **28 таблиць `.ds-tbl`** (усі в `.ds-tbl__wrap` з `tabindex="0" role="region"
aria-label`), **26 блоків `term term--cmd`** з кнопкою «Копіювати» (1 анатомія + 25 запитів),
**104 унікальні `id`**, 30 внутрішніх анкорів — усі ведуть на існуючі цілі.

Каркас перенесений з `claude-code-ref-commands.html` без змін у порядку: `<head>` (шрифти →
`tokens.css` → `components.css` → Tailwind CDN → `js/tw-theme.js`), `ds-skip`, `#ariaLive`,
`<noscript>`, шапка з `#navProgress`, `#configError`, `.ds-ref` + статичний `<details id="refToc">`
з одним рядком JS (згортання нижче 1024 px), `ds-ref__head` з `ds-ref__stat`, `article.ds-prose`,
`ds-ftr--short`, п'ять скриптів (без `module.js`, `quiz.js`, Mermaid). Курсове: `data-config="jira.config.json"`,
`data-course="jira"`, бренд `AIJ` / «Jira з нуля» → `jira.html`, крихта «Довідник», посилання
«Полиця довідників» → `jira.html#refs`, `#configError` про `jira.config.json`.

**Розділи (порядок відрізняється від запропонованого в промпті — обґрунтування нижче):**

| # | `id` | Про що |
| - | ---- | ------ |
| 1 | `how` | як користуватись, що в колонках, **чого тут немає** (числа плану → довідник-карта; тригери й дії → довідник автоматизації) |
| 2 | `anatomy` | одна умова = поле + оператор + значення; чотири частини таблицею; дужки |
| 3 | `old-words` | **чому в запиті `project`**: банер Atlassian цілком + слід автозаміни `spaceJira` |
| 4 | `fields` → `f-core`, `f-dates`, `f-text`, `f-hier`, `f-space`, `f-service`, `f-custom`, `f-status` | поля за задачами; окремим блоком — статус / категорія / `resolution` у трьох типах спейсів |
| 5 | `ops`, `ops-history`, `keywords`, `quotes` | 17 операторів, предикати `WAS`/`CHANGED`, 6 ключових слів, лапки й зарезервовані слова |
| 6 | `functions` → `fn-dates`, `fn-rel`, `fn-people`, `fn-lists`, `fn-sla` | функції; відносні дати окремо від функцій |
| 7 | `queries` | **25 запитів «Марципану»** вісьмома групами, кожен у своєму `term` |
| 8 | `errors`, `fix-error`, `basic`, `limits`, `speed` | таблиця помилок, `Fix error`, Basic ↔ JQL і bounded/unbounded, межі мови, швидкість |
| 9 | `filters` → `filters-save`, `filters-system`, `filters-access`, `filters-sub`, `filters-view` | збережений фільтр, 9 системних, доступ, підписка й cron, **другий вид фільтра** |
| 10 | `where`, `askai` | вісім місць, де живе той самий рядок; `Ask AI` |
| 11 | `renames`, `sources` | що змінилось у назвах; джерела, дати й чесна межа |

**Чим відрізняюсь від запропонованої структури і чому:**

1. **«Поля» стоять перед «операторами»** (у промпті — так само), але **всередині полів я не робив
   одної великої таблиці на 60 рядків**: сім тематичних таблиць + окремий розділ «Статус, категорія
   і Resolution». Причина — читач приходить із задачею («як питати про дедлайн»), а не з літерою.
2. **«Відносні дати» розведені з функціями** (`fn-rel` окремо від `fn-dates`): це різні речі
   (значення проти функції), і плутанина між ними — джерело помилки «без лапок = мілісекунди».
3. **Додано три розділи, яких у плані не було:** `limits` («межі самої мови» — 7 чисел, кожне з
   цитатою; вони не про план, тому лишились тут), `speed` (три поради `jql-optimization-recommendations` —
   без них довідник радить писати запити, які гальмують дошку) і `basic` (Basic ↔ JQL + bounded/unbounded —
   обіцянка уроку 7, яку не було куди покласти).
4. **`Ask AI` — підрозділ «де живе запит»**, а не окремий розділ: він не місце, де JQL живе, а
   спосіб його отримати.
5. **Mermaid немає свідомо**: у довідниках курсу 005 діаграм немає, скрипти Mermaid на сторінку не
   підключені; анатомія запиту показана `term`-блоком і таблицею.

---

## 2. Джерела (URL + дата + що взято)

### 2.1 Живі сторінки довідки Atlassian — усі прочитані **2026-09-27** методом `curl -sL` → `<main>` без `<nav>` (`docs-text.py`)

| URL | Що взято |
| --- | -------- |
| `support.atlassian.com/jira-software-cloud/docs/jql-fields/` | **усі поля**: `project` (⚠ `Syntax: spaceJira`), `type`/`workType`, `status`, `assignee`, `reporter`, `creator`, `priority`, `labels`, `attachments`, `watcher`, `watchers`, `votes`, `category`, `due`, `created`, `updated`, `resolved`, `lastViewed`, `summary`, `description`, `comment`, `text`, `textfields`, `environment`, `parent`, `parentSpace`, `sprint`, `workItemLink`, `hierarchyLevel`, `spaceType`, `"Request Type"`, SLA, `approvals`, `request-channel-type`, `resolution`, `key`/`workItemKey`, Custom field; переліки supported/unsupported operators; формати дат; «It's not possible to compare two fields in JQL» |
| `…/docs/jql-operators/` | 17 операторів дослівно, предикати `AFTER/BEFORE/BY/DURING/ON/FROM/TO`, «This operator can be used with the Assignee, Fix Version, Priority, Reporter, Resolution, and Status fields only», межа 10 000 змін, `issueKey` у прикладах, банер про перейменування |
| `…/docs/jql-keywords/` | `AND OR NOT EMPTY NULL ORDER BY`, «This requirement needs to be placed at the end…», `not (reporter = jsmith or reporter = jbrown)`, `assignee != null` |
| `…/docs/jql-functions/` | функції дат (+ правило зсуву `(+/-)nn(y\|M\|w\|d\|h\|m)`), `currentUser()`, `membersOf()`, `updatedBy()`, спринти, `standardWorkTypes()`/`subtaskWorkTypes()`, `linkedWorkItems()`, `watchedWorkItems()`, `votedWorkItems()`, `workItemHistory()`, 8 функцій SLA, «by default, the first day is Sunday», «considers Saturday to be the last day of the week», `endOfWeek("+1d")` = Sunday |
| `…/docs/what-is-advanced-search-in-jira-cloud/` | визначення поля/оператора/значення/функції/ключового слова, дужки й порядок обчислення, спецсимволи, **195 зарезервованих слів**, bounded/unbounded, чому запит не переводиться в Basic, підказка «first 15 matches», де побачити помилку, два шляхи `Fix error` + рядок про плани Rovo |
| `…/docs/search-for-work-items-using-the-text-field/` | стемінг («customize» → «custom»), точна фраза `"\"full screen\""`, зірочка, зникле `?`/`^`, зарезервовані (stop) слова й приклад «VSX will crash» |
| `…/docs/jql-optimization-recommendations/` | три поради швидкості + приклад `space in (TIS, PMO) OR assignee in (A, B)`, «the label field needs to reference multiple data sets» |
| `…/docs/what-is-a-saved-search/` | кроки збереження («Select Save as…»), «By default, when you create a filter, it'll be starred», **нове речення про team-managed sidebar**, 9 системних фільтрів, `Viewed recently` перемикає в JQL |
| `…/docs/manage-filters/` | таблиця доступів `Private` / `Users-Group-Space-Roles` / `My organization`, «Any filter that is shared is visible to users who have the Administer Jira global permission», підписка + `currentUser()` для отримувача, cron (поля, приклад `0 15 8 ? JAN MON 2014`) |
| `…/docs/save-your-filters-in-business-projects/` | **фільтр вигляду**: «specific to the space you create them in», «only apply one at a time», «you can only edit the name» (банер «This page is for business spaces») |
| `…/docs/configure-filters/` | «you can create a board using filters based on a JQL query» |
| `…/docs/search-and-find-your-issues/` | «Any user can search for work items, although they will only see results from projects where they can view issues» |
| `…/docs/use-atlassian-intelligence-to-search-for-work-items/` | «Rovo in Jira can translate what you type into a Jira Query Language (JQL) code…», `Go (⏎)`, перемикання в JQL, рядок про плани |
| `…/docs/save-your-search-as-a-filter/` | хаб розділу (прочитаний, цитат не брав) |
| `support.atlassian.com/jira-cloud-administration/docs/configure-the-user-default-settings/` | **`Default access`** дослівно |
| `support.atlassian.com/jira-service-management-cloud/docs/write-jql-queries-for-slas/` | визначення восьми SLA-функцій, `elapsed()` (якого немає на сторінці функцій), підказка «To exclude breached items…», **і `project = Test` у власному прикладі довідки** |
| `support.atlassian.com/cloud-automation/docs/jira-automation-triggers/` | тригер `Scheduled`: «You can also choose to enter a JQL query. If you do…» |
| `support.atlassian.com/cloud-automation/docs/jira-automation-conditions/` | умова `JQL`: «Checks to see if an issue matches a specified JQL query», обидва застереження про `Validate query` |
| `support.atlassian.com/cloud-automation/docs/jira-automation-actions/` | `Lookup work items`: «Search for up to 100 work items using a JQL query» |
| `support.atlassian.com/atlassian-ai-gateway/docs/supported-tools/` | `searchJiraIssuesUsingJql` («Search Jira work items using JQL»), `listJiraFilters` («…returning IDs and JQL»), група `search_jira` |

### 2.2 Дві статті бази знань (обидві з банером **«Platform Notice: Cloud Only»**, без позначки «generated by AI» — перевірено `grep` по сирому HTML)

- `support.atlassian.com/jira/kb/how-to-search-using-statuscategory-statuscategorychangeddate-function-with-jql/`
  (оновлено 25 вересня 2025) — `statusCategory` і `statusCategoryChangedDate`: три категорії
  «ToDo, Inprogress, and Done», оператори, приклад `StatusCategory in ("To Do","In Progress")`.
  **Це єдине джерело про `statusCategory`: на `jql-fields` його немає взагалі** (перевірив пошуком —
  одне входження, і то в розділі `Resolution`).
- `support.atlassian.com/jira/kb/set-resolution-field-for-team-managed-project-jira-issues/`
  (оновлено 26 вересня 2025) — «When using a Team Managed project, you don't have the option to
  manually set or view the Resolution field on those project types».

### 2.3 `screens/*.md` і `facts-free-plan.md`

- `screens/15-search-jql.md` (2026-09-17) — сторінка `All work`, рядок `Basic` / `JQL`, дослівний
  текст помилки «The value 'Done' does not exist for the field 'status'.» + `Fix error`, живий
  запит `project = KAN AND status != Done ORDER BY created DESC`.
- `screens/16-filters-dashboards.md` (2026-09-17) — сторінки `Filters` і `Dashboards` (використано
  для формулювань про список фільтрів).
- `screens/26-sandbox-2026-09-24.md` — **чотири закриті наживо факти:** кирилична мітка в JQL
  (`labels = "архів"` → 1 of 1; `labels != "архів" OR labels IS EMPTY` → 2 of 2; **голе
  `labels != "архів"` → 0**), текст помилки `labels ==` дослівно, панель `Fix error` (`Suggested
  query labels IS NOT EMPTY`, `Accept`, «Uses AI. Verify results.»), `Ask AI` на Free
  (український запит → `statusCategory = "In Progress"`), налаштування гаджета `Filter Results`
  (поле `Saved Filter*`, спейс/ключ → «No Matches»).
- `screens/04-list.md` (2026-09-17) — колонка `Resolution` = `Unresolved` у роботі зі статусом
  `Готово`: це **екранний доказ** рядка таблиці про team-managed.
- `facts-free-plan.md` — брав звідти лише те, що вже звірене (рядок про `Filter Results`,
  «AI-кнопки на Free працюють»); **жодного числа плану на сторінку не переносив**.

### 2.4 Чинні тексти уроків

`modules/jira-07.html` (дім JQL), `jira-08`, `jira-14`, `jira-15`, `jira-19`, `jira-20`, `jira-21`,
`jira-22` — звідки взяті дослівні запити курсу (перевірено `grep`-ом по HTML, не по зліпках).
Посилання в довіднику стоять на 15 уроків, усі файли існують.

**Метод перевірки цитат:** з готової сторінки витягнуто **131 цитату з латиницею** (регулярним
виразом по `«…»`), нормалізовано пробіли й типографські лапки, прогнано `in` по корпусу з 26
збережених сторінок довідки + усіх `screens/*.md`. **131 із 131 знайдено, 0 розбіжностей.**
Регістр не понижувався.

---

## 3. Обіцянки уроків і сусідів → де закрито

### 3.1 З `ref-promises.md` (розділ `jira-ref-jql.html`, 2 згадки)

| Обіцянка | Де закрито |
| -------- | ---------- |
| j07 вступ: «вичерпних таблиць усіх полів, операторів і функцій» | `#f-core` … `#f-custom` (7 таблиць полів), `#ops` (17), `#fn-dates` … `#fn-sla` (5 таблиць функцій) |
| j07 `#l3`: «повний перелік [операторів] — у довіднику» | `#ops` — 17 операторів із прикладами й обмеженнями + `#ops-history` (предикати) |

### 3.2 З `cross-findings.md` (рядки «→ довідник 1» / «→ довідник «JQL…»»)

| Обіцянка (хто знайшов) | Де закрито |
| ---------------------- | ---------- |
| зарезервовані слова (автор j07, рецензент j07) | `#quotes` — правило + ~25 найчастіших слів + зворотний бік у текстовому пошуку |
| bounded / unbounded (автор j07) | `#basic`, таблиця з обома прикладами довідки |
| коли запит не переводиться назад у Basic (автор j07) | `#basic`, п'ять випадків + правило згори |
| `WAS`/`CHANGED` з предикатами, «currently have **or** previously had», лише кілька полів (автор і рецензент j07) | `#ops-history` — визначення, ⚠ «Тільки шість полів» із дослівним переліком, таблиця предикатів |
| системні фільтри (автор j07) | `#filters-system` — усі дев'ять + чому `Viewed recently` перемикає режим |
| cron підписок (автор j07) | `#filters-sub` — порядок полів і приклад довідки |
| `Default access` керує доступом **нових** фільтрів (автор j08, рецензент j07) | `#filters-access` — цитата + пряме «це не константа мови, а настройка» |
| `spaceType` (`business`/`software`/`service_desk`), `Parent space` (автор j09) | `#f-space` (+ ⚠ про автозаміну), `#f-hier` (`parentSpace`) |
| `resolution` у трьох типах спейсів — **одна таблиця** (автор іспиту j23) | `#f-status` — три рядки, три джерела, плюс ⚠ про суперечність двох сторінок довідки |
| `type` / alias `workType`, відсутність `issuetype` (рецензент j04) | `#f-core` (рядок `type` / `workType`), `#renames` (attested старі форми `issueKey`, `duedate`), ⚠ у `#sources` |
| Custom field: `CustomFieldName`, `cf[ID]`, текстовий пошук лише для Text, `~`/`WAS`/`CHANGED` не для чисел і дат (автор j11) | `#f-custom` — два записи, пошук за номером варіанта, таблиця операторів за типом, ⚠ про кириличні назви |
| `endOfWeek()` і субота, `endOfWeek("+1d")` = неділя (рецензент j15) | `#fn-dates` — обидві цитати в рядку функції |
| `Sprint` / `openSprints()` — **дім тут** (рішення кореневої сесії 2026-09-18) | `#f-hier` (поле) + `#fn-lists` (`openSprints`, `closedSprints`, `futureSprints`) + запит № 18 |
| другий вид фільтра в ділових спейсах (автор j13) | `#filters-view` — таблиця «збережений запит проти фільтра вигляду» на чотири ознаки |
| SLA: поле «Used in service spaces only», вісім функцій, `"Request Type"` лише `= != IN NOT IN` (автор j19) | `#f-service` + `#fn-sla` |
| дослівні визначення SLA-функцій живуть на `write-jql-queries-for-slas` (рецензент j19) | `#fn-sla`, підпис під таблицею називає сторінку |
| `searchJiraIssuesUsingJql` (автор j22) | `#where`, рядок «сервер MCP» (+ `listJiraFilters`) |
| «a work item is resolved when statusCategory = Done» **подавати з контекстом** (рецензент j10) | `#f-status` — після цитати окремим реченням сказано, що вона написана в розділі про службові team-managed спейси |
| пастка «`!=` губить роботи з порожнім полем» (коренева сесія 2026-09-20, автор j23) | `#errors` рядок 3 (з живим доказом «0 із 3») + `#ops` у графі «Про що пам'ятати» |
| `statusCategory` у розкладі flow (автор j23) | `#errors` рядок 9 (опора — урок 15) |
| «новий фільтр приватний» — не константа (`open-claims` 🟡 j07:642) | `#filters-access` |
| `WAS` — формулювання «колись мало» неточне (`open-claims` 🟡 j07:375) | `#ops-history`, перший абзац |
| `Fix error` на Free (`open-claims` 🟡 j07:906) | `#fix-error` — закрито наживо, з поясненням, чому підказку треба читати |
| `what-is-a-saved-search` переписана: фільтри в бічній панелі team-managed (`open-claims` §8 п. 4) | `#filters-save`, ⚠-плашка з цитатою |
| «довідник подає обидва імені `project` / `space`» (наскрізне хвилі 2) | `#old-words` + `#renames` |

---

## 4. Що свідомо не ввійшло

1. **Числа лімітів плану — жодного.** Ліміт листа підписки (200), ліміт експорту, «до 5 000 робіт
   на дошці», кроки автоматизації, кошик дашбордів 60 днів — усі відіслані фразою «число з датою
   перевірки шукай у довіднику «Карта інтерфейсу, глосарій і ліміти Free»». Таких відсилань на
   сторінці три; довідник-карта названий **лише назвою, без `href`** (файла ще немає).
2. **Поля, які на Free не мають сенсу або тягнуть платні фічі:** `affectedVersion`, `fixVersion`,
   `component`, `originalEstimate`, `remainingEstimate`, `timeSpent`, `workRatio`, `worklogDate`,
   `worklogComment`, `level`, `organization`, `journey*` (шість полів «Journey»),
   `change-gating-type`, `request-last-activity-time`, `epic link`, `filter`, `voter`,
   `workItemLinkType`. Причина: читач курсу — команда до десяти людей у ділових спейсах без
   версій, компонентів і облікування часу; кожне таке поле — окремий рядок, який нічого не
   закриває. **`voter` названий у переліку полів, де працює `currentUser()`.**
3. **Функції, які вимагають платних фіч або адмінських сутностей:** `componentsLeadByUser()`,
   `releasedVersions()`, `unreleasedVersions()`, `latestReleasedVersion()`,
   `earliestUnreleasedVersion()`, `cascadeOption()`, `choiceOption()`, `spacesLeadByUser()`,
   `spacesWhereUserHasPermission()`, `spacesWhereUserHasRole()`, `parentEpic`,
   `workItemsWithRemoteLinksByGlobalId()`, `organizationMembers()`, `entitlement*`,
   `customerDetail()`, шість функцій погоджень (крім `pending()` у прикладі).
   ⚠ Окремо: **`spacesLeadByUser()` і сусіди — це вже переписані імена на зіпсованій сторінці**;
   радити їх без живої перевірки я не став.
4. **`jql-developer-status`, `jql-design-search`, `jql-vulnerability-search`,
   `search-for-custom-fields-from-plans-in-jql`, `example-jql-queries-for-board-filters`** — не
   читав як джерело: перші три про інтеграції розробки, четверта про Premium-плани, п'ята — про
   company-managed дошки, яких у сюжеті немає.
5. **Приклад `space="NAME" and originalEstimate > 1m`** (знахідка автора j13 — «єдиний живий
   приклад, де докси пишуть `space`») не вжитий: замість нього в `#keywords` стоїть простіший і
   перевірений сьогодні `space = JRA` зі сторінки ключових слів. Сам факт «докси вже пишуть
   `space`» подано в `#old-words` і `#renames`.
6. **Рецепт «заповнити `Resolution` через flow»** свідомо віддано сусідньому довіднику (там він уже
   є, `#r1`); у мене — одне речення з посиланням, щоб не було двох версій одного рецепта.

---

## 5. Чого не знайшов підтвердження (⚠) і що зняти наживо

**У тексті все це позначене ⚠ або словами «живим екраном не звірене».**

| # | Твердження / ім'я | Стан | Що зробити на sandbox (по одному запиту в поле `All work`) |
| - | ----------------- | ---- | --------------------------------------------------------- |
| 1 | `spaceType = "business"` | ⚠ ім'я з нового словника на сторінці, де автозаміна вже зіпсувала `project` → `spaceJira` | набрати `spaceType = "business"`; якщо помилка — спробувати `projectType` і записати, що саме приймається |
| 2 | `parentSpace = "REM"` | те саме | набрати на будь-якому спейсі з епіком |
| 3 | `type = Task`, `type IN standardWorkTypes()`, `subtaskWorkTypes()` | ⚠ `type` живцем не набирали; `issuetype` теж (хвіст із хвилі 2, уроки j04/j07) | три запити; заразом подивитись, що пропонує автопідказка на «t» |
| 4 | `key = MARK-1`, `workItemKey`, `issueKey` | ⚠ у доксах живі два написання | `key = KAN-1`, потім `issueKey = KAN-1`, потім `workItemKey = KAN-1` |
| 5 | `linkedWorkItems()`, `watchedWorkItems()`, `votedWorkItems()`, `workItemHistory()` | ⚠ переписані імена | `key IN watchedWorkItems()` — найдешевший з чотирьох |
| 6 | `textfields ~ "…"` | ⚠ поле-близнюк `text`, живцем не набирали | один запит |
| 7 | `statusCategoryChangedDate <= -7d` | ⚠ живе лише в KB, і приклад там **без лапок** | один запит; якщо без лапок дає дивне — записати |
| 8 | `approvals` проти `approval` | ⚠ довідка сама собі суперечить (Syntax проти всіх прикладів) | `approval = pending()` у **службовому** спейсі — після додавання JSM |
| 9 | Поля службового спейсу: `"Request Type"`, `"Time to resolution"`, `"Time to first response"`, `request-channel-type`, регістр назви годинника | ⚠ JSM на sandbox немає | після додавання JSM — чотири запити в `FIN`; заразом зафіксувати, як **точно** підписаний годинник на екрані (велика чи мала літера) |
| 10 | Кириличні **назви власних полів** (`"Посада" = "Бариста"`) | ⚠ хвіст уроку 11 | після створення поля в `HR` — один запит + той самий через `cf[ID]` |
| 11 | Поле `Category` ділових спейсів у JQL | ⚠ як зветься в запиті — не знає ніхто (у доксах `category` = категорія **спейсу**) | після створення ділового спейсу — набрати `Category` і подивитись, що покаже автопідказка |
| 12 | `hierarchyLevel = "0"` | ⚠ поле не вживається в курсі | один запит (необов'язково) |

**Публічних сторінок, які «малює браузер», у цьому проході не траплялось** — усі 26 сторінок
віддали тіло статті через `curl`. Прохання кореневій сесії щодо headless Chrome немає.

**Що я не міг перевірити за конструкцією:** нічого, крім живих запитів (агент не має браузера) —
усі пункти таблиці закриваються одним поглядом власника в поле пошуку.

---

## 6. Розбіжності

### 6.1 Докси проти доксів (усі на 2026-09-27, обидві сторони живі)

1. **`Syntax: spaceJira`** у рядку «Space» на `jql-fields` — імені такого поля не існує; це слід
   машинної заміни `project` → `space`. Сусідні приклади на тій самій сторінці написані як
   `space = "ABC"`. **Довідник пише `project`** (живий екран 2026-09-17) і показує обидва імені.
2. **`approvals` (Syntax) проти `approval` (усі приклади)** — на одній сторінці, у сусідніх абзацах.
3. **Регістр назви SLA:** `"Time to First Response"` на `jql-fields` проти `"Time to first response"`
   на `write-jql-queries-for-slas`. Обидві в довіднику названі.
4. **Переліки зарезервованих слів різні:** `what-is-advanced-search…` дає **195** слів,
   `write-jql-queries-for-slas` — коротший список із ~35. Узяв довгий, коротший не згадую.
5. **`elapsed()` немає серед функцій** на `jql-functions` (є сім із восьми SLA-функцій), але вона
   описана в розділі поля SLA на `jql-fields` і на сторінці JSM. У довіднику це сказано прямо.
6. **`resolution = Unresolved` у прикладі черги** проти «The resolution field doesn't exist in
   service team-managed spaces» — стара знахідка автора j19, у довіднику стоїть плашкою.
7. **Старі імена живі в прикладах:** `issueKey` (`jql-operators`), `duedate` (`jql-keywords`,
   `jql-operators`, `jql-functions`) — при тому, що на `jql-fields` ті самі поля вже звуться
   `workItemKey` і `due`/`dueDate`. Це **аргумент на користь правила «спробуй старе слово»**, і
   він стоїть у `#renames`.
8. **`jql-keywords` уся переписана під `space`** (`space = "New office"`, `space = JRA`,
   `space in (JRA,CONF)`) — тобто прикладів із `project` там не лишилось. На
   `write-jql-queries-for-slas` (інший продукт) — навпаки, `project = Test`.

### 6.2 Урок проти доксів / екран проти доксів

9. **`Save filter` (екран 2026-09-17) проти `Save as` (довідка)** — підтверджую знахідку автора j07:
   на `what-is-a-saved-search` і сьогодні стоїть «Select Save as above the search results».
10. **`startOfWeek()`: довідка додала уточнення.** Цитата уроку 7 «by default, the first day is
    Sunday» **живою лишилась** — але вона тепер стоїть лише **в прикладі**, а в описі функції
    з'явилось довше речення: «By default, this function considers Sunday to be the first day of the
    week **when ISO8601 for the Date Picker is disabled in Look and feel settings**». Тобто
    замовчування залежить від налаштування вигляду сайту. **У довіднику я цитую коротку форму з
    прикладу (вона точна), але це місце варто знати рецензентові уроку 7:** якщо колись
    знадобиться категоричне «тиждень починається в неділю», опора вже з умовою.
11. **`Filter Results` — «лише збережений фільтр»** підтверджено наживо (поле `Saved Filter*`,
    спейс/ключ → «No Matches»), і це **суперечить** опису гаджетів у доксах, де для гаджетів
    названі два джерела («your space or a saved filter»). У довіднику стоїть живий факт із датою.
12. **Урок 7 і мій довідник не розходяться ніде** — звірив вісім запитів уроку посимвольно
    (`grep` по `modules/jira-07.html`), усі перенесені дослівно. Те саме для запитів з j14, j15,
    j19, j20, j21, j22.

### 6.3 Програма проти продукту

13. **Картка довідника в `program.md`** просить поле `issuetype` і функцію `lookupIssues` у переліку
    полів/функцій JQL. Перше — старе ім'я, якого на живій `jql-fields` немає (там `type`/`workType`);
    друге — не функція JQL, а **розумне значення автоматизації** (`{{lookupIssues}}`), тому воно
    згадане як **дія** `Lookup work items` у `#where`, а не в таблиці функцій. Це рішення, не пропуск.
14. **Картка просить «JQL у flows, дашбордах, MCP»** — закрито розділом `#where` на вісім рядків
    (адреса сторінки, гаджет, фільтр дошки, тригер, умова, дія, черги й SLA, MCP).

---

## 7. Що в контракті / шаблоні незручно для довідника

1. **Контракт §2 описує лише урок.** Для довідника немає ні переліку «що змінити в базовому
   файлі», ні правил шапки (`ds-ref__head`, `ds-ref__stat`), ні дозволу на статичний `<details>`
   зі скриптом — усе це я відтворював із `claude-code-ref-commands.html`. **Пропозиція:** дописати
   в контракт короткий §2.1 «Каркас довідника» з посиланням на еталон і рівно сімома точками змін
   (`data-config`, `data-course`, бренд, крихта, `#configError`, `<title>`, посилання футера).
2. **`check-lessons.py` до довідника не застосовний** (вимагає квіз, вісім секцій, `data-lesson`).
   Я зібрав свій набір перевірок і описав його в §8 — варто покласти його в репозиторій як
   `check-refs.py`, інакше третій довідник перевірятимуть утретє вручну.
3. **Правило «перша колонка `.ds-tbl` — ідентифікатор» тисне на таблиці «що змінилось».** Там
   природна перша колонка — «у запиті», але для двох рядків (кнопка `Save filter`, слово `flow`)
   імені в запиті не існує; довелось поставити «—». Працює, але це компроміс.
4. **`.ds-tbl--wrap` ставиться руками за критерієм, якого агент не може заміряти** (друга колонка
   ≤ 34 % при першій ≥ 45 % на 1280). Я поставив його на 17 таблицях із 28 — там, де перша колонка
   містить пару імен або службове слово, а решта колонок — речення. **Заміряти на 390 і 1280 — робота
   білду** (див. §8, останній пункт).
5. **Немає конвенції на підпис джерела під таблицею.** В уроках це `p.ds-diag__caption[data-align="start"]`
   (для вікон), у `claude-code-ref-*` — Tailwind-утиліти `font-mono text-xs text-fg-3` прямо в HTML.
   Я взяв `p.ds-small` (клас системи, не утиліта). **Варто зафіксувати один спосіб** — у мене таких
   підписів 29.

---

## 8. Знахідки для сусідів

### → `jira-ref-automation.html` (паралельний автор)
- **Три місця з JQL у flows описані в мене однаково з довідкою:** тригер `Scheduled` («You can also
  choose to enter a JQL query…»), умова `JQL` («Checks to see if an issue matches a specified JQL
  query» + обидва застереження про `Validate query`), дія `Lookup work items` («Search for up to 100
  work items using a JQL query»). Якщо в тебе формулювання інші — розходження побачить рецензент.
- **Рецепт `Resolution` я не дублюю** — у мене одне речення з посиланням на твій `#r1`; звірив твій
  текст, він сходиться з моєю таблицею трьох типів спейсів (`Unresolved` у team-managed).
- У мене `#limits` має рядок «дія `Lookup work items` — перша сотня» з тією самою цитатою; якщо ти
  даєш там число 100 — воно те саме, дублювання свідоме (у мене — з боку мови запитів).

### → `ref-map:` («Карта інтерфейсу, глосарій і ліміти Free»)
- **Числа, які я свідомо віддав карті** (у мене лише відсилання): 200 результатів у листі підписки ·
  ліміти експорту · 60 днів кошика дашбордів · 5 000 робіт на дошці · кроки автоматизації.
- **Для розділу «Що змінилось»** — готові пари з живими цитатами 2026-09-27: `project` → `space`
  (з банером і з дефектом `spaceJira`) · `summary` → `Title` · `workItemKey` / `issueKey` ·
  `due` / `duedate` · `Save filter` (екран) / `Save as` (довідка) · `rule`/`component` → `flow`/`step`.
- **Для глосарія:** `statusCategory` (категорія етапу) проти `category` (категорія **спейсу**) проти
  поля `Category` ділового спейсу — три різні речі з одним словом; у мене про це ⚠-плашка, але дім
  глосарія — карта.
- **Для «чого на Free немає»:** публічний доступ до фільтрів і дашбордів — «Free Jira sites can't be
  opened to the public» (цитата вже жила в j07).
- **Системні фільтри (дев'ять назв)** можуть знадобитись карті як частина «де що лежить»: у мене
  вони в `#filters-system` із цитатою.

### → `j07` «Пошук і JQL»
- **`startOfWeek()`: опора уроку стала умовною** — див. §6 п. 10. Цитата уроку жива, але в описі
  функції з'явилось «when ISO8601 for the Date Picker is disabled in Look and feel settings».
  Якщо в уроці колись з'явиться категоричне «тиждень починається в неділю» — потрібне це уточнення.
- **`Export` у W1 закритий наживо** (меню `•••`), і ЧаПи уроку вже так кажуть — розбіжності немає.
- Пастка «`!=` губить порожні» тепер має **живий доказ** (0 із 3 робіт) — він у моїй таблиці помилок;
  урок 7 може посилатись на неї замість переказу.

### → `j19` «Практикум: заявки до бухгалтерії»
- **Регістр назви годинника** різниться між двома сторінками довідки (`"Time to First Response"` на
  `jql-fields`, `"Time to first response"` на `write-jql-queries-for-slas`) — у мене обидва названі;
  ⚠ уроку лишається чинним до знімка JSM.
- **`remaining()` має документоване пояснення знака**, якого в уроці немає: «Positive values indicate
  time remaining before breach… Negative values indicate time elapsed since breach», плюс підказка
  «To exclude breached items from your results, use >= remaining("0h") or combine with
  != breached()». Готова опора, якщо урок захоче про це сказати.

### → `j11` «Поля, екрани, типи роботи»
- **Пошук власного поля за номером варіанта** документований: «For multiple choice and dropdown
  custom fields, you can search by both option value and option ID» — це запасний шлях для
  кириличних значень, не лише для назв.

### → `j23` (іспит) — **нічого не переписувати, лише знати**
- Питання, що спираються на «новий фільтр приватний», «статус проти категорії», «`!=` і порожнє
  поле» — усі три тези в довіднику стоять із джерелами й не змінились.
- **Не питати** про `spaceType`, `parentSpace`, `type`/`issuetype`, `textfields`,
  `statusCategoryChangedDate` і поля службового спейсу: у довіднику вони під ⚠ (§5).

### → білду (чеклист релізу)
1. **`jira-ref-jql.html` — новий `<url>` у `sitemap.xml`** (канонічна форма без `.html`:
   `/jira-ref-jql`), `lastmod` = дата релізу.
2. **`jira.html` ще немає** — бренд шапки, «Полиця довідників» (`jira.html#refs`) і «На головну ↑»
   ведуть у 404 до появи лендінга. Перевірено локально: усі інші шляхи (`css/`, `js/`,
   `jira.config.json`, `assets/favicon.svg`, `modules/jira-*.html`, `jira-ref-automation.html`)
   віддають 200.
3. **Заміряти на 390 px і 1280 px:** 28 таблиць, з них 17 із `.ds-tbl--wrap`. Найризикованіші —
   чотириколонкові «Щоденні поля» (15 рядків), «17 операторів» (4 колонки, довгі речення в
   останній), «Часті помилки» (4 колонки) і «Що змінилось у назвах» (4 колонки).
4. **26 блоків `term term--cmd`**: перевірити кнопку «Копіювати» живим кліком хоча б на одному
   (делегований слухач `js/ui.js`, `#ariaLive` на сторінці є; у кожному блоці рівно один
   `.term__in`, тому склеювання через `\n` не задіяне).
5. `refsLabel` / `refJql` у `jira.config.json` уже містять назву довідника — сторінка сама читає
   назву курсу й дисклеймер через `data-site`, окремих правок конфіга не потребує.
