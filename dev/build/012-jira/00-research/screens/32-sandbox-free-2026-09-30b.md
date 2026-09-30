# 32 · Sandbox на Free — друга перезйомка, 2026-09-30 (третя сесія дня)

Знімає коренева сесія в підключеному Chrome власника, **паралельно з авторами хвилі 9**. Файл росте під час роботи —
автори перечитують його перед фінальним прогоном. Адреса сайту замінена на `<site>`. Усе нижче — **план Free**.

## 0. План сайту (звірено на старті сесії)

- `admin.atlassian.com` → Додатки → Додатки Atlassian: **Jira — `Free`**, 1 користувач (Assets, Goals, Projects, Studio —
  теж `Free`; Jira Administration — без плану). Confluence і Jira Service Management у списку немає.
- Шапка Jira: `+ Create` · **`Upgrade`** · сповіщення · довідка · налаштування · аватар.
- Головна `For you`: «Recommended spaces» · `View all spaces` · плитка «Моя команда — Software space» · вкладки
  `Recommended` · `Assigned to me` 1 · `Starred` · `Worked on` · `Viewed`; у `Worked on` — групи `Today` / `Yesterday`,
  рядок: назва · «Task · TFB-2 · Test Free B» · аватар · «4 hours ago».
- Бічна панель: For you · Recent › · Starred › · Apps · Plans › · Spaces (`+` · `•••`) → `Recent`: список спейсів · `More
  spaces` › · `Recommended`: «Collect requests» `Try` · Filters · Dashboards ∣ Assets ↗ · Teams ↗.

## 1. 🔴 `Create with Rovo` на Free: діалог відкривається, запит НЕ виконується (закриває «курс не перевіряв»)

Тимчасовий діловий спейс `TF` → `Space settings` → `Automation` (≈ 5 годин після переходу на Free).

- Спейс без жодного flow відкриває вкладку **`Templates`**, а не `Flows`: банер «Try these 3 simple flows for your team»
  (When all sub-tasks are done '→' move parent to done · When parent is done '→' move all sub-tasks to done · When an issue
  is transitioned '→' then automatically assign) · `Try them now` · `Search for template` · `Categories` · `Apps` ·
  `Triggers` · розділи шаблонів: `Rovo AI Agents` · `Loom` · `Strategy` · `Managing project` · `Design` … (у назвах шаблонів
  і досі «issue», «sub-tasks», «project»).
- Кнопка `Create flow` → меню з трьох пунктів: **`Create with Rovo` · `Create from scratch` · `Create from template`** — на
  Free **без змін**.
- `Create with Rovo` → діалог «**Automate work in minutes with Rovo**» · поле «Describe what you want to automate and Rovo
  will build it...» · `+` · кнопка надсилання · підказки (цього разу) `Due-date reminder notification` · `Product spec review
  task` · `Urgent work team notification` · оновити · «Explore templates»: Create a post-incident review · Track when work
  starts · Fix dependency vulnerabilities · «Uses AI. Verify results.» — підказки й шаблони **міняються від відкриття до
  відкриття** (у `screens/31` §3 були інші) — в уроці їх не перелічувати як сталі.
- **Запит надіслано двічі — flow не зібрано жодного разу:**
  1. «When a work item is created, add a comment saying Welcome» → екран «**Something went wrong**» · `Reload to try again`
     (клік перезавантажив сторінку).
  2. «When a work item is created, assign it to the reporter» → розмова: запит у бульбашці праворуч, відповідь —
     «**[Code 404] {"status":404,"error":"Not Found","message":"No message available","path":"/assist/rovo/v1/chat/
     conversation/…/message/stream/sse"}**» · `Resend the message` · 👍 👎 копіювати · плашка «Try Rovo on your phone — Ask
     questions, create Jira work items & Confluence pages - pick up right where you left off.» (QR) · поле «Describe what
     you want to know or do next».
- **Висновок для курсу (30 вересня 2026 року, план Free):** кнопку й діалог `Create with Rovo` на безкоштовному плані
  видно, але зібрати flow описом не вдається — замість flow приходить помилка. Формулу п. 22 «чи дадуть результат без
  кредитів, курс не перевіряв» для автоматизації **замінити**: «діалог відкривається, але на запит відповідає помилкою;
  flow курс збирає руками — `Create from scratch`». Про `Add agent` — див. нижче.

## 2. Конструктор flow на Free (`TF` → `Create flow` → `Create from scratch`; нічого не збережено)

- **Шапка нового flow:** `←` (Return to flows) · ⚡ «Untitled flow» · **`Save and enable`** (неактивна, поки немає тригера) ·
  стрілка поруч → єдиний пункт **`Save without enabling`** · `•••` (More Actions). Унизу полотна — `−` · `100%` · `+`.
- **Панель `Add a trigger`** («An event that triggers the flow to run»; поле `Search triggers`; «Typing will update the
  triggers below.»). Групи з лічильниками — дослівно:
  `Automation` 3: Incoming webhook · Scheduled · Service limit breached ·
  `Compass` 2 · `Confluence` 1: Page status changed · `DevOps` 14 (Branch created · Build failed · … · Pull request merged …) ·
  `Focus` 4 · `Guard Detect` 1 ·
  **`Jira` 24:** Field value changed · Manual trigger from work item · Multiple work item events · Sprint completed · Sprint
  created · Sprint started · Version created · Version deleted · Version released · Version unreleased · Version updated ·
  Vulnerability found · Work item assigned · Work item comment deleted · Work item comment edited · Work item commented ·
  Work item created · Work item deleted · Work item link deleted · Work item linked · Work item moved · Work item
  transitioned · Work item updated · Work logged ·
  `Jira Service Management` 2: Approval completed · Approval required · `Loom` 3 · `Projects` 2 ·
  «Need help? Ask a question, watch videos, or browse existing topics on the Automation Community page».
- **Тригер `Scheduled`:** «Executes this flow on the provided schedule. You can choose if you'd like to perform actions on a
  set of work items gathered with a JQL search or simply execute the flow.» · вкладки **`Basic`** ∣ **`Advanced`**.
  `Basic`: `Date and time:` — `Start date` (30.09.2026) · `At` (час) · пояс (Europe/Kiev) · `End date`: ◉ `Never ends` · ○
  `On` (дата) · ○ `After` … `occurrences` · `Occurrence:` — `Run flow every` [число] `Weeks` · `On` Mon Tue Wed Thu Fri Sat
  Sun (кнопки) · `At` 9:00 AM · пояс · `Next run` «Wednesday, October 7, 2026 9:00 AM GMT+3» · `Show next 10 runs` · ☐ «Run
  a JQL search and execute actions for each work item in the query.» · `Add condition` · `Back` · `Next`. Вузол на полотні:
  «Scheduled — Every week on Wed at 9:00 AM».
  **`Advanced` (знято вперше):** плашка «A CRON expression gives you more control over the frequency of your flow. CRON
  expressions are scheduled in UTC, currently: 30/09/26 01:03:47 pm. `Learn more about CRON expressions`.» · поле `Cron
  expression*` (required), сірий приклад «0 0 */2 * * ?» · той самий прапорець про JQL. Тобто Cron-вираз рахується **в
  UTC**, а розклад у `Basic` — у вибраному поясі.
- **Панель `Add a step`** (після `Next`): лічильник «1/65 added» · `Required` — **`Action`** «Specify what your flow should
  do.» · `Optional` — **`Condition`** «Make your flow run a specific path if it meets conditions.» · **`Branch`** «Apply
  actions and conditions to specific pages or tasks.»
- **Панель `Add an action`** (вузол на полотні «Add an action — What the flow will do»; іконка кошика):
  блок **«✦ Rovo AI — Power your automation at the speed of AI.»** з двома пунктами: **`Use agent`** · **`Use Rovo`**
  `Beta` — **на Free блок є** (не натискали) · поле `Search actions` · «Typing will update the actions below.» · групи:
  `Automation` 6: Create dynamic lookup table · Create lookup table · Create variable · Log action · **Send customized
  email** · Send web request (пункту `Send email` немає) ·
  `Bitbucket` 4 · `Coding agents` 4: Use Claude `Beta` · Use Cursor · Use GitHub Copilot · Use Jira Coding Agent ·
  `Confluence` 2: Edit page in Confluence · Publish new page in Confluence · `Focus` 9 ·
  **`Jira` 26:** Add web link to work item · Assign work item · Clone work item · **Comment on work item** · Create sprint ·
  Create sub-tasks · Create version · Create work item · Delete attachments · Delete comment · Delete work item · Delete
  work item links · Edit comment · Edit work item · Link vulnerability to work item · Link work items · Log work · **Lookup
  work items** · Manage watchers · Move work item to board · Re-fetch work item data · Release version · Set entity
  property · Start sprint · Transition work item · Unrelease version ·
  `Jira Service Management` 4: Create incident · Edit request type · Get survey · Update survey status ·
  далі — сторонні: Amazon Web Services 99+ · Asana 4 · Azure DevOps 23 · Confluent 8 · Datadog 7 · Docker 20 · GitHub 9 ·
  GitLab 6 · Google 94 · Jenkins 12 · Microsoft 81 · PagerDuty 12 · Salesforce 6 · Slack 2 (Send message · Send Slack
  message via webhook) · Splunk 9 · Twilio 1 · Zendesk 4 · Other apps 1. Числа в групах — на 30 вересня 2026 року.
- **Меню `•••` (More Actions):** у нового, ще не збереженого flow — `Flow details` · `Settings` · `Connections` ∣ `Check for
  errors`; у збереженого (flow уроку 15 у `REM`) — `Flow details` · `Settings` · `Connections` ∣ `Check for errors` ∣
  `Copy` · `Copy link` · `Export` · `Delete`.
- **Збережений flow (`REM`, flow уроку 15) на Free:** шапка — `←` · ⚡ назва · два перемикачі вигляду (`Flow` ∣ `Audit
  log`) · перемикач `Enabled` · `Save` (неактивна без змін) · `•••`. Відкривається одразу з панеллю **`Flow details`**:
  `Name` · `Description` («Add a description to your flow») · `Owner*` — «The owner will receive emails when the flow
  fails.» · `Notify on error` («E-mail flow owner once when flow starts faili…») · `Who can edit this flow?*` (`Private`) ·
  плашка «Flow settings have moved. Manage trigger settings, scope, and actor in the `Settings` panel. `About flow
  settings`».
- **Панель `Settings`** (`•••` → `Settings`; знято вперше): «Configure settings that control how this flow runs.» · «Select
  whether another automation can trigger this flow.*» — ◉ «Only user actions can trigger this flow (default)» · ○ «Allow
  other automations and user actions to trigger this flow» · `Scope` — `Single space` (неактивне) · `Spaces*` — «Друга
  точка (REM)» (неактивне) · «Scope can only be modified in the `global administration`.» · `Actor*` — «Automation for
  Jira» · «Actions defined in this flow will be performed by the user selected as the actor. `About flow actors in
  automation.`»
- **Рейка `Space settings` ділових `REM` і `TF` на Free** (ще раз, із цих екранів): Details · Access · Notifications › ·
  Automation · Fields · Work types › · Apps › — без `Approvals`. Сторінка `Automation`: `Global administration` · `Create
  flow` ▾ · `•••` · вкладки `Flows` · `Audit log` · `Templates` · `Usage` · «Browse flows» · перемикач `This space` ∣
  `Studio` · `Filter flows` · `Scope: Space flows` · `Owned by` · `Action` · `Trigger` · `Label` · колонки Name · Labels ·
  Owner · Scope · Updated · Enabled · Actions.

## 3. Flows уроку 15 на Free — повторний прогін

- **Flow 1 («Підзадача готова — відзначити в батьківській роботі», `REM`) на Free працює.** `REM-7` переведено `Done →
  To Do → Done` (через MCP). `Audit log` спейсу: новий рядок «30.09.2026, 16:05:17 · (ID) · назва flow · **`Success`** ·
  1.83s»; розгорнутий: ✓ **Work item transitioned** 30.09.2026, 16:05:17 › · ✓ `BRANCH` ▾ · ✓ **Branch flow / related work
  items** … › · ✓ **Comment on work item** 30.09.2026, 16:05:18 › · **Log action** 30.09.2026, 16:05:19 ▾ — «Log» → «REM-6
  Меблі: доставка й монтаж». Колонки журналу: Date & time · Audit log ID · Flow · Status · Total time; фільтри над ним:
  `Search flows` · `Last 30 days` · `Audit log ID` · `Actions` · `Triggers` · `Reset filters` · `•••`; під таблицею — «What
  do the different statuses mean?». Статуси, що є в журналі сьогодні: `Success` · `Config change` · `Some errors`.
- **Вкладка `Usage` рівня спейсу одразу після запуску не змінилась:** «Last updated: Sep 30, 2026 at 4:05:38 PM» ·
  `Upgrade subscriptions` ↗ · `Date range` — `Current month (September)` · `Automation step usage` «22 steps» `Estimate`
  (Jira 22 · Other apps 0) · `Rovo credit usage in Automation` «0 credits» `Estimate` · `High usage flows`: Flow · Flow runs ·
  Automation steps · Rovo credits · Owner · Enabled → «Підзадача готова… · 3 · 9 · - · Користувач Jira · ENABLED». Четвертий
  запуск у таблицю ще не потрапив — цифри тут **оцінка із запізненням**, звіряти запуск треба в `Audit log`.
- **Flow 2 («Понеділковий список: що горить цього тижня», `MARK`) на Free:**
  · у списку flows меню `•••` рядка: **`Edit flow` · `Run flow`** ∣ `Copy link` · `Duplicate flow` · `Export JSON` ∣ `Delete
  flow`;
  · у конструкторі меню `•••` flow за розкладом: `Flow details` · `Settings` · `Connections` ∣ `Check for errors` · **`Run
  scheduled flow now`** ∣ `Copy` · `Copy link` · `Export` · `Delete`;
  · 🔴 **у ВИМКНЕНОГО flow `Run scheduled flow now` нічого не запускає** — рядка в `Audit log` не зʼявилось;
  · після ввімкнення перемикачем (`Disabled` → `Enabled`): панель «**Your flow has been updated** — How was your automation
  experience? (optional)» 👍 👎 і рядок `Config change` у журналі; тоді `Run scheduled flow now` дав рядок «30.09.2026,
  16:06:39 · **`Some errors`** · 1.06s»: ✓ Scheduled · ✓ Lookup work items › · ⚠ **Send customized email** — «We couldn't
  send emails to any recipients. This may be for data privacy or recipient email account configuration reasons. Check the
  action and try again, or contact Atlassian support.» Одержувач — група `org-admins` (адресу людини не вписували), тож
  **доставка листа на вписану адресу й на Free лишається не перевіреною**. Flow знову вимкнено.
  · вузли полотна: «Scheduled — Every week on Mon at 9:00 AM» · «Lookup work items — Search for work items using JQL —
  project = MARK AND due <= endOfWeek() AND statusCategory != Done» · «Send email 'Понеділковий список' — org-admins —
  Маркетинг: дедлайни цього тижня».
- **Вихід із незбереженого flow** (`←`): діалог «**Discard changes** — Once discarded, you cannot recover the flow. Are you
  sure you want to continue?» · `Cancel` · `OK`.

## 4. `Add agent` у редакторі процесу на Free (`TF` → `Work types` → `Task` → `Edit workflow`)

- Шапка редактора: «Workflow for» + іконки типів (Epic · Task · Sub-task — процес спільний) · назва спейсу · `Add status` ·
  `Add Transition` · `Add Rule` · **`Add agent`** · `Update workflow` (неактивна без змін) · `Close`; перемикач `Diagram` ∣
  `Text`. Вигляд `Text` — таблиця `Status (ID)` ∣ `Transitions (ID)`: `To Do` (10099) — «Create (1): Start → To Do», «To Do
  (21): Any Status → To Do»; `Done` (10100) — «Done (41): Any Status → Done». Права панель: «**Make work flow your way** —
  Workflows represent your team's process and control how people progress your project's work. Here, you can add statuses,
  which appear as drop zones for the cards on your project's board. You can create pathways between statuses called
  transitions, and automate repetitive actions using rules. Select a status to reveal more details.» · `Learn more`.
- `Add agent` → діалог «**Add Agent**»: `Transition` — «Choose a transition» · `Trigger` — «Choose an agent» · `Agent prompt
  (optional)` — «Enter prompt here» · «0 of 10,000 characters» · `Cancel` · `Add` (неактивна). Поле «Choose an agent»
  розкривається: «**We can't find any recently used agents, try searching instead.**» ∣ `Browse agents` · `Create agent`.
  Агента не створювали й не додавали. Тобто на Free діалог є, готових агентів у ньому немає.
- Сторінка типу `Task` у `TF` (Task tracking + доданий `Epic`): рейка `Work types` — `Epic` ∣ `Task` ∣ `Sub-task` · `+ Add
  work type`; «Task — A small, distinct piece of work.» · `Edit workflow` · `Description fields` (Summary `Required` ·
  Description) · `Context fields` (Status · Assignee · Due date · Priority · …) · `Give feedback` · `Discard` · `Save
  changes`; права панель `Fields`: `Search fields in this space` · `Other fields` — Agent Sessions · Goals · `System fields`
  — Environment · Original estimate · Parent · `Create a field` · «Need to add a global field? `Go to the Fields page`».

## 5. Спринт у спейсі розробки на Free — від старту до завершення (`TFB`, шаблон Kanban + `Backlog` + `Sprints`)

Продовження `screens/31` §8. Роботу `TFB-1` покладено в `TFB Sprint 1` (через MCP; руками — перетягуванням рядка).

- **Вигляд `Backlog` зі спринтом і роботою в ньому:** ряд виглядів `Summary · Timeline · Board · Calendar · List · Forms ·
  Development · Docs · Backlog · +`; панель — `Search backlog` · аватари · `Filter` ∣ `Import work` · три іконки · `•••`.
  Секція «☐ ▾ **TFB Sprint 1** · ✎ `Add dates` · (1 work item)» · лічильники `1 · 0 · 0` · **`Start sprint`** (тепер активна)
  · `•••` → **`Reorder work items` · `Edit sprint` · `Delete sprint`**; рядок роботи: ☑ `TFB-1` «Тест: перша» · статус `To Do` ▾
  · пріоритет · аватар; `+ Create`. Роздільник «1 of 1 work item visible». Секція «☐ ▾ **Backlog** (1 work item)» · `1 · 0 ·
  0` · іконка · **`Create sprint`** · рядок `TFB-2` · `+ Create`. (Секції «Board», що була до ввімкнення спринтів, тепер
  немає.)
- **`Start sprint` → діалог «Start Sprint»:** «**1** work item will be included in this sprint.» · «Required fields are
  marked with an asterisk *» · `Sprint name*` — «TFB Sprint 1» · `Duration*` — «2 weeks» ▾ · `Start date*` — 30.09.2026 ·
  16:08 · «Date format: DD.MM.YYYY. Time format: e.g. 1:00 PM.» · `End date*` — 14.10.2026 · 16:08 (неактивне, рахується з
  тривалості) · перемикач **`Automatically complete sprint`** (вимкнено) · `Sprint goal` (порожнє поле) · `Cancel` · `Start`.
- **Після `Start`:** Jira сама перекидає на вкладку **`Board`**; тост «**Sprint started** — We've filtered the board to show
  your new sprint. Good luck, team!»; назва вкладки браузера — «Board - TFB Sprint 1 - TFB board - Jira». Панель дошки:
  `Search board` · аватари · `Filter` · `Group` ∣ **`Complete sprint`** · три іконки · `•••`. Колонки: `To Do` 1 · `In
  Progress` 0 · `Done` 0 · `+`; картка «Тест: перша · ☑ TFB-1».
- **`Complete sprint` → діалог «Complete TFB Sprint 1»** (малюнок кубка): «This sprint contains **0 completed work items**
  and **1 open work item**.» · «• Completed work items includes everything in the last column on the board, **Done**.» ·
  «• Open work items includes everything from any other column on the board. Move these to a new sprint or the backlog.» ·
  `Move open work items to` — випайка з двох пунктів: **`New sprint`** (за замовчуванням) · **`Backlog`** · `Cancel` ·
  `Complete sprint`.
- **Після `Complete sprint` (вибрано `Backlog`):** Jira повертає на вкладку `Backlog`; там одна секція «**Backlog** (2 work
  items)» · `2 · 0 · 0` · `Create sprint` — секції спринта більше немає, `TFB-1` знову в черзі зі статусом `To Do`.
- **Дошка без активного спринта:** «**Get started in the backlog** — Plan and start a sprint to see work items here.» · `Go
  to Backlog` · `Configure columns` (панель: `Search board` · аватари · `Filter` · `Group` ∣ дві іконки).
- Звіти спринта не відкривали.

## 6. Особисті сповіщення на Free (`…/jira/settings/personal/notifications`) — вікно W1 уроку 16

Рейка: `←` «Personal settings» · `General` ∣ заголовок групи `Jira`: **`Emails and notifications`** (активний) · `Digests`.
Крихти «Personal settings / Emails and notifications». Сторінка «**Emails and notifications**» — «Control when you receive
email or in-app notifications from Jira. You can change these settings at any time.» · `More about managing notifications`.
- `Email preferences` — «Tell us what kind of email updates you want to receive, and how often we should send you
  notifications via email.»: перемикач **`Send me emails for work item activity`** (увімкнено) → «Receive emails when:» ☑
  You're the assignee · ☑ You're the reporter · ☐ You make changes to work items · перемикач **`Group notification emails
  together`** ⓘ (увімкнено) — «We'll group together notifications for the same work items into one email. How often do you
  want to receive these?» → «Every 3 minutes» ▾ · `Email format` — «How do you like your emails?» HTML · Text.
- `Customize space notifications` — `Add space notifications` · «Make your notifications specific to your space needs.
  Choose a space to set customized notifications.» · «Choose a space to get started» · «Don't want to apply default
  notifications to all your spaces? Customize their notification settings.»
- `Default notifications` — «Default notification settings apply across your spaces. These can be overridden by your email
  preferences, or by custom space notifications settings. If you have turned off emails for work items in the Emails
  section, you won't be able to turn on email notifications here.» · три таблиці з колонками `In product` ∣ `Email`:
  **`Notifications for all work items`** — You're assigned to a work item · You're mentioned on a work item ·
  **`Notifications for relevant work items`** — Changes to work items · Changes to comments on work items · A work log is
  created, edited, or deleted · Other work item events (including a change to a work item's status) ·
  **`All space notifications`** — Space access requests.
Пункту рейки «Notification settings» на екрані немає (так розділ зветься в довідці) — як і було 17 вересня.

## 7. `Import data into Jira` на Free (`…/jira/settings/system/external-import`) — вікно W3 уроку 21

Плашка «**You're in the new import experience** — With the new experience, you can import data from any app into a new Jira
service (CSV only), business, or software project. You can also import new work items into an existing project using CSV,
with `some limitations` ↗. While we work on building more capabilities, we recommend that you use the old experience to: •
Move data into an existing space in Jira • Import data into Jira Product Discovery • Use JSON files to move data · **`Switch
to the old experience`**» · `Search apps` · «**Where would you like to import from?** — Select the app where you'd like to
import your data from.» · плитки (15): Asana · monday · ClickUp · Trello · Azure DevOps · GitHub · GitLab · Smartsheet ·
Jetbrains YouTrack · Notion · Linear · Wrike · Airtable · Jira (software space) · Jira (business space) · «**Can't find
your app?** — If you don't see your app here, select CSV to use any CSV file to import your data.» · `CSV`.
Ліва рейка адмінки Jira поруч: … `Automation` — Global automation ∣ `User interface` — Default user preferences · Default
dashboard · Look and feel · Announcement banner ∣ **`Import and export`** — Backup manager · **External system import** ·
Import Jira cloud · Import Jira server ∣ `Mail` — Global mail settings · Outgoing mail · Incoming mail · Send email ∣ `Admin
helper` — Permission helper · Admin email audit. **Збігається з вікном уроку 21** (ті самі 15 плиток і `CSV` окремо).

## 8. Список `Spaces`, панель `Templates` і галерея `Space templates` на Free

- **`Spaces`:** `Create space` · `Templates` · `Search spaces` · `Filter by app` · «8 spaces found» · колонки ★ · Name · Key ·
  Type · Lead · Space URL · `•••` у рядку («More actions for …»). Типи: «Team-managed business» / «Team-managed software».
- **Кнопка `Templates` відкриває бічну панель** (а не одразу галерею): «**Templates** — Preview a template for your next
  space» · Kanban «Visualize your work on a board» · Product ideas `Try` «Capture product insights and ideas» · Advanced IT
  service `Try` «Manage requests, incidents, or changes» · **`More templates`** · `×`.
- **`More templates` → галерея «Space templates»** (на весь екран, `×` ліворуч угорі). Ліва колонка: **`Made for you`** ·
  **`Bundles`** · **`Custom templates`** `Enterprise` · **`Import data`** ☁ ∣ `CATEGORIES`: Software development · Service
  management · Work management · Product management · Marketing · Customer service · Human resources · Finance · …
  `Made for you` — «Templates for you based on how similar teams work.»; картки: Kanban `Last created` («Work efficiently and
  visualize work on a board with to do, doing, and done.» · Jira) · Product discovery `Try` (Jira Product Discovery) ·
  Advanced IT service mana… `Try` (Jira Service Management) · …
  🟢 **Кнопки `Create with Rovo` в галереї на Free немає** — ні в лівій колонці, ні над картками (тепер з опорою на Free).
- **`Bundles`** — «Set up multiple spaces at once so you can get to the work, quicker. Each bundle comes with a set of
  templates from apps you already have access to across the Atlassian ecosystem.»; «**Marketing team bundle** — Stay
  connected with product teams so every launch, deliverable, and event takes off.» · «3 spaces in this bundle»: Go-to-Market
  · Marketing asset creation · Kanban · `Create spaces`; «**IT team bundle** — Ensure cross-functional projects are
  successful and everyone stays connected while working in the space that's right for them.» · `Create spaces` …
- **`Work management`** — «Track, coordinate, and manage work with structure and consistency using our work management
  templates.»; картки: **Blank space** («Start with a blank canvas») · **Project management** («Plan and deliver business
  projects.») · **Task tracking** («Organize and track team or personal tasks.») · … (усі — Jira).

## 9. Картка роботи ділового спейсу на Free — повний знімок (`REM-6`, після прогону flow)

Крихти «Spaces / Друга точка / ✎ **`Add epic`** / ☑ REM-6» · праворуч угорі: 👁 2 (спостерігачі) · поділитись · `•••`
(Actions). Назва «Меблі: доставка й монтаж» · під нею `+` («Add or create work related to this Task») і `•••` (`Add apps`).
`Description` — «Add a description...». Секція **`Subtasks`** (`•••` · `Configure columns` · `+` Create child) · смуга й
«**100% Done**» · таблиця Work · Priority · Assignee · Status: «REM-7 Меблі: доставка · Medium · Unassigned · `Done`», «REM-8
Меблі: монтаж · Medium · Unassigned · `Done`» (ключі закреслені). `Linked work items` — «Add linked work item».
**`Activity`**: вкладки **All · Comments · History · Work log** (вкладки `Approvals` немає) · `Newest first` · поле «Add a
comment…» · підказки «🎉 Looks good!» · «👋 Need help?» · «⛔ This is blocked...» · «🔍 Can you clarify...?» · «✅ This is on
track» · «Pro tip: press `M` to comment». Коментарі — автор **«Automation for Jira»**, «6 minutes ago»: посилання на
`REM-7` + «Меблі: доставка — готово, 2026-09-30» (і два ранкові).
Права панель: статус `To Do` ▾ · ⚡ (`Automation`) — **`Improve Task` немає** · `Details` ⚙: Assignee («Unassigned» ·
`Assign to me`) · Due date (Oct 10, 2026) · Priority (Medium) · Labels («Add labels») · Time tracking («No time logged») ·
Start date («Add date») · Category («Add option») · Team («Add team») · Budget («Add number») · Reporter · `Automation` —
«Rule executions» · «Created yesterday» · «Updated 6 minutes ago» · `Configure`.

## 10. Глобальна автоматизація → `Usage` на Free після запусків (Settings → System → Global automation)

Рейка «Jira admin settings» · `Switch settings` — `System` ▾ · … `Security`: Access · Space roles · Global permissions · Work
item collectors ∣ `Automation`: **Global automation**. Сторінка `Automation`: `Create flow` ▾ · `•••` · вкладки `Flows` ·
`Audit log` · `Templates` · `Usage` · перемикач **`Current usage model`** ∣ **`Upcoming usage model`**.
- **`Current usage model`:** «**This month's usage** — Shows the number of flow runs available. Your usage resets через 1
  день (1 жовтня).» · таблиця Product · Current usage · Used · Remaining · Total limit · Plan → «**Jira · 4% · 96 · 100 ·
  `Free`** · `Upgrade`» (зранку було 3% і 97) · «Jira Work Management is bundled with your existing products. `Learn how
  Jira Work Management flows contribute to your usage`» · `Usage trends` — «Your automation usage over the last 6 months.» ·
  `Understanding automation usage` — `How is my usage calculated?` …
  Після двох запусків на Free (flow 1 — `Success`, flow 2 — `Some errors`) лічильник зріс **на один**. Який саме запуск
  зараховано, екран не каже — не тлумачити.
- **`Upcoming usage model`:** «Last updated: Sep 30, 2026 at 4:11:49 PM» · `Upgrade subscriptions` ↗ · `Date range` —
  `Current month (September)` · `Automation step usage` «22 steps» `Estimate` · `Rovo credit usage in Automation` «0 credits»
  `Estimate` · `High usage flows` (Flow · Flow runs · Automation steps ↓ · Rovo credits · **Scope** · Owner · Enabled):
  «Тест: гілки · 3 · 10 · - · `10071` · DISABLED» · «Підзадача готова… · **4** · 9 · - · Друга точка · ENABLED» ·
  «Понеділковий список… · **2** · 2 · - · Маркетинг · DISABLED» · «Тест: журнал створення · 3 · 1 · - · `10071` · DISABLED».
  На глобальному рівні запуски дораховано одразу (на рівні спейсу — із запізненням, §3); `10071` у `Scope` — спейс `TST`, що
  в кошику.

## 11. `Timeline`, `Calendar`, `More`, `Plans` у діловому спейсі на Free (`REM`)

- **Ряд виглядів** (вікно 1568 px): `Summary · Board · List · Calendar · Timeline · Approvals · Forms · Docs · Attachments ·
  More 3 · +`; поруч із назвою спейсу — іконка людей і `•••`; праворуч угорі чотири іконки (поділитись · ⚡ автоматизація ·
  відгук · на весь екран).
- **`Timeline`:** `Search timeline` · аватари · `Filter` ∣ дві іконки; таблиця Work · Status · Assignee і шкала місяців
  (… · September …): «› ⚡ REM-1 Ремонт другої точки · (смуга поступу) · Unassigned», «☑ REM-4 Вивіска: замовити макет · `To
  Do` ▾», «☑ REM-5 Дозвіл від пожежників · `To Do` ▾», «› ☑ REM-6 Меблі: доставка й монтаж · (зелена смуга)»; `+ Create` ·
  «4 of 4»; унизу `Today` · `Weeks` · **`Months`** · `Quarters` · ⓘ.
- **`Calendar`:** `Search calendar` · аватари · `Filter` · `Today` · `‹ Sep 2026 ›` · `Month` ▾ · дві іконки; сітка Mon–Fri …;
  панель «**Unscheduled work** — Drag each work item onto the calendar to set a due date for the work.» · `Search
  unscheduled items` · `Most recent` ▾ · `Filters` · картка «Електрика: розводка під кавомашину · REM-3 · To Do». У клітинці
  22 вересня — «☑ REM-4 Вивіска: замо…» з позначкою прострочення.
- **`More 3`:** `Reports` · `Archived work items` · `Shortcuts` ›.
- **`Plans` у бічній панелі на Free** — не сторінка, а підказка-апсел: «**See all your timelines in one plan** — See and
  plan work across teams in one view. Try free for 30 days with Premium.» · `Learn more` · `Try it free`.

## 12. Архів роботи на Free працює (`TF-2`; архів спейсу — окрема річ із позначкою `Premium`)

- Меню `•••` (Actions) картки з батьком: `Log work` Q · `Open command palette` ⌘K ∣ `Add vote` ∣ `Select cover` › ·
  **`Change parent`** (у картки без батька тут `Add parent`) · `Clone` · `Move` · **`Archive`** · `Delete` ∣ `Connect Slack
  channel` ∣ `Print` · `Export Excel` · `Export Word` … Поруч разова підказка «Add a cover to your work item — Use an image
  or select a color so that the work item stands out.» `OK`.
- `Archive` → діалог «⚠ **Archive Task TF-2** — This work item and any subtasks will be archived. You won't be able to edit
  them, and they will no longer appear in this space. You can restore this work item from `Archives` ↗.» · `Cancel` ·
  `Archive`.
- Після `Archive`: на картці банер «**This is an archived work item. You will need to restore it before you can edit it.**
  `Restore` · `View all archived work items`»; поля лише для читання (`Description` — «None»); в `Activity` → `History`:
  «… archived the Task.» Крихти картки з батьком: «Spaces / Test Free A / ⚡ TF-1 / ☑ TF-2».
- Вигляд **`Archived work items`** (`More` → `Archived work items`; стає вкладкою в ряду): порожній — «**There are no
  archived work items** — Any archived work items in your space will appear here. `More about archiving work items`»; з
  роботою — `Search work items` · `Filter` · колонки ☐ · Type · Key · Summary · Reporter · Date archived · Archived by …;
  рядок «☑ TF-2 · Тест: задача · Користувач Jira · Sep 30, 2026»; «1 of 1».
- Отже на Free: **архівувати окрему роботу можна** (і відновити — кнопкою `Restore`), **архівувати спейс — ні** (пункт
  `Archive space` з позначкою `Premium`, `screens/31` §2).

## 13. Дрібне

- **Сторінка 404 у Jira:** «**We can't find the page you're looking for** — Someone may've deleted it, changed its name, or
  it's temporarily unavailable. Check your spelling in the address bar. Or, try opening this site's home page to search or
  browse for the content.» · «Error code: 404» · `Go to the homepage`. Бічна панель без списку спейсів: For you · Recent ·
  Starred · Apps · Plans · Spaces · Filters · Dashboards ∣ Assets · Teams · Goals · Projects ∣ `Customize sidebar`.
- 🟢 **Кнопка `Upgrade` у шапці на Free відкриває вікно, де план названо прямо** (найкоротший спосіб учневі побачити
  свій план і межі, не заходячи в адмінку): «**Upgrade to the Standard plan** — **You're on the Free plan.** Get a free
  14-day Standard trial for unlimited users, additional storage and much more. Cancel anytime.» · «**You've invited 1 out
  of 10 users** — Upgrade for unlimited users. If you add more than 10 users, you'll be automatically upgraded.» (ряд із
  десяти силуетів, один зафарбований) · «**You've used 0.0 GB of 2.0 GB storage** — Upgrade for 250 GB storage to keep
  attaching files» (смуга) · `Continue with limits` · `Try now`; праворуч — «Standard includes advanced features like:»
  карусель із трьох слайдів (перший — «Unlimited users»); `×`. Закрито `×`; `Try now` **не натискали** (це початок
  пробного платного плану). Рядок «If you add more than 10 users, you'll be automatically upgraded» — друге, з екрана,
  джерело для того, що одинадцятий користувач не блокується, а переводить сайт на платний план (урок 2, урок 20).
- **Меню ⚙ у шапці Jira на Free:** `Search (⌘ + K)` ∣ **`Personal Jira settings`**: `General settings` «Manage language,
  time zone, and other personal preferences» · **`Notification settings`** «Manage email and in-app notifications from
  Jira» ∣ **`Jira admin settings`**: `System` «Manage general configuration, security, automation, user interface, and
  more» · `Jira apps` «Manage access, settings, and integrations across Jira» · `Spaces` «Manage space settings,
  categories, and more» · `Work items` «Configure work types, workflows, screens, fields, and more» · `Marketplace apps`
  «Add and manage Jira Marketplace apps and integrations» ∣ **`Atlassian admin settings`**: `User management` ↗ «Manage
  users, groups, and access requests». Пункту про рахунки чи план у цьому меню **немає** — план видно в адмінці
  (`admin.atlassian.com`) і за кнопкою `Upgrade`. Пункт меню зветься `Notification settings`, а сторінка, яку він
  відкриває, — `Emails and notifications` (§6).
- **Адмінка (`admin.atlassian.com`) — українською**, бо така мова акаунта: «Додатки Atlassian» · `Додати додаток` · колонки
  «Додаток · План · Користувачі · Дії» · «Керувати додатком». У читача написи можуть бути англійською (`Atlassian apps`,
  `Plan`, `Users`) — в уроці давати обидва або описувати місце.

## 15. Запити авторів хвилі 9 (групи `ai` і `rest`) — знято після їхніх звітів; у тексти вносять рецензенти

- **`All work` на Free** (`…/issues/?jql=project = MARK`): заголовок «All work» · праворуч `Search all apps` · `Apps` ▾
  (`Open in Google Sheets` · `Open in Microsoft Excel`) · `Share` ▾ («Share search criteria» — `Names or teams*` · `Message
  (optional)` · `Copy link` · `Share`) · `•••`. Рядок запиту: `Basic` ∣ `JQL` · `Search work` · `Space = Маркетинг` ▾ ·
  `Assignee` ▾ · `Type` ▾ · `Status` ▾ · `More filters` ▾ · `Clear filters` · `Save filter`. Колонки: ☐ · Work · Assignee ·
  Reporter · Priority · Status · Resolution …; «8 of 8». **`project = MARK` Free приймає** (у `Basic` показує як `Space =`).
  Бічна панель `Filters`: `Search work items` · `Default filters` (My open work items · Reported by me · All work items ·
  Open work items · Done work items · Viewed recently · Created recently · Resolved recently · Updated recently) · `View all
  filters`.
- **Меню `•••` на `All work`:** `View work items as a chart` ∣ **`Export`** › · **`Import work items from CSV`** · **`Bulk
  change work items`** ∣ `Give feedback`.
- 🔴 **Помилка «значення не існує» на Free — без префікса «JQL error:»** і не завжди з порожнім списком:
  · `status = Foo` → поле запиту в червоній рамці, під ним рядок «⚠ **The value 'Foo' does not exist for the field
  'status'.**»; перемикач `Basic` неактивний; список порожній: «**There are no work items here yet** — You either don't have
  any work items or your existing ones don't match your current filters.»;
  · `status != Foo ORDER BY created DESC` → та сама рамка й той самий рядок під полем, але **список показано повністю** —
  «36 of 36» (умова з неіснуючим значенням нікого не відсіяла).
  Вікно W2 уроку 7 (`id="w2"`: «JQL error: The value 'Done' does not exist…» і теза «отримує не порожній список, а червону
  рамку») — звести: префікса немає; для `!=` рамка є **разом** зі списком усіх робіт. (Запит `status != Done` на цьому сайті
  помилки не дає — статус `Done` тут існує; перевірено на вигаданому значенні `Foo`.)
- **`Save filter` на Free** → діалог «**Save filter**» — «Required fields are marked with an asterisk *» · `Name*` ·
  `Description` · **`Viewers`** — випайка `Private` ▾ («Only you») · `Add` · рядок «Private» · **`Editors`** — так само ·
  `Cancel` · `Save`. Варіанти випайки `Viewers`: **`Space` · `Group` · `My organization` · `User` · `Private`** (пункту
  `Roles` немає). Після `Save`: тост «**"Test Free filter" filter saved** — We've saved this filter successfully. `Copy
  link`»; заголовок сторінки — назва фільтра з ★ (фільтр одразу в `Starred` у бічній панелі) і посилання **`Filter
  details`**; у рядку запиту замість `Save filter` — **`Copy filter`**.
- **`Filter details`** (випливне вікно, не діалог із кнопкою `Save`): назва · `Description` — «This filter doesn't have a
  description.» · `Edit name and description` · «Owned by <власник>» · **`Permissions`** · `Edit Permissions` · «Visible to:
  Private» · «Editable by: Private» · **`Subscriptions`** ⓘ · `Add subscription` · «This filter doesn't have any
  subscriptions.» Вікно W3 уроку 7 («за документацією»: `Details` з `Viewers` / `Editors` / `New subscriptions` / `Save`) —
  перемалювати за цим.
- **Галерея, категорія `Service management` на Free:** «Empower every team, from IT to HR to marketing, as they collect,
  prioritize, assign, and track incoming requests with ease. Get up and running quickly by selecting one of our tailored
  templates that include pre-configured workflows, forms, and settings based on service management best practices.» ·
  картки (усі — Jira Service Management): **Blank space** · **IT service management** · **Advanced IT service management**
  `Premium` · **IT Operations** `Premium` · **IT asset management** `New` · **Customer service management** · **General
  service management** … Позначки `Premium` у двох ІТ-шаблонів на Free лишились.
- **Ліва колонка галереї повністю:** Made for you · Bundles · Custom templates `Enterprise` · Import data ∣ `CATEGORIES`
  (**17**): Software development · Service management · Work management · Product management · Marketing · Customer service
  · Human resources · Finance · Design · Personal · Operations · Legal · Sales · Analytics · IT · Facilities · Nonprofit ∣
  `PRODUCTS` (**4**): Jira · Jira Service Management · Customer Service Management · Jira Product Discovery.
- **Картка спейсу розробки на Free (`WEB-3`):** крихти «Spaces / Сайт / ✎ Add epic / ☑ WEB-3» · угорі праворуч замок
  (фіолетовий) · 👁 1 · поділитись · `•••` · статус `To Do` ▾ · `</>` («Open in coding tool») · ⚡ · **`Details`:
  Assignee (`Unassigned` · `Assign to me`) · Parent (`Add parent`) · Priority (Medium) · Labels · Due date («Overdue since
  Sep 25, 2026») · Team · Start date · Reporter** · згорнуті `Development` і `Automation` («Rule executions»). Секції:
  Description · Subtasks («Add subtask») · Linked work items · Activity (All · Comments · History · Work log). `Reporter` —
  **останнім** у `Details`. У картці `TFB-3` (спейс розробки з увімкненими спринтами) між `Start date` і `Reporter` є ще
  поле **`Sprint`** («Add sprint»).
- **Створення роботи через MCP на Free (повтор прогону уроку 22):** `createJiraIssue` у `TFB` → `TFB-3`; статус `To Do`,
  `Assignee` — порожній (`Unassigned`), `Priority` — `Medium`, `Reporter` — акаунт, що пройшов згоду; `Activity` →
  `History`: «<імʼя акаунта> created the Work item · 33 seconds ago» — **жодної позначки MCP**. Пошук: `STANDARD` працює
  (1 результат на «вивіска»), `AGENTIC` → 403 «Agentic search is not enabled for this user or site.» Усе, що урок 22
  знімав 29 вересня, на Free відтворюється.
- **Меню `•••` колонки на дошці спейсу сюжету (`REM`, середня колонка `In Progress`):** `Set column limit` ∣ `Move column
  left` · `Move column right` ∣ `Delete status`. Кнопки колонки (`↔` згорнути · `•••`) зʼявляються лише на наведенні. Дошка
  `REM`: `Search board` · аватари · `Filter` · `Group` ∣ дві іконки; колонки `To Do` 4 · `In Progress` 1 · `Done` 0 · `+`;
  на картці `REM-2` — мітка «електрика», дата, випайка батька «Ремонт другої точки», рядок `Subtasks 0/1`.

- **Матриця `Default notifications` — рядки й стан галочок на Free** (`In product` ∣ `Email`; рядки-групи розкриваються):
  `Notifications for all work items`: You're assigned to a work item ☑ ☑ · You're mentioned on a work item ☑ ☑ ∣
  `Notifications for relevant work items`: **Changes to work items** ☑ ☑ → A work item is created ☑ ☑ · A work item is
  edited ☑ ☑ · A work item is deleted ☑ ☑ · A work item is moved ☑ (одна галочка) · **Changes to comments on work items**
  ☑ ☑ → A comment is added ☑ ☑ · A comment is edited ☑ ☑ · A comment is deleted ☑ (одна) · A work log is created, edited,
  or deleted ☑ (одна) · Other work item events (including a change to a work item's status) ☑ (одна) ∣ `All space
  notifications`: Space access requests ☑ ☑. Перемикачі вгорі: `Send me emails for work item activity` — on · You're the
  assignee — on · You're the reporter — on · You make changes to work items — **off** · `Group notification emails
  together` — on.
- **`Reports` у спейсі розробки `WEB`:** вигляду в ряду немає; пряма адреса `…/WEB/reports` дає «We can't find the page
  you're looking for — The view does not exist in this board. Error code: 404 · `Go to the default view`». Щоб побачити
  звіти, вигляд `Reports` треба спершу додати через `+` → `Views` (не додавали — це зміна спейсу сюжету). **Вміст звітів
  на Free не знято.**
- **Не знято:** склад картки застосунку на сторінці `Marketplace apps`.

## 16. Запити авторів хвилі 9 (групи `access` і `plans`) — знято після їхніх звітів

- **Діалог `Add people` на Free** (`MARK` → `Space settings` → `Access` → `Add people`): «**Add people to Маркетинг**» ·
  `•••` · `×` · `Names or emails*` («e.g., Maria, maria@company.com») · «Search by name, enter an email, or paste a list» ·
  **`Role*` — `Administrator`, поле сіре, неактивне** · «This site is protected by reCAPTCHA and the Google `Privacy Policy`
  and `Terms of Service` apply.» · `Cancel` · `Add` (неактивна без імені). Нікого не додавали. Сторінка `Access` у `MARK` —
  та сама, що в `REM` (`screens/31` §6): `Add people` · `Open access` · «This space has 1 role» · банер «Unlock more
  control…» · `Current users` · `Access requests` 0 · `Search roles` · `Roles` ▾ · Name · Email · Role (`Administrator` ▾) ·
  Action.
- **Вигляд `List` ділового спейсу на Free (`MARK`):** панель `Search work` · аватари · `Filter` · `Group` ∣ `•••`; рядок
  заголовків: ☐ · › `Work` · `Assignee` · `Reporter` · `Priority` · `Status` · `Resolution` · `Created` · `Updated` · `Due
  date` … і в кінці рядка — кнопка-іконка **`Configure columns`** (▥). У кожного заголовка — сортування («Assignee • Sort
  A to Z») і «More actions for …»; над таблицею ще кнопка `Expand parent work items`. Рядки: «› ☑ MARK-1 Пост про новий
  круасан» (розкривається — підзадача `MARK-3`), «⚡ MARK-2 Акція «друга кава −50 %»» …; унизу `+ Create` · «7 of 7» ·
  оновити. **`Configure columns` на Free є — у рядку заголовків, не у верхній панелі.**
- **`Group` у вигляді `List` (`MARK`):** поле «Search grouping options» · Agent · Assignee · Category · Created · Due date ·
  Labels · Priority · Reporter · Resolution · Start date … · `Clear selection`.
  **`Group` на дошці (`MARK`):** Assignee · **Campaign** · Category · Labels · Priority · **Sub-task** (назва верхнього
  типу — з цього спейсу; у `REM` на цьому місці очікувано `Workstream` — не знімали).
- **`+` → `Views` у діловому `MY` (Task tracking) на Free:** `Views`: **Board · List · Timeline** — `Capacity` немає й тут.
  Права частина панелі: малюнок · «**Board** — Get a snapshot of the status of your team's work and easily drag your cards
  through a workflow.» · `Add to navigation`. Дошка `MY`: `To Do` 3 · `Done` 2 · `+`; ряд виглядів `Summary · Board · List
  · Calendar · Timeline · Approvals · Forms · Docs · Attachments · Reports · More 2 · +` (що саме потрапляє перед `More`,
  залежить від ширини вікна й від того, які вигляди відкривали).
- **Масові дії на `All work` на Free:** позначка рядка відкриває внизу панель «**1 selected** · `Select all` ∣ `Edit
  fields` · `Change status` · `Add agent` `New` · `Watch options` · `Delete` ∣ `×`». **Пункту `Archive` серед масових дій
  немає** — гуртом роботи на Free не архівуються (окрему — можна, §12). Кнопки в рядку роботи: «More actions for TFB-3».
- **Не знято:** адмінка `Directory → Users` (j20 W3; там імена й адреси людей — знімати лише структуру); кнопки над
  дашбордом і панель `Add a Gadget` (j08); форма перейменування спейсу й ключа (j03); повний перелік колонок `List` (j04).

⚠ **Пастка керування браузером цієї сесії:** кнопка, що зʼявляється або оживає лише на наведенні (меню `•••` колонки, `+` у
ряду виглядів, `Add people`, `Save filter`), на перший клік за `ref` лише отримує наведення; спрацьовує **другий** клік.
Вікно посеред роботи звузилось (кадр 1568 px, сторінка ~1410 px) — кліки за координатами почали влучати лівіше; далі
лише `find` + `ref` або JS.

## 14. Слід у sandbox після цієї зйомки

- Збережений фільтр **«Test Free filter»** (`project = TF`, приватний, у `Starred`) — лишено; видалить власник або
  наступна сесія за його словом. Робота **`TFB-3`** «Тест: створено через MCP на Free».

- План — Free. `REM-7`: `Done → To Do → Done` (третій коментар автоматизації в `REM-6`). `MARK`: flow «Понеділковий
  список…» вмикали на хвилину й **знову вимкнули**; у журналі два нові рядки (`Config change`, `Some errors`) і ще один
  `Config change` від вимкнення.
- `TF`: `TF-2` **в архіві** (не в кошику); незбережений flow відкинуто; два запити до Rovo (обидва з помилкою).
- `TFB`: `TFB Sprint 1` почато й **завершено** (робота `TFB-1` повернулась у беклог).
- Лічильник автоматизації: 4 із 100 за вересень.
- `TF` і `TFB` — **ще не в кошику** (можуть знадобитись для запитів авторів хвилі 9).
