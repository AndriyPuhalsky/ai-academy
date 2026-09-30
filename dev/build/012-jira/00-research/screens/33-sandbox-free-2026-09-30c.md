# 33 · Sandbox на Free — третя перезйомка, 2026-09-30 (четверта сесія дня)

Знімає коренева сесія в підключеному Chrome власника, **паралельно з рецензентами хвиль 8 / 8б / 9**. Черга —
`open-claims.md` §12.2, останній абзац («Ще не знято на Free»). Адреса сайту замінена на `<site>`. Усе нижче — **план
Free** (у шапці `Upgrade`, перевірено на старті). Рецензенти цього файла не бачили — у тексти вносить коренева сесія
або наступна хвиля.

## 0. Старт

- Шапка Jira: `+ Create` · `Upgrade` · сповіщення (4) · довідка · налаштування · аватар.
- `For you` → `Worked on`: «Тест: створено через MCP на Free» (`TFB-3`), `TFB-2`, `TFB-1`, `TF-2`, `TF-1`; `Yesterday` —
  «Меблі: монтаж» (`Sub-task · REM-8 · Друга точка»).

## 1. Форма `Details` ділового спейсу: назва й ключ (урок 3; запит автора `plans` №4)

`MY` → `Space settings` → `Details` (`…/jira/core/projects/MY/settings/details`). Крихта `Spaces / Мої справи / Space
settings`, заголовок `Details`, праворуч `•••`.

- Значок спейсу · кнопка `Change icon`.
- «Required fields are marked with an asterisk *»
- `Name*` — текстове поле («Мої справи»).
- `Space key` ⓘ `*` — текстове поле (`MY`). Клік по ⓘ: «Space keys are unique keys used to identify a space.» ·
  посилання `More about space keys`.
- `Category` — випадний список, порожній стан «Choose a category».
- `Space owner` — аватар + імʼя; підпис «Make sure your space lead has access to work items in the space.»
- `Default assignee` — `Unassigned`.
- Кнопка `Save` (неактивна, доки нічого не змінено).

**Зміна ключа — пройдено в тимчасовому `TF` («Test Free A»):**
- Поле саме переводить літери у великі (набрано `t` → у полі `T`).
- Один символ (`T`) і `1A-Б`: під полем «**Space keys must start with an uppercase letter, followed by one or more
  uppercase alphanumeric characters.**»
- Будь-яке коректне нове значення: під полем ⚠ «**Changing the space key will re-index your space, and may break some
  external integrations.** Learn more about space keys ↗.»
- Зайнятий ключ (`MY`) → `Save` → під полем червоне «**Project 'Мої справи' uses this project key.**» (слово `Project`,
  не `Space`).
- `TFA` → `Save`: **жодного діалогу підтвердження**; адреса сторінки одразу стала `…/projects/TFA/settings/details`;
  під полем ключа зʼявилось нове поле **`Previous space keys`** ⓘ із плашкою `TF ×` (список, з якого старий ключ можна
  прибрати). Тосту не зловлено.
- Ключі робіт змінились одразу: `…/browse/TF-1` **перенаправляє** на `…/browse/TFA-1` (заголовок вкладки «[TFA-1] Тест:
  епік»). Тексту про «десять хвилин» на екрані немає — це лише цитата довідки.

## 2. Повна форма `Create` відкривається сама — відтворено (урок 5; запит автора `plans` №5)

Тимчасовий `TFA` → `Space settings` → `Work types` → `Task` (шаблон Task tracking).

**Сторінка типу роботи (знято дорогою):** крихта `Spaces / Test Free A / Space settings / Work types`, заголовок `Task`,
кнопка `Edit workflow`, опис «A small, distinct piece of work.» · розділ `Description fields` ⓘ: `Summary` (плашка
`Required`, не знімається) · `Description` · розділ `Context fields` ⓘ: `Status` · `Assignee` · `Due date` · `Priority` ·
`Labels` · `Time tracking` · `Start date` · `Category` · `Team` · `Reporter` · роздільник «Hide when empty» · унизу `Give
feedback` · `Discard` · `Save changes`. У кожного рядка — `•••` і стрілка розгортання. Розгорнутий рядок: у `Priority` —
`Default priority` («Select a value»), у `Labels` — `Default labels` («Select labels»), у `Start date` — `Display
description` («Allows the planned start date for a piece of work to be set.»); унизу кожного — прапорець **`Required`** і
кнопка `Remove`. Права панель `Fields` ⓘ: `Search fields in this space` · `Other fields`: Agent Sessions · Goals · `System
fields`: Environment · Original estimate · **Parent** · `Create a field` › · «Need to add a global field? Go to the Fields
page ↗». Після `Save changes` — тост «**Work type updated** — "Task" has been successfully updated. · Back to project».

**Дослід (лічені обовʼязкові поля — крім `Summary`, яке обовʼязкове завжди):**

| Обовʼязкові, крім `Summary` | Що відкриває `+ Create` |
| --- | --- |
| 3 (`Due date`, `Priority`, `Labels`) | **компактна** форма; у рядку полів зʼявилась група з написом **`Required`**: `Due date` · `Medium` · `Labels` ∣ `Automatic` · `Start date` · `Team` |
| 4 (+ `Start date`) | **повна** форма одразу: поля стовпчиком із зірочками — `Status` (To Do) · `Assignee` (Automatic) · `Due date*` · `Priority*` (Medium) · `Labels*` · `Original estimate` · `Start date*` · `Category` · `Team` · `Reporter*` · `Attachment` («Drop files to attach or browse») · `Linked work items` |
| знову 3 (прапорець у `Start date` знято) | знову компактна з групою `Required` |

- Нова конфігурація типу доходить до діалогу `Create` **після перезавантаження сторінки** (без нього діалог лишився
  старим).
- Шапка повної форми: `TFA` ∣ `Task` · згорнути · повноекранний режим · `•••` · закрити. Меню `•••`: `Configure fields` ·
  `Hide unused fields` (перемикач, увімкнено) · **`Always open in this view`** (перемикач, вимкнено) · `Stop watching` `w` ·
  «Watching this Task» — користувач × · `+ Add watchers`.
- Отже цитата довідки «більше трьох обовʼязкових полів» відтворюється, якщо `Summary` не рахувати. Перевірено на одному
  типі одного ділового спейсу.

⚠ Слід: у `TFA` тип `Task` лишився з трьома обовʼязковими полями (спейс іде в кошик).

## 3. Крихта з батьком у картці спейсу розробки (урок 4; запит автора `plans` №6)

Тимчасовий `TFB` (Kanban). Через MCP створено епік `TFB-4` і підзадачу `TFB-5`; `TFB-1` дістала батька `TFB-4`.

- **Задача з епіком (`TFB-1`):** крихта `Spaces / Test Free B / ⚡ TFB-4 / ☑ TFB-1`. Значок перед ключем батька — кнопка
  з підказкою «**Epic - Change epic**»; значок перед власним ключем — «**Task - Change work type**»; після ключа — кнопка
  копіювання посилання. `Details`: `Assignee` (Unassigned · `Assign to me`) · **`Parent`** (`TFB-4 Тест: епік у спейсі
  розро…`) · `Priority` (Medium) · `Labels` · `Due date` · `Team` · `Start date` · `Sprint` (`Add sprint` · `+1`) ·
  `Reporter` — останнім. Ліворуч секція **`Subtasks`**: смуга поступу «0% Done», таблиця `Work` · `Pri…` · `As…` ·
  `Status`, рядок `TFB-5 Тест: підзадача`; над таблицею `•••` · значок · `+`.
- **Підзадача (`TFB-5`):** крихта `Spaces / Test Free B / ☑ TFB-1 / TFB-5`; кнопки «**Task - Change parent**» і
  «**Subtask - Change work type**». `Details`: `Assignee` · `Parent` (`TFB-1 Тест: перша`) · `Labels` · `Sprint` ·
  `Reporter`. Унизу «Created 18 seconds ago · Updated 18 seconds ago» · `Configure`.
- **Робота без батька в спейсі розробки (`KAN-3`, тип `Subtask`, батька знято раніше):** крихта `Spaces / Моя команда /
  KAN-3`; у `Details` рядок `Parent` — «Add parent» (у спейсі розробки поле `Parent` у панелі є, на відміну від ділової
  картки — `screens/32` §9).

## 4. Спейс `HR` («Найм») на Free: дошка, картка `HR-2`, режим `Text` редактора процесу (урок 10, урок 11; запити `automation` №1, №3, №4)

**Дошка** (`…/jira/core/projects/HR/board`), вікно завширшки ≈ 1570 px:
- Ряд виглядів: `Summary · Board · List · Calendar · Timeline · Approvals · Forms · Docs · Attachments · Reports · More 2 · +`.
  ⚠ **`Reports` — окрема вкладка ділового спейсу на Free.** `More` ховає те, що не вмістилось: при цій ширині в ньому
  два пункти — **`Archived work items` · `Shortcuts ›`**; у вужчому вікні (`screens/31`–`32`) `Reports` теж ішов у
  `More`. Тобто ряд у каноні («… · Attachments · More · +») — це знімок вужчого вікна, а не інший склад.
- Панель: `Search board` · аватари · `Filter` · `Group` · праворуч налаштування вигляду · `•••`.
- Колонки: `New` 3 · `Screening` 0 · `Interview` 0 · `Offer` 1 · `Hired` 0 · (далі за краєм — `Rejected`); унизу праворуч
  мініатюра для горизонтальної прокрутки. У порожніх колонках — `+`.
- Картки: `HR-1` «Вакансія: бариста на другу точку» — значок типу `Workstream` (фіолетова блискавка, той самий, що в
  `Epic`), `HR-3` «Оффер: бариста», `HR-4` «Онбординг нового пекаря» — у `New`; `HR-2` «Співбесіда: бариста (кандидатка
  Олена)» — в `Offer`, на картці мітка `друга-точка`, дата «Sep 25, 2026 ⚠» (прострочено), пріоритет, аватар.

**Картка `HR-2`** (`…/browse/HR-2`): крихта `Spaces / Найм / Add epic / ☑ HR-2` (слот батька — саме `Add epic`, хоча
верхній тип спейсу — `Workstream`) · заголовок · `+` · `•••` · `Description` («Add a description...») · `Subtasks` («Add
subtask») · `Linked work items` («Add linked work item») · `Activity`: `All` · `Comments` · `History` · `Work log` ·
поле коментаря з підказками «🎉 Looks good!» · «👋 Need help?» · «⛔ This is blocked...» · «🔍 Can you clarify...?» · «✅
This is on track» · «Pro tip: press M to comment». Праворуч: статус `Offer` · ⚡ · `Details`: `Assignee` · `Due date`
(червона плашка «⚠ Sep 25, 2026», підказка «Overdue since Sep 25, 2026») · `Priority` (Medium) · `Labels` (`друга-точка`) ·
`Time tracking` («No time logged») · `Start date` («Add date») · `Category` («Add option») · `Team` («Add team») ·
**`Budget`** («Add number») · `Reporter` — останнім · секція `Automation` («Rule executions») · «Created 2 days ago ·
Updated 2 days ago» · `Configure`. **Поля `Parent` немає; вкладки `Approvals` в `Activity` немає.** Власних полів
«Посада» й «Дата співбесіди» в чинному `HR` немає (вони були в першому `HR`, що лежить у кошику); посилання «Show more
fields» на цій картці немає — усі поля видно.

**Сторінка типу `Task` в `HR`:** ліва рейка `Work types`: **`Workstream` · `Task` · `Sub-task` · `Add work type`**; права
панель `Fields`: `Other fields`: Agent Sessions · `System fields`: Environment · Original estimate · Parent.

**Редактор процесу** (`Edit workflow`; кнопка спрацювала з другого кліку) відкрився одразу в режимі `Text` (памʼятає
останній режим). Шапка: «Workflow for ☑ Найм» · `Add status` · `Add Transition` · `Add Rule` · `Add agent` · `Update
workflow` (неактивна) · `Close`. Перемикач `Diagram` ∣ `Text`. Права панель: «**Make work flow your way**» — «Workflows
represent your team's process and control how people progress your project's work. Here, you can add statuses, which
appear as drop zones for the cards on your project's board. You can create pathways between statuses called
transitions, and automate repetitive actions using rules. Select a status to reveal more details.» · `Learn more`.

Таблиця режиму `Text` — дослівно (у кожного рядка ліворуч стрілка згортання; у рядку статусу перелічені переходи, що
**входять у нього й виходять із нього**, тому той самий перехід видно двічі):

| Status (ID) | Transitions (ID) |
| --- | --- |
| `New` (10058) | **Create** (1): `Start` → `New` · **New** (21): `Any Status` → `New` |
| `Screening` (10059) | **Screening** (31): `Any Status` → `Screening` |
| `Interview` (10061) | **Make an offer** (4): `Interview` → `Offer` · ⚡ **Interview** (2): `Any Status` → `Interview` |
| `Offer` (10062) | **Make an offer** (4): `Interview` → `Offer` · **Accepted** (5): `Offer` → `Hired` |
| `Hired` (10060) | **Accepted** (5): `Offer` → `Hired` · **Hired** (41): `Any Status` → `Hired` |
| `Rejected` (10063) | **Rejected** (3): `Any Status` → `Rejected` |

Блискавка ⚡ перед назвою переходу `Interview` — позначка правила на переході. Номери — з цього сайту; в учня будуть інші.

## 5. Шаблон `Project management` на Free: склад типів (уроки 10, 11; запит `automation` №2) і галерея `Work management` (урок 12; запит `rest` №3)

`Spaces` → `Create space` — **спершу відкрилась бічна панель `Templates`** («Preview a template for your next space»:
`Kanban` · `Product ideas` `Try` · `Advanced IT service` `Try` · `More templates`), галерея — за `More templates`.

- Ліва колонка галереї: `Made for you` · `Bundles` · `Custom templates` `Enterprise` · `Import data` ∣ `CATEGORIES` —
  **17**: Software development · Service management · Work management · Product management · Marketing · Customer service ·
  Human resources · Finance · Design · Personal · Operations · Legal · Sales · Analytics · IT · Facilities · Nonprofit ∣
  `PRODUCTS` — 4: Jira · Jira Service Management · Customer Service Management · Jira Product Discovery.
- **`Work management` — 26 плиток** (разом із `Blank space`), підзаголовок «Track, coordinate, and manage work with
  structure and consistency using our work management templates.»: Blank space · Project management · Task tracking ·
  Process control · Sales pipeline · Go-to-Market · UX design · Document management · Campaign management · Recruitment
  tracking · Budget planning · Procurement management · Content management · Personal task planner · Financial close ·
  Policy management · Marketing asset creation · Event planning · RFP process · Email marketing campaign · Sales lead
  tracking · IP infringement · Employee review · Grant application tracker · Nonprofit management · Community
  management. Описи перших: `Blank space` — «Start with a blank canvas» · `Project management` — «Plan and deliver
  business projects.» · `Task tracking` — «Organize and track team or personal tasks.» · `Process control` — «Track and
  improve recurring workflows.»
- Клік по плитці `Project management` веде **одразу в майстер** (крок 1 «Name your space», «Step 1 of 2», `Next`, `Back
  to templates`): `Name*` (підказка «Try a team name, project goal, milestone...») · «How your space is managed» —
  `Team-managed` · «**Access** Anyone with access to <site> can access and administer this space. `Upgrade your plan` ↗ to
  customize space permissions.» · `Key*` ⓘ · `Template` — `See details` · плитка шаблону.
- **`See details`** → сторінка шаблону (крихта `Space templates / Work management`): «Project management» — «Coordinate
  multiple deadlines, teams and stakeholders, from simple to complex projects.» · `Use template` · `Features`:
  «Consolidate and track work from start to finish» · «Prioritize, schedule and collaborate on work» · «Visualize work
  across multiple views» · `Workflow`: `To Do` · `In Progress` · `Done` · **`Work types`: `Workstream` · `Task` ·
  `Sub-task`** · праворуч приклад «Sample Project management project» (`List · Board · Timeline · Calendar`; колонки `TO
  DO` · `IN PROGRESS` · `DONE`). Спейс не створювали.

## 6. Тригер `Scheduled`, вкладка `Basic`: одиниці проміжку (урок 15, довідник автоматизації; запит `automation` №6)

`TFA` → `Automation` → `Create flow` (меню: `Create with Rovo` · `Create from scratch` · `Create from template`) →
`Create from scratch` → `Scheduled`. Нічого не збережено.

- Панель: «Executes this flow on the provided schedule. You can choose if you'd like to perform actions on a set of work
  items gathered with a JQL search or simply execute the flow.» · вкладки `Basic` ∣ `Advanced` · «Date and time:» ·
  `Start date` · `At` (час + часовий пояс `Europe/Kiev`) · `End date`: `Never ends` / `On` (дата) / `After` N
  `occurrences` · «Occurrence:» · **`Run flow every`** — число + випадний список одиниць: **`Minutes` · `Hours` · `Days` ·
  `Weeks` · `Months`** · для `Weeks` — кнопки днів `Mon`…`Sun` і `At` · синя плашка «Next run — Wednesday, October 7,
  2026 9:00 AM GMT+3» · `Show next 10 runs` · прапорець «Run a JQL search and execute actions for each work item in the
  query.» · `Add condition` · `Back` · `Next`.
- Вибір `1` + `Minutes`: картка тригера стала «**Every minute**», `Next run` — наступна хвилина; **попередження про
  замалий проміжок панель не показала**, `Next` пропустив далі. Flow не зберігали (щохвилинний flow зʼїв би 100 запусків
  місяця) — чи відхилить таке збереження, **не перевірено**.
- Після `Next` — панель «Add a step» · «1/65 added» · `Required`: `Action` — «Specify what your flow should do.» ·
  `Optional`: `Condition` — «Make your flow run a specific path if it meets conditions.» · `Branch` — «Apply actions and
  conditions to specific pages or tasks.»
- Вихід стрілкою назад: діалог «⚠ **Discard changes** — Once discarded, you cannot recover the flow. Are you sure you
  want to continue?» · `Cancel` · `OK`.

## 7. Вигляд `Reports` на Free — у спейсі розробки й у діловому (урок 13; запит `rest` №2)

**Спейс розробки `TFB`.** У ряду виглядів `Reports` немає: `Summary · Timeline · Board · Calendar · List · Forms ·
Development · Docs · Backlog · +`. `+` → панель `Views`: `Archived work items` · `Code` `Moved` · `Deployments` `Moved` ·
`Goals` · `List` · `Releases` · **`Reports`** · `Security` `Moved` · `Shortcuts`; праворуч перегляд і кнопка `Add to
navigation` (для `Reports`: «View statistics for people, spaces, versions, or information about work items.»; для
`Archived work items`: «View all the work items archived in your space here.»). Після `Add to navigation` вкладка
зʼявилась і відкрилась (`…/boards/67/reports`).

**Сама сторінка `Reports` — оглядова панель, а не список звітів:** кнопка **`More reports`** · праворуч значки
(відгук · доступ — підказка «Change dashboard access from Open - Anyone can view, only some can edit» · копіювати
посилання) · `Edit` · `•••`. Чотири плитки: «N work items — completed in the last 7 days» · «updated in the last 7 days» ·
«created in the last 7 days» · «due in the next 7 days». Віджети (у кожного `Export` і `•••`): `Work items by status` ·
`Work items by type` · `Work items by assignee` (кільцеві діаграми з «Total value») · `Work item creation trend` · `Work
item cycle time` · `Work item lead time` · `Work item completion trend` · таблиця `Work item details` (`Work item key` ·
`Work type` · `Work item priority` · `Issue summary`; «Showing rows 1-3 of 3»). ⚠ Лічильники відставали: у `TFB` на
момент знімка було пʼять робіт, панель показувала три.

**`More reports` у спейсі розробки — шість звітів** (діалог із плитками):
- `Burnup report` — «Visualize a sprint's completed work and compare it with its total scope. Use these insights to
  track progress toward sprint completion.»
- `Sprint burndown chart` — «Track and manage the total work remaining within a sprint. After the sprint, summarize
  both team and individual performance.»
- `Velocity report` — «Predict the amount of work your team can commit to in future sprints by seeing and reviewing
  the amount of value delivered in previous ones.»
- `Cumulative flow diagram` — «Shows the statuses of your project's work items over time. See which columns accumulate
  more work items, and identify bottlenecks in your workflow.»
- `Cycle Time Report` — «Understand how much time it takes to ship work items through the deployment pipeline and how
  to deal with outliers.»
- `Deployment Frequency Report` — «Understand your deployment frequency to understand risk and how often you are
  shipping value to your customers.»

**`Burnup report` на Free відкривається** (у новій вкладці браузера, `…/reports/burnup`): крихта `Spaces / Test Free B /
Reports` · заголовок · `How to read this report` (розгортається: «What it is — Maintain your sprint's health by
identifying problems such as scope creep or planned path deviation.» · «How to read it — The distance between lines is
the amount of work remaining. Examine the Work scope line to identify scope creep. Learn more») · `Sprint`: `TFB Sprint
1` · `Estimation field`: `Work item count` · «Date - September 30th, 2026 - October 14th, 2026» · легенда: `Completed
work` («Number of work items completed this sprint») · `Guideline` («Ideal burn rate») · `Work Scope` («Number of work
items to be completed this sprint») · таблиця `Date` · `Event` · `Work item` · `Completed` · `Scope` з рядками `Sprint
started` · `Added to sprint` (`TFB-1`) · `Sprint completed`. Решту пʼять звітів не відкривали.

**Діловий спейс `HR`** (`…/jira/core/projects/HR/reports`) — та сама оглядова панель (ті самі чотири плитки й віджети;
лічильники теж відстають: «1 work item» при чотирьох роботах). **`More reports` тут інший** — три групи: `Issue
analysis`: Average Age Report · Created vs Resolved Issues Report · Pie Chart Report · Recently Created Issues Report ·
Resolution Time Report · Single Level Group By Report · Time Since Issues Report ∣ `Forecast & management`: Time
Tracking Report ∣ `Other`: Workload Pie Chart Report. Назви й описи — зі старим словом «issue» («Shows the average age
of unresolved issues for a project or filter…»). Не відкривали.

⚠ Слід: у `TFB` вкладку `Reports` додано в навігацію; роботи `TFB-4` (епік) і `TFB-5` (підзадача) — нові.

## 8. Дашборд на Free: створення, режим правки, `Add a Gadget` (урок 8; запит `access` №7)

`Dashboards` → `View all dashboards`: таблиця `Name` · `Owner` · `Viewers` · `Editors` · `Starred by`; один рядок `Default
dashboard` (`My organization` ∣ `Private` ∣ «0 people»); фільтри `Search dashboards` · `Owner` · `Space` · `Group`; кнопка
`Create dashboard` (спрацювала з другого кліку).

- Діалог «**Create dashboard**»: «Required fields are marked with an asterisk *» · `Name*` · `Description` · `Viewers` —
  список `Private` («Only you») + `Add` · `Editors` — `Private` («Only you») + `Add` · `Cancel` · `Save`.
- Після `Save` — тост «Test Free dashboard was successfully created.», дашборд відкрився **в режимі правки**
  (`…/dashboards/<id>/edit`): заголовок · ★ · **`Add gadget` · `Change layout` · `Done` · `•••`** · банер «You are
  currently editing your dashboard. Changes will be saved automatically.» · дві колонки «Drag a gadget to this column
  or add a new gadget» · праворуч панель **`Add a Gadget`** (×): `Search gadgets` · фільтри **`All 31` · `Jira 30` ·
  `Charts 12` · `Wallboard 5`** · «31 gadgets found». У кожного гаджета: мініатюра · назва · «By Atlassian» · кнопка
  `Add` · опис · мітки (`Jira`, `Charts`, `Wallboard`).
- **31 гаджет на Free** (дослівно): Activity Stream · Assigned to Me · Average Age Chart · Average Number of Times in
  Status · Average Time in Status · Bubble Chart · Created vs Resolved Chart · Days Remaining in Sprint Gadget · Filter
  Results · Heat Map · Introduction · Issues in progress · Jira Issues Calendar · Jira Road Map · Labels Gadget · Pie
  Chart · Quick links · Recently Created Chart · Resolution Time · Spaces · Sprint Burndown Gadget · Sprint Health Gadget
  · Starred filters · Time Since Chart · Time to First Response · Two Dimensional Filter Statistics · Voted Work items ·
  Wallboard Spacer Gadget · Watched Issues · Work Item Statistics · Workload Pie Chart.
- Після `Done` — режим перегляду: заголовок · ★ · копіювати посилання · **`Refresh` · `Edit` · `•••`**; порожній стан
  «**This dashboard is empty** — You can add to this dashboard by clicking the 'Edit' button on the top right corner.»
- Меню `•••`: `Rename or share` · `Copy` · `Configure automatic refresh` · `View as wallboard` · `Move to trash` ∣ `View
  wallboard slide show` (неактивний) · `Configure wallboard slide show` ∣ `Create a dashboard` · `View all dashboards`.
- `Move to trash` → діалог «⚠ **Move Test Free dashboard to trash?** — Trashed dashboards can only be restored by your
  Jira administrator, and are permanently deleted from your Jira site after 60 days» · `Move to trash` · `Cancel` → тост
  «Test Free dashboard was moved to trash.» Тестовий дашборд — у кошику.

## 9. `Marketplace apps` усередині Jira на Free: будова картки (урок 17; запит `rest` №5)

Бічна панель `Apps` → `Explore more apps` (`…/jira/marketplace/discover`). Крихта `Jira / Marketplace apps` · `Feedback` ·
заголовок «Explore apps for Jira» · поле `Search for apps` · фільтри `Pricing` · `Trust signals` · `Categories` · `Use
cases` · `More filters` · «Showing over 1,000 apps» · «Sort by: Relevance».

**Картка застосунку** (три в ряд): стрічка в правому верхньому куті (`SPOTLIGHT` або `BESTSELLER`) · значок · назва ·
«by <виробник>» + значок партнера · опис у три рядки · «**4.6/5** ★★★★★ **(826)**» · «⤓ **34.6k**» (кількість
встановлень) · рядок **`CLOUD FORTIFIED`** зі значком. Перші три 30 вересня: `ScriptRunner for Jira` (The Adaptavist
Group; 4.6/5 (826); 34.6k) · `Jira Misc Workflow Extensions (JMWE)` (Appfire; 4.8/5 (534); 16.6k) · `Xray - Test
Management for Jira` (Xblend; 4.3/5 (553); 25.2k; `BESTSELLER`) — усі три з `CLOUD FORTIFIED`.

## 10. `admin.atlassian.com` → `Каталог` → `Користувачі` на Free (урок 20 W3; запит `access` №6)

⚠ **Адмінка показана українською** (мова акаунта), тоді як Jira — англійською. Вікно W3 уроку 20 намальоване
англійською за довідкою; нижче — написи з екрана.

- Шапка `Administration` · поле «Пошук» · дзвоник · довідка · аватар. Ліва панель: назва організації · `Огляд` ·
  **`Каталог`** (`Користувачі` · `Групи` · `Команди` · `Керовані облікові записи` · `Службові облікові записи` · `Домени`) ·
  **`Додатки`** (`Додатки Atlassian` · `Налаштування доступу до додатків` · `Запити користувачів` · `URL-адреси додатків` ·
  `Число користувачів` · `Ізольовані тестові середовища` · `Платформні функції` · `Керування випусками` › · `Тіньове
  ІТ-середовище` › · `Сайти` ›) · `Rovo` · `Конектори` · `Безпека` · `Керування даними` · `Аналітика` · `Виставлення
  рахунків` · `Параметри організації`.
- `Огляд`: «Швидкі дії»: `Запросити користувачів` · `Додати додаток` · `Підтвердження домену` · «Відстеження даних»:
  «Застосування кредитів на Rovo — 13 used in the last 7 days» (`Переглянути використання`) · «Відкриті запити на
  доступ до додатка — 0» · «Активні користувачі».
- **`Користувачі`** (`…/o/<org>/users`): кнопки **`Запросити користувачів`** · `Схвалити запити 0` · `•••` (`Експортувати
  користувачів` · `Експорт керованих облікових записів`) · «Знаходьте людей у всіх ваших каталогах і облікових записах,
  якими керуєте. Докладніше про керовані облікові записи й зовнішніх користувачів» · чотири плитки: `Усього
  користувачів` ⓘ 1 · `Активні користувачі` 1 · `Керовані облікові записи` ⓘ 0 · `Адміністратори організації` 1 · фільтри:
  пошук «Пошук за іменем або адре…» · `Тип облікового запису` · `Роль` · `Додатки` · `More +` · `Скинути` · таблиця
  **`Користувач` · `Стан` · `Останній перегляд` ⓘ · `Дії`**; рядок: аватар · імʼя · адреса · «Адміністратор організації» ·
  плашка `Активний` · «30 вер. 2026 р.» · `•••`. **Колонок `Email` і `Role - Jira - <site>` окремо немає** — адреса й роль
  стоять під іменем.
- `•••` рядка єдиного користувача (він же адміністратор організації): «Організація» — `Додати до групи` · «Обліковий
  запис Atlassian» — «Цим обліковим записом керує інша організація. Про керовані облікові записи». Пунктів
  призупинити / вилучити для самого себе немає; для іншої людини меню не бачили (на сайті один користувач).
- **`Запросити користувачів`** → панель на весь екран «Запрошення користувачів до організації <site>» — «Запросіть
  учасників команди співпрацювати й використовувати додатки у вашій організації. Під час реєстрації ми запропонуємо
  новим користувачам ввести особисту інформацію.» · `Адреси електронної пошти` (підказка «Запросити за електронною
  адресою...»; «Розділіть адреси комами. Неможливо надсилати запрошення за списками розсилки.») · `Administrator access`
  ⓘ — `None` · таблиця **`Додаток` · `Тариф` · `Ролі`** (`Скасувати весь вибір`): Studio — Free — `Користувач` · Assets —
  Free — `Користувач` · Goals — Free — `Користувач` · **Jira — Free — `Користувач`** · Projects — Free — `Користувач` · Jira
  Administration — `Нічого` · `Членство в групах*` («Вибрати»; «Учасники настроюваних груп отримують доступ до окремих
  проектів і розділів. Не додавайте гостей до груп із постійним доступом до додатка…») · `Відредагувати електронний лист
  із запрошеннями` · «Вибрано 5 додатків» · `Скасувати` · `Надіслати запрошення`. **Нічого не надсилали**, панель закрито.

## 11. Власний тип роботи в діловому спейсі на Free (уроки 11, 21; запит рецензента `access`)

`TFA` → `Space settings` → `Work types` → `Add work type` (спрацювала після наведення, з третього кліку).

- Діалог «**Add work type**»: `SUGGESTED`: `Bug` («Bugs track problems or errors.») · `Story` («Stories track
  functionality or features expressed as user goals.») · `Create work type` · `Add` · `Cancel` (`Epic` у цьому спейсі вже
  додано, тому серед пропонованих його немає).
- `Create work type` → «**Create work type**»: `Name*` («Enter new name») · `Description` («Let people know when to use
  this work type») · `Icon` — `Change icon` · `Create` · `Cancel`. **Поля рівня немає.**
- Назва «Закупівля» → `Create` → тост «**Work type created** — "Закупівля" has been successfully created.»; відкрилась
  сторінка нового типу. **У лівій рейці тип став між `Task` і `Sub-task`, в одній групі з `Task`** (рейка ділить типи
  роздільниками на три групи: `Epic` ∣ `Task` · `Закупівля` ∣ `Sub-task`) — тобто на рівні задачі. Контекстні поля
  нового типу: `Status` · `Assignee` · `Labels` · `Due date` · `Start date` …; у правій панелі `Fields` у нього вільні
  `Category`, `Priority`, `Time tracking`, `Parent` (у `Task` вони вже на картці). У шапці типу, крім `Edit workflow`, є
  `•••`. ⚠ Числове значення рівня (`hierarchyLevel`) через MCP **не звірено** — сесію обірвав ліміт.

## 12. Слід у sandbox після цієї зйомки (план — Free)

- `TF` → **`TFA`** (ключ змінено; старий `TF` у `Previous space keys`); тип `Task` із трьома обовʼязковими полями; новий
  тип «Закупівля». Спейс — у кошик.
- `TFB`: нові `TFB-4` (епік) і `TFB-5` (підзадача), `TFB-1` має батька `TFB-4`; вкладка `Reports` у навігації. Спейс — у
  кошик.
- Тестовий дашборд — уже в кошику. Flow у `TFA` не збережено. Запрошень не надсилали. Спейсів не створювали.
- **Не зроблено з черги:** `hierarchyLevel` власного типу · перетягування з `Unscheduled work` у календарі (j06) · пункт
  `Clear` і `Status` у меню `Group` · сторінка `Access` з двома людьми (потрібна друга людина) · доставка листа
  автоматизації на вписану адресу (потрібне слово власника) · блок «Rovo AI» в `Add an action` (не натискали) · решта
  пʼять звітів `More reports`.
