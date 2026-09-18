# Факти про Jira Cloud Free — перевірено по живих доксах 2026-09-17

Джерело правди для **довідника 3** (`jira-ref-map.html`, розділ «Ліміти Free») і для авторів.
Перевірено WebFetch-ом (агент-перевірник + коренева сесія) на `support.atlassian.com`,
`atlassian.com`, `developer.atlassian.com`; памʼять моделі джерелом не була. Маркетингові
сторінки цін (`atlassian.com/software/*/pricing`) віддають лише JS-оболонку — робоча «сторінка
планів» для курсу: **`support.atlassian.com/jira-cloud-administration/docs/explore-jira-cloud-plans/`**.
Sandbox-знімки — `00-research/screens/`. **Перед авторингом кожного уроку — перепровірити свій
рядок** (Atlassian змінює ліміти й терміни кілька разів на рік; наступний сезонний реліз — осінь 2026).

⚠ **Метод для таблиць планів (доведено 2026-09-17 на рядку №3):** багатоколонкові таблиці читати лише `curl` + розбір `<td>` (галочка = `<path d="M9.707 11.293…">`, прочерк = `-`) або очима в Chrome; WebFetch переплутав ✓ і – у трьох рядках JSM. Знімок таблиці — `screens/24-plans-table-jsm.md`.

## Ліміти й межі (числа — ЛИШЕ сюди і в довідник 3)

| # | Що | Значення на Free | Вердикт | Цитата (EN) | Сторінка | Урок |
| - | -- | ---------------- | ------- | ----------- | -------- | ---- |
| 19 | Користувачі Jira | **до 10** | ✅ | "Up to 10 users" | jira-cloud-administration/docs/explore-jira-cloud-plans/ | j02 |
| 19 | Сховище | 2 GB | ✅ | "2 GB file storage" | там само | дов. 3 |
| 19 | Сайтів | один | ✅ | "One" | там само | j03 |
| 18 | Назва сайту (URL) | **не змінити після створення**, якщо всі продукти на Free | ✅ | "If all of your Jira Cloud apps are on the Free plan, you can't update your site's URL after your site is created" | …/what-is-the-free-jira-cloud-plan/ | j03 |
| 18 | Неактивність | сайт можуть вимкнути, адмін отримує попередження | ✅ | "Atlassian reserves the right to deactivate Free Jira Cloud sites due to inactivity." | там само | j02, j20 |
| 15 | Email-сповіщення | **100 листів/день**, далі пауза до наступного дня | ✅ | "Jira can send a maximum of 100 emails per day on the Free plan. After 100 emails, notifications are paused until the following day." | там само | j05, j16 |
| 15 | Налаштування сповіщень | Settings → Personal Jira settings → Notification settings; кастомізація до 50 спейсів | ✅ | — | jira-software-cloud/docs/manage-your-jira-personal-settings/ | j05 |
| 8 | Дозволи / ролі | **не налаштовуються; на сайті, що завжди був Free, кожен — адмін усіх спейсів**; ролі team-managed: Administrator / Member / Viewer | ✅ | "If your site has always been on a Free plan, everyone with access to Jira is an admin for all Jira spaces." · "Space permissions, roles, and work-level security aren't customizable in Jira Free." | …/what-is-the-free-jira-cloud-plan/ · jira-software-cloud/docs/next-gen-permissions/ | j09, j20 |
| 19 | Audit log | немає | ✅ | "If all of your Jira Cloud apps are on the Free plan, you won't have access to audit logs." | …/what-is-the-free-jira-cloud-plan/ | j02 |
| 5 | Архівація робіт | лише Premium / Enterprise | ✅ | "Archiving issues is only available for Premium and Enterprise customers." | jira/kb/bulk-archive-issues-in-jira-cloud/ | j20 |
| 5 | Архівація спейсів | лише Premium / Enterprise | ✅ | "Space archiving is only available on Premium and Enterprise plans." | jira-cloud-administration/docs/archive-a-project/ | j20 |
| 13 | Автоматизація — модель | **кроки (steps)**, не runs; Jira Free — **150 steps per subscription**; пул на рівні організації | ✅ | "Automation usage is measured in steps. An automation step is a single executed part of an automation flow, including triggers, conditions, actions, branches, and loops." | cloud-automation/docs/how-is-my-usage-calculated/ · explore-jira-cloud-plans | j14, j15 |
| 13 | Автоматизація — білінг | перевитрата з **2026-12-03**, $0.50 за 1 000 додаткових кроків; сторінка Usage: **Automation → Usage** у Jira (є і в спейсі, і глобально — `screens/14`) та Atlassian Administration → Insights → Platform usage | ✅ | "On December 3, 2026, extra usage billing takes effect." · sandbox-банер: "Starting at your next renewal on or after December 3, 2026, Automation flow runs will count toward allocations for Rovo credits and Automation steps." | там само · `screens/14-automation-global.md` | j15, дов. 3 |
| 13b | «Single-project rules unlimited» | **більше не діє** | ❌ спростовано | "Usage limit: a monthly cap on the total number of successful rule runs for your product." (винятку немає) | automation/kb/difference-between-automation-service-limits-and-automation-usage-limits/ | j14 |
| 3 | JSM Free | **3 агенти**, клієнти — без ліміту, 2 GB, Community support. **Є:** multi-channel support, customizable workflows **і SLA**, custom reports, автоматизація **1 250 steps per subscription**, global and multi-space automation **100 executions per month**. **Немає (прочерк):** work-level security settings, audit logs, sandboxes, release tracks, multiple help centers on a single site, data pinning to a realm, uptime SLA; Assets і virtual service agent — лише Premium/Enterprise. **Звірено 2026-09-17 (вечір) трьома способами:** `curl` + розбір `<td>` (автор j02), повторний `curl` кореневою сесією і **очима в Chrome** (`screens/24-plans-table-jsm.md`) — усі три збіглися; ранкове прочитання WebFetch було хибним (✓/– переплутані) | ✅ | "Up to 3 agents" · "Unlimited" · "Customizable workflows and SLA's" · "Custom reports" · "1,250 steps per subscription" · "100 executions per month" | explore-jira-cloud-plans (розділ «Plans comparison for Jira Service Management») · `screens/24` | j18, j19 |
| 3 | JSM база знань | потребує **додати Confluence на сайт** (купувати не треба) — ⚠ автор j02 2026-09-17 цієї фрази на сторінці планів **не знайшов** (слів Confluence/knowledge base там немає); джерело шукати заново в `jira-service-management-cloud/docs/` (розділ «Knowledge base») | ⚠ | "No purchase of Confluence is required, but you must add Confluence to your site to unlock these features." | там само | j16, j19 |
| 9 | Confluence Free | 10 користувачів, 2 GB; дозволи не налаштовуються, анонімного доступу немає | ✅ | "Seats for up to 10 users" · "2 GB of file storage" · "Permissions aren't customizable and anonymous access isn't available." | confluence-cloud/docs/learn-about-confluence-cloud-plans/ | j16 |
| 9 | Jira у Confluence | макрос «Display Jira work items in a list», вставка `/jira` | ✅ (план не названий) | — | confluence-cloud/docs/insert-the-jira-issues-macro/ | j16 |
| 14 | Rovo MCP Server | **є на Free**: 500 викликів/год (Standard 1 000; Premium/Enterprise 1 000 + 20/користувача, до 10 000) | ✅ | "All Atlassian Cloud customers have access to the Atlassian Rovo MCP server, although there are site-level rate limits depending on what Jira and Confluence plan you're on." · "Free: 500 calls per hour" | atlassian.com/platform/remote-mcp-server | j22 |
| 14 | Endpoint MCP | докси: `https://mcp.atlassian.com/v2/mcp`; маркетинг: `https://mcp.atlassian.com/v1/mcp/authv2` — **розходяться** | ⚠ | — | support.atlassian.com/rovo/docs/getting-started-with-the-atlassian-remote-mcp-server/ · atlassian.com/platform/remote-mcp-server | j22 — **перевірити наживо** |
| 14b | Rovo / AI в UI | **немає на Free**: кредити лише в платних планах; кнопки Ask AI · Improve Task · Add agent у UI Free — апсел (`screens/04`, `06`, `12`) | ❌ для Free | "Rovo credits are included in all paid Jira, Confluence, Service Collection and Teamwork Collection cloud subscriptions." | support.atlassian.com/rovo/docs/rovo-usage-limits/ | j22 |
| 14b | Ризик для j22 | докси кажуть, що виклики MCP споживають Rovo-кредити, а Free кредитів не має — **суперечність**; урок писати так, щоб не розсипався, якщо MCP на Free упреться в нуль | ⚠ | — | там само | j22 — перевірити після ввімкнення конектора |
| 7 | Bulk change | до 1 000 робіт за раз (Cloud) | ✅ | "You can edit fields in up to 1,000 work items at the same time." | jira-software-cloud/docs/edit-multiple-issues/ | j07 |
| 4 | Експорт CSV | до 1 000 робіт за один пакет | ✅ | "Each batch export has a maximum limit of 1,000 work items." | jira/kb/export-over-10-000-work-items-in-jira-cloud/ | j20 |
| 4 | Backup manager | шлях: Settings → System → **Backup manager** (розділ IMPORT AND EXPORT); доступність на Free **не названа**; платний add-on Backup and Restore — Premium/Enterprise | ⚠ | "Select Settings then System. In the IMPORT AND EXPORT section, select Backup manager." | jira-cloud-administration/docs/export-issues/ | j20 — перевірити в sandbox |
| 6 | Імпорт CSV | потрібен site/Jira admin (на Free — кожен); новий імпорт: Asana, monday, ClickUp, Trello, Azure DevOps, GitHub, GitLab, Smartsheet, YouTrack, Notion, Linear, Wrike, Airtable, Jira, CSV (`screens/19`) | ✅ | "You need to be an organization, site, or Jira administrator to use the importer." | jira-cloud-administration/docs/import-data-from-a-csv-file/ · jira-software-cloud/docs/import-data-directly-from-trello-into-jira/ | j21 |
| 1 | Робота з email (Jira, не JSM) | лише admin-рівня **incoming mail handler** (POP/IMAP); окремої адреси спейсу для software/business немає — це фіча JSM | ⚠ частково | "Work items and comments in Jira can be generated from email messages sent to your cloud app's default POP mail server." | jira-cloud-administration/docs/create-issues-and-comments-from-email/ | j16 (згадка), j18 (JSM) |
| 2 | Forms | у меню виглядів team-managed software space на Free **є** пункт Forms (`screens/08`); докси плану не називають | ⚠ | — | jira-software-cloud/docs/what-are-forms-and-what-can-they-do/ · jira-service-management-cloud/docs/what-are-forms/ | j19 — перевірити в sandbox |
| 10 | Дашборди | є; гаджети Filter Results, Pie Chart, Created vs Resolved, Two Dimensional Filter Statistics; шаринг: Group / Space / Any logged-in user / Public / User; у System settings «Allow users to share dashboards and filters with the public» за замовчуванням **off** (`screens/18`) | ✅ | "Any logged-in user—Any user who is logged in to your Jira Cloud site." | jira-cloud-administration/docs/manage-shared-dashboards/ · use-dashboard-gadgets/ | j08 |
| 11 | Вигляди team-managed software | меню «+»: Archived work items · Backlog · Calendar · Capacity · Code · Deployments · Forms · Goals · List · … (`screens/08`); повного списку в доксах немає | ⚠ | "In team-managed software spaces, you can enable and disable different features to suit your team's needs." | jira-software-cloud/docs/how-do-features-differ-based-on-project-type/ | j06, j13 |
| 12 | Team- / company-managed | обидва на Free; **спільна конфігурація (shared configuration) company-managed — не на Free** | ✅ | "Any user can create their own team-managed space unless a Jira admin changes this in global permissions." | jira-software-cloud/docs/create-a-new-project/ | j09 |
| 16 | Time tracking | завжди увімкнений; у team-managed Estimation вимкнена за замовчуванням, поля Original estimate + Time tracking додаються руками | ✅ | "Time tracking is always enabled in Jira Cloud spaces." | jira-cloud-administration/docs/configure-time-tracking/ | j11 (ЧаПи) |
| 17 | Українська мова | у списку мов акаунта є, але для **Jira, JSM, JPD, Confluence — ❌**; ✅ для Compass, Home, Help center, **Customer Portal**. Sandbox: акаунт українською → Jira UI англійський (`screens/17`) | ✅ уточнено | "Portuguese (Portugal), Estonian, Icelandic, and Slovak are available for selection; however, we do not currently offer active support for these languages." | atlassian-account/docs/manage-your-language-preferences/ | j03, j18 (Customer Portal ✅ українською — підтверджено `curl`-ом таблиці мов рецензентами j01 і j03 2026-09-17; наживо на порталі — після додавання JSM) |
| 20 | Marketplace $0 для 1–10 | **опція вендора**, не правило; фільтр «Free up to 10 users» — існування на 2026-09-17 не підтверджено (Marketplace — JS-застосунок) | ⚠ | "we are now giving Marketplace Partners the option to set a 1-10 user pricing tier to any price, including $0.00." | community.developer.atlassian.com (анонс) | j17 |
| 19 | Apps на Free | **є** («Apps and integrations» ✅ у таблиці планів); частина застосунків працює обмежено | ✅ | "Some apps might have reduced functionality in Jira Free" | explore-jira-cloud-plans · what-is-the-free-jira-cloud-plan | j17 |

## Зміни, які визначають «стабільність» (для довідника 3, розділ «Що змінилось»)

| Зміна | Статус на 2026-09-17 | Де видно |
| ----- | -------------------- | -------- |
| `issue → work item` | завершено; opt-out немає; у URL і id полів досі `issues`, `browse/`, `customfield_` | `screens/README.md` |
| `project → space` | завершено (Free/Standard з 2025-09-01); у URL `projects`, в імпорті й шаблонах flows досі «project» | `screens/02`, `14`, `19` |
| `automation rule → flow` | **у UI 2026 — «flow»** (Create flow, Browse flows); у доксах ще «rule» | `screens/13`, `14` |
| Нова навігація (sidebar, For you) | GA з 2025-03; тепер ще й «Docs» і «Development» як вигляди спейсу | `screens/01`, `03` |
| Сезонні релізи | три на рік з 2026 (весна · літо · осінь) | протокол підтримки |
| Automation: runs → steps, білінг за перевитрату | з 2026-12-03 | `screens/14` |
| Rovo в UI (Ask AI, Improve, Add agent) | видно на Free як апсел | `screens/04`, `06`, `12` |

## Юридичне (без змін від 2026-09-17, з `.local.md`)
- Назви Atlassian — fair use без письмової згоди, «without modification or deceptive intent»
  (`atlassian.com/legal/trademark`); заборонено копіювати look and feel, шрифт Charlie Sans, бренд у своєму лого.
- Дисклеймер курсу: «Незалежний освітній матеріал. Не створений, не спонсорований і не схвалений
  Atlassian. Jira, Atlassian, Confluence — торгові марки Atlassian Pty Ltd.»

## Не вдалось перевірити (до авторингу відповідного уроку)
| Що | Чому | Хто закриває |
| -- | ---- | ------------ |
| Forms на Free (функціонально) | докси плану не називають | sandbox, j19 |
| Backup manager на Free | докси плану не називають; `jira/kb/automate-backups-for-jira-cloud/` → 404 | sandbox, j20 |
| Повний список виглядів team-managed software | у доксах врозсип | sandbox «+», j06 |
| Фільтр «Free up to 10 users» у Marketplace | JS-застосунок | sandbox `/jira/marketplace/discover`, j17 |
| Розподіл ✅/❌ мов по продуктах | прочитано моделлю з таблиці | очима власника, j18 (портал) |
| Адреса пошти для business-спейсу (не JSM) | у доксах лише JSM і mail handler | j16 — писати обережно |
| Endpoint MCP і кредити на Free | два офіційні джерела розходяться | після ввімкнення конектора, j22 |
| Автоматизація на JSM Free у sandbox | продукту ще немає на сайті | після додавання JSM, j19 |
| Платіжна картка при реєстрації Free — не запитується (твердження j03) | у доксах слів `credit card` немає (curl 2026-09-17) | **власник** — з власного досвіду створення sandbox; або новий акаунт |
| Символи назви сайту (кирилиця не працює — твердження j03) | правил символів у доксах немає | **власник** / майстер реєстрації |
| Лист після реєстрації — чи містить адресу сайту (j03 каже «ні») | негативне твердження без джерела | **власник** — лист від `noreply@…` при створенні sandbox |
| Клік по `Ask AI` / `Improve` на Free — що показує | ніхто не клікав | sandbox, наступна сесія (j03 ЧаПи, j22) |
| Зміна мови акаунта не перейменовує вже створені статуси (j03, блок 6) | інференція з одного спостереження | A/B у sandbox з дозволу власника (зміна мови — налаштування акаунта) |

**Дописано після хвилі 2 (j04–j10, ніч 2026-09-17 → 18) — лише живим sandbox, повні формулювання у `reports/jNN.md` §5:**
- ⚠ **Company-managed спейс на Free:** чи є вибір `Company-managed` у майстрі `Create space` і що буде при виборі
  (j09; те саме питав рецензент j02). Докси: лише «shared configuration… isn't available on the Free plan».
- ⚠ **Мітки:** глобальні для сайту чи свої в team-managed спейсі (А/Б: створити мітку в одному спейсі, шукати в
  іншому); чи приймає Jira кириличну мітку (`labels = "дозволи"`) (j04, j07).
- ⚠ **Виконавець рівно один** — прямої цитати немає (j04).
- ⚠ **`Fix error` у JQL на Free** — що робить кнопка (докси: AI-підказка, Rovo лише на платних) (j07).
- ⚠ **`Public sharing` на Free** — перемикач неактивний чи просто вимкнений (j08). Докси: «Free Jira sites can't
  be opened to the public».
- ⚠ **Розмір вкладення** — 1 GB (`add-an-attachment-to-an-issue`) проти 10 MB (`add-files-images…`), обидві живі (j05).
- ⚠ **Старе посилання після `Move`** — єдине джерело KB «generated by AI» (j05).
- Дознімати (лише перегляд): business-спейс (`screens/21` — чекають j02, j03, j05, j06, j09) · дошка з `Group` ·
  `Configure columns` · календар з `Unscheduled work` · таймлайн з епіком · майстер `Add gadget` + панель
  налаштувань гаджета · діалог `Create dashboard` · меню `•••` біля назви спейсу · сторінка `Access` ·
  `Filters` з кількома фільтрами · `Save filter` + панель `Details` · Personal settings → `Jira labs` ·
  редактор workflow: режим `Text`, панель деталей статусу, `Add Rule`, `Update workflow`.

**Дописано після рецензії хвилі 2 (2026-09-18, ранок) — лише живим sandbox:**
- 🔴 **Старе посилання після `Move` роботи в інший спейс** — чи відкриває стару адресу (`/browse/OLD-1`) на новому ключі. Єдине джерело — стаття «generated by AI»; на факті правильна відповідь квіза j05 №4. Проба: перенести одну роботу, відкрити старе посилання.
- ⚠ **`issuetype = Task` у JQL** — чи приймає (жива `jql-fields` дає лише `type` / `workType`); заразом що пропонує автопідказка (j04, j07, довідник 1).
- ⚠ **`Export` на сторінці `All work`** — чи є кнопка поруч із `Share` (у `screens/15` немає; докси ведуть через `•••`) (j07).
- ⚠ **Шаблон, з якого створено `KAN` і спейси сюжету** — скільки статусів дав (два для task management, три для project management за доксами); від цього залежать кроки «Зроби сам» у j03, j09, j10, j12.
- ⚠ **`Space settings → Work types` у бізнес-спейсі** — чи є друга колонка з типами роботи (j10 W1).
- Дознімати додатково: панель дошки цілком (`Search board`, `View settings` — j06) · `Activity Stream` на дашборді (чиї події) · сторінка сповіщень із видимим пунктом меню шестірні · картка з уже призначеним виконавцем (`Assign to me`?) · JSM-спейс у списку `Spaces` (напис `Type`).

**Дописано після хвилі 3 (j11–j14, 2026-09-18, день) — лише живим sandbox:**
- ⚠ **Бізнес-спейс:** чи є `+ Add work type` і `Epic` серед запропонованих (j11) · чи є `Set column limit` на діловій
  дошці `MARK` (j13) · чи є `Sprints`/`Estimation` на сторінці `Features` (j13) · чи є розділ `Board` у налаштуваннях
  (j13; у `screens/10` немає) · чи зʼявляються картки одразу після створення з ділового шаблону («sample data», j12).
- ⚠ **Майстер `Create space`:** екран після `Use template` — поле ключа, вибір типу, чекбокс `Share settings…` (j09, j12).
- ⚠ **Поля:** діалог `Create a field` (назви полів); колонка `Category` у списку й панель `Edit field` (j11, j12).
- ⚠ **Kanban:** як друкується число ліміту на дошці team-managed після постановки (j13).
- ⚠ **Автоматизація:** меню `Create flow`; конструктор з трьома кроками; вкладка `Templates`; **`Audit log` з хоча
  б одним запуском** — закриє два вікна j14 і вікно j15 (j14).

**Дописано після рецензії хвилі 3 (2026-09-18, день):**
- ⚠ **`+ Add work type` і `Epic` у діловому спейсі** — найдорожче: на цьому кроки j11, j12, j13, j21, а виноски в тексті j11 немає (Ф-4).
- ⚠ **`Audit log` з хоча б одним запуском** — підписи `Status` (j14 узяв зі сторінки performance insights); якщо інші — правити j14 і j15 разом.
- ⚠ Кириличні назви полів у JQL (`"Посада" = "Бариста"`) · напис `Show more fields` / `Show 2 more fields` · права панель `Fields` у діловому спейсі (j11).
