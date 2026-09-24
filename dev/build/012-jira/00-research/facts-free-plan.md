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
| 19b | Одинадцятий користувач | додати **можна**: сайт автоматично переходить на пробний Standard; назад на Free — зменшивши число людей (звірено 2026-09-20; до цього j02 стверджував «додати не дасть» без джерела) | ✅ | "Adding more users will automatically move you from a Free plan to a Standard plan trial. You can switch back to a Free plan at any time by reducing your user count." | subscriptions-and-billing/docs/manage-users-and-user-tiers/ (частина «Improved billing experience») | j02, j20 |
| 19c | Що рахується місцем | доступ до продукту, а не активність: запрошений займає місце до першого входу | ✅ | "Atlassian app pricing is based on the number of users who can access the app" · "Additional users are automatically counted towards billing even if they don't accept your invite or log in" | там само | j20 |
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
| 3 | JSM база знань | потребує **Confluence на тому самому сайті — щонайменше на плані Free**; фрази «No purchase of Confluence is required» у живих доксах **немає** (не вживати «купувати не треба») — закрито незалежно авторами j16 і j18 2026-09-18; шлях у спейсі: `Space settings → Channels & self service → Knowledge base`; додає site/org admin | ✅ | "at a minimum, you'll need to have a Free plan of Confluence on the same site" · "You need to be a site admin or an organization admin…" | jira-service-management-cloud/docs/add-confluence-to-set-up-knowledge-base/ | j16, j18, j19 |
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
| 20 | Marketplace $0 для 1–10 | **опція вендора**, не правило (допис від **2021-12-07** — єдине джерело); фільтр **`Free up to 10 users` існує** (`freeStarterTier`), поруч `Free for all teams` — підтверджено автором j17 2026-09-18 `curl`-ом сторінки пошуку `marketplace.atlassian.com` (фасети в HTML); усередині Jira фільтр `Pricing` ніхто не розкривав | ✅ (усередині Jira — ⚠) | "we are now giving Marketplace Partners the option to set a 1-10 user pricing tier to any price, including $0.00." | community.developer.atlassian.com (анонс) | j17 |
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
| Докси автоматизації: `rule → flow`, `component → step` | у живих доксах уже всюди (2026-09-18); `rule` лишився в слагах адрес | `reports/j14.md`, `j15.md` |
| `Pages → Docs` | у польоті: «We're currently updating the Pages experience and renaming it to “Docs”»; адреса лишається `/pages` | `screens/09`, `reports/j16.md` |
| Сторінка сповіщень — три написи | `Notification settings` (докси) · `Emails and notifications` (екран) · «Space and work item notifications» (довідки Slack/Teams) | `screens/17`, `reports/j16.md` |
| `Cloud Fortified → Atlassian Enterprise Certified` | заявки закриті з 2026-09-01; «The CFA program will be retired on 31st December, 2026»; бейдж на екрані ще є | `screens/20`, `reports/j17.md` |

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
| ~~Фільтр «Free up to 10 users» у Marketplace~~ | **закрито 2026-09-18 (j17):** існує на `marketplace.atlassian.com`; лишається розкрити `Pricing` усередині Jira | sandbox `/jira/marketplace/discover` |
| Розподіл ✅/❌ мов по продуктах | прочитано моделлю з таблиці | очима власника, j18 (портал) |
| ~~Адреса пошти для business-спейсу (не JSM)~~ | **закрито 2026-09-18 (j16):** окремої адреси немає — лише mail handler (право `Administer Jira`); власна адреса відправника — «This page applies to company-managed spaces only»; у j16 не стверджується | — |
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

**Дописано після хвилі 4 (j15–j18, 2026-09-18, ніч) — лише живим sandbox; повні формулювання у `reports/jNN.md` §5:**
- ⚠ **Автоматизація (j15, закриває й j14):** `Audit log` із запуском і **розгорнутим рядком** (підписи `Status`, підзаголовок
  `Log message`, обчислені значення) · конструктор flow із гілкою (як підписаний крок гілки, де вибір спорідненості) ·
  вкладка `Usage` **на рівні спейсу** (чи той самий набір плиток, що на глобальній) · панель `{}` розумних значень ·
  налаштування `Scheduled` (мінімальний інтервал, підпис поля JQL).
- ⚠ **Сповіщення й Docs (j16):** сторінка сповіщень зі **станом галочок** і підписом рейки · **меню `+` у діловому спейсі —
  чи є там `Docs`** (на цьому крок 7 «Зроби сам» j16) · після додавання Confluence: вкладка `Docs` зі списком сторінок +
  сторінка з макросом `/jira` (зніме «за документацією» з W3) · меню календаря спейсу (експорт/підписка) · живий лист
  від Jira у скриньці (поле `From`).
- ⚠ **Marketplace (j17):** екран згоди на доступ при `Get it now` для безкоштовного застосунку (**дійти й не
  підтверджувати**) · `Connected apps` з будь-яким встановленим застосунком (зніме «за документацією» з W2 — потрібен
  дозвіл власника на встановлення) · розкритий `Pricing` усередині Jira · фільтр `Use cases` (на сайті Marketplace
  такого фасета немає) · меню `Add apps` на картці роботи.
- ⚠ **JSM (j18, усе після додавання продукту):** портал очима клієнта — **точний напис у полі пошуку** (обіцянка ще з j01),
  вступний текст, плитки, `Requests` · сторінка черг (назви типових черг шаблону, як друкується годинник SLA) · картка
  заявки очима агента (панель SLA, рядок відповіді) · `Channels` — **чи є адреса пошти на Free** · `Space settings →
  Request management` (типи запитів, `SLAs` — для j19) · галерея `Create space` після додавання JSM · колонка `Type` у
  `Spaces` (закриє j03/j09) · **які статуси приносить шаблон** (§3: робочий канон `Open → Work in progress → Waiting
  for customer → Done` — до j19) · що стає з планом сайту після додавання JSM (пробний платний → Free?).
- ⚠ Без sandbox не закривається й лишено в текстах чесною виноскою: `Europe/Kyiv` у `convertToTimeZone` (j15) · підписка
  Google Calendar на календар спейсу — у доксах лише для календаря змін JSM (j16) · як присуджуються `SPOTLIGHT` /
  `BESTSELLER` (j17) · портал українською — лише таблиця мов (j18).

**Дописано після рецензії хвилі 4 (2026-09-19, ніч):**
- ✅ **Slack-застосунок на Marketplace:** картка «Jira Cloud for Slack (Official)», vendor Atlassian, status `public` —
  `marketplace.atlassian.com/rest/2/addons/com.atlassian.jira.slack` (перевірено кореневою сесією 2026-09-19); пошук REST
  за текстом її **не повертає** — «пошук не знайшов» ≠ «картки немає»; Cloud-картки для Teams немає. Встановлення довідка
  веде через крамницю чату (j16, j17).
- ✅ **`Works with` у Marketplace має окреме значення `Jira Service Management`** (`value: "jira-service-desk"`) — знахідка
  автора j17 «окремого рядка JSM немає» не підтвердилась (рецензент j17).
- ✅ **Листи понад галочки:** «Even if you clear all checkboxes, you may still receive other email notifications configured
  by your Jira admin» (`manage-your-jira-personal-settings`, звірено наживо 2026-09-19) — j16.
- ✅ **Майстер службового спейсу:** «Select **Use template** next to the template you want to use. Select **Team-managed**.»
  (`create-edit-and-delete-team-managed-service-projects`, звірено наживо 2026-09-19) — j18, j19.
- ⚠ **Лише sandbox (додано до списків хвилі 4):** запуск flow з **порожнім** результатом `Lookup work items` — чи йде лист і
  що в колонці `Status` (j15) · картка заявки очима агента — **чи є розділ `Agents` і як підписаний** (j18) · сторінка з
  макросом `/jira` — які колонки за замовчуванням (j16) · що стає з планом сайту після додавання JSM — цитата в j18 зі
  сторінки для «Organization admin / Enterprise plan», абзац переписати після живого додавання · **лист-підтвердження
  клієнтові при створенні заявки** — у доксах не знайдений, картка j19 на нього розраховує.

**Дописано після хвилі 5 (j19–j22, 2026-09-19, ранок) — хвиля йшла без живого середовища; повні формулювання у `reports/jNN.md` §5–§6:**
- ✅ **№14 (endpoint MCP) — ЗАКРИТО 2026-09-19:** живі обидві адреси — `https://mcp.atlassian.com/v2/mcp` → 401 + `www-authenticate: Bearer resource_metadata=…`; `…/v1/mcp/authv2` → 401 + `error="invalid_token"` (звірено автором j22 і незалежно кореневою сесією). Чинні докси підключення дають **v2**; «The tools listed on this page are only available with Atlassian MCP v2», «On March 1, 2027 any existing utilization of v1 will automatically start to expose and utilize v2 tools». Маркетингова сторінка (`atlassian.com/platform/rovo-mcp`) досі містить v1 у кнопці встановлення. **Докси переїхали:** `support.atlassian.com/rovo/docs/getting-started-…` → `support.atlassian.com/atlassian-ai-gateway/docs/get-started-with-the-atlassian-remote-mcp-server/` (хаб `…/atlassian-ai-gateway/resources/`).
- ✅ **№14b (кредити Rovo і MCP на Free) — ЗАКРИТО 2026-09-19, суперечності немає:** `rovo-usage-limits` ділить виклики — безкоштовні «running commands to look up or update context in any single Atlassian product» (зокрема «Write operations such as updating a Jira work item»), за кредити — крос-продуктові й пошукові. Останній рядок («що робить Free-сайт при крос-продуктовому виклику») — лише живим прогоном.
- ⚠ **№2 (Forms на Free) — НЕ закрито:** рядка `Forms` у таблиці планів JSM немає (`screens/24`), сторінки `what-are-forms`, `use-forms-in-jira-service-management` плану не називають. j19 побудований на полях типу запиту.
- ⚠ **№4 уточнено (j20):** «Each batch export has a maximum limit of 1,000 work items» — з deprecated-обхідного шляху (KB); основне — «up to 10,000 … asynchronous Export CSV». `Backup manager` на Free — **не закрито**, крок у j20 умовний.
- ⚠ **№6 уточнено (j21):** цитата «You need to be an organization, site, or Jira administrator to use the importer» сьогодні живе на сторінці Trello-імпортера; на CSV-сторінках — «…to use the new import experience»; оглядова сторінка каже «Most imports don't require org admin permissions…» (докси проти доксів). **Імпорт/експорт не входять у право `Administer Jira`** (j20: «Users with this permission cannot: … import and export data»).
- 🔴 **Сторінки змінюються на ходу:** KB `restore-deleted-work-items-in-jira-cloud-using-local-backup-files` оновлена 2026-09-18 — цитати j05 замінені кореневою сесією 2026-09-19; форуми спільноти 2026-09-19 у read-only до 2026-09-22 (j22 — перевірити посилання перед релізом); довідка адмінки перейменовує «product» → «app».
- **Живий прогін MCP (після `/mcp` → `claude.ai Atlassian`), сценарій — `reports/j22.md` §5.2:** екран OAuth-згоди (заголовок, сайт, перелік дозволів, напис кнопки → `screens/25-oauth-consent.md`) · панель `/mcp` зі статусом · рядок `claude mcp list` · три запити українською (читання → підсумок → створення трьох робіт): текст вікна підтвердження інструмента, **чиє імʼя стає в `Reporter`**, рядок історії, чи зрозумів український запит · крос-продуктовий запит із Free-сайту.
- **Sandbox після додавання JSM (j19, за цінністю):** сторінка типу запиту з обраним типом (секції чи вкладки, `Hide fields below`, палітра полів, **чи є Forms**) → `SLAs` + діалог `Add calendar` → діалог `Create new queue` (колонки за замовчуванням, формат годинника) → бічний список черг із лічильниками → портал `Requests` очима клієнта → `Notifications → Customer notifications` на Free → `Portal groups`.
- **Sandbox без JSM (j20, j21):** `Settings → System` — **чи є `Backup manager`** → `Directory → Users` (очима власника; домен поза дозволами) → діалог `Invite users` → `Access` бізнес-спейсу → сторінка безпеки акаунта (two-step verification) → кирилична мітка в JQL → перший екран майстра CSV + `Map space fields` → картка зі значком повторення й діалог `Set to recur` → `Bulk change → Move work items` зі зіставленням статусів.

**Дописано після рецензії хвилі 5 (2026-09-19, день):**
- ⚠ **Нове для sandbox (JSM):** `Space settings → Automation` у службовому спейсі — чи стоїть `Create flow`; сторінка налаштувань службового спейсу цілком (довідка описує два різні набори розділів — «плоский» і «згорнутий» через `Request management`); поле вкладення у формі запиту (картка j19).
- ⚠ **Нове для sandbox (без JSM):** A/B перемикача `Allow people to request space access` → чи зникає вкладка `Access requests` (j20); склад меню `•••` у `Directory → Users` і де живе `Grant access`; що рахує напис `This space has 1 role`; справжня рейка `Settings → System` і регістр `General configuration`.
- ⚠ **Живий прогін MCP (додано рецензентом j22):** вікно підтвердження MCP-інструмента в Claude Code («видно, який інструмент і з якими даними» — єдина обіцянка j22 без знімка); створена картка — `Reporter`, **чи проставився `Assignee`**, рядок історії, чи з'явився новий елемент інтерфейсу Jira; сторінка сертифікацій — знімком у браузері (`curl` дає 32 символи).
- **Після 2026-09-22:** форуми спільноти Atlassian перезапускаються на новій платформі — перевірити назви розділів і цитати Learning/Champions у j22.
- **Таблиці планів:** у Jira-таблиці клітинка Free для відсутньої функції **порожня**, у JSM-таблиці — прочерк `-` (однаковий сенс, різний запис) — врахувати в розборі `<td>`.

**Дописано 2026-09-20 (хвиля 6: іспит j23 ∥ хвости кореневої сесії; розширення Chrome не підключене, sandbox не знімався):**
- ✅ **Одинадцятий користувач (рядки №19b–19c вище):** твердження j02 «одинадцяту людину Jira додати не дасть» стояло без джерела з хвилі 1 (рецензент j02 тоді ж записав: «дослівної цитати я не знайшов») і суперечить довідці про рахунки — виправлено в j02 (три місця) і підперто двома цитатами в j20. **Метод знахідки:** шукали пряму цитату для тези рецензента j20 про «непрямі опори» — знайшли більше, ніж шукали.
- ✅ **Сторінка сертифікацій (j22) — закрито без розширення браузера:** `community.atlassian.com/learning/certifications` рендериться клієнтом (`curl` → 30 символів), але це **публічна** сторінка — її знято власним headless Chrome по CDP (тимчасовий профіль, без входу; метод QA `method_cdp_own_chrome.md`), акордеон FAQ розгорнуто кліком по `div[role="button"][data-testid^="accordion-tab-"]`. Дослівно: «Atlassian Certificates are free. The Atlassian Certified Professional exam fee is $249. The Atlassian Certified Associate exam fee is $100.»; «Atlassian offers two types of certifications, depending on your experience and career goals»; рівні — «Designed for professionals who use Atlassian apps in their jobs» (Associate) і «Crafted for Atlassian solution administrators» (Professional); сертифікати — «Built for Atlassian app users». **Суми — лише тут і в довіднику-карті, в урок не пішли.** Слова «badge» на сторінці немає — тема картки «бейджі» знята. Розділ зветься `Credentials` і живе всередині `Learning` (верхнє меню: `Forums · Learning · Events · Champions · Release Notes`).
- **Метод (нове, для всіх наступних хвиль):** публічні сторінки, які малює браузер, більше не є блокером «потрібне розширення» — `node` + вбудований `WebSocket` + `--headless=new --remote-debugging-port`; чекати не таймаут, а стабілізацію довжини `innerText`; акордеони розгортати одним кліком по справжньому перемикачу (клік по предках перемикає двічі). **Не годиться** для sandbox і всього, що за входом: агенти паролів не вводять.
- ✅ **MCP і Confluence (j22, пропуск картки):** «getConfluenceContent (Primary) — Read any Confluence content such as page, blog, live doc, comment, whiteboard, embed, database, or folder.» (`atlassian-ai-gateway/docs/supported-tools/`, група `read_confluence`; звірено в сирому HTML 2026-09-20).
- **Імпорт: оновлення наявних робіт за ключем — документоване, в урок НЕ пішло (→ sandbox, → довідник-карта):** «To update existing work items, your CSV file needs to contain a column that maps to Work Item Key. If a work item exists for a given key, it will be updated.» (`jira-cloud-administration/docs/import-data-from-a-csv-file/` — сторінка старого майстра `External System Import`). Чи працює це в новому майстрі — не перевірено; у j21 прогалину «що робити з дублями після невдалого заїзду» закрито без нового факту, відсиланнями на уроки 5, 7, 12. Там само: «Recommended number of work items per file — 1500 work items».
- **Лишається заблокованим (без змін):** j19 — поле «Вкладення» (знімок JSM) · j22 — `Assignee` у W1 при запиті без виконавця (живий прогін MCP) · j20 — справжня рейка `Settings → System` і `Backup manager` на Free · усе зі списків sandbox вище.
- **Дописано наприкінці сесії 2026-09-20 (іспит відрецензований; реєстр `01-authoring/open-claims.md`):**
  · ✅ **знято зі списку sandbox:** «старе посилання після `Move`» (j05) — закрито живою довідкою: «Any existing links to old work item keys will be automatically redirected» (`jira-software-cloud/docs/migrate-between-team-managed-and-company-managed-projects/`, розділ «Space and work item keys»; сторінка описує саме `Bulk change work items` → move);
  · ⚠ **нове для sandbox, у порядку ціни:** (1) **кирилична мітка в JQL** — один запит `labels = "архів"`: на цьому ⚠ стоїть канонічний приклад курсу (`labels != "архів" OR labels IS EMPTY` — «Зроби сам» і перевірка уроку 20, квіз j21 П5, П9 іспиту); (2) **майстер `Create space` — чи є company-managed на Free** (теза «на Free доступні обидва типи спейсу» стоїть у j02, j03, j09 без джерела ні «за», ні «проти»); (3) налаштування гаджета `Filter Results` — що він приймає джерелом (j08) і чи можна редагувати роботу з гаджета (j08: «на дашборді нічого не редагують»); (4) дошка **ділового** спейсу після додавання статусу — чи зʼявляється колонка сама (j10 `#l5` проти `#l7`; від цього залежало П14 іспиту — питання переведено на спейс `WEB`); (5) `Space settings → Automation` у **службовому** спейсі — чи стоїть `Create flow` (j19);
  · **довідка суперечить сама собі — числа в уроки не йдуть:** адреса сайту — «You can't update an app URL more than 3 times» (`can-i-change-the-url-used-to-access-a-product`) проти «You can update the subdomain up to 15 times» (`update-a-product-url`); там само різні плани, з яких доступна зміна адреси. **→ довідник-карта: називати сторінку біля числа;**
  · **нові опори, звірені наживо 2026-09-20:** кроки автоматизації — «usage-based automation steps pooled at the organization level» (`how-is-my-usage-calculated`) · доступ до нових фільтрів і дашбордів — «Choose the default access setting for when you create new filters and dashboards, which can be either shared with all other users (Public) or restricted to your viewing only (Private)» (`configure-the-user-default-settings`; яке значення стоїть від початку — довідка не каже) · `WAS` — «currently have or previously had… This operator can be used with the Assignee, Fix Version, Priority, Reporter, Resolution, and Status fields only» · гаджет `Activity Stream` — «Displays a summary of your recent activity» · масовий перехід — «You can only perform one transition bulk operation at a time» · реєстрація без картки — «When you set up a site, you start with a Free plan» + платіжні дані «when you upgrade» (`buying-atlassian-cloud-products`) · адреса сайту — «lowercase letters, numbers, and hyphens» · Rovo — «To turn on Rovo, your organization admin must be on a verified business domain» (`rovo/docs/rovo-usage-limits/`; в уроки НЕ внесено — **→ довідник-карта «чого на Free немає»**).

**Дописано 2026-09-24 (сесія хвостів; власник залогінився в sandbox; повні знімки — `screens/26-sandbox-2026-09-24.md`):**
- ✅ **Обидва типи спейсу на Free (🔴-4 реєстру):** майстер `Create space` → поле `How your space is managed`: `Team-managed` (за замовчуванням) і `Company-managed` з бейджем «Administrators only» — доступний. Внесено в j02, j09. Там само для ділового шаблону — три рівні `Access`: `Private` / `Limited` / `Open` (j09:618 закрито).
- 🔴 **AI-кнопки на Free НЕ лише апсел (спростовано наскрізну тезу курсу):** на Free-сайті з організацією на Gmail `Ask AI` у пошуку переклав запит українською в `statusCategory = "In Progress"`; `Fix error` запропонував виправлений JQL («Uses AI. Verify results.», позначка Rovo); `Improve Task` → меню з чотирьох AI-дій; `Add agent` у workflow → діалог `Add Agent`. Опора в довідці — категорія «Free» таблиці кредитів Rovo («Embedded AI woven across product surfaces…», «Rovo Search in Atlassian apps, Definitions, Summaries»). Умова «verified business domain» (`rovo-usage-limits`) **вимикає не все, що підписано Rovo** — що саме, довідка не каже. Переписано j03 (дім), j05, j07, j10, j13, j18, j22 (зокрема квіз), j23. **→ довідник-карта: «що з AI працює на Free» — лише з датою й «перевіряй».**
- ✅ **Журнал flows — назви з екрана відрізняються від доксів:** легенда `What do the different statuses mean?`: `Success` · `No actions performed` · `Some errors` · `Failure` · `Loop` · `Throttled` · `Config change` · `In progress` · `Waiting` · `Queued for retry` (сторінка performance insights у доксах — `Successful` / `No action`). Колонки: `Date & time · Audit log ID · Flow · Status · Total time`. Меню `Create flow`: `Create with Rovo` · `Create from scratch` · `Create from template` (у доксах `Use a template`). Кнопка конструктора — `Save and enable` (у доксах і на екрані туру — `Turn on flow`). Типи кроку: `Action · Condition · Branch · Controls`, «1/65 added». Внесено в j14, j15, j23. **→ довідник автоматизації: пара «докси / екран».**
- ✅ **`Backup manager` на Free є** (секція `Import and export`; «We automatically delete backup files after 14 days»; `Create backup for cloud`) — ⚠ у j20 знято. Рейка `System` повністю — у `screens/26`.
- ✅ **Кирилична мітка:** Jira приймає «архів» як нову мітку; `labels = "архів"` → 1, `labels != "архів" OR labels IS EMPTY` → 2 інші, голе `labels != "архів"` → **0** (пастка уроку 7 наживо). ⚠ у j20 знято.
- ✅ **`Filter Results` читає лише збережений фільтр** (поле `Saved Filter*`, спейс і ключ → «No Matches»), «maximum of 50». Новий дашборд: `Viewers`/`Editors` за замовчуванням `Private` («Only you»), відкривається одразу в режимі правки, панель `Add a Gadget` — 31 гаджет, фільтри `All 31 · Jira 30 · Charts 12 · Wallboard 5`. Кошик дашбордів: «…permanently deleted from your Jira site after 60 days». Внесено в j08. **→ довідник-карта: повний список 31 гаджета — у `screens/26`.**
- ✅ **Дрібне:** `Export` — у меню `•••` сторінки `All work` (15 форматів, `Excel CSV - visible fields` першим; j07, j20) · майстер CSV — «Bulk create: Setup», кроки `Setup · Settings · Map fields · Map values`, «maximum file upload size is 1,024.00 MB» · `Access` спейсу: «This space has 1 role», вкладка `Access requests 0` · хрестик біля мітки — у режимі редагування поля (j04) · бульбашки `Any` над статусами з шаблону (j10:625) · `Activity Streams` на дашборді має посилання `Comment` під кожною подією · team-managed: робота в `Готово` має `Resolution` = `Unresolved`.
- ✅ **Мова:** акаунт «українська (Україна)» → UI англійський, дати українською («17 Вересень»); у `System → General configuration` українська стоїть серед `Installed languages` — не суперечить j03 (перекладу інтерфейсу немає). Статуси sandbox російською («В работе», «Готово») при англійському UI — наочне підтвердження «статуси народжуються мовою створення».
- ✅ **Спільнота після перезапуску 2026-09-22:** усі шість цитат j22 живі (headless Chrome, FAQ сертифікацій розгорнутий).
- **Лишилось для sandbox:** усе з JSM і Confluence (не додані) · діловий спейс (не створений: j06, j10, j11–j13, j21 — `+ Add work type`, `Epic`, рядок виглядів, `Unassigned`) · A/B мови акаунта · A/B перемикача запитів доступу · оновлення за `Work Item Key` у CSV (потрібен файл).
