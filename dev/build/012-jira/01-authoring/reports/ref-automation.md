# Звіт: довідник «Автоматизація: тригери, дії, smart values»

**Дата:** 2026-09-27. **Автор:** `aia-content-author`. **Файли, які я записав, — рівно два:**
сторінка довідника й цей звіт. Нічого іншого не чіпав; git не виконував.

---

## 1. Файл і структура

**`/Users/ander1.sage/Downloads/AIA/jira-ref-automation.html`** — 258 341 байт, 3 775 рядків,
≈ 15 700 слів. Корінь репозиторію, поруч із `claude-code-ref-*.html`.

| Що | Скільки |
| -- | ------- |
| секцій `<section id=…>` | 23 |
| таблиць (усі в `div.ds-tbl__wrap[tabindex=0][role=region][aria-label]`) | 31 |
| з них із модифікатором `.ds-tbl--wrap` | 14 |
| блоків `term.term--cmd` із кнопкою «Копіювати» | 13 |
| діаграм Mermaid (`flowchart`) | 2 |
| посилань на уроки (43 входження; 19 унікальних адрес, зокрема на якорі `#l4`, `#l7`; 14 різних уроків) | 43 |
| посилань на `jira-ref-jql.html` | 5 |
| згадок довідника-карти **назвою, без `href`** | 4 |

**Каркас** — за еталоном `claude-code-ref-commands.html`: `<html lang="uk"
data-config="jira.config.json" data-course="jira" data-density="lesson" data-lit data-own-title>`,
порядок CSS (tokens → components → Tailwind CDN → `js/tw-theme.js`), `ds-skip`, `#ariaLive`,
`<noscript>`, шапка з `AIJ` / `data-site="name"` / `#navProgress`, банер `#configError` з назвою
`jira.config.json`, `div.ds-ref` → `details#refToc` + `main#main.ds-ref__main[data-page-in]`,
`header.ds-ref__head` (надзаголовок «Довідник · це не урок», `h1.ds-h1`, `ul.ds-ref__stat`),
`article.ds-prose`, футер `ds-ftr--short` з `data-site="disclaimer"`. Скрипти — як у еталона
**плюс** три рядки Mermaid (`mermaid@10.9.1` → `js/mermaid-theme.js` → `js/mermaid-init.js`), бо на
сторінці дві схеми. `js/module.js` і `js/quiz.js` свідомо не підключені: квіза немає.

**Порядок розділів** — за тим, як збирається flow: `#how` · `#words` · `#where` → `#triggers` ·
`#conditions` · `#actions` · `#branches` · `#advanced` → `#wfrules` (правила переходу workflow —
сусідній механізм) → `#sv` · `#sv-issue` · `#sv-dates` · `#sv-lists` · `#sv-users` · `#sv-more` →
`#flows` (з якорями `#f1`…`#f8`) · `#recipes` (`#r1`…`#r4`) → `#audit` · `#traps` · `#limits` →
`#hygiene` → `#diffs` · `#sources`.

**Самоперевірка (усе пройдено на фінальному файлі):**

- `python3 -c "import html.parser; html.parser.HTMLParser().feed(open('jira-ref-automation.html').read())"` — без помилок;
- власний парсер із переліком порожніх тегів: **0 незакритих і 0 зайвих закривальних тегів**;
- `id` унікальні (дублів 0); **кожне `href="#…"` веде на наявний `id`** (биті якорі — 0);
- усі класи `ds-*` / `term*` є в `css/components.css`; єдиний виняток — `term--cmd`, який правил
  CSS не має, але **вживається в уроках** (`modules/jira-15.html` — 9 разів), тож узятий для
  однорідності sed-пасу;
- `grep -nE 'class="[^"]*/[0-9]{2}'` — **порожньо** (альфа-модифікаторів Tailwind немає);
- `<img>` / `<svg>` / `<canvas>` / `style=` / `user-scalable` / `tailwind.config` / `<br` — **0**;
- апостроф лише `'` (U+0027): `U+2019` — 0, `U+2018` — 0, `U+00AD` — 0, `&nbsp;` — 0;
- заборонені звороти (`просто ` · `очевидно` · `як відомо` · `елементарно` · `всі знають` ·
  `звісно` · `не забудь`) — **0**; вісім початкових «просто» переписано, бо в 23 уроках курсу
  цього слова **нуль** входжень;
- **жодного числа ліміту плану** — прогнав регулярки чекера (`2 GB`, `150 кроків/steps`,
  `100 листів/emails`, `500 викликів`, `1 250`, `1 000 робіт`) плюс власні (`per subscription`,
  `December 3`, `$0.50`, `2026-12-03`, `Free: 5`) — усе порожньо;
- **сторінка перевірена в браузері:** підняв `python3 -m http.server 8317` у корені й зняв її
  власним headless Chrome по CDP (`01-authoring/cdp-text.mjs`) — 99 327 знаків тексту,
  **обидві діаграми Mermaid намальовані**, 13 кнопок «Копіювати» на місці, футер заповнений із
  `jira.config.json` (банер `#configError` не з'явився).

---

## 2. Джерела: URL, дата, що саме взято

### 2.1 Живі докси Atlassian, звірено **2026-09-27** (метод: `curl -sL` → `docs-text.py` → `<main>` без `<nav>`)

Хаб розділу: `support.atlassian.com/cloud-automation/resources/` → **136 живих слагів**.
Нижче — сторінки `support.atlassian.com/cloud-automation/docs/<слаг>/`, які реально пішли в текст:

| Слаг | Що взято |
| ---- | -------- |
| `jira-automation-triggers` | усі **55** тригерів із групами (20 + 2 + 13 + 1 + 12 + 3 + 1 + 3 — лічба моя, перевірена розбором `<h2>/<h3>`), «Every flow starts with a trigger», умови на тригері, `Scheduled` (fixed rate / Cron / JQL / 10 невдач), `Manual trigger` (групи, `Get input from users`, скасування не рахується), `Work item updated` (винятки), `SLA threshold breached`, `Service limit breached` |
| `jira-automation-conditions` | усі **12** умов, «If a condition fails…», «Not all flows need to have conditions», способи порівняння `{{smart values}} condition`, `Issue fields condition` |
| `jira-automation-actions` | **73** дії (лічба моя: 74 `<h2>` мінус «Still need help?»), `Assign work item` (усі способи), `Send email` Deprecated + `Send customized email` (вкладки, `All customers involved`, формати), `Create sub-tasks`, `Clone work item`, `Create variable`, `Create lookup table`, `Lookup work items`, `Log action`, `Re-fetch work item data`, `Add service space customer`, `Transition work item`, «Switching between content formats…», «the flow must be saved or enabled before you can add attachments» |
| `jira-automation-branches` · `what-is-rule-branching` · `branch-automation-rules-to-perform-actions-on-related-issues` | види гілок, advanced branching, обмеження (вкладеність, `If/else`, ізоляція, паралельність), `All created work items`, **шість видів спорідненості** (дослівний перелік — у розділі про **умову** `Related work items`), «In order for a flow to work with a work item in another project…» |
| `add-conditions-to-an-automation-rule` | таблиці операторів (`= != ~ !~ < > <= >=`) і `AND/OR/XOR/NOT` з прикладами довідки |
| `advanced-automation-components` | «Advanced automation steps are available only on Premium and Enterprise plans», `Branch at the same time`, `Branch with conditions`, `Delay until` (10 с — 90 днів), flow groups |
| `create-and-edit-jira-automation-rules` | три шляхи створення, `Add step`, `Turn on flow` / `Turn it on`, `Use a template`, шість полів під `Flow details`, `Update` після ввімкнення, перетягування кроків |
| `what-are-rule-details-in-atlassian-automation` | поділ `Flow details` / `Settings`, `Who can edit this flow`, «Site admins will always be able to edit…», `Scope` (усі значення), `Allow flow trigger` |
| `what-is-a-rule-actor` | «In Jira automation, the default flow actor is the "user" called Automation for Jira» |
| `enable-and-disable-jira-automation-rules` | **три стани** `Enable` / `Disable` / `Draft` дослівно, «enabled by default», 10 невдач поспіль |
| `what-are-system-rules-in-atlassian-automation` | системні flows: три шаблони JSM, `Add system flows`, «When system flows run, they don't count towards your usage», мітка `System flows` |
| `permissions-required-for-jira-cloud-automation-rules` | «By default, all space admins can create and manage automation flows…», шлях `Global configuration`, `Allow space administrators to manage space flows`, `Allow non-admins to create recurring flows`, `Administer Jira` |
| `organize-your-rules-with-labels` | мітки flows: `Add label`, перетягування, хрестик, «You can use the same label across both global and space flows» |
| `import-and-export-jira-automation-rules` | «You must be a global administrator…», шлях `Export flows` / `Import flows`, 5 МБ, «All imported flows will initially be disabled…», `Copy of [flowname]`, `Import flow owners` |
| `what-are-smart-values` | dot notation, camelCase, default value `{{invalid reference\|"Hello world"}}`, chaining, `#` і `{{/}}`, `{{#=}}`, кнопка `{}` і `Advanced formatting`, перевірка через `Manual trigger` + `Log action` |
| `jira-smart-values-issues` | уся таблиця полів роботи, `{{issue.parent}}`, `{{issue.epic}}`, `{{issue.comments}}`, `{{issue.watchers}}`, `{{issue.url}}`, `{{issue.Request Type}}`, `{{triggerIssue}}`, `{{lookupIssues}}` (повний перелік частин), `{{createdIssue(s)}}`, `{{changelog}}`, `{{fieldChange}}`, `{{comment}}`, `{{flow}}`, `{{baseUrl}}`, `{{eventType}}`, вступні рядки «'issue' refers to a work item» / «'project' refers to a Jira space» |
| `jira-smart-values-date-and-time` | **уся таблиця з 17 форматів** (значення — для прикладу довідки «Thursday, November 1, 1979…»), `plus/minus[Unit]`, `diff().unit` + `abs` + `prettyPrint`, `isAfter/isBefore/isEquals/compareTo`, `toBusinessDay(Backwards)`, `setTimeZone` / `convertToTimeZone`, `startOfMonth` / `endOfMonth`, `withNextDayOfWeek`, `with[attribute]`, `firstOfTheMonth` / `lastOfTheMonth` / `ofTheMonth`, «Returns the current date and time in UTC+00:00» |
| `examples-of-using-smart-values-with-dates` | `{{issue.dueDate.format("dd/MM/yyyy")}}`, `plusBusinessDays(6)`, `toDate`, `withLocale("fr")`, «Business days are considered to be Monday to Friday, 9am to 6pm» |
| `jira-smart-values-lists` · `examples-of-using-smart-values-with-lists` | усі функції списків, `{{.}}`, `{{^first}}`/`{{^last}}`, `{{index}}`, `.value` для списків і чекбоксів, `join` |
| `jira-smart-values-users` | властивості людини, `{{assignee}}` / `{{reporter}}` / `{{creator}}` / `{{initiator}}` / `{{comment.author}}`, згадка `[~accountId:…]`, застереження про закриту пошту |
| `jira-smart-values-projects` | `{{project.key}}`, `.name`, `.projectTypeKey` (Business / Software / Service management / Discovery) |
| `jira-smart-values-conditional-logic` | `if` / `equals` / `exists` / `not` із формами запису й прикладом |
| `jira-smart-values-text-fields` | перелік функцій над текстом (взяв 14 найуживаніших з понад сорока) |
| `find-the-smart-value-for-a-field` | адреса `…/rest/api/2/issue/<key>?expand=names`, скорочення `fields`, `customfield_…` |
| `edit-issue-fields-with-jira-automation` | `Add/remove values` для міток і багатозначних полів |
| `transition-an-issue-with-automation` | помилка «Destination status could not be resolved…», «The Automation app user flow actor cannot be added to these user groups…» |
| `automatically-clone-an-issue-when-done` | `Set to recur`, flow `Clone on a schedule` + мітка `Recurring`, що успадковує копія й що ні, «Executions of these automations count towards edition usage limits», як прибрати |
| `test-a-jira-automation-rule-using-the-manual-trigger` · `debug-an-automation-rule` | «While there's no "test" function…», порядок налагодження, «Copy the flow and disable the original before testing», `Log action`, `{{#debug}}` |
| `what-is-the-automation-audit-log` · `view-execution-data-for-a-rule` | пʼять колонок журналу, 90 днів, розгортання рядка, час обробки й приклад із трьома гілками, фільтри |
| `view-performance-insights-for-automation-rules` | `Successful` / `No action` / `Some errors` / `Loop` / `Throttled`, шлях `More actions → View performance insights` |
| `retry-failed-rules-in-atlassian-automation` | `Queued for retry`, «…for up to seven days», що буде далі |
| `automation-service-limits` | усі **плано-незалежні** межі (65 / 500 / 65 / 600 / 50 / 999 / 1 / 5 000 / 50 000 / 60 хв за 12 год / 10 / 100 / 150 / 2 000), ознаки `THROTTLED` і два тексти помилок, поради зі зменшення |
| `how-is-my-usage-calculated` | визначення кроку, перелік платних результатів (`SUCCESS`, `NO_ACTIONS_PERFORMED`, `SOME_ERRORS`, `ABORTED`, `NO_MATCH`), що **не** рахується |
| `best-practices-for-optimizing-automation-rules` | уся гігієна: планування, назви, вимикання, межа дії, ранні дешеві умови, «Use branches sparingly», `Field Value Changed is far more economical…` |
| `limitations-in-team-managed-projects-for-automation-rules` | чотири межі team-managed (People-поля, `Flagged`, батько в тригері створення, беклог → дошка) |

**Поза `cloud-automation`:**

- `support.atlassian.com/jira-software-cloud/docs/available-workflow-rules-in-team-managed-projects/`
  (**7 правил**), `…/add-or-remove-workflow-rules-in-team-managed-projects/` (**5 правил**, межі на
  перехід, шлях, роль/дозвіл), `…/what-are-the-different-workflow-rule-types/` (три типи й порядок,
  винятки з правила іменування) — усі три з банером «This page is for team-managed spaces»,
  звірено 2026-09-27;
- `support.atlassian.com/jira-software-cloud/docs/jql-fields/` — цитата про відсутність
  `resolution` у службових team-managed спейсах;
- **база знань, обидві з банером «Platform Notice: Cloud Only», обидві не AI-generated:**
  `support.atlassian.com/jira/kb/set-resolution-field-for-team-managed-project-jira-issues/`
  (`dateModified` 2025-09-26) — рецепт 1;
  `support.atlassian.com/automation/kb/how-to-store-the-old-issue-key-when-an-issue-is-moved-from-one-project-to/`
  (`dateModified` 2025-09-25) — рецепт 2.

### 2.2 Знімки sandbox

- **`00-research/screens/26-sandbox-2026-09-24.md`** — меню `Create flow` (три пункти), вікно
  `Add a step` («1/65 added», чотири типи кроку з підписами), кнопка `Save and enable`, колонки
  журналу (`Date & time · Audit log ID · Flow · Status · Total time`), **десять підписів статусів
  із розгортки «What do the different statuses mean?» і пʼять дослівних пояснень**, вкладки
  автоматизації в налаштуваннях спейсу.
- **`screens/13-automation-space.md`** — заголовок `Automation`, лінк `Global administration`,
  вкладки, фільтри переліку (`Browse flows`, `This space`, `Owned by`, `Action`, `Trigger`,
  `Label`).
- **`screens/14-automation-global.md`** — вкладка `Templates` (категорії й дослівні назви
  заготовок, зокрема `When all sub-tasks are done → move parent to done`), вкладка `Usage`.
- **`screens/12-workflow-editor.md`** — кнопка `Add Rule` у редакторі workflow (проти «select
  Rules» у довідці).

### 2.3 Уроки курсу

Вісім flows, їхні назви, JQL і тексти коментарів узяті **з чинних текстів уроків**
`modules/jira-14.html`, `jira-15.html`, `jira-19.html`, `jira-21.html` (читав текстові зліпки,
цитати звіряв по HTML). Дані сюжету — лише з `program.md` §3.

### 2.4 Звірка цитат

**143 цитати латиницею, 0 розбіжностей.** Метод: витягнути всі «…» з двох варіантів зняття тегів
(теги → нічого і теги → пробіл), нормалізувати апострофи/тире/пробіли, шукати підрядком у корпусі
з 50 збережених сторінок. Автоматично збіглося 137, з них **6 — зі знімка sandbox** (пояснення
статусів журналу). Чотири «MISS» перевірив руками, усі чотири — артефакти методу, а не помилки:
три цитати свідомо скорочені знаком «…» (перевірив обидві половини окремо), а в четвертій зняття
тегів лишило пробіл перед комою (`When using <code>#</code>,` → `When using # ,`).

**Апострофи:** у цитатах ставлю `'` (U+0027), хоча в доксах стоїть U+2019 — це чинна конвенція
курсу (чекер забороняє U+2019; у всіх 23 уроках цитати нормалізовані так само).

---

## 3. Обіцянки уроків → де закрито

### 3.1 З `ref-promises.md` (5 згадок довідника за назвою)

| Урок і місце | Що обіцяно | Де закрито |
| ------------ | ---------- | ---------- |
| j10 `#l3` | «Повний перелік [готових правил переходу] із прикладами — у документації Atlassian і в довіднику курсу» | `#wfrules`: зведена таблиця **з восьми назв** (7 + 1), три типи правил, шлях, межі на перехід. Пʼять правил, названих в уроці, — на місці |
| j14 `#l3` | «повний перелік [тригерів] з усіма налаштуваннями лежить у довіднику» | `#triggers`: усі **20 загальних** тригерів таблицею з налаштуваннями, окрема таблиця **12 тригерів JSM**, решта 23 — переліком за групами; разом 55 |
| j14 `#l7` | «Готовий рецепт [заповнити `Resolution` у team-managed через flow] лежить у довіднику» | `#recipes` → `#r1`: три кроки з KB дослівно, включно з вимогою `Actor = Automation for Jira`, плюс плашка «у службових спейсах цього поля немає взагалі» |
| j15 `#l3` | «Повний перелік [розумних значень] — сотні рядків, і він лежить у довіднику» | пʼять розділів: `#sv` (будова, `#`, default value, пошук значення), `#sv-issue` (23 рядки), `#sv-dates` (17 форматів + 16 функцій), `#sv-lists`, `#sv-users`, `#sv-more` (13 значень події та кроку + логіка в тексті + функції над текстом) |
| j15 `#l3` | «Крім `{{key}}` і `{{summary}}`, у списку доступні `{{url}}`, `{{status}}`… повний перелік… у довіднику» | `#sv-more`, рядок `{{lookupIssues}}`: усі 13 документованих частин |

### 3.2 З `cross-findings.md` (рядки «→ довідник автоматизації»)

| Обіцянка | Де закрито |
| -------- | ---------- |
| Звести **7 назв правил переходу проти 5** (`Remind people to update empty fields` лише в другій) | `#wfrules` + плашка ⚠ + рядок у `#diffs`. Знайшов **третє** написання тієї самої назви (`Remind people to update fields` на сторінці про типи правил) — теж у таблиці |
| Тригер `Issue Moved` + `{{changelog.key.fromString}}` | `#recipes` → `#r2` (повний рецепт із KB) + рядок у `#triggers` |
| **Три стани flow, зокрема `Draft`** | `#where`, окрема таблиця з дослівними цитатами; `Draft` — ще й випадок 5 у `#traps` |
| Flows експортуються вручну | `#hygiene`, розділ «Перенести flows на інший сайт» (4 кроки + дві пастки) |
| Тригер `SLA threshold breached` | `#triggers`, перший рядок таблиці JSM |
| Дія `Add service space customer` | `#actions`, група «Jira Service Management» + ⚠ про 15 секунд і `Delay` |
| Модель використання (кроки, `how-is-my-usage-calculated`), числа — лише в карті | `#limits` + плашка «Що саме рахується кроком»; чисел плану немає жодного |
| `Send email` — Deprecated | `#actions` (окремий рядок) + випадок 17 у `#traps` + рядок у `#diffs` |
| Слаги smart values (`smart-values-in-jira-automation`, `jira-smart-values-issues`, `…-date-and-time`, `…-lists`, `jira-automation-branches`, `what-is-rule-branching`) | `#sources`, повний перелік 40 слагів |
| Документовані функції дат (`format("dd/MM/yyyy")`, `jiraDate`, `plusDays(7)`) | `#sv-dates`, плюс `plusBusinessDays`, `toDate`, `withLocale` (зі сторінки прикладів) |
| `statusCategory` у розкладі flow — часта помилка | `#traps`, випадок 16, з посиланням на `jira-ref-jql.html` (синтаксис не переказую) |
| `Create variable` («will always return a string») | `#actions`, рядок із ⚠ |
| Функції списків (`join`, `size`, `sum`, `first`/`last`, `distinct`, `get`) | `#sv-lists`, таблиця з 12 функцій + чотири прийоми друку |
| «Switching between content formats will delete any existing content» · «the flow must be saved or enabled before you can add attachments» | `#traps`, випадки 17 і 18 |
| Назва розділу біля переліку спорідненості | `#branches`: сказано прямо, що дослівний перелік стоїть у розділі про **умову** |
| Системні flows JSM (три шаблони, `Add system flows`, копія рахується) | `#recipes` → `#r4` |
| Чотири обмеження автоматизації в team-managed | `#traps`, плашка наприкінці |
| Право створювати flows забирається глобально | `#where`, «Хто має право створювати flows» |
| `Set to recur` → `Clone on a schedule` + мітка `Recurring` | `#flows` → `#f8` (восьмий flow сюжету) |
| У flow запит виконується правами **flow actor**, `Validate query` — твоїми | `#traps`, випадки 10 і 11 |
| `Re-fetch work item data` («the `{{issue}}` reference is not updated…») | `#actions` + `#traps`, випадок 14 |
| `Lookup objects` і гілка `AQL` — лише JSM; адресат `All customers involved` | `#branches` (гілка AQL) і `#actions` (`Send customized email`) |
| Розвести «агент служби» й «Rovo-агент» | `#words`, розділ «Агент і агент» |
| Пара «у довідці / на екрані» для назв автоматизації | `#diffs`, сім рядків «екран → довідка» + шість «довідка → довідка» |

**Вісім flows сюжету — усі знайдені, вигадувати нічого не довелось:** 3 з j14 + 2 з j15 + 2 з j19
+ 1 з j21 (`Set to recur`, який Jira робить сама). Це рівно та вісімка, що стоїть у підзаголовку
довідника в `jira.config.json`.

---

## 4. Що свідомо не ввійшло — і чому

1. **Числа, які залежать від плану:** кроки на місяць по планах, «100 emails in a 24-hour
   period» (Free), «Number of flows that can run at the same time — Free: 5», $0.50 за 1 000
   кроків, дата початку платної перевитрати, таблиця allowances. Усе це є на прочитаних сторінках,
   але за правилом 2в і за ТЗ живе **лише в довіднику-карті**. У тексті скрізь стоїть відсилання
   назвою. **Для карти передаю окремо (розділ 8).**
2. **Синтаксис JQL.** Жодного розбору полів, операторів і функцій запиту: у `#traps` і `#flows`
   сказано, де JQL усередині flow поводиться інакше (права actor, `Validate query`,
   `statusCategory`), решта — посиланням на `jira-ref-jql.html`.
3. **Дії для чужих сервісів по одному рядку.** 53 дії з 73 названі групами без описів (Slack,
   Teams, AWS, Azure, Ansible, New Relic, Statuspage, Assets…): курс про команду до десяти людей,
   і рядок «Run AWS SSM document» з описом лише подовжив би сторінку.
4. **DevOps-, Loom-, Guard- і дизайн-тригери** — названі переліком без описів із тієї ж причини.
5. **Advanced-кроки розписані коротко** (одна таблиця): вони не працюють на планах, з якими має
   справу читач.
6. **Confluence-автоматизація** (`triggers-in-confluence-automation`, `actions-in-confluence-…`
   тощо — 12 слагів хаба) — це інший продукт; курс його не вчить.
7. **JSON-редагування полів** (`advanced-field-editing-using-json`), вебхуки з корисним
   навантаженням, `Send web request` із форматами — названі, але не розписані: читач не з ІТ.
8. **Шаблони автоматизації поіменно.** Зі `screens/14` є дослівні назви заготовок, але в текст
   пішла **одна** — та, на якій стоїть flow 2. Решта не ввійшла: галерея шаблонів перемальовується
   частіше за курс (те саме рішення, що й у j12 про шаблони спейсів).
9. **Вікна застосунку (`figure.win`)** — у довідниках курсу їх не буває (еталон
   `claude-code-ref-*`), і контракт §4 писався під уроки. Екранні факти подані таблицями «на
   екрані / у довідці».

---

## 5. Чого не знайшов підтвердження — і що зняти на sandbox

У тексті кожен такий рядок позначений ⚠, а зведення стоїть у блоці «Чесна межа цієї сторінки»
наприкінці сторінки (**вісім пунктів**).

### 5.1 Не підтверджено нічим (ні доксами, ні екраном)

| Що | Як подано в довіднику |
| -- | --------------------- |
| Нутрощі заготовки `When all sub-tasks are done → move parent to done` | `#f2`: назва — зі `screens/14`, склад кроків описаний як тригер + умова + дія, з прямим ⚠ «усередину шаблону ми не заглядали» |
| Мінімальний проміжок тригера `Scheduled` | `#r3`: «довідка не називає, живою Jira не міряли» |
| Яке написання київського поясу приймає `convertToTimeZone` (`Europe/Kyiv` проти `Europe/Kiev` у налаштуваннях акаунта sandbox) | `#sv-dates`, окрема плашка ⚠ з обома написаннями |
| Чи працює `{{changelog.key.fromString}}` (є в KB, немає в переліку властивостей `{{changelog}}`) | `#r2`, виноска ⚠ |
| Пояснення статусів `In progress`, `Waiting`, `Config change` | `#audit`: у таблиці стоїть прочерк і чесне «дослівного пояснення в нас немає» |
| Що показує `Create with Rovo` на Free | згадано в «Чесній межі»; у тексті кнопка названа без тверджень про те, що вона дає на Free |
| Що лежить усередині четвертого типу кроку `Controls` на Free | `#where`: підпис із екрана + ⚠, що його формулювання збігається з описом advanced steps |
| Вигляд автоматизації **всередині службового спейсу** (JSM на sandbox немає) | `#f6`, `#f7` — обидва flows позначені «описані за документацією» |

### 5.2 Список екранів для кореневої сесії (за цінністю)

1. **`Audit log` з хоча б одним справжнім запуском** і розгорнутим рядком — знімає найбільше:
   підписи статусів у рядку (а не в легенді), підзаголовок під розгорнутим кроком, вигляд
   обчисленого значення від `Log action`, наявність колонки `Audit log ID` у вузькому вікні.
   Закриває місця в j14, j15 і `#audit` цього довідника.
2. **Конструктор flow із трьома кроками** (тригер → умова → дія): як підписані самі кроки в
   ланцюжку, де кнопка `More actions` з `Flow details`/`Settings`, чи є підпис `Update` після
   правки ввімкненого flow, як виглядає стан `Draft`.
3. **Вікно `Add a step` → тип `Controls`**: що там усередині на Free (порожньо, апсел чи робочі
   кроки). Один клік.
4. **Меню `Create flow` → `Create from template`**: вкладка `Templates` **у спейсі** (не
   глобальна) і **нутрощі заготовки про підзадачі** — відкрити й прочитати ланцюжок.
5. **Налаштування тригера `Scheduled`**: який мінімальний проміжок приймає, як підписане поле
   JQL, чи є вибір дня тижня без Cron.
6. **Панель `{}` розумних значень** у полі коментаря: як згруповані, чи є вкладка
   `Custom fields` і `Advanced formatting`.
7. **`{{now.convertToTimeZone("Europe/Kyiv")}}` проти `("Europe/Kiev")`** — один запуск flow з
   `Log action` покаже, яке з двох написань Jira приймає.
8. **Вкладка `Usage` на рівні спейсу** — чи той самий набір плиток, що на глобальній.
9. **Після додавання JSM:** `Space settings → Automation` у службовому спейсі (чи стоїть
   `Create flow`), вигляд `"Request Type"` в умові JQL, вибір видимості коментаря
   (`Reply to customer`).
10. **Редактор workflow → `Add Rule`**: діалог зі списком правил — скільки їх там **насправді**
    (сім, вісім чи пʼять) і як вони звуться на екрані. Це закриє найбільшу розбіжність цього
    довідника.

---

## 6. Розбіжності

### 6.1 Докси проти екрана (усі — в `#diffs`)

| На екрані (17/24.09.2026) | У довідці (27.09.2026) |
| ------------------------- | ---------------------- |
| `Create from template` | `Use a template` |
| `Save and enable` | `Turn on flow`, `Turn it on` |
| `Add a step`, «1/65 added» | `Add step` |
| `Success` | `Successful` (performance insights) · `SUCCESS` (облік) |
| `No actions performed` | `No action` · `NO_ACTIONS_PERFORMED` |
| `Add Rule` (редактор workflow) | «From the workflow toolbar, select **Rules**» |
| у назвах шаблонів — `issue`, `project`, `ticket` | те саме (перейменування до заготовок не дійшло) |

### 6.2 Докси проти доксів (нове, чого не було в `cross-findings`)

1. **Де запускати flow вручну:** `Actions` (`jira-automation-triggers`,
   `test-a-jira-automation-rule-using-the-manual-trigger`) проти `Flow executions`
   (`what-are-smart-values`). Обидві живі 2026-09-27.
2. **Третє написання правила переходу:** `Remind people to update empty fields` (сторінка з
   пʼятіркою) проти `Remind people to update fields` (сторінка про типи правил).
3. **Сторінка з пʼятіркою суперечить сама собі про межі:** «10 груп по 50 правил + 50 + 50» проти
   «You can add up to 10 rules to each transition» — в одному документі.
4. **Термінологія всередині розділу автоматизації не вирівняна:** `jira-automation-branches` і
   `jira-automation-conditions` досі пишуть «issue»/«project», а `what-is-rule-branching` — уже
   «work item»/«flow». **Це уточнює запис хвилі 3** «докси автоматизації вже всюди кажуть flow і
   step»: на 2026-09-27 — не всюди.
5. Підтверджено чинними: `Issue fields condition` / `Work item fields condition (Jira only)`;
   поділ `Flow details` vs `Flow details + Settings`; облік кроків
   (`how-is-my-usage-calculated` проти `best-practices-…`); `{{issue.duedate}}` /
   `{{issue.dueDate}}`.

### 6.3 Урок проти доксів — одне місце, у довідник пішло інакше

**j14 стверджує «Тригер… завжди рівно один і завжди перший».** Цього в доксах немає: там сказано
лише «Every flow starts with a trigger». У `cross-findings` це записано як «твердження без
джерела, лишено». У довіднику я подав чесно: тригер починає flow, а коли подій треба кілька —
документований шлях один, тригер `Multiple work item events` («Using this trigger may be easier and
more efficient than creating several different flows»). **Прямої суперечності з уроком немає**, але
формулювання м'якше — рецензентам j14 варто знати.

### 6.4 Уроки між собою

Суперечностей не знайшов. Дві дрібниці, які довідник зводить:

- **назви статусів журналу:** j14 і j15 після сесії 2026-09-24 тримають екранні
  `Success` / `No actions performed` / `Some errors` / `Failure` — довідник із ними збігається;
- **`Related issues` проти `Related work items`:** j14 називає умову `Related issues` (як на
  сторінці умов), j15 говорить про гілку «споріднена робота `Parent`». Обидва праві: у доксах
  умова зветься старим словом, а гілка — новим. У довіднику це сказано прямо.

---

## 7. Що в контракті й шаблоні виявилось незручним для довідника

1. **Контракт написаний під урок.** §3 (вісім блоків), §4 (вікна), §6 (квіз) до довідника не
   застосовні, і §1 («автор віддає `modules/jira-NN.html`») теж. Фактично довідник живе за
   еталоном `claude-code-ref-*.html` плюс §2 (каркас) і §7 (джерела). **Пропозиція:** додати до
   контракту короткий §10 «Скелет довідника» — так само, як після хвилі 6 додали §3 «Скелет
   іспиту»: `ds-ref` + `details#refToc` + `ds-ref__head` зі `ds-ref__stat` + `article.ds-prose`,
   без `data-module`, без `js/module.js` і `js/quiz.js`, Mermaid — за потреби.
2. **`check-lessons.py` до довідника не підходить** (вимагає квіз, `data-module`, ≥ 9 секцій) —
   це сказано в ТЗ, але скрипта-заміни немає. Я зібрав перевірку руками (парсер, унікальність
   `id`, биті якорі, класи проти `components.css`, альфа-модифікатори, заборонені звороти,
   регулярки чисел, рендер у браузері). **Варто винести її окремим скриптом
   `check-refs.py`** — три довідники перевірятимуться однаково.
3. **Правило «перша колонка `.ds-tbl` — лише ідентифікатор»** у довіднику автоматизації тісне:
   назви правил переходу досягають 105 знаків, назви тригерів — 29. Узяв `.ds-tbl--wrap` (011,
   рядок 13a) на 14 таблицях із 31; на решті лишив `nowrap`, щоб не розривати розумні значення.
   Де перша колонка — речення (симптоми в `#traps`, flows у `#flows`), поставив **номер**, як це
   зробив автор j21.
4. **Для «однакових на всіх планах» меж не було правила.** ТЗ забороняє числа лімітів плану;
   правило 2в дозволяє поведінку продукту з датованою цитатою. Службові межі (65 кроків на flow,
   999 робіт у пошуку, 150 на гілку) — саме другий випадок, і без них довідник автоматизації
   неповний: людина впирається в них незалежно від плану. Виніс їх окремим розділом із датою й
   прямим рядком «що з цієї ж сторінки пішло в карту». **Якщо власник вирішить інакше — цей
   розділ знімається одним блоком.**
5. **Посилання на довідник-карту.** За ТЗ — лише назвою, без `href` (файла ще немає). У тексті
   чотири такі згадки; коли файл з'явиться, їх треба перетворити на посилання — **рядок у
   чеклист релізу**.

---

## 8. Знахідки для сусідів

### → `ref-jql` (довідник «JQL: поля, оператори, функції»)

- **JQL усередині flow виконується правами `Actor`**, а не твоїми: «when the flow runs, it will use
  the flow actor's permissions instead» (`jira-automation-conditions`). Наслідок для довідника
  JQL: `currentUser()` у flow — це не людина, а Automation for Jira.
- **`Validate query` не перевіряє запит із розумними значеннями:** «If you're using smart values,
  you won't be able to check if your JQL is valid using Validate query» (там само).
- **Три місця, де JQL живе всередині автоматизації:** поле в тригері `Scheduled` (дії підуть **для
  кожної** знайденої роботи), умова `JQL`, дія `Lookup work items` (перші 100). Різницю варто
  назвати й у довіднику JQL одним рядком із посиланням сюди.
- Приклад із довідки для умови — `statusCategory = Done`; у розкладі найчастіша помилка —
  забути `statusCategory != Done`.
- Дослівно з `jql-fields` (2026-09-27): «The resolution field doesn't exist in service team-managed
  spaces. This means you can't search for work items in service team-managed spaces with the
  resolution field. Instead, you can use the statusCategory field (a work item is resolved when
  statusCategory = Done).» — **ціле речення, яке j19 цитував скорочено**.
- `{{now}}` рахує час у UTC+00:00 — при порівнянні дат у JQL-умовах це дає зсув на 2–3 години
  проти київського.

### → `ref-map` (довідник «Карта інтерфейсу, глосарій і ліміти Free»)

- **Числа автоматизації, які залежать від плану (у цьому довіднику їх немає):** кроки на місяць —
  Jira Free 150 per subscription, Standard 400/user, Premium 750/user, Enterprise 1000/user;
  Confluence 50/100/250/500; Teamwork Collection 200/2500/5000/7500; JSM 1250/3000/6500/9500;
  Jira Product Discovery 100/300/500/750; **пул на рівні організації**; перевитрата $0.50 за 1 000
  кроків, починає діяти 3 грудня 2026 року; сповіщення адмінам на 80 % і 100 %; при вимкненій
  перевитраті flows спиняються до нового періоду. Дія `Send customized email` — «Free plan limit:
  100 emails in 24 hours»; одночасних flows: Free 5, Standard 10, Premium 20, Enterprise 30 (за
  найвищим планом на сайті). Усе — `how-is-my-usage-calculated` і `automation-service-limits`,
  звірено 2026-09-27.
- **Шлях до витрат для адміністратора організації:** Atlassian Administration → `Insights` →
  `Platform usage`.
- **До розділу «Що змінилось»:** `automation rule` → `flow`, `component` → `step`; у **адресах**
  сторінок довідки `rule` лишився майже всюди (`what-are-automation-rules`, `what-is-a-rule-actor`,
  `enable-and-disable-jira-automation-rules`) — тому пошук у доксах працює краще за словом «rule»,
  а на екрані його немає. Пари «екран / довідка» — таблиця в `#diffs` цього довідника.
- **До глосарія:** «агент» має в курсі три сенси — агент служби JSM, Rovo-агент (`Use Rovo agent`,
  `Add agent`), і `Automation for Jira` як «actor». Варто звести одним рядком.
- Advanced steps (`Branch at the same time`, `Branch with conditions`, `Delay until`, flow groups)
  — **лише Premium і Enterprise**: рядок у «чого на Free немає».

### → j14, j15 (рецензентам і наступним правкам)

- **«Тригер завжди рівно один»** — формулювання без джерела; документований шлях для кількох подій
  — `Multiple work item events` (див. §6.3).
- **`Flow details` — шість полів** (як у j14) стоїть на одній сторінці; сусідня ділить їх на
  `Flow details` + `Settings` і додає `Who can edit this flow` та `Allow flow trigger`. Довідник
  подає обидві.
- **Для j15:** `{{lookupIssues}}` має 13 документованих частин (урок називає шість); функції дат,
  яких в уроці немає, але вони документовані: `plusBusinessDays`, `toDate`, `withLocale`,
  `diff().prettyPrint`, `withNextDayOfWeek`, `firstOfTheMonth`.
- **Для обох:** `Delay` як звичайна дія існує (j14/j15 її не називають) — зручна відповідь на
  «flow спрацював швидше, ніж Jira встигла», і вона ж пояснює довгий `Total time` у журналі.

### → j19

- Тригер `SLA threshold breached` дозволяє обрати **і сам SLA, і час до межі** («You can select the
  SLA to monitor, and the time before or after it has breached to trigger») — це точніше, ніж
  «коли SLA порушено».
- Дія `Add service space customer`: «It can take up to 15 seconds for the new user to appear in
  searches» — довідка радить ставити перед нею `Delay`. Готовий матеріал для граблів.
- Системних flows у фінансовому шаблоні немає (є лише в трьох шаблонах ITSM/CSM) — підтверджує
  чинний текст уроку.

### → j20

- Право на flows знімається двома галочками в одному місці (`Global automation` → `More actions` →
  `Global configuration`): `Allow space administrators to manage space flows` і `Allow non-admins to
  create recurring flows`. Друга — новий факт для уроку про людей і доступ.
- Перенесення flows між сайтами потребує **глобального адміністратора**; перенесені flows
  приходять вимкненими, однойменні стають `Copy of [flowname]`.

### → дизайну / білду

- **`ds-tbl--wrap` у довіднику вжито 14 разів із 31 таблиці** — перша сторінка курсу, де цей
  модифікатор масовий. На 390 px варто заміряти три найширші: «зведений перелік правил переходу
  workflow» (перша колонка до 105 знаків, 4 колонки), «двадцять найуживаніших дій» (3 колонки,
  перша до 40) і «решта розумних значень» (3 колонки, перша до 53, **без** `--wrap` — покладається
  на горизонтальний скролер).
- **Дві `flowchart`-діаграми** (не `stateDiagram-v2`), тож правка `useMaxWidth` для `state` цієї
  сторінки не стосується. Друга діаграма має **сім вузлів із довгими українськими підписами** —
  кандидат на замір ширини поряд із діаграмами j10 і j19.
- **13 блоків `term.term--cmd`**, з них один **тришаровий** (тіло листа, три рядки) — та сама
  пастка, що в j15: кнопка «Копіювати» склеює рядки через `\n`.
- Сторінка **не має** `figure.win` узагалі — sed-пас із перейменуванням класів `win*` її не
  зачепить.
- `href="jira.html"` і `href="jira.html#refs"` / `#map` дають 404 до появи лендінга — той самий
  рядок чеклиста, що й для уроків.
