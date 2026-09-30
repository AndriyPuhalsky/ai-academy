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
