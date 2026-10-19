# 31 · Sandbox після переходу на справжній Free — перша перезвірка, 2026-09-30

Знято кореневою сесією в підключеному Chrome власника. **Перший знімок сайту на плані Free**: усі попередні
(`screens/01`–`29`, 17–30 вересня) зроблені на пробному Premium — див. `screens/30`. Перехід на Free — рішення власника
через `AskUserQuestion` («Так, переводь сам зараз»). Адреса сайту замінена на `<site>`.

⚠ Знято **за кілька хвилин після переходу**. Те, що «лишилось як було» (передусім `Create with Rovo` і `Add agent`), варто
перезняти наступного дня: частина інтерфейсу могла ще не оновитись.

## 1. Перехід на Free — дослівно (адмінка → Виставлення рахунків → Jira → `Change plan`)

1. Сторінка планів (`screens/30` §2) → `Select Free`.
2. Екран-утримання: `TRIAL REMAINING: 18 DAYS` · «**Stay on Premium to keep AI-powered features and more** — By moving to the
   Free plan, you'll lose access to Premium-only features, including:» ✗ «Atlassian Intelligence to supercharge teamwork» ·
   ✗ «Premium admin controls and security features» · ✗ «Unlimited users and storage» · ✗ «24/7 Premium Atlassian support» ·
   `Keep Premium` · **`Downgrade to Free`**.
3. Опитування «**Why did you decide to downgrade?** — We're always trying to improve our plans – we'd love your feedback.»:
   «We don't see enough value in the features.» · «The trial wasn't long enough for us to evaluate.» · «We're evaluating
   different products.» · «It's too expensive for us.» · «Something else.» · `Skip survey` · `Submit and confirm`.
   Натиснуто `Skip survey` (відповідь за власника не давали).
4. «**Your plan has been changed** — We've sent a confirmation email to all billing admins on this account. ✓ You're now on
   Jira Free.» · `Close`.
5. Сторінка підписки після: `Plan` — **Free** · `Next renewal` — 17 жовт. 2026 р. · «Renews on this date» · `Quantity` — 1
   user · `Usage Contribution` — **Automation steps 150 steps** (на Premium було: Indexed Objects 250, Rovo credits 70, Assets
   objects 1 000, Automation steps 750) · `Payment info` — No / None. Банер «Payment details needed» зник.

Картки й паролів не вводили; способу оплати на сайті немає.

## 2. Що змінилось в інтерфейсі Jira (порівняння з `screens/26`–`29`)

| Де | Premium (пробний, до 30.09) | **Free (30.09 після переходу)** |
| --- | --- | --- |
| Шапка | кнопка `See plans` | кнопка **`Upgrade`** |
| Бічна панель, `Recommended` | «Create a roadmap» `Try` | «Collect requests» `Try` |
| Бічна панель | `Plans` | `Plans` лишився (з `›`; клік сторінки не відкрив) |
| Рядок виглядів ділового спейсу | `MY`, `MARK`: … `Calendar · Capacity · Timeline` …; `REM`, `HR` — без `Capacity` | **усі чотири однакові: `Summary · Board · List · Calendar · Timeline · Approvals · Forms · Docs · Attachments · More 3 · +`** — `Capacity` немає ніде |
| Вкладка `Approvals` ділового спейсу | робочий вигляд | вкладка **є**, всередині — заглушка: «**Add approvals to your workflow** — Integrate approvals into your workflow to make sure all requirements are met before the work is considered done.» · `Learn more about approvals` · **`Try with Premium`** |
| Рейка `Space settings` ділового спейсу | Details · Access · Notifications › · Automation · **Approvals** · Fields · Work types › · Apps › | **Details · Access · Notifications › · Automation · Fields · Work types › · Apps ›** — `Approvals` **немає** (`REM`, `MY`, `HR`) |
| Рейка спейсу розробки `WEB` | … Work types › · Features · Custom filters · Toolchain · Apps › | без змін |
| Рядок виглядів `WEB` | Summary · Timeline · Board · Calendar · List · Forms · Development · Docs · + | без змін |
| Меню `•••` біля назви ділового спейсу | Add to starred · Add people · Save as template `Enterprise` · **Create a plan with this space `Try`** · Set space background › · Space settings ∣ Archive space · Delete space | Add to starred · Add people · Save as template `Enterprise` · Set space background › · Space settings ∣ **Archive space `Premium`** · Delete space ∣ «Business space · Team-managed» |
| `More 3` у `REM` | Reports · Archived work items · Shortcuts › | без змін |
| `+` → `Views` (`MARK`) | Board · List · Timeline | без змін («Board — Get a snapshot of the status of your team's work and easily drag your cards through a workflow.» · `Add to navigation`) |
| Картка роботи (`REM-4`), праворуч від статусу | ⚡ і **`Improve Task`** (`screens/26` п. 7 — картка `KAN-1`; `screens/29` §15 — `REM-6`) | лише статус і ⚡ (`Automation`); **`Improve Task` немає** |
| Картка, вкладки `Activity` | All · Comments · History · Work log · **Approvals** | All · Comments · History · Work log |
| Картка, підказки під полем коментаря | «Suggest a reply...» · «Who is working on this...?» · «Can I get more info...?» · «Status update...» | «🎉 Looks good!» · «👋 Need help?» · «⛔ This is blocked...» · «🔍 Can you clarify...?» · «✅ This is on track» · `More options` |
| Пошук робіт (`All work`), рядок запиту | **`Ask AI`** · Basic ∣ JQL · поле · Clear filters · Save filter | Basic ∣ JQL · `Search work` · `Space =` · Assignee · Type · Status · More filters · Clear filters · Save filter — **`Ask AI` немає**; праворуч угорі `Search all apps` · `Apps` · `Share` · `•••` |
| Помилка в JQL (`labels ==`) | текст помилки + кнопка **`Fix error`** | лише текст під полем: «Expecting a value or function but got '='. You must surround '=' in quotation marks to use it as a value. (line 1, character 9)»; **кнопки `Fix error` немає**; перемикач `Basic` неактивний; «There are no work items here yet — You either don't have any work items or your existing ones don't match your current filters.» |
| Майстер `Create space`, крок 1 | поле рівня доступу з трьома варіантами (`screens/28` §7.9) | **вибору доступу немає**: «**Access** Anyone with access to `<site>` can access and administer this space. `Upgrade your plan` to customize space permissions.» |
| Галерея `Space templates`, ліва колонка | Made for you · Custom templates `Enterprise` · Import data · CATEGORIES | Made for you · **Bundles** · Custom templates `Enterprise` · Import data · CATEGORIES (Software development · Service management · Work management · Product management · Marketing · Customer service · Human resources · Finance …) |

## 3. Що НЕ змінилось (теза курсу тримається й на справжньому Free)

- **Обидва типи спейсу** в майстрі: `How your space is managed` → `Team-managed` («For teams who want to control their own
  working processes and practices in a self-contained space. The configuration is simpler and gives admins more control over
  set up without involving a Jira admin. Settings do not impact other spaces.») і `Company-managed` `Administrators only`
  («For teams who work with others across many projects in a standard way that's set by your Jira admins. Encourage and
  promote organizational best practices through shared configuration.»).
- **`Add work type` у `MY`**: `SUGGESTED` — `Epic` (позначений) · `Bug` · `Story` · `Create work type` · `Add` · `Cancel`.
- **`Backup manager`** (`/secure/admin/CloudExport.jspa`): сторінка та сама, `Create backup for cloud` є.
- **Автоматизація:** `Create flow` → `Create with Rovo` · `Create from scratch` · `Create from template`; `Create with Rovo`
  відкриває той самий діалог «Automate work in minutes with Rovo» (поле «Describe what you want to automate and Rovo will
  build it…», підказки `Assign in-review work reviewer` · `Create recurring work item` · `Complete parent work item`, «Explore
  templates»: Prioritise new requests · Triage incoming bugs · Post incident updates to Slack, «Uses AI. Verify results.»).
  Запит не надсилали.
- **Вкладка `Usage`** рівня спейсу: «Last updated: Sep 30, 2026 at 11:17:51 AM» · **`Upgrade subscriptions`** ↗ · `Current
  month (September)` · `Automation step usage` — «22 steps» `Estimate` (Jira 22 · Other apps 0) · `Rovo credit usage in
  Automation` — «0 credits» `Estimate` · `High usage flows`: «Підзадача готова — відзначити в батьківській роботі · 3 · 9 · -
  · Користувач Jira · ENABLED». Межі в плитці не показано.
- **Редактор процесу** (`HR` → `Work types` → `Task` → `Edit workflow`): `Add status` · `Add Transition` · `Add Rule` · `Add
  agent` · `Update workflow` · `Close` · `Diagram` ∣ `Text`; `Add agent` відкриває діалог «Add Agent» (Transition «Choose a
  transition» · Trigger «Choose an agent» · Agent prompt (optional) «Enter prompt here» · «0 of 10,000 characters» · `Cancel`
  · `Add`). Скасовано.
- **Сторінка типу** (`MY`, `HR` → `Work types` → `Task`): та сама будова; права панель `Fields`: `Other fields` — «Agent
  Sessions»; `System fields` — Environment · Original estimate · Parent; `Create a field`; «Need to add a global field? Go to
  the Fields page».
- **Картка:** крихта `Add epic`, секції `Subtasks` («Add subtask»), `Linked work items`; меню `+`: «Find menu item» · Create
  subtask ⇧C · Link work item ⇧K ∣ Add attachment · Add web link ∣ `Recommended for you`: Video `Add` ×; сусіднє `•••` —
  `Add apps`; меню `•••` картки: Log work · Open command palette ⌘K ∣ Add vote ∣ Select cover › · Add parent · Clone · Move ·
  Archive · Delete ∣ Connect Slack channel ∣ Print · Export Excel · Export Word …
- **MCP** (2026-09-30, після переходу): `search` у режимі `STANDARD` працює (1 результат на «вивіска»); режим `AGENTIC` →
  403 «Agentic search is not enabled for this user or site.» — те саме, що було на пробному Premium.
- Перемикач застосунків, `More spaces`, `Filters` (Default filters: My open work items · Reported by me · All work items ·
  Open work items · Done work items · Viewed recently · Created recently · Resolved recently · Updated recently · View all
  filters), `Dashboards` — без змін.

## 4. Наслідки для курсу — що виправляти (черга; у тексти НЕ внесено)

| # | Теза в курсі | На справжньому Free | Де |
| --- | --- | --- | --- |
| F1 | 🔴 «`Ask AI`, `Fix error`, `Improve Task` працюють на безкоштовному плані» (переписано 2026-09-24 у вісім сторінок) | **цих кнопок на Free немає** — ні робочих, ні заглушок. Таблиця планів: `Atlassian Intelligence (AI)` — Free ✗, Standard ✗, Premium ✓ (`screens/30` §2); екран переходу: «you'll lose access to Premium-only features, including: Atlassian Intelligence…» | j03 (дім), j05, j07, j10, j13, j18, j22 (+ квіз), j23, обидва довідники; контракт §7, шаблони промптів |
| F2 | `Create with Rovo` / `Add agent` — діалоги відкриваються | **так само на Free** (перезняти наступного дня); запит не надсилали — чи збере flow без кредитів, невідомо | j14, j15, j10, довідник автоматизації — формулювання лишається, але вже з опорою на Free |
| F3 | 🔴 рейка `Space settings` ділового спейсу містить `Approvals` (канон п. 21 «дві рейки») | на Free **`Approvals` у рейці немає**; ділова рейка = рейка розробки без `Features · Custom filters · Toolchain` | j06, j09, j10 W1, j11 W1, j15, j20, довідник JQL; `program.md` п. 21; `wave8-common-*.md` |
| F4 | 🔴 `Capacity` — у `MY` і `MARK` | на Free **`Capacity` немає ніде**; рядок виглядів усіх ділових спейсів однаковий | j02?, j06 (вікно `MARK`, «Причина перша»), j13?, j21 (вікно `MY`); п. 21 |
| F5 | вкладка `Approvals` у рядку виглядів | є, але це заглушка `Try with Premium` | усюди, де рядок виглядів перелічено з `Approvals`, — одне чесне речення в домі теми (j06) |
| F6 | 🔴 «рівнів доступу до спейсу три» (j09 ~637, закрито `screens/28` §7.9) | на Free вибору доступу **немає** — спейс відкритий усім, хто має доступ до сайту | j09, j20 (доступ), j02 (що дає платний план) |
| F7 | `Archive space` у меню `•••` | пункт є з позначкою **`Premium`** | j05, j09, j20, j21 — звірити формулювання |
| F8 | картка: `Approvals` серед вкладок `Activity`; підказки під коментарем | вкладки немає; підказки інші | вікна карток у j04, j05, j18 — звірити |
| F9 | кнопка `See plans` у шапці | `Upgrade` | j02, j03 (вікна з шапкою) |
| F10 | ліміт автоматизації на Free | таблиця планів: «100 rule runs per month»; підписка: «Automation steps 150 steps» — **два різні числа в одній консолі**; довідку звірити окремо | j14, j15, j23, довідник автоматизації |
| F11 | галерея шаблонів | зʼявився пункт `Bundles` | j09, j12 — лише якщо вікно перелічує ліву колонку |

**Не перезнято на Free (черга дозйомки):** панель `Add an action` конструктора flow (блок «Rovo AI»: `Use agent`, `Use
Rovo`) · сторінка `Plans` · глобальна автоматизація (`Usage`, межі) · `Timeline`, `Summary`, `Calendar` ділового спейсу ·
картка у `WEB` · `Archived work items` · сторінка `Access` у `Space settings` · вікна уроків 1–8 (головна, список спейсів,
діалог створення) · повторний прогін flows уроку 15 · JSM і Confluence.

## 5. Пропозиція Jira Service Management на сайті з планом Free (не прийнято)

Бічна панель → `Recommended` → «Collect requests» `Try` (те саме вікно, що й «Work requests» у перемикачі застосунків):
«Jira Service Management — **See the whole picture, from request to resolution**» · «Gather requests from email, chat, or a
portal» · «View, triage, and resolve them in one place» · «See the whole picture, from request to resolution» · блок
`Service Collection` — «**14-days Standard trial includes:**» (на пробному Premium тут було «30-days Premium trial») ·
«By selecting “Next” you agree to the Atlassian Customer Agreement and Privacy Policy.» · `Cancel` · `Next`.
Закрито `Cancel`. **Безкоштовного шляху зсередини Jira немає:** JSM додається лише через пробний період (тепер — 14 днів
Standard) і згоду з угодою; далі план JSM довелося б знижувати до Free в адмінці так само, як план Jira (§1). Це і є шлях,
яким піде учень уроку 19, — його варто описати в уроці дослівно, коли власник дозволить пройти.

## 6. Друга порція перезвірки на Free (того ж дня; порівняння зі `screens/01`–`14`)

- **Головна `For you`** (вкладка `Recommended`): «Recommended spaces» · `View all spaces` · плитка «Моя команда — Software
  space» · вкладки `Recommended` · `Assigned to me` 1 · `Starred` · `Worked on` · `Viewed` · «Get your team set up for
  success» (Create tasks / Import existing work / Invite your team / Connect your tools — тексти як у `screens/01`) · «**Review
  work due soon** — You have work items overdue or due within 7 days. Update your progress to keep your team informed. Review
  all work due soon» · рядок роботи з кнопкою `Review` · «Revitalize your roadmap — Try Jira Product Discovery to explore,
  discuss, and prioritize ideas—then move the best ones straight into Jira.» `Try it` · `Dismiss` · `Give us feedback`.
  Привітання «Welcome … It's Thursday…» і поле «Find a space» зі `screens/01` зараз немає.
- **Список `Spaces`:** `Create space` · `Templates` · `Filter by app` · «6 spaces found» · колонки Name · Key · Type · Lead ·
  Space URL; типи — «Team-managed business» (`REM`, `MARK`, `MY`, `HR`) і «Team-managed software» (`KAN`, `WEB`). Без змін.
- 🔴 **Вигляд `List`** (`REM` і `KAN`): панель — `Search work` · аватари · `Filter` · `Group` · `•••`; **кнопки `Ask AI`
  немає** (`screens/04` ставив її першою). У діловому спейсі рядки вкладені (`REM-1` і `REM-6` розгортаються стрілкою);
  унизу `+ Create` · «4 of 4» · оновити.
- **`Summary` ділового спейсу** (`REM`): банер «Customize your Reports view to suit your space.» · `Filter` · плитки
  completed / updated / created / due soon · `Status overview` · `Recent activity` · `Priority breakdown` («Get a holistic
  view of how work is being prioritized. How to manage priorities for spaces») · `Types of work` (Task 67% · Workstream 17% ·
  Sub-task 17%) · `Team workload` («Monitor the capacity of your team. Reassign work items to get the right balance») ·
  **`Related spaces`** («Use spaces to manage all your work in one place and stay aligned with stakeholders.» `View all
  spaces`) — блоку `Epic progress` у діловому спейсі немає.
- 🔴 **`Space settings → Access` на Free** (`REM`): `Add people` · `Open access` · «This space has 1 role» · банер «**Unlock
  more control** — Access to this space is currently **Open**. To customize user access, such as roles and permissions,
  upgrade your plan to Standard.» `Upgrade` · `Learn more` · вкладки `Current users` · `Access requests` 0 · `Search roles` ·
  `Roles` · таблиця Name · Email · Role · Action → «Користувач Jira · (email приховано) · Administrator». Кнопки `Settings`
  зі `screens/10` немає.
- **Вкладка `Docs`** (`REM`): та сама заглушка, що у `screens/09`, — «Manage your project content, all in one place — No more
  switching between tools. Connect Confluence to your space to capture, organize, and share project knowledge right from
  Jira.» · `Try Confluence now` · `Discover Confluence` · «By selecting ‘Try Confluence now’, you will be enrolled in
  Confluence and agree to the Atlassian Cloud Terms of Service and Privacy policies.» Не натискали.
- 🔴 **Картка у спейсі розробки** (`KAN-2`): праворуч від статусу — `</>` («Open in coding tool») і ⚡ (`Automation`);
  **`Improve Task` немає**. Іконка замка у шапці — фіолетова; клік відкриває «**Upgrade to manage access** — To select which
  roles can view and edit this work item, upgrade your plan.» з трьома неактивними прапорцями «Administrator (full work item
  access)» · «Member (can do most things)» · «Viewer (view and comment only)» · `Learn more` · `Upgrade`. У шапці картки
  ділового спейсу (`REM-4`) замка немає. `Details` у `KAN-2`: Assignee · Parent · Priority · Labels · Due date · Team · Start
  date · Reporter · `Development` · `Automation` — як у `screens/06`.
- 🔴 **Глобальна автоматизація → `Usage`** (Settings → System → Global automation): перемикач **`Current usage model`** ∣
  **`Upcoming usage model`**.
  `Current usage model`: «**This month's usage** — Shows the number of flow runs available. Your usage resets через 1 день
  (1 жовтня).» · таблиця Product · Current usage · Used · Remaining · Total limit · Plan → «Jira · 3% · 97 · **100** · `Free` ·
  `Upgrade`» · «Jira Work Management is bundled with your existing products. Learn how Jira Work Management flows contribute
  to your usage» · `Usage trends` — «Your automation usage over the last 6 months.» · `Understanding automation usage`: «How
  is my usage calculated?» · «When will my monthly limit reset?» · «What happens if I reach my monthly limit?» · «What kinds
  of flows don't count towards my monthly limit?» · «Explore monthly usage for all spaces — Find the automations that are
  contributing most to your limits» · `Select product` Jira · `Select month` Current month's usage · таблиця Flow name · Used ·
  Owner · Scope · Enabled → «Підзадача готова — відзначити в батьківській роботі · 3 · … · ENABLED».
  `Upcoming usage model`: плитки `Automation step usage` «22 steps» `Estimate` і `Rovo credit usage in Automation` «0 credits»;
  `High usage flows` з колонкою `Scope` (Flow · Flow runs · Automation steps · Rovo credits · Scope · Owner · Enabled).
  **Закриває F10:** «100» — це запуски flow за чинною моделлю, «150 steps» у підписці — кроки за майбутньою моделлю; це дві
  різні одиниці, а не суперечність. Вкладка `Usage` рівня спейсу показує лише майбутню модель (кроки).
- **Глобальний список flows:** два тестові flows спейсу `TST` **лишились у списку** після перенесення спейсу в кошик — у
  колонці `Scope` замість назви стоїть число `10071`. Обидва **вимкнено** перемикачем (кореневою сесією, 30.09); не видалено.
  Теза зі `screens/29` §14 «flows підуть разом зі спейсом» — хибна.

## 7. Третя порція — вікна уроків, позначені «звірено», проти Free (урок за уроком)

Метод: текст кожного вікна уроку (`<figure class="win">`, 38 вікон із позначкою «звірено») зведено з живою сторінкою.
Вікна курсу схематичні (імена й дані — сюжет), тож звіряються написи інтерфейсу, склад панелей і рейок.

| Вікно | Що у вікні | На Free 30.09 | Вердикт |
| --- | --- | --- | --- |
| j02 W1, j03 W1 (верхня панель) | `+ Create` · `See plans` | `+ Create` · **`Upgrade`** | 🔴 правити (F9); квіз j03 про `See plans` — переписати |
| j03 W1 (головна) | «Welcome Оксана. It's Thursday, Sep 17.» · «Let's find your work in Jira» · плитка спейсу · `View all spaces` · вкладки `For you` | заголовка-привітання **немає**; «Recommended spaces» · `View all spaces` · плитка · `For you`: Recommended · Assigned to me · Starred · Worked on · Viewed | правити (привітання було лише на порожньому сайті або зникло — причина не встановлена) |
| j03 W2, j09 W1, j21 W1 (`Spaces`) | `Create space` · `Templates` · `Search spaces` · Name · Key · Type · Lead | те саме (+ `Filter by app`, `Space URL`) | ✅ |
| j03 W3 (`Personal settings → General`) | Your timezone · Language · Watch work items automatically · Jira homepage · Theme | те саме; нижче `Jira labs` («New work transition experience», «Quick search smart queries», «Store data on your own device», «Smart replies in work item comments») і `Connected apps` | ✅ |
| j01 W1, j04 W2, j05 W3, j10 W3, j21 W2 (дошки ділових спейсів) | рядок `Summary · Board · List (· Calendar)` · колонки · картки | рядок починається так само; `Capacity` у вікні j21 W2 — **немає на Free** | j21 W2 і j06 — правити (F4); решта ✅ |
| j04 W3, j06 W2 (`List`) | `Filter` · `Group` · `Configure columns` · колонки | `Search work` · аватари · `Filter` · `Group` · `•••`; `Ask AI` немає (у вікнах його й не було) | ✅ |
| j06 W3 (`Summary`) | плитки · `Status overview` · `Types of work` | те саме (`Related spaces` замість `Epic progress` у діловому) | ✅ |
| j04 W1, j05 W2, j11 W3, j17 W3, j22 W1 (картки) | статус · поля · `Subtasks` · `Linked work items` · `Activity · Comments` · `Add apps` | те саме; `Improve Task` у вікнах не намальовано | ✅ (проза про `Improve Task` — F1) |
| 🔴 j05 W1 (діалог `Create`) | «Add a description or type / for actions and Rovo» · чіпи `Automatic · Parent · Medium · Labels · Due date` | «**Add a description or type / for actions**» (слова Rovo немає) · чіпи у `MARK`: **`Automatic` · `Medium` · `Labels` · `Due date` · `Start date`** (чіпа `Parent` немає) · шапка «`MARK` ∣ ☑ `Task`» · три іконки (згорнути в куток · розгорнути · `×`) · унизу іконка · `Create another` · `Create` | 🔴 правити вікно й речення про Rovo в підказці (j05 ~242) |
| j07 W1 (`All work`, JQL) | `Basic` ∣ `JQL` · `Save filter` · поле · `Syntax help` · `Search` · `Clear filters` · `Share` · `•••` | те саме (праворуч угорі ще `Search all apps` · `Apps`) | ✅ |
| 🔴 j07 W3 (помилка JQL) | «JQL error: …» · **`Fix error`** ② | текст помилки під полем, **кнопки `Fix error` немає** | 🔴 правити вікно, крок і легенду (F1); те саме вікно в `jira-ref-jql.html` |
| j08 W2 (`Dashboards`) | `Create dashboard` · Owner · Space · Group · Name · Owner · Viewers · Editors · Starred by | те саме | ✅ |
| 🔴 j09 W2, j10 W1, j11 W1, j20 W1 (рейка ділового спейсу) | Details · Access · Notifications · Automation · **Approvals** · Fields · Work types · Apps | без `Approvals` | 🔴 правити (F3) |
| 🔴 j20 W1 (`Access`) | `Add people` · `Open access` · ролі `Administrator` / `Member` у рядках · `Remove` | банер «Unlock more control — Access to this space is currently Open. To customize user access, such as roles and permissions, upgrade your plan to Standard.»; «This space has 1 role»; у рядку — випайка ролі, усі пункти **неактивні** (Administrator ✓ · Guest - Collaborator · Member · Viewer — з описами); фільтр `Roles`: Administrator · Guest - Collaborator · Member · Viewer | 🔴 правити вікно й усе, що урок 20 каже про ролі на Free (F6); квіз j20 — звірити |
| j20 W2 (`General configuration`) | перемикачі `Options` | ті самі значення (додався «Allow reactions on comments — on») | ✅ |
| j12 W1 (галерея) | ліва колонка, картки | ліва колонка: `Made for you` · **`Bundles`** · `Custom templates` `Enterprise` · `Import data`; картки «Made for you»: Project management `Last created` · Product discovery `Try` · Advanced IT service mana… `Try` … | звірити перелік (F11) |
| j14 W1 (`Automation` у `MARK`) | `Create flow` · вкладки Flows · Audit log · Templates · Usage · фільтри | те саме | ✅ |
| j16 W1 (сповіщення), j16 W2 (`Docs` у `WEB`) | — | `Docs`: той самий текст і кнопки | ✅ (сповіщення не перезнімали) |
| j17 W1 (`Marketplace apps`) | «Explore apps for Jira» · Pricing · Trust signals · Categories · Use cases · More filters · «Showing over 1,000 apps» · `Sort by: Relevance` | те саме (картки інші: ScriptRunner for Jira · Jira Misc Workflow Extensions (JMWE) · Xray…) | ✅ (назви застосунків у вікні — приклад із датою) |
| j13 W1–W3, j15 W1–W3 | беклог, спринти, flow, `Usage`, `Audit log` | **не перезнято** — файли в роботі авторів хвилі 8б; `Usage` рівня спейсу на Free — §3 | перезняти після 8б |
| j21 W3 (`Import data into Jira`) | — | не перезнято | черга |

**Разом:** із 38 «живих» вікон на Free розходяться **дев'ять** — j02 W1, j03 W1, j05 W1, j07 W3, j09 W2, j10 W1, j11 W1,
j20 W1, j21 W2 (+ j06 проза й вікно з `Capacity`, + вікно з `Fix error` у довіднику JQL); решта збігається або не перезнята
(j13, j15, j16 W1, j21 W3).

## 8. Дозйомка на Free в тимчасових спейсах `TF` і `TFB` (запити авторів хвилі 8б; зупинено словом власника «закінчуй»)

**Майстер, діловий шаблон (Work management → Task tracking), Free:** категорія «Work management — Track, coordinate, and
manage work with structure and consistency using our work management templates.»; картки: Project management `Recommended` ·
Blank space («Start with a blank canvas») · Task tracking … Клік по картці одразу дає форму «Name your space»: `Name*` · `How
your space is managed` (Team-managed) · рядок `Access` (§2) · `Key*` (для «Test Free A» Jira підставила `TF`) · `Template` ·
`See details` · «Step 1 of 2» · `Next`. Після `Next` — 🟢 **тост, якого не вдавалось зловити тричі: «Jira space successfully
created — Just a few more steps to get it connected.»** Крок 2: «Bring your team along — Get a head start by inviting your
team while you wait.» · `Enter names or emails` («John Smith») · **`Role` — `Administrator`, поле неактивне** (на пробному
Premium тут стояло `Member`) · «Step 2 of 2» · `I'll do this later` · `Next`. Порожня дошка: `To Do` 0 · `Done` 0 · «No work
items — Create a work item to get started. Work will appear here.»

**Меню `•••` колонки** (діловий `TF` і розробки `TFB` — однакове): `Set column limit` · `Move column right` · `Delete status`.
Закриває запит про ліміт колонки в діловому спейсі.

**`Add work type` → `Epic` → `Add`** (`TF`, Task tracking): тост «**Work type created** — “Epic” has been successfully
created.»; рейка `Work types`: `Epic` ∣ `Task` ∣ `Sub-task` · `+ Add work type`; сторінка типу «Epic — Epics track large pieces
of work.» · `Edit workflow` · `•••`; у правій панелі `Other fields`: Agent Sessions · Category. Через MCP створено `TF-1`
(Epic) і `TF-2` (Task) — тип `Epic` у діловому спейсі після цього працює.

**Слот `Add epic` ставить батька:** картка `TF-2` → `Add epic` → випайка «Recent epics» → `TF-1 Тест: епік` ∣ `View all
epics` → клік по `TF-1` → крихта стала «Spaces / Test Free A / ⚡ TF-1 / ☑ TF-2». Закриває рядок 12 §11.2 повністю.

**Майстер, шаблон розробки (Software development → Kanban), Free:** категорія «Software development — Plan, track and
release great software. Get up and running quickly with templates that suit the way your team works. Plus, integrations for
DevOps teams that want to connect work across their entire toolchain.»; картки Kanban · Scrum · Top-level planning `Premium`
… Клік по картці дає **сторінку шаблону**: «Kanban — Visualize work in progress, reduce bottlenecks, and keep your team
moving with a flexible Kanban board.» · `Use template` · `Features`: Track work on a visual board · Limit work in progress ·
Continuously improve with agile reports · `Workflow`: To Do · In Progress · Done · `Work types`: Epic · Story · Bug · Task ·
Subtask. Форма: `Name*` · **`How your space is managed*` — `Please select`** (обовʼязкове, нічого не вибрано; у випайці
`Team-managed` `Last created` і `Company-managed` — без позначки `Administrators only`) · `Learn more about space types` ·
блок **`Space permissions`** — «Choose who can view, edit, and comment — With space permissions, control who has access to
your spaces and what they can do.» `Try it free for 14 days` · **`Key*` є на першому кроці** (`TFB`) · «**Step 1 of 3**».
Крок 2: «**Let's set up your space** — These form the building blocks of your space. You can change these settings later.» ·
`Configuration*` (кнопки `Suggest` і скидання) · `Work types` Epic, Story, Bug, Task › · `Statuses` To Do, In Progress, Done ›
· `Views` Summary, Timeline, Board, Calendar, List, Forms, Development, Docs › · перемикач `Start with sample work items`
(вимкнено). Крок 3: «**We're setting up your space...**» → «**Your space is ready**» (смуга поступу) · запрошення · `Role`
Administrator (неактивне) · `I'll do this later` · `Next`.

**Спейс розробки на Free (`TFB`):** ряд `Summary · Timeline · Board · Calendar · List · Forms · Development · Docs · +`.
`+` → `Views` — **10 пунктів**: Archived work items · Backlog · Code `Moved` · Deployments `Moved` · Goals · List · Releases ·
Reports · Security `Moved` · Shortcuts (**`Capacity` немає** — на пробному Premium було 11). `Backlog` → «Plan and prioritize
your team's work in a dedicated space.» → `Add to navigation` → вкладка `Backlog` остання.
**Вигляд `Backlog` без спринтів:** `Search backlog` · аватари · `Filter` · `Import work` · `View settings` · `•••`; секція
«**Board** (2 work items)» з лічильниками `2 · 0 · 0`, рядки робіт зі статусом, `+ Create`; роздільник «2 of 2 work items
visible»; секція «**Backlog** (0 work items)» — «Your backlog is empty.» · `+ Create` (іконка «Plan on whiteboard»).
**`Features` на Free:** `Planning` — `Sprints` («Complete work in fixed units of time. Requires a backlog. More about
Sprints») · `Estimation`; `More items` — `Standups in Jira` (увімкнено). Після додавання `Backlog` перемикач `Sprints`
активний; увімкнено. **Після ввімкнення:** у панелі зʼявилась іконка `Backlog insights`; секція «**TFB Sprint 1** · `Add
dates` · (0 work items)» · `0 · 0 · 0` · `Start sprint` (неактивна) · `•••` · «**Plan your sprint** — Drag work items from
the Backlog section or create new ones to plan the work for this sprint. Select Start sprint when you're ready.» · `+ Create`
· «0 of 0 work items visible» · секція «**Backlog** (2 work items)» · `Create sprint`. **Усе, що урок 13 описує про чергу й
перший спринт, на справжньому Free відтворюється дослівно** (назва спринта — `<ключ> Sprint 1`).

**Не зроблено (черга наступної сесії, у `TFB`):** перетягнути роботу в спринт → `Start sprint` → дошка спринта → `Complete
sprint`; звіти. **Слід:** тимчасові спейси **`TF` «Test Free A»** (Task tracking; доданий тип `Epic`, роботи `TF-1`, `TF-2`)
і **`TFB` «Test Free B»** (Kanban; вкладка `Backlog`, увімкнені `Sprints`, роботи `TFB-1`, `TFB-2`) — **лишені для
продовження дозйомки; після неї обидва в кошик** (так само, як `TST`, — рішення власника 2026-09-30).
