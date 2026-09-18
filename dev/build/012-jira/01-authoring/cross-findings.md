# Знахідки авторів для сусідніх уроків (012)

Коренева сесія дописує сюди пункт 8 зі звітів авторів (`reports/jNN.md`). Автор читає цей файл
**до** написання свого уроку, щоб не шукати вдруге вже знайдене й не переказувати чужу тему.
Формат запису: `- **jNN → jMM:** факт · джерело (URL/дата або screens/NN) · що з ним робити`.

## Від кореневої сесії (2026-09-17, до старту авторів)

- **усі → j03, j07, j10:** статуси спейсу народжуються мовою акаунта на момент створення
  (sandbox: «К выполнению / В работе / Готово»); JQL `status = Done` тоді не знаходить нічого ·
  `screens/03`, `15` · у вікнах показувати англійські To Do / In Progress / Done, у граблях —
  цю пастку.
- **усі → j14, j15, довідник 2:** у UI 2026 правила автоматизації називаються **flows**
  (Create flow, Browse flows, вкладки Flows · Audit log · Templates · Usage); докси кажуть «rule» ·
  `screens/13`, `14` · термін «flow (automation rule)».
- **усі → j02, j22:** кнопки Ask AI, Improve Task, Add agent, See plans видно на Free як апсел ·
  `screens/04`, `06`, `12`; `facts-free-plan.md` №14b · не описувати як функції.
- **j06, j13:** у шаблоні Kanban немає Backlog/Calendar/Timeline за замовчуванням — додаються
  через «+» («Add to navigation»: Archived work items · Backlog · Calendar · Capacity · Code ·
  Deployments · Forms · Goals · List …) · `screens/08`.
- **j21:** сторінка імпорту — «Import data into Jira», плитки Asana · monday · ClickUp · Trello ·
  Azure DevOps · GitHub · GitLab · Smartsheet · YouTrack · Notion · Linear · Wrike · Airtable · Jira ·
  CSV · `screens/19`.

## Від авторів

### Автор j01 (2026-09-17)
- **усі → усі:** індексні `…/docs/` через WebFetch → 404; читати `…/resources/` або сторінку-листок; частина сторінок віддає лише зміст — брати дочірню.
- **j01 → j03, j06, j09, j13:** `screens/03` знято в **software**-спейсі, а сюжетні `MY/MARK/REM/HR` — business: рядок виглядів і шлях в адресі різняться → потрібен знімок business-спейсу (наступна сесія).
- **j01 → j03:** знімка лівої бічної панелі (список пунктів) немає — для j03 це тема уроку, знімок першочерговий.
- **j01 → j18, j19:** портал за доксами: Portal name · Introduction text · Logo; плитки = request types (назви й описи бачить клієнт); групи — portal groups; кнопка **Requests** показує клієнтові його заявки; канали — portal · email · widget · chat; ⚠ напис поля пошуку порталу не підтверджений — зняти очима.
- **j01 → j02:** «audit log is available with all paid Jira Cloud plans» — формулювання «на платних планах» обходиться без чисел.
- **j01 → j04:** пари `work item (issue)` і `space (project)` **уже введені** в j01 (блок 2, `ds-note`) — j04 спирається, не вводить заново.
- **j01 → j07, j10:** «статус», «робочий процес» (набір станів і дозволених переходів), «JQL» (власна мова запитів) названі й пояснені одним рядком з відсиланням до уроків 10 і 7.
- **j01 → j12, j21:** цитата для не-ІТ: work item «can represent an activity, a document, an asset (creative or concrete), a purchase or even a person» (`what-are-jira-business-projects`).
- **для кореневої сесії:** уроки посилаються на `../jira.html` (шапка, футер, «До програми») — файла ще немає до дизайну; до релізу «На головну» дає 404 — рядок у чеклист релізу.

### Автор j02 (2026-09-17)
- **усі → усі:** таблиці планів читати `curl`-ом і розбором `<td>` (галочка = `<path d="M9.707 11.293…">`, прочерк = `-`), не WebFetch — той вигадує рядки й плутає колонки.
- **j02 → j18, j19, довідник 3:** живі значення колонки Free для JSM (curl): multi-channel ✓, custom reports ✓, SLA ✓, automation ✓, global automation — з лічильником; прочерк — work-level security, audit logs, sandboxes, multiple help centers, data pinning, uptime SLA; Assets і virtual agent — Premium+. **Розходиться з `facts-free-plan.md` №3 — звірити очима.**
- **j02 → j16, j19:** фрази про Confluence як базу знань JSM на сторінці планів немає, JSM-слаги про KB → 404 — джерело шукати заново.
- **j02 → j20:** що вважається активністю сайту («opening a dashboard, checking a report, viewing a work item, or going to the admin settings»); попередження про деактивацію йде на пошту того, хто створив сайт.
- **j02 → j17:** на сторінці про Free — **поіменний список застосунків**, несумісних з Free (`Email This Issue`, `JEMH`, `Automated Release Notes`, `Deep Clone for Jira`, `Tempo Base plugin`…) і «з обмеженою функціональністю» (`Checklists for Jira`).
- **j02 → j03, j09:** `Type` у Spaces показує `Team-managed software`; форми `Team-managed business` ніхто не бачив — ⚠ у вікнах.
- **j02 → j07, j08:** рядка `Dashboards` у таблиці планів **немає** — не посилатись на неї (доступність дашбордів — `manage-shared-dashboards`, факт №10).
- **j02 → j14, j15:** на Free кроки автоматизації рахуються **на підписку**, на платних — на користувача на місяць — різні моделі.
- **j02 → j03:** «пробний період» у доксах — платний план на пробу з безкоштовного, а не Free з датою закінчення.
- **механіка (закрито 2026-09-17):** ліміт легенди 400 символів у чекері — піднято до 8 000; легенда — підписи, не речення (контракт §4.1).

### Автор j03 (2026-09-17)
- **j03 → усі:** клавіші `c`, `/`, `.`, `?` і палітра `command`/`Ctrl` + `K` підтверджені живими доксами (`navigate-to-your-work`, `use-keyboard-shortcuts`, `what-is-the-command-palette`).
- **j03 → j05, j12, j09:** шаблон для `MY` у доксах — «task management template» (**2 статуси**: To Do / Done), «project management template» — 3. **Рішення кореневої сесії — у програмі, розділ 3.** Назви шаблонів в уроках не називати.
- **j03 → j09:** тип спейсу підписується двома рядками: «Software space» на плитці For you, «Team-managed software» у списку Spaces.
- **j03 → j07, j10, j14:** пастка мови (мова акаунта → назви статусів → `status = Done` порожньо) розкрита в j03, блок 6, з діаграмою — далі лише «як в уроці 3».
- **j03 → j20:** на платних планах адресу міняють не більше 3 разів (Atlassian Administration → Apps → App URLs → Update URL, organization admin).
- **j03 → j20, j21:** **ключ спейсу змінюється** (Space settings → Details): ≥ 2 символи, великі літери й цифри, з літери; «up to 10 minutes for the updated key to appear on your board».
- **j03 → j18:** українська є для Compass, Atlassian Home, Help Center / Customer Portal; немає для Jira, JSM, JPD, Confluence — портал українською імовірний, звірити очима.
- **j03 → усі:** вхід через сторонній акаунт (Google, Apple, Microsoft, Slack) на `id.atlassian.com/login`; листи-запрошення шукати від `noreply@mailer.atlassian.com`, `noreply@mail.notifications.atlassian.com`.
- **j03 → усі:** три слаги доксів дали 404 за день (`keyboard-shortcuts`, `get-started-with-jira`, індекс `jira-software-cloud/docs/`) — шукати через WebSearch з `allowed_domains: support.atlassian.com`.
- **докси проти доксів:** `manage-your-jira-personal-settings` не згадує Theme і Jira homepage, хоча на екрані вони є — показано з вікна, датовано.
- **для кореневої сесії (дознімати):** business-спейс (рядок виглядів, шлях в адресі, «Business space» на плитці), ліва бічна панель, галерея шаблонів у діалозі Create space, таблиця планів очима (рядок JSM Free).

## Від кореневої сесії (2026-09-17, вечір — дозняті екрани 22–24)

- **усі → j03, j05, j09, j12:** у UI 2026 шаблон особистих/командних задач називається **Task tracking** («Organize and
  track team or personal tasks»); докси кажуть «task management template» · `screens/23` · рішення про статуси `MY`
  (програма, розділ 3) звірити з фактичним шаблоном після створення спейсу; назви шаблонів — лише довідник 3.
- **усі → j09, довідник 3:** категорія **Work management** — 30 business-шаблонів без бейджів Premium/Try (Project
  management, Task tracking, Recruitment tracking, Budget planning, Event planning …); **Service management** — 16,
  з них Premium: Advanced IT service management, IT Operations; **Custom templates — Enterprise** · `screens/23`.
- **усі → j18, j19, довідник 3:** JSM Free очима і `curl`: multi-channel ✓, workflows + SLA ✓, custom reports ✓,
  automation 1 250 steps per subscription, global and multi-space automation 100 executions per month; прочерк —
  work-level security, audit logs, sandboxes, release tracks, multiple help centers, data pinning, uptime SLA; Assets і
  virtual service agent — Premium+ · `screens/24`, `facts-free-plan.md` №3 → ✅ · числа — лише довідник 3.
- **усі → j03, довідник 3:** бічна панель — 13 пунктів (For you · Recent · Starred · Apps · Plans · Spaces · Filters ·
  Dashboards · Assets ↗ · Teams ↗ · Goals ↗ · Projects ↗ · Customize sidebar), крок 32 px, ширина 320 px; чотири нижні
  ведуть **за межі Jira** (Atlassian Home), і **Projects ≠ spaces** — пастка для новачка · `screens/22`.

## Від рецензентів (2026-09-17, вечір)

### Рецензент j02
- **j02 → j03, j05:** «To create a space: Hover over Spaces in the side navigation, then select Create space» ·
  `jira-software-cloud/docs/create-a-new-project/`, 2026-09-17 · спейс створюють не кнопкою `+ Create` у верхній панелі
  (підтверджено `screens/22`: кнопка **Create space** живе в секції Spaces бічної панелі).
- **j02 → j09:** «Only Jira admins can create spaces with a shared configuration. This setting isn't available on the
  Free plan.» · та сама сторінка · опора для «коли треба Standard»; **прямої цитати про company-managed на Free в доксах
  немає** — знайти або переформулювати (j02 зараз стверджує «обидва типи на Free» з опорою лише на `facts` №12).
- **j02 → j14, j15, довідник 3:** «Allowances refresh monthly»; «Automation step per month»: Free — 150 per subscription,
  JSM Free — 1 250 per subscription; модель — «pooled at the organization level» ·
  `cloud-automation/docs/how-is-my-usage-calculated/`, 2026-09-17 · писати «на підписку / на організацію», не «на сайт».
- **j02 → j20:** «Space archiving is only available on Premium and Enterprise plans. If you archive a space and then
  move to a Standard plan, you can still access the archive and restore archived spaces.» ·
  `jira-cloud-administration/docs/archive-a-project/`, 2026-09-17 · поруч розділ «Trash for Jira Cloud spaces»
  (Move to trash · Restore · Delete) — це і є заміна архівації на Free.
- **j02 → j20, довідник 3:** «If you're a site admin, we'll send you emails to let you know if your site has been
  inactive and is at risk of being deactivated…» · `what-is-the-free-jira-cloud-plan/` · адресат — **адміністратор
  сайту**, не «той, хто створив»; твердження «глядач (Viewer) теж займає місце з десяти» джерела поки не має.
- **j02 → j16:** Confluence Free сьогодні: «Seats for up to 10 users» · «2 GB of file storage» · «Unlimited spaces and
  pages» · «Permissions aren't customizable and anonymous access isn't available…» · «Atlassian reserves the right to
  deactivate Free Confluence Cloud sites due to inactivity.» · `confluence-cloud/docs/learn-about-confluence-cloud-plans/`;
  там же «If you're on the Free plan, you can try the Standard plan for 14 days and the Premium plan for 30 days».
- **j02 → усі (метод):** `curl` + розбір `<td>` відтворено незалежно — збіглось. Дві пастки таблиці Jira: рядок
  **`Anonymous access` стоїть двічі**, а **`Dependency management` має порожні клітинки в усіх колонках** (значення
  сховані в описі рядка) — «порожньо» там не означає «немає на жодному плані».
- **для кореневої сесії / дизайну:** клас `win__topbar` (§4.3, заведений за заявкою автора j02) **не використовує жоден
  із трьох уроків** — усі кладуть верхню панель у `win__bar`; рішення (завести в дизайні й переробити разом чи прибрати
  з §4.3) — при перенесенні макета, sed-пасом.

### Рецензент j01
- **j01 → усі:** `…/docs/receive-requests-from-an-online-portal/` сьогодні **хаб** без тіла статті; цитати про портал — у
  `…/docs/how-do-customers-send-requests-to-your-service-project/`. Порожній grep ≠ «факту немає».
- **j01 → усі (метод):** `curl -sL` + зняття тегів на `support.atlassian.com` віддає тіло статті цілком і надійніше за
  WebFetch для дослівних цитат (перевірено на 15 сторінках).
- **j01 → j03, j09, j10:** набір статусів народжується з шаблону: project management — три кроки (To do · In Progress ·
  Done), task management — два (To Do · Done) · `jira-work-management` докси, 2026-09-17 · в уроках назв шаблонів не
  називати; у UI шаблон задач — **Task tracking** (`screens/23`).
- **j01 → j03, j18:** таблиця мов доксів: Ukrainian ❌ Jira/JSM/JPD/Confluence, ✅ **Help center and Customer Portal** ·
  `atlassian-account/docs/manage-your-language-preferences/` · знімає ⚠ з `facts` №17 на рівні доксів; наживо — після JSM.
- **j01 → j04:** пари work item (issue) і space (project) вже введені в j01 разом зі «статус», «робочий процес», «JQL»
  одним рядком кожне — розкривати, не вводити заново.
- **j01 → j04, j09:** **ключ роботи не вічний**: адмін може змінити ключ спейсу (`EXAMPLE-1` → `DEMO-1`, старі
  посилання працюють через аліас) · `jira-software-cloud/docs/edit-a-projects-details/` («Change a space's key») ·
  повний нюанс — дім j04/j09; j01 тепер каже «не міняється при перейменуванні чи пересуванні картки».
- **j01 → j06, j09, j13:** `screens/03` знято в software-спейсі; для business потрібен свій знімок (рядок виглядів і
  адреса `…/jira/…/MARK/board`) — `21-business-space.md`, після створення спейсу.
- **j01 → j18, j19:** склад порталу за живими доксами: портал створюється автоматично для кожного службового спейсу,
  плитки = request types, канали = help center · email · chat, кнопка **Requests** «near their avatar» показує статуси
  заявок; ⚠ пошук докси описують для **help center**, не для порталу спейсу — напис поля пошуку звірити очима після JSM.
- **j01 → дизайн:** формат дати на картці дошки — у вікні `Sep 25`, у `screens/03` `Sep 24, 2026`; гліф типу Task
  (у знімку лише «галочка») — вирішити разом зі станом `board`.
- **закрито знімком 22:** склад і порядок пунктів бічної панелі у W1 j01 (`For you · Spaces · Filters · Dashboards`) —
  підмножина реальної панелі в правильному порядку (`screens/22-sidebar.md`).

### Рецензент j03
- **j03 → усі (навігація):** докси `navigate-to-your-work` мають банер «This page is for the old navigation»; жива
  сторінка — `what-is-the-new-navigation-in-jira` (GA хвилями з 2025-03). **Коренева сесія, `screens/22` (2026-09-17,
  вечір): sandbox стоїть на НОВІЙ навігації** — у бічній панелі є Recent · Starred · Apps · Customize sidebar, а
  **Search і + Create лишаються у верхній панелі**. Формулювання j03 («верхня панель однакова на кожній сторінці»,
  рейка `For you · Spaces · Filters · Dashboards` як підмножина) — чинні; джерелом для панелі цитувати сторінку про
  нову навігацію, не стару.
- **j03 → j02, довідник 3:** `Site limit` = One / One / One / 150 (Free / Standard / Premium / Enterprise) · curl
  `explore-jira-cloud-plans` · «один сайт» **не є ознакою Free**. Рішення кореневої сесії 2026-09-17: два входження
  «один сайт» у j03 лишаються (структурний факт, стабільний; на ньому тримається аргумент «другий сайт не врятує») —
  власник може скасувати.
- **j03 → j07:** «Press `/` to open the quick search field. Press `/` then enter/return to start an advanced search»;
  тултип «…advanced search with your text query» · брати ці формулювання, не «у порожньому полі».
- **j03 → j05, j09, j12:** «two steps: To Do and Done» (task management) / «three steps: To do, In Progress, and Done»
  (project management) · curl 2026-09-17 · підтверджує рішення програми про два статуси в `MY`; у UI шаблон —
  **Task tracking** (`screens/23`).
- **j03 → j10, j11, j20:** ключ спейсу «at least two characters long, start with an uppercase letter… only uppercase
  letters or numbers» + «up to 10 minutes…».
- **j03 → j20:** «you also create a site and organization for that app» · слово **«організація»** вперше зринає в j03 —
  коренева сесія додала гloss на місці (2026-09-17); **дім поняття — j20** (Atlassian Administration).
- **j03 → j05:** `manage-your-jira-personal-settings` перелічує лише Language / Your timezone / Watch your work items —
  `Theme` і `Jira homepage` у доксах відсутні (підтверджено вдруге); розділ у доксах «Notification settings», на екрані
  «Emails and notifications».
- **j03 → j18, довідник 3:** Ukrainian ❌ Jira, JSM, JPD, Confluence, Team Calendars; ✅ Compass, Home, Help center and
  Customer Portal (те саме знайшов рецензент j01).
- **j03 → дизайн (реєстр §7.0):** `win__topbar` не вжитий у жодному уроці (усі — `win__bar`); для поля **Search поза
  порталом класу немає** (j03 вживає `win__crumb`; кнопки `Templates` / `Search spaces` лежать у `win__tabs`);
  `See plans` — `win__btn` (j02, j03). Звести до одного рішення **до** sed-пасу.
- **j03 → редакторам наступних хвиль:** «легенда ≤ ~80 знаків» після підняття вікна чекера 400 → 8 000 механічно не
  перевірялась (у j03 пункти були 94–157) — коренева сесія додала попередження `!` у `check-lessons.py` (2026-09-17).
- **j03 → j07, j08:** «дашборд» і «фільтр» вживаються в j02 і j03 без пояснення (у цитаті про неактивність) — дім
  понять j07/j08; при авторингу j07/j08 ввести явно, у j02/j03 не чіпати.
- **j03 → власник (перевіряється лише живою реєстрацією):** чи питають платіжну картку на Free · які символи приймає
  поле назви сайту (кирилиця?) · чи містить лист після реєстрації адресу сайту · клік по `Ask AI` на Free — що показує ·
  A/B пастки мови (спейс з English → змінити мову акаунта → назви статусів).

## Від авторів хвилі 2 — j04–j10 (ніч 2026-09-17 → 18; повні §8 — у `reports/jNN.md`)

### Наскрізне, для всіх (зійшлося в кількох звітах незалежно)
- **У JQL поле спейсу — `project`** (живий екран `screens/15`, 2026-09-17). Докси `jql-fields` уже зіпсовані автозаміною: «Syntax: `spaceJira`», `space = "ABC"`, `spacesLeadByUser()`; на `jql-operators` / `jql-keywords` / `find-specific-work-items` Atlassian сама вішає банер «some JQL entries using the new terms may not work yet… try using the old term instead». **Не «виправляти» `project` на `space`** в уроках, довідниках, flows; довідник 1 подає обидва імені. З `jql-fields` брати описи полів і оператори, не синтаксис (j04, j07).
- **`Summary` → `Title`: докси попереду екрана** («This field was previously labelled Summary», банер open beta; sandbox показує `Summary`). Писати `Summary`, як на екрані, не «виправляти» (j04, j05).
- **Докси business-спейсів — окремий продукт `support.atlassian.com/jira-core-cloud/docs/`** («Work with boards in business spaces»: Group by, `Hide done work items after`, `Configure columns`, `Save board defaults`) — точніше за software-докси (j05, j06).
- **Банер «This page is for business/software spaces»** тепер стоїть на сторінках довідки — читаючи цитату, дивитись на банер, інакше software-поведінка приписується business-спейсу (j06).
- **`support.atlassian.com/jira/kb/…` здебільшого Data-Center-only** — перед цитатою шукати «This article only applies to Atlassian apps on the **cloud** platform» (j08). Наслідок: у Cloud-доксах **немає назв полів панелей гаджетів узагалі**.
- **Метод читання статті:** `curl -sL` → вирізати `<script>`, `<style>`, `<nav>` → взяти `<main>` → зняти теги; початок статті — «Cloud / Data Center», кінець — «Was this helpful?» (j09). **Індекс живих слагів:** `curl -sL <хаб>/ | grep -o 'href="/jira-software-cloud/docs/[a-z0-9-]*/"' | sort -u` → 645 адрес (j05). Редіректи — дивитись `%{url_effective}` (j10). Перед цитуванням переліку звіряти другу сторінку розділу: `available-workflow-rules` дає 7 правил, `add-or-remove-workflow-rules` — 5 (j10).
- **Іконки без підпису** (око watchers, ⤢, `•••`) у вікнах не вигадувати — називати в підписі під вікном; картки програми такі мітки замовляють (j04, j05) — розбіжність програми з конвенцією §4.3.
- **`win__topbar` — 0 вживань після десяти уроків** (усі сім авторів хвилі 2 підтвердили) — дизайну вирішувати долю класу.
- **Картка завершення `#completeTitle`:** j07 лишив «Модуль позаду?» за §2 п. 10 контракту, решта дев'ять — «Урок позаду?» слідом за базовим `jira-01`. Ефекту немає (`js/module.js` перезаписує); одне слово вирішить білд (Б-14).

### Автор j04 «Словник Jira»
- **→ j05:** новий `Create` у доксах — `Title`, «up to 3 required fields appear as chips», `Create another`, док-режим при кліку поза діалогом, `Configure Fields`, `Always open in this view`; повна форма відкривається сама, якщо > 3 обовʼязкових полів; `Simple Create as Default` (Settings → System → General Configurations) — та сама настройка зі `screens/07`. Розмітка коментарів (`##`, `**`, `[]`), клавіші `M`/`W`, реакції, «Copy link». «Splitting work items isn't available in business spaces» (j05, j11).
- **→ довідник 3 (числа, в уроці немає):** вкладення до 2 000 на роботу, > 150 показуються списком, розмір файлу за замовчуванням 1 GB; дошка показує до 5 000 робіт.
- **→ j09:** team-managed «work types are the primary container for your work», company-managed «work types act as labels». **→ j09, j20:** «You can't edit space permissions or roles on the Free plan in Jira, and you can't configure work-level security on any Free plan».
- **→ j10:** статуси спільні між типами робіт у спейсі; нові статуси — глобальний перехід («Any status») і **не привʼязані до колонки**; категорію вибирають при створенні.
- **→ j11:** `Configure` внизу картки → розкладка полів типу; поля ховаються, поки порожні; у team-managed `Due date` додається кожному типу окремо; власні рівні ієрархії — Premium/Enterprise, «Changing your work type hierarchy will break existing parent and child relationships».
- **→ j13:** `what-is-an-epic` — лише company-managed; `Epic Link` у старих фільтрах → `parent`. **→ j20, j21:** після зміни ключа спейсу оновити board filters, dashboard gadgets, global queries; попередні ключі зберігаються автоматично.
- **Уточнення:** ключ роботи змінюється лише разом із ключем спейсу; `what-is-a-workflow-status` помиляється у власній лічбі («five steps» при шести назвах).
- **⚠ не закрито:** «виконавець рівно один» без прямої цитати; «Labels are global» (докси) проти картки «свої в кожного спейсу» — А/Б у sandbox; «мітки з різним регістром — різні» — джерела немає, в урок не пішло.

### Автор j05 «Створити й вести роботу»
- **→ j04:** `Summary → Title` — пара «поточне (колишнє)». **→ j06, j13:** докси `jira-core-cloud` (див. наскрізне). **→ j10, j11:** `Automatic` у полі Assignee = `Default assignee` спейсу (Space settings → Details) або виконавець компонента.
- **→ j14, j15:** тригер `Issue Moved` + `{{changelog.key.fromString}}` — приклад для довідника 2. **→ j16:** відправник `jira@<сайт>.atlassian.net`, поле `From` змінне.
- **→ j20, довідник 3:** видалену роботу не повертає ніщо («Atlassian backups cannot be used to restore work items»); запит на кошик — `JRACLOUD-36415`. **Довідник 3 ⚠:** розмір вкладення — `1GB` на одній живій сторінці і `10MB` на іншій — звірити очима.
- **Розбіжності:** `Add subtask` (екран) — `Child work item` (докси); `Watch your work items` — `Watch work items automatically`; групування листів «up to 10 minutes» (докси) проти `Every 3 minutes` (екран). Вкладка `Starred` показує **спейси**, не роботи — крок картки «познач зіркою» замінено на коментар.
- **⚠ для sandbox:** зірка на роботі; `Assign to me` при заповненому виконавцеві; лист про власні зміни; старе посилання після `Move` (єдине джерело — KB «generated by AI»); `screens/21`. Просить глянути очима `ds-note--warn` у прозі (вперше в курсі).

### Автор j06 «Вигляди»
- **→ j07:** у List є **вкладка JQL** («open the JQL tab for the List view… `ORDER BY Rank`»); `Rank` подекуди як `cf[10019]`. **→ j08:** у Summary `Done` показує лише закрите за **останні два тижні** — законна різниця з гаджетом на фільтрі.
- **→ j09:** відрізнити тип спейсу — `More actions (•••)` біля назви → «your space details will be shown» + банери сторінок. **→ j10:** `workflows-and-statuses-for-boards-in-business-projects` — означення статусів/категорій/переходів, глобальні переходи, «колонки впорядковує адмін».
- **→ j11, j13:** перелік типів кастомних полів, які виводяться колонкою; у team-managed додавання поля колонкою привʼязує його до всіх типів роботи; беклог — «kanplan», клавіші `E`/`V`.
- **→ довідник 3:** до **10 дошок** у спейсі · приховування Done **7/14/30/60 днів або «ніколи»** · до **500 полів** колонками · `Roadmaps` Free `Basic` / Premium `Advanced`; `Capacity planning` — Premium+; **`Dependency management` — порожній рядок в усіх колонках** таблиці планів (тезу програми «залежності/capacity — платні» в урок не взято) · роллап таймлайну вимикається сам у спейсах > 10 000 робіт · «рядок виглядів» = **space navigation**, «+» = **Add to navigation**, другий шлях `Space settings → Features` (лише адмін спейсу).
- **Розбіжності доксів:** календар — «Start date and Due date» проти «without due dates»; `Group` — «group your board by» проти «add swimlanes»; «per user» проти «visible for everyone in the space». `REM-4` з картки не вжитий (REM зʼявляється лише після j09).

### Автор j07 «Пошук і JQL»
- **→ j08:** гаджет живиться **збереженим фільтром** → порожній гаджет у колеги = `Viewers: Private`; доступи `Private` / `Users`-`Group`-`Space`-`Roles` / `My organization`; з результатів: `Export` → `Create dashboard gadget`.
- **→ j14, j15:** `currentUser()` у спільному фільтрі й підписці рахується **для отримувача** — та сама пастка у flows з листами. JQL розібраний повністю — посилатись, не переказувати.
- **→ j10:** три категорії статусу не перейменовуються; `statusCategory` описаний лише в KB (`how-to-search-using-statuscategory-…`, Cloud Only), на `jql-fields` — ні. **→ j05, j11:** «labels cannot contain spaces, use hyphens or underscores»; мітку створюють лише на роботі; іншим зʼявляється із затримкою (15–20 хв); зникає з останньою роботою.
- **→ j03, j05:** короткі команди швидкого пошуку (`my`, `r:me`, `overdue`) **вимкнені за замовчуванням**: Personal settings → **Jira labs** → `Quick search smart queries` — розділу немає в `screens/17`, дозняти.
- **→ j20, j21:** `•••` → `Bulk Change all <n> work items`, пʼять операцій, галочка `Send mail for this update`; company-managed → team-managed «component and version information isn't retained».
- **→ довідник 1:** зарезервовані слова JQL; bounded/unbounded; коли запит не переводиться назад у Basic; `WAS`/`CHANGED` з предикатами (6 полів); системні фільтри; cron підписок; ліміт листа підписки **200** результатів (довідник 3).
- **Розбіжності:** дати в JQL — у лапках (`updated >= "-7d"`, докси наполягають); `Save filter` (екран) проти `Save as` (докси); пункт входу — `All work` (екран) проти трьох назв у доксах; **картка програми каже `MARK-4` due this week, а j01 поставив `MARK-4` у `Done`** — рядок картки неточний.
- **⚠ для sandbox:** клік `Fix error` на Free (докси: AI-підказка — Rovo лише на платних); кирилична мітка `labels = "дозволи"`; `Export` на `All work`; сторінка `Filters` з кількома фільтрами; діалог `Save filter` і панель `Details`.

### Автор j08 «Дашборди і гаджети»
- **→ j07, j20, довідник 3:** **`Default access`** (`Settings → System → Default user preferences`) вирішує доступ **нових** фільтрів і дашбордів (`Public`/`Private`) — «новий фільтр приватний» не константа. **→ j20, довідник 3:** **«Free Jira sites can't be opened to the public»** (сильніше за програму «вимкнено за замовчуванням»); вимкнення `Public sharing` «does not restrict… already been shared».
- **→ j20, довідник 3:** дашборд → `Move to trash`, відновлює лише Jira admin, **60 днів**. **→ j13, довідник 3:** повний список вбудованих гаджетів (Sprint Health, Sprint Burndown, Days Remaining, Road Map, Bubble Chart, Average Time in Status, Resolution Time, Time to First Response, Labels, Quick Links, Voted/Watched, Wallboard Spacer).
- **→ j18, j19:** гаджет `Service Space Report` потребує JSM; `Filter Count` лише з підпискою JSM. **→ j16:** є сторінка «Share Jira dashboards in Confluence».
- **Розбіжності:** «Any Jira user can create a dashboard» проти «logged in as an admin» (обидві живі); `Any logged-in user` (докси) — `My organization` (екран); гаджет у доксах `Assigned To Me Gadget`. Вікно W2 картки (налаштування гаджета) **замінене** на діалог `Create dashboard` — назв полів у Cloud-доксах немає.
- **⚠ для sandbox:** дашборд із трьома гаджетами — майстер `Add gadget` і панель налаштувань Filter Results / Two Dimensional; діалог `Create dashboard`; список `Jira homepage` (поля в доксах немає — крок замінено на `Add to starred`); стан `Public sharing` на Free.

### Автор j09 «Team-managed vs company-managed»
- **→ j10, j11:** шлях у доксах 2026 — «Next to your space's name in the sidebar, select More actions (•••), then Space settings, then Work types». **→ j10:** статуси в team-managed створюються редактором workflow **і колонками на дошці**; «new statuses aren't assigned to a column, and are therefore not visible on the board».
- **→ j07, довідник 1:** JQL поле **`spaceType`** (`business` / `software` / `service_desk`; `=`, `!=`, `IN`, `NOT IN`) і `Parent space`; `resolution` не існує в team-managed службових спейсах — `statusCategory`.
- **→ j11, j21:** при перенесенні робіт **components і versions втрачаються незворотно**; глобальні кастомні поля зберігаються, але в team-managed виглядають порожніми. **→ j12:** третій шлях створення спейсу — `+` у бічній панелі; «Jira will remember your template choice» — пастка для «Зроби сам». **→ j20:** «Create with Rovo» коштує **10 Rovo credits** (довідник 3); «Space names are unique in Jira».
- **Програма проти доксів (важливе):** «business-спейси — team-managed за природою» — **не так**: адмін створює спейс з будь-якого шаблону як company-managed (`create-a-new-project`, `create-a-business-project`, `migrate-…`). Дві частини `Type` майже незалежні. **Чи можна створити company-managed на Free — прямої цитати немає** («shared configuration… isn't available on the Free plan»); твердження програми в урок не поставлено. У таблиці планів рядків про типи спейсів немає взагалі.
- **⚠ для sandbox:** майстер `Create space` на Free — чи є `Company-managed` і що буде; business-спейс (`Type`, рейка, адреса — `screens/21`); меню `•••`; сторінка `Access` (кнопка `Open access` проти доксового `Change space access`).

### Автор j10 «Workflow»
- **→ дизайн / білд (впливає на вигляд):** `js/mermaid-theme.js` задає `useMaxWidth: false` лише для `flowchart` і `sequence` (рядки 72–73); j10 — **перша `stateDiagram-v2` у проєкті** — стискатиметься замість прокрутки. Потрібен `state: { useMaxWidth: false }`. **Те саме зачепить j19.** Записано в чеклист релізу.
- **→ j11:** `Resolution` у team-managed **не показується й не редагується** (`Unresolved` навіть у завершених, `screens/04`); ознака завершеності — `statusCategory = Done`. Правило `Copy the value of one field to another` має таблицю сумісності типів полів. **→ j14, j15:** `Resolution` виставляють **лише автоматизацією** — KB дає рецепт (тригер `Issue Transitioned` на Done + `Edit Issue`).
- **→ j06, j13:** колонка ≠ статус, щойно колонці дано кілька статусів; у бізнес-спейсі колонки правляться на дошці (`Configure columns`, `Hidden statuses`); **WIP-ліміт для j13** — у тому ж діалозі («set a maximum number of work items. The column changes color…»). **→ j06:** ховання завершеного через `View settings` (за замовчуванням «never»).
- **→ j07:** `status` шукається за назвою **або ID**, `WAS`/`WAS IN` — лише за назвою; `StatusCategory in ("To Do","In Progress")`, `statusCategoryChangedDate <= -7d`. **→ j19:** статуси/переходи/редактор мають близнюків у `jira-service-management-cloud/docs/`. **→ j20:** `Restrict who can move a work item` (assignee / reporter / людина / роль / група / дозвіл) — найдешевший замінник прав на Free.
- **Розбіжності:** `Transition`/`Rule` (докси) проти `Add Transition`/`Add Rule` (екран 17.09); 7 проти 5 правил на двох сторінках (довідник 2 зводить); картка «окремий workflow на кожен тип» — насправді один workflow на **комбінацію** типів; шість статусів `HR` зібрані як «перейменувати три + додати три».
- **⚠ для sandbox `KAN`:** режим **`Text`** редактора; панель деталей статусу; діалог **`Add Rule`**; діалог `Update workflow` з вибором типів.

## Від рецензентів хвилі 2 — j04–j10 (2026-09-18, ранок; 7× «готово з зауваженнями», 72 правки; повні звіти — `reports/jNN-review.md`)

### Наскрізне (зійшлося у кількох рецензентів)
- **Цитати звіряти посимвольно і дивитись на банер сторінки до цитування.** У j06 в цитату було вставлене слово `Cloud`, якого в доксах немає; три цитати про дошку business-спейсу прийшли зі сторінок «for software spaces» / «for company-managed spaces». Business-відповідники є майже завжди: `organize-your-board`, `what-can-i-do-on-a-board`, `monitor-your-work-with-the-board`, `workflows-and-statuses-for-boards-in-business-projects`, `what-is-the-timeline-and-how-do-i-use-it`. Дешева перевірка — вигребти всі `«…»` з латиницею і прогнати `in` по збережених текстах.
- **Пастка «kb = Data Center» має зворотний бік:** KB про мітки, Resolution, видалення робіт і текст помилки гаджета мають банер **«Platform Notice: Cloud Only»** і придатні для цитування; «Cloud and Data Center» з кроками для JIRA 6.x — слабке джерело. Дивитись на банер, а не на префікс `/jira/kb/`.
- **Заголовок статті й слаг розходяться систематично** (`next-gen-permissions` → «Team-managed space permissions»); звіряти заголовок у `<main>`, не адресу. На одній сторінці бувають два формулювання того самого застереження — шукати по всій сторінці, перш ніж вважати цитату колеги неточною.
- **Маркери стилю у квізах, яких `check-quiz.py` не бачить:** тире/двокрапка/крапка з комою **лише в правильному варіанті**, або всі дистрактори з однаковим початком («Тому що…»). Знайдено в j04 (2 питання), j06 (5 із 6!), j07 (3), j09 (1). Ловити окремим проходом, правити лише дистрактори. Записано в памʼять рецензента.
- **Два слова «адміністратор»:** «everyone with access to Jira is an admin **for all Jira spaces**» (Free) — адмін **спейсів**, не глобальне право `Administer Jira`; j20 має розвести їх явно (j09). Правильна форма для Free — «на сайті, який **від початку** був безкоштовним» («If your site has always been on a Free plan…», j05).
- **Шаблони спейсів:** шаблон обліку задач (`task management`) дає **два** статуси (`To Do`, `Done`), шаблон керування проєктом — **три** (`To do`, `In Progress`, `Done`) — `use-business-projects-for-task-management/`, `…-for-project-management/`, 2026-09-18. Будь-який «Зроби сам», що потім перейменовує три статуси, мусить вести до другого шаблону (j10 виправлено; перевірити j03, j09, j12).
- **«Виконавець рівно один» (j04, j05)** — прямої цитати немає ніде (найближче: «Assigns a work item to **a user**» у `cloud-automation/docs/jira-automation-actions/`); на цьому стоять два питання квіза j04. Рішення наскрізне: або факт продукту в обох уроках, або знімати категоричність одночасно. Закриває один клік у sandbox.
- **`REM` у вікнах до j09** (j07 W1, j08 W1) — за траєкторією `REM` зʼявляється після j09; це наскрізне допущення двох авторів, не помилка одного. **Рішення власника:** правило «вікна показують фірму цілком» або прибрати `REM` з обох.
- **Довідники в уроках називати назвою, не номером** (конвенція j01–j08); у j09 рядок 119 лишився з «довіднику 3» (j10). **Слово «мітки» в прозі зайняте полем `Labels`** — для ①②③ писати «цифри»/«позначки» (j04). Терміни, що ловились без пояснення у хвилі 2: гліф, туторіал, API, чеклист, чіп, випадайки, рейка (клас `win__rail`!), полотно, мінімапа, прапорець.
- **`win__topbar` — 0 вживань у 10 уроках** (усі сім рецензентів підтвердили). Дизайну: у стані `item` бракує класу для секції звʼязків, кнопки-іконки з лічильником (око watchers), `win__status` з `▾`, `win__menu` для `•••`, `win__subrail` для підрейки типів, скролер усередині `win__gadget`; порядок міток у W2 j05 ④→①②③ за карткою — якщо нумерувати за читанням, правити j04 і j05 разом.

### Рецензент j04
- **→ j07, довідник 1:** жива `jql-fields` дає «Type · Syntax `type` · Alias `workType` · Field Type `WORK_TYPE`», **`issuetype` там відсутній** (у знімках лише в URL `settings/issuetypes/`). Урок j04 каже «запити пишуться словами `project` та `issuetype`» — перевірити `issuetype = Task` живим запитом або замінити приклад.
- **→ j01 (кореневій сесії):** `aria-label` двох легенд у `jira-01.html` — «Мітки на дошці…» / «Мітки на порталі…»; контракт §4.1 і 7 із 9 уроків уживають «Пояснення до вікна «…»».
- Виправлено в j04 з джерелом: `Resolution` у team-managed не показується й не редагується («you don't have the option to manually set or view the Resolution field on those project types», KB Cloud Only 2025-09-26). Без джерела: «епік не закриває задачі всередині», «зняти мітку хрестиком». Порядок полів у W1 не такий, як у `screens/06` (`Team` немає, `Reporter` піднято) при заголовку «звірено».

### Рецензент j05
- **🔴 «Старе посилання після `Move` далі відкриває ту саму роботу»** — єдине джерело `migration/kb/migration-of-jiras-historical-keys-…` має позначку **«The content of this article has been generated by AI»** (2026-01-23); людське `edit-a-projects-details` — про зміну ключа **спейсу**, не про Move. На факті стоять проза блоку 7, вузол Mermaid і **правильна відповідь квіза №4**. Не підтвердиться наживо — правити три місця разом.
- **→ j09, j11:** «Jira components are **only available in company-managed spaces**» (`what-are-jira-components/`, 2026-09-18). **→ j03, j16, довідник 3:** сторінка сповіщень — докси `Notification settings`, екран `Emails and notifications` (`screens/17`).
- **→ j06, j12, j21:** аркуш Оксани з `j01` (дві свої справи, три чужі; «постачальника кави» там немає) ≠ картки `MY-1…MY-5` програми — посилаючись на «пʼять справ», звіряти сам `j01`. **→ усім:** `j04` уже просить створити `MY-1` і призначити собі — нові «Зроби сам» без дублювання.
- Щільність: j05 — 4 847 слів, пʼять «граблів» проти «2–4» §3; кандидат на стиснення — «Форма, яку ніхто не хоче заповнювати». `ds-note--warn` у прозі: розмітка валідна за §20 (`float: left` + `clear: both`), очима на превʼю не дивились.

### Рецензент j06
- Пропущені теми картки (додати може лише автор): **`Search board`** (0 згадок; джерело `screens/03`) і **назва `View settings`** (поведінка описана, назва не названа; `screens/03` + «From your board, select View settings, then select Hide done work items after»).
- **→ j10, j13:** `monitor-your-work-with-the-board` (business): `Configure columns` (rename, кілька статусів на колонку, `Unmapped statuses`), «The column order applies to every user of the board», збереження адміном **скидає** особисті налаштування колонок в інших.
- **→ j08 / коренева:** «`Done` у Summary — лише за два тижні» (автор j06) розходиться зі `screens/05` («1 completed **in the last 7 days**») — імовірно різні елементи (плитки проти `Status overview`); звірити до довідника.
- Лишились ⚠: «у business-спейсі беклогу й спринтів немає» — без прямої цитати; назва смуги без значення (`Unassigned` у вікні, програма казала `None`); числа `7/14/30/60` днів у блоці 1 — не ліміт плану, рішення власника, чи лишати.

### Рецензент j07
- **→ j03 (розбіжність між уроками):** j03 пише, що `status = Done` у спейсі з неанглійськими статусами «не знаходить нічого», а j07 показує зі знімка **помилку** «The value 'Done' does not exist for the field 'status'» + `Fix error`. Правий j07 — **j03 вирівняти**.
- **→ довідник 1:** `Default access` керує доступом **нових** фільтрів (константи «новий фільтр приватний» немає); `WAS` = «currently have **or** previously had», лише для кількох полів; без лапок відносна дата читається як **мілісекунди від 1970**; зарезервовані слова; `statusCategory` описаний лише в KB (Cloud Only).
- ⚠ **`Export` у W1** — єдине місце, де датоване «звірено» вікно розходиться зі знімком (`screens/15` кнопки не має; докси ведуть її через `••• → Export`). ⚠ **Кирилична мітка `labels = "дозволи"`** подана в уроці як робоча, читачеві не сказано «не перевірялось» — на відміну від звіту автора.
- **Власнику:** блок 3 j07 — 1 954 слова, 11 підзаголовків, **42 % уроку** під одним пунктом бічної навігації; лікування — девʼятий блок «Фільтри» в контракті або перенесення «доступ + підписка + масова зміна» у блоки 4/6. Рішення не рецензента.

### Рецензент j08
- Без джерела (лишено): «на дашборді нічого не редагують» (категорично, у плашці); `Activity Stream` — докси «your recent activity», урок «хто що зробив»; «Filter Results читає лише збережений фільтр» — на цьому правильна відповідь квіза №1; майстер `Add gadget` описаний зі сторінки про **дашборд за замовчуванням** (адмінський екран).
- **→ j07:** j07 стверджує константу «новий фільтр приватний» у трьох місцях, включно з `explain`; j08 формулює обережніше (`Default access`) — вирівнювання за кореневою сесією.
- **→ білд (рядок 13a):** у прозовій таблиці j08 перша колонка містить `Two Dimensional Filter Statistics` — 33 знаки під `white-space: nowrap`; обгортка є, заміряти на 390 px.

### Рецензент j09
- Виправлено: ЧаПи про право створювати company-managed (замість інференсу «усі адміни» — доведене: вибір у майстрі є, спільної конфігурації на Free немає); HR пʼять → **шість** статусів у згоді з j10; обіцянка про урок 10 переписана під те, що j10 робить; ЧаПи «JSM має обидва типи» тепер із джерелом (`how-can-i-tell-if-im-in-a-classic-and-next-gen-project/`).
- **→ j03:** легенда вікна `Spaces` у j03 і блоки 2/8 j09 називають третє слово `Type` «service management» — живим екраном не бачене (лише `Team-managed software`), у JQL `service_desk`. Правити **парою** j03 + j09 після знімка JSM-спейсу.
- **→ j12:** «company-managed» і «спільна конфігурація» — **різні кроки** майстра: тип вибирається («Select either…»), спільна конфігурація — окремий чекбокс `Share settings with an existing space`; речення про Free стосується другого.
- ⚠ «рівнів доступу три» — джерело каже «Team-managed **software** spaces have three, simple access levels»; для business часткова опора («on the Free plan for software and business spaces»).

### Рецензент j10
- **Ф-1 виправлено:** крок 1 «Зроби сам» вів до шаблону з двома статусами, а крок 3 перейменовував три; тепер — шаблон керування проєктом, «той самий, з якого в уроці 9 народилась «Друга точка»», назва шаблону не названа. Ф-2: сім переходів у `stateDiagram-v2`, не вісім. Ф-4: `Unresolved`, а не «порожнім».
- **→ довідник «Автоматизація…»:** урок **обіцяє** там повний перелік правил переходу — звести 7 назв проти 5 (`Remind people to update empty fields` лише в другій). **→ довідник «JQL…»:** «a work item is resolved when statusCategory = Done» у доксах стоїть у розділі про **service** team-managed спейси — подавати з контекстом.
- ⚠ нове: підрейка типів роботи в W1 (`Task · Subtask · Epic` як `win__tabs`) — у `screens/10`/`11` другої колонки немає, назви з шапки редактора `screens/12`, а вікно «звірено 2026-09-17». Дознімати `Space settings → Work types` у бізнес-спейсі.

## Від авторів хвилі 3 — j11–j14 (2026-09-18, день; повні §8 — у `reports/jNN.md`)

### Наскрізне
- **`jira-core-cloud` більше не окреме дерево доксів, а аліас** (j11, перевірено 2026-09-18): `jira-core-cloud/resources/` → 307 на `jira-software-cloud/resources/`; частина сторінок під старим префіксом 404, хоча під `jira-software-cloud` живі. **Канонічний префікс для бізнес-сторінок — `jira-software-cloud/docs/`**, бізнес-сторінка впізнається банером «This page is for business spaces». У звітах хвилі 2 посилання `jira-core-cloud/…` працюють через редірект; в уроках і довідниках писати `jira-software-cloud`.
- **Докси автоматизації вже всюди кажуть `flow` і `step`** (j14; 136 живих слагів у `cloud-automation/resources/`): `rule`/`component` лишились у слагах адрес і на сторінках, до яких хвиля перейменування не дійшла (`jira-automation-conditions`, `limitations-…`). Програмне «докси досі кажуть rule» більше не точне. До переліку «що змінилось» у довіднику: `component → step`.
- **Шаблон керування проєктом дає рівно `Task` + subtask** («Work types: Task and subtask») — **епіка в бізнес-спейсі за замовчуванням немає**, його додають `+ Add work type` (j11). Будь-який «Зроби сам» з епіком у бізнес-спейсі мусить містити цей крок (j12, j13, j21).
- **Самоперевірка цитат перед здачею** (j13, j14): витягнути всі `«…»` з латиницею і прогнати `in` по збережених текстах сторінок — ловить помилки, невидимі оком (велика літера на початку, вставлені слова). ⚠ Пастка прийому: зняття тегів лишає пробіл перед апострофом і комою там, де було посилання (`your space 's work`) — нормалізувати перед порівнянням.
- **Маркери стилю у квізах** — усі чотири автори робили окремий прохід (тире/двокрапка/стрілка лише в правильному варіанті; однаковий початок дистракторів); знайдено й виправлено у j12 (П6), j13 (П6, `→`), j14 (2 питання). `check-quiz.py` цього не бачить.
- **Числа, що зібрались для довідника «Карта інтерфейсу, глосарій і ліміти Free» (в уроках їх немає):** до 50 власних полів у team-managed спейсі · до 55 варіантів у `Dropdown`/`Checkbox` · до 30 типів роботи · 32 767 знаків у `Paragraph` · `Number` від −1 трлн до 1 трлн, округлення 0,001 (j11) · галерея: 17 категорій, 4 продукти, ~30 плиток (дата знімка) · кошик спейсів 60 днів · `Create with Rovo` 10 кредитів (j12) · `Send customized email`: Free 100 листів за 24 год · `Lookup work items` — перші 100 · гілки — 150 елементів · журнал автоматизації 90 днів · розклад зупиняється після 10 порожніх запусків (j14) · «Infinite board capacity» на діловій дошці проти «до 5 000 робіт на дошці» з хвилі 2 — звести (j13).
- **`win__topbar` — 0 вживань у 14 уроках.** Дизайну (нове): `win__aside`/`win__page--side` для правої панелі в `settings` (j11); `win__link` у стані `item` для «Show more fields» (j11); `win__chip--active` у `form` (j11); контейнер діалогу з бічною колонкою + група пунктів колонки + бейдж на плитці, `win__tile` на два рядки (j12); `win__limit` для значення ліміту колонки, дві `win__page` в одному вікні, `win__col` без карток (j13); **`win__chain` вперше вжитий** — бракує рядка кнопок під ланцюжком і згорнутого кроку, `win__step-kind` несе `When`/`If`/`Then` (j14). Контракт §4.1 досі зве ①②③ «мітками» — дописати «цифри» одним рядком (j11). Норма «2–4 граблі» не узгоджена з широтою карток: блок 3 у j07 і j11 — третина уроку, це системне (j11).

### Автор j11 «Поля, екрани, типи роботи»
- **⚠ не в уроці:** тип поля `URL` у team-managed **не існує** (лише company-managed, `available-custom-fields-for-team-managed-projects`); `Select` з картки — у доксах `Dropdown` і `Checkbox`; **`Required` стоїть на сторінці типу роботи**, а не «в конфігурації поля» (нотатка «Для курсу» у `screens/11` хибна, докси кажуть двічі); «Summary спейсу показує Epic progress» — джерела немає, замінено; `+ Add work type` у бізнес-спейсі — сторінка лише про software (**дознімати**); кириличні назви полів у JQL (`"Посада" = "Бариста"`) живцем не виконувались — в уроці сказано прямо + запасний шлях `cf[ID]`.
- **→ j13, j06:** у software-спейсах типи за замовчуванням — `Task` (Kanban) або `Story` (Scrum). **→ j06, j07:** поле в кількох типах одного спейсу має спільні назву й опис, `Dropdown`/`Checkbox` ділять варіанти, значення за замовчуванням у кожного типу своє.
- **→ j07, довідник «JQL…»:** розділ «Custom field»: `Syntax: CustomFieldName`, `Alias: cf[CustomFieldID]`, пошук за значенням і за ID варіанта; текстовий пошук лише для Text; `~`, `WAS`/`CHANGED` для числових і дат **не** підтримуються.
- **→ j20:** дослівно **«You can't restrict work items on the Free plan»** (`set-up-issue-types-in-team-managed-projects`). **→ j20, j21:** `configure-the-issue-type-hierarchy` — рівні 1/0/−1, перейменування рівня діє на всі company-managed спейси сайту, власні рівні — Premium/Enterprise.
- **→ j05:** «Change a work type» — значок типу біля ключа → інший тип, при різних полях/процесі відкривається екран перенесення; порядок полів у Quick Create задає розкладка типу роботи — j05 і j11 описують одну настройку з двох боків, перехреститись посиланнями. **→ j16, j19:** для службових спейсів **окрема** сторінка типів полів (`jira-service-management-cloud/docs/available-custom-fields-for-team-managed-service-projects/`).
- Розбіжності: `Hide when empty` (екран) проти «Hide fields below dotted line» (докси); `Create a field`/`Add field` (екран) проти «Create field»/«Add fields» (докси); `use-business-projects-for-project-management` перелічує `Resolution`/`Original Estimate` серед полів шаблону — суперечить j10, перелік не цитований.

### Автор j12 «Практикум: шаблони під сферу»
- **⚠ не в уроці:** «sample data» у ділових шаблонах — джерела немає взагалі (приклади з даними документовані лише для JSM і JPD; у custom templates «Work items from the source space» не переносяться); **`Group by Epic` для ділових дошок не існує** — закритий перелік `Priority · Category · Assignee · Agent`; поле ключа в майстрі — докси лише «ключ генерується» (**дознімати** екран після `Use template`); який набір типів принесе конкретний діловий шаблон — не стверджується.
- **→ j13:** `Kanban` і `Scrum` — окремі плитки «Made for you», `Cross-team planning` — `Premium` (`screens/23`); «If you have the Sprints feature enabled, your board won't show any work items until you start a sprint» — готова грабля. **→ j11:** «You can add up to 30 work types» (число → довідник).
- **→ j06, j21, довідник «JQL…»:** у **ділових** спейсах є **другий вид фільтра** — фільтр вигляду (`Filter → Save filter`): «Your saved filters are specific to the space you create them in», «you can only apply one at a time», редагується лише назва. Це не збережений JQL-фільтр j07.
- **→ j04, j11, довідник:** ділові спейси мають вбудоване поле **`Category`** з власними значеннями (`More actions → Edit field` у колонці списку), «Only one category can be added to a work item» — плутається з категорією статусу; у j12 окрема плашка. **→ j21:** `Import data ↗` живе всередині діалогу шаблонів.
- Розбіжності: `Create space` у бічній панелі (`create-a-new-project`, екран) проти «in the top navigation bar» (`create-a-business-project`); фінансова сторінка радить components, а вони лише company-managed; категорії статусу `To do / In progress` (докси ділових дошок) проти `To Do / In Progress` (екран); ключ не «задається один раз», а генерується й міняється в `Details`.

### Автор j13 «Scrum і Kanban — і коли вони не потрібні»
- **Сюжет:** для «Зроби сам» (чотири роботи в `In Progress`) додано **`WEB-4` «Підключити оплату карткою»** і **`WEB-5` «Сторінка доставки: оновити текст»** — дописано в `program.md` §3. **→ j22:** стан `WEB` після j13 — team-managed software, ліміт на `In Progress`, `WEB-1…WEB-5`, спринти **вимкнені**, беклогу в рядку виглядів немає.
- **⚠ не закрито:** як Jira друкує число ліміту на дошці team-managed (докси лише «changes color»); чи є `Set column limit` на дошці **ділового** спейсу (у довідці про ділові дошки немає — **дознімати** в `MARK`); чи є `Sprints`/`Estimation` у `Features` бізнес-спейсу; перший шлях до ліміту веде в розділ **`Board`** налаштувань, якого в `screens/10` немає — **дознімати**.
- **→ j06:** `work-with-boards-in-business-projects` — найповніша сторінка про ділову дошку: `Ranking`, «Infinite board capacity», `Save board defaults`, «Space admins can reorder columns… apply to every user», збереження адміном скидає особисті налаштування колонок. Три шляхи до колонок: два team-managed + `••• → Configure columns` на діловій дошці.
- **→ j08, довідник:** `Agents dashboard` у `Reports` — апсел («available with any paid Jira plan. Rovo must be enabled»). **→ j11:** `Estimation` додає поля `Story point estimate`/`Original estimate` автоматично; `Original estimate` працює лише з `Time tracking`. **→ j07, довідник «JQL…»:** поле `Sprint`, `openSprints()`; приклад `space="NAME" and originalEstimate > 1m` з `enable-estimation` — **єдиний живий приклад, де докси вже пишуть `space`**.
- Розбіжності: два шляхи до ліміту (`Space settings → Board → Columns and statuses → Edit column` проти `колонка → More actions → Set column limit`); кольори заголовка колонки описані лише на company-managed-сторінці (три цитати підписані); `what-is-a-sprint` «Sprints do not apply to Kanban spaces» проти `enable-sprints` (перемикач у будь-якому team-managed software) — категоричне не цитовано; звітів для team-managed **чотири** (+burnup), не три.

### Автор j14 «Автоматизація: перші flows»
- **⚠ не закрито:** `Add step` у розділі «from scratch» не названий (є лише в Rovo/Studio); `Add component` з картки в живих доксах немає; колонки `Trigger` у списку flows у доксах немає (підтверджені `Name · Owner · Enabled`); мінімальний інтервал `Scheduled` — числа немає; `Create with Rovo` на Free — ніхто не клікав; текст «Condition didn't pass» у журналі — немає. **Дознімати:** меню `Create flow`; конструктор із трьома кроками (`Add step` / `Turn on flow` / `Next`); вкладка `Templates`; **`Audit log` з хоча б одним запуском** (закриє два вікна j14 і вікно j15).
- **→ j15, довідник «Автоматизація…»:** слаги `smart-values-in-jira-automation`, `jira-smart-values-issues`, `…-date-and-time`, `…-lists`, `jira-automation-branches`, `what-is-rule-branching`, `how-is-my-usage-calculated`, `debug-an-automation-rule` (`{{#debug}}`, `Log action`). **`Send email` — Deprecated**, жива дія `Send customized email`. Рахуються кроки зі статусами `SUCCESS`, `NO_ACTIONS_PERFORMED`, `SOME_ERRORS`, `ABORTED`, `NO_MATCH`; `THROTTLED` і системні — ні; «Advanced steps are only available for Cloud Premium and Enterprise plans». Підписи Audit log — `Successful` / `No action` / `Some errors` (+ `Loop`, `Throttled`), не «Success / No actions performed / Error» з картки.
- **→ j19:** системні flows є лише в шаблонах JSM (`IT service management`, `Customer service management`, `IT service management (Essentials)`), додаються через `Space settings → Automation → More actions (…) → Add system flows`, змінити не можна — лише скопіювати (копія рахується).
- **→ j11, j13:** чотири обмеження автоматизації в team-managed: **People**-поля не підтримуються, `Flagged` не виставляється, smart values батька не працюють у тригері створення, робота не переїжджає з беклогу на дошку без активного спринту.
- **→ j20:** право створювати flows забирається глобально (`Settings → System → Global automation → … → Global configuration`, `Allow space administrators to manage space flows`); заборона повторюваних робіт не-адмінам; сторінка `Transfer Jira automation flows from one user to another` (листи про помилки йдуть власникові flow). **→ j05, j21:** `Set to recur` на роботі створює flow `Clone on a schedule` з міткою `Recurring`; копія не бере вкладення, веб-посилання й звʼязки. **→ j07:** у flow запит виконується з правами **flow actor**, `Validate query` — твоїми.
- Розбіжності: `Issue fields condition` проти `Work item fields condition (Jira only)` на двох живих сторінках; картка «на JSM Free глобальна автоматизація лише в межах спейсу» — таблиця планів дає `Global and multi-space automation` зі значенням на JSM Free (не взято); картка й траєкторія вимагають у j14 третій flow `Scheduled` із JQL, а «Межі між сусідами» віддають розклад j15 — розвʼязано на користь картки (один простий запит, без `{{…}}`); `REM-6` у §3 віддана j15 з тим самим сценарієм — j14 використав `REM-2` → `REM-3`; два числа лишені свідомо цитатою («past 90 days», «10 consecutive executions») — поведінка продукту, не ліміт плану.

## Від рецензентів хвилі 3 — j11–j14 (2026-09-18, день; 4× «готово з зауваженнями», 49 правок; повні звіти — `reports/jNN-review.md`)

### Наскрізне
- **Дані сюжету розходяться між уроками** (j12): дедлайни `REM-4` — `Sep 22` (j04) проти `Oct 10, 2026` (j12); `REM-6` — `Oct 10` (j04) проти `Oct 24, 2026` (j12); `REM-5` — `Sep 30` (j04) проти `Sep 15, 2026` (j08); виконавець `MARK-6` «Флаєри для другої точки» — **МЛ** у j01/j05/j06, **СБ** у W2 j12. Формат дати — `Sep 30` проти `Sep 24, 2026` (з j01, уже питання до дизайну). **Потрібне одне наскрізне рішення:** зафіксувати дати й виконавців у `program.md` §3 і звірити всі вікна — не правка одного файла.
- **«Стан» проти «статус»:** j10 має 103 «статус», j12 — 62 «стан»; місток одним рядком у j12 поставлено, вирівнювання курсу — рішення власника/кореневої (j12).
- **Дзеркальний маркер стилю у квізах:** «правильна = єдиний варіант **без** розділового знака» — у j11 4 питання з 6. Перевіряти обидва напрямки; `check-quiz.py` не бачить (j11). У j13 — усі дистрактори однієї форми «X, а Y» проти правильної «X, тому Y».
- **Парні форми звертання** («бачив(ла)», «зробив(ла)») — j04/j05/j06/j12 і лендінг пишуть парними; j11 і j14 були в чоловічому роді (виправлено). Записано в памʼять рецензента (j11, j14).
- **Спільний скретчпад рецензентів:** паралельні агенти ділять одну папку — сусід перезаписав `*.txt` між прогонами, і звірка цитат видала шість хибних «MISS». Робити звірку у власній підпапці (`scratchpad/jNNdocs/`) (j13).
- **Докси автоматизації суперечать самі собі у трьох парах** (j14): `Issue fields condition` / `Work item fields condition (Jira only)`; поділ `Flow details` vs `Flow settings` проти шести полів під однією кнопкою; три написання результатів запуску (`Successful`/`No action`/`Some errors` — performance insights; `SUCCESS`/`NO_ACTIONS_PERFORMED`/`SOME_ERRORS` — облік; картка — «Success / No actions performed / Error»). Довідник має називати сторінку біля кожної назви. **Пастка методу:** у `jql-fields` фраза `Be sure to use quote-marks (")` після зняття тегів виглядає як `( " )` — не «виправляти» цитату за очищеним текстом.
- **Поле `Team`** зʼявляється у вікнах j10 і j11 і **ніде в курсі не пояснене** — потрібен «дім» (j04 або довідник) (j11).
- **Ключ спейсу генерує Jira** («Jira will generate a space key when you create the space»); будь-який «Зроби сам», що диктує ключ, має вести в `Space settings → Details` (j13 виправлено; j12 крок 2 уже так). Три входи до налаштувань колонок team-managed software: `Space settings → Board → Columns and statuses → Edit column`; кнопка **`Configure board`** біля найправішої колонки; `колонка → More actions → Set column limit` (j13).
- **Обіцянки уроків довідникам** (закрити при написанні): j10 — повний перелік правил переходу workflow (7 проти 5); j14 — рецепт «заповнити `Resolution` у team-managed через flow»; j13 → j07/довідник «JQL…» — поле `Sprint` і `openSprints()` не мають дому в курсі (у j07 0 згадок про спринти) — **рішення власника:** абзац у j07 чи лише довідник.
- **Дизайну (нове):** `win__placeholder` у W1 j14 несе рядок фільтрів списку — потрібен окремий клас; `win__actions` поза `win__dialog`; порядок цифр у DOM ③→①→② (W1 j12, W2 j05) — рішення про нумерацію за читанням. **Білд, рядок 13a:** дві `.ds-tbl` у j14 мають у першій колонці довгі `<code>` (`Manual trigger from work item`) під `nowrap` — заміряти на 390 px.

### Рецензент j11
- Виправлено з джерелом: епік живить «roadmaps and reports», підзадача — «swimlanes on the board, and progress tracking» (`set-up-issue-types-in-team-managed-projects`) — урок і `explain` П2 приписували доріжки епіку; **→ j13, j06:** звірити, кому приписані доріжки. Місток team-managed/company-managed до j09; «плитка» → «чіп» (j05 уводить чіпи; «плитка» зайнята порталом і галереєю); `Quick Create` = компактна форма.
- Без джерела (не правлено): «поле дати розуміє «наступного тижня», поле числа вміє підсумовувати» (Ф-1); «`Edit fields` веде на ту саму сторінку» (Ф-2); «прав на рівні полів немає взагалі» (Ф-3, доведене лише «You can't restrict work items on the Free plan»); **`+ Add work type` у діловому спейсі — без виноски в тексті уроку** (Ф-4; тягне j12, j13, j21 — закриває одна дія в sandbox); W1 «у спейсі Найм · звірено» при знімку з `KAN`, W3 `Show more fields` проти доксового «Show X more fields» (розкриті підписами).
- Пропущено з картки: `Story`/`Bug` як software-типи (один раз у цитаті / нуль). **→ j12, j21, довідник:** `Add field → Create new field` (`create-a-formula-field`); **→ j12, j13:** у software team-managed `paragraph` лише в `Description`, `short text` — лише в `Context`; **→ довідник:** `Formula`-поля мають сторінку, `Generate formula`/`Fix formula` — Rovo, апсел. «Work types: Task and subtask» — у доксах два осередки таблиці, двокрапка авторська.

### Рецензент j12
- Виправлено з джерелом: порядок категорій W1 за `screens/23` (Software development · Service management · Work management · Marketing · Human resources · Finance); «Select the plus icon + in the space sidebar» (`create-a-business-project`) — **→ j09** дослівна цитата третього входу; `Create with Rovo` — «Under Space templates, select Create with Rovo»; крок `+ Add work type` для батьківських робіт («Work types — Task and subtask») — **→ j13, j21** готове формулювання; вимоги до ключа — три дослівні фрагменти (маркований список, не крапки з комою); «кілька великих літер» замість «дві-три» (`MARK-8`); час читання 25 хв (5 126 слів, другий за обсягом).
- Без джерела (лишено): «новий спейс приходить порожнім» — цитата зі сторінки про **власні шаблони Enterprise**, не про галерею; закриває клік у sandbox.
- Пропущено з картки (лише автор): `Scrum` і `bug tracking` як шаблони не згадані (лише категорія `Software development`); «перейменувати статуси англійською» з теми «чистка шаблону» не прозвучало; `Sales pipeline` («продажі») — немає. Правильна відповідь П4 («відкрити кожну з десяти карток заново») ігнорує масову зміну з j07 — рішення не рецензента.
- Дознімати: ліва колонка діалогу `Space templates` з підзаголовками `CATEGORIES`/`PRODUCTS`; діалог `Create status` на діловій дошці.

### Рецензент j13
- Виправлено з джерелом: ключ `WEB` ставиться через `Space settings → Details` (як j12), тип «обери», не «залиш»; застереження про **третій** вхід `Configure board`; посилання «пошук за спринтом (урок 7)» прибране; рядок виглядів W1 з `Docs` і `Development` (`screens/03`); «у ділових спейсах немає» → «досі не було» (джерела, що ділові не вміють `Backlog`, немає); `Ask AI` — з уроку 3, `See plans` — з уроку 2 (у j02 `Ask AI` немає). 43 цитати простежені; у `work-with-boards-in-business-projects` і `add-rename-or-delete-a-column-…-business-projects` слів `column limit` **немає жодного**.
- На логіці, не на доксах (лишено): стан перемикача `Sprints` «вимкнено»; «velocity як оцінка людей ламає показник» — авторський висновок; походження методів — джерело є (рядок **Origin** у `kanban-vs-scrum`). Питання 6 квіза узагальнює «спейс, яким керує команда» на всі team-managed, а `Features` зі `Sprints` документована для software — `q` не редаговано, рішення автора/власника.
- **→ j06:** вигляд `Backlog` має **три** списки — `Backlog`, `Sprint`, `Board` (`enable-the-backlog`), у W2 j13 показано два; W1 і W2 того самого спейсу показують різні рядки вкладок — після знімка вирівняти. Дознімати: стан `Sprints`/`Estimation` у новому спейсі з Kanban; число ліміту над колонкою; розділ `Board` у `Space settings`; `Set column limit` у меню колонки ділового спейсу; порядок секцій `Backlog` і `Start sprint`.

### Рецензент j14
- Виправлено: абзац, що розводить **`workflow` (урок 10)** і **`flow`** — урок їх ніде не розрізняв; «умова — фільтр» → «перевірка» («фільтр» зайняте з j07); «докси» → «довідка» (єдине вживання в курсі); шість цитат отримали переказ (`Scope can only be set at the Global level…`, три результати запуску, `Cron expression`, Rovo-кредити). 43 цитати посимвольно = 0 розбіжностей; `Flow details` — шість полів під однією кнопкою підтверджено дослівно (`create-and-edit-jira-automation-rules`), сусідня сторінка ділить інакше.
- Без джерела (лишено): нутрощі шаблону `When all sub-tasks are done → move parent to done` (Ф-1); підписи `Status` журналу зі сторінки performance insights (Ф-2 — **правити разом із j15**, якщо sandbox дасть інше); `Add step` у сценарії «з нуля» не названий, але є в розділі про шаблон (ризик менший); видимість `Create with Rovo` на Free; «тригер завжди рівно один»; шаблон бачений у **глобальній** вкладці `Templates`, а «Зроби сам» веде до `Use a template` у спейсі; два числа цитатою («past 90 days», «10 consecutive executions») — **рішення власника**. Назва flow у W1 ≠ назва з «Зроби сам» — дрібниця.
- **→ j15 (сюжет):** блок 8 j14 наводить «Меблі: доставка й монтаж — дедлайн 3 жовтня» = `REM-6`, яку за §3 створює j15 — приклад тексту, не крок. Дознімати: `Audit log` з хоча б одним запуском (найцінніше — закриває j14 і j15); меню `Create flow`; конструктор «з нуля»; вкладка `Templates` у спейсі + нутрощі шаблону; список flows із кількома рядками; клік `Global administration`.

## Закриття хвостів до j14 кореневою сесією (2026-09-18, ~15:00; `program.md` «Уточнення» п. 14)
- Дати сюжету: канон — `REM-4` Sep 22 · `REM-5` Sep 30 · `REM-6` Oct 10, 2026 (записано в §3); виправлено j08 (REM-5), j12 (REM-4, REM-6, `MARK-6` → МЛ), j14 (10 жовтня). Нові правила авторингу 2а («вікна показують фірму цілком»), 2б (дані сюжету — лише з §3), 2в (числа поведінки продукту з цитатою — дозволені).
- **Summary:** плитки «за сім днів» і `Status overview` `Done` «за два тижні» — **обидва** в `what-is-the-summary-view` («completed, updated, and created in the last seven days» · «Only items that have been completed in the last two weeks will appear in Done»); j06 і j08 праві, суперечності немає.
- `Sprint`/`openSprints()` — дім: довідник «JQL: поля, оператори, функції» (у j07 не додаємо). Блок 3 j07/j11 — лишається. Поле `Team` — дім у j11 (KB `team-field-is-not-visible-in-the-subtask-issue-view-screen`, Cloud Only). «Виконавець один» — опора в j04: тип поля `USER` (`jql-fields`).
- Лишається лише після sandbox: `+ Add work type`/`Epic` у діловому спейсі (виноска в j11 є); підписи `Status` журналу (j14/j15); «service management» у `Type` (j03/j09); `Export` у W1 j07; старе посилання після `Move` (j05).

## Від авторів хвилі 4 — j15–j18 (2026-09-18, ніч; повні §8 — у `reports/jNN.md`)

### Наскрізне
- **Картки фаз 4–5 відстали від продукту сильніше, ніж картки фаз 1–3** — картка задає теми, а не факти: гілки «за JQL» і слова `For each` у продукті немає, `Send email` — Deprecated (j15); «JSM Free без кастомних звітів, multi-channel обмежений, автоматизація лише в спейсі» суперечить таблиці планів, грабля «SLA рахує календарний час без календаря» без джерела (j18); «календар через due date і експорт» не підтвердився (j16); W2 «список встановлених із `Uninstall`» — кнопка живе всередині `View app details` (j17). Усі заміни пояснені у звітах §6 — **рецензентам: це рішення, не дефект** (зведено в `program.md` «Уточнення» п. 15).
- **Метод добування доксів, який дав 0 розбіжностей у 234 цитатах хвилі:** хаб `…/<product>/resources/` віддає індекс живих слагів (136 для `cloud-automation`, **1 188** для `jira-service-management-cloud`); сторінка — `curl -sL` → `<main>` без `<nav>` → зняти теги; таблиці — розбір `<tr>/<td>`. **Нові пастки звірки цитат:** порівняння має бути **регістрочутливим** (у j15 15 із 52 цитат починались з малої, бо стояли всередині українського речення — прогін з `lower()` показав би «все добре»); тег розриває слово (`cloud app|s are` → хибний MISS, j18); `&#x27;` не декодується сама, зняття тегів дає `in- app` і `Jira , if` (j16); `developer.atlassian.com/platform/marketplace/…` **мовчки редіректить** — перевіряти `%{url_effective}` (j17).
- **Закрито хвіст j02 про базу знань JSM** (незалежно j16 і j18): фрази «No purchase of Confluence is required» в доксах немає, є краща — «at a minimum, you'll need to have a Free plan of Confluence on the same site» (`jira-service-management-cloud/docs/add-confluence-to-set-up-knowledge-base/`); там само «You need to be a site admin or an organization admin…» і шлях app switcher → Administration → Apps → Discover new apps. Слів «купувати не треба» в курсі не вживати.
- **Перейменування в польоті, нові:** `Pages → Docs` («We're currently updating the Pages experience and renaming it to “Docs”», адреса лишається `/pages`) (j16); сторінка сповіщень має **три** написи — `Notification settings` (докси), `Emails and notifications` (екран), `Spaces and work items` / «Space and work item notifications» (довідки Slack і Teams) (j16); `Cloud Fortified` → `Atlassian Enterprise Certified`: заявки закриті з 2026-09-01, «The CFA program will be retired on 31st December, 2026», бейдж на екрані ще є (j17). Усе — у розділ «Що змінилось» довідника «Карта інтерфейсу, глосарій і ліміти Free».
- **⚠ Суперечність між сусідами, звести рецензентам j16 і j17:** j17 (ЧаПи) каже, що звʼязок Jira зі Slack і Teams «робиться саме застосунками з Marketplace»; докси j16 ведуть ставити `Jira Cloud for Slack` зі **Slack App Directory**, `Jira Cloud for Microsoft Teams` — з **Teams app store**, а з боку Jira інтеграцію вмикає адміністратор сайту (`use-jira-cloud-for-slack`, `integrate-jira-cloud-and-microsoft-teams`). Формулювання, яке не суперечить жодному джерелу: обидва застосунки — від Atlassian, ставляться з магазину чату, пʼять питань j17 до них застосовні так само.
- **Сюжет §3, що змінилось у хвилі** (записано в `program.md` §3): `REM-6` — не «усі підзадачі Done → батько Done» (цей flow j14 зібрав на `REM-2`/`REM-3`), а піддослідна flow з гілкою на батька: створюється в «Зроби сам» j15, дедлайн Oct 10, 2026 (j15); автор заявок `FIN-1` і `FIN-2` — **Соломія Бойко (СБ)**, деталі форми `FIN-2` — «4 000 грн · млин «Золотий колос» · до Sep 25, 2026» (j18; назва постачальника вигадана автором — рішення власника, лишати чи ні); статуси `FIN` у §3 (`In Progress`, `Resolved`) у доксах службових спейсів не знайдені — до знімка JSM у вікнах лише документовані назви (j18 → j19).
- **Числа, що зібрались для довідників (в уроках їх немає):** автоматизація — 65 кроків на flow, 50 підзадач на дію, 999 робіт у пошуку за розкладом, 150 елементів на гілку, `Loop detection` 10, одночасних flows на Free 5, `Lookup work items` — перші 100, модель кроків по планах, $0.50 за 1 000 кроків, дата 2026-12-03 (j15) · сповіщення — ліміт листів на добу (на двох сторінках, з приміткою «до 30 днів після апгрейду»), «customize notifications for up to 50 spaces», місця й сховище Confluence Free (j16) · Marketplace — 30 днів (дані після зняття), місяць (тріал), 30 днів (частота зміни цін), 60 днів (доступ вендора до логів), десять значень `Trust signals`, сім вкладок сторінки застосунку, лозенджі `UPDATE`/`PAID UPDATE`/`BLOCKED`/`DEV`/`STG`, поіменні списки несумісних (12) і обмежених (2) на Free застосунків на 2026-09-18 (j17) · JSM — до 300 черг на спейс на категорію роботи, лічильник `999+`, до 100 статусів на всі workflow спейсу і 50 в одному, календар SLA `09:00–17:00` за замовчуванням, JSM Free `1,250 steps per subscription` і `100 executions per month`, таблиця мов на вісім колонок продуктів (j18).
- **Числа, лишені в уроках свідомо за правилом 2в** (поведінка продукту з дослівною цитатою, не ліміт плану): «only the first 100 work items will be used» (j15, граблі); 30 днів / місяць / 30 днів (j17). Рецензентам — перевірити цитату, не знімати.
- **Дизайну (нове, `win__topbar` — 0 вживань у 18 уроках):** четверте значення `data-kind="branch"` у `win__chain` (j15); **третій стан заголовка вікна** «знімок + докси» — заявка вже від j14, j15, j17; контейнер «підзаголовок + вміст» у `win__page` (`div.win__sub` проти другого `<h4>`) (j15); бічний список усередині спейсу (`win__subrail` — просив іще j10; j18 узяв `win__rail` із застереженням); рядок кнопок відповіді в стані `item` (`win__actions` — третя заявка: j13, j14, j18); клас для описового рядка під `h4` (`win__placeholder` беруть не за призначенням уже три уроки) і для переліку документів (j16); **`win__badge`** для лозенджів `UPDATE` / `CLOUD FORTIFIED` / `BESTSELLER`, 2–3 рядки в `win__tile`, стан/рейка «адмінський екран» (Atlassian Administration) (j17); «матриця без позначок» для сповіщень — §4.2 з `✓` нездійсненна без вигадування (j16); матриця вікон програми для j16: `settings` ×1 + `list` ×2, не `settings` ×2. **Білд, рядок 13a (390 px):** `win__table` на 7 колонок (`High usage flows`, j15) і на 5 колонок (черги, j18) — без скролера; **перший багаторядковий `term` у курсі** (тіло листа, 3 рядки, j15) — «Копіювати» склеює через `\n` (`js/ui.js:429`). Норма «2–4 граблі» знову не сходиться з широтою карток (j15 — пʼять, j18 — блок 3 найбільший).

### Автор j15 «Автоматизація глибше»
- **⚠ не закрито (усе — sandbox):** підписи `Status` у журналі тримаються як у j14 (`Successful` / `No action` / `Some errors`) — **правити j14 і j15 разом**; підзаголовок `Log message` у розгорнутому рядку журналу; підпис кроку-гілки (`Related work items: Parent` зібраний із назви сторінки й переліку); `Add step` у сценарії «з нуля»; мінімальний інтервал `Scheduled`; рядок поясу `Europe/Kyiv` у `convertToTimeZone` (синтаксис документований, значення — ні). **Дознімати (за цінністю):** `Audit log` із запуском і розгорнутим рядком → конструктор flow із гілкою → вкладка `Usage` у спейсі → панель `{}` розумних значень → налаштування `Scheduled`.
- **Не пішло з картки, бо немає дослівно в доксах:** `format("dd.MM.yyyy")` і `{{now.plusDays(3).format("yyyy-MM-dd")}}` → стоять документовані `format("dd/MM/yyyy")`, `jiraDate`, `{{now.plusDays(7)}}`; `{{duedate}}` усередині `{{#lookupIssues}}` — такої властивості в переліку немає. Розбіжність доксів: `{{issue.duedate}}` (сторінка властивостей; за неї грає `Field ID` у `screens/10`) проти `{{issue.dueDate.format(…)}}` (сторінка прикладів) — в уроці обидві. Облік: `how-is-my-usage-calculated` рахує крок навіть при `NO_ACTIONS_PERFORMED`/`NO_MATCH`, а `best-practices-…` досі пише «Only flows that perform a successful action will count» — узята сторінка обліку.
- **→ j16:** `Send customized email` — вкладки `Settings` / `Content` / `Attachments`; у `From` — префікс службової адреси або власна адреса з `admin.atlassian.com`; вкладення — лише після збереження flow; **зміна формату вмісту (`Plain text` / `Rich text` / `HTML`) стирає текст**. **→ j19:** `Lookup objects` і гілка `AQL` — лише JSM (Assets); у листі є адресат `All customers involved`. **→ j20, j21:** `Re-fetch work item data` — бо «By default, the `{{issue}}` reference is not updated during flow execution».
- **→ j07 і довідник «JQL…»:** `endOfWeek()` — «By default, this function considers Saturday to be the last day of the week», `endOfWeek("+1d")` зсуває на неділю; у j07 цієї функції немає. **→ довідник «Автоматизація…» (обіцянки уроку):** повний перелік smart values (урок називає вісім); рецепт `Resolution` через flow (борг ще з j14); `Issue Moved` + `{{changelog.key.fromString}}`; `Create variable` («will always return a string»); функції списків (`join`, `size`, `sum`, `first`/`last`, `distinct`, `get`) і дат (`diff().days`, `plusBusinessDays`, `startOfMonth`, `withLocale`, `toDate`).

### Автор j16 «Пошта, чати, Confluence — оглядово»
- **⚠ не закрито:** підписка Google Calendar на календар спейсу — у доксах є лише для календаря змін JSM (в уроці — чесна відсутність); чи працює «створити роботу з повідомлення» на Free (докси ставлять поруч із Rovo); **чи є `Docs` у меню `+` ділового спейсу** — на цьому стоїть крок 7 «Зроби сам» (один клік у sandbox); підписи рейки особистих налаштувань і стан галочок; W3 (Docs після підключення) — «за документацією». Власна адреса відправника — «This page applies to company-managed spaces only», у текст не пішло. **Дознімати:** сторінка сповіщень зі станом галочок → меню `+` у діловому спейсі → підключений Confluence (вкладка `Docs` + сторінка з макросом `/jira`) → меню календаря спейсу → живий лист від Jira.
- **→ j05:** розділ «Filter emails in your inbox» (`manage-your-jira-personal-settings`): поле `From` змінне, «The sender's email will always be `jira@<yourinstance>.atlassian.net`» — закриває знахідку j05 живою цитатою. **→ j05, j07:** три родини листів, якими галочки **не** керують (про сайт, підписка на фільтр, акаунт Atlassian); лист підписки вимикається в самій підписці.
- **→ j17:** `Jira Cloud for Slack` — зі Slack App Directory, `Jira Cloud for Microsoft Teams` — з Teams app store; з боку Jira вмикає адміністратор сайту, інакше «Connecting with this Jira Cloud instance was disabled by administrator». **→ j18, j19:** сторінка бази знань (див. «Наскрізне»); адміністраторів сайту Confluence автоматично робить платними користувачами — прибирати з доступу (число — довідник). **→ j20:** прийом пошти керується глобальним правом `Administer Jira` — ще один випадок «адміністратор сайту ≠ адміністратор спейсу».
- Уточнення до знахідки j08: слаг «Share Jira dashboards in Confluence» живе під `jira-software-cloud`, під `confluence-cloud/…` → 404. Назва макроса підтверджена: «Display Jira work items in a list» (`confluence-cloud/docs/insert-the-jira-issues-macro/`).

### Автор j17 «Marketplace обережно»
- **Закрито рядок «Не вдалось перевірити» у `facts-free-plan.md`:** фільтр **`Free up to 10 users`** існує (`freeStarterTier`), поруч `Free for all teams`; єдине джерело про «$0 для 1–10» — допис на community.developer.atlassian.com від **2021-12-07**. ⚠ Значення `Pricing` узяті з `marketplace.atlassian.com`, усередині Jira фільтр ніхто не розкривав; `Use cases` на сайті Marketplace немає взагалі.
- **⚠ не в уроці / без джерела:** як присуджуються `SPOTLIGHT` / `BESTSELLER` — опису немає ніде (в уроці: вітрина, рішення на них не спирати); «видалив застосунок — зникли його поля» — єдина стаття має банер **Data Center Only**, в уроці лише доведене («the app data is retained for a limited period (30 days) before being permanently deleted»); чи бачить не-адмін сторінку `Marketplace apps` — не стверджується; ціни не названі взагалі. **Дознімати:** екран згоди на доступ при `Get it now` (дійти й не підтверджувати) → `Connected apps` з будь-яким встановленим застосунком (зніме «за документацією» з W2) → розкритий `Pricing` усередині Jira → `Use cases` → меню `Add apps` на картці.
- Розбіжності: `Manage apps` проти `Manage your apps` у сусідніх статтях (в уроці обидві); три описи, хто ставить застосунки (Jira admins / Organization+Site admin / «most apps… only by admins» + виняток OAuth 2.0 (3LO)) — в урок пішло найсуворіше, 3LO — у довідник.
- **→ j20:** готові цитати про адміністратора сайту, `Request this app`, `Block user apps` у `Settings` сторінки `Connected apps`, `data security policy` — **на Free цих важелів немає**. **→ j18, j19:** у фасеті `Works with` окремого рядка JSM немає — застосунки JSM живуть під `Jira`. **→ усім (метод):** публічний REST Marketplace працює без ключа й браузера (`/rest/2/addons?text=…`, `/rest/2/addons/<key>`) — дає вендора й **статус бейджа на дату**; сторінка пошуку читається `curl`-ом, фасети лежать у HTML як `MarketplaceFilterOption`.
- Цифри у W1 пронумеровані за порядком читання в DOM — ③ і ④ помінялись місцями відносно картки.

### Автор j18 «Jira Service Management»
- **⚠ не закрито (усе — після додавання JSM на sandbox):** напис у полі пошуку порталу (у вікні нейтральне `Search` + ⚠; **j01 обіцяв, що це звірить урок 18**); адреса пошти службового спейсу на Free (канал документований, `Multi-channel support ✓`, екрана немає — крок умовний); портал українською — лише таблиця мов; що стає з планом після додавання JSM (пробний платний → Free); скільки й яких черг приносить шаблон. **Дознімати:** портал очима клієнта → сторінка черг → картка заявки очима агента → `Channels` (адреса пошти) → `Space settings → Request management` (типи запитів, `SLAs` — для j19) → галерея `Create space` після додавання JSM → колонка `Type` у `Spaces` (закриє j03/j09).
- **Грабля картки без джерела замінена доведеною:** новий календар SLA створюється з `09:00–17:00` — кавʼярні з ранковою зміною годинник рахує не ті години. Назви шаблонів JSM не названі (конвенція) — замість них цитата «you might have a Finance, HR, Facilities, IT, Marketing, Analytics, or Legal service space»; бейдж платного плану на двох ІТ-шаблонах — зі `screens/23`.
- **→ j19:** шлях `Space settings → Request management → Request types` і там же `SLAs` (другий живий шлях — `Service space settings → Request types`; **тримати перший**); поля типу запиту — назва, portal description, portal instructions, іконка; **групи порталу робляться через `Raise a request` → аватар → `Portal groups` → `+ Add group`**, «you'll need more than one group for groups to appear in the portal»; тип `Email request` видалити не можна, типів має лишитись щонайменше два; SLA — `+New Metric`, імʼя після створення не змінюється, цілі `Work items (JQL) · Goal · Calendar`, формати `Due date centric` / `Time centric`; календар — значок у правому верхньому куті `SLAs` → `Add calendar`; **JQL черг — поле `"Request Type"`**; типові статуси служби за доксами — `Open · Reopened · Pending · Work in progress · Waiting for customer · Waiting for support · Escalated · Done · Canceled`.
- **→ j19, j20:** ролі team-managed службового спейсу — `Agent · Viewer · Admin` + рівні `Open` / `Private`; «You can't edit space permissions or roles on the Free plan…». **→ j20:** два входи для додавання продукту; «Only members of the Site-Admin Group can add Paid Add-ons or Applications»; клієнти — «no app licenses consumed», внутрішні клієнти — «access your help centers for free…». **→ j16:** база знань — `Space settings → Channels & self service → Knowledge base`. **→ j22 і довідники:** панель `Agents` / кнопка `Add agent` на картці — це **Rovo-агенти**, не колеги-агенти JSM; готова плутанина термінів.
- **Термін:** «службовий спейс (service space)» — як у j09; у j01 «службовий простір» — це словник j01 (там space ще зветься «робочий простір»), не розбіжність; «сервіс-спейс» у картках j18–j20 — мова картки, в уроках не вживати.
